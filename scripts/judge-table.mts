// npm run fixture -- judge [model]: the judge measured (docs/judge-slice.md, stop 1). Every invented answer of
// slice 1's matcher table (docs/reports/2026-10-21-wonder-wall-1-slice.md, *The matcher table*: 105 questions, each
// with a right answer in a child's own words, the same misspelled, a wrong one, and on 17 the two choices typed
// back) and the answers to a hint in scripts/judge-hint-cases.json (written from test's cards of 22 Oct by a
// separate agent that never saw the judge's prompt), through the judge on one model with the wall's time limit,
// and through the word rule beside it. It prints the counts, the time and cost per call, and every answer the
// judge misjudged. It reads no database and writes nothing; it spends a little on the model.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { judgeGuess } from "../core/wall/answer.ts";
import { JUDGE_BUDGET_MS, JUDGE_MODEL, JUDGE_SCHEMA, judgeAnswer, type Verdict } from "../core/wall/judge.ts";
import { pool } from "../core/curation/week.ts";
import { costOf } from "../core/prices.ts";

type Kind = "own" | "misspelled" | "wrong" | "both" | "hint";
type Case = { id: string; kind: Kind; text: string; question: string; accept: string[]; hints: string[]; answer: string };

const RIGHT_KINDS: Kind[] = ["own", "misspelled"];
const KIND_NAMES: Record<Kind, string> = {
  own: "Right, in a child's own words",
  misspelled: "Right, misspelled as a 7-year-old types",
  wrong: "Wrong",
  both: "Both choices typed back",
  hint: "An answer to the hint, not the question",
};

// The table's rows: | # | day, slot, layer | question | accepted | choices | own | misspelled | wrong | both |, each
// answer cell "<answer> → every ok, any ok".
export function tableCases(report: string): Case[] {
  const at = report.indexOf("## The matcher table");
  if (at < 0) throw new Error("The slice 1 report has no matcher table.");
  const out: Case[] = [];
  for (const line of report.slice(at).split("\n")) {
    const m = line.match(/^\| (\d+) \|/);
    if (!m) continue;
    const cells = line.split(" | ").map((c) => c.replace(/^\| |\s*\|$/g, "").trim());
    const [n, , question, accepted, , own, misspelled, wrong, both] = cells;
    const accept = accepted.split("; ").map((a) => a.trim()).filter(Boolean);
    const answers: [Kind, string][] = [
      ["own", own],
      ["misspelled", misspelled],
      ["wrong", wrong],
      ["both", both ?? ""],
    ];
    for (const [kind, cell] of answers) {
      const answer = cell.split(" → ")[0].trim();
      if (answer) out.push({ id: `#${n} ${kind}`, kind, text: "", question, accept, hints: [], answer });
    }
  }
  return out;
}

type HintCase = { child: number; slot: string; layer: number; text: string; question: string; accept: string[]; hints: string[]; answer: string; kind: string };

export function hintCases(file: string): Case[] {
  return (JSON.parse(file) as HintCase[]).map((h, i) => ({
    id: `h${i + 1} child ${h.child} ${h.slot} ${h.layer} ${h.kind}`,
    kind: "hint" as const,
    text: h.text,
    question: h.question,
    accept: h.accept,
    hints: h.hints,
    answer: h.answer,
  }));
}

// Judged as intended: a right answer right; anything else anything but right, and an answer to the hint as hint.
const asIntended = (kind: Kind, v: Verdict) => (RIGHT_KINDS.includes(kind) ? v === "right" : kind === "hint" ? v === "hint" : v !== "right");

