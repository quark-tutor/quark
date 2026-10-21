import { describe, expect, it, vi } from "vitest";
import { CARD_SCHEMA, cardPrompt, checkCards, givesAway, planDoors, writeCards, type CardBody, type CardChild, type CardContext, type RawCards } from "./cards";
import { firstLayerProblem, IDEA_SCHEMA, ideasPrompt, parseIdeas, sourceRefs, topicForDay, writeIdeaChain, type RawIdeas, type RawLayer } from "./ideas";
import type { IdeaChain, WeekPlan, WeekTopic } from "./types";
import { weekSchedule } from "./schedule";
import { addDays, buildWeek, nextMonday, todayIn, type CardRow, type QuestionRow, type WeekChild, type WeekDeps } from "./week";
import { mergeFamily } from "../../lib/family-values";
import { learnsSentence, renderPolicy } from "../../lib/policy";

// --- A small week to work with ---

const item = { id: "item-1", type: "image", title: "Nakht's chapel", creator: "Norman de Garis Davies", attribution: "Davies. The Met.", description: "Facsimile" };

function topic(subject: string, slot: WeekTopic["slot"], over: Partial<WeekTopic> = {}): WeekTopic {
  return {
    id: `t-${subject}`,
    keys: [`egypt/w1/${subject}/2-3`, `egypt/w1/${subject}/4-5`],
    kind: "thread",
    subject,
    slot,
    title: `${subject} topic`,
    younger: `Younger ${subject} summary.`,
    older: `Older ${subject} summary.`,
    items: [],
    perspective: null,
    valuesPoints: [],
    parentNote: null,
    chapter: { title: "The river", why: "Everything starts with the Nile." },
    ...over,
  };
}

// A short lesson for a slot: seven per slot, so a whole week can be mixed.
const SUBJECT_OF = { look: "art", wonder: "science", listen: "music", then: "history", puzzle: "math" } as const;
function lesson(slot: WeekTopic["slot"], i: number, over: Partial<WeekTopic> = {}): WeekTopic {
  return topic(SUBJECT_OF[slot], slot, {
    id: `l-${slot}-${i}`,
    keys: [`short/${slot}-${i}/2-3`, `short/${slot}-${i}/4-5`],
    kind: "short",
    title: `${slot} lesson ${i}`,
    chapter: undefined,
    ...over,
  });
}

// The thread runs in Egypt's order: then, wonder, look, listen, then, puzzle, then.
const thread = [
  topic("geography", "then"),
  topic("science", "wonder"),
  topic("art", "look", { items: [item] }),
  topic("music", "listen"),
  topic("literature", "then"),
  topic("math", "puzzle"),
  topic("history", "then", { keys: ["egypt/w2/history/2-3", "egypt/w2/history/4-5"], chapter: { title: "The pyramids", why: "How they were built." } }),
];
const lessons = (["look", "wonder", "listen", "then", "puzzle"] as const).flatMap((slot) => [1, 2, 3, 4, 5, 6, 7].map((i) => lesson(slot, i)));

const plan: WeekPlan = {
  week: 1,
  title: "Week 1: The river, with short lessons",
  thread: { stretch: "egypt", title: "Ancient Egypt" },
  topicIds: [],
  topics: [...thread, ...lessons],
  schedule: weekSchedule({ week: 1, thread, lessons, used: new Set() }),
};

// What the schema asks for: four named layers, and four named cards.
const ideas = (layers: RawLayer[]): RawIdeas => Object.fromEntries(layers.map((l, i) => [`layer_${i + 1}`, l]));
const asRaw = (cards: CardBody[]): RawCards => Object.fromEntries(cards.map((c, i) => [`card_${i + 1}`, c]));

const rawLayer = (n: number, over: Partial<RawLayer> = {}): RawLayer => ({
  title: `Idea ${n}`,
  statement: `Statement ${n}, with its mechanism.`,
  question: `Question ${n}?`,
  accept: ["silt", "mud"],
  rubric: "Silt or mud counts.",
  content_item_id: "",
  ...over,
});

function chainFor(day: number, slot: WeekTopic["slot"]): IdeaChain {
  const t = topicForDay(plan, slot, day);
  const layers = parseIdeas(ideas([1, 2, 3, 4].map((n) => rawLayer(n, { content_item_id: t.items[0]?.id ?? "" }))), t.items);
  return { day, slot, topic: t, layers };
}

const kid: CardChild = { id: "c1", nickname: "Pip", age: 7, reading: "reads_alone", interests: ["sharks", "trucks"], boredBy: ["dolls"] };

const goodCard = (n: number): CardBody => ({
  title: `Card ${n}`,
  text: "The river rose every summer and left dark soil behind.",
  image_alt: "A painting of farmers by the river.",
  read_aloud: "The river rose every summer.",
  question: "What did the flood leave behind?",
  hints: ["Where did the water come from?", "What was the ground like after the water went away?"],
  handoff: "Ask Dad what the farmers planted.",
});
const goodList = (): CardBody[] => [1, 2, 3, 4].map(goodCard);
const goodCards = (): RawCards => asRaw(goodList());

// --- Ideas ---

