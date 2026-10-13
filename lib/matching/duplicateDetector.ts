export interface ExistingInvoiceRecord {
  id: string;
  invoiceNumber: string;
  vendorId: string;
  purchaseOrderId?: string | null;
  fileHash: string;
  totalUsdc: bigint;
}

export interface CandidateInvoice {
  id?: string;
  invoiceNumber: string;
  vendorId: string;
  purchaseOrderId?: string;
  fileHash: string;
  totalUsdc: bigint;
}

export interface DuplicateDetectionResult {
  isDuplicate: boolean;
  score: number; // 0 to 100
  matchedInvoiceId?: string;
  reason?: string;
}

/**
 * Deterministic Duplicate Invoice Detection Engine
 */
export function detectDuplicateInvoice(
  candidate: CandidateInvoice,
  existingInvoices: ExistingInvoiceRecord[]
): DuplicateDetectionResult {
  for (const existing of existingInvoices) {
    // Skip self if updating existing record
    if (candidate.id && candidate.id === existing.id) continue;

    // Check 1: Cryptographic File Hash Match (SHA-256)
    if (candidate.fileHash && candidate.fileHash === existing.fileHash) {
      return {
        isDuplicate: true,
        score: 100,
        matchedInvoiceId: existing.id,
        reason: `Cryptographic SHA-256 hash matches existing invoice ${existing.invoiceNumber} identically.`,
      };
    }

    // Check 2: Vendor + Normalized Invoice Number Match
    const cleanCandidateNum = candidate.invoiceNumber.trim().toUpperCase();
    const cleanExistingNum = existing.invoiceNumber.trim().toUpperCase();

    if (candidate.vendorId === existing.vendorId && cleanCandidateNum === cleanExistingNum) {
      return {
        isDuplicate: true,
        score: 99,
        matchedInvoiceId: existing.id,
        reason: `Invoice number ${existing.invoiceNumber} has already been billed by this vendor.`,
      };
    }

    // Check 3: Same Vendor + Same Purchase Order + Identical Amount
    if (
      candidate.vendorId === existing.vendorId &&
      candidate.purchaseOrderId &&
      candidate.purchaseOrderId === existing.purchaseOrderId &&
      candidate.totalUsdc === existing.totalUsdc
    ) {
      return {
        isDuplicate: true,
        score: 95,
        matchedInvoiceId: existing.id,
        reason: `Vendor and Purchase Order combination already has an identical settlement claim under invoice ${existing.invoiceNumber}.`,
      };
    }
  }

  return {
    isDuplicate: false,
    score: 0,
  };
}
