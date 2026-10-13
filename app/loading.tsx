import React from "react";

export default function Loading() {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 py-6 animate-pulse">
      {/* Skeleton Header */}
      <div className="h-8 bg-border/60 rounded-lg w-1/3" />
      <div className="h-4 bg-border/40 rounded w-1/2" />

      {/* Skeleton KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-surface rounded-xl border border-border p-4 space-y-3">
            <div className="h-4 bg-canvas rounded w-1/2" />
            <div className="h-6 bg-border/50 rounded w-3/4" />
          </div>
        ))}
      </div>

      {/* Skeleton Content Block */}
      <div className="h-64 bg-surface rounded-xl border border-border p-6 mt-6" />
    </div>
  );
}