describe("ideas", () => {
  it("takes each day-slot's topic from the schedule: the thread on its slot, short lessons on the rest", () => {
    expect([1, 2, 3, 4, 5, 6, 7].map((d) => topicForDay(plan, "then", d).id)).toEqual(["t-geography", "l-then-1", "l-then-2", "l-then-3", "t-literature", "l-then-4", "t-history"]);
    expect(topicForDay(plan, "look", 3).id).toBe("t-art");
    expect(topicForDay(plan, "look", 5).id).toBe("l-look-4");
  });

  it("builds a thread topic's prompt from the thread, its chapter and the topic, and nothing about any child", () => {
    const art = thread[2];
    const earlier = [chainFor(1, "look"), { ...chainFor(3, "look"), day: 1 }]; // the second is on the same topic
    const prompt = ideasPrompt({ ...plan, topics: plan.topics.map((t) => (t.id === art.id ? { ...t, earlierInThread: ["The Nile", "The flood"] } : t)) }, "look", 3, earlier);
    expect(prompt).toContain("Part of the running thread, Ancient Egypt: one day of it, on this card. This part of the thread: The river. Everything starts with the Nile.");
    expect(prompt).toContain("Earlier in the thread (the children have met these; build on them, don't repeat them): The Nile; The flood.");
    expect(prompt).toContain("Day 3 of the week, the look card. Subject: art.");
    expect(prompt).toContain("Grade 2-3 summary: Younger art summary.");
    expect(prompt).toContain("Grade 4-5 summary: Older art summary.");
    expect(prompt).toContain('- id item-1: image, "Nakht\'s chapel", Norman de Garis Davies.');
    expect(prompt).toContain("Already written on this topic on earlier days (don't repeat these; layer 1 must be new):");
    expect(prompt.match(/- Day 1: /g)).toHaveLength(1); // only the chain on this topic, not day 1's short lesson
    expect(prompt).not.toMatch(/Pip|sharks|\bboy\b|\bgirl\b/);
  });

  it("says a short lesson stands on its own, with its own perspective and a parent's part", () => {
    const swan = lesson("listen", 1, { perspective: "family_tradition", valuesPoints: [24], parentNote: "Play the first movement for him." });
    const p = ideasPrompt({ ...plan, topics: plan.topics.map((t) => (t.id === swan.id ? swan : t)) }, "listen", 1, []);
    expect(p).toContain("A short lesson: one day on its own, not part of a thread.");
    expect(p).not.toContain("running thread");
    expect(p).toContain("This topic is marked perspective family_tradition, touching values points 24.");
    expect(p).toContain("A parent does this with the child (for the parent, not the card): Play the first movement for him.");
    expect(p).toContain("Nothing has been written on this topic earlier this week.");
  });

  it("says when a topic has no approved item", () => {
    expect(ideasPrompt(plan, "wonder", 1, [])).toContain("No approved items for this topic");
  });

  it("parses four layers, keeps the answer key, and drops an item that wasn't offered", () => {
    const layers = parseIdeas(ideas([rawLayer(1, { content_item_id: "item-1" }), rawLayer(2, { content_item_id: "made-up" }), rawLayer(3), rawLayer(4)]), [item]);
    expect(layers.map((l) => l.layer)).toEqual([1, 2, 3, 4]);
    expect(layers[0]).toMatchObject({ content_item_id: "item-1", answer_key: { accept: ["silt", "mud"], rubric: "Silt or mud counts." } });
    expect(layers[1].content_item_id).toBeNull();
  });

  it("refuses a chain that isn't four complete layers", () => {
    expect(() => parseIdeas(ideas([rawLayer(1), rawLayer(2), rawLayer(3), rawLayer(4, { statement: " " })]), [])).toThrow(/layer 4 has no statement/);
    expect(() => parseIdeas(ideas([rawLayer(1, { accept: [] }), rawLayer(2), rawLayer(3), rawLayer(4)]), [])).toThrow(/no acceptable answers/);
    // Layer 4 is open: the second real run (14 Oct 2026) returned it with no fixed answers, rightly.
    const open = parseIdeas(ideas([rawLayer(1), rawLayer(2), rawLayer(3), rawLayer(4, { accept: [], rubric: "Any reason that uses the flood counts." })]), []);
    expect(open[3].answer_key).toEqual({ accept: [], rubric: "Any reason that uses the flood counts." });
  });

  it("refuses the reply the real model gave on 14 Oct 2026 (one layer), naming the missing layers", () => {
    // Recorded from .quark-debug: the old array schema let claude-opus-5-5 stop after one layer.
    const real = { layers: [rawLayer(1, { title: "Pictures for numbers", accept: ["13", "thirteen", "ten and three"] })] };
    expect(() => parseIdeas(real as unknown as RawIdeas, [])).toThrow("expected 4 layers, got 0: layers 1, 2, 3, 4 missing");
    expect(() => parseIdeas(ideas([rawLayer(1)]), [])).toThrow("expected 4 layers, got 1: layers 2, 3, 4 missing");
    expect(() => parseIdeas({ layer_1: rawLayer(1), layer_2: rawLayer(2), layer_4: rawLayer(4) }, [])).toThrow("expected 4 layers, got 3: layer 3 missing");
  });

  it("asks for exactly four layers and four cards in the schema itself, by name", () => {
    expect(IDEA_SCHEMA.required).toEqual(["layer_1", "layer_2", "layer_3", "layer_4"]);
    expect(Object.keys(IDEA_SCHEMA.properties)).toEqual(IDEA_SCHEMA.required);
    expect(CARD_SCHEMA.required).toEqual(["card_1", "card_2", "card_3", "card_4"]);
    expect(JSON.stringify([IDEA_SCHEMA, CARD_SCHEMA])).not.toContain('"layers"');
  });

  it("anchors each idea to the plan topic and its item with attribution", () => {
    const chain = chainFor(3, "look");
    expect(sourceRefs(chain.topic, chain.layers[0])).toEqual(["plan:egypt/w1/art/2-3", "plan:egypt/w1/art/4-5", "content:item-1 Davies. The Met."]);
  });

  it("asks the curation model with the schema", async () => {
    const complete = vi.fn(async () => ideas([1, 2, 3, 4].map((n) => rawLayer(n))) as never);
    const chain = await writeIdeaChain(plan, "wonder", 1, [], { complete, system: "SYSTEM" });
    expect(chain.layers).toHaveLength(4);
    const call = (complete.mock.calls[0] as unknown as [{ use: string; system: string; json: { required: string[] } }])[0];
    expect(call).toMatchObject({ use: "curate", system: "SYSTEM" });
    expect(call.json.required).toEqual(["layer_1", "layer_2", "layer_3", "layer_4"]);
  });
});

