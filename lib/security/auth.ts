import crypto from "crypto";

// In-memory sliding-window rate limiter: client identifier -> timestamps of failed attempts
const failedAttemptsMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const MAX_FAILED_ATTEMPTS = 5;

export function checkRateLimit(key: string): {
  allowed: boolean;
  remainingAttempts: number;
  retryAfterSeconds?: number;
} {
  const now = Date.now();
  const timestamps = (failedAttemptsMap.get(key) || []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  failedAttemptsMap.set(key, timestamps);

  if (timestamps.length >= MAX_FAILED_ATTEMPTS) {
    const oldest = timestamps[0];
    const retryAfterSeconds = Math.max(1, Math.ceil((oldest + RATE_LIMIT_WINDOW_MS - now) / 1000));
    return {
      allowed: false,
      remainingAttempts: 0,
      retryAfterSeconds,
    };
  }

  return {
    allowed: true,
    remainingAttempts: MAX_FAILED_ATTEMPTS - timestamps.length,
  };
}

export function recordFailedAttempt(key: string): void {
  const now = Date.now();
  const timestamps = (failedAttemptsMap.get(key) || []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  timestamps.push(now);
  failedAttemptsMap.set(key, timestamps);
}

export function resetFailedAttempts(key: string): void {
  failedAttemptsMap.delete(key);
}

export function clearAllRateLimits(): void {
  failedAttemptsMap.clear();
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || "127.0.0.1";
}

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

/**
 * Enforces both sliding-window rate limiting (max 5 failed attempts in 5 minutes)
 * and constant-time owner passcode verification.
 */
export function verifyOwnerPasscodeWithRateLimit(
  suppliedPasscode: unknown,
  clientKey: string
): {
  authorized: boolean;
  status?: number;
  error?: string;
  retryAfterSeconds?: number;
} {
  const networkMode = process.env.NEXT_PUBLIC_NETWORK_MODE || process.env.NETWORK_MODE;
  const isMainnet = networkMode === "mainnet";

  if (!isMainnet) {
    return { authorized: true };
  }

  const limit = checkRateLimit(clientKey);
  if (!limit.allowed) {
    return {
      authorized: false,
      status: 429,
      error: `Too many failed passcode attempts. Please wait ${limit.retryAfterSeconds} seconds before retrying.`,
      retryAfterSeconds: limit.retryAfterSeconds,
    };
  }

  const result = verifyOwnerPasscode(suppliedPasscode);
  if (!result.authorized) {
    recordFailedAttempt(clientKey);
  } else {
    resetFailedAttempts(clientKey);
  }

  return result;
}
