import { privateKeyToAccount } from "viem/accounts";

/**
 * Returns the derived public EVM address for the treasury wallet.
 * Under no circumstances does this ever return or expose the private key.
 */
export function getTreasuryPublicAddress(): string {
  try {
    const rawKey = process.env.TREASURY_PRIVATE_KEY;
    if (rawKey) {
      const formatted = (rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`) as `0x${string}`;
      if (formatted.length === 66 && /^0x[0-9a-fA-F]{64}$/.test(formatted)) {
        const account = privateKeyToAccount(formatted);
        return account.address;
      }
    }
  } catch {
    // Graceful fallback to default development address
  }
  return "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
}

/**
 * Returns a strictly sanitized provider name ('direct' or 'circle').
 * Defends against any accidental leakage if an environment variable is misconfigured.
 */
export function getSanitizedPaymentProvider(): "direct" | "circle" {
  const p = (process.env.PAYMENT_PROVIDER || "").toLowerCase().trim();
  if (p === "circle") return "circle";
  return "direct";
}
