import type { CardBody } from "../curation/cards.ts";
import type { AnswerKey } from "../curation/types.ts";
import type { Verdict } from "./judge.ts";
import type { Picture, WorkedExample } from "../math/problem.ts";
import type { MathView } from "./math.ts";

// A card on the Wonder Wall: where a child is in a day-slot's chain of layers, worked out from the
// attempts alone (nothing is kept in the browser, so a reload or the other iPad agree), and what each
// reply carries to the browser (docs/wonder-wall-1-slice.md, decisions 2 and 3). Pure.

export const SLOTS = ["look", "wonder", "listen", "then", "puzzle"] as const;
export type Slot = (typeof SLOTS)[number];

// The wall's order on a day (docs/tile-rotation-slice.md): SLOTS turned by one for each day since Monday 26 October
// 2026, the boys' first day, so that day's order is the one they knew. The front tile goes to the back, so tomorrow's
// first is the one after today's first, and in five days each tile is first once and last once. No randomness: a
// parent can say tomorrow's order. day is the family's own (todayIn()), never the server's, and every child of the
// family gets the same order. Only the wall reads it; the Sunday build, the nightly lines and the week page keep SLOTS.
export const TURNS_FROM = "2026-10-26";
const DAY_MS = 24 * 60 * 60 * 1000;

export function slotOrder(day: string): Slot[] {
  const days = Math.round((Date.parse(`${day}T00:00:00Z`) - Date.parse(`${TURNS_FROM}T00:00:00Z`)) / DAY_MS);
  const turn = Number.isFinite(days) ? ((days % SLOTS.length) + SLOTS.length) % SLOTS.length : 0;
  return [...SLOTS.slice(turn), ...SLOTS.slice(0, turn)];
}

// One layer the wall may show: its card passed, today, in a live week, its item still approved.
export type ChainLayer = {
  cardId: string;
  slot: Slot;
  layer: number;
  body: CardBody;
  questionId: string;
  answerKey: AnswerKey;
};

// verdict is the judge's (core/wall/judge.ts); a row from before the judge has none.
// move is a math part's (core/wall/math.ts); null on every other card.
export type AttemptRow = { question_id: string; correct: boolean | null; verdict?: string | null; move?: string | null; answer?: string | null; created_at: string };

// at is the index of the layer in the chain. A card is done at the handoff: after the hints ran out
// ("handed_off"), after an open question's answer ("open"), or after a right answer with no deeper layer
// that passed ("answered", which shows the handoff too, so every card ends at a person).
export type CardState =
  | { kind: "answering"; at: number; hintsSeen: number }
  | { kind: "handed_off" | "open" | "answered"; at: number; hintsSeen: number };

// The layers a child can reach: layer 1, then each next one while it is there. A layer held back stops
// the child at the one before, even when a deeper one passed.
export function reachable<T extends { layer: number }>(layers: T[]): T[] {
  const sorted = [...layers].sort((a, b) => a.layer - b.layer);
  const out: T[] = [];
  for (const l of sorted) {
    if (l.layer !== out.length + 1) break;
    out.push(l);
  }
  return out;
}

// A guess that spends a hint: one judged not yet or close. An answer to the hint is a step on the way, so it
// spends none and never hands off (Brandon, 28 Oct 2026); a row from before the judge counts as it did.
export const spendsHint = (a: AttemptRow) => !a.verdict || a.verdict === "not_yet" || a.verdict === "close";

// Where the child is: one hint per wrong guess, the handoff after one more guess once the hints have run
// out, and a right answer moves to the next layer. Attempts past the card's end are ignored.
export function chainState(chain: ChainLayer[], attempts: AttemptRow[]): CardState {
  const ordered = [...attempts].sort((a, b) => a.created_at.localeCompare(b.created_at));
  for (let at = 0; at < chain.length; at++) {
    const { questionId, body } = chain[at];
    const hints = body.hints.length;
    let wrong = 0;
    let right = false;
    for (const a of ordered.filter((x) => x.question_id === questionId)) {
      if (a.correct === null) return { kind: "open", at, hintsSeen: Math.min(wrong, hints) };
      if (a.correct) {
        right = true;
        break;
      }
      if (!spendsHint(a)) continue;
      wrong += 1;
      if (wrong > hints) return { kind: "handed_off", at, hintsSeen: hints };
    }
    if (!right) return { kind: "answering", at, hintsSeen: wrong };
    if (at === chain.length - 1) return { kind: "answered", at, hintsSeen: Math.min(wrong, hints) };
  }
  return { kind: "answering", at: 0, hintsSeen: 0 }; // an empty chain; the wall never shows one
}

