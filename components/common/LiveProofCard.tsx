"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldCheck, Check, Copy, ExternalLink, ArrowRight, Zap, CheckCircle2 } from "lucide-react";
import { truncateHash } from "@/lib/utils";

export interface LiveProofData {
  id: string;
  invoiceNumber: string;
  vendorName: string;
  amountFormatted: string;
  txHash: string;
  anchorTxHash?: string | null;
  network?: string;
  confirmedAt?: string | null;
}

interface LiveProofCardProps {
  payment?: LiveProofData | null;
  explorerUrl?: string;
}

export function LiveProofCard({ payment, explorerUrl = "https://explorer.arc.io" }: LiveProofCardProps) {
  const [copiedTx, setCopiedTx] = useState(false);
  const [copiedAnchor, setCopiedAnchor] = useState(false);

  if (!payment || !payment.txHash) {
    return (
      <div className="p-4 rounded-xl border border-dashed border-border bg-surface text-ink-muted text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          <span>No settlement recorded yet. Run the first payment through the Payment Desk to anchor live cryptographic proof on Arc.</span>
        </div>
        <Link
          href="/payments"
          className="text-navy font-semibold hover:text-brand-teal transition-colors flex items-center gap-1"
        >
          <span>Payment Desk</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    );
  }

  const handleCopyTx = () => {
    navigator.clipboard.writeText(payment.txHash);
    setCopiedTx(true);
    setTimeout(() => setCopiedTx(false), 2000);
  };

  const handleCopyAnchor = () => {
    if (payment.anchorTxHash) {
      navigator.clipboard.writeText(payment.anchorTxHash);
      setCopiedAnchor(true);
      setTimeout(() => setCopiedAnchor(false), 2000);
    }
  };

  return (
    <div className="p-4 rounded-xl border border-emerald-300 bg-gradient-to-r from-emerald-50/80 via-surface to-emerald-50/30 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Summary & Status */}
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-600 text-white shrink-0 mt-0.5 shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                Live Proof · Confirmed on Arc
              </span>
              <span className="text-xs text-ink-muted">
                Beneficiary: <strong className="text-ink">{payment.vendorName}</strong>
              </span>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono text-ink tracking-tight">
                {payment.amountFormatted}
              </span>
              <span className="text-xs text-ink-muted font-mono">
                ({payment.invoiceNumber})
              </span>
            </div>
          </div>
        </div>

        {/* Right: Hashes & Passport Link */}
        <div className="flex flex-col sm:items-end gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Payment Tx */}
            <div className="inline-flex items-center gap-1 font-mono text-[11px] bg-canvas px-2 py-1 rounded border border-border">
              <span className="text-ink-muted font-sans text-[10px]">Tx:</span>
              <span className="text-ink font-semibold" title={payment.txHash}>
                {truncateHash(payment.txHash, 6, 4)}
              </span>
              <button
                onClick={handleCopyTx}
                className="p-0.5 text-ink-muted hover:text-ink transition-colors"
                title="Copy payment transaction hash"
              >
                {copiedTx ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
              </button>
              <a
                href={`${explorerUrl}/tx/${payment.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-0.5 text-ink-muted hover:text-brand-teal transition-colors"
                title="View on Arc Explorer"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Anchor Tx */}
            {payment.anchorTxHash && (
              <div className="inline-flex items-center gap-1 font-mono text-[11px] bg-canvas px-2 py-1 rounded border border-border">
                <span className="text-ink-muted font-sans text-[10px]">Anchor:</span>
                <span className="text-ink font-semibold" title={payment.anchorTxHash}>
                  {truncateHash(payment.anchorTxHash, 6, 4)}
                </span>
                <button
                  onClick={handleCopyAnchor}
                  className="p-0.5 text-ink-muted hover:text-ink transition-colors"
                  title="Copy anchor transaction hash"
                >
                  {copiedAnchor ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                </button>
                <a
                  href={`${explorerUrl}/tx/${payment.anchorTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-0.5 text-ink-muted hover:text-brand-teal transition-colors"
                  title="View anchor on Arc Explorer"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          <Link
            href={`/verify/${payment.id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition-colors"
          >
            <span>Inspect Live Payment Passport</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
