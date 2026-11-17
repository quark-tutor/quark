import { BOAT, SAY, type BoatGood, type BoatIsland, type BoatName, type BoatUnit } from "../wall/words.ts";
import { BUNDLE, KEEP, START_MONEY, boatOf, dayOf, nextBoat, priceAt, takeOf, type Day, type Numbers, type Rumor } from "./day.ts";

// The trading boat's game (docs/trading-boat-slice.md): where a boy is in his day, each move he makes, and the screen it
// shows. The day: he lands where yesterday's boat was sent and sells to the buyers on the dock, a few crates each; one
// look back; the boat builder when he can pay; the harbor market and the village market, where he chooses what to buy
// and how many and tells the trader what he owes; then he casts off for the island one of the two rumors named, and is
// done until tomorrow. The first day starts at home with $20 and an empty canoe. A missed day costs nothing: the game
// counts days played, and a day left half-played waits where it was.
//
// The sum is the move: a wrong total gets help at once (the two numbers added, one crate out, or the count), never
// "How did you get that?", never a lost dollar, and never the answer (rule 3): the count's last step is his own, and
// where there is nothing fewer the sum goes to a grown-up. Every word is from core/wall/words.ts. Pure: the server
// (lib/boat.ts) loads and saves the state, reads the child's number and gives the no-number judge's verdict.

export type Load = { good: BoatGood; count: number; paid: number };
export type Stop = "start" | "land" | "harbor" | "village" | "cast" | "done";

export type Trade =
  | { kind: "buy"; market: 0 | 1; offer: number; good: BoatGood; count: number; price: number }
  | { kind: "sell"; good: BoatGood; count: number; price: number }
  | { kind: "boat"; boat: BoatName; bills: number; counted: number; count: number } // count: bills in this bundle
  | { kind: "back"; good: BoatGood; paid: number; sold: number };

// The count, after a wrong total: crates lit so far (each step's total his own), and one at a time after a wrong step.
export type Count = { lit: number; single: boolean };
export type ReplyKey = "added" | "oneOut" | "letsCount" | "guessFirst" | "goodCatch" | "countUp";
export type Hand = { trade: Trade; no: number; count: Count | null; reply: ReplyKey | null; tries: number; ended: "fewer" | "person" | null };

// A good on board at the landing: what he had and paid, the buyer he is at, and what he has sold it for so far.
export type DockGood = { good: BoatGood; had: number; paid: number; buyer: number; sold: number; got: number; kept: boolean };

export type Note =
  | { kind: "bought"; n: number; good: BoatGood }
  | { kind: "short"; total: number; money: number }
  | { kind: "sold"; money: number }
  | { kind: "right" }
  | { kind: "boat"; boat: BoatName; space: number }
  | { kind: "person" }
  | { kind: "cast"; island: BoatIsland };

export type Today = {
  n: number; // the game's day: days played, not days on the calendar
  on: string; // the calendar day it started, where the family lives (YYYY-MM-DD)
  stop: Stop;
  startMoney: number;
  stock: [number[], number[]]; // crates left at each trader, in the order of dayOf()'s markets
  dock: DockGood[];
  back: "later" | "ask" | "done";
  builder: "later" | "offer" | "done";
  picking: { market: 0 | 1; offer: number } | null;
  hand: Hand | null;
  note: Note | null;
  trades: number;
};

export type Game = { money: number; space: number; cargo: Load[]; island: BoatIsland | "home"; sailing: Rumor | null; today: Today | null };
export const newGame = (): Game => ({ money: START_MONEY, space: 10, cargo: [], island: "home", sailing: null, today: null });

// seed: the child's id; nb: his numbers from the ladder; date: today where the family lives (the test view's day on the
// dev server).
export type Ctx = { seed: string; nb: Numbers; date: string };

