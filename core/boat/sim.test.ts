import { describe, expect, it } from "vitest";
import { numbersFor } from "./day";
import { factsOf, label, median, play } from "./sim";

// Stop 1's evidence, held (docs/reports/2026-11-16-trading-boat.md, fix round 1; Brandon, 16 Nov 2026: "the size of a
// sum follows his place on the ladder, never his boat or his money"). Test's two children: Kiddo at the older boy's
// places (2s, 5s and 10s, working on all three), Bug at the younger's (2s, 5s and 10s done, working on 3s and 4s).
const KIDDO = { nb: numbersFor([2, 5, 10], [2, 5, 10], 10)!, working: [2, 5, 10] };
const BUG = { nb: numbersFor([2, 5, 10, 3, 4], [3, 4], 10)!, working: [3, 4] };
const RUNS = 200;

const runs = (c: typeof KIDDO, p: "careful" | "between" | "careless") => Array.from({ length: RUNS }, (_, i) => play(c.nb, p, 30, `seed${i}`));
const firstBoat = (rs: ReturnType<typeof runs>) => median(rs.map((r) => r.reached[0] ?? 99));
const week = (from: number) => (r: ReturnType<typeof play>) => r.sums.slice(from - 1, from + 6).flat();

describe("the trading boat's simulation", () => {
  const kiddo = runs(KIDDO, "careful");
  const bug = runs(BUG, "careful");

  it("gives a careful boy the double canoe in his second week, and the careless one only late or never", () => {
    expect(firstBoat(kiddo)).toBeGreaterThanOrEqual(6);
    expect(firstBoat(kiddo)).toBeLessThanOrEqual(9);
    expect(firstBoat(bug)).toBeGreaterThanOrEqual(7);
    expect(firstBoat(bug)).toBeLessThanOrEqual(11);
    expect(firstBoat(runs(KIDDO, "careless"))).toBeGreaterThan(25);
    expect(firstBoat(runs(BUG, "careless"))).toBeGreaterThan(25);
  });

  it("never puts more than 10 in one sum, at any boat and any money", () => {
    for (const r of [...kiddo, ...bug, ...runs(KIDDO, "careless")]) for (const s of r.sums.flat()) if (s.kind !== "back") expect(s.a).toBeLessThanOrEqual(10);
  });

  it("does not repeat the day's biggest purchase day after day", () => {
    for (const rs of [kiddo, bug]) {
      const repeats = rs.map((r) => r.biggest.filter((b, i, xs) => i > 0 && b !== "-" && b === xs[i - 1]).length);
      expect(median(repeats)).toBeLessThanOrEqual(5); // of 29 days
    }
  });

  it("meets most of the facts of the tables he is working on in a careful week, from the second week on", () => {
    for (const [c, rs] of [[KIDDO, kiddo], [BUG, bug]] as const) {
      const facts = factsOf(c.working);
      for (const from of [8, 15]) {
        const met = rs.map((r) => {
          const seen = new Set(week(from)(r).filter((s) => s.kind === "buy" || s.kind === "sell").map(label));
          return facts.filter((f) => seen.has(f)).length;
        });
        expect(median(met), `${c.working.join(",")} from day ${from}`).toBeGreaterThan(facts.length / 2);
      }
    }
  });

  it("never lets a choice lose money: a careless boy earns less, and keeps what he had", () => {
    for (const c of [KIDDO, BUG]) for (const r of runs(c, "careless")) expect(Math.min(...r.worth)).toBeGreaterThanOrEqual(20);
  });
});
