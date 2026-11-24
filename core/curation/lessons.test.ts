import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { usPublicDomainRecording } from "../content/search";
import type { CronRow, CronTarget, ThemeRow } from "./cron";
import { hawaiiDaysOn, holidaysOn } from "./holidays";
import { lessonsFiring, nextNeeds, writeLesson, writeRound, type Candidate, type Check, type Draft, type FiringDeps, type LessonIdea, type Need, type WriterDeps } from "./lessons";
import type { Gap } from "./schedule";

// Invented children only (Pip and Wren, as gate.test.ts has).
const kids = [
  { id: "c1", nickname: "Pip" },
  { id: "c2", nickname: "Wren" },
];

describe("holidays", () => {
  it("works out the fixed and the moving ones from the date", () => {
    expect(holidaysOn("2026-11-26")).toEqual(["Thanksgiving"]);
    expect(holidaysOn("2026-11-11")).toEqual(["Veterans Day"]);
    expect(holidaysOn("2027-01-18")).toEqual(["Martin Luther King Jr. Day"]); // the third Monday
    expect(holidaysOn("2027-05-31")).toEqual(["Memorial Day"]); // the last Monday
    expect(holidaysOn("2026-12-25")).toEqual(["Christmas Day"]);
    expect(holidaysOn("2026-11-30")).toEqual([]);
  });

  it("keeps the Hawaiʻi days apart, for a tie-in line only", () => {
    expect(holidaysOn("2026-11-28")).toEqual([]);
    expect(hawaiiDaysOn("2026-11-28")).toEqual(["Lā Kūʻokoʻa"]);
    expect(hawaiiDaysOn("2027-08-20")).toEqual(["Statehood Day"]); // the third Friday of August
  });
});

describe("nextNeeds", () => {
  const gaps = (days: number[], slots: Gap["slot"][]): Gap[] => days.flatMap((day) => slots.map((slot) => ({ day, slot })));

  it("asks each tile for its next open day only, so each lesson lands on the day it was written for", () => {
    const needs = nextNeeds(gaps([3, 4, 5, 6, 7], ["look", "wonder"]).concat(gaps([5, 6, 7], ["then"])), "2026-11-30", new Set());
    expect(needs.map((n) => [n.slot, n.day, n.date])).toEqual([
      ["look", 3, "2026-12-02"],
      ["wonder", 3, "2026-12-02"],
      ["then", 5, "2026-12-04"],
    ]);
  });

  it("gives a holiday to one tile, then first, and not again once a lesson carries it", () => {
    const week = gaps([4, 5, 6, 7], ["look", "wonder", "listen", "then"]); // week 5's dates: day 4 is Thanksgiving
    const needs = nextNeeds(week, "2026-11-23", new Set());
    expect(needs.filter((n) => n.holiday).map((n) => [n.slot, n.holiday])).toEqual([["then", "Thanksgiving"]]);
    expect(nextNeeds(week, "2026-11-23", new Set(["Thanksgiving"])).some((n) => n.holiday)).toBe(false);
    expect(nextNeeds(gaps([6], ["look"]), "2026-11-23", new Set())[0]).toMatchObject({ holiday: null, hawaiiDays: ["Lā Kūʻokoʻa"] });
  });
});

describe("a recording is used only when it is public domain in the US", () => {
  it("reads the Commons page's templates", () => {
    expect(usPublicDomainRecording(["Template:PD-Layout", "Template:PD-USGov-Military-Marines"])).toBe(true);
    expect(usPublicDomainRecording(["Template:Cc-zero"])).toBe(true);
    expect(usPublicDomainRecording(["Template:PD-US-expired-text"])).toBe(true);
    // An Edison record that Commons marks as not yet public domain in the US (read 23 Nov 2026).
    expect(usPublicDomainRecording(["Template:Not-PD-US-record-expired-min-year", "Template:PD-Edison Records", "Template:PD-Layout"])).toBe(false);
    expect(usPublicDomainRecording(["Template:PD-old-70"])).toBe(false);
    expect(usPublicDomainRecording(["Template:Cc-by-sa-4.0"])).toBe(false);
  });
});

// --- One lesson against a small world ---

const need: Need = { slot: "look", day: 1, date: "2026-11-30", holiday: null, hawaiiDays: [] };
const idea = (title: string, over: Partial<LessonIdea> = {}): LessonIdea => ({ title, subject: "art", holiday: false, article: title, shows: "it", searches: [{ source: "met", query: title }], ...over });
const draft = (title: string, use = [1]): Draft => ({ use, title, subject: "art", summary_2_3: "A fact.", summary_4_5: "A deeper fact.", parent_note: "" });
const fine: Check = { unsupported: [], repeats: "", values_points: [], whole_hawaii: false, title_names_idea: true };
const found = (title: string): Candidate[] => [
  { n: 1, url: `https://www.metmuseum.org/art/collection/search/1`, type: "image", title: `${title} picture`, license: "CC0" },
  { n: 2, url: `https://www.metmuseum.org/art/collection/search/2`, type: "image", title: `${title} second`, license: "CC0" },
];

