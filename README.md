# ParkInBoulder

Parking management platform for a 12-space lot in Boulder, CO.

**Stack:** Next.js + Supabase + Stripe + Twilio + Vercel

## Quick Start (Local Dev)

```bash
npm install
cp .env.local.example .env.local
# Fill in .env.local with your keys
npm run dev
```

## Go-Live Checklist

### 1. Supabase
- Create project at [supabase.com](https://supabase.com)
- Go to SQL Editor, paste contents of `supabase/migrations/001_initial_schema.sql`, Run
- Copy project URL, anon key, and service role key

### 2. Stripe
- Create account at [stripe.com](https://stripe.com)
- Get publishable + secret keys from Dashboard > Developers > API Keys
- Set up webhook:
  - Endpoint URL: `https://parkinboulder.com/api/webhooks/stripe`
  - Events: `checkout.session.completed`
  - Copy the webhook signing secret

### 3. Twilio
- Create account at [twilio.com](https://www.twilio.com)
- Get a phone number
- Copy Account SID, Auth Token, and phone number

### 4. Vercel
- Push this repo to GitHub
- Import in [vercel.com](https://vercel.com)
- Add environment variables (see `.env.local.example` for the full list)
- Set custom domain: `parkinboulder.com`

### 5. Bridge Script (on your local network)
```bash
cd bridge
cp .env.bridge.example .env.bridge
# Edit .env.bridge with Ubiquiti Protect credentials + API key
npx tsx index.ts
```

Run this on any machine on the same network as your Ubiquiti camera.

## Pricing

| Day | Rate | Enforced |
|-----|------|----------|
| Mon-Fri | $5/day | 8am-8pm |
| Sat-Sun | $15/day | 8am-10pm |
| Outside hours | Free | n/a |

Source of truth is `src/lib/pricing.ts` (hardcoded; the `pricing_rules` DB table is unused).
Verified live on parkinboulder.com 2026-07-04. Ops procedures + punch list: [OPERATIONS.md](OPERATIONS.md).

## Architecture

```
Parker scans QR > parkinboulder.com/pay > Stripe Checkout > webhook confirms payment
Camera reads plate > Protect LPR > bridge script > /api/plates > session created
Cron (daily 12:00 UTC per vercel.json, + ad-hoc after each plate detection)
  > find unpaid sessions past grace period > SMS alert to owner (once Twilio configured)
Owner > parkinboulder.com/dashboard > real-time lot view + violations + revenue
```
