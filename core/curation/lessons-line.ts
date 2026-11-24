// What /parent says about the app's own lesson writer (docs/week-without-hands-slice.md, stop 1, 11): one line on the
// week it is writing for, and, folded under it, each lesson it wrote and each try of the last days. From the
// lessons.write rows the firings left (core/curation/lessons.ts); nothing in a row names a child. Pure. No email and no
// notification (decided 20 Oct 2026).

import type { CronRow } from "./cron.ts";
import { whenWords } from "./live.ts";
import { addDays } from "./week.ts";

export type LessonRow = { key: string; slot: string; day: number; title: string; holiday: string | null; items?: string[] };
export type MissedRow = { slot: string; day: number; tried: { title: string; why: string }[] };

export type LessonsSummary = {
  week: number;
  line: string;
  lessons: (LessonRow & { date: string | null })[]; // in day order, then tile order
  tries: { at: string; by: string; outcome: string; written: number; cost: number; missed: MissedRow[]; error?: string }[]; // newest first
};

const TILES = ["look", "wonder", "listen", "then", "puzzle"];
const money = (n: number) => `$${n.toFixed(2)}`;

// The week of the latest round in the rows, and what the app has written for it. Null with no round in the rows.
export function lessonsSummary(rows: CronRow[], timeZone: string): LessonsSummary | null {
  const starts = rows.filter((r) => r.target.outcome === "started").sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at));
  if (starts.length === 0) return null;
  const week = starts.at(-1)!.target.week;
  if (week === null || week === undefined) return null;

  const rounds = starts
    .filter((s) => s.target.week === week)
    .map((start) => ({ start, end: rows.find((r) => r.target.started === start.id && r.target.outcome !== "started") }));
  const weekStart = rounds.map((r) => r.start.target.start).find((s): s is string => typeof s === "string") ?? null;
  const lessons = rounds
    .flatMap((r) => (r.end?.target.outcome === "wrote" ? ((r.end.target.lessons as LessonRow[] | undefined) ?? []) : []))
    .map((l) => ({ ...l, date: weekStart ? addDays(weekStart, l.day - 1) : null }))
    .sort((a, b) => a.day - b.day || TILES.indexOf(a.slot) - TILES.indexOf(b.slot));
  const cost = rounds.reduce((sum, r) => sum + Number(r.end?.target.cost ?? 0), 0);

  // What is still to write: the latest round's open day-slots, less what it wrote.
  const last = rounds.at(-1)!;
  const open = Number(last.start.target.open ?? 0);
  const wroteLast = ((last.end?.target.lessons as LessonRow[] | undefined) ?? []).length;
  const left = last.end ? Math.max(0, open - wroteLast) : open;
  const from = weekStart ? ` (from ${new Date(`${weekStart}T00:00:00Z`).toLocaleDateString("en-US", { timeZone: "UTC", weekday: "short", month: "short", day: "numeric" })})` : "";
  const lastWritten = rounds.filter((r) => ((r.end?.target.lessons as LessonRow[] | undefined) ?? []).length).at(-1)?.end;

  let line: string;
  if (left === 0 && last.end?.target.outcome === "wrote") {
    line = `Short lessons for week ${week}${from}: all ${lessons.length} written by the app${lastWritten ? `, the last on ${whenWords(lastWritten.created_at, timeZone)}` : ""}, ${money(cost)}. Nothing is needed from you.`;
  } else {
    line = `Short lessons for week ${week}${from}: ${lessons.length} written by the app, ${left} still to write; it tries again within four hours, and Sunday's build writes any still missing before it builds. ${money(cost)} so far.`;
    if (last.end?.target.outcome === "failed") line += ` The try on ${whenWords(last.end.created_at, timeZone)} failed: ${String(last.end.target.error ?? "no reason was recorded")}.`;
    if (!last.end) line += ` A try started on ${whenWords(last.start.created_at, timeZone)} and didn't finish.`;
  }

  const tries = rounds
    .map(({ start, end }) => ({
      at: whenWords(start.created_at, timeZone),
      by: start.target.by === "sunday" ? "Sunday's build" : "the lesson writer",
      outcome: end ? String(end.target.outcome) : "didn't finish",
      written: ((end?.target.lessons as LessonRow[] | undefined) ?? []).length,
      cost: Number(end?.target.cost ?? 0),
      missed: (end?.target.missed as MissedRow[] | undefined) ?? [],
      ...(end?.target.error ? { error: String(end.target.error) } : end?.target.reason ? { error: String(end.target.reason) } : {}),
    }))
    .reverse();
  return { week, line, lessons, tries };
}