// What the child's answer said: a number read in code (core/math/numbers.ts), or, with no number, the no-number
// judge's verdict ("other" when it gave none, and for two numbers at once).
export type Read = { value: number } | { none: "dont_know" | "questioned" | "other" };
export type Verdict = "right" | "added" | "one_off" | "other" | "dont_know" | "questioned";

// One row of the parents' log (boat_turns): an answer, or the landing and the cast-off with his money.
export type Turn = {
  day: number;
  on: string;
  trade: number | null;
  kind: "buy" | "sell" | "boat" | "back" | "land" | "sail";
  island: string;
  good: BoatGood | null;
  count: number | null;
  price: number | null;
  step: number | null; // the count's step (crates counted), or null for the trade's own sum
  expected: number | null;
  answer: string | null;
  verdict: Verdict | null;
  short: boolean;
  money: number;
};

export type Action =
  | { type: "next" }
  | { type: "pick"; market: 0 | 1; offer: number }
  | { type: "unpick" }
  | { type: "count"; n: number }
  | { type: "keep" }
  | { type: "answer"; read: Read; text: string }
  | { type: "cancel" }
  | { type: "fewer" }
  | { type: "builder"; buy: boolean }
  | { type: "sail"; rumor: 0 | 1 };

const clone = <T,>(x: T): T => structuredClone(x);
export const dayFor = (g: Game, ctx: Ctx): Day => dayOf(ctx.seed, ctx.nb, g.today!.n, g.island);
export const used = (g: Game) => g.cargo.reduce((t, l) => t + l.count, 0);
const held = (g: Game, good: BoatGood) => g.cargo.find((l) => l.good === good)?.count ?? 0;

// --- A new day ---

// The game as it stands today: a first day at home if he has never played, the next day if yesterday's boat has sailed
// and the calendar has moved on, else as he left it (a half-played day waits, and nothing is lost for waiting).
export function roll(g: Game, ctx: Ctx): Game {
  if (!g.today) return begin(clone(g), ctx, 1, "home");
  if (g.today.stop === "done" && g.sailing && ctx.date > g.today.on) return begin(clone(g), ctx, g.today.n + 1, g.sailing.island);
  return g;
}

function begin(g: Game, ctx: Ctx, n: number, island: BoatIsland | "home"): Game {
  g.island = island;
  const day = dayOf(ctx.seed, ctx.nb, n, island);
  const landing = n > 1;
  g.today = {
    n,
    on: ctx.date,
    stop: landing ? "land" : "start",
    startMoney: g.money,
    stock: [day.markets[0].map((o) => o.stock), day.markets[1].map((o) => o.stock)],
    dock: landing ? g.cargo.filter((l) => l.count > 0).map((l) => ({ good: l.good, had: l.count, paid: l.paid, buyer: 0, sold: 0, got: 0, kept: false })) : [],
    back: landing ? "later" : "done",
    builder: landing ? "later" : "done",
    picking: null,
    hand: null,
    note: null,
    trades: 0,
  };
  return settle(g);
}

// The row for the parents' log when a new day starts: where he landed and the money he started with.
export function landTurn(g: Game): Turn {
  const t = g.today!;
  return { day: t.n, on: t.on, trade: null, kind: "land", island: g.island, good: null, count: null, price: null, step: null, expected: null, answer: null, verdict: null, short: false, money: t.startMoney };
}

// The good on sale at the landing: the first on board he has neither sold out nor kept.
const onSale = (g: Game) => g.today!.dock.find((d) => !d.kept && held(g, d.good) > 0) ?? null;

