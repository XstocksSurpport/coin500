"use client";

import { useState } from "react";
import { Copy, Check, X, ChevronDown } from "lucide-react";
import { ModalOverlay } from "./ModalOverlay";
import {
  DEPOSIT_NETWORKS,
  getDepositAddress,
} from "@/lib/constants";
import { shortenAddress } from "@/lib/format";

interface DepositModalProps {
  open: boolean;
  onClose: () => void;
}

export function DepositModal({ open, onClose }: DepositModalProps) {
  const [networkId, setNetworkId] = useState(DEPOSIT_NETWORKS[0].id);
  const [amount, setAmount] = useState("");
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  if (!open) return null;

  const network =
    DEPOSIT_NETWORKS.find((n) => n.id === networkId) ?? DEPOSIT_NETWORKS[0];
  const depositAddress = getDepositAddress(network);

  const copyAddress = async () => {
    await navigator.clipboard.writeText(depositAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    setNotice("\u5145\u503c\u672a\u6210\u529f\uff0c\u8bf7\u7b49\u5f85\u533a\u5757\u786e\u8ba4");
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#e8ecf1] px-6 py-4">
          <h2 className="text-lg font-semibold text-[#1a1d21]">
            {"\u5145\u503c"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-[#6b7280] hover:bg-[#f0f3f7]"
            aria-label="close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div>
            <label
              htmlFor="deposit-network"
              className="mb-2 block text-sm font-medium text-[#374151]"
            >
              {"\u7f51\u7edc"}
            </label>
            <div className="relative">
              <select
                id="deposit-network"
                value={networkId}
                onChange={(e) => {
                  setNetworkId(e.target.value);
                  setCopied(false);
                  setNotice(null);
                }}
                className="w-full appearance-none rounded-lg border border-[#d1d9e6] bg-white py-2.5 pl-4 pr-10 text-sm text-[#1f2937] outline-none focus:border-[#0051ff] focus:ring-2 focus:ring-[#0051ff]/20"
              >
                {DEPOSIT_NETWORKS.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name} ({n.symbol})
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af]"
                size={18}
              />
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-[#374151]">
              {"\u5145\u503c\u5730\u5740"}
            </p>
            <div className="flex items-center gap-2 rounded-lg border border-[#e5e9ef] bg-[#f8fafc] px-3 py-2.5">
              <code className="flex-1 break-all text-xs text-[#1f2937]">
                {depositAddress}
              </code>
              <button
                type="button"
                onClick={copyAddress}
                className="shrink-0 rounded-md p-1.5 text-[#0051ff] hover:bg-[#0051ff]/10"
                title={"\u590d\u5236"}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
            <p className="mt-1 text-xs text-[#9ca3af]">
              {shortenAddress(depositAddress)}
              {" \u00b7 "}
              {network.kind === "solana" ? "SOL" : "EVM"}
            </p>
          </div>

          <div>
            <label
              htmlFor="deposit-amount"
              className="mb-2 block text-sm font-medium text-[#374151]"
            >
              {"\u5230\u8d26\u91d1\u989d"} (USDC)
            </label>
            <input
              id="deposit-amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setNotice(null);
              }}
              placeholder="1000.00"
              className="w-full rounded-lg border border-[#d1d9e6] px-4 py-2.5 text-sm outline-none focus:border-[#0051ff] focus:ring-2 focus:ring-[#0051ff]/20"
            />
          </div>

          {notice && (
            <div className="rounded-lg border border-[#fcd34d] bg-[#fffbeb] px-4 py-3 text-sm text-[#92400e]">
              {notice}
            </div>
          )}

          <button
            type="button"
            onClick={handleConfirm}
            className="w-full rounded-lg bg-[#0051ff] py-2.5 text-sm font-semibold text-white hover:bg-[#0046dd]"
          >
            {"\u786e\u8ba4\u5145\u503c"}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}
