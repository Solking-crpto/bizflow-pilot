import { createHash } from "crypto";

/**
 * Computes standard SHA-256 hash of a string or buffer.
 */
export function sha256(content: string | Buffer): string {
  return createHash("sha256").update(content).digest("hex");
}

/**
 * Computes SHA-256 hash formatted as a Solidity bytes32 hex string ("0x" + 64 hex characters)
 */
export function sha256Bytes32(content: string): `0x${string}` {
  return `0x${sha256(content)}` as `0x${string}`;
}

/**
 * Produces canonical, deterministic JSON string with sorted keys
 */
export function canonicalJson(obj: any): string {
  if (obj === null || typeof obj !== "object") {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return `[${obj.map((item) => canonicalJson(item)).join(",")}]`;
  }
  const keys = Object.keys(obj).sort();
  const keyVals = keys.map((key) => `${JSON.stringify(key)}:${canonicalJson(obj[key])}`);
  return `{${keyVals.join(",")}}`;
}
