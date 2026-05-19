import type { Instrument } from "./types";
import {
  isPrimaryDexChain,
  labelFromDexChain,
  PRIMARY_DEX_CHAINS,
  type PrimaryDexChain,
} from "./primary-chains";

const SEARCH_BY_CHAIN: Record<PrimaryDexChain, string[]> = {
  solana: ["pump", "meme solana", "bonk", "wif solana", "solana pump"],
  ethereum: ["pepe ethereum", "meme eth", "degen eth", "ethereum meme"],
  base: ["brett base", "meme base", "degen base", "base meme"],
  bsc: ["meme bsc", "bnb meme", "pepe bsc", "bsc pump"],
};

const BOOSTS_URL = "https://api.dexscreener.com/token-boosts/top/v1";
const BOOST_PER_CHAIN = 40;

export interface DexPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: { address: string; name: string; symbol: string };
  quoteToken: { address: string; name: string; symbol: string };
  priceUsd?: string;
  priceChange?: { h24?: number; h6?: number; h1?: number };
  volume?: { h24?: number };
  liquidity?: { usd?: number };
  fdv?: number;
  marketCap?: number;
  info?: { imageUrl?: string };
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "User-Agent": "Aegisai/1.0",
    },
  });
  if (!res.ok) throw new Error(`DexScreener ${res.status} ${url}`);
  return res.json();
}

function flattenDexTokenResponse(data: unknown): DexPair[] {
  if (!Array.isArray(data)) {
    if (data && typeof data === "object" && "pairs" in data) {
      const pairs = (data as { pairs?: DexPair[] }).pairs;
      return Array.isArray(pairs) ? pairs : [];
    }
    return data && typeof data === "object" && "baseToken" in data
      ? [data as DexPair]
      : [];
  }

  const out: DexPair[] = [];
  for (const item of data) {
    if (!item || typeof item !== "object") continue;
    if ("pairs" in item && Array.isArray((item as { pairs?: DexPair[] }).pairs)) {
      out.push(...((item as { pairs: DexPair[] }).pairs ?? []));
    } else if ("baseToken" in item) {
      out.push(item as DexPair);
    }
  }
  return out;
}

async function fetchSearchPairsForChain(chain: PrimaryDexChain): Promise<DexPair[]> {
  const pairs: DexPair[] = [];
  for (const q of SEARCH_BY_CHAIN[chain]) {
    try {
      const json = await fetchJson<{ pairs?: DexPair[] }>(
        `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(q)}`,
      );
      for (const p of json.pairs ?? []) {
        if (p.chainId === chain) pairs.push(p);
      }
    } catch {
      /* next query */
    }
  }
  return pairs;
}

async function fetchSearchPairs(): Promise<DexPair[]> {
  const results = await Promise.all(
    PRIMARY_DEX_CHAINS.map((chain) => fetchSearchPairsForChain(chain)),
  );
  return results.flat();
}

async function fetchTokensForChain(
  chain: PrimaryDexChain,
  addresses: string[],
): Promise<DexPair[]> {
  if (!addresses.length) return [];
  const url = `https://api.dexscreener.com/tokens/v1/${chain}/${addresses.join(",")}`;
  try {
    return flattenDexTokenResponse(await fetchJson<unknown>(url));
  } catch {
    return [];
  }
}

async function fetchBoostedPairs(): Promise<DexPair[]> {
  try {
    const boosts = await fetchJson<
      { chainId: string; tokenAddress: string }[]
    >(BOOSTS_URL);

    const byChain = new Map<PrimaryDexChain, string[]>();
    for (const b of boosts) {
      if (!isPrimaryDexChain(b.chainId) || !b.tokenAddress) continue;
      const list = byChain.get(b.chainId) ?? [];
      if (list.length >= BOOST_PER_CHAIN) continue;
      if (!list.includes(b.tokenAddress)) list.push(b.tokenAddress);
      byChain.set(b.chainId, list);
    }

    const fetches = [...byChain.entries()].map(([chain, addrs]) =>
      fetchTokensForChain(chain, addrs),
    );
    return (await Promise.all(fetches)).flat();
  } catch {
    return [];
  }
}

function pickBestPairPerToken(pairs: DexPair[]): DexPair[] {
  const byKey = new Map<string, DexPair>();
  for (const p of pairs) {
    if (!isPrimaryDexChain(p.chainId)) continue;
    const addr = p.baseToken?.address;
    if (!addr) continue;
    const key = `${p.chainId}-${addr}`;
    const existing = byKey.get(key);
    const vol = p.volume?.h24 ?? 0;
    if (!existing || vol > (existing.volume?.h24 ?? 0)) {
      byKey.set(key, p);
    }
  }
  return [...byKey.values()];
}

export function mapDexPairToInstrument(pair: DexPair): Instrument | null {
  if (!isPrimaryDexChain(pair.chainId)) return null;

  const price = parseFloat(pair.priceUsd ?? "0");
  if (!price || price <= 0) return null;

  const chainLabel = labelFromDexChain(pair.chainId);
  const change24h = pair.priceChange?.h24 ?? 0;
  const vol = pair.volume?.h24 ?? 0;
  const swing = Math.abs(price * (change24h / 100)) || price * 0.05;

  return {
    id: `${chainLabel}-${pair.baseToken.address}`,
    symbol: pair.baseToken.symbol,
    name: pair.baseToken.name.trim(),
    logoUrl: pair.info?.imageUrl,
    chain: chainLabel,
    pairAddress: pair.pairAddress,
    change24h,
    price,
    high24h: price + swing,
    low24h: Math.max(price - swing, price * 0.000001),
    volume24h: vol,
  };
}

export async function fetchPrimaryFromDexScreener(): Promise<Instrument[]> {
  const [searchPairs, boostPairs] = await Promise.all([
    fetchSearchPairs(),
    fetchBoostedPairs(),
  ]);

  const merged = pickBestPairPerToken([...boostPairs, ...searchPairs]);

  return merged
    .map(mapDexPairToInstrument)
    .filter((x): x is Instrument => x !== null)
    .sort((a, b) => (b.volume24h ?? 0) - (a.volume24h ?? 0));
}
