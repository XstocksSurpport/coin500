"use client";

import {
  Eye,
  EyeOff,
  Search,
  LogOut,
  Wallet,
  Copy,
  Check,
  Menu,
} from "lucide-react";
import { useState } from "react";
import { SITE_NAME, WALLET_ADDRESS } from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";
import { formatUsd, shortenAddress } from "@/lib/format";

interface HeaderProps {
  onLogin: () => void;
  onDeposit: () => void;
  search: string;
  onSearchChange: (v: string) => void;
  onMenuClick?: () => void;
}

export function Header({
  onLogin,
  onDeposit,
  search,
  onSearchChange,
  onMenuClick,
}: HeaderProps) {
  const { user, isLoading, logout, balanceHidden, setBalanceHidden } = useAuth();
  const [copied, setCopied] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const equity = user?.balance ?? 0;
  const available = equity;
  const margin = equity * 0.12;
  const pnl = equity * 0.018;

  const copyWallet = async () => {
    await navigator.clipboard.writeText(WALLET_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const mask = (v: string) => (balanceHidden ? "••••••" : v);

  return (
    <header className="shrink-0 border-b border-[#e5e9ef] bg-white px-3 py-2 md:h-14 md:px-4 md:py-0">
      <div className="flex flex-col gap-2 md:h-14 md:flex-row md:items-center md:gap-4">
        {/* 顶栏：菜单 + Logo + 登录（手机） */}
        <div className="flex items-center gap-2 md:gap-2">
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-lg p-2 text-[#374151] hover:bg-[#f0f3f7] md:hidden"
            aria-label="打开菜单"
          >
            <Menu size={22} />
          </button>
          <span className="text-lg font-bold tracking-tight text-[#0051ff] md:text-xl">
            {SITE_NAME}
          </span>
          <div className="ml-auto flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setMobileSearchOpen((v) => !v)}
              className={`rounded-lg p-2 ${
                mobileSearchOpen
                  ? "bg-[#0051ff]/10 text-[#0051ff]"
                  : "text-[#6b7280] hover:bg-[#f0f3f7]"
              }`}
              aria-label="搜索"
            >
              <Search size={20} />
            </button>
            {isLoading ? (
              <span className="text-sm text-[#9ca3af]">...</span>
            ) : user ? (
              <button
                type="button"
                onClick={onDeposit}
                className="rounded-lg bg-[#0051ff] px-3 py-1.5 text-xs font-semibold text-white"
              >
                {"\u5145\u503c"}
              </button>
            ) : (
              <button
                type="button"
                onClick={onLogin}
                className="rounded-lg bg-[#0051ff] px-3 py-1.5 text-xs font-semibold text-white"
              >
                {"\u767b\u5f55"}
              </button>
            )}
          </div>
        </div>

        {/* 搜索：桌面常显；手机展开 */}
        <div
          className={`w-full md:mx-4 md:flex md:max-w-xl md:flex-1 ${
            mobileSearchOpen ? "block" : "hidden md:block"
          }`}
        >
          <div className="relative w-full">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]"
              size={18}
            />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="搜索标的"
              className="w-full rounded-full border border-[#e5e9ef] bg-[#f5f7f9] py-2 pl-10 pr-4 text-sm outline-none focus:border-[#0051ff] focus:bg-white"
            />
          </div>
        </div>

        {/* 桌面：统计 + 操作 */}
        <div className="hidden items-center gap-5 text-xs text-[#6b7280] md:flex">
          {user && (
            <>
              <Stat label="可用" value={mask(formatUsd(available))} />
              <Stat label="净值" value={mask(formatUsd(equity))} />
              <Stat label="保证金" value={mask(formatUsd(margin))} />
              <Stat
                label="盈亏"
                value={mask(formatUsd(pnl))}
                accent={pnl >= 0 ? "up" : "down"}
              />
              <button
                type="button"
                onClick={() => setBalanceHidden(!balanceHidden)}
                className="rounded p-1 hover:bg-[#f0f3f7]"
                aria-label="Toggle balance"
              >
                {balanceHidden ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </>
          )}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {isLoading ? (
            <span className="px-3 text-sm text-[#9ca3af]">...</span>
          ) : user ? (
            <>
              <button
                type="button"
                onClick={onDeposit}
                className="rounded-lg bg-[#0051ff] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#0046dd]"
              >
                {"\u5145\u503c"}
              </button>
              <div className="hidden items-center gap-2 rounded-lg border border-[#e5e9ef] px-3 py-1.5 sm:flex">
                <Wallet size={14} className="text-[#0051ff]" />
                <span className="font-mono text-xs text-[#374151]">
                  {shortenAddress(user.walletAddress)}
                </span>
                <button
                  type="button"
                  onClick={copyWallet}
                  className="text-[#0051ff]"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
              <span className="hidden max-w-[120px] truncate text-xs text-[#9ca3af] lg:inline">
                {user.email}
              </span>
              <button
                type="button"
                onClick={logout}
                className="rounded-lg border border-[#e5e9ef] p-2 hover:bg-[#f5f7f9]"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onLogin}
              className="rounded-lg bg-[#0051ff] px-5 py-1.5 text-sm font-semibold text-white hover:bg-[#0046dd]"
            >
              {"\u767b\u5f55"}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "up" | "down";
}) {
  return (
    <div className="flex flex-col">
      <span>{label}</span>
      <span
        className={`text-sm font-semibold ${
          accent === "up"
            ? "text-[#00a651]"
            : accent === "down"
              ? "text-[#e53935]"
              : "text-[#1f2937]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
