import { describe, expect, it } from "vitest";
import { lineId } from "./card.ts";
import type { AttemptInsert, CardRow, Scope } from "./flow.ts";
import { answer } from "./flow.ts";
import { lineText, parseLine, readLine, speechPath, spokenUrl, type SpeechRun, type SpeechStore } from "./speech.ts";
import { aheadFiring, BUDGET_SECONDS, dayLines, nightLines, PER_MINUTE, wallLines, type AheadDeps, type AheadTarget } from "./speech-ahead.ts";

// The tutor's lines made ahead (docs/lines-ahead-slice.md): every line of the day's cards is made overnight and
// stored, a line made ahead is the very file a tap plays, and a hint or handoff made ahead is still said only once
// the child has earned or reached it (rule 3).

const FAMILY = "family-1";
const PIP = "child-pip";
const WREN = "child-wren";
const DAY = "2026-10-26";
const NIGHT = new Date("2026-10-26T13:30:00Z"); // 3:30 am in Hawaii, the morning of DAY
const MORNING = new Date("2026-10-26T18:00:00Z"); // 8 am in Hawaii, when the child taps
const VOICE = "voice-a";
const pip: Scope = { familyId: FAMILY, childId: PIP, deviceId: "device-1" };
const ID = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

type Opts = { layer?: number; child?: string; policy?: string; slot?: string; day?: string; status?: string; text?: string };
function card(n: number, o: Opts = {}): CardRow {
  return {
    id: ID(n),
    family_id: FAMILY,
    child_id: o.child ?? PIP,
    day: o.day ?? DAY,
    slot: o.slot ?? "then",
    layer: o.layer ?? 1,
    policy: o.policy ?? "passed",
    body: { title: `Title ${n}`, text: o.text ?? `Text ${n}`, image_alt: "", question: `Question ${n}?`, hints: [`Hint ${n}.1`, `Hint ${n}.2`], handoff: `Ask a parent about ${n}.` },
    theme: { status: o.status ?? "live", family_id: FAMILY },
    itemId: null,
    item: null,
    question: { id: `q-${n}`, prompt: `Question ${n}?`, answer_key: { accept: [`answer${n}`], rubric: "" } },
  };
}

// A day as the build makes it: five slots by four layers, for one child.
const fullDay = (child: string, from: number) =>
  ["look", "wonder", "listen", "then", "puzzle"].flatMap((slot, s) => [1, 2, 3, 4].map((layer) => card(from + s * 4 + layer, { child, slot, layer })));

function fake(cards: CardRow[]) {
  const attempts: (AttemptInsert & { created_at: string })[] = [];
  const files = new Map<string, Uint8Array>();
  const runs: SpeechRun[] = [];
  let clock = 0;
  const store: SpeechStore = {
    timezone: async () => "Pacific/Honolulu",
    cards: async () => cards,
    cardById: async ({ id }) => cards.find((c) => c.id === id) ?? null,
    attempts: async () => attempts.map(({ question_id, correct, created_at }) => ({ question_id, correct, created_at })),
    lastSession: async () => null,
    startSession: async () => "session-1",
    endSession: async () => {},
    touchSession: async () => {},
    addAttempt: async (row) => {
      attempts.push({ ...row, created_at: new Date(Date.UTC(2026, 9, 26, 18, 0, clock++)).toISOString() });
      return `attempt-${attempts.length}`;
    },
    sign: async (path) => `https://signed.example/${path}`,
    speechUrl: async (path) => (files.has(path) ? `https://signed.example/${path}` : null),
    putSpeech: async (path, audio) => {
      files.set(path, audio);
    },
    addSpeechRun: async (row) => {
      runs.push(row);
    },
  };
  return { store, files, runs };
}

