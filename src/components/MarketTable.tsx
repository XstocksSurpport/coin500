"use client";

import { useEffect, useState } from "react";
import { BarChart2, Bell, Info, Star } from "lucide-react";
import type { Instrument, MarketType } from "@/lib/types";
import { formatChange, formatPrice } from "@/lib/format";
import { getWatchlist, toggleWatchlist } from "@/lib/watchlist";
import { secondaryLogoUrl } from "@/lib/token-icons";

interface MarketTableProps {
  instruments: Instrument[];
  market: MarketType;
  selectedId: string | null;
  onSelect: (item: Instrument) => void;
  onTrade: (item: Instrument) => void;
  onWatchChange?: () => void;
  loading?: boolean;
}

export function MarketTable({
  instruments,
  market,
  selectedId,
  onSelect,
  onTrade,
  onWatchChange,
  loading,
}: MarketTableProps) {
  const [watchIds, setWatchIds] = useState<string[]>([]);
  const priceMarket: "primary" | "secondary" =
    market === "primary" ? "primary" : "secondary";

  useEffect(() => {
    setWatchIds(getWatchlist());
  }, [instruments, market]);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[#e5e9ef] bg-white p-1 shadow-md md:rounded-xl md:p-0 md:shadow-sm">
      <div className="hidden grid-cols-[minmax(140px,1.4fr)_80px_100px_120px_88px_96px] gap-2 border-b border-[#e8ecf1] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-[#9ca3af] md:grid">
        <span>{"\u6807\u7684"}</span>
        <span>{"\u6da8\u8dcc"}</span>
        <span>{"\u4ef7\u683c"}</span>
        <span>{"\u533a\u95f4"}</span>
        <span className="text-right">{"\u64cd\u4f5c"}</span>
        <span className="text-center">Agent{"\u4ea4\u6613"}</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && (
          <p className="px-4 py-8 text-center text-sm text-[#9ca3af]">...</p>
        )}
        {!loading && instruments.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-[#9ca3af]">
            {market === "watchlist" ? "\u81ea\u9009\u5217\u8868\u4e3a\u7a7a" : "\u2014"}
          </p>
        )}
        {!loading &&
          instruments.map((item) => (
            <InstrumentRow
              key={item.id}
              item={item}
              market={priceMarket}
              active={selectedId === item.id}
              watched={watchIds.includes(item.id)}
              onSelect={() => onSelect(item)}
              onTrade={() => onTrade(item)}
              onToggleWatch={() => {
                setWatchIds(toggleWatchlist(item.id));
                onWatchChange?.();
              }}
            />
          ))}
      </div>
    </div>
  );
}

