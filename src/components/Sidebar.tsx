"use client";

import { Star, TrendingUp, Layers } from "lucide-react";
import type { MarketType } from "@/lib/types";

interface SidebarProps {
  market: MarketType;
  onMarketChange: (m: MarketType) => void;
}

export function Sidebar({ market, onMarketChange }: SidebarProps) {
  return (
    <aside className="flex w-52 shrink-0 flex-col border-r border-[#e5e9ef] bg-white py-3 text-sm">
      <nav className="space-y-0.5 px-3">
        <NavItem
          active={market === "primary"}
          onClick={() => onMarketChange("primary")}
          icon={<TrendingUp size={16} />}
          label={"\u4e00\u7ea7\u5e02\u573a"}
        />
        <NavItem
          active={market === "secondary"}
          onClick={() => onMarketChange("secondary")}
          icon={<Layers size={16} />}
          label={"\u4e8c\u7ea7\u5e02\u573a"}
        />
        <NavItem
          active={market === "watchlist"}
          onClick={() => onMarketChange("watchlist")}
          icon={<Star size={16} />}
          label={"\u81ea\u9009"}
        />
      </nav>
    </aside>
  );
}

function NavItem({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left transition ${
        active
          ? "bg-[#0051ff]/8 font-medium text-[#0051ff]"
          : "text-[#4b5563] hover:bg-[#f5f7f9]"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
