import { parse } from "yaml";
import { numbersFor, type Numbers } from "../core/boat/day.ts";

// The math ladder (plan/math-ladder.yaml; docs/math-tile-slice.md, The ladder): the parents' list of what to learn,
// in order, and the everyday areas beside it. npm run ladder:import writes it into `skills`, one row each, keyed;
// a boy's place on a rung is a `mastery` row (done or working), never in a file. This file reads and checks the
// ladder, and says what the trading boat takes from a boy's places: his prices and the most in one sum. Pure.

export const LADDER_FILE = "math-ladder.yaml";
const KEY = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export type RuleOp = "+" | "-" | "+-" | "x" | "/" | "%";
export type Rule = { op?: RuleOp; max?: number; by?: number[]; each?: number; share?: boolean; steps?: number };

export type Rung = { key: string; name: string; asks: string; example: string; rule: Rule; alongside?: string[] };
export type Area = { key: string; name: string; asks: string; example: string; needs?: string };
export type Ladder = { ladder: string; title: string; rungs: Rung[]; everyday: Area[] };

export type Place = "done" | "working";
export const PLACES: readonly Place[] = ["done", "working"];

export const parseLadder = (text: string) => parse(text) as Ladder;
export const isLadder = (doc: unknown): doc is Ladder => !!doc && typeof doc === "object" && "ladder" in doc;

const text = (v: unknown) => typeof v === "string" && v.trim().length > 0;
const whole = (v: unknown) => Number.isInteger(v) && (v as number) > 0;

// Everything wrong with the ladder, in plain words. Empty when it is right.
export function validateLadder(l: Ladder): string[] {
  const errors: string[] = [];
  if (!l || typeof l !== "object") return ["not a YAML mapping"];
  if (l.ladder !== "math") errors.push('ladder must be "math"');
  if (!text(l.title)) errors.push("missing title");
  if (!Array.isArray(l.rungs) || !l.rungs.length) errors.push("no rungs");
  if (!Array.isArray(l.everyday)) errors.push("no everyday list");
  const keys = new Set<string>();
  const all = [...(l.rungs ?? []), ...(l.everyday ?? [])];
  for (const [i, x] of all.entries()) {
    const at = `${i < (l.rungs?.length ?? 0) ? "rung" : "everyday"} ${x?.key ?? i + 1}`;
    if (!text(x?.key) || !KEY.test(x.key)) errors.push(`${at}: key must be lowercase words joined by hyphens`);
    else if (keys.has(x.key)) errors.push(`${at}: key used twice`);
    else keys.add(x.key);
    for (const f of ["name", "asks", "example"] as const) if (!text(x?.[f])) errors.push(`${at}: missing ${f}`);
  }
  for (const r of l.rungs ?? []) {
    const rule = r?.rule;
    const at = `rung ${r?.key}`;
    if (!rule || typeof rule !== "object") {
      errors.push(`${at}: missing rule`);
      continue;
    }
    if (rule.steps !== undefined) {
      if (!whole(rule.steps) || rule.op) errors.push(`${at}: a steps rule is a whole number and nothing else`);
      continue;
    }
    if (!["+", "-", "+-", "x", "/", "%"].includes(rule.op as string)) errors.push(`${at}: rule op must be +, -, +-, x, / or %`);
    if (rule.max !== undefined && !whole(rule.max)) errors.push(`${at}: rule max must be a whole number`);
    if (rule.each !== undefined && !whole(rule.each)) errors.push(`${at}: rule each must be a whole number`);
    if (rule.by !== undefined && (!Array.isArray(rule.by) || !rule.by.every(whole))) errors.push(`${at}: rule by must list whole numbers`);
    if ((rule.op === "+" || rule.op === "-" || rule.op === "+-") && !rule.max) errors.push(`${at}: an adding or taking-away rule needs a max`);
    if (rule.op === "x" && !rule.each && !rule.by) errors.push(`${at}: a times rule needs by or each`);
    if ((rule.op === "/" || rule.op === "%") && !rule.share && !rule.each) errors.push(`${at}: a sharing rule needs share or each`);
    for (const a of r.alongside ?? []) if (!(l.rungs ?? []).some((x) => x.key === a)) errors.push(`${at}: alongside names no rung "${a}"`);
  }
  for (const a of l.everyday ?? []) {
    if (a?.needs && !(l.rungs ?? []).some((x) => x.key === a.needs)) errors.push(`everyday ${a.key}: needs names no rung "${a.needs}"`);
  }
  return errors;
}

