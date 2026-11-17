import "server-only";
import { after } from "next/server";
import { numbersFor } from "@/core/boat/day";
import { act, doneToday, landTurn, newGame, roll, view, type Action, type Ctx, type Game, type Read, type Screen, type Turn } from "@/core/boat/game";
import { todayIn } from "@/core/curation/week";
import { readNumber } from "@/core/math/numbers";
import { complete } from "@/core/model";
import { readPrompt } from "@/core/prompts";
import { runRow } from "@/core/runs";
import { say, TUTOR_VOICE } from "@/core/speech";
import { JUDGE_MAX_TOKENS, JUDGE_MODEL, JUDGE_THINKING } from "@/core/wall/judge";
import { NO_NUMBER_SCHEMA, readReply } from "@/core/wall/no-number";
import { makeSpeech, speechPath, voiceText } from "@/core/wall/speech";
import type { Device } from "@/lib/device";
import { devViewOn, wallNow } from "@/lib/dev-view";
import { largestCount, tablesOf, workingTablesOf, type Ladder, type Place } from "@/lib/ladder";
import { createAdminClient } from "@/lib/supabase/admin";
import { wallStore } from "@/lib/wall";

// The trading boat's reads and writes (docs/trading-boat-slice.md), as lib/wall.ts is for the cards: it starts from
// getDevice(), and the service-role client is scoped here, in code, to that child and that child's family. The rules
// are in core/boat/game.ts. In this slice the boat is on the dev server against test only: with the test view off
// (Vercel, or the live env file) every function here returns null and touches no table, so nothing on live ever
// reads boat_games or boat_turns. Nothing here logs a number, a reply or a nickname; when the no-number judge gives no
// verdict, one line says why, as the judge's does.

type Db = ReturnType<typeof createAdminClient>;

function must<T>(r: { data: T; error: { message: string } | null }, what: string): T {
  if (r.error) throw new Error(`${what}: ${r.error.message}`);
  return r.data;
}

// His numbers from his places on the parents' ladder, and today where the family lives (the test view's day).
async function ctxFor(db: Db, device: Device): Promise<Ctx | null> {
  const [family, skills, placed] = await Promise.all([
    db.from("families").select("timezone").eq("id", device.familyId).single(),
    db.from("skills").select("key, ladder").eq("kind", "rung").not("key", "is", null),
    db.from("mastery").select("place, skills!inner(key)").eq("child_id", device.childId).not("place", "is", null),
  ]);
  const tz = (must(family, "families") as { timezone: string }).timezone;
  const rungs = (must(skills, "skills") as { key: string; ladder: { rule?: Ladder["rungs"][number]["rule"] } | null }[]).map((s) => ({ key: s.key, rule: s.ladder?.rule ?? {} }));
  const ladder = { rungs } as unknown as Pick<Ladder, "rungs">;
  const places = new Map((must(placed, "mastery") as unknown as { place: Place; skills: { key: string } }[]).map((p) => [p.skills.key, p.place]));
  const nb = numbersFor(tablesOf(ladder, places), workingTablesOf(ladder, places), largestCount(ladder, places));
  return nb ? { seed: device.childId, nb, date: todayIn(tz, await wallNow()) } : null;
}

async function load(db: Db, device: Device): Promise<Game> {
  const row = must(
    await db.from("boat_games").select("money, space, cargo, island, sailing, today").eq("child_id", device.childId).eq("family_id", device.familyId).maybeSingle(),
    "boat_games",
  );
  return row ? (row as unknown as Game) : newGame();
}

async function save(db: Db, device: Device, g: Game, turns: Turn[]): Promise<void> {
  must(
    await db
      .from("boat_games")
      .upsert({ child_id: device.childId, family_id: device.familyId, money: g.money, space: g.space, cargo: g.cargo, island: g.island, sailing: g.sailing, today: g.today, updated_at: new Date().toISOString() })
      .select("child_id"),
    "boat_games",
  );
  if (!turns.length) return;
  const rows = turns.map((t) => ({
    family_id: device.familyId,
    child_id: device.childId,
    day: t.day,
    played_on: t.on,
    trade: t.trade,
    kind: t.kind,
    island: t.island,
    good: t.good,
    count: t.count,
    price: t.price,
    step: t.step,
    expected: t.expected,
    answer: t.answer,
    verdict: t.verdict,
    short: t.short,
    money: t.money,
  }));
  must(await db.from("boat_turns").insert(rows).select("id"), "boat_turns");
}

// The game as it stands today, saved if a new day began (with the landing's row for the parents).
async function current(db: Db, device: Device, ctx: Ctx): Promise<{ game: Game; turns: Turn[]; rolled: boolean }> {
  const before = await load(db, device);
  const game = roll(before, ctx);
  const rolled = game !== before;
  return { game, turns: rolled && game.today!.n > 1 ? [landTurn(game)] : [], rolled };
}

// The screen for this iPad's child, or null when the boat is not here (the test view off, or no times table placed).
export async function boatScreen(device: Device): Promise<Screen | null> {
  if (!devViewOn()) return null;
  const db = createAdminClient();
  const ctx = await ctxFor(db, device);
  if (!ctx) return null;
  const { game, turns, rolled } = await current(db, device, ctx);
  if (rolled) await save(db, device, game, turns);
  return view(game, ctx);
}

