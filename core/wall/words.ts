import type { Slot } from "./card.ts";

// Every sentence the Wonder Wall says of its own, in one place for June to read (docs/wonder-wall-1-slice.md,
// decision 5). Effort words only, never brilliance words (rule 8; a test holds it), and the manner rules: no
// sarcasm, no lecture, nothing about the child's past behaviour, no shame, always a way back in. They hold
// under every family's praise setting. The reply to a guess that isn't judged right never says it was wrong
// (Brandon, 21 Oct 2026: no "Not yet"). Each verdict of the judge (core/wall/judge.ts) has its line here, and the
// child hears only these, never a word the judge wrote (docs/judge-slice.md, 28 Oct 2026): a clue, not a question,
// and an answer to the clue is thinking on the way, so the question is asked again.

export const SLOT_NAMES: Record<Slot, string> = { look: "Look", wonder: "Wonder", listen: "Listen", then: "Then", puzzle: "Puzzle" };
// The Math tile takes the Puzzle slot from week 6 (docs/math-tile-slice.md): a tile is named from its card, so a week
// still on puzzle cards keeps "Puzzle".
export const MATH_NAME = "Math";
export const tileName = (slot: Slot, math: boolean) => (math ? MATH_NAME : SLOT_NAMES[slot]);

export const SAY = {
  hello: (nickname: string) => `Hi, ${nickname}.`,
  nothingToday: "Nothing on the wall today.",
  everythingDone: "That's everything on the wall today.",
  doneToday: "Done for today",
  back: "Back to the wall",
  readIt: "Read it to me",
  gettingReady: "Getting it ready…", // from the tap until the voice starts (docs/lines-ahead-slice.md)
  stop: "Stop",
  play: "Play",
  pause: "Pause",
  typeHere: "Type your answer",
  send: "That's my answer",
  guessFirst: "Have a guess first. Any guess is fine.",
  clue: "Here's a clue:",
  close: "You're close.",
  toQuestion: "Good thinking. Now, the question:",
  right: "That's it.",
  deeper: "Go deeper",
  toTalkAbout: "That's one to talk about.",
  forAPerson: "This one is for a person:",
  didntSend: "That didn't send. Try again.",
  // The Math tile (docs/math-tile-slice.md, What is built 6): a wrong answer earns no clue. The moves, in order: how he
  // got it, the same question another way, one small step at a time, something he knows, a person. "That's it." and
  // "This one is for a person:" are the cards' own, above.
  howGotThat: "How did you get that?",
  anotherWay: "Here it is another way:",
  oneStep: "One step at a time:",
  thinkOfIt: "Think of it like this:",
  wholeThing: "Here's the whole thing:",
  howDoYouKnow: "How do you know?", // the younger boy's part 3, after his right answer
  sayNumber: "Say it as a number.",
  workedOut: "Here's one worked out:",
  nowYours: "Now yours",
  nextPart: "Next part",
  tellHow: "Say or type how you did it",
  deleteDigit: "Delete",
  // Talk (docs/tutor-voice-slice.md): hold to talk, let go to send the words to the box.
  talk: "Hold to talk",
  listening: "Listening… let go when you're done",
  writing: "Writing it down…",
  keepHolding: "Keep holding the button while you talk.",
  didntHear: "That didn't come through. Hold the button and try again.",
  noMicrophone: "The microphone is off. A grown-up can turn it on.",
} as const;
