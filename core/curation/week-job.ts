// The week build against the database, shared by scripts/week-build.mts and the Sunday route
// (docs/looks-good-slice.md, decision 2): what the script used to do around buildWeek() lives here once.
// prepareWeek() does everything before spending and spends nothing; buildDays() builds, gates what is
// pending and records the run. The database and the model come in as arguments, and the script keeps
// its flags and all its printing. Relative imports with extensions, so the scripts and the app both
// load it.

import type { SupabaseClient } from "@supabase/supabase-js";
import { ageFrom } from "../../lib/beliefs.ts";
import { SLOT_ORDER, type DaySlot } from "../../lib/lenses.ts";
import { otherBand, type PlanSource } from "../../lib/plan.ts";
import type { LearnsToAct, Perspective } from "../../lib/values.ts";
import { sourceRef } from "../content/sources.ts";
import type { complete } from "../model.ts";
import { kidFacingPrompt, readPrompt } from "../prompts.ts";
import { runRow, type Meter } from "../runs.ts";
import { writeCards } from "./cards.ts";
import { subjectWatch, type GateReport } from "./gate.ts";
import { gateTheme, type GateSetup } from "./gate-run.ts";
import { sourceRefs, writeIdeaChain } from "./ideas.ts";
import { DAYS_IN_WEEK, weekSchedule, type Scheduled } from "./schedule.ts";
import type { IdeaChain, IdeaLayer, OfferedItem, WeekPlan, WeekTopic } from "./types.ts";
import { addDays, buildWeek, nextMonday, todayIn, type WeekChild, type WeekDeps, type WeekReport } from "./week.ts";

type Reply = { data: unknown; error: { message: string } | null };
function maybe<R extends Reply>(r: R, what: string): R["data"] {
  if (r.error) throw new Error(`${what}: ${r.error.message}`);
  return r.data;
}
function must<R extends Reply>(r: R, what: string): NonNullable<R["data"]> {
  const data = maybe(r, what);
  if (data === null || data === undefined) throw new Error(`${what}: nothing came back`);
  return data as NonNullable<R["data"]>;
}

// --- Before spending ---

export type PrepareOptions = {
  week: number; // the family's week N of the plan
  start?: string; // YYYY-MM-DD, day 1. Default: the week's own, else counted on from week 1's, else next Monday
  stretch?: string; // the thread; default: the plan's first stretch
  child?: string; // build for one child only: an id or a nickname
};

export type Prepared = {
  db: SupabaseClient;
  family: { id: string; timezone: string };
  children: WeekChild[];
  only: WeekChild | undefined;
  week: number;
  start: string;
  plan: WeekPlan;
  topicById: Map<string, WeekTopic>;
  statement: string | null;
  learns: LearnsToAct | null;
  pointNames: Map<number, string>;
  existing: { id: string; week_start: string; plan_week: number | null } | null; // this week's theme, when it exists
};

type PlanRowDb = {
  id: string;
  key: string;
  kind: "week" | "thread" | "short";
  position: number | null;
  grade_band: string;
  subject: string;
  slot: DaySlot | null;
  title: string;
  summary: string;
  sources: PlanSource[];
  perspective: Perspective | null;
  values_points: number[] | null;
  parent_note: string | null;
  parent_id: string | null;
};
const COLUMNS = "id, key, kind, position, grade_band, subject, slot, title, summary, sources, perspective, values_points, parent_note, parent_id";

