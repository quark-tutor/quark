import type { Slot } from "./card.ts";

// Every sentence the Wonder Wall says of its own, in one place for June to read (docs/wonder-wall-1-slice.md,
// decision 5). Effort words only, never brilliance words (rule 8; a test holds it), and the manner rules: no
// sarcasm, no lecture, nothing about the child's past behaviour, no shame, always a way back in. They hold
// under every family's praise setting. The reply to a guess that isn't judged right never says it was wrong
// (Brandon, 21 Oct 2026: no "Not yet"). Each verdict of the judge (core/wall/judge.ts) has its line here, and the
// child hears only these, never a word the judge wrote (docs/judge-slice.md, 28 Oct 2026): a clue, not a question,
// and an answer to the clue is thinking on the way, so the question is asked again.

export const SLOT_NAMES: Record<Slot, string> = { look: "Look", wonder: "Wonder", listen: "Listen", then: "Then", puzzle: "Puzzle" };

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
  // A reply that says something is missing or wrong with a sum, read by the no-number judge (core/wall/no-number.ts;
  // Brandon, 9 Nov 2026: "Say it as a number." to such a boy was "demeaning"). Kept from the Math tile.
  goodCatch: "Good catch. Thank you for telling me.",
  deleteDigit: "Delete", // the number pad's last key (app/kid/number-pad.tsx)
  // Talk (docs/tutor-voice-slice.md): hold to talk, let go to send the words to the box.
  talk: "Hold to talk",
  listening: "Listening… let go when you're done",
  writing: "Writing it down…",
  keepHolding: "Keep holding the button while you talk.",
  didntHear: "That didn't come through. Hold the button and try again.",
  noMicrophone: "The microphone is off. A grown-up can turn it on.",
} as const;

// --- The trading boat (docs/trading-boat-slice.md; stop 1 and its fix round, 16 Nov 2026) ---
// Every sentence the game says, for June to read. The program fills in the numbers and names; no model writes a word
// a child sees here, so nothing here goes to the gate (rule 5). Effort words and the manner rules above hold: a wrong
// sum is met with help at once, never with "wrong", and never with "How did you get that?". The answer is never shown
// (rule 3): the last step of the count is his, and where there is nothing fewer the sum goes to a grown-up.

export type BoatGood = "mangoes" | "coconuts" | "bananas" | "pineapples" | "taro" | "sweet-potatoes";
export type BoatIsland = "kauai" | "oahu" | "molokai" | "lanai" | "maui" | "hawaii";
export type BoatName = "canoe" | "double" | "schooner" | "ship";
export type BoatMarket = "harbor" | "village";
export type BoatUnit = "crate" | "bill";

