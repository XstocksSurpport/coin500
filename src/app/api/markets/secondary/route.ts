import { NextResponse } from "next/server";
import type { Instrument } from "@/lib/types";
import { secondaryLogoUrl } from "@/lib/token-icons";

const BINANCE_ENDPOINTS = [
  "https://data-api.binance.vision/api/v3/ticker/24hr",
  "https://api.binance.com/api/v3/ticker/24hr",
];

const STABLE_OR_FIAT = new Set([
  "USDC",
  "USDT",
  "BUSD",
  "TUSD",
  "FDUSD",
  "DAI",
  "EUR",
  "GBP",
  "AUD",
  "BRL",
]);

const LEVERAGED_SUFFIX = /(UP|DOWN|BULL|BEAR)$/;

interface BinanceTicker {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  highPrice: string;
  lowPrice: string;
  quoteVolume: string;
}

const PRIORITY_BASES = [
  "BTC",
  "ETH",
  "SOL",
  "BNB",
  "XRP",
  "ADA",
  "DOGE",
  "AVAX",
  "DOT",
  "LINK",
  "MATIC",
  "POL",
  "LTC",
  "BCH",
  "ATOM",
  "UNI",
  "NEAR",
  "APT",
  "SUI",
  "ARB",
  "OP",
  "FIL",
  "INJ",
  "TIA",
  "SEI",
  "ICP",
  "ETC",
  "HBAR",
  "VET",
  "ALGO",
  "SAND",
  "MANA",
  "AXS",
  "EGLD",
  "AAVE",
  "MKR",
  "CRV",
  "RUNE",
  "STX",
  "IMX",
  "GRT",
  "FTM",
  "SNX",
  "COMP",
  "LDO",
  "PEPE",
  "WIF",
  "FET",
  "RENDER",
  "TAO",
];

function toInstrument(t: BinanceTicker): Instrument | null {
  if (!t.symbol.endsWith("USDT")) return null;
  const base = t.symbol.replace(/USDT$/, "");
  if (STABLE_OR_FIAT.has(base)) return null;
  if (LEVERAGED_SUFFIX.test(base)) return null;
  if (base.length > 12) return null;

  const price = parseFloat(t.lastPrice);
  if (!price || price <= 0) return null;

  return {
    id: t.symbol,
    symbol: base,
    name: base,
    logoUrl: secondaryLogoUrl(base),
    change24h: parseFloat(t.priceChangePercent),
    price,
    high24h: parseFloat(t.highPrice),
    low24h: parseFloat(t.lowPrice),
    volume24h: parseFloat(t.quoteVolume),
  };
}

async function fetchTickers(): Promise<BinanceTicker[]> {
  let lastError: Error | null = null;
  for (const url of BINANCE_ENDPOINTS) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    } catch (e) {
      lastError = e instanceof Error ? e : new Error("fetch failed");
    }
  }
  throw lastError ?? new Error("Binance unavailable");
}

export async function GET() {
  try {
    const tickers: BinanceTicker[] = await fetchTickers();
    const mapped = tickers
      .map(toInstrument)
      .filter((x): x is Instrument => x !== null);

    const priorityIndex = new Map(
      PRIORITY_BASES.map((s, i) => [s, i]),
    );

    const sorted = mapped.sort((a, b) => {
      const pa = priorityIndex.get(a.symbol) ?? 999;
      const pb = priorityIndex.get(b.symbol) ?? 999;
      if (pa !== pb) return pa - pb;
      return (b.volume24h ?? 0) - (a.volume24h ?? 0);
    });

    const seen = new Set<string>();
    const instruments: Instrument[] = [];
    for (const item of sorted) {
      if (seen.has(item.symbol)) continue;
      seen.add(item.symbol);
      instruments.push(item);
      if (instruments.length >= 50) break;
    }

    return NextResponse.json({ source: "binance", instruments });
  } catch {
    const fallback: Instrument[] = PRIORITY_BASES.slice(0, 50).map(
      (symbol, i) => ({
        id: `${symbol}USDT`,
        symbol,
        name: symbol,
        logoUrl: secondaryLogoUrl(symbol),
        change24h: (i % 5) - 2,
        price: 100 - i,
        high24h: 102 - i,
        low24h: 98 - i,
        volume24h: 1e9 - i * 1e7,
      }),
    );
    return NextResponse.json({ source: "fallback", instruments: fallback });
  }
}
