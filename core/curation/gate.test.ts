import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { mergeFamily, type GuardianAnswer, type GuardianInput } from "../../lib/family-values";
import { renderPolicy, type PolicyContext } from "../../lib/policy";
import type { CardBody } from "./cards";
import {
  ageBand,
  CAUTION_NOTE,
  codeCheck,
  gatePrompt,
  quotesNote,
  readFloor,
  readVerdict,
  runGate,
  subjectWatch,
  type GateCard,
  type GateDeps,
  type PolicyNotes,
  type Rulebook,
} from "./gate";

// Invented children and guardians only.
const kids = [
  { id: "k7", nickname: "Pip", age: 7 },
  { id: "k9", nickname: "Wren", age: 9 },
];
const names = new Map(Array.from({ length: 24 }, (_, i) => [i + 1, `Subject name ${i + 1}`]));

const answer = (a: Partial<GuardianAnswer> = {}): GuardianAnswer => ({
  when: "anytime",
  perspective: "several_fairly",
  note: "",
  fromPack: null,
  ages: {},
  ...a,
});
const guardian = (id: string, answers: Record<number, GuardianAnswer> = {}, g: Partial<GuardianInput> = {}): GuardianInput => ({
  id,
  name: `${id} Example`,
  answers,
  conduct: [],
  packId: null,
  lean: "unset",
  words: { understand: "", believe: "", decide: "" },
  learns: null,
  match: null,
  ...g,
});
const both = (answers: Record<number, GuardianAnswer>) => [guardian("Pat", answers), guardian("Lee", answers)];

const ctx: PolicyContext = {
  points: Array.from({ length: 24 }, (_, i) => ({ number: i + 1, name: `Subject name ${i + 1}` })),
  children: kids,
  handoff: () => null,
  packName: () => null,
};

const card = (over: Partial<CardBody> = {}): CardBody => ({
  title: "Bones in stone",
  text: "Long ago, mud covered a fish. Layer on layer, the mud turned to rock.",
  image_alt: "",
  read_aloud: "Long ago, mud covered a fish.",
  question: "What turned the mud into rock?",
  hints: ["What was piled on top?", "What does weight do to mud?"],
  handoff: "Ask Mom what a fossil hunter looks for.",
  ...over,
});

describe("the age band", () => {
  it("is the plan's grade band, cut between 8 and 9", () => {
    expect([6, 7, 8].map(ageBand)).toEqual(["2-3", "2-3", "2-3"]);
    expect([9, 10, 12].map(ageBand)).toEqual(["4-5", "4-5", "4-5"]);
  });
});

describe("the code checks", () => {
  it("blocks on either guardian's blackball, and the reason names the subject, never the guardian", () => {
    for (const placedBy of ["Pat", "Lee"]) {
      const values = mergeFamily(both({ 5: answer() }), kids, [{ id: "b1", point: 5, topic: null, placedBy }], {});
      const { blocked, lines } = codeCheck([5], values, kids[0], names);
      expect(lines).toEqual([]);
      expect(blocked).toEqual([{ rule: "blackball", subject: 5, note: "Subject 5 (Subject name 5) is blocked by a guardian." }]);
      expect(JSON.stringify(blocked)).not.toMatch(/Pat|Lee|b1/);
    }
  });

  it("blocks a subject set to Don't bring it up", () => {
    const values = mergeFamily(both({ 5: answer({ when: "never", perspective: "omitted" }) }), kids, [], {});
    expect(codeCheck([5], values, kids[1], names).blocked[0]).toMatchObject({ rule: "never", subject: 5 });
  });

  it("blocks Not yet only for the child below the age", () => {
    const values = mergeFamily(both({ 12: answer({ when: "from_age", ages: { k7: 10, k9: 9 } }) }), kids, [], {});
    expect(codeCheck([12], values, kids[0], names).blocked[0]).toMatchObject({ rule: "too_young", subject: 12, note: expect.stringContaining("until age 10") });
    const older = codeCheck([12], values, kids[1], names);
    expect(older.blocked).toEqual([]);
    expect(older.lines[0]).toMatchObject({ subject: 12, parentLed: false, setting: expect.stringContaining("old enough") });
  });

  it("leaves parent-led, differing and unsettled subjects to the model, marked parent-led", () => {
    const pat = guardian("Pat", { 6: answer({ when: "parent_led", perspective: "omitted" }), 9: answer(), 5: answer({ when: "never", perspective: "omitted" }) });
    const lee = guardian("Lee", { 6: answer({ when: "parent_led", perspective: "omitted" }), 9: answer({ perspective: "family_tradition" }) });
    const values = mergeFamily([pat, lee], kids, [], {});
    // Subject 5: only one of two guardians has answered (as on the test copy), so it is not settled.
    const { blocked, lines } = codeCheck([5, 6, 9], values, kids[0], names);
    expect(blocked).toEqual([]);
    expect(lines.map((l) => [l.subject, l.parentLed])).toEqual([
      [5, true],
      [6, true],
      [9, true],
    ]);
    expect(lines[0].setting).toMatch(/not settled/);
    expect(lines[2].setting).toMatch(/differ/);
  });

  it("lists, before anything is spent, what the settings decide for a topic", () => {
    const values = mergeFamily(both({ 5: answer({ when: "never", perspective: "omitted" }), 6: answer({ when: "parent_led", perspective: "omitted" }) }), kids, [], {});
    expect(subjectWatch([5, 6, 24], values, kids[0], names)).toEqual([
      "Subject 5 (Subject name 5) is set to Don't bring it up.",
      "Subject 6 (Subject name 6) is parent-led.",
      "Subject 24 (Subject name 24) is parent-led.",
    ]);
  });
});

