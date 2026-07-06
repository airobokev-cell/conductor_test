# ParkInBoulder — Operations Manual

The single operating doc for a **live revenue system**: production Stripe keys, real customers,
parkinboulder.com. Written 2026-07-04 from a full code/config audit + live-site verification.
Companion: [README.md](README.md) (setup/go-live), [TODOS.md](TODOS.md) (roadmap).

## 1. What it is

12-space parking lot in Boulder, CO. Parker scans QR → parkinboulder.com/pay → picks space,
enters plate (+ optional phone) → Stripe Checkout. A Ubiquiti Protect camera does license-plate
recognition; a local **bridge script** polls it and posts detections to the app; unpaid plates
past a grace period become violations and (once Twilio is configured) SMS the owner.

```
Camera (Protect LPR) ──poll 10s── bridge/index.ts (LOCAL machine) ──POST──▶ /api/plates
Parker ──/pay──▶ /api/checkout ──▶ Stripe Checkout ──webhook──▶ /api/webhooks/stripe
Vercel cron (daily 12:00 UTC) + ad-hoc after each plate ──▶ /api/alerts ──▶ violations (+SMS)
Owner ──magic-link login──▶ /dashboard (Supabase realtime: spaces/sessions/violations/revenue)
```

Stack: Next.js (App Router) on **Vercel** (project `chennai`, domain parkinboulder.com) ·
**Supabase** Postgres + auth + realtime · **Stripe** (LIVE keys) · Twilio (code ready,
**not configured**) · bridge = local TS script, no cloud copy.

**Canonical repo copy:** `~/conductor/workspaces/conductor_test-v1/chennai` (branch
`airobokev-cell/gstack-quickstart`, remote github.com/airobokev-cell/conductor_test). Sibling
conductor_test dirs are stale initial commits — do not work in them.

## 2. ⚠️ Verified production state (checked live 2026-07-04)

**parkinboulder.com serves $5/day weekday (8am–8pm) / $15/day weekend (8am–10pm).**
That matches the **uncommitted** working tree (src/lib/pricing.ts, src/app/page.tsx), NOT the
committed branch ($15/$25) and NOT README's table ($15/$25 — fixed 7/4/26 to $5/$15).
**Consequence: a redeploy from the committed branch would silently TRIPLE prices.**
→ Punch list #1.

## 3. Rules that live only in code (now written down)

| Rule | Value | Where |
|---|---|---|
| Pricing | weekday $5 (800–2000), weekend $15 (800–2200), **America/Denver**; free & unenforced outside hours (checkout returns `FREE_PARKING`) | src/lib/pricing.ts |
| Grace period | 15 min after camera entry before violation | src/app/api/alerts/route.ts |
| Plate dedupe | same plate within 5 min of an active/paid session → ignored | src/app/api/plates/route.ts |
| Already-paid | plate with a paid session since local midnight → no new session | api/plates |
| Violation sweep | cron `0 12 * * *` (= **daily 05:00/06:00 Denver — NOT "every 5 min"** as code comments claim; Hobby-plan limit) + fired ad-hoc after every plate detection; skips outside enforce hours | vercel.json + api/plates |
| Space occupancy | space → `occupied` ONLY via the Stripe webhook; webhook failure leaves it `open` (payment exists, space looks free) | api/webhooks/stripe |
| Session states | active → paid \| violation. `completed`/`exited` exist in types but **no code ever sets them** — sessions accumulate forever; "today" queries mask it | src/lib/types.ts |
| SMS failures | logged, never retried, never surfaced — silent | webhook + alerts routes |
| Auth | Supabase magic-link, single tier (owner or nobody) | /login |
| API auth | `/api/plates` Bearer BRIDGE_API_KEY (one shared key); CRON_SECRET **optional** — if unset, /api/alerts is open | route guards |
| Dead table | `pricing_rules` seeded ($15/$25!) but never read — pricing is hardcoded | supabase/migrations/001 |

## 4. Environment variables (`.env.local` live values; `.env.local.example` template)

