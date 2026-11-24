// The app writes its own short lessons (docs/week-without-hands-slice.md; Brandon, 23 Nov 2026: "Fully automatic on
// Vercel"; "we need to get this running on it's own, not stock a big pantry"). Pure: the database, the model, the
// searches and the clock come in as deps, the way the Sunday build's do (core/curation/cron.ts), so every path is
// tested without them. The real deps are core/curation/lessons-job.ts; the route is app/api/cron/lessons/route.ts.
//
// - **What to write.** The week the next Sunday build makes, and only what its tiles still lack (weekSchedule's
//   gaps): one lesson a tile a round, for that tile's next open day, so each lesson lands on the day it was written
//   for (a tile's days take its lessons in the order they were written). Nothing more: no pantry.
// - **One lesson, idea by idea.** Three ideas are asked for at a time (lesson-ideas.md). For each: its Wikipedia
//   article, open candidates found by search and fetched through the real adapters, the lesson written from them
//   (lesson.md), and checked by a second call against the same texts (lesson-check.md). A lesson with a claim its
//   sources do not support goes back once with the claims named; one that repeats an earlier idea, touches a values
//   point or is a whole Hawaiʻi lesson is not written. Its items are then stored and flagged as content:fetch does,
//   and a flagged first item means the next idea. Never text only (Brandon, 23 Nov 2026, at go: "A first card always
//   has a picture or recording; try another idea until one is found").
// - **Holidays** go on their days (holidays.ts): a holiday's lesson is written for the first tile whose next open day
//   it is, once a holiday.
// - **The lock.** A firing records itself in audit_log (action lessons.write, no guardian) and only the earliest one
//   that has not ended goes on, as the Sunday build's lock does; the Sunday build takes the same lock when it writes.

import type { DaySlot } from "../../lib/lenses.ts";
import type { Subject } from "../../lib/plan.ts";
import type { Reference } from "../content/search.ts";
import { blockedBy, LOCK_MINUTES, nextWeek, scrubNames, type CronRow, type CronTarget, type ThemeRow } from "./cron.ts";
import { faultText } from "./gate.ts";
import { hawaiiDaysOn, holidaysOn } from "./holidays.ts";
import type { Gap } from "./schedule.ts";
import { addDays, todayIn } from "./week.ts";

export const LESSONS_ACTION = "lessons.write";

// --- What to write ---

export type Need = { slot: DaySlot; day: number; date: string; holiday: string | null; hawaiiDays: string[] };

// The tiles' next open days, and which one carries a holiday: each tile's earliest gap; a holiday goes to the first
// tile, in this order, whose next open day it falls on, unless a lesson for it was already written this week.
export const HOLIDAY_TILES: readonly DaySlot[] = ["then", "look", "listen", "wonder", "puzzle"];
export function nextNeeds(gaps: Gap[], start: string, taken: Set<string>): Need[] {
  const first = new Map<DaySlot, number>();
  for (const g of gaps) if (!first.has(g.slot) || g.day < first.get(g.slot)!) first.set(g.slot, g.day);
  const needs: Need[] = [...first].map(([slot, day]) => {
    const date = addDays(start, day - 1);
    return { slot, day, date, holiday: null, hawaiiDays: hawaiiDaysOn(date) };
  });
  const given = new Set(taken);
  for (const slot of HOLIDAY_TILES) {
    const need = needs.find((n) => n.slot === slot);
    const holiday = need && holidaysOn(need.date).find((h) => !given.has(h));
    if (need && holiday) {
      need.holiday = holiday;
      given.add(holiday);
    }
  }
  return needs.sort((a, b) => a.day - b.day || HOLIDAY_TILES.indexOf(a.slot) - HOLIDAY_TILES.indexOf(b.slot));
}

// --- One lesson ---

export type LessonIdea = {
  title: string;
  subject: Subject;
  holiday: boolean;
  articles: string[]; // one or two English Wikipedia articles: the idea's own, and one that explains its mechanism
  shows: string;
  searches: { source: "met" | "aic" | "commons"; query: string }[];
};

