// The app's lesson writer against the database, the model and the open sources: the real deps for
// core/curation/lessons.ts, used by app/api/cron/lessons/route.ts and by the Sunday build when its day lacks a lesson
// (core/curation/cron-job.ts). The route passes the service-role client and a model call and tally of its own, so
// each firing counts only its own spend. Relative imports with extensions, as week-job.ts has.

import type { SupabaseClient } from "@supabase/supabase-js";
import { credit, type Credit } from "../content/credit.ts";
import { flagItem } from "../content/flag.ts";
import { isOpenLicense } from "../content/rule.ts";
import { retryOnce, searchAic, searchCommons, searchMet, usPublicDomainRecording, wikipediaArticle, type Reference } from "../content/search.ts";
import { sourceRef, storagePath, type SourceRef } from "../content/sources.ts";
import { fetchFromSource, syncItem, type SyncDeps } from "../content/sync.ts";
import { USER_AGENT, type FetchedItem } from "../content/types.ts";
import type { complete, ImageType } from "../model.ts";
import { readPrompt } from "../prompts.ts";
import { runRow, type Meter } from "../runs.ts";
import type { DaySlot } from "../../lib/lenses.ts";
import { GRADE_BANDS, SUBJECTS, type PlanSource } from "../../lib/plan.ts";
import { CRON_ACTION, type CronRow, type CronTarget, type ThemeRow } from "./cron.ts";
import { LESSONS_ACTION, type Candidate, type Check, type Draft, type FiringDeps, type LessonIdea, type Need, type RoundDeps, type WriterContext } from "./lessons.ts";
import { prepareWeek } from "./week-job.ts";

const BUCKET = "content";
const MODEL_MAX_BYTES = 5 * 1024 * 1024;
const MODEL_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);
const SOURCE_NAMES: Record<string, string> = { met: "The Metropolitan Museum of Art", aic: "The Art Institute of Chicago", commons: "Wikimedia Commons" };
export const CANDIDATES = 4; // the most the writer is shown for one idea

// What each tile is for, for the writer (lesson-ideas.md says the same at more length).
const TILE_JOB: Record<DaySlot, string> = {
  look: "look: a picture to look at closely, and one idea about how it was made or what it shows",
  wonder: "wonder: a why or a how about the natural or the made world, with a picture that shows it",
  listen: "listen: a recording to listen to, and one idea about what to hear in it",
  then: "then: a moment in the past, a person who made or figured something out, or a fable, myth, story or poem",
  puzzle: "puzzle: a piece of mathematics with something to work out, with a picture of something real that shows it",
};

// An open candidate as the writer and the store need it.
export type Found = Candidate & { ref: SourceRef; item: FetchedItem; record: string; image?: { data: Uint8Array; mediaType: ImageType } };

type Reply = { data: unknown; error: { message: string } | null };
function must<R extends Reply>(r: R, what: string): NonNullable<R["data"]> {
  if (r.error) throw new Error(`${what}: ${r.error.message}`);
  if (r.data === null || r.data === undefined) throw new Error(`${what}: nothing came back`);
  return r.data as NonNullable<R["data"]>;
}

const weekday = (date: string) => new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

// A credit line that would read wrong under the picture: the writer skips such a candidate (tonight's Found, not
// built 2, met only where the app's own writing meets it).
export function creditProblem(c: Credit): string | null {
  const all = [c.title, ...c.lines].join(" | ");
  if (/QS:|P\d{3,}/.test(all)) return "Wikidata codes in its credit line";
  if (/(unknown author)\s*\1/i.test(all)) return "a doubled \"Unknown author\"";
  if (c.title.length > 160) return "a title too long to credit";
  return null;
}

// The item as the writer reads it: what its source says, and its credit line.
function recordOf(source: string, item: FetchedItem, lines: string[]): string {
  const m = item.metadata;
  return [
    `Title: ${item.title}`,
    `Maker: ${item.creator ?? "unknown"}`,
    `Date: ${m.date ?? "unknown"}`,
    `Kind: ${item.type}${m.description ? `; ${m.description}` : ""}`,
    Array.isArray(m.tags) && m.tags.length ? `Tags: ${(m.tags as string[]).slice(0, 12).join(", ")}` : null,
    `Source: ${SOURCE_NAMES[source] ?? source}; license: ${item.license}`,
    `Credit as shown: ${lines.join(" · ")}`,
  ]
    .filter(Boolean)
    .join("\n");
}

