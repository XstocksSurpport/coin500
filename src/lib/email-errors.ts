/** Map provider errors to user-facing Chinese messages. */
export function mapEmailSendError(message: string): string {
  const lower = message.toLowerCase();

  const allowed = message.match(
    /your own email address \(([^)]+)\)/i,
  )?.[1];
  if (allowed || lower.includes("only send testing emails")) {
    return allowed
      ? `Resend 测试模式仅支持向 ${allowed} 发送验证码，请使用该邮箱登录；或到 resend.com/domains 验证域名后可发送到任意邮箱`
      : "Resend 测试模式仅支持向注册邮箱发送，请使用 Resend 账号邮箱登录";
  }

  if (lower.includes("invalid api key") || lower.includes("unauthorized")) {
    return "邮件 API 密钥无效，请检查 RESEND_API_KEY";
  }

  if (lower.includes("domain") && lower.includes("verify")) {
    return "发件域名未验证，请在 Resend 完成域名验证后重试";
  }

  return "验证码发送失败，请稍后重试";
}
