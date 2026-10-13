"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, ArrowRight, ShieldAlert, FileText, PackageCheck, Receipt } from "lucide-react";
import { formatUsdc, usdcAtomic } from "@/lib/money";

interface ThreeWayDiffProps {
  poNumber: string;
  poQty: number;
  poUnitPrice: string;
  poTotal: string;

  grNumber: string;
  grQty: number;
  receivedBy: string;

  invoiceNumber: string;
  invoiceQty: number;
  invoiceUnitPrice: string;
  invoiceTotal: string;

  matchStatus: string;
  isInjectionSuspect?: boolean;
  suspicionNotes?: string | null;
}

export function ThreeWayDiffViewer({
  poNumber,
  poQty,
  poUnitPrice,
  poTotal,
  grNumber,
  grQty,
  receivedBy,
  invoiceNumber,
  invoiceQty,
  invoiceUnitPrice,
  invoiceTotal,
  matchStatus,
  isInjectionSuspect,
  suspicionNotes,
}: ThreeWayDiffProps) {
  const qtyMismatch = poQty !== invoiceQty || grQty !== invoiceQty;
  const priceMismatch = poUnitPrice !== invoiceUnitPrice;

  return (
    <div className="space-y-4 rounded-xl border border-border bg-surface p-5 shadow-xs">
      {/* Header & Overall Reconciliation Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div>
          <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
            <span>3-Way Reconciliation Diff</span>
            {isInjectionSuspect ? (
              <span className="text-xs bg-danger-light text-danger border border-danger-border px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> Prompt Injection Threat Flagged
              </span>
            ) : matchStatus === "exact_match" ? (
              <span className="text-xs bg-success-light text-success border border-success-border px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Exact Match Verified
              </span>
            ) : (
              <span className="text-xs bg-warning-light text-warning border border-warning-border px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Discrepancy Detected
              </span>
            )}
          </h3>
          <p className="text-xs text-ink-muted mt-0.5">
            Cross-verifying PO authorization, warehouse receipt proof, and vendor billing.
          </p>
        </div>
      </div>

      {/* Discrepancy or Threat Warning Banner if present */}
      {suspicionNotes && (
        <div
          className={`p-3 rounded-lg text-xs leading-relaxed border ${
            isInjectionSuspect
              ? "bg-danger-light text-danger-dark border-danger-border font-medium"
              : "bg-warning-light text-warning border-warning-border"
          }`}
        >
          {suspicionNotes}
        </div>
      )}

      {/* Three Column Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Column 1: Purchase Order */}
        <div className="p-3.5 rounded-lg bg-canvas border border-border flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-border/80 pb-2">
              <span className="text-xs font-semibold text-navy flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-navy" /> PO Commitment
              </span>
              <span className="font-mono text-xs font-bold text-ink">{poNumber}</span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-ink-muted">Agreed Quantity:</span>
                <span className="font-mono font-medium text-ink">{poQty} bags</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Agreed Unit Price:</span>
                <span className="font-mono font-medium text-ink">{poUnitPrice}</span>
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-border mt-3 flex justify-between items-center text-xs">
            <span className="text-ink-muted font-medium">Authorized Total:</span>
            <span className="font-mono font-bold text-ink">{poTotal}</span>
          </div>
        </div>

        {/* Column 2: Goods Receipt */}
        <div
          className={`p-3.5 rounded-lg border flex flex-col justify-between ${
            qtyMismatch ? "bg-amber-50/50 border-amber-300" : "bg-canvas border border-border"
          }`}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-border/80 pb-2">
              <span className="text-xs font-semibold text-navy flex items-center gap-1.5">
                <PackageCheck className="w-3.5 h-3.5 text-brand-teal" /> Warehouse Receipt
              </span>
              <span className="font-mono text-xs font-bold text-ink">{grNumber}</span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-ink-muted">Physically Received:</span>
                <span className={`font-mono font-bold ${qtyMismatch ? "text-warning" : "text-ink"}`}>
                  {grQty} bags
                </span>
              </div>
              <div className="text-[11px] text-ink-muted truncate">
                Receiver: <span className="text-ink">{receivedBy}</span>
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-border mt-3 flex justify-between items-center text-xs">
            <span className="text-ink-muted font-medium">Receipt Status:</span>
            <span className="text-success font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Signed & Logged
            </span>
          </div>
        </div>

        {/* Column 3: Vendor Invoice */}
        <div
          className={`p-3.5 rounded-lg border flex flex-col justify-between ${
            qtyMismatch || priceMismatch
              ? "bg-red-50/40 border-red-200"
              : "bg-emerald-50/30 border-emerald-200"
          }`}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-border/80 pb-2">
              <span className="text-xs font-semibold text-navy flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-brand-teal" /> Vendor Billed
              </span>
              <span className="font-mono text-xs font-bold text-ink">{invoiceNumber}</span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-ink-muted">Invoiced Quantity:</span>
                <span
                  className={`font-mono font-bold ${
                    qtyMismatch ? "text-danger underline" : "text-ink"
                  }`}
                >
                  {invoiceQty} bags
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-ink-muted">Invoiced Unit Price:</span>
                <span
                  className={`font-mono font-bold ${
                    priceMismatch ? "text-danger" : "text-ink"
                  }`}
                >
                  {invoiceUnitPrice}
                </span>
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-border mt-3 flex justify-between items-center text-xs">
            <span className="text-ink-muted font-medium">Invoiced Total:</span>
            <span className="font-mono font-bold text-ink text-sm">{invoiceTotal}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