// The landing's own steps, once the selling is over: the look back (a good he sold all of today, for $100 or less and
// bought for $100 or less, so the sum stays on adding and taking away to 100), then the boat builder when he can pay
// for the next boat and keep $20.
function settle(g: Game): Game {
  const t = g.today!;
  if (t.stop !== "land" || t.hand || onSale(g)) return g;
  if (t.back === "later") {
    const done = t.dock.filter((d) => d.sold === d.had && d.got <= 100 && d.paid <= 100 && d.got !== d.paid).sort((a, b) => b.got - a.got);
    if (done.length) {
      t.back = "ask";
      t.hand = hand(t, { kind: "back", good: done[0].good, paid: done[0].paid, sold: done[0].got });
      return g;
    }
    t.back = "done";
  }
  if (t.builder === "later") {
    const next = nextBoat(g.space);
    t.builder = next && g.money >= next.bills * 100 + KEEP ? "offer" : "done";
  }
  return g;
}

function hand(t: Today, trade: Trade): Hand {
  t.trades += 1;
  // One crate or one bill has nothing to count two at a time.
  return { trade, no: t.trades, count: null, reply: null, tries: 0, ended: null };
}

// --- The sums ---

const unitOf = (tr: Trade): BoatUnit => (tr.kind === "boat" ? "bill" : "crate");
const priceOf = (tr: Exclude<Trade, { kind: "back" }>) => (tr.kind === "boat" ? 100 : tr.price);
export const totalOf = (tr: Trade) => (tr.kind === "back" ? Math.abs(tr.sold - tr.paid) : tr.count * priceOf(tr));
export const sumOf = (tr: Trade) =>
  tr.kind === "back" ? `$${Math.max(tr.sold, tr.paid)} − $${Math.min(tr.sold, tr.paid)} = ?` : `${tr.count} × $${priceOf(tr)} = ?`;

// The count's next step: the crates counted once it is right, and whether it is one more after a wrong step.
export function stepOf(h: Hand): { k: number; more: boolean; sum: string } | null {
  const tr = h.trade;
  if (!h.count || tr.kind === "back") return null;
  const p = priceOf(tr);
  const { lit, single } = h.count;
  const add = single ? 1 : Math.min(2, tr.count - lit);
  const k = lit + add;
  const parts = [...(lit ? [`$${lit * p}`] : []), ...Array.from({ length: add }, () => `$${p}`)];
  const sum = parts.length === 1 ? `1 × $${p} = ?` : `${parts.join(" + ")} = ?`;
  return { k, more: single && lit > 0, sum };
}

// Spoken by "Read it to me": the signs in words.
export const spoken = (sum: string) => sum.replace(/×/g, "times").replace(/−/g, "minus").replace(/\+/g, "plus").replace("= ?", "equals what?");

// --- A move ---

export type Result = { game: Game; turns: Turn[] } | null;

