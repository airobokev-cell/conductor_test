import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase";
import { sendSMS } from "@/lib/twilio";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing signature", code: "MISSING_SIGNATURE" },
      { status: 400 }
    );
  }

  let event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature", code: "INVALID_SIGNATURE" },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const checkoutSession = event.data.object;
    const supabase = createServiceClient();

    const sessionId = checkoutSession.metadata?.session_id;
    const plate = checkoutSession.metadata?.plate;
    const phone = checkoutSession.metadata?.phone;
    const spaceId = checkoutSession.metadata?.space_id;

    if (!sessionId) {
      console.error("Webhook missing session_id in metadata");
      return NextResponse.json({ received: true });
    }

    // Update payment to paid
    const { error: paymentError } = await supabase
      .from("payments")
      .update({ status: "paid" })
      .eq("stripe_session_id", checkoutSession.id);

    if (paymentError) {
      console.error("Failed to update payment:", paymentError);
    }

    // Get payment record to link to session
    const { data: payment } = await supabase
      .from("payments")
      .select("id")
      .eq("stripe_session_id", checkoutSession.id)
      .single();

    // Update session to paid
    const { error: sessionError } = await supabase
      .from("sessions")
      .update({
        status: "paid",
        payment_id: payment?.id || null,
      })
      .eq("id", sessionId);

    if (sessionError) {
      console.error("Failed to update session:", sessionError);
    }

    // Update space status
    if (spaceId) {
      await supabase
        .from("spaces")
        .update({ status: "occupied" })
        .eq("id", parseInt(spaceId));
    }

    // Send SMS receipt if phone provided
    if (phone) {
      try {
        const amount = (checkoutSession.amount_total || 0) / 100;
        await sendSMS(
          phone,
          `ParkInBoulder receipt: $${amount.toFixed(2)} paid for Space ${spaceId}, plate ${plate}. Valid all day. Thank you!`
        );
      } catch (smsErr) {
        console.error("Failed to send SMS receipt:", smsErr);
        // Don't fail the webhook for SMS errors
      }
    }
  }

  return NextResponse.json({ received: true });
}
