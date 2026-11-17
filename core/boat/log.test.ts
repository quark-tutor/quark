import { describe, expect, it } from "vitest";
import { dayOf, numbersFor } from "./day";
import { act, landTurn, newGame, roll, type Action, type Ctx, type Game, type Turn } from "./game";
import { dayLogs, type TurnRow } from "./log";

const nb = numbersFor([2, 5, 10], [2, 5, 10], 10)!;
const ctx = (date: string): Ctx => ({ seed: "child-1", nb, date });
const asRow = (t: Turn): TurnRow => ({ ...t, played_on: t.on });

describe("the parents' log (stop 2's last check)", () => {
  it("shows each day's trades: every sum, what he said, the help he needed and each answer's kind", () => {
    const turns: Turn[] = [];
    let g: Game = roll(newGame(), ctx("2026-11-16"));
    const go = (a: Action, date = "2026-11-16") => {
      const r = act(g, a, ctx(date));
      if (!r) throw new Error(JSON.stringify(a));
      g = r.game;
      turns.push(...r.turns);
    };
    const day = dayOf("child-1", nb, 1, "home");
    const at = day.markets[0].findIndex((o) => o.stock >= 3);
    const o = day.markets[0][at];
    go({ type: "next" });
    go({ type: "pick", market: 0, offer: at });
    go({ type: "count", n: 3 });
    go({ type: "answer", read: { value: 3 + o.price }, text: String(3 + o.price) });
    go({ type: "answer", read: { value: 2 * o.price }, text: String(2 * o.price) });
    go({ type: "answer", read: { value: 3 * o.price }, text: `${3 * o.price} dollars` });
    go({ type: "next" });
    go({ type: "next" });
    go({ type: "sail", rumor: 1 });
    g = roll(g, ctx("2026-11-17"));
    turns.push(landTurn(g));

    const logs = dayLogs(turns.map(asRow));
    expect(logs).toHaveLength(2);
    expect(logs[1].head).toBe(`Day 1 · home · 2026-11-16 · started with $20 · ended with $${20 - 3 * o.price}`);
    expect(logs[1].lines[0]).toBe(
      `Bought 3 crates of ${o.good.replace("-", " ")} at $${o.price}: 3 × $${o.price} = ${3 * o.price}. Said ${3 + o.price} (the two numbers added). Count, 2: ${2 * o.price} ✓. Right on the count's 2nd step.`,
    );
    expect(logs[1].lines[1]).toMatch(/^Sailed to .+, on the .+ rumor \(\$\d+\)\.$/);
    expect(logs[0].head).toMatch(/^Day 2 · .+ · 2026-11-17 · started with \$\d+ · still on the way$/);
  });

  it("says one crate as one crate (the 16 Nov 2026 bug line: \"Sold 1 sweet potatoes at $4\")", () => {
    const row = (o: Partial<TurnRow>): TurnRow => ({ day: 2, played_on: "2026-11-17", trade: 1, kind: "sell", island: "maui", good: "sweet-potatoes", count: 1, price: 4, step: null, expected: 4, answer: "4", verdict: "right", short: false, money: 24, ...o });
    const [day] = dayLogs([row({ kind: "land", trade: null, good: null, count: null, price: null, expected: null, answer: null, verdict: null, money: 20 }), row({})]);
    expect(day.lines[0]).toBe("Sold 1 crate of sweet potatoes at $4: 1 × $4 = 4. Right at once.");
    const [many] = dayLogs([row({ count: 6, expected: 24, answer: "24" })]);
    expect(many.lines[0]).toBe("Sold 6 crates of sweet potatoes at $4: 6 × $4 = 24. Right at once.");
  });
});
