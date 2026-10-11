import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ageFrom, type LeanChoice } from "@/lib/beliefs";
import type { ConductAnswer } from "@/lib/conduct";
import type { LearnsToAct, Perspective, When } from "@/lib/values";

// What the beliefs page shows, shaped for the browser.

export type PointView = { number: number; area: string; name: string; question: string };

export type EntryView = {
  when: When;
  from_age: number | null;
  perspective: Perspective;
  position: string;
  source: string | null;
  split: string | null;
  handoff: string | null;
  parent_note: string | null;
  needs_check: boolean;
};

export type PackView = {
  id: string;
  slug: string;
  shortName: string;
  subtitle: string | null;
  learns: LearnsToAct | null;
  match: boolean | null;
  sources: { id: string; title: string; url: string }[];
  // entries[point][lean]; lean "unset" is the base entry, other leans only where the pack varies.
  entries: Record<number, Partial<Record<LeanChoice, EntryView>>>;
};

export type Origin = "quick_start" | "tradition" | "own";

export type AnswerView = {
  when: When;
  perspective: Perspective;
  note: string;
  fromPack: string | null; // pack id
  origin: Origin;
  ages: Record<string, number>; // child id -> "Not yet" age
};

export type Answers = Record<number, AnswerView>;

export type ChildView = { id: string; nickname: string; age: number };

export type Words = { understand: string; believe: string; decide: string };

// How the kids learn to act: the guardian's own choice, null where they follow their tradition.
export type Acts = { learns: LearnsToAct | null; match: boolean | null };

// A subject someone has blocked (founding rule 2). Only the guardian who placed it can lift it.
export type BlockView = { id: string; point: number; by: string; mine: boolean };

export type BeliefsData = {
  points: PointView[];
  packs: PackView[];
  children: ChildView[];
  answers: Answers;
  packId: string | null;
  lean: LeanChoice;
  words: Words;
  conduct: ConductAnswer[];
  acts: Acts;
  blocks: BlockView[];
};

function check<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return result.data as T;
}

export async function loadAnswers(supabase: SupabaseClient, guardianId: string): Promise<Answers> {
  const [rows, ages] = await Promise.all([
    supabase
      .from("guardian_answers")
      .select("point_number, when_setting, perspective, note_to_tutor, from_pack, origin")
      .eq("guardian_id", guardianId),
    supabase.from("guardian_answer_ages").select("point_number, child_id, from_age").eq("guardian_id", guardianId),
  ]);
  const answers: Answers = {};
  for (const r of check(rows) ?? []) {
    answers[r.point_number] = {
      when: r.when_setting,
      perspective: r.perspective,
      note: r.note_to_tutor ?? "",
      fromPack: r.from_pack,
      origin: r.origin,
      ages: {},
    };
  }
  for (const a of check(ages) ?? []) {
    if (answers[a.point_number]) answers[a.point_number].ages[a.child_id] = a.from_age;
  }
  return answers;
}

export async function loadBeliefs(supabase: SupabaseClient, guardianId: string): Promise<BeliefsData> {
  const [points, packs, entries, kids, mine, answers, conduct, blocks, guardians] = await Promise.all([
    supabase.from("values_points").select("number, area, name, kid_question").order("number"),
    supabase.from("values_packs").select("id, slug, name, short_name, subtitle, sources, learns_to_act, match_exemplars_to_sex").order("sort_order"),
    supabase
      .from("values_pack_entries")
      .select("pack_id, point_number, lean, when_setting, from_age, perspective, position, source, split, handoff, parent_note, needs_check"),
    supabase.from("children").select("id, nickname, birth_month").order("birth_month"),
    supabase
      .from("guardian_values")
      .select("pack_id, political_lean, want_understand, want_believe, want_decide, learns_to_act, match_exemplars_to_sex")
      .eq("guardian_id", guardianId)
      .maybeSingle(),
    loadAnswers(supabase, guardianId),
    supabase.from("guardian_conduct").select("key, child_id, value, note").eq("guardian_id", guardianId),
    supabase.from("blackballs").select("id, point_number, placed_by").is("lifted_at", null).not("point_number", "is", null),
    supabase.from("guardians").select("id, display_name"),
  ]);
  const names = new Map((check(guardians) ?? []).map((g) => [g.id, g.display_name as string]));

  const packViews: PackView[] = (check(packs) ?? []).map((p) => ({
    id: p.id,
    slug: p.slug,
    shortName: p.short_name ?? p.name,
    subtitle: p.subtitle,
    learns: p.learns_to_act,
    match: p.match_exemplars_to_sex,
    sources: p.sources ?? [],
    entries: {},
  }));
  const byId = new Map(packViews.map((p) => [p.id, p]));
  for (const e of check(entries) ?? []) {
    const pack = byId.get(e.pack_id);
    if (!pack) continue;
    (pack.entries[e.point_number] ??= {})[e.lean as LeanChoice] = {
      when: e.when_setting,
      from_age: e.from_age,
      perspective: e.perspective,
      position: e.position,
      source: e.source,
      split: e.split,
      handoff: e.handoff,
      parent_note: e.parent_note,
      needs_check: e.needs_check,
    };
  }

  const profile = check(mine);
  return {
    points: (check(points) ?? []).map((p) => ({ number: p.number, area: p.area, name: p.name, question: p.kid_question })),
    packs: packViews,
    children: (check(kids) ?? []).map((k) => ({ id: k.id, nickname: k.nickname, age: ageFrom(k.birth_month) })),
    answers,
    packId: profile?.pack_id ?? null,
    lean: profile?.political_lean ?? "unset",
    words: {
      understand: profile?.want_understand ?? "",
      believe: profile?.want_believe ?? "",
      decide: profile?.want_decide ?? "",
    },
    conduct: (check(conduct) ?? []).map((c) => ({ key: c.key, childId: c.child_id, value: c.value, note: c.note })),
    acts: { learns: profile?.learns_to_act ?? null, match: profile?.match_exemplars_to_sex ?? null },
    blocks: (check(blocks) ?? []).map((b) => ({
      id: b.id,
      point: b.point_number,
      by: names.get(b.placed_by) ?? "A guardian",
      mine: b.placed_by === guardianId,
    })),
  };
}
