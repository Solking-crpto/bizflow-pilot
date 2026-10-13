import { describe, it, expect } from "vitest";
import {
  parseUsdc,
  formatUsdc,
  parseNativeGas,
  formatNativeGas,
  gasToUsdc,
  usdcToGas,
  UsdcMath,
  USDC_DECIMALS,
  NATIVE_GAS_DECIMALS,
} from "../lib/money";

describe("lib/money - Arc USDC & Gas Precision", () => {
  it("enforces 6 decimals for ERC-20 USDC", () => {
    const amount = parseUsdc("1250.00");
    expect(amount).toBe(1250000000n);
    expect(formatUsdc(amount)).toBe("1,250.00 USDC");
  });

  it("handles fractional USDC without float inaccuracies", () => {
    const amount = parseUsdc("0.999999");
    expect(amount).toBe(999999n);
    expect(formatUsdc(amount)).toBe("0.99 USDC");

    const tiny = parseUsdc("0.01");
    expect(tiny).toBe(10000n);
    expect(formatUsdc(tiny)).toBe("0.01 USDC");
  });

  it("enforces 18 decimals for Native Gas", () => {
    const gas = parseNativeGas("1.5");
    expect(gas).toBe(1500000000000000000n);
    expect(formatNativeGas(gas)).toBe("1.5000 gas-USDC");
  });

  it("correctly converts between native gas (18dp) and ERC-20 (6dp)", () => {
    // 2.5 USDC in gas units (18 decimals)
    const gas = parseNativeGas("2.5");
    const usdc = gasToUsdc(gas);
    expect(usdc).toBe(2500000n);
    expect(formatUsdc(usdc)).toBe("2.50 USDC");

    // Convert back to gas units
    const gasBack = usdcToGas(usdc);
    expect(gasBack).toBe(gas);
  });

  it("calculates basis points differences accurately for policy tolerance checks", () => {
    const base = parseUsdc("100.00"); // 100,000,000n
    const withinTolerance = parseUsdc("100.80"); // 0.8% difference = 80 bps
    const outOfTolerance = parseUsdc("101.50"); // 1.5% difference = 150 bps

    const diff1 = UsdcMath.percentageDiffBps(base, withinTolerance);
    expect(diff1).toBe(80n); // 0.8% <= 1.0% (100 bps)

    const diff2 = UsdcMath.percentageDiffBps(base, outOfTolerance);
    expect(diff2).toBe(150n); // 1.5% > 100 bps
  });

  it("performs safe arithmetic operations without precision loss", () => {
    const a = parseUsdc("500.25");
    const b = parseUsdc("250.75");
    const sum = UsdcMath.add(a, b);
    expect(sum).toBe(751000000n);
    expect(formatUsdc(sum)).toBe("751.00 USDC");

    const diff = UsdcMath.sub(a, b);
    expect(diff).toBe(249500000n);
    expect(formatUsdc(diff)).toBe("249.50 USDC");
  });
});
