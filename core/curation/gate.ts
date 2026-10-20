import type { FamilyPoint, FamilyValues } from "../../lib/family-values.ts";
import type { GradeBand } from "../../lib/plan.ts";
import type { Perspective } from "../../lib/values.ts";
import type { CardBody } from "./cards.ts";
import { pool } from "./week.ts";

// The policy gate (CLAUDE.md rule 5; docs/gate-slice.md): every card leaves `pending` only through
// here, to `passed` or `blocked`, and never by default. Rules in code, judgment in the model:
//
// 1. Code first, with no model call. The family's setting for each subject the card's topic marks
//    comes from the same merge the rulebook and compare pages use (lib/family-rulebook.ts). A
//    subject a guardian blackballed, one set to "Don't bring it up", or one this child is not yet
//    old enough for blocks the card. Any one guardian's blackball counts, and no reason names who.
// 2. Then one call per card on QUARK_MODEL_GATE (core/prompts/gate.md, with gate/safety-floor.md),
//    given the gate's copy of the rulebook (it names no child), the topic's subjects and the family's
//    setting for each, the child's grade band, the parents' caution note when there is one, and the
//    card. Nothing else about the child (rule 7; a test holds this).
// 3. Fail closed. No rulebook, a model error, a refusal, a reply that can't be read, or a rulebook
//    that changes under the run: the card ends `pending`, the report says why, and the caller exits
//    with an error.
//
// The gate never rewrites a card: `rewritten` stays unused (decision 1). No plan topic is marked as a
// safety-floor lesson yet, so the floor stands aside in the model's reading and in the twenty-question
// test run; when floor lessons arrive, their topics skip the code blocks.

export type Policy = "pending" | "passed" | "rewritten" | "blocked";

export type CodeRule = "blackball" | "never" | "too_young";
export const MODEL_RULES = ["parent_led", "perspective", "blocked_topic", "rule_1", "rule_6", "frightening", "caution"] as const;
export type ModelRule = (typeof MODEL_RULES)[number];

export type GateReason = { rule: CodeRule | ModelRule; subject?: number; note: string };

// cards.policy_notes.gate: who decided, against which rulebook and floor, and why (decision 13).
export type GateNotes = {
  by: "code" | "model";
  rulebook: string; // values_profiles.source_hash
  floor: number;
  floor_first_guess: boolean;
  model?: string;
  reasons: GateReason[];
  reader?: string[];
  checked_at: string;
};
export type PolicyNotes = { validation?: string[]; gate?: GateNotes };

// What a caution reason says, whatever the model wrote: the note itself never comes back (decision 5).
export const CAUTION_NOTE = "Touches what the parents asked Quark to be careful about.";

// --- The safety floor ---

export type Floor = { version: number; firstGuess: boolean; text: string };

export function readFloor(file: string): Floor {
  const version = Number(file.match(/safety-floor v(\d+)/)?.[1]);
  if (!Number.isInteger(version)) throw new Error("gate/safety-floor.md has no version line (safety-floor vN).");
  return {
    version,
    firstGuess: /A first guess, pending June/.test(file),
    text: file.replace(/^<!--[\s\S]*?-->\s*/, "").trim(),
  };
}

// --- The child, as far as the gate knows it ---

// The plan's grade band (GRADE_BANDS in lib/plan.ts). A child has no grade on file, so it comes
// from the age: 8 and under is 2-3, 9 and over is 4-5 (proposed in the brief, kept on 20 Oct 2026).
export const ageBand = (age: number): GradeBand => (age <= 8 ? "2-3" : "4-5");

// The exact age is used here, in code, for "Not yet"; it is never sent.
export type GateChild = { id: string; age: number; carefulAbout: string | null };

export type GateCard = {
  id: string;
  childId: string;
  label: string; // "day 1 wonder, layer 2": names no child
  policy: Policy;
  notes: PolicyNotes | null;
  body: CardBody;
  subjects: number[]; // the topic's values points
  perspective: Perspective | null; // the topic's
};

export type Rulebook = {
  hash: string; // values_profiles.source_hash
  text: string; // the gate's copy (renderPolicy with forGate): no child named
  values: FamilyValues; // the merge the rulebook was written from
  pointNames: Map<number, string>;
};

// --- 1. Code ---

export type SubjectLine = { subject: number; name: string; setting: string; parentLed: boolean };

const PERSPECTIVE_WORDS: Record<Perspective, string> = {
  family_tradition: "answer it from what the family believes",
  several_fairly: "answer it, and show that other people see it differently",
  omitted: "say nothing on the belief itself",
};

