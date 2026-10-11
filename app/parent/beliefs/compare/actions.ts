"use server";

import { isPoint } from "@/lib/beliefs";
import { saveFamilyValues } from "@/lib/family-save";
import { requireGuardian } from "@/lib/guardian";
import { createClient } from "@/lib/supabase/server";

// Blackballs from the compare screen (founding rule 2): any guardian can block a subject, and
// only that guardian can lift it. Row-level security enforces the same.

type Result = { error?: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const message = (e: unknown) => (e instanceof Error ? e.message : String(e));

export async function placeBlackball(point: number): Promise<Result> {
  if (!isPoint(point)) return { error: "Bad request." };
  const guardian = await requireGuardian();
  if (!guardian) return { error: "This account isn't a guardian." };
  const supabase = await createClient();
  try {
    const existing = await supabase
      .from("blackballs")
      .select("id")
      .eq("point_number", point)
      .eq("placed_by", guardian.id)
      .is("lifted_at", null);
    if (existing.error) throw new Error(existing.error.message);
    if (!existing.data.length) {
      const placed = await supabase
        .from("blackballs")
        .insert({ family_id: guardian.familyId, point_number: point, placed_by: guardian.id })
        .select("id")
        .single();
      if (placed.error) throw new Error(placed.error.message);
      const logged = await supabase.from("audit_log").insert({
        family_id: guardian.familyId,
        guardian_id: guardian.id,
        action: "blackball.place",
        target: { blackball_id: placed.data.id, point },
      });
      if (logged.error) throw new Error(logged.error.message);
    }
    await saveFamilyValues(guardian.familyId, guardian.id);
    return {};
  } catch (e) {
    return { error: `Couldn't block that: ${message(e)}` };
  }
}

export async function liftBlackball(id: string): Promise<Result> {
  if (!UUID.test(id)) return { error: "Bad request." };
  const guardian = await requireGuardian();
  if (!guardian) return { error: "This account isn't a guardian." };
  const supabase = await createClient();
  try {
    const lifted = await supabase
      .from("blackballs")
      .update({ lifted_at: new Date().toISOString() })
      .eq("id", id)
      .eq("placed_by", guardian.id)
      .is("lifted_at", null)
      .select("point_number");
    if (lifted.error) throw new Error(lifted.error.message);
    if (!lifted.data.length) return { error: "Only the parent who blocked it can lift it." };
    const logged = await supabase.from("audit_log").insert({
      family_id: guardian.familyId,
      guardian_id: guardian.id,
      action: "blackball.lift",
      target: { blackball_id: id, point: lifted.data[0].point_number },
    });
    if (logged.error) throw new Error(logged.error.message);
    await saveFamilyValues(guardian.familyId, guardian.id);
    return {};
  } catch (e) {
    return { error: `Couldn't lift that: ${message(e)}` };
  }
}
