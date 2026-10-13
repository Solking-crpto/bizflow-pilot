import { describe, it, expect } from "vitest";
import { evaluateThreeWayMatch } from "../lib/matching/threeWayMatch";
import { detectDuplicateInvoice } from "../lib/matching/duplicateDetector";
import { parseUsdc } from "../lib/money";

describe("lib/matching - 3-Way Match & Duplicate Detection", () => {
  const samplePO = [
    {
      itemId: "item-cement-50kg",
      sku: "CEM-PORT-50KG",
      quantity: 200,
      unitPriceUsdc: parseUsdc("8.50"),
    },
  ];

  const sampleGR = [
    {
      itemId: "item-cement-50kg",
      quantity: 200,
    },
  ];

  it("approves exact match when quantities and prices match PO and Goods Receipt", () => {
    const invoiceLines = [
      {
        itemId: "item-cement-50kg",
        quantity: 200,
        unitPriceUsdc: parseUsdc("8.50"),
        totalUsdc: parseUsdc("1700.00"),
      },
    ];

    const result = evaluateThreeWayMatch({
      poLines: samplePO,
      grLines: sampleGR,
      invoiceLines,
    });

    expect(result.passed).toBe(true);
    expect(result.matchStatus).toBe("exact_match");
    expect(result.discrepancies.length).toBe(0);
  });

  it("detects quantity mismatch when invoice quantity exceeds goods receipt", () => {
    const invoiceLines = [
      {
        itemId: "item-cement-50kg",
        quantity: 240, // 40 extra bags
        unitPriceUsdc: parseUsdc("8.50"),
        totalUsdc: parseUsdc("2040.00"),
      },
    ];

    const result = evaluateThreeWayMatch({
      poLines: samplePO,
      grLines: sampleGR,
      invoiceLines,
    });

    expect(result.passed).toBe(false);
    expect(result.matchStatus).toBe("qty_mismatch");
    expect(result.discrepancies[0].field).toBe("quantity");
    expect(result.discrepancies[0].actual).toBe(240);
    expect(result.discrepancies[0].expected).toBe(200);
  });

  it("respects 1% price tolerance and flags when price variance exceeds 100 bps", () => {
    // 8.50 + 0.8% = 8.568 -> Within 1% tolerance
    const withinToleranceLines = [
      {
        itemId: "item-cement-50kg",
        quantity: 200,
        unitPriceUsdc: parseUsdc("8.56"),
        totalUsdc: parseUsdc("1712.00"),
      },
    ];

    const res1 = evaluateThreeWayMatch({
      poLines: samplePO,
      grLines: sampleGR,
      invoiceLines: withinToleranceLines,
      toleranceBps: 100, // 1%
    });
    expect(res1.passed).toBe(true);

    // 8.50 + 2.3% = 8.70 -> Exceeds 1% tolerance
    const overToleranceLines = [
      {
        itemId: "item-cement-50kg",
        quantity: 200,
        unitPriceUsdc: parseUsdc("8.70"),
        totalUsdc: parseUsdc("1740.00"),
      },
    ];

    const res2 = evaluateThreeWayMatch({
      poLines: samplePO,
      grLines: sampleGR,
      invoiceLines: overToleranceLines,
      toleranceBps: 100,
    });
    expect(res2.passed).toBe(false);
    expect(res2.matchStatus).toBe("price_mismatch");
  });

  it("detects cryptographic duplicate when fileHash matches an existing record", () => {
    const existing = [
      {
        id: "inv-existing-01",
        invoiceNumber: "INV-401",
        vendorId: "vendor-dangote",
        purchaseOrderId: "po-89",
        fileHash: "hash-identical-sha256",
        totalUsdc: parseUsdc("1700.00"),
      },
    ];

    const candidate = {
      invoiceNumber: "INV-DIFFERENT-NAME",
      vendorId: "vendor-dangote",
      fileHash: "hash-identical-sha256",
      totalUsdc: parseUsdc("1700.00"),
    };

    const dup = detectDuplicateInvoice(candidate, existing);
    expect(dup.isDuplicate).toBe(true);
    expect(dup.score).toBe(100);
    expect(dup.matchedInvoiceId).toBe("inv-existing-01");
  });
});
