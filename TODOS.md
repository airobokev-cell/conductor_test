# TODOS — ParkInBoulder

## Before Full Launch

### Set up Twilio for SMS
Sign up at twilio.com with admin@parkinboulder.com, buy a US phone number, add Account SID, Auth Token, and phone number to Vercel env vars. Enables: violation SMS alerts to owner + payment receipt texts to parkers.
- **Effort:** S
- **Blocked by:** Nothing — can do anytime

## V2 Enhancements

### Live lot availability on landing page
Show real-time open/full status on parkinboulder.com so drivers know before arriving. Data already exists via Supabase real-time (space status). Just needs a small widget on the homepage.
- **Effort:** S
- **Depends on:** Phase 5 real-time infra

### Bridge script local retry queue
If the bridge script can't reach Vercel API, queue plate detections locally and retry when connectivity returns. Without this, plate detections are lost during network blips — a car could park unpaid with no violation triggered.
- **Effort:** S
- **Depends on:** Phase 3 bridge script

### Pre-filled plate recognition from camera
When parker loads /pay and selects a space, check if the camera recently detected a plate and pre-fill it. Reduces manual entry and creates a "magic moment." Matching heuristic: most recent unmatched plate detection within the last 15 minutes.
- **Effort:** M
- **Depends on:** Phase 3 plate detection working

### Dynamic event-day pricing
Set special pricing for specific dates (CU football games, Pearl Street events). Add pricing_overrides table keyed by date. Needs admin UI in dashboard for setting special dates + prices. Stopgap: manually update pricing_rules in Supabase DB.
- **Effort:** M
- **Depends on:** Phase 2 pricing logic + Phase 5 dashboard

### Monthly pass / subscription support
Offer frequent parkers a monthly subscription for unlimited parking. Plate-based validation — if plate has active subscription, auto-mark session as paid. Requires Stripe Billing integration, pass validation logic, admin UI.
- **Effort:** L
- **Depends on:** Full V1 complete
