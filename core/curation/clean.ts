// Tidy the ends of a string the model wrote. Structured output keeps the JSON valid, but the model
// can still type JSON's own characters into a value: Rex's Wonder card on 19 Oct 2026 ended its
// handoff with "begins.}". Braces and brackets at either end are never meant for a child, and a
// double quote at the end is dropped only when it has no partner.

const QUOTES = /["“”]/g;

export function cleanEnds(value: string): string {
  let text = value.trim();
  for (;;) {
    const before = text;
    text = text.replace(/^[\s{}[\]]+/, "").replace(/[\s{}[\]]+$/, "");
    if (/["“”]$/.test(text) && (text.match(QUOTES)?.length ?? 0) % 2 === 1) text = text.slice(0, -1);
    if (/^["“”]/.test(text) && (text.match(QUOTES)?.length ?? 0) % 2 === 1) text = text.slice(1);
    if (text === before) return text;
  }
}

// A brace left anywhere inside is a sign the model mixed JSON into the words; the card is re-asked.
export const hasBrace = (value: string) => /[{}]/.test(value);