function settingWords(p: FamilyPoint): { words: string; parentLed: boolean } {
  if (p.status === "waiting" || !p.setting) {
    return { words: "not settled yet: the parents haven't both answered, so the tutor does not raise it until they do (parent-led)", parentLed: true };
  }
  if (p.status === "differ") return { words: "the parents differ, so the tutor does not raise it until they agree (parent-led)", parentLed: true };
  const s = p.setting;
  if (s.when === "parent_led") return { words: "Send them to us: the tutor does not raise it, and hands off if asked (parent-led)", parentLed: true };
  if (s.when === "from_age") return { words: `Not yet, and this child is old enough: ${PERSPECTIVE_WORDS[s.perspective]}`, parentLed: false };
  return { words: `Answer it: ${PERSPECTIVE_WORDS[s.perspective]}`, parentLed: false };
}

// What the family's settings decide on their own for this child, and the lines the model reads for
// the rest. A subject the merge doesn't know is not settled.
export function codeCheck(
  subjects: number[],
  values: FamilyValues,
  child: Pick<GateChild, "id" | "age">,
  names: Map<number, string>,
): { blocked: GateReason[]; lines: SubjectLine[] } {
  const blocked: GateReason[] = [];
  const lines: SubjectLine[] = [];
  for (const subject of [...new Set(subjects)].sort((a, b) => a - b)) {
    const name = names.get(subject) ?? `Subject ${subject}`;
    const p = values.points.find((pt) => pt.point === subject) ?? { point: subject, status: "waiting", setting: null, waitingOn: [], blackballs: [] };
    if (p.status === "blocked") {
      blocked.push({ rule: "blackball", subject, note: `Subject ${subject} (${name}) is blocked by a guardian.` });
    } else if (p.status === "agreed" && p.setting?.when === "never") {
      blocked.push({ rule: "never", subject, note: `Subject ${subject} (${name}) is set to Don't bring it up.` });
    } else if (p.status === "agreed" && p.setting?.when === "from_age") {
      const from = p.setting.ages[child.id];
      if (from === undefined || child.age < from) {
        blocked.push({ rule: "too_young", subject, note: `Subject ${subject} (${name}) is Not yet for this child${from === undefined ? ", with no age set" : ` until age ${from}`}.` });
      } else {
        lines.push({ subject, name, ...asLine(p) });
      }
    } else {
      lines.push({ subject, name, ...asLine(p) });
    }
  }
  return { blocked, lines };
}

const asLine = (p: FamilyPoint) => {
  const { words, parentLed } = settingWords(p);
  return { setting: words, parentLed };
};

// --- 2. The model ---

// Everything the gate model is told about this one card. The child appears only as a grade band and,
// when the parents wrote one, their caution note: no nickname field, exact age, birth month, sex,
// reading level, interests, lens, door or level (decision 5). The card's own words may still carry
// the nickname the card writer used (left as written, decided 20 Oct 2026).
export function gatePrompt(input: {
  rulebook: string;
  lines: SubjectLine[];
  perspective: Perspective | null;
  child: { age: number; carefulAbout: string | null };
  card: CardBody;
}): string {
  const { card } = input;
  const note = input.child.carefulAbout?.trim();
  const subjects = input.lines.length
    ? [
        `This card's topic touches these subjects${input.perspective ? ` (the topic is written as: ${input.perspective})` : ""}:`,
        ...input.lines.map((l) => `- Subject ${l.subject}, ${l.name}. The family's setting: ${l.setting}.`),
      ]
    : ["This card's topic is marked as touching none of the 24 subjects."];
  const hints = (card.hints ?? []).map((h, i) => `${i + 1}. ${h}`);
  return [
    "The family's rulebook:",
    "",
    input.rulebook.trim(),
    "",
    ...subjects,
    "",
    `The child is in grades ${ageBand(input.child.age)}.`,
    ...(note ? [`The parents asked for care about: ${note}`] : []),
    "",
    "The card, as the child would see it:",
    `Title: ${card.title}`,
    `Text: ${card.text}`,
    `Read aloud: ${card.read_aloud}`,
    ...(card.image_alt?.trim() ? [`Picture: ${card.image_alt}`] : []),
    `Question: ${card.question}`,
    "Hints, in order:",
    ...hints,
    `Handoff: ${card.handoff}`,
  ].join("\n");
}

export const GATE_SCHEMA = {
  type: "object",
  properties: {
    verdict: { type: "string", enum: ["pass", "block"] },
    reasons: {
      type: "array",
      items: {
        type: "object",
        properties: {
          rule: { type: "string", enum: [...MODEL_RULES] },
          subject: { type: "integer" },
          note: { type: "string" },
        },
        required: ["rule", "subject", "note"],
        additionalProperties: false,
      },
    },
    reader_notes: { type: "array", items: { type: "string" } },
  },
  required: ["verdict", "reasons", "reader_notes"],
  additionalProperties: false,
};