// The rows npm run ladder:import writes into skills: the rungs in order, then the everyday areas.
export type SkillRow = { key: string; name: string; kind: "rung" | "everyday"; position: number; ladder: Record<string, unknown> };
export function ladderRows(l: Ladder): SkillRow[] {
  return [
    ...l.rungs.map((r, i) => ({ key: r.key, name: r.name, kind: "rung" as const, position: i + 1, ladder: { asks: r.asks, example: r.example, rule: r.rule, ...(r.alongside ? { alongside: r.alongside } : {}) } })),
    ...l.everyday.map((a, i) => ({ key: a.key, name: a.name, kind: "everyday" as const, position: i + 1, ladder: { asks: a.asks, example: a.example, ...(a.needs ? { needs: a.needs } : {}) } })),
  ];
}

// --- What the trading boat reads from a boy's places (docs/trading-boat-slice.md) ---

// The times-table rungs: a times rule with its tables named, keyed "times-" (2s 5s 10s, 3s 4s, 6s to 9s). The boat's
// prices come from these alone, and the family's setting on /parent is one place on each (docs/trading-boat-2-slice.md).
// Multiplying bigger numbers is not one: it sets the most in one sum (largestCount), which the setting does not offer.
export const isTimesRung = (r: Pick<Rung, "key" | "rule">) => r.rule.op === "x" && !!r.rule.by && r.key.startsWith("times-");

// The times tables a boy has: every "by" of a times rung he is placed on, done or working. His prices are these.
export function tablesOf(l: Pick<Ladder, "rungs">, places: Map<string, Place>): number[] {
  return [...new Set(l.rungs.filter((r) => places.has(r.key) && isTimesRung(r)).flatMap((r) => r.rule.by!))];
}

// The times tables he is working on: the practice goes to these.
export function workingTablesOf(l: Pick<Ladder, "rungs">, places: Map<string, Place>): number[] {
  return [...new Set(l.rungs.filter((r) => places.get(r.key) === "working" && isTimesRung(r)).flatMap((r) => r.rule.by!))];
}

// The most crates or bills in one sum (Brandon, 16 Nov 2026, at stop 1's fix round: "the size of a sum follows his
// place on the ladder, never his boat or his money"; "A count above 10 in one sum appears only when the ladder says he
// is working on bigger multiplying"). 10, or the bigger-multiplying rung's "each" once he is placed on it.
export const BIGGER_RUNG = "bigger-times";
export function largestCount(l: Pick<Ladder, "rungs">, places: Map<string, Place>): number {
  const bigger = l.rungs.find((r) => r.key === BIGGER_RUNG);
  return bigger && places.has(BIGGER_RUNG) ? Math.max(10, bigger.rule.each ?? 10) : 10;
}

// The boat's numbers from a boy's places: his prices, the usual price and the most in one sum (core/boat/day.ts), or
// null when his places give the boat none. Equal places give equal numbers, so the same family setting gives both boys
// the same prices (Brandon, 16 Nov 2026: "the boys prices better be equal, they're competitive with each other").
export const boatNumbers = (l: Pick<Ladder, "rungs">, places: Map<string, Place>): Numbers | null =>
  numbersFor(tablesOf(l, places), workingTablesOf(l, places), largestCount(l, places));
