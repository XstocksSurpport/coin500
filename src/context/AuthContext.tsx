"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  buildSession,
  loadLocalSession,
  persistLocalSession,
} from "@/lib/auth-storage";
import type { UserSession } from "@/lib/types";

interface AuthContextValue {
  user: UserSession | null;
  isLoading: boolean;
  sendCode: (
    email: string,
    verificationToken?: string,
  ) => Promise<{
    ok: boolean;
    error?: string;
    verificationToken?: string;
    retryAfter?: number;
  }>;
  verifyCode: (
    email: string,
    code: string,
    verificationToken: string,
  ) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  deposit: (amount: number) => void;
  balanceHidden: boolean;
  setBalanceHidden: (v: boolean) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchMe(): Promise<UserSession | null> {
  const res = await fetch("/api/auth/me", { credentials: "include" });
  if (!res.ok) return loadLocalSession();
  const json = await res.json();
  if (!json.user?.email) return null;
  const session = buildSession(json.user.email);
  persistLocalSession(session);
  return session;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [balanceHidden, setBalanceHidden] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const session = await fetchMe();
        if (!cancelled) setUser(session);
      } catch {
        if (!cancelled) setUser(loadLocalSession());
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback((session: UserSession | null) => {
    persistLocalSession(session);
    setUser(session);
  }, []);

  const sendCode = useCallback(
    async (email: string, verificationToken?: string) => {
      try {
        const res = await fetch("/api/auth/send-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, verificationToken }),
        });
        const json = await res.json();
        if (!res.ok) {
          return {
            ok: false,
            error: json.error ?? "\u53d1\u9001\u5931\u8d25",
            retryAfter: json.retryAfter as number | undefined,
          };
        }
        return {
          ok: true,
          verificationToken: json.verificationToken as string,
        };
      } catch {
        return { ok: false, error: "\u7f51\u7edc\u9519\u8bef\uff0c\u8bf7\u91cd\u8bd5" };
      }
    },
    [],
  );

  const verifyCode = useCallback(
    async (email: string, code: string, verificationToken: string) => {
      try {
        const res = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, code, verificationToken }),
        });
        const json = await res.json();
        if (!res.ok) {
          return { ok: false, error: json.error ?? "\u9a8c\u8bc1\u5931\u8d25" };
        }
        const session = buildSession(json.user.email);
        persist(session);
        return { ok: true };
      } catch {
        return { ok: false, error: "\u7f51\u7edc\u9519\u8bef\uff0c\u8bf7\u91cd\u8bd5" };
      }
    },
    [persist],
  );

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      /* clear client anyway */
    }
    persist(null);
  }, [persist]);

  const deposit = useCallback(
    (amount: number) => {
      if (!user || amount <= 0) return;
      persist({
        ...user,
        balance: user.balance + amount,
        deposited: true,
      });
    },
    [user, persist],
  );

  const value = useMemo(
    () => ({
      user,
      isLoading,
      sendCode,
      verifyCode,
      logout,
      deposit,
      balanceHidden,
      setBalanceHidden,
    }),
    [user, isLoading, sendCode, verifyCode, logout, deposit, balanceHidden],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