const slugOf = (title: string) =>
  title
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter((w) => !["the", "a", "an", "and", "of", "how", "why"].includes(w))
    .slice(0, 5)
    .join("-") || "lesson";

const IDEAS_SCHEMA = {
  type: "object",
  properties: {
    ideas: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          subject: { type: "string", enum: [...SUBJECTS] },
          holiday: { type: "boolean" },
          article: { type: "string" },
          shows: { type: "string" },
          searches: {
            type: "array",
            items: {
              type: "object",
              properties: { source: { type: "string", enum: ["met", "aic", "commons"] }, query: { type: "string" } },
              required: ["source", "query"],
              additionalProperties: false,
            },
          },
        },
        required: ["title", "subject", "holiday", "article", "shows", "searches"],
        additionalProperties: false,
      },
    },
  },
  required: ["ideas"],
  additionalProperties: false,
};

const DRAFT_SCHEMA = {
  type: "object",
  properties: {
    use: { type: "array", items: { type: "integer" } },
    title: { type: "string" },
    subject: { type: "string", enum: [...SUBJECTS] },
    summary_2_3: { type: "string" },
    summary_4_5: { type: "string" },
    parent_note: { type: "string" },
  },
  required: ["use", "title", "subject", "summary_2_3", "summary_4_5", "parent_note"],
  additionalProperties: false,
};

const CHECK_SCHEMA = {
  type: "object",
  properties: {
    unsupported: {
      type: "array",
      items: { type: "object", properties: { claim: { type: "string" }, why: { type: "string" } }, required: ["claim", "why"], additionalProperties: false },
    },
    repeats: { type: "string" },
    values_points: { type: "array", items: { type: "integer" } },
    whole_hawaii: { type: "boolean" },
    title_names_idea: { type: "boolean" },
  },
  required: ["unsupported", "repeats", "values_points", "whole_hawaii", "title_names_idea"],
  additionalProperties: false,
};

