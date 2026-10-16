// Build one week of the plan: the theme, its shared ideas, and every child's cards and questions.
//   npm run week:build -- --week 1
//   npm run week:build -- --week 1 --child Rex --days 2     (one child, the first two days)
//   npm run week:build -- --week 1 --rebuild                (replace a week already built)
// Options: --debug (write each model request and reply to .quark-debug/), --stretch (default: the plan's first), --start YYYY-MM-DD (default: next Monday, or
// counted on from week 1's start). The theme ends in status 'review'; nothing goes live here.
// Cards are written with policy 'pending': the gate (step 5) checks them.

import { parseArgs } from "node:util";
import { createClient } from "@supabase/supabase-js";
import { sourceRef } from "../core/content/sources.ts";
import { writeCards } from "../core/curation/cards.ts";
import { writeIdeaChain } from "../core/curation/ideas.ts";
import type { IdeaChain, IdeaLayer, OfferedItem, WeekPlan, WeekTopic } from "../core/curation/types.ts";
import { addDays, buildWeek, type WeekChild, type WeekDeps } from "../core/curation/week.ts";
import { complete, debugTo, modelFor, usageSoFar } from "../core/model.ts";
import { costOf } from "../core/prices.ts";
import { kidFacingPrompt, readPrompt } from "../core/prompts.ts";
import { sourceRefs } from "../core/curation/ideas.ts";
import type { DaySlot } from "../lib/lenses.ts";
import type { PlanSource } from "../lib/plan.ts";

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
if (!url || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local.");
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
const models = { ideas: modelFor("curate"), cards: modelFor("write") };

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

// --- The week, from plan_topics, with the approved content its topics name ---

const firstWeekRow = must(
  await db.from("plan_topics").select("key").eq("subject", "week").eq("week", 1).eq("grade_band", "2-3").order("sequence").limit(1),
  "plan_topics",
);
const stretch = args.stretch ?? firstWeekRow[0]?.key.split("/")[0];
if (!stretch) throw new Error("plan_topics is empty. Run npm run plan:import.");
const rows = must(
  await db
    .from("plan_topics")
    .select("id, key, grade_band, subject, slot, title, summary, sources, perspective, values_points")
    .like("key", `${stretch}/w${week}/%`)
    .order("key"),
  "plan_topics",
);
const weekRow = rows.find((r) => r.subject === "week" && r.grade_band === "2-3");
if (!weekRow) throw new Error(`${stretch} has no week ${week}. Check plan/${stretch}.yaml and npm run plan:import.`);

const items = must(
  await db
    .from("content_items")
    .select("id, external_id, type, title, creator, attribution, metadata, content_sources(slug)")
    .eq("approved", true)
    .is("rejected_at", null),
  "content_items",
) as unknown as { id: string; external_id: string; type: string; title: string | null; creator: string | null; attribution: string | null; metadata: { description?: string; storage_path?: string } | null; content_sources: { slug: string } }[];
const approved = new Map(items.map((i) => [`${i.content_sources.slug}/${i.external_id}`, i]));

const topics: WeekTopic[] = rows
  .filter((r) => r.subject !== "week" && r.grade_band === "2-3")
  .map((young) => {
    const old = rows.find((r) => r.subject === young.subject && r.grade_band === "4-5" && r.subject !== "week");
    const offered: OfferedItem[] = [];
    for (const s of young.sources as PlanSource[]) {
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
    return {
      id: young.id,
      keys: [young.key, ...(old ? [old.key] : [])],
      subject: young.subject,
      slot: young.slot as DaySlot,
      title: young.title,
      younger: young.summary,
      older: old?.summary ?? young.summary,
      items: offered,
    };
  });

const plan: WeekPlan = {
  stretch,
  week,
  title: weekRow.title,
  why: weekRow.summary,
  perspective: weekRow.perspective,
  valuesPoints: weekRow.values_points ?? [],
  topicIds: rows.map((r) => r.id),
  topics,
};

// --- When the week starts ---

const todayThere = new Intl.DateTimeFormat("en-CA", { timeZone: family.timezone }).format(new Date()); // YYYY-MM-DD
const nextMonday = (date: string) => addDays(date, (8 - new Date(`${date}T00:00:00Z`).getUTCDay()) % 7 || 7);
async function weekStart(): Promise<string> {
  if (args.start) return args.start;
  const w1 = rows.length && week > 1
    ? maybe(await db.from("plan_topics").select("id").eq("key", `${stretch}/w1/2-3`).maybeSingle(), "plan_topics")
    : null;
  if (w1) {
    const first = maybe(await db.from("themes").select("week_start").eq("family_id", family.id).contains("topic_ids", [w1.id]).maybeSingle(), "themes");
    if (first) return addDays(first.week_start, (week - 1) * 7);
  }
  return addDays(nextMonday(todayThere), (week - 1) * 7);
}

const existing = maybe(
  await db.from("themes").select("id, week_start").eq("family_id", family.id).contains("topic_ids", [weekRow.id]).maybeSingle(),
  "themes",
);
const start = existing?.week_start ?? (await weekStart());

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
        .insert({ family_id: family.id, week_start: start, title: plan.title, topic_ids: plan.topicIds, status: "generating", method: null })
        .select("id")
        .single(),
      "themes",
    );
    return theme.id;
  },
  async setStatus(themeId, status) {
    maybe(
      await db.from("themes").update({ status, ...(status === "review" ? { generated_at: new Date().toISOString() } : {}) }).eq("id", themeId),
      "themes",
    );
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

console.log(`${plan.title}: week ${week} of ${stretch}, starting ${start}, ${days} day${days === 1 ? "" : "s"}.`);
console.log(`Ideas on ${models.ideas}; cards on ${models.cards}. ${only ? `Only ${only.nickname}.` : `${children.length} children.`}`);
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
printUsage();
console.log(`\nPreview it at /parent/week/${report.themeId}.`);

function printUsage() {
  let total = 0;
  let known = true;
  console.log("\nTokens:");
  for (const [model, u] of usageSoFar()) {
    const cost = costOf(model, u);
    if (cost === null) known = false;
    else total += cost;
    console.log(`  ${model}: ${u.calls} calls, ${u.input.toLocaleString()} in, ${u.output.toLocaleString()} out${cost === null ? ", price unknown" : `, $${cost.toFixed(2)}`}`);
  }
  console.log(`  Total: $${total.toFixed(2)}${known ? "" : " plus models without a known price"}.`);
}