export function act(before: Game, action: Action, ctx: Ctx): Result {
  const g = roll(clone(before), ctx);
  const t = g.today!;
  const turns: Turn[] = [];
  const log = (row: Omit<Turn, "day" | "on" | "island" | "money" | "short"> & { short?: boolean }) =>
    turns.push({ day: t.n, on: t.on, island: g.island, money: g.money, short: false, ...row });
  if (action.type !== "answer") t.note = null;
  const day = dayFor(g, ctx);

  switch (action.type) {
    case "next": {
      if (t.hand || t.picking) return null;
      if (t.stop === "start") t.stop = "harbor";
      else if (t.stop === "land") {
        if (onSale(g) || t.back !== "done" || t.builder === "later" || t.builder === "offer") return null;
        t.stop = "harbor";
      } else if (t.stop === "harbor") t.stop = "village";
      else if (t.stop === "village") t.stop = "cast";
      else return null;
      return { game: g, turns };
    }
    case "pick": {
      if (t.hand || !atMarket(t) || action.market !== marketOf(t)) return null;
      const o = day.markets[action.market][action.offer];
      if (!o || t.stock[action.market][action.offer] < 1 || buyMax(g, ctx, action.market, action.offer) < 1) return null;
      t.picking = { market: action.market, offer: action.offer };
      return { game: g, turns };
    }
    case "unpick": {
      if (!t.picking || t.hand) return null;
      t.picking = null;
      return { game: g, turns };
    }
    case "count": {
      if (t.hand || !Number.isInteger(action.n) || action.n < 1) return null;
      if (t.stop === "land") {
        const d = onSale(g);
        if (!d || action.n > sellMax(g, ctx)) return null;
        t.hand = hand(t, { kind: "sell", good: d.good, count: action.n, price: priceAt(ctx.nb, d.good, g.sailing && g.sailing.island === g.island ? g.sailing : null) });
      } else {
        if (!t.picking || action.n > buyMax(g, ctx, t.picking.market, t.picking.offer)) return null;
        const o = day.markets[t.picking.market][t.picking.offer];
        t.hand = hand(t, { kind: "buy", market: t.picking.market, offer: t.picking.offer, good: o.good, count: action.n, price: o.price });
      }
      return { game: g, turns };
    }
    case "keep": {
      const d = onSale(g);
      if (t.stop !== "land" || t.hand || !d) return null;
      d.kept = true;
      return { game: settle(g), turns };
    }
    case "builder": {
      if (t.stop !== "land" || t.builder !== "offer" || t.hand) return null;
      const next = nextBoat(g.space)!;
      if (!action.buy) t.builder = "done";
      else t.hand = hand(t, { kind: "boat", boat: next.key, bills: next.bills, counted: 0, count: Math.min(BUNDLE, next.bills) });
      return { game: g, turns };
    }
    case "cancel": {
      const h = t.hand;
      if (!h || h.trade.kind === "back") return null;
      t.hand = null;
      if (h.trade.kind === "buy") t.picking = null;
      if (h.trade.kind === "boat") t.builder = "done";
      return { game: settle(g), turns };
    }
    case "fewer": {
      const h = t.hand;
      if (!h || h.ended !== "fewer") return null;
      t.hand = null;
      return { game: g, turns };
    }
    case "sail": {
      if (t.stop !== "cast" || t.hand) return null;
      const r = day.rumors[action.rumor];
      if (!r) return null;
      g.sailing = r;
      t.stop = "done";
      t.note = { kind: "cast", island: r.island };
      log({ trade: null, kind: "sail", good: r.good, count: null, price: r.price, step: null, expected: null, answer: r.island, verdict: null });
      return { game: g, turns };
    }
    case "answer":
      return answer(g, ctx, action, log) ? { game: g, turns } : null;
  }
}

const atMarket = (t: Today) => t.stop === "harbor" || t.stop === "village";
const marketOf = (t: Today): 0 | 1 => (t.stop === "harbor" ? 0 : 1);

// The most he can choose: the trader's crates, the room on his boat and his most in one sum, whichever is least.
export const buyMax = (g: Game, ctx: Ctx, market: 0 | 1, offer: number) => Math.min(g.today!.stock[market][offer], g.space - used(g), ctx.nb.cap);
// The most he can sell to this buyer: what the buyer takes, what he has, and his most in one sum.
export function sellMax(g: Game, ctx: Ctx): number {
  const d = onSale(g);
  return d ? Math.min(takeOf(ctx.nb), held(g, d.good), ctx.nb.cap) : 0;
}

type Log = (row: Omit<Turn, "day" | "on" | "island" | "money" | "short"> & { short?: boolean }) => void;

