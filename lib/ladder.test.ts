import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ladderRows, onRule, parseLadder, rungsFor, rungsOf, tablesOf, validateLadder, type Ladder, type Place } from "./ladder";

const ladder = parseLadder(readFileSync(join(__dirname, "..", "plan", "math-ladder.yaml"), "utf8"));
const op = (o: "+" | "-" | "x" | "/" | "%", operands: number[], result: number) => ({ op: o, operands, result });

describe("plan/math-ladder.yaml", () => {
  it("is valid, with the parents' fourteen rungs in order and six everyday areas", () => {
    expect(validateLadder(ladder)).toEqual([]);
    expect(ladder.rungs.map((r) => r.key)).toEqual([
      "add-20", "add-100", "place-value", "add-1000", "subtract-1000", "groups-of", "times-2-5-10", "times-3-4", "times-6-9",
      "sharing", "division", "leftovers", "two-step", "bigger-times",
    ]);
    expect(ladder.everyday.map((a) => a.key)).toEqual(["time", "money", "measuring", "bar-graph", "fractions", "shapes"]);
  });

  it("becomes one skills row each, keyed, the rungs then the everyday areas", () => {
    const rows = ladderRows(ladder);
    expect(rows).toHaveLength(20);
    expect(rows[7]).toMatchObject({ key: "times-3-4", kind: "rung", position: 8, ladder: { rule: { op: "x", by: [3, 4], each: 12 } } });
    expect(rows[9].ladder).toMatchObject({ alongside: ["times-2-5-10", "times-3-4", "times-6-9"] });
    expect(rows[18]).toMatchObject({ key: "fractions", kind: "everyday", position: 5, ladder: { needs: "sharing" } });
  });

  it("names a repeated key, a missing rule and an unknown alongside", () => {
    const bad = structuredClone(ladder) as Ladder;
    bad.rungs[1].key = "add-20";
    delete (bad.rungs[2] as { rule?: unknown }).rule;
    bad.rungs[9].alongside = ["times-11"];
    expect(validateLadder(bad)).toEqual(["rung add-20: key used twice", "rung place-value: missing rule", 'rung sharing: alongside names no rung "times-11"']);
  });
});

describe("which rungs a sum is on", () => {
  it("reads adding, times tables and groups the way the parents' table means them", () => {
    expect(rungsOf(op("+", [8, 7], 15), ladder)).toEqual(["add-20", "add-100", "add-1000"]);
    expect(rungsOf(op("+", [236, 148], 384), ladder)).toEqual(["add-1000"]);
    expect(rungsOf(op("-", [24, 15], 9), ladder)).toEqual(["add-100", "subtract-1000"]);
    expect(rungsOf(op("x", [7, 3], 21), ladder)).toEqual(["times-3-4", "times-6-9", "bigger-times"]);
    expect(rungsOf(op("x", [3, 4], 12), ladder)).toEqual(["groups-of", "times-3-4", "bigger-times"]);
    expect(rungsOf(op("x", [8, 100], 800), ladder)).toEqual(["place-value", "bigger-times"]);
    expect(rungsOf(op("x", [9, 2], 18), ladder)).toContain("times-2-5-10");
  });

  it("puts a share on the sharing rung only on the facts of a times table the boy has", () => {
    const share = ladder.rungs.find((r) => r.key === "sharing")!.rule;
    expect(onRule(op("/", [24, 3], 8), share, [3, 4])).toBe(true);
    expect(onRule(op("/", [24, 3], 8), share, [2, 5, 10])).toBe(false);
    expect(onRule(op("/", [20, 2], 10), share, [2, 5, 10])).toBe(true);
  });

  it("gives each boy his rungs, and sharing alongside the times table he is working on", () => {
    const older = new Map<string, Place>([["add-20", "done"], ["add-100", "done"], ["place-value", "done"], ["add-1000", "working"], ["groups-of", "working"], ["times-2-5-10", "working"]]);
    const younger = new Map<string, Place>([["add-20", "done"], ["add-100", "done"], ["place-value", "done"], ["groups-of", "done"], ["times-2-5-10", "done"], ["times-3-4", "working"]]);
    expect(rungsFor(ladder, older)).toEqual({ done: ["add-20", "add-100", "place-value"], working: ["add-1000", "groups-of", "times-2-5-10"], alongside: ["sharing"] });
    expect(rungsFor(ladder, younger).alongside).toEqual(["sharing"]);
    expect(tablesOf(ladder, older)).toEqual([2, 5, 10]);
    expect(tablesOf(ladder, younger)).toEqual([2, 5, 10, 3, 4]);
  });
});