// The family, its children, the week mixed from the plan and the library, and when it starts. Throws
// before anything is spent when the family isn't one, a child isn't there, or the library can't fill
// the week (weekSchedule). The one family per copy is every script's assumption.
export async function prepareWeek(db: SupabaseClient, opts: PrepareOptions): Promise<Prepared> {
  const { week } = opts;
  const families = must(await db.from("families").select("id, name, timezone"), "families");
  if (families.length !== 1) throw new Error(`Expected one family, found ${families.length}. Run npm run seed.`);
  const family = families[0];

  const kidRows = must(
    await db.from("children").select("id, nickname, birth_month, sex, reading, interests, bored_by").eq("family_id", family.id).order("birth_month"),
    "children",
  );
  const children: WeekChild[] = kidRows.map((k) => ({
    id: k.id,
    nickname: k.nickname,
    age: ageFrom(k.birth_month),
    reading: k.reading,
    interests: k.interests ?? [],
    boredBy: k.bored_by ?? [],
    sex: k.sex,
    history: {}, // deep taps per lens: recorded from phase 4
  }));
  const only = opts.child ? children.find((c) => c.id === opts.child || c.nickname.toLowerCase() === opts.child!.toLowerCase()) : undefined;
  if (opts.child && !only) throw new Error(`No child "${opts.child}". The family has ${children.map((c) => c.nickname).join(", ")}.`);

  const profile = maybe(await db.from("values_profiles").select("statement, learns_to_act").eq("family_id", family.id).maybeSingle(), "values_profiles");
  const points = must(await db.from("values_points").select("number, name"), "values_points");
  const pointNames = new Map(points.map((p) => [p.number as number, p.name as string]));

  // The week, mixed: the thread on one slot a day, short lessons on the rest (docs/04, "How a week is mixed").
  const firstStretch = must(
    await db.from("plan_topics").select("key").eq("kind", "week").eq("grade_band", "2-3").order("sequence").limit(1),
    "plan_topics",
  );
  const stretch = opts.stretch ?? firstStretch[0]?.key.split("/")[0];
  if (!stretch) throw new Error("plan_topics has no stretch. Run npm run plan:import.");
  const stretchRows = must(await db.from("plan_topics").select(COLUMNS).like("key", `${stretch}/%`), "plan_topics") as PlanRowDb[];
  if (stretchRows.length === 0) throw new Error(`No stretch "${stretch}" in plan_topics. Check plan/${stretch}.yaml and npm run plan:import.`);
  const shortRows = must(await db.from("plan_topics").select(COLUMNS).eq("kind", "short"), "plan_topics") as PlanRowDb[];
  if (shortRows.length === 0) throw new Error("No short lessons in plan_topics. Check plan/short-lessons.yaml and npm run plan:import.");

  const byKey = new Map([...stretchRows, ...shortRows].map((r) => [r.key, r]));
  const chapters = new Map(stretchRows.filter((r) => r.kind === "week").map((r) => [r.id, r]));
  const inOrder = (rows: PlanRowDb[], kind: "thread" | "short") => {
    const young = rows.filter((r) => r.kind === kind && r.grade_band === "2-3");
    if (young.some((r) => r.position === null)) throw new Error("Some plan topics have no position. Run npm run plan:import.");
    return young.sort((a, b) => a.position! - b.position!);
  };
  const threadRows = inOrder(stretchRows, "thread");
  const lessonRows = inOrder(shortRows, "short");
  const scheduled = (r: PlanRowDb): Scheduled => ({ id: r.id, slot: r.slot!, title: r.title });

  // The family's weeks so far: lessons used by earlier weeks are skipped, and a rebuild keeps its own.
  const themes = must(await db.from("themes").select("id, week_start, plan_week, topic_ids").eq("family_id", family.id), "themes");
  const existing = themes.find((t) => t.plan_week === week) ?? null;
  const lessonIds = new Set(lessonRows.map((r) => r.id));
  const used = new Set(themes.filter((t) => t.plan_week !== null && t.plan_week < week).flatMap((t) => t.topic_ids as string[]).filter((id) => lessonIds.has(id)));
  const own = new Set(((existing?.topic_ids ?? []) as string[]).filter((id) => lessonIds.has(id)));
  const schedule = weekSchedule({ week, thread: threadRows.map(scheduled), lessons: lessonRows.map(scheduled), used, own });

  const items = must(
    await db
      .from("content_items")
      .select("id, external_id, type, title, creator, attribution, metadata, content_sources(slug)")
      .eq("approved", true)
      .is("rejected_at", null),
    "content_items",
  ) as unknown as { id: string; external_id: string; type: string; title: string | null; creator: string | null; attribution: string | null; metadata: { description?: string; storage_path?: string } | null; content_sources: { slug: string } }[];
  const approved = new Map(items.map((i) => [`${i.content_sources.slug}/${i.external_id}`, i]));

  const threadTitles = threadRows.map((r) => r.title);
  function weekTopic(young: PlanRowDb): WeekTopic {
    const old = byKey.get(otherBand(young.key));
    const offered: OfferedItem[] = [];
    for (const s of young.sources) {
      const ref = sourceRef(s.url);
      const i = approved.get(`${ref.source}/${ref.externalId}`);
      if (i) {
        offered.push({
          id: i.id,
          type: i.type,
          title: i.title ?? s.title,
          creator: i.creator,
          attribution: i.attribution ?? s.title,
          description: i.metadata?.description,
          storagePath: i.metadata?.storage_path,
        });
      }
    }
    const chapter = young.parent_id ? chapters.get(young.parent_id) : undefined;
    return {
      id: young.id,
      keys: [young.key, ...(old ? [old.key] : [])],
      kind: young.kind === "short" ? "short" : "thread",
      subject: young.subject,
      slot: young.slot!,
      title: young.title,
      younger: young.summary,
      older: old?.summary ?? young.summary,
      items: offered,
      perspective: young.perspective,
      valuesPoints: young.values_points ?? [],
      parentNote: young.parent_note,
      ...(young.kind === "thread"
        ? { chapter: chapter && { title: chapter.title, why: chapter.summary }, earlierInThread: threadTitles.slice(0, young.position! - 1).slice(-6) }
        : {}),
    };
  }

  const scheduledIds = new Set(schedule.flatMap((d) => Object.values(d.topics)));
  const weekRows = [...threadRows, ...lessonRows].filter((r) => scheduledIds.has(r.id));
  const topics = weekRows.map(weekTopic);
  // themes.topic_ids: every row the week uses, both bands, and the thread's chapter rows.
  const topicIds = [
    ...new Set(
      weekRows.flatMap((r) => {
        const chapter = r.parent_id ? chapters.get(r.parent_id) : undefined;
        return [r.key, otherBand(r.key), ...(chapter ? [chapter.key, otherBand(chapter.key)] : [])].map((k) => byKey.get(k)?.id).filter((id): id is string => !!id);
      }),
    ),
  ];
  const threadToday = schedule.find((d) => d.thread)?.topics;
  const firstThread = topics.find((t) => t.kind === "thread" && threadToday && Object.values(threadToday).includes(t.id));
  const stretchTitle = stretch.split("-").map((w: string) => w[0].toUpperCase() + w.slice(1)).join(" ");

  const plan: WeekPlan = {
    week,
    title: firstThread?.chapter ? `Week ${week}: ${firstThread.chapter.title}, with short lessons` : `Week ${week}: short lessons`,
    thread: schedule.some((d) => d.thread) ? { stretch, title: stretchTitle } : null,
    topicIds,
    topics,
    schedule,
  };

  // When the week starts: its own date if it has one, else the one asked for, else counted on from
  // week 1's, else the Monday after today where the family lives.
  const firstWeek = themes.find((t) => t.plan_week === 1);
  const start: string =
    existing?.week_start ?? opts.start ?? (firstWeek ? addDays(firstWeek.week_start, (week - 1) * 7) : addDays(nextMonday(todayIn(family.timezone)), (week - 1) * 7));

  return {
    db,
    family: { id: family.id, timezone: family.timezone },
    children,
    only,
    week,
    start,
    plan,
    topicById: new Map(topics.map((t) => [t.id, t])),
    statement: profile?.statement ?? null,
    learns: profile?.learns_to_act ?? null,
    pointNames,
    existing: existing && { id: existing.id, week_start: existing.week_start, plan_week: existing.plan_week },
  };
}

