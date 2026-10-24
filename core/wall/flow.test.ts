import { afterEach, describe, expect, it, vi } from "vitest";
import { answer, cardFor, wallFor, type AttemptInsert, type CardRow, type Scope, type SessionRow, type WallStore } from "./flow.ts";

// Decision 4's checks (docs/wonder-wall-1-slice.md). The fake store returns every card it holds, whatever is
// asked, as if the query filtered nothing, so each check proves the code's own rule.

const FAMILY = "family-1";
const PIP = "child-pip";
const WREN = "child-wren";
const scope: Scope = { familyId: FAMILY, childId: PIP, deviceId: "device-1" };
// 8 am in Hawaii on Monday 26 October 2026.
const MONDAY = new Date("2026-10-26T18:00:00Z");

type Opts = Partial<Omit<CardRow, "body" | "question">> & { accept?: string[]; hints?: number };

function card(id: string, o: Opts = {}): CardRow {
  const layer = o.layer ?? 1;
  return {
    id,
    family_id: o.family_id ?? FAMILY,
    child_id: o.child_id ?? PIP,
    day: o.day ?? "2026-10-26",
    slot: o.slot ?? "then",
    layer,
    policy: o.policy ?? "passed",
    body: {
      title: `Title ${id}`,
      text: `Text ${id}`,
      image_alt: "",
      question: `Which way does it go, ${id}?`,
      hints: Array.from({ length: o.hints ?? 2 }, (_, i) => `Hint ${id}.${i + 1}`),
      handoff: `Ask a parent about ${id}.`,
    },
    theme: o.theme === undefined ? { status: "live", family_id: FAMILY } : o.theme,
    itemId: o.itemId ?? null,
    item: o.item ?? null,
    question: { id: `q-${id}`, prompt: `Which way does it go, ${id}?`, answer_key: { accept: o.accept ?? (layer === 4 ? [] : [`answer${id}`]), rubric: `rubric ${id}` } },
  };
}

function fake(cards: CardRow[], timezone = "Pacific/Honolulu") {
  const attempts: (AttemptInsert & { created_at: string })[] = [];
  const sessions: (SessionRow & { device: string; child_id: string })[] = [];
  let clock = 0;
  const store: WallStore = {
    timezone: async () => timezone,
    cards: async () => cards,
    cardById: async ({ id }) => cards.find((c) => c.id === id) ?? null,
    attempts: async () => attempts.map(({ question_id, correct, created_at }) => ({ question_id, correct, created_at })),
    lastSession: async (childId) => sessions.filter((s) => s.child_id === childId).at(-1) ?? null,
    startSession: async (row) => {
      const id = `session-${sessions.length + 1}`;
      sessions.push({ id, started_at: row.started_at, ended_at: null, ended_reason: null, device: row.device, child_id: row.child_id });
      return id;
    },
    endSession: async (id, reason) => {
      sessions.find((s) => s.id === id)!.ended_reason = reason;
    },
    touchSession: async (id, at) => {
      sessions.find((s) => s.id === id)!.ended_at = at;
    },
    addAttempt: async (row) => {
      attempts.push({ ...row, created_at: new Date(Date.UTC(2026, 9, 26, 18, 0, clock++)).toISOString() });
    },
    sign: async (path) => `https://signed.example/${path}`,
  };
  return { store, attempts, sessions };
}

const ask = (store: WallStore, cardId: string, guess: string, now = MONDAY) => answer(store, scope, { cardId, guess, seconds: 12 }, now, "every");
const tiles = async (store: WallStore, now = MONDAY) => (await wallFor(store, scope, "Pip", now)).tiles.map((t) => t.cardId);

afterEach(() => vi.restoreAllMocks());

