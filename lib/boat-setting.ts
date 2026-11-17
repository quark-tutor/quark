import { numbersProblem, type Numbers } from "../core/boat/day.ts";
import { boatNumbers, isTimesRung, type Place, type Rule } from "./ladder.ts";

// The family's times tables for the trading boat (docs/trading-boat-2-slice.md, What is built 2): one setting on
// /parent, a place on each times-table rung (not yet, working on, done), written the same for every child, so both boys
// have the same prices (Brandon, 16 Nov 2026: "the boys prices better be equal"). This file reads the setting from the
// children's places, checks a setting before it is saved, and says in the parents' words what prices it gives. Pure.
// For the parents only: no word here reaches a child, and no rung's name or level is shown on the iPad.

export type TimesRung = { id: string; key: string; name: string; rule: Rule };
export type Setting = Map<string, Place | null>; // a rung's key → its place; null is not yet
export const SETTING_PLACES = ["not yet", "working", "done"] as const;

// The times-table rungs from skills' rows, in ladder order.
export function timesRungs(rows: { id: string; key: string | null; name: string; position?: number | null; ladder: { rule?: Rule } | null }[]): TimesRung[] {
  return rows
    .filter((s) => s.key && s.ladder?.rule)
    .map((s) => ({ id: s.id, key: s.key!, name: s.name, rule: s.ladder!.rule!, position: s.position ?? 0 }))
    .filter(isTimesRung)
    .sort((a, b) => a.position - b.position)
    .map(({ id, key, name, rule }) => ({ id, key, name, rule }));
}

// The family's setting as the children's places hold it: each rung's place when every child has the same, and the
// rungs where they differ (test's invented children were placed one by one; saving makes them the same).
export function settingOf(rungs: TimesRung[], children: Map<string, Place>[]): { setting: Setting; differ: string[] } {
  const setting: Setting = new Map();
  const differ: string[] = [];
  for (const r of rungs) {
    const places = [...new Set(children.map((c) => c.get(r.key) ?? null))];
    if (places.length > 1) differ.push(r.key);
    setting.set(r.key, places[0] ?? null);
  }
  return { setting, differ };
}

const placed = (setting: Setting) => new Map([...setting].filter((e): e is [string, Place] => e[1] !== null));

// What a setting gives the boat: its numbers, or the reason it is refused, in the parents' words.
export function checkSetting(rungs: TimesRung[], setting: Setting): { nb: Numbers } | { error: string } {
  const nb = boatNumbers({ rungs: rungs.map((r) => ({ ...r, asks: "", example: "" })) }, placed(setting));
  if (!nb) return { error: "With no times table working on or done, the boat has no prices. Set one to working on or done." };
  const problem = numbersProblem(nb);
  const works = "The settings that work: 2s, 5s and 10s alone, working on or done; or 3s and 4s working on, with 2s, 5s and 10s done.";
  if (problem === "loses") return { error: `With these tables a crate could sell for less than it cost, and the boat promises that no choice loses money. ${works}` };
  if (problem === "flat") return { error: `With these tables a rumor pays no more than any dock, so there is nothing to sail for. ${works}` };
  return { nb };
}

const dollars = (xs: number[]) => xs.map((x) => `$${x}`).reduce((t, x, i, all) => (i === 0 ? x : `${t}${i === all.length - 1 ? (all.length > 2 ? ", and " : " and ") : ", "}${x}`), "");
const either = (xs: number[]) => xs.map((x) => `$${x}`).reduce((t, x, i, all) => (i === 0 ? x : `${t}${i === all.length - 1 ? " or " : ", "}${x}`), "");

// The prices a setting gives, as the page says them: "Buying prices $3 and $4. Every dock pays $4 a crate for anything.
// A rumor pays $5 or $10 a crate." A rumor pays one of his numbers above the usual (core/boat/day.ts).
export function pricesLine(nb: Numbers): string {
  return `Buying prices ${dollars(nb.buy)}. Every dock pays $${nb.usual} a crate for anything. A rumor pays ${either(nb.all.filter((x) => x > nb.usual))} a crate.`;
}

// A place from the form: "working", "done", or anything else is not yet.
export const placeOf = (v: unknown): Place | null => (v === "working" || v === "done" ? v : null);
