import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getPricingForDate } from "@/lib/pricing";

export async function GET() {
  const supabase = createServiceClient();

  // Get all spaces with their current active/paid sessions
  const { data: spaces } = await supabase
    .from("spaces")
    .select("*")
    .order("id");

  // Get today's sessions
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data: sessions } = await supabase
    .from("sessions")
    .select("*, payments(*)")
    .gte("entered_at", todayStart.toISOString())
    .order("entered_at", { ascending: false });

  // Get active violations
  const { data: violations } = await supabase
    .from("violations")
    .select("*, sessions(*)")
    .is("resolved_at", null)
    .order("created_at", { ascending: false });

  // Revenue today
  const { data: payments } = await supabase
    .from("payments")
    .select("amount_cents")
    .eq("status", "paid")
    .gte("created_at", todayStart.toISOString());

  const todayRevenue = (payments || []).reduce(
    (sum, p) => sum + p.amount_cents,
    0
  );

  const pricing = getPricingForDate(new Date());

  return NextResponse.json({
    spaces: spaces || [],
    sessions: sessions || [],
    violations: violations || [],
    todayRevenue,
    pricing: {
      rateCents: pricing.rateCents,
      rateDisplay: pricing.rateDisplay,
      isEnforced: pricing.isEnforced,
      dayType: pricing.dayType,
    },
  });
}
