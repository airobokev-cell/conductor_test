import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getStripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase";
import { getPricingForDate } from "@/lib/pricing";

const checkoutSchema = z.object({
  spaceId: z.number().int().min(1).max(12),
  plate: z
    .string()
    .min(2)
    .max(10)
    .transform((s) => s.toUpperCase().trim()),
  phone: z.string().nullable().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", code: "INVALID_INPUT" },
        { status: 400 }
      );
    }

    const { spaceId, plate, phone } = parsed.data;
    const pricing = getPricingForDate(new Date());

    if (!pricing.isEnforced) {
      return NextResponse.json(
        { error: "Parking is free right now", code: "FREE_PARKING" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Create session record
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .insert({
        space_id: spaceId,
        plate,
        status: "active",
      })
      .select()
      .single();

    if (sessionError) {
      console.error("Failed to create session:", sessionError);
      return NextResponse.json(
        { error: "Failed to create parking session", code: "DB_ERROR" },
        { status: 500 }
      );
    }

    // Create Stripe Checkout Session
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const checkoutSession = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `ParkInBoulder - Space ${spaceId}`,
              description: `${pricing.dayType === "weekday" ? "Weekday" : "Weekend"} parking for plate ${plate}`,
            },
            unit_amount: pricing.rateCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        session_id: session.id,
        space_id: spaceId.toString(),
        plate,
        phone: phone || "",
      },
      success_url: `${appUrl}/pay/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pay`,
    });

    // Create payment record (pending)
    await supabase.from("payments").insert({
      session_id: session.id,
      stripe_session_id: checkoutSession.id,
      amount_cents: pricing.rateCents,
      status: "pending",
      phone: phone || null,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again.", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
