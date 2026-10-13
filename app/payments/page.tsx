import React from "react";
import { prisma } from "@/lib/db";
import { formatUsdc, usdcAtomic } from "@/lib/money";
import { evaluatePolicy, PolicyContext } from "@/lib/policy/engine";
import { getActiveNetwork } from "@/lib/networks";
import { PaymentDeskClient, PayableInvoiceItem } from "@/components/payments/PaymentDeskClient";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const networkConfig = getActiveNetwork();
  const invoices = await prisma.invoice.findMany({
    include: {
      vendor: true,
      payments: { orderBy: { initiatedAt: "desc" }, take: 1 },
      organization: { include: { settings: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const payableItems: PayableInvoiceItem[] = invoices.map((inv) => {
    const settings = inv.organization.settings[0] || {
      killSwitchActive: false,
      priceToleranceBps: 100,
      requireApprovalAbove: 5000000000n,
      minReserveUsdc: 2000000000n,
      dailyLimitUsdc: 20000000000n,
    };

    const latestPayment = inv.payments[0];

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
        id: inv.vendor.id,
        name: inv.vendor.name,
        status: inv.vendor.status,
        recordedWallet: inv.vendor.walletAddress,
        perVendorLimitUsdc: usdcAtomic(inv.vendor.perVendorLimitUsdc),
        walletCooldownUntil: inv.vendor.walletCooldownUntil,
      },

      invoice: {
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        totalUsdc: usdcAtomic(inv.totalUsdc),
        remittanceWallet: inv.vendor.walletAddress,
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
      vendorName: inv.vendor.name,
      vendorWallet: inv.vendor.walletAddress,
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
            confirmedAt: latestPayment.confirmedAt ? latestPayment.confirmedAt.toISOString() : null,
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