describe("layer 1 has a picture (decided 15 Oct 2026)", () => {
  const withItem = (first: string) =>
    parseIdeas(ideas([rawLayer(1, { content_item_id: first }), rawLayer(2), rawLayer(3), rawLayer(4)]), [item]);

  it("finds no problem when layer 1 uses an item, or when the topic has none to offer", () => {
    expect(firstLayerProblem(withItem("item-1"), [item])).toBeNull();
    expect(firstLayerProblem(parseIdeas(ideas([1, 2, 3, 4].map((n) => rawLayer(n))), []), [])).toBeNull();
  });

  it("names the problem and the ids offered when layer 1 has none, and leaves layers 2-4 free", () => {
    expect(firstLayerProblem(withItem(""), [item])).toContain("Layer 1 must use one of them (item-1); layers 2-4 may leave it empty.");
    // An id that wasn't offered is dropped, so it counts as missing.
    expect(firstLayerProblem(withItem("made-up"), [item])).not.toBeNull();
  });

  it("asks again once, with the problem named, and keeps the second chain", async () => {
    const complete = vi
      .fn()
      .mockResolvedValueOnce(ideas([1, 2, 3, 4].map((n) => rawLayer(n))))
      .mockResolvedValueOnce(ideas([rawLayer(1, { content_item_id: "item-1" }), rawLayer(2), rawLayer(3), rawLayer(4)]));
    const chain = await writeIdeaChain(plan, "look", 3, [], { complete, system: "SYSTEM" });
    expect(complete).toHaveBeenCalledTimes(2);
    const again = (complete.mock.calls[1] as [{ prompt: string; label: string }])[0];
    expect(again.prompt).toContain("Your last try had this problem");
    expect(again.prompt).toContain("Layer 1 must use one of them (item-1)");
    expect(again.label).toBe("ideas-day3-look-again");
    expect(chain).toMatchObject({ asked: 2 });
    expect(chain.layers[0].content_item_id).toBe("item-1");
  });

  it("keeps the chain when the second try still has no item, and asks no third time", async () => {
    const complete = vi.fn(async () => ideas([1, 2, 3, 4].map((n) => rawLayer(n))) as never);
    const chain = await writeIdeaChain(plan, "look", 3, [], { complete, system: "SYSTEM" });
    expect(complete).toHaveBeenCalledTimes(2);
    expect(chain.asked).toBe(2);
    expect(chain.layers[0].content_item_id).toBeNull();
  });

  it("doesn't ask again for a text-only topic or for layers 2-4 without items", async () => {
    const none = vi.fn(async () => ideas([1, 2, 3, 4].map((n) => rawLayer(n))) as never);
    expect((await writeIdeaChain(plan, "wonder", 1, [], { complete: none, system: "S" })).asked).toBe(1);
    const firstOnly = vi.fn(async () => ideas([rawLayer(1, { content_item_id: "item-1" }), rawLayer(2), rawLayer(3), rawLayer(4)]) as never);
    expect((await writeIdeaChain(plan, "look", 3, [], { complete: firstOnly, system: "S" })).asked).toBe(1);
    expect(none).toHaveBeenCalledTimes(1);
    expect(firstOnly).toHaveBeenCalledTimes(1);
  });
});

// --- Cards ---

const ctx = (over: Partial<CardContext> = {}): CardContext => ({
  child: kid,
  chain: chainFor(3, "look"),
  lens: "build",
  door: null,
  statement: "We want the kids to love history and to be kind.",
  learns: null,
  perspective: null,
  valuesPoints: [],
  ...over,
});

