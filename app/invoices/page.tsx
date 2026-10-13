import React from "react";
import { prisma, withDbTimeout } from "@/lib/db";
import { formatUsdc, usdcAtomic } from "@/lib/money";
import { InvoiceDeskClient, SerializedInvoice } from "@/components/invoices/InvoiceDeskClient";
import { DEMO_INVOICES } from "@/lib/demoData";

export const dynamic = "force-dynamic";

export default async function InvoiceDeskPage() {
  let invoices: any[] = [];
  try {
    invoices = await withDbTimeout(
      () =>
        prisma.invoice.findMany({
          include: {
            vendor: true,
            purchaseOrder: {
              include: {
                lines: { include: { item: true } },
                goodsReceipts: {
                  include: { lines: { include: { item: true } } },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
      2500,
      []
    );
  } catch (err) {
    invoices = [];
  }

  if (invoices.length === 0) {
    invoices = DEMO_INVOICES;
  }

  const serializedInvoices: SerializedInvoice[] = invoices.map((inv) => {
    const po = inv.purchaseOrder;
    const poLine = po?.lines?.[0];
    const gr = po?.goodsReceipts?.[0];
    const grLine = gr?.lines?.[0];

    return {
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      vendorId: inv.vendorId,
      vendorName: inv.vendor?.name || "Dangote Cement Distribution (demo)",
      vendorWallet: inv.vendor?.walletAddress || "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      poNumber: po?.poNumber || "PO-2026-0089",
      poQty: poLine?.quantity || 200,
      poUnitPrice: formatUsdc(usdcAtomic(poLine?.unitPriceUsdc || 8500000n)),
      poTotal: formatUsdc(usdcAtomic(po?.totalUsdc || 1700000000n)),
      grNumber: gr?.grNumber || "GR-2026-0089",
      grQty: grLine?.quantity || 200,
      receivedBy: gr?.receivedBy || "Warehouse Receiver",
      amountFormatted: formatUsdc(usdcAtomic(inv.totalUsdc)),
      amountAtomic: inv.totalUsdc.toString(),
      status: inv.status,
      matchStatus: inv.matchStatus,
      duplicateScore: inv.duplicateScore,
      isInjectionSuspect: inv.isInjectionSuspect,
      suspicionNotes: inv.suspicionNotes,
      fileHash: inv.fileHash,
      rawContent: inv.rawContent,
      createdAt: (inv.createdAt instanceof Date ? inv.createdAt : new Date()).toISOString(),
    };
  });

  return <InvoiceDeskClient invoices={serializedInvoices} />;
}