// The firing's deps on a fake clock: sleeping moves the clock, and each call to the voice takes `sayMs`.
function deps(store: SpeechStore, o: { families?: number; envProblem?: string | null; sayMs?: number; say?: (text: string) => Promise<Uint8Array> } = {}) {
  let t = NIGHT.getTime();
  const rows: AheadTarget[] = [];
  const said: { text: string; at: number }[] = [];
  const d: AheadDeps = {
    now: () => new Date(t),
    sleep: async (ms) => {
      t += ms;
    },
    families: async () => Array.from({ length: o.families ?? 1 }, (_, i) => ({ id: i ? `family-${i + 1}` : FAMILY, timezone: "Pacific/Honolulu" })),
    children: async () => [
      { id: PIP, nickname: "Pip" },
      { id: WREN, nickname: "Wren" },
    ],
    store,
    voice: {
      name: VOICE,
      say: async (text) => {
        said.push({ text, at: t });
        t += o.sayMs ?? 0;
        return o.say ? o.say(text) : new Uint8Array([1]);
      },
    },
    audit: async (_family, target) => {
      rows.push(target);
      return `row-${rows.length}`;
    },
    envProblem: () => o.envProblem ?? null,
  };
  return { d, rows, said };
}

const fire = (d: AheadDeps) => aheadFiring(d, { schedule: "0 13 * * *" });
const ask = (store: SpeechStore, n: number, guess: string) => answer(store, pip, { cardId: ID(n), guess, seconds: 5 }, MORNING, "every");
const tap = (store: SpeechStore, line: string, calls: string[]) =>
  spokenUrl(store, pip, parseLine(line)!, MORNING, { name: VOICE, say: async (text) => (calls.push(text), new Uint8Array([2])) });

describe("the lines a day gives", () => {
  it("are every part of each card the wall can show: the read line, the question, each hint and the handoff, as they go to the voice", () => {
    const c = card(1, { text: "Nakht lived about 3,400 years ago." });
    expect(dayLines([c], pip, DAY, VOICE).map((l) => l.text)).toEqual([
      "Nakht lived about 3400 years ago. Question 1?",
      "Question 1?",
      "Hint 1.1",
      "Hint 1.2",
      "Ask a parent about 1.",
    ]);
    expect(dayLines([c], pip, DAY, VOICE)[0].path).toBe(speechPath(VOICE, "Nakht lived about 3400 years ago. Question 1?"));
  });

  it("leave out another child's card, a card held back, another day, a week not live and a layer out of reach", () => {
    const rows = [
      card(1),
      card(2, { layer: 2, policy: "blocked" }),
      card(3, { layer: 3 }), // out of reach: layer 2 is held back
      card(4, { slot: "look", child: WREN }),
      card(5, { slot: "wonder", day: "2026-10-27" }),
      card(6, { slot: "puzzle", status: "review" }),
    ];
    expect(new Set(dayLines(rows, pip, DAY, VOICE).map((l) => l.text.match(/\d+/)![0]))).toEqual(new Set(["1"]));
  });

  it("come in the order a child is likely to tap them: the wall's sentences, then each layer's read lines first, each file once", () => {
    const pipDay = dayLines([card(1), card(2, { layer: 2 })], pip, DAY, VOICE);
    const wrenDay = dayLines([card(3, { child: WREN }), card(4, { child: WREN, layer: 2 })], { ...pip, childId: WREN }, DAY, VOICE);
    const wall = wallLines(VOICE);
    const night = nightLines(wall, [pipDay, wrenDay, pipDay]);
    expect(night.slice(0, wall.length)).toEqual(wall);
    expect(night.slice(wall.length, wall.length + 2).map((l) => l.text)).toEqual(["Text 1 Question 1?", "Text 3 Question 3?"]);
    expect(night.slice(wall.length + 2, wall.length + 10).every((l) => !l.text.startsWith("Text"))).toBe(true);
    expect(night.slice(wall.length + 10, wall.length + 12).map((l) => l.text)).toEqual(["Text 2 Question 2?", "Text 4 Question 4?"]);
    expect(new Set(night.map((l) => l.path)).size).toBe(night.length);
    expect(night).toHaveLength(wall.length + 20);
  });
});

