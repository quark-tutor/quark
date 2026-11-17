import { describe, expect, it } from "vitest";
import { BOAT, SAY } from "../wall/words";
import { dayOf, numbersFor, takeOf } from "./day";
import { act, doneToday, newGame, roll, view, type Action, type Ctx, type Game } from "./game";

// The trading boat, move by move (docs/trading-boat-slice.md, stop 2's checks). Test's two children's numbers.
const KIDDO = numbersFor([2, 5, 10], [2, 5, 10], 10)!;
const BUG = numbersFor([2, 5, 10, 3, 4], [3, 4], 10)!;
const ctx = (date = "2026-11-16", nb = KIDDO, seed = "child-1"): Ctx => ({ seed, nb, date });

function go(g: Game, a: Action, c: Ctx = ctx()): Game {
  const r = act(g, a, c);
  if (!r) throw new Error(`refused: ${JSON.stringify(a)}`);
  return r.game;
}
const n = (value: number, text = String(value)): Action => ({ type: "answer", read: { value }, text });

// Day 1 at the harbor market, with the offer that has the most crates.
function atHarbor(c = ctx()): { g: Game; offer: number } {
  let g = roll(newGame(), c);
  g = go(g, { type: "next" }, c);
  const stock = g.today!.stock[0];
  return { g, offer: stock.indexOf(Math.max(...stock)) };
}

describe("his numbers", () => {
  it("come from the ladder: his prices, what he buys at, the usual price and the most in one sum", () => {
    expect(KIDDO).toEqual({ all: [2, 5, 10], buy: [2, 5], usual: 5, cap: 10 });
    expect(BUG).toEqual({ all: [2, 3, 4, 5, 10], buy: [3, 4], usual: 4, cap: 10 });
  });

  it("make a different market for each child, from the same game (check 10)", () => {
    const prices = (nb: typeof KIDDO) => new Set(dayOf("child", nb, 3, "maui").markets.flat().map((o) => o.price));
    expect([...prices(KIDDO)].every((p) => [2, 5].includes(p))).toBe(true);
    expect([...prices(BUG)].every((p) => [3, 4].includes(p))).toBe(true);
  });

  it("are the same every time a day is asked for", () => {
    expect(dayOf("child", KIDDO, 4, "oahu")).toEqual(dayOf("child", KIDDO, 4, "oahu"));
    const d = dayOf("child", KIDDO, 4, "oahu");
    expect(d.markets.every((m) => m.length === 4)).toBe(true);
    for (const r of d.rumors) {
      expect(r.island).not.toBe("oahu");
      const both = d.markets.map((m) => m.find((o) => o.good === r.good)!.price);
      expect(both[0]).not.toBe(both[1]);
      expect(r.price).toBeGreaterThanOrEqual(Math.max(KIDDO.usual + 1, Math.min(...both) + 2));
    }
    for (const o of d.markets.flat()) expect(o.stock).toBeGreaterThanOrEqual(2);
    for (const o of d.markets.flat()) expect(o.stock).toBeLessThanOrEqual(10);
    expect(takeOf(KIDDO)).toBe(10); // a buyer takes up to the most in one sum
  });
});

