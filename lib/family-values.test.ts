import { describe, expect, it } from "vitest";
import { gentler } from "./conduct";
import { mergeFamily, type GuardianAnswer, type GuardianInput } from "./family-values";
import { renderPolicy, type PolicyContext } from "./policy";

const kids = [
  { id: "k1", nickname: "Asher", age: 9 },
  { id: "k2", nickname: "Rex", age: 7 },
];

const answer = (a: Partial<GuardianAnswer> = {}): GuardianAnswer => ({
  when: "anytime",
  perspective: "several_fairly",
  note: "",
  fromPack: null,
  ages: {},
  ...a,
});

const guardian = (id: string, g: Partial<GuardianInput> = {}): GuardianInput => ({
  id,
  name: id,
  answers: {},
  conduct: [],
  packId: null,
  lean: "unset",
  words: { understand: "", believe: "", decide: "" },
  learns: null,
  match: null,
  ...g,
});

const ctx: PolicyContext = {
  points: Array.from({ length: 24 }, (_, i) => ({ number: i + 1, name: `Subject ${i + 1}` })),
  children: kids,
  handoff: (point, pack) => (pack === "cat" && point === 6 ? "Ask Dad about that one." : null),
  packName: (id) => (id === "cat" ? "Catholic" : null),
};

describe("merging two guardians' answers", () => {
  it("writes a subject only once both have answered it", () => {
    const a = guardian("a", { answers: { 1: answer() } });
    const b = guardian("b");
    const [p1] = mergeFamily([a, b], kids, [], {}).points;
    expect(p1.status).toBe("waiting");
    expect(p1.setting).toBeNull();
    expect(p1.waitingOn).toEqual(["b"]);
  });

  it("keeps an agreed answer, both notes and a shared tradition", () => {
    const a = guardian("a", { answers: { 1: answer({ note: "We say yes.", fromPack: "cat" }) } });
    const b = guardian("b", { answers: { 1: answer({ note: " We say yes. ", fromPack: "cat" }) } });
    const [p1] = mergeFamily([a, b], kids, [], {}).points;
    expect(p1.status).toBe("agreed");
    expect(p1.setting).toMatchObject({ when: "anytime", perspective: "several_fairly", notes: ["We say yes."], fromPack: "cat" });
  });

  it("makes a difference parent-led and flags it", () => {
    const a = guardian("a", { answers: { 2: answer({ perspective: "family_tradition", note: "mine" }) } });
    const b = guardian("b", { answers: { 2: answer() } });
    const p2 = mergeFamily([a, b], kids, [], {}).points[1];
    expect(p2.status).toBe("differ");
    expect(p2.setting).toMatchObject({ when: "parent_led", perspective: "omitted", notes: [] });
  });

  it("treats a different ready-to-answer perspective on Not yet as a difference", () => {
    const a = guardian("a", { answers: { 8: answer({ when: "from_age", perspective: "family_tradition" }) } });
    const b = guardian("b", { answers: { 8: answer({ when: "from_age", perspective: "several_fairly" }) } });
    expect(mergeFamily([a, b], kids, [], {}).points[7].status).toBe("differ");
  });

  it("takes the older Not yet age for each child", () => {
    const a = guardian("a", { answers: { 8: answer({ when: "from_age", ages: { k1: 10, k2: 12 } }) } });
    const b = guardian("b", { answers: { 8: answer({ when: "from_age", ages: { k1: 11 } }) } });
    const p8 = mergeFamily([a, b], kids, [], {}).points[7];
    expect(p8.setting?.ages).toEqual({ k1: 11, k2: 12 });
  });

  it("lets one blackball settle a subject whatever the answers", () => {
    const a = guardian("a", { answers: { 3: answer() } });
    const b = guardian("b");
    const bb = { id: "x", point: 3, topic: null, placedBy: "b" };
    const p3 = mergeFamily([a, b], kids, [bb], {}).points[2];
    expect(p3.status).toBe("blocked");
    expect(p3.setting).toMatchObject({ when: "never", perspective: "omitted" });
  });

  it("uses one guardian's answers as the family's when there is only one", () => {
    const a = guardian("a", { answers: { 1: answer() } });
    expect(mergeFamily([a], kids, [], {}).points[0].status).toBe("agreed");
  });
});

describe("merging conduct", () => {
  it("orders choices gentlest first", () => {
    expect(gentler("conduct.speak_first", ["required", "gentle"])).toBe("gentle");
    expect(gentler("conduct.rudeness", ["correct", "quiet"])).toBe("quiet");
    expect(gentler("conduct.praise", ["none", "plain"])).toBe("plain");
  });

  it("takes the gentler setting where guardians differ, per child", () => {
    const a = guardian("a", {
      conduct: [
        { key: "conduct.speak_first", childId: "k1", value: "required", note: null },
        { key: "conduct.speak_first", childId: "k2", value: "gentle", note: null },
        { key: "conduct.rudeness", childId: null, value: "correct", note: "Say 'Let's be kind.'" },
      ],
    });
    const b = guardian("b", {
      conduct: [
        { key: "conduct.speak_first", childId: "k1", value: "required", note: null },
        { key: "conduct.speak_first", childId: "k2", value: "off", note: null },
        { key: "conduct.rudeness", childId: null, value: "quiet", note: null },
      ],
    });
    const { conduct } = mergeFamily([a, b], kids, [], {});
    const get = (key: string, childId: string | null = null) => conduct.find((c) => c.key === key && c.childId === childId);
    expect(get("conduct.speak_first", "k1")).toMatchObject({ status: "agreed", value: "required" });
    expect(get("conduct.speak_first", "k2")).toMatchObject({ status: "differ", value: "off" });
    expect(get("conduct.rudeness")).toMatchObject({ status: "differ", value: "quiet", notes: ["Say 'Let's be kind.'"] });
    expect(get("conduct.praise")).toMatchObject({ status: "waiting", value: "warm" });
  });
});

