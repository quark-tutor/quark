"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { audit } from "@/lib/audit";
import { checkSetting, placeOf, timesRungs, type Setting } from "@/lib/boat-setting";
import { requireGuardian } from "@/lib/guardian";
import { generatePairingCode, hashSecret } from "@/lib/pairing";
import { createClient } from "@/lib/supabase/server";

export type PairingState = {
  code?: string;
  nickname?: string;
  expiresAt?: string;
  error?: string;
};

// Make a six-digit code that pairs the next iPad to type it with this child.
export async function createPairingCode(_prev: PairingState, formData: FormData): Promise<PairingState> {
  const guardian = await requireGuardian();
  if (!guardian) return { error: "This account isn't a guardian." };

  const childId = String(formData.get("childId") ?? "");
  const supabase = await createClient();
  const { data: child } = await supabase.from("children").select("id, nickname").eq("id", childId).maybeSingle();
  if (!child) return { error: "Pick a child first." };

  const code = generatePairingCode();
  const { data, error } = await supabase
    .from("device_pairings")
    .insert({
      family_id: guardian.familyId,
      child_id: child.id,
      code_hash: hashSecret(code),
      created_by: guardian.id,
    })
    .select("expires_at")
    .single();
  if (error) return { error: `Couldn't make a code: ${error.message}` };

  return { code, nickname: child.nickname, expiresAt: data.expires_at };
}

// "Forget this iPad": the iPad's cookie stops working on its next request.
export async function forgetDevice(deviceId: string) {
  const guardian = await requireGuardian();
  if (!guardian) return;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("devices")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", deviceId)
    .is("revoked_at", null)
    .select("id, child_id");
  if (error) throw error;

  if (data.length > 0) await audit(guardian, "device.forget", { device_id: deviceId, child_id: data[0].child_id });
  refresh();
}

// The trading boat's switch (docs/trading-boat-2-slice.md): any guardian turns it on or off for the family (rule 2),
// through the guardian's own session, which row-level security keeps to the family's row; the server writes the audit
// row. On, the Math tile takes Puzzle's place on the wall; off, Puzzle is back at once and each boy's game waits.
export async function setBoat(on: boolean) {
  const guardian = await requireGuardian();
  if (!guardian) return;

  const supabase = await createClient();
  const { data, error } = await supabase.from("families").update({ boat_on: on }).eq("id", guardian.familyId).select("id");
  if (error) throw error;

  if (data.length > 0) await audit(guardian, "boat.switch", { on });
  refresh();
}

export type BoatTablesState = { error?: string; saved?: boolean };

// The family's times tables for the boat: one setting, written as the same mastery.place on each times-table rung for
// every child, so both boys have the same prices. A setting that would let a crate lose money is refused, saying why
// (lib/boat-setting.ts). Not yet is a place of null, so nothing is deleted. The audit row holds the setting, never a
// child.
export async function setBoatTables(_prev: BoatTablesState, formData: FormData): Promise<BoatTablesState> {
  const guardian = await requireGuardian();
  if (!guardian) return { error: "This account isn't a guardian." };

  const supabase = await createClient();
  const [skills, kids] = await Promise.all([
    supabase.from("skills").select("id, key, name, position, ladder").eq("kind", "rung").not("key", "is", null),
    supabase.from("children").select("id"),
  ]);
  if (skills.error) return { error: `Couldn't read the times tables: ${skills.error.message}` };
  if (kids.error) return { error: `Couldn't read the children: ${kids.error.message}` };
  const rungs = timesRungs(skills.data);
  if (rungs.length === 0) return { error: "The math ladder isn't loaded on this copy of Quark yet." };

  const setting: Setting = new Map(rungs.map((r) => [r.key, placeOf(formData.get(r.key))]));
  const check = checkSetting(rungs, setting);
  if ("error" in check) return { error: check.error };

  const at = new Date().toISOString();
  const rows = kids.data.flatMap((kid) => rungs.map((r) => ({ child_id: kid.id, skill_id: r.id, place: setting.get(r.key) ?? null, updated_at: at })));
  if (rows.length) {
    const { error } = await supabase.from("mastery").upsert(rows, { onConflict: "child_id,skill_id" });
    if (error) return { error: `Couldn't save: ${error.message}` };
  }

  await audit(guardian, "boat.tables", { places: Object.fromEntries(setting) });
  refresh();
  return { saved: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}
