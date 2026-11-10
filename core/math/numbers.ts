// Numbers in words and digits, read in code (docs/math-tile-slice.md, What is built 6): "6", "six", "6 sets" and
// "about six" are all 6, and whether a number is right is never the model's call. numbersIn() finds every number in
// a line, for checkMath(); readNumber() reads a child's answer. Pure.

const UNITS: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
};
const TENS: Record<string, number> = { twenty: 20, thirty: 30, forty: 40, fourty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 };
const SCALES: Record<string, number> = { hundred: 100, thousand: 1000 };

export type Found = { value: number; start: number; end: number };

type Word = { text: string; start: number; end: number };

// Words and digit runs with where they sit; a hyphen splits ("twenty-four"), a comma inside digits does not.
function wordsOf(s: string): Word[] {
  const out: Word[] = [];
  const re = /\d{1,3}(?:,\d{3})+(?!\d)|\d+(?:\.\d+)?|[a-z]+/gi;
  for (let m = re.exec(s); m; m = re.exec(s)) out.push({ text: m[0].toLowerCase(), start: m.index, end: m.index + m[0].length });
  return out;
}

const isNumberWord = (w: string) => w in UNITS || w in TENS || w in SCALES || w === "dozen";

// Every number in the text, in order: digits ("1,000", "4.5", "$16") and numbers in words ("twenty-four", "a hundred
// and six", "three hundred", "a dozen"). "and" or "a" joins only inside a number in words.
export function numbersIn(text: string): Found[] {
  const ws = wordsOf(text.replace(/[’‘]/g, "'"));
  const out: Found[] = [];
  for (let i = 0; i < ws.length; i++) {
    const w = ws[i];
    if (/^\d/.test(w.text)) {
      out.push({ value: Number(w.text.replace(/,/g, "")), start: w.start, end: w.end });
      continue;
    }
    // "a hundred", "a dozen": the a is one.
    const startsWithA = w.text === "a" && ws[i + 1] && (ws[i + 1].text in SCALES || ws[i + 1].text === "dozen");
    if (!isNumberWord(w.text) && !startsWithA) continue;
    let total = 0;
    let current = startsWithA ? 1 : 0;
    let j = startsWithA ? i + 1 : i;
    let end = w.end;
    let any = false;
    for (; j < ws.length; j++) {
      const t = ws[j].text;
      if (t in UNITS) {
        if (any && current % 10 !== 0 && current < 100) break; // "two three" is two numbers
        current += UNITS[t];
      } else if (t in TENS) {
        if (any && current % 100 !== 0) break;
        current += TENS[t];
      } else if (t === "hundred") {
        current = (current || 1) * 100;
      } else if (t === "thousand") {
        total += (current || 1) * 1000;
        current = 0;
      } else if (t === "dozen") {
        current = (current || 1) * 12;
      } else if (t === "and" && any && ws[j + 1] && (ws[j + 1].text in UNITS || ws[j + 1].text in TENS)) {
        continue;
      } else break;
      any = true;
      end = ws[j].end;
    }
    out.push({ value: total + current, start: w.start, end });
    i = j - 1;
  }
  return out;
}

export const numbersOf = (text: string) => numbersIn(text).map((n) => n.value);

// What a child's answer says, as one number. After "is", "=", "makes", "equals" or "are", the first number after the
// last of them ("3 times 8 is 24" is 24); otherwise the first number in it ("6 sets of 4" is 6). Two numbers joined by
// "or" are not one answer. None is "say it as a number".
export type Read = { value: number } | { none: "no_number" | "two_answers" };

export function readNumber(reply: string): Read {
  const text = reply.replace(/[’‘]/g, "'").toLowerCase();
  const found = numbersIn(text);
  if (!found.length) return { none: "no_number" };
  for (let k = 0; k + 1 < found.length; k++) {
    const between = text.slice(found[k].end, found[k + 1].start);
    if (/\bor\b/.test(between) && between.length < 20) return { none: "two_answers" }; // "6 or 7", "6, or maybe 7"
  }
  let marker = -1;
  for (const m of text.matchAll(/=|\bis\b|\bmakes\b|\bequals\b|\bare\b|\bmake\b/g)) marker = Math.max(marker, m.index! + m[0].length);
  const after = marker >= 0 ? found.find((n) => n.start >= marker) : undefined;
  return { value: (after ?? found[0]).value };
}
