"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
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

  if (data.length > 0) {
    await supabase.from("audit_log").insert({
      family_id: guardian.familyId,
      guardian_id: guardian.id,
      action: "device.forget",
      target: { device_id: deviceId, child_id: data[0].child_id },
    });
  }
  refresh();
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}
