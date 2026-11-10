import { rungsFor, tablesOf, type Ladder, type Place, type Rule } from "../../lib/ladder.ts";
import { checkMath } from "../math/check.ts";
import {
  goalOf,
  NO_PICTURE,
  PARTS,
  PICTURE_KINDS,
  quickOf,
  whyOf,
  type MathCard,
  type MathDay,
  type MathPart,
  type MathProblem,
  type MathStyle,
  type Picture,
  type WorkedExample,
} from "../math/problem.ts";
import type { CardBody, Complete, Reading } from "./cards.ts";
import { cleanEnds } from "./clean.ts";

// The Math tile's problems, written on Sunday (docs/math-tile-slice.md, What is built 3): one model call per child per
// day of a math week (use: "write", kidFacingPrompt("math.md")), from a plan made in code: which rung or everyday area
// each day is on (planMath), whether it is new to him, and his style. checkMath() works out every number; a problem
// that fails is asked again once, with what failed, and then held back. The prompt carries his age, reading level,
// style, rungs and, as a way in, his interests: no nickname, since a problem speaks to him as "you" (rule 7).

// --- Which rung each day is on ---

export const EVERYDAY_DAYS = [3, 6]; // Wednesday and Saturday (decided at stop 1, 9 Nov 2026: about two days in seven)

export type MathHistory = { teaches: string; day: string }[]; // his math problems in earlier weeks, any order

export type MathChild = {
  id: string;
  age: number;
  reading: Reading;
  interests: string[];
  style: MathStyle | null; // null: no math for him
  places: Map<string, Place>;
  met: Set<string>; // the rungs and areas he has answered a part on
  history: MathHistory;
};

// His seven days: the everyday days take the areas in the file's order, one he has never had first, then the one he
// had longest ago; the other days take his working rungs (and what starts alongside them) the same way. An area that
// needs a rung he has not met waits. Pure, from earlier weeks only, so every Sunday firing plans the same week.
export function planMath(ladder: Pick<Ladder, "rungs" | "everyday">, child: MathChild, days = 7): MathDay[] {
  if (!child.style) return [];
  const { working, alongside } = rungsFor(ladder, child.places);
  const rungs = [...working, ...alongside].sort((a, b) => ladder.rungs.findIndex((r) => r.key === a) - ladder.rungs.findIndex((r) => r.key === b));
  const knows = (k: string) => child.places.has(k) || child.met.has(k);
  const areas = ladder.everyday.filter((a) => !a.needs || knows(a.needs)).map((a) => a.key);
  const last = new Map<string, number>();
  [...child.history].sort((a, b) => a.day.localeCompare(b.day)).forEach((h, i) => last.set(h.teaches, i));
  let clock = child.history.length;
  const pick = (from: string[]) => {
    if (!from.length) return null;
    const next = [...from].sort((a, b) => (last.get(a) ?? -1) - (last.get(b) ?? -1) || from.indexOf(a) - from.indexOf(b))[0];
    last.set(next, clock++);
    return next;
  };
  const out: MathDay[] = [];
  for (let day = 1; day <= days; day++) {
    const everyday = EVERYDAY_DAYS.includes(day) && areas.length > 0;
    const teaches = everyday ? pick(areas) : pick(rungs);
    if (!teaches) continue;
    out.push({ day, teaches, everyday, isNew: !knows(teaches), style: child.style });
  }
  return out;
}

// --- The call ---

const READING: Record<Reading, string> = { read_to: "is read to (doesn't read alone yet)", reads_alone: "reads alone", chapter_books: "reads chapter books" };

export type MathContext = {
  child: MathChild;
  day: MathDay;
  ladder: Pick<Ladder, "rungs" | "everyday">;
  earlier: string[]; // titles of his math problems on earlier days this week
};

// A rung's rule in words, as checkMath() holds it, so the model can put a sum on the rung (found rewriting test's
// Wednesday, 9 Nov 2026: "groups of" was written as 6 × 10, which is not on it).
export function ruleWords(rule: Rule, tables: number[] = []): string {
  const max = rule.max ? `, every number ${rule.max.toLocaleString("en-US")} or less` : "";
  if (rule.steps) return "two different sums, one after the other";
  if (rule.op === "+") return `adding${max}`;
  if (rule.op === "-") return `taking away${max}`;
  if (rule.op === "+-") return `adding or taking away${max}`;
  if (rule.op === "x" && rule.by) return `a times sum with one number ${rule.by.join(", ").replace(/, (\d+)$/, " or $1")}${rule.each ? ` and the other ${rule.each} or less` : ""}${rule.max ? `, the answer ${rule.max.toLocaleString("en-US")} or less` : ""}`;
  if (rule.op === "x") return `a times sum with both numbers ${rule.each} or less (equal groups added up count too)`;
  if (rule.op === "/" && rule.share) return `sharing fairly, where the number of shares or the share is ${tables.length ? tables.join(", ").replace(/, (\d+)$/, " or $1") : "a times table he has"}`;
  if (rule.op === "/") return `sharing, with both the number of shares and the share ${rule.each} or less`;
  return `what is left over, sharing by ${rule.each} or less`;
}

