// The gate against the database, shared by scripts/gate.mts, the week build (core/curation/week-job.ts)
// and the Sunday route: load the family's rulebook (from the same merge the rulebook and compare pages
// use), the safety floor and a week's cards, run core/curation/gate.ts, and write each verdict. The
// terminal's part of the report (printGate) stays in scripts/gate-run.ts. Relative imports with
// extensions, so the scripts and the app both load it.

import type { SupabaseClient } from "@supabase/supabase-js";
import { ageFrom } from "../../lib/beliefs.ts";
import { familyRulebook, loadFamilyInputs, loadHandoffs } from "../../lib/family-rulebook.ts";
import type { Perspective } from "../../lib/values.ts";
import { modelFor } from "../model.ts";
import { readPrompt, readSafetyFloor } from "../prompts.ts";
import { readFloor, runGate, type Floor, type GateCard, type GateChild, type GateComplete, type GateReport, type PolicyNotes, type Rulebook } from "./gate.ts";

export type GateChildRow = GateChild & { nickname: string };

export type GateSetup = {
  model: string;
  floor: Floor;
  system: string; // gate.md, then the floor
  rulebook: Rulebook | null;
  missing: string | null; // why there is no rulebook the gate can use
  children: GateChildRow[];
  documentChars: number | null; // the gate's copy of the rulebook, for the report
};

type Reply = { data: unknown; error: { message: string } | null };
function must<R extends Reply>(r: R, what: string): NonNullable<R["data"]> {
  if (r.error) throw new Error(`${what}: ${r.error.message}`);
  if (r.data === null || r.data === undefined) throw new Error(`${what}: nothing came back`);
  return r.data as NonNullable<R["data"]>;
}

// Everything the gate needs before it spends anything. Throws if QUARK_MODEL_GATE isn't set.
export async function gateSetup(db: SupabaseClient, familyId: string): Promise<GateSetup> {
  const model = modelFor("gate");
  const floor = readFloor(readSafetyFloor());
  const system = `${readPrompt("gate.md")}\n\n${floor.text}`;
  const [inputs, entries, profile, kids] = await Promise.all([
    loadFamilyInputs(db, familyId),
    loadHandoffs(db),
    db.from("values_profiles").select("policy_document, source_hash").eq("family_id", familyId).maybeSingle(),
    db.from("children").select("id, nickname, birth_month, careful_about").eq("family_id", familyId).order("birth_month"),
  ]);
  if (profile.error) throw new Error(`values_profiles: ${profile.error.message}`);
  const children = must(kids, "children").map((k) => ({
    id: k.id as string,
    nickname: k.nickname as string,
    age: ageFrom(k.birth_month as string),
    carefulAbout: (k.careful_about as string | null)?.trim() || null,
  }));

  const built = familyRulebook(inputs, entries);
  let missing: string | null = null;
  if (!profile.data?.policy_document) missing = "the family has no rulebook yet (take Our Family's Beliefs at /parent/beliefs first)";
  else if (profile.data.source_hash !== built.hash) {
    missing = "the saved rulebook is older than the family's answers: open /parent/beliefs/rulebook once so it saves, then run the gate again";
  }
  const rulebook: Rulebook | null = missing
    ? null
    : { hash: built.hash, text: built.gatePolicy, values: built.values, pointNames: new Map(inputs.points.map((p) => [p.number, p.name])) };
  return { model, floor, system, rulebook, missing, children, documentChars: rulebook ? rulebook.text.length : null };
}

type CardDb = {
  id: string;
  child_id: string;
  day: string;
  slot: string;
  layer: number;
  policy: GateCard["policy"];
  policy_notes: PolicyNotes | null;
  body: GateCard["body"];
  ideas: { plan_topics: { values_points: number[] | null; perspective: Perspective | null } | null } | null;
};

export async function themeCards(db: SupabaseClient, themeId: string, childId?: string): Promise<GateCard[]> {
  let q = db
    .from("cards")
    .select("id, child_id, day, slot, layer, policy, policy_notes, body, ideas(plan_topics(values_points, perspective))")
    .eq("theme_id", themeId);
  if (childId) q = q.eq("child_id", childId);
  const rows = must(await q.order("day").order("slot").order("layer"), "cards") as unknown as CardDb[];
  return rows.map((c) => ({
    id: c.id,
    childId: c.child_id,
    label: `${c.day} ${c.slot}, layer ${c.layer}`,
    policy: c.policy,
    notes: c.policy_notes,
    body: c.body,
    subjects: c.ideas?.plan_topics?.values_points ?? [],
    perspective: c.ideas?.plan_topics?.perspective ?? null,
  }));
}

export type GateThemeOptions = {
  complete: GateComplete; // the caller's own (a run's metered one), never a global
  childId?: string; // one child's cards
  pendingOnly?: boolean; // see GateOptions: leave verdicts on another rulebook alone
};

// Check one week's cards (one child's, with childId) and write the verdicts.
export async function gateTheme(db: SupabaseClient, familyId: string, themeId: string, setup: GateSetup, opts: GateThemeOptions): Promise<GateReport> {
  const cards = await themeCards(db, themeId, opts.childId);
  return runGate(
    {
      cards,
      children: setup.children,
      rulebook: setup.rulebook,
      missing: setup.missing ?? undefined,
      floor: setup.floor,
      system: setup.system,
      model: setup.model,
      pendingOnly: opts.pendingOnly,
    },
    {
      complete: opts.complete,
      async saveVerdict(cardId, policy, notes) {
        const { error } = await db.from("cards").update({ policy, policy_notes: notes }).eq("id", cardId);
        if (error) throw new Error(`cards: ${error.message}`);
      },
      async currentHash() {
        const { data, error } = await db.from("values_profiles").select("source_hash").eq("family_id", familyId).maybeSingle();
        if (error) throw new Error(`values_profiles: ${error.message}`);
        return (data?.source_hash as string | undefined) ?? null;
      },
    },
  );
}

// Exit code for a gate run: an error when anything was left pending.
export const gateFailed = (report: GateReport) => report.pending > 0 || report.rulebookChanged;
