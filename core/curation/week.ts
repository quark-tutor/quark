import { pickLenses, SLOT_ORDER, type DaySlot, type Lens, type LensHistory } from "../../lib/lenses.ts";
import { levelOf, planDoors, type CardBody, type CardChild, type CardContext, type WrittenCards } from "./cards.ts";
import { firstLayerProblem } from "./ideas.ts";
import type { IdeaChain, WeekPlan } from "./types.ts";

// One week of the plan into a theme, its shared ideas, and every child's cards and questions
// (docs/04, "How a week is built"). The database and the model come in as deps so this can be
// tested. The theme is 'generating' while this runs and 'review' when it's done; nothing here
// makes a week live.

export type WeekChild = CardChild & { sex: "boy" | "girl" | null; history: LensHistory };

export type CardRow = {
  theme_id: string;
  idea_id: string;
  child_id: string;
  day: string; // the date
  slot: DaySlot;
  lens: Lens;
  layer: number;
  parent_card_id: string | null;
  body: CardBody;
  level: string;
  door: string | null;
  policy: "pending" | "blocked";
  policy_notes: { validation: string[] } | null;
};

export type QuestionRow = {
  card_id: string;
  idea_id: string;
  prompt: string;
  answer_key: { accept: string[]; rubric: string };
  hints: string[];
};

export type WeekDeps = {
  findTheme: () => Promise<{ id: string } | null>;
  createTheme: () => Promise<string>;
  setStatus: (themeId: string, status: "generating" | "review") => Promise<void>;
  deleteIdeas: (themeId: string) => Promise<void>; // cascades to cards and questions
  deleteCards: (themeId: string, childId: string) => Promise<void>; // cascades to questions
  loadIdeas: (themeId: string) => Promise<IdeaChain[]>;
  saveIdeas: (themeId: string, chain: IdeaChain) => Promise<string[]>; // ideas.id per layer
  saveCard: (row: CardRow) => Promise<string>;
  saveQuestion: (row: QuestionRow) => Promise<void>;
  writeIdeaChain: (slot: DaySlot, day: number, earlier: IdeaChain[]) => Promise<IdeaChain>;
  writeCards: (ctx: CardContext) => Promise<WrittenCards>;
};

export type WeekOptions = {
  plan: WeekPlan;
  weekStart: string; // YYYY-MM-DD, day 1
  days: number;
  children: WeekChild[];
  statement: string | null;
  pointNames: Map<number, string>;
  rebuild: boolean;
  onlyChild?: string; // a child id
  concurrency?: number;
};

export type ChildReport = {
  nickname: string;
  cards: number;
  lenses: Partial<Record<Lens, number>>;
  doors: number;
  withoutPicture: number;
  reasked: number;
  heldBack: string[]; // cards still failing the checks after a second try: saved as blocked
};

export type WeekReport = {
  themeId: string;
  ideas: number;
  textOnly: string[]; // day-slots whose topic had no approved item at all
  firstWithoutPicture: string[]; // day-slots whose topic had an item but whose layer 1 still has none
  ideasReasked: number; // idea chains sent back once because layer 1 had no item
  children: ChildReport[];
};

export function addDays(date: string, n: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// Run fn over items, n at a time, in order of starting.
async function pool<T, R>(items: T[], n: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, worker));
  return out;
}

