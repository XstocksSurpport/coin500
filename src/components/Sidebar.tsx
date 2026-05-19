"use client";

import { Star, TrendingUp, Layers, X } from "lucide-react";
import type { MarketType } from "@/lib/types";

interface SidebarProps {
  market: MarketType;
  onMarketChange: (m: MarketType) => void;
}

export function Sidebar({ market, onMarketChange }: SidebarProps) {
  return (
    <aside className="hidden w-52 shrink-0 flex-col border-r border-[#e5e9ef] bg-white py-3 text-sm md:flex">
      <SidebarNav market={market} onMarketChange={onMarketChange} />
    </aside>
  );
}

interface MobileNavDrawerProps {
  open: boolean;
  market: MarketType;
  onClose: () => void;
  onMarketChange: (m: MarketType) => void;
}

export function MobileNavDrawer({
  open,
  market,
  onClose,
  onMarketChange,
}: MobileNavDrawerProps) {
  if (!open) return null;

  const select = (m: MarketType) => {
    onMarketChange(m);
    onClose();
  };

  return (
  <>
    <button
      type="button"
      aria-label="关闭菜单"
      className="fixed inset-0 z-40 bg-black/40 md:hidden"
      onClick={onClose}
    />
    <aside className="fixed inset-y-0 left-0 z-50 flex w-[min(280px,85vw)] flex-col border-r border-[#e5e9ef] bg-white py-4 shadow-xl md:hidden">
      <div className="mb-2 flex items-center justify-between px-4">
        <span className="text-sm font-semibold text-[#1f2937]">{"\u5e02\u573a\u5bfc\u822a"}</span>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-[#6b7280] hover:bg-[#f0f3f7]"
          aria-label="关闭"
        >
          <X size={20} />
        </button>
      </div>
      <SidebarNav market={market} onMarketChange={select} />
    </aside>
  </>
  );
}

function SidebarNav({
  market,
  onMarketChange,
}: {
  market: MarketType;
  onMarketChange: (m: MarketType) => void;
}) {
  return (
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
      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-3 text-left transition md:py-2.5 ${
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
