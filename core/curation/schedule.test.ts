import { describe, expect, it } from "vitest";
import { SLOT_ORDER, type DaySlot } from "../../lib/lenses";
import { weekSchedule, type Scheduled } from "./schedule";

// Egypt's order inside every week: then, wonder, look, listen, then, puzzle.
const EGYPT_SLOTS: DaySlot[] = ["then", "wonder", "look", "listen", "then", "puzzle"];
const thread: Scheduled[] = Array.from({ length: 24 }, (_, i) => ({ id: `egypt-${i + 1}`, slot: EGYPT_SLOTS[i % 6], title: `Egypt ${i + 1}` }));
const lessonsFor = (n: number): Scheduled[] => SLOT_ORDER.flatMap((slot) => Array.from({ length: n }, (_, i) => ({ id: `${slot}-${i + 1}`, slot, title: `${slot} ${i + 1}` })));

describe("weekSchedule", () => {
  it("puts the thread on its own slot one day at a time, and the next short lesson on each other slot", () => {
    const week = weekSchedule({ week: 1, thread, lessons: lessonsFor(10), used: new Set() });
    expect(week.map((d) => d.thread)).toEqual(["then", "wonder", "look", "listen", "then", "puzzle", "then"]);
    expect(week.map((d) => d.topics[d.thread!])).toEqual(["egypt-1", "egypt-2", "egypt-3", "egypt-4", "egypt-5", "egypt-6", "egypt-7"]);
    expect(week[0].topics).toEqual({ look: "look-1", wonder: "wonder-1", listen: "listen-1", then: "egypt-1", puzzle: "puzzle-1" });
    expect(week[1].topics).toEqual({ look: "look-2", wonder: "egypt-2", listen: "listen-2", then: "then-1", puzzle: "puzzle-2" });
  });

  it("meets every slot within a week, and uses 28 short lessons in it", () => {
    const week = weekSchedule({ week: 1, thread, lessons: lessonsFor(10), used: new Set() });
    expect(new Set(week.map((d) => d.thread))).toEqual(new Set(SLOT_ORDER));
    const short = week.flatMap((d) => SLOT_ORDER.filter((s) => s !== d.thread).map((s) => d.topics[s]));
    expect(short).toHaveLength(28);
    expect(new Set(short).size).toBe(28);
  });

  it("carries on the thread and skips lessons earlier weeks used", () => {
    const first = weekSchedule({ week: 1, thread, lessons: lessonsFor(20), used: new Set() });
    const used = new Set(first.flatMap((d) => Object.values(d.topics)).filter((id) => !id.startsWith("egypt")));
    const second = weekSchedule({ week: 2, thread, lessons: lessonsFor(20), used });
    expect(second[0].topics[second[0].thread!]).toBe("egypt-8");
    expect(second.flatMap((d) => Object.values(d.topics)).some((id) => used.has(id))).toBe(false);
  });

  it("keeps a week's own lessons on a rebuild, even when the library has changed", () => {
    const lessons = lessonsFor(10);
    const before = weekSchedule({ week: 1, thread, lessons, used: new Set() });
    const own = new Set(before.flatMap((d) => Object.values(d.topics)));
    const added = [{ id: "look-new", slot: "look" as const, title: "New" }, ...lessons];
    expect(weekSchedule({ week: 1, thread, lessons: added, used: new Set(), own })).toEqual(before);
  });

  it("gives all five slots to short lessons once the thread has run out", () => {
    const week = weekSchedule({ week: 4, thread, lessons: lessonsFor(10), used: new Set() });
    expect(week.map((d) => d.thread)).toEqual(["listen", "then", "puzzle", null, null, null, null]); // topics 22-24
    expect(Object.values(week[3].topics).every((id) => !id.startsWith("egypt"))).toBe(true);
  });

  it("stops before building anything when a slot runs out, naming every slot short", () => {
    const lessons = lessonsFor(6).filter((l) => !(l.slot === "look" && l.id !== "look-1"));
    expect(() => weekSchedule({ week: 1, thread, lessons, used: new Set(["puzzle-1"]) })).toThrow(
      "Not enough short lessons for week 1: the look card needs 6 and 1 is left; the puzzle card needs 6 and 5 are left. Add lessons to plan/short-lessons.yaml and run npm run plan:import.",
    );
  });

  it("fits the picked lessons into weeks 1 and 2 exactly, with the vote on Election Day", async () => {
    const { readFileSync } = await import("node:fs");
    const { join } = await import("node:path");
    const { parseLibrary } = await import("../../lib/plan");
    const lib = parseLibrary(readFileSync(join(__dirname, "..", "..", "plan", "short-lessons.yaml"), "utf8"));
    const lessons = lib.lessons.map((l) => ({ id: l.key, slot: l.slot, title: l.title }));
    const shortIn = (week: ReturnType<typeof weekSchedule>) => week.flatMap((d) => SLOT_ORDER.filter((s) => s !== d.thread).map((s) => d.topics[s]));

    const week1 = weekSchedule({ week: 1, thread, lessons, used: new Set() });
    expect(week1[0].topics).toEqual({ look: "great-wave", wonder: "leap-years", listen: "carnival-of-the-animals", then: "egypt-1", puzzle: "two-dice" });
    expect(week1[6].topics).toEqual({ look: "van-gogh-bedroom", wonder: "how-fossils-form", listen: "aloha-oe", then: "egypt-7", puzzle: "sunflower-spirals" });
    const used = new Set(shortIn(week1));
    expect(used).toEqual(new Set(lessons.slice(0, 28).map((l) => l.id)));

    // Week 2 (picked 1 Nov 2026) starts Monday 2 Nov, so day 2 is Tuesday 3 Nov, Election Day.
    const week2 = weekSchedule({ week: 2, thread, lessons, used });
    expect(week2[0].topics).toEqual({ look: "snap-the-whip", wonder: "egypt-8", listen: "carillon-twinkle", then: "tele-words", puzzle: "measuring-feet" });
    expect(week2[1].topics).toEqual({ look: "egypt-9", wonder: "why-ice-floats", listen: "steel-guitar", then: "duke-kahanamoku", puzzle: "how-a-vote-counts" });
    expect(week2[6].topics).toEqual({ look: "vermeer-light", wonder: "egypt-14", listen: "mountain-king", then: "louis-braille", puzzle: "flag-arrays" });
    expect(new Set(shortIn(week2))).toEqual(new Set(lessons.slice(28, 56).map((l) => l.id)));

    // Week 3 has nothing left, so a Sunday firing for it refuses before spending.
    const both = new Set([...used, ...shortIn(week2)]);
    expect(() => weekSchedule({ week: 3, thread, lessons, used: both })).toThrow(/Not enough short lessons for week 3/);
  });
});
