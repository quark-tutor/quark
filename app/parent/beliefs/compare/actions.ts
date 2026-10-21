"use server";

import { audit } from "@/lib/audit";
import { isPoint } from "@/lib/beliefs";
import { saveFamilyValues } from "@/lib/family-save";
import { requireGuardian } from "@/lib/guardian";
import { createClient } from "@/lib/supabase/server";

// Blackballs, from the beliefs and compare screens (founding rule 2): any guardian can block a subject, and
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
      await audit(guardian, "blackball.place", { blackball_id: placed.data.id, point });
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
    await audit(guardian, "blackball.lift", { blackball_id: id, point: lifted.data[0].point_number });
    await saveFamilyValues(guardian.familyId, guardian.id);
    return {};
  } catch (e) {
    return { error: `Couldn't lift that: ${message(e)}` };
  }
}
