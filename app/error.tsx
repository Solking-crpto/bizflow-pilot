"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log sanitized error message without sensitive parameters
    console.error("BizFlow Application Error:", error.message);
  }, [error]);

  const isDatabaseError =
    error.message?.includes("database") ||
    error.message?.includes("Prisma") ||
    error.message?.includes("timed out") ||
    error.message?.includes("connection");

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-bold text-white mb-2">
          {isDatabaseError ? "Database Connection Stalled" : "Something Went Wrong"}
        </h2>

        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          {isDatabaseError
            ? "The system encountered a database network timeout. BizFlow Pilot has safe offline fallbacks enabled, or you can retry now."
            : error.message || "An unexpected error occurred while processing this page view."}
        </p>

        {error.digest && (
          <div className="mb-6 p-2 rounded-lg bg-slate-950 text-xs font-mono text-slate-500 border border-slate-800">
            Error Digest: {error.digest}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition shadow-lg shadow-blue-600/20"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition border border-slate-700"
          >
            <Home className="w-4 h-4" />
            Command Center
          </Link>
        </div>
      </div>
    </div>
  );
}