describe("the first day", () => {
  it("starts at home with $20 and an empty canoe", () => {
    const g = roll(newGame(), ctx());
    expect(g.money).toBe(20);
    expect(view(g, ctx()).lines).toEqual([...BOAT.firstDay]);
  });

  it("shows a market's goods and prices, his money, his boat's room and one rumor, and tells him nothing to buy (check 1)", () => {
    const { g } = atHarbor();
    const s = view(g, ctx());
    expect(s.title).toBe("The harbor market at home");
    expect(s.status).toEqual(["Your money: $20", "Your canoe: 0 of 10 crates full", "On board: nothing yet"]);
    expect(s.lines[0]).toBe(BOAT.usual(5));
    expect(s.lines[1]).toMatch(/^A trader says: /);
    expect(s.offers).toHaveLength(4);
    expect(s.stepper).toBeNull();
  });

  // The trade opens in its good's row, and the market stays on screen (Brandon at stop 2, 16 Nov 2026, of the calculator
  // trading game: "this was being run on a calculator and everyone understood it"; replaces "nothing else on the page").
  it("draws exactly the crates in the sum, with the sum beside the question, in the good's row with the market still there (check 2)", () => {
    const start = atHarbor();
    let g = start.g;
    const offer = start.offer;
    g = go(g, { type: "pick", market: 0, offer });
    expect(view(g, ctx()).open).toEqual({ market: 0, offer });
    expect(view(g, ctx()).offers!.every((o) => o.open || g.today!.stock[0][o.offer] === 0)).toBe(true); // another good can still be chosen
    g = go(g, { type: "count", n: 2 });
    const s = view(g, ctx());
    const o = dayOf("child-1", KIDDO, 1, "home").markets[0][offer];
    expect(s.trade).toMatchObject({ pic: { count: 2, price: o.price, lit: 0, unit: "crate" }, question: BOAT.owe, sum: `2 × $${o.price} = ?`, reply: null, step: null });
    expect(s.open).toEqual({ market: 0, offer });
    expect(s.status).toEqual(["Your money: $20", "Your canoe: 0 of 10 crates full", "On board: nothing yet"]);
    expect(s.offers).toHaveLength(4);
    expect(s.offers!.every((x) => !x.open)).toBe(true); // the others wait while a trade is open
    expect(s.picture).toBeNull();
    expect(s.speak.startsWith(BOAT.offer(o.good, o.price))).toBe(true);
  });

  it("takes the money and puts the crates aboard on a right total, and he can buy again (check 3)", () => {
    const start = atHarbor();
    let g = start.g;
    const offer = start.offer;
    const o = dayOf("child-1", KIDDO, 1, "home").markets[0][offer];
    g = go(g, { type: "pick", market: 0, offer });
    g = go(g, { type: "count", n: 2 });
    g = go(g, n(2 * o.price));
    expect(g.money).toBe(20 - 2 * o.price);
    expect(g.cargo).toEqual([{ good: o.good, count: 2, paid: 2 * o.price }]);
    expect(view(g, ctx()).note).toBe(BOAT.bought(2, o.good));
    expect(view(g, ctx()).offers).not.toBeNull();
  });
});

