import "server-only";
import { cookies } from "next/headers";
import type { Device } from "@/lib/device";
import { createAdminClient } from "@/lib/supabase/admin";

// The test view (docs/math-tile-slice.md, stop 2; Brandon at go, 9 Nov 2026: "make it easy to see several days'
// problems in one sitting, not only today's"). On the dev server against the test database only: a bar on the wall
// switches the paired iPad between the family's children and moves the wall to another day of the week. Never on
// Vercel, where NODE_ENV is production, and never against live, whose env file says QUARK_TARGET=live; a test holds
// both (lib/dev-view.test.ts). No child ever sees it.

export const DEV_DAY_COOKIE = "quark_dev_day";
const DAY = /^\d{4}-\d{2}-\d{2}$/;

export const devViewOn = (env: { NODE_ENV?: string; QUARK_TARGET?: string } = process.env) => env.NODE_ENV === "development" && env.QUARK_TARGET === "test";

// The day the test view has moved the wall to, or null for today.
export async function devDay(): Promise<string | null> {
  if (!devViewOn()) return null;
  const day = (await cookies()).get(DEV_DAY_COOKIE)?.value;
  return day && DAY.test(day) ? day : null;
}

// The family's children, oldest first, and its time zone, for the bar; nothing when the test view is off.
export async function devFamily(device: Device): Promise<{ children: { id: string; nickname: string }[]; timezone: string } | null> {
  if (!devViewOn()) return null;
  const db = createAdminClient();
  const [{ data: kids }, { data: family }] = await Promise.all([
    db.from("children").select("id, nickname").eq("family_id", device.familyId).order("birth_month"),
    db.from("families").select("timezone").eq("id", device.familyId).single(),
  ]);
  return { children: kids ?? [], timezone: family?.timezone ?? "Pacific/Honolulu" };
}

// The paired iPad becomes another child of its own family. Test view only.
export async function devSwitchChild(device: Device, childId: string): Promise<void> {
  if (!devViewOn()) return;
  const db = createAdminClient();
  const { data } = await db.from("children").select("id").eq("family_id", device.familyId).eq("id", childId).maybeSingle();
  if (data) await db.from("devices").update({ child_id: data.id }).eq("id", device.id).eq("family_id", device.familyId);
}

// The moment the wall reads as now: noon in Hawaii on the test view's day, or now.
export async function wallNow(): Promise<Date> {
  const day = await devDay();
  return day ? new Date(`${day}T22:00:00Z`) : new Date();
}
