import { describe, expect, it } from "vitest";
import { answerReply, cardReply, chainState, reachable, type AttemptRow, type ChainLayer } from "./card.ts";

const layer = (n: number, hints = 2): ChainLayer => ({
  cardId: `card-${n}`,
  slot: "then",
  layer: n,
  body: {
    title: `Title ${n}`,
    text: `Text ${n}`,
    image_alt: "",
    question: `Question ${n}?`,
    hints: Array.from({ length: hints }, (_, i) => `Hint ${n}.${i + 1}`),
    handoff: `Ask a parent about ${n}.`,
  },
  questionId: `q-${n}`,
  answerKey: { accept: n === 4 ? [] : [`answer ${n}`], rubric: "secret rubric" },
});
const chain = [layer(1), layer(2), layer(3), layer(4)];

let clock = 0;
const tried = (n: number, correct: boolean | null): AttemptRow => ({
  question_id: `q-${n}`,
  correct,
  created_at: new Date(Date.UTC(2026, 9, 26, 18, 0, clock++)).toISOString(),
});

describe("the layers a child can reach", () => {
  it("are layer 1 and each next one while it is there", () => {
    expect(reachable([{ layer: 2 }, { layer: 1 }, { layer: 4 }]).map((l) => l.layer)).toEqual([1, 2]);
    expect(reachable([{ layer: 2 }, { layer: 3 }])).toEqual([]);
  });
});

describe("a card's state from its attempts", () => {
  it("starts at layer 1 with no hints", () => {
    expect(chainState(chain, [])).toEqual({ kind: "answering", at: 0, hintsSeen: 0 });
  });

  it("gives one hint per wrong guess, then the handoff after one more", () => {
    expect(chainState(chain, [tried(1, false)])).toEqual({ kind: "answering", at: 0, hintsSeen: 1 });
    expect(chainState(chain, [tried(1, false), tried(1, false)])).toEqual({ kind: "answering", at: 0, hintsSeen: 2 });
    expect(chainState(chain, [tried(1, false), tried(1, false), tried(1, false)])).toEqual({ kind: "handed_off", at: 0, hintsSeen: 2 });
  });

  it("moves to the next layer on a right answer, and ends at layer 4's open answer", () => {
    expect(chainState(chain, [tried(1, false), tried(1, true)])).toEqual({ kind: "answering", at: 1, hintsSeen: 0 });
    expect(chainState(chain, [tried(1, true), tried(2, true), tried(3, true), tried(4, null)])).toEqual({ kind: "open", at: 3, hintsSeen: 0 });
  });

  it("ends with the handoff after a right answer when no deeper layer passed", () => {
    expect(chainState([layer(1)], [tried(1, true)])).toEqual({ kind: "answered", at: 0, hintsSeen: 0 });
  });

  it("opens no deeper layer after a handoff, even with later attempts", () => {
    const s = chainState(chain, [tried(1, false), tried(1, false), tried(1, false), tried(1, true), tried(2, true)]);
    expect(s).toEqual({ kind: "handed_off", at: 0, hintsSeen: 2 });
  });

  it("spends a hint on not yet and close, none on an answer to the hint, and counts a row from before the judge as it did", () => {
    const judged = (verdict: string | null): AttemptRow => ({ ...tried(1, false), verdict });
    expect(chainState(chain, [judged("not_yet"), judged("close")])).toEqual({ kind: "answering", at: 0, hintsSeen: 2 });
    expect(chainState(chain, [judged("not_yet"), judged("hint"), judged("hint"), judged("hint")])).toEqual({ kind: "answering", at: 0, hintsSeen: 1 });
    expect(chainState(chain, [judged(null), judged(null), judged(null)])).toEqual({ kind: "handed_off", at: 0, hintsSeen: 2 });
    expect(chainState(chain, [tried(1, false), judged("hint"), tried(1, false), judged("close")])).toEqual({ kind: "handed_off", at: 0, hintsSeen: 2 });
  });

  it("reads attempts in time order and ignores other questions", () => {
    const first = tried(1, true);
    const wrongs = [tried(1, false), tried(1, false), tried(1, false)];
    // Given wrongs first in the list, but the right answer came first in time: layer 2 is open.
    expect(chainState(chain, [...wrongs, first, tried(9, false)])).toEqual({ kind: "answering", at: 1, hintsSeen: 0 });
  });
});

describe("the card's reply", () => {
  it("carries exactly its fields, the hints seen and no handoff while answering", () => {
    const r = cardReply(chain, { kind: "answering", at: 0, hintsSeen: 1 }, null);
    expect(Object.keys(r).sort()).toEqual(["hints", "id", "image_alt", "layer", "media", "question", "slot", "state", "text", "title"]);
    expect(r.hints).toEqual(["Hint 1.1"]);
    expect(JSON.stringify(r)).not.toMatch(/answer 1|secret rubric|Hint 1\.2|Ask a parent/);
  });

  it("carries the handoff once the card is done", () => {
    const r = cardReply(chain, { kind: "handed_off", at: 0, hintsSeen: 2 }, null);
    expect(r.handoff).toBe("Ask a parent about 1.");
    expect(r.hints).toEqual(["Hint 1.1", "Hint 1.2"]);
  });
});

describe("the answer's reply", () => {
  it("is guess_first for a guess that isn't one", () => {
    expect(answerReply("not_a_guess", chain, chainState(chain, []))).toEqual({ outcome: "guess_first" });
  });

  it("gives the next hint, then the handoff", () => {
    expect(answerReply("not_yet", chain, chainState(chain, [tried(1, false)]))).toEqual({ outcome: "not_yet", hint: "Hint 1.1" });
    const handed = chainState(chain, [tried(1, false), tried(1, false), tried(1, false)]);
    expect(answerReply("not_yet", chain, handed)).toEqual({ outcome: "handoff", handoff: "Ask a parent about 1." });
  });

  it("gives the next card's id on a right answer, or the handoff when there is nothing deeper", () => {
    expect(answerReply("right", chain, chainState(chain, [tried(1, true)]))).toEqual({ outcome: "right", next: "card-2" });
    expect(answerReply("right", [layer(1)], chainState([layer(1)], [tried(1, true)]))).toEqual({ outcome: "right", handoff: "Ask a parent about 1." });
  });

  it("gives a clue after close, and the question again after an answer to the hint", () => {
    const close = chainState(chain, [{ ...tried(1, false), verdict: "close" }]);
    expect(answerReply("close", chain, close)).toEqual({ outcome: "close", hint: "Hint 1.1" });
    const step = chainState(chain, [tried(1, false), { ...tried(1, false), verdict: "hint" }]);
    expect(answerReply("hint", chain, step)).toEqual({ outcome: "to_question" });
  });

  it("gives the handoff after an open question's answer", () => {
    const s = chainState(chain, [tried(1, true), tried(2, true), tried(3, true), tried(4, null)]);
    expect(answerReply("open", chain, s)).toEqual({ outcome: "open", handoff: "Ask a parent about 4." });
  });
});