// What the family's settings already decide for days `from` to `upTo` of the week, so a guardian sees
// the blocks before the money (docs/gate-slice.md, To settle). Empty when there is no rulebook to read.
export function settingsWatch(p: Prepared, gate: GateSetup, upTo: number, from = 1): string[] {
  if (!gate.rulebook) return [];
  const watch: string[] = [];
  for (const kid of p.only ? [p.only] : p.children) {
    const age = gate.children.find((c) => c.id === kid.id)?.age ?? kid.age;
    for (const d of p.plan.schedule.filter((d) => d.day >= from && d.day <= upTo)) {
      for (const slot of SLOT_ORDER) {
        const t = p.topicById.get(d.topics[slot]);
        if (!t?.valuesPoints.length) continue;
        const notes = subjectWatch(t.valuesPoints, gate.rulebook.values, { id: kid.id, age }, gate.rulebook.pointNames);
        if (notes.length) watch.push(`  ${kid.nickname}: day ${d.day} ${slot} (${t.title}): ${notes.join(" ")}`);
      }
    }
  }
  return watch;
}

// --- The database and the model, for buildWeek ---

function weekDeps(p: Prepared, ai: { complete: typeof complete; onTheme?: (themeId: string) => Promise<void> }): WeekDeps {
  const { db, family, plan, start, week, existing, topicById } = p;
  const ideaSystem = readPrompt("ideas.md");
  const cardSystem = kidFacingPrompt("card.md");
  return {
    findTheme: async () => (existing ? { id: existing.id } : null),
    async createTheme() {
      const theme = must(
        await db
          .from("themes")
          .insert({ family_id: family.id, week_start: start, plan_week: week, title: plan.title, topic_ids: plan.topicIds, status: "generating", method: null })
          .select("id")
          .single(),
        "themes",
      );
      await ai.onTheme?.(theme.id); // the Sunday build records the theme it made, so a firing that stops here is not lost
      return theme.id;
    },
    // A rebuild starts by setting 'generating': the theme takes this run's title and topics then, so a
    // week first built before mixed weeks (15 Oct 2026) becomes a mixed one.
    async setStatus(themeId, status) {
      const update = status === "review" ? { status, generated_at: new Date().toISOString() } : { status, title: plan.title, topic_ids: plan.topicIds };
      maybe(await db.from("themes").update(update).eq("id", themeId), "themes");
    },
    async deleteIdeas(themeId) {
      maybe(await db.from("ideas").delete().eq("theme_id", themeId), "ideas"); // cascades to cards and questions
    },
    async deleteDay(themeId, day) {
      maybe(await db.from("ideas").delete().eq("theme_id", themeId).eq("day", day), "ideas"); // cascades to that day's cards and questions
    },
    async deleteCards(themeId, childId) {
      maybe(await db.from("cards").delete().eq("theme_id", themeId).eq("child_id", childId), "cards");
    },
    async loadIdeas(themeId) {
      const saved = must(
        await db
          .from("ideas")
          .select("id, topic_id, day, slot, layer, title, statement, question, answer_key, content_item_id")
          .eq("theme_id", themeId)
          .order("day")
          .order("slot")
          .order("layer"),
        "ideas",
      );
      const chains = new Map<string, IdeaChain>();
      for (const i of saved) {
        const k = `${i.day}:${i.slot}`;
        const topic = topicById.get(i.topic_id);
        if (!topic) throw new Error(`Idea ${i.id} points at a topic this week no longer has. Rebuild the whole week.`);
        const chain: IdeaChain = chains.get(k) ?? { day: i.day, slot: i.slot, topic, layers: [], ids: [] };
        chain.layers.push({ layer: i.layer, title: i.title, statement: i.statement, question: i.question, answer_key: i.answer_key, content_item_id: i.content_item_id } as IdeaLayer);
        chain.ids!.push(i.id);
        chains.set(k, chain);
      }
      return [...chains.values()];
    },
    async saveIdeas(themeId, chain) {
      const ids: string[] = [];
      for (const l of chain.layers) {
        const row = must(
          await db
            .from("ideas")
            .insert({
              theme_id: themeId,
              topic_id: chain.topic.id,
              day: chain.day,
              slot: chain.slot,
              layer: l.layer,
              parent_idea_id: ids.at(-1) ?? null,
              title: l.title,
              statement: l.statement,
              content_item_id: l.content_item_id,
              source_refs: sourceRefs(chain.topic, l),
              question: l.question,
              answer_key: l.answer_key,
            })
            .select("id")
            .single(),
          "ideas",
        );
        ids.push(row.id);
      }
      return ids;
    },
    async saveCard(row) {
      return must(await db.from("cards").insert({ family_id: family.id, ...row }).select("id").single(), "cards").id;
    },
    async saveQuestion(row) {
      maybe(await db.from("questions").insert(row), "questions");
    },
    writeIdeaChain: (slot, day, earlier) => writeIdeaChain(plan, slot, day, earlier, { complete: ai.complete, system: ideaSystem }),
    writeCards: (ctx) => writeCards(ctx, { complete: ai.complete, system: cardSystem }),
  };
}