function InstrumentRow({
  item,
  market,
  active,
  watched,
  onSelect,
  onTrade,
  onToggleWatch,
}: {
  item: Instrument;
  market: "primary" | "secondary";
  active: boolean;
  watched: boolean;
  onSelect: () => void;
  onTrade: () => void;
  onToggleWatch: () => void;
}) {
  const up = item.change24h >= 0;
  const rangePct =
    item.high24h > item.low24h
      ? ((item.price - item.low24h) / (item.high24h - item.low24h)) * 100
      : 50;

  const rowClass = `cursor-pointer border-b border-[#f0f3f7] transition hover:bg-[#f8fafc] ${
    active ? "bg-[#0051ff]/5" : ""
  }`;

  const actionIcons = (
    <>
      <IconBtn
        icon={
          <Star
            size={16}
            className={watched ? "fill-[#0051ff] text-[#0051ff]" : ""}
          />
        }
        onClick={onToggleWatch}
      />
      <IconBtn icon={<BarChart2 size={16} />} />
      <IconBtn icon={<Bell size={16} />} />
      <IconBtn icon={<Info size={16} />} />
    </>
  );

  const tradeButton = (
    <button
      type="button"
      onClick={onTrade}
      className="shrink-0 rounded-lg bg-[#0051ff] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0046dd] md:px-2 md:py-1.5"
    >
      Agent{"\u4ea4\u6613"}
    </button>
  );

  return (
    <>
      {/* 手机端：纵向卡片行 */}
      <div
        role="button"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(e) => e.key === "Enter" && onSelect()}
        className={`flex flex-col gap-3 px-3 py-4 md:hidden ${rowClass}`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <TokenAvatar
              symbol={item.symbol}
              logo={
                item.logoUrl ??
                (market === "secondary"
                  ? secondaryLogoUrl(item.symbol)
                  : undefined)
              }
            />
            <div className="min-w-0">
              <p className="truncate font-semibold text-[#1f2937]">
                {item.symbol}
                {item.chain && (
                  <span className="ml-1 text-[10px] font-normal text-[#9ca3af]">
                    {item.chain}
                  </span>
                )}
              </p>
              <p className="truncate text-xs text-[#9ca3af]">{item.name}</p>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p
              className={`text-sm font-semibold ${up ? "text-[#00a651]" : "text-[#e53935]"}`}
            >
              {formatChange(item.change24h)}
            </p>
            <p className="font-mono text-sm text-[#374151]">
              {formatPrice(item.price, market)}
            </p>
          </div>
        </div>

        <RangeBar rangePct={rangePct} />

        <div
          className="flex items-center justify-between gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1">{actionIcons}</div>
          {tradeButton}
        </div>
      </div>

      {/* 桌面端：原有表格行 */}
      <div
        role="button"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(e) => e.key === "Enter" && onSelect()}
        className={`hidden grid-cols-[minmax(140px,1.4fr)_80px_100px_120px_88px_96px] items-center gap-2 px-4 py-2 text-sm md:grid ${rowClass}`}
      >
        <div className="flex min-w-0 items-center gap-2">
          <TokenAvatar
            symbol={item.symbol}
            logo={
              item.logoUrl ??
              (market === "secondary"
                ? secondaryLogoUrl(item.symbol)
                : undefined)
            }
          />
          <div className="min-w-0">
            <p className="truncate font-semibold text-[#1f2937]">
              {item.symbol}
              {item.chain && (
                <span className="ml-1 text-[10px] font-normal text-[#9ca3af]">
                  {item.chain}
                </span>
              )}
            </p>
            <p className="truncate text-xs text-[#9ca3af]">{item.name}</p>
          </div>
        </div>

        <span
          className={`font-semibold ${up ? "text-[#00a651]" : "text-[#e53935]"}`}
        >
          {formatChange(item.change24h)}
        </span>

        <span className="font-mono text-sm text-[#374151]">
          {formatPrice(item.price, market)}
        </span>

        <RangeBar rangePct={rangePct} className="pr-2" />

        <div
          className="flex justify-end gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          {actionIcons}
        </div>

        <div className="text-center" onClick={(e) => e.stopPropagation()}>
          {tradeButton}
        </div>
      </div>
    </>
  );
}

function RangeBar({
  rangePct,
  className = "",
}: {
  rangePct: number;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="relative h-1.5 rounded-full bg-[#e8ecf1]">
        <div className="absolute left-0 top-0 h-full w-full rounded-full bg-gradient-to-r from-[#e53935] to-[#00a651]" />
        <div
          className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full border-2 border-white bg-[#0051ff] shadow"
          style={{
            left: `calc(${Math.min(100, Math.max(0, rangePct))}% - 5px)`,
          }}
        />
      </div>
    </div>
  );
}

function TokenAvatar({ symbol, logo }: { symbol: string; logo?: string }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [logo]);

  if (logo && !failed) {
    return (
      <img
        src={logo}
        alt=""
        className="h-8 w-8 shrink-0 rounded-full bg-[#f0f3f7] object-cover"
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0051ff]/10 text-xs font-bold text-[#0051ff]">
      {symbol.slice(0, 2)}
    </div>
  );
}

function IconBtn({
  icon,
  onClick,
}: {
  icon: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg p-2 text-[#9ca3af] hover:bg-[#f0f3f7] hover:text-[#0051ff] md:rounded md:p-1"
    >
      {icon}
    </button>
  );
}
