"use client";

import { useMemo, useState } from "react";
import { X, ChevronDown } from "lucide-react";
import { ModalOverlay } from "./ModalOverlay";
import type { Instrument } from "@/lib/types";
import {
  TRADE_STRATEGIES,
  TRADING_AGENTS,
  type TradeStrategy,
} from "@/lib/agents";
import { formatPrice } from "@/lib/format";
import type { MarketType } from "@/lib/types";

interface TradeModalProps {
  open: boolean;
  instrument: Instrument | null;
  market: "primary" | "secondary" | "watchlist";
  onClose: () => void;
  onSubmit: (payload: {
    strategy: TradeStrategy;
    agentId: string;
    rangeLowPct: number;
    rangeHighPct: number;
  }) => void;
}

export function TradeModal({
  open,
  instrument,
  market,
  onClose,
  onSubmit,
}: TradeModalProps) {
  const [strategy, setStrategy] = useState<TradeStrategy>("long");
  const [agentId, setAgentId] = useState(TRADING_AGENTS[0].id);
  const [rangeLow, setRangeLow] = useState(20);
  const [rangeHigh, setRangeHigh] = useState(80);

  const prices = useMemo(() => {
    if (!instrument) return null;
    const low = instrument.low24h;
    const high = instrument.high24h;
    const span = high - low || instrument.price * 0.1;
    const lowPct = Math.max(5, Math.min(rangeLow, rangeHigh - 1));
    const highPct = Math.min(95, Math.max(rangeHigh, lowPct + 1));
    return {
      lowPct,
      highPct,
      entryLow: low + (span * lowPct) / 100,
      entryHigh: low + (span * highPct) / 100,
    };
  }, [instrument, rangeLow, rangeHigh]);

  if (!open || !instrument) return null;

  const handleSubmit = () => {
    if (!prices) return;
    onSubmit({
      strategy,
      agentId,
      rangeLowPct: prices.lowPct,
      rangeHighPct: prices.highPct,
    });
    onClose();
  };

  const mkt: "primary" | "secondary" =
    market === "primary" ? "primary" : "secondary";

  return (
    <ModalOverlay onClose={onClose}>
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#e8ecf1] px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-[#1a1d21]">
              Agent{"\u4ea4\u6613"}
            </h2>
            <p className="text-sm text-[#6b7280]">{instrument.symbol}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-[#6b7280] hover:bg-[#f0f3f7]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5 px-5 py-5">
          <Field label={"\u7b56\u7565"}>
            <SelectWrap>
              <select
                value={strategy}
                onChange={(e) => setStrategy(e.target.value as TradeStrategy)}
                className={selectClass}
              >
                {TRADE_STRATEGIES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </SelectWrap>
          </Field>

          <Field label={"Agent \u6a21\u578b"}>
            <SelectWrap>
              <select
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                className={selectClass}
              >
                {TRADING_AGENTS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} · {a.provider}
                  </option>
                ))}
              </select>
            </SelectWrap>
          </Field>

          <Field label={"\u4ef7\u683c\u533a\u95f4 (5% - 95%)"}>
            <div className="space-y-4 rounded-lg border border-[#e8ecf1] bg-[#f8fafc] px-4 py-4">
              <div>
                <div className="mb-1 flex justify-between text-xs text-[#6b7280]">
                  <span>{"\u4e0b\u754c"} {prices?.lowPct}%</span>
                  <span className="font-mono text-[#1f2937]">
                    {prices ? formatPrice(prices.entryLow, mkt) : "—"}
                  </span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={94}
                  value={rangeLow}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setRangeLow(v);
                    if (v >= rangeHigh) setRangeHigh(Math.min(95, v + 1));
                  }}
                  className="w-full accent-[#0051ff]"
                />
              </div>
              <div>
                <div className="mb-1 flex justify-between text-xs text-[#6b7280]">
                  <span>{"\u4e0a\u754c"} {prices?.highPct}%</span>
                  <span className="font-mono text-[#1f2937]">
                    {prices ? formatPrice(prices.entryHigh, mkt) : "—"}
                  </span>
                </div>
                <input
                  type="range"
                  min={6}
                  max={95}
                  value={rangeHigh}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setRangeHigh(v);
                    if (v <= rangeLow) setRangeLow(Math.max(5, v - 1));
                  }}
                  className="w-full accent-[#0051ff]"
                />
              </div>
              <div className="relative h-2 rounded-full bg-gradient-to-r from-[#e53935] via-[#f0f3f7] to-[#00a651]">
                <div
                  className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-white bg-[#0051ff] shadow"
                  style={{ left: `${prices?.lowPct ?? 20}%` }}
                />
                <div
                  className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-white bg-[#0051ff] shadow"
                  style={{ left: `${prices?.highPct ?? 80}%` }}
                />
              </div>
            </div>
          </Field>

          <button
            type="button"
            onClick={handleSubmit}
            className="w-full rounded-lg bg-[#0051ff] py-2.5 text-sm font-semibold text-white hover:bg-[#0046dd]"
          >
            {"\u786e\u8ba4Agent\u4ea4\u6613"}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[#374151]">
        {label}
      </label>
      {children}
    </div>
  );
}

function SelectWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af]"
        size={18}
      />
    </div>
  );
}

const selectClass =
  "w-full appearance-none rounded-lg border border-[#d1d9e6] bg-white py-2.5 pl-4 pr-10 text-sm text-[#1f2937] outline-none focus:border-[#0051ff] focus:ring-2 focus:ring-[#0051ff]/20";
