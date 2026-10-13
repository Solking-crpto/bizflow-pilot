import "server-only";

import { PaymentProvider } from "./types";
import { DirectEvmProvider } from "./directEvmProvider";
import { CircleWalletsProvider } from "./circleProvider";

/**
 * Returns the configured payment settlement provider
 */
export function getPaymentProvider(): PaymentProvider {
  const networkMode = (process.env.NEXT_PUBLIC_NETWORK_MODE || "testnet") as "testnet" | "mainnet";
  const selectedProvider = process.env.PAYMENT_PROVIDER || "direct";

  if (selectedProvider === "circle") {
    return new CircleWalletsProvider(networkMode);
  }

  return new DirectEvmProvider(networkMode);
}
