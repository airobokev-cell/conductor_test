import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase";

const plateSchema = z.object({
  plate: z
    .string()
    .min(2)
    .max(10)
    .transform((s) => s.toUpperCase().trim()),
  timestamp: z.string().datetime().optional(),
  thumbnailUrl: z.string().url().nullable().optional(),
});

export async function POST(req: NextRequest) {
  // Authenticate bridge script
  const authHeader = req.headers.get("authorization");
  const expectedKey = process.env.BRIDGE_API_KEY;
  const cronSecret = process.env.CRON_SECRET;

  if (!expectedKey || authHeader !== `Bearer ${expectedKey}`) {
    return NextResponse.json(
      { error: "Unauthorized", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const parsed = plateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", code: "INVALID_INPUT" },
        { status: 400 }
      );
    }

    const { plate, timestamp, thumbnailUrl } = parsed.data;
    const supabase = createServiceClient();

    // Deduplicate: skip if same plate detected within last 5 minutes
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: existing } = await supabase
      .from("sessions")
      .select("id")
      .eq("plate", plate)
      .in("status", ["active", "paid"])
      .gte("entered_at", fiveMinAgo)
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json({
        deduplicated: true,
        sessionId: existing[0].id,
      });
    }

    // Check if there's an active paid session for this plate today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const { data: paidToday } = await supabase
      .from("sessions")
      .select("id")
      .eq("plate", plate)
      .eq("status", "paid")
      .gte("entered_at", todayStart.toISOString())
      .limit(1);

    if (paidToday && paidToday.length > 0) {
      // Already paid today, just log the re-entry
      return NextResponse.json({
        alreadyPaid: true,
        sessionId: paidToday[0].id,
      });
    }

    // Create new active session (no space assigned — camera doesn't know space)
    // Space will be assigned when parker pays via /pay
    const { data: session, error } = await supabase
      .from("sessions")
      .insert({
        space_id: 1, // Default; updated when parker pays
        plate,
        entered_at: timestamp || new Date().toISOString(),
        plate_image_url: thumbnailUrl || null,
        status: "active",
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to create session from plate detection:", error);
      return NextResponse.json(
        { error: "Failed to create session", code: "DB_ERROR" },
        { status: 500 }
      );
    }

    // Trigger async violation check for all overdue sessions
    // (replaces frequent cron — runs on each plate detection instead)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    fetch(`${appUrl}/api/alerts`, {
      headers: cronSecret ? { authorization: `Bearer ${cronSecret}` } : {},
    }).catch(() => {});

    return NextResponse.json({ created: true, sessionId: session.id });
  } catch (err) {
    console.error("Plates API error:", err);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
