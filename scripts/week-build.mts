// Build one week of the plan: the theme, its shared ideas, and every child's cards and questions.
// A week is mixed (docs/04, "How a week is mixed"): the thread on one slot a day, short lessons on
// the other four. --week N is the family's week N of the plan. The work itself is in
// core/curation/week-job.ts, which the Sunday route uses too; this keeps the flags and the printing.
//   npm run week:build -- --week 1
//   npm run week:build -- --week 1 --child Pip --days 2     (one child, the first two days)
//   npm run week:build -- --week 1 --rebuild                (replace a week already built)
//   npm run week:build -- --week 1 --day 3                  (just day 3, into the week's theme; the Sunday build does this, a day a firing)
//   npm run week:build -- --week 1 --day 3 --rebuild        (clear day 3 and build it again, and only that day)
//   npm run week:build -- --week 1 --days 1 --plan          (what would be built, and what the family's settings decide; spends nothing)
// Options: --debug (write each model request and reply to .quark-debug/), --start YYYY-MM-DD (default: next Monday, or
// counted on from week 1's start). The week's thread is the stretch that holds it, found from the plan's
// sequence (docs/04, "The long-term plan"). The theme ends in status 'review'; nothing goes live here.
// Cards are written with policy 'pending', and the gate checks them at the end (core/curation/gate-run.ts):
// each leaves 'pending' only as 'passed' or 'blocked'. Anything the gate leaves pending ends the run
// with an error; npm run gate -- --week N checks them again.

import { parseArgs } from "node:util";
import { createClient } from "@supabase/supabase-js";
import { levelOf } from "../core/curation/cards.ts";
import { planMath } from "../core/curation/math.ts";
import { gateFailed, gateSetup } from "../core/curation/gate-run.ts";
import { BuildStopped, buildDays, prepareWeek, settingsWatch } from "../core/curation/week-job.ts";
import { debugTo, meteredComplete, modelFor } from "../core/model.ts";
import { makeMeter, runRow } from "../core/runs.ts";
import { SLOT_ORDER } from "../lib/lenses.ts";
import { printGate } from "./gate-run.ts";
import { announceTarget } from "./target.ts";

announceTarget();
const { values: args } = parseArgs({
  options: {
    week: { type: "string" },
    child: { type: "string" },
    days: { type: "string" },
    day: { type: "string" },
    start: { type: "string" },
    rebuild: { type: "boolean", default: false },
    debug: { type: "boolean", default: false },
    plan: { type: "boolean", default: false }, // print the week and what the settings decide, then stop: nothing spent or written
    math: { type: "boolean", default: false }, // the puzzle slot as the Math tile before week 6, a theme's puzzle day left out: test only
    "math-only": { type: "boolean", default: false }, // with --day: that day's math written again, nothing else
  },
});
const week = Number(args.week);
const days = args.days === undefined ? 7 : Number(args.days);
const day = args.day === undefined ? undefined : Number(args.day); // one day only
if (!Number.isInteger(week) || week < 1) throw new Error("Say which week: npm run week:build -- --week 1");
if (!Number.isInteger(days) || days < 1 || days > 7) throw new Error("--days must be 1 to 7");
if (day !== undefined && (!Number.isInteger(day) || day < 1 || day > 7)) throw new Error("--day must be 1 to 7");
if (day !== undefined && args.days !== undefined) throw new Error("Use --day for one day or --days for the first few, not both.");
if (day !== undefined && args.child) throw new Error("--day builds a day for every child; it can't be combined with --child.");
if (args["math-only"] && day === undefined) throw new Error("--math-only writes one day's math again: give it --day.");
if (args.start && !/^\d{4}-\d{2}-\d{2}$/.test(args.start)) throw new Error("--start must be YYYY-MM-DD");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in the env file (.env.local, or .env.live.local for a :live script).");
const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
// --debug: every model request and reply goes to .quark-debug/<run>/ (gitignored) as it came back.
if (args.debug) {
  const dir = `.quark-debug/week${week}-${new Date().toISOString().replace(/[:.]/g, "-")}`;
  debugTo(dir);
  console.log(`Writing every model request and reply to ${dir}/`);
}
// Fail before spending anything if a model isn't set.
const models = { ideas: modelFor("curate"), cards: modelFor("write"), gate: modelFor("gate") };

// This run's own tally of calls and tokens, priced into the model_runs row (rule 7: counts and money only).
const meter = makeMeter();
const complete = meteredComplete(meter);

// prepareWeek() only reads, so a refusal from it ("Not enough short lessons…", "No theme for week…") is a stop
// before spending, printed as one, not as a crash with a stack trace.
let p: Awaited<ReturnType<typeof prepareWeek>>;
try {
  p = await prepareWeek(db, { week, start: args.start, child: args.child, math: args.math || undefined });
} catch (e) {
  console.error(`\nStopped: ${e instanceof Error ? e.message : String(e)}\nNothing was spent.`);
  process.exit(1);
}
const { plan, children, only } = p;

