import { scrubNames } from "../curation/cron.ts";
import { faultText } from "../curation/gate.ts";
import { todayIn } from "../curation/week.ts";
import { sayCost } from "../prices.ts";
import { SLOTS, type ChainLayer } from "./card.ts";
import { chainOf, type CardRow, type Scope } from "./flow.ts";
import { makeSpeech, partWords, speechPath, SPOKEN_REPLIES, voiceText, type CardPart, type SpeechStore, type Voice } from "./speech.ts";
import { SAY } from "./words.ts";

// The tutor's lines made ahead (docs/lines-ahead-slice.md): once a night, at 3 am Hawaii, every line the day's
// cards can give is made in the tutor's voice and stored, so a child's first "Read it to me" plays like a second
// one. Which day: today where the family lives, in its live week. Which cards: each child's, by the wall's own
// rule (chainOf()), so a card held back, or a layer out of reach behind one, gives nothing. Which lines: every
// part, through partWords(), voiceText() and speechPath(), so a line made here is the very file a tap plays;
// and the wall's own sentences. Making a line stores a file and says nothing to anyone: saying it is still
// lineText() on the paired child's tap, which refuses a hint not yet earned and a handoff not yet reached
// (rule 3). Pure: the database, the voice and the clock are passed in; lib/speech-ahead.ts gives the real ones
// and app/api/cron/speech/route.ts is the route. A line made twice is the same file written twice, so there is
// no lock. Nothing here logs, and no row or reply names a child.

export const AHEAD_ACTION = "speech.ahead";
export const AT_ONCE = 8; // lines made at a time, as the Sunday build makes cards
// Google allows Chirp 3 voices 200 requests a minute a project, and test and live share the project.
export const PER_MINUTE = 150;
export const BUDGET_SECONDS = 240; // the Sunday build's line: no new line is started after it, inside the 300-second limit
export const FAILURES_TO_STOP = 3; // Google down, or the key wrong: stop asking

export type AheadLine = { path: string; text: string };
export type CardLine = AheadLine & { cardId: string; layer: number; rank: number }; // rank 0 is the read line

const PARTS = (body: ChainLayer["body"]): CardPart[] => [
  { part: "read" },
  { part: "question" },
  ...body.hints.map((_, hint) => ({ part: "hint" as const, hint })),
  // A math part's moves (docs/math-tile-slice.md): its wordings, steps, tie and working, and the worked example.
  ...(body.math
    ? [
        ...body.math.wordings.map((_, i) => ({ part: "wording" as const, n: i + 1 })),
        ...body.math.steps.map((_, i) => ({ part: "step" as const, n: i + 1 })),
        { part: "tie" as const },
        { part: "working" as const },
        ...(body.math.example ? [{ part: "example" as const }] : []),
      ]
    : []),
  { part: "handoff" },
];

// Every line one child's cards of a day can give, layer by layer (the read lines first in each layer, the lines a
// child taps most), each once. `rows` are that child's cards of the day; chainOf() keeps the ones the wall can show.
export function dayLines(rows: CardRow[], scope: Scope, day: string, voice: string): CardLine[] {
  const out: CardLine[] = [];
  for (const slot of SLOTS) {
    for (const layer of chainOf(rows, scope, day, slot).chain) {
      PARTS(layer.body).forEach((part, rank) => {
        const text = voiceText(partWords(layer.body, part));
        if (text) out.push({ path: speechPath(voice, text), text, cardId: layer.cardId, layer: layer.layer, rank });
      });
    }
  }
  return out;
}

// The wall's own sentences the tutor may say: made once ever, since each is stored by its words.
export const wallLines = (voice: string): AheadLine[] =>
  SPOKEN_REPLIES.map((k) => voiceText(SAY[k])!).map((text) => ({ path: speechPath(voice, text), text }));

// The night's lines in the order they are made: the wall's sentences, then layer 1's read lines for every child,
// layer 1's other lines, then layer 2 and on, each file once. If the time runs out, what is left is what a child
// is least likely to tap first.
export function nightLines(wall: AheadLine[], children: CardLine[][]): AheadLine[] {
  const ordered = children.flat().sort((a, b) => a.layer - b.layer || Math.min(a.rank, 1) - Math.min(b.rank, 1));
  const seen = new Set<string>();
  return [...wall, ...ordered]
    .filter((l) => !seen.has(l.path) && seen.add(l.path))
    .map(({ path, text }) => ({ path, text }));
}

// --- A firing ---

export type AheadOutcome = "made" | "nothing" | "refused" | "failed";

export type AheadCounts = {
  lines: number; // the day's lines, the wall's sentences included
  made: number; // made now
  already: number; // stored already, by an earlier night or tap
  failed: number;
  left: number; // not reached: the time ran out, or the firing stopped asking after failures
  characters: number; // sent to the voice now
  cost: number; // at list price
};

