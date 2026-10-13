import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, decodeEventLog } from "viem";
import { getActiveNetwork } from "@/lib/networks";
import { formatUsdc, usdcAtomic } from "@/lib/money";

export const dynamic = "force-dynamic";

const TRANSFER_EVENT_ABI = [
  {
    type: "event",
    name: "Transfer",
    inputs: [
      { name: "from", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "value", type: "uint256", indexed: false },
    ],
  },
] as const;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const txHash = searchParams.get("txHash");

  if (!txHash || !txHash.startsWith("0x")) {
    return NextResponse.json({ error: "Missing or invalid txHash parameter" }, { status: 400 });
  }

  const network = getActiveNetwork();

  try {
    const publicClient = createPublicClient({
      chain: network.chain,
      transport: http(network.rpcUrl, { timeout: 6000 }),
    });

    const [receipt, transaction] = await Promise.all([
      publicClient.getTransactionReceipt({ hash: txHash as `0x${string}` }),
      publicClient.getTransaction({ hash: txHash as `0x${string}` }).catch(() => null),
    ]);

    if (!receipt) {
      return NextResponse.json(
        {
          confirmed: false,
          error: "Transaction receipt not found on Arc RPC",
        },
        { status: 404 }
      );
    }

    let decodedRecipient = transaction?.to || "Unknown";
    let decodedAmountFormatted = "0.50 USDC";

    // 1. Try decoding ERC-20 Transfer event
    let transferLogFound = false;
    for (const log of receipt.logs) {
      try {
        const decoded = decodeEventLog({
          abi: TRANSFER_EVENT_ABI,
          data: log.data,
          topics: log.topics,
        });

        if (decoded.eventName === "Transfer") {
          decodedRecipient = decoded.args.to;
          // ERC-20 USDC uses 6 decimals
          decodedAmountFormatted = formatUsdc(usdcAtomic(decoded.args.value));
          transferLogFound = true;
          break;
        }
      } catch {
        // Not a Transfer event log
      }
    }

    // 2. If no ERC-20 Transfer log, check native value (Arc uses USDC as native token with 18 decimals)
    if (!transferLogFound && transaction && transaction.value > 0n) {
      const wholePart = transaction.value / 10n ** 18n;
      const fracPart = (transaction.value % 10n ** 18n) / 10n ** 12n;
      const formatted = `${wholePart.toString()}.${fracPart.toString().padStart(6, "0").slice(0, 2)}`;
      decodedAmountFormatted = `${formatted} USDC`;
    }

    return NextResponse.json({
      confirmed: receipt.status === "success",
      status: receipt.status,
      blockNumber: Number(receipt.blockNumber),
      gasUsed: receipt.gasUsed.toString(),
      recipient: decodedRecipient,
      amount: decodedAmountFormatted,
      network: network.name,
      chainId: network.chainId,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        confirmed: false,
        error: err.message || "Failed to query Arc RPC",
      },
      { status: 502 }
    );
  }
}
