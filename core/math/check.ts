import { rungsFor, rungsOf, tablesOf, type Ladder, type Place } from "../../lib/ladder.ts";
import { BRILLIANCE } from "../curation/cards.ts";
import { hasBrace } from "../curation/clean.ts";
import { leaves, operations, values, workOut, type Operation } from "./expr.ts";
import { numbersOf } from "./numbers.ts";
import { goalOf, PARTS, PICTURE_KINDS, quickOf, type MathDay, type MathProblem, type Picture } from "./problem.ts";

// The code check on a math problem (docs/math-tile-slice.md, What is built 4), beside checkCard(): the numbers are
// worked out by the program, never trusted from the model. Everything wrong, in plain words, for the second ask and
// for cards.policy_notes; empty when the problem is right. The rules:
//   - every part's and every step's answer is what its sum works out to, a whole number from 0 to 1,000, and the
//     last step's answer is the part's;
//   - the parts build toward one thing worth finding out (Brandon, 9 Nov 2026, at go): each part before the one the
//     others build toward is needed for it, its answer used in a later part's sum on the way there; only the younger
//     boy's quick one at the end stands alone;
//   - an other wording brings in no number the problem does not already have;
//   - no question, wording, step, tie or the setting says a part's answer, unless it is one of the sum's own numbers;
//   - none of them shows a sign (×, ÷, +, −, =, brackets): the model's words say a sum in words (found on test's first
//     math day, 9 Nov 2026: "What is 6 × (2 + 1)?"). The sum itself is shown under each question and step from the
//     start, written by the program from the expression (Brandon, fix round 4), never by the model;
//   - every number a part's sum is written with is on screen for him by then: in the setting (or its graph), in that
//     part's own question, or as an earlier part's answer (Brandon, 9 Nov 2026, fix round 2: "Trucks at the beach
//     park" asked for the trucks' and trikes' wheels together on a page that showed neither count). A number he
//     knows but is not shown (a square's 4 corners) is said in the setting or the question, and a hidden sum is
//     written out from the numbers on screen: "two scoops rice and one scoop mac salad" is 7 × (2 + 1), not 7 × 3;
//   - every sum is on one of his rungs: done, working, or alongside one he is working on; two operations in one sum
//     only when one is a quick sum to 20; on a rung's day, at least two parts are on that rung;
//   - the shape: four parts, two other wordings, two to four steps, a tie, two lines of working, a handoff, and the
//     worked example, on other numbers, when the rung is new to him;
//   - no brilliance word, no link, no stray brace.
// Pure.

export const MAX_ANSWER = 1000;
const ALWAYS = new Set([1]); // "one at a time", "each one": never a new number

export type MathContext = { day: MathDay; ladder: Pick<Ladder, "rungs" | "everyday">; places: Map<string, Place> };

const has = (s: unknown) => typeof s === "string" && s.trim().length > 0;
const ordinal = ["first", "second", "third", "fourth"];

