import type { DaySlot } from "../../lib/lenses.ts";
import { cleanEnds } from "./clean.ts";
import type { AnswerKey, IdeaChain, IdeaLayer, OfferedItem, WeekPlan, WeekTopic } from "./types.ts";

// Ideas: one model call per day and slot (use: "curate", core/prompts/ideas.md) returns a chain of
// four layers on that slot's topic for that day. Ideas are shared by every child, so nothing here
// knows about a child. Only approved content items are offered.

export const LAYER_KEYS = ["layer_1", "layer_2", "layer_3", "layer_4"] as const;

const LAYER_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    statement: { type: "string" },
    question: { type: "string" },
    accept: { type: "array", items: { type: "string" } },
    rubric: { type: "string" },
    content_item_id: { type: "string" },
  },
  required: ["title", "statement", "question", "accept", "rubric", "content_item_id"],
  additionalProperties: false,
};

// Four named, required layers rather than an array: an array schema let the real model stop after
// one layer (14 Oct 2026), and structured outputs can't require an array's length.
export const IDEA_SCHEMA = {
  type: "object",
  properties: Object.fromEntries(LAYER_KEYS.map((k) => [k, LAYER_SCHEMA])),
  required: [...LAYER_KEYS],
  additionalProperties: false,
};

export type RawLayer = { title: string; statement: string; question: string; accept: string[]; rubric: string; content_item_id: string };
export type RawIdeas = Partial<Record<(typeof LAYER_KEYS)[number], RawLayer>>;

// Which topic a slot uses on a day, from the week's schedule (core/curation/schedule.ts): the
// thread on its slot, a short lesson on each of the others.
export function topicForDay(plan: WeekPlan, slot: DaySlot, day: number): WeekTopic {
  const id = plan.schedule.find((d) => d.day === day)?.topics[slot];
  const topic = plan.topics.find((t) => t.id === id);
  if (!topic) throw new Error(`Week ${plan.week} has no topic for day ${day}'s ${slot} card`);
  return topic;
}

const itemLine = (i: OfferedItem) =>
  `- id ${i.id}: ${i.type}, "${i.title}"${i.creator ? `, ${i.creator}` : ""}.${i.description ? ` ${i.description}` : ""}`;

// The data for one call. The instructions are in core/prompts/ideas.md.
export function ideasPrompt(plan: WeekPlan, slot: DaySlot, day: number, earlier: IdeaChain[]): string {
  const topic = topicForDay(plan, slot, day);
  const lines = [
    topic.kind === "thread" && plan.thread
      ? `Part of the running thread, ${plan.thread.title}: one day of it, on this card. This part of the thread: ${topic.chapter?.title ?? ""}. ${topic.chapter?.why ?? ""}`.trim()
      : "A short lesson: one day on its own, not part of a thread. Make it whole in four layers.",
    ...(topic.earlierInThread?.length ? [`Earlier in the thread (the children have met these; build on them, don't repeat them): ${topic.earlierInThread.join("; ")}.`] : []),
    topic.perspective
      ? `This topic is marked perspective ${topic.perspective}, touching values points ${topic.valuesPoints.join(", ") || "none"}.`
      : "This topic isn't marked with a perspective.",
    "",
    `Day ${day} of the week, the ${slot} card. Subject: ${topic.subject}.`,
    `Plan topic: ${topic.title} (${topic.keys.join(", ")})`,
    `Grade 2-3 summary: ${topic.younger}`,
    `Grade 4-5 summary: ${topic.older}`,
    ...(topic.parentNote ? [`A parent does this with the child (for the parent, not the card): ${topic.parentNote}`] : []),
    "",
    topic.items.length ? "Approved items for this topic:" : "No approved items for this topic: leave content_item_id empty in every layer.",
    ...topic.items.map(itemLine),
    "",
  ];
  const before = earlier.filter((c) => c.topic.id === topic.id && c.day < day);
  if (before.length) {
    lines.push("Already written on this topic on earlier days (don't repeat these; layer 1 must be new):");
    for (const c of before) lines.push(`- Day ${c.day}: ${c.layers.map((l) => `${l.layer}. ${l.title}: ${l.statement}`).join(" | ")}`);
  } else {
    lines.push("Nothing has been written on this topic earlier this week.");
  }
  return lines.join("\n");
}

