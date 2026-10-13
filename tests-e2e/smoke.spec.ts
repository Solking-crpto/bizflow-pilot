import { test, expect } from "@playwright/test";

const ROUTES = [
  { path: "/", name: "Command Center" },
  { path: "/inventory", name: "Inventory & POs" },
  { path: "/invoices", name: "Invoice Desk" },
  { path: "/agent", name: "AI Agent" },
  { path: "/payments", name: "Payment Desk" },
  { path: "/audit", name: "Audit Ledger" },
  { path: "/simulator", name: "Policy Simulator" },
  { path: "/settings", name: "Rules & Settings" },
  { path: "/about", name: "About Architecture" },
  { path: "/verify/demo", name: "Public Passport" },
];

test.describe("P0-A Playwright Navigation & Interactive Smoke Suite", () => {
  test("visits every route without 5xx or unhandled console errors", async ({ page }) => {
    test.setTimeout(90000);
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        const text = msg.text();
        if (text.includes("favicon.ico") || text.includes("404")) return;
        consoleErrors.push(`[Console Error at ${page.url()}]: ${text}`);
      }
    });
    page.on("pageerror", (err) => {
      consoleErrors.push(`[Page Error at ${page.url()}]: ${err.message}`);
    });

    for (const route of ROUTES) {
      const response = await page.goto(route.path, { waitUntil: "domcontentloaded" });
      expect(response, `No response for ${route.path}`).not.toBeNull();
      expect(response!.status(), `Route ${route.path} returned status ${response!.status()}`).toBe(200);

      // Verify page body is visible
      await expect(page.locator("body")).toBeVisible();
    }

    expect(consoleErrors, `Encountered console errors: ${consoleErrors.join("; ")}`).toEqual([]);
  });

  test("tests primary action buttons and interactions on Command Center", async ({ page }) => {
    await page.goto("/");
    
    // Check navigation buttons in main header
    await expect(page.locator("main").getByRole("link", { name: "Process Invoices" })).toBeVisible();
    await expect(page.locator("main").getByRole("link", { name: "Payment Desk" })).toBeVisible();
    await expect(page.locator("main").getByRole("link", { name: "Inspect Hash Chain" })).toBeVisible();

    // Click Process Invoices
    await page.locator("main").getByRole("link", { name: "Process Invoices" }).click();
    await page.waitForURL("**/invoices");
    expect(page.url()).toContain("/invoices");
  });

  test("tests Invoice Desk tabs and interactive controls", async ({ page }) => {
    await page.goto("/invoices");

    // Click filter tabs
    await page.getByRole("button", { name: /Verified/i }).click();
    await page.getByRole("button", { name: /Needs Review/i }).click();
    await page.getByRole("button", { name: /Blocked/i }).click();
    await page.getByRole("button", { name: /All Invoices/i }).click();

    // Verify sub-action links
    await expect(page.locator("main").getByRole("link", { name: "Consult AI Agent" })).toBeVisible();
    await expect(page.locator("main").getByRole("link", { name: "Ask AI Agent" })).toBeVisible();
    await expect(page.locator("main").getByRole("link", { name: "Go to Payment Desk" })).toBeVisible();
  });

  test("tests Audit Ledger Verify Chain and Export JSON buttons", async ({ page }) => {
    await page.goto("/audit");

    const verifyBtn = page.getByRole("button", { name: /Verify Chain/i });
    await expect(verifyBtn).toBeVisible();
    await verifyBtn.click();

    // Wait for cryptographic verification banner
    await expect(page.locator("text=Cryptographic Chain Verified")).toBeVisible({ timeout: 5000 });

    const exportBtn = page.getByRole("button", { name: /Export/i });
    await expect(exportBtn).toBeVisible();
  });

  test("tests Settings Save and Emergency Kill Switch controls", async ({ page }) => {
    await page.goto("/settings");

    // Verify and click Kill Switch button
    const killSwitchBtn = page.getByRole("button", { name: /Kill Switch/i });
    await expect(killSwitchBtn).toBeVisible();
    await killSwitchBtn.click();

    // Verify Save Settings button
    const saveBtn = page.getByRole("button", { name: /Save Settings/i });
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();

    // Verify success banner appears
    await expect(page.locator("text=Policy settings updated and verified")).toBeVisible({ timeout: 5000 });
  });

  test("tests Policy Simulator interactive controls", async ({ page }) => {
    await page.goto("/simulator");

    // Check selectors exist and decision banner is active
    await expect(page.locator("select").first()).toBeVisible();
    await expect(page.locator("text=Engine Decision Outcome")).toBeVisible();
  });
});
