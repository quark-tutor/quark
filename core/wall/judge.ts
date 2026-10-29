import type { AnswerKey } from "../curation/types.ts";

// The judge of a child's answer (docs/judge-slice.md): a model reads the card's words, the question, the answers
// the card accepts, the hints the child has seen and the child's words, and returns a verdict only, with one line
// of reasoning for the parents' log. The child hears a line written in advance for the verdict (core/wall/words.ts):
// nothing the model writes leaves the server. If the model doesn't answer in time, or errors, the word rule
// (judgeGuess() in core/wall/answer.ts) judges instead, and the reply says nothing different (decided 28 Oct 2026).
// What is sent names no child (rule 7): the nickname is taken out of the card's words, and the child is a grade
// band. Pure: the call is given to it, so it is tested without a model.

export const JUDGE_MODEL = "claude-haiku-5-5"; // Brandon, 28 Oct 2026, at stop 1
// Haiku 5.5 thinks before it answers, at medium effort unless told otherwise, and on 11 of 365 answers the thinking
// used up the whole reply before the verdict was written, so the word rule judged (Brandon at stop 1's go, 28 Oct
// 2026: "fix the replies that ran past the length cap"). At low effort 1 of 365 did, and it judged more right answers
// right and answered faster; with thinking off it judged fewer right (scripts/judge-table.mts, 28 Oct 2026).
export const JUDGE_THINKING: "off" | "low" | undefined = "low";
export const JUDGE_MAX_TOKENS = 300;

// The whole wait, both tries: a child is waiting on the reply.
export const JUDGE_BUDGET_MS = 3000;
// A second try only when the first failed fast enough to leave this much of the budget.
const RETRY_NEEDS_MS = 1000;

export const VERDICTS = ["right", "close", "hint", "not_yet", "not_a_guess"] as const;
export type Verdict = (typeof VERDICTS)[number];
export type Judgement = { verdict: Verdict; reasoning: string };

export type JudgeInput = {
  text: string; // the card's words, as the child read them
  question: string;
  key: AnswerKey;
  hints: string[]; // the hints shown so far, in order
  band: string | null; // the grade band, "2-3" or "4-5"
  guess: string;
  nickname?: string; // only to take it out
};

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Everything the judge is told about one answer. The nickname, wherever the card writer or the child used it, is
// sent as "the child".
export function judgePrompt(input: JudgeInput): string {
  const name = input.nickname?.trim();
  const out = name ? (s: string) => s.replace(new RegExp(`(?<![\\p{L}\\p{N}])${escape(name)}(?![\\p{L}\\p{N}])`, "giu"), "the child") : (s: string) => s;
  const rubric = input.key.rubric?.trim();
  return [
    "The card's words:",
    input.text.trim() ? out(input.text.trim()) : "(none)",
    "",
    `The question: ${out(input.question.trim())}`,
    "",
    "Answers the card accepts:",
    ...input.key.accept.map((a) => `- ${out(a)}`),
    ...(rubric ? ["", `What counts: ${out(rubric)}`] : []),
    "",
    "Hints shown so far, the most recent last:",
    ...(input.hints.length ? input.hints.map((h, i) => `${i + 1}. ${out(h)}`) : ["None."]),
    "",
    ...(input.band ? [`The child is in grades ${input.band}.`, ""] : []),
    "The child's answer:",
    out(input.guess.trim()),
  ].join("\n");
}

// reason first, so the model says what it sees before it decides.
export const JUDGE_SCHEMA = {
  type: "object",
  properties: {
    reason: { type: "string" },
    verdict: { type: "string", enum: [...VERDICTS] },
  },
  required: ["reason", "verdict"],
  additionalProperties: false,
};

// The model's reply, checked; null when it can't be read. An answer to a hint when no hint was shown is not_yet.
export function readJudgement(raw: unknown, hintsShown: number): Judgement | null {
  const r = raw as { reason?: unknown; verdict?: unknown } | null;
  if (!r || !VERDICTS.includes(r.verdict as Verdict)) return null;
  const verdict = r.verdict === "hint" && hintsShown === 0 ? "not_yet" : (r.verdict as Verdict);
  const reasoning = typeof r.reason === "string" ? r.reason.trim().slice(0, 300) : "";
  return { verdict, reasoning };
}

export type JudgeCall = (o: { prompt: string; timeoutMs: number }) => Promise<unknown>;
export type JudgeResult = { judgement: Judgement | null; tries: number; fault: string | null; ms: number };

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

// One try, and a second when the first failed with time left; never longer than the budget. A null judgement is
// the word rule's to judge.
export async function judgeAnswer(input: JudgeInput, call: JudgeCall, budgetMs = JUDGE_BUDGET_MS, now = () => Date.now()): Promise<JudgeResult> {
  const start = now();
  const prompt = judgePrompt(input);
  let fault: string | null = null;
  let tries = 0;
  while (tries < 2) {
    const left = budgetMs - (now() - start);
    if (tries > 0 && left < RETRY_NEEDS_MS) break;
    tries += 1;
    try {
      const raw = await within(call({ prompt, timeoutMs: left }), left);
      const judgement = readJudgement(raw, input.hints.length);
      if (judgement) return { judgement, tries, fault: null, ms: now() - start };
      fault = "a reply that could not be read";
    } catch (e) {
      fault = (e instanceof Error ? e.message : String(e)).split("\n")[0].slice(0, 160);
    }
  }
  return { judgement: null, tries, fault, ms: now() - start };
}
