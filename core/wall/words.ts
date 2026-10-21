import type { Slot } from "./card.ts";

// Every sentence the Wonder Wall says of its own, in one place for June to read (docs/wonder-wall-1-slice.md,
// decision 5). Effort words only, never brilliance words (rule 8; a test holds it), and the manner rules: no
// sarcasm, no lecture, nothing about the child's past behaviour, no shame, always a way back in. They hold
// under every family's praise setting. The reply to a guess that isn't judged right never says it was wrong:
// the matcher misreads two in three right answers in a child's own words (Brandon, 21 Oct 2026: no "Not yet").

export const SLOT_NAMES: Record<Slot, string> = { look: "Look", wonder: "Wonder", listen: "Listen", then: "Then", puzzle: "Puzzle" };

export const SAY = {
  hello: (nickname: string) => `Hi, ${nickname}.`,
  nothingToday: "Nothing on the wall today.",
  everythingDone: "That's everything on the wall today.",
  doneToday: "Done for today",
  back: "Back to the wall",
  readIt: "Read it to me",
  stop: "Stop",
  play: "Play",
  pause: "Pause",
  typeHere: "Type your answer",
  send: "That's my answer",
  guessFirst: "Have a guess first. Any guess is fine.",
  thinkAbout: "Here's something to think about:",
  right: "That's it.",
  deeper: "Go deeper",
  toTalkAbout: "That's one to talk about.",
  forAPerson: "This one is for a person:",
  didntSend: "That didn't send. Try again.",
} as const;
