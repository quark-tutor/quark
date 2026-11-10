// A sum as the program works it out (docs/math-tile-slice.md, What is built 3 and 4): every part and step of a math
// problem carries its sum as an expression ("7 × (2 + 1)", "24 / 3"), and the answer the model wrote must equal what
// this works out. Whole numbers only: a share that does not come out even is not a whole answer, and is refused.
// Pure, with no model and no database.

export type Op = "+" | "-" | "x" | "/" | "%";
export type Expr = { kind: "num"; value: number } | { kind: "op"; op: Op; left: Expr; right: Expr };

// One operation as the rungs read it: a chain of additions is one addition ("15 + 30 + 5").
export type Operation = { op: Op; operands: number[]; result: number };

const SYMBOL: Record<string, Op> = { "+": "+", "-": "-", "−": "-", "–": "-", "*": "x", x: "x", X: "x", "×": "x", "/": "/", "÷": "/", "%": "%" };

type Token = { num: number } | { op: Op } | { paren: "(" | ")" };

function tokenize(src: string): Token[] {
  const out: Token[] = [];
  const s = src.replace(/\$/g, "");
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    const num = /^\d{1,3}(,\d{3})+(?!\d)|^\d+/.exec(s.slice(i));
    if (num) {
      out.push({ num: Number(num[0].replace(/,/g, "")) });
      i += num[0].length;
      continue;
    }
    if (c === "(" || c === ")") {
      out.push({ paren: c });
      i++;
      continue;
    }
    if (SYMBOL[c]) {
      out.push({ op: SYMBOL[c] });
      i++;
      continue;
    }
    throw new Error(`"${src}" is not a sum the program can work out (it has "${c}")`);
  }
  return out;
}

// sum := term (("+" | "-") term)* ; term := factor (("x" | "/" | "%") factor)* ; factor := number | "(" sum ")"
export function parseExpr(src: string): Expr {
  const tokens = tokenize(src);
  let at = 0;
  const peek = () => tokens[at];
  const bad = (why: string) => new Error(`"${src}" is not a sum the program can work out (${why})`);
  function factor(): Expr {
    const t = tokens[at++];
    if (!t) throw bad("it ends too soon");
    if ("num" in t) return { kind: "num", value: t.num };
    if ("paren" in t && t.paren === "(") {
      const inner = sum();
      const close = tokens[at++];
      if (!close || !("paren" in close) || close.paren !== ")") throw bad("a bracket is not closed");
      return inner;
    }
    throw bad("a number is missing");
  }
  function term(): Expr {
    let left = factor();
    for (let t = peek(); t && "op" in t && (t.op === "x" || t.op === "/" || t.op === "%"); t = peek()) {
      at++;
      left = { kind: "op", op: t.op, left, right: factor() };
    }
    return left;
  }
  function sum(): Expr {
    let left = term();
    for (let t = peek(); t && "op" in t && (t.op === "+" || t.op === "-"); t = peek()) {
      at++;
      left = { kind: "op", op: t.op, left, right: term() };
    }
    return left;
  }
  if (!tokens.length) throw bad("it is empty");
  const e = sum();
  if (at !== tokens.length) throw bad("something is left over at the end");
  return e;
}

// The whole-number value, or an error saying why there is none.
export function evaluate(e: Expr): number {
  if (e.kind === "num") return e.value;
  const a = evaluate(e.left);
  const b = evaluate(e.right);
  switch (e.op) {
    case "+":
      return a + b;
    case "-":
      if (b > a) throw new Error(`${a} - ${b} goes below zero`);
      return a - b;
    case "x":
      return a * b;
    case "/":
      if (b === 0 || a % b !== 0) throw new Error(`${a} / ${b} is not a whole number`);
      return a / b;
    case "%":
      if (b === 0) throw new Error(`${a} % ${b} shares by nothing`);
      return a % b;
  }
}

// The numbers written in the sum, in order.
export function leaves(e: Expr): number[] {
  return e.kind === "num" ? [e.value] : [...leaves(e.left), ...leaves(e.right)];
}

// Every number the sum holds: what it is written with, and what each piece of it comes to.
export function values(e: Expr): number[] {
  return e.kind === "num" ? [e.value] : [...values(e.left), ...values(e.right), evaluate(e)];
}

// The operations the sum is made of, the innermost first; a chain of additions is one addition.
export function operations(e: Expr): Operation[] {
  if (e.kind === "num") return [];
  if (e.op === "+") {
    const terms: Expr[] = [];
    const flat = (x: Expr): void => {
      if (x.kind === "op" && x.op === "+") {
        flat(x.left);
        flat(x.right);
      } else terms.push(x);
    };
    flat(e);
    return [...terms.flatMap(operations), { op: "+", operands: terms.map(evaluate), result: evaluate(e) }];
  }
  return [...operations(e.left), ...operations(e.right), { op: e.op, operands: [evaluate(e.left), evaluate(e.right)], result: evaluate(e) }];
}

// The sum worked out, or the reason it can't be: for checkMath(), which names the problem instead of throwing.
export function workOut(src: string): { value: number; expr: Expr } | { problem: string } {
  try {
    const expr = parseExpr(src);
    return { value: evaluate(expr), expr };
  } catch (e) {
    return { problem: e instanceof Error ? e.message : String(e) };
  }
}

// --- The sum line (Brandon, 9 Nov 2026, fix round 4: "this is still math. The written format should be there from the
// start to accompany the words.") Made here from the part's own expression, never written by the model, so it cannot
// disagree with the answer: ×, ÷, + and − as the boys see them at school, brackets only where the sum needs them.

const SIGN: Record<Op, string> = { "+": "+", "-": "−", x: "×", "/": "÷", "%": "÷" };
const WORD: Record<Op, string> = { "+": "plus", "-": "minus", x: "times", "/": "divided by", "%": "divided by" };
const level = (op: Op) => (op === "+" || op === "-" ? 1 : 2);

// Does this side of an operation need brackets? A lower-level sum inside a higher one does ("7 × (2 + 1)"), and so
// does a same-level sum on the right of − or ÷ ("10 − (4 + 4)").
function needsBrackets(child: Expr, parent: Op, right: boolean): boolean {
  if (child.kind === "num") return false;
  if (level(child.op) < level(parent)) return true;
  return right && level(child.op) === level(parent) && (parent === "-" || parent === "/" || parent === "%");
}

function render(e: Expr, sign: (op: Op) => string, wrap: (s: string) => string): string {
  if (e.kind === "num") return e.value.toLocaleString("en-US");
  const side = (c: Expr, right: boolean) => (needsBrackets(c, e.op, right) ? wrap(render(c, sign, wrap)) : render(c, sign, wrap));
  return `${side(e.left, false)} ${sign(e.op)} ${side(e.right, true)}`;
}

// "120 + 250 = ?", or null when there is no sum to show (a bare number would be the answer itself) or it cannot be read.
export function sumLine(src: string): string | null {
  try {
    const e = parseExpr(src);
    if (e.kind === "num") return null;
    return `${render(e, (op) => SIGN[op], (s) => `(${s})`)} = ?${e.op === "%" ? " left over" : ""}`;
  } catch {
    return null;
  }
}

// The sum line as "Read it to me" says it: "120 plus 250 equals what?"; a bracketed sum is said with "together".
export function sumSpoken(src: string): string | null {
  try {
    const e = parseExpr(src);
    if (e.kind === "num") return null;
    return `${render(e, (op) => WORD[op], (s) => `, ${s} together,`)} equals what?`.replace(/\s+,/g, ",").replace(/,\s*,/g, ",").replace(/, equals/, " equals");
  } catch {
    return null;
  }
}
