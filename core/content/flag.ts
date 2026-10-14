import "server-only";
import { complete, type ModelImage } from "../model.ts";
import { readPrompt } from "../prompts.ts";
import { FLAGS, type Flag } from "./rule.ts";
import type { FetchedItem } from "./types.ts";

// Ask the gate model to tag one item (core/prompts/flag-content.md). The image goes in as bytes,
// since some museum servers refuse other people's fetchers.

export type FlagResult = { flags: Flag[]; note: string };

const schema = {
  type: "object",
  properties: {
    flags: { type: "array", items: { type: "string", enum: [...FLAGS] } },
    note: { type: "string" },
  },
  required: ["flags", "note"],
  additionalProperties: false,
};

export function describeItem(item: FetchedItem): string {
  const m = item.metadata;
  const lines = [
    `Title: ${item.title}`,
    `Creator: ${item.creator ?? "unknown"}`,
    `Date: ${m.date ?? "unknown"}`,
    `Type: ${item.type}`,
    m.description ? `Description from the source: ${m.description}` : null,
    Array.isArray(m.tags) && m.tags.length ? `Tags from the source: ${m.tags.join(", ")}` : null,
  ];
  return lines.filter(Boolean).join("\n");
}

export async function flagItem(item: FetchedItem, image?: ModelImage): Promise<FlagResult> {
  const result = await complete<FlagResult>({
    system: readPrompt("flag-content.md"),
    prompt: describeItem(item),
    images: image ? [image] : [],
    maxTokens: 4000,
    use: "gate",
    json: schema,
  });
  // Keep only known flags, once each, in vocabulary order.
  const flags = FLAGS.filter((f) => result.flags.includes(f));
  return { flags, note: result.note.trim() };
}
