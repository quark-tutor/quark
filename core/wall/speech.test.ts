import { describe, expect, it, vi } from "vitest";
import { lineId } from "./card.ts";
import type { AttemptInsert, CardRow, Scope } from "./flow.ts";
import { answer, cardFor } from "./flow.ts";
import { CLIP_RATE, heardText, lineText, parseLine, speechPath, spokenUrl, type SpeechRun, type SpeechStore } from "./speech.ts";

// The tutor's voice and ears (docs/tutor-voice-slice.md): a line is said only when the child can see it now,
// its audio is made once and stored, and a clip is heard without keeping anything about the child.

const FAMILY = "family-1";
const PIP = "child-pip";
const scope: Scope = { familyId: FAMILY, childId: PIP, deviceId: "device-1" };
const MONDAY = new Date("2026-10-26T18:00:00Z"); // 8 am in Hawaii
const ID = (n: number) => `00000000-0000-4000-8000-00000000000${n}`;

function card(n: number, o: { layer?: number; child_id?: string; policy?: string } = {}): CardRow {
  const id = ID(n);
  const layer = o.layer ?? 1;
  return {
    id,
    family_id: FAMILY,
    child_id: o.child_id ?? PIP,
    day: "2026-10-26",
    slot: "then",
    layer,
    policy: o.policy ?? "passed",
    body: { title: `Title ${n}`, text: `Text ${n}`, image_alt: "", read_aloud: `Read ${n}`, question: `Question ${n}?`, hints: [`Hint ${n}.1`, `Hint ${n}.2`], handoff: `Ask a parent about ${n}.` },
    theme: { status: "live", family_id: FAMILY },
    itemId: null,
    item: null,
    question: { id: `q-${n}`, prompt: `Question ${n}?`, answer_key: { accept: [`answer${n}`], rubric: "" } },
  };
}

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

const text = (store: SpeechStore, line: string) => lineText(store, scope, parseLine(line)!, MONDAY);
const ask = (store: SpeechStore, n: number, guess: string) => answer(store, scope, { cardId: ID(n), guess, seconds: 5 }, MONDAY, "every");

describe("a line's name", () => {
  it("is a card and a part, or one of the wall's replies, and nothing else", () => {
    expect(parseLine(lineId(ID(1), "read"))).toEqual({ cardId: ID(1), part: "read" });
    expect(parseLine(lineId(ID(1), 0))).toEqual({ cardId: ID(1), part: "hint", hint: 0 });
    expect(parseLine("wall.thinkAbout")).toEqual({ wall: "thinkAbout" });
    for (const bad of ["", "Hello there", `${ID(1)}.text`, `${ID(1)}.hint.x`, "wall.hello", "wall.typeHere", "not-a-uuid.read"]) {
      expect(parseLine(bad), bad).toBeNull();
    }
  });
});

describe("what the tutor may say", () => {
  it("says a card's words and question, but a hint only once earned and the handoff only once reached", async () => {
    const { store } = fake([card(1)]);
    expect(await text(store, lineId(ID(1), "read"))).toBe("Text 1 Question 1?");
    expect(await text(store, lineId(ID(1), "question"))).toBe("Question 1?");
    expect(await text(store, lineId(ID(1), 0))).toBeNull();
    expect(await text(store, lineId(ID(1), "handoff"))).toBeNull();
    await ask(store, 1, "a wrong guess");
    expect(await text(store, lineId(ID(1), 0))).toBe("Hint 1.1");
    expect(await text(store, lineId(ID(1), 1))).toBeNull();
    await ask(store, 1, "another wrong guess");
    await ask(store, 1, "still not it");
    expect(await text(store, lineId(ID(1), 1))).toBe("Hint 1.2");
    expect(await text(store, lineId(ID(1), "handoff"))).toBe("Ask a parent about 1.");
  });

  it("reads the card as the page shows it, its words then its question, and never the writer's read_aloud", async () => {
    const { store } = fake([card(1)]);
    const shown = await cardFor(store, scope, ID(1), MONDAY);
    if (!shown || !("card" in shown)) throw new Error("the card should be on the wall");
    expect(await text(store, lineId(ID(1), "read"))).toBe(`${shown.card.text} ${shown.card.question}`);
    expect(await text(store, lineId(ID(1), "read"))).not.toContain(shown.card.read_aloud);
  });

  it("says nothing of a layer not yet reached, and keeps a finished layer's own lines", async () => {
    const { store } = fake([card(1), card(2, { layer: 2 })]);
    expect(await text(store, lineId(ID(2), "read"))).toBeNull();
    await ask(store, 1, "a wrong guess");
    await ask(store, 1, "answer1");
    expect(await text(store, lineId(ID(2), "read"))).toBe("Text 2 Question 2?");
    expect(await text(store, lineId(ID(1), "read"))).toBe("Text 1 Question 1?");
    expect(await text(store, lineId(ID(1), 0))).toBe("Hint 1.1");
    expect(await text(store, lineId(ID(1), 1))).toBeNull();
    expect(await text(store, lineId(ID(1), "handoff"))).toBeNull();
  });

  it("says nothing of another child's card or a card that hasn't passed", async () => {
    const { store } = fake([card(1, { child_id: "child-wren" }), card(2, { policy: "blocked" })]);
    expect(await text(store, lineId(ID(1), "read"))).toBeNull();
    expect(await text(store, lineId(ID(2), "read"))).toBeNull();
  });
});