// The data for one call; the instructions are in core/prompts/math.md.
export function mathPrompt(ctx: MathContext): string {
  const { child, day, ladder } = ctx;
  const { done, working, alongside } = rungsFor(ladder, child.places);
  const rung = (k: string) => ladder.rungs.find((r) => r.key === k)!;
  const tablesFor = tablesOf(ladder, child.places);
  const line = (k: string) => `- ${rung(k).name}: ${rung(k).asks}. For example, ${rung(k).example}. A sum is on it when it is ${ruleWords(rung(k).rule, tablesFor)}.`;
  const focus = day.everyday ? ladder.everyday.find((a) => a.key === day.teaches)! : rung(day.teaches);
  const tables = tablesOf(ladder, child.places);
  return [
    `The boy: age ${child.age}; he ${READING[child.reading]}.`,
    `His style: ${day.style}. The part the others build toward is part ${goalOf(day.style)}.${quickOf(day.style) ? ` Part ${quickOf(day.style)} is the quick one.` : ""}`,
    child.interests.length ? `Things he likes, for the setting where one passes the Hawaiʻi question: ${child.interests.join(", ")}.` : "",
    "",
    "Rungs he has done (use them freely):",
    ...done.map(line),
    "Rungs he is working on:",
    ...working.map(line),
    ...(alongside.length ? ["Starting alongside what he is working on:", ...alongside.map(line)] : []),
    tables.length ? `The times tables he has, for sharing: ${tables.join(", ")}.` : "",
    "",
    day.everyday
      ? `Today is an everyday day: ${focus.name}. ${focus.asks}. For example, ${focus.example}. Its sums stay on his rungs.`
      : `Today's rung: ${focus.name}. ${focus.asks}. At least two parts are on it: each of those parts' sums is ${ruleWords(rung(day.teaches).rule, tables)}.`,
    day.isNew ? "It is new to him: write the worked example." : "It is not new to him: no worked example.",
    day.teaches === "bar-graph" ? "Draw the setting's numbers as a bar graph." : "",
    ctx.earlier.length ? `His problems on earlier days this week (a different setting today): ${ctx.earlier.join("; ")}.` : "",
  ]
    .filter((l) => l !== "")
    .join("\n");
}

const PICTURE_SCHEMA = {
  type: "object",
  properties: { kind: { type: "string", enum: [...PICTURE_KINDS] }, numbers: { type: "array", items: { type: "integer" } }, labels: { type: "array", items: { type: "string" } } },
  required: ["kind", "numbers", "labels"],
  additionalProperties: false,
};
const PART_SCHEMA = {
  type: "object",
  properties: {
    question: { type: "string" },
    answer: { type: "integer" },
    unit: { type: "string" },
    expression: { type: "string" },
    wordings: { type: "array", items: { type: "string" } },
    steps: {
      type: "array",
      items: { type: "object", properties: { question: { type: "string" }, answer: { type: "integer" }, expression: { type: "string" } }, required: ["question", "answer", "expression"], additionalProperties: false },
    },
    tie: { type: "string" },
    working: { type: "array", items: { type: "string" } },
  },
  required: ["question", "answer", "unit", "expression", "wordings", "steps", "tie", "working"],
  additionalProperties: false,
};
// The parts are an array, not four named keys as the cards are: four copies of the part made a grammar the API
// refused as too large (9 Nov 2026). checkMath() refuses anything but four, and the second ask says so.
export const MATH_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    setting: { type: "string" },
    graph: PICTURE_SCHEMA,
    parts: { type: "array", items: PART_SCHEMA },
    example: {
      type: "object",
      properties: { text: { type: "string" }, working: { type: "array", items: { type: "string" } }, expression: { type: "string" }, picture: PICTURE_SCHEMA },
      required: ["text", "working", "expression", "picture"],
      additionalProperties: false,
    },
    handoff: { type: "string" },
  },
  required: ["title", "setting", "graph", "parts", "example", "handoff"],
  additionalProperties: false,
};