const first = day ?? 1; // the first day built
const last = day ?? days; // the last
console.log(`${plan.title}: starting ${p.start}, ${day !== undefined ? `day ${day} only` : `${days} day${days === 1 ? "" : "s"}`}.`);
const titleOf = new Map(plan.topics.map((t) => [t.id, t]));
for (const d of plan.schedule.filter((d) => d.day >= first && d.day <= last)) {
  const lessons = SLOT_ORDER.filter((s) => s !== d.thread && d.topics[s]).map((s) => `${s} ${titleOf.get(d.topics[s]!)?.keys[0].split("/")[1]}`);
  console.log(
    `  Day ${d.day}: ${d.thread ? `${plan.thread?.title} on ${d.thread} (${titleOf.get(d.topics[d.thread]!)?.title})` : "the thread has ended"}; short lessons: ${lessons.join(", ")}${d.math ? "; math: each child's own problem" : ""}.`,
  );
}
// Before spending: the gate's rulebook and floor, and what the family's settings already decide for
// this week's topics, so a guardian sees the blocks before the money (docs/gate-slice.md, To settle).
const gate = await gateSetup(db, p.family.id);
if (!gate.rulebook) {
  console.log(`\nThe gate: ${gate.missing}. The cards will be built and left pending; run npm run gate -- --week ${week} afterwards.`);
} else {
  const watch = settingsWatch(p, gate, last, first);
  console.log(
    watch.length
      ? `\nWhat the family's settings decide before anything is spent (the gate holds these back in code, or reads them as parent-led):\n${watch.join("\n")}`
      : "\nNo topic built here touches a subject the family's settings hold back or keep parent-led.",
  );
}
console.log(`Ideas on ${models.ideas}; cards on ${models.cards}; the gate on ${models.gate}. ${only ? `Only ${only.nickname}.` : `${children.length} children.`}`);
// What each child's cards are written for, from the children's rows (levelOf(), as the week page shows it).
for (const c of only ? [only] : children) console.log(`  ${c.nickname}: written for ${levelOf(c)}.`);
// The Math tile: each child's days, planned before anything is spent.
if (p.math) {
  for (const c of only ? [only] : children) {
    const mc = p.math.children.get(c.id);
    const days = mc ? planMath(p.math.ladder, mc) : [];
    console.log(`  ${c.nickname}'s math: ${days.length ? days.map((d) => `day ${d.day} ${d.teaches}${d.isNew ? " (new)" : ""}`).join(", ") : "none (no math style, or no rung he is working on)"}.`);
  }
}
if (args.plan) {
  console.log(`\n--plan: stopped before spending anything; nothing was written.${gate.documentChars !== null ? ` The gate's copy of the rulebook is ${gate.documentChars.toLocaleString()} characters.` : ""}`);
  process.exit(0);
}

const started = Date.now();
let result;
try {
  result = await buildDays(p, day !== undefined ? { day } : { days }, { complete, meter, gate, rebuild: args.rebuild, mathOnly: args["math-only"] });
} catch (e) {
  const message = e instanceof Error ? e.message : String(e);
  console.error(`\nStopped: ${message}`);
  if (!/already built/.test(message)) console.error("The theme is left as 'generating'. Fix the problem and run again with --rebuild.");
  printUsage();
  if (e instanceof BuildStopped && e.recordError) console.error(e.recordError);
  process.exit(1);
}
const { report } = result;

console.log(
  day !== undefined
    ? `\nTheme ${report.themeId}: day ${day} built (the theme goes to review once all seven are in). ${report.ideas} ideas. ${result.buildSeconds}s.`
    : `\nTheme ${report.themeId}, now in review. ${report.ideas} ideas. ${result.buildSeconds}s.`,
);
for (const c of report.children) {
  const lenses = Object.entries(c.lenses).sort((a, b) => b[1] - a[1]).map(([l, n]) => `${l} ${n}`).join(", ");
  console.log(`\n${c.nickname}: ${c.cards} cards. Lenses (per day-slot): ${lenses}.`);
  console.log(`  Interests opened ${c.doors} first cards. ${c.withoutPicture} cards without a picture or recording. ${c.reasked} day-slots asked twice.`);
  if (c.math) console.log(`  Math: ${c.math.written} problems, ${c.math.reasked} asked twice. ${c.math.days.join("; ")}.`);
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
if (result.gate) {
  printGate(result.gate, gate);
  gateOk = !gateFailed(result.gate);
} else {
  console.error(`\nThe gate stopped: ${result.gateError}. Cards it hadn't reached are left as they were; run npm run gate -- --week ${week}.`);
}
printUsage();
if (result.mathUsage.length) {
  const math = runRow("week:build", result.mathUsage, { ok: true, startedAt: new Date(started) });
  const parts = report.children.reduce((n, c) => n + (c.math?.written ?? 0) * 4, 0);
  console.log(`  Of which the math writer: ${math.models.map((m) => `${m.calls} calls, $${(m.cost ?? 0).toFixed(2)}`).join("; ")} for ${parts} math cards (the gate's share for them is in its line above).`);
}
if (result.recordError) console.error(result.recordError);
console.log(`\nPreview it at /parent/week/${report.themeId}.`);
if (!gateOk) process.exit(1);

function printUsage() {
  const row = runRow("week:build", meter.usage(), { ok: true, startedAt: new Date(started) });
  console.log("\nTokens:");
  for (const m of row.models) {
    console.log(`  ${m.use} on ${m.model}: ${m.calls} calls, ${m.input.toLocaleString()} in, ${m.output.toLocaleString()} out${m.cost === null ? ", price unknown" : `, $${m.cost.toFixed(2)}`}`);
    if (m.use === "gate" && m.cost !== null && m.calls) console.log(`    $${(m.cost / m.calls).toFixed(3)} a card the model read.`);
  }
  console.log(`  Total: $${row.cost.toFixed(2)}${row.cost_complete ? "" : " plus models without a known price"}.`);
}
