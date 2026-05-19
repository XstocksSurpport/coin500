import { createHmac, randomInt, timingSafeEqual } from "crypto";
import { encodeSignedPayload, verifySignedPayload } from "./auth-secret";

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds

export interface VerificationPayload {
  email: string;
  codeHash: string;
  exp: number;
  issuedAt: number;
}

function hashCode(email: string, code: string): string {
  return createHmac("sha256", process.env.AUTH_SECRET ?? "otp")
    .update(`${email}:${code}`)
    .digest("base64url");
}

export function generateOtpCode(): string {
  return String(randomInt(100000, 1000000));
}

export function createVerificationToken(email: string, code: string): string {
  const now = Date.now();
  const payload: VerificationPayload = {
    email,
    codeHash: hashCode(email, code),
    exp: now + OTP_TTL_MS,
    issuedAt: now,
  };
  return encodeSignedPayload(payload);
}

export function verifyOtp(
  token: string,
  email: string,
  code: string,
): { ok: true } | { ok: false; error: string } {
  const parsed = verifySignedPayload<VerificationPayload>(token);
  if (!parsed) {
    return { ok: false, error: "\u9a8c\u8bc1\u4f1a\u8bdd\u5df2\u5931\u6548\uff0c\u8bf7\u91cd\u65b0\u83b7\u53d6\u9a8c\u8bc1\u7801" };
  }

  const { email: tokenEmail, codeHash, exp } = parsed.payload;
  if (tokenEmail !== email.toLowerCase()) {
    return { ok: false, error: "\u90ae\u7bb1\u4e0d\u5339\u914d" };
  }
  if (Date.now() > exp) {
    return { ok: false, error: "\u9a8c\u8bc1\u7801\u5df2\u8fc7\u671f\uff0c\u8bf7\u91cd\u65b0\u83b7\u53d6" };
  }

  const expected = hashCode(email, code.trim());
  try {
    const a = Buffer.from(codeHash);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return { ok: false, error: "\u9a8c\u8bc1\u7801\u9519\u8bef" };
    }
  } catch {
    return { ok: false, error: "\u9a8c\u8bc1\u7801\u9519\u8bef" };
  }

  return { ok: true };
}

export function canResend(token: string | undefined): boolean {
  if (!token) return true;
  const parsed = verifySignedPayload<VerificationPayload>(token);
  if (!parsed) return true;
  return Date.now() - parsed.payload.issuedAt >= RESEND_COOLDOWN_MS;
}

export function resendCooldownSec(token: string | undefined): number {
  if (!token) return 0;
  const parsed = verifySignedPayload<VerificationPayload>(token);
  if (!parsed) return 0;
  const left = RESEND_COOLDOWN_MS - (Date.now() - parsed.payload.issuedAt);
  return Math.max(0, Math.ceil(left / 1000));
}
