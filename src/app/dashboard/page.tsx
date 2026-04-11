"use client";

import { useEffect, useState, useCallback } from "react";
import { createBrowserClient } from "@/lib/supabase-browser";

interface DashboardData {
  spaces: Array<{ id: number; label: string; status: string }>;
  sessions: Array<{
    id: string;
    space_id: number;
    plate: string;
    entered_at: string;
    status: string;
    payments: Array<{ amount_cents: number; status: string }>;
  }>;
  violations: Array<{
    id: string;
    created_at: string;
    sessions: { plate: string; space_id: number; entered_at: string };
  }>;
  todayRevenue: number;
  pricing: {
    rateDisplay: string;
    isEnforced: boolean;
    dayType: string;
  };
}

function minutesAgo(dateStr: string): number {
  return Math.round((Date.now() - new Date(dateStr).getTime()) / 60000);
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [supabase] = useState(() => createBrowserClient());

  const fetchDashboard = useCallback(async () => {
    const res = await fetch("/api/dashboard");
    if (res.ok) {
      setData(await res.json());
    }
  }, []);

  useEffect(() => {
    // Check auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setAuthed(true);
        fetchDashboard();
      } else {
        setAuthed(false);
      }
      setLoading(false);
    });

    // Listen for auth changes (magic link callback)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setAuthed(true);
        fetchDashboard();
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchDashboard, supabase]);

  // Real-time subscription for live updates
  useEffect(() => {
    if (!authed) return;

    const channel = supabase
      .channel("dashboard")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sessions" },
        () => fetchDashboard()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "violations" },
        () => fetchDashboard()
      )
      .subscribe();

    // Refresh every 60s as fallback
    const interval = setInterval(fetchDashboard, 60000);

    return () => {
      channel.unsubscribe();
      clearInterval(interval);
    };
  }, [authed, fetchDashboard, supabase]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!authed) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return null;
  }

  if (!data) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  const activeSessions = data.sessions.filter(
    (s) => s.status === "active" || s.status === "paid" || s.status === "violation"
  );

  const occupiedCount = activeSessions.length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">ParkInBoulder Dashboard</h1>
        <div className="flex items-center gap-3">
          <span
            className={`text-sm px-3 py-1 rounded-full ${
              data.pricing.isEnforced
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {data.pricing.isEnforced
              ? `Enforcing \u00b7 ${data.pricing.rateDisplay}`
              : "Free parking"}
          </span>
          <button
            onClick={() => {
              supabase.auth.signOut();
              window.location.href = "/login";
            }}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border rounded-xl p-4">
          <p className="text-sm text-gray-500">Occupancy</p>
          <p className="text-2xl font-bold">
            {occupiedCount}/12
          </p>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <p className="text-sm text-gray-500">Revenue Today</p>
          <p className="text-2xl font-bold">
            ${(data.todayRevenue / 100).toFixed(2)}
          </p>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <p className="text-sm text-gray-500">Active Violations</p>
          <p className={`text-2xl font-bold ${data.violations.length > 0 ? "text-red-600" : ""}`}>
            {data.violations.length}
          </p>
        </div>
      </div>

      {/* Space Grid */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Spaces</h2>
        <div className="grid grid-cols-4 gap-3">
          {data.spaces.map((space) => {
            const session = activeSessions.find(
              (s) => s.space_id === space.id
            );
            const isViolation = session?.status === "violation";
            const isPaid = session?.status === "paid";
            const isActive = session?.status === "active";

            let bgClass = "bg-green-50 border-green-200"; // open
            let statusLabel = "Open";

            if (isViolation) {
              bgClass = "bg-red-50 border-red-300";
              statusLabel = `${session.plate} \u00b7 UNPAID`;
            } else if (isActive) {
              bgClass = "bg-yellow-50 border-yellow-300";
              statusLabel = `${session.plate} \u00b7 ${minutesAgo(session.entered_at)}m`;
            } else if (isPaid) {
              bgClass = "bg-blue-50 border-blue-200";
              statusLabel = `${session.plate} \u00b7 Paid`;
            }

            return (
              <div
                key={space.id}
                className={`border-2 rounded-xl p-3 ${bgClass}`}
              >
                <p className="font-bold text-lg">{space.id}</p>
                <p className="text-xs truncate">{statusLabel}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Violations */}
      {data.violations.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-red-600">
            Active Violations
          </h2>
          <div className="space-y-2">
            {data.violations.map((v) => (
              <div
                key={v.id}
                className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold">
                    {v.sessions?.plate} &middot; Space{" "}
                    {v.sessions?.space_id}
                  </p>
                  <p className="text-sm text-red-600">
                    Parked {minutesAgo(v.sessions?.entered_at)} minutes, unpaid
                  </p>
                </div>
                <span className="text-xs text-red-500">
                  Alerted {minutesAgo(v.created_at)}m ago
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Sessions */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Today&apos;s Sessions</h2>
        {data.sessions.length === 0 ? (
          <p className="text-gray-500 text-sm">No sessions today.</p>
        ) : (
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2">Plate</th>
                  <th className="text-left px-4 py-2">Space</th>
                  <th className="text-left px-4 py-2">Entered</th>
                  <th className="text-left px-4 py-2">Status</th>
                  <th className="text-right px-4 py-2">Paid</th>
                </tr>
              </thead>
              <tbody>
                {data.sessions.map((s) => (
                  <tr key={s.id} className="border-t">
                    <td className="px-4 py-2 font-mono">{s.plate}</td>
                    <td className="px-4 py-2">{s.space_id}</td>
                    <td className="px-4 py-2">
                      {new Date(s.entered_at).toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          s.status === "paid"
                            ? "bg-green-100 text-green-700"
                            : s.status === "violation"
                              ? "bg-red-100 text-red-700"
                              : s.status === "active"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      {s.payments?.[0]?.status === "paid"
                        ? `$${(s.payments[0].amount_cents / 100).toFixed(2)}`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
