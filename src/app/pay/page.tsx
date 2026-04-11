"use client";

import { useState } from "react";
import { getPricingForDate } from "@/lib/pricing";

const TOTAL_SPACES = 12;

export default function PayPage() {
  const [step, setStep] = useState<"space" | "details" | "loading">("space");
  const [selectedSpace, setSelectedSpace] = useState<number | null>(null);
  const [plate, setPlate] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const pricing = getPricingForDate(new Date());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSpace || !plate.trim()) return;

    setStep("loading");
    setError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spaceId: selectedSpace,
          plate: plate.trim().toUpperCase(),
          phone: phone.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setStep("details");
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch {
      setError("Network error. Please try again.");
      setStep("details");
    }
  }

  if (!pricing.isEnforced) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-sm w-full text-center">
          <h1 className="text-2xl font-bold mb-2">ParkInBoulder</h1>
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <p className="text-green-800 text-lg font-semibold">
              Free Parking Right Now
            </p>
            <p className="text-green-600 mt-2 text-sm">
              Paid parking is enforced{" "}
              {pricing.dayType === "weekday"
                ? "Mon–Fri 8am–8pm"
                : "Sat–Sun 8am–10pm"}
              .
            </p>
            <p className="text-green-600 text-sm">
              Enjoy your free parking!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-sm w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">ParkInBoulder</h1>
          <p className="text-gray-500 mt-1">
            {pricing.dayType === "weekday" ? "Weekday" : "Weekend"} parking
            &middot; {pricing.rateDisplay}/day
          </p>
        </div>

        {step === "space" && (
          <div>
            <p className="text-sm text-gray-600 mb-3 text-center">
              Select your space number
            </p>
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: TOTAL_SPACES }, (_, i) => i + 1).map(
                (num) => (
                  <button
                    key={num}
                    onClick={() => {
                      setSelectedSpace(num);
                      setStep("details");
                    }}
                    className="aspect-square rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 flex items-center justify-center text-lg font-semibold transition-colors"
                  >
                    {num}
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {(step === "details" || step === "loading") && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between">
              <span className="text-sm text-blue-800">
                Space {selectedSpace}
              </span>
              <button
                type="button"
                onClick={() => {
                  setStep("space");
                  setSelectedSpace(null);
                }}
                className="text-sm text-blue-600 underline"
              >
                Change
              </button>
            </div>

            <div>
              <label
                htmlFor="plate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                License Plate
              </label>
              <input
                id="plate"
                type="text"
                value={plate}
                onChange={(e) => setPlate(e.target.value.toUpperCase())}
                placeholder="ABC-1234"
                required
                maxLength={10}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-lg tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone for receipt{" "}
                <span className="text-gray-400">(optional)</span>
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={step === "loading" || !plate.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition-colors text-lg"
            >
              {step === "loading"
                ? "Loading..."
                : `Pay ${pricing.rateDisplay}`}
            </button>

            <p className="text-xs text-gray-400 text-center">
              Valid all day until{" "}
              {pricing.enforceEnd === 20 ? "8:00 PM" : "10:00 PM"}.
              No refunds.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
