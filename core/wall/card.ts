import type { CardBody } from "../curation/cards.ts";
import type { AnswerKey } from "../curation/types.ts";
import type { Judged } from "./answer.ts";

// A card on the Wonder Wall: where a child is in a day-slot's chain of layers, worked out from the
// attempts alone (nothing is kept in the browser, so a reload or the other iPad agree), and what each
// reply carries to the browser (docs/wonder-wall-1-slice.md, decisions 2 and 3). Pure.

export const SLOTS = ["look", "wonder", "listen", "then", "puzzle"] as const;
export type Slot = (typeof SLOTS)[number];

// One layer the wall may show: its card passed, today, in a live week, its item still approved.
export type ChainLayer = {
  cardId: string;
  slot: Slot;
  layer: number;
  body: CardBody;
  questionId: string;
  answerKey: AnswerKey;
};

export type AttemptRow = { question_id: string; correct: boolean | null; created_at: string };

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
      wrong += 1;
      if (wrong > hints) return { kind: "handed_off", at, hintsSeen: hints };
    }
    if (!right) return { kind: "answering", at, hintsSeen: wrong };
    if (at === chain.length - 1) return { kind: "answered", at, hintsSeen: Math.min(wrong, hints) };
  }
  return { kind: "answering", at: 0, hintsSeen: 0 }; // an empty chain; the wall never shows one
}

export const isDone = (s: CardState) => s.kind !== "answering";

// --- What reaches the browser (rule 7): these fields and nothing else. A test holds each list. ---

export type Tile = { slot: Slot; title: string; cardId: string; done: boolean };
export type WallReply = { nickname: string; tiles: Tile[] };

export type Media = { type: string; url: string; credit: { title: string; lines: string[] } };

export type CardReply = {
  id: string;
  slot: Slot;
  layer: number;
  title: string;
  text: string;
  image_alt: string;
  read_aloud: string;
  question: string;
  media: Media | null;
  hints: string[];
  state: CardState["kind"];
  handoff?: string; // only once reached
};

export type AnswerReply = {
  outcome: "guess_first" | "not_yet" | "right" | "handoff" | "open";
  hint?: string;
  handoff?: string;
  next?: string; // the next layer's card id, once earned
};

export function wallReply(nickname: string, tiles: Tile[]): WallReply {
  return { nickname, tiles: tiles.map(({ slot, title, cardId, done }) => ({ slot, title, cardId, done })) };
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
    read_aloud: body.read_aloud,
    question: body.question,
    media,
    hints: body.hints.slice(0, state.hintsSeen),
    state: state.kind,
    ...(isDone(state) ? { handoff: body.handoff } : {}),
  };
}

// The reply to a guess, from the state after it was recorded. A guess that isn't a guess writes nothing
// and gets no hint.
export function answerReply(judged: Judged, chain: ChainLayer[], after: CardState): AnswerReply {
  if (judged === "not_a_guess") return { outcome: "guess_first" };
  const body = chain[after.at].body;
  if (judged === "open") return { outcome: "open", handoff: body.handoff };
  if (judged === "right") {
    return after.kind === "answering" ? { outcome: "right", next: chain[after.at].cardId } : { outcome: "right", handoff: body.handoff };
  }
  if (after.kind === "handed_off") return { outcome: "handoff", handoff: body.handoff };
  return { outcome: "not_yet", hint: body.hints[after.hintsSeen - 1] };
}