export function checkMath(p: MathProblem, ctx: MathContext): string[] {
  const out: string[] = [];
  const { day } = ctx;
  if (!has(p?.title)) out.push("no title");
  if (!has(p?.setting)) out.push("no setting");
  if (!has(p?.handoff)) out.push("no handoff");
  const parts = Array.isArray(p?.parts) ? p.parts : [];
  if (parts.length !== PARTS) {
    out.push(`needs ${PARTS} parts, has ${parts.length}`);
    return out;
  }

  // The boy's rungs, and what each sum is on.
  const { done, working, alongside } = rungsFor(ctx.ladder, ctx.places);
  const his = new Set([...done, ...working, ...alongside]);
  const twoStep = his.has("two-step");
  const tables = tablesOf(ctx.ladder, ctx.places);
  const offRungs = (ops: Operation[], what: string) => {
    for (const o of ops) {
      const on = rungsOf(o, ctx.ladder, tables);
      if (!on.some((k) => his.has(k))) out.push(`${what}: ${o.operands.join(` ${o.op === "x" ? "×" : o.op} `)} is not on any of his rungs`);
    }
    if (ops.length > 1 && !twoStep && ops.filter((o) => !(o.op === "+" || o.op === "-") || o.result > 20 || o.operands.some((n) => n > 20)).length > 1) {
      out.push(`${what}: two operations in one sum, and neither is a quick sum to 20 (two-step problems are not his yet)`);
    }
  };

  const answers: (number | null)[] = [];
  const leavesOf: number[][] = [];
  let onDaysRung = 0;
  const given = new Set<number>([...numbersOf(p.setting ?? ""), ...(p.graph?.numbers ?? []), ...ALWAYS]);

  parts.forEach((part, i) => {
    const n = i + 1;
    const at = `part ${n}`;
    for (const key of ["question", "unit", "expression", "tie"] as const) if (!has(part?.[key])) out.push(`${at}: no ${key}`);
    const wordings = (part?.wordings ?? []).filter(has);
    if (wordings.length !== 2) out.push(`${at}: needs two other wordings, has ${wordings.length}`);
    const steps = Array.isArray(part?.steps) ? part.steps : [];
    if (steps.length < 2 || steps.length > 4) out.push(`${at}: needs two to four steps, has ${steps.length}`);
    const working = (part?.working ?? []).filter(has);
    if (working.length !== 2) out.push(`${at}: needs two lines of working, has ${working.length}`);

    // Its sum, worked out.
    const sum = has(part?.expression) ? workOut(part.expression) : { problem: "no sum" };
    let value: number | null = null;
    if ("problem" in sum) out.push(`${at}: ${sum.problem}`);
    else {
      value = sum.value;
      if (part.answer !== sum.value) out.push(`${at}: the answer is written as ${part.answer} but ${part.expression} works out to ${sum.value}`);
      if (!Number.isInteger(sum.value) || sum.value < 0 || sum.value > MAX_ANSWER) out.push(`${at}: the answer ${sum.value} is not a whole number from 0 to ${MAX_ANSWER}`);
      offRungs(operations(sum.expr), at);
      if (!day.everyday && operations(sum.expr).some((o) => rungsOf(o, ctx.ladder, tables).includes(day.teaches))) onDaysRung++;
    }
    // On screen by then: the setting and its graph, this part's question, and the earlier parts' answers, which
    // the page shows above the question ("So far:").
    if ("expr" in sum) {
      const shown = new Set([...numbersOf(p.setting ?? ""), ...(p.graph?.numbers ?? []), ...numbersOf(part?.question ?? ""), ...answers.filter((a): a is number => a !== null)]);
      const missing = [...new Set(leaves(sum.expr).filter((x) => !shown.has(x)))];
      if (missing.length) {
        out.push(`${at}: its sum needs ${missing.join(" and ")}, which ${missing.length === 1 ? "is" : "are"} not on screen by then: say ${missing.length === 1 ? "it" : "them"} in the setting or this part's question, or write the sum from the numbers there and the earlier answers`);
      }
    }
    answers.push(value);
    leavesOf.push("expr" in sum ? leaves(sum.expr) : []);
    for (const w of numbersOf(part?.question ?? "")) given.add(w);
    const allowed = new Set([...given, ...answers.slice(0, i).filter((a): a is number => a !== null), ...("expr" in sum ? values(sum.expr) : [])]);

    // Each wording asks the same question with the same numbers.
    wordings.forEach((w, k) => {
      const extra = numbersOf(w).filter((x) => !allowed.has(x));
      if (extra.length) out.push(`${at}: its ${ordinal[k]} other wording brings in ${[...new Set(extra)].join(", ")}, which the problem does not have`);
    });

    // The steps, each worked out, the last one landing on the part's answer.
    steps.forEach((s, k) => {
      const st = `${at}, step ${k + 1}`;
      if (!has(s?.question)) out.push(`${st}: no question`);
      const w = has(s?.expression) ? workOut(s.expression) : { problem: "no sum" };
      if ("problem" in w) out.push(`${st}: ${w.problem}`);
      else {
        if (s.answer !== w.value) out.push(`${st}: the answer is written as ${s.answer} but ${s.expression} works out to ${w.value}`);
        if (w.value < 0 || w.value > MAX_ANSWER) out.push(`${st}: the answer ${w.value} is not from 0 to ${MAX_ANSWER}`);
        offRungs(operations(w.expr), st);
        if (numbersOf(s.question ?? "").includes(w.value) && !leaves(w.expr).includes(w.value)) out.push(`${st}: its question says its own answer, ${w.value}`);
      }
    });
    if (steps.length && value !== null && steps[steps.length - 1]?.answer !== value) {
      out.push(`${at}: the last step's answer is ${steps[steps.length - 1]?.answer}, not the part's answer, ${value}`);
    }

    // Nothing says the answer before he does. An answer of 1 is looked for as the digit only: "one each" and "one at a
    // time" are everywhere and say nothing (found on test's day 5, 9 Nov 2026).
    if (value !== null && !leavesOf[i].includes(value)) {
      const says = (s: string | undefined) => (value === 1 ? /(?<![\d,.])1(?![\d,.])/.test(s ?? "") : numbersOf(s ?? "").includes(value!));
      if (says(p.setting)) out.push(`${at}: the setting says its answer, ${value}`);
      if (says(part.question)) out.push(`${at}: its question says its answer, ${value}`);
      wordings.forEach((w, k) => says(w) && out.push(`${at}: its ${ordinal[k]} other wording says its answer, ${value}`));
      steps.slice(0, -1).forEach((s, k) => says(s?.question) && out.push(`${at}, step ${k + 1}: says the part's answer, ${value}`));
      if (says(part.tie)) out.push(`${at}: its tie says its answer, ${value}`);
    }
    if (value !== null && working.length && !numbersOf(working[0]).includes(value)) out.push(`${at}: the first line of working does not show the answer, ${value}`);
  });

  // The parts build toward one thing worth finding out.
  const goal = goalOf(day.style);
  const quick = quickOf(day.style);
  const uses = (j: number, i: number) => answers[i] !== null && leavesOf[j].includes(answers[i]!);
  if (!Array.from({ length: goal - 1 }, (_, i) => i).some((i) => uses(goal - 1, i))) {
    out.push(`part ${goal} uses no earlier part's answer: the parts build toward part ${goal}, each one needed for it`);
  }
  // Where code can hold it: no part before the goal stands alone. Each uses an earlier part's answer, or a later
  // part uses its answer (the prompt asks for more: each one needed for the last).
  for (let i = 0; i < goal - 1; i++) {
    const usesEarlier = Array.from({ length: i }, (_, k) => k).some((k) => uses(i, k));
    const usedLater = Array.from({ length: goal - 1 - i }, (_, k) => i + 1 + k).some((j) => uses(j, i));
    if (!usesEarlier && !usedLater && answers[i] !== null) out.push(`part ${i + 1} stands alone: no other part uses its answer, ${answers[i]}, and it uses none; every part builds toward part ${goal}`);
  }

  // His style.
  parts.forEach((part, i) => {
    const w = has(part?.expression) ? workOut(part.expression) : null;
    if (!w || "problem" in w) return;
    const ops = operations(w.expr).length;
    if (day.style === "short" && ops > 1) out.push(`part ${i + 1}: one short sum a part, and this has ${ops} operations`);
    if (quick === i + 1 && ops !== 1) out.push(`part ${i + 1}: the quick one is a single sum`);
  });

  if (!day.everyday && onDaysRung < 2) out.push(`only ${onDaysRung} part${onDaysRung === 1 ? " is" : "s are"} on today's rung, ${day.teaches}: at least two`);
  if (day.teaches === "bar-graph" && (p.graph?.kind !== "graph" || (p.graph.numbers?.length ?? 0) < 2)) out.push("a bar graph problem needs its graph: two bars or more");
  out.push(...pictureProblems(p.graph, "the graph"));

  // The worked example, when the rung or area is new to him.
  if (day.isNew) {
    const ex = p.example;
    if (!ex || !has(ex.text) || !has(ex.expression)) out.push(`no worked example, and ${day.teaches} is new to him`);
    else {
      const w = workOut(ex.expression);
      if ("problem" in w) out.push(`the worked example: ${w.problem}`);
      else {
        if (!(ex.working ?? []).filter(has).length) out.push("the worked example has no working");
        if (!numbersOf(ex.text).includes(w.value) && !(ex.working ?? []).some((l) => numbersOf(l).includes(w.value))) out.push(`the worked example never shows its answer, ${w.value}`);
        const same = parts.findIndex((pt, i) => answers[i] === w.value && sameNumbers(leavesOf[i], leaves(w.expr)));
        if (same >= 0) out.push(`the worked example uses part ${same + 1}'s own numbers: it is on other numbers`);
        out.push(...pictureProblems(ex.picture, "the worked example's picture", values(w.expr)));
        if (ex.picture?.kind === "none") out.push("the worked example has no picture");
      }
    }
  }

  // Signs only in the working and the worked example.
  const signed = (s: string | undefined) => !!s && (/[×÷=()*]|[−–]/.test(s) || /\d\s*[+\-/]\s*\$?\d/.test(s));
  if (signed(p.setting)) out.push("the setting shows a sign: say the sum in words");
  parts.forEach((pt, i) => {
    const where = [
      ["its question", pt?.question],
      ...(pt?.wordings ?? []).map((w, k) => [`its ${ordinal[k]} other wording`, w]),
      ...(pt?.steps ?? []).map((s, k) => [`step ${k + 1}`, s?.question]),
      ["its tie", pt?.tie],
    ] as [string, string | undefined][];
    for (const [what, s] of where) if (signed(s)) out.push(`part ${i + 1}: ${what} shows a sign, "${s}": say the sum in words`);
  });

  const words = [p.title, p.setting, p.handoff, p.example?.text, ...(p.example?.working ?? []), ...parts.flatMap((pt) => [pt?.question, ...(pt?.wordings ?? []), pt?.tie, ...(pt?.working ?? []), ...(pt?.steps ?? []).map((s) => s?.question)])]
    .filter(has)
    .join(" ");
  const brilliance = words.match(BRILLIANCE);
  if (brilliance) out.push(`uses a brilliance word ("${brilliance[0]}"); use effort words`);
  if (/https?:|www\./i.test(words)) out.push("contains a link");
  if (hasBrace(words)) out.push("has a stray { or } in its words");
  return [...new Set(out)];
}

