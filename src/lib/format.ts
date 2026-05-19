export function formatPrice(value: number, market: "primary" | "secondary"): string {
  if (!Number.isFinite(value)) return "—";
  if (market === "primary") {
    if (value >= 1) return value.toLocaleString("en-US", { maximumFractionDigits: 4 });
    if (value >= 0.01) return value.toFixed(4);
    if (value >= 0.0001) return value.toFixed(6);
    return value.toExponential(2);
  }
  if (value >= 1000) {
    return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  if (value >= 1) return value.toFixed(2);
  return value.toFixed(4);
}

export function formatChange(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatUsd(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function shortenAddress(addr: string): string {
  if (addr.length < 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function spreadPrices(mid: number, bps = 8): { sell: number; buy: number } {
  const half = (bps / 10000) * mid;
  return { sell: mid - half, buy: mid + half };
}
