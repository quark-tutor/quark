// The Looks-good tap (docs/looks-good-slice.md, decision 4): when a guardian may make a week live, what the
// week page tells them first, and the words for it. Pure, so the server action that does the tap and the
// page that explains it read the same rules, and every refusal is tested. Nothing here says "AI": it is
// "the checker", "held back" and "your rulebook". Relative imports with extensions.

import { DAYS_IN_WEEK } from "./schedule.ts";

// A card as the rules see it: its place, its verdict and who gave it (policy_notes.gate, docs/04).
export type LiveCard = {
  child_id: string;
  day: string;
  slot: string;
  layer: number;
  policy: string;
  policy_notes: { validation?: string[]; gate?: { by: "code" | "model"; rulebook: string; floor: number; floor_first_guess: boolean } } | null;
};

export const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

// How many of the seven days every child has cards for: the fewest over the children, 0 when one has none.
export function daysBuilt(cards: LiveCard[], childIds: string[]): number {
  if (childIds.length === 0) return 0;
  return Math.min(...childIds.map((id) => new Set(cards.filter((c) => c.child_id === id).map((c) => c.day)).size), DAYS_IN_WEEK);
}

export type LiveInput = {
  status: string; // themes.status
  cards: LiveCard[];
  childIds: string[];
  currentHash: string | null; // the hash of the guardians' answers now (familyRulebook), never the saved one
  savedHash: string | null; // values_profiles.source_hash: the rulebook as it was last saved
  floorVersion: number; // the safety floor file's, now
};

// Why this week can't be made live, in the words a guardian reads; empty when it can. A verdict counts
// only against the rulebook and floor it was reached under, so a saved rulebook older than the answers
// refuses too, by way of every verdict being on an older hash.
export function liveProblems(input: LiveInput): string[] {
  const { status, cards } = input;
  const built = daysBuilt(cards, input.childIds);
  if (status === "live") return ["This week is already live."];
  if (status === "generating") return [`This week is still being built: ${built} of ${DAYS_IN_WEEK} days.`];
  if (status !== "review") return ["This week isn't ready to go live."];

  const problems: string[] = [];
  const askAgain = " Whoever runs Quark can check them again.";
  if (built < DAYS_IN_WEEK) problems.push(`Only ${built} of ${DAYS_IN_WEEK} days are built. This week can go live once all seven are.`);

  const unchecked = cards.filter((c) => c.policy === "pending" || (c.policy === "passed" && !c.policy_notes?.gate)).length;
  if (unchecked) problems.push(`${plural(unchecked, "card isn't", "cards aren't")} checked yet. This week can go live once every card is checked.${askAgain}`);

  const gated = cards.filter((c) => c.policy_notes?.gate);
  const olderRulebook = gated.filter((c) => c.policy_notes!.gate!.rulebook !== input.currentHash).length;
  if (olderRulebook) {
    const unsaved = input.savedHash !== input.currentHash ? " Open the rulebook page once first, so your latest answers are saved." : "";
    problems.push(
      `${plural(olderRulebook, "card was", "cards were")} checked against an older rulebook and ${olderRulebook === 1 ? "needs" : "need"} checking again before this week can go live.${unsaved}${askAgain}`,
    );
  }
  const olderFloor = gated.filter((c) => c.policy_notes!.gate!.rulebook === input.currentHash && c.policy_notes!.gate!.floor !== input.floorVersion).length;
  if (olderFloor) {
    problems.push(`${plural(olderFloor, "card was", "cards were")} checked against an older safety floor and ${olderFloor === 1 ? "needs" : "need"} checking again before this week can go live.${askAgain}`);
  }
  return problems;
}

export const liveProblem = (input: LiveInput): string | null => liveProblems(input)[0] ?? null;

// Taking a live week back to review: any guardian, until the week's first day begins where the family lives
// (Monday, midnight, Hawaii). After that, holding back one card is the Wonder Wall's.
export function backToReviewProblem(input: { status: string; weekStart: string; today: string }): string | null {
  if (input.status !== "live") return "This week isn't live.";
  if (input.today >= input.weekStart) return "This week has begun, so it can't be taken back to review here. Holding back one card is done on the Wonder Wall.";
  return null;
}

