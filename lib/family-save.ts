import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { familyRulebook, loadFamilyInputs, loadHandoffs } from "./family-rulebook.ts";

// The save that writes one family's merged values and rulebook. The loading, the merge and the
// rendering live in lib/family-rulebook.ts, which the gate shares; the compare page loads with the
// guardian's own client (row-level security scopes it), and the save uses the service role, since
// only the server writes the family's values.

export { loadFamilyInputs, merge, type FamilyInputs } from "./family-rulebook.ts";

function check<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return result.data as T;
}

// Merge every guardian's answers and write the family's values and rulebook, if anything changed.
// Called after any guardian changes an answer, a conduct item or a blackball.
export async function saveFamilyValues(familyId: string, guardianId: string | null): Promise<void> {
  const db = createAdminClient();
  const [inputs, entries, current] = await Promise.all([
    loadFamilyInputs(db, familyId),
    loadHandoffs(db),
    db.from("values_profiles").select("source_hash").eq("family_id", familyId).maybeSingle(),
  ]);
  const { values, fields, settings, ages, conduct, hash } = familyRulebook(inputs, entries);
  if (check(current)?.source_hash === hash) return;

  const version = check(
    await db.rpc("replace_family_values", {
      p_family: familyId,
      p_profile: { ...fields, source_hash: hash },
      p_settings: settings,
      p_ages: ages,
      p_conduct: conduct,
    }),
  );
  const count = (status: string) => values.points.filter((p) => p.status === status).map((p) => p.point);
  const logged = await db.from("audit_log").insert({
    family_id: familyId,
    guardian_id: guardianId,
    action: "values.save",
    target: { version, agreed: count("agreed").length, differ: count("differ"), waiting: count("waiting").length, blocked: count("blocked") },
  });
  if (logged.error) throw new Error(logged.error.message);
}