describe("a wrong total (check 4)", () => {
  const trade = (count: number) => {
    const start = atHarbor();
    let g = start.g;
    const offer = start.offer;
    const o = dayOf("child-1", KIDDO, 1, "home").markets[0][offer];
    g = go(g, { type: "pick", market: 0, offer });
    g = go(g, { type: "count", n: count });
    return { g, p: o.price };
  };

  it("says when he added the two numbers, and the crates light up to count two at a time", () => {
    const t = trade(3);
    let g = t.g;
    const p = t.p;
    g = go(g, n(3 + p));
    const s = view(g, ctx()).trade!;
    expect(s.reply).toBe(BOAT.added(3, p));
    expect(s.step).toEqual({ ask: "2 crates: how much so far?", sum: `$${p} + $${p} = ?`, k: 2 });
    g = go(g, n(2 * p));
    expect(view(g, ctx()).trade!.pic!.lit).toBe(2);
    expect(view(g, ctx()).trade!.step).toEqual({ ask: "3 crates: how much so far?", sum: `$${2 * p} + $${p} = ?`, k: 3 });
    g = go(g, n(3 * p));
    expect(g.cargo[0].count).toBe(3);
  });

  it("asks one question at a time during the count: Read it to me says the trade's sum as a reminder and the step as the question", () => {
    const t = trade(3);
    const s = view(go(t.g, n(99)), ctx());
    expect(s.speak).toContain(`3 times $${t.p}.`);
    expect(s.speak).not.toContain("How much do you owe the trader?");
    expect(s.speak.match(/equals what\?/g)).toHaveLength(1);
  });

  it("says he is close when he is one crate out, and counts at once for anything else", () => {
    const one = trade(3);
    expect(view(go(one.g, n(4 * one.p)), ctx()).trade!.reply).toBe(BOAT.oneOut("crate"));
    const other = trade(3);
    expect(view(go(other.g, n(99)), ctx()).trade!.reply).toBe(BOAT.letsCount);
  });

  it("never asks how he got it, never shows the answer, and costs no money", () => {
    const t = trade(4);
    let g = t.g;
    const p = t.p;
    g = go(g, n(7));
    // The trade's own words: the market beside it shows his money, which may happen to equal a total.
    const text = JSON.stringify(view(g, ctx()).trade);
    expect(JSON.stringify(view(g, ctx()))).not.toMatch(/How did you get that/);
    expect(text).not.toContain(`$${4 * p}`);
    expect(g.money).toBe(20);
  });

  it("goes one crate at a time after a missed step, then offers fewer; nothing is lost", () => {
    const t = trade(4);
    let g = t.g;
    const p = t.p;
    g = go(g, n(1));
    g = go(g, n(1)); // the first pair missed
    expect(view(g, ctx()).trade!.step).toEqual({ ask: "1 crate: how much so far?", sum: `1 × $${p} = ?`, k: 1 });
    g = go(g, n(1));
    expect(view(g, ctx()).trade!.ended).toEqual([BOAT.tryFewer]);
    expect(view(g, ctx()).buttons.map((b) => b.label)).toEqual([BOAT.tryFewerButton]);
    g = go(g, { type: "fewer" });
    expect(g.today!.hand).toBeNull();
    expect(g.money).toBe(20);
  });

  // Brandon at stop 2: "I'm currently stuck adding 2 at a time ... I started at 2 and am up to 12, so 6 steps."
  it("goes back to two at a time after a right one-crate step, and takes the whole total at any step", () => {
    const t = trade(4);
    let g = t.g;
    const p = t.p;
    g = go(g, n(1)); // the trade's sum missed: the count
    g = go(g, n(1)); // the first pair missed: one at a time
    g = go(g, n(p)); // 1 crate right
    expect(view(g, ctx()).trade!.step).toEqual({ ask: "3 crates: how much so far?", sum: `$${p} + $${p} + $${p} = ?`, k: 3 });
    g = go(g, n(4 * p)); // the whole total, a step early
    expect(g.today!.hand).toBeNull();
    expect(g.cargo[0].count).toBe(4);
  });

  it("answers I don't know with a guess first, and a questioned sum with thanks, then the count", () => {
    let { g } = trade(3);
    g = go(g, { type: "answer", read: { none: "dont_know" }, text: "I don't know" });
    expect(view(g, ctx()).trade!.reply).toBe(SAY.guessFirst);
    expect(view(g, ctx()).trade!.step).toBeNull();
    g = go(g, { type: "answer", read: { none: "questioned" }, text: "you didn't say the price" });
    expect(view(g, ctx()).trade!.reply).toBe(SAY.goodCatch);
    expect(view(g, ctx()).trade!.step).not.toBeNull();
  });

  it("sends a one-crate sum to a grown-up, since there is nothing fewer", () => {
    let { g } = trade(1);
    g = go(g, n(99));
    expect(view(g, ctx()).trade!.ended).toEqual([SAY.forAPerson, BOAT.askGrownUp]);
  });
});

describe("money and room", () => {
  it("agrees with a right total he cannot pay and says he is short (check 5)", () => {
    const start = atHarbor();
    let g = start.g;
    const offer = start.offer;
    const o = dayOf("child-1", KIDDO, 1, "home").markets[0][offer];
    g = { ...g, money: 3 };
    g = go(g, { type: "pick", market: 0, offer });
    g = go(g, { type: "count", n: 2 });
    g = go(g, n(2 * o.price));
    expect(view(g, ctx()).note).toBe(BOAT.short(2 * o.price, 3));
    expect(g.money).toBe(3);
    expect(g.cargo).toEqual([]);
  });

  it("will not let the number pass the room left, the trader's crates or 10 (check 6)", () => {
    const start = atHarbor();
    let g = start.g;
    const offer = start.offer;
    const stock = g.today!.stock[0][offer];
    g = { ...g, cargo: [{ good: "taro", count: 8, paid: 16 }] };
    g = go(g, { type: "pick", market: 0, offer });
    expect(view(g, ctx()).stepper!.max).toBe(Math.min(2, stock));
    expect(act(g, { type: "count", n: 3 }, ctx())).toBeNull();
    let big = atHarbor().g;
    big = { ...big, space: 100, money: 5000 };
    for (let i = 0; i < 4; i++) {
      big = go(big, { type: "pick", market: 0, offer: i });
      expect(view(big, ctx()).stepper!.max).toBeLessThanOrEqual(10);
      big = go(big, { type: "unpick" });
    }
  });
});