describe("the family profile", () => {
  it("joins both guardians' own words under each question", () => {
    const a = guardian("a", { words: { understand: "Kindness.", believe: "", decide: "" } });
    const b = guardian("b", { words: { understand: "Curiosity.", believe: "", decide: "Politics." } });
    const { statement } = mergeFamily([a, b], kids, [], {}).profile;
    expect(statement).toContain("- Kindness.\n- Curiosity.");
    expect(statement).toContain("What do you want them to decide for themselves?\n- Politics.");
    expect(statement).not.toContain("believe that you want");
  });

  it("takes how kids learn to act from the tradition unless a guardian chose, and mixes a difference", () => {
    const acts = { cat: { learns: "exemplars" as const, match: true }, hum: { learns: "consideration" as const, match: false } };
    const both = mergeFamily([guardian("a", { packId: "cat" }), guardian("b", { packId: "cat" })], kids, [], acts).profile;
    expect(both).toMatchObject({ packId: "cat", learns: "exemplars", match: true });
    const split = mergeFamily([guardian("a", { packId: "cat" }), guardian("b", { packId: "hum" })], kids, [], acts).profile;
    expect(split).toMatchObject({ packId: null, learns: "mixed", match: false });
    const chose = mergeFamily([guardian("a", { packId: "cat", match: false }), guardian("b", { packId: "cat" })], kids, [], acts);
    expect(chose.profile.match).toBe(false);
  });
});

describe("the policy document", () => {
  it("renders the spec's sentences for each kind of subject", () => {
    const a = guardian("a", {
      answers: {
        1: answer({ perspective: "family_tradition", fromPack: "cat", note: "We believe in God." }),
        6: answer({ when: "parent_led", perspective: "omitted", fromPack: "cat" }),
        8: answer({ when: "from_age", perspective: "several_fairly", ages: { k1: 10, k2: 9 } }),
        9: answer(),
      },
    });
    const b = guardian("b", {
      answers: {
        1: answer({ perspective: "family_tradition", fromPack: "cat" }),
        6: answer({ when: "parent_led", perspective: "omitted", fromPack: "cat" }),
        8: answer({ when: "from_age", perspective: "several_fairly", ages: { k1: 10, k2: 9 } }),
        9: answer({ when: "never", perspective: "omitted" }),
      },
    });
    const doc = renderPolicy(mergeFamily([a, b], kids, [], {}), ctx);
    expect(doc).toContain(
      `**Point 1, Subject 1.** The tutor may raise this and may answer it. Answer from the family's tradition (Catholic), in the family's words where given. Never say other views are foolish. The family's note: "We believe in God."`,
    );
    expect(doc).toContain(`**Point 6, Subject 6.** The tutor does not raise this. If the child asks, hand off: "Ask Dad about that one." Say nothing on this.`);
    expect(doc).toContain("The tutor does not raise this with Asher before age 10.");
    expect(doc).toContain("The tutor does not raise this with Rex before age 9.");
    expect(doc).toContain("From that age: Present the main views fairly");
    expect(doc).toContain("**Point 9, Subject 9.** The parents haven't agreed on this yet, so it is parent-led until they do.");
    expect(doc).toContain("**Point 2, Subject 2.** Not settled yet");
    expect(doc).toContain("## Conduct");
    expect(doc).toContain("Asher: don't ask for a spoken answer before a hint. (Not settled yet");
  });

  it("marks a blackballed subject and topic as blocked", () => {
    const bbs = [
      { id: "1", point: 4, topic: null, placedBy: "a" },
      { id: "2", point: null, topic: "Halloween", placedBy: "b" },
    ];
    const doc = renderPolicy(mergeFamily([guardian("a"), guardian("b")], kids, bbs, {}), ctx);
    expect(doc).toContain("**Point 4, Subject 4.** BLOCKED by a guardian. Do not teach. Do not characterize. Hand off neutrally.");
    expect(doc).toContain(`- "Halloween": BLOCKED by a guardian.`);
  });

  it("asks for a crude question to fit every parent's description before declining it", () => {
    const a = guardian("a", { conduct: [{ key: "conduct.crude_line", childId: null, value: null, note: "Potty words." }] });
    const b = guardian("b", { conduct: [{ key: "conduct.crude_line", childId: null, value: null, note: "Name-calling." }] });
    const doc = renderPolicy(mergeFamily([a, b], kids, [], {}), ctx);
    expect(doc).toContain(`Decline a question as crude only when it fits all of these: "Potty words."; "Name-calling."`);
  });
});
