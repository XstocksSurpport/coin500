import type { Candle, Instrument, MarketType } from "./types";
import {
  geckoNetworkFromLabel,
  parsePrimaryInstrumentId,
} from "./primary-chains";

export type ChartInterval =
  | "1m"
  | "5m"
  | "15m"
  | "1h"
  | "4h"
  | "1d"
  | "1w";

interface GeckoOhlcv {
  data: {
    attributes: {
      ohlcv_list: (number | string)[][];
    };
  };
}

interface DexPairBrief {
  pairAddress?: string;
  volume?: { h24?: number };
  chainId?: string;
}

function sortCandles(candles: Candle[]): Candle[] {
  const map = new Map<number, Candle>();
  for (const c of candles) {
    if (!Number.isFinite(c.time) || c.time <= 0) continue;
    map.set(c.time, c);
  }
  return [...map.values()].sort((a, b) => a.time - b.time);
}

function mapGeckoInterval(interval: ChartInterval): {
  timeframe: string;
  aggregate: number;
} {
  switch (interval) {
    case "1m":
      return { timeframe: "minute", aggregate: 1 };
    case "5m":
      return { timeframe: "minute", aggregate: 5 };
    case "15m":
      return { timeframe: "minute", aggregate: 15 };
    case "1h":
      return { timeframe: "hour", aggregate: 1 };
    case "4h":
      return { timeframe: "hour", aggregate: 4 };
    case "1d":
      return { timeframe: "day", aggregate: 1 };
    case "1w":
      return { timeframe: "day", aggregate: 7 };
    default:
      return { timeframe: "hour", aggregate: 1 };
  }
}

function parseGeckoOhlcv(json: GeckoOhlcv): Candle[] {
  const list = json?.data?.attributes?.ohlcv_list ?? [];
  return sortCandles(
    list.map((row) => ({
      time: Number(row[0]),
      open: Number(row[1]),
      high: Number(row[2]),
      low: Number(row[3]),
      close: Number(row[4]),
      volume: Number(row[5]),
    })),
  );
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

const DEX_API_CHAIN: Record<string, string> = {
  solana: "solana",
  eth: "ethereum",
  base: "base",
  bnb: "bsc",
};

export async function resolvePoolAddress(
  chainLabel: string,
  tokenAddress: string,
): Promise<string | null> {
  const dexChain = DEX_API_CHAIN[chainLabel] ?? chainLabel;
  const url = `https://api.dexscreener.com/tokens/v1/${dexChain}/${tokenAddress}`;
  const data = await fetchJson<DexPairBrief | DexPairBrief[]>(url);
  const pairs = Array.isArray(data) ? data : [data];
  const best = pairs
    .filter((p) => p?.pairAddress)
    .sort((a, b) => (b.volume?.h24 ?? 0) - (a.volume?.h24 ?? 0))[0];
  return best?.pairAddress ?? null;
}

export async function fetchPrimaryCandles(
  instrument: Instrument,
  interval: ChartInterval,
): Promise<Candle[]> {
  const parsed = parsePrimaryInstrumentId(instrument.id);
  const chainLabel = parsed?.label ?? instrument.chain ?? "solana";
  const tokenAddress = parsed?.address ?? instrument.id;

  const pool =
    instrument.pairAddress ??
    (await resolvePoolAddress(chainLabel, tokenAddress));

  if (!pool) {
    return syntheticCandles(instrument.price, interval);
  }

  const network = geckoNetworkFromLabel(chainLabel);
  const { timeframe, aggregate } = mapGeckoInterval(interval);
  const url = `https://api.geckoterminal.com/api/v2/networks/${network}/pools/${pool}/ohlcv/${timeframe}?aggregate=${aggregate}&limit=300`;

  try {
    const json = await fetchJson<GeckoOhlcv>(url);
    const candles = parseGeckoOhlcv(json);
    if (candles.length >= 5) return candles;
  } catch {
    /* fallback */
  }

  return syntheticCandles(instrument.price, interval);
}

export async function fetchSecondaryCandles(
  symbol: string,
  interval: ChartInterval,
): Promise<Candle[]> {
  const q = new URLSearchParams({
    symbol,
    market: "secondary",
    interval,
  });
  const res = await fetch(`/api/markets/chart?${q}`);
  if (!res.ok) throw new Error("chart api failed");
  const json = await res.json();
  return sortCandles(json.candles ?? []);
}

export async function fetchCandles(
  instrument: Instrument,
  market: MarketType,
  interval: ChartInterval,
): Promise<Candle[]> {
  if (market === "primary") {
    return fetchPrimaryCandles(instrument, interval);
  }
  return fetchSecondaryCandles(instrument.symbol, interval);
}

function intervalSeconds(interval: ChartInterval): number {
  const map: Record<ChartInterval, number> = {
    "1m": 60,
    "5m": 300,
    "15m": 900,
    "1h": 3600,
    "4h": 14400,
    "1d": 86400,
    "1w": 604800,
  };
  return map[interval];
}

export function syntheticCandles(
  mid: number,
  interval: ChartInterval,
  count = 200,
): Candle[] {
  const out: Candle[] = [];
  let price = mid * 0.92;
  const step = intervalSeconds(interval);
  const now = Math.floor(Date.now() / 1000);

  for (let i = count; i >= 0; i--) {
    const drift = (Math.random() - 0.48) * mid * 0.012;
    const open = price;
    const close = Math.max(price + drift, mid * 0.00001);
    const high = Math.max(open, close) * (1 + Math.random() * 0.006);
    const low = Math.min(open, close) * (1 - Math.random() * 0.006);
    out.push({
      time: now - i * step,
      open,
      high,
      low,
      close,
      volume: Math.random() * mid * 1000,
    });
    price = close;
  }
  return sortCandles(out);
}