describe("casting off, landing, and the days between (checks 7 to 9)", () => {
  function sailDay1() {
    const start = atHarbor();
    let g = start.g;
    const offer = start.offer;
    const day = dayOf("child-1", KIDDO, 1, "home");
    // Buy the first rumor's good where the harbor sells it, as much as he can.
    const r = day.rumors[0];
    const at = day.markets[0].findIndex((o) => o.good === r.good);
    const o = day.markets[0][at];
    const count = Math.min(o.stock, Math.floor(20 / o.price));
    g = go(g, { type: "pick", market: 0, offer: at });
    g = go(g, { type: "count", n: count });
    g = go(g, n(count * o.price));
    void offer;
    g = go(g, { type: "next" });
    g = go(g, { type: "next" });
    const cast = view(g, ctx());
    expect(cast.title).toBe(BOAT.whereSail);
    expect(cast.buttons.map((b) => b.label)).toEqual(day.rumors.map((x) => BOAT.sailChoice(x.good, x.island, x.price)));
    g = go(g, { type: "sail", rumor: 0 });
    return { g, r, count, paid: count * o.price };
  }

  it("ends the day at the cast-off: the tile is done, and nothing more can be played today (check 7)", () => {
    const { g, r } = sailDay1();
    expect(view(g, ctx()).done).toBe(true);
    expect(view(g, ctx()).note).toBe(BOAT.castOffFor(r.island));
    expect(doneToday(g, ctx())).toBe(true);
    expect(act(g, { type: "next" }, ctx())).toBeNull();
    expect(roll(g, ctx())).toBe(g);
  });

  // Brandon at stop 2: "It only let me sell 3 for some reason."; "5 pineapples is not a lot of pineapples."
  it("lets one buyer take a whole load up to 10, and brings another buyer only for more than 10, saying why", () => {
    const c = ctx("2026-11-17");
    const r = { good: "pineapples" as const, island: "kauai" as const, price: 10 };
    const landed = (count: number, space: number): Game =>
      roll({ money: 0, space, cargo: [{ good: "pineapples", count, paid: 4 * count }], island: "home", sailing: r, today: { ...roll(newGame(), ctx()).today!, stop: "done" } }, c);
    // Five crates: one buyer takes all five, and nothing says there is a limit.
    const five = view(landed(5, 10), c);
    expect(five.lines).toContain(BOAT.buyer("pineapples", 10));
    expect(five.stepper).toEqual({ ask: BOAT.howManySell, max: 5, maxLine: null });
    // Twelve crates on the double canoe: the first buyer takes 10 at most and says so; another buyer takes the rest.
    let g = landed(12, 20);
    expect(view(g, c).stepper).toEqual({ ask: BOAT.howManySell, max: 10, maxLine: BOAT.buyerLimit(10) });
    g = go(g, { type: "count", n: 10 }, c);
    g = go(g, n(100), c);
    expect(view(g, c).lines).toContain(BOAT.buyerNext("pineapples", 10));
    expect(view(g, c).stepper).toEqual({ ask: BOAT.howManySell, max: 2, maxLine: null });
  });

  it("lands tomorrow where the rumor pointed, at the price it promised, with its reason; he says what he is owed (check 8)", () => {
    const { g: g0, r, count } = sailDay1();
    let g = roll(g0, ctx("2026-11-17"));
    const s = view(g, ctx("2026-11-17"));
    expect(g.island).toBe(r.island);
    expect(s.title).toBe(BOAT.land(r.island));
    expect(s.lines[0]).toBe(BOAT.landReason(r.good, r.island, r.price));
    expect(s.lines[1]).toBe(BOAT.buyer(r.good, r.price));
    const k = Math.min(takeOf(KIDDO), count);
    expect(s.stepper!.max).toBe(k);
    g = go(g, { type: "count", n: k }, ctx("2026-11-17"));
    expect(view(g, ctx("2026-11-17")).trade).toMatchObject({ question: BOAT.owed, sum: `${k} × $${r.price} = ?` });
  });

  it("keeps the boat where he left it over days he skips, and nothing is lost (check 9)", () => {
    const { g } = sailDay1();
    const tomorrow = roll(g, ctx("2026-11-17"));
    const later = roll(g, ctx("2026-11-21"));
    expect({ ...later, today: { ...later.today!, on: "x" } }).toEqual({ ...tomorrow, today: { ...tomorrow.today!, on: "x" } });
    expect(later.money).toBe(g.money);
    expect(later.cargo).toEqual(g.cargo);
  });

  it("asks one look back after he sells all of a good, and sends a second miss to a grown-up", () => {
    const { g: g0, r, count, paid } = sailDay1();
    let g = roll(g0, ctx("2026-11-17"));
    const c = ctx("2026-11-17");
    while (g.today!.dock.some((d) => d.sold < d.had)) {
      const max = view(g, c).stepper!.max;
      g = go(g, { type: "count", n: max }, c);
      g = go(g, n(max * r.price), c);
    }
    const sold = count * r.price;
    const s = view(g, c).trade!;
    expect(s.question).toBe(BOAT.backMade(paid, r.good, sold));
    expect(s.sum).toBe(`$${sold} − $${paid} = ?`);
    g = go(g, n(1), c);
    expect(view(g, c).trade!.reply).toBe(BOAT.countUp(paid, sold));
    g = go(g, n(1), c);
    expect(view(g, c).note).toBe(`${SAY.forAPerson} ${BOAT.askGrownUp}`);
    expect(view(g, c).buttons.map((b) => b.label)).toEqual([BOAT.toHarbor]);
  });
});

