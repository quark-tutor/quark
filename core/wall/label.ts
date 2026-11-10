import type { HowSaid } from "./flow.ts";

// The label on what a boy said to "How did you get that?" (docs/math-tile-slice.md, What is built 7): Haiku, as the
// judge is, returns one of four labels and a line for the parents. It is called after the reply has gone, so he
// never waits on it, and it is recorded with the attempt; in this slice it does not choose the next move. What is
// sent names no child (rule 7): the question, the sum, his wrong answer, his words and a grade band. Pure: the call
// is given to it.

export const LABELS = ["slip", "wrong_sum", "guess", "right_thinking"] as const;
export type Label = (typeof LABELS)[number];
export const LABEL_MAX_TOKENS = 300;

export function labelPrompt(h: Omit<HowSaid, "attemptId">): string {
  return [
    `The question: ${h.question.trim()}`,
    `The sum it needs: ${h.expression} = ${h.answer} ${h.unit}`,
    `The child's wrong answer: ${h.wrong?.trim() || "(not kept)"}`,
    ...(h.band ? [`The child is in grades ${h.band}.`] : []),
    "",
    "What the child said when asked how they got it:",
    h.said.trim(),
  ].join("\n");
}

export const LABEL_SCHEMA = {
  type: "object",
  properties: { reason: { type: "string" }, label: { type: "string", enum: [...LABELS] } },
  required: ["reason", "label"],
  additionalProperties: false,
};

export function readLabel(raw: unknown): { label: Label; reasoning: string } | null {
  const r = raw as { reason?: unknown; label?: unknown } | null;
  if (!r || !LABELS.includes(r.label as Label)) return null;
  return { label: r.label as Label, reasoning: typeof r.reason === "string" ? r.reason.trim().slice(0, 300) : "" };
}
