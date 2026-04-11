"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center">
        <div className="text-5xl mb-4">&#x2705;</div>
        <h1 className="text-2xl font-bold mb-2">Payment Confirmed</h1>
        <p className="text-gray-600 mb-6">
          Your parking is paid for the day. Enjoy Boulder!
        </p>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
          <p>Your vehicle is registered and you&apos;re all set.</p>
          <p className="mt-1 text-green-600">
            A receipt has been sent if you provided a phone number.
          </p>
        </div>
        {sessionId && (
          <p className="text-xs text-gray-400 mt-4">
            Reference: {sessionId.slice(0, 8)}...
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
        <div className="flex-1 flex items-center justify-center p-6">
          Loading...
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
