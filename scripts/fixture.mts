// Put the TEST database in a known state for a proof, and look at it. For quark-test only: it has no :live
// twin, and announceTarget() refuses when .env.local says live. Every command says what it is about to
// touch before it touches it, and names no child.
//   npm run fixture -- show <week>          what the week holds: status, and per day the ideas, cards and verdicts
//   npm run fixture -- unpass <week>        set the week's first passed card back to pending, clearing its gate notes
//   npm run fixture -- delete-week <week>   delete the week's theme with its ideas, cards and questions
//   npm run fixture -- audit [n]            the last n audit rows (default 12): when, what, and the target
//   npm run fixture -- runs [n]             the last n model runs (default 10): how long, and the calls and cost per job
//   npm run fixture -- speech [n]           the last n calls to Google for the tutor's voice and ears, and the lines stored
//   npm run fixture -- answers [n]          the last n answers on the wall (default 20) and the last sessions; a child is
//                                           "child 1" or "child 2", oldest first, never by name
//   npm run fixture -- words <date>         every card of a day: title, verdict, text, question, hints, reader notes, and an answer in the text
//   npm run fixture -- card <id>            one card: its words as shown, what "Read it to me" sends, and what is stored
//   npm run fixture -- numbers <week>       every number shape in the week's spoken words, and how each goes to the voice
//   npm run fixture -- day <date>           per child and slot, what the wall can show that day: each layer's verdict,
//                                           its item's approval, and the gate's reasons for a card held back
//   npm run fixture -- device <n>           pair a device to child n (1 or 2, oldest first) and print its cookie, so
//                                           the kid view can be asked with curl, as a paired iPad asks it
//   npm run fixture -- forget <device id>   forget that device, as "Forget this iPad" does
//   npm run fixture -- judge [model]        the judge of a child's answer over slice 1's invented answers and the answers
//                                           to a hint, the word rule beside it (scripts/judge-table.mts); reads no database
//   npm run fixture -- today <date>         move that day's cards to today where the family lives and set their week
//                                           live, for a look on June's iPad when test's week has no card today
// unpass only ever writes `pending`: nothing here can pass a card, so the gate stays the only thing that does; today
// moves a date and sets a week live, as a guardian's Looks-good tap would, and writes an audit row naming itself.

import { createClient } from "@supabase/supabase-js";
import { givesAway } from "../core/curation/cards.ts";
import { todayIn } from "../core/curation/week.ts";
import { forVoice, readLine, speechPath } from "../core/wall/speech.ts";
import { createHash, randomBytes } from "node:crypto";
import { announceTarget } from "./target.ts";