// --- Building ---

export type BuildOptions = {
  complete: typeof complete; // the run's own, from meteredComplete(meter)
  meter: Meter; // the run's own tally, priced into the model_runs row
  gate: GateSetup; // gateSetup() before anything is spent
  rebuild?: boolean;
  pendingOnly?: boolean; // gate only the cards still pending (the Sunday build)
  onTheme?: (themeId: string) => Promise<void>; // told the moment a theme is made
};

export type BuildResult = {
  report: WeekReport;
  gate: GateReport | null; // null when the gate stopped; see gateError
  gateError: string | null;
  buildSeconds: number; // the build alone
  recordError: string | null; // why the model_runs row couldn't be written
};

// A build that stopped: the original error, and whether the run could still be recorded.
export class BuildStopped extends Error {
  original: unknown;
  recordError: string | null;
  // No parameter properties: node runs this file with its types stripped, which can't carry them.
  constructor(original: unknown, recordError: string | null) {
    super(original instanceof Error ? original.message : String(original));
    this.original = original;
    this.recordError = recordError;
  }
}

// What a run spent, for /parent/models: counts and money only, never which child (rule 7). A run that
// made no model call spent nothing and leaves no row.
async function recordRun(p: Prepared, meter: Meter, started: Date, ok: boolean, themeId: string | null, days: number): Promise<string | null> {
  if (meter.usage().length === 0) return null;
  const row = runRow("week:build", meter.usage(), { ok, startedAt: started, themeId, week: p.week, days, children: p.only ? 1 : p.children.length });
  const { error } = await p.db.from("model_runs").insert({ family_id: p.family.id, ...row });
  return error ? `Could not record this run for /parent/models: ${error.message}. Run npm run db:push?` : null;
}

