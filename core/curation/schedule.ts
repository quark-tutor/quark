import { SLOT_ORDER, type DaySlot } from "../../lib/lenses.ts";
import { stretchWeeks, type StretchSpan } from "../../lib/plan.ts";

// How a week is mixed (docs/04, decided 16 Oct 2026): one slot a day carries the running thread
// and the other slots carry short lessons. Pure, so the same plan and the same earlier weeks always
// give the same week.
//
// - The week's thread comes from the stretch that holds the week (stretchForWeek, below): its topics
//   run one a day, in order, on the slot each was written for, from day 1. A week no stretch holds has
//   no thread, and every tile takes short lessons (23 Nov 2026).
// - Each other slot takes the next short lesson written for it, in the library's order, that no
//   earlier week has used. A rebuild keeps the week's own lessons: they come first.
// - The week's tiles are all five, or the four without Puzzle while the trading boat holds Puzzle's place
//   (23 Nov 2026; weekSlots, below). A thread topic written for a tile the week does not build is not built.
// - When a slot runs out of lessons, its day-slots are left empty and named (scheduleGaps): the app's
//   writer fills them (core/curation/lessons.ts), and a build refuses a day that still has one, before it
//   spends anything. *Replaces* "nothing is built" (16 Oct 2026).
// The whole week is scheduled even when fewer days are built, so a later rebuild matches.

export type Scheduled = { id: string; slot: DaySlot; title: string };

export type DayPlan = {
  day: number;
  thread: DaySlot | null; // the slot the thread takes today, or null on a day with none
  topics: Partial<Record<DaySlot, string>>; // a topic id per slot built; a slot with no lesson left is missing
};

export type ScheduleInput = {
  week: number; // the family's week in the plan, from 1
  thread: Scheduled[]; // this week's thread topics in order, from day 1: at most seven (weekThread); [] for none
  lessons: Scheduled[]; // the library in order
  used: Set<string>; // lessons earlier weeks used
  own?: Set<string>; // lessons this week already has
  slots?: readonly DaySlot[]; // the tiles the week builds; all five unless the boat holds Puzzle's place
};

export const DAYS_IN_WEEK = 7;
export const LAYERS = 4;

// The tiles a week builds: all five, or the four without Puzzle while the trading boat is here (Brandon, 23
// Nov 2026: no Puzzle cards while the boat is here).
export const ALL_SLOTS: readonly DaySlot[] = SLOT_ORDER;
export const WITHOUT_PUZZLE: readonly DaySlot[] = SLOT_ORDER.filter((s) => s !== "puzzle");

// A week keeps the tiles it started with, so a change of tables on a Sunday cannot mix them: the tiles of
// its earliest whole day (four layers on each of all five slots, or on each of the four without Puzzle), and
// with none yet, Puzzle's place as the boat has it now. `ideas` is the theme's ideas per day, per slot.
export function weekSlots(ideas: Map<number, Map<DaySlot, number>>, boatHere: boolean): readonly DaySlot[] {
  for (const day of [...ideas.keys()].sort((a, b) => a - b)) {
    const bySlot = ideas.get(day)!;
    for (const set of [ALL_SLOTS, WITHOUT_PUZZLE]) {
      if (bySlot.size === set.length && set.every((s) => bySlot.get(s) === LAYERS)) return set;
    }
  }
  return boatHere ? WITHOUT_PUZZLE : ALL_SLOTS;
}

export type { StretchSpan };

// Which stretch holds the family's week N, and which of the stretch's own weeks it is, from 1; null when
// none does, and the week is short lessons alone (23 Nov 2026). Egypt (sequence 1, 24 topics) holds weeks 1
// to 4 and the Moon (sequence 2, counted on) week 5; a theme that names its week holds that week
// (lib/plan.ts, stretchWeeks). Throws, before anything is spent, on a gap or a clash in the sequence, or a
// theme naming a week the stretches before it already hold.
export function stretchForWeek(spans: StretchSpan[], week: number): { stretch: string; weekInStretch: number } | null {
  const { weeks, problems } = stretchWeeks(spans);
  if (problems.length) throw new Error(`The plan's stretches are out of order: ${problems.join("; ")}. Fix the files under plan/ and run npm run plan:import.`);
  for (const [stretch, held] of weeks) {
    const i = held.indexOf(week);
    if (i >= 0) return { stretch, weekInStretch: i + 1 };
  }
  return null;
}

// The thread topics of one of a stretch's weeks, from its day 1.
export const weekThread = <T>(topics: T[], weekInStretch: number): T[] => topics.slice((weekInStretch - 1) * DAYS_IN_WEEK, weekInStretch * DAYS_IN_WEEK);

export function weekSchedule({ thread, lessons, used, own = new Set(), slots = ALL_SLOTS }: ScheduleInput): DayPlan[] {
  // The thread takes a day only on a tile the week builds.
  const threadToday = (day: number) => {
    const t = thread[day - 1];
    return t && slots.includes(t.slot) ? t : null;
  };

  // Each slot's queue: this week's own lessons first, then the unused ones, in library order.
  const queue = new Map<DaySlot, Scheduled[]>(
    slots.map((slot) => {
      const forSlot = lessons.filter((l) => l.slot === slot);
      return [slot, [...forSlot.filter((l) => own.has(l.id)), ...forSlot.filter((l) => !own.has(l.id) && !used.has(l.id))]];
    }),
  );

  const days: DayPlan[] = [];
  for (let day = 1; day <= DAYS_IN_WEEK; day++) {
    const t = threadToday(day);
    const topics: Partial<Record<DaySlot, string>> = {};
    for (const slot of slots) {
      const id = t?.slot === slot ? t.id : queue.get(slot)!.shift()?.id;
      if (id) topics[slot] = id;
    }
    days.push({ day, thread: t?.slot ?? null, topics });
  }
  return days;
}

// The day-slots a schedule could not fill, in day order, then slot order.
export type Gap = { day: number; slot: DaySlot };
export function scheduleGaps(days: DayPlan[], slots: readonly DaySlot[]): Gap[] {
  return days.flatMap((d) => slots.filter((s) => !d.topics[s]).map((slot) => ({ day: d.day, slot })));
}

// The refusal for days that still have a gap, before anything is spent: which slots need how many more.
export function gapsText(week: number, gaps: Gap[]): string {
  const bySlot = new Map<DaySlot, number>();
  for (const g of gaps) bySlot.set(g.slot, (bySlot.get(g.slot) ?? 0) + 1);
  const what = [...bySlot].map(([slot, n]) => `the ${slot} card needs ${n} more`);
  return `Not enough short lessons for week ${week}: ${what.join("; ")}. The app writes them (npm run cron:lessons), or add lessons to plan/short-lessons.yaml and run npm run plan:import.`;
}