describe("a night's firing", () => {
  it("makes every line of today's cards for both children and the wall's sentences, and records each as a tap would", async () => {
    const { store, files, runs } = fake([...fullDay(PIP, 0), ...fullDay(WREN, 100)]);
    const { d, rows } = deps(store);
    const reply = await fire(d);
    const lines = 2 * 20 * 5 + wallLines(VOICE).length;
    expect(reply).toMatchObject({ outcome: "made", day: DAY, lines, made: lines, already: 0, failed: 0, left: 0 });
    expect(files.size).toBe(lines);
    expect(runs).toHaveLength(lines);
    expect(runs.every((r) => r.kind === "say" && r.model === VOICE && r.family_id === FAMILY)).toBe(true);
    expect(reply.characters).toBe(runs.reduce((a, r) => a + r.characters, 0));
    expect(rows.map((r) => r.outcome)).toEqual(["started", "made"]);
    expect(rows[0]).toMatchObject({ day: DAY, schedule: "0 13 * * *" });
    expect(rows[1]).toMatchObject({ started: "row-1", day: DAY, made: lines, already: 0 });
  });

  it("makes nothing twice: a second firing finds every line stored", async () => {
    const { store } = fake(fullDay(PIP, 0));
    await fire(deps(store).d);
    const again = deps(store);
    expect(await fire(again.d)).toMatchObject({ outcome: "nothing", made: 0, already: 118, reason: `every line of ${DAY} is stored already` });
    expect(again.said).toEqual([]);
  });

  it("finds nothing to make when no card is on the wall today", async () => {
    const { store } = fake([card(1, { day: "2026-10-25" })]);
    const { d, rows, said } = deps(store);
    expect(await fire(d)).toMatchObject({ outcome: "nothing", reason: `no card on the wall on ${DAY}` });
    expect(rows.map((r) => r.outcome)).toEqual(["started", "nothing"]);
    expect(said).toEqual([]);
  });

  it("refuses before asking the voice anything when Google's key isn't set, and with no family or two, records nothing", async () => {
    const { store } = fake([card(1)]);
    const noKey = deps(store, { envProblem: "Google's key (GOOGLE_CREDENTIALS_JSON) isn't set where the firing runs" });
    expect(await fire(noKey.d)).toMatchObject({ outcome: "refused", reason: "Google's key (GOOGLE_CREDENTIALS_JSON) isn't set where the firing runs" });
    expect(noKey.rows.map((r) => r.outcome)).toEqual(["started", "refused"]);
    expect(noKey.said).toEqual([]);
    const two = deps(store, { families: 2 });
    expect(await fire(two.d)).toMatchObject({ outcome: "refused", reason: "expected one family, found 2" });
    expect(two.rows).toEqual([]);
  });

  it("keeps under Google's limit: never more than PER_MINUTE calls to the voice in any minute", async () => {
    const { store } = fake([...fullDay(PIP, 0), ...fullDay(WREN, 100)]);
    const { d, said } = deps(store, { sayMs: 0 });
    expect(await fire(d)).toMatchObject({ outcome: "made", left: 0 });
    expect(said.length).toBeGreaterThan(PER_MINUTE);
    for (let i = 0; i + PER_MINUTE < said.length; i++) expect(said[i + PER_MINUTE].at - said[i].at).toBeGreaterThanOrEqual(60_000);
  });

  it("starts no line after BUDGET_SECONDS, and leaves the rest to the first taps", async () => {
    const { store, files } = fake([...fullDay(PIP, 0), ...fullDay(WREN, 100)]);
    const { d, said, rows } = deps(store, { sayMs: 10_000 }); // eight at a time, ten seconds a line
    const reply = await fire(d);
    expect(reply.outcome).toBe("made");
    expect(reply.left).toBeGreaterThan(0);
    expect(reply.made! + reply.left!).toBe(reply.lines);
    expect(Math.max(...said.map((s) => s.at))).toBeLessThan(NIGHT.getTime() + BUDGET_SECONDS * 1000);
    expect(files.size).toBe(reply.made);
    expect(rows[1].reason).toBe(`the time ran out with ${reply.left} lines left for the first taps`);
  });

  it("makes what it can when a line fails, ends as failed with the fault's first line, and names no child", async () => {
    const { store, files } = fake([card(1, { text: "Pip, look at the river." }), card(2, { child: WREN, slot: "look" })]);
    const { d, rows } = deps(store, {
      say: async (text) => {
        if (text.startsWith("Pip")) throw new Error(`Google refused "${text}"\nmore detail`);
        return new Uint8Array([1]);
      },
    });
    const reply = await fire(d);
    expect(reply).toMatchObject({ outcome: "failed", failed: 1 });
    expect(reply.made).toBe(reply.lines! - 1);
    expect(files.size).toBe(reply.made);
    expect(reply.error).toBe(`Google refused "[child], look at the river. Question 1?"`);
    expect(JSON.stringify(rows)).not.toMatch(/\bPip\b|\bWren\b/);
  });

  it("stops asking after three failures, and leaves the rest", async () => {
    const { store } = fake(fullDay(PIP, 0));
    const { d, said } = deps(store, { say: async () => Promise.reject(new Error("503 Service Unavailable")) });
    const reply = await fire(d);
    expect(reply).toMatchObject({ outcome: "failed", made: 0, error: "503 Service Unavailable" });
    expect(said.length).toBeLessThanOrEqual(3 + 7); // three, and the seven already asked at once
    expect(reply.failed! + reply.left!).toBe(reply.lines);
  });
});

