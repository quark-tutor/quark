import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { dayOf, priceAt, type Numbers } from "@/core/boat/day";
import { checkSetting, placeOf, pricesLine, settingOf, timesRungs, type Setting } from "./boat-setting";
import { boatNumbers, ladderRows, parseLadder, type Place } from "./ladder";

// The family's one setting of the times tables (docs/trading-boat-2-slice.md; stop 1's finding): both boys get the same
// prices, each keeps his own markets and rumors, and no setting the page saves lets a crate lose money.

const ladder = parseLadder(readFileSync(join(__dirname, "..", "plan", "math-ladder.yaml"), "utf8"));
const rungs = timesRungs(ladderRows(ladder).map((r, i) => ({ id: `skill-${i}`, key: r.key, name: r.name, position: r.kind === "rung" ? r.position : 100 + r.position, ladder: r.ladder as { rule?: never } })));
const S = (a: Place | null, b: Place | null, c: Place | null): Setting => new Map([["times-2-5-10", a], ["times-3-4", b], ["times-6-9", c]]);
const A = S("working", null, null);
const B = S("done", "working", null);
const numbersOf = (s: Setting) => {
  const r = checkSetting(rungs, s);
  if (!("nb" in r)) throw new Error(r.error);
  return r.nb;
};
const SEEDS = Array.from({ length: 40 }, (_, i) => `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`);
const ISLANDS = ["home", "kauai", "oahu", "molokai", "lanai", "maui", "hawaii"] as const;

describe("the family's times tables for the boat", () => {
  it("offers the three times-table rungs, in ladder order, and not multiplying bigger numbers", () => {
    expect(rungs.map((r) => r.key)).toEqual(["times-2-5-10", "times-3-4", "times-6-9"]);
  });

  it("gives settings A and B the prices stop 1 named, in the parents' words", () => {
    expect(pricesLine(numbersOf(A))).toBe("Buying prices $2 and $5. Every dock pays $5 a crate for anything. A rumor pays $10 a crate.");
    expect(pricesLine(numbersOf(B))).toBe("Buying prices $3 and $4. Every dock pays $4 a crate for anything. A rumor pays $5 or $10 a crate.");
  });

  it("refuses a setting that would let a crate lose money, or has nothing to sail for, or no prices at all", () => {
    for (const s of [S("done", "done", null), S("working", "working", null), S(null, null, "working"), S("done", "done", "working")]) {
      expect(checkSetting(rungs, s)).toEqual({ error: expect.stringMatching(/^With these tables a crate could sell for less than it cost/) });
    }
    expect(checkSetting(rungs, S(null, "working", null))).toEqual({ error: expect.stringMatching(/^With these tables a rumor pays no more than any dock/) });
    expect(checkSetting(rungs, S(null, null, null))).toEqual({ error: expect.stringMatching(/no prices/) });
  });

  it("never saves one of the 27 settings under which a crate could sell for less than it cost", () => {
    const places = [null, "working", "done"] as const;
    let saved = 0;
    for (const a of places)
      for (const b of places)
        for (const c of places) {
          const r = checkSetting(rungs, S(a, b, c));
          if (!("nb" in r)) continue;
          saved += 1;
          const nb: Numbers = r.nb;
          for (const seed of SEEDS.slice(0, 10))
            for (let n = 1; n <= 10; n++)
              for (const island of ISLANDS) {
                const day = dayOf(seed, nb, n, island);
                for (const o of day.markets.flat()) {
                  expect(priceAt(nb, o.good, null)).toBeGreaterThanOrEqual(o.price);
                  for (const rumor of day.rumors) expect(priceAt(nb, o.good, rumor)).toBeGreaterThanOrEqual(o.price);
                }
                for (const rumor of day.rumors) expect(rumor.price).toBeGreaterThan(nb.usual);
              }
        }
    expect(saved).toBe(6);
  });

  it("gives two children with the same places the same prices, and each his own markets and rumors", () => {
    const places = (s: Setting) => new Map([...s].filter((e): e is [string, Place] => e[1] !== null));
    for (const s of [A, B]) {
      const kids = [boatNumbers({ rungs: rungs.map((r) => ({ ...r, asks: "", example: "" })) }, places(s)), boatNumbers({ rungs: rungs.map((r) => ({ ...r, asks: "", example: "" })) }, places(s))];
      expect(kids[0]).toEqual(kids[1]);
      const nb = kids[0]!;
      const [one, two] = [dayOf(SEEDS[0], nb, 3, "home"), dayOf(SEEDS[1], nb, 3, "home")];
      for (const d of [one, two]) for (const o of d.markets.flat()) expect(nb.buy).toContain(o.price);
      expect(one.markets.map((m) => m.map((o) => o.good))).not.toEqual(two.markets.map((m) => m.map((o) => o.good)));
    }
  });

  it("changes only the prices of a day in play when the tables change: the goods, crates, order and rumors stay", () => {
    const [a, b] = [numbersOf(A), numbersOf(B)];
    for (const seed of SEEDS)
      for (let n = 1; n <= 8; n++)
        for (const island of ISLANDS) {
          const [x, y] = [dayOf(seed, a, n, island), dayOf(seed, b, n, island)];
          const shape = (d: typeof x) => ({ markets: d.markets.map((m) => m.map(({ good, stock }) => ({ good, stock }))), rumors: d.rumors.map(({ good, island }) => ({ good, island })) });
          expect(shape(x)).toEqual(shape(y));
        }
  });

  it("reads the family's setting from the children's places, and says where they differ", () => {
    const same = new Map<string, Place>([["times-2-5-10", "done"], ["times-3-4", "working"]]);
    expect(settingOf(rungs, [same, same])).toEqual({ setting: B, differ: [] });
    const other = new Map<string, Place>([["times-2-5-10", "working"]]);
    expect(settingOf(rungs, [other, same]).differ).toEqual(["times-2-5-10", "times-3-4"]);
    expect(settingOf(rungs, []).setting).toEqual(S(null, null, null));
  });

  it("takes only working or done from the form; anything else is not yet", () => {
    expect([placeOf("working"), placeOf("done"), placeOf(""), placeOf(null), placeOf("mastered")]).toEqual(["working", "done", null, null, null]);
  });
});