describe("cardPrompt", () => {
  it("carries the child's nickname, age and reading level, the lens and its question, and the family's words", () => {
    const p = cardPrompt(ctx({ door: "sharks" }));
    expect(p).toContain("Child: Pip, age 7. Reading level: reads alone.");
    expect(p).toContain("Lens: build. Its question: How was it made? What would you make?");
    expect(p).toContain("the child is into sharks");
    expect(p).toContain("Don't use these as a way in: dolls.");
    expect(p).toContain("The family's own words: We want the kids to love history and to be kind.");
    expect(p).toContain('With it: image "Nakht\'s chapel"');
    expect(p).toContain("Accept: silt; mud.");
  });

  it("holds nothing else about the child (rule 7): no sex, birth month, other interests or sensitive notes", () => {
    const child = { ...kid, sex: "boy", birth_month: "2019-06-01", careful_about: "Grandpa died in May", hidden_strength: "patient", school: "Kailua Elementary" };
    const p = cardPrompt(ctx({ child: child as CardChild }));
    expect(p).not.toMatch(/\bboy\b|2019|Grandpa|patient|Kailua|trucks|sharks/);
  });

  it("says how the family wants its children to learn to act, in the rulebook's own words", () => {
    expect(cardPrompt(ctx({ learns: "exemplars" }))).toContain(
      "How the family wants its children to learn to act: The family wants the children to learn how to act mainly by copying people who acted well. Lean on stories of real people worth copying, and say what they did.",
    );
    expect(cardPrompt(ctx())).toContain(`How the family wants its children to learn to act: ${learnsSentence(null)}`);
    // The same sentence the rulebook carries under "Stories and examples".
    const doc = renderPolicy(mergeFamily([], [], [], {}), { points: [], children: [], handoff: () => null, packName: () => null });
    expect(doc).toContain(learnsSentence(null));
  });

  it("pairs science with who it helps, and carries the perspective and values points", () => {
    const p = cardPrompt(ctx({ chain: chainFor(1, "wonder"), perspective: "several_fairly", valuesPoints: [{ number: 12, name: "What happens after we die" }] }));
    expect(p).toContain("Pair how it works with who it helps.");
    expect(p).toContain("Perspective: several_fairly. Values points touched: 12 (What happens after we die).");
    expect(p).toContain("No picture or recording with this one.");
  });

  it("asks the first handoff to send the child to a parent when the topic has a parent's part", () => {
    const chain = chainFor(1, "listen");
    const p = cardPrompt(ctx({ chain: { ...chain, topic: { ...chain.topic, parentNote: "Play the first movement for him." } } }));
    expect(p).toContain("A parent does this with the child: Play the first movement for him. Let the first card's handoff ask the child to get a parent for it. Never name an app, a website or a link.");
    expect(cardPrompt(ctx())).not.toContain("A parent does this");
  });
});

describe("the hint check", () => {
  const key = { accept: ["silt", "the monsoon rain", "156"], rubric: "" };

  it("catches a hint that holds an accepted answer, in any order or plural", () => {
    expect(givesAway("Is it silt?", key)).toBe(true);
    expect(givesAway("Think about the rains of the monsoon.", key)).toBe(true);
    expect(givesAway("Add 12 + 48 + 96 = 156.", key)).toBe(true);
    expect(givesAway("What was left on the fields?", key)).toBe(false);
    expect(givesAway("Where does the rain fall first?", key)).toBe(false); // "rain" alone isn't "monsoon rain"
  });

  it("judges the hints from the first real run (14 Oct 2026) fairly", () => {
    const north = { accept: ["north", "northward", "to the north", "up the map", "toward the Mediterranean"], rubric: "" };
    const zero = { accept: ["none", "0", "zero", "no coils"], rubric: "" };
    // Held back wrongly: "up the map" was cut to "map", and "no coils" to "coil".
    expect(givesAway("Find Egypt on a map or a globe. Which edge of Egypt touches the Mediterranean Sea?", north)).toBe(false);
    expect(givesAway("Look at the signs we used for 2026 on the last card. Is a coil of rope one of them?", zero)).toBe(false);
    // Second real run: "tens" was read as "ten".
    expect(givesAway("Split 2026 into thousands, hundreds, tens and ones. Which sign goes with each part?", { accept: ["10", "ten", "ten signs"], rubric: "" })).toBe(false);
    expect(givesAway("Think about the rains of the monsoon.", { accept: ["monsoon rain"], rubric: "" })).toBe(true);
    // Held back rightly: the answer is in the list, or said outright.
    expect(givesAway("Which of the four compass words, north, south, east or west, names the way the river is heading?", north)).toBe(true);
    expect(givesAway("Picture a map with the top as the way up. Where is that sea compared with the rest of Egypt?", north)).toBe(true);
  });

  it("counts a repeated word as often as the answer uses it (17 Oct 2026)", () => {
    const dice = { accept: ["one and one", "1 and 1"], rubric: "" };
    // Held back wrongly: one "one" is a pronoun here, not the sum.
    expect(givesAway("Does each one count?", dice)).toBe(false);
    // Still caught: the answer said outright, in words or digits. This must keep passing.
    expect(givesAway("Try one and one more.", dice)).toBe(true);
    expect(givesAway("What is 1 plus 1?", dice)).toBe(true);
    expect(givesAway("One die shows one dot on top.", dice)).toBe(true);
  });

  it("flags a card whose last hint gives the answer, and the other rules", () => {
    const list = goodList();
    list[1] = { ...list[1], hints: ["Where did the water go?", "It's silt, isn't it?"] };
    list[2] = { ...list[2], hints: ["Only one hint."], text: "You're so smart!" };
    list[3] = { ...list[3], handoff: " ", text: "See www.example.org" };
    const check = checkCards(asRaw(list), chainFor(3, "look"), "reads_alone");
    expect(check.cards[0]).toEqual([]);
    expect(check.cards[1]).toEqual(['hint 2 (the last) gives the answer away: "It\'s silt, isn\'t it?"']);
    expect(check.cards[2]).toEqual(expect.arrayContaining(["needs two or three hints, has 1", 'uses a brilliance word ("smart"); use effort words']));
    expect(check.cards[3]).toEqual(expect.arrayContaining(["no handoff", "contains a link"]));
  });

  it("wants a picture described, and the whole card read aloud for a child who is read to", () => {
    const list = goodList();
    list[0] = { ...list[0], image_alt: "" };
    expect(checkCards(asRaw(list), chainFor(3, "look"), "reads_alone").cards[0]).toEqual(["the idea has a picture but image_alt is empty"]);
    expect(checkCards(goodCards(), chainFor(3, "look"), "read_to").cards[0]).toEqual(["the child is read to, so read_aloud must carry the whole card"]);
    expect(checkCards(asRaw([goodCard(1)]), chainFor(3, "look"), "reads_alone").whole).toBe("expected 4 cards, got 1: cards 2, 3, 4 missing");
  });
});

