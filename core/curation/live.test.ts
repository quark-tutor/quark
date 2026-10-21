import { describe, expect, it } from "vitest";
import { backToReviewProblem, childSummary, clockTime, daysBuilt, floorLine, liveProblem, liveProblems, longDay, rulebookLine, statusWords, whenWords, type LiveCard, type LiveInput } from "./live";

// Invented children only.
const kids = ["pip", "wren"];
const days = ["2026-10-26", "2026-10-27", "2026-10-28", "2026-10-29", "2026-10-30", "2026-10-31", "2026-11-01"];
const SLOTS = ["look", "wonder", "listen", "then", "puzzle"];

const gate = (over: Partial<NonNullable<NonNullable<LiveCard["policy_notes"]>["gate"]>> = {}) => ({ by: "model" as const, rulebook: "h1", floor: 1, floor_first_guess: true, ...over });
const card = (over: Partial<LiveCard> = {}): LiveCard => ({ child_id: "pip", day: days[0], slot: "look", layer: 1, policy: "passed", policy_notes: { gate: gate() }, ...over });

// A whole week for both children: every day, every slot, four layers, all passed on rulebook h1 and floor 1.
const fullWeek = (): LiveCard[] =>
  kids.flatMap((child_id) => days.flatMap((day) => SLOTS.flatMap((slot) => [1, 2, 3, 4].map((layer) => card({ child_id, day, slot, layer })))));

const input = (over: Partial<LiveInput> = {}): LiveInput => ({ status: "review", cards: fullWeek(), childIds: kids, currentHash: "h1", savedHash: "h1", floorVersion: 1, ...over });

