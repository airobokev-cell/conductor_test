"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { sendGAEvent } from "@next/third-parties/google";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const amountCents = parseInt(searchParams.get("amount") || "0", 10);

  useEffect(() => {
    if (!sessionId || !process.env.NEXT_PUBLIC_GA_ID) return;
    // transaction_id dedupes the event across refreshes of this page
    sendGAEvent("event", "purchase", {
      transaction_id: sessionId,
      value: amountCents / 100,
      currency: "USD",
    });
  }, [sessionId, amountCents]);

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-navy">
      <div className="max-w-sm w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 border-2 border-gold rounded-full mb-4">
          <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="font-serif text-2xl font-medium text-white mb-2">Payment Confirmed</h1>
        <p className="text-white/60 mb-6">
          Your parking is paid for the day. Enjoy Boulder!
        </p>
        <div className="bg-navy-light border border-gold/20 rounded-lg p-4 text-sm">
          <p className="text-white/70">Your vehicle is registered and you&apos;re all set.</p>
          <p className="mt-1 text-white/40">
            A receipt has been sent if you provided a phone number.
          </p>
        </div>
        {process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL && (
          <a
            href={process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-6 text-sm text-gold underline underline-offset-4 hover:text-gold/80"
          >
            Enjoying the easiest parking in Boulder? Rate us on Google
          </a>
        )}
        {sessionId && (
          <p className="text-xs text-white/20 mt-4 font-mono">
            Ref: {sessionId.slice(0, 8)}
          </p>
        )}
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center p-6 bg-navy">
          <p className="text-white/40">Loading...</p>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
