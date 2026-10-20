// Build one week of the plan: the theme, its shared ideas, and every child's cards and questions.
// A week is mixed (docs/04, "How a week is mixed"): the thread on one slot a day, short lessons on
// the other four. --week N is the family's week N of the plan.
//   npm run week:build -- --week 1
//   npm run week:build -- --week 1 --child Rex --days 2     (one child, the first two days)
//   npm run week:build -- --week 1 --rebuild                (replace a week already built)
// Options: --debug (write each model request and reply to .quark-debug/), --stretch (the thread; default: the plan's first stretch), --start YYYY-MM-DD (default: next Monday, or
// counted on from week 1's start). The theme ends in status 'review'; nothing goes live here.
// Cards are written with policy 'pending', and the gate checks them at the end (scripts/gate-run.ts):
// each leaves 'pending' only as 'passed' or 'blocked'. Anything the gate leaves pending ends the run
// with an error; npm run gate -- --week N checks them again.

import { parseArgs } from "node:util";
import { createClient } from "@supabase/supabase-js";
import { sourceRef } from "../core/content/sources.ts";
import { writeCards } from "../core/curation/cards.ts";
import { writeIdeaChain } from "../core/curation/ideas.ts";
import type { IdeaChain, IdeaLayer, OfferedItem, WeekPlan, WeekTopic } from "../core/curation/types.ts";
import { addDays, buildWeek, type WeekChild, type WeekDeps } from "../core/curation/week.ts";
import { complete, debugTo, modelFor, usageSoFar } from "../core/model.ts";
import { kidFacingPrompt, readPrompt } from "../core/prompts.ts";
import { runRow } from "../core/runs.ts";
import { sourceRefs } from "../core/curation/ideas.ts";
import { weekSchedule, type Scheduled } from "../core/curation/schedule.ts";
import { SLOT_ORDER, type DaySlot } from "../lib/lenses.ts";
import { otherBand, type PlanSource } from "../lib/plan.ts";
import type { Perspective } from "../lib/values.ts";
import { subjectWatch } from "../core/curation/gate.ts";
import { gateFailed, gateSetup, gateTheme, printGate } from "./gate-run.ts";
import { announceTarget } from "./target.ts";

announceTarget();
const { values: args } = parseArgs({
  options: {
    week: { type: "string" },
    stretch: { type: "string" },
    child: { type: "string" },
    days: { type: "string", default: "7" },
    start: { type: "string" },
    rebuild: { type: "boolean", default: false },
    debug: { type: "boolean", default: false },
  },
});
const week = Number(args.week);
const days = Number(args.days);
if (!Number.isInteger(week) || week < 1) throw new Error("Say which week: npm run week:build -- --week 1");
if (!Number.isInteger(days) || days < 1 || days > 7) throw new Error("--days must be 1 to 7");
if (args.start && !/^\d{4}-\d{2}-\d{2}$/.test(args.start)) throw new Error("--start must be YYYY-MM-DD");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in the env file (.env.local, or .env.live.local for a :live script).");
const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
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
// --debug: every model request and reply goes to .quark-debug/<run>/ (gitignored) as it came back.
if (args.debug) {
  const dir = `.quark-debug/week${week}-${new Date().toISOString().replace(/[:.]/g, "-")}`;
  debugTo(dir);
  console.log(`Writing every model request and reply to ${dir}/`);
}
// Fail before spending anything if a model isn't set.
const models = { ideas: modelFor("curate"), cards: modelFor("write"), gate: modelFor("gate") };

// --- The family (one per copy, made by npm run seed) ---

const families = must(await db.from("families").select("id, name, timezone"), "families");
if (families.length !== 1) throw new Error(`Expected one family, found ${families.length}. Run npm run seed.`);
const family = families[0];

