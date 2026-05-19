import { NextResponse } from "next/server";
import { isValidEmail } from "@/lib/auth-storage";
import { isEmailConfigured, sendVerificationEmail } from "@/lib/email";
import {
  canResend,
  createVerificationToken,
  generateOtpCode,
  resendCooldownSec,
} from "@/lib/verification-token";

export async function POST(req: Request) {
  if (!isEmailConfigured()) {
    return NextResponse.json(
      {
        error:
          "\u90ae\u4ef6\u670d\u52a1\u672a\u914d\u7f6e\uff0c\u8bf7\u5728\u670d\u52a1\u7aef\u914d\u7f6e RESEND_API_KEY \u6216 SMTP",
      },
      { status: 503 },
    );
  }

  let body: { email?: string; verificationToken?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase() ?? "";
  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "\u8bf7\u8f93\u5165\u6709\u6548\u90ae\u7bb1" },
      { status: 400 },
    );
  }

  if (!canResend(body.verificationToken)) {
    const retryAfter = resendCooldownSec(body.verificationToken);
    return NextResponse.json(
      {
        error: `\u8bf7 ${retryAfter} \u79d2\u540e\u518d\u8bd5`,
        retryAfter,
      },
      { status: 429 },
    );
  }

  const code = generateOtpCode();

  try {
    await sendVerificationEmail(email, code);
  } catch (e) {
    const message = e instanceof Error ? e.message : "send failed";
    console.error("[send-code]", message);
    return NextResponse.json(
      { error: "\u9a8c\u8bc1\u7801\u53d1\u9001\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5" },
      { status: 502 },
    );
  }

  const verificationToken = createVerificationToken(email, code);

  return NextResponse.json({
    ok: true,
    verificationToken,
    message: "\u9a8c\u8bc1\u7801\u5df2\u53d1\u9001\u5230\u60a8\u7684\u90ae\u7bb1",
  });
}