export async function runJudgeTable(model: string | undefined) {
  const { complete, debugTo } = await import("../core/model.ts");
  const { readPrompt } = await import("../core/prompts.ts");
  // JUDGE_DEBUG=<folder>: every request and reply written there, as week:build's --debug does.
  if (process.env.JUDGE_DEBUG) debugTo(process.env.JUDGE_DEBUG);
  const root = process.cwd();
  const cases = [
    ...tableCases(readFileSync(join(root, "docs/reports/2026-10-21-wonder-wall-1-slice.md"), "utf8")),
    ...hintCases(readFileSync(join(root, "scripts/judge-hint-cases.json"), "utf8")),
  ];
  const use = model ?? JUDGE_MODEL;
  const system = readPrompt("judge.md");
  console.log(`The judge on ${use}, ${JUDGE_BUDGET_MS} ms a guess, over ${cases.length} invented answers (two at a time, as two children answering at once).`);

  const tokens = { input: 0, output: 0, calls: 0 };
  const results = await pool(cases, 2, async (c) => {
    const key = { accept: c.accept, rubric: "" };
    const r = await judgeAnswer({ text: c.text, question: c.question, key, hints: c.hints, band: null, guess: c.answer }, ({ prompt, timeoutMs }) =>
      complete({
        system,
        prompt,
        maxTokens: 300,
        use: "judge",
        model: use,
        json: JUDGE_SCHEMA,
        timeoutMs,
        onUsage: (u) => {
          tokens.input += u.input;
          tokens.output += u.output;
          tokens.calls += 1;
        },
      }),
    );
    const rule = judgeGuess(c.answer, key, c.question, "every");
    const ruleVerdict: Verdict = rule === "right" ? "right" : rule === "not_a_guess" ? "not_a_guess" : "not_yet";
    // Past the time limit, or on an error, the word rule judges, as on the wall.
    const verdict = r.judgement?.verdict ?? ruleVerdict;
    return { c, r, verdict, ruleVerdict };
  });

  const kinds: Kind[] = ["own", "misspelled", "wrong", "both", "hint"];
  console.log("\n| Invented answer | Answers | Judge: as intended | Judge: right / close / hint / not yet / not a guess | Word rule: as intended |");
  console.log("|---|---|---|---|---|");
  for (const kind of kinds) {
    const rows = results.filter((x) => x.c.kind === kind);
    if (!rows.length) continue;
    const n = (v: Verdict) => rows.filter((x) => x.verdict === v).length;
    const ok = rows.filter((x) => asIntended(kind, x.verdict)).length;
    const ruleOk = rows.filter((x) => asIntended(kind, x.ruleVerdict)).length;
    console.log(`| ${KIND_NAMES[kind]} | ${rows.length} | ${ok} | ${n("right")} / ${n("close")} / ${n("hint")} / ${n("not_yet")} / ${n("not_a_guess")} | ${ruleOk} |`);
  }

  const timed = results.filter((x) => x.r.judgement).map((x) => x.r.ms).sort((a, b) => a - b);
  const pct = (p: number) => (timed.length ? timed[Math.min(timed.length - 1, Math.floor(p * timed.length))] : 0);
  const fell = results.filter((x) => !x.r.judgement);
  const retried = results.filter((x) => x.r.tries > 1).length;
  const cost = costOf(use, tokens);
  console.log(`\nTime a guess waited for a verdict: median ${pct(0.5)} ms, 90th percentile ${pct(0.9)} ms, slowest ${timed.at(-1) ?? 0} ms.`);
  console.log(`Judged by the word rule instead (no verdict in time, or an error): ${fell.length}; a second try: ${retried}.`);
  for (const [why, count] of Object.entries(Object.groupBy(fell, (x) => x.r.fault ?? "?"))) console.log(`  ${count!.length} × ${why}`);
  console.log(
    `Calls ${tokens.calls}, ${tokens.input.toLocaleString()} tokens in, ${tokens.output.toLocaleString()} out: ${
      cost === null ? "price unknown" : `$${cost.toFixed(4)}, $${(cost / Math.max(1, tokens.calls)).toFixed(5)} a call`
    }.`,
  );

  console.log("\nMisjudged by the judge:");
  for (const x of results.filter((x) => !asIntended(x.c.kind, x.verdict))) {
    const by = x.r.judgement ? x.r.judgement.reasoning : `word rule (${x.r.fault})`;
    console.log(`  ${x.c.id}: "${x.c.answer}" → ${x.verdict}. ${by}`);
  }
  const close = results.filter((x) => RIGHT_KINDS.includes(x.c.kind) && x.verdict === "close");
  if (close.length) console.log(`  (of these, ${close.length} right answers judged close: "You're close." and a clue)`);
}