export type RawMath = {
  parts?: MathPart[];
  title?: string;
  setting?: string;
  graph?: Picture;
  example?: WorkedExample;
  handoff?: string;
};

const tidy = (s: unknown) => (typeof s === "string" ? cleanEnds(s) : "");
const tidyPicture = (p: Picture | undefined): Picture =>
  p && PICTURE_KINDS.includes(p.kind) && p.kind !== "none" ? { kind: p.kind, numbers: [...(p.numbers ?? [])], labels: (p.labels ?? []).map(tidy) } : NO_PICTURE;

// The reply as a problem, every string's ends tidied; an example only when it is new to him and written.
export function problemOf(raw: RawMath, isNew: boolean): MathProblem {
  const parts = (Array.isArray(raw?.parts) ? raw.parts : []).filter((p): p is MathPart => !!p && typeof p === "object");
  const ex = raw?.example;
  return {
    title: tidy(raw?.title),
    setting: tidy(raw?.setting),
    graph: tidyPicture(raw?.graph),
    parts: parts.map((p) => ({
      question: tidy(p.question),
      answer: p.answer,
      unit: tidy(p.unit),
      expression: tidy(p.expression),
      wordings: (p.wordings ?? []).map(tidy).filter(Boolean),
      steps: (p.steps ?? []).map((s) => ({ question: tidy(s?.question), answer: s?.answer, expression: tidy(s?.expression) })),
      tie: tidy(p.tie),
      working: (p.working ?? []).map(tidy).filter(Boolean),
    })),
    example: isNew && ex && tidy(ex.text) ? { text: tidy(ex.text), working: (ex.working ?? []).map(tidy).filter(Boolean), expression: tidy(ex.expression), picture: tidyPicture(ex.picture) } : null,
    handoff: tidy(raw?.handoff),
  };
}

export type WrittenMath = { problem: MathProblem; asked: number; problems: string[] }; // problems: still wrong after the second try

export async function writeMath(ctx: MathContext, deps: { complete: Complete; system: string; label: string }): Promise<WrittenMath> {
  const prompt = mathPrompt(ctx);
  const ask = (extra: string) =>
    deps.complete<RawMath>({ system: deps.system, prompt: prompt + extra, maxTokens: 16000, use: "write", json: MATH_SCHEMA, label: `${deps.label}${extra ? "-again" : ""}` });
  const check = (p: MathProblem) => checkMath(p, { day: ctx.day, ladder: ctx.ladder, places: ctx.child.places });
  let problem = problemOf(await ask(""), ctx.day.isNew);
  let problems = check(problem);
  let asked = 1;
  if (problems.length) {
    problem = problemOf(await ask(`\n\nYour last try had these problems. Write the whole problem again and fix them:\n- ${problems.join("\n- ")}`), ctx.day.isNew);
    problems = check(problem);
    asked = 2;
  }
  return { problem, asked, problems };
}

// --- Onto the wall ---

// The cards a problem becomes, one per part, each standing alone: the setting as its text, its own question, and
// everything the tutor may say about it in body.math. A problem missing parts becomes one card, to be held back.
export function mathCards(problem: MathProblem, day: MathDay): CardBody[] {
  const graphAlt = problem.graph.kind === "graph" ? `A bar graph: ${problem.graph.labels.map((l, i) => `${l} ${problem.graph.numbers[i]}`).join(", ")}.` : "";
  if (problem.parts.length !== PARTS) {
    return [{ title: problem.title || "Math", text: problem.setting, image_alt: graphAlt, question: problem.parts[0]?.question ?? "", hints: [], handoff: problem.handoff }];
  }
  return problem.parts.map((part, i) => {
    const math: MathCard = {
      ...part,
      part: i + 1,
      of: PARTS,
      goal: goalOf(day.style),
      teaches: day.teaches,
      everyday: day.everyday,
      why: whyOf(day.style) === i + 1,
      quick: quickOf(day.style) === i + 1,
      graph: problem.graph,
      ...(i === 0 && problem.example ? { example: problem.example } : {}),
    };
    return { title: problem.title, text: problem.setting, image_alt: graphAlt, question: part.question, hints: [], handoff: problem.handoff, math };
  });
}

// The question row's answer key: the number, as the wall reads it (core/math/numbers.ts), and the sum for the parents.
export const mathAnswerKey = (part: MathPart) => ({ accept: [String(part.answer)], rubric: `${part.answer} ${part.unit} (${part.expression})` });
