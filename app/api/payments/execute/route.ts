import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { evaluatePolicy, PolicyContext } from "@/lib/policy/engine";
import { getPaymentProvider } from "@/lib/payments";
import { executeAnchorProof } from "@/lib/audit/anchorService";
import { recordAuditEvent } from "@/lib/audit/ledger";
import { getActiveNetwork } from "@/lib/networks";
import { usdcAtomic, parseUsdc } from "@/lib/money";
import { sha256 } from "@/lib/crypto";

const ExecutePaymentSchema = z.object({
  invoiceId: z.string(),
  hasOwnerConfirmation: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ExecutePaymentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request payload", details: parsed.error }, { status: 400 });
    }

    const { invoiceId, hasOwnerConfirmation } = parsed.data;

    // 1. Fetch Invoice with Vendor, Org, Settings
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        vendor: true,
        organization: { include: { settings: true } },
        payments: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const networkConfig = getActiveNetwork();
    const networkMode = networkConfig.mode;
    const org = invoice.organization;
    const settings = org.settings[0] || {
      killSwitchActive: false,
      priceToleranceBps: 100,
      requireApprovalAbove: 5000000000n,
      minReserveUsdc: 2000000000n,
      dailyLimitUsdc: 20000000000n,
    };

    // 2. Idempotency Check: (invoiceId, networkMode)
    const idempotencyKey = `PAY-${invoice.id}-${networkMode}`;
    const existingPayment = await prisma.payment.findUnique({
      where: { idempotencyKey },
    });

    if (existingPayment) {
      return NextResponse.json({
        message: "Idempotent response: Payment already executed for this invoice on this network.",
        payment: existingPayment,
      });
    }

    // 3. Strict Server-Side Policy Re-Evaluation at Execution Time
    const policyContext: PolicyContext = {
      network: networkMode,
      killSwitchActive: settings.killSwitchActive,
      availableTreasuryUsdc: usdcAtomic(100000000000n), // 100,000 USDC
      minReserveUsdc: usdcAtomic(settings.minReserveUsdc),
      dailySpentUsdc: usdcAtomic(0n),
      dailyLimitUsdc: usdcAtomic(settings.dailyLimitUsdc),
      approvalThresholdUsdc: usdcAtomic(settings.requireApprovalAbove),
      maxMainnetPaymentUsdc: parseUsdc(networkConfig.maxPaymentUsdc),
      hasOwnerConfirmation: !!hasOwnerConfirmation,

      vendor: {
        id: invoice.vendor.id,
        name: invoice.vendor.name,
        status: invoice.vendor.status,
        recordedWallet: invoice.vendor.walletAddress,
        perVendorLimitUsdc: usdcAtomic(invoice.vendor.perVendorLimitUsdc),
        walletCooldownUntil: invoice.vendor.walletCooldownUntil,
      },

      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        totalUsdc: usdcAtomic(invoice.totalUsdc),
        remittanceWallet: invoice.vendor.walletAddress,
        matchStatus: invoice.matchStatus,
        duplicateScore: invoice.duplicateScore,
        isInjectionSuspect: invoice.isInjectionSuspect,
        hasExistingPaymentForNetwork: false,
        isHumanApproved: true,
      },
    };

    const policyEval = evaluatePolicy(policyContext);

    // Persist Policy Evaluation in DB
    await prisma.policyEvaluation.create({
      data: {
        invoiceId: invoice.id,
        decision: policyEval.decision,
        decisionHash: policyEval.decisionHash,
        resultsJson: JSON.stringify(policyEval.results),
      },
    });

    // Abort if blocked by policy
    if (policyEval.decision === "block") {
      return NextResponse.json(
        {
          error: "Payment blocked by policy engine",
          decision: policyEval.decision,
          summary: policyEval.summary,
          results: policyEval.results,
        },
        { status: 403 }
      );
    }

    // 4. Create Initial Payment Record
    const provider = getPaymentProvider();
    const payment = await prisma.payment.create({
      data: {
        orgId: org.id,
        invoiceId: invoice.id,
        vendorId: invoice.vendor.id,
        network: networkMode,
        provider: provider.name,
        idempotencyKey,
        amountAtomic: invoice.totalUsdc,
        destination: invoice.vendor.walletAddress,
        status: "initiated",
      },
    });

    // Record Audit Event: payment_submitted
    await recordAuditEvent({
      orgId: org.id,
      eventType: "payment_submitted",
      referenceId: payment.id,
      eventData: {
        paymentId: payment.id,
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        vendorName: invoice.vendor.name,
        destination: invoice.vendor.walletAddress,
        amountAtomic: invoice.totalUsdc.toString(),
        network: networkMode,
        provider: provider.name,
        decisionHash: policyEval.decisionHash,
      },
    });

    // 5. Execute On-Chain Settlement via Payment Provider
    const transferResult = await provider.transferUsdc({
      to: invoice.vendor.walletAddress as `0x${string}`,
      amountAtomic: usdcAtomic(invoice.totalUsdc),
      idempotencyKey,
      refId: invoice.id,
    });

    if (transferResult.status === "failed") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "failed" },
      });
      return NextResponse.json(
        { error: "Blockchain settlement failed", details: transferResult.error },
        { status: 500 }
      );
    }

    // 6. Update Payment as Confirmed
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "confirmed",
        txHash: transferResult.txHash,
        receiptJson: JSON.stringify(transferResult.receipt),
        confirmedAt: new Date(),
      },
    });

    // Update Invoice status to paid
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: "paid" },
    });

    // Record Audit Event: payment_confirmed
    await recordAuditEvent({
      orgId: org.id,
      eventType: "payment_confirmed",
      referenceId: payment.id,
      eventData: {
        paymentId: payment.id,
        txHash: transferResult.txHash,
        network: networkMode,
        receipt: transferResult.receipt,
      },
    });

    // 7. Trigger On-Chain Anchor Proof on AuditAnchor.sol
    const anchorResult = await executeAnchorProof({
      paymentId: payment.id,
      invoiceId: invoice.id,
      orgId: org.id,
      invoiceHashHex: invoice.fileHash,
      decisionHashHex: policyEval.decisionHash,
      paymentTxHash: transferResult.txHash,
    });

    return NextResponse.json({
      success: true,
      payment: {
        id: updatedPayment.id,
        status: "anchored",
        txHash: transferResult.txHash,
        anchorTxHash: anchorResult.anchorTxHash,
        network: networkMode,
        explorerUrl: `${networkConfig.explorerUrl}/tx/${transferResult.txHash}`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
