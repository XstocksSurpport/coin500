/** Symbol aliases for icons (rebrands / Binance tickers vs icon sets). */
const ICON_ALIASES: Record<string, string> = {
  POL: "matic",
  MATIC: "matic",
  RONIN: "ron",
};

/** CoinCap static icons — works for most Binance USDT base assets. */
export function secondaryLogoUrl(symbol: string): string {
  const key = (ICON_ALIASES[symbol.toUpperCase()] ?? symbol).toLowerCase();
  return `https://assets.coincap.io/assets/icons/${key}@2x.png`;
}
