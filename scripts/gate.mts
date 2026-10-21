// Check a built week's cards against the family's rulebook (docs/gate-slice.md, decision 9). The same
// gate runs at the end of week:build; this runs it on its own, for a week built before the gate, or
// after the rulebook changed: it checks every card still pending and every card whose verdict was
// reached under another rulebook or safety floor. Cards already checked against this one are left.
//   npm run gate -- --week 1
//   npm run gate -- --week 1 --child <nickname>
//   npm run gate:live -- --week 1        (the LIVE copy: only at a stop, on Brandon's yes)
// Options: --debug (write each model request and reply to .quark-debug/). Anything left pending
// (a model error, no rulebook, a rulebook that changed under the run) ends the command with an error.

import { parseArgs } from "node:util";
import { createClient } from "@supabase/supabase-js";
import { gateFailed, gateSetup, gateTheme } from "../core/curation/gate-run.ts";
import { debugTo, meteredComplete } from "../core/model.ts";
import { makeMeter, runRow } from "../core/runs.ts";
import { printGate } from "./gate-run.ts";
import { announceTarget } from "./target.ts";

announceTarget();
const { values: args } = parseArgs({
  options: {
    week: { type: "string" },
    child: { type: "string" },
    debug: { type: "boolean", default: false },
  },
});
const week = Number(args.week);
if (!Number.isInteger(week) || week < 1) throw new Error("Say which week: npm run gate -- --week 1");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in the env file (.env.local, or .env.live.local for a :live script).");
const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
if (args.debug) {
  const dir = `.quark-debug/gate-week${week}-${new Date().toISOString().replace(/[:.]/g, "-")}`;
  debugTo(dir);
  console.log(`Writing every model request and reply to ${dir}/`);
}

const families = await db.from("families").select("id");
if (families.error) throw new Error(`families: ${families.error.message}`);
if (families.data.length !== 1) throw new Error(`Expected one family, found ${families.data.length}. Run npm run seed.`);
const familyId = families.data[0].id as string;

const theme = await db.from("themes").select("id, title").eq("family_id", familyId).eq("plan_week", week).maybeSingle();
if (theme.error) throw new Error(`themes: ${theme.error.message}`);
if (!theme.data) throw new Error(`Week ${week} isn't built yet. Run npm run week:build -- --week ${week}.`);

// Before anything is spent: the model, the floor and the rulebook.
const setup = await gateSetup(db, familyId);
const only = args.child ? setup.children.find((c) => c.id === args.child || c.nickname.toLowerCase() === args.child!.toLowerCase()) : undefined;
if (args.child && !only) throw new Error(`No child "${args.child}". The family has ${setup.children.map((c) => c.nickname).join(", ")}.`);
console.log(`${theme.data.title}: checking ${only ? `${only.nickname}'s` : "every child's"} cards on ${setup.model}.`);

// This run's own tally of calls and tokens.
const meter = makeMeter();
const complete = meteredComplete(meter);

const started = new Date();
let failed = true;
try {
  const report = await gateTheme(db, familyId, theme.data.id, setup, { complete, childId: only?.id });
  printGate(report, setup);
  failed = gateFailed(report);
} finally {
  printUsage();
  const row = runRow("gate", meter.usage(), { ok: !failed, startedAt: started, themeId: theme.data.id, week, children: only ? 1 : setup.children.length });
  const { error } = await db.from("model_runs").insert({ family_id: familyId, ...row });
  if (error) console.error(`Could not record this run for /parent/models: ${error.message}.`);
}
console.log(`\nSee it at /parent/week/${theme.data.id}.`);
if (failed) process.exit(1);

function printUsage() {
  const row = runRow("gate", meter.usage(), { ok: true, startedAt: started });
  console.log("\nTokens:");
  for (const m of row.models) {
    console.log(`  ${m.use} on ${m.model}: ${m.calls} calls, ${m.input.toLocaleString()} in, ${m.output.toLocaleString()} out${m.cost === null ? ", price unknown" : `, $${m.cost.toFixed(2)}`}`);
    if (m.cost !== null && m.calls) console.log(`    $${(m.cost / m.calls).toFixed(3)} a card the model read.`);
  }
  console.log(`  Total: $${row.cost.toFixed(2)}${row.cost_complete ? "" : " plus models without a known price"}.`);
}
