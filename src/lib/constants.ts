import type { DepositNetwork } from "./types";

export const SITE_NAME = "Coin500";

export const WALLET_ADDRESS =
  process.env.NEXT_PUBLIC_EVM_WALLET_ADDRESS ??
  process.env.EVM_WALLET_ADDRESS ??
  "";

export const SOL_WALLET_ADDRESS =
  process.env.NEXT_PUBLIC_SOL_WALLET_ADDRESS ??
  process.env.SOL_WALLET_ADDRESS ??
  "";

export const SESSION_KEY = "coin500_session";

export const DEPOSIT_NETWORKS: DepositNetwork[] = [
  { id: "solana", name: "Solana", symbol: "SOL", kind: "solana" },
  { id: "eth", name: "Ethereum", symbol: "ETH", kind: "evm" },
  { id: "bnb", name: "BNB Chain", symbol: "BNB", kind: "evm" },
  { id: "base", name: "Base", symbol: "ETH", kind: "evm" },
  { id: "arb", name: "Arbitrum", symbol: "ETH", kind: "evm" },
  { id: "op", name: "Optimism", symbol: "ETH", kind: "evm" },
  { id: "polygon", name: "Polygon", symbol: "MATIC", kind: "evm" },
  { id: "avax", name: "Avalanche C-Chain", symbol: "AVAX", kind: "evm" },
  { id: "linea", name: "Linea", symbol: "ETH", kind: "evm" },
  { id: "scroll", name: "Scroll", symbol: "ETH", kind: "evm" },
  { id: "zksync", name: "zkSync Era", symbol: "ETH", kind: "evm" },
  { id: "mantle", name: "Mantle", symbol: "MNT", kind: "evm" },
  { id: "blast", name: "Blast", symbol: "ETH", kind: "evm" },
  { id: "hype", name: "HyperEVM", symbol: "HYPE", kind: "evm" },
  { id: "fantom", name: "Fantom", symbol: "FTM", kind: "evm" },
  { id: "cronos", name: "Cronos", symbol: "CRO", kind: "evm" },
];

export function getDepositAddress(network: DepositNetwork): string {
  return network.kind === "solana" ? SOL_WALLET_ADDRESS : WALLET_ADDRESS;
}

export const SPREAD_BPS = 8;
