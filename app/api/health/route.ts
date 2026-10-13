import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getActiveNetwork } from "@/lib/networks";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  const network = getActiveNetwork();
  const anchorAddress =
    process.env.AUDIT_ANCHOR_ADDRESS ||
    process.env.NEXT_PUBLIC_AUDIT_ANCHOR_ADDRESS ||
    "0x2b18fe9d3a63710da242092571744520ea8effe0";

  let dbOk = false;
  let rpcOk = false;
  let anchorDeployed = false;
  let rpcChainId: number | null = null;
  let latencyMs = 0;

  // DB check with 1.5s timeout
  const dbPromise = (async () => {
    try {
      await Promise.race([
        prisma.$queryRaw`SELECT 1`,
        new Promise((_, reject) => setTimeout(() => reject(new Error("DB timeout")), 1500)),
      ]);
      return true;
    } catch {
      return false;
    }
  })();

  // RPC & Contract Bytecode check with 1.5s timeout
  const rpcPromise = (async () => {
    try {
      const res = await fetch(network.rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([
          { jsonrpc: "2.0", method: "eth_chainId", params: [], id: 1 },
          { jsonrpc: "2.0", method: "eth_getCode", params: [anchorAddress, "latest"], id: 2 },
        ]),
        signal: AbortSignal.timeout(1500),
      });

      if (!res.ok) return { rpcOk: false, chainId: null, hasCode: false };
      const data = await res.json();
      if (Array.isArray(data)) {
        const chainRes = data.find((r: any) => r.id === 1);
        const codeRes = data.find((r: any) => r.id === 2);

        const idNum = chainRes?.result ? parseInt(chainRes.result, 16) : null;
        const code = codeRes?.result || "0x";
        const hasCode = code !== "0x" && code !== "0x0" && code.length > 2;

        return {
          rpcOk: idNum === network.chainId,
          chainId: idNum,
          hasCode,
        };
      }
      return { rpcOk: false, chainId: null, hasCode: false };
    } catch {
      return { rpcOk: false, chainId: null, hasCode: false };
    }
  })();

  const [dbResult, rpcResult] = await Promise.all([dbPromise, rpcPromise]);
  dbOk = dbResult;
  rpcOk = rpcResult.rpcOk;
  rpcChainId = rpcResult.chainId;
  anchorDeployed = Boolean(anchorAddress && rpcResult.hasCode);

  latencyMs = Date.now() - startTime;
  const isHealthy = dbOk && rpcOk;

  const payload = {
    status: isHealthy ? "healthy" : "degraded",
    network: network.mode,
    networkName: network.name,
    expectedChainId: network.chainId,
    actualChainId: rpcChainId,
    dbOk,
    rpcOk,
    anchorDeployed,
    anchorAddress,
    latencyMs,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(payload, {
    status: isHealthy ? 200 : 503,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
