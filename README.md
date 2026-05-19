# Coin500

Professional crypto trading terminal UI (demo). Reference layout similar to Plus500.

## Features

- **Primary market**: Live Solana meme tokens via DexScreener (browser fetch). Optional `AVE_API_KEY` in `.env.local` for Ave.ai meme ranks on the server.
- **Secondary market**: Top 50 USDT pairs from Binance
- **Real email login**: 6-digit verification code sent to inbox (Resend or SMTP)
- Deposit addresses configured via environment variables (not in source)
- **Deposit** across major EVM networks (UI only)
- Candlestick chart with Binance klines for secondary market

## Run

```bash
cd coin500
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001).

## Email login setup (required for real login)

Copy `.env.example` to `.env.local` and configure **one** email provider:

### Option A: Resend (recommended)

1. Register at [resend.com](https://resend.com)
2. Create an API key and verify your sending domain (or use `onboarding@resend.dev` for testing to your own account email)
3. Add to `.env.local`:

```env
RESEND_API_KEY=re_xxxx
EMAIL_FROM=Coin500 <onboarding@resend.dev>
AUTH_SECRET=use-a-long-random-string
```

### Option B: SMTP (QQ / 163 / Gmail)

```env
SMTP_HOST=smtp.qq.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your@qq.com
SMTP_PASS=your-smtp-authorization-code
EMAIL_FROM=Coin500 <your@qq.com>
AUTH_SECRET=use-a-long-random-string
```

Restart `npm run dev` after changing env. Login flow: enter email → receive 6-digit code → verify → session kept 30 days on refresh.

## Optional Ave.ai data

Set `AVE_API_KEY` in `.env.local` for live primary market listings.