function answer(g: Game, ctx: Ctx, a: Extract<Action, { type: "answer" }>, log: Log): boolean {
  const t = g.today!;
  const h = t.hand;
  if (!h || h.ended) return false;
  t.note = null;
  const tr = h.trade;
  const step = stepOf(h);
  const row = (verdict: Verdict, expected: number, short = false) =>
    log({
      trade: h.no,
      kind: tr.kind,
      good: tr.kind === "boat" ? null : tr.good,
      // The look back's sum is its larger and smaller total ("$60 − $30"), kept in count and price.
      count: tr.kind === "back" ? Math.max(tr.sold, tr.paid) : tr.count,
      price: tr.kind === "back" ? Math.min(tr.sold, tr.paid) : priceOf(tr),
      step: step ? step.k : null,
      expected,
      answer: a.text.slice(0, 200),
      verdict,
      short,
    });
  const value = "value" in a.read ? a.read.value : null;
  const none = "none" in a.read ? a.read.none : null;

  if (none === "dont_know") {
    row("dont_know", step ? step.k * priceOf(tr as Exclude<Trade, { kind: "back" }>) : totalOf(tr));
    h.reply = "guessFirst";
    return true;
  }

  // The look back: one help ("Count up from ..."), then a grown-up.
  if (tr.kind === "back") {
    const want = totalOf(tr);
    if (value === want) {
      row("right", want);
      t.hand = null;
      t.back = "done";
      t.note = { kind: "right" };
      settle(g);
      return true;
    }
    row(none === "questioned" ? "questioned" : "other", want);
    h.tries += 1;
    if (h.tries >= 2) {
      t.hand = null;
      t.back = "done";
      t.note = { kind: "person" };
      settle(g);
    } else h.reply = none === "questioned" ? "goodCatch" : "countUp";
    return true;
  }

  const p = priceOf(tr);
  const want = tr.count * p;

  // The count: each step's total is his own, and the last step is the whole sum.
  if (step && h.count) {
    const so = step.k * p;
    if (value === so) {
      h.count.lit = step.k;
      h.reply = null;
      if (step.k === tr.count) {
        row("right", so, tr.kind === "buy" && so > g.money);
        return complete(g, h);
      }
      row("right", so);
      return true;
    }
    if (none === "questioned") {
      row("questioned", so);
      h.reply = "goodCatch";
      return true;
    }
    row("other", so);
    h.reply = null;
    if (!h.count.single) h.count.single = true;
    else h.ended = endOf(tr);
    return true;
  }

  if (value === want) {
    row("right", want, tr.kind === "buy" && want > g.money);
    return complete(g, h);
  }
  const verdict: Verdict = none === "questioned" ? "questioned" : value === tr.count + p ? "added" : value !== null && Math.abs(value - want) === p ? "one_off" : "other";
  row(verdict, want);
  h.reply = verdict === "questioned" ? "goodCatch" : verdict === "added" ? "added" : verdict === "one_off" ? "oneOut" : "letsCount";
  // A sum of one crate or one bill has nothing to count: it goes to a grown-up.
  if (tr.count === 1) h.ended = endOf(tr);
  else h.count = { lit: 0, single: false };
  return true;
}

// Where the count ends when its one-crate step is missed: fewer crates, or a grown-up when there is nothing fewer.
const endOf = (tr: Trade): Hand["ended"] => (tr.kind === "boat" || tr.kind === "back" || tr.count === 1 ? "person" : "fewer");

function complete(g: Game, h: Hand): boolean {
  const t = g.today!;
  const tr = h.trade;
  if (tr.kind === "buy") {
    const total = tr.count * tr.price;
    t.hand = null;
    if (total > g.money) {
      // He has the sum right and not the money: he chooses again.
      t.note = { kind: "short", total, money: g.money };
      return true;
    }
    g.money -= total;
    t.stock[tr.market][tr.offer] -= tr.count;
    const load = g.cargo.find((l) => l.good === tr.good);
    if (load) {
      load.count += tr.count;
      load.paid += total;
    } else g.cargo.push({ good: tr.good, count: tr.count, paid: total });
    t.picking = null;
    t.note = { kind: "bought", n: tr.count, good: tr.good };
    return true;
  }
  if (tr.kind === "sell") {
    const total = tr.count * tr.price;
    g.money += total;
    const load = g.cargo.find((l) => l.good === tr.good)!;
    const left = load.count - tr.count;
    load.paid = left > 0 ? Math.round((load.paid * left) / load.count) : 0;
    load.count = left;
    g.cargo = g.cargo.filter((l) => l.count > 0);
    const d = t.dock.find((x) => x.good === tr.good)!;
    d.buyer += 1;
    d.sold += tr.count;
    d.got += total;
    t.hand = null;
    t.note = { kind: "sold", money: g.money };
    settle(g);
    return true;
  }
  if (tr.kind === "boat") {
    const counted = tr.counted + tr.count;
    if (counted < tr.bills) {
      t.hand = { ...h, trade: { ...tr, counted, count: Math.min(BUNDLE, tr.bills - counted) }, count: null, reply: null, ended: null };
      return true;
    }
    const boat = boatOf(BOAT_SPACE[tr.boat]);
    g.money -= tr.bills * 100;
    g.space = boat.space;
    t.hand = null;
    t.builder = "done";
    t.note = { kind: "boat", boat: tr.boat, space: boat.space };
    return true;
  }
  return false;
}