describe("the read path's rule", () => {
  it("never returns a pending or blocked card", async () => {
    const { store } = fake([card("a", { slot: "look" }), card("b", { slot: "wonder", policy: "pending" }), card("c", { slot: "listen", policy: "blocked" })]);
    expect(await tiles(store)).toEqual(["a"]);
    expect(await cardFor(store, scope, "b", MONDAY)).toBeNull();
    expect(await cardFor(store, scope, "c", MONDAY)).toBeNull();
  });

  it("never returns another child's card", async () => {
    const { store } = fake([card("a", { slot: "look", child_id: WREN })]);
    expect(await tiles(store)).toEqual([]);
    expect(await cardFor(store, scope, "a", MONDAY)).toBeNull();
  });

  it("never returns another family's card, or one in another family's theme", async () => {
    const { store } = fake([
      card("a", { slot: "look", family_id: "family-2", theme: { status: "live", family_id: "family-2" } }),
      card("b", { slot: "wonder", theme: { status: "live", family_id: "family-2" } }),
    ]);
    expect(await tiles(store)).toEqual([]);
  });

  it("never returns a card of a week in review, being built or done", async () => {
    const { store } = fake(
      (["review", "generating", "done", "planned"] as const).map((status, i) => card(`t${i}`, { slot: "look", theme: { status, family_id: FAMILY } })),
    );
    expect(await tiles(store)).toEqual([]);
  });

  it("shows today's cards only, today where the family lives", async () => {
    const { store } = fake([card("yesterday", { day: "2026-10-25" }), card("today", { day: "2026-10-26", slot: "look" }), card("tomorrow", { day: "2026-10-27", slot: "wonder" })]);
    expect(await tiles(store)).toEqual(["today"]);
    // 11:30 pm in Hawaii on Monday is 09:30 UTC on Tuesday, and still Monday on the wall.
    expect(await tiles(store, new Date("2026-10-27T09:30:00Z"))).toEqual(["today"]);
    expect(await tiles(store, new Date("2026-10-27T10:30:00Z"))).toEqual(["tomorrow"]);
  });

  it("hides a card whose picture or recording is no longer approved", async () => {
    const item = { type: "image", title: "A wave", creator: null, url: "https://x", license: "CC0", attribution: null, date: null, source: null, storagePath: "a.jpg" };
    const { store } = fake([
      card("rejected", { slot: "look", itemId: "item-1", item: { ...item, approved: false } }),
      card("unreadable", { slot: "wonder", itemId: "item-2", item: null }),
      card("fine", { slot: "listen", itemId: "item-3", item: { ...item, approved: true } }),
    ]);
    expect(await tiles(store)).toEqual(["fine"]);
    const shown = await cardFor(store, scope, "fine", MONDAY);
    expect(shown && "card" in shown && shown.card.media?.url).toBe("https://signed.example/a.jpg");
  });

  it("stops a child at layer 1 when layer 2 is held back, even when layer 3 passed", async () => {
    const { store } = fake([card("l1"), card("l2", { layer: 2, policy: "blocked" }), card("l3", { layer: 3 })]);
    expect(await ask(store, "l1", "answerl1")).toEqual({ outcome: "right", handoff: "Ask a parent about l1." });
    expect(await cardFor(store, scope, "l3", MONDAY)).toBeNull();
    expect(await ask(store, "l3", "answerl3")).toBeNull();
  });

  it("writes nothing for an answer to a card outside the rule", async () => {
    const { store, attempts, sessions } = fake([
      card("pending", { policy: "pending" }),
      card("wren", { slot: "look", child_id: WREN }),
      card("yesterday", { slot: "wonder", day: "2026-10-25" }),
      card("review", { slot: "listen", theme: { status: "review", family_id: FAMILY } }),
    ]);
    for (const id of ["pending", "wren", "yesterday", "review", "no-such-card"]) expect(await ask(store, id, "anything")).toBeNull();
    expect(attempts).toEqual([]);
    expect(sessions).toEqual([]);
  });
});

