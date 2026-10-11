import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEVICE_COOKIE, hashSecret } from "@/lib/pairing";

export type Device = {
  id: string;
  familyId: string;
  childId: string;
  nickname: string;
};

// The paired iPad making this request, or null if it isn't paired or was forgotten.
// Every kid-view server route starts here, and scopes everything it reads or writes to
// device.childId and device.familyId. If the lookup itself fails, the iPad goes to the pairing
// screen rather than an error page; a child can't do anything with an error page.
export async function getDevice(): Promise<Device | null> {
  const token = (await cookies()).get(DEVICE_COOKIE)?.value;
  if (!token) return null;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("devices")
    .select("id, family_id, child_id, children(nickname)")
    .eq("token_hash", hashSecret(token))
    .is("revoked_at", null)
    .maybeSingle();
  if (error) {
    console.error("getDevice: device lookup failed", error.message);
    redirect("/kid/pair");
  }
  if (!data) return null;

  await admin.from("devices").update({ last_seen: new Date().toISOString() }).eq("id", data.id);

  const child = data.children as unknown as { nickname: string } | null;
  return {
    id: data.id,
    familyId: data.family_id,
    childId: data.child_id,
    nickname: child?.nickname ?? "",
  };
}