const TUTOR_VOICE = "en-US-Chirp3-HD-Sulafat"; // core/speech.ts, which only the server may import
const DEVICE_COOKIE = "quark_device"; // lib/pairing.ts, whose imports plain Node can't resolve

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
} else if (command === "runs") {
  // What recent runs spent, read-only: when, how long, and the calls and cost per job. Counts and money only.
  const n = arg ? Number(arg) : 10;
  const rows = must(await db.from("model_runs").select("kind, ok, days, started_at, finished_at, models, cost").eq("family_id", familyId).order("finished_at", { ascending: false }).limit(n), "model_runs") as {
    kind: string;
    ok: boolean;
    days: number | null;
    started_at: string;
    finished_at: string;
    models: { use: string; calls: number; cost: number | null }[];
    cost: number;
  }[];
  for (const r of rows.reverse()) {
    const seconds = Math.round((Date.parse(r.finished_at) - Date.parse(r.started_at)) / 1000);
    const calls = r.models.map((m) => `${m.use} ${m.calls}`).join(", ");
    console.log(`${r.finished_at.slice(0, 19)}  ${r.kind}${r.ok ? "" : " (stopped)"}  ${r.days ?? "-"} day  ${seconds}s  ${calls}  $${Number(r.cost).toFixed(2)}`);
  }
} else if (command === "speech") {
  // The tutor's voice and ears, read-only: the last n calls to Google (a line said for the first time, or a clip
  // heard), and how many lines are stored per voice. Counts and money only: no child, no words.
  const n = arg ? Number(arg) : 10;
  const rows = must(await db.from("speech_runs").select("kind, model, characters, seconds, cost, created_at").eq("family_id", familyId).order("created_at", { ascending: false }).limit(n), "speech_runs") as {
    kind: string;
    model: string;
    characters: number;
    seconds: number;
    cost: number;
    created_at: string;
  }[];
  for (const r of rows.reverse()) {
    const size = r.kind === "say" ? `${r.characters} characters` : `${Number(r.seconds).toFixed(1)} s`;
    console.log(`${r.created_at.slice(0, 19)}  ${r.kind}  ${r.model}  ${size}  ${Number(r.cost).toFixed(5)}`);
  }
  const voices = must(await db.storage.from("content").list("speech"), "speech") as { name: string }[];
  for (const v of voices) {
    const files = must(await db.storage.from("content").list(`speech/${v.name}`, { limit: 1000 }), "speech") as unknown[];
    console.log(`Stored lines in ${v.name}: ${files.length}`);
  }
} else if (command === "answers") {
  // What the wall recorded, read-only (docs/wonder-wall-1-slice.md, decision 3).
  const n = arg ? Number(arg) : 20;
  const kids = must(await db.from("children").select("id").eq("family_id", familyId).order("birth_month"), "children") as { id: string }[];
  const who = (id: string) => `child ${kids.findIndex((k) => k.id === id) + 1}`;
  const rows = must(
    await db
      .from("attempts")
      .select("created_at, child_id, session_id, answer, correct, hints_used, seconds, mode, questions(cards(day, slot, layer))")
      .eq("family_id", familyId)
      .order("created_at", { ascending: false })
      .limit(n),
    "attempts",
  ) as unknown as {
    created_at: string;
    child_id: string;
    session_id: string;
    answer: string;
    correct: boolean | null;
    hints_used: number;
    seconds: number | null;
    mode: string;
    questions: { cards: { day: string; slot: string; layer: number } | null } | null;
  }[];
  for (const r of rows.reverse()) {
    const c = r.questions?.cards;
    const verdict = r.correct === null ? "open" : r.correct ? "right" : "not right";
    console.log(
      `${r.created_at.slice(0, 19)}  ${who(r.child_id)}  ${c ? `${c.day} ${c.slot} layer ${c.layer}` : "?"}  ${verdict}  hints ${r.hints_used}  ${r.seconds ?? "-"}s  session ${r.session_id.slice(0, 8)}  "${r.answer}"`,
    );
  }
  const sessions = must(
    await db.from("sessions").select("id, child_id, started_at, ended_at, ended_reason, device").eq("family_id", familyId).order("started_at", { ascending: false }).limit(6),
    "sessions",
  ) as { id: string; child_id: string; started_at: string; ended_at: string | null; ended_reason: string | null; device: string | null }[];
  console.log("Sessions, newest last:");
  for (const s of sessions.reverse()) {
    console.log(`  ${s.id.slice(0, 8)}  ${who(s.child_id)}  ${s.started_at.slice(0, 19)} to ${s.ended_at?.slice(0, 19) ?? "-"}  ${s.ended_reason ?? "open"}  device ${s.device?.slice(0, 8) ?? "-"}`);
  }
} else if (command === "day") {
  // What each child's wall can show on one day, read-only: per child and slot, each layer's verdict, whether its
  // item is approved, and the gate's reasons for a card held back. Rule 5 in rows, for a missing tile.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(arg ?? "")) throw new Error("Say which day: npm run fixture -- day 2026-10-22");
  const kids = must(await db.from("children").select("id, careful_about").eq("family_id", familyId).order("birth_month"), "children") as {
    id: string;
    careful_about: string | null;
  }[];
  const rows = must(
    await db
      .from("cards")
      .select("child_id, slot, layer, policy, policy_notes, body, themes(status), ideas(content_items(approved)), questions(id)")
      .eq("family_id", familyId)
      .eq("day", arg)
      .order("slot")
      .order("layer"),
    "cards",
  ) as unknown as {
    child_id: string;
    slot: string;
    layer: number;
    policy: string;
    policy_notes: { validation?: string[]; gate?: { by: string; reasons: { rule: string; subject?: number; note: string }[] } } | null;
    body: { title?: string };
    themes: { status: string } | null;
    ideas: { content_items: { approved: boolean } | null } | null;
    questions: { id: string }[];
  }[];
  console.log(`${arg}: ${rows.length} cards, theme ${[...new Set(rows.map((r) => r.themes?.status))].join(", ") || "none"}.`);
  kids.forEach((k, i) => {
    // Whether a caution note is on file, never what it says.
    console.log(`child ${i + 1}${k.careful_about?.trim() ? ", with a caution note on file" : ""}:`);
    for (const r of rows.filter((r) => r.child_id === k.id)) {
      const item = r.ideas?.content_items ? (r.ideas.content_items.approved ? "item approved" : "item NOT approved") : "no item";
      const question = r.questions.length ? "" : ", no question";
      console.log(`  ${r.slot.padEnd(6)} layer ${r.layer}  ${r.policy.padEnd(7)}  ${item}${question}`);
      if (r.policy === "passed") continue;
      console.log(`      "${r.body?.title ?? ""}"`);
      for (const why of r.policy_notes?.gate?.reasons ?? []) {
        console.log(`      ${r.policy_notes!.gate!.by}: ${why.rule}${why.subject ? ` (subject ${why.subject})` : ""}: ${why.note}`);
      }
      for (const v of r.policy_notes?.validation ?? []) console.log(`      card check: ${v}`);
    }
  });
} else if (command === "words") {
  // Every card of one day, read-only, for reading the card prompt's work: per child, slot and layer, the title, the
  // verdict, the text, the question, the gate's reader notes, and "ANSWER IN TEXT" when the text already holds an
  // accepted answer by the hint check's word rule (card v6: never the answer before the question). Test only.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(arg ?? "")) throw new Error("Say which day: npm run fixture -- words 2026-10-25");
  const kids = must(await db.from("children").select("id").eq("family_id", familyId).order("birth_month"), "children") as { id: string }[];
  const rows = must(
    await db.from("cards").select("child_id, slot, layer, policy, policy_notes, body, questions(answer_key)").eq("family_id", familyId).eq("day", arg).order("slot").order("layer"),
    "cards",
  ) as unknown as {
    child_id: string;
    slot: string;
    layer: number;
    policy: string;
    policy_notes: { gate?: { reader?: string[] } } | null;
    body: { title: string; text: string; question: string; hints: string[] };
    questions: { answer_key: { accept: string[]; rubric: string } }[];
  }[];
  let inText = 0;
  let notes = 0;
  kids.forEach((k, i) => {
    console.log(`\nchild ${i + 1}:`);
    for (const r of rows.filter((r) => r.child_id === k.id)) {
      const key = r.questions[0]?.answer_key ?? { accept: [], rubric: "" };
      const gives = givesAway(r.body.text, key);
      if (gives) inText += 1;
      const reader = r.policy_notes?.gate?.reader ?? [];
      notes += reader.length;
      console.log(`\n  ${r.slot} layer ${r.layer}, ${r.policy}: "${r.body.title}"${gives ? "  ANSWER IN TEXT" : ""}`);
      console.log(`    ${r.body.text}\n    Q: ${r.body.question}\n    Accept: ${key.accept.join("; ") || "(open)"}`);
      r.body.hints.forEach((h, j) => console.log(`    Hint ${j + 1}: ${h}`));
      for (const n of reader) console.log(`    Reader: ${n}`);
    }
  });
  console.log(`\n${rows.length} cards; ${inText} with an accepted answer in the text; ${notes} reader notes.`);
} else if (command === "card") {
  // One card, read-only: the words the card page shows, the line "Read it to me" says, and, on a card written
  // before card v6, the writer's read_aloud (never said), each with whether it is stored in the tutor's voice.
  // Test only: it prints a card.
  if (!arg) throw new Error("Say which card: npm run fixture -- card <card id>");
  const row = must(await db.from("cards").select("day, slot, layer, body").eq("family_id", familyId).eq("id", arg).maybeSingle(), "cards") as {
    day: string;
    slot: string;
    layer: number;
    body: { title: string; text: string; read_aloud?: string; question: string };
  };
  const stored = async (text: string) => ((await db.storage.from("content").createSignedUrl(speechPath(TUTOR_VOICE, text.trim()), 60)).data ? "stored" : "not stored");
  console.log(`${row.day} ${row.slot} layer ${row.layer}: ${row.body.title}`);
  const parts: [string, string][] = [
    ["text, shown", row.body.text],
    ["question, shown", row.body.question],
    ["Read it to me sends to the voice", forVoice(readLine(row.body))],
    ...(row.body.read_aloud ? [["read_aloud, never said", row.body.read_aloud] as [string, string]] : []),
  ];
  for (const [name, text] of parts) console.log(`\n${name}, ${await stored(text)}:\n  ${text}`);
} else if (command === "numbers") {
  // Every number in the week's spoken words (text, question, hints, handoff), grouped by its shape (each digit
  // shown as 9), with how often it comes, how it goes to the voice (forVoice()) and a few examples. Test only: it
  // prints card words.
  const t = await theme(Number(arg));
  const rows = must(await db.from("cards").select("body").eq("theme_id", t.id), "cards") as { body: { text: string; question: string; hints: string[]; handoff: string } }[];
  const shapes = new Map<string, { count: number; examples: Set<string> }>();
  for (const { body } of rows) {
    for (const words of [body.text, body.question, body.handoff, ...body.hints]) {
      for (const m of words.matchAll(/(?:\S+\s){0,2}\S*\d\S*(?:\s\S+){0,2}/g)) {
        for (const token of m[0].match(/\S*\d\S*/g) ?? []) {
          const shape = token.replace(/\d/g, "9");
          const s = shapes.get(shape) ?? { count: 0, examples: new Set<string>() };
          s.count += 1;
          if (s.examples.size < 3) s.examples.add(m[0]);
          shapes.set(shape, s);
        }
      }
    }
  }
  for (const [shape, s] of [...shapes.entries()].sort((a, b) => b[1].count - a[1].count)) {
    const sent = forVoice(shape) === shape ? "as written" : `sent as ${forVoice(shape)}`;
    console.log(`${shape}  ×${s.count}  ${sent}  ${[...s.examples].map((e) => `“${e}”`).join("  ")}`);
  }
} else if (command === "audit") {
  const n = arg ? Number(arg) : 12;
  const rows = must(await db.from("audit_log").select("created_at, action, target").eq("family_id", familyId).order("created_at", { ascending: false }).limit(n), "audit_log") as {
    created_at: string;
    action: string;
    target: unknown;
  }[];
  for (const r of rows.reverse()) console.log(`${r.created_at}  ${r.action}  ${JSON.stringify(r.target)}`);
} else if (command === "device") {
  // A device row as claim_device_pairing writes it, without the six digits: the token is printed once and only
  // its hash is kept (lib/pairing.ts).
  const kids = must(await db.from("children").select("id").eq("family_id", familyId).order("birth_month"), "children") as { id: string }[];
  const child = kids[Number(arg) - 1];
  if (!child) throw new Error(`Say which child, 1 to ${kids.length}: npm run fixture -- device 1`);
  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const [row] = must(await db.from("devices").insert({ family_id: familyId, child_id: child.id, token_hash: tokenHash }).select("id"), "devices") as { id: string }[];
  console.log(`Paired device ${row.id} to child ${arg}. Its cookie:\n${DEVICE_COOKIE}=${token}\nForget it after: npm run fixture -- forget ${row.id}`);
} else if (command === "forget") {
  must(await db.from("devices").update({ revoked_at: new Date().toISOString() }).eq("family_id", familyId).eq("id", arg).select("id"), "devices");
  console.log(`Forgot device ${arg}.`);
} else if (command === "today") {
  // For a look on June's iPad (docs/judge-slice.md, stop 2): test's week may have no card today. Every card of the day
  // named keeps its verdict and moves to today, and its week goes live. Test only, as everything here.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(arg ?? "")) throw new Error("Say which day to move: npm run fixture -- today 2026-10-25");
  const tz = (must(await db.from("families").select("timezone").eq("id", familyId).single(), "families") as { timezone: string }).timezone;
  const to = todayIn(tz);
  const cards = must(await db.from("cards").select("id, theme_id, policy").eq("family_id", familyId).eq("day", arg), "cards") as { id: string; theme_id: string; policy: string }[];
  if (cards.length === 0) throw new Error(`No cards on ${arg}.`);
  const themes = [...new Set(cards.map((c) => c.theme_id))];
  if (themes.length !== 1) throw new Error(`The cards of ${arg} are in ${themes.length} weeks; expected one.`);
  const today = must(await db.from("cards").select("id").eq("family_id", familyId).eq("day", to), "cards") as unknown[];
  if (today.length) throw new Error(`${to} already has ${today.length} cards; nothing moved.`);
  console.log(`About to move the ${cards.length} cards of ${arg} (${cards.filter((c) => c.policy === "passed").length} passed) to ${to}, and set their week live.`);
  must(await db.from("cards").update({ day: to }).eq("family_id", familyId).eq("day", arg).select("id"), "cards");
  must(await db.from("themes").update({ status: "live" }).eq("family_id", familyId).eq("id", themes[0]).select("id"), "themes");
  must(await db.from("audit_log").insert({ family_id: familyId, guardian_id: null, action: "fixture.today", target: { from: arg, to, theme: themes[0] } }).select("id"), "audit_log");
  console.log(`Done. ${to} has the cards of ${arg}, and the week is live on test.`);
} else if (command === "judge") {
  await (await import("./judge-table.mts")).runJudgeTable(arg);
} else {
  console.log("Usage: npm run fixture -- show <week> | unpass <week> | delete-week <week> | audit [n] | runs [n] | answers [n] | speech [n] | card <id> | numbers <week> | day <date> | device <n> | forget <device id> | judge [model] | today <date>");
  process.exit(1);
}
