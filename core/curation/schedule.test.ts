import { describe, expect, it } from "vitest";
import { SLOT_ORDER, type DaySlot } from "../../lib/lenses";
import { MATH_FROM_WEEK, stretchForWeek, weekSchedule, weekThread, type DayPlan, type Scheduled } from "./schedule";

const idsOf = (d: DayPlan): string[] => Object.values(d.topics).filter((id): id is string => id !== null);

// Egypt's order inside every week: then, wonder, look, listen, then, puzzle.
const EGYPT_SLOTS: DaySlot[] = ["then", "wonder", "look", "listen", "then", "puzzle"];
const thread: Scheduled[] = Array.from({ length: 24 }, (_, i) => ({ id: `egypt-${i + 1}`, slot: EGYPT_SLOTS[i % 6], title: `Egypt ${i + 1}` }));
const lessonsFor = (n: number): Scheduled[] => SLOT_ORDER.flatMap((slot) => Array.from({ length: n }, (_, i) => ({ id: `${slot}-${i + 1}`, slot, title: `${slot} ${i + 1}` })));
// Egypt is sequence 1, so its week N is the family's week N (stretchForWeek, below).
const egypt = (week: number) => weekThread(thread, week);
// A theme: one week of seven topics, on look, wonder, then, listen, look, then, puzzle (plan/candidates/themes.md).
const THEME_SLOTS: DaySlot[] = ["look", "wonder", "then", "listen", "look", "then", "puzzle"];
const theme = (name: string): Scheduled[] => THEME_SLOTS.map((slot, i) => ({ id: `${name}-${i + 1}`, slot, title: `${name} ${i + 1}` }));

