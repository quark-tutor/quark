// Load plan/*.yaml into plan_topics, the app's copy of the plan.
//   npm run plan:import
// Safe to run again: rows are matched by key and updated. Rows of a stretch that its file no
// longer has are deleted (this fails loudly if an idea or skill still points at one).

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { parsePlan, planRows, validatePlan } from "../lib/plan.ts";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local.");
const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

const dir = join(import.meta.dirname, "..", "plan");
const plans = readdirSync(dir)
  .filter((f) => f.endsWith(".yaml"))
  .map((f) => {
    const plan = parsePlan(readFileSync(join(dir, f), "utf8"));
    const errors = validatePlan(plan);
    if (errors.length) throw new Error(`plan/${f}:\n  ${errors.join("\n  ")}`);
    if (`${plan.stretch}.yaml` !== f) throw new Error(`plan/${f}: stretch must match the file name`);
    return plan;
  });

for (const plan of plans) {
  const rows = planRows(plan);
  const ids = new Map<string, string>();

  // Week rows first (no parent), then topics, which need their week's id.
  for (const parents of [true, false]) {
    const batch = rows
      .filter((r) => (r.parent_key === null) === parents)
      .map(({ parent_key, ...row }) => ({ ...row, parent_id: parent_key ? ids.get(parent_key)! : null }));
    const { data, error } = await db.from("plan_topics").upsert(batch, { onConflict: "key" }).select("id, key");
    if (error) throw new Error(`${plan.stretch}: ${error.message}`);
    for (const r of data) ids.set(r.key, r.id);
  }

  const { data: existing, error } = await db.from("plan_topics").select("key").like("key", `${plan.stretch}/%`);
  if (error) throw new Error(`${plan.stretch}: ${error.message}`);
  const stale = existing.map((r) => r.key).filter((k) => !ids.has(k));
  if (stale.length) {
    const removed = await db.from("plan_topics").delete().in("key", stale);
    if (removed.error) throw new Error(`${plan.stretch}: could not remove ${stale.join(", ")}: ${removed.error.message}`);
  }
  console.log(`${plan.title}: ${rows.length} rows (${plan.weeks.length} weeks)${stale.length ? `, removed ${stale.length}` : ""}`);
}
console.log(`Imported ${plans.length} stretch${plans.length === 1 ? "" : "es"}.`);
