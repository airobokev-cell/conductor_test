import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

export function createBrowserClient(): SupabaseClient {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // During SSR build, env vars may not be available.
    // Return a dummy client that will be replaced on the client side.
    // This code path only runs during static generation.
    return createClient("https://placeholder.supabase.co", "placeholder");
  }

  _client = createClient(url, key);
  return _client;
}
