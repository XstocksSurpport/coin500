import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { COOKIE_NAME, verifySessionToken } from "@/lib/session-token";
import { WALLET_ADDRESS } from "@/lib/constants";

export async function GET() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  const payload = verifySessionToken(token);

  if (!payload) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: {
      email: payload.email,
      walletAddress: WALLET_ADDRESS,
    },
  });
}