| Var | State |
|---|---|
| SUPABASE URL / ANON / SERVICE_ROLE | set (prod project) |
| STRIPE_SECRET / PUBLISHABLE / WEBHOOK_SECRET | set — **sk_live/pk_live** |
| TWILIO_ACCOUNT_SID / AUTH_TOKEN / PHONE_NUMBER, OWNER_PHONE_NUMBER | **empty → all SMS dead** (receipts, review asks, violation alerts) |
| BRIDGE_API_KEY | set (64-char, shared with bridge) |
| GOOGLE_REVIEW_URL | empty (review-ask SMS disabled) |
| NEXT_PUBLIC_APP_URL | https://parkinboulder.com |
| Bridge (`bridge/.env.bridge`) | PROTECT_HOST/USERNAME/PASSWORD, API_URL, BRIDGE_API_KEY, POLL_INTERVAL_MS (10s) |

## 5. Incident playbook

**Camera/bridge down** (no detections): violations stop being generated (paid flow unaffected).
No monitoring exists — you find out by noticing silence. Check: bridge process running? machine
online? Protect creds valid? Detections lost while down are **gone** (no retry queue — TODOS).

**Stripe webhook failing** (payments succeed but sessions stay active → false violations):
Stripe Dashboard → Developers → Webhooks → check delivery attempts to
`/api/webhooks/stripe`; Stripe retries automatically. Common cause: rotated
STRIPE_WEBHOOK_SECRET mismatch. Fix env in Vercel, then resend failed events from Stripe.

**Refund/dispute** (false-positive plate, double charge): refund in Stripe Dashboard —
app has no refund UI and won't update session state; the day's revenue tile will overstate
until then. Nothing auto-reconciles Stripe ↔ Supabase.

**Vercel deploy broke something**: Vercel → Deployments → promote previous. Remember §2:
confirm the pricing in the artifact you roll back to.

**Supabase outage**: pay flow 500s at /api/checkout; camera detections lost (no queue).
Nothing to do but wait; afterwards scan Stripe for payments with no matching session.

**Backups: none configured.** Supabase free-tier has limited PITR. The only irreplaceable
data is payments/sessions history — export CSV occasionally or upgrade plan (punch list).

## 6. Known gaps (accepted for now)

No error tracking / uptime monitoring / alerting on the system itself · single shared bridge
key · no rate limiting on /api/plates · no data-retention policy · sessions never close
(states unreachable) · dashboard revenue = today only, no reporting/archive · 12 spaces
hardcoded · no holiday/event pricing (TODOS lists dynamic pricing as V2).

## 7. PUNCH LIST (fixes, ordered — for Codex/GPT-5.5 execution)

1. **CRITICAL — commit the deployed reality.** Working tree ($5/$15 pricing + robots/sitemap/
   lot-status + webhook/login/layout edits) is what production runs; commit & push so git ≥ prod.
   Verify with `git diff` that nothing unintended rides along; screenshot prod pricing after
   next deploy.
2. **Fix the cron story.** Decide intent: daily-noon-UTC (current) vs frequent sweeps. Update
   the "every 5 minutes" comments in api/alerts + README either way; if frequent sweeps are
   wanted on Hobby plan, note the plate-triggered ad-hoc call already approximates it.
3. **Set CRON_SECRET** in Vercel + env docs so /api/alerts isn't publicly triggerable.
4. **Wire Twilio** (TODOS "before full launch"): account, number, 4 env vars; add failure
   logging visible in dashboard rather than console-only.
5. **Delete or wire `pricing_rules`.** Either read pricing from the table (then fix its stale
   $15/$25 seed!) or drop it + remove from schema docs.
6. **Bridge retry queue** (TODOS V2): buffer detections locally when POST fails; replay on
   reconnect. Also document where the bridge actually runs (machine, restart procedure) — only
   Kevin knows (open question #2).
7. **Session lifecycle:** implement exit/complete transitions (e.g. nightly close-out job) or
   delete the dead states from types; add retention policy.
8. **Minimal monitoring:** Vercel log drain or Sentry free tier + a weekly Stripe↔Supabase
   reconciliation script; alert on webhook failure + bridge silence > N hours.
9. **Fix CLAUDE.md** — points at missing `@AGENTS.md`; either add AGENTS.md or inline repo
   guidance.
10. **Supabase backup**: enable scheduled export or plan upgrade; document restore.

## 8. Open questions only Kevin can answer

1. Is $5/$15 the intended permanent pricing, or an intro rate? (Prod says it's live either way.)
2. Where does the bridge run (hardware, location, auto-restart?) and is it running right now?
3. Is Twilio waiting on anything besides setup time? It gates violation alerts — the
   enforcement half of the product.
4. Any Boulder city/permit constraints worth documenting (signage, towing rules, ADA space)?