describe("writeCards", () => {
  it("asks the writing model once when the cards pass", async () => {
    const complete = vi.fn(async () => goodCards() as never);
    const out = await writeCards(ctx(), { complete, system: "MANNER FIRST" });
    expect(out.asked).toBe(1);
    expect(out.problems.every((p) => p.length === 0)).toBe(true);
    expect((complete.mock.calls[0] as unknown as [{ use: string; system: string }])[0]).toMatchObject({ use: "write", system: "MANNER FIRST" });
  });

  it("asks again once, naming the problem, when a hint gives the answer away", async () => {
    const list = goodList();
    list[0] = { ...list[0], hints: ["Hmm?", "It's mud."] };
    const complete = vi.fn().mockResolvedValueOnce(asRaw(list)).mockResolvedValueOnce(goodCards());
    const out = await writeCards(ctx(), { complete, system: "s" });
    expect(complete).toHaveBeenCalledTimes(2);
    expect(complete.mock.calls[1][0].prompt).toContain('card 1: hint 2 (the last) gives the answer away: "It\'s mud."');
    expect(out).toMatchObject({ asked: 2 });
    expect(out.problems[0]).toEqual([]);
  });

  it("returns what's still wrong after the second try, and never asks a third time", async () => {
    const list = goodList();
    list[2] = { ...list[2], hints: ["Hmm?", "It's mud."] };
    const complete = vi.fn(async () => asRaw(list) as never);
    const out = await writeCards(ctx(), { complete, system: "s" });
    expect(complete).toHaveBeenCalledTimes(2);
    expect(out.problems[2]).toHaveLength(1);
  });
});

describe("planDoors", () => {
  const slots = Array.from({ length: 35 }, (_, i) => `${Math.floor(i / 5) + 1}:${["look", "wonder", "listen", "then", "puzzle"][i % 5]}`);

  it("opens at most a quarter of the week's layer-1 cards with an interest, spread out and in turn", () => {
    const doors = planDoors(["sharks", "trucks", "space"], slots);
    expect(doors.size).toBe(8);
    expect([...doors.values()].slice(0, 4)).toEqual(["sharks", "trucks", "space", "sharks"]);
    const days = new Set([...doors.keys()].map((k) => k.split(":")[0]));
    expect(days.size).toBeGreaterThanOrEqual(6);
  });

  it("opens none when the child has no interests or the week is tiny", () => {
    expect(planDoors([], slots).size).toBe(0);
    expect(planDoors(["sharks"], slots.slice(0, 3)).size).toBe(0);
  });
});

// --- The week ---

function fakeDb(existingTheme: { id: string } | null = null) {
  const db = { themes: existingTheme ? [{ ...existingTheme, status: "review" }] : ([] as { id: string; status: string }[]), ideas: [] as { id: string; chain: IdeaChain; layer: number }[], cards: [] as (CardRow & { id: string })[], questions: [] as unknown[] };
  let n = 0;
  const deps: WeekDeps = {
    findTheme: async () => (db.themes[0] ? { id: db.themes[0].id } : null),
    createTheme: async () => {
      db.themes.push({ id: "theme-1", status: "generating" });
      return "theme-1";
    },
    setStatus: async (_id, status) => void (db.themes[0].status = status),
    deleteIdeas: async () => {
      db.ideas = [];
      db.cards = [];
      db.questions = [];
    },
    deleteDay: async (_t, day) => {
      const gone = new Set(db.ideas.filter((i) => i.chain.day === day).map((i) => i.id));
      db.ideas = db.ideas.filter((i) => !gone.has(i.id));
      db.cards = db.cards.filter((c) => !gone.has(c.idea_id));
      db.questions = (db.questions as QuestionRow[]).filter((q) => !gone.has(q.idea_id));
    },
    deleteCards: async (_t, childId) => void (db.cards = db.cards.filter((c) => c.child_id !== childId)),
    loadIdeas: async () => {
      const chains = new Map<string, IdeaChain>();
      for (const i of db.ideas) chains.set(`${i.chain.day}:${i.chain.slot}`, i.chain);
      return [...chains.values()];
    },
    saveIdeas: async (_t, chain) =>
      chain.layers.map((l) => {
        const id = `idea-${++n}`;
        db.ideas.push({ id, chain, layer: l.layer });
        return id;
      }),
    saveCard: async (row) => {
      const id = `card-${++n}`;
      db.cards.push({ ...row, id });
      return id;
    },
    saveQuestion: async (row) => void db.questions.push(row),
    writeIdeaChain: vi.fn(async (slot, day) => chainFor(day, slot)),
    writeCards: vi.fn(async () => ({ cards: goodList(), asked: 1, problems: [[], [], [], []] })),
  };
  return { db, deps };
}

const boys: WeekChild[] = [
  { ...kid, id: "c1", nickname: "Pip", sex: "boy", history: {} },
  { ...kid, id: "c2", nickname: "Ash", age: 9, reading: "chapter_books", interests: ["Lego"], sex: "boy", history: { story: 5 } },
];
const options = { plan, weekStart: "2026-10-19", days: 7, children: boys, statement: "Kind and curious.", learns: null, pointNames: new Map<number, string>(), rebuild: false };