// An open item a search found and its adapter fetched, numbered for the writer.
export type Candidate = { n: number; url: string; type: string; title: string; license: string };

export type Draft = { use: number[]; title: string; subject: string; summary_2_3: string; summary_4_5: string; parent_note: string };
export type Check = { unsupported: { claim: string; why: string }[]; repeats: string; values_points: number[]; whole_hawaii: boolean; title_names_idea: boolean };

export type WriterContext = {
  used: string[]; // every title the family has had, in the library and the plan
  recent: Partial<Record<DaySlot, string[]>>; // the subjects lately on each tile, most recent last
  upcoming: string[]; // lessons in the library no week has used yet: what is already written for the coming week
};

export type WriterDeps<C extends Candidate = Candidate> = {
  now: () => Date;
  ideas: (need: Need, ctx: WriterContext, rejected: string[]) => Promise<LessonIdea[]>;
  reference: (articles: string[]) => Promise<Reference | null>; // null when the first article is missing
  candidates: (idea: LessonIdea, slot: DaySlot) => Promise<C[]>;
  write: (input: { need: Need; idea: LessonIdea; candidates: C[]; reference: Reference; problems: string[] }) => Promise<Draft>;
  check: (input: { draft: Draft; items: C[]; reference: Reference; ctx: WriterContext }) => Promise<Check>;
  store: (c: C) => Promise<boolean>; // fetched, stored and flagged as content:fetch does; true when approved
  save: (input: { need: Need; idea: LessonIdea; draft: Draft; items: C[]; reference: Reference }) => Promise<string>; // the lesson's key
};

export type Written = { key: string; slot: DaySlot; day: number; date: string; title: string; holiday: string | null; items: string[]; tries: number };
export type Missed = { slot: DaySlot; day: number; date: string; tried: { title: string; why: string }[] };

export const TRY_SECONDS = 110; // a whole try: the search, the writer, the checker and the store
export const REWRITE_SECONDS = 55; // the writer and the checker once more

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

// One lesson for one tile's next open day, trying ideas until one is written or the time runs out.
export async function writeLesson<C extends Candidate>(need: Need, ctx: WriterContext, deps: WriterDeps<C>, deadline: number): Promise<Written | Missed> {
  const left = () => (deadline - deps.now().getTime()) / 1000;
  const tried: { title: string; why: string }[] = [];

  const attempt = async (idea: LessonIdea): Promise<string | { key: string; draft: Draft; items: C[] }> => {
    if (ctx.used.some((t) => same(t, idea.title)) || tried.some((t) => same(t.title, idea.title))) return "already in the library";
    const reference = await deps.reference(idea.articles);
    if (!reference) return `no Wikipedia article "${idea.articles[0] ?? ""}"`;
    const found = await deps.candidates(idea, need.slot);
    if (found.length === 0) return need.slot === "listen" ? "no recording that is public domain in the US" : "no open picture";

    let problems: string[] = [];
    for (let round = 1; round <= 2; round++) {
      const draft = await deps.write({ need, idea, candidates: found, reference, problems });
      const items = draft.use.map((n) => found.find((c) => c.n === n)).filter((c): c is C => !!c);
      if (items.length === 0) return "no candidate showed the idea";
      const check = await deps.check({ draft, items, reference, ctx });
      if (check.repeats.trim()) return `repeats "${check.repeats.trim()}"`;
      if (check.values_points.length) return `touches values point${check.values_points.length === 1 ? "" : "s"} ${check.values_points.join(", ")}`;
      if (check.whole_hawaii) return "a whole Hawaiʻi lesson";
      problems = [
        ...check.unsupported.map((u) => `Not supported by the article or the records: ${u.claim} (${u.why})`),
        ...(check.title_names_idea ? [] : ["The title does not name the idea the lesson teaches."]),
      ];
      if (problems.length === 0) {
        // The items: stored and flagged as content:fetch does. The first card is about the first item, so a flagged
        // first item means the next idea; a flagged second one is left out.
        const kept: C[] = [];
        for (const [i, c] of items.entries()) {
          if (await deps.store(c)) kept.push(c);
          else if (i === 0) return "its item was flagged for a parent to look at";
        }
        return { key: await deps.save({ need, idea, draft, items: kept, reference }), draft, items: kept };
      }
      if (round === 1 && left() < REWRITE_SECONDS) break;
    }
    return `claims its sources do not support: ${problems.join("; ")}`;
  };

  for (let ask = 0; ask < 2 && left() >= TRY_SECONDS; ask++) {
    const ideas = await deps.ideas(need, ctx, tried.map((t) => t.title));
    for (const idea of ideas) {
      if (left() < TRY_SECONDS) break;
      let result: Awaited<ReturnType<typeof attempt>>;
      try {
        result = await attempt(idea);
      } catch (e) {
        result = `failed: ${faultText(e)}`;
      }
      if (typeof result !== "string") {
        return {
          key: result.key,
          slot: need.slot,
          day: need.day,
          date: need.date,
          title: result.draft.title,
          holiday: idea.holiday ? need.holiday : null,
          items: result.items.map((c) => c.url),
          tries: tried.length + 1,
        };
      }
      tried.push({ title: idea.title, why: result });
    }
  }
  return { slot: need.slot, day: need.day, date: need.date, tried };
}

