import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Guardian } from "@/lib/guardian";

// One audit row for a guardian's change, written by the server. A guardian's own session can't insert
// into audit_log (20261021000000), so the rows the cron's lock and the /parent lines read can't be forged;
// guardian_id comes from requireGuardian(), never from the page.
export async function audit(guardian: Guardian, action: string, target: Record<string, unknown>): Promise<void> {
  const { error } = await createAdminClient()
    .from("audit_log")
    .insert({ family_id: guardian.familyId, guardian_id: guardian.id, action, target });
  if (error) throw new Error(error.message);
}
