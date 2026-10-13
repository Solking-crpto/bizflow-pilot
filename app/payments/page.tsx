import React from "react";
import { prisma, withDbTimeout } from "@/lib/db";
import { formatUsdc, usdcAtomic } from "@/lib/money";
import { evaluatePolicy, PolicyContext } from "@/lib/policy/engine";
import { getActiveNetwork } from "@/lib/networks";
import { PaymentDeskClient, PayableInvoiceItem } from "@/components/payments/PaymentDeskClient";
import { DEMO_INVOICES, DEMO_SETTINGS } from "@/lib/demoData";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const networkConfig = getActiveNetwork();
  let invoices: any[] = [];

  try {
    invoices = await withDbTimeout(
      () =>
        prisma.invoice.findMany({
          include: {
            vendor: true,
            payments: { orderBy: { initiatedAt: "desc" }, take: 1 },
            organization: { include: { settings: true } },
          },
          orderBy: { createdAt: "desc" },
        }),
      2500,
      []
    );
  } catch (err) {
    invoices = [];
  }

  if (invoices.length === 0) invoices = DEMO_INVOICES;

  const payableItems: PayableInvoiceItem[] = invoices.map((inv) => {
    const settings = inv.organization?.settings?.[0] || DEMO_SETTINGS;
    const latestPayment = inv.payments?.[0];

    // Evaluate policy on the fly
    const policyContext: PolicyContext = {
      network: networkConfig.mode,
      killSwitchActive: settings.killSwitchActive,
      availableTreasuryUsdc: usdcAtomic(100000000000n),
      minReserveUsdc: usdcAtomic(settings.minReserveUsdc),
      dailySpentUsdc: usdcAtomic(0n),
      dailyLimitUsdc: usdcAtomic(settings.dailyLimitUsdc),
      approvalThresholdUsdc: usdcAtomic(settings.requireApprovalAbove),
      maxMainnetPaymentUsdc: usdcAtomic(1000000n), // 1.00 USDC
      hasOwnerConfirmation: true,

      vendor: {
        id: inv.vendor?.id || "vendor-dangote-01",
        name: inv.vendor?.name || "Dangote Cement Distribution (demo)",
        status: inv.vendor?.status || "active",
        recordedWallet: inv.vendor?.walletAddress || "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        perVendorLimitUsdc: usdcAtomic(inv.vendor?.perVendorLimitUsdc || 15000000000n),
        walletCooldownUntil: inv.vendor?.walletCooldownUntil || null,
      },

      invoice: {
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        totalUsdc: usdcAtomic(inv.totalUsdc),
        remittanceWallet: inv.vendor?.walletAddress || "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        matchStatus: inv.matchStatus,
        duplicateScore: inv.duplicateScore,
        isInjectionSuspect: inv.isInjectionSuspect,
        hasExistingPaymentForNetwork: !!latestPayment,
        isHumanApproved: true,
      },
    };

    const evaluation = evaluatePolicy(policyContext);

    return {
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      vendorName: inv.vendor?.name || "Dangote Cement Distribution (demo)",
      vendorWallet: inv.vendor?.walletAddress || "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      amountFormatted: formatUsdc(usdcAtomic(inv.totalUsdc)),
      amountAtomic: inv.totalUsdc.toString(),
      status: inv.status,
      matchStatus: inv.matchStatus,
      duplicateScore: inv.duplicateScore,
      isInjectionSuspect: inv.isInjectionSuspect,
      policyDecision: evaluation.decision,
      policySummary: evaluation.summary,
      paymentRecord: latestPayment
        ? {
            id: latestPayment.id,
            txHash: latestPayment.txHash,
            anchorTxHash: latestPayment.anchorTxHash,
            status: latestPayment.status,
            confirmedAt: latestPayment.confirmedAt ? (latestPayment.confirmedAt instanceof Date ? latestPayment.confirmedAt.toISOString() : latestPayment.confirmedAt) : null,
          }
        : null,
    };
  });

  return (
    <PaymentDeskClient
      items={payableItems}
      networkMode={networkConfig.mode}
      explorerUrl={networkConfig.explorerUrl}
      maxMainnetPayment={networkConfig.maxPaymentUsdc}
    />
  );
}
