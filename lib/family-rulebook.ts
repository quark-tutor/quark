import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ageFrom, type LeanChoice } from "./beliefs.ts";
import type { ConductAnswer } from "./conduct.ts";
import {
  mergeFamily,
  type BlackballInput,
  type ChildInput,
  type FamilyValues,
  type GuardianInput,
  type PackActs,
} from "./family-values.ts";
import { renderPolicy } from "./policy.ts";

// Everything the merge needs about one family, the merge itself, and the rulebook it renders, in
// one place: the compare page, the save (lib/family-save.ts) and the gate (core/curation/gate.ts,
// through scripts/gate.mts) all use these, so a subject's setting means the same thing on every
// page and to the gate. Relative imports with extensions, so the scripts can load it too.

export type FamilyInputs = {
  guardians: GuardianInput[];
  children: ChildInput[];
  blackballs: BlackballInput[];
  packActs: PackActs;
  packs: { id: string; shortName: string }[];
  points: { number: number; area: string; name: string }[];
};

function check<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return result.data as T;
}

export async function loadFamilyInputs(db: SupabaseClient, familyId: string): Promise<FamilyInputs> {
  const [guardians, kids, answers, ages, profiles, conduct, blackballs, packs, points] = await Promise.all([
    db.from("guardians").select("id, display_name").eq("family_id", familyId).eq("active", true).order("created_at"),
    db.from("children").select("id, nickname, birth_month").eq("family_id", familyId).order("birth_month"),
    db
      .from("guardian_answers")
      .select("guardian_id, point_number, when_setting, perspective, note_to_tutor, from_pack")
      .eq("family_id", familyId),
    db.from("guardian_answer_ages").select("guardian_id, point_number, child_id, from_age").eq("family_id", familyId),
    db
      .from("guardian_values")
      .select("guardian_id, pack_id, political_lean, want_understand, want_believe, want_decide, learns_to_act, match_exemplars_to_sex")
      .eq("family_id", familyId),
    db.from("guardian_conduct").select("guardian_id, key, child_id, value, note").eq("family_id", familyId),
    db.from("blackballs").select("id, point_number, topic, placed_by").eq("family_id", familyId).is("lifted_at", null),
    db.from("values_packs").select("id, name, short_name, learns_to_act, match_exemplars_to_sex").order("sort_order"),
    db.from("values_points").select("number, area, name").order("number"),
  ]);

  const byId = new Map<string, GuardianInput>();
  for (const g of check(guardians) ?? []) {
    byId.set(g.id, {
      id: g.id,
      name: g.display_name,
      answers: {},
      conduct: [],
      packId: null,
      lean: "unset",
      words: { understand: "", believe: "", decide: "" },
      learns: null,
      match: null,
    });
  }
  for (const a of check(answers) ?? []) {
    const g = byId.get(a.guardian_id);
    if (!g) continue;
    g.answers[a.point_number] = {
      when: a.when_setting,
      perspective: a.perspective,
      note: a.note_to_tutor ?? "",
      fromPack: a.from_pack,
      ages: {},
    };
  }
  for (const a of check(ages) ?? []) {
    const answer = byId.get(a.guardian_id)?.answers[a.point_number];
    if (answer) answer.ages[a.child_id] = a.from_age;
  }
  for (const p of check(profiles) ?? []) {
    const g = byId.get(p.guardian_id);
    if (!g) continue;
    g.packId = p.pack_id;
    g.lean = p.political_lean as LeanChoice;
    g.words = { understand: p.want_understand ?? "", believe: p.want_believe ?? "", decide: p.want_decide ?? "" };
    g.learns = p.learns_to_act;
    g.match = p.match_exemplars_to_sex;
  }
  for (const c of check(conduct) ?? []) {
    byId.get(c.guardian_id)?.conduct.push({ key: c.key, childId: c.child_id, value: c.value, note: c.note } as ConductAnswer);
  }

  const packRows = check(packs) ?? [];
  return {
    guardians: [...byId.values()],
    children: (check(kids) ?? []).map((k) => ({ id: k.id, nickname: k.nickname, age: ageFrom(k.birth_month) })),
    blackballs: (check(blackballs) ?? []).map((b) => ({ id: b.id, point: b.point_number, topic: b.topic, placedBy: b.placed_by })),
    packActs: Object.fromEntries(
      packRows.map((p) => [p.id, { learns: p.learns_to_act, match: p.match_exemplars_to_sex }]),
    ),
    packs: packRows.map((p) => ({ id: p.id, shortName: p.short_name ?? p.name })),
    points: check(points) ?? [],
  };
}