const BOAT_SPACE: Record<BoatName, number> = { canoe: 10, double: 20, schooner: 50, ship: 100 };

// --- The screen ---

export type Button = { label: string; action: Action };
export type Crates = { count: number; price: number; lit: number; unit: BoatUnit; good: BoatGood | null };
export type TradeView = {
  lines: string[];
  pic: Crates | null;
  question: string;
  sum: string;
  reply: string | null;
  step: { ask: string; sum: string; k: number } | null; // k: the crates counted once this step is right
  ended: string[] | null;
  answering: boolean;
};
export type OfferView = { market: 0 | 1; offer: number; label: string; left: string; open: boolean };
// picture: which of Brandon's pictures (the README in Documents/quark-art) the screen shows; a placeholder in this slice.
export type Picture = "market-stilts" | "market-hillside" | "landing" | "cast-off";
export type Screen = {
  title: string;
  picture: Picture | null;
  note: string | null;
  status: string[] | null;
  lines: string[];
  offers: OfferView[] | null;
  stepper: { ask: string; max: number; maxLine: string | null } | null;
  trade: TradeView | null;
  buttons: Button[];
  done: boolean;
  speak: string;
};

function noteText(n: Note | null): string | null {
  if (!n) return null;
  switch (n.kind) {
    case "bought":
      return BOAT.bought(n.n, n.good);
    case "short":
      return BOAT.short(n.total, n.money);
    case "sold":
      return BOAT.sold(n.money);
    case "right":
      return BOAT.right;
    case "boat":
      return BOAT.boatYours(n.boat, n.space);
    case "person":
      return `${SAY.forAPerson} ${BOAT.askGrownUp}`;
    case "cast":
      return BOAT.castOffFor(n.island);
  }
}

const replyText = (h: Hand): string | null => {
  const tr = h.trade;
  switch (h.reply) {
    case null:
      return null;
    case "guessFirst":
      return SAY.guessFirst;
    case "goodCatch":
      return SAY.goodCatch;
    case "added":
      return tr.kind === "back" ? null : BOAT.added(tr.count, priceOf(tr));
    case "oneOut":
      return BOAT.oneOut(unitOf(tr));
    case "letsCount":
      return BOAT.letsCount;
    case "countUp":
      return tr.kind === "back" ? BOAT.countUp(Math.min(tr.paid, tr.sold), Math.max(tr.paid, tr.sold)) : null;
  }
};

