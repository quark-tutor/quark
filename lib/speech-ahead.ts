import "server-only";
import { say, TUTOR_VOICE } from "@/core/speech";
import { AHEAD_ACTION, type AheadDeps } from "@/core/wall/speech-ahead";
import { createAdminClient } from "@/lib/supabase/admin";
import { wallStore } from "@/lib/wall";

// The night's firing against the database and the voice: the real AheadDeps for core/wall/speech-ahead.ts, used by
// app/api/cron/speech/route.ts. A child's cards of the day and the bucket come from the wall's own store, so the
// firing reads exactly what a paired iPad would; the family, its children and the audit rows from the service role.
// Nothing on the kid path imports this file (lib/kid-wiring.test.ts).

type Reply = { data: unknown; error: { message: string } | null };
function must<R extends Reply>(r: R, what: string): NonNullable<R["data"]> {
  if (r.error) throw new Error(`${what}: ${r.error.message}`);
  if (r.data === null || r.data === undefined) throw new Error(`${what}: nothing came back`);
  return r.data as NonNullable<R["data"]>;
}

export function aheadDeps(env: Record<string, string | undefined> = process.env): AheadDeps {
  const db = createAdminClient();
  return {
    now: () => new Date(),
    sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),

    async families() {
      return must(await db.from("families").select("id, timezone"), "families") as { id: string; timezone: string }[];
    },

    async children(familyId) {
      return must(await db.from("children").select("id, nickname").eq("family_id", familyId), "children") as { id: string; nickname: string }[];
    },

    store: wallStore(),
    voice: { name: TUTOR_VOICE, say: (text) => say(text) },

    // No guardian did it, so guardian_id stays empty. Nothing in a row names a child.
    async audit(familyId, target) {
      const row = must(await db.from("audit_log").insert({ family_id: familyId, guardian_id: null, action: AHEAD_ACTION, target }).select("id").single(), "audit_log");
      return row.id as string;
    },

    // The key is checked for, never read out (core/speech/google.ts reads either).
    envProblem() {
      return env.GOOGLE_CREDENTIALS_JSON?.trim() || env.GOOGLE_APPLICATION_CREDENTIALS?.trim()
        ? null
        : "Google's key (GOOGLE_CREDENTIALS_JSON) isn't set where the firing runs";
    },
  };
}