// The wall's Math tile: whether today's day is over. Null when the boat is not here.
export async function boatTile(device: Device): Promise<{ done: boolean } | null> {
  if (!devViewOn()) return null;
  const db = createAdminClient();
  const ctx = await ctxFor(db, device);
  if (!ctx) return null;
  return { done: doneToday(await load(db, device), ctx) };
}

// --- A move from the iPad ---

const MARKET = (x: unknown): x is 0 | 1 => x === 0 || x === 1;
const WHOLE = (x: unknown, max: number): x is number => Number.isInteger(x) && (x as number) >= 0 && (x as number) <= max;

// The move the iPad sent, checked; null for anything else. An answer's words are read in the move below.
export function actionOf(body: unknown): Action | { type: "answer"; text: string } | null {
  const b = body as Record<string, unknown> | null;
  if (!b || typeof b.type !== "string") return null;
  switch (b.type) {
    case "next":
    case "unpick":
    case "keep":
    case "cancel":
    case "fewer":
      return { type: b.type };
    case "pick":
      return MARKET(b.market) && WHOLE(b.offer, 3) ? { type: "pick", market: b.market, offer: b.offer } : null;
    case "count":
      return WHOLE(b.n, 100) && b.n > 0 ? { type: "count", n: b.n } : null;
    case "builder":
      return typeof b.buy === "boolean" ? { type: "builder", buy: b.buy } : null;
    case "sail":
      return MARKET(b.rumor) ? { type: "sail", rumor: b.rumor } : null;
    case "answer":
      return typeof b.text === "string" && b.text.trim() ? { type: "answer", text: b.text.trim().slice(0, 200) } : null;
    default:
      return null;
  }
}

let noNumberSystem: string | undefined;

// A reply with no number in it, read by the no-number judge (core/wall/no-number.ts; Haiku, within the judge's 3
// seconds): he doesn't know, he says something is missing or wrong, or anything else ("other" when no verdict came in
// time). What is sent names no child: the trade's question and sum, and his words. One model_runs row, after the reply.
async function readWords(device: Device, text: string, screen: Screen): Promise<Read> {
  const read = readNumber(text);
  if ("value" in read) return { value: read.value };
  if (read.none === "two_answers") return { none: "other" };
  noNumberSystem ??= readPrompt("no-number.md");
  const spent = { input: 0, output: 0, calls: 0 };
  const startedAt = new Date();
  const question = screen.trade ? [screen.trade.question, screen.trade.step?.ask ?? "", screen.trade.step?.sum ?? screen.trade.sum].filter(Boolean).join(" ") : "";
  const r = await readReply({ setting: "A trading game: the child buys and sells crates and says what is owed.", question, said: text }, ({ prompt, timeoutMs }) =>
    complete({
      system: noNumberSystem!,
      prompt,
      maxTokens: JUDGE_MAX_TOKENS,
      use: "judge",
      model: JUDGE_MODEL,
      thinking: JUDGE_THINKING,
      json: NO_NUMBER_SCHEMA,
      timeoutMs,
      onUsage: (u) => {
        spent.input += u.input;
        spent.output += u.output;
        spent.calls += 1;
      },
    }),
  );
  if (r.by === "rule") console.error("no number: read as other instead:", r.fault);
  after(async () => {
    const row = runRow("judge", [{ use: "judge", model: JUDGE_MODEL, ...spent }], { ok: r.by === "model", startedAt });
    const { error } = await createAdminClient().from("model_runs").insert({ family_id: device.familyId, ...row });
    if (error) console.error("no number: could not record the run:", error.message);
  });
  return { none: r.verdict };
}

// A move: the game rolled to today, the move made (null if it is not one he can make now), the state and the log saved,
// and the new screen.
export async function boatMove(device: Device, move: Action | { type: "answer"; text: string }): Promise<Screen | null> {
  if (!devViewOn()) return null;
  const db = createAdminClient();
  const ctx = await ctxFor(db, device);
  if (!ctx) return null;
  const { game, turns: landed } = await current(db, device, ctx);
  let action: Action;
  if (move.type === "answer" && !("read" in move)) {
    const before = view(game, ctx);
    if (!before.trade?.answering) return null;
    action = { type: "answer", text: move.text, read: await readWords(device, move.text, before) };
  } else action = move as Action;
  const r = act(game, action, ctx);
  if (!r) return null;
  await save(db, device, r.game, [...landed, ...r.turns]);
  return view(r.game, ctx);
}

// "Read it to me" on the boat: the screen's words as it stands now, in the tutor's voice, made on the first tap and
// stored by its words like every line (core/wall/speech.ts), so a line said before is never made again.
export async function sayBoat(device: Device): Promise<string | null> {
  if (!devViewOn()) return null;
  const db = createAdminClient();
  const ctx = await ctxFor(db, device);
  if (!ctx) return null;
  const text = voiceText(view(roll(await load(db, device), ctx), ctx).speak);
  if (!text) return null;
  const store = wallStore();
  const path = speechPath(TUTOR_VOICE, text);
  const stored = await store.speechUrl(path);
  if (stored) return stored;
  await makeSpeech(store, device.familyId, path, text, { name: TUTOR_VOICE, say: (words) => say(words) });
  return store.speechUrl(path);
}
