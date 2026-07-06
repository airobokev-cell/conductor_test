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

      window.location.href = data.url;
    } catch {
      setError("Network error. Please try again.");
      setStep("details");
    }
  }

  if (!pricing.isEnforced) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-navy">
        <div className="max-w-sm w-full text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 border-2 border-gold rounded-full mb-4">
            <span className="font-serif text-gold text-lg font-semibold">P</span>
          </div>
          <h1 className="font-serif text-2xl font-medium text-white mb-4">ParkInBoulder</h1>
          <div className="bg-navy-light border border-gold/20 rounded-lg p-6">
            <p className="text-gold text-lg font-serif font-medium">
              Lot Closed
            </p>
            <p className="text-white/60 mt-2 text-sm">
              Parking is available{" "}
              {pricing.dayType === "weekday"
                ? "Mon \u2013 Fri, 8am \u2013 8pm"
                : "Sat \u2013 Sun, 8am \u2013 10pm"}
            </p>
            <div className="w-8 h-px bg-gold/30 mx-auto my-3" />
            <p className="text-white/40 text-xs tracking-wide uppercase">
              No overnight parking
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-navy">
      <div className="max-w-sm w-full">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 border-2 border-gold rounded-full mb-3">
            <span className="font-serif text-gold text-lg font-semibold">P</span>
          </div>
          <h1 className="font-serif text-2xl font-medium text-white">ParkInBoulder</h1>
          <p className="text-gold-light text-sm mt-1 tracking-wide">
            {pricing.dayType === "weekday" ? "Weekday" : "Weekend"} parking &middot; {pricing.rateDisplay}/day
          </p>
        </div>

        {step === "space" && (
          <div>
            <p className="text-xs text-white/40 mb-3 text-center tracking-widest uppercase">
              Select your space
            </p>
            <div className="grid grid-cols-4 gap-2.5">
              {Array.from({ length: TOTAL_SPACES }, (_, i) => i + 1).map(
                (num) => (
                  <button
                    key={num}
                    onClick={() => {
                      setSelectedSpace(num);
                      setStep("details");
                    }}
                    className="aspect-square rounded-lg border border-white/10 bg-navy-light hover:border-gold hover:bg-navy-light/80 flex items-center justify-center text-lg font-serif text-white/80 hover:text-gold transition-all"
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
            <div className="bg-navy-light border border-gold/30 rounded-lg p-3 flex items-center justify-between">
              <span className="text-sm text-gold">
                Space {selectedSpace}
              </span>
              <button
                type="button"
                onClick={() => {
                  setStep("space");
                  setSelectedSpace(null);
                }}
                className="text-xs text-white/40 hover:text-white/60 tracking-wider uppercase"
              >
                Change
              </button>
            </div>

            <div>
              <label
                htmlFor="plate"
                className="block text-xs font-medium text-white/50 mb-1 tracking-wider uppercase"
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
                className="w-full rounded-lg border border-white/10 bg-navy-light px-4 py-3 text-lg tracking-wider uppercase text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-xs font-medium text-white/50 mb-1 tracking-wider uppercase"
              >
                Phone for receipt{" "}
                <span className="text-white/20">(optional)</span>
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="w-full rounded-lg border border-white/10 bg-navy-light px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50"
              />
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={step === "loading" || !plate.trim()}
              className="w-full bg-gold hover:bg-gold-light disabled:bg-white/10 disabled:text-white/30 text-navy-dark font-semibold py-3 rounded-lg transition-colors text-lg tracking-wide"
            >
              {step === "loading"
                ? "Loading..."
                : `Pay ${pricing.rateDisplay}`}
            </button>

            <p className="text-xs text-white/30 text-center">
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