// What to build: the first `days` days of the week, or the one `day` (into the theme the earlier days
// made; the Sunday build and week:build --day). A one-day build plans the lenses and doors over all seven.
export type BuildRun = { days: number } | { day: number };

// Build what `run` says, check the cards that are pending, and record the run. Anything the gate
// leaves pending is the caller's to report (gateFailed); a build that throws is recorded as stopped
// and rethrown as a BuildStopped.
export async function buildDays(p: Prepared, run: BuildRun, opts: BuildOptions): Promise<BuildResult> {
  const started = new Date();
  const deps = weekDeps(p, { complete: opts.complete, onTheme: opts.onTheme });
  const built = "day" in run ? 1 : run.days; // days of money spent, for model_runs
  let report: WeekReport;
  try {
    report = await buildWeek(
      {
        plan: p.plan,
        weekStart: p.start,
        days: "day" in run ? DAYS_IN_WEEK : run.days,
        day: "day" in run ? run.day : undefined,
        children: p.children,
        statement: p.statement,
        learns: p.learns,
        pointNames: p.pointNames,
        rebuild: !!opts.rebuild,
        onlyChild: p.only?.id,
      },
      deps,
    );
  } catch (e) {
    throw new BuildStopped(e, await recordRun(p, opts.meter, started, false, p.existing?.id ?? null, built));
  }
  const buildSeconds = Math.round((Date.now() - started.getTime()) / 1000);

  let gated: GateReport | null = null;
  let gateError: string | null = null;
  try {
    gated = await gateTheme(p.db, p.family.id, report.themeId, opts.gate, { complete: opts.complete, childId: p.only?.id, pendingOnly: opts.pendingOnly });
  } catch (e) {
    gateError = e instanceof Error ? e.message : String(e);
  }
  const recordError = await recordRun(p, opts.meter, started, true, report.themeId, built);
  return { report, gate: gated, gateError, buildSeconds, recordError };
}
