import { LENS_QUESTIONS, type Lens } from "../../lib/lenses.ts";
import type { Perspective } from "../../lib/values.ts";
import { cleanEnds, hasBrace } from "./clean.ts";
import type { AnswerKey, IdeaChain } from "./types.ts";

// Cards: one model call per child per day-slot (use: "write", kidFacingPrompt("card.md")) renders
// the day-slot's idea chain as four cards, one per layer. The prompt carries the child's nickname,
// age and reading level and nothing else about the child (CLAUDE.md rule 7). What the model writes
// is checked here, in code: a hint that gives the answer away gets the call asked again, once.

export type Reading = "read_to" | "reads_alone" | "chapter_books";

export type CardChild = {
  id: string;
  nickname: string;
  age: number;
  reading: Reading;
  interests: string[];
  boredBy: string[];
};

export type CardBody = {
  title: string;
  text: string;
  image_alt: string;
  read_aloud: string;
  question: string;
  hints: string[];
  handoff: string;
};

export type CardContext = {
  child: CardChild;
  chain: IdeaChain;
  lens: Lens;
  door: string | null; // an interest to open layer 1 with, or none
  statement: string | null; // values_profiles.statement
  perspective: Perspective | null;
  valuesPoints: { number: number; name: string }[];
};

export const CARD_KEYS = ["card_1", "card_2", "card_3", "card_4"] as const;

const ONE_CARD_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    text: { type: "string" },
    image_alt: { type: "string" },
    read_aloud: { type: "string" },
    question: { type: "string" },
    hints: { type: "array", items: { type: "string" } },
    handoff: { type: "string" },
  },
  required: ["title", "text", "image_alt", "read_aloud", "question", "hints", "handoff"],
  additionalProperties: false,
};

// Four named, required cards rather than an array, for the same reason as the ideas (an array let
// the real model stop after one).
export const CARD_SCHEMA = {
  type: "object",
  properties: Object.fromEntries(CARD_KEYS.map((k) => [k, ONE_CARD_SCHEMA])),
  required: [...CARD_KEYS],
  additionalProperties: false,
};

const READING: Record<Reading, string> = {
  read_to: "read to (doesn't read alone yet)",
  reads_alone: "reads alone",
  chapter_books: "reads chapter books",
};

export const levelOf = (child: Pick<CardChild, "reading" | "age">) => `${child.reading}, age ${child.age}`;

// Which day-slots an interest may open, at most a quarter of the week's layer-1 cards, spread
// through the week and taking the child's interests in turn. Keyed "day:slot".
export function planDoors(interests: string[], daySlots: string[]): Map<string, string> {
  const doors = new Map<string, string>();
  const usable = interests.map((i) => i.trim()).filter(Boolean);
  const n = Math.floor(daySlots.length / 4);
  if (usable.length === 0 || n === 0) return doors;
  const step = daySlots.length / n;
  for (let k = 0; k < n; k++) doors.set(daySlots[Math.floor(step * k + step / 2)], usable[k % usable.length]);
  return doors;
}