// A trade's page: a picture of exactly what is in the sum, the question with the sum beside it, and nothing else
// (decided 10 Nov 2026).
function tradeView(h: Hand): TradeView {
  const tr = h.trade;
  const step = stepOf(h);
  const lines: string[] = [];
  let question: string;
  if (tr.kind === "buy") question = BOAT.owe;
  else if (tr.kind === "sell") question = BOAT.owed;
  else if (tr.kind === "boat") question = tr.bills > BUNDLE ? BOAT.bundle : BOAT.oweBuilder;
  else question = tr.sold >= tr.paid ? BOAT.backMade(tr.paid, tr.good, tr.sold) : BOAT.backLess(tr.paid, tr.good, tr.sold);
  const replies = [replyText(h), h.reply === "goodCatch" && tr.kind === "back" ? BOAT.countUp(Math.min(tr.paid, tr.sold), Math.max(tr.paid, tr.sold)) : null].filter((x): x is string => !!x);
  return {
    lines,
    pic: tr.kind === "back" ? null : { count: tr.count, price: priceOf(tr), lit: h.count?.lit ?? 0, unit: unitOf(tr), good: tr.kind === "boat" ? null : tr.good },
    question,
    sum: sumOf(tr),
    reply: replies.length ? replies.join(" ") : null,
    step: step && !h.ended ? { ask: BOAT.step(step.k, unitOf(tr), step.more), sum: step.sum, k: step.k } : null,
    ended: h.ended === "fewer" ? [tr.kind === "sell" ? BOAT.sellFewer : BOAT.tryFewer] : h.ended === "person" ? [SAY.forAPerson, BOAT.askGrownUp] : null,
    answering: !h.ended,
  };
}

function statusOf(g: Game): string[] {
  const loads = g.cargo.filter((l) => l.count > 0).map((l) => BOAT.crates(l.count, l.good));
  return [BOAT.money(g.money), BOAT.yourBoat(boatOf(g.space).key, used(g), g.space), BOAT.aboard(loads)];
}

export function view(g: Game, ctx: Ctx): Screen {
  const t = g.today!;
  const day = dayFor(g, ctx);
  const s: Screen = { title: BOAT.tile, picture: null, note: noteText(t.note), status: null, lines: [], offers: null, stepper: null, trade: null, buttons: [], done: false, speak: "" };
  const h = t.hand;

  if (h) {
    // A trade in hand: the place, and the trade alone.
    s.title = t.stop === "land" ? BOAT.land(g.island as BoatIsland) : t.stop === "harbor" || t.stop === "village" ? BOAT.market(t.stop, g.island) : BOAT.tile;
    s.trade = tradeView(h);
    s.buttons = handButtons(h);
  } else if (t.stop === "start") {
    s.lines = [...BOAT.firstDay];
    s.buttons = [{ label: BOAT.toHarbor, action: { type: "next" } }];
  } else if (t.stop === "land") {
    const island = g.island as BoatIsland;
    s.title = BOAT.land(island);
    s.status = statusOf(g);
    if (g.sailing && g.sailing.island === island) s.lines.push(BOAT.landReason(g.sailing.good, island, g.sailing.price));
    const d = onSale(g);
    if (d) {
      const rumored = g.sailing && g.sailing.island === island && g.sailing.good === d.good;
      const price = priceAt(ctx.nb, d.good, rumored ? g.sailing : null);
      if (!rumored) s.lines.push(BOAT.usualHere(d.good, price));
      s.lines.push(d.buyer === 0 ? BOAT.buyer(d.good, price) : BOAT.buyerNext(d.good, price));
      // A buyer takes as many as he is offered, up to the most in one sum; when + stops there and he has more, the
      // screen says why, and that another buyer comes.
      const max = sellMax(g, ctx);
      s.stepper = { ask: BOAT.howManySell, max, maxLine: held(g, d.good) > max ? BOAT.buyerLimit(takeOf(ctx.nb)) : null };
      s.buttons = [{ label: BOAT.keep, action: { type: "keep" } }];
    } else if (t.builder === "offer") {
      const next = nextBoat(g.space)!;
      s.lines.push(BOAT.builder(next.key, next.space, next.bills));
      s.buttons = [
        { label: BOAT.buyIt, action: { type: "builder", buy: true } },
        { label: BOAT.notNow, action: { type: "builder", buy: false } },
      ];
    } else s.buttons = [{ label: BOAT.toHarbor, action: { type: "next" } }];
  } else if (t.stop === "harbor" || t.stop === "village") {
    const m = marketOf(t);
    s.title = BOAT.market(t.stop, g.island);
    s.status = statusOf(g);
    const r = day.rumors[m];
    s.lines = [BOAT.usual(ctx.nb.usual), BOAT.rumor(r.good, r.island, r.price)];
    if (t.picking) {
      const o = day.markets[m][t.picking.offer];
      const max = buyMax(g, ctx, m, t.picking.offer);
      s.lines.push(BOAT.offer(o.good, o.price));
      s.stepper = { ask: BOAT.howMany(o.good), max, maxLine: max === g.space - used(g) ? BOAT.allTheRoom : BOAT.allTheTraderHas };
      s.buttons = [{ label: BOAT.chooseAgain, action: { type: "unpick" } }];
    } else {
      s.offers = day.markets[m].map((o, i) => {
        const left = t.stock[m][i];
        return { market: m, offer: i, label: BOAT.offer(o.good, o.price), left: left > 0 ? BOAT.left(left) : BOAT.soldOut, open: left > 0 && buyMax(g, ctx, m, i) > 0 };
      });
      if (g.space - used(g) === 0) s.lines.push(BOAT.allTheRoom);
      s.buttons = [{ label: t.stop === "harbor" ? BOAT.toVillage : BOAT.castOff, action: { type: "next" } }];
    }
  } else if (t.stop === "cast") {
    s.title = BOAT.whereSail;
    s.status = statusOf(g);
    s.buttons = day.rumors.map((r, i) => ({ label: BOAT.sailChoice(r.good, r.island, r.price), action: { type: "sail", rumor: i as 0 | 1 } }));
  } else {
    s.done = true;
    if (!s.note && g.sailing) s.lines = [BOAT.sailingTo(g.sailing.island)];
  }

  if (!h) s.picture = t.stop === "land" ? "landing" : t.stop === "village" ? "market-hillside" : t.stop === "cast" || t.stop === "done" ? "cast-off" : "market-stilts";
  s.speak = speakOf(s);
  return s;
}

