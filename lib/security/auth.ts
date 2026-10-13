import crypto from "crypto";

/**
 * Validates the owner passcode for sensitive operations (payment execution, settings update, kill-switch).
 *
 * Rules:
 * 1. Mainnet only: on testnet/staging, returns authorized: true.
 * 2. On mainnet, OWNER_PASSCODE env var is strictly required. If missing, refuses the operation.
 * 3. Constant-time comparison via crypto.timingSafeEqual on SHA-256 digests (eliminates length/timing leaks).
 * 4. Never logs, prints, or exposes the passcode or its hash.
 */
export function verifyOwnerPasscode(suppliedPasscode: unknown): {
  authorized: boolean;
  status?: number;
  error?: string;
} {
  const networkMode = process.env.NEXT_PUBLIC_NETWORK_MODE || process.env.NETWORK_MODE;
  const isMainnet = networkMode === "mainnet";

  // Non-mainnet environments do not require owner passcode
  if (!isMainnet) {
    return { authorized: true };
  }

  const expectedPasscode = process.env.OWNER_PASSCODE;
  if (!expectedPasscode || expectedPasscode.trim() === "") {
    return {
      authorized: false,
      status: 401,
      error: "OWNER_PASSCODE is not configured on Arc Mainnet. Operation refused.",
    };
  }

  if (typeof suppliedPasscode !== "string" || suppliedPasscode.trim() === "") {
    return {
      authorized: false,
      status: 401,
      error: "Owner passcode is required to execute actions on Arc Mainnet.",
    };
  }

  try {
    const hashSupplied = crypto.createHash("sha256").update(suppliedPasscode).digest();
    const hashExpected = crypto.createHash("sha256").update(expectedPasscode).digest();

    const isMatch = crypto.timingSafeEqual(hashSupplied, hashExpected);
    if (!isMatch) {
      return {
        authorized: false,
        status: 401,
        error: "Unauthorized: Invalid owner passcode.",
      };
    }

    return { authorized: true };
  } catch {
    return {
      authorized: false,
      status: 401,
      error: "Unauthorized: Failed to verify owner passcode.",
    };
  }
}
