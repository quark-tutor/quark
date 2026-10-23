import { createHash } from "node:crypto";
import { hearCost, sayCost } from "../prices.ts";
import { chainState, isDone, type AttemptRow, type Slot } from "./card.ts";
import { ANSWER_MAX, chainOf, onWall, today, type Scope, type WallStore } from "./flow.ts";
import { SAY } from "./words.ts";

// What the tutor says aloud and what it hears (docs/tutor-voice-slice.md), against a store, as flow.ts is.
// A line is named by its card and part, never by free text from the browser, and is said only when the child
// can see it now: a hint once earned, the handoff once reached (rule 3). Its audio is made the first time it
// is asked for and stored at a path from the voice and the words, so a line costs once a voice, and nothing
// about the child is written. A clip the child says is heard and its words handed back; neither is kept
// here (the answer the child sends is an attempt, as before). Nothing here logs.

export type SpeechRun = { family_id: string; kind: "say" | "hear"; model: string; characters: number; seconds: number; cost: number };

export type SpeechStore = WallStore & {
  speechUrl(path: string): Promise<string | null>; // a signed URL to the stored file, or null when there is none
  putSpeech(path: string, audio: Uint8Array): Promise<void>;
  addSpeechRun(row: SpeechRun): Promise<void>;
};

// The wall's own sentences the tutor may say, from core/wall/words.ts.
export const SPOKEN_REPLIES = ["nothingToday", "everythingDone", "guessFirst", "thinkAbout", "right", "toTalkAbout", "forAPerson", "didntSend"] as const;
export type SpokenReply = (typeof SPOKEN_REPLIES)[number];

export type Line =
  | { cardId: string; part: "read" | "question" | "handoff" }
  | { cardId: string; part: "hint"; hint: number }
  | { wall: SpokenReply };

const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";

// "<card id>.read", "<card id>.question", "<card id>.hint.0", "<card id>.handoff", or "wall.thinkAbout".
export function parseLine(line: string): Line | null {
  const wall = /^wall\.(\w+)$/.exec(line);
  if (wall) return (SPOKEN_REPLIES as readonly string[]).includes(wall[1]) ? { wall: wall[1] as SpokenReply } : null;
  const card = new RegExp(`^(${UUID})\\.(read|question|handoff|hint\\.([0-9]))$`, "i").exec(line);
  if (!card) return null;
  if (card[3] !== undefined) return { cardId: card[1], part: "hint", hint: Number(card[3]) };
  return { cardId: card[1], part: card[2] as "read" | "question" | "handoff" };
}

// The hints a layer the child has finished showed: one per wrong guess before the right one.
function hintsSeenBefore(attempts: AttemptRow[], questionId: string, hints: number): number {
  let wrong = 0;
  for (const a of [...attempts].filter((x) => x.question_id === questionId).sort((x, y) => x.created_at.localeCompare(y.created_at))) {
    if (a.correct !== false) break;
    wrong += 1;
  }
  return Math.min(wrong, hints);
}

// The words of a line, or null when the child can't see it now: a card not on the wall today, a layer not yet
// reached, a hint not yet earned, a handoff not yet reached.
export async function lineText(store: WallStore, scope: Scope, line: Line, now: Date): Promise<string | null> {
  if ("wall" in line) return SAY[line.wall];
  const day = await today(store, scope, now);
  const row = await store.cardById({ familyId: scope.familyId, childId: scope.childId, id: line.cardId });
  if (!row || !onWall(row, scope, day)) return null;
  const { chain } = chainOf(await store.cards({ familyId: scope.familyId, childId: scope.childId, day, slot: row.slot as Slot }), scope, day, row.slot);
  const at = chain.findIndex((l) => l.cardId === line.cardId);
  if (at < 0) return null;
  const attempts = await store.attempts(scope.childId, chain.map((l) => l.questionId));
  const state = chainState(chain, attempts);
  if (at > state.at) return null;
  const { body, questionId } = chain[at];
  if (line.part === "hint") {
    const seen = at === state.at ? state.hintsSeen : hintsSeenBefore(attempts, questionId, body.hints.length);
    return line.hint < seen ? (body.hints[line.hint] ?? null) : null;
  }
  if (line.part === "handoff") return at === state.at && isDone(state) ? body.handoff : null;
  return line.part === "read" ? readLine(body) : body.question;
}

// What "Read it to me" says on a card: the card as the page shows it, its words then its question (Brandon at
// stop 2, 23 Oct 2026: what it read "does not match the text on the screen"). read_aloud, the writer's shorter
// spoken version for a child who reads alone, is never said.
export const readLine = (body: { text: string; question: string }) => `${body.text.trim()} ${body.question.trim()}`;

// The words as they go to the voice. Google reads a thousands comma as a pause, "3,400" as "three, four hundred"
// (Brandon at stop 2, 23 Oct 2026), so the commas inside a number are dropped: 3,400 becomes 3400. The other
// number shapes in the week's cards (years, decades, 1811-12, decimals, 29th, 24-hour, 400s) and fractions,
// slash dates and 2–3 it reads as one number already (heard back by Chirp 3, 23 Oct), so they go as written.
export const forVoice = (text: string) => text.replace(/(?<![\d.,])\d{1,3}(?:,\d{3})+(?!\d|,\d)/g, (n) => n.replaceAll(",", ""));

// Where a line's audio is kept in the private bucket: the voice, then a hash of the words as they went to it, so
// a change to forVoice() makes a line again rather than replaying the old reading.
export const speechPath = (voice: string, text: string) => `speech/${voice}/${createHash("sha256").update(text).digest("hex")}.mp3`;

// A signed URL to the line's audio in the tutor's voice: the stored file, or one made now and stored. Null when
// the child can't see the line now.
export async function spokenUrl(
  store: SpeechStore,
  scope: Scope,
  line: Line,
  now: Date,
  voice: { name: string; say: (text: string) => Promise<Uint8Array> },
): Promise<string | null> {
  const words = (await lineText(store, scope, line, now))?.trim();
  if (!words) return null;
  const text = forVoice(words);
  const path = speechPath(voice.name, text);
  const stored = await store.speechUrl(path);
  if (stored) return stored;
  await store.putSpeech(path, await voice.say(text));
  await store.addSpeechRun({ family_id: scope.familyId, kind: "say", model: voice.name, characters: text.length, seconds: 0, cost: sayCost(text.length) });
  return store.speechUrl(path);
}

// The clip Talk sends: 16-bit mono PCM at this rate, from a hold of at most 30 seconds.
export const CLIP_RATE = 16_000;
export const CLIP_MAX_SECONDS = 30;
const CLIP_MIN_SECONDS = 0.3;

// The words in a clip, cut to an answer's length, or null for a clip that isn't one. A clip too short to hold a
// word is not sent to Google.
export async function heardText(
  store: SpeechStore,
  scope: Scope,
  pcm: Uint8Array,
  ears: { model: string; hear: (pcm: Uint8Array) => Promise<string> },
): Promise<string | null> {
  if (pcm.length % 2 !== 0) return null;
  const seconds = pcm.length / 2 / CLIP_RATE;
  if (seconds > CLIP_MAX_SECONDS + 1) return null;
  if (seconds < CLIP_MIN_SECONDS) return "";
  const text = await ears.hear(pcm);
  await store.addSpeechRun({ family_id: scope.familyId, kind: "hear", model: ears.model, characters: 0, seconds: Math.round(seconds * 100) / 100, cost: hearCost(seconds) });
  return text.trim().slice(0, ANSWER_MAX);
}
