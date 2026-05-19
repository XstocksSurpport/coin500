import { WALLET_ADDRESS } from "./constants";
import {
  authSecret,
  encodeSignedPayload,
  verifySignedPayload,
} from "./auth-secret";

const COOKIE_NAME = "coin500_auth";
const MAX_AGE_SEC = 60 * 60 * 24 * 30; // 30 days

export { COOKIE_NAME, MAX_AGE_SEC };

export interface SessionPayload {
  email: string;
  walletAddress: string;
  exp: number;
}

export function createSessionToken(email: string): string {
  const payload: SessionPayload = {
    email,
    walletAddress: WALLET_ADDRESS,
    exp: Math.floor(Date.now() / 1000) + MAX_AGE_SEC,
  };
  return encodeSignedPayload(payload);
}

export function verifySessionToken(
  token: string | undefined,
): SessionPayload | null {
  if (!token) return null;
  const parsed = verifySignedPayload<SessionPayload>(token);
  if (!parsed) return null;
  const payload = parsed.payload;
  if (!payload.email || payload.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }
  return payload;
}

// re-export for tests
export { authSecret };
