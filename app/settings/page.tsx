import React from "react";
import { Settings, ShieldAlert, Sliders, Users, Wallet, Lock, CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatUsdc, usdcAtomic } from "@/lib/money";
import { getActiveNetwork } from "@/lib/networks";
import { HashView } from "@/components/ui/StatusChip";
import { privateKeyToAccount } from "viem/accounts";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const org = await prisma.organization.findFirst({
    include: {
      settings: true,
      vendors: true,
    },
  });

  const network = getActiveNetwork();
  const settings = org?.settings[0] || {
    killSwitchActive: false,
    priceToleranceBps: 100,
    requireApprovalAbove: 5000000000n,
    minReserveUsdc: 2000000000n,
    dailyLimitUsdc: 20000000000n,
  };

  // Derive public treasury address safely from private key
  let treasuryPublicAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  try {
    const rawKey = process.env.TREASURY_PRIVATE_KEY;
    if (rawKey) {
      const privateKey = (rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`) as `0x${string}`;
      const account = privateKeyToAccount(privateKey);
      treasuryPublicAddress = account.address;
    }
  } catch (err) {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink flex items-center gap-2">
            <span>Rules & Wallet Settings</span>
          </h1>
          <p className="text-sm text-ink-muted mt-0.5">
            Configure policy limits, corporate approval thresholds, approved vendors, and emergency halts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Treasury & Emergency Controls (5 Columns) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Treasury Wallet Card */}
          <div className="rounded-xl border border-border bg-surface shadow-card p-5 space-y-3">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Wallet className="w-4 h-4 text-navy" />
              <h2 className="text-sm font-semibold text-ink">Arc Treasury Account</h2>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-ink-muted">Public EOA Address:</span>
                <HashView hash={treasuryPublicAddress} truncate={true} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-ink-muted">Private Key Storage:</span>
                <span className="font-mono text-success font-medium flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Server Env Only (Never in LLM / Client)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-ink-muted">Gas Asset:</span>
                <span className="font-mono text-ink">Native USDC</span>
              </div>
            </div>
          </div>

          {/* Emergency Kill Switch */}
          <div className="rounded-xl border border-danger-border/40 bg-surface shadow-card p-5 space-y-3">
            <div className="flex items-center gap-2 border-b border-border pb-3 text-danger">
              <ShieldAlert className="w-4 h-4" />
              <h2 className="text-sm font-bold">Global Emergency Kill Switch</h2>
            </div>

            <p className="text-xs text-ink-muted leading-relaxed">
              Instantly pauses all automated and human settlements across the organization.
              Enforced server-side at the policy evaluation gate.
            </p>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-ink">
                Status: {settings.killSwitchActive ? "ARMED (HALTED)" : "DISARMED (ACTIVE)"}
              </span>
              <button
                disabled
                className={`px-3 py-1.5 rounded-md text-xs font-semibold ${
                  settings.killSwitchActive
                    ? "bg-danger text-white"
                    : "bg-canvas text-ink-muted border border-border"
                }`}
              >
                Owner Toggle
              </button>
            </div>
          </div>
        </div>

        {/* Policy Thresholds & Vendors (7 Columns) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Policy Parameters */}
          <div className="rounded-xl border border-border bg-surface shadow-card p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Sliders className="w-4 h-4 text-navy" />
              <h2 className="text-sm font-semibold text-ink">Deterministic Spending Parameters</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-canvas border border-border space-y-1">
                <span className="text-ink-muted">3-Way Match Price Tolerance</span>
                <div className="font-mono font-bold text-ink text-sm">
                  {settings.priceToleranceBps / 100}% ({settings.priceToleranceBps} bps)
                </div>
                <p className="text-[11px] text-ink-muted">Max acceptable variance between PO and Invoice unit price.</p>
              </div>

              <div className="p-3 rounded-lg bg-canvas border border-border space-y-1">
                <span className="text-ink-muted">Human Approval Threshold</span>
                <div className="font-mono font-bold text-ink text-sm">
                  {formatUsdc(usdcAtomic(settings.requireApprovalAbove))}
                </div>
                <p className="text-[11px] text-ink-muted">Invoices above this sum require explicit human sign-off.</p>
              </div>

              <div className="p-3 rounded-lg bg-canvas border border-border space-y-1">
                <span className="text-ink-muted">Operating Reserve Floor</span>
                <div className="font-mono font-bold text-ink text-sm">
                  {formatUsdc(usdcAtomic(settings.minReserveUsdc))}
                </div>
                <p className="text-[11px] text-ink-muted">Minimum treasury balance preserved for ongoing payroll & ops.</p>
              </div>

              <div className="p-3 rounded-lg bg-canvas border border-border space-y-1">
                <span className="text-ink-muted">Aggregate Daily Spending Cap</span>
                <div className="font-mono font-bold text-ink text-sm">
                  {formatUsdc(usdcAtomic(settings.dailyLimitUsdc))}
                </div>
                <p className="text-[11px] text-ink-muted">Maximum cumulative settlements permitted per 24h rolling period.</p>
              </div>
            </div>
          </div>

          {/* Approved Vendors List */}
          <div className="rounded-xl border border-border bg-surface shadow-card overflow-hidden">
            <div className="px-5 py-3.5 bg-canvas border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-navy" />
                <h2 className="text-sm font-semibold text-ink">Authorized Beneficiaries & Whitelisted Wallets</h2>
              </div>
              <span className="text-xs font-mono text-ink-muted">{org?.vendors.length || 0} Vendors</span>
            </div>

            <div className="divide-y divide-border">
              {org?.vendors.map((vendor) => (
                <div key={vendor.id} className="p-4 hover:bg-canvas/40 transition-colors flex items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-ink">{vendor.name}</span>
                      <span className="text-[10px] bg-success-light text-success border border-success-border px-1.5 py-0.2 rounded font-semibold uppercase">
                        {vendor.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-ink-muted font-medium">Authorized Wallet:</span>
                      <HashView hash={vendor.walletAddress} truncate={true} />
                    </div>
                  </div>

                  <div className="text-right whitespace-nowrap">
                    <span className="text-ink-muted block text-[11px]">Vendor Limit:</span>
                    <span className="font-mono font-bold text-ink">
                      {formatUsdc(usdcAtomic(vendor.perVendorLimitUsdc))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
