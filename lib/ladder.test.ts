import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { largestCount, ladderRows, parseLadder, tablesOf, validateLadder, workingTablesOf, type Ladder, type Place } from "./ladder";

const ladder = parseLadder(readFileSync(join(__dirname, "..", "plan", "math-ladder.yaml"), "utf8"));

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

describe("what the trading boat reads from a boy's places", () => {
  const older = new Map<string, Place>([["add-20", "done"], ["add-100", "done"], ["place-value", "done"], ["add-1000", "working"], ["groups-of", "working"], ["times-2-5-10", "working"]]);
  const younger = new Map<string, Place>([["add-20", "done"], ["add-100", "done"], ["place-value", "done"], ["groups-of", "done"], ["times-2-5-10", "done"], ["times-3-4", "working"]]);

  it("gives his prices from every times table he is placed on, and his practice from the ones he is working on", () => {
    expect(tablesOf(ladder, older)).toEqual([2, 5, 10]);
    expect(tablesOf(ladder, younger)).toEqual([2, 5, 10, 3, 4]);
    expect(workingTablesOf(ladder, older)).toEqual([2, 5, 10]);
    expect(workingTablesOf(ladder, younger)).toEqual([3, 4]);
  });

  it("holds a sum to 10 crates until he is placed on bigger multiplying", () => {
    expect(largestCount(ladder, older)).toBe(10);
    expect(largestCount(ladder, younger)).toBe(10);
    expect(largestCount(ladder, new Map<string, Place>([...younger, ["bigger-times", "working"]]))).toBe(100);
  });
});
