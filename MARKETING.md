# ParkInBoulder Marketing Playbook

Goal: rank first for Boulder parking searches — map pack, organic, paid.
Companion to OPERATIONS.md. On-site SEO shipped July 2026 (see git history).
Canonical NAP lives in `src/lib/business.ts` — **never hand-type the address**:

> **ParkInBoulder · 1144 Mapleton Ave, Boulder, CO 80304**
> No public phone (deliberate). Geo: 40.02072, -105.28164
> Hours: Mon–Fri 8am–8pm · Sat–Sun 8am–10pm · $5/day weekday, $15/day weekend
> Site: https://parkinboulder.com

---

## 1. Kevin's activation checklist (everything is env-gated and ships dark until these are set)

| # | Action | Where | Unlocks |
|---|--------|-------|---------|
| 1 | Create GA4 property → copy `G-XXXXXXXXXX` id | analytics.google.com | Set `NEXT_PUBLIC_GA_ID` in Vercel env → gtag + purchase conversions |
| 2 | Verify parkinboulder.com in Search Console (DNS TXT via Vercel domains, or set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` meta token) → submit sitemap.xml | search.google.com/search-console | Rank tracking, indexing requests |
| 3 | Bing Webmaster Tools → "Import from GSC" (one click) | bing.com/webmasters | Bing/DuckDuckGo indexing |
| 4 | Enable Web Analytics on the Vercel project | Vercel dashboard → chennai → Analytics | Zero-config traffic sanity check |
| 5 | Link GA4 ↔ Google Ads (account 5024995293), import `purchase` as a conversion | GA4 Admin → Product links | Ads bidding on real revenue |
| 6 | GBP: get the "write a review" short link | business.google.com → "Ask for reviews" | Set `NEXT_PUBLIC_GOOGLE_REVIEW_URL` + `GOOGLE_REVIEW_URL` in Vercel |
| 7 | Set Twilio env vars (OPERATIONS.md punch #4) | Vercel env | SMS receipts + review-request texts |
| 8 | Redeploy after env changes | Vercel | Everything above goes live |

After #8, verify: GA4 DebugView shows a `purchase` on a real $5 payment; review link appears on /pay/success.

---

## 2. Google Business Profile optimization (Kevin, ~1–2 h)

Profile exists — bring it to parity with the site:

- [ ] Primary category: **Parking lot** (no secondary categories needed)
- [ ] Address exactly `1144 Mapleton Ave, Boulder, CO 80304`; drag pin to the lot entrance on Mapleton
- [ ] Hours exactly: Mon–Fri 8:00am–8:00pm, Sat–Sun 8:00am–10:00pm (must match site schema)
- [ ] Website: `https://parkinboulder.com/?utm_source=google&utm_medium=organic&utm_campaign=gbp`
- [ ] Attributes: credit cards ✓, mobile/NFC payments ✓, no attendant
- [ ] Description: use `BUSINESS.description` from src/lib/business.ts verbatim
- [ ] 8–10 phone photos: entrance from street, signage, the QR sign up close, open spaces, view toward Pearl St, one at golden hour (Google favors fresh, real photos)
- [ ] Seed Q&A (owner asks + answers, mirroring site FAQ): cost? / how to pay? / all-day? / is it safe? / how far to Pearl Street?
- [ ] Post monthly (Claude drafts — see cadence below)

**Reviews — the map-pack lever.** SMS review request is wired in the Stripe
webhook once Twilio + `GOOGLE_REVIEW_URL` are set; /pay/success shows the link
too. Target a steady 2–4 reviews/month. **Never incentivize reviews** (free
days, discounts) — that violates Google policy and risks profile suspension;
the SMS copy was scrubbed of incentives for this reason. Reply to every review
within 48 h.

---

## 3. Google Ads build sheet (account 5024995293)

The gads MCP is read-only — create this in the Ads UI (~30 min). Current
account state (July 2026): one unrelated $5/day campaign ("Campaign #1"),
untouched by this.

**Campaign: `PIB-Search-Parking`**
- Type: Search · Budget: **$12/day** (own budget, not shared)
- Bidding: Maximize Clicks, max CPC limit **$2.50** → switch to tCPA after ~15–20 conversions
- Location: Boulder CO + 15 mi radius · **Presence only** (people IN Boulder, not searching about it from Denver)
- Ad schedule: Mon–Fri 6am–8pm, Sat–Sun 6am–10pm
- Networks: Google Search only (no Display, no search partners)
- Conversion goal: GA4-imported `purchase` (value-enabled)
- Sitelinks: Location & Directions → /location · Compare Rates → /rates · Pay Now → /pay
- Assets: Location asset via GBP link; callouts: "No App Needed", "Pay In 30 Seconds", "24/7 Cameras", "Flat Daily Rate"

**Ad group 1 — Downtown Boulder** (phrase + exact)
"parking downtown boulder", "downtown boulder parking", "parking in boulder", "boulder parking lot", "where to park in boulder", "all day parking boulder"

**Ad group 2 — Pearl Street** (phrase + exact)
"pearl street parking", "parking near pearl street", "pearl street mall parking", "parking near pearl street mall boulder"

**Ad group 3 — Cheap/Daily** (phrase + exact)
"cheap parking boulder", "daily parking boulder", "boulder parking rates", "$5 parking boulder", "affordable parking boulder"

**Campaign-level negatives** (phrase):
free, permit, CU, university, campus, colorado university, airport, DIA, overnight, monthly, long term, RV, trailer, denver, longmont, louisville, ticket, appeal, fine, pay ticket, garage sale, chautauqua, trailhead, job, hiring

**RSA copy (2 per ad group; rotate headlines across groups):**
- Headlines: `$5/Day Parking In Boulder` · `Parking Near Pearl Street` · `Downtown Boulder Parking` · `Pay Online In 30 Seconds` · `No App. No Meter. No Coins.` · `Flat Rate — Park All Day` · `12-Space Lot, Live Availability` · `Cameras + Plate Recognition` · `Cheapest Daily Rate Downtown` · `3 Blocks From Pearl Street`
- Descriptions: `Flat $5/day on weekdays — less than one hour at a meter. Scan, pay by card, done.` · `12 spaces at 1144 Mapleton Ave, a 5-minute walk to Pearl Street Mall. Check live availability.` · `No app downloads, no account. QR code payment takes 30 seconds. 24/7 camera security.` · `Skip the garage ramps and meter feeding. Pay once, park all day, walk everywhere downtown.`
- Final URL: homepage for groups 1 & 3; **/location for the Pearl Street group**

Weekly monitoring (Claude): GAQL pull via gads MCP + `/search-term-mining` for negatives + `/campaign-optimizer` review.

---

## 4. Citations (free directories, exact NAP, no phone)

Order of value. Use the NAP block at the top verbatim; description from business.ts.

1. **Apple Business Connect** (businessconnect.apple.com) — Apple Maps; every iPhone driver
2. **Bing Places** (bingplaces.com) — choose "Import from Google Business Profile"
3. **Parkopedia** (parkopedia.com, "Add parking") — feeds in-car navs + parking apps; include rates $5 weekday / $15 weekend, hours, 12 spaces
4. **Yelp** (biz.yelp.com) — category Parking; same photos as GBP
5. **Waze Map Editor** — confirm the lot exists as a parking-lot area POI named ParkInBoulder
6. **Nextdoor business page** (optional) — Mapleton Hill neighbors are the wordof-mouth engine

Skipped intentionally: SpotHero/ParkWhiz (commission apps — Kevin's call).

---

## 5. Ongoing cadence (~30 min/week, Claude does the work)

- **Weekly**: GAQL performance pull; search-term mining → new negatives; GSC query check once verified
- **Monthly**: GBP post (event-themed — Farmers Market opener, Bands on the Bricks, holiday lights) + 1–2 fresh photos; incognito rank spot-check ("parking downtown boulder", "pearl street parking", "cheap parking boulder")
- **Always**: review replies within 48 h (Claude drafts, Kevin approves)
- **60/90-day targets**: top-3 organic for "downtown boulder parking"; map-pack presence for "parking near pearl street"; ads ≥10% impression share on exact-match core terms

## Verification status (2026-07-06)
- [x] Working tree committed & pushed; prod verified $5/$15 (Gate A closed)
- [x] **Git→Vercel integration LIVE**: project "chennai" connected to
      github.com/airobokev-cell/conductor_test, production branch
      `airobokev-cell/gstack-quickstart` — every push now deploys. (Old failure mode —
      CLI deploys from an uncommitted working tree — is gone; never deploy via CLI again.)
- [x] **Deployed & verified on parkinboulder.com**: 5-URL sitemap, /location /rates
      /events all 200, LocalBusiness schema w/ full address + corrected geo, $5/$15 intact
- [x] GA4/Vercel Analytics/GSC verification/review link code live but dark (env-gated)
- [x] gads MCP access verified (read-only)
- [ ] Kevin activation checklist §1 (GA4 property, GSC, Bing, GA4↔Ads link, review URL, Twilio)
- [ ] GBP §2 · Ads build §3 · Citations §4
