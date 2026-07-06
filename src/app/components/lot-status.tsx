"use client";

import { useEffect, useState, useCallback } from "react";

const TOTAL_SPACES = 12;
const REFRESH_INTERVAL = 30000;

export default function LotStatus() {
  const [openSpaces, setOpenSpaces] = useState<number | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) return;
      const data = await res.json();

      const activeSessions = (data.sessions || []).filter(
        (s: { status: string }) =>
          s.status === "active" || s.status === "paid" || s.status === "violation"
      );

      setOpenSpaces(TOTAL_SPACES - activeSessions.length);
    } catch {
      // Silently fail — widget is non-critical
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  return (
    <div className="bg-navy-light border border-white/10 rounded-lg p-4 text-center">
      {openSpaces === null ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gold/50 animate-pulse" />
          <p className="text-white/40 text-sm tracking-wider">
            Checking availability&hellip;
          </p>
        </div>
      ) : (
        <>
          <p className="font-serif text-gold text-lg">
            {openSpaces} of {TOTAL_SPACES}{" "}
            <span className="text-white/60 text-sm font-sans">
              spaces open
            </span>
          </p>
          <p className="text-white/30 text-xs mt-1 tracking-wider uppercase">
            Live availability
          </p>
        </>
      )}
    </div>
  );
}
