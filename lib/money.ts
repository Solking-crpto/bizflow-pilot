/**
 * BizFlow Pilot — Strict Money & Currency Utilities
 * 
 * ARC NETWORK DUAL-DECIMAL RULES:
 * 1. ERC-20 USDC Token Interface: 6 Decimals (Atomic unit = 1e-6 USDC)
 * 2. Native Gas Balance (eth_getBalance): 18 Decimals (Atomic unit = 1e-18 USDC)
 * 
 * Branded types ensure compiler-enforced separation between token amounts and native gas.
 * Floats are strictly prohibited for financial calculations.
 */

// Branded types
export type UsdcAtomic = bigint & { readonly __brand: unique symbol };
export type NativeGasAtomic = bigint & { readonly __brand: unique symbol };

export const USDC_DECIMALS = 6;
export const NATIVE_GAS_DECIMALS = 18;

const USDC_SCALE = 10n ** BigInt(USDC_DECIMALS); // 1,000,000n
const NATIVE_GAS_SCALE = 10n ** BigInt(NATIVE_GAS_DECIMALS); // 1,000,000,000,000,000,000n

/**
 * Cast a validated bigint to UsdcAtomic (6 decimals)
 */
export function usdcAtomic(rawBigInt: bigint): UsdcAtomic {
  return rawBigInt as UsdcAtomic;
}

/**
 * Cast a validated bigint to NativeGasAtomic (18 decimals)
 */
export function nativeGasAtomic(rawBigInt: bigint): NativeGasAtomic {
  return rawBigInt as NativeGasAtomic;
}

/**
 * Parses a decimal string (or number) into UsdcAtomic (6 decimals).
 * Example: "1250.5" -> 1250500000n
 */
export function parseUsdc(input: string | number): UsdcAtomic {
  const str = typeof input === "number" ? input.toFixed(USDC_DECIMALS) : input.trim();
  if (!str || isNaN(Number(str))) {
    throw new Error(`Invalid USDC amount string: "${input}"`);
  }

  const [integerPart, fractionalPart = ""] = str.split(".");
  const cleanFraction = fractionalPart.padEnd(USDC_DECIMALS, "0").slice(0, USDC_DECIMALS);
  const total = BigInt(integerPart) * USDC_SCALE + BigInt(cleanFraction);
  return usdcAtomic(total);
}

/**
 * Formats UsdcAtomic into a human-readable display string with thousands separators.
 * Example: 1250500000n -> "1,250.50 USDC"
 */
export function formatUsdc(amount: UsdcAtomic, includeSymbol = true): string {
  const isNegative = amount < 0n;
  const absAmount = isNegative ? -amount : amount;
  const integerPart = absAmount / USDC_SCALE;
  const fractionalPart = (absAmount % USDC_SCALE).toString().padStart(USDC_DECIMALS, "0");

  const formattedInt = integerPart.toLocaleString("en-US");
  const formattedFraction = fractionalPart.slice(0, 2); // 2 standard display decimals for currency

  const result = `${isNegative ? "-" : ""}${formattedInt}.${formattedFraction}`;
  return includeSymbol ? `${result} USDC` : result;
}

/**
 * Parses native gas amount into NativeGasAtomic (18 decimals)
 */
export function parseNativeGas(input: string | number): NativeGasAtomic {
  const str = typeof input === "number" ? input.toString() : input.trim();
  if (!str || isNaN(Number(str))) {
    throw new Error(`Invalid Native Gas amount string: "${input}"`);
  }

  const [integerPart, fractionalPart = ""] = str.split(".");
  const cleanFraction = fractionalPart.padEnd(NATIVE_GAS_DECIMALS, "0").slice(0, NATIVE_GAS_DECIMALS);
  const total = BigInt(integerPart) * NATIVE_GAS_SCALE + BigInt(cleanFraction);
  return nativeGasAtomic(total);
}

/**
 * Formats NativeGasAtomic into a human-readable string.
 */
export function formatNativeGas(amount: NativeGasAtomic, decimals = 4): string {
  const isNegative = amount < 0n;
  const absAmount = isNegative ? -amount : amount;
  const integerPart = absAmount / NATIVE_GAS_SCALE;
  const fractionalPart = (absAmount % NATIVE_GAS_SCALE).toString().padStart(NATIVE_GAS_DECIMALS, "0");

  const formattedInt = integerPart.toLocaleString("en-US");
  const formattedFraction = fractionalPart.slice(0, decimals);

  return `${isNegative ? "-" : ""}${formattedInt}.${formattedFraction} gas-USDC`;
}

/**
 * Converts Native Gas (18 decimals) to standard ERC-20 USDC (6 decimals)
 * Safely truncates the lowest 12 decimal places.
 */
export function gasToUsdc(gasAmount: NativeGasAtomic): UsdcAtomic {
  const conversionDivisor = 10n ** 12n; // 18 - 6 = 12
  return usdcAtomic(BigInt(gasAmount) / conversionDivisor);
}

/**
 * Converts ERC-20 USDC (6 decimals) to Native Gas equivalent (18 decimals)
 */
export function usdcToGas(usdcAmount: UsdcAtomic): NativeGasAtomic {
  const conversionMultiplier = 10n ** 12n;
  return nativeGasAtomic(BigInt(usdcAmount) * conversionMultiplier);
}

/**
 * Arithmetic safety helpers for UsdcAtomic
 */
export const UsdcMath = {
  add(a: UsdcAtomic, b: UsdcAtomic): UsdcAtomic {
    return usdcAtomic(BigInt(a) + BigInt(b));
  },
  sub(a: UsdcAtomic, b: UsdcAtomic): UsdcAtomic {
    return usdcAtomic(BigInt(a) - BigInt(b));
  },
  multiplyBps(a: UsdcAtomic, bps: bigint): UsdcAtomic {
    // Basis points multiplication (1 bps = 0.01% = 1/10000)
    return usdcAtomic((BigInt(a) * bps) / 10000n);
  },
  percentageDiffBps(reference: UsdcAtomic, candidate: UsdcAtomic): bigint {
    if (reference === 0n) return candidate === 0n ? 0n : 10000n;
    const diff = candidate > reference ? candidate - reference : reference - candidate;
    return (BigInt(diff) * 10000n) / BigInt(reference);
  },
  isGreaterThan(a: UsdcAtomic, b: UsdcAtomic): boolean {
    return BigInt(a) > BigInt(b);
  },
  isLessThan(a: UsdcAtomic, b: UsdcAtomic): boolean {
    return BigInt(a) < BigInt(b);
  },
  isEqual(a: UsdcAtomic, b: UsdcAtomic): boolean {
    return BigInt(a) === BigInt(b);
  },
};