describe("the boats (check 11)", () => {
  function landed(money: number, space = 10): { g: Game; c: Ctx } {
    const c = ctx("2026-11-17");
    let g = roll(newGame(), ctx());
    g = go(g, { type: "next" });
    g = go(g, { type: "next" });
    g = go(g, { type: "next" });
    g = go(g, { type: "sail", rumor: 0 });
    g = roll({ ...g, money, space }, c);
    return { g, c };
  }

  it("offers the bigger boat once he can pay and keep $20, and buying it asks for its sum", () => {
    expect(view(landed(419).g, ctx("2026-11-17")).buttons.map((b) => b.label)).toEqual([BOAT.toHarbor]);
    const l = landed(420);
    let g = l.g;
    const c = l.c;
    expect(view(g, c).lines).toContain(BOAT.builder("double", 20, 4));
    g = go(g, { type: "builder", buy: true }, c);
    expect(view(g, c).trade).toMatchObject({ question: BOAT.oweBuilder, sum: "4 × $100 = ?", pic: { count: 4, price: 100, unit: "bill" } });
    g = go(g, n(400), c);
    expect(g.space).toBe(20);
    expect(g.money).toBe(20);
    expect(view(g, c).note).toBe(BOAT.boatYours("double", 20));
  });

  it("counts more than 10 bills in bundles of up to 10, each its own sum", () => {
    const l = landed(1600, 20);
    let g = l.g;
    const c = l.c;
    g = go(g, { type: "builder", buy: true }, c);
    expect(view(g, c).trade).toMatchObject({ question: BOAT.bundle, sum: "10 × $100 = ?" });
    g = go(g, n(1000), c);
    expect(view(g, c).trade).toMatchObject({ sum: "5 × $100 = ?" });
    g = go(g, n(500), c);
    expect(g.space).toBe(50);
    expect(g.money).toBe(100);
  });
});
