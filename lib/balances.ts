import { createPublicClient, http, parseAbi } from "viem";
import { formatUsdc, usdcAtomic } from "./money";
import { getTreasuryPublicAddress } from "./treasury";
import { getActiveNetwork } from "./networks";

const ERC20_ABI = parseAbi([
  "function balanceOf(address owner) view returns (uint256)",
]);

export interface TreasuryBalanceResult {
  usdcFormatted: string;
  usdcAtomicValue: bigint;
  gasFormatted: string;
  gasAtomicValue: bigint;
  isLive: boolean;
  error?: string;
}

/**
 * Fetches real on-chain balances for the treasury wallet on Arc Mainnet,
 * preventing hardcoded balances in production mode.
 */
export async function getTreasuryBalances(): Promise<TreasuryBalanceResult> {
  const network = getActiveNetwork();
  const isMainnet = network.mode === "mainnet";

  if (!isMainnet) {
    return {
      usdcFormatted: "100,000.00",
      usdcAtomicValue: 100_000_000_000n,
      gasFormatted: "10.0000",
      gasAtomicValue: 10_000_000_000_000_000_000n,
      isLive: false,
    };
  }

  const treasuryAddress = getTreasuryPublicAddress();
  if (!treasuryAddress || treasuryAddress === "0x0000000000000000000000000000000000000000") {
    return {
      usdcFormatted: "0.00",
      usdcAtomicValue: 0n,
      gasFormatted: "0.0000",
      gasAtomicValue: 0n,
      isLive: true,
      error: "Treasury address not derived",
    };
  }

  try {
    const rpcUrl = process.env.ARC_MAINNET_RPC_URL || "https://rpc.mainnet.arc.io";
    const usdcAddress = (process.env.ARC_MAINNET_USDC_ADDRESS || "0x3600000000000000000000000000000000000000") as `0x${string}`;

    const client = createPublicClient({
      chain: network.chain,
      transport: http(rpcUrl, { timeout: 4000 }),
    });

    const [gasBalance, usdcBalance] = await Promise.all([
      client.getBalance({ address: treasuryAddress as `0x${string}` }),
      client.readContract({
        address: usdcAddress,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [treasuryAddress as `0x${string}`],
      }) as Promise<bigint>,
    ]);

    return {
      usdcFormatted: formatUsdc(usdcAtomic(usdcBalance)),
      usdcAtomicValue: usdcBalance,
      gasFormatted: (Number(gasBalance) / 1e18).toFixed(4),
      gasAtomicValue: gasBalance,
      isLive: true,
    };
  } catch (err: any) {
    return {
      usdcFormatted: "0.00",
      usdcAtomicValue: 0n,
      gasFormatted: "0.0000",
      gasAtomicValue: 0n,
      isLive: true,
      error: err.message || "Failed to fetch on-chain balances",
    };
  }
}
