import React from "react";
import { prisma } from "@/lib/db";
import { formatUsdc, usdcAtomic } from "@/lib/money";
import { runAgentAnalysis } from "@/lib/agent/recommender";
import { AgentDashboardClient } from "@/components/agent/AgentDashboardClient";

export const dynamic = "force-dynamic";

export default async function AgentPage() {
  const invoices = await prisma.invoice.findMany({
    include: { vendor: true, purchaseOrder: true },
    orderBy: { createdAt: "desc" },
  });

  const treasuryBalance = 100000000000n; // 100,000 USDC
  const minReserve = 2000000000n; // 2,000 USDC
  const freeCash = treasuryBalance - minReserve; // 98,000 USDC

  const analyzedInvoices = await Promise.all(
    invoices.map(async (inv) => {
      const { recommendation } = await runAgentAnalysis({
        invoiceId: inv.id,
        invoiceNumber: inv.invoiceNumber,
        vendorName: inv.vendor.name,
        amountFormatted: formatUsdc(usdcAtomic(inv.totalUsdc)),
        amountAtomic: inv.totalUsdc.toString(),
        matchStatus: inv.matchStatus,
        duplicateScore: inv.duplicateScore,
        isInjectionSuspect: inv.isInjectionSuspect,
        untrustedRawText: inv.rawContent,
        cashPosition: {
          availableTreasury: formatUsdc(usdcAtomic(treasuryBalance)),
          minimumReserve: formatUsdc(usdcAtomic(minReserve)),
          netFreeCash: formatUsdc(usdcAtomic(freeCash)),
        },
        obligationsQueue: {
          totalPendingAmount: formatUsdc(usdcAtomic(inv.totalUsdc)),
          itemCount: invoices.length,
        },
      });

      return {
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        vendorName: inv.vendor.name,
        amountFormatted: formatUsdc(usdcAtomic(inv.totalUsdc)),
        matchStatus: inv.matchStatus,
        duplicateScore: inv.duplicateScore,
        isInjectionSuspect: inv.isInjectionSuspect,
        dueDate: inv.dueDate ? inv.dueDate.toISOString() : null,
        recommendation,
      };
    })
  );

  return (
    <AgentDashboardClient
      invoices={analyzedInvoices}
      treasuryFormatted={formatUsdc(usdcAtomic(treasuryBalance))}
      reserveFormatted={formatUsdc(usdcAtomic(minReserve))}
      freeCashFormatted={formatUsdc(usdcAtomic(freeCash))}
    />
  );
}