export const isDone = (s: CardState) => s.kind !== "answering";

// The name of a line the tutor can say aloud (core/wall/speech.ts reads it back): a card's read-aloud words,
// its question, its handoff, or one hint by its place. Never the words themselves.
export const lineId = (cardId: string, part: "read" | "question" | "handoff" | number) =>
  typeof part === "number" ? `${cardId}.hint.${part}` : `${cardId}.${part}`;

// --- What reaches the browser (rule 7): these fields and nothing else. A test holds each list. ---

export type Tile = { slot: Slot; title: string; cardId: string; done: boolean; math: boolean };
export type WallReply = { nickname: string; tiles: Tile[] };

// url is a signed URL to the family's stored copy, or a recording's Wikimedia URL (with the MP3 Wikimedia
// keeps of it, which iPad Safari plays where it may not play Ogg).
export type Media = { type: string; url: string; mp3: string | null; credit: { title: string; lines: string[] } };

export type CardReply = {
  id: string;
  slot: Slot;
  layer: number;
  title: string;
  text: string;
  image_alt: string;
  question: string;
  media: Media | null;
  hints: string[];
  state: CardState["kind"];
  handoff?: string; // only once reached
  math?: MathPage; // a part of a math problem
};

// A math part's page (docs/math-tile-slice.md): where he is in its moves, the graph, and the worked example on the
// first part while the rung is new to him.
export type MathPage = { view: MathView; graph: Picture | null; example: WorkedExample | null };

// to_question: the guess answered the hint, so the page asks the question again and no hint is spent.
// math: a math part's page after the answer; say_number: the reply held no number, and nothing was written.
export type AnswerReply = {
  outcome: "guess_first" | "not_yet" | "close" | "to_question" | "right" | "handoff" | "open" | "math" | "say_number";
  math?: MathView;
  hint?: string;
  handoff?: string;
  next?: string; // the next layer's card id, once earned
};

export function wallReply(nickname: string, tiles: Tile[]): WallReply {
  return { nickname, tiles: tiles.map(({ slot, title, cardId, done, math }) => ({ slot, title, cardId, done, math })) };
}

// The layer the state is at, with the hints seen so far, and the handoff only when the card is done.
export function cardReply(chain: ChainLayer[], state: CardState, media: Media | null): CardReply {
  const { cardId, slot, layer, body } = chain[state.at];
  return {
    id: cardId,
    slot,
    layer,
    title: body.title,
    text: body.text,
    image_alt: body.image_alt,
    question: body.question,
    media,
    hints: body.hints.slice(0, state.hintsSeen),
    state: state.kind,
    ...(isDone(state) ? { handoff: body.handoff } : {}),
  };
}

// The reply to a guess, from the state after it was recorded: the verdict, never a word the judge wrote. A
// guess that isn't a guess writes nothing and gets no hint; an answer to the hint gets the question again.
export function answerReply(judged: Verdict | "open", chain: ChainLayer[], after: CardState): AnswerReply {
  if (judged === "not_a_guess") return { outcome: "guess_first" };
  const body = chain[after.at].body;
  if (judged === "open") return { outcome: "open", handoff: body.handoff };
  if (judged === "right") {
    return after.kind === "answering" ? { outcome: "right", next: chain[after.at].cardId } : { outcome: "right", handoff: body.handoff };
  }
  if (judged === "hint") return { outcome: "to_question" };
  if (after.kind === "handed_off") return { outcome: "handoff", handoff: body.handoff };
  return { outcome: judged === "close" ? "close" : "not_yet", hint: body.hints[after.hintsSeen - 1] };
}