const words = (s: string) => s.toLowerCase().normalize("NFKD").match(/[a-z0-9]+/g) ?? [];

// Does this text repeat the parents' caution note? Four words of it in a row do; a note shorter than
// that counts only whole.
export function quotesNote(text: string, note: string | null): boolean {
  const n = words(note ?? "");
  if (n.length === 0) return false;
  const t = ` ${words(text).join(" ")} `;
  const size = Math.min(4, n.length);
  for (let i = 0; i + size <= n.length; i++) if (t.includes(` ${n.slice(i, i + size).join(" ")} `)) return true;
  return false;
}

export type ReadVerdict = { verdict: "pass" | "block"; reasons: GateReason[]; reader: string[] } | { problem: string };

// The model's reply, checked. Anything odd is a problem, and the card stays pending.
export function readVerdict(raw: unknown, carefulAbout: string | null): ReadVerdict {
  const r = raw as { verdict?: unknown; reasons?: unknown; reader_notes?: unknown } | null;
  if (!r || (r.verdict !== "pass" && r.verdict !== "block") || !Array.isArray(r.reasons) || !Array.isArray(r.reader_notes)) {
    return { problem: "a reply that could not be read" };
  }
  const reasons: GateReason[] = [];
  for (const x of r.reasons as { rule?: unknown; subject?: unknown; note?: unknown }[]) {
    if (!MODEL_RULES.includes(x?.rule as ModelRule) || typeof x?.note !== "string" || !x.note.trim()) {
      return { problem: "a reason that could not be read" };
    }
    const subject = Number.isInteger(x.subject) && (x.subject as number) >= 1 && (x.subject as number) <= 24 ? (x.subject as number) : undefined;
    const note = x.rule === "caution" || quotesNote(x.note, carefulAbout) ? CAUTION_NOTE : x.note.trim();
    reasons.push({ rule: x.rule as ModelRule, ...(subject ? { subject } : {}), note });
  }
  if (r.verdict === "block" && reasons.length === 0) return { problem: "a block with no reason" };
  if (r.verdict === "pass" && reasons.length > 0) return { problem: "a pass that gave reasons to block" };
  const reader = (r.reader_notes as unknown[])
    .filter((n): n is string => typeof n === "string" && !!n.trim())
    .map((n) => n.trim())
    .filter((n) => !quotesNote(n, carefulAbout))
    .slice(0, 2);
  return { verdict: r.verdict, reasons, reader };
}

// --- 3. The run ---

export type GateComplete = <T>(options: {
  system: string;
  prompt: string;
  maxTokens: number;
  use: "gate";
  json: Record<string, unknown>;
  label?: string;
}) => Promise<T>;

export type GateDeps = {
  complete: GateComplete;
  saveVerdict: (cardId: string, policy: "pending" | "passed" | "blocked", notes: PolicyNotes | null) => Promise<void>;
  currentHash: () => Promise<string | null>; // values_profiles.source_hash now
};

export type GateOptions = {
  cards: GateCard[];
  children: GateChild[];
  rulebook: Rulebook | null; // null: the family has no rulebook yet
  floor: Floor;
  system: string; // gate.md, then the floor
  model: string;
  concurrency?: number;
  now?: () => Date;
};

export type HeldBack = { label: string; childId: string; by: "code" | "model"; reasons: GateReason[] };

export type GateReport = {
  cards: number;
  upToDate: number; // already checked against this rulebook and floor
  heldBackByChecks: number; // blocked by the card checks at build time; the gate leaves them
  checked: number;
  passed: number;
  blockedByCode: number;
  blockedByModel: number;
  pending: number; // left pending by a fault
  faults: Record<string, number>; // why, and how many
  reasons: Record<string, number>; // rule -> cards
  heldBack: HeldBack[];
  readerNotes: { label: string; childId: string; notes: string[] }[];
  rulebookChanged: boolean;
};

const isUpToDate = (c: GateCard, rulebook: Rulebook, floor: Floor) =>
  (c.policy === "passed" || c.policy === "blocked") && c.notes?.gate?.rulebook === rulebook.hash && c.notes.gate.floor === floor.version;

const heldByChecks = (c: GateCard) => c.policy === "blocked" && !!c.notes?.validation?.length && !c.notes.gate;

const withoutGate = (notes: PolicyNotes | null): PolicyNotes | null => (notes?.validation?.length ? { validation: notes.validation } : null);

