import { commonsMp3 } from "../content/commons.ts";
import { credit } from "../content/credit.ts";
import type { CardBody } from "../curation/cards.ts";
import type { AnswerKey } from "../curation/types.ts";
import { todayIn } from "../curation/week.ts";
import { judgeGuess, type MatchRule } from "./answer.ts";
import {
  answerReply,
  cardReply,
  chainState,
  isDone,
  reachable,
  SLOTS,
  wallReply,
  type AnswerReply,
  type AttemptRow,
  type CardReply,
  type ChainLayer,
  type Media,
  type Slot,
  type WallReply,
} from "./card.ts";

// Every step the kid view takes, against a store (docs/wonder-wall-1-slice.md, decision 4). lib/wall.ts
// gives it the database, scoped to the paired iPad's child and family; the tests give it a fake one that
// returns every card it holds, so each check here is proven on its own, whatever the query filtered.
// The rule (docs/04, "How a week goes live"): the wall shows a card only when its theme is live, the card
// has passed, and its day is today where the family lives; a card whose picture or recording is no longer
// approved is not shown. Nothing a child types is logged here or sent anywhere but the family's rows.

export type ItemRow = {
  type: string;
  title: string | null;
  creator: string | null;
  url: string;
  license: string;
  attribution: string | null;
  approved: boolean;
  date: string | null;
  source: string | null;
  storagePath: string | null;
};

export type CardRow = {
  id: string;
  family_id: string;
  child_id: string;
  day: string;
  slot: string;
  layer: number;
  policy: string;
  body: CardBody;
  theme: { status: string; family_id: string } | null;
  itemId: string | null; // the idea's content item, if it names one
  item: ItemRow | null;
  question: { id: string; prompt: string; answer_key: AnswerKey } | null;
};

export type SessionRow = { id: string; started_at: string; ended_at: string | null; ended_reason: string | null };

export type AttemptInsert = {
  family_id: string;
  session_id: string;
  child_id: string;
  question_id: string;
  mode: "teach";
  answer: string;
  correct: boolean | null;
  hints_used: number;
  seconds: number | null;
};

export type WallStore = {
  timezone(familyId: string): Promise<string>;
  cards(q: { familyId: string; childId: string; day: string; slot?: Slot }): Promise<CardRow[]>; // ordered by layer, then made
  cardById(q: { familyId: string; childId: string; id: string }): Promise<CardRow | null>;
  attempts(childId: string, questionIds: string[]): Promise<AttemptRow[]>;
  lastSession(childId: string): Promise<SessionRow | null>;
  startSession(row: { family_id: string; child_id: string; device: string; started_at: string }): Promise<string>;
  endSession(id: string, reason: "child_left"): Promise<void>;
  touchSession(id: string, at: string): Promise<void>;
  addAttempt(row: AttemptInsert): Promise<void>;
  sign(storagePath: string): Promise<string | null>;
};

// The paired iPad: one child of one family. Every step starts from it.
export type Scope = { familyId: string; childId: string; deviceId: string };

export const SESSION_GAP_MS = 30 * 60 * 1000;
export const ANSWER_MAX = 200;
export const SECONDS_MAX = 60 * 60;

// The rule, in code, for one card row.
export function onWall(row: CardRow, scope: Scope, today: string): boolean {
  return (
    row.family_id === scope.familyId &&
    row.child_id === scope.childId &&
    row.day === today &&
    row.policy === "passed" &&
    row.theme?.status === "live" &&
    row.theme.family_id === scope.familyId &&
    (row.itemId === null || row.item?.approved === true) &&
    row.question !== null &&
    (SLOTS as readonly string[]).includes(row.slot)
  );
}

const toLayer = (row: CardRow): ChainLayer => ({
  cardId: row.id,
  slot: row.slot as Slot,
  layer: row.layer,
  body: row.body,
  questionId: row.question!.id,
  answerKey: row.question!.answer_key,
});

// A day-slot's chain as the child can reach it: the rows on the wall, one per layer (the first made, if a
// day was ever written twice), layer 1 onwards while each is there.
export function chainOf(rows: CardRow[], scope: Scope, today: string, slot: string): { chain: ChainLayer[]; rows: CardRow[] } {
  const seen = new Set<number>();
  const visible = rows.filter((r) => r.slot === slot && onWall(r, scope, today) && !seen.has(r.layer) && seen.add(r.layer));
  const chain = reachable(visible);
  return { chain: chain.map(toLayer), rows: chain };
}

export const today = async (store: WallStore, scope: Scope, now: Date) => todayIn(await store.timezone(scope.familyId), now);