// --- A round, under the lock ---

export type RoundDeps<C extends Candidate = Candidate> = WriterDeps<C> & {
  context: () => Promise<WriterContext>;
  takenHolidays: (familyId: string, week: number) => Promise<Set<string>>; // holidays this week's lessons already carry
  recentRows: (familyId: string, since: Date) => Promise<CronRow[]>; // lessons.write rows
  audit: (familyId: string, target: CronTarget) => Promise<string>; // a lessons.write row; the new row's id
  spent: () => number; // dollars this firing's writing has spent so far
  recordRun: (familyId: string, week: number, ok: boolean) => Promise<void>; // model_runs, kind lessons
};

export type RoundResult =
  | { kind: "blocked" }
  | { kind: "done"; written: Written[]; missed: Missed[]; cost: number }
  | { kind: "failed"; error: string; cost: number };

const isWritten = (r: Written | Missed): r is Written => "key" in r;

// Write the given tiles' next lessons side by side, under the lessons.write lock, and record the round: a start row,
// then an end row naming each lesson written (key, tile, day, title, holiday) and each tile missed with why. No row
// names a child. `by` says which firing wrote: the lesson firings, or a Sunday firing writing what its day lacks.
export async function writeRound<C extends Candidate>(
  deps: RoundDeps<C>,
  input: { familyId: string; names: string[]; week: number; gaps: Gap[]; start: string; deadline: number; by: "lessons" | "sunday"; onlyDay?: number },
): Promise<RoundResult> {
  const clean = (s: string) => scrubNames(s, input.names);
  const gaps = input.onlyDay === undefined ? input.gaps : input.gaps.filter((g) => g.day === input.onlyDay);
  const needs = nextNeeds(gaps, input.start, await deps.takenHolidays(input.familyId, input.week));
  const began = deps.now();
  const started = await deps.audit(input.familyId, {
    outcome: "started",
    week: input.week,
    day: input.onlyDay ?? null,
    theme: null,
    by: input.by,
    start: input.start, // the week's first day, so /parent can date each lesson
    open: input.gaps.length, // the week's open day-slots when the round began
    tiles: needs.map((n) => `${n.slot} day ${n.day}`),
  });
  const end = (outcome: "wrote" | "refused" | "failed", extra: Record<string, unknown>) =>
    deps.audit(input.familyId, { outcome, started, week: input.week, day: input.onlyDay ?? null, theme: null, by: input.by, ...extra });

  const rows = await deps.recentRows(input.familyId, new Date(began.getTime() - LOCK_MINUTES * 60_000));
  // The lock is the week's, whichever day: a lesson firing and a Sunday firing never write one week at once.
  const weekRows = rows.map((r) => ({ ...r, target: { ...r.target, day: null } }));
  if (blockedBy(weekRows, started, input.week, null)) {
    await end("refused", { reason: `another firing is writing week ${input.week}'s short lessons` });
    return { kind: "blocked" };
  }
  try {
    const ctx = await deps.context();
    const results = await Promise.all(needs.map((n) => writeLesson(n, ctx, deps, input.deadline)));
    const written = results.filter(isWritten);
    const missed = results.filter((r): r is Missed => !isWritten(r));
    const cost = deps.spent();
    await end("wrote", {
      lessons: written.map(({ key, slot, day, title, holiday, items }) => ({ key, slot, day, title, holiday, items })),
      missed: missed.map(({ slot, day, tried }) => ({ slot, day, tried: tried.map((t) => ({ title: t.title, why: clean(t.why).slice(0, 300) })) })),
      cost,
    });
    await deps.recordRun(input.familyId, input.week, true);
    return { kind: "done", written, missed, cost };
  } catch (e) {
    const error = clean(faultText(e));
    const cost = deps.spent();
    await end("failed", { error, cost });
    await deps.recordRun(input.familyId, input.week, false);
    return { kind: "failed", error, cost };
  }
}

