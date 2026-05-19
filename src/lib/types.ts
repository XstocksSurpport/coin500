export type MarketType = "primary" | "secondary" | "watchlist";

export interface Instrument {
  id: string;
  symbol: string;
  name: string;
  logoUrl?: string;
  chain?: string;
  pairAddress?: string;
  change24h: number;
  price: number;
  high24h: number;
  low24h: number;
  volume24h?: number;
}

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface UserSession {
  email: string;
  walletAddress: string;
  balance: number;
  deposited: boolean;
}

export type DepositNetworkKind = "evm" | "solana";

export interface DepositNetwork {
  id: string;
  name: string;
  symbol: string;
  kind: DepositNetworkKind;
}
