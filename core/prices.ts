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

// Google Cloud's list prices for the tutor's voice and ears (docs/tutor-voice-slice.md): Chirp 3 HD voices by
// the character, Chirp 3 recognition (Speech-to-Text V2) by the minute, each request rounded up to the second.
// The free tiers are Google's, a month per billing account; null where the pricing page names none.
export const SPEECH_PRICES_CHECKED = "2026-10-22";

export const SPEECH_PRICES = {
  say: { name: "Chirp 3 HD voices (Text-to-Speech)", perMillionCharacters: 30, freeCharactersPerMonth: 1_000_000 },
  hear: { name: "Chirp 3 (Speech-to-Text V2)", perMinute: 0.016, freeMinutesPerMonth: null as number | null },
} as const;

export const sayCost = (characters: number) => (characters * SPEECH_PRICES.say.perMillionCharacters) / 1_000_000;
export const hearCost = (seconds: number) => (Math.ceil(seconds) / 60) * SPEECH_PRICES.hear.perMinute;

// What a model's tokens cost, or null when the model isn't in the table.
export function costOf(model: string, tokens: { input: number; output: number }): number | null {
  const p = PRICES[model];
  return p ? (tokens.input * p.input + tokens.output * p.output) / 1_000_000 : null;
}
