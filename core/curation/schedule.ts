import { SLOT_ORDER, type DaySlot } from "../../lib/lenses.ts";

// How a week is mixed (docs/04, decided 16 Oct 2026): one slot a day carries the running thread
// and the other four carry short lessons. Pure, so the same plan and the same earlier weeks always
// give the same week.
//
// - The thread's topics run one a day, in order, on the slot each was written for: day d of week N
//   is the thread's topic 7(N-1)+d. Egypt's order meets every slot each week.
// - Each other slot takes the next short lesson written for it, in the library's order, that no
//   earlier week has used. A rebuild keeps the week's own lessons: they come first.
// - When the thread has run out, all five slots take short lessons.
// - When a slot runs out of lessons, nothing is built: the error says which slots need more.
// The whole week is scheduled even when fewer days are built, so a later rebuild matches.

export type Scheduled = { id: string; slot: DaySlot; title: string };

export type DayPlan = {
  day: number;
  thread: DaySlot | null; // the slot the thread takes today, or null once it has run out
  topics: Record<DaySlot, string>; // a topic id per slot
};

export type ScheduleInput = {
  week: number; // the family's week in the plan, from 1
  thread: Scheduled[]; // the stretch's topics in order
  lessons: Scheduled[]; // the library in order
  used: Set<string>; // lessons earlier weeks used
  own?: Set<string>; // lessons this week already has
};

export const DAYS_IN_WEEK = 7;

export function weekSchedule({ week, thread, lessons, used, own = new Set() }: ScheduleInput): DayPlan[] {
  const threadToday = (day: number) => thread[(week - 1) * DAYS_IN_WEEK + day - 1] ?? null;

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