// The data for one call. The instructions are in core/prompts/card.md. Nothing about the child
// beyond nickname, age, reading level, and the one interest used as a door and the things to avoid.
export function cardPrompt(ctx: CardContext): string {
  const { child, chain, lens } = ctx;
  const items = new Map(chain.topic.items.map((i) => [i.id, i]));
  const lines = [
    `Child: ${child.nickname}, age ${child.age}. Reading level: ${READING[child.reading]}.`,
    `Lens: ${lens}. Its question: ${LENS_QUESTIONS[lens]}`,
    ctx.door ? `Way in for the first card: the child is into ${ctx.door}.` : "No interest to use as the way in this time.",
    child.boredBy.length ? `Don't use these as a way in: ${child.boredBy.join(", ")}.` : "",
    `Subject: ${chain.topic.subject} (the ${chain.slot} card, day ${chain.day}).${chain.topic.subject === "science" ? " Pair how it works with who it helps." : ""}`,
    ctx.perspective
      ? `Perspective: ${ctx.perspective}. Values points touched: ${ctx.valuesPoints.map((p) => `${p.number} (${p.name})`).join(", ") || "none"}.`
      : "No perspective marked: these cards don't touch the family's values points.",
    chain.topic.parentNote
      ? `A parent does this with the child: ${chain.topic.parentNote} Let the first card's handoff ask the child to get a parent for it. Never name an app, a website or a link.`
      : "",
    `The family's own words: ${ctx.statement?.trim() || "(none given yet)"}`,
    "",
    "The idea chain:",
  ];
  for (const l of chain.layers) {
    const item = l.content_item_id ? items.get(l.content_item_id) : undefined;
    lines.push(
      `Layer ${l.layer}: ${l.title}`,
      `  Statement: ${l.statement}`,
      `  Question: ${l.question}`,
      `  Accept: ${l.answer_key.accept.join("; ")}. Rubric: ${l.answer_key.rubric}`,
      item ? `  With it: ${item.type} "${item.title}"${item.description ? ` (${item.description})` : ""}` : "  No picture or recording with this one.",
    );
  }
  return lines.filter((l) => l !== "").join("\n");
}

// --- Checking what the model wrote ---

const STOP = new Set(
  "a an and are as at be by for from has have in is it its of on or that the their them they this to was were with what which who why how you your".split(" "),
);
const words = (s: string) =>
  // A trailing s is dropped only from longer words, so "rains" meets "rain" but "tens" isn't "ten".
  (s.toLowerCase().normalize("NFKD").match(/[a-z0-9]+/g) ?? []).map((w) => (w.length > 4 && w.endsWith("s") ? w.slice(0, -1) : w));

// Does this text give away an acceptable answer? True when every meaningful word of some accepted
// answer appears in it ("silt" in "Is it silt?"; "monsoon rain" in "the rain of the monsoon").
// Meaningful means not a stop word; two-letter words like "up" and "no" count, because dropping
// them turned "up the map" into "map" and "no coils" into "coil" (first real run, 14 Oct 2026).
export function givesAway(text: string, key: AnswerKey): boolean {
  const have = new Set(words(text));
  return key.accept.some((answer) => {
    const need = words(answer).filter((w) => !STOP.has(w) && (w.length > 1 || /\d/.test(w)));
    return need.length > 0 && need.every((w) => have.has(w));
  });
}

const BRILLIANCE = /\b(smart|clever|genius|brilliant|gifted|talented)\b/i;

export type RawCards = Partial<Record<(typeof CARD_KEYS)[number], CardBody>>;

// The four cards in order, or which ones are missing.
export function cardsOf(raw: RawCards): { cards: CardBody[]; missing: number[] } {
  const missing = CARD_KEYS.map((k, i) => (raw?.[k] && typeof raw[k] === "object" ? null : i + 1)).filter((n) => n !== null);
  return { cards: missing.length ? [] : CARD_KEYS.map((k) => raw[k]!), missing };
}

// Everything wrong with one card, in plain words. Empty when it is right.
export function checkCard(c: CardBody, layer: IdeaChain["layers"][number], reading: Reading): string[] {
  const problems: string[] = [];
  for (const key of ["title", "text", "read_aloud", "question", "handoff"] as const) {
    if (typeof c?.[key] !== "string" || !c[key].trim()) problems.push(`no ${key}`);
  }
  const hints = (c?.hints ?? []).filter((h) => h.trim());
  if (hints.length < 2 || hints.length > 3) problems.push(`needs two or three hints, has ${hints.length}`);
  hints.forEach((h, j) => {
    if (givesAway(h, layer.answer_key)) {
      problems.push(`hint ${j + 1}${j === hints.length - 1 ? " (the last)" : ""} gives the answer away: "${h}"`);
    }
  });
  if (layer.content_item_id && !c?.image_alt?.trim()) problems.push("the idea has a picture but image_alt is empty");
  if (reading === "read_to" && (c?.read_aloud?.length ?? 0) < (c?.text?.length ?? 0)) {
    problems.push("the child is read to, so read_aloud must carry the whole card");
  }
  const all = [c?.title, c?.text, c?.read_aloud, c?.question, c?.handoff, ...hints].join(" ");
  if (hasBrace([all, c?.image_alt ?? ""].join(" "))) problems.push("has a stray { or } in its words");
  const brilliance = all.match(BRILLIANCE);
  if (brilliance) problems.push(`uses a brilliance word ("${brilliance[0]}"); use effort words`);
  if (/https?:|www\./i.test(all)) problems.push("contains a link");
  return problems;
}

