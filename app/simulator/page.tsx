import React from "react";
import { prisma } from "@/lib/db";
import { PolicySimulatorClient } from "@/components/simulator/PolicySimulatorClient";
import { DEMO_INVOICES } from "@/lib/demoData";

export const dynamic = "force-dynamic";

export default async function PolicySimulatorPage() {
  let invoices: any[] = [];
  try {
    invoices = await prisma.invoice.findMany({
      include: { vendor: true },
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    invoices = [];
  }

  if (invoices.length === 0) invoices = DEMO_INVOICES;

  const defaultNetwork = (process.env.NEXT_PUBLIC_NETWORK_MODE || "testnet") as "testnet" | "mainnet";

  const options = invoices.map((inv) => ({
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    vendorName: inv.vendor?.name || "Dangote Cement Distribution (demo)",
    amountAtomic: inv.totalUsdc.toString(),
    wallet: inv.vendor?.walletAddress || "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    matchStatus: inv.matchStatus,
    duplicateScore: inv.duplicateScore,
    isInjectionSuspect: inv.isInjectionSuspect,
  }));

  return <PolicySimulatorClient invoices={options} defaultNetwork={defaultNetwork} />;
}
