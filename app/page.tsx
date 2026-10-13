import React from "react";
import Link from "next/link";
import {
  CreditCard,
  ReceiptText,
  AlertOctagon,
  ShieldCheck,
  ArrowUpRight,
  TrendingUp,
  Cpu,
  Layers,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { getCommandCenterData } from "@/lib/data";
import { getActiveNetwork } from "@/lib/networks";
import { getTreasuryPublicAddress, getSanitizedPaymentProvider } from "@/lib/treasury";
import { StatusChip, HashView } from "@/components/ui/StatusChip";

export const dynamic = "force-dynamic";

export default async function CommandCenterPage() {
  const data = await getCommandCenterData();
  const network = getActiveNetwork();
  const treasuryAddress = getTreasuryPublicAddress();
  const paymentProvider = getSanitizedPaymentProvider();

  if (!data) {
    return (
      <div className="p-8 text-center text-ink-muted">
        <p>No organization found. Please run the database seed script.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Command Center</h1>
          <p className="text-sm text-ink-muted mt-0.5">
            Real-time corporate treasury overview, policy guardrails, and Arc settlement activity.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/invoices"
            className="px-3.5 py-1.5 rounded-md bg-navy text-white text-xs font-semibold hover:bg-navy-light transition-colors shadow-xs flex items-center gap-1.5"
          >
            <ReceiptText className="w-3.5 h-3.5" />
            <span>Process Invoices</span>
          </Link>
          <Link
            href="/payments"
            className="px-3.5 py-1.5 rounded-md bg-brand-teal text-white text-xs font-semibold hover:bg-brand-hover transition-colors shadow-xs flex items-center gap-1.5"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Payment Desk</span>
          </Link>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Treasury Balance */}
        <div className="p-4 rounded-xl border border-border bg-surface shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">Available Treasury</span>
            <div className="p-1.5 rounded-md bg-brand-light text-brand-teal">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tracking-tight text-ink">
              100,000.00 <span className="text-xs font-sans text-brand-teal font-semibold">USDC</span>
            </div>
            <div className="text-[11px] text-ink-muted mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Settlement Reserve Healthy</span>
            </div>
          </div>
        </div>

        {/* Pending Invoices / Due Bills */}
        <div className="p-4 rounded-xl border border-border bg-surface shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">Verified Payables</span>
            <div className="p-1.5 rounded-md bg-navy/10 text-navy">
              <ReceiptText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tracking-tight text-ink">
              {data.metrics.upcomingBillsFormatted}
            </div>
            <div className="text-[11px] text-ink-muted mt-1">
              {data.metrics.totalInvoicesCount} invoices queued for settlement
            </div>
          </div>
        </div>

        {/* Policy & Review Gate */}
        <div className="p-4 rounded-xl border border-border bg-surface shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">Action Required</span>
            <div className="p-1.5 rounded-md bg-warning-light text-warning">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tracking-tight text-ink">
              {data.metrics.pendingApprovalsCount} <span className="text-xs font-sans font-normal text-ink-muted">items</span>
            </div>
            <div className="text-[11px] text-warning font-medium mt-1">
              Includes {data.metrics.blockedCount} policy-blocked anomalies
            </div>
          </div>
        </div>

        {/* Policy Guard & Kill Switch */}
        <div className="p-4 rounded-xl border border-border bg-surface shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">Policy Engine</span>
            <div className="p-1.5 rounded-md bg-success-light text-success">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-success flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Enforcing 10 Rules
              </span>
            </div>
            <div className="text-[11px] text-ink-muted mt-1 font-mono">
              Kill Switch: {data.settings.killSwitchActive ? "ARMED (HALTED)" : "DISARMED (ACTIVE)"}
            </div>
          </div>
        </div>
      </div>

      {/* Activity-to-Payment Proof Chain Architecture Callout */}
      <div className="p-4 rounded-xl border border-brand-teal/30 bg-gradient-to-r from-brand-light/60 to-surface flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-navy text-white mt-0.5">
            <Layers className="w-5 h-5 text-brand-teal" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink">Activity-to-Payment Cryptographic Proof Chain</h3>
            <p className="text-xs text-ink-muted mt-0.5 max-w-2xl leading-relaxed">
              Every payment binds <strong>Purchase Order</strong> &rarr; <strong>Warehouse Goods Receipt</strong> &rarr; <strong>3-Way Match</strong> &rarr; <strong>AI Agent Reasoning</strong> &rarr; <strong>Deterministic Policy Gate</strong> &rarr; <strong>Arc USDC Settlement</strong> &rarr; <strong>AuditAnchor.sol</strong>.
            </p>
          </div>
        </div>
        <Link
          href="/audit"
          className="px-3 py-1.5 rounded-md bg-white border border-border text-xs font-semibold text-navy hover:bg-canvas transition-colors shadow-2xs whitespace-nowrap flex items-center gap-1.5 self-start md:self-center"
        >
          <span>Inspect Hash Chain</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main Split: Invoices Queue + Settlement Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoices Queue (2 Columns) */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-surface shadow-card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ReceiptText className="w-4 h-4 text-navy" />
              <h2 className="text-sm font-semibold text-ink">Invoice Desk & Match Queue</h2>
            </div>
            <Link
              href="/invoices"
              className="text-xs text-navy font-medium hover:text-brand-teal transition-colors flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-border">
            {data.recentInvoices.map((inv) => (
              <div key={inv.id} className="p-4 hover:bg-canvas/50 transition-colors flex items-center justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-ink">{inv.invoiceNumber}</span>
                    <StatusChip status={inv.status} />
                    {inv.isInjectionSuspect && <StatusChip status="injection_suspect" label="Injection Threat" />}
                  </div>
                  <div className="text-xs text-ink-muted truncate">
                    Vendor: <span className="font-medium text-ink">{inv.vendorName}</span>
                  </div>
                </div>

                <div className="text-right whitespace-nowrap">
                  <div className="text-sm font-mono font-bold text-ink">{inv.amountFormatted}</div>
                  <div className="text-[11px] text-ink-muted">
                    Match: <span className="capitalize font-medium">{inv.matchStatus.replace("_", " ")}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Arc Network & Provider Monitor (1 Column) */}
        <div className="rounded-xl border border-border bg-surface shadow-card p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <Cpu className="w-4 h-4 text-navy" />
            <h2 className="text-sm font-semibold text-ink">Settlement Infrastructure</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-canvas border border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">Target Blockchain</span>
                <span className="font-semibold text-navy">{network.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">Chain ID</span>
                <span className="font-mono text-ink font-bold">{network.chainId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">Gas Asset</span>
                <span className="font-mono text-ink font-semibold">USDC (Native)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">Settlement Provider</span>
                <span className="font-mono text-brand-teal font-semibold uppercase">
                  {paymentProvider}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">Treasury Account</span>
                <span className="font-mono text-[11px] text-ink font-semibold" title={treasuryAddress}>
                  {treasuryAddress.slice(0, 6)}...{treasuryAddress.slice(-4)}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-surface border border-border space-y-1.5">
              <div className="flex items-center gap-1.5 text-ink font-semibold">
                <Lock className="w-3.5 h-3.5 text-navy" />
                <span>Security Principle</span>
              </div>
              <p className="text-[11px] text-ink-muted leading-relaxed">
                The AI Agent proposes. A deterministic policy engine decides. The LLM never holds keys and cannot trigger the payment adapter.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/simulator"
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-canvas hover:bg-canvas-subtle border border-border text-xs font-semibold text-ink transition-colors"
              >
                <span>Launch Policy Simulator</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
