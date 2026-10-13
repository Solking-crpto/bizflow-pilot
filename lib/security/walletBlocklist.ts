/**
 * Known-Public Test Wallet Blocklist
 * 
 * Contains default accounts from Hardhat, Anvil, Foundry, and Ganache that have
 * publicly known private keys.
 * 
 * Policy rule:
 * - On Arc Mainnet: Any destination address in this blocklist is strictly BLOCKED.
 * - On Arc Testnet: Triggers a warning / review flag.
 */

export const HARDHAT_ANVIL_BLOCKLIST: ReadonlySet<string> = new Set([
  "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266", // Account #0
  "0x70997970c51812dc3a010c7d01b50e0d17dc79c8", // Account #1
  "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc", // Account #2
  "0x90f79bf6eb2c4f870365e785982e1f101e93b906", // Account #3
  "0x15d34aaf54267db7d7c367839aaf71a00a2c6a65", // Account #4
  "0x9965507d1a55bcc2695c58ba16fb37d819b0a4dc", // Account #5
  "0x976ea74026e72cd5554282bf94fe62479e44e99c", // Account #6
  "0xdafea492d9c6733ae3d56b7ed1adb60692c98bc5", // Account #7
  "0xdd2fd4581271e230360230f9337d5c0430bf44c0", // Account #8
  "0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199", // Account #9
  "0x2546bcd3c84621e976d8185a91a922ae77ecec30", // Account #10
  "0xbda5747bfd65f08deb54cb465eb87d40e51b197e", // Account #11
]);

export function isBlocklistedWallet(address?: string | null): boolean {
  if (!address) return false;
  return HARDHAT_ANVIL_BLOCKLIST.has(address.trim().toLowerCase());
}

/**
 * Returns the configured vendor wallet address.
 * On mainnet, uses process.env.VENDOR_WALLET_ADDRESS if available.
 * If not set or on testnet, defaults to the demo testnet address.
 */
export function getSeededVendorWallet(networkMode: "testnet" | "mainnet" = "testnet"): string {
  if (networkMode === "mainnet") {
    const envWallet = process.env.VENDOR_WALLET_ADDRESS;
    if (envWallet && /^0x[0-9a-fA-F]{40}$/.test(envWallet.trim())) {
      return envWallet.trim();
    }
  }
  return "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
}