export type AheadTarget = Partial<AheadCounts> & {
  outcome: "started" | AheadOutcome;
  day: string | null;
  started?: string; // on the end row: the start row it belongs to
  schedule?: string | null; // Vercel's x-vercel-cron-schedule, on the start row
  seconds?: number;
  reason?: string;
  error?: string;
};

export type AheadReply = Partial<AheadCounts> & { outcome: AheadOutcome; day: string | null; seconds: number; reason?: string; error?: string };

export type AheadDeps = {
  now: () => Date;
  sleep: (ms: number) => Promise<void>;
  families: () => Promise<{ id: string; timezone: string }[]>;
  children: (familyId: string) => Promise<{ id: string; nickname: string }[]>;
  store: SpeechStore; // the wall's store: a child's cards of a day, and the bucket
  voice: Voice;
  audit: (familyId: string, target: AheadTarget) => Promise<string>; // the new row's id
  envProblem: () => string | null; // Google's key missing
};

const round = (n: number, places: number) => Math.round(n * 10 ** places) / 10 ** places;

// One firing: read the day (writing nothing), record the start, make what isn't stored eight at a time and no
// more than PER_MINUTE a minute, stop starting new lines at BUDGET_SECONDS, record how it ended. Anything thrown
// once the start is recorded ends as a `failed` row; a read that fails before it throws to the caller.
export async function aheadFiring(deps: AheadDeps, ctx: { schedule: string | null }): Promise<AheadReply> {
  const began = deps.now().getTime();
  const elapsed = () => (deps.now().getTime() - began) / 1000;

  const families = await deps.families();
  if (families.length !== 1) {
    // audit_log needs a family to write to, so this refusal is the reply and nothing else.
    return { outcome: "refused", day: null, reason: `expected one family, found ${families.length}`, seconds: round(elapsed(), 1) };
  }
  const family = families[0];
  const day = todayIn(family.timezone, new Date(began));
  const kids = await deps.children(family.id);
  const clean = (s: string) => scrubNames(s, kids.map((k) => k.nickname));

  const started = await deps.audit(family.id, { outcome: "started", day, schedule: ctx.schedule });
  const counts: AheadCounts = { lines: 0, made: 0, already: 0, failed: 0, left: 0, characters: 0, cost: 0 };
  const end = async (outcome: AheadOutcome, extra: { reason?: string; error?: string } = {}): Promise<AheadReply> => {
    const done = { ...counts, cost: round(counts.cost, 4), seconds: round(elapsed(), 1), ...extra };
    await deps.audit(family.id, { outcome, started, day, ...done });
    return { outcome, day, ...done };
  };

  try {
    const env = deps.envProblem();
    if (env) return await end("refused", { reason: clean(env) });

    const perChild = await Promise.all(
      kids.map(async (k) => {
        const scope: Scope = { familyId: family.id, childId: k.id, deviceId: "" };
        return dayLines(await deps.store.cards({ familyId: family.id, childId: k.id, day }), scope, day, deps.voice.name);
      }),
    );
    if (perChild.every((l) => l.length === 0)) return await end("nothing", { reason: `no card on the wall on ${day}` });

    const queue = nightLines(wallLines(deps.voice.name), perChild);
    counts.lines = queue.length;
    let fault: unknown = null;
    const calls: number[] = []; // when each call to the voice in the last minute started

    const pace = async () => {
      for (;;) {
        const t = deps.now().getTime();
        while (calls.length && t - calls[0] >= 60_000) calls.shift();
        if (calls.length < PER_MINUTE) return void calls.push(t);
        await deps.sleep(60_000 - (t - calls[0]) + 10);
      }
    };
    const stopped = () => elapsed() >= BUDGET_SECONDS || counts.failed >= FAILURES_TO_STOP;

    const worker = async () => {
      for (let line = queue.shift(); line; line = queue.shift()) {
        if (stopped()) return void queue.unshift(line);
        try {
          if (await deps.store.speechUrl(line.path)) {
            counts.already += 1;
            continue;
          }
          await pace();
          if (stopped()) return void queue.unshift(line);
          await makeSpeech(deps.store, family.id, line.path, line.text, deps.voice);
          counts.made += 1;
          counts.characters += line.text.length;
          counts.cost += sayCost(line.text.length);
        } catch (e) {
          counts.failed += 1;
          fault ??= e;
        }
      }
    };
    await Promise.all(Array.from({ length: AT_ONCE }, worker));
    counts.left = queue.length;

    if (counts.failed) return await end("failed", { error: clean(faultText(fault)) });
    if (counts.made === 0 && counts.left === 0) return await end("nothing", { reason: `every line of ${day} is stored already` });
    return await end("made", counts.left ? { reason: `the time ran out with ${counts.left} lines left for the first taps` } : {});
  } catch (e) {
    return await end("failed", { error: clean(faultText(e)) });
  }
}