// Problems per card (index = layer - 1), or one problem for the whole reply when it isn't four cards.
export function checkCards(raw: RawCards, chain: IdeaChain, reading: Reading): { whole: string | null; cards: string[][] } {
  const { cards, missing } = cardsOf(raw);
  if (missing.length) {
    const got = CARD_KEYS.length - missing.length;
    return { whole: `expected 4 cards, got ${got}: card${missing.length === 1 ? "" : "s"} ${missing.join(", ")} missing`, cards: [] };
  }
  return { whole: null, cards: cards.map((c, i) => checkCard(c, chain.layers[i], reading)) };
}

const listProblems = (check: ReturnType<typeof checkCards>) =>
  check.whole ? [check.whole] : check.cards.flatMap((p, i) => p.map((x) => `card ${i + 1}: ${x}`));

export type Complete = <T>(options: {
  system: string;
  prompt: string;
  maxTokens: number;
  use: "curate" | "write";
  json: Record<string, unknown>;
  label?: string;
}) => Promise<T>;

// problems[i] holds what is still wrong with card i after the second try (empty when it passed).
export type WrittenCards = { cards: CardBody[]; asked: number; problems: string[][] };

// Write the four cards, asking once more if the first try fails the checks. If the second try still
// fails, the problems come back with the cards so the caller can hold them back from the child.
// Every field and hint with its ends tidied (see clean.ts). Cards that aren't there stay missing.
export function cleanCards(raw: RawCards): RawCards {
  const out: RawCards = {};
  for (const k of CARD_KEYS) {
    const c = raw?.[k];
    if (!c || typeof c !== "object") continue;
    const tidy = (v: unknown) => (typeof v === "string" ? cleanEnds(v) : v);
    out[k] = {
      ...c,
      title: tidy(c.title),
      text: tidy(c.text),
      image_alt: tidy(c.image_alt),
      read_aloud: tidy(c.read_aloud),
      question: tidy(c.question),
      handoff: tidy(c.handoff),
      hints: Array.isArray(c.hints) ? c.hints.map((h) => tidy(h) as string) : c.hints,
    } as CardBody;
  }
  return out;
}

export async function writeCards(ctx: CardContext, deps: { complete: Complete; system: string }): Promise<WrittenCards> {
  const prompt = cardPrompt(ctx);
  const ask = (extra: string) =>
    deps.complete<RawCards>({
      system: deps.system,
      prompt: prompt + extra,
      maxTokens: 16000,
      use: "write",
      json: CARD_SCHEMA,
      label: `cards-${ctx.child.nickname}-day${ctx.chain.day}-${ctx.chain.slot}${extra ? "-again" : ""}`,
    });

  let raw = cleanCards(await ask(""));
  let check = checkCards(raw, ctx.chain, ctx.child.reading);
  let asked = 1;
  if (listProblems(check).length) {
    const fix = listProblems(check).join("\n- ");
    raw = cleanCards(await ask(`\n\nYour last try had these problems. Write all four cards again and fix them:\n- ${fix}`));
    check = checkCards(raw, ctx.chain, ctx.child.reading);
    asked = 2;
  }
  if (check.whole) throw new Error(`${ctx.child.nickname}, day ${ctx.chain.day} ${ctx.chain.slot}: ${check.whole}`);
  const cards = cardsOf(raw).cards.map((c) => ({ ...c, hints: (c.hints ?? []).map((h) => h.trim()).filter(Boolean) }));
  return { cards, asked, problems: check.cards };
}
