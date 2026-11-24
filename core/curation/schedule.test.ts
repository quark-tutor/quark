import { describe, expect, it } from "vitest";
import { SLOT_ORDER, type DaySlot } from "../../lib/lenses";
import { ALL_SLOTS, gapsText, scheduleGaps, stretchForWeek, weekSchedule, weekSlots, weekThread, WITHOUT_PUZZLE, type DayPlan, type Scheduled } from "./schedule";

// Egypt's order inside every week: then, wonder, look, listen, then, puzzle.
const EGYPT_SLOTS: DaySlot[] = ["then", "wonder", "look", "listen", "then", "puzzle"];
const thread: Scheduled[] = Array.from({ length: 24 }, (_, i) => ({ id: `egypt-${i + 1}`, slot: EGYPT_SLOTS[i % 6], title: `Egypt ${i + 1}` }));
const lessonsFor = (n: number): Scheduled[] => SLOT_ORDER.flatMap((slot) => Array.from({ length: n }, (_, i) => ({ id: `${slot}-${i + 1}`, slot, title: `${slot} ${i + 1}` })));
// Egypt is sequence 1, so its week N is the family's week N (stretchForWeek, below).
const egypt = (week: number) => weekThread(thread, week);
// A theme: one week of seven topics, on look, wonder, then, listen, look, then, puzzle (plan/candidates/themes.md).
const THEME_SLOTS: DaySlot[] = ["look", "wonder", "then", "listen", "look", "then", "puzzle"];
const theme = (name: string): Scheduled[] => THEME_SLOTS.map((slot, i) => ({ id: `${name}-${i + 1}`, slot, title: `${name} ${i + 1}` }));
// Every topic id a day holds.
const ids = (d: DayPlan) => Object.values(d.topics) as string[];

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
    const short = week.flatMap((d) => SLOT_ORDER.filter((s) => s !== d.thread).map((s) => d.topics[s]));
    expect(short).toHaveLength(28);
    expect(new Set(short).size).toBe(28);
  });

  it("carries on the thread and skips lessons earlier weeks used", () => {
    const first = weekSchedule({ week: 1, thread: egypt(1), lessons: lessonsFor(20), used: new Set() });
    const used = new Set(first.flatMap(ids).filter((id) => !id.startsWith("egypt")));
    const second = weekSchedule({ week: 2, thread: egypt(2), lessons: lessonsFor(20), used });
    expect(second[0].topics[second[0].thread!]).toBe("egypt-8");
    expect(second.flatMap(ids).some((id) => used.has(id))).toBe(false);
  });

  it("keeps a week's own lessons on a rebuild, even when the library has changed", () => {
    const lessons = lessonsFor(10);
    const before = weekSchedule({ week: 1, thread: egypt(1), lessons, used: new Set() });
    const own = new Set(before.flatMap(ids));
    const added = [{ id: "look-new", slot: "look" as const, title: "New" }, ...lessons];
    expect(weekSchedule({ week: 1, thread: egypt(1), lessons: added, used: new Set(), own })).toEqual(before);
  });

  it("gives all five slots to short lessons once the thread has run out", () => {
    const week = weekSchedule({ week: 4, thread: egypt(4), lessons: lessonsFor(10), used: new Set() });
    expect(week.map((d) => d.thread)).toEqual(["listen", "then", "puzzle", null, null, null, null]); // topics 22-24
    expect(ids(week[3]).every((id) => !id.startsWith("egypt"))).toBe(true);
  });

  it("runs a theme's seven topics from its day 1, one a day on its own slots, beside 28 short lessons", () => {
    const week = weekSchedule({ week: 5, thread: theme("moon"), lessons: lessonsFor(10), used: new Set() });
    expect(week.map((d) => d.thread)).toEqual(THEME_SLOTS);
    expect(week.map((d) => d.topics[d.thread!])).toEqual(["moon-1", "moon-2", "moon-3", "moon-4", "moon-5", "moon-6", "moon-7"]);
    const short = week.flatMap((d) => SLOT_ORDER.filter((s) => s !== d.thread).map((s) => d.topics[s]));
    expect(short).toHaveLength(28);
    // look 5, wonder 6, listen 6, then 5, puzzle 6
    expect(SLOT_ORDER.map((s) => short.filter((id) => id?.startsWith(`${s}-`)).length)).toEqual([5, 6, 6, 5, 6]);
  });

  it("leaves a slot's later days open when it runs out, and names them, rather than refusing the week (23 Nov 2026)", () => {
    const lessons = lessonsFor(6).filter((l) => !(l.slot === "look" && l.id !== "look-1"));
    const week = weekSchedule({ week: 1, thread: egypt(1), lessons, used: new Set(["puzzle-1"]) });
    expect(week[0].topics).toEqual({ look: "look-1", wonder: "wonder-1", listen: "listen-1", then: "egypt-1", puzzle: "puzzle-2" });
    const gaps = scheduleGaps(week, ALL_SLOTS);
    // look: day 1 has look-1, day 3 is Egypt's, so days 2, 4, 5, 6 and 7 are open; puzzle: day 6 is Egypt's, so day 7 is.
    expect(gaps).toEqual([
      { day: 2, slot: "look" },
      { day: 4, slot: "look" },
      { day: 5, slot: "look" },
      { day: 6, slot: "look" },
      { day: 7, slot: "look" },
      { day: 7, slot: "puzzle" },
    ]);
    expect(gapsText(1, gaps)).toBe(
      "Not enough short lessons for week 1: the look card needs 5 more; the puzzle card needs 1 more. The app writes them (npm run cron:lessons), or add lessons to plan/short-lessons.yaml and run npm run plan:import.",
    );
  });

  it("builds short lessons alone on every tile for a week no theme holds, and four tiles while the boat is here (23 Nov 2026)", () => {
    const five = weekSchedule({ week: 6, thread: [], lessons: lessonsFor(7), used: new Set() });
    expect(five.every((d) => d.thread === null && ids(d).length === 5)).toBe(true);
    expect(five[6].topics).toEqual({ look: "look-7", wonder: "wonder-7", listen: "listen-7", then: "then-7", puzzle: "puzzle-7" });
    const four = weekSchedule({ week: 6, thread: [], lessons: lessonsFor(7), used: new Set(), slots: WITHOUT_PUZZLE });
    expect(four.flatMap(ids)).toHaveLength(28);
    expect(four[0].topics).toEqual({ look: "look-1", wonder: "wonder-1", listen: "listen-1", then: "then-1" });
    expect(scheduleGaps(four, WITHOUT_PUZZLE)).toEqual([]);
  });

  it("leaves a theme's puzzle topic out while the boat is here, and fills that day's four tiles with lessons", () => {
    const week = weekSchedule({ week: 5, thread: theme("moon"), lessons: lessonsFor(10), used: new Set(), slots: WITHOUT_PUZZLE });
    expect(week.map((d) => d.thread)).toEqual(["look", "wonder", "then", "listen", "look", "then", null]);
    expect(week[6].topics).toEqual({ look: "look-5", wonder: "wonder-6", listen: "listen-6", then: "then-5" });
    expect(week.flatMap(ids)).not.toContain("moon-7");
  });

  it("fits the picked lessons into weeks 1 to 5 exactly, with the vote, Nellie Bly, time zones, the phonograph and Thanksgiving on their days", async () => {
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

    // Week 4 (picked 16 Nov 2026, built by hand that day) starts Monday 16 Nov, King Kalākaua's birthday: ʻIolani's
    // lights on day 1, time zones on day 3 (18 Nov, the day of two noons), the phonograph on day 6 (21 Nov). Egypt's last
    // three topics take days 1-3, so days 4-7 take five short lessons each: look 7, wonder 7, listen 6, then 6, puzzle 6.
    const three = new Set([...both, ...shortIn(week3)]);
    const week4 = weekSchedule({ week: 4, thread: egypt(4), lessons, used: three });
    expect(week4[0].topics).toEqual({ look: "volcano-school", wonder: "saturn-rings", listen: "egypt-22", then: "iolani-lights", puzzle: "konigsberg-bridges" });
    expect(week4[2].topics).toEqual({ look: "rabbit-duck", wonder: "water-cycle", listen: "rhapsody-in-blue", then: "time-zones", puzzle: "egypt-24" });
    expect(week4[3].topics).toEqual({ look: "roman-mosaic", wonder: "seeds-to-hawaii", listen: "string-quartet", then: "haiku", puzzle: "quarter-past" });
    expect(week4[5].topics).toEqual({ look: "monet-impression", wonder: "hee-octopus", listen: "phonograph", then: "sour-grapes", puzzle: "fahrenheit" });
    expect(week4[6].topics).toEqual({ look: "copley-paul-revere", wonder: "solar-eclipse", listen: "morning-mood", then: "banneker-almanac", puzzle: "wheel-circumference" });
    expect(new Set(shortIn(week4))).toEqual(new Set(lessons.slice(84, 116).map((l) => l.id)));

    // Week 5 (picked 23 Nov 2026, built by hand that day) starts Monday 23 Nov: the Moon on look, wonder, then, listen,
    // look, then, puzzle, beside 28 short lessons (look 5, wonder 6, listen 6, then 5, puzzle 6). Sarah Josepha Hale's
    // Thanksgiving on day 4 (26 Nov, Thanksgiving), the flag of Hawaiʻi on day 7 (29 Nov, the day after Lā Kūʻokoʻa).
    const four = new Set([...three, ...shortIn(week4)]);
    const week5 = weekSchedule({ week: 5, thread: theme("moon"), lessons, used: four });
    expect(week5.map((d) => d.topics)).toEqual([
      { look: "moon-1", wonder: "tides", listen: "mozart-variations", then: "acronym", puzzle: "roman-numerals" },
      { look: "little-nemo", wonder: "moon-2", listen: "pedal-harp", then: "latitude", puzzle: "truss-triangles" },
      { look: "rousseau-jungle", wonder: "archimedes-lever", listen: "banjo", then: "moon-3", puzzle: "magic-square" },
      { look: "ruysch-flowers", wonder: "harvey-circulation", listen: "moon-4", then: "hale-thanksgiving", puzzle: "cube-net" },
      { look: "moon-5", wonder: "bioluminescence", listen: "nutcracker-ballet", then: "sequoyah", puzzle: "mobius-strip" },
      { look: "unicorn-tapestry", wonder: "muybridge-horse", listen: "fur-elise", then: "moon-6", puzzle: "nested-weights" },
      { look: "sargent-plein-air", wonder: "compass-north", listen: "five-beats", then: "hawaii-flag", puzzle: "moon-7" },
    ]);
    expect(new Set(shortIn(week5))).toEqual(new Set(lessons.slice(116, 144).map((l) => l.id)));

    // Week 6 has no theme and nothing left in the file: with the boat here, every one of its 28 day-slots is open, for
    // the app's own writer (docs/week-without-hands-slice.md).
    const five = new Set([...four, ...shortIn(week5)]);
    const week6 = weekSchedule({ week: 6, thread: [], lessons, used: five, slots: WITHOUT_PUZZLE });
    expect(scheduleGaps(week6, WITHOUT_PUZZLE)).toHaveLength(28);
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

  it("finds no stretch for a week none holds, which is then short lessons alone (23 Nov 2026)", () => {
    expect(stretchForWeek([EGYPT, MOON], 6)).toBeNull();
    expect(stretchForWeek([EGYPT], 7)).toBeNull();
  });

  it("gives a theme that names its week that week, after weeks with no theme (Brandon, 23 Nov 2026, at go)", () => {
    const later = { stretch: "volcanoes", sequence: 3, topics: 7, named: 8 };
    expect(stretchForWeek([EGYPT, MOON, later], 8)).toEqual({ stretch: "volcanoes", weekInStretch: 1 });
    for (const week of [6, 7, 9]) expect(stretchForWeek([EGYPT, MOON, later], week)).toBeNull();
    expect(stretchForWeek([EGYPT, MOON, later], 5)).toEqual({ stretch: "the-moon", weekInStretch: 1 }); // the Moon, counted, as before
    // A theme counted on after a named one starts the week after it.
    expect(stretchForWeek([EGYPT, MOON, later, { stretch: "rivers", sequence: 4, topics: 7 }], 9)).toEqual({ stretch: "rivers", weekInStretch: 1 });
  });

  it("refuses a theme naming a week the stretches before it already hold", () => {
    expect(() => stretchForWeek([EGYPT, MOON, { stretch: "volcanoes", sequence: 3, topics: 7, named: 5 }], 6)).toThrow(
      "The plan's stretches are out of order: volcanoes names week 5, but the stretches before it reach week 5; a theme names a later week. Fix the files under plan/ and run npm run plan:import.",
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

describe("weekSlots", () => {
  const day = (slots: readonly string[], each = 4) => new Map(slots.map((s) => [s, each])) as Map<(typeof ALL_SLOTS)[number], number>;
  it("is all five, or four while the boat is here, for a week with no day yet", () => {
    expect(weekSlots(new Map(), false)).toEqual(ALL_SLOTS);
    expect(weekSlots(new Map(), true)).toEqual(WITHOUT_PUZZLE);
  });
  it("keeps the tiles of the week's earliest whole day, whatever the boat says now", () => {
    expect(weekSlots(new Map([[1, day(WITHOUT_PUZZLE)]]), false)).toEqual(WITHOUT_PUZZLE);
    expect(weekSlots(new Map([[1, day(ALL_SLOTS)]]), true)).toEqual(ALL_SLOTS);
  });
  it("does not read a half-built day, which is cleared and built again", () => {
    expect(weekSlots(new Map([[1, day(["look", "wonder", "listen"])]]), false)).toEqual(ALL_SLOTS);
    expect(weekSlots(new Map([[1, day(ALL_SLOTS, 2)]]), true)).toEqual(WITHOUT_PUZZLE);
  });
});