describe("when a week may be made live", () => {
  it("allows a week in review with seven days, every card checked on today's rulebook and floor", () => {
    expect(liveProblems(input())).toEqual([]);
    expect(liveProblem(input())).toBeNull();
  });

  it("allows it with cards held back: they simply aren't shown", () => {
    const cards = fullWeek();
    cards[0] = card({ policy: "blocked", policy_notes: { gate: gate({ by: "code" }) } });
    cards[1] = card({ layer: 2, policy: "blocked", policy_notes: { validation: ["hint 2 gives the answer away"] } });
    expect(liveProblems(input({ cards }))).toEqual([]);
  });

  it("refuses a week that is already live, still being built, or not ready", () => {
    expect(liveProblems(input({ status: "live" }))).toEqual(["This week is already live."]);
    const part = fullWeek().filter((c) => c.day <= days[4]);
    expect(liveProblems(input({ status: "generating", cards: part }))).toEqual(["This week is still being built: 5 of 7 days."]);
    expect(liveProblems(input({ status: "planned" }))).toEqual(["This week isn't ready to go live."]);
  });

  it("refuses a week in review that has fewer than seven days, for any child", () => {
    expect(liveProblems(input({ cards: fullWeek().filter((c) => c.day <= days[1]) }))).toEqual(["Only 2 of 7 days are built. This week can go live once all seven are."]);
    // One child with a day short is a week short.
    expect(daysBuilt(fullWeek().filter((c) => !(c.child_id === "wren" && c.day === days[6])), kids)).toBe(6);
    expect(daysBuilt(fullWeek().filter((c) => c.child_id === "pip"), kids)).toBe(0);
    expect(daysBuilt([], [])).toBe(0);
  });

  it("refuses while any card is pending, counting them", () => {
    const cards = fullWeek();
    cards[0] = card({ policy: "pending", policy_notes: null });
    cards[1] = card({ layer: 2, policy: "pending", policy_notes: null });
    cards[2] = card({ layer: 3, policy: "pending", policy_notes: null });
    expect(liveProblem(input({ cards }))).toBe("3 cards aren't checked yet. This week can go live once every card is checked. Whoever runs Quark can check them again.");
    cards.splice(1, 2);
    expect(liveProblem(input({ cards }))).toMatch(/^1 card isn't checked yet\./);
  });

  it("treats a card marked passed with no verdict behind it as unchecked", () => {
    const cards = fullWeek();
    cards[5] = card({ layer: 2, policy_notes: null });
    expect(liveProblem(input({ cards }))).toMatch(/^1 card isn't checked yet\./);
  });

  it("refuses verdicts reached under another rulebook, and says to save the rulebook first when it lags the answers", () => {
    const cards = fullWeek().map((c, i) => (i < 12 ? { ...c, policy_notes: { gate: gate({ rulebook: "h0" }) } } : c));
    expect(liveProblem(input({ cards }))).toBe(
      "12 cards were checked against an older rulebook and need checking again before this week can go live. Whoever runs Quark can check them again.",
    );
    // The guardians changed an answer and nobody has opened the rulebook page: the saved hash lags, so every verdict is old.
    const lagging = liveProblem(input({ currentHash: "h2", savedHash: "h1" }));
    expect(lagging).toMatch(/^280 cards were checked against an older rulebook/);
    expect(lagging).toContain("Open the rulebook page once first, so your latest answers are saved.");
  });

  it("refuses verdicts reached under an older safety floor, not counting the same card twice", () => {
    const cards = fullWeek().map((c, i) => (i < 3 ? { ...c, policy_notes: { gate: gate({ floor: 0 }) } } : c));
    expect(liveProblems(input({ cards }))).toEqual([
      "3 cards were checked against an older safety floor and need checking again before this week can go live. Whoever runs Quark can check them again.",
    ]);
    const both = fullWeek().map((c, i) => (i === 0 ? { ...c, policy_notes: { gate: gate({ rulebook: "h0", floor: 0 }) } } : c));
    expect(liveProblems(input({ cards: both }))).toHaveLength(1);
  });

  it("does not mind that the floor was a first guess when its version is today's", () => {
    expect(liveProblems(input({ cards: fullWeek().map((c) => ({ ...c, policy_notes: { gate: gate({ floor_first_guess: true }) } })) }))).toEqual([]);
  });

  it("gives every reason at once, in order", () => {
    const cards = fullWeek().filter((c) => c.day <= days[3]).map((c, i) => (i === 0 ? { ...c, policy: "pending", policy_notes: null } : i === 1 ? { ...c, policy_notes: { gate: gate({ rulebook: "h0" }) } } : c));
    const problems = liveProblems(input({ cards }));
    expect(problems.map((p) => p.split(" ")[0])).toEqual(["Only", "1", "1"]);
  });
});

describe("taking a live week back to review", () => {
  it("is allowed until the week's first day begins, where the family lives", () => {
    expect(backToReviewProblem({ status: "live", weekStart: "2026-10-26", today: "2026-10-25" })).toBeNull();
    expect(backToReviewProblem({ status: "live", weekStart: "2026-10-26", today: "2026-10-26" })).toMatch(/has begun/);
    expect(backToReviewProblem({ status: "live", weekStart: "2026-10-26", today: "2026-11-02" })).toMatch(/Wonder Wall/);
  });

  it("is only for a week that is live", () => {
    expect(backToReviewProblem({ status: "review", weekStart: "2026-10-26", today: "2026-10-25" })).toBe("This week isn't live.");
  });
});

describe("what a guardian reads before tapping", () => {
  it("counts a child's cards by who held them back, names the first cards that are missing, and counts the deeper layers", () => {
    const cards: LiveCard[] = [
      card({ day: days[1], slot: "look", layer: 1, policy: "blocked", policy_notes: { gate: gate({ by: "code" }) } }),
      card({ day: days[1], slot: "look", layer: 2, policy: "blocked", policy_notes: { gate: gate({ by: "code" }) } }), // the whole slot is missing: not "deeper"
      card({ day: days[2], slot: "wonder", layer: 3, policy: "blocked", policy_notes: { gate: gate({ by: "model" }) } }),
      card({ day: days[3], slot: "then", layer: 4, policy: "blocked", policy_notes: { validation: ["no picture described"] } }),
      card({ day: days[4], slot: "puzzle", layer: 1, policy: "pending", policy_notes: null }),
      card({ day: days[4], slot: "puzzle", layer: 2 }),
    ];
    expect(childSummary(cards)).toEqual({
      passed: 1,
      heldByChecks: 1,
      heldByRulebook: 2,
      heldByChecker: 1,
      notChecked: 1,
      missingFirst: [{ day: days[1], slot: "look" }],
      deeperHeldBack: 2,
    });
  });

  it("states the safety floor, and counts verdicts reached while it was a first guess once it no longer is", () => {
    const cards = fullWeek().slice(0, 38);
    expect(floorLine(cards, { version: 1, firstGuess: true })).toBe("Safety floor version 1, still a first guess.");
    expect(floorLine(cards, { version: 1, firstGuess: false })).toBe("Safety floor version 1. 38 cards were checked while it was still a first guess.");
    expect(floorLine([card({ policy_notes: { gate: gate({ floor_first_guess: false }) } })], { version: 1, firstGuess: false })).toBe("Safety floor version 1.");
  });

  it("states the rulebook", () => {
    expect(rulebookLine(fullWeek(), "h1")).toBe("Every card was checked against your rulebook as it is today.");
    expect(rulebookLine(fullWeek().slice(0, 12), "h2")).toBe("12 cards were checked against an older rulebook.");
    expect(rulebookLine([card(), card({ policy: "pending", policy_notes: null })], "h1")).toMatch(/^The cards that were checked were checked/);
  });
});

describe("words for dates, times and status", () => {
  it("writes a date and a time the way a person says them, in the family's timezone", () => {
    expect(longDay("2026-10-26")).toBe("Monday 26 October");
    expect(clockTime("2026-10-26T05:12:00Z", "Pacific/Honolulu")).toBe("7:12 pm");
    expect(clockTime("2026-10-25T16:04:00Z", "Pacific/Honolulu", false)).toBe("6 am");
    expect(whenWords("2026-10-26T05:12:00Z", "Pacific/Honolulu")).toBe("Sunday at 7:12 pm");
  });

  it("puts the status in plain words", () => {
    expect(statusWords("review", 7, "2026-10-26")).toBe("Ready for you to read");
    expect(statusWords("live", 7, "2026-10-26")).toBe("Live from Monday 26 October");
    expect(statusWords("generating", 5, "2026-10-26")).toBe("Being built: 5 of 7 days");
  });
});
