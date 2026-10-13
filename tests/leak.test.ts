import { describe, it, expect } from "vitest";

const APP_URL = process.env.APP_URL || "http://localhost:3001";

const ROUTES = [
  "/",
  "/judges",
  "/inventory",
  "/invoices",
  "/agent",
  "/payments",
  "/audit",
  "/simulator",
  "/settings",
  "/about",
  "/verify/demo",
];

describe("P0-B Security: Secret & Credential Leakage Prevention Test", () => {
  ROUTES.forEach((route) => {
    it(`verifies rendered HTML at ${route} contains no secrets or connection strings`, async () => {
      const res = await fetch(`${APP_URL}${route}`);
      expect(res.status).toBe(200);

      const html = await res.text();

      // Assert forbidden strings are completely absent from client HTML
      expect(html).not.toMatch(/postgres:\/\//i);
      expect(html).not.toMatch(/postgresql:\/\//i);
      expect(html).not.toContain("PRIVATE_KEY");

      // Treasury private key if present in process.env must never leak
      const rawTreasuryKey = process.env.TREASURY_PRIVATE_KEY;
      if (rawTreasuryKey && rawTreasuryKey.length > 20) {
        expect(html).not.toContain(rawTreasuryKey);
      }

      // Supabase / DB secrets
      expect(html).not.toContain("supabase.co:6543");
      expect(html).not.toContain("pooler.supabase.com");
    });
  });
});
