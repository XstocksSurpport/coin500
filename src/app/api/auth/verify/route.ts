import { NextResponse } from "next/server";
import { isValidEmail } from "@/lib/auth-storage";
import {
  COOKIE_NAME,
  createSessionToken,
  MAX_AGE_SEC,
} from "@/lib/session-token";
import { verifyOtp } from "@/lib/verification-token";
import { WALLET_ADDRESS } from "@/lib/constants";

export async function POST(req: Request) {
  let body: { email?: string; code?: string; verificationToken?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase() ?? "";
  const code = body.code?.trim() ?? "";
  const verificationToken = body.verificationToken ?? "";

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "\u8bf7\u8f93\u5165\u6709\u6548\u90ae\u7bb1" },
      { status: 400 },
    );
  }
  if (!/^\d{6}$/.test(code)) {
    return NextResponse.json(
      { error: "\u8bf7\u8f93\u5165 6 \u4f4d\u9a8c\u8bc1\u7801" },
      { status: 400 },
    );
  }
  if (!verificationToken) {
    return NextResponse.json(
      { error: "\u8bf7\u5148\u83b7\u53d6\u9a8c\u8bc1\u7801" },
      { status: 400 },
    );
  }

  const check = verifyOtp(verificationToken, email, code);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: 401 });
  }

  const token = createSessionToken(email);
  const res = NextResponse.json({
    ok: true,
    user: { email, walletAddress: WALLET_ADDRESS },
  });

  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SEC,
  });

  return res;
}
