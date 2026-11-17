import type { BoatGood, BoatIsland } from "../wall/words.ts";
import { BOATS, BUNDLE, KEEP, START_MONEY, dayOf, hash, priceAt, takeOf, type Numbers, type Offer, type Rumor } from "./day.ts";

// Stop 1's simulation (docs/reports/2026-11-16-trading-boat.md, fix round 1), on the game's own day: markets, rumors,
// stock and buyers from dayOf() and takeOf(). Three players: careful (every crate worth more where he is going than it
// costs, the best margin first, at both markets, and the better of the two rumors), in between (follows the first
// rumor at the first market, fills up with anything at the second), and careless (anything at random, either rumor).
// Sums are taken as right: a wrong sum costs nothing in the game. Its test holds the boats' prices to the evidence. Pure.

export type Player = "careful" | "between" | "careless";
export type Sum = { kind: "buy" | "sell" | "boat" | "back"; a: number; b: number };
export type Run = { worth: number[]; reached: (number | null)[]; sums: Sum[][]; biggest: string[] };

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function play(nb: Numbers, player: Player, days: number, seed: string): Run {
  const choose = rng(hash(`choices:${seed}:${player}`));
  const pick = <T,>(xs: readonly T[]) => xs[Math.floor(choose() * xs.length)];
  let money = START_MONEY;
  let boat = 0;
  let cargo: { good: BoatGood; count: number; paid: number }[] = [];
  let island: BoatIsland | "home" = "home";
  let sailing: Rumor | null = null;
  const run: Run = { worth: [], reached: BOATS.slice(1).map(() => null), sums: [], biggest: [] };
  for (let n = 1; n <= days; n++) {
    const today: Sum[] = [];
    const day = dayOf(seed, nb, n, island);
    let back: { paid: number; sold: number } | null = null;
    for (const load of cargo) {
      const price = priceAt(nb, load.good, sailing);
      let left = load.count;
      for (let k = 0; left > 0; k++) {
        const take = Math.min(left, takeOf(nb));
        today.push({ kind: "sell", a: take, b: price });
        left -= take;
      }
      const sold = load.count * price;
      money += sold;
      if (sold <= 100 && load.paid <= 100 && sold !== load.paid && (!back || sold > back.sold)) back = { paid: load.paid, sold };
    }
    if (back) today.push({ kind: "back", a: Math.max(back.sold, back.paid), b: Math.min(back.sold, back.paid) });
    cargo = [];
    const next = BOATS[boat + 1];
    if (next && money >= next.bills * 100 + KEEP) {
      money -= next.bills * 100;
      boat += 1;
      run.reached[boat - 1] = n;
      for (let left = next.bills; left > 0; left -= BUNDLE) today.push({ kind: "boat", a: Math.min(BUNDLE, left), b: 100 });
    }
    const space = () => BOATS[boat].space - cargo.reduce((t, l) => t + l.count, 0);
    const stock = day.markets.map((m) => m.map((o) => ({ ...o })));
    const buy = (o: Offer, count: number) => {
      if (count < 1) return;
      money -= count * o.price;
      o.stock -= count;
      const held = cargo.find((l) => l.good === o.good);
      if (held) {
        held.count += count;
        held.paid += count * o.price;
      } else cargo.push({ good: o.good, count, paid: count * o.price });
      today.push({ kind: "buy", a: count, b: o.price });
    };
    const most = (o: Offer) => Math.min(o.stock, space(), Math.floor(money / o.price), nb.cap);
    if (player === "careful") {
      const plan = (rumor: Rumor) => {
        const value = (g: BoatGood) => (g === rumor.good ? rumor.price : nb.usual);
        const offers = stock.flatMap((m, mi) => m.map((o) => ({ mi, o, margin: value(o.good) - o.price }))).filter((x) => x.margin > 0);
        offers.sort((x, y) => y.margin - x.margin || x.o.price - y.o.price);
        let s = space();
        let m = money;
        let gain = 0;
        const buys: { mi: number; o: Offer; count: number }[] = [];
        for (const x of offers) {
          const count = Math.min(x.o.stock, s, Math.floor(m / x.o.price), nb.cap);
          if (count < 1) continue;
          buys.push({ mi: x.mi, o: x.o, count });
          s -= count;
          m -= count * x.o.price;
          gain += count * x.margin;
        }
        buys.sort((x, y) => x.mi - y.mi);
        return { rumor, gain, buys };
      };
      const best = [plan(day.rumors[0]), plan(day.rumors[1])].sort((x, y) => y.gain - x.gain)[0];
      for (const x of best.buys) buy(x.o, x.count);
      sailing = best.rumor;
    } else if (player === "between") {
      const rumor = day.rumors[0];
      const o = stock[0].find((x) => x.good === rumor.good)!;
      buy(o, most(o));
      if (space() > 0) {
        const x = pick(stock[1]);
        buy(x, 1 + Math.floor(choose() * Math.max(0, most(x))));
      }
      sailing = rumor;
    } else {
      for (const mi of [0, 1]) {
        if (choose() < 0.3) continue;
        const x = pick(stock[mi]);
        if (most(x) < 1) continue;
        buy(x, 1 + Math.floor(choose() * most(x)));
      }
      sailing = pick(day.rumors);
    }
    island = sailing.island;
    const buys = today.filter((s) => s.kind === "buy").sort((x, y) => y.a * y.b - x.a * x.b);
    run.biggest.push(buys.length ? `${buys[0].a}×${buys[0].b}` : "-");
    run.sums.push(today);
    run.worth.push(money + cargo.reduce((t, l) => t + l.paid, 0));
  }
  return run;
}

export const median = (xs: number[]) => [...xs].sort((p, q) => p - q)[Math.floor(xs.length / 2)];
export const label = (s: Sum) => (s.kind === "back" ? `${s.a}−${s.b}` : `${s.a}×${s.b}`);
// The facts of the tables he is working on: 1 to 10 times each.
export const factsOf = (working: number[]) => working.flatMap((t) => Array.from({ length: 10 }, (_, i) => `${i + 1}×${t}`));
