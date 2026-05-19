import { Resend } from "resend";
import nodemailer from "nodemailer";
import { SITE_NAME } from "./constants";

function emailFrom(): string {
  return (
    process.env.EMAIL_FROM ?? `Aegisai <onboarding@resend.dev>`
  );
}

function buildHtml(code: string): string {
  return `
    <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #0051ff; margin-bottom: 8px;">${SITE_NAME}</h2>
      <p style="color: #374151;">您的登录验证码为：</p>
      <p style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #1f2937; margin: 24px 0;">${code}</p>
      <p style="color: #9ca3af; font-size: 13px;">验证码 10 分钟内有效，请勿泄露给他人。</p>
      <p style="color: #9ca3af; font-size: 13px;">如非本人操作，请忽略此邮件。</p>
    </div>
  `.trim();
}

async function sendViaResend(to: string, code: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_NOT_CONFIGURED");

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: emailFrom(),
    to: [to],
    subject: `${SITE_NAME} 登录验证码`,
    html: buildHtml(code),
  });

  if (error) {
    throw new Error(error.message);
  }
}

async function sendViaSmtp(to: string, code: string) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) throw new Error("SMTP_NOT_CONFIGURED");

  const port = Number(process.env.SMTP_PORT ?? "465");
  const secure = process.env.SMTP_SECURE !== "false";

  const transport = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  await transport.sendMail({
    from: emailFrom(),
    to,
    subject: `${SITE_NAME} 登录验证码`,
    html: buildHtml(code),
  });
}

export function isEmailConfigured(): boolean {
  if (process.env.RESEND_API_KEY) return true;
  if (
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  ) {
    return true;
  }
  return false;
}

export async function sendVerificationEmail(
  to: string,
  code: string,
): Promise<void> {
  if (process.env.RESEND_API_KEY) {
    await sendViaResend(to, code);
    return;
  }
  if (process.env.SMTP_HOST) {
    await sendViaSmtp(to, code);
    return;
  }
  throw new Error("EMAIL_NOT_CONFIGURED");
}