export async function runGate(opts: GateOptions, deps: GateDeps): Promise<GateReport> {
  const { rulebook, floor } = opts;
  const now = opts.now ?? (() => new Date());
  const report: GateReport = {
    cards: opts.cards.length,
    upToDate: 0,
    heldBackByChecks: 0,
    checked: 0,
    passed: 0,
    blockedByCode: 0,
    blockedByModel: 0,
    pending: 0,
    faults: {},
    reasons: {},
    heldBack: [],
    readerNotes: [],
    rulebookChanged: false,
  };
  const fault = (why: string, n = 1) => {
    report.faults[why] = (report.faults[why] ?? 0) + n;
    report.pending += n;
  };

  const todo: GateCard[] = [];
  for (const c of opts.cards) {
    if (heldByChecks(c)) report.heldBackByChecks += 1;
    else if (rulebook && isUpToDate(c, rulebook, floor)) report.upToDate += 1;
    else todo.push(c);
  }
  if (!rulebook) {
    // Nothing to check against: nothing is written, and every card that needed a check stays as it is.
    if (todo.length) fault("the family has no rulebook yet (take Our Family's Beliefs first)", todo.length);
    return report;
  }

  const children = new Map(opts.children.map((k) => [k.id, k]));
  const settle = async (c: GateCard, policy: "pending" | "passed" | "blocked", notes: PolicyNotes | null) => {
    if (policy === "pending" && c.policy === "pending" && !c.notes?.gate) return; // already as it should be
    await deps.saveVerdict(c.id, policy, notes);
  };
  const leavePending = async (c: GateCard, why: string) => {
    fault(why);
    await settle(c, "pending", withoutGate(c.notes));
  };

  await pool(todo, opts.concurrency ?? 4, async (c) => {
    if (report.rulebookChanged) return leavePending(c, "the rulebook changed during the run");
    const child = children.get(c.childId);
    if (!child) return leavePending(c, "a card for a child this family doesn't have");
    report.checked += 1;

    const base = { rulebook: rulebook.hash, floor: floor.version, floor_first_guess: floor.firstGuess };
    const { blocked, lines } = codeCheck(c.subjects, rulebook.values, child, rulebook.pointNames);
    let policy: "passed" | "blocked";
    let gate: GateNotes;
    if (blocked.length) {
      policy = "blocked";
      gate = { by: "code", ...base, reasons: blocked, checked_at: now().toISOString() };
    } else {
      let raw: unknown;
      try {
        raw = await deps.complete<unknown>({
          system: opts.system,
          prompt: gatePrompt({ rulebook: rulebook.text, lines, perspective: c.perspective, child, card: c.body }),
          maxTokens: 16000,
          use: "gate",
          json: GATE_SCHEMA,
          label: `gate-${c.label.replace(/[^a-z0-9]+/gi, "-")}`,
        });
      } catch (e) {
        return leavePending(c, `the model call failed: ${(e instanceof Error ? e.message : String(e)).split("\n")[0].slice(0, 160)}`);
      }
      const read = readVerdict(raw, child.carefulAbout);
      if ("problem" in read) return leavePending(c, read.problem);
      policy = read.verdict === "pass" ? "passed" : "blocked";
      gate = {
        by: "model",
        ...base,
        model: opts.model,
        reasons: read.reasons,
        ...(read.reader.length ? { reader: read.reader } : {}),
        checked_at: now().toISOString(),
      };
      if (read.reader.length) report.readerNotes.push({ label: c.label, childId: c.childId, notes: read.reader });
    }

    // A verdict counts only against the rulebook it was reached under.
    if ((await deps.currentHash()) !== rulebook.hash) {
      report.rulebookChanged = true;
      return leavePending(c, "the rulebook changed during the run");
    }
    await settle(c, policy, { ...withoutGate(c.notes), gate });
    if (policy === "passed") report.passed += 1;
    else {
      if (gate.by === "code") report.blockedByCode += 1;
      else report.blockedByModel += 1;
      report.heldBack.push({ label: c.label, childId: c.childId, by: gate.by, reasons: gate.reasons });
      for (const rule of new Set(gate.reasons.map((r) => r.rule))) report.reasons[rule] = (report.reasons[rule] ?? 0) + 1;
    }
  });
  return report;
}

// What the family's settings say about a topic's subjects for one child, before anything is spent:
// the slots week:build lists so a guardian sees the blocks before the money (docs/gate-slice.md, To settle).
export function subjectWatch(subjects: number[], values: FamilyValues, child: Pick<GateChild, "id" | "age">, names: Map<number, string>): string[] {
  const { blocked, lines } = codeCheck(subjects, values, child, names);
  return [...blocked.map((r) => r.note), ...lines.filter((l) => l.parentLed).map((l) => `Subject ${l.subject} (${l.name}) is parent-led.`)];
}
