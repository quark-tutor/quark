import type { BoatGood, BoatIsland, BoatName } from "../wall/words.ts";

// The trading boat's world and its day (docs/trading-boat-slice.md; stop 1's fix round, 16 Nov 2026). Brandon: "the
// size of a sum follows his place on the ladder, never his boat or his money." So a trader has a few crates of each good
// and a buyer on the dock takes a few at a time, never more than his ladder allows in one sum; a bigger boat means more
// trades, not bigger numbers. Everything here is worked out from the child, the game's day number and the island he is
// on, and is the same every time it is asked: no model, no clock, no database. Pure.

export const GOODS: readonly BoatGood[] = ["mangoes", "coconuts", "bananas", "pineapples", "taro", "sweet-potatoes"];
export const ISLANDS: readonly BoatIsland[] = ["kauai", "oahu", "molokai", "lanai", "maui", "hawaii"];

// The boats: space in crates, and the price in hundred-dollar bills (chosen from stop 1's simulation: a careful boy has
// the double canoe on about day 7 or 9). A price above 10 bills is paid in bundles of up to 10, each a sum.
export type Boat = { key: BoatName; space: number; bills: number };
export const BOATS: readonly Boat[] = [
  { key: "canoe", space: 10, bills: 0 },
  { key: "double", space: 20, bills: 4 },
  { key: "schooner", space: 50, bills: 15 },
  { key: "ship", space: 100, bills: 40 },
];
export const START_MONEY = 20;
export const KEEP = 20; // a boat is offered only to a trader who keeps this much after paying for it
export const BUNDLE = 10; // bills counted in one sum
export const STOCK: readonly [number, number] = [2, 10]; // crates of a good at one trader, by day

export const boatOf = (space: number): Boat => BOATS.find((b) => b.space === space) ?? BOATS[0];
export const nextBoat = (space: number): Boat | null => BOATS[BOATS.indexOf(boatOf(space)) + 1] ?? null;

// --- His numbers, from the ladder ---

// all: every number of a times table he has done or is working on (tablesOf); buy: the prices he pays, the tables he is
// working on under his top number (all of them under the top when he works on none); usual: what any dock pays for a good
// no rumor names, the first of his numbers above his lowest buying price; cap: the most in one sum (largestCount).
export type Numbers = { all: number[]; buy: number[]; usual: number; cap: number };

export function numbersFor(tables: number[], working: number[], cap: number): Numbers | null {
  const all = [...new Set(tables)].filter((n) => Number.isInteger(n) && n > 0).sort((a, b) => a - b);
  if (all.length < 2) return null;
  const top = all[all.length - 1];
  const below = all.filter((n) => n < top);
  const work = below.filter((n) => working.includes(n));
  const buy = work.length ? work : below;
  const usual = all.find((n) => n > Math.min(...buy))!;
  return { all, buy, usual, cap };
}

// What is wrong with a setting of the tables for the boat, or null when nothing is (docs/trading-boat-2-slice.md, stop 1:
// of the 27 settings of the three times-table rungs, most make a crate cost more than a dock pays). "loses": a buying
// price above the usual, so a crate no rumor names sells for less than it cost; "flat": no number above the usual, so a
// rumor pays no more than any dock. The family's page refuses either, and the boat is not here with one, so slice 1's
// promise holds: no choice loses money. Under a setting with neither, every rumor pays over every buying price.
export type NumbersProblem = "loses" | "flat";
export function numbersProblem(nb: Numbers): NumbersProblem | null {
  if (Math.max(...nb.buy) > nb.usual) return "loses";
  if (nb.all[nb.all.length - 1] <= nb.usual) return "flat";
  return null;
}

// --- A seeded day ---

type Rng = () => number;
function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const hash = (s: string) => {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
};
const pick = <T,>(r: Rng, xs: readonly T[]) => xs[Math.floor(r() * xs.length)];
const between = (r: Rng, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));
function shuffle<T>(r: Rng, xs: readonly T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export type Offer = { good: BoatGood; price: number; stock: number };
export type Rumor = { good: BoatGood; island: BoatIsland; price: number };
export type Day = { markets: [Offer[], Offer[]]; rumors: [Rumor, Rumor] };

// A buying price: one of his buying prices, not the one the other market asked.
function priceFor(r: Rng, nb: Numbers, not?: number): number {
  const xs = nb.buy.filter((n) => n !== not);
  return pick(r, xs.length ? xs : nb.buy);
}

// A day's two markets and two rumors, for one child (seed: his id), on the game's day n, on the island he is on.
// The two goods the rumors name are sold at both markets at different prices; each market adds two goods of its own;
// each trader has 2 to 10 crates of each, never more than his most in one sum; at least one good costs his lowest
// buying price. A rumor names an island he is not on and a price at least $1 over the usual and $2 over the cheaper of
// today's two prices for that good.
export function dayOf(seed: string, nb: Numbers, n: number, island: BoatIsland | "home"): Day {
  const r = mulberry32(hash(`${seed}:${n}`));
  const g = shuffle(r, GOODS);
  const others = shuffle(r, ISLANDS.filter((i) => i !== island));
  const stock = () => Math.min(nb.cap, between(r, STOCK[0], STOCK[1]));
  const a: Offer[] = [];
  const b: Offer[] = [];
  const rumors: Rumor[] = [];
  for (const [k, good] of [g[0], g[1]].entries()) {
    const pa = priceFor(r, nb);
    const pb = priceFor(r, nb, pa);
    a.push({ good, price: pa, stock: stock() });
    b.push({ good, price: pb, stock: stock() });
    const floor = Math.max(nb.usual + 1, Math.min(pa, pb) + 2);
    const promised = nb.all.filter((x) => x >= floor);
    // The draw is taken whether or not it is used, so the day's goods, crates and order never depend on his numbers: a
    // change of the family's tables changes only the prices of a day in play (docs/trading-boat-2-slice.md, stop 1).
    const drawn = r();
    rumors.push({ good, island: others[k], price: promised.length ? promised[Math.floor(drawn * promised.length)] : nb.all[nb.all.length - 1] });
  }
  for (const good of [g[2], g[3]]) a.push({ good, price: priceFor(r, nb), stock: stock() });
  for (const good of [g[4], g[5]]) b.push({ good, price: priceFor(r, nb), stock: stock() });
  const low = Math.min(...nb.buy);
  if (![...a, ...b].some((o) => o.price === low)) a[3].price = low;
  return { markets: [shuffle(r, a), shuffle(r, b)], rumors: [rumors[0], rumors[1]] };
}

// How many crates one buyer on the dock takes: as many as he is offered, up to the most in one sum (10 until the ladder
// says bigger multiplying). Brandon at stop 2, 16 Nov 2026: "5 pineapples is not a lot of pineapples", so a buyer no
// longer stops at a few; only a load above the most in one sum is sold to a second buyer. Replaces the fix round's
// "buyers take 2 to 10 at a time".
export const takeOf = (nb: Numbers): number => nb.cap;

// What a crate of a good sells for on an island: the rumor's price if he sailed there on that good's rumor, else the
// usual. Never less than any buying price, so no choice loses money; a poor one only earns less.
export const priceAt = (nb: Numbers, good: BoatGood, sailing: Rumor | null) => (sailing && sailing.good === good ? sailing.price : nb.usual);
