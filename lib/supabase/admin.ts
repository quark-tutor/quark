import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseSecretKey, supabaseUrl } from "@/lib/env";

// The service-role client. Bypasses row-level security, so every caller must scope its own
// queries. Used for the kid view's device lookups and pairing, and for writing the family's merged
// values (lib/family-save.ts), which no guardian may write directly.
export function createAdminClient() {
  return createClient(supabaseUrl(), supabaseSecretKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