describe("buildWeek", () => {
  it("makes the theme, 35 shared idea chains, and four cards and a question per chain per child", async () => {
    const { db, deps } = fakeDb();
    const report = await buildWeek(options, deps);
    expect(db.themes[0].status).toBe("review");
    expect(report.ideas).toBe(140);
    expect(deps.writeIdeaChain).toHaveBeenCalledTimes(35);
    expect(deps.writeCards).toHaveBeenCalledTimes(70);
    expect(db.cards).toHaveLength(280);
    expect(db.questions).toHaveLength(280);
    expect(report.children.map((c) => c.cards)).toEqual([140, 140]);
    expect(report.textOnly).toHaveLength(34); // only the art topic, on day 3, has an approved item
  });

  it("dates, chains and labels the cards, with the door on layer 1 only", async () => {
    const { db, deps } = fakeDb();
    await buildWeek(options, deps);
    const rex = db.cards.filter((c) => c.child_id === "c1");
    const day3look = rex.filter((c) => c.day === "2026-10-21" && c.slot === "look").sort((a, b) => a.layer - b.layer);
    expect(day3look.map((c) => c.layer)).toEqual([1, 2, 3, 4]);
    expect(day3look[0].parent_card_id).toBeNull();
    expect(day3look[1].parent_card_id).toBe(day3look[0].id);
    expect(new Set(day3look.map((c) => c.lens)).size).toBe(1);
    expect(rex.every((c) => c.policy === "pending" && c.level === "reads_alone, age 7")).toBe(true);
    expect(rex.filter((c) => c.door).every((c) => c.layer === 1)).toBe(true);
    expect(rex.filter((c) => c.door).length).toBeLessThanOrEqual(35 / 4);
    expect(new Set(rex.map((c) => c.lens)).size).toBeGreaterThanOrEqual(4);
  });

  it("opens each child's week with that child's own lens", async () => {
    const { db, deps } = fakeDb();
    await buildWeek({ ...options, plan: { ...plan, week: 2 } }, deps);
    const opener = (child: string) => db.cards.find((c) => c.child_id === child && c.day === "2026-10-19" && c.slot === "look" && c.layer === 1)!.lens;
    expect(opener("c1")).toBe("explore"); // no history yet
    expect(opener("c2")).toBe("story");
  });

  it("refuses to build a week twice", async () => {
    const { db, deps } = fakeDb({ id: "theme-9" });
    await expect(buildWeek(options, deps)).rejects.toThrow(/already built \(theme theme-9\).*--rebuild/);
    expect(deps.writeIdeaChain).not.toHaveBeenCalled();
    expect(db.themes[0].status).toBe("review");
  });

  it("with --rebuild, deletes the week's ideas, cards and questions and writes them again", async () => {
    const { db, deps } = fakeDb();
    await buildWeek(options, deps);
    const first = db.cards.map((c) => c.id);
    await buildWeek({ ...options, rebuild: true }, deps);
    expect(db.cards).toHaveLength(280);
    expect(db.ideas).toHaveLength(140);
    expect(db.cards.some((c) => first.includes(c.id))).toBe(false);
    expect(db.themes).toHaveLength(1);
  });

  it("with --rebuild --child, rewrites only that child's cards and keeps the shared ideas", async () => {
    const { db, deps } = fakeDb();
    await buildWeek(options, deps);
    const ash = db.cards.filter((c) => c.child_id === "c2").map((c) => c.id);
    vi.mocked(deps.writeIdeaChain).mockClear();
    await buildWeek({ ...options, rebuild: true, onlyChild: "c1" }, deps);
    expect(deps.writeIdeaChain).not.toHaveBeenCalled();
    expect(db.cards.filter((c) => c.child_id === "c2").map((c) => c.id)).toEqual(ash);
    expect(db.cards.filter((c) => c.child_id === "c1")).toHaveLength(140);
  });

  it("holds back a card that still fails the checks, as blocked with the reason", async () => {
    const { db, deps } = fakeDb();
    vi.mocked(deps.writeCards).mockResolvedValue({ cards: goodList(), asked: 2, problems: [[], ["hint 2 (the last) gives the answer away"], [], []] });
    const report = await buildWeek({ ...options, days: 1, children: [boys[0]] }, deps);
    const blocked = db.cards.filter((c) => c.policy === "blocked");
    expect(blocked).toHaveLength(5);
    expect(blocked.every((c) => c.layer === 2 && c.policy_notes?.validation[0].includes("gives the answer away"))).toBe(true);
    expect(report.children[0]).toMatchObject({ reasked: 5, cards: 20 });
    expect(report.children[0].heldBack).toHaveLength(5);
  });

  it("lists the first cards still without a picture and counts the chains sent back", async () => {
    const { deps } = fakeDb();
    vi.mocked(deps.writeIdeaChain).mockImplementation(async (slot, day) => {
      const chain = chainFor(day, slot);
      if (slot !== "look" || day !== 3) return chain;
      return { ...chain, asked: 2, layers: chain.layers.map((l) => (l.layer === 1 ? { ...l, content_item_id: null } : l)) };
    });
    const report = await buildWeek({ ...options, days: 3, children: [boys[0]] }, deps);
    expect(report.firstWithoutPicture).toEqual(["day 3 look (art topic)"]);
    expect(report.ideasReasked).toBe(1);
  });

  it("gives each card its own topic's perspective and values points, not the week's", async () => {
    const { deps } = fakeDb();
    const marked = lesson("puzzle", 1, { perspective: "family_tradition", valuesPoints: [24] });
    const mixed = { ...plan, topics: plan.topics.map((t) => (t.id === marked.id ? marked : t)) };
    vi.mocked(deps.writeIdeaChain).mockImplementation(async (slot, day) => {
      const t = topicForDay(mixed, slot, day);
      return { day, slot, topic: t, layers: parseIdeas(ideas([1, 2, 3, 4].map((n) => rawLayer(n))), []) };
    });
    await buildWeek({ ...options, plan: mixed, days: 1, children: [boys[0]], pointNames: new Map([[24, "Money, work and generosity"]]) }, deps);
    const calls = vi.mocked(deps.writeCards).mock.calls.map(([c]) => c);
    expect(calls.find((c) => c.chain.slot === "puzzle")).toMatchObject({ perspective: "family_tradition", valuesPoints: [{ number: 24, name: "Money, work and generosity" }] });
    expect(calls.find((c) => c.chain.slot === "look")).toMatchObject({ perspective: null, valuesPoints: [] });
  });

  it("builds fewer days when asked", async () => {
    const { db, deps } = fakeDb();
    await buildWeek({ ...options, days: 2 }, deps);
    expect(deps.writeIdeaChain).toHaveBeenCalledTimes(10);
    expect(new Set(db.cards.map((c) => c.day))).toEqual(new Set(["2026-10-19", "2026-10-20"]));
  });
});

