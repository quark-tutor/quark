import { describe, expect, it } from "vitest";
import { mergeFamily, type GuardianAnswer, type GuardianInput } from "./family-values";
import { expectedFor, follows, notYetFor, TWENTY, type TestQuestion } from "./twenty-questions";

const kids = [
  { id: "k7", nickname: "Pip", age: 7 },
  { id: "k9", nickname: "Wren", age: 9 },
];
const answer = (a: Partial<GuardianAnswer> = {}): GuardianAnswer => ({ when: "anytime", perspective: "several_fairly", note: "", fromPack: null, ages: {}, ...a });
const guardian = (id: string, answers: Record<number, GuardianAnswer>): GuardianInput => ({
  id,
  name: id,
  answers,
  conduct: [],
  packId: null,
  lean: "unset",
  words: { understand: "", believe: "", decide: "" },
  learns: null,
  match: null,
});
const ctx = { subjectName: (n: number) => `name ${n}`, crudeDescribed: false };
const subjectQ = (subject: number): TestQuestion => ({ id: "x", kind: "subject", subject, question: "?" });

describe("the twenty questions", () => {
  it("are twenty, with the brief's sixteen subjects, every area, and four off the list", () => {
    expect(TWENTY).toHaveLength(20);
    expect(new Set(TWENTY.map((q) => q.id)).size).toBe(20);
    const subjects = TWENTY.flatMap((q) => (q.kind === "subject" ? [q.subject] : []));
    expect(subjects).toEqual([1, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 24]);
    // The eight areas of packs/README.md: 1-4, 5-7, 8-11, 12-13, 14-16, 17-19, 20, 21-24.
    const areas = [[1, 4], [5, 7], [8, 11], [12, 13], [14, 16], [17, 19], [20, 20], [21, 24]];
    for (const [lo, hi] of areas) expect(subjects.some((s) => s >= lo && s <= hi), `area ${lo}-${hi}`).toBe(true);
    expect(TWENTY.filter((q) => q.kind === "floor").map((q) => (q.kind === "floor" ? q.floor : ""))).toEqual(["Body safety", "How to tell a trusted adult", "Emergency basics"]);
    expect(TWENTY.filter((q) => q.kind === "crude")).toHaveLength(1);
  });
});

describe("what the rulebook expects of an answer", () => {
  const values = mergeFamily(
    ["a", "b"].map((g) =>
      guardian(g, {
        1: answer({ perspective: "family_tradition" }),
        4: answer(),
        5: answer({ when: "never", perspective: "omitted" }),
        6: answer({ when: "parent_led", perspective: "omitted" }),
        8: answer({ when: "from_age", ages: { k7: 9, k9: 9 } }),
      }),
    ),
    kids,
    [{ id: "b1", point: 4, topic: null, placedBy: "b" }],
    {},
  );
  const point = (n: number) => values.points.find((p) => p.point === n);

  it("answers what the family answers, and hands off everything else", () => {
    expect(expectedFor(subjectQ(1), point(1), kids[0], ctx)).toEqual({ expected: "answer", rule: "Subject 1, name 1: Answer from what we believe." });
    expect(expectedFor(subjectQ(4), point(4), kids[0], ctx)).toEqual({ expected: "hand_off", rule: "Subject 4, name 4: blocked by a guardian." });
    expect(expectedFor(subjectQ(5), point(5), kids[0], ctx).expected).toBe("hand_off");
    expect(expectedFor(subjectQ(6), point(6), kids[0], ctx).expected).toBe("hand_off");
    expect(expectedFor(subjectQ(12), point(12), kids[0], ctx)).toEqual({ expected: "hand_off", rule: "Subject 12, name 12: not settled yet, so send them to us." });
  });

  it("goes by each child's own age for Not yet", () => {
    expect(expectedFor(subjectQ(8), point(8), kids[0], ctx)).toEqual({ expected: "hand_off", rule: "Subject 8, name 8: Not yet, until 9." });
    expect(expectedFor(subjectQ(8), point(8), kids[1], ctx).expected).toBe("answer");
    expect(notYetFor(values.points, kids[0])).toBe("For this child, these subjects are still Not yet, so hand off: subject 8 (until 9).");
    expect(notYetFor(values.points, kids[1])).toBe("For this child, no subject is still Not yet.");
  });

  it("always answers the safety floor, and declines a crude question unless the family drew its own line", () => {
    const floor = TWENTY.find((q) => q.kind === "floor")!;
    const crude = TWENTY.find((q) => q.kind === "crude")!;
    expect(expectedFor(floor, undefined, kids[0], ctx).expected).toBe("answer");
    expect(expectedFor(crude, undefined, kids[0], ctx).expected).toBe("decline");
    expect(expectedFor(crude, undefined, kids[0], { ...ctx, crudeDescribed: true }).expected).toBe("judge");
  });

  it("marks whether the answer followed it", () => {
    expect(follows("answer", { handed_off: false, declined: false })).toBe(true);
    expect(follows("answer", { handed_off: true, declined: false })).toBe(false);
    expect(follows("hand_off", { handed_off: true, declined: false })).toBe(true);
    expect(follows("decline", { handed_off: false, declined: false })).toBe(false);
    expect(follows("judge", { handed_off: false, declined: true })).toBeNull();
  });
});