function handButtons(h: Hand): Button[] {
  const tr = h.trade;
  if (h.ended === "fewer") return [{ label: tr.kind === "sell" ? BOAT.sellFewerButton : BOAT.tryFewerButton, action: { type: "fewer" } }];
  if (tr.kind === "back") return [];
  if (tr.kind === "boat") return [{ label: BOAT.notNow, action: { type: "cancel" } }];
  return [{ label: BOAT.chooseAgain, action: { type: "cancel" } }];
}

// What "Read it to me" says: the screen's words in order, a sum in words.
function speakOf(s: Screen): string {
  const parts: string[] = [];
  if (s.note) parts.push(s.note);
  parts.push(s.title === BOAT.tile ? "" : s.title, ...s.lines);
  if (s.offers) for (const o of s.offers) parts.push(`${o.label}. ${o.left}.`);
  if (s.stepper) parts.push(s.stepper.ask);
  if (s.trade) {
    // One question at a time: during the count the trade's sum is said as a reminder, and the step is the question.
    if (s.trade.step || s.trade.ended) parts.push(...s.trade.lines, spoken(s.trade.sum.replace(/\s*=\s*\?$/, "")));
    else parts.push(...s.trade.lines, s.trade.question, spoken(s.trade.sum));
    if (s.trade.reply) parts.push(s.trade.reply);
    if (s.trade.step) parts.push(s.trade.step.ask, spoken(s.trade.step.sum));
    if (s.trade.ended) parts.push(...s.trade.ended);
  }
  if (s.title === BOAT.whereSail) parts.push(...s.buttons.map((b) => b.label));
  return parts
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => (/[.?!:]$/.test(p) ? p : `${p}.`))
    .join(" ");
}

// Whether today's day is over: the tile reads "Done for today".
export const doneToday = (g: Game, ctx: Ctx) => {
  const r = roll(g, ctx);
  return r.today?.stop === "done";
};