describe("weekSchedule", () => {
  it("puts the thread on its own slot one day at a time, and the next short lesson on each other slot", () => {
    const week = weekSchedule({ week: 1, thread: egypt(1), lessons: lessonsFor(10), used: new Set() });
    expect(week.map((d) => d.thread)).toEqual(["then", "wonder", "look", "listen", "then", "puzzle", "then"]);
    expect(week.map((d) => d.topics[d.thread!])).toEqual(["egypt-1", "egypt-2", "egypt-3", "egypt-4", "egypt-5", "egypt-6", "egypt-7"]);
    expect(week[0].topics).toEqual({ look: "look-1", wonder: "wonder-1", listen: "listen-1", then: "egypt-1", puzzle: "puzzle-1" });
    expect(week[1].topics).toEqual({ look: "look-2", wonder: "egypt-2", listen: "listen-2", then: "then-1", puzzle: "puzzle-2" });
  });

  it("meets every slot within a week, and uses 28 short lessons in it", () => {
    const week = weekSchedule({ week: 1, thread: egypt(1), lessons: lessonsFor(10), used: new Set() });
    expect(new Set(week.map((d) => d.thread))).toEqual(new Set(SLOT_ORDER));
    const short = week.flatMap((d) => SLOT_ORDER.filter((s) => s !== d.thread).map((s) => d.topics[s]!));
    expect(short).toHaveLength(28);
    expect(new Set(short).size).toBe(28);
  });

  it("carries on the thread and skips lessons earlier weeks used", () => {
    const first = weekSchedule({ week: 1, thread: egypt(1), lessons: lessonsFor(20), used: new Set() });
    const used = new Set(first.flatMap((d) => idsOf(d)).filter((id) => !id.startsWith("egypt")));
    const second = weekSchedule({ week: 2, thread: egypt(2), lessons: lessonsFor(20), used });
    expect(second[0].topics[second[0].thread!]).toBe("egypt-8");
    expect(second.flatMap((d) => idsOf(d)).some((id) => used.has(id))).toBe(false);
  });

  it("keeps a week's own lessons on a rebuild, even when the library has changed", () => {
    const lessons = lessonsFor(10);
    const before = weekSchedule({ week: 1, thread: egypt(1), lessons, used: new Set() });
    const own = new Set(before.flatMap((d) => idsOf(d)));
    const added = [{ id: "look-new", slot: "look" as const, title: "New" }, ...lessons];
    expect(weekSchedule({ week: 1, thread: egypt(1), lessons: added, used: new Set(), own })).toEqual(before);
  });

  it("gives all five slots to short lessons once the thread has run out", () => {
    const week = weekSchedule({ week: 4, thread: egypt(4), lessons: lessonsFor(10), used: new Set() });
    expect(week.map((d) => d.thread)).toEqual(["listen", "then", "puzzle", null, null, null, null]); // topics 22-24
    expect(idsOf(week[3]).every((id) => !id.startsWith("egypt"))).toBe(true);
  });

  it("runs a theme's seven topics from its day 1, one a day on its own slots, beside 28 short lessons", () => {
    const week = weekSchedule({ week: 5, thread: theme("moon"), lessons: lessonsFor(10), used: new Set() });
    expect(week.map((d) => d.thread)).toEqual(THEME_SLOTS);
    expect(week.map((d) => d.topics[d.thread!])).toEqual(["moon-1", "moon-2", "moon-3", "moon-4", "moon-5", "moon-6", "moon-7"]);
    const short = week.flatMap((d) => SLOT_ORDER.filter((s) => s !== d.thread).map((s) => d.topics[s]!));
    expect(short).toHaveLength(28);
    // look 5, wonder 6, listen 6, then 5, puzzle 6
    expect(SLOT_ORDER.map((s) => short.filter((id) => id.startsWith(`${s}-`)).length)).toEqual([5, 6, 6, 5, 6]);
  });

  it("from week 6 gives the puzzle slot to the Math tile: no lesson and no topic there, and 21 short lessons beside a theme", () => {
    expect(MATH_FROM_WEEK).toBe(6);
    const four = theme("reef").map((t) => (t.slot === "puzzle" ? { ...t, slot: "wonder" as DaySlot } : t));
    const week = weekSchedule({ week: 6, thread: four, lessons: lessonsFor(10), used: new Set() });
    expect(week.every((d) => d.math && d.topics.puzzle === null)).toBe(true);
    const short = week.flatMap((d) => SLOT_ORDER.filter((s) => s !== d.thread && s !== "puzzle").map((s) => d.topics[s]!));
    expect(short).toHaveLength(21);
    expect(short.some((id) => id.startsWith("puzzle"))).toBe(false);
    // Week 5 keeps its puzzle lessons, and a test week can ask for math by hand.
    expect(weekSchedule({ week: 5, thread: theme("moon"), lessons: lessonsFor(10), used: new Set() }).every((d) => !d.math && d.topics.puzzle)).toBe(true);
    expect(weekSchedule({ week: 5, thread: four, lessons: lessonsFor(10), used: new Set(), math: true }).every((d) => d.topics.puzzle === null)).toBe(true);
  });

  it("refuses a math week whose theme still has a puzzle day, before anything is spent", () => {
    expect(() => weekSchedule({ week: 6, thread: theme("reef"), lessons: lessonsFor(10), used: new Set() })).toThrow(
      'Week 6 has the Math tile, but its theme puts "reef 7" on the puzzle slot. A theme from week 6 on puts its topics on look, wonder, listen and then: fix its file under plan/ and run npm run plan:import.',
    );
  });

  it("starts math on the first theme of sequence 3, as lib/plan.ts says, given the plan's own files", async () => {
    const { readFileSync, readdirSync } = await import("node:fs");
    const { join } = await import("node:path");
    const { parsePlan, MATH_FROM_SEQUENCE } = await import("../../lib/plan");
    const dir = join(__dirname, "..", "..", "plan");
    const spans = readdirSync(dir)
      .filter((f) => f.endsWith(".yaml") && f !== "short-lessons.yaml" && f !== "math-ladder.yaml")
      .map((f) => parsePlan(readFileSync(join(dir, f), "utf8")))
      .map((p) => ({ stretch: p.stretch, sequence: p.sequence, topics: p.weeks.reduce((n, w) => n + w.topics.length, 0) }));
    const next = [...spans, { stretch: "next-theme", sequence: spans.length + 1, topics: 7 }];
    for (let s = spans.length + 2; s <= MATH_FROM_SEQUENCE; s++) next.push({ stretch: `theme-${s}`, sequence: s, topics: 7 });
    const first = next.find((s) => s.sequence === MATH_FROM_SEQUENCE)!;
    expect(stretchForWeek(next, MATH_FROM_WEEK)).toEqual({ stretch: first.stretch, weekInStretch: 1 });
    expect(stretchForWeek(next, MATH_FROM_WEEK - 1).stretch).not.toBe(first.stretch);
  });

  it("stops before building anything when a slot runs out, naming every slot short", () => {
    const lessons = lessonsFor(6).filter((l) => !(l.slot === "look" && l.id !== "look-1"));
    expect(() => weekSchedule({ week: 1, thread: egypt(1), lessons, used: new Set(["puzzle-1"]) })).toThrow(
      "Not enough short lessons for week 1: the look card needs 6 and 1 is left; the puzzle card needs 6 and 5 are left. Add lessons to plan/short-lessons.yaml and run npm run plan:import.",
    );
  });

  it("fits the picked lessons into weeks 1, 2 and 3 exactly, with the vote on Election Day and Nellie Bly on her day", async () => {
    const { readFileSync } = await import("node:fs");
    const { join } = await import("node:path");
    const { parseLibrary } = await import("../../lib/plan");
    const lib = parseLibrary(readFileSync(join(__dirname, "..", "..", "plan", "short-lessons.yaml"), "utf8"));
    const lessons = lib.lessons.map((l) => ({ id: l.key, slot: l.slot, title: l.title }));
    const shortIn = (week: ReturnType<typeof weekSchedule>) => week.flatMap((d) => SLOT_ORDER.filter((s) => s !== d.thread).map((s) => d.topics[s]!));

    const week1 = weekSchedule({ week: 1, thread: egypt(1), lessons, used: new Set() });
    expect(week1[0].topics).toEqual({ look: "great-wave", wonder: "leap-years", listen: "carnival-of-the-animals", then: "egypt-1", puzzle: "two-dice" });
    expect(week1[6].topics).toEqual({ look: "van-gogh-bedroom", wonder: "how-fossils-form", listen: "aloha-oe", then: "egypt-7", puzzle: "sunflower-spirals" });
    const used = new Set(shortIn(week1));
    expect(used).toEqual(new Set(lessons.slice(0, 28).map((l) => l.id)));

    // Week 2 (picked 1 Nov 2026) starts Monday 2 Nov, so day 2 is Tuesday 3 Nov, Election Day.
    const week2 = weekSchedule({ week: 2, thread: egypt(2), lessons, used });
    expect(week2[0].topics).toEqual({ look: "snap-the-whip", wonder: "egypt-8", listen: "carillon-twinkle", then: "tele-words", puzzle: "measuring-feet" });
    expect(week2[1].topics).toEqual({ look: "egypt-9", wonder: "why-ice-floats", listen: "steel-guitar", then: "duke-kahanamoku", puzzle: "how-a-vote-counts" });
    expect(week2[6].topics).toEqual({ look: "vermeer-light", wonder: "egypt-14", listen: "mountain-king", then: "louis-braille", puzzle: "flag-arrays" });
    expect(new Set(shortIn(week2))).toEqual(new Set(lessons.slice(28, 56).map((l) => l.id)));

    // Week 3 (picked 7 Nov 2026) starts Monday 9 Nov: Nellie Bly on day 6, Saturday 14 Nov, the day she set off in 1889,
    // and Brahms on day 3 in the place of Taps, which live's settings hold back for both boys (point 20, until age 10).
    const both = new Set([...used, ...shortIn(week2)]);
    const week3 = weekSchedule({ week: 3, thread: egypt(3), lessons, used: both });
    expect(week3[0].topics).toEqual({ look: "egypt-15", wonder: "kolea-migration", listen: "metronome-tempo", then: "movable-type", puzzle: "estimate-a-flock" });
    expect(week3[2].topics).toEqual({ look: "escaping-criticism", wonder: "countershading", listen: "brahms-lullaby", then: "egypt-17", puzzle: "mauna-kea-sea-level" });
    expect(week3[5].topics).toEqual({ look: "puuloa-petroglyphs", wonder: "egypt-20", listen: "pipe-organ", then: "nellie-bly", puzzle: "oahu-map-scale" });
    expect(week3[6].topics).toEqual({ look: "egypt-21", wonder: "autumn-leaves", listen: "st-louis-blues", then: "crow-and-pitcher", puzzle: "base-sixty" });
    expect(new Set(shortIn(week3))).toEqual(new Set(lessons.slice(56, 84).map((l) => l.id)));

    // Week 4 has nothing left, so a Sunday firing for it refuses before spending. Egypt's last three topics take days 1-3,
    // so days 4-7 take five short lessons each: look 7, wonder 7, listen 6, then 6, puzzle 6.
    const three = new Set([...both, ...shortIn(week3)]);
    expect(() => weekSchedule({ week: 4, thread: egypt(4), lessons, used: three })).toThrow(
      "Not enough short lessons for week 4: the look card needs 7 and 0 are left; the wonder card needs 7 and 0 are left; the listen card needs 6 and 0 are left; the then card needs 6 and 0 are left; the puzzle card needs 6 and 0 are left.",
    );
  });
});

