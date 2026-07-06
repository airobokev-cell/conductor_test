"use client";

import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [supabase] = useState(() => createBrowserClient());

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-navy">
        <div className="max-w-sm w-full text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 border-2 border-gold rounded-full mb-4">
            <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="font-serif text-2xl font-medium text-white mb-2">Check Your Email</h1>
          <p className="text-white/60">
            We sent a magic link to <span className="text-gold">{email}</span>. Click it to sign in.
          </p>
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
          <h1 className="font-serif text-2xl font-medium text-white">Owner Login</h1>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium text-white/50 mb-1 tracking-wider uppercase"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@parkinboulder.com"
              required
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
            disabled={loading}
            className="w-full bg-gold hover:bg-gold-light disabled:bg-white/10 disabled:text-white/30 text-navy-dark font-semibold py-3 rounded-lg transition-colors tracking-wide"
          >
            {loading ? "Sending..." : "Send Magic Link"}
          </button>
        </form>
      </div>
    </div>
  );
}
