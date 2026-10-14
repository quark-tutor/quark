import { describe, expect, it, vi } from "vitest";
import { CARD_SCHEMA, cardPrompt, checkCards, givesAway, planDoors, writeCards, type CardBody, type CardChild, type CardContext, type RawCards } from "./cards";
import { IDEA_SCHEMA, ideasPrompt, parseIdeas, sourceRefs, topicForDay, writeIdeaChain, type RawIdeas, type RawLayer } from "./ideas";
import type { IdeaChain, WeekPlan, WeekTopic } from "./types";
import { addDays, buildWeek, type CardRow, type WeekChild, type WeekDeps } from "./week";

// --- A small week to work with ---

const item = { id: "item-1", type: "image", title: "Nakht's chapel", creator: "Norman de Garis Davies", attribution: "Davies. The Met.", description: "Facsimile" };

function topic(subject: string, slot: WeekTopic["slot"], over: Partial<WeekTopic> = {}): WeekTopic {
  return {
    id: `t-${subject}`,
    keys: [`egypt/w1/${subject}/2-3`, `egypt/w1/${subject}/4-5`],
    subject,
    slot,
    title: `${subject} topic`,
    younger: `Younger ${subject} summary.`,
    older: `Older ${subject} summary.`,
    items: [],
    ...over,
  };
}

const plan: WeekPlan = {
  stretch: "egypt",
  week: 1,
  title: "The river",
  why: "Everything starts with the Nile.",
  perspective: null,
  valuesPoints: [],
  topicIds: [],
  topics: [
    topic("geography", "then"),
    topic("science", "wonder"),
    topic("art", "look", { items: [item] }),
    topic("music", "listen"),
    topic("literature", "then"),
    topic("math", "puzzle"),
  ],
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

const kid: CardChild = { id: "c1", nickname: "Rex", age: 7, reading: "reads_alone", interests: ["sharks", "trucks"], boredBy: ["dolls"] };

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
  it("takes a slot's topics in turn, so each is met more than once", () => {
    const then = [1, 2, 3, 4, 5, 6, 7].map((d) => topicForDay(plan, "then", d).subject);
    expect(then).toEqual(["geography", "literature", "geography", "literature", "geography", "literature", "geography"]);
    expect(topicForDay(plan, "look", 5).subject).toBe("art");
  });

  it("builds the prompt from the plan and the earlier days, and nothing about any child", () => {
    const earlier = [chainFor(1, "look")];
    const prompt = ideasPrompt(plan, "look", 2, earlier);
    expect(prompt).toContain("Day 2 of the week, the look card. Subject: art.");
    expect(prompt).toContain("Grade 2-3 summary: Younger art summary.");
    expect(prompt).toContain("Grade 4-5 summary: Older art summary.");
    expect(prompt).toContain('- id item-1: image, "Nakht\'s chapel", Norman de Garis Davies.');
    expect(prompt).toContain("layer 1 must be new");
    expect(prompt).toContain("Day 1: 1. Idea 1");
    expect(prompt).not.toMatch(/Rex|sharks|\bboy\b|\bgirl\b/);
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
    const chain = chainFor(1, "look");
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

// --- Cards ---

const ctx = (over: Partial<CardContext> = {}): CardContext => ({
  child: kid,
  chain: chainFor(1, "look"),
  lens: "build",
  door: null,
  statement: "We want the kids to love history and to be kind.",
  perspective: null,
  valuesPoints: [],
  ...over,
});

describe("cardPrompt", () => {
  it("carries the child's nickname, age and reading level, the lens and its question, and the family's words", () => {
    const p = cardPrompt(ctx({ door: "sharks" }));
    expect(p).toContain("Child: Rex, age 7. Reading level: reads alone.");
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

  it("pairs science with who it helps, and carries the perspective and values points", () => {
    const p = cardPrompt(ctx({ chain: chainFor(1, "wonder"), perspective: "several_fairly", valuesPoints: [{ number: 12, name: "What happens after we die" }] }));
    expect(p).toContain("Pair how it works with who it helps.");
    expect(p).toContain("Perspective: several_fairly. Values points touched: 12 (What happens after we die).");
    expect(p).toContain("No picture or recording with this one.");
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

  it("flags a card whose last hint gives the answer, and the other rules", () => {
    const list = goodList();
    list[1] = { ...list[1], hints: ["Where did the water go?", "It's silt, isn't it?"] };
    list[2] = { ...list[2], hints: ["Only one hint."], text: "You're so smart!" };
    list[3] = { ...list[3], handoff: " ", text: "See www.example.org" };
    const check = checkCards(asRaw(list), chainFor(1, "look"), "reads_alone");
    expect(check.cards[0]).toEqual([]);
    expect(check.cards[1]).toEqual(['hint 2 (the last) gives the answer away: "It\'s silt, isn\'t it?"']);
    expect(check.cards[2]).toEqual(expect.arrayContaining(["needs two or three hints, has 1", 'uses a brilliance word ("smart"); use effort words']));
    expect(check.cards[3]).toEqual(expect.arrayContaining(["no handoff", "contains a link"]));
  });

  it("wants a picture described, and the whole card read aloud for a child who is read to", () => {
    const list = goodList();
    list[0] = { ...list[0], image_alt: "" };
    expect(checkCards(asRaw(list), chainFor(1, "look"), "reads_alone").cards[0]).toEqual(["the idea has a picture but image_alt is empty"]);
    expect(checkCards(goodCards(), chainFor(1, "look"), "read_to").cards[0]).toEqual(["the child is read to, so read_aloud must carry the whole card"]);
    expect(checkCards(asRaw([goodCard(1)]), chainFor(1, "look"), "reads_alone").whole).toBe("expected 4 cards, got 1: cards 2, 3, 4 missing");
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
  { ...kid, id: "c1", nickname: "Rex", sex: "boy", history: {} },
  { ...kid, id: "c2", nickname: "Ash", age: 9, reading: "chapter_books", interests: ["Lego"], sex: "boy", history: { story: 5 } },
];
const options = { plan, weekStart: "2026-10-19", days: 7, children: boys, statement: "Kind and curious.", pointNames: new Map<number, string>(), rebuild: false };

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
    expect(report.textOnly).toHaveLength(28); // only the look topic has an approved item
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

  it("builds fewer days when asked", async () => {
    const { db, deps } = fakeDb();
    await buildWeek({ ...options, days: 2 }, deps);
    expect(deps.writeIdeaChain).toHaveBeenCalledTimes(10);
    expect(new Set(db.cards.map((c) => c.day))).toEqual(new Set(["2026-10-19", "2026-10-20"]));
  });
});

describe("addDays", () => {
  it("counts in calendar days", () => {
    expect(addDays("2026-10-19", 6)).toBe("2026-10-25");
    expect(addDays("2026-12-29", 4)).toBe("2027-01-02");
  });
});
