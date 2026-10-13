import { describe, it, expect } from "vitest";

const APP_URL = process.env.APP_URL || "http://localhost:3001";

describe("P1 Public Endpoints: /api/proof and /api/health", () => {
  it("GET /api/proof returns valid public proof response with cache header", async () => {
    const res = await fetch(`${APP_URL}/api/proof`);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toHaveProperty("status");
    expect(data).toHaveProperty("network");
    expect(data).toHaveProperty("chainId");
    expect(res.headers.get("cache-control")).toContain("public");
  });

  it("GET /api/health responds in less than 2000ms with system diagnostic metrics", async () => {
    const start = Date.now();
    const res = await fetch(`${APP_URL}/api/health`);
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(2000);
    expect([200, 503]).toContain(res.status);

    const data = await res.json();
    expect(["healthy", "degraded"]).toContain(data.status);
    expect(data).toHaveProperty("network");
    expect(data).toHaveProperty("expectedChainId");
    expect(data).toHaveProperty("dbOk");
    expect(data).toHaveProperty("rpcOk");
    expect(data).toHaveProperty("anchorDeployed");
    expect(data).toHaveProperty("latencyMs");
  });
});