describe("answering", () => {
  it("gives hints one per wrong guess and never ahead, then the handoff", async () => {
    const { store } = fake([card("l1"), card("l2", { layer: 2 })]);
    const seen = async () => {
      const r = await cardFor(store, scope, "l1", MONDAY);
      return r && "card" in r ? r.card.hints : null;
    };
    expect(await seen()).toEqual([]);
    expect(await ask(store, "l1", "no clue at all")).toEqual({ outcome: "not_yet", hint: "Hint l1.1" });
    expect(await seen()).toEqual(["Hint l1.1"]);
    expect(await ask(store, "l1", "still a guess")).toEqual({ outcome: "not_yet", hint: "Hint l1.2" });
    expect(await ask(store, "l1", "one more")).toEqual({ outcome: "handoff", handoff: "Ask a parent about l1." });
  });

  it("opens no deeper layer after a handoff", async () => {
    const { store, attempts } = fake([card("l1"), card("l2", { layer: 2 })]);
    for (const g of ["x1", "x2", "x3"]) await ask(store, "l1", g);
    expect(await ask(store, "l1", "answerl1")).toBeNull();
    expect(await cardFor(store, scope, "l2", MONDAY)).toEqual({ goTo: "l1" });
    expect(await ask(store, "l2", "answerl2")).toBeNull();
    expect(attempts).toHaveLength(3);
    const tile = (await wallFor(store, scope, "Pip", MONDAY)).tiles[0];
    expect(tile.done).toBe(true);
  });

  it("opens the next layer on a right answer, and opens a card where the child left it", async () => {
    const { store } = fake([card("l1"), card("l2", { layer: 2 })]);
    expect(await ask(store, "l1", "answerl1")).toEqual({ outcome: "right", next: "l2" });
    expect(await cardFor(store, scope, "l1", MONDAY)).toEqual({ goTo: "l2" });
    const deeper = await cardFor(store, scope, "l2", MONDAY);
    expect(deeper && "card" in deeper && deeper.card.layer).toBe(2);
  });

  it("takes any real answer to an open question and ends at its handoff", async () => {
    const { store, attempts } = fake([card("l4", { layer: 1, accept: [] })]);
    expect(await ask(store, "l4", "because copies are still pretty")).toEqual({ outcome: "open", handoff: "Ask a parent about l4." });
    expect(attempts[0].correct).toBeNull();
  });

  it("writes nothing and gives no hint for I don't know", async () => {
    const { store, attempts, sessions } = fake([card("l1")]);
    expect(await ask(store, "l1", "I don’t know")).toEqual({ outcome: "guess_first" });
    expect(attempts).toEqual([]);
    expect(sessions).toEqual([]);
  });

  it("records one attempt per guess, as decision 3 says", async () => {
    const { store, attempts } = fake([card("l1")]);
    await ask(store, "l1", "  wrong one  ");
    await answer(store, scope, { cardId: "l1", guess: "x".repeat(300), seconds: 99999 }, MONDAY, "every");
    expect(attempts[0]).toMatchObject({ family_id: FAMILY, child_id: PIP, question_id: "q-l1", mode: "teach", answer: "wrong one", correct: false, hints_used: 0, seconds: 12 });
    expect(attempts[1]).toMatchObject({ answer: "x".repeat(200), hints_used: 1, seconds: 3600 });
    expect(Object.keys(attempts[0]).sort()).toEqual(["answer", "child_id", "correct", "created_at", "family_id", "hints_used", "mode", "question_id", "seconds", "session_id"]);
  });
});

describe("sessions", () => {
  it("keeps a visit while something happens within 30 minutes, and starts a new one after", async () => {
    const { store, sessions } = fake([card("l1")]);
    await wallFor(store, scope, "Pip", MONDAY);
    await ask(store, "l1", "a guess", new Date(MONDAY.getTime() + 20 * 60_000));
    await wallFor(store, scope, "Pip", new Date(MONDAY.getTime() + 45 * 60_000));
    expect(sessions).toHaveLength(1);
    expect(sessions[0].ended_at).toBe(new Date(MONDAY.getTime() + 45 * 60_000).toISOString());
    await wallFor(store, scope, "Pip", new Date(MONDAY.getTime() + 80 * 60_000));
    expect(sessions.map((s) => s.ended_reason)).toEqual(["child_left", null]);
    expect(sessions[1].device).toBe("device-1");
  });
});

describe("what reaches the browser", () => {
  it("holds each reply to its fields, with no answer key, rubric or unearned hint", async () => {
    const { store } = fake([card("l1", { slot: "look" }), card("l2", { slot: "look", layer: 2 })]);
    const wall = await wallFor(store, scope, "Pip", MONDAY);
    expect(Object.keys(wall).sort()).toEqual(["nickname", "tiles"]);
    expect(Object.keys(wall.tiles[0]).sort()).toEqual(["cardId", "done", "slot", "title"]);

    const shown = await cardFor(store, scope, "l1", MONDAY);
    const c = shown && "card" in shown ? shown.card : null;
    expect(Object.keys(c!).sort()).toEqual(["hints", "id", "image_alt", "layer", "media", "question", "slot", "state", "text", "title"]);

    const replies = [
      await ask(store, "l1", "nope"),
      await ask(store, "l1", "nah"),
      await ask(store, "l1", "answerl1"),
    ];
    for (const r of replies) {
      for (const k of Object.keys(r!)) expect(["outcome", "hint", "handoff", "next"]).toContain(k);
    }
    // Before any guess, no hint and no handoff; and nowhere an answer key, a rubric, an id or a verdict.
    expect(JSON.stringify([wall, c])).not.toMatch(/Hint l1|Ask a parent about l1/);
    expect(JSON.stringify([wall, c, replies])).not.toMatch(/answerl1|answerl2|rubric|q-l1|policy|passed|family-1|child-pip|device-1/);
  });

  it("logs no guess", async () => {
    const spies = (["log", "info", "warn", "error", "debug"] as const).map((m) => vi.spyOn(console, m).mockImplementation(() => {}));
    const { store } = fake([card("l1")]);
    await ask(store, "l1", "a secret guess");
    await ask(store, "l1", "idk");
    await wallFor(store, scope, "Pip", MONDAY);
    for (const s of spies) expect(s).not.toHaveBeenCalled();
  });
});
