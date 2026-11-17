import { SLOT_ORDER, type DaySlot } from "../../lib/lenses.ts";
import { sequenceProblems } from "../../lib/plan.ts";

// How a week is mixed (docs/04, decided 16 Oct 2026): one slot a day carries the running thread
// and the other four carry short lessons. Pure, so the same plan and the same earlier weeks always
// give the same week.
//
// - The week's thread comes from the stretch that holds the week (stretchForWeek, below): its topics
//   run one a day, in order, on the slot each was written for, from day 1. Egypt's order meets every
//   slot each week; a theme's seven topics are written to.
// - Each other slot takes the next short lesson written for it, in the library's order, that no
//   earlier week has used. A rebuild keeps the week's own lessons: they come first.
// - On a day after the stretch's last topic (Egypt's week 4, days 4 to 7), all five slots take short
//   lessons: "the thread has ended". A week no stretch holds is refused by stretchForWeek.
// - When a slot runs out of lessons, nothing is built: the error says which slots need more.
// The whole week is scheduled even when fewer days are built, so a later rebuild matches.

export type Scheduled = { id: string; slot: DaySlot; title: string };

export type DayPlan = {
  day: number;
  thread: DaySlot | null; // the slot the thread takes today, or null after the stretch's last topic
  topics: Record<DaySlot, string>; // a topic id per slot
};

export type ScheduleInput = {
  week: number; // the family's week in the plan, from 1
  thread: Scheduled[]; // this week's thread topics in order, from day 1: at most seven (weekThread)
  lessons: Scheduled[]; // the library in order
  used: Set<string>; // lessons earlier weeks used
  own?: Set<string>; // lessons this week already has
};

export const DAYS_IN_WEEK = 7;

// A stretch as the schedule needs it: its name (the key prefix), its place in the plan and how many
// thread topics it has.
export type StretchSpan = { stretch: string; sequence: number; topics: number };

// Which stretch holds the family's week N, and which of the stretch's own weeks it is, from 1. A
// stretch holds its topics ÷ 7 weeks, rounded up, and each starts the week after the one before it
// ends, in sequence order: Egypt (sequence 1, 24 topics) holds weeks 1 to 4, sequence 2 week 5,
// sequence 3 week 6. Throws, before anything is spent, on a gap or a clash in the sequence, or when
// no stretch holds the week, naming the file to write.
export function stretchForWeek(spans: StretchSpan[], week: number): { stretch: string; weekInStretch: number } {
  const problems = sequenceProblems(spans.map((s) => ({ name: s.stretch, sequence: s.sequence })));
  if (problems.length) throw new Error(`The plan's stretches are out of order: ${problems.join("; ")}. Fix the files under plan/ and run npm run plan:import.`);
  let first = 1; // the family's week the next stretch starts on
  for (const s of [...spans].sort((a, b) => a.sequence - b.sequence)) {
    const held = Math.ceil(s.topics / DAYS_IN_WEEK);
    if (week < first + held) return { stretch: s.stretch, weekInStretch: week - first + 1 };
    first += held;
  }
  const last = first - 1; // the last week any stretch holds
  const sequence = spans.length + (week - last);
  const between = week > last + 1 ? `, after themes for week${week - 1 > last + 1 ? `s ${last + 1} to ${week - 1}` : ` ${last + 1}`}` : "";
  throw new Error(
    `No theme for week ${week}: the plan's stretches reach week ${last}. Write plan/<theme>.yaml with sequence: ${sequence} (one week: seven topics)${between}, then run npm run plan:import.`,
  );
}

// The thread topics of one of a stretch's weeks, from its day 1.
export const weekThread = <T>(topics: T[], weekInStretch: number): T[] => topics.slice((weekInStretch - 1) * DAYS_IN_WEEK, weekInStretch * DAYS_IN_WEEK);

export function weekSchedule({ week, thread, lessons, used, own = new Set() }: ScheduleInput): DayPlan[] {
  const threadToday = (day: number) => thread[day - 1] ?? null;

  // Each slot's queue: this week's own lessons first, then the unused ones, in library order.
  const queue = new Map<DaySlot, Scheduled[]>(
    SLOT_ORDER.map((slot) => {
      const forSlot = lessons.filter((l) => l.slot === slot);
      return [slot, [...forSlot.filter((l) => own.has(l.id)), ...forSlot.filter((l) => !own.has(l.id) && !used.has(l.id))]];
    }),
  );

  const needed = new Map<DaySlot, number>(SLOT_ORDER.map((s) => [s, 0]));
  for (let day = 1; day <= DAYS_IN_WEEK; day++) {
    for (const slot of SLOT_ORDER) if (threadToday(day)?.slot !== slot) needed.set(slot, needed.get(slot)! + 1);
  }
  const short = SLOT_ORDER.filter((s) => queue.get(s)!.length < needed.get(s)!);
  if (short.length) {
    const what = short.map((s) => `the ${s} card needs ${needed.get(s)} and ${queue.get(s)!.length} ${queue.get(s)!.length === 1 ? "is" : "are"} left`);
    throw new Error(`Not enough short lessons for week ${week}: ${what.join("; ")}. Add lessons to plan/short-lessons.yaml and run npm run plan:import.`);
  }

  const days: DayPlan[] = [];
  for (let day = 1; day <= DAYS_IN_WEEK; day++) {
    const t = threadToday(day);
    const topics = {} as Record<DaySlot, string>;
    for (const slot of SLOT_ORDER) topics[slot] = t?.slot === slot ? t.id : queue.get(slot)!.shift()!.id;
    days.push({ day, thread: t?.slot ?? null, topics });
  }
  return days;
}
