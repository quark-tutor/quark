import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Guardian = {
  id: string;
  familyId: string;
  displayName: string;
};

// The signed-in guardian. Sends anyone else to sign in. A signed-in account with no guardian
// row (it shouldn't exist, since sign-ups are off) gets null.
export async function requireGuardian(): Promise<Guardian | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) redirect("/sign-in");

  const { data: guardian, error } = await supabase
    .from("guardians")
    .select("id, family_id, display_name")
    .eq("auth_user_id", userId)
    .eq("active", true)
    .maybeSingle();
  if (error) throw error;
  if (!guardian) return null;

  return { id: guardian.id, familyId: guardian.family_id, displayName: guardian.display_name };
}
