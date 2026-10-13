import { PrismaClient } from "@prisma/client";

const datasourceUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
const prisma = new PrismaClient({
  datasourceUrl: datasourceUrl ? datasourceUrl : undefined,
});

/**
 * Non-destructive migration script to relabel demo vendor names in Arc Mainnet database.
 * Never executes deletes or truncates. Only updates vendor and invoice labels.
 */
async function relabelMainnetDemo() {
  console.log("==================================================================");
  console.log("  BizFlow Pilot — Non-Destructive Mainnet Vendor Relabel Script   ");
  console.log("==================================================================");

  const NEW_VENDOR_NAME = "Northgate Cement Supply (demo vendor)";

  // 1. Update Vendors
  const vendorUpdate = await prisma.vendor.updateMany({
    where: {
      OR: [
        { name: "Dangote Distribution (Mainnet Verified)" },
        { name: { contains: "Dangote" } },
      ],
    },
    data: {
      name: NEW_VENDOR_NAME,
    },
  });

  console.log(`Updated ${vendorUpdate.count} vendor record(s) to: '${NEW_VENDOR_NAME}'`);

  // 2. Update Invoices extractedData and rawContent
  const invoices = await prisma.invoice.findMany({
    where: {
      OR: [
        { extractedData: { contains: "Dangote" } },
        { rawContent: { contains: "Dangote" } },
      ],
    },
  });

  let invoiceUpdateCount = 0;
  for (const inv of invoices) {
    let updatedExtractedData = inv.extractedData;
    try {
      const parsed = JSON.parse(inv.extractedData);
      if (parsed.vendorName) {
        parsed.vendorName = NEW_VENDOR_NAME;
        updatedExtractedData = JSON.stringify(parsed);
      }
    } catch {
      // Keep existing if JSON parse fails
    }

    const updatedRawContent = inv.rawContent.replace(/Dangote Distribution Ltd/g, "Northgate Cement Supply")
      .replace(/Dangote Distribution/g, "Northgate Cement Supply");

    await prisma.invoice.update({
      where: { id: inv.id },
      data: {
        extractedData: updatedExtractedData,
        rawContent: updatedRawContent,
      },
    });

    invoiceUpdateCount++;
  }

  console.log(`Updated ${invoiceUpdateCount} invoice record(s) with sanitized vendor label.`);
  console.log("Relabel complete. Zero records were deleted.");
}

relabelMainnetDemo()
  .catch((e) => {
    console.error("Relabel failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
