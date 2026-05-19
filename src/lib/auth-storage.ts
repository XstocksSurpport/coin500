import { SESSION_KEY, WALLET_ADDRESS } from "./constants";
import type { UserSession } from "./types";

const PROFILES_KEY = "coin500_profiles";

export interface UserProfile {
  balance: number;
  deposited: boolean;
}

type ProfileMap = Record<string, UserProfile>;

function readProfiles(): ProfileMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    return raw ? (JSON.parse(raw) as ProfileMap) : {};
  } catch {
    return {};
  }
}

function writeProfiles(map: ProfileMap) {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(map));
}

export function getProfile(email: string): UserProfile {
  return readProfiles()[email] ?? { balance: 0, deposited: false };
}

export function saveProfile(email: string, profile: UserProfile) {
  const map = readProfiles();
  map[email] = profile;
  writeProfiles(map);
}

export function buildSession(email: string): UserSession {
  const profile = getProfile(email);
  return {
    email,
    walletAddress: WALLET_ADDRESS,
    balance: profile.balance,
    deposited: profile.deposited,
  };
}

export function persistLocalSession(session: UserSession | null) {
  if (typeof window === "undefined") return;
  if (session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    saveProfile(session.email, {
      balance: session.balance,
      deposited: session.deposited,
    });
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

export function loadLocalSession(): UserSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserSession;
    if (!parsed.email || !parsed.walletAddress) return null;
    const profile = getProfile(parsed.email);
    return {
      ...parsed,
      walletAddress: WALLET_ADDRESS,
      balance: profile.balance,
      deposited: profile.deposited,
    };
  } catch {
    return null;
  }
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
