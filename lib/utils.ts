import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Truncates an EVM address or hash cleanly: e.g. 0x12ab...9fE3
 */
export function truncateHash(hash?: string | null, start = 6, end = 4): string {
  if (!hash) return "—";
  if (hash.length <= start + end) return hash;
  return `${hash.slice(0, start)}…${hash.slice(-end)}`;
}

/**
 * Safe JSON serializer for bigints and cryptographic hashes
 */
export function safeJsonStringify(data: any, space?: number): string {
  return JSON.stringify(
    data,
    (_, value) => (typeof value === "bigint" ? value.toString() : value),
    space
  );
}