const ageFrom = (birthMonth: string, now: Date) => {
  const [year, month] = birthMonth.split("-").map(Number);
  return now.getFullYear() - year - (now.getMonth() + 1 < month ? 1 : 0);
};
const kidRows = must(
  await db.from("children").select("id, nickname, birth_month, sex, reading, interests, bored_by").eq("family_id", family.id).order("birth_month"),
  "children",
);
const children: WeekChild[] = kidRows.map((k) => ({
  id: k.id,
  nickname: k.nickname,
  age: ageFrom(k.birth_month, new Date()),
  reading: k.reading,
  interests: k.interests ?? [],
  boredBy: k.bored_by ?? [],
  sex: k.sex,
  history: {}, // deep taps per lens: recorded from phase 4
}));
const only = args.child ? children.find((c) => c.id === args.child || c.nickname.toLowerCase() === args.child!.toLowerCase()) : undefined;
if (args.child && !only) throw new Error(`No child "${args.child}". The family has ${children.map((c) => c.nickname).join(", ")}.`);

const profile = maybe(await db.from("values_profiles").select("statement").eq("family_id", family.id).maybeSingle(), "values_profiles");
const points = must(await db.from("values_points").select("number, name"), "values_points");
const pointNames = new Map(points.map((p) => [p.number as number, p.name as string]));

// --- The week, mixed: the thread on one slot a day, short lessons on the rest (docs/04, "How a week is mixed") ---

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

const firstStretch = must(
  await db.from("plan_topics").select("key").eq("kind", "week").eq("grade_band", "2-3").order("sequence").limit(1),
  "plan_topics",
);
const stretch = args.stretch ?? firstStretch[0]?.key.split("/")[0];
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

// --- When the week starts ---

const todayThere = new Intl.DateTimeFormat("en-CA", { timeZone: family.timezone }).format(new Date()); // YYYY-MM-DD
const nextMonday = (date: string) => addDays(date, (8 - new Date(`${date}T00:00:00Z`).getUTCDay()) % 7 || 7);
const firstWeek = themes.find((t) => t.plan_week === 1);
const start: string =
  existing?.week_start ?? args.start ?? (firstWeek ? addDays(firstWeek.week_start, (week - 1) * 7) : addDays(nextMonday(todayThere), (week - 1) * 7));

// --- The database and the model, for buildWeek ---

const ideaSystem = readPrompt("ideas.md");
const cardSystem = kidFacingPrompt("card.md");
const topicById = new Map(topics.map((t) => [t.id, t]));

const deps: WeekDeps = {
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
  writeIdeaChain: (slot, day, earlier) => writeIdeaChain(plan, slot, day, earlier, { complete, system: ideaSystem }),
  writeCards: (ctx) => writeCards(ctx, { complete, system: cardSystem }),
};

// --- Run it, and report ---

console.log(`${plan.title}: starting ${start}, ${days} day${days === 1 ? "" : "s"}.`);
const titleOf = new Map(topics.map((t) => [t.id, t]));
for (const d of schedule.filter((d) => d.day <= days)) {
  const lessons = SLOT_ORDER.filter((s) => s !== d.thread).map((s) => `${s} ${titleOf.get(d.topics[s])?.keys[0].split("/")[1]}`);
  console.log(`  Day ${d.day}: ${d.thread ? `${plan.thread?.title} on ${d.thread} (${titleOf.get(d.topics[d.thread])?.title})` : "the thread has ended"}; short lessons: ${lessons.join(", ")}.`);
}
// Before spending: the gate's rulebook and floor, and what the family's settings already decide for
// this week's topics, so a guardian sees the blocks before the money (docs/gate-slice.md, To settle).
const gate = await gateSetup(db, family.id);
if (!gate.rulebook) {
  console.log(`\nThe gate: ${gate.missing}. The cards will be built and left pending; run npm run gate -- --week ${week} afterwards.`);
} else {
  const watch: string[] = [];
  for (const kid of only ? [only] : children) {
    const age = gate.children.find((c) => c.id === kid.id)?.age ?? kid.age;
    for (const d of schedule.filter((d) => d.day <= days)) {
      for (const slot of SLOT_ORDER) {
        const t = topicById.get(d.topics[slot]);
        if (!t?.valuesPoints.length) continue;
        const notes = subjectWatch(t.valuesPoints, gate.rulebook.values, { id: kid.id, age }, gate.rulebook.pointNames);
        if (notes.length) watch.push(`  ${kid.nickname}: day ${d.day} ${slot} (${t.title}): ${notes.join(" ")}`);
      }
    }
  }
  console.log(
    watch.length
      ? `\nWhat the family's settings decide before anything is spent (the gate holds these back in code, or reads them as parent-led):\n${watch.join("\n")}`
      : "\nNo topic built here touches a subject the family's settings hold back or keep parent-led.",
  );
}
console.log(`Ideas on ${models.ideas}; cards on ${models.cards}; the gate on ${models.gate}. ${only ? `Only ${only.nickname}.` : `${children.length} children.`}`);
const started = Date.now();
let report;
try {
  report = await buildWeek(
    { plan, weekStart: start, days, children, statement: profile?.statement ?? null, pointNames, rebuild: args.rebuild, onlyChild: only?.id },
    deps,
  );
} catch (e) {
  console.error(`\nStopped: ${e instanceof Error ? e.message : String(e)}`);
  if (!/already built/.test(String(e))) console.error("The theme is left as 'generating'. Fix the problem and run again with --rebuild.");
  printUsage();
  await recordRun(false, existing?.id ?? null);
  process.exit(1);
}