describe("stretchForWeek", () => {
  const EGYPT = { stretch: "ancient-egypt", sequence: 1, topics: 24 };
  const MOON = { stretch: "the-moon", sequence: 2, topics: 7 };

  it("gives Egypt weeks 1 to 4, as before, and Egypt's own week is the family's week", () => {
    for (const week of [1, 2, 3, 4]) expect(stretchForWeek([EGYPT, MOON], week)).toEqual({ stretch: "ancient-egypt", weekInStretch: week });
    expect(egypt(4).map((t) => t.id)).toEqual(["egypt-22", "egypt-23", "egypt-24"]);
  });

  it("gives week 5 to sequence 2 from its own day 1, whatever order the stretches come in", () => {
    expect(stretchForWeek([MOON, EGYPT], 5)).toEqual({ stretch: "the-moon", weekInStretch: 1 });
    expect(stretchForWeek([EGYPT, MOON, { stretch: "antarctica", sequence: 3, topics: 7 }], 6)).toEqual({ stretch: "antarctica", weekInStretch: 1 });
  });

  it("refuses a week no stretch holds, naming the file to write", () => {
    expect(() => stretchForWeek([EGYPT, MOON], 6)).toThrow(
      "No theme for week 6: the plan's stretches reach week 5. Write plan/<theme>.yaml with sequence: 3 (one week: seven topics), then run npm run plan:import.",
    );
    expect(() => stretchForWeek([EGYPT], 7)).toThrow(
      "No theme for week 7: the plan's stretches reach week 4. Write plan/<theme>.yaml with sequence: 4 (one week: seven topics), after themes for weeks 5 to 6, then run npm run plan:import.",
    );
  });

  it("refuses a gap or two stretches with one sequence, before anything is spent", () => {
    expect(() => stretchForWeek([EGYPT, { ...MOON, sequence: 3 }], 5)).toThrow(
      "The plan's stretches are out of order: no stretch has sequence 2; the sequence runs 1, 2, 3... with no gap. Fix the files under plan/ and run npm run plan:import.",
    );
    expect(() => stretchForWeek([EGYPT, MOON, { stretch: "antarctica", sequence: 2, topics: 7 }], 2)).toThrow(
      "The plan's stretches are out of order: the-moon and antarctica have the same sequence, 2; each stretch needs its own.",
    );
  });
});