export async function buildWeek(opts: WeekOptions, deps: WeekDeps): Promise<WeekReport> {
  const { plan, children } = opts;
  const days = Math.min(7, Math.max(1, opts.days));
  const concurrency = opts.concurrency ?? 4;
  const kids = opts.onlyChild ? children.filter((c) => c.id === opts.onlyChild) : children;
  if (kids.length === 0) throw new Error(`No child ${opts.onlyChild} in this family`);

  // 1. The theme: refuse to build a week twice unless asked to rebuild it.
  const existing = await deps.findTheme();
  if (existing && !opts.rebuild) {
    throw new Error(`Week ${plan.week} is already built (theme ${existing.id}). Run again with --rebuild to replace it.`);
  }
  let themeId: string;
  let chains: IdeaChain[] = [];
  if (existing) {
    themeId = existing.id;
    await deps.setStatus(themeId, "generating");
    if (opts.onlyChild) {
      await deps.deleteCards(themeId, opts.onlyChild);
      chains = await deps.loadIdeas(themeId);
    } else {
      await deps.deleteIdeas(themeId);
    }
  } else {
    themeId = await deps.createTheme();
  }

  // 2. Ideas, shared by every child: slots side by side, days in order within a slot so each day's
  //    first layer can be new.
  if (chains.length === 0) {
    const bySlot = await pool([...SLOT_ORDER], SLOT_ORDER.length, async (slot) => {
      const written: IdeaChain[] = [];
      for (let day = 1; day <= days; day++) {
        const chain = await deps.writeIdeaChain(slot, day, written);
        chain.ids = await deps.saveIdeas(themeId, chain);
        written.push(chain);
      }
      return written;
    });
    chains = bySlot.flat();
  }
  chains = chains.filter((c) => c.day <= days).sort((a, b) => a.day - b.day || SLOT_ORDER.indexOf(a.slot) - SLOT_ORDER.indexOf(b.slot));
  const textOnly = chains.filter((c) => c.topic.items.length === 0).map((c) => `day ${c.day} ${c.slot}`);
  const firstWithoutPicture = chains
    .filter((c) => firstLayerProblem(c.layers, c.topic.items))
    .map((c) => `day ${c.day} ${c.slot} (${c.topic.title})`);
  const ideasReasked = chains.filter((c) => (c.asked ?? 1) > 1).length;

  // 3. Each child's cards: a lens and maybe a door per day-slot, four cards per chain.
  const reports: ChildReport[] = [];
  for (const child of kids) {
    const picks = pickLenses({ sex: child.sex, pilotWeek: plan.week, history: child.history, days });
    const lensOf = new Map(picks.map((p) => [`${p.day}:${p.slot}`, p.lens]));
    const doors = planDoors(child.interests, picks.map((p) => `${p.day}:${p.slot}`));
    const report: ChildReport = { nickname: child.nickname, cards: 0, lenses: {}, doors: doors.size, withoutPicture: 0, reasked: 0, heldBack: [] };

    await pool(chains, concurrency, async (chain) => {
      const key = `${chain.day}:${chain.slot}`;
      const lens = lensOf.get(key)!;
      const door = doors.get(key) ?? null;
      const written = await deps.writeCards({
        child,
        chain,
        lens,
        door,
        statement: opts.statement,
        perspective: plan.perspective,
        valuesPoints: plan.valuesPoints.map((n) => ({ number: n, name: opts.pointNames.get(n) ?? `point ${n}` })),
      });
      if (written.asked > 1) report.reasked += 1;
      report.lenses[lens] = (report.lenses[lens] ?? 0) + 1; // per day-slot

      let parent: string | null = null;
      for (const [i, body] of written.cards.entries()) {
        const layer = chain.layers[i];
        const problems = written.problems[i] ?? [];
        const cardId: string = await deps.saveCard({
          theme_id: themeId,
          idea_id: chain.ids![i],
          child_id: child.id,
          day: addDays(opts.weekStart, chain.day - 1),
          slot: chain.slot,
          lens,
          layer: layer.layer,
          parent_card_id: parent,
          body,
          level: levelOf(child),
          door: i === 0 ? door : null,
          policy: problems.length ? "blocked" : "pending",
          policy_notes: problems.length ? { validation: problems } : null,
        });
        await deps.saveQuestion({ card_id: cardId, idea_id: chain.ids![i], prompt: body.question, answer_key: layer.answer_key, hints: body.hints });
        parent = cardId;
        report.cards += 1;
        if (!layer.content_item_id) report.withoutPicture += 1;
        if (problems.length) report.heldBack.push(`day ${chain.day} ${chain.slot} layer ${layer.layer}: ${problems.join("; ")}`);
      }
    });
    reports.push(report);
  }

  await deps.setStatus(themeId, "review");
  return { themeId, ideas: chains.length * 4, textOnly, firstWithoutPicture, ideasReasked, children: reports };
}
