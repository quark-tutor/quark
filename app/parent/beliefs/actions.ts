"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ageFrom,
  answerOf,
  clampAge,
  defaultAge,
  isAnswerId,
  isLeanChoice,
  isPoint,
  parseChooserExport,
  settingFor,
  type AnswerId,
  type EntrySetting,
  type LeanChoice,
  type Setting,
} from "@/lib/beliefs";
import { isChoice, isChoiceKey, isConductKey, PER_CHILD, type ConductKey } from "@/lib/conduct";
import { saveFamilyValues } from "@/lib/family-save";
import { requireGuardian, type Guardian } from "@/lib/guardian";
import { createClient } from "@/lib/supabase/server";
import { isLearnsToAct, type LearnsToAct } from "@/lib/values";
import { loadAnswers, type Answers, type Origin, type Words } from "./data";

// Each guardian's own answers (guardian_answers, guardian_conduct). After every change the server
// re-merges all guardians' answers into the family's values (lib/family-save.ts), which is what
// the compare page and the rulebook show. Every change is audit-logged.

export type Result = { answers?: Answers; error?: string };

type Ctx = { guardian: Guardian; supabase: SupabaseClient };

const NOTE_MAX = 1000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function context(): Promise<Ctx | null> {
  const guardian = await requireGuardian();
  if (!guardian) return null;
  return { guardian, supabase: await createClient() };
}

async function audit({ guardian, supabase }: Ctx, action: string, target: Record<string, unknown>) {
  const { error } = await supabase
    .from("audit_log")
    .insert({ family_id: guardian.familyId, guardian_id: guardian.id, action, target });
  if (error) throw new Error(error.message);
}

async function done(ctx: Ctx): Promise<Result> {
  const error = await refresh(ctx);
  return { answers: await loadAnswers(ctx.supabase, ctx.guardian.id), ...(error ? { error } : {}) };
}

// Re-merge the family's values. The guardian's own answer is already saved if this fails.
async function refresh({ guardian }: Ctx): Promise<string | undefined> {
  try {
    await saveFamilyValues(guardian.familyId, guardian.id);
  } catch (e) {
    return `Your answer is saved, but the family rulebook didn't update: ${e instanceof Error ? e.message : String(e)}`;
  }
}

const fail = (error: unknown): Result => ({
  error: `Couldn't save that: ${error instanceof Error ? error.message : String(error)}`,
});

