// Fill content_items for every source the imported plan names: fetch each item, keep a copy of its
// image in Storage, have the gate model tag it, apply the approval rule (docs/04).
//   npm run content:fetch
// Safe to run again: items already in the table are left alone. Stops at the first failure and
// names the item; nothing is skipped silently.

import { createClient } from "@supabase/supabase-js";
import { flagItem } from "../core/content/flag.ts";
import { sourceRef, type SourceRef } from "../core/content/sources.ts";
import { fetchFromSource, syncItem, type SyncDeps, type SyncResult } from "../core/content/sync.ts";
import { USER_AGENT } from "../core/content/types.ts";
import { usageSoFar } from "../core/model.ts";
import { runRow } from "../core/runs.ts";
import type { PlanSource } from "../lib/plan.ts";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local.");
const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const BUCKET = "content";

// The private bucket for copies. Created here, so there is nothing to set in the dashboard.
const bucket = await db.storage.getBucket(BUCKET);
if (bucket.error) {
  const made = await db.storage.createBucket(BUCKET, { public: false });
  if (made.error) throw new Error(`Could not create the ${BUCKET} bucket: ${made.error.message}`);
  console.log(`Created the private ${BUCKET} bucket.`);
}

const sources = await db.from("content_sources").select("id, slug");
if (sources.error) throw new Error(sources.error.message);
const sourceId = new Map(sources.data.map((s) => [s.slug, s.id as string]));

// Every source the plan names, once each, in plan order.
const topics = await db.from("plan_topics").select("sources").neq("sources", "[]").order("sequence").order("week").order("key");
if (topics.error) throw new Error(topics.error.message);
const wanted = new Map<string, { ref: SourceRef; title: string }>();
for (const t of topics.data) {
  for (const s of t.sources as PlanSource[]) {
    if (!wanted.has(s.url)) wanted.set(s.url, { ref: sourceRef(s.url), title: s.title });
  }
}
if (wanted.size === 0) throw new Error("The plan names no sources. Run npm run plan:import first.");

const idFor = (source: string) => {
  const id = sourceId.get(source);
  if (!id) throw new Error(`content_sources has no row for ${source}. Run npm run db:push.`);
  return id;
};

const deps: SyncDeps = {
  async existing({ source, externalId }) {
    const { data, error } = await db
      .from("content_items")
      .select("title, license, flags, approved, rejected_at")
      .eq("source_id", idFor(source))
      .eq("external_id", externalId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  },
  fetchItem: fetchFromSource,
  async download(fileUrl) {
    const res = await fetch(fileUrl, { headers: { "User-Agent": USER_AGENT } });
    if (!res.ok) throw new Error(`${fileUrl} answered ${res.status}`);
    return { data: new Uint8Array(await res.arrayBuffer()), contentType: res.headers.get("content-type") ?? "" };
  },
  flag: flagItem,
  async upload(path, file) {
    const { error } = await db.storage.from(BUCKET).upload(path, file.data, { contentType: file.contentType, upsert: true });
    if (error) throw new Error(`Storage ${path}: ${error.message}`);
  },
  async save({ source, ...row }) {
    const { error } = await db.from("content_items").insert({ source_id: idFor(source), ...row });
    if (error) throw new Error(error.message);
  },
};

// What the run spent on flagging, for /parent/models, recorded even when a fetch stops the run.
const families = await db.from("families").select("id");
if (families.error) throw new Error(families.error.message);
if (families.data.length !== 1) throw new Error(`Expected one family, found ${families.data.length}. Run npm run seed.`);
const started = new Date();
async function recordRun(ok: boolean) {
  const row = runRow("content:fetch", usageSoFar(), { ok, startedAt: started });
  const { error } = await db.from("model_runs").insert({ family_id: families.data![0].id, ...row });
  if (error) console.error(`Could not record this run for /parent/models: ${error.message}. Run npm run db:push?`);
  else if (row.models.length) console.log(`Flagging cost $${row.cost.toFixed(2)}${row.cost_complete ? "" : " plus models without a known price"}.`);
}

const results: SyncResult[] = [];
try {
  for (const { ref, title } of wanted.values()) {
    const result = await syncItem(ref, { title }, deps);
    results.push(result);
    // One item at a time, a second apart, as AIC asks and the Met's firewall prefers.
    if (result.changed) await new Promise((r) => setTimeout(r, 1000));
  }
} catch (e) {
  await recordRun(false);
  throw e;
}
await recordRun(true);

const cut = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);
const table = results.map((r) => [cut(r.item, 52), cut(r.license, 22), r.flags.join(", ") || "-", r.status]);
const widths = [0, 1, 2].map((i) => Math.max(...table.map((row) => row[i].length), ["item", "license", "flags"][i].length));
const line = (cells: string[]) => cells.map((c, i) => (i < 3 ? c.padEnd(widths[i]) : c)).join("  ");
console.log(line(["item", "license", "flags", "status"]));
for (const row of table) console.log(line(row));

const changed = results.filter((r) => r.changed).length;
const count = (status: string) => results.filter((r) => r.status === status).length;
console.log(
  changed === 0
    ? `Nothing changed: all ${results.length} items were already fetched.`
    : `Fetched ${changed} of ${results.length} items.`,
);
console.log(`${count("approved")} approved, ${count("pending")} pending, ${count("manual")} to check by hand, ${count("rejected")} rejected.`);
if (count("pending") + count("manual")) console.log("Review the waiting ones at /parent/content.");
