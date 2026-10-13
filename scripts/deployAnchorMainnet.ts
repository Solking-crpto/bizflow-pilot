import fs from "fs";
import path from "path";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arcMainnetChain } from "../lib/networks";

async function main() {
  console.log("================================================================");
  console.log("      BizFlow Pilot — Deploy AuditAnchor.sol to Arc Mainnet     ");
  console.log("================================================================");

  const hasYesFlag = process.argv.includes("--yes");

  if (!hasYesFlag) {
    console.error("\n[SAFETY ABORT]: Missing mandatory '--yes' flag.");
    console.error("In accordance with hackathon safety guardrails, mainnet transactions");
    console.error("will never be broadcast without an explicit user authorization.\n");
    console.error("To authorize deployment on Arc Mainnet, run:");
    console.error("  npm run deploy:anchor:mainnet -- --yes\n");
    process.exit(1);
  }

  const rawKey = process.env.TREASURY_PRIVATE_KEY;
  if (!rawKey || !rawKey.startsWith("0x")) {
    console.error("[ERROR]: TREASURY_PRIVATE_KEY is missing or invalid in environment.");
    process.exit(1);
  }

  const rpcUrl = process.env.ARC_MAINNET_RPC_URL || "https://rpc.mainnet.arc.io";
  const account = privateKeyToAccount(rawKey as `0x${string}`);

  console.log(`Deployer / Treasury Public EOA: ${account.address}`);
  console.log(`Target RPC Endpoint: ${rpcUrl}`);
  console.log(`Target Chain: Arc Mainnet (ID 5042)`);

  const publicClient = createPublicClient({
    chain: arcMainnetChain,
    transport: http(rpcUrl, { timeout: 10000 }),
  });

  const walletClient = createWalletClient({
    account,
    chain: arcMainnetChain,
    transport: http(rpcUrl, { timeout: 15000 }),
  });

  // 1. Gas Balance Check
  console.log("\nChecking deployer native gas balance on Arc...");
  let gasBalance = 0n;
  try {
    gasBalance = await publicClient.getBalance({ address: account.address });
  } catch (err: any) {
    console.error(`[ERROR]: Failed to query gas balance: ${err.message}`);
    process.exit(1);
  }

  console.log(`Native Gas Balance: ${gasBalance.toString()} wei (USDC Native Gas)`);

  if (gasBalance === 0n) {
    console.error("\n[ERROR]: Deployer account has 0 Arc native gas.");
    console.error("Please fund account " + account.address + " with native USDC on Arc Mainnet.");
    process.exit(1);
  }

  // 2. Load Compiled Contract Artifact
  const artifactPath = path.join(__dirname, "../artifacts/contracts/AuditAnchor.json");
  if (!fs.existsSync(artifactPath)) {
    console.error("[ERROR]: Artifact not found at " + artifactPath);
    console.error("Please run: npm run compile:contracts");
    process.exit(1);
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  console.log("\nBroadcasting deployment transaction to Arc Mainnet...");

  const hash = await walletClient.deployContract({
    abi: artifact.abi,
    bytecode: artifact.bytecode,
  });

  console.log(`Deployment Transaction Hash: ${hash}`);
  console.log("Waiting for receipt confirmation on Arc blockchain...");

  const receipt = await publicClient.waitForTransactionReceipt({
    hash,
    confirmations: 1,
    timeout: 45000,
  });

  if (receipt.status !== "success" || !receipt.contractAddress) {
    console.error("[ERROR]: Deployment transaction reverted or contract address missing.");
    process.exit(1);
  }

  const contractAddress = receipt.contractAddress;
  console.log(`\n================================================================`);
  console.log(`  AUDIT ANCHOR CONTRACT DEPLOYED SUCCESSFULLY!`);
  console.log(`  Contract Address : ${contractAddress}`);
  console.log(`  Block Number     : ${receipt.blockNumber}`);
  console.log(`  Gas Used         : ${receipt.gasUsed}`);
  console.log(`================================================================\n`);

  // 3. Save to docs/MAINNET_DEPLOYMENT.json
  const deploymentRecord = {
    network: "Arc Mainnet",
    chainId: 5042,
    contract: "AuditAnchor",
    address: contractAddress,
    deployer: account.address,
    txHash: hash,
    blockNumber: Number(receipt.blockNumber),
    deployedAt: new Date().toISOString(),
  };

  const docsDir = path.join(__dirname, "../docs");
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });

  const recordPath = path.join(docsDir, "MAINNET_DEPLOYMENT.json");
  fs.writeFileSync(recordPath, JSON.stringify(deploymentRecord, null, 2));
  console.log(`Saved deployment record to: docs/MAINNET_DEPLOYMENT.json`);
}

main().catch((err) => {
  console.error("Deployment failed:", err);
  process.exit(1);
});
