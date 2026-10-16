// Dollars per million tokens, input and output, for the models Quark is likely to be set to.
// Anthropic's list prices; check them before trusting a cost report, and move PRICES_CHECKED when
// you do. The models page (/parent/models) shows this table and the date.

export const PRICES_CHECKED = "2026-10-16";

export const PRICES: Readonly<Record<string, { input: number; output: number }>> = {
  "claude-fable-5-1": { input: 10, output: 50 },
  "claude-opus-5-5": { input: 4, output: 20 },
  "claude-opus-5": { input: 5, output: 25 },
  "claude-sonnet-5-5": { input: 2, output: 10 },
  "claude-sonnet-5": { input: 2, output: 10 },
  "claude-haiku-5-5": { input: 0.1, output: 0.5 }, // prompts up to 100K tokens; $0.50 / $2.50 beyond
};

// What a model's tokens cost, or null when the model isn't in the table.
export function costOf(model: string, tokens: { input: number; output: number }): number | null {
  const p = PRICES[model];
  return p ? (tokens.input * p.input + tokens.output * p.output) / 1_000_000 : null;
}
