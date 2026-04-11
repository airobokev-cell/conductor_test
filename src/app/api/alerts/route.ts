import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getPricingForDate } from "@/lib/pricing";
import { sendSMS } from "@/lib/twilio";

const GRACE_PERIOD_MINUTES = 15;

// Called by Vercel Cron every 5 minutes during enforce hours
// vercel.json: { "crons": [{ "path": "/api/alerts", "schedule": "*/5 * * * *" }] }
export async function GET(req: NextRequest) {
  // Verify cron secret (Vercel sends this header for cron jobs)
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: "Unauthorized", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const pricing = getPricingForDate(new Date());

  // Don't run outside enforce hours
  if (!pricing.isEnforced) {
    return NextResponse.json({ skipped: true, reason: "outside_enforce_hours" });
  }

  const supabase = createServiceClient();
  const ownerPhone = process.env.OWNER_PHONE_NUMBER;

  // Find active (unpaid) sessions past the grace period
  const graceThreshold = new Date(
    Date.now() - GRACE_PERIOD_MINUTES * 60 * 1000
  ).toISOString();

  const { data: unpaidSessions, error } = await supabase
    .from("sessions")
    .select("id, plate, space_id, entered_at, plate_image_url")
    .eq("status", "active")
    .lt("entered_at", graceThreshold);

  if (error) {
    console.error("Failed to query unpaid sessions:", error);
    return NextResponse.json(
      { error: "Database error", code: "DB_ERROR" },
      { status: 500 }
    );
  }

  if (!unpaidSessions || unpaidSessions.length === 0) {
    return NextResponse.json({ violations: 0 });
  }

  let alertsSent = 0;

  for (const session of unpaidSessions) {
    // Check if violation already exists for this session
    const { data: existingViolation } = await supabase
      .from("violations")
      .select("id")
      .eq("session_id", session.id)
      .limit(1);

    if (existingViolation && existingViolation.length > 0) {
      continue; // Already flagged
    }

    // Create violation record
    const { error: violationError } = await supabase
      .from("violations")
      .insert({
        session_id: session.id,
        type: "unpaid",
        alerted_at: new Date().toISOString(),
      });

    if (violationError) {
      console.error("Failed to create violation:", violationError);
      continue;
    }

    // Update session status
    await supabase
      .from("sessions")
      .update({ status: "violation" })
      .eq("id", session.id);

    // Send SMS alert to owner
    if (ownerPhone) {
      const minutesParked = Math.round(
        (Date.now() - new Date(session.entered_at).getTime()) / 60000
      );

      try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://parkinboulder.com";
        await sendSMS(
          ownerPhone,
          `UNPAID: Plate ${session.plate}, Space ${session.space_id}, ${minutesParked} min. View: ${appUrl}/dashboard`
        );
        alertsSent++;
      } catch (smsErr) {
        console.error("Failed to send violation SMS:", smsErr);
        // Don't fail the cron for SMS errors — violation is still recorded
      }
    }
  }

  return NextResponse.json({
    violations: unpaidSessions.length,
    alertsSent,
  });
}
