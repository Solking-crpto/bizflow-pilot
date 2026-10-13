import React from "react";
import { prisma } from "@/lib/db";
import { PolicySimulatorClient } from "@/components/simulator/PolicySimulatorClient";

export const dynamic = "force-dynamic";

export default async function PolicySimulatorPage() {
  const invoices = await prisma.invoice.findMany({
    include: { vendor: true },
    orderBy: { createdAt: "desc" },
  });

  const defaultNetwork = (process.env.NEXT_PUBLIC_NETWORK_MODE || "testnet") as "testnet" | "mainnet";

  const options = invoices.map((inv) => ({
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    vendorName: inv.vendor.name,
    amountAtomic: inv.totalUsdc.toString(),
    wallet: inv.vendor.walletAddress,
    matchStatus: inv.matchStatus,
    duplicateScore: inv.duplicateScore,
    isInjectionSuspect: inv.isInjectionSuspect,
  }));

  return <PolicySimulatorClient invoices={options} defaultNetwork={defaultNetwork} />;
}
