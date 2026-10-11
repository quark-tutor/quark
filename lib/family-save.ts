import "server-only";
import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ageFrom, type LeanChoice } from "@/lib/beliefs";
import type { ConductAnswer } from "@/lib/conduct";
import {
  mergeFamily,
  type BlackballInput,
  type ChildInput,
  type FamilyValues,
  type GuardianInput,
  type PackActs,
} from "@/lib/family-values";
import { renderPolicy } from "@/lib/policy";
import { createAdminClient } from "@/lib/supabase/admin";

// Everything the merge needs about one family, and the save that writes its result. The compare
// page loads with the guardian's own client (row-level security scopes it); the save uses the
// service role, since only the server writes the family's values.

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

export const merge = (inputs: FamilyInputs): FamilyValues =>
  mergeFamily(inputs.guardians, inputs.children, inputs.blackballs, inputs.packActs);

// Merge every guardian's answers and write the family's values and rulebook, if anything changed.
// Called after any guardian changes an answer, a conduct item or a blackball.
export async function saveFamilyValues(familyId: string, guardianId: string | null): Promise<void> {
  const db = createAdminClient();
  const [inputs, entries, current] = await Promise.all([
    loadFamilyInputs(db, familyId),
    db.from("values_pack_entries").select("pack_id, point_number, lean, handoff"),
    db.from("values_profiles").select("source_hash").eq("family_id", familyId).maybeSingle(),
  ]);
  const values = merge(inputs);
  const { profile } = values;

  const handoffs = new Map<string, string>();
  for (const e of check(entries) ?? []) if (e.handoff) handoffs.set(`${e.pack_id}:${e.point_number}:${e.lean}`, e.handoff);
  const policy = renderPolicy(values, {
    points: inputs.points,
    children: inputs.children,
    handoff: (point, fromPack) => {
      const pack = fromPack ?? profile.packId;
      if (!pack) return null;
      return handoffs.get(`${pack}:${point}:${profile.lean}`) ?? handoffs.get(`${pack}:${point}:unset`) ?? null;
    },
    packName: (id) => inputs.packs.find((p) => p.id === id)?.shortName ?? null,
  });

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
  if (check(current)?.source_hash === hash) return;

  const version = check(
    await db.rpc("replace_family_values", {
      p_family: familyId,
      p_profile: { ...fields, source_hash: hash },
      p_settings: settings,
      p_ages: ages,
      p_conduct: conduct,
    }),
  );
  const count = (status: string) => values.points.filter((p) => p.status === status).map((p) => p.point);
  const logged = await db.from("audit_log").insert({
    family_id: familyId,
    guardian_id: guardianId,
    action: "values.save",
    target: { version, agreed: count("agreed").length, differ: count("differ"), waiting: count("waiting").length, blocked: count("blocked") },
  });
  if (logged.error) throw new Error(logged.error.message);
}
