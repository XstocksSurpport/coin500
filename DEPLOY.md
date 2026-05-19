# Deploy Aegisai

Code is on [GitHub](https://github.com/XstocksSurpport/coin500). **No API keys or wallets are in the repository.**

## 1. Make the repo private (recommended)

GitHub → **Settings** → **General** → **Danger Zone** → **Change visibility** → **Private**.

## 2. Deploy on Render (free)

1. [render.com](https://render.com) → **New** → **Blueprint** → connect `XstocksSurpport/coin500`
2. Set environment variables:

| Variable | Value |
|----------|--------|
| `RESEND_API_KEY` | Your Resend key |
| `EMAIL_FROM` | `Aegisai <noreply@aegisai.sbs>` |
| `AUTH_SECRET` | Random 32+ char string |
| `NEXT_PUBLIC_EVM_WALLET_ADDRESS` | Your EVM deposit address |
| `NEXT_PUBLIC_SOL_WALLET_ADDRESS` | Your Solana deposit address |

3. Deploy → use the `*.onrender.com` URL

## 3. Or deploy on Vercel

1. [vercel.com/new](https://vercel.com/new) → Import `XstocksSurpport/coin500`
2. Add the same environment variables as above
3. Deploy
