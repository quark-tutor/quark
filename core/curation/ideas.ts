import type { DaySlot } from "../../lib/lenses.ts";
import type { AnswerKey, IdeaChain, IdeaLayer, OfferedItem, WeekPlan, WeekTopic } from "./types.ts";

// Ideas: one model call per day and slot (use: "curate", core/prompts/ideas.md) returns a chain of
// four layers on that slot's topic for that day. Ideas are shared by every child, so nothing here
// knows about a child. Only approved content items are offered.

export const IDEA_SCHEMA = {
  type: "object",
  properties: {
    layers: {
      type: "array",
      items: {
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
      },
    },
  },
  required: ["layers"],
  additionalProperties: false,
};

export type RawIdeas = {
  layers: { title: string; statement: string; question: string; accept: string[]; rubric: string; content_item_id: string }[];
};

// Which topic a slot uses on a day: the week's topics for that slot taken in turn, so each is met
// more than once in a seven-day week.
export function topicForDay(plan: WeekPlan, slot: DaySlot, day: number): WeekTopic {
  const topics = plan.topics.filter((t) => t.slot === slot);
  if (topics.length === 0) throw new Error(`Week ${plan.week} has no topic for the ${slot} card`);
  return topics[(day - 1) % topics.length];
}

const itemLine = (i: OfferedItem) =>
  `- id ${i.id}: ${i.type}, "${i.title}"${i.creator ? `, ${i.creator}` : ""}.${i.description ? ` ${i.description}` : ""}`;

// The data for one call. The instructions are in core/prompts/ideas.md.
export function ideasPrompt(plan: WeekPlan, slot: DaySlot, day: number, earlier: IdeaChain[]): string {
  const topic = topicForDay(plan, slot, day);
  const lines = [
    `Week ${plan.week}: ${plan.title}. ${plan.why}`,
    plan.perspective
      ? `This week is marked perspective ${plan.perspective}, touching values points ${plan.valuesPoints.join(", ") || "none"}.`
      : "This week isn't marked with a perspective.",
    "",
    `Day ${day} of the week, the ${slot} card. Subject: ${topic.subject}.`,
    `Plan topic: ${topic.title} (${topic.keys.join(", ")})`,
    `Grade 2-3 summary: ${topic.younger}`,
    `Grade 4-5 summary: ${topic.older}`,
    "",
    topic.items.length ? "Approved items for this topic:" : "No approved items for this topic: leave content_item_id empty in every layer.",
    ...topic.items.map(itemLine),
    "",
  ];
  const before = earlier.filter((c) => c.slot === slot && c.day < day);
  if (before.length) {
    lines.push("Already written for this slot on earlier days (don't repeat these; layer 1 must be new):");
    for (const c of before) lines.push(`- Day ${c.day}: ${c.layers.map((l) => `${l.layer}. ${l.title}: ${l.statement}`).join(" | ")}`);
  } else {
    lines.push("Nothing has been written for this slot earlier this week.");
  }
  return lines.join("\n");
}

const text = (v: unknown) => typeof v === "string" && v.trim() !== "";

// Check the model's chain and turn it into layers. Throws, naming what's wrong, rather than store a
// half-made chain.
export function parseIdeas(raw: RawIdeas, offered: OfferedItem[]): IdeaLayer[] {
  const layers = raw?.layers;
  if (!Array.isArray(layers) || layers.length !== 4) throw new Error(`expected 4 layers, got ${layers?.length ?? 0}`);
  const ids = new Set(offered.map((i) => i.id));
  return layers.map((l, i) => {
    for (const key of ["title", "statement", "question", "rubric"] as const) {
      if (!text(l[key])) throw new Error(`layer ${i + 1} has no ${key}`);
    }
    const accept = (l.accept ?? []).map((a) => a.trim()).filter(Boolean);
    if (accept.length === 0) throw new Error(`layer ${i + 1} has no acceptable answers`);
    const item = l.content_item_id?.trim() ?? "";
    const answer_key: AnswerKey = { accept, rubric: l.rubric.trim() };
    return {
      layer: (i + 1) as IdeaLayer["layer"],
      title: l.title.trim(),
      statement: l.statement.trim(),
      question: l.question.trim(),
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

export async function writeIdeaChain(
  plan: WeekPlan,
  slot: DaySlot,
  day: number,
  earlier: IdeaChain[],
  deps: { complete: Complete; system: string },
): Promise<IdeaChain> {
  const topic = topicForDay(plan, slot, day);
  const raw = await deps.complete<RawIdeas>({
    system: deps.system,
    prompt: ideasPrompt(plan, slot, day, earlier),
    maxTokens: 16000,
    use: "curate",
    json: IDEA_SCHEMA,
    label: `ideas-day${day}-${slot}`,
  });
  try {
    return { day, slot, topic, layers: parseIdeas(raw, topic.items) };
  } catch (e) {
    throw new Error(`Day ${day} ${slot} ideas: ${e instanceof Error ? e.message : String(e)}`);
  }
}