// --- What a guardian reads before tapping ---

export type ChildSummary = {
  passed: number;
  heldByChecks: number; // the card checks at build time
  heldByRulebook: number; // the family's settings, in code, before any checker read it
  heldByChecker: number;
  notChecked: number;
  missingFirst: { day: string; slot: string }[]; // a day-slot whose layer 1 is held back: that card is missing that day
  deeperHeldBack: number; // layers 2-4 held back where layer 1 is not: the child stops at the layer before
};

export function childSummary(cards: LiveCard[]): ChildSummary {
  const blocked = cards.filter((c) => c.policy === "blocked");
  const firsts = blocked.filter((c) => c.layer === 1);
  const key = (c: LiveCard) => `${c.day}|${c.slot}`;
  const missing = new Set(firsts.map(key));
  return {
    passed: cards.filter((c) => c.policy === "passed").length,
    heldByChecks: blocked.filter((c) => !c.policy_notes?.gate).length,
    heldByRulebook: blocked.filter((c) => c.policy_notes?.gate?.by === "code").length,
    heldByChecker: blocked.filter((c) => c.policy_notes?.gate?.by === "model").length,
    notChecked: cards.filter((c) => c.policy === "pending").length,
    missingFirst: [...missing].sort().map((k) => ({ day: k.split("|")[0], slot: k.split("|")[1] })),
    deeperHeldBack: blocked.filter((c) => c.layer > 1 && !missing.has(key(c))).length,
  };
}

// The safety floor's line: its version, and "still a first guess" while it is one (docs/04). Verdicts
// record the flag on their own, so the line also counts those reached while it was.
export function floorLine(cards: LiveCard[], floor: { version: number; firstGuess: boolean }): string {
  const early = cards.filter((c) => c.policy_notes?.gate?.floor_first_guess).length;
  const reached = early && !floor.firstGuess ? ` ${plural(early, "card was", "cards were")} checked while it was still a first guess.` : "";
  return `Safety floor version ${floor.version}${floor.firstGuess ? ", still a first guess" : ""}.${reached}`;
}

// The rulebook's line: all good, or how many verdicts are on an older one.
export function rulebookLine(cards: LiveCard[], currentHash: string | null): string {
  const gated = cards.filter((c) => c.policy_notes?.gate);
  const older = gated.filter((c) => c.policy_notes!.gate!.rulebook !== currentHash).length;
  if (older) return `${plural(older, "card was", "cards were")} checked against an older rulebook.`;
  const unchecked = cards.filter((c) => c.policy === "pending").length;
  return unchecked ? "The cards that were checked were checked against your rulebook as it is today." : "Every card was checked against your rulebook as it is today.";
}

// --- Words for dates and times, where the family lives ---

function parts(date: Date, timeZone: string, options: Intl.DateTimeFormatOptions) {
  return Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone, ...options }).formatToParts(date).map((p) => [p.type, p.value]));
}

// "Monday 26 October" from a YYYY-MM-DD.
export function longDay(date: string): string {
  const p = parts(new Date(`${date}T12:00:00Z`), "UTC", { weekday: "long", day: "numeric", month: "long" });
  return `${p.weekday} ${p.day} ${p.month}`;
}

// "7:12 pm" or, without minutes, "7 pm".
export function clockTime(iso: string, timeZone: string, minutes = true): string {
  const p = parts(new Date(iso), timeZone, { hour: "numeric", minute: "2-digit", hour12: true });
  return `${p.hour}${minutes ? `:${p.minute}` : ""} ${String(p.dayPeriod).toLowerCase()}`;
}

// "Sunday at 7:12 pm".
export function whenWords(iso: string, timeZone: string): string {
  const p = parts(new Date(iso), timeZone, { weekday: "long" });
  return `${p.weekday} at ${clockTime(iso, timeZone)}`;
}

// The status in place of the raw word.
export function statusWords(status: string, built: number, weekStart: string): string {
  if (status === "review") return "Ready for you to read";
  if (status === "live") return `Live from ${longDay(weekStart)}`;
  if (status === "generating") return `Being built: ${built} of ${DAYS_IN_WEEK} days`;
  return status === "done" ? "Finished" : "Planned";
}