async function profile({ guardian, supabase }: Ctx): Promise<{ packId: string | null; lean: LeanChoice }> {
  const { data, error } = await supabase
    .from("guardian_values")
    .select("pack_id, political_lean")
    .eq("guardian_id", guardian.id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return { packId: data?.pack_id ?? null, lean: data?.political_lean ?? "unset" };
}

// A pack's entries for a lean: the lean's variant where there is one, else the base entry.
async function packEntries({ supabase }: Ctx, packId: string, lean: LeanChoice): Promise<Map<number, EntrySetting>> {
  const { data, error } = await supabase
    .from("values_pack_entries")
    .select("point_number, lean, when_setting, perspective, from_age")
    .eq("pack_id", packId)
    .in("lean", lean === "unset" ? ["unset"] : ["unset", lean]);
  if (error) throw new Error(error.message);
  const out = new Map<number, EntrySetting>();
  for (const e of data ?? []) {
    if (e.lean === "unset" && out.has(e.point_number)) continue;
    out.set(e.point_number, { when: e.when_setting, perspective: e.perspective, from_age: e.from_age });
  }
  return out;
}

type Write = {
  point: number;
  setting: Setting;
  fromPack: string | null;
  origin: Origin;
  packAge?: number | null; // "Not yet" age from the pack, for every child
  keepAges?: boolean; // keep the ages already set, if any
};

async function writeAnswers(ctx: Ctx, writes: Write[]) {
  if (!writes.length) return;
  const { guardian, supabase } = ctx;
  const [kids, existing] = await Promise.all([
    supabase.from("children").select("id, birth_month"),
    supabase.from("guardian_answer_ages").select("point_number").eq("guardian_id", guardian.id),
  ]);
  if (kids.error) throw new Error(kids.error.message);
  if (existing.error) throw new Error(existing.error.message);
  const hasAges = new Set((existing.data ?? []).map((a) => a.point_number));

  // note_to_tutor is left out, so an existing note stays.
  const saved = await supabase.from("guardian_answers").upsert(
    writes.map((w) => ({
      guardian_id: guardian.id,
      family_id: guardian.familyId,
      point_number: w.point,
      when_setting: w.setting.when,
      perspective: w.setting.perspective,
      from_pack: w.fromPack,
      origin: w.origin,
      updated_at: new Date().toISOString(),
    })),
    { onConflict: "guardian_id,point_number" },
  );
  if (saved.error) throw new Error(saved.error.message);

  const noAges = writes.filter((w) => w.setting.when !== "from_age").map((w) => w.point);
  if (noAges.length) {
    const cleared = await supabase
      .from("guardian_answer_ages")
      .delete()
      .eq("guardian_id", guardian.id)
      .in("point_number", noAges);
    if (cleared.error) throw new Error(cleared.error.message);
  }

  const ages = writes
    .filter((w) => w.setting.when === "from_age" && !(w.keepAges && hasAges.has(w.point)))
    .flatMap((w) =>
      (kids.data ?? []).map((kid) => ({
        guardian_id: guardian.id,
        family_id: guardian.familyId,
        point_number: w.point,
        child_id: kid.id,
        from_age: defaultAge(w.packAge, ageFrom(kid.birth_month)),
      })),
    );
  if (ages.length) {
    const set = await supabase
      .from("guardian_answer_ages")
      .upsert(ages, { onConflict: "guardian_id,point_number,child_id" });
    if (set.error) throw new Error(set.error.message);
  }
}

async function saveProfile({ guardian, supabase }: Ctx, fields: Record<string, unknown>) {
  const { error } = await supabase
    .from("guardian_values")
    .upsert(
      { guardian_id: guardian.id, family_id: guardian.familyId, ...fields, updated_at: new Date().toISOString() },
      { onConflict: "guardian_id" },
    );
  if (error) throw new Error(error.message);
}

// Tap one of the five answers (packId null), or a tradition's answer for this point (packId set).
export async function setAnswer(point: number, answer: AnswerId, packId: string | null): Promise<Result> {
  if (!isPoint(point) || !isAnswerId(answer) || (packId !== null && !UUID.test(packId))) return { error: "Bad request." };
  const ctx = await context();
  if (!ctx) return { error: "This account isn't a guardian." };
  try {
    const { lean } = await profile(ctx);
    const entry = packId ? (await packEntries(ctx, packId, lean)).get(point) : undefined;
    if (packId && !entry) return { error: "That tradition has no answer for this subject." };
    const current = await ctx.supabase
      .from("guardian_answers")
      .select("when_setting, perspective")
      .eq("guardian_id", ctx.guardian.id)
      .eq("point_number", point)
      .maybeSingle();
    if (current.error) throw new Error(current.error.message);
    const now = current.data ? { when: current.data.when_setting, perspective: current.data.perspective } : null;

    const setting = settingFor(answer, entry, now);
    await writeAnswers(ctx, [
      { point, setting, fromPack: packId, origin: packId ? "tradition" : "own", packAge: entry?.from_age, keepAges: !packId },
    ]);
    await audit(ctx, "beliefs.answer", { point, ...setting, from_pack: packId });
    return done(ctx);
  } catch (e) {
    return fail(e);
  }
}

export async function clearAnswer(point: number): Promise<Result> {
  if (!isPoint(point)) return { error: "Bad request." };
  const ctx = await context();
  if (!ctx) return { error: "This account isn't a guardian." };
  try {
    const { error } = await ctx.supabase
      .from("guardian_answers")
      .delete()
      .eq("guardian_id", ctx.guardian.id)
      .eq("point_number", point);
    if (error) throw new Error(error.message);
    await audit(ctx, "beliefs.clear", { point });
    return done(ctx);
  } catch (e) {
    return fail(e);
  }
}

export async function clearAll(): Promise<Result> {
  const ctx = await context();
  if (!ctx) return { error: "This account isn't a guardian." };
  try {
    const { error } = await ctx.supabase.from("guardian_answers").delete().eq("guardian_id", ctx.guardian.id);
    if (error) throw new Error(error.message);
    await audit(ctx, "beliefs.clear_all", {});
    return done(ctx);
  } catch (e) {
    return fail(e);
  }
}

// Quick start: remember the tradition and lean, and fill every subject not yet answered.
export async function quickStart(packId: string, lean: LeanChoice): Promise<Result> {
  if (!UUID.test(packId) || !isLeanChoice(lean)) return { error: "Bad request." };
  const ctx = await context();
  if (!ctx) return { error: "This account isn't a guardian." };
  try {
    const entries = await packEntries(ctx, packId, lean);
    if (!entries.size) return { error: "That tradition isn't loaded yet." };
    await saveProfile(ctx, { pack_id: packId, political_lean: lean });
    const answered = await loadAnswers(ctx.supabase, ctx.guardian.id);
    const writes: Write[] = [...entries]
      .filter(([point]) => !answered[point])
      .map(([point, e]) => ({ point, setting: settingFor(answerOf(e), e), fromPack: packId, origin: "quick_start", packAge: e.from_age }));
    await writeAnswers(ctx, writes);
    await audit(ctx, "beliefs.quick_start", { pack_id: packId, lean, filled: writes.map((w) => w.point) });
    return done(ctx);
  } catch (e) {
    return fail(e);
  }
}

// Changing the lean re-fills only the subjects the quick start filled and nobody has edited since.
export async function setLean(lean: LeanChoice): Promise<Result> {
  if (!isLeanChoice(lean)) return { error: "Bad request." };
  const ctx = await context();
  if (!ctx) return { error: "This account isn't a guardian." };
  try {
    const { packId } = await profile(ctx);
    await saveProfile(ctx, { political_lean: lean });
    const writes: Write[] = [];
    if (packId) {
      const entries = await packEntries(ctx, packId, lean);
      const answers = await loadAnswers(ctx.supabase, ctx.guardian.id);
      for (const [n, a] of Object.entries(answers)) {
        const e = entries.get(Number(n));
        if (!e || a.origin !== "quick_start" || a.fromPack !== packId) continue;
        writes.push({ point: Number(n), setting: settingFor(answerOf(e), e), fromPack: packId, origin: "quick_start", packAge: e.from_age });
      }
      await writeAnswers(ctx, writes);
    }
    await audit(ctx, "beliefs.lean", { lean, refilled: writes.map((w) => w.point) });
    return done(ctx);
  } catch (e) {
    return fail(e);
  }
}

// A quick-start answer that gets a hand edit stops being re-filled by the lean.
async function markEdited(ctx: Ctx, point: number) {
  const { error } = await ctx.supabase
    .from("guardian_answers")
    .update({ origin: "tradition", updated_at: new Date().toISOString() })
    .eq("guardian_id", ctx.guardian.id)
    .eq("point_number", point)
    .eq("origin", "quick_start");
  if (error) throw new Error(error.message);
}

// "Not yet": the age for one child.
export async function setAge(point: number, childId: string, age: number): Promise<Result> {
  if (!isPoint(point) || !UUID.test(childId) || !Number.isFinite(age)) return { error: "Bad request." };
  const ctx = await context();
  if (!ctx) return { error: "This account isn't a guardian." };
  try {
    const from_age = clampAge(age);
    const { error } = await ctx.supabase.from("guardian_answer_ages").upsert(
      { guardian_id: ctx.guardian.id, family_id: ctx.guardian.familyId, point_number: point, child_id: childId, from_age },
      { onConflict: "guardian_id,point_number,child_id" },
    );
    if (error) throw new Error(error.message);
    await markEdited(ctx, point);
    await audit(ctx, "beliefs.age", { point, child_id: childId, from_age });
    return done(ctx);
  } catch (e) {
    return fail(e);
  }
}

// "Not yet": how to answer once the child is old enough.
export async function setReady(point: number, ready: "ours" | "fair"): Promise<Result> {
  if (!isPoint(point) || (ready !== "ours" && ready !== "fair")) return { error: "Bad request." };
  const ctx = await context();
  if (!ctx) return { error: "This account isn't a guardian." };
  try {
    const perspective = ready === "ours" ? "family_tradition" : "several_fairly";
    const { error } = await ctx.supabase
      .from("guardian_answers")
      .update({ perspective, updated_at: new Date().toISOString() })
      .eq("guardian_id", ctx.guardian.id)
      .eq("point_number", point)
      .eq("when_setting", "from_age");
    if (error) throw new Error(error.message);
    await markEdited(ctx, point);
    await audit(ctx, "beliefs.ready", { point, perspective });
    return done(ctx);
  } catch (e) {
    return fail(e);
  }
}

// "What would you actually say?"
export async function setNote(point: number, note: string): Promise<Result> {
  if (!isPoint(point) || typeof note !== "string") return { error: "Bad request." };
  const text = note.trim().slice(0, NOTE_MAX);
  const ctx = await context();
  if (!ctx) return { error: "This account isn't a guardian." };
  try {
    const { data, error } = await ctx.supabase
      .from("guardian_answers")
      .update({ note_to_tutor: text || null, updated_at: new Date().toISOString() })
      .eq("guardian_id", ctx.guardian.id)
      .eq("point_number", point)
      .select("point_number");
    if (error) throw new Error(error.message);
    if (!data.length) return { error: "Choose an answer for this subject first." };
    await audit(ctx, "beliefs.note", { point, note: text });
    return done(ctx);
  } catch (e) {
    return fail(e);
  }
}

const WORD_COLUMNS: Record<keyof Words, string> = {
  understand: "want_understand",
  believe: "want_believe",
  decide: "want_decide",
};

// The three "in your own words" answers.
export async function setWords(field: keyof Words, text: string): Promise<{ error?: string }> {
  const column = WORD_COLUMNS[field];
  if (!column || typeof text !== "string") return { error: "Bad request." };
  const value = text.trim().slice(0, NOTE_MAX);
  const ctx = await context();
  if (!ctx) return { error: "This account isn't a guardian." };
  try {
    await saveProfile(ctx, { [column]: value || null });
    await audit(ctx, "beliefs.words", { field, text: value });
    const error = await refresh(ctx);
    return error ? { error } : {};
  } catch (e) {
    return fail(e);
  }
}

// Bring over the answers from the tryout page (scripts/pack-compare.mts). Replaces any answer
// already given for the same subject.
export async function importAnswers(text: string): Promise<Result> {
  if (typeof text !== "string" || text.length > 50_000) return { error: "Bad request." };
  const parsed = parseChooserExport(text);
  if ("error" in parsed) return { error: parsed.error };
  const ctx = await context();
  if (!ctx) return { error: "This account isn't a guardian." };
  try {
    const packs = await ctx.supabase.from("values_packs").select("id, slug");
    if (packs.error) throw new Error(packs.error.message);
    const idOf = new Map((packs.data ?? []).map((p) => [p.slug, p.id as string]));
    const quickId = parsed.quick ? (idOf.get(parsed.quick) ?? null) : null;
    await saveProfile(ctx, { pack_id: quickId, political_lean: parsed.lean });

    const entriesOf = new Map<string, Map<number, EntrySetting>>();
    const writes: Write[] = [];
    for (const a of parsed.answers) {
      const packId = a.pack ? (idOf.get(a.pack) ?? null) : null;
      if (packId && !entriesOf.has(packId)) entriesOf.set(packId, await packEntries(ctx, packId, parsed.lean));
      const entry = packId ? entriesOf.get(packId)!.get(a.point) : undefined;
      writes.push({
        point: a.point,
        setting: settingFor(a.answer, entry),
        fromPack: entry ? packId : null,
        origin: entry ? (packId === quickId ? "quick_start" : "tradition") : "own",
        packAge: entry?.from_age,
      });
    }
    await writeAnswers(ctx, writes);
    await audit(ctx, "beliefs.import", { lean: parsed.lean, quick: parsed.quick, points: writes.map((w) => w.point) });
    return done(ctx);
  } catch (e) {
    return fail(e);
  }
}


// Part 2b: one conduct answer. value is for questions with fixed answers (undefined leaves it
// as is); note is the free-text line (undefined leaves it as is). childId is set only for
// conduct.speak_first's per-child answers.
export async function setConduct(
  key: ConductKey,
  childId: string | null,
  change: { value?: string | null; note?: string },
): Promise<{ error?: string }> {
  if (!isConductKey(key) || (childId !== null && !UUID.test(childId))) return { error: "Bad request." };
  if (childId !== null && !PER_CHILD.includes(key)) return { error: "Bad request." };
  const { value, note } = change ?? {};
  if (value !== undefined && value !== null && !(isChoiceKey(key) && isChoice(key, value))) return { error: "Bad request." };
  if (note !== undefined && typeof note !== "string") return { error: "Bad request." };
  const ctx = await context();
  if (!ctx) return { error: "This account isn't a guardian." };
  try {
    const row: Record<string, unknown> = {
      guardian_id: ctx.guardian.id,
      family_id: ctx.guardian.familyId,
      key,
      child_id: childId,
      updated_at: new Date().toISOString(),
    };
    if (value !== undefined) row.value = value;
    if (note !== undefined) row.note = note.trim().slice(0, NOTE_MAX) || null;
    const { error } = await ctx.supabase.from("guardian_conduct").upsert(row, { onConflict: "guardian_id,key,child_id" });
    if (error) throw new Error(error.message);
    await audit(ctx, "beliefs.conduct", { key, child_id: childId, ...change });
    const failed = await refresh(ctx);
    return failed ? { error: failed } : {};
  } catch (e) {
    return fail(e);
  }
}

// How the kids learn to act. null goes back to the quick-start tradition's setting.
export async function setActs(change: { learns?: LearnsToAct | null; match?: boolean | null }): Promise<{ error?: string }> {
  const { learns, match } = change ?? {};
  if (learns !== undefined && learns !== null && !isLearnsToAct(learns)) return { error: "Bad request." };
  if (match !== undefined && match !== null && typeof match !== "boolean") return { error: "Bad request." };
  const ctx = await context();
  if (!ctx) return { error: "This account isn't a guardian." };
  try {
    const fields: Record<string, unknown> = {};
    if (learns !== undefined) fields.learns_to_act = learns;
    if (match !== undefined) fields.match_exemplars_to_sex = match;
    await saveProfile(ctx, fields);
    await audit(ctx, "beliefs.acts", { ...change });
    const failed = await refresh(ctx);
    return failed ? { error: failed } : {};
  } catch (e) {
    return fail(e);
  }
}