function writer(over: { ideas?: LessonIdea[][]; candidates?: Record<string, Candidate[]>; checks?: Check[]; flagged?: string[]; articles?: string[] } = {}) {
  let clock = Date.parse("2026-11-24T00:00:00Z");
  const calls = { ideas: 0, write: [] as { title: string; problems: string[] }[], check: 0, store: [] as string[], saved: [] as string[] };
  const checks = [...(over.checks ?? [])];
  const deps: WriterDeps = {
    now: () => new Date(clock),
    ideas: async () => (over.ideas ?? [[idea("The Harvesters, and far things pale")]])[calls.ideas++] ?? [],
    reference: async (article) => ((over.articles ?? [article]).includes(article) ? { title: article, url: "https://en.wikipedia.org/wiki/x", text: "The article." } : null),
    candidates: async (i) => (over.candidates ? over.candidates[i.title] ?? [] : found(i.title)),
    write: async ({ idea: i, problems }) => {
      calls.write.push({ title: i.title, problems });
      clock += 30_000;
      return draft(i.title);
    },
    check: async () => {
      calls.check += 1;
      clock += 20_000;
      return checks.shift() ?? fine;
    },
    store: async (c) => {
      calls.store.push(c.title);
      return !(over.flagged ?? []).includes(c.title);
    },
    save: async ({ draft: d }) => {
      calls.saved.push(d.title);
      return d.title.toLowerCase().replace(/[^a-z]+/g, "-");
    },
  };
  return { deps, calls, deadline: clock + 600_000 };
}
const ctx = { used: ["Why ice floats"], recent: {} };

describe("writing one lesson", () => {
  it("writes from the first idea whose article, picture, draft and check all hold, and stores its item", async () => {
    const w = writer();
    const r = await writeLesson(need, ctx, w.deps, w.deadline);
    expect(r).toMatchObject({ key: "the-harvesters-and-far-things-pale", slot: "look", day: 1, tries: 1, items: ["https://www.metmuseum.org/art/collection/search/1"] });
    expect(w.calls.store).toEqual(["The Harvesters, and far things pale picture"]);
  });

  it("sends a draft back once with the claims its sources do not support, and saves it when the second holds", async () => {
    const w = writer({ checks: [{ ...fine, unsupported: [{ claim: "every snowflake has six arms", why: "the article says most are irregular" }] }, fine] });
    expect(await writeLesson(need, ctx, w.deps, w.deadline)).toMatchObject({ tries: 1 });
    expect(w.calls.write[1].problems).toEqual(["Not supported by the article or the records: every snowflake has six arms (the article says most are irregular)"]);
  });

  it("moves to the next idea when a claim stays unsupported, when it touches a values point, repeats an idea, or is a whole Hawaiʻi lesson", async () => {
    const bad = { ...fine, unsupported: [{ claim: "a thousand years", why: "the article says about 650" }] };
    const w = writer({
      ideas: [[idea("A"), idea("B"), idea("C")], [idea("D"), idea("E")]],
      checks: [bad, bad, { ...fine, values_points: [5] }, { ...fine, repeats: "Why ice floats" }, { ...fine, whole_hawaii: true }, fine],
    });
    const r = await writeLesson(need, ctx, w.deps, w.deadline);
    expect(r).toMatchObject({ title: "E", tries: 5 });
    expect(w.calls.saved).toEqual(["E"]);
  });

  it("never writes text only: an idea with no open picture, no article, or a flagged first item is passed over", async () => {
    const w = writer({
      ideas: [[idea("No picture"), idea("No article", { article: "Missing" }), idea("Flagged"), idea("Good")]],
      candidates: { "No picture": [], "No article": found("No article"), Flagged: found("Flagged"), Good: found("Good") },
      articles: ["No picture", "Flagged", "Good"],
      flagged: ["Flagged picture"],
    });
    const r = await writeLesson(need, ctx, w.deps, w.deadline);
    expect(r).toMatchObject({ title: "Good", tries: 4 });
    expect(w.calls.saved).toEqual(["Good"]);
  });

  it("skips an idea already in the library without searching for it", async () => {
    const w = writer({ ideas: [[idea("why ice floats"), idea("Snow")]] });
    expect(await writeLesson(need, ctx, w.deps, w.deadline)).toMatchObject({ title: "Snow", tries: 2 });
  });

  it("reports the tile missed, with why each idea failed, when time runs out, and saves nothing", async () => {
    const w = writer({ ideas: [[idea("A")], [idea("B")]], candidates: {} });
    const r = await writeLesson(need, ctx, w.deps, Date.parse("2026-11-24T00:01:30Z")); // under one try's time left
    expect(r).toEqual({ slot: "look", day: 1, date: "2026-11-30", tried: [] });
    const all = writer({ ideas: [[idea("A")], [idea("B")]], candidates: {} });
    expect(await writeLesson(need, ctx, all.deps, all.deadline)).toMatchObject({ tried: [{ title: "A", why: "no open picture" }, { title: "B", why: "no open picture" }] });
  });

  it("marks the lesson that carries the day's holiday", async () => {
    const w = writer({ ideas: [[idea("Sarah Josepha Hale and Thanksgiving", { holiday: true })]] });
    expect(await writeLesson({ ...need, holiday: "Thanksgiving" }, ctx, w.deps, w.deadline)).toMatchObject({ holiday: "Thanksgiving" });
  });
});

