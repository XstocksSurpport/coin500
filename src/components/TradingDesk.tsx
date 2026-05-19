"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { MarketTable } from "./MarketTable";
import { ChartPanel } from "./ChartPanel";
import { LoginModal } from "./modals/LoginModal";
import { DepositModal } from "./modals/DepositModal";
import { TradeModal } from "./modals/TradeModal";
import type { Instrument, MarketType } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { fetchPrimaryFromDexScreener } from "@/lib/dexscreener";
import { isPrimaryChainLabel } from "@/lib/primary-chains";
import { getWatchlist } from "@/lib/watchlist";
import { TRADING_AGENTS, TRADE_STRATEGIES } from "@/lib/agents";

export function TradingDesk() {
  const { user } = useAuth();
  const [market, setMarket] = useState<MarketType>("secondary");
  const [allInstruments, setAllInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Instrument | null>(null);
  const [search, setSearch] = useState("");
  const [loginOpen, setLoginOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [tradeOpen, setTradeOpen] = useState(false);
  const [tradeTarget, setTradeTarget] = useState<Instrument | null>(null);
  const [watchTick, setWatchTick] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2800);
  }, []);

  useEffect(() => {
    const loadBoth = async () => {
      try {
        const [p, s] = await Promise.all([
          fetchPrimaryFromDexScreener().catch(() => [] as Instrument[]),
          fetch("/api/markets/secondary")
            .then((r) => r.json())
            .then((j) => (j.instruments ?? []) as Instrument[])
            .catch(() => [] as Instrument[]),
        ]);
        const map = new Map<string, Instrument>();
        for (const i of [...p, ...s]) map.set(i.id, i);
        setAllInstruments([...map.values()]);
      } catch {
        setAllInstruments([]);
      }
    };
    loadBoth();
  }, []);

  useEffect(() => {
    if (market === "watchlist") {
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        let list: Instrument[] = [];
        if (market === "primary") {
          list = await fetchPrimaryFromDexScreener();
          if (list.length === 0) {
            const res = await fetch("/api/markets/primary");
            const json = await res.json();
            list = json.instruments ?? [];
          }
        } else {
          const res = await fetch("/api/markets/secondary");
          const json = await res.json();
          list = json.instruments ?? [];
        }
        setAllInstruments(list);
        setSelected((prev) => {
          if (prev && list.find((i) => i.id === prev.id)) return prev;
          return list[0] ?? null;
        });
      } catch {
        setAllInstruments([]);
        setSelected(null);
      } finally {
        setLoading(false);
      }
    };
    load();
    const id = window.setInterval(load, 60000);
    return () => clearInterval(id);
  }, [market]);

  const instruments = useMemo(() => {
    if (market !== "watchlist") return allInstruments;
    const ids = new Set(getWatchlist());
    return allInstruments.filter((i) => ids.has(i.id));
  }, [market, allInstruments, watchTick]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return instruments;
    return instruments.filter(
      (i) =>
        i.symbol.toLowerCase().includes(q) ||
        i.name.toLowerCase().includes(q),
    );
  }, [instruments, search]);

  const chartMarket: "primary" | "secondary" =
    market === "watchlist"
      ? isPrimaryChainLabel(selected?.chain)
        ? "primary"
        : "secondary"
      : market === "primary"
        ? "primary"
        : "secondary";

  const guardTrade = useCallback((): boolean => {
    if (!user) {
      showToast("\u8bf7\u5148\u767b\u5f55");
      setLoginOpen(true);
      return false;
    }
    if (!user.deposited || user.balance <= 0) {
      showToast("\u8bf7\u5148\u5145\u503c");
      setDepositOpen(true);
      return false;
    }
    return true;
  }, [user, showToast]);

  const openTrade = useCallback(
    (item: Instrument) => {
      if (!guardTrade()) return;
      setTradeTarget(item);
      setSelected(item);
      setTradeOpen(true);
    },
    [guardTrade],
  );

  const marketTitle =
    market === "primary"
      ? "\u4e00\u7ea7\u5e02\u573a"
      : market === "secondary"
        ? "\u4e8c\u7ea7\u5e02\u573a"
        : "\u81ea\u9009";

  return (
    <div className="flex h-screen flex-col bg-[#f5f7f9]">
      <Header
        onLogin={() => setLoginOpen(true)}
        onDeposit={() => {
          if (!user) {
            setLoginOpen(true);
            return;
          }
          setDepositOpen(true);
        }}
        search={search}
        onSearchChange={setSearch}
      />

      <div className="flex min-h-0 flex-1">
        <Sidebar market={market} onMarketChange={setMarket} />

        <main className="flex min-w-0 flex-1 flex-col gap-3 p-3">
          <h1 className="px-1 text-base font-semibold text-[#1f2937]">
            {marketTitle}
          </h1>

          <div className="flex min-h-0 flex-[1.1] flex-col">
            <MarketTable
              instruments={filtered}
              market={market}
              selectedId={selected?.id ?? null}
              onSelect={setSelected}
              onTrade={openTrade}
              onWatchChange={() => setWatchTick((t) => t + 1)}
              loading={loading}
            />
          </div>

          <div className="min-h-[300px] flex-1">
            <ChartPanel
              instrument={selected}
              market={chartMarket}
              onTrade={() => selected && openTrade(selected)}
            />
          </div>
        </main>
      </div>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      <DepositModal open={depositOpen} onClose={() => setDepositOpen(false)} />
      <TradeModal
        open={tradeOpen}
        instrument={tradeTarget}
        market={chartMarket}
        onClose={() => setTradeOpen(false)}
        onSubmit={(payload) => {
          const agent = TRADING_AGENTS.find((a) => a.id === payload.agentId);
          const strat = TRADE_STRATEGIES.find((s) => s.id === payload.strategy);
          showToast(
            `${tradeTarget?.symbol} \u00b7 ${strat?.label} \u00b7 ${agent?.name} \u00b7 ${payload.rangeLowPct}%-${payload.rangeHighPct}%`,
          );
        }}
      />

      {toast && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-lg bg-[#1f2937] px-5 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
