import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Acceptance Test 9: Secret Leakage & Boundary Audit", () => {
  it("verifies that client components do not import private keys or server-only modules", () => {
    const componentsDir = path.join(__dirname, "..", "components");
    const files: string[] = [];

    function walk(dir: string) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(fullPath);
        else if (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts")) files.push(fullPath);
      }
    }

    walk(componentsDir);

    for (const file of files) {
      const content = fs.readFileSync(file, "utf8");
      // Check for forbidden secret identifiers
      expect(content).not.toContain("TREASURY_PRIVATE_KEY");
      expect(content).not.toContain("CIRCLE_ENTITY_SECRET");
      expect(content).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
    }
  });

  it("verifies that .env.example contains only dummy placeholders and zero live secrets", () => {
    const envExample = fs.readFileSync(path.join(__dirname, "..", ".env.example"), "utf8");
    expect(envExample).toContain('TREASURY_PRIVATE_KEY="0x0000000000000000000000000000000000000000000000000000000000000001"');
    expect(envExample).not.toContain("ghp_");
    expect(envExample).not.toContain("sk-ant-");
    expect(envExample).not.toContain("AIzaSy");
  });
});
