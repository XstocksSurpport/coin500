import { NextRequest, NextResponse } from "next/server";
import type { Candle } from "@/lib/types";
import { syntheticCandles, type ChartInterval } from "@/lib/chart";

const BINANCE_ENDPOINTS = [
  "https://data-api.binance.vision/api/v3/klines",
  "https://api.binance.com/api/v3/klines",
];

function sortCandles(candles: Candle[]): Candle[] {
  return [...candles].sort((a, b) => a.time - b.time);
}

async function fetchBinanceKlines(
  pair: string,
  interval: string,
): Promise<Candle[] | null> {
  for (const base of BINANCE_ENDPOINTS) {
    try {
      const url = `${base}?symbol=${pair}&interval=${interval}&limit=300`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;
      const rows: (string | number)[][] = await res.json();
      return sortCandles(
        rows.map((r) => ({
          time: Math.floor(Number(r[0]) / 1000),
          open: parseFloat(String(r[1])),
          high: parseFloat(String(r[2])),
          low: parseFloat(String(r[3])),
          close: parseFloat(String(r[4])),
          volume: parseFloat(String(r[5])),
        })),
      );
    } catch {
      /* next */
    }
  }
  return null;
}

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol") ?? "BTC";
  const market = req.nextUrl.searchParams.get("market") ?? "secondary";
  const interval = (req.nextUrl.searchParams.get("interval") ??
    "1h") as ChartInterval;
  const priceParam = req.nextUrl.searchParams.get("price");
  const mid = priceParam ? parseFloat(priceParam) : 100;

  if (market === "secondary") {
    const pair = symbol.endsWith("USDT") ? symbol : `${symbol}USDT`;
    const candles = await fetchBinanceKlines(pair, interval);
    if (candles && candles.length > 0) {
      return NextResponse.json({ source: "binance", candles });
    }
  }

  return NextResponse.json({
    source: "synthetic",
    candles: syntheticCandles(mid, interval),
  });
}
