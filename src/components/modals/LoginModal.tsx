"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { isValidEmail } from "@/lib/auth-storage";
import { ModalOverlay } from "./ModalOverlay";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

type Step = "email" | "code";

export function LoginModal({ open, onClose }: LoginModalProps) {
  const { sendCode, verifyCode } = useAuth();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!open) {
      setStep("email");
      setEmail("");
      setCode("");
      setVerificationToken("");
      setError("");
      setInfo("");
      setCooldown(0);
    }
  }, [open]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setInterval(() => {
      setCooldown((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  if (!open) return null;

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!isValidEmail(trimmed)) {
      setError("\u8bf7\u8f93\u5165\u6709\u6548\u90ae\u7bb1");
      return;
    }

    setSubmitting(true);
    setError("");
    setInfo("");
    const result = await sendCode(
      trimmed,
      verificationToken || undefined,
    );
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error ?? "\u53d1\u9001\u5931\u8d25");
      if (result.retryAfter) setCooldown(result.retryAfter);
      return;
    }

    setEmail(trimmed);
    setVerificationToken(result.verificationToken ?? "");
    setStep("code");
    setInfo("\u9a8c\u8bc1\u7801\u5df2\u53d1\u9001\u5230\u60a8\u7684\u90ae\u7bb1\uff0c\u8bf7\u67e5\u6536\uff08\u542b\u5783\u573e\u90ae\u4ef6\u5939\uff09");
    setCooldown(60);
  };

  const handleResend = async () => {
    if (cooldown > 0 || submitting) return;
    setSubmitting(true);
    setError("");
    const result = await sendCode(email, verificationToken || undefined);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error ?? "\u53d1\u9001\u5931\u8d25");
      if (result.retryAfter) setCooldown(result.retryAfter);
      return;
    }
    if (result.verificationToken) {
      setVerificationToken(result.verificationToken);
    }
    setInfo("\u9a8c\u8bc1\u7801\u5df2\u91cd\u65b0\u53d1\u9001");
    setCooldown(60);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCode = code.replace(/\D/g, "").slice(0, 6);
    if (trimmedCode.length !== 6) {
      setError("\u8bf7\u8f93\u5165 6 \u4f4d\u9a8c\u8bc1\u7801");
      return;
    }

    setSubmitting(true);
    setError("");
    const result = await verifyCode(email, trimmedCode, verificationToken);
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error ?? "\u9a8c\u8bc1\u5931\u8d25");
      return;
    }

    onClose();
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#e8ecf1] px-6 py-4">
          <div className="flex items-center gap-2">
            {step === "code" && (
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setCode("");
                  setError("");
                  setInfo("");
                }}
                className="rounded-lg p-1 text-[#6b7280] hover:bg-[#f0f3f7]"
                aria-label="back"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <h2 className="text-lg font-semibold text-[#1a1d21]">
              {step === "email" ? "\u90ae\u7bb1\u767b\u5f55" : "\u8f93\u5165\u9a8c\u8bc1\u7801"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-[#6b7280] hover:bg-[#f0f3f7]"
            aria-label="close"
          >
            <X size={20} />
          </button>
        </div>

        {step === "email" ? (
          <form onSubmit={handleSendCode} className="px-6 py-5">
            <label className="mb-2 block text-sm font-medium text-[#374151]">
              {"\u90ae\u7bb1\u5730\u5740"}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="name@example.com"
              autoComplete="email"
              disabled={submitting}
              className="w-full rounded-lg border border-[#d1d9e6] px-4 py-2.5 text-sm outline-none focus:border-[#0051ff] focus:ring-2 focus:ring-[#0051ff]/20 disabled:opacity-60"
              autoFocus
            />
            {error && (
              <p className="mt-2 text-sm text-[#e53935]">{error}</p>
            )}
          <p className="mt-3 text-xs text-[#9ca3af]">
            {"\u6211\u4eec\u4f1a\u5411\u8be5\u90ae\u7bb1\u53d1\u9001 6 \u4f4d\u6570\u5b57\u9a8c\u8bc1\u7801\u3002"}
            {"Resend \u6d4b\u8bd5\u671f\u4ec5\u652f\u6301\u6ce8\u518c\u90ae\u7bb1\u6536\u4fe1\uff1b\u9a8c\u8bc1\u57df\u540d\u540e\u53ef\u53d1\u4efb\u610f\u90ae\u7bb1\u3002"}
          </p>
            <button
              type="submit"
              disabled={submitting}
              className="mt-4 w-full rounded-lg bg-[#0051ff] py-2.5 text-sm font-semibold text-white hover:bg-[#0046dd] disabled:opacity-60"
            >
              {submitting ? "\u53d1\u9001\u4e2d..." : "\u83b7\u53d6\u9a8c\u8bc1\u7801"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="px-6 py-5">
            <p className="mb-3 text-sm text-[#6b7280]">
              {"\u9a8c\u8bc1\u7801\u5df2\u53d1\u81f3 "}
              <span className="font-medium text-[#1f2937]">{email}</span>
            </p>
            <label className="mb-2 block text-sm font-medium text-[#374151]">
              {"6 \u4f4d\u9a8c\u8bc1\u7801"}
            </label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                setError("");
              }}
              placeholder="000000"
              disabled={submitting}
              className="w-full rounded-lg border border-[#d1d9e6] px-4 py-3 text-center font-mono text-2xl tracking-[0.4em] outline-none focus:border-[#0051ff] focus:ring-2 focus:ring-[#0051ff]/20 disabled:opacity-60"
              autoFocus
            />
            {error && (
              <p className="mt-2 text-sm text-[#e53935]">{error}</p>
            )}
            {info && !error && (
              <p className="mt-2 text-sm text-[#00a651]">{info}</p>
            )}
            <button
              type="submit"
              disabled={submitting || code.length < 6}
              className="mt-4 w-full rounded-lg bg-[#0051ff] py-2.5 text-sm font-semibold text-white hover:bg-[#0046dd] disabled:opacity-60"
            >
              {submitting ? "\u9a8c\u8bc1\u4e2d..." : "\u767b\u5f55"}
            </button>
            <button
              type="button"
              disabled={submitting || cooldown > 0}
              onClick={handleResend}
              className="mt-3 w-full text-sm text-[#0051ff] hover:underline disabled:text-[#9ca3af] disabled:no-underline"
            >
              {cooldown > 0
                ? `${cooldown} \u79d2\u540e\u53ef\u91cd\u53d1`
                : "\u91cd\u65b0\u53d1\u9001\u9a8c\u8bc1\u7801"}
            </button>
          </form>
        )}
      </div>
    </ModalOverlay>
  );
}
