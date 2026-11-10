// A reply with no number, on the Math tile, is read by the judge before the tile answers (docs/math-tile-slice.md, fix
// round 2; Brandon, 9 Nov 2026: "Say it as a number." to a boy who said the problem could not be answered was
// "demeaning"). Haiku, as the judge of a card's answer, with its time limit and fallback: one try, a second when the
// first failed with time left, never longer than the budget. Three verdicts:
//   questioned  he says something is missing or wrong with the problem
//   dont_know   he says he does not know
//   other       anything else
// No verdict in time is "other", the kindest line that asks for a number. The boy hears a line from words.ts for the
// verdict, never a word the model wrote. What is sent names no child (rule 7): the setting, the question and his
// words. Pure: the call is given to it.

import { JUDGE_BUDGET_MS } from "./judge.ts";

export const NO_NUMBER_VERDICTS = ["questioned", "dont_know", "other"] as const;
export type NoNumberVerdict = (typeof NO_NUMBER_VERDICTS)[number];
export type NoNumberInput = { setting: string; question: string; said: string };
export type NoNumberCall = (o: { prompt: string; timeoutMs: number }) => Promise<unknown>;
export type NoNumberResult = { verdict: NoNumberVerdict; reasoning: string; by: "model" | "rule"; fault: string | null };

export const noNumberPrompt = (i: NoNumberInput) => [`The setting: ${i.setting.trim()}`, "", `The question: ${i.question.trim()}`, "", "The child's reply:", i.said.trim()].join("\n");

export const NO_NUMBER_SCHEMA = {
  type: "object",
  properties: { reason: { type: "string" }, verdict: { type: "string", enum: [...NO_NUMBER_VERDICTS] } },
  required: ["reason", "verdict"],
  additionalProperties: false,
};

export function readNoNumber(raw: unknown): { verdict: NoNumberVerdict; reasoning: string } | null {
  const r = raw as { reason?: unknown; verdict?: unknown } | null;
  if (!r || !NO_NUMBER_VERDICTS.includes(r.verdict as NoNumberVerdict)) return null;
  return { verdict: r.verdict as NoNumberVerdict, reasoning: typeof r.reason === "string" ? r.reason.trim().slice(0, 300) : "" };
}

async function within<T>(work: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const late = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`no verdict within ${ms} ms`)), ms);
  });
  try {
    return await Promise.race([work, late]);
  } finally {
    clearTimeout(timer);
  }
}

export async function readReply(input: NoNumberInput, call: NoNumberCall, budgetMs = JUDGE_BUDGET_MS, now = () => Date.now()): Promise<NoNumberResult> {
  const start = now();
  const prompt = noNumberPrompt(input);
  let fault: string | null = null;
  for (let tries = 0; tries < 2; tries++) {
    const left = budgetMs - (now() - start);
    if (tries > 0 && left < 1000) break;
    try {
      const read = readNoNumber(await within(call({ prompt, timeoutMs: left }), left));
      if (read) return { ...read, by: "model", fault: null };
      fault = "a reply that could not be read";
    } catch (e) {
      fault = (e instanceof Error ? e.message : String(e)).split("\n")[0].slice(0, 160);
    }
  }
  return { verdict: "other", reasoning: "", by: "rule", fault };
}