describe("the tutor's voice", () => {
  const voice = (calls: string[]) => ({ name: "voice-a", say: async (t: string) => (calls.push(t), new Uint8Array([1, 2, 3])) });

  it("makes a line's audio once, stores it, and serves the stored file after", async () => {
    const { store, files, runs } = fake([card(1)]);
    const calls: string[] = [];
    const first = await spokenUrl(store, scope, parseLine(lineId(ID(1), "read"))!, MONDAY, voice(calls));
    const second = await spokenUrl(store, scope, parseLine(lineId(ID(1), "read"))!, MONDAY, voice(calls));
    expect(first).toBe(`https://signed.example/${speechPath("voice-a", "Text 1 Question 1?")}`);
    expect(second).toBe(first);
    expect(calls).toEqual(["Text 1 Question 1?"]);
    expect([...files.keys()]).toEqual([speechPath("voice-a", "Text 1 Question 1?")]);
    expect(runs).toEqual([{ family_id: FAMILY, kind: "say", model: "voice-a", characters: 18, seconds: 0, cost: (18 * 30) / 1_000_000 }]);
  });

  it("keeps a voice's lines apart, and the path names no child and holds no words", () => {
    expect(speechPath("voice-a", "Read 1")).not.toBe(speechPath("voice-b", "Read 1"));
    expect(speechPath("voice-a", "Hi, Pip.")).toMatch(/^speech\/voice-a\/[0-9a-f]{64}\.mp3$/);
  });

  it("sends nothing to the voice for a line the child can't see", async () => {
    const { store, runs } = fake([card(1)]);
    const calls: string[] = [];
    expect(await spokenUrl(store, scope, parseLine(lineId(ID(1), 0))!, MONDAY, voice(calls))).toBeNull();
    expect(calls).toEqual([]);
    expect(runs).toEqual([]);
  });
});

describe("the tutor's ears", () => {
  const clip = (seconds: number) => new Uint8Array(Math.round(seconds * CLIP_RATE) * 2);

  it("hears a clip and records only its length and cost", async () => {
    const { store, runs } = fake([]);
    const hear = vi.fn(async () => "  The cello.  ");
    expect(await heardText(store, scope, clip(2.5), { model: "chirp_3", hear })).toBe("The cello.");
    expect(hear).toHaveBeenCalledOnce();
    expect(runs).toEqual([{ family_id: FAMILY, kind: "hear", model: "chirp_3", characters: 0, seconds: 2.5, cost: (3 / 60) * 0.016 }]);
  });

  it("sends nothing for a tap too short to hold a word, a broken clip or one over 30 seconds", async () => {
    const { store, runs } = fake([]);
    const hear = vi.fn(async () => "words");
    expect(await heardText(store, scope, clip(0.1), { model: "chirp_3", hear })).toBe("");
    expect(await heardText(store, scope, new Uint8Array(3), { model: "chirp_3", hear })).toBeNull();
    expect(await heardText(store, scope, clip(40), { model: "chirp_3", hear })).toBeNull();
    expect(hear).not.toHaveBeenCalled();
    expect(runs).toEqual([]);
  });

  it("cuts what it heard to an answer's length", async () => {
    const { store } = fake([]);
    const heard = await heardText(store, scope, clip(1), { model: "chirp_3", hear: async () => "word ".repeat(100) });
    expect(heard!.length).toBeLessThanOrEqual(200);
  });
});
