import { BOAT, type BoatGood, type BoatIsland } from "../wall/words.ts";
import { START_MONEY } from "./day.ts";

// The parents' log of the trading boat (docs/trading-boat-slice.md, stop 2): each day's trades for one child, newest
// day first, every sum with what he said to it, whether it was right at once or which help he needed, and each other
// answer with its kind. From boat_turns, as lib/boat.ts writes them. Pure. For the parents only, never the iPad.

export type TurnRow = {
  day: number;
  played_on: string;
  trade: number | null;
  kind: "buy" | "sell" | "boat" | "back" | "land" | "sail";
  island: string;
  good: string | null;
  count: number | null;
  price: number | null;
  step: number | null;
  expected: number | null;
  answer: string | null;
  verdict: "right" | "added" | "one_off" | "other" | "dont_know" | "questioned" | null;
  short: boolean;
  money: number;
};

export type DayLog = { head: string; lines: string[] };

const KIND: Record<Exclude<TurnRow["verdict"], null | "right">, string> = {
  added: "the two numbers added",
  one_off: "one out",
  other: "another number",
  dont_know: "said he didn't know",
  questioned: "said something was wrong with it",
};
const place = (i: string) => (i === "home" ? "home" : BOAT.island(i as BoatIsland));
const said = (r: TurnRow) => `said ${r.answer ?? "?"}`;
const ordinal = (n: number) => `${n}${n % 10 === 1 && n !== 11 ? "st" : n % 10 === 2 && n !== 12 ? "nd" : n % 10 === 3 && n !== 13 ? "rd" : "th"}`;

// One trade's line: what it was, its sum, and every answer to it in order.
function tradeLine(rows: TurnRow[]): string {
  const first = rows[0];
  const n = first.count ?? 0;
  const p = first.price ?? 0;
  // In crates, as the game says it ("1 crate of sweet potatoes", "3 crates of mangoes"; docs/trading-boat-2-slice.md).
  const crates = first.good ? BOAT.crates(n, first.good as BoatGood) : `${n}`;
  const what =
    first.kind === "buy"
      ? `Bought ${crates} at $${p}: ${n} × $${p} = ${n * p}.`
      : first.kind === "sell"
        ? `Sold ${crates} at $${p}: ${n} × $${p} = ${n * p}.`
        : first.kind === "boat"
          ? `The boat builder: ${n} × $100 = ${n * 100}.`
          : `Look back: $${n} − $${p} = ${n - p}.`;
  const parts: string[] = [];
  let steps = 0;
  for (const r of rows) {
    if (r.step === null) {
      if (r.verdict === "right") parts.push(r.short ? `Right at once, and more than he had ($${r.money}).` : parts.length ? `Then right (${said(r)}).` : "Right at once.");
      else parts.push(`${said(r)[0].toUpperCase()}${said(r).slice(1)} (${KIND[r.verdict!]}).`);
    } else {
      steps += 1;
      if (r.verdict === "right" && r.step === n) parts.push(`Right on the count's ${ordinal(steps)} step${r.short ? `, and more than he had ($${r.money})` : ""}.`);
      else if (r.verdict === "right") parts.push(`Count, ${r.step}: ${r.answer} ✓.`);
      else parts.push(`Count, ${r.step}: ${said(r)} (${KIND[r.verdict!]}).`);
    }
  }
  const last = rows[rows.length - 1];
  if (last.verdict !== "right") parts.push("No right total: he chose again, or it went to a grown-up.");
  return `${what} ${parts.join(" ")}`;
}

// A child's turns, oldest first, as days, newest first.
export function dayLogs(rows: TurnRow[]): DayLog[] {
  const days = [...new Set(rows.map((r) => r.day))].sort((a, b) => b - a);
  return days.map((d) => {
    const mine = rows.filter((r) => r.day === d);
    const land = mine.find((r) => r.kind === "land");
    const sail = mine.find((r) => r.kind === "sail");
    const start = land ? land.money : d === 1 ? START_MONEY : null;
    const island = land?.island ?? mine[0].island;
    const head = [`Day ${d}`, place(island), mine[0].played_on, start !== null ? `started with $${start}` : null, sail ? `ended with $${sail.money}` : "still on the way"].filter(Boolean).join(" · ");
    const lines: string[] = [];
    const trades = [...new Set(mine.filter((r) => r.trade !== null).map((r) => r.trade!))];
    for (const no of trades) {
      const rows = mine.filter((r) => r.trade === no);
      // A boat paid in bundles is one trade of several sums: a line for each bundle.
      const bundles = rows[0].kind === "boat" ? [...new Set(rows.map((r) => r.count))].map((c) => rows.filter((r) => r.count === c)) : [rows];
      for (const b of bundles) lines.push(tradeLine(b));
    }
    if (sail) lines.push(`Sailed to ${place(sail.answer ?? "")}, on the ${BOAT.good(sail.good as BoatGood)} rumor ($${sail.price}).`);
    return { head, lines };
  });
}