describe("what the gate model is told about the child (rule 7, decision 5)", () => {
  const values = mergeFamily(
    both({ 8: answer({ when: "from_age", ages: { k7: 9, k9: 11 } }) }).map((g) => ({
      ...g,
      conduct: [
        { key: "conduct.speak_first", childId: "k7", value: "required", note: null },
        { key: "conduct.speak_first", childId: "k9", value: "gentle", note: null },
      ],
    })) as GuardianInput[],
    kids,
    [],
    {},
  );
  const stored = renderPolicy(values, ctx);
  const forGate = renderPolicy(values, ctx, { forGate: true });

  it("reads a rulebook that names no child", () => {
    expect(stored).toMatch(/Pip/);
    expect(stored).toMatch(/Wren/);
    expect(forGate).not.toMatch(/Pip|Wren/);
    expect(forGate).toMatch(/\*\*Point 8, Subject name 8\.\*\* The tutor does not raise this with a child younger than the age/);
    expect(forGate).not.toMatch(/Saying the answer out loud/);
  });

  // Everything the family knows about a child, to show none of it leaks into the prompt.
  const full = {
    id: "k7",
    nickname: "Pip",
    age: 7,
    birth_month: "2019-06-01",
    sex: "boy",
    reading: "reads_alone",
    interests: ["volcanoes"],
    boredBy: ["trains"],
    lens: "collect",
    door: "volcanoes",
    level: "reads_alone, age 7",
    school: "Example Elementary",
  };
  const prompt = (carefulAbout: string | null) =>
    gatePrompt({ rulebook: forGate, lines: codeCheck([8], values, { id: "k9", age: 9 }, names).lines, perspective: "several_fairly", child: { ...full, carefulAbout }, card: card() });
  const withNote = prompt("A pet dog died in the spring");
  const without = prompt(null);

  it("carries the caution note only for the child who has one, and the grade band for both", () => {
    expect(withNote).toContain("The parents asked for care about: A pet dog died in the spring");
    expect(without).not.toMatch(/care about|pet dog/);
    expect(withNote).toContain("The child is in grades 2-3.");
    expect(without).toContain("The child is in grades 2-3.");
  });

  it("carries nothing else about the child", () => {
    for (const p of [withNote, without]) {
      for (const leak of ["Pip", "Wren", "2019", "boy", "reads_alone", "reads alone", "volcanoes", "trains", "collect", "Example Elementary", "Example"]) {
        expect(p, leak).not.toContain(leak);
      }
      expect(p).not.toMatch(/\bage[ds]? 7\b|\b7 years\b|\bseven\b/i);
    }
  });
});