// A visit: the child's last session if anything happened in the last 30 minutes, else a new one, and the
// one before it ended as child_left. Its ended_at is moved to each load and answer, so it is the last activity.
export async function visit(store: WallStore, scope: Scope, now: Date): Promise<string> {
  const last = await store.lastSession(scope.childId);
  const at = now.toISOString();
  if (last && !last.ended_reason && now.getTime() - Date.parse(last.ended_at ?? last.started_at) < SESSION_GAP_MS) {
    await store.touchSession(last.id, at);
    return last.id;
  }
  if (last && !last.ended_reason) await store.endSession(last.id, "child_left");
  return store.startSession({ family_id: scope.familyId, child_id: scope.childId, device: scope.deviceId, started_at: at });
}

// The wall: today's five first cards in slot order, each done or not.
export async function wallFor(store: WallStore, scope: Scope, nickname: string, now: Date): Promise<WallReply> {
  const day = await today(store, scope, now);
  const rows = await store.cards({ familyId: scope.familyId, childId: scope.childId, day });
  const chains = SLOTS.map((slot) => chainOf(rows, scope, day, slot).chain).filter((c) => c.length > 0);
  const attempts = chains.length ? await store.attempts(scope.childId, chains.flat().map((l) => l.questionId)) : [];
  await visit(store, scope, now);
  return wallReply(
    nickname,
    chains.map((chain) => ({ slot: chain[0].slot, title: chain[0].body.title, cardId: chain[0].cardId, done: isDone(chainState(chain, attempts)) })),
  );
}

async function mediaOf(store: WallStore, row: CardRow): Promise<Media | null> {
  const item = row.item;
  if (!item) return null;
  const stored = item.storagePath ? await store.sign(item.storagePath) : null;
  // Recordings keep their Wikimedia URL for now (decided 20 Oct 2026); a picture is shown only from the
  // family's own stored copy.
  const url = stored ?? (item.type === "audio" ? item.url : null);
  if (!url) return null;
  return {
    type: item.type,
    url,
    mp3: !stored && item.type === "audio" ? commonsMp3(item.url) : null,
    credit: credit({ ...item, title: item.title ?? "Untitled" }),
  };
}

// Where a card is: the reply for the layer the child is at, or the id to go to when the card asked for isn't
// that layer (the tile opens layer 1; a deeper layer not yet earned is never shown). Null when it isn't on
// the wall today.
export async function cardFor(
  store: WallStore,
  scope: Scope,
  cardId: string,
  now: Date,
): Promise<{ card: CardReply } | { goTo: string } | null> {
  const day = await today(store, scope, now);
  const row = await store.cardById({ familyId: scope.familyId, childId: scope.childId, id: cardId });
  if (!row || !onWall(row, scope, day)) return null;
  const { chain, rows } = chainOf(await store.cards({ familyId: scope.familyId, childId: scope.childId, day, slot: row.slot as Slot }), scope, day, row.slot);
  if (!chain.some((l) => l.cardId === cardId)) return null;
  const state = chainState(chain, await store.attempts(scope.childId, chain.map((l) => l.questionId)));
  await visit(store, scope, now);
  if (chain[state.at].cardId !== cardId) return { goTo: chain[state.at].cardId };
  return { card: cardReply(chain, state, await mediaOf(store, rows[state.at])) };
}

// A guess on the layer the child is at. Refused, writing nothing, when the card isn't on the wall today, isn't
// the layer the child is at, or is done. "I don't know" writes nothing and gets no hint.
export async function answer(
  store: WallStore,
  scope: Scope,
  input: { cardId: string; guess: string; seconds: number | null },
  now: Date,
  rule: MatchRule,
): Promise<AnswerReply | null> {
  const day = await today(store, scope, now);
  const row = await store.cardById({ familyId: scope.familyId, childId: scope.childId, id: input.cardId });
  if (!row || !onWall(row, scope, day)) return null;
  const { chain } = chainOf(await store.cards({ familyId: scope.familyId, childId: scope.childId, day, slot: row.slot as Slot }), scope, day, row.slot);
  const attempts = await store.attempts(scope.childId, chain.map((l) => l.questionId));
  const before = chainState(chain, attempts);
  if (!chain.length || isDone(before) || chain[before.at].cardId !== input.cardId) return null;

  const here = chain[before.at];
  const guess = input.guess.trim().slice(0, ANSWER_MAX);
  const judged = judgeGuess(guess, here.answerKey, row.question!.prompt, rule);
  if (judged === "not_a_guess") return answerReply(judged, chain, before);

  const session = await visit(store, scope, now);
  const correct = judged === "open" ? null : judged === "right";
  const seconds = input.seconds === null || !Number.isFinite(input.seconds) ? null : Math.min(SECONDS_MAX, Math.max(0, Math.round(input.seconds)));
  await store.addAttempt({
    family_id: scope.familyId,
    session_id: session,
    child_id: scope.childId,
    question_id: here.questionId,
    mode: "teach",
    answer: guess,
    correct,
    hints_used: before.hintsSeen,
    seconds,
  });
  const after = chainState(chain, [...attempts, { question_id: here.questionId, correct, created_at: now.toISOString() }]);
  return answerReply(judged, chain, after);
}
