#!/usr/bin/env npx tsx
/**
 * ParkInBoulder Bridge Script
 *
 * Polls Ubiquiti Protect for license plate detection events
 * and forwards them to the ParkInBoulder API.
 *
 * Usage:
 *   cp .env.bridge.example .env.bridge
 *   # Edit .env.bridge with your Protect and API credentials
 *   npx tsx bridge/index.ts
 *
 * Environment variables:
 *   PROTECT_HOST     - Ubiquiti Protect controller IP/hostname
 *   PROTECT_USERNAME - Protect login username
 *   PROTECT_PASSWORD - Protect login password
 *   API_URL          - ParkInBoulder API URL (e.g., https://parkinboulder.com)
 *   BRIDGE_API_KEY   - API key for authenticating with /api/plates
 *   POLL_INTERVAL_MS - How often to poll for new events (default: 10000)
 */

import * as fs from "fs";
import * as path from "path";

// Load .env.bridge
const envPath = path.join(__dirname, ".env.bridge");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

const PROTECT_HOST = process.env.PROTECT_HOST!;
const PROTECT_USERNAME = process.env.PROTECT_USERNAME!;
const PROTECT_PASSWORD = process.env.PROTECT_PASSWORD!;
const API_URL = process.env.API_URL!;
const BRIDGE_API_KEY = process.env.BRIDGE_API_KEY!;
const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL_MS || "10000", 10);

let authToken: string | null = null;
let lastEventTimestamp = Date.now();

async function loginToProtect(): Promise<string> {
  const res = await fetch(`https://${PROTECT_HOST}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: PROTECT_USERNAME,
      password: PROTECT_PASSWORD,
    }),
    // Ubiquiti uses self-signed certs
  });

  if (!res.ok) {
    throw new Error(`Protect login failed: ${res.status} ${res.statusText}`);
  }

  const token = res.headers.get("authorization");
  if (!token) throw new Error("No authorization token in login response");

  console.log("[bridge] Logged into Ubiquiti Protect");
  return token;
}

async function fetchPlateEvents(): Promise<
  Array<{ plate: string; timestamp: string; thumbnailUrl?: string }>
> {
  if (!authToken) {
    authToken = await loginToProtect();
  }

  const since = lastEventTimestamp;
  const res = await fetch(
    `https://${PROTECT_HOST}/proxy/protect/api/events?type=licensePlate&start=${since}&orderDirection=ASC`,
    {
      headers: { Authorization: `Bearer ${authToken}` },
    }
  );

  if (res.status === 401) {
    // Re-authenticate
    authToken = await loginToProtect();
    return fetchPlateEvents();
  }

  if (!res.ok) {
    console.error(`[bridge] Protect API error: ${res.status}`);
    return [];
  }

  const events = await res.json();

  return events.map(
    (e: { metadata?: { licensePlate?: { name?: string } }; start?: number; thumbnail?: string }) => ({
      plate: e.metadata?.licensePlate?.name || "UNKNOWN",
      timestamp: new Date(e.start || Date.now()).toISOString(),
      thumbnailUrl: e.thumbnail
        ? `https://${PROTECT_HOST}/proxy/protect/api/thumbnails/${e.thumbnail}`
        : undefined,
    })
  );
}

async function sendToAPI(plate: string, timestamp: string, thumbnailUrl?: string) {
  const res = await fetch(`${API_URL}/api/plates`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${BRIDGE_API_KEY}`,
    },
    body: JSON.stringify({ plate, timestamp, thumbnailUrl: thumbnailUrl || null }),
  });

  const data = await res.json();

  if (data.deduplicated) {
    console.log(`[bridge] ${plate} — deduplicated (already tracked)`);
  } else if (data.alreadyPaid) {
    console.log(`[bridge] ${plate} — already paid today`);
  } else if (data.created) {
    console.log(`[bridge] ${plate} — new session created: ${data.sessionId}`);
  } else if (!res.ok) {
    console.error(`[bridge] API error for ${plate}:`, data);
  }
}

async function poll() {
  try {
    const events = await fetchPlateEvents();

    for (const event of events) {
      await sendToAPI(event.plate, event.timestamp, event.thumbnailUrl);
      lastEventTimestamp = Math.max(
        lastEventTimestamp,
        new Date(event.timestamp).getTime() + 1
      );
    }

    if (events.length > 0) {
      console.log(`[bridge] Processed ${events.length} plate event(s)`);
    }
  } catch (err) {
    console.error("[bridge] Poll error:", err);
  }
}

// Main loop
console.log(`[bridge] Starting ParkInBoulder bridge`);
console.log(`[bridge] Protect host: ${PROTECT_HOST}`);
console.log(`[bridge] API: ${API_URL}`);
console.log(`[bridge] Poll interval: ${POLL_INTERVAL}ms`);

poll(); // Initial poll
setInterval(poll, POLL_INTERVAL);
