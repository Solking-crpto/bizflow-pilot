import { prisma } from "./db";
import { formatUsdc, usdcAtomic } from "./money";

export async function getCommandCenterData() {
  const org = await prisma.organization.findFirst({
    include: {
      settings: true,
      invoices: {
        include: { vendor: true, purchaseOrder: true },
        orderBy: { createdAt: "desc" },
      },
      payments: {
        include: { vendor: true, invoice: true },
        orderBy: { initiatedAt: "desc" },
        take: 5,
      },
      purchaseOrders: true,
      vendors: true,
    },
  });

  if (!org) {
    return null;
  }

  const settings = org.settings[0] || {
    killSwitchActive: false,
    priceToleranceBps: 100,
    requireApprovalAbove: 5000000000n,
    minReserveUsdc: 2000000000n,
    dailyLimitUsdc: 20000000000n,
  };

  // Compute metrics
  let upcomingBillsAtomic = 0n;
  let pendingApprovalsCount = 0;
  let blockedCount = 0;

  for (const inv of org.invoices) {
    if (inv.status === "verified" || inv.status === "pending_verification") {
      upcomingBillsAtomic += inv.totalUsdc;
      pendingApprovalsCount++;
    } else if (inv.status === "review_required") {
      pendingApprovalsCount++;
    } else if (inv.status === "blocked") {
      blockedCount++;
    }
  }

  return {
    org: {
      id: org.id,
      name: org.name,
      currency: org.currency,
    },
    settings: {
      killSwitchActive: settings.killSwitchActive,
      priceToleranceBps: settings.priceToleranceBps,
      requireApprovalAbove: settings.requireApprovalAbove.toString(),
      minReserveUsdc: settings.minReserveUsdc.toString(),
      dailyLimitUsdc: settings.dailyLimitUsdc.toString(),
    },
    metrics: {
      upcomingBillsFormatted: formatUsdc(usdcAtomic(upcomingBillsAtomic)),
      upcomingBillsAtomic: upcomingBillsAtomic.toString(),
      pendingApprovalsCount,
      blockedCount,
      totalInvoicesCount: org.invoices.length,
      vendorCount: org.vendors.length,
    },
    recentInvoices: org.invoices.map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      vendorName: inv.vendor.name,
      amountFormatted: formatUsdc(usdcAtomic(inv.totalUsdc)),
      amountAtomic: inv.totalUsdc.toString(),
      status: inv.status,
      matchStatus: inv.matchStatus,
      isInjectionSuspect: inv.isInjectionSuspect,
      duplicateScore: inv.duplicateScore,
      createdAt: inv.createdAt.toISOString(),
    })),
    recentPayments: org.payments.map((p) => ({
      id: p.id,
      invoiceNumber: p.invoice.invoiceNumber,
      vendorName: p.vendor.name,
      amountFormatted: formatUsdc(usdcAtomic(p.amountAtomic)),
      destination: p.destination,
      network: p.network,
      provider: p.provider,
      status: p.status,
      txHash: p.txHash,
      anchorTxHash: p.anchorTxHash,
      initiatedAt: p.initiatedAt.toISOString(),
      confirmedAt: p.confirmedAt ? p.confirmedAt.toISOString() : null,
    })),
  };
}
