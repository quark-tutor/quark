"use server";

import { revalidatePath } from "next/cache";
import { readFloor } from "@/core/curation/gate";
import { backToReviewProblem, liveProblems, longDay, whenWords, type LiveCard } from "@/core/curation/live";
import { todayIn } from "@/core/curation/week";
import { readSafetyFloor } from "@/core/prompts";
import { currentRulebookHash } from "@/lib/family-rulebook";
import { requireGuardian } from "@/lib/guardian";
import { createAdminClient } from "@/lib/supabase/admin";

// The Looks-good tap (docs/looks-good-slice.md, decision 4): any one guardian makes a week live, or takes a
// live one back to review until its first day begins. Everything is read again here, on the server, and
// never taken from the page. Only the server writes themes.status: a guardian's session could, through the
// data API, which is why the tap's checks are these and why a board row (phase 4) closes that. The admin
// client is scoped to the guardian's own family in every query.

export type TapState = { ok: boolean; message: string } | null;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const message = (e: unknown) => (e instanceof Error ? e.message : String(e));

type Admin = ReturnType<typeof createAdminClient>;

async function readWeek(db: Admin, familyId: string, themeId: string) {
  const [theme, cards, kids, family, profile, currentHash] = await Promise.all([
    db.from("themes").select("id, week_start, plan_week, status").eq("id", themeId).eq("family_id", familyId).maybeSingle(),
    db.from("cards").select("child_id, day, slot, layer, policy, policy_notes", { count: "exact" }).eq("theme_id", themeId).limit(2000),
    db.from("children").select("id").eq("family_id", familyId),
    db.from("families").select("timezone").eq("id", familyId).single(),
    db.from("values_profiles").select("source_hash").eq("family_id", familyId).maybeSingle(),
    currentRulebookHash(db, familyId),
  ]);
  for (const r of [theme, cards, kids, family, profile]) if (r.error) throw new Error(r.error.message);
  if (!theme.data) return null;
  if ((cards.count ?? 0) !== (cards.data ?? []).length) throw new Error("Couldn't read every card of this week.");
  return {
    theme: theme.data as { id: string; week_start: string; plan_week: number | null; status: string },
    cards: (cards.data ?? []) as LiveCard[],
    childIds: (kids.data ?? []).map((k) => k.id as string),
    timeZone: (family.data?.timezone as string | undefined) ?? "Pacific/Honolulu",
    savedHash: (profile.data?.source_hash as string | undefined) ?? null,
    currentHash,
  };
}

export async function makeWeekLive(themeId: string, _previous: TapState, _form?: FormData): Promise<TapState> {
  if (!UUID.test(themeId)) return { ok: false, message: "Bad request." };
  const guardian = await requireGuardian();
  if (!guardian) return { ok: false, message: "This account isn't a guardian." };
  const db = createAdminClient();
  try {
    const week = await readWeek(db, guardian.familyId, themeId);
    if (!week) return { ok: false, message: "No such week." };
    const floor = readFloor(readSafetyFloor());
    const problems = liveProblems({
      status: week.theme.status,
      cards: week.cards,
      childIds: week.childIds,
      currentHash: week.currentHash,
      savedHash: week.savedHash,
      floorVersion: floor.version,
    });
    if (problems.length) return { ok: false, message: problems.join(" ") };

    // Only a theme still in review moves: if two guardians tap at once, one wins and the other is told so.
    const moved = await db.from("themes").update({ status: "live" }).eq("id", themeId).eq("family_id", guardian.familyId).eq("status", "review").select("id");
    if (moved.error) throw new Error(moved.error.message);
    if (!moved.data?.length) return { ok: false, message: "This week is already live, or was just changed. Reload the page." };

    const logged = await db.from("audit_log").insert({
      family_id: guardian.familyId,
      guardian_id: guardian.id,
      action: "theme.live",
      target: {
        theme: themeId,
        week: week.theme.plan_week,
        rulebook: week.currentHash,
        floor: floor.version,
        passed: week.cards.filter((c) => c.policy === "passed").length,
        held_back: week.cards.filter((c) => c.policy === "blocked").length,
      },
    });
    if (logged.error) {
      // The week must not be live without a record of who said so.
      await db.from("themes").update({ status: "review" }).eq("id", themeId).eq("status", "live");
      return { ok: false, message: "Couldn't record that, so nothing changed. Try again." };
    }
    revalidatePath(`/parent/week/${themeId}`);
    revalidatePath("/parent");
    return { ok: true, message: `Live from ${longDay(week.theme.week_start)}. Made live by ${guardian.displayName} on ${whenWords(new Date().toISOString(), week.timeZone)}.` };
  } catch (e) {
    return { ok: false, message: `Couldn't make this week live: ${message(e)}` };
  }
}

export async function backToReview(themeId: string, _previous: TapState, _form?: FormData): Promise<TapState> {
  if (!UUID.test(themeId)) return { ok: false, message: "Bad request." };
  const guardian = await requireGuardian();
  if (!guardian) return { ok: false, message: "This account isn't a guardian." };
  const db = createAdminClient();
  try {
    const week = await readWeek(db, guardian.familyId, themeId);
    if (!week) return { ok: false, message: "No such week." };
    const problem = backToReviewProblem({ status: week.theme.status, weekStart: week.theme.week_start, today: todayIn(week.timeZone) });
    if (problem) return { ok: false, message: problem };

    const moved = await db.from("themes").update({ status: "review" }).eq("id", themeId).eq("family_id", guardian.familyId).eq("status", "live").select("id");
    if (moved.error) throw new Error(moved.error.message);
    if (!moved.data?.length) return { ok: false, message: "This week was just changed. Reload the page." };

    const logged = await db.from("audit_log").insert({
      family_id: guardian.familyId,
      guardian_id: guardian.id,
      action: "theme.review",
      target: { theme: themeId, week: week.theme.plan_week },
    });
    if (logged.error) {
      await db.from("themes").update({ status: "live" }).eq("id", themeId).eq("status", "review");
      return { ok: false, message: "Couldn't record that, so nothing changed. Try again." };
    }
    revalidatePath(`/parent/week/${themeId}`);
    revalidatePath("/parent");
    return { ok: true, message: "This week is back in review. Nothing from it will be shown until it is made live again." };
  } catch (e) {
    return { ok: false, message: `Couldn't take this week back: ${message(e)}` };
  }
}