describe("reading the model's verdict", () => {
  const note = "A pet dog died in the spring";

  it("keeps a clean pass with its reader notes", () => {
    expect(readVerdict({ verdict: "pass", reasons: [], reader_notes: [" Long for a first card. ", "", "Two", "Three"] }, null)).toEqual({
      verdict: "pass",
      reasons: [],
      reader: ["Long for a first card.", "Two"],
    });
  });

  it("never lets the caution note come back", () => {
    const read = readVerdict(
      {
        verdict: "block",
        reasons: [
          { rule: "caution", subject: 0, note: "The child's dog died in the spring, so this is too close." },
          { rule: "frightening", subject: 0, note: "Since a pet dog died in the spring, the drowning line is too much." },
        ],
        reader_notes: ["Mentions how a pet dog died in the spring."],
      },
      note,
    );
    expect(read).toEqual({
      verdict: "block",
      reasons: [
        { rule: "caution", note: CAUTION_NOTE },
        { rule: "frightening", note: CAUTION_NOTE },
      ],
      reader: [],
    });
  });

  it("treats a contradiction or a strange reply as unreadable", () => {
    expect(readVerdict({ verdict: "block", reasons: [], reader_notes: [] }, null)).toHaveProperty("problem");
    expect(readVerdict({ verdict: "pass", reasons: [{ rule: "rule_1", subject: 0, note: "x" }], reader_notes: [] }, null)).toHaveProperty("problem");
    expect(readVerdict({ verdict: "maybe", reasons: [], reader_notes: [] }, null)).toHaveProperty("problem");
    expect(readVerdict({ verdict: "block", reasons: [{ rule: "made_up", subject: 0, note: "x" }], reader_notes: [] }, null)).toHaveProperty("problem");
    expect(readVerdict(null, null)).toHaveProperty("problem");
  });

  it("counts four words of the note in a row as quoting it, and a short note only whole", () => {
    expect(quotesNote("his dog died in the spring", note)).toBe(true);
    expect(quotesNote("a dog in a story", note)).toBe(false);
    expect(quotesNote("about thunder storms here", "thunder storms")).toBe(true);
    expect(quotesNote("thunder", "thunder storms")).toBe(false);
    expect(quotesNote("anything", null)).toBe(false);
  });
});

describe("the safety floor file", () => {
  it("has a version and still says it is a first guess", () => {
    const floor = readFloor(readFileSync(new URL("../../gate/safety-floor.md", import.meta.url), "utf8"));
    expect(floor.version).toBe(1);
    expect(floor.firstGuess).toBe(true);
    expect(floor.text).not.toMatch(/<!--/);
    for (const item of ["Body safety", "How to tell a trusted adult", "Emergency basics"]) expect(floor.text).toContain(item);
  });
});

