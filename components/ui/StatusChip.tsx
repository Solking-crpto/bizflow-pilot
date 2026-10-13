"use client";

import React, { useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Clock, Copy, Check, ExternalLink, ShieldAlert } from "lucide-react";
import { truncateHash } from "@/lib/utils";

export type StatusVariant =
  | "verified"
  | "approved"
  | "settled"
  | "anchored"
  | "exact_match"
  | "review_required"
  | "needs_review"
  | "qty_mismatch"
  | "price_mismatch"
  | "blocked"
  | "duplicate"
  | "injection_suspect"
  | "initiated"
  | "pending";

interface StatusChipProps {
  status: StatusVariant | string;
  label?: string;
  size?: "sm" | "md";
}

export function StatusChip({ status, label, size = "md" }: StatusChipProps) {
  const norm = status.toLowerCase();

  let styles = "bg-slate-100 text-slate-700 border-slate-200";
  let Icon = Clock;
  let text = label || status;

  if (["verified", "approved", "exact_match", "settled", "anchored"].includes(norm)) {
    styles = "bg-success-light text-success border-success-border";
    Icon = CheckCircle2;
    if (!label) {
      if (norm === "exact_match") text = "3-Way Matched";
      if (norm === "verified") text = "Verified";
      if (norm === "settled") text = "Settled on Arc";
      if (norm === "anchored") text = "On-Chain Anchored";
    }
  } else if (["review_required", "needs_review", "qty_mismatch", "price_mismatch", "pending"].includes(norm)) {
    styles = "bg-warning-light text-warning border-warning-border";
    Icon = AlertTriangle;
    if (!label) {
      if (norm === "qty_mismatch") text = "Qty Discrepancy";
      if (norm === "price_mismatch") text = "Price Tolerance Exceeded";
      if (norm === "review_required") text = "Review Required";
    }
  } else if (["blocked", "duplicate", "injection_suspect", "failed"].includes(norm)) {
    styles = "bg-danger-light text-danger border-danger-border";
    Icon = norm === "injection_suspect" ? ShieldAlert : XCircle;
    if (!label) {
      if (norm === "duplicate") text = "Duplicate Blocked";
      if (norm === "injection_suspect") text = "Injection Blocked";
      if (norm === "blocked") text = "Policy Blocked";
    }
  }

  const sizeClass = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${styles} ${sizeClass}`}
    >
      <Icon className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
      <span className="capitalize">{text}</span>
    </span>
  );
}

export function HashView({
  hash,
  label,
  explorerUrl,
  truncate = true,
}: {
  hash?: string | null;
  label?: string;
  explorerUrl?: string;
  truncate?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  if (!hash) return <span className="text-ink-muted text-xs font-mono">—</span>;

  const handleCopy = () => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="inline-flex items-center gap-1.5 font-mono text-xs">
      {label && <span className="text-ink-muted font-sans text-[11px]">{label}:</span>}
      <span className="text-ink font-medium bg-canvas px-1.5 py-0.5 rounded border border-border">
        {truncate ? truncateHash(hash) : hash}
      </span>
      <button
        onClick={handleCopy}
        title="Copy to clipboard"
        className="p-1 text-ink-muted hover:text-ink hover:bg-canvas rounded transition-colors"
      >
        {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
      </button>
      {explorerUrl && (
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Open in Arc Explorer"
          className="p-1 text-ink-muted hover:text-brand-teal hover:bg-canvas rounded transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );
}