const sameNumbers = (a: number[], b: number[]) => a.length === b.length && [...a].sort().join() === [...b].sort().join();

// A drawn picture's numbers make sense for its kind, and, for a worked example, are the example's own.
function pictureProblems(pic: Picture | undefined, what: string, own?: number[]): string[] {
  if (!pic || pic.kind === "none") return [];
  const out: string[] = [];
  const nums = pic.numbers ?? [];
  if (!PICTURE_KINDS.includes(pic.kind)) return [`${what}: no such kind of picture, ${pic.kind}`];
  if (!nums.every((n) => Number.isInteger(n) && n >= 0 && n <= MAX_ANSWER)) out.push(`${what}: its numbers are not whole numbers to ${MAX_ANSWER}`);
  if (pic.kind === "groups" && (nums.length !== 2 || nums[0] < 1 || nums[0] > 12 || nums[1] < 1 || nums[1] > 12)) out.push(`${what}: groups need two numbers, how many groups and how many in each, each up to 12`);
  if (pic.kind === "groups" && own && nums.length === 2 && !own.includes(nums[0] * nums[1])) out.push(`${what}: ${nums[0]} groups of ${nums[1]} is not in its sum`);
  if (pic.kind === "blocks" && (nums.length < 1 || nums.length > 3)) out.push(`${what}: blocks show one to three numbers`);
  if (pic.kind === "blocks" && own && !nums.every((n) => own.includes(n))) out.push(`${what}: its blocks are not the sum's numbers`);
  if (pic.kind === "clock" && (nums.length !== 1 || nums[0] > 60)) out.push(`${what}: a clock shades one number of minutes, up to 60`);
  if (pic.kind === "graph" && (nums.length < 2 || nums.length > 6 || (pic.labels ?? []).length !== nums.length)) out.push(`${what}: a graph has two to six bars, each with a name`);
  return out;
}
