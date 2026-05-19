/** DexScreener chain ids we treat as primary (一级市场). */
export const PRIMARY_DEX_CHAINS = [
  "solana",
  "ethereum",
  "base",
  "bsc",
] as const;

export type PrimaryDexChain = (typeof PRIMARY_DEX_CHAINS)[number];

/** Short label shown in UI (e.g. table badge). */
export const DEX_CHAIN_TO_LABEL: Record<PrimaryDexChain, string> = {
  solana: "solana",
  ethereum: "eth",
  base: "base",
  bsc: "bnb",
};

/** GeckoTerminal network slug for OHLCV. */
export const DEX_CHAIN_TO_GECKO: Record<PrimaryDexChain, string> = {
  solana: "solana",
  ethereum: "eth",
  base: "base",
  bsc: "bsc",
};

const LABEL_TO_DEX: Record<string, PrimaryDexChain> = {
  solana: "solana",
  eth: "ethereum",
  ethereum: "ethereum",
  base: "base",
  bnb: "bsc",
  bsc: "bsc",
};

export function isPrimaryDexChain(chainId: string): chainId is PrimaryDexChain {
  return (PRIMARY_DEX_CHAINS as readonly string[]).includes(chainId);
}

export function labelFromDexChain(chainId: PrimaryDexChain): string {
  return DEX_CHAIN_TO_LABEL[chainId];
}

export function dexChainFromLabel(label?: string): PrimaryDexChain | null {
  if (!label) return null;
  return LABEL_TO_DEX[label.toLowerCase()] ?? null;
}

export function isPrimaryChainLabel(label?: string): boolean {
  return label != null && label.toLowerCase() in LABEL_TO_DEX;
}

export function geckoNetworkFromLabel(label?: string): string {
  const dex = dexChainFromLabel(label);
  return dex ? DEX_CHAIN_TO_GECKO[dex] : "solana";
}

export function parsePrimaryInstrumentId(
  id: string,
): { label: string; address: string } | null {
  const dash = id.indexOf("-");
  if (dash <= 0) return null;
  return {
    label: id.slice(0, dash),
    address: id.slice(dash + 1),
  };
}