// The Sunday build (docs/looks-good-slice.md): a day a firing, into the week's theme.
describe("buildWeek, a day at a time", () => {
  const dayOptions = (day: number, over: Partial<typeof options & { onlyChild: string }> = {}) => ({ ...options, day, ...over });
  const cardKey = (c: CardRow) => `${c.child_id}|${c.day}|${c.slot}|${c.layer}`;
  const lensAndDoor = (cards: CardRow[]) => Object.fromEntries(cards.map((c) => [cardKey(c), [c.lens, c.door, c.level]]));

  it("gives a week built a day at a time, in any order, the lenses and doors of one built whole", async () => {
    const whole = fakeDb();
    await buildWeek(options, whole.deps);

    const parts = fakeDb();
    const deleteIdeas = vi.spyOn(parts.deps, "deleteIdeas");
    const statuses: string[] = [];
    for (const day of [1, 2, 4, 3, 5, 6, 7]) {
      await buildWeek(dayOptions(day), parts.deps);
      statuses.push(parts.db.themes[0].status);
    }
    // Both children: one with no history, one who has chosen story before.
    expect(lensAndDoor(parts.db.cards)).toEqual(lensAndDoor(whole.db.cards));
    expect(Object.values(lensAndDoor(parts.db.cards)).some(([, door]) => door)).toBe(true);
    expect(parts.db.cards).toHaveLength(280);
    expect(parts.db.ideas).toHaveLength(140);
    expect(parts.db.questions).toHaveLength(280);
    expect(parts.deps.writeIdeaChain).toHaveBeenCalledTimes(35);
    expect(parts.deps.writeCards).toHaveBeenCalledTimes(70);
    expect(deleteIdeas).not.toHaveBeenCalled();
    expect(statuses).toEqual(["generating", "generating", "generating", "generating", "generating", "generating", "review"]);
  });

  it("builds only that day: five idea chains and every child's cards for it", async () => {
    const { db, deps } = fakeDb();
    const report = await buildWeek(dayOptions(1), deps);
    expect(deps.writeIdeaChain).toHaveBeenCalledTimes(5);
    expect(deps.writeCards).toHaveBeenCalledTimes(10);
    expect(db.cards).toHaveLength(40);
    expect(new Set(db.cards.map((c) => c.day))).toEqual(new Set(["2026-10-19"]));
    expect(report.ideas).toBe(20);
    expect(report.children.map((c) => c.cards)).toEqual([20, 20]);
    expect(db.themes).toEqual([{ id: "theme-1", status: "generating" }]);
  });

  it("writes each day's ideas on from that slot's earlier days only", async () => {
    const { deps } = fakeDb();
    const seen = new Map<string, number[]>();
    vi.mocked(deps.writeIdeaChain).mockImplementation(async (slot, day, earlier) => {
      seen.set(`${slot}:${day}`, earlier.map((c) => c.day).sort());
      expect(earlier.every((c) => c.slot === slot)).toBe(true);
      return chainFor(day, slot);
    });
    for (const day of [1, 2, 4, 3, 5]) await buildWeek(dayOptions(day), deps);
    expect(seen.get("look:1")).toEqual([]);
    expect(seen.get("look:2")).toEqual([1]);
    expect(seen.get("look:4")).toEqual([1, 2]);
    expect(seen.get("look:3")).toEqual([1, 2]); // day 4 is built by then, but it is not earlier
    expect(seen.get("wonder:5")).toEqual([1, 2, 3, 4]);
  });

  it("refuses a day that is already built, or half built, and writes nothing", async () => {
    const { db, deps } = fakeDb();
    await buildWeek(dayOptions(1), deps);
    await buildWeek(dayOptions(2), deps);
    const counts = () => [db.ideas.length, db.cards.length, db.questions.length];
    vi.mocked(deps.writeIdeaChain).mockClear();

    const built = counts();
    await expect(buildWeek(dayOptions(2), deps)).rejects.toThrow(/Day 2 of week 1 is already built, or half built.*--rebuild/);
    db.cards = db.cards.filter((c) => c.day !== "2026-10-20"); // a firing that stopped after the ideas
    const half = counts();
    await expect(buildWeek(dayOptions(2), deps)).rejects.toThrow(/already built, or half built/);
    expect(counts()).toEqual(half);
    expect(built[0]).toBe(half[0]);
    expect(deps.writeIdeaChain).not.toHaveBeenCalled();
  });

  it("with rebuild, clears that one day and builds it again, leaving the other days alone", async () => {
    const { db, deps } = fakeDb();
    for (const day of [1, 2, 3]) await buildWeek(dayOptions(day), deps);
    const others = db.cards.filter((c) => c.day !== "2026-10-20").map((c) => c.id);
    const second = db.cards.filter((c) => c.day === "2026-10-20").map((c) => c.id);
    await buildWeek(dayOptions(2, { rebuild: true }), deps);
    expect(db.ideas).toHaveLength(60);
    expect(db.cards).toHaveLength(120);
    expect(db.questions).toHaveLength(120);
    expect(db.cards.filter((c) => c.day !== "2026-10-20").map((c) => c.id)).toEqual(others);
    expect(db.cards.some((c) => second.includes(c.id))).toBe(false);
    expect(db.themes).toHaveLength(1);
  });

  it("takes a finished week out of review while one day is rebuilt, and puts it back", async () => {
    const { db, deps } = fakeDb();
    for (let day = 1; day <= 7; day++) await buildWeek(dayOptions(day), deps);
    expect(db.themes[0].status).toBe("review");
    const setStatus = vi.spyOn(deps, "setStatus");
    await buildWeek(dayOptions(4, { rebuild: true }), deps);
    expect(setStatus.mock.calls.map(([, s]) => s)).toEqual(["generating", "review"]);
    expect(db.cards).toHaveLength(280);
  });

  it("puts a week that was in review back to generating while it gains a day", async () => {
    const { db, deps } = fakeDb();
    await buildWeek({ ...options, days: 1 }, deps); // a one-day trial, left in review
    expect(db.themes[0].status).toBe("review");
    await buildWeek(dayOptions(2), deps);
    expect(db.themes[0].status).toBe("generating");
    expect(db.cards).toHaveLength(40 + 40);
  });

  it("goes on into a theme that day 1 made and then stopped short of any ideas", async () => {
    const { db, deps } = fakeDb({ id: "theme-9" });
    db.themes[0].status = "generating";
    vi.spyOn(deps, "createTheme");
    await buildWeek(dayOptions(1), deps);
    expect(deps.createTheme).not.toHaveBeenCalled();
    expect(db.themes).toHaveLength(1);
    expect(db.cards).toHaveLength(40);
  });

  it("needs day 1 first, a day of the week, and every child", async () => {
    const { deps } = fakeDb();
    await expect(buildWeek(dayOptions(3), deps)).rejects.toThrow(/no theme yet: build day 1 first/);
    await expect(buildWeek(dayOptions(8), deps)).rejects.toThrow(/outside this week's 7 days/);
    await expect(buildWeek(dayOptions(1, { onlyChild: "c1" }), deps)).rejects.toThrow(/every child/);
    expect(deps.writeIdeaChain).not.toHaveBeenCalled();
  });
});

describe("addDays", () => {
  it("counts in calendar days", () => {
    expect(addDays("2026-10-19", 6)).toBe("2026-10-25");
    expect(addDays("2026-12-29", 4)).toBe("2027-01-02");
  });
});

describe("todayIn and nextMonday", () => {
  it("reads the date where the family lives: Monday 04:00 UTC is still Sunday evening in Hawaii", () => {
    expect(todayIn("Pacific/Honolulu", new Date("2026-10-26T04:00:00Z"))).toBe("2026-10-25");
    expect(todayIn("Pacific/Honolulu", new Date("2026-10-25T16:00:00Z"))).toBe("2026-10-25");
    expect(todayIn("UTC", new Date("2026-10-26T04:00:00Z"))).toBe("2026-10-26");
  });

  it("is the Monday after a date, and a Monday asks for the Monday a week on", () => {
    expect(nextMonday("2026-10-20")).toBe("2026-10-26"); // Tuesday
    expect(nextMonday("2026-10-25")).toBe("2026-10-26"); // Sunday
    expect(nextMonday("2026-10-26")).toBe("2026-11-02"); // Monday
    expect(nextMonday("2026-12-30")).toBe("2027-01-04"); // across the new year
  });
});

describe("stray braces", () => {
  it("cleans them off the ends before checking, and re-asks when one is left inside", async () => {
    const list = goodList();
    list[0] = { ...list[0], handoff: "Ask Dad where the Nile begins.}" };
    list[1] = { ...list[1], text: "The river {rose} every summer." };
    const complete = vi.fn().mockResolvedValueOnce(asRaw(list)).mockResolvedValueOnce(goodCards());
    const out = await writeCards(ctx(), { complete, system: "s" });
    expect(complete).toHaveBeenCalledTimes(2);
    expect(complete.mock.calls[1][0].prompt).toContain("card 2: has a stray { or } in its words");
    expect(complete.mock.calls[1][0].prompt).not.toContain("card 1:");
    expect(out.cards[0].handoff).toBe("Ask Dad what the farmers planted.");
  });
});
