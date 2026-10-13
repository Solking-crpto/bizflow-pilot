"use client";

import React from "react";
import { Building2, Search, Bell, UserCheck } from "lucide-react";
import { NetworkBadge } from "./NetworkBadge";

interface TopNavProps {
  networkMode: "testnet" | "mainnet";
  orgName?: string;
  userEmail?: string;
  userRole?: string;
}

export function TopNav({
  networkMode,
  orgName = "BuildPro Infrastructure Ltd",
  userEmail = "finance@buildpro.internal",
  userRole = "owner",
}: TopNavProps) {
  return (
    <header className="h-14 border-b border-border bg-surface px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Org Selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-border bg-canvas hover:bg-canvas-subtle transition-colors cursor-pointer">
          <Building2 className="w-4 h-4 text-navy" />
          <span className="text-xs font-semibold text-ink tracking-tight">{orgName}</span>
          <span className="text-[10px] uppercase font-mono px-1 py-0.2 bg-brand-light text-brand-teal rounded font-bold">
            Verified
          </span>
        </div>

        {/* Global Network Badge */}
        <NetworkBadge mode={networkMode} />
      </div>

      {/* Global Actions */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative w-64 hidden md:block">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 transform -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            placeholder="Search PO, invoice #, hash..."
            className="w-full pl-8 pr-3 py-1 text-xs rounded-md border border-border bg-canvas focus:bg-white focus:outline-none focus:border-navy transition-colors font-mono"
            readOnly
          />
        </div>

        {/* User Account / Demo Owner status */}
        <div className="flex items-center gap-2 pl-2 border-l border-border">
          <div className="w-7 h-7 rounded-full bg-navy/10 flex items-center justify-center text-navy font-semibold text-xs border border-navy/20">
            BP
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-medium text-ink leading-tight">{userEmail}</span>
            <span className="text-[10px] font-mono text-ink-muted uppercase">Role: {userRole}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