console.log(`\nTheme ${report.themeId}, now in review. ${report.ideas} ideas. ${Math.round((Date.now() - started) / 1000)}s.`);
for (const c of report.children) {
  const lenses = Object.entries(c.lenses).sort((a, b) => b[1] - a[1]).map(([l, n]) => `${l} ${n}`).join(", ");
  console.log(`\n${c.nickname}: ${c.cards} cards. Lenses (per day-slot): ${lenses}.`);
  console.log(`  Interests opened ${c.doors} first cards. ${c.withoutPicture} cards without a picture or recording. ${c.reasked} day-slots asked twice.`);
  if (c.heldBack.length) {
    console.log(`  Held back as blocked (still failing the checks after a second try):`);
    for (const h of c.heldBack) console.log(`    ${h}`);
  }
}
console.log(
  report.textOnly.length
    ? `\nText only (the topic has no approved item): ${report.textOnly.join(", ")}.`
    : "\nEvery day-slot had an approved item to offer.",
);
console.log(`Idea chains sent back because layer 1 had no item: ${report.ideasReasked}.`);
console.log(
  report.firstWithoutPicture.length
    ? `First cards without a picture (the topic had an item; layer 1 still had none after a second try): ${report.firstWithoutPicture.join(", ")}.`
    : "Every first card has a picture or recording where its topic has one.",
);
// The gate, on the cards this run built.
let gateOk = false;
try {
  const gated = await gateTheme(db, family.id, report.themeId, gate, only?.id);
  printGate(gated, gate);
  gateOk = !gateFailed(gated);
} catch (e) {
  console.error(`\nThe gate stopped: ${e instanceof Error ? e.message : String(e)}. Cards it hadn't reached are left as they were; run npm run gate -- --week ${week}.`);
}
printUsage();
await recordRun(true, report.themeId);
console.log(`\nPreview it at /parent/week/${report.themeId}.`);
if (!gateOk) process.exit(1);

function printUsage() {
  const row = runRow("week:build", usageSoFar(), { ok: true, startedAt: new Date(started) });
  console.log("\nTokens:");
  for (const m of row.models) {
    console.log(`  ${m.use} on ${m.model}: ${m.calls} calls, ${m.input.toLocaleString()} in, ${m.output.toLocaleString()} out${m.cost === null ? ", price unknown" : `, $${m.cost.toFixed(2)}`}`);
    if (m.use === "gate" && m.cost !== null && m.calls) console.log(`    $${(m.cost / m.calls).toFixed(3)} a card the model read.`);
  }
  console.log(`  Total: $${row.cost.toFixed(2)}${row.cost_complete ? "" : " plus models without a known price"}.`);
}

// What the run spent, for /parent/models: counts and money only, never which child (rule 7).
async function recordRun(ok: boolean, themeId: string | null) {
  const row = runRow("week:build", usageSoFar(), { ok, startedAt: new Date(started), themeId, week, days, children: only ? 1 : children.length });
  const { error } = await db.from("model_runs").insert({ family_id: family.id, ...row });
  if (error) console.error(`Could not record this run for /parent/models: ${error.message}. Run npm run db:push?`);
}
