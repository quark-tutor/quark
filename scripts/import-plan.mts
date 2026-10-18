// Load plan/*.yaml into plan_topics, the app's copy of the plan: every stretch, and the library of
// short lessons (plan/short-lessons.yaml).
//   npm run plan:import
// Safe to run again: rows are matched by key and updated. Rows of a stretch or of the library that
// its file no longer has are deleted (this fails loudly if an idea or skill still points at one).

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import {
  isLibrary,
  libraryRows,
  libraryWarnings,
  parsePlan,
  planRows,
  planWarnings,
  validateLibrary,
  validatePlan,
  type PlanRow,
} from "../lib/plan.ts";
import { announceTarget } from "./target.ts";

announceTarget();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in the env file (.env.local, or .env.live.local for a :live script).");
const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

// Each file as the rows it becomes, with the key prefix its rows share.
type Unit = { file: string; title: string; prefix: string; rows: PlanRow[]; count: string };

const dir = join(import.meta.dirname, "..", "plan");
const units: Unit[] = readdirSync(dir)
  .filter((f) => f.endsWith(".yaml"))
  .map((f) => {
    const doc = parsePlan(readFileSync(join(dir, f), "utf8"));
    if (isLibrary(doc)) {
      const errors = validateLibrary(doc);
      if (errors.length) throw new Error(`plan/${f}:\n  ${errors.join("\n  ")}`);
      if (`${doc.library}.yaml` !== f) throw new Error(`plan/${f}: library must match the file name`);
      for (const w of libraryWarnings(doc)) console.warn(`plan/${f}: warning: ${w}`);
      return { file: f, title: doc.title, prefix: "short/", rows: libraryRows(doc), count: `${doc.lessons.length} lessons` };
    }
    const errors = validatePlan(doc);
    if (errors.length) throw new Error(`plan/${f}:\n  ${errors.join("\n  ")}`);
    if (`${doc.stretch}.yaml` !== f) throw new Error(`plan/${f}: stretch must match the file name`);
    for (const w of planWarnings(doc)) console.warn(`plan/${f}: warning: ${w}`);
    return { file: f, title: doc.title, prefix: `${doc.stretch}/`, rows: planRows(doc), count: `${doc.weeks.length} weeks` };
  });

for (const unit of units) {
  const ids = new Map<string, string>();

  // Rows without a parent first (week rows and short lessons), then topics, which need their week's id.
  for (const parents of [true, false]) {
    const batch = unit.rows
      .filter((r) => (r.parent_key === null) === parents)
      .map(({ parent_key, ...row }) => ({ ...row, parent_id: parent_key ? ids.get(parent_key)! : null }));
    if (batch.length === 0) continue;
    const { data, error } = await db.from("plan_topics").upsert(batch, { onConflict: "key" }).select("id, key");
    if (error) throw new Error(`${unit.file}: ${error.message}`);
    for (const r of data) ids.set(r.key, r.id);
  }

  const { data: existing, error } = await db.from("plan_topics").select("key").like("key", `${unit.prefix}%`);
  if (error) throw new Error(`${unit.file}: ${error.message}`);
  const stale = existing.map((r) => r.key).filter((k) => !ids.has(k));
  if (stale.length) {
    const removed = await db.from("plan_topics").delete().in("key", stale);
    if (removed.error) throw new Error(`${unit.file}: could not remove ${stale.join(", ")}: ${removed.error.message}`);
  }
  console.log(`${unit.title}: ${unit.rows.length} rows (${unit.count})${stale.length ? `, removed ${stale.length}` : ""}`);
}
console.log(`Imported ${units.length} file${units.length === 1 ? "" : "s"}.`);
