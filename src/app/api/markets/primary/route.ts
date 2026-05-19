import { NextResponse } from "next/server";
import type { Instrument } from "@/lib/types";
import { fetchPrimaryFromDexScreener } from "@/lib/dexscreener";

const AVE_TRENDING =
  "https://prod.ave-api.com/v2/tokens/trending?chain=solana&page_size=100";
const AVE_MEME_RANK = "https://prod.ave-api.com/v2/ranks?topic=meme&limit=100";

interface AveToken {
  token: string;
  symbol: string;
  name: string;
  current_price_usd: string;
  token_price_change_24h?: string;
  price_change_24h?: string;
  logo_url?: string;
  chain: string;
  token_tx_volume_usd_24h?: string;
  tx_volume_u_24h?: string;
}

function mapAveToken(t: AveToken): Instrument {
  const price = parseFloat(t.current_price_usd) || 0;
  const change = parseFloat(
    t.token_price_change_24h ?? t.price_change_24h ?? "0",
  );
  const vol = parseFloat(
    t.token_tx_volume_usd_24h ?? t.tx_volume_u_24h ?? "0",
  );
  const swing = Math.max(price * 0.08, price * 0.01);
  return {
    id: `${t.chain}-${t.token}`,
    symbol: t.symbol,
    name: t.name,
    logoUrl: t.logo_url || undefined,
    chain: t.chain,
    change24h: change,
    price,
    high24h: price + swing,
    low24h: Math.max(price - swing, price * 0.001),
    volume24h: vol,
  };
}

async function fetchFromAve(apiKey: string): Promise<Instrument[]> {
  const endpoints = [AVE_MEME_RANK, AVE_TRENDING];
  const merged = new Map<string, Instrument>();

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        headers: { "X-API-KEY": apiKey },
        cache: "no-store",
      });
      if (!res.ok) continue;
      const json = await res.json();
      const raw: AveToken[] = Array.isArray(json?.data)
        ? json.data
        : (json?.data?.tokens ?? []);
      for (const t of raw) {
        const inst = mapAveToken(t);
        if (inst.price > 0) merged.set(inst.id, inst);
      }
    } catch {
      /* try next */
    }
  }

  return [...merged.values()];
}

function mergeInstruments(...lists: Instrument[][]): Instrument[] {
  const map = new Map<string, Instrument>();
  for (const list of lists) {
    for (const item of list) {
      const existing = map.get(item.id);
      if (!existing || (item.volume24h ?? 0) > (existing.volume24h ?? 0)) {
        map.set(item.id, item);
      }
    }
  }
  return [...map.values()].sort(
    (a, b) => (b.volume24h ?? 0) - (a.volume24h ?? 0),
  );
}

export async function GET() {
  let dexList: Instrument[] = [];
  try {
    dexList = await fetchPrimaryFromDexScreener();
  } catch (e) {
    const message = e instanceof Error ? e.message : "fetch failed";
    console.error("[primary] dexscreener", message);
  }

  const apiKey = process.env.AVE_API_KEY;
  let aveList: Instrument[] = [];
  if (apiKey) {
    try {
      aveList = await fetchFromAve(apiKey);
    } catch {
      /* optional */
    }
  }

  const instruments = mergeInstruments(dexList, aveList);

  if (instruments.length > 0) {
    return NextResponse.json({
      source: dexList.length ? "dexscreener" : "ave",
      count: instruments.length,
      instruments,
    });
  }

  return NextResponse.json(
    { error: "No primary market data", instruments: [] },
    { status: 502 },
  );
}