// The hash of the guardians' answers as they stand now, which is what a verdict has to have been reached
// under to count (values_profiles.source_hash is the rulebook as it was last saved, and can lag).
export async function currentRulebookHash(db: SupabaseClient, familyId: string): Promise<string> {
  const [inputs, entries] = await Promise.all([loadFamilyInputs(db, familyId), loadHandoffs(db)]);
  return familyRulebook(inputs, entries).hash;
}

export const merge = (inputs: FamilyInputs): FamilyValues =>
  mergeFamily(inputs.guardians, inputs.children, inputs.blackballs, inputs.packActs);

// values_pack_entries rows, for the hand-off lines the rulebook quotes.
export type HandoffEntry = { pack_id: string; point_number: number; lean: string; handoff: string | null };

export async function loadHandoffs(db: SupabaseClient): Promise<HandoffEntry[]> {
  return check(await db.from("values_pack_entries").select("pack_id, point_number, lean, handoff")) ?? [];
}

// The family's merged values, the rulebook in both forms, the rows the save writes, and the
// fingerprint of all of it (values_profiles.source_hash). The gate's copy of the rulebook names no
// child (docs/gate-slice.md, decision 5); the stored one is what parents read.
export function familyRulebook(inputs: FamilyInputs, entries: HandoffEntry[]) {
  const values = merge(inputs);
  const { profile } = values;

  const handoffs = new Map<string, string>();
  for (const e of entries) if (e.handoff) handoffs.set(`${e.pack_id}:${e.point_number}:${e.lean}`, e.handoff);
  const ctx = {
    points: inputs.points,
    children: inputs.children,
    handoff: (point: number, fromPack: string | null) => {
      const pack = fromPack ?? profile.packId;
      if (!pack) return null;
      return handoffs.get(`${pack}:${point}:${profile.lean}`) ?? handoffs.get(`${pack}:${point}:unset`) ?? null;
    },
    packName: (id: string | null) => inputs.packs.find((p) => p.id === id)?.shortName ?? null,
  };
  const policy = renderPolicy(values, ctx);
  const gatePolicy = renderPolicy(values, ctx, { forGate: true });

  const written = values.points.filter((p) => p.setting);
  const settings = written.map((p) => ({
    point_number: p.point,
    when_setting: p.setting!.when,
    perspective: p.setting!.perspective,
    note_to_tutor: p.setting!.notes.length ? p.setting!.notes.join("\n\n") : null,
    from_pack: p.setting!.fromPack,
    disputed: p.status === "differ",
  }));
  const ages = written.flatMap((p) =>
    p.setting!.when === "from_age"
      ? Object.entries(p.setting!.ages).map(([child_id, from_age]) => ({ child_id, point_number: p.point, from_age }))
      : [],
  );
  const conduct = values.conduct
    .filter((c) => c.status !== "waiting")
    .map((c) => ({ key: c.key, child_id: c.childId, value: c.value, notes: c.notes, disputed: c.status === "differ" }));
  const fields = {
    pack_id: profile.packId,
    political_lean: profile.lean,
    statement: profile.statement,
    learns_to_act: profile.learns,
    match_exemplars_to_sex: profile.match,
    policy_document: policy,
  };

  const hash = createHash("sha256").update(JSON.stringify({ fields, settings, ages, conduct })).digest("hex");
  return { values, policy, gatePolicy, fields, settings, ages, conduct, hash };
}