// The deps for one round of writing, for a firing's own model call and tally.
export function makeRoundDeps(db: SupabaseClient, ai: { complete: typeof complete; meter: Meter }): RoundDeps<Found> {
  const run = ai.complete;
  const download = async (url: string) => {
    const aic: Record<string, string> = new URL(url).hostname.endsWith("artic.edu") ? { "AIC-User-Agent": USER_AGENT } : {};
    const res = await retryOnce(() => fetch(url, { headers: { "User-Agent": USER_AGENT, ...aic } }));
    if (!res.ok) throw new Error(`${url} answered ${res.status}`);
    return { data: new Uint8Array(await res.arrayBuffer()), contentType: res.headers.get("content-type") ?? "" };
  };

  // content:fetch's store, for one item the writer chose: fetched (already, by the search), its image copied into the
  // private bucket, flagged by the gate's model on this firing's meter, and the approval rule applied.
  const sourceIds = new Map<string, string>();
  const sourceId = async (slug: string) => {
    if (!sourceIds.has(slug)) {
      const row = must(await db.from("content_sources").select("id").eq("slug", slug).single(), "content_sources") as { id: string };
      sourceIds.set(slug, row.id);
    }
    return sourceIds.get(slug)!;
  };
  const syncDeps = (found: Found): SyncDeps => ({
    async existing({ source, externalId }) {
      const { data, error } = await db
        .from("content_items")
        .select("title, license, flags, approved, rejected_at")
        .eq("source_id", await sourceId(source))
        .eq("external_id", externalId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    },
    fetchItem: async () => found.item,
    download,
    flag: (item, image) => flagItem(item, image, run),
    async upload(path, file) {
      const { error } = await db.storage.from(BUCKET).upload(path, file.data, { contentType: file.contentType, upsert: true });
      if (error) throw new Error(`Storage ${path}: ${error.message}`);
    },
    async save({ source, ...row }) {
      const { error } = await db.from("content_items").insert({ source_id: await sourceId(source), ...row });
      if (error) throw new Error(error.message);
    },
  });

  return {
    now: () => new Date(),

    async ideas(need, ctx, rejected) {
      const prompt = [
        `The tile: ${TILE_JOB[need.slot]}.`,
        `The date: ${weekday(need.date)}.`,
        need.holiday ? `A holiday that day: ${need.holiday}. Make the first idea about it, if one can be written that stays clear of every subject the app never writes about.` : "No holiday that day: propose ordinary ideas, each holiday: false.",
        need.hawaiiDays.length ? `In Hawaiʻi it is also ${need.hawaiiDays.join(" and ")}: not a lesson of its own, only a possible tie-in line if an article states one.` : null,
        `Subjects lately on this tile, most recent last: ${(ctx.recent[need.slot] ?? []).join(", ") || "none yet"}.`,
        rejected.length ? `Already tried for this tile today, and not used: ${rejected.join("; ")}.` : null,
        "",
        "Every lesson and topic the family has already had (propose none of these again, under any name):",
        ...ctx.used.map((t) => `- ${t}`),
      ].filter((l) => l !== null);
      const reply = await run<{ ideas: LessonIdea[] }>({ system: readPrompt("lesson-ideas.md"), prompt: prompt.join("\n"), json: IDEAS_SCHEMA, use: "curate", maxTokens: 6000, label: `lesson-ideas-${need.slot}` });
      return reply.ideas.slice(0, 3);
    },

    reference: (article) => wikipediaArticle(article),

    async candidates(idea, slot) {
      const audio = slot === "listen";
      const urls: { url: string; templates?: string[] }[] = [];
      for (const s of idea.searches.slice(0, 3)) {
        try {
          if (audio || s.source === "commons") urls.push(...(await searchCommons(s.query, audio ? "audio" : "image")));
          else if (s.source === "met") urls.push(...(await searchMet(s.query)).map((url) => ({ url })));
          else urls.push(...(await searchAic(s.query)).map((url) => ({ url })));
        } catch {
          // one source down is one search fewer, never the end of the firing
        }
      }
      const seen = new Set<string>();
      const found: Found[] = [];
      for (const { url, templates } of urls) {
        if (found.length >= CANDIDATES) break;
        if (seen.has(url)) continue;
        seen.add(url);
        if (audio && !usPublicDomainRecording(templates ?? [])) continue; // a recording only when public domain in the US
        try {
          const ref = sourceRef(url);
          const item = await retryOnce(() => fetchFromSource(ref, {}));
          if (item.type !== (audio ? "audio" : "image")) continue;
          if (!isOpenLicense(item.license)) continue; // CC0 or public domain, as the approval rule reads it
          const c = credit({ type: item.type, title: item.title, creator: item.creator, date: item.metadata.date ?? null, source: SOURCE_NAMES[ref.source] ?? null, license: item.license, attribution: item.attribution });
          if (creditProblem(c)) continue;
          let image: Found["image"];
          if (!audio) {
            const look = await download(item.thumbnail_url ?? item.url).catch(() => null);
            const type = look?.contentType.split(";")[0].trim().toLowerCase();
            if (look && type && MODEL_TYPES.has(type) && look.data.byteLength <= MODEL_MAX_BYTES) image = { data: look.data, mediaType: type as ImageType };
            if (!image) continue; // a picture the writer cannot see is not offered
          }
          found.push({ n: found.length + 1, url, type: item.type, title: item.title, license: item.license, ref, item, record: recordOf(ref.source, item, c.lines), image });
        } catch {
          // an item that will not fetch is skipped
        }
      }
      return found;
    },

    async write({ need, idea, candidates, reference, problems }) {
      const pictures = candidates.filter((c) => c.image);
      const prompt = [
        `The tile: ${TILE_JOB[need.slot]}.`,
        `The date: ${weekday(need.date)}.${need.holiday && idea.holiday ? ` It is ${need.holiday}, and this lesson is about that day.` : ""}`,
        `The idea: ${idea.title}. Subject: ${idea.subject}. What the item must show: ${idea.shows}`,
        "",
        pictures.length ? `The pictures above are candidates ${pictures.map((c) => c.n).join(", ")}, in that order.` : "The candidates are recordings: their records are below.",
        ...candidates.flatMap((c) => ["", `Candidate ${c.n}:`, c.record]),
        "",
        `The Wikipedia article, "${reference.title}":`,
        reference.text,
        ...(problems.length ? ["", "Your last draft of this lesson had these problems. Write it again without them:", ...problems.map((p) => `- ${p}`)] : []),
      ];
      return run<Draft>({
        system: readPrompt("lesson.md"),
        prompt: prompt.join("\n"),
        images: pictures.map((c) => c.image!),
        json: DRAFT_SCHEMA,
        use: "curate",
        maxTokens: 8000,
        label: `lesson-${need.slot}`,
      });
    },

    async check({ draft, items, reference, ctx }) {
      const prompt = [
        `The lesson: ${draft.title} (${draft.subject})`,
        `Summary for the younger child: ${draft.summary_2_3}`,
        `Summary for the older child: ${draft.summary_4_5}`,
        `Parent note: ${draft.parent_note || "none"}`,
        "",
        ...items.flatMap((c, i) => [`Item ${i + 1}:`, c.record, ""]),
        `The Wikipedia article, "${reference.title}":`,
        reference.text,
        "",
        "Every title the family has already had:",
        ...ctx.used.map((t) => `- ${t}`),
      ];
      return run<Check>({ system: readPrompt("lesson-check.md"), prompt: prompt.join("\n"), json: CHECK_SCHEMA, use: "gate", maxTokens: 6000, label: "lesson-check" });
    },

    async store(c) {
      const result = await syncItem(c.ref, { title: c.title }, syncDeps(c));
      return result.status === "approved";
    },

    // Two plan_topics rows, one a grade band, keyed app/<key>/<band>: plan:import deletes only the rows of its own
    // files (short/...), so a lesson the app wrote survives it. Positioned after every lesson there is, so each lands
    // on the day it was written for.
    async save({ need, draft, items }) {
      const title = draft.title.trim();
      if (!title || !draft.summary_2_3.trim() || !draft.summary_4_5.trim()) throw new Error("the writer left a title or a summary empty");
      const base = slugOf(title);
      const keys = must(await db.from("plan_topics").select("key").or(`key.like.app/${base}%,key.like.short/${base}%`), "plan_topics") as { key: string }[];
      const taken = new Set(keys.map((k) => k.key.split("/")[1]));
      let key = base;
      for (let i = 2; taken.has(key); i++) key = `${base}-${i}`;
      const top = must(await db.from("plan_topics").select("position").eq("kind", "short").order("position", { ascending: false }).limit(1), "plan_topics") as { position: number | null }[];
      const position = Math.max(100_000, top[0]?.position ?? 0) + 1;
      const sources: PlanSource[] = items.map((c) => ({
        id: `${c.ref.source}-${storagePath(c.ref.source, c.ref.externalId, "x").split("/")[1].replace(/\.x$/, "").toLowerCase()}`.slice(0, 80),
        title: c.title,
        publisher: c.ref.source === "met" ? `The Metropolitan Museum of Art, ${String(c.item.metadata.accession ?? "")}`.replace(/, $/, "") : SOURCE_NAMES[c.ref.source],
        url: c.url,
        license: c.license,
      }));
      const rows = GRADE_BANDS.map((band) => ({
        key: `app/${key}/${band}`,
        parent_id: null,
        kind: "short",
        position,
        sequence: 0,
        week: null,
        grade_band: band,
        subject: draft.subject,
        slot: need.slot,
        title,
        summary: (band === "2-3" ? draft.summary_2_3 : draft.summary_4_5).trim(),
        sources,
        perspective: null,
        values_points: [],
        parent_note: draft.parent_note.trim() || null,
      }));
      must(await db.from("plan_topics").insert(rows).select("id"), "plan_topics");
      return key;
    },

    async context(): Promise<WriterContext> {
      const rows = must(
        await db.from("plan_topics").select("title, slot, subject, kind, position").in("kind", ["short", "thread"]).eq("grade_band", "2-3"),
        "plan_topics",
      ) as { title: string; slot: DaySlot | null; subject: string; kind: string; position: number | null }[];
      const recent: WriterContext["recent"] = {};
      const lessons = rows.filter((r) => r.kind === "short" && r.slot).sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
      for (const slot of ["look", "wonder", "listen", "then", "puzzle"] as DaySlot[]) recent[slot] = lessons.filter((l) => l.slot === slot).slice(-8).map((l) => l.subject);
      return { used: [...new Set(rows.map((r) => r.title))], recent };
    },

    async takenHolidays(familyId, week) {
      const rows = must(
        await db.from("audit_log").select("target").eq("family_id", familyId).eq("action", LESSONS_ACTION).eq("target->>outcome", "wrote").eq("target->>week", String(week)),
        "audit_log",
      ) as { target: { lessons?: { holiday: string | null }[] } }[];
      return new Set(rows.flatMap((r) => (r.target.lessons ?? []).map((l) => l.holiday)).filter((h): h is string => !!h));
    },

    async recentRows(familyId, since) {
      return must(
        await db.from("audit_log").select("id, created_at, target").eq("family_id", familyId).eq("action", LESSONS_ACTION).gte("created_at", since.toISOString()).order("created_at"),
        "audit_log",
      ) as CronRow[];
    },

    async audit(familyId, target: CronTarget) {
      const row = must(await db.from("audit_log").insert({ family_id: familyId, guardian_id: null, action: LESSONS_ACTION, target }).select("id").single(), "audit_log");
      return row.id as string;
    },

    spent: () => runRow("lessons", ai.meter.usage(), { ok: true, startedAt: new Date() }).cost,

    // What the writing spent, for /parent/models: counts and money only. Before the migration that lets model_runs
    // take kind lessons is applied, the row is refused; the audit row still carries the cost.
    async recordRun(familyId, week, ok) {
      if (ai.meter.usage().length === 0) return;
      const row = runRow("lessons", ai.meter.usage(), { ok, startedAt: new Date(), week });
      const { error } = await db.from("model_runs").insert({ family_id: familyId, ...row });
      if (error) console.error(`lessons: could not record this run for /parent/models: ${error.message}`);
    },
  };
}

// What a lesson firing needs on top of a round: the family, its weeks, the env and the week's open day-slots.
const NEEDED = ["QUARK_MODEL_CURATE", "QUARK_MODEL_GATE", "ANTHROPIC_API_KEY"] as const;

export function makeFiringDeps(db: SupabaseClient, ai: { complete: typeof complete; meter: Meter }, env: Record<string, string | undefined> = process.env): FiringDeps<Found> {
  return {
    ...makeRoundDeps(db, ai),
    families: async () => must(await db.from("families").select("id, timezone"), "families") as { id: string; timezone: string }[],
    children: async (familyId) => must(await db.from("children").select("id, nickname").eq("family_id", familyId), "children") as { id: string; nickname: string }[],
    themes: async (familyId) => must(await db.from("themes").select("id, week_start, plan_week, status").eq("family_id", familyId), "themes") as ThemeRow[],
    async ownThemes(familyId) {
      const rows = must(await db.from("audit_log").select("target").eq("family_id", familyId).eq("action", CRON_ACTION).eq("target->>outcome", "theme"), "audit_log") as { target: CronTarget }[];
      return new Set(rows.map((r) => r.target.theme).filter((id): id is string => !!id));
    },
    envProblem() {
      const missing = NEEDED.filter((name) => !env[name]);
      return missing.length ? `${missing.join(", ")} ${missing.length === 1 ? "isn't" : "aren't"} set where the writer runs` : null;
    },
    async gaps(week, start) {
      const p = await prepareWeek(db, { week, start });
      return { gaps: p.gaps, start: p.start };
    },
  };
}

export type { Need };
