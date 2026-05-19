import type { Instrument } from "./types";

/** Curated meme-style instruments when Ave API is unavailable */
export const FALLBACK_PRIMARY: Instrument[] = [
  { id: "pepe-sol", symbol: "PEPE", name: "Pepe", chain: "solana", change24h: 12.4, price: 0.0000124, high24h: 0.0000131, low24h: 0.0000108, volume24h: 4200000 },
  { id: "wif-sol", symbol: "WIF", name: "dogwifhat", chain: "solana", change24h: -3.2, price: 2.14, high24h: 2.28, low24h: 2.05, volume24h: 89000000 },
  { id: "bonk-sol", symbol: "BONK", name: "Bonk", chain: "solana", change24h: 5.8, price: 0.0000241, high24h: 0.0000255, low24h: 0.0000220, volume24h: 31000000 },
  { id: "popcat-sol", symbol: "POPCAT", name: "Popcat", chain: "solana", change24h: 18.6, price: 1.42, high24h: 1.51, low24h: 1.18, volume24h: 52000000 },
  { id: "mew-sol", symbol: "MEW", name: "cat in a dogs world", chain: "solana", change24h: -1.4, price: 0.0089, high24h: 0.0094, low24h: 0.0085, volume24h: 12000000 },
  { id: "bome-sol", symbol: "BOME", name: "BOOK OF MEME", chain: "solana", change24h: 7.2, price: 0.0112, high24h: 0.0118, low24h: 0.0104, volume24h: 24000000 },
  { id: "slerf-sol", symbol: "SLERF", name: "Slerf", chain: "solana", change24h: -8.1, price: 0.34, high24h: 0.38, low24h: 0.31, volume24h: 15000000 },
  { id: "myro-sol", symbol: "MYRO", name: "Myro", chain: "solana", change24h: 4.3, price: 0.18, high24h: 0.19, low24h: 0.16, volume24h: 8000000 },
  { id: "wen-sol", symbol: "WEN", name: "Wen", chain: "solana", change24h: 2.1, price: 0.00012, high24h: 0.00013, low24h: 0.00011, volume24h: 5000000 },
  { id: "peng-sol", symbol: "PENG", name: "Peng", chain: "solana", change24h: 22.5, price: 0.42, high24h: 0.45, low24h: 0.33, volume24h: 18000000 },
];