// --- A lesson firing ---

export type FiringDeps<C extends Candidate = Candidate> = RoundDeps<C> & {
  families: () => Promise<{ id: string; timezone: string }[]>;
  children: (familyId: string) => Promise<{ id: string; nickname: string }[]>;
  themes: (familyId: string) => Promise<ThemeRow[]>;
  ownThemes: (familyId: string) => Promise<Set<string>>;
  envProblem: () => string | null;
  gaps: (week: number, start: string) => Promise<{ gaps: Gap[]; start: string }>; // the week's open day-slots, before spending
};

export type LessonsReply = {
  outcome: "wrote" | "nothing" | "refused" | "failed";
  week: number | null;
  written?: number;
  missed?: number;
  left?: number; // open day-slots after this firing
  reason?: string;
  cost?: number;
  seconds: number;
};

export const FIRING_SECONDS = 270; // a Hobby function stops at 300

// One firing of /api/cron/lessons: find the week the next Sunday build makes, and write what its tiles still lack,
// one lesson a tile. A firing with nothing to write leaves no row and spends nothing.
export async function lessonsFiring<C extends Candidate>(deps: FiringDeps<C>): Promise<LessonsReply> {
  const began = deps.now();
  const seconds = () => Math.round((deps.now().getTime() - began.getTime()) / 100) / 10;
  const families = await deps.families();
  if (families.length !== 1) return { outcome: "refused", week: null, reason: `expected one family, found ${families.length}`, seconds: seconds() };
  const family = families[0];
  const names = (await deps.children(family.id)).map((k) => k.nickname);

  const next = nextWeek({ themes: await deps.themes(family.id), own: await deps.ownThemes(family.id), today: todayIn(family.timezone, began) });
  if (next.kind === "refuse") return { outcome: "nothing", week: next.week, reason: `${next.reason}; the lessons for the week after are written from Monday`, seconds: seconds() };
  const { gaps, start } = await deps.gaps(next.week, next.start);
  if (gaps.length === 0) return { outcome: "nothing", week: next.week, reason: `week ${next.week} has all its short lessons`, seconds: seconds() };
  const env = deps.envProblem();
  if (env) return { outcome: "refused", week: next.week, reason: env, seconds: seconds() };

  const round = await writeRound(deps, { familyId: family.id, names, week: next.week, gaps, start, deadline: began.getTime() + FIRING_SECONDS * 1000, by: "lessons" });
  if (round.kind === "blocked") return { outcome: "refused", week: next.week, reason: `another firing is writing week ${next.week}'s short lessons`, seconds: seconds() };
  if (round.kind === "failed") return { outcome: "failed", week: next.week, reason: round.error, cost: round.cost, seconds: seconds() };
  const after = await deps.gaps(next.week, next.start);
  return { outcome: "wrote", week: next.week, written: round.written.length, missed: round.missed.length, left: after.gaps.length, cost: round.cost, seconds: seconds() };
}
