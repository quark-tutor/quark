// Put the TEST database in a known state for a proof, and look at it. For quark-test only: it has no :live
// twin, and announceTarget() refuses when .env.local says live. Every command says what it is about to
// touch before it touches it, and names no child.
//   npm run fixture -- show <week>          what the week holds: status, and per day the ideas, cards and verdicts
//   npm run fixture -- unpass <week>        set the week's first passed card back to pending, clearing its gate notes
//   npm run fixture -- delete-week <week>   delete the week's theme with its ideas, cards and questions
//   npm run fixture -- audit [n]            the last n audit rows (default 12): when, what, and the target
// unpass only ever writes `pending`: nothing here can pass a card, so the gate stays the only thing that does.

import { createClient } from "@supabase/supabase-js";
import { announceTarget } from "./target.ts";

announceTarget();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local.");
const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

type Reply = { data: unknown; error: { message: string } | null };
function must<R extends Reply>(r: R, what: string): NonNullable<R["data"]> {
  if (r.error) throw new Error(`${what}: ${r.error.message}`);
  return (r.data ?? []) as NonNullable<R["data"]>;
}

const [command, arg] = process.argv.slice(2);
const families = must(await db.from("families").select("id"), "families") as { id: string }[];
if (families.length !== 1) throw new Error(`Expected one family, found ${families.length}.`);
const familyId = families[0].id;

async function theme(week: number) {
  if (!Number.isInteger(week) || week < 1) throw new Error("Say which week: npm run fixture -- show 1");
  const rows = must(await db.from("themes").select("id, title, status, week_start, plan_week").eq("family_id", familyId).eq("plan_week", week), "themes") as {
    id: string;
    title: string;
    status: string;
    week_start: string;
    plan_week: number;
  }[];
  if (rows.length === 0) throw new Error(`Week ${week} has no theme.`);
  return rows[0];
}

async function describe(themeId: string) {
  const [ideas, cards] = await Promise.all([
    db.from("ideas").select("day").eq("theme_id", themeId),
    db.from("cards").select("id, day, slot, layer, policy").eq("theme_id", themeId).order("day").order("slot").order("layer"),
  ]);
  const days = new Map<string, { cards: number; policy: Record<string, number> }>();
  for (const c of must(cards, "cards") as { id: string; day: string; policy: string }[]) {
    const d = days.get(c.day) ?? { cards: 0, policy: {} };
    d.cards += 1;
    d.policy[c.policy] = (d.policy[c.policy] ?? 0) + 1;
    days.set(c.day, d);
  }
  return { ideas: (must(ideas, "ideas") as unknown[]).length, days: [...days.entries()].sort() };
}

if (command === "show") {
  const t = await theme(Number(arg));
  const d = await describe(t.id);
  console.log(`Week ${t.plan_week}: "${t.title}", starting ${t.week_start}, status ${t.status}. ${d.ideas} ideas.`);
  for (const [day, c] of d.days) console.log(`  ${day}: ${c.cards} cards (${Object.entries(c.policy).map(([p, n]) => `${n} ${p}`).join(", ")})`);
} else if (command === "unpass") {
  const t = await theme(Number(arg));
  const found = must(
    await db.from("cards").select("id, day, slot, layer, policy_notes").eq("theme_id", t.id).eq("policy", "passed").order("day").order("slot").order("layer").limit(1),
    "cards",
  ) as { id: string; day: string; slot: string; layer: number; policy_notes: { validation?: string[] } | null }[];
  if (found.length === 0) throw new Error(`Week ${t.plan_week} has no passed card to set back.`);
  const c = found[0];
  console.log(`About to set the ${c.day} ${c.slot} card, layer ${c.layer}, of week ${t.plan_week} back to pending (its gate notes are cleared).`);
  // Only the card checks' own notes stay: the gate's verdict is what is taken back.
  const notes = c.policy_notes?.validation?.length ? { validation: c.policy_notes.validation } : null;
  const { error } = await db.from("cards").update({ policy: "pending", policy_notes: notes }).eq("id", c.id);
  if (error) throw new Error(`cards: ${error.message}`);
  console.log("Done. npm run gate -- --week N checks it again.");
} else if (command === "delete-week") {
  const t = await theme(Number(arg));
  const d = await describe(t.id);
  console.log(`About to delete week ${t.plan_week} ("${t.title}", starting ${t.week_start}, status ${t.status}): ${d.ideas} ideas and ${d.days.reduce((n, [, c]) => n + c.cards, 0)} cards over ${d.days.length} days, with their questions.`);
  const { error } = await db.from("themes").delete().eq("id", t.id);
  if (error) throw new Error(`themes: ${error.message}`);
  console.log("Done. Its audit rows and model runs stay.");
} else if (command === "audit") {
  const n = arg ? Number(arg) : 12;
  const rows = must(await db.from("audit_log").select("created_at, action, target").eq("family_id", familyId).order("created_at", { ascending: false }).limit(n), "audit_log") as {
    created_at: string;
    action: string;
    target: unknown;
  }[];
  for (const r of rows.reverse()) console.log(`${r.created_at}  ${r.action}  ${JSON.stringify(r.target)}`);
} else {
  console.log("Usage: npm run fixture -- show <week> | unpass <week> | delete-week <week> | audit [n]");
  process.exit(1);
}