// --- A firing ---

function firing(over: { gaps?: Gap[]; themes?: ThemeRow[]; blockedBy?: boolean; throwIn?: string } = {}) {
  const w = writer({ ideas: Array.from({ length: 20 }, (_, i) => [idea(`Idea ${i}`)]) });
  let n = 0;
  const log: CronRow[] = [];
  let open = [...(over.gaps ?? [{ day: 1, slot: "look" as const }, { day: 1, slot: "then" as const }, { day: 2, slot: "look" as const }])];
  const deps: FiringDeps = {
    ...w.deps,
    save: async (input) => {
      open = open.filter((g) => !(g.slot === input.need.slot && g.day === input.need.day));
      if (over.throwIn) throw new Error(over.throwIn);
      return w.deps.save(input);
    },
    families: async () => [{ id: "f1", timezone: "Pacific/Honolulu" }],
    children: async () => kids,
    themes: async () => over.themes ?? [{ id: "t5", week_start: "2026-11-23", plan_week: 5, status: "live" }],
    ownThemes: async () => new Set(),
    envProblem: () => null,
    gaps: async () => ({ gaps: [...open], start: "2026-11-30" }),
    context: async () => ctx,
    takenHolidays: async () => new Set(),
    recentRows: async () => (over.blockedBy ? [{ id: "a0", created_at: "2026-11-23T23:59:00Z", target: { outcome: "started", week: 6, day: null, theme: null } }, ...log] : [...log]),
    audit: async (_f, target: CronTarget) => {
      const id = `a${++n}`;
      log.push({ id, created_at: new Date(Date.parse("2026-11-24T00:00:00Z") + n * 1000).toISOString(), target });
      return id;
    },
    spent: () => 0.92,
    recordRun: async () => {},
  };
  return { deps, log };
}

describe("a lesson firing", () => {
  it("writes next week's next lesson for each tile that lacks one, and records each, naming no child", async () => {
    const f = firing();
    const reply = await lessonsFiring(f.deps);
    expect(reply).toMatchObject({ outcome: "wrote", week: 6, written: 2, missed: 0, left: 1, cost: 0.92 });
    expect(f.log.map((r) => r.target.outcome)).toEqual(["started", "wrote"]);
    expect(f.log[0].target).toMatchObject({ week: 6, day: null, by: "lessons", tiles: ["then day 1", "look day 1"] });
    expect((f.log[1].target.lessons as { slot: string; day: number }[]).map((l) => [l.slot, l.day])).toEqual([["then", 1], ["look", 1]]);
    expect(JSON.stringify([f.log, reply])).not.toMatch(/Pip|Wren/);
  });

  it("does nothing, leaves no row and spends nothing when next week has all its lessons", async () => {
    const f = firing({ gaps: [] });
    expect(await lessonsFiring(f.deps)).toMatchObject({ outcome: "nothing", week: 6, reason: "week 6 has all its short lessons" });
    expect(f.log).toEqual([]);
  });

  it("stands aside when another firing is writing the same week", async () => {
    const f = firing({ blockedBy: true });
    expect(await lessonsFiring(f.deps)).toMatchObject({ outcome: "refused", reason: "another firing is writing week 6's short lessons" });
    expect(f.log.map((r) => r.target.outcome)).toEqual(["started", "refused"]);
  });

  it("records a lesson that failed to save as a tile missed, with the nickname taken out", async () => {
    const f = firing({ throwIn: "plan_topics: Wren's row refused", gaps: [{ day: 1, slot: "look" }] });
    const r = await writeRound(f.deps, { familyId: "f1", names: ["Pip", "Wren"], week: 6, gaps: [{ day: 1, slot: "look" }], start: "2026-11-30", deadline: Date.parse("2026-11-24T00:04:30Z"), by: "lessons" });
    expect(r.kind).toBe("done");
    expect(JSON.stringify(f.log)).not.toMatch(/Wren/);
    expect(JSON.stringify(f.log)).toMatch(/\[child\]'s row refused/);
  });
});

describe("a lesson the app wrote survives plan:import", () => {
  it("is keyed app/..., and the import deletes only rows under its own files' prefixes", () => {
    const job = readFileSync(new URL("./lessons-job.ts", import.meta.url), "utf8");
    expect(job).toMatch(/key: `app\/\$\{key\}\/\$\{band\}`/);
    const importer = readFileSync(new URL("../../scripts/import-plan.mts", import.meta.url), "utf8");
    expect(importer).toMatch(/prefix: "short\/"/);
    expect(importer).toMatch(/\.like\("key", `\$\{unit\.prefix\}%`\)/);
  });
});
