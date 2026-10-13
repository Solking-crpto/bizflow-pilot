import React from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, LayoutDashboard, Award, ReceiptText, CreditCard } from "lucide-react";

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
        <AlertCircle className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-ink">404 — Page Not Found</h1>
        <p className="text-sm text-ink-muted leading-relaxed max-w-md mx-auto">
          The requested page, payment record, or route could not be found. Use the links below to return to verified application routes.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 text-xs font-semibold text-left">
        <Link
          href="/"
          className="p-3.5 rounded-xl border border-border bg-surface hover:bg-canvas hover:border-brand-teal transition-all flex items-center justify-between group shadow-xs"
        >
          <span className="flex items-center gap-2 text-ink">
            <LayoutDashboard className="w-4 h-4 text-brand-teal" />
            Command Center
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-ink-muted group-hover:text-brand-teal transition-colors" />
        </Link>

        <Link
          href="/judges"
          className="p-3.5 rounded-xl border border-border bg-surface hover:bg-canvas hover:border-brand-teal transition-all flex items-center justify-between group shadow-xs"
        >
          <span className="flex items-center gap-2 text-ink">
            <Award className="w-4 h-4 text-navy" />
            Judge Guide
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-ink-muted group-hover:text-brand-teal transition-colors" />
        </Link>

        <Link
          href="/invoices"
          className="p-3.5 rounded-xl border border-border bg-surface hover:bg-canvas hover:border-brand-teal transition-all flex items-center justify-between group shadow-xs"
        >
          <span className="flex items-center gap-2 text-ink">
            <ReceiptText className="w-4 h-4 text-navy" />
            Invoice Desk
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-ink-muted group-hover:text-brand-teal transition-colors" />
        </Link>

        <Link
          href="/payments"
          className="p-3.5 rounded-xl border border-border bg-surface hover:bg-canvas hover:border-brand-teal transition-all flex items-center justify-between group shadow-xs"
        >
          <span className="flex items-center gap-2 text-ink">
            <CreditCard className="w-4 h-4 text-brand-teal" />
            Payment Desk
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-ink-muted group-hover:text-brand-teal transition-colors" />
        </Link>
      </div>
    </div>
  );
}