const text = (v: unknown) => typeof v === "string" && v.trim() !== "";

// Check the model's chain and turn it into layers. Throws, naming what's wrong, rather than store a
// half-made chain.
export function parseIdeas(raw: RawIdeas, offered: OfferedItem[]): IdeaLayer[] {
  const missing = LAYER_KEYS.map((k, i) => (raw?.[k] && typeof raw[k] === "object" ? null : i + 1)).filter((n) => n !== null);
  if (missing.length) {
    const got = LAYER_KEYS.length - missing.length;
    throw new Error(`expected 4 layers, got ${got}: layer${missing.length === 1 ? "" : "s"} ${missing.join(", ")} missing`);
  }
  const layers = LAYER_KEYS.map((k) => raw[k]!);
  const ids = new Set(offered.map((i) => i.id));
  return layers.map((l, i) => {
    for (const key of ["title", "statement", "question", "rubric"] as const) {
      if (!text(l[key])) throw new Error(`layer ${i + 1} has no ${key}`);
    }
    const accept = (l.accept ?? []).map(cleanEnds).filter(Boolean);
    // Layer 4 is a question to talk about with a person, with more than one good answer, so its
    // list may be empty and the rubric says what a good answer includes.
    if (accept.length === 0 && i < 3) throw new Error(`layer ${i + 1} has no acceptable answers`);
    const item = l.content_item_id?.trim() ?? "";
    const answer_key: AnswerKey = { accept, rubric: cleanEnds(l.rubric) };
    return {
      layer: (i + 1) as IdeaLayer["layer"],
      title: cleanEnds(l.title),
      statement: cleanEnds(l.statement),
      question: cleanEnds(l.question),
      answer_key,
      content_item_id: item && ids.has(item) ? item : null,
    };
  });
}

// What the idea's source_refs hold: the plan topic's keys, and the content item with its attribution.
export function sourceRefs(topic: WeekTopic, layer: IdeaLayer): string[] {
  const item = topic.items.find((i) => i.id === layer.content_item_id);
  return [...topic.keys.map((k) => `plan:${k}`), ...(item ? [`content:${item.id} ${item.attribution}`] : [])];
}

export type Complete = <T>(options: {
  system: string;
  prompt: string;
  maxTokens: number;
  use: "curate" | "write";
  json: Record<string, unknown>;
  label?: string;
}) => Promise<T>;

// Layer 1 is the card a child meets first, so when the topic has an approved item, layer 1 uses one
// (decided 15 Oct 2026, docs/04 "How a topic gets its picture"). Layers 2-4 may go text only. An id
// that wasn't offered has already been dropped by parseIdeas, so it counts as missing here.
export function firstLayerProblem(layers: IdeaLayer[], offered: OfferedItem[]): string | null {
  if (offered.length === 0 || layers[0]?.content_item_id) return null;
  return `layer 1 has no content_item_id, but this topic has approved items. Layer 1 must use one of them (${offered.map((i) => i.id).join(", ")}); layers 2-4 may leave it empty.`;
}

// Write the chain, asking once more if layer 1 has no item when one was offered. If the second try
// still has none, the chain is kept (chain.asked is 2) and the week report lists it.
export async function writeIdeaChain(
  plan: WeekPlan,
  slot: DaySlot,
  day: number,
  earlier: IdeaChain[],
  deps: { complete: Complete; system: string },
): Promise<IdeaChain> {
  const topic = topicForDay(plan, slot, day);
  const prompt = ideasPrompt(plan, slot, day, earlier);
  const ask = async (extra: string) => {
    const raw = await deps.complete<RawIdeas>({
      system: deps.system,
      prompt: prompt + extra,
      maxTokens: 16000,
      use: "curate",
      json: IDEA_SCHEMA,
      label: `ideas-day${day}-${slot}${extra ? "-again" : ""}`,
    });
    try {
      return parseIdeas(raw, topic.items);
    } catch (e) {
      throw new Error(`Day ${day} ${slot} ideas: ${e instanceof Error ? e.message : String(e)}`);
    }
  };
  let layers = await ask("");
  let asked = 1;
  const problem = firstLayerProblem(layers, topic.items);
  if (problem) {
    layers = await ask(`

Your last try had this problem. Write all four layers again and fix it:
- ${problem}`);
    asked = 2;
  }
  return { day, slot, topic, layers, asked };
}
