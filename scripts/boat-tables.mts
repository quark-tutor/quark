// The family's times tables for the trading boat (docs/trading-boat-2-slice.md, stop 2's fix round): one setting, the
// same mastery.place on every times-table rung for every child of the family, as /parent saves it. There is no switch
// (Brandon, 17 Nov 2026): a setting that gives prices puts the boat on the wall in Puzzle's place, and every table at
// not yet takes it off again, with Puzzle back at once and each child's game kept.
//   npm run boat:tables                                         (test) the setting now, and what it gives
//   npm run boat:tables -- times-2-5-10=done times-3-4=working  (test) set it; a table not named is not yet
//   npm run boat:tables -- none                                 (test) every table at not yet: the boat off the wall
//   npm run boat:tables:live -- ...                             (LIVE: at a stop, by Brandon's hand)
// A setting that would let a crate lose money, or gives a rumor nothing to sail for, is refused with /parent's words
// before anything is written (lib/boat-setting.ts). Other rungs of the ladder are left as they are. It writes an audit
// row holding the setting. It counts the children and never names one. Safe to run again.

import { createClient } from "@supabase/supabase-js";
import { boatLine, checkSetting, familySetting, pricesLine, settingRows, type PlacedRow, type Setting } from "../lib/boat-setting.ts";
import type { Place } from "../lib/ladder.ts";
import { announceTarget } from "./target.ts";

const target = announceTarget();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in the env file.");
const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

type Reply = { data: unknown; error: { message: string } | null };
function must<R extends Reply>(r: R, what: string): NonNullable<R["data"]> {
  if (r.error) throw new Error(`${what}: ${r.error.message}`);
  return (r.data ?? []) as NonNullable<R["data"]>;
}

const PLACE_WORDS: Record<string, Place | null> = { done: "done", working: "working", "not-yet": null };
const said = (p: Place | null) => (p === "working" ? "working on" : p === "done" ? "done" : "not yet");

const families = must(await db.from("families").select("id"), "families") as { id: string }[];
if (families.length !== 1) throw new Error(`Expected one family, found ${families.length}; nothing was written.`);
const familyId = families[0].id;

async function read() {
  const kids = must(await db.from("children").select("id").eq("family_id", familyId).order("birth_month"), "children") as { id: string }[];
  const skills = must(await db.from("skills").select("id, key, name, position, ladder").eq("kind", "rung").not("key", "is", null), "skills (is the Math tile's migration on this database?)") as Parameters<typeof familySetting>[0];
  const placed = kids.length
    ? (must(
        await db.from("mastery").select("child_id, place, skills!inner(key)").in("child_id", kids.map((k) => k.id)).not("place", "is", null),
        "mastery (is the Math tile's migration on this database?)",
      ) as unknown as PlacedRow[])
    : [];
  return { kids, ...familySetting(skills, kids, placed) };
}

function show(s: Awaited<ReturnType<typeof read>>) {
  for (const r of s.rungs) console.log(`  ${r.name}: ${said(s.setting.get(r.key) ?? null)}`);
  if (s.differ.length) console.log(`  The children's places differ on ${s.differ.join(" and ")}; the lines above are the oldest child's.`);
  if (!s.check) return;
  console.log(boatLine(s.check));
  if ("nb" in s.check && s.check.nb) console.log(pricesLine(s.check.nb));
  if ("error" in s.check) console.log(s.check.error);
}

const now = await read();
if (now.rungs.length === 0) refuse("skills holds no times-table rung: run the ladder import first.");
if (now.kids.length === 0) refuse("the family has no children.");

const args = process.argv.slice(2);
if (args.length === 0) {
  console.log(`The family's times tables now, for its ${now.kids.length} children:`);
  show(now);
  process.exit(0);
}

// A refusal is said plainly, with no stack trace, and nothing is written.
function refuse(why: string): never {
  console.log(`Refused: ${why}`);
  console.log("Nothing was written.");
  process.exit(1);
}

// The setting asked for: "none", or each table named as key=place; a table not named is not yet.
const setting: Setting = new Map(now.rungs.map((r) => [r.key, null]));
if (!(args.length === 1 && args[0] === "none")) {
  for (const a of args) {
    const [k, p] = a.split("=");
    if (!setting.has(k) || !(p in PLACE_WORDS)) {
      refuse(`"${a}" is not a table and a place. Say each as table=place, the tables ${now.rungs.map((r) => r.key).join(", ")}, the places done, working or not-yet; or say none.`);
    }
    setting.set(k, PLACE_WORDS[p]);
  }
}
const check = checkSetting(now.rungs, setting);
if ("error" in check) refuse(check.error);

console.log(`About to set, for each of the family's ${now.kids.length} children${target === "live" ? " on LIVE" : ""}:`);
for (const r of now.rungs) console.log(`  ${r.name}: ${said(setting.get(r.key) ?? null)}`);
must(await db.from("mastery").upsert(settingRows(now.kids, now.rungs, setting, new Date().toISOString()), { onConflict: "child_id,skill_id" }).select("child_id"), "mastery");
must(
  await db.from("audit_log").insert({ family_id: familyId, guardian_id: null, action: "boat.tables", target: { places: Object.fromEntries(setting), by: "scripts/boat-tables.mts" } }).select("id"),
  "audit_log",
);
console.log("Done. Read back:");
show(await read());