describe("a line made ahead, on the child's tap", () => {
  it("is the very file the tap plays: the tap finds it stored and asks the voice nothing", async () => {
    const { store, runs } = fake([card(1)]);
    await fire(deps(store).d);
    const before = runs.length;
    const calls: string[] = [];
    expect(await tap(store, lineId(ID(1), "read"), calls)).toBe(`https://signed.example/${speechPath(VOICE, readLine(card(1).body))}`);
    expect(await tap(store, lineId(ID(1), "question"), calls)).not.toBeNull();
    expect(await tap(store, "wall.clue", calls)).not.toBeNull();
    expect(calls).toEqual([]);
    expect(runs).toHaveLength(before);
  });

  it("is still said only once earned (rule 3): a hint and the handoff made ahead are refused, the say route's 404, until the child has earned and reached them", async () => {
    const { store, files } = fake([card(1)]);
    await fire(deps(store).d);
    for (const part of ["Hint 1.1", "Hint 1.2", "Ask a parent about 1."]) expect(files.has(speechPath(VOICE, part)), part).toBe(true);
    const calls: string[] = [];

    expect(await tap(store, lineId(ID(1), 0), calls)).toBeNull();
    expect(await lineText(store, pip, parseLine(lineId(ID(1), 0))!, MORNING)).toBeNull();
    expect(await tap(store, lineId(ID(1), 1), calls)).toBeNull();
    expect(await tap(store, lineId(ID(1), "handoff"), calls)).toBeNull();

    await ask(store, 1, "a wrong guess");
    expect(await tap(store, lineId(ID(1), 0), calls)).toBe(`https://signed.example/${speechPath(VOICE, "Hint 1.1")}`);
    expect(await tap(store, lineId(ID(1), 1), calls)).toBeNull();
    expect(await tap(store, lineId(ID(1), "handoff"), calls)).toBeNull();

    await ask(store, 1, "another wrong guess");
    await ask(store, 1, "still not it");
    expect(await tap(store, lineId(ID(1), 1), calls)).toBe(`https://signed.example/${speechPath(VOICE, "Hint 1.2")}`);
    expect(await tap(store, lineId(ID(1), "handoff"), calls)).toBe(`https://signed.example/${speechPath(VOICE, "Ask a parent about 1.")}`);
    expect(calls).toEqual([]);
  });
});