describe("running the gate", () => {
  const floor = { version: 1, firstGuess: true, text: "The floor." };
  const values = mergeFamily([guardian("Pat", { 5: answer({ when: "never", perspective: "omitted" }) })], kids, [], {});
  const rulebook: Rulebook = { hash: "h1", text: "The rulebook.", values, pointNames: names };
  const children = kids.map((k) => ({ id: k.id, age: k.age, carefulAbout: null }));

  let n = 0;
  const gateCard = (over: Partial<GateCard> = {}): GateCard => ({
    id: `c${++n}`,
    childId: "k7",
    label: "day 1 wonder, layer 1",
    policy: "pending",
    notes: null,
    body: card(),
    subjects: [],
    perspective: null,
    ...over,
  });

  type Saved = { id: string; policy: string; notes: PolicyNotes | null };
  function fake(replies: (unknown | Error)[], hashes: (string | null)[] = []) {
    const saved: Saved[] = [];
    const prompts: string[] = [];
    let call = 0;
    let hashCall = 0;
    const deps: GateDeps = {
      complete: async <T,>(o: { prompt: string }) => {
        prompts.push(o.prompt);
        const r = replies[Math.min(call++, replies.length - 1)];
        if (r instanceof Error) throw r;
        return r as T;
      },
      saveVerdict: async (id, policy, notes) => {
        saved.push({ id, policy, notes });
      },
      currentHash: async () => hashes[hashCall++] ?? "h1",
    };
    return { deps, saved, prompts, calls: () => call };
  }
  const pass = { verdict: "pass", reasons: [], reader_notes: ["Reads well."] };
  const block = { verdict: "block", reasons: [{ rule: "perspective", subject: 0, note: "It calls a view foolish." }], reader_notes: [] };
  const run = (cards: GateCard[], deps: GateDeps, rb: Rulebook | null = rulebook) =>
    runGate({ cards, children, rulebook: rb, floor, system: "S", model: "m", concurrency: 1, now: () => new Date("2026-10-20T00:00:00Z") }, deps);

  it("blocks in code without a model call, and passes or blocks the rest on the model's word", async () => {
    const f = fake([pass, block]);
    const cards = [gateCard({ subjects: [5] }), gateCard(), gateCard()];
    const report = await run(cards, f.deps);
    expect(f.calls()).toBe(2);
    expect(f.saved.map((s) => [s.id, s.policy, s.notes?.gate?.by])).toEqual([
      [cards[0].id, "blocked", "code"],
      [cards[1].id, "passed", "model"],
      [cards[2].id, "blocked", "model"],
    ]);
    expect(f.saved[1].notes?.gate).toEqual({
      by: "model",
      rulebook: "h1",
      floor: 1,
      floor_first_guess: true,
      model: "m",
      reasons: [],
      reader: ["Reads well."],
      checked_at: "2026-10-20T00:00:00.000Z",
    });
    expect(report).toMatchObject({ checked: 3, passed: 1, blockedByCode: 1, blockedByModel: 1, pending: 0, reasons: { never: 1, perspective: 1 } });
  });

  it("leaves cards held back by the card checks, and cards already checked against this rulebook", async () => {
    const f = fake([pass]);
    const checked: PolicyNotes = { gate: { by: "model", rulebook: "h1", floor: 1, floor_first_guess: true, reasons: [], checked_at: "x" } };
    const stale: PolicyNotes = { gate: { ...checked.gate!, rulebook: "h0" } };
    const cards = [
      gateCard({ policy: "blocked", notes: { validation: ["hint 2 gives the answer away"] } }),
      gateCard({ policy: "passed", notes: checked }),
      gateCard({ policy: "passed", notes: stale }),
    ];
    const report = await run(cards, f.deps);
    expect(report).toMatchObject({ heldBackByChecks: 1, upToDate: 1, checked: 1, passed: 1 });
    expect(f.saved.map((s) => s.id)).toEqual([cards[2].id]);
  });

  it("checks eight cards at a time unless told otherwise", async () => {
    const f = fake([pass]);
    let inFlight = 0;
    let peak = 0;
    const answer = f.deps.complete;
    f.deps.complete = (async (o: { prompt: string }) => {
      inFlight += 1;
      peak = Math.max(peak, inFlight);
      await new Promise((resolve) => setTimeout(resolve, 5));
      inFlight -= 1;
      return (answer as (o: unknown) => Promise<unknown>)(o);
    }) as GateDeps["complete"];
    const cards = Array.from({ length: 20 }, () => gateCard());
    const report = await runGate({ cards, children, rulebook, floor, system: "S", model: "m" }, f.deps);
    expect(peak).toBe(8);
    expect(report).toMatchObject({ checked: 20, passed: 20, pending: 0 });
    expect(f.saved).toHaveLength(20);
  });

  it("with pendingOnly, checks the pending cards and leaves a verdict on another rulebook alone", async () => {
    const f = fake([pass]);
    const stale: PolicyNotes = { gate: { by: "model", rulebook: "h0", floor: 1, floor_first_guess: true, reasons: [], checked_at: "x" } };
    const cards = [gateCard(), gateCard({ policy: "passed", notes: stale }), gateCard({ policy: "blocked", notes: stale })];
    const report = await runGate({ cards, children, rulebook, floor, system: "S", model: "m", concurrency: 1, pendingOnly: true }, f.deps);
    expect(report).toMatchObject({ checked: 1, passed: 1, staleLeft: 2, upToDate: 0, pending: 0 });
    expect(f.calls()).toBe(1);
    expect(f.saved.map((s) => s.id)).toEqual([cards[0].id]);
  });

  it("with pendingOnly and nothing pending, makes no call and writes nothing", async () => {
    const f = fake([pass]);
    const current: PolicyNotes = { gate: { by: "model", rulebook: "h1", floor: 1, floor_first_guess: true, reasons: [], checked_at: "x" } };
    const stale: PolicyNotes = { gate: { ...current.gate!, rulebook: "h0" } };
    const cards = [gateCard({ policy: "passed", notes: current }), gateCard({ policy: "passed", notes: stale })];
    const report = await runGate({ cards, children, rulebook, floor, system: "S", model: "m", pendingOnly: true }, f.deps);
    expect(report).toMatchObject({ checked: 0, upToDate: 1, staleLeft: 1, pending: 0 });
    expect(f.calls()).toBe(0);
    expect(f.saved).toEqual([]);
  });

  it("writes nothing without a rulebook", async () => {
    const f = fake([pass]);
    const report = await run([gateCard(), gateCard()], f.deps, null);
    expect(f.calls()).toBe(0);
    expect(f.saved).toEqual([]);
    expect(report.pending).toBe(2);
    expect(Object.keys(report.faults)[0]).toMatch(/no rulebook/);
  });

  it("fails closed on a model error, a refusal or an unreadable reply, and takes back a stale verdict", async () => {
    const f = fake([new Error("404 model: no-such-model"), new Error("The model declined (cyber)."), { verdict: "block", reasons: [], reader_notes: [] }]);
    const old: PolicyNotes = { validation: ["kept"], gate: { by: "model", rulebook: "h0", floor: 1, floor_first_guess: true, reasons: [], checked_at: "x" } };
    const cards = [gateCard({ policy: "passed", notes: old }), gateCard(), gateCard()];
    const report = await run(cards, f.deps);
    expect(report.pending).toBe(3);
    expect(report.passed + report.blockedByModel).toBe(0);
    expect(Object.keys(report.faults)).toEqual(["the model call failed: 404 model: no-such-model", "the model call failed: The model declined (cyber).", "a block with no reason"]);
    // The stale pass goes back to pending, keeping its card-check notes; the others were already pending.
    expect(f.saved).toEqual([{ id: cards[0].id, policy: "pending", notes: { validation: ["kept"] } }]);
  });

  it("counts one model error once, whatever request id each reply carried", async () => {
    const err = (id: string) => new Error(`404 {"type":"error","error":{"type":"not_found_error","message":"model: no-such-model"},"request_id":"${id}"}`);
    const f = fake([err("req_011A"), err("req_011B"), err("req_011C")]);
    const report = await run([gateCard(), gateCard(), gateCard()], f.deps);
    expect(report.faults).toEqual({ 'the model call failed: 404 {"type":"error","error":{"type":"not_found_error","message":"model: no-such-model"}}': 3 });
  });

  it("stops when the rulebook changes under the run", async () => {
    const f = fake([pass], ["h1", "h2"]);
    const cards = [gateCard(), gateCard(), gateCard()];
    const report = await run(cards, f.deps);
    expect(report.rulebookChanged).toBe(true);
    expect(report.passed).toBe(1);
    expect(report.pending).toBe(2);
    expect(f.calls()).toBe(2); // the third card is never sent
    expect(f.saved.map((s) => s.policy)).toEqual(["passed"]);
  });

  it("gives the model the subjects left to it, and only the grade band and the note about the child", async () => {
    const f = fake([pass]);
    const two = mergeFamily(both({ 24: answer({ perspective: "family_tradition" }) }), kids, [], {});
    await runGate(
      {
        cards: [gateCard({ childId: "k9", subjects: [24], perspective: "family_tradition" })],
        children: [{ id: "k9", age: 9, carefulAbout: "Big ocean waves" }],
        rulebook: { ...rulebook, values: two },
        floor,
        system: "S",
        model: "m",
      },
      f.deps,
    );
    expect(f.prompts[0]).toContain("- Subject 24, Subject name 24. The family's setting: Answer it: answer it from what the family believes.");
    expect(f.prompts[0]).toContain("The child is in grades 4-5.");
    expect(f.prompts[0]).toContain("The parents asked for care about: Big ocean waves");
  });
});
