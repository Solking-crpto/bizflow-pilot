import { UsdcAtomic, UsdcMath, usdcAtomic } from "../money";

export interface POLineItem {
  itemId: string;
  sku: string;
  quantity: number;
  unitPriceUsdc: UsdcAtomic;
}

export interface GRLineItem {
  itemId: string;
  quantity: number;
}

export interface InvoiceLineItem {
  itemId?: string;
  sku?: string;
  quantity: number;
  unitPriceUsdc: UsdcAtomic;
  totalUsdc: UsdcAtomic;
}

export interface MatchDiscrepancy {
  field: "quantity" | "unitPrice" | "receipt";
  expected: string | number;
  actual: string | number;
  varianceBps?: bigint;
  message: string;
}

export interface ThreeWayMatchResult {
  matchStatus: "exact_match" | "qty_mismatch" | "price_mismatch" | "missing_receipt" | "unmatched";
  passed: boolean;
  discrepancies: MatchDiscrepancy[];
  toleranceBpsUsed: number;
}

/**
 * Deterministic Three-Way Matching Engine
 * Compares Purchase Order (agreed price) vs Goods Receipt (received quantity) vs Invoice.
 * 
 * Tolerance Rules:
 * - Quantity: Must be exact (Invoiced Qty <= Received Qty)
 * - Unit Price: Must be within toleranceBps (default 100 bps = 1.00%)
 */
export function evaluateThreeWayMatch(params: {
  poLines: POLineItem[];
  grLines: GRLineItem[];
  invoiceLines: InvoiceLineItem[];
  toleranceBps?: number;
}): ThreeWayMatchResult {
  const toleranceBps = BigInt(params.toleranceBps ?? 100); // 1.00% default
  const discrepancies: MatchDiscrepancy[] = [];

  if (params.grLines.length === 0) {
    return {
      matchStatus: "missing_receipt",
      passed: false,
      discrepancies: [
        {
          field: "receipt",
          expected: "Verified Goods Receipt",
          actual: "None found",
          message: "No goods receipt notes recorded for this purchase order yet.",
        },
      ],
      toleranceBpsUsed: Number(toleranceBps),
    };
  }

  // Map quantities received by itemId
  const receivedByItem = new Map<string, number>();
  for (const gr of params.grLines) {
    receivedByItem.set(gr.itemId, (receivedByItem.get(gr.itemId) || 0) + gr.quantity);
  }

  // Map PO lines by itemId
  const poByItem = new Map<string, POLineItem>();
  for (const po of params.poLines) {
    poByItem.set(po.itemId, po);
  }

  let hasQtyMismatch = false;
  let hasPriceMismatch = false;

  for (const invLine of params.invoiceLines) {
    const itemId = invLine.itemId || params.poLines[0]?.itemId;
    const poLine = poByItem.get(itemId);
    const qtyReceived = receivedByItem.get(itemId) || 0;

    // 1. Quantity Check: Invoiced quantity vs Received in warehouse
    if (invLine.quantity !== qtyReceived) {
      hasQtyMismatch = true;
      discrepancies.push({
        field: "quantity",
        expected: qtyReceived,
        actual: invLine.quantity,
        message: `Invoiced quantity (${invLine.quantity}) does not match warehouse verified receipt (${qtyReceived}). Variance: ${invLine.quantity - qtyReceived} units.`,
      });
    }

    // 2. Unit Price Check against PO: Within tolerance
    if (poLine) {
      const priceVarianceBps = UsdcMath.percentageDiffBps(poLine.unitPriceUsdc, invLine.unitPriceUsdc);
      if (priceVarianceBps > toleranceBps) {
        hasPriceMismatch = true;
        discrepancies.push({
          field: "unitPrice",
          expected: poLine.unitPriceUsdc.toString(),
          actual: invLine.unitPriceUsdc.toString(),
          varianceBps: priceVarianceBps,
          message: `Unit price variance (${Number(priceVarianceBps) / 100}%) exceeds configured policy tolerance (${Number(toleranceBps) / 100}%).`,
        });
      }
    }
  }

  let matchStatus: ThreeWayMatchResult["matchStatus"] = "exact_match";
  if (hasQtyMismatch) {
    matchStatus = "qty_mismatch";
  } else if (hasPriceMismatch) {
    matchStatus = "price_mismatch";
  }

  return {
    matchStatus,
    passed: discrepancies.length === 0,
    discrepancies,
    toleranceBpsUsed: Number(toleranceBps),
  };
}
