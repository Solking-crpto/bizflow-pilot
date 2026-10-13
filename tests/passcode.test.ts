import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { verifyOwnerPasscode } from "../lib/security/auth";
import { getDbTimeoutMs } from "../lib/db";

describe("Owner Passcode & Database Timeout Enforcement", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe("DB_TIMEOUT_MS Configuration", () => {
    it("defaults to 15000ms when DB_TIMEOUT_MS is not set", () => {
      delete process.env.DB_TIMEOUT_MS;
      expect(getDbTimeoutMs()).toBe(15000);
    });

    it("respects custom DB_TIMEOUT_MS when provided", () => {
      process.env.DB_TIMEOUT_MS = "25000";
      expect(getDbTimeoutMs()).toBe(25000);
    });

    it("falls back to 15000ms when DB_TIMEOUT_MS is invalid or negative", () => {
      process.env.DB_TIMEOUT_MS = "invalid";
      expect(getDbTimeoutMs()).toBe(15000);

      process.env.DB_TIMEOUT_MS = "-500";
      expect(getDbTimeoutMs()).toBe(15000);
    });
  });

  describe("Mainnet Owner Passcode Authorization", () => {
    it("allows operations on testnet without owner passcode", () => {
      process.env.NEXT_PUBLIC_NETWORK_MODE = "testnet";
      const result = verifyOwnerPasscode(undefined);
      expect(result.authorized).toBe(true);
    });

    it("refuses mainnet operations if OWNER_PASSCODE is not configured", () => {
      process.env.NEXT_PUBLIC_NETWORK_MODE = "mainnet";
      delete process.env.OWNER_PASSCODE;

      const result = verifyOwnerPasscode("some_code");
      expect(result.authorized).toBe(false);
      expect(result.status).toBe(401);
      expect(result.error).toContain("OWNER_PASSCODE is not configured");
    });

    it("refuses mainnet operations if supplied passcode is missing or empty", () => {
      process.env.NEXT_PUBLIC_NETWORK_MODE = "mainnet";
      process.env.OWNER_PASSCODE = "SuperSecurePasscode123";

      const resultEmpty = verifyOwnerPasscode("");
      expect(resultEmpty.authorized).toBe(false);
      expect(resultEmpty.status).toBe(401);

      const resultUndefined = verifyOwnerPasscode(undefined);
      expect(resultUndefined.authorized).toBe(false);
      expect(resultUndefined.status).toBe(401);
    });

    it("rejects invalid passcode with 401 using constant-time comparison", () => {
      process.env.NEXT_PUBLIC_NETWORK_MODE = "mainnet";
      process.env.OWNER_PASSCODE = "SuperSecurePasscode123";

      const result = verifyOwnerPasscode("WrongPasscode");
      expect(result.authorized).toBe(false);
      expect(result.status).toBe(401);
      expect(result.error).toContain("Invalid owner passcode");
    });

    it("authorizes valid passcode on mainnet", () => {
      process.env.NEXT_PUBLIC_NETWORK_MODE = "mainnet";
      process.env.OWNER_PASSCODE = "SuperSecurePasscode123";

      const result = verifyOwnerPasscode("SuperSecurePasscode123");
      expect(result.authorized).toBe(true);
    });
  });
});
