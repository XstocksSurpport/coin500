import { createHmac, timingSafeEqual } from "crypto";

export function authSecret(): string {
  return (
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    "coin500-dev-secret-change-in-production"
  );
}

export function signPayload(data: string): string {
  return createHmac("sha256", authSecret()).update(data).digest("base64url");
}

export function verifySignedPayload<T>(
  token: string,
): { payload: T; data: string } | null {
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;

  const data = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = signPayload(data);

  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(data, "base64url").toString("utf8"),
    ) as T;
    return { payload, data };
  } catch {
    return null;
  }
}

export function encodeSignedPayload(payload: object): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${data}.${signPayload(data)}`;
}
