// Load plan/math-ladder.yaml into skills, the app's copy of the ladder (docs/math-tile-slice.md, What is built 1):
// one row a rung and one for each everyday area, matched by key.
//   npm run ladder:import          (test)
//   npm run ladder:import:live     (LIVE: at a stop, by Brandon's hand)
// Safe to run again: rows are matched by key and updated. A row the file no longer has is left in place and named,
// since a boy's place or a question may point at it; take it out by hand if it is truly gone.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { LADDER_FILE, ladderRows, parseLadder, validateLadder } from "../lib/ladder.ts";
import { announceTarget } from "./target.ts";

announceTarget();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in the env file.");
const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

const ladder = parseLadder(readFileSync(join(import.meta.dirname, "..", "plan", LADDER_FILE), "utf8"));
const errors = validateLadder(ladder);
if (errors.length) throw new Error(`plan/${LADDER_FILE}:\n  ${errors.join("\n  ")}`);
const rows = ladderRows(ladder);

const { error } = await db.from("skills").upsert(rows, { onConflict: "key" });
if (error) throw new Error(`skills: ${error.message} (is the Math tile's migration on this database?)`);
const { data: all, error: readError } = await db.from("skills").select("key").not("key", "is", null);
if (readError) throw new Error(`skills: ${readError.message}`);
const stale = all.map((r) => r.key as string).filter((k) => !rows.some((r) => r.key === k));
console.log(`${ladder.title}: ${ladder.rungs.length} rungs and ${ladder.everyday.length} everyday areas, ${rows.length} rows in skills.`);
if (stale.length) console.log(`Left in place, no longer in the file: ${stale.join(", ")}.`);