// A good's name as a crate line says it, whether it takes "sells" or "sell", and "this" or "these".
const GOODS: Record<BoatGood, { name: string; many: boolean }> = {
  mangoes: { name: "mangoes", many: true },
  coconuts: { name: "coconuts", many: true },
  bananas: { name: "bananas", many: true },
  pineapples: { name: "pineapples", many: true },
  taro: { name: "taro", many: false },
  "sweet-potatoes": { name: "sweet potatoes", many: true },
};
const ISLANDS: Record<BoatIsland | "home", string> = {
  home: "home",
  kauai: "Kauaʻi",
  oahu: "Oʻahu",
  molokai: "Molokaʻi",
  lanai: "Lānaʻi",
  maui: "Maui",
  hawaii: "Hawaiʻi Island",
};
const BOATS: Record<BoatName, string> = { canoe: "canoe", double: "double canoe", schooner: "schooner", ship: "ship" };
// Why a rumored good is dear on an island: a reason a child can follow, told the same way before and after.
const REASONS: Record<BoatGood, (island: string) => string> = {
  mangoes: (i) => `A ship full of mangoes sank near ${i}.`,
  coconuts: (i) => `${i} is making coconut candy for a festival.`,
  bananas: (i) => `A storm blew down the banana trees on ${i}.`,
  pineapples: (i) => `A big lūʻau on ${i} needs pineapples.`,
  taro: (i) => `The taro patches on ${i} flooded.`,
  "sweet-potatoes": (i) => `Pigs dug up the sweet potato fields on ${i}.`,
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const many = (n: number, unit: string) => `${n} ${n === 1 ? unit : `${unit}s`}`;
const good = (g: BoatGood) => GOODS[g].name;
const sell = (g: BoatGood) => (GOODS[g].many ? "sell" : "sells");

export const BOAT = {
  tile: "The trading boat",
  good,
  Good: (g: BoatGood) => cap(good(g)),
  island: (i: BoatIsland | "home") => ISLANDS[i],
  boat: (b: BoatName) => BOATS[b],
  reason: (g: BoatGood, i: BoatIsland) => REASONS[g](ISLANDS[i]),
  crates: (n: number, g: BoatGood) => `${many(n, "crate")} of ${good(g)}`,

  // The first day
  firstDay: ["You have a canoe that holds 10 crates, and $20.", "Buy crates at the markets. Sell them for more on another island."],
  toHarbor: "Go to the harbor market",
  toVillage: "Go to the village market",
  castOff: "Cast off",

  // Your boat, at the top of each market
  money: (m: number) => `Your money: $${m}`,
  yourBoat: (b: BoatName, used: number, space: number) => `Your ${BOATS[b]}: ${used} of ${space} crates full`,
  aboard: (loads: string[]) => (loads.length ? `On board: ${loads.join(", ")}` : "On board: nothing yet"),
  usual: (p: number) => `Every dock pays $${p} a crate for anything. A rumor says where one thing sells for more.`,

  // A market
  market: (m: BoatMarket, i: BoatIsland | "home") => `The ${m} market ${i === "home" ? "at home" : `on ${ISLANDS[i]}`}`,
  offer: (g: BoatGood, p: number) => `${cap(good(g))}: $${p} a crate`,
  left: (n: number) => `${many(n, "crate")} left`,
  soldOut: "Sold out",
  rumor: (g: BoatGood, i: BoatIsland, p: number) => `A trader says: ${REASONS[g](ISLANDS[i])} ${cap(good(g))} will sell for $${p} a crate on ${ISLANDS[i]}.`,
  howMany: (g: BoatGood) => `How many crates of ${good(g)}?`,
  allTheTraderHas: "That's all the trader has.",
  allTheRoom: "That's all the room on your boat.",
  thatMany: "That many",

  // A trade
  owe: "How much do you owe the trader?",
  bought: (n: number, g: BoatGood) => `That's right. ${many(n, "crate")} of ${good(g)} ${n === 1 ? "is" : "are"} on your boat.`,
  short: (total: number, money: number) => `That's right, it's $${total}. You have $${money}.`,
  chooseAgain: "Choose again",

  // A wrong answer, and the count
  added: (n: number, p: number) => `That's ${n} and ${p} put together. You need ${n} lots of ${p}.`,
  oneOut: (unit: BoatUnit) => `Close. One ${unit} out.`,
  letsCount: "Let's count them.",
  step: (k: number, unit: BoatUnit, more: boolean) => (more ? `1 more ${unit}: how much so far?` : `${many(k, unit)}: how much so far?`),
  tryFewer: "Want to try fewer?",
  tryFewerButton: "Try fewer",
  sellFewer: "Want to sell fewer?",
  sellFewerButton: "Sell fewer",
  askGrownUp: "Ask a grown-up to work it out with you.", // after "This one is for a person:" (SAY.forAPerson)

  // Cast off
  whereSail: "Where will you sail?",
  sailChoice: (g: BoatGood, i: BoatIsland, p: number) => `${ISLANDS[i]}: ${REASONS[g](ISLANDS[i])} ${cap(good(g))} will sell for $${p} a crate there.`,
  castOffFor: (i: BoatIsland) => `You cast off for ${ISLANDS[i]}. You'll land there next time.`,
  sailingTo: (i: BoatIsland) => `Your boat is sailing to ${ISLANDS[i]}. You'll land there next time.`,

  // The landing
  land: (i: BoatIsland) => `You land on ${ISLANDS[i]}.`,
  landReason: (g: BoatGood, i: BoatIsland, p: number) => `${REASONS[g](ISLANDS[i])} So ${good(g)} ${sell(g)} for $${p} a crate here.`,
  usualHere: (g: BoatGood, p: number) => `Here ${good(g)} ${sell(g)} for the usual $${p} a crate.`,
  buyer: (k: number, g: BoatGood, p: number) => `A buyer takes up to ${many(k, "crate")} of ${good(g)} at $${p} a crate.`,
  // After the first buyer; and when + stops at what this buyer takes while he has more (Brandon at stop 2, 16 Nov 2026:
  // "It only let me sell 3 for some reason.").
  buyerNext: (k: number, g: BoatGood, p: number) => `Another buyer takes up to ${many(k, "crate")} of ${good(g)} at $${p} a crate.`,
  buyerLimit: "That's all this buyer takes. Another buyer comes next.",
  howManySell: "How many will you sell?",
  owed: "How much does the buyer owe you?",
  sold: (money: number) => `That's right. You have $${money} now.`,
  keep: "Keep the rest on the boat",

  // The look back
  backMade: (paid: number, g: BoatGood, sold: number) => `You paid $${paid} for ${GOODS[g].many ? "these" : "this"} ${good(g)} and sold ${GOODS[g].many ? "them" : "it"} for $${sold}. How much did you make?`,
  backLess: (paid: number, g: BoatGood, sold: number) => `You paid $${paid} for ${GOODS[g].many ? "these" : "this"} ${good(g)} and sold ${GOODS[g].many ? "them" : "it"} for $${sold}. How much less did you get back?`,
  right: "That's right.",
  countUp: (from: number, to: number) => `Count up from $${from} to $${to}.`,

  // The boat builder
  builder: (b: BoatName, space: number, bills: number) => `A boat builder has a ${BOATS[b]} that holds ${space} crates. It costs ${bills} hundred-dollar bills.`,
  buyIt: "Buy it",
  notNow: "Not now",
  oweBuilder: "How much do you owe the boat builder?",
  bundle: "The builder counts them in bundles of 10. How much is this bundle?",
  boatYours: (b: BoatName, space: number) => `That's right. The ${BOATS[b]} is yours. It holds ${space} crates.`,
} as const;

// The tile's slot name on the wall, for the trading boat (on the dev server against test only in this slice).
export const MATH_NAME = "Math";
