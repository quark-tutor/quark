"use server";

import { readFloor } from "@/core/curation/gate";
import { complete, modelFor } from "@/core/model";
import { costOf } from "@/core/prices";
import { kidFacingPrompt, readSafetyFloor } from "@/core/prompts";
import { familyRulebook, loadFamilyInputs, loadHandoffs } from "@/lib/family-rulebook";
import { requireGuardian } from "@/lib/guardian";
import { createAdminClient } from "@/lib/supabase/admin";
import { expectedFor, follows, notYetFor, TWENTY, type Expected } from "@/lib/twenty-questions";

// The rulebook's test run (docs/gate-slice.md, decisions 11 and 12): twenty questions answered by the
// tutor under the family's rulebook, for one child. One server action per question, so nothing hits a
// function limit and each answer appears as it arrives. Only the server writes gate_test_runs, one
// answer at a time; guardians read it through row-level security. The answer call (core/prompts/answer.md,
// on QUARK_MODEL_WRITE) is given the rulebook copy that names no child, which "Not yet" subjects still
// apply to this child, the child's age and reading level, and the question: nothing else (rule 7).

export type TestResult = {
  id: string;
  kind: "subject" | "floor" | "crude";
  subject?: number;
  question: string;
  rule: string; // what the rulebook says for it, in the interview's words
  expected: Expected;
  answer: string;
  handed_off: boolean;
  declined: boolean;
  ok: boolean | null; // null: for the parents to judge
  cost: number;
};

type Fail = { error: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const message = (e: unknown) => (e instanceof Error ? e.message : String(e));

const READING: Record<string, string> = {
  read_to: "is read to (doesn't read alone yet)",
  reads_alone: "reads alone",
  chapter_books: "reads chapter books",
};

const ANSWER_SCHEMA = {
  type: "object",
  properties: {
    answer: { type: "string" },
    handed_off: { type: "boolean" },
    declined: { type: "boolean" },
  },
  required: ["answer", "handed_off", "declined"],
  additionalProperties: false,
};

export async function startTestRun(childId: string): Promise<{ runId: string; questions: string[] } | Fail> {
  if (!UUID.test(childId)) return { error: "Bad request." };
  const guardian = await requireGuardian();
  if (!guardian) return { error: "This account isn't a guardian." };
  const db = createAdminClient();
  try {
    const [child, profile] = await Promise.all([
      db.from("children").select("id").eq("id", childId).eq("family_id", guardian.familyId).maybeSingle(),
      db.from("values_profiles").select("source_hash, policy_document").eq("family_id", guardian.familyId).maybeSingle(),
    ]);
    if (child.error || profile.error) throw new Error((child.error ?? profile.error)!.message);
    if (!child.data) return { error: "No such child in this family." };
    if (!profile.data?.policy_document || !profile.data.source_hash) return { error: "There's no rulebook yet. Answer a few subjects first." };
    const floor = readFloor(readSafetyFloor());
    const run = await db
      .from("gate_test_runs")
      .insert({ family_id: guardian.familyId, child_id: childId, rulebook_hash: profile.data.source_hash, floor_version: floor.version, model: modelFor("write") })
      .select("id")
      .single();
    if (run.error) throw new Error(run.error.message);
    const logged = await db.from("audit_log").insert({
      family_id: guardian.familyId,
      guardian_id: guardian.id,
      action: "gate_test.run",
      target: { run: run.data.id, child_id: childId },
    });
    if (logged.error) throw new Error(logged.error.message);
    return { runId: run.data.id, questions: TWENTY.map((q) => q.id) };
  } catch (e) {
    return { error: `Couldn't start the test run: ${message(e)}` };
  }
}

export async function answerTestQuestion(runId: string, questionId: string): Promise<{ result: TestResult } | Fail> {
  const q = TWENTY.find((t) => t.id === questionId);
  if (!UUID.test(runId) || !q) return { error: "Bad request." };
  const guardian = await requireGuardian();
  if (!guardian) return { error: "This account isn't a guardian." };
  const db = createAdminClient();
  try {
    const run = await db
      .from("gate_test_runs")
      .select("id, child_id, rulebook_hash, results, cost")
      .eq("id", runId)
      .eq("family_id", guardian.familyId)
      .maybeSingle();
    if (run.error) throw new Error(run.error.message);
    const kept = run.data;
    if (!kept) return { error: "No such test run." };
    const done = (kept.results as TestResult[]).find((r) => r.id === q.id);
    if (done) return { result: done };

    const [inputs, entries, kid] = await Promise.all([
      loadFamilyInputs(db, guardian.familyId),
      loadHandoffs(db),
      db.from("children").select("reading").eq("id", kept.child_id).single(),
    ]);
    if (kid.error) throw new Error(kid.error.message);
    const built = familyRulebook(inputs, entries);
    if (built.hash !== kept.rulebook_hash) return { error: "The rulebook changed during this run. Run it again." };
    const child = inputs.children.find((c) => c.id === kept.child_id);
    if (!child) return { error: "No such child in this family." };

    const point = q.kind === "subject" ? built.values.points.find((p) => p.point === q.subject) : undefined;
    const crudeDescribed = built.values.conduct.some((c) => c.key === "conduct.crude_line" && c.notes.length > 0);
    const { expected, rule } = expectedFor(q, point, child, {
      subjectName: (n) => inputs.points.find((p) => p.number === n)?.name ?? `Subject ${n}`,
      crudeDescribed,
    });

    const floor = readFloor(readSafetyFloor());
    const prompt = [
      "The family's rulebook:",
      "",
      built.gatePolicy.trim(),
      "",
      notYetFor(built.values.points, child),
      `The child is ${child.age} and ${READING[kid.data.reading] ?? "reads alone"}.`,
      "",
      `The child asks: "${q.question}"`,
    ].join("\n");
    let used: { model: string; input: number; output: number } | null = null;
    const reply = await complete<{ answer: string; handed_off: boolean; declined: boolean }>({
      system: `${kidFacingPrompt("answer.md")}\n\n${floor.text}`,
      prompt,
      maxTokens: 8000,
      use: "write",
      json: ANSWER_SCHEMA,
      label: `test-${q.id}`,
      onUsage: (u) => {
        used = u;
      },
    });
    const u = used as { model: string; input: number; output: number } | null;
    const cost = u ? (costOf(u.model, u) ?? 0) : 0;
    const got = { handed_off: !!reply.handed_off, declined: !!reply.declined };
    const result: TestResult = {
      id: q.id,
      kind: q.kind,
      ...(q.kind === "subject" ? { subject: q.subject } : {}),
      question: q.question,
      rule,
      expected,
      answer: String(reply.answer ?? "").trim(),
      ...got,
      ok: follows(expected, got),
      cost: Math.round(cost * 10_000) / 10_000,
    };

    // The client asks one question at a time, so this read-and-write doesn't race itself.
    const results = [...(kept.results as TestResult[]), result];
    const saved = await db
      .from("gate_test_runs")
      .update({
        results,
        cost: Math.round((Number(kept.cost) + cost) * 10_000) / 10_000,
        finished_at: results.length >= TWENTY.length ? new Date().toISOString() : null,
      })
      .eq("id", runId);
    if (saved.error) throw new Error(saved.error.message);
    return { result };
  } catch (e) {
    return { error: `Couldn't answer "${q.question}": ${message(e)}` };
  }
}
