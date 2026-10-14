// The lens picker (docs/17-lenses.md, "How the picker works"). Pure: given a child and what the child
// has been choosing, which lens opens each day-slot card of a week. No randomness, so the same
// child and history always give the same week.

export const LENSES = ["build", "story", "compete", "collect", "explore", "care", "humor"] as const;
export type Lens = (typeof LENSES)[number];

export const SLOT_ORDER = ["look", "wonder", "listen", "then", "puzzle"] as const;
export type DaySlot = (typeof SLOT_ORDER)[number];

// Each lens's opening question, as docs/17 has it (a test keeps the two the same).
export const LENS_QUESTIONS: Record<Lens, string> = {
  build: "How was it made? What would you make?",
  story: "Who was there, and what was it like to be them?",
  compete: "Who won, and how?",
  collect: "Can you find them all?",
  explore: "What's down there?",
  care: "Who looked after whom?",
  humor: "What's funny about this?",
};

// The lenses that carry week one for every child.
export const SHARED: readonly Lens[] = ["explore", "collect", "humor", "story"];

// The one lens the sex prior leans toward in week one (CLAUDE.md rule 6). Docs/17 allows build or
// compete for a boy and story or care for a girl; story is already shared, so a girl's lean is care.
export const PRIOR_LENS: Record<"boy" | "girl", Lens> = { boy: "build", girl: "care" };

// Deep taps per lens: how often the child opened layer 2 or deeper on a card through that lens.
// Empty until the Wonder Wall records taps (phase 4).
export type LensHistory = Partial<Record<Lens, number>>;

export type LensInput = {
  sex: "boy" | "girl" | null;
  pilotWeek: number; // 1 for the child's first week
  history: LensHistory;
  days: number; // 1 to 7
};

export type LensPick = { day: number; slot: DaySlot; lens: Lens };

const taps = (h: LensHistory, l: Lens) => h[l] ?? 0;
const hasHistory = (h: LensHistory) => LENSES.some((l) => taps(h, l) > 0);

// The prior fades over about two weeks of the child's own behavior: full in week 1, half in week 2,
// gone from week 3 (docs/17; the pilot measures it).
export const priorStrength = (pilotWeek: number) => Math.max(0, 1 - (pilotWeek - 1) / 2);

// How much of the week each lens gets, before rounding to slots.
export function lensWeights({ sex, pilotWeek, history }: Omit<LensInput, "days">): Record<Lens, number> {
  const most = Math.max(0, ...LENSES.map((l) => taps(history, l)));
  const prior = sex ? PRIOR_LENS[sex] : null;
  const fade = priorStrength(pilotWeek);
  const weights = {} as Record<Lens, number>;
  for (const l of LENSES) {
    weights[l] =
      1 + // every lens, always: none is withheld
      (SHARED.includes(l) ? 2 * fade + (hasHistory(history) ? 0 : 1 - fade) * 2 : 0) +
      (l === prior ? 2 * fade : 0) +
      (most > 0 ? 4 * (taps(history, l) / most) : 0);
  }
  return weights;
}

// The lens of the week's first card (day 1, look).
export function openingLens({ pilotWeek, history }: Pick<LensInput, "pilotWeek" | "history">): Lens {
  if (!hasHistory(history)) return SHARED[0];
  // Sorts are stable, so ties keep LENSES order.
  const most = [...LENSES].sort((a, b) => taps(history, b) - taps(history, a));
  const least = [...LENSES].sort((a, b) => taps(history, a) - taps(history, b));
  // Every third week the opening card uses the lens the child has chosen least, and the tutor watches.
  return pilotWeek % 3 === 0 ? least[0] : most[0];
}

// Split n slots by weight (largest remainder), with every lens getting at least one when there's room.
function apportion(weights: Record<Lens, number>, n: number): Record<Lens, number> {
  const counts = Object.fromEntries(LENSES.map((l) => [l, 0])) as Record<Lens, number>;
  let left = n;
  if (n >= LENSES.length) {
    for (const l of LENSES) counts[l] = 1;
    left -= LENSES.length;
  }
  const total = LENSES.reduce((s, l) => s + weights[l], 0);
  const exact = LENSES.map((l) => ({ l, share: (weights[l] / total) * left }));
  for (const { l, share } of exact) counts[l] += Math.floor(share);
  left -= exact.reduce((s, { share }) => s + Math.floor(share), 0);
  const byRemainder = [...exact].sort((a, b) => b.share - Math.floor(b.share) - (a.share - Math.floor(a.share)) || weights[b.l] - weights[a.l]);
  for (let i = 0; i < left; i++) counts[byRemainder[i % byRemainder.length].l] += 1;
  return counts;
}

// One lens per day-slot. The opening card is fixed; the rest are dealt so the most-weighted lenses
// come round most often and no day repeats a lens while another is still waiting.
export function pickLenses(input: LensInput): LensPick[] {
  const days = Math.min(7, Math.max(1, Math.floor(input.days)));
  const slots = days * SLOT_ORDER.length;
  const weights = lensWeights(input);
  const counts = apportion(weights, slots);
  const opener = openingLens(input);
  if (counts[opener] === 0) {
    // Only possible in a one-day week: the opener takes a slot from the lens with the most.
    const donor = [...LENSES].sort((a, b) => counts[b] - counts[a])[0];
    counts[donor] -= 1;
    counts[opener] += 1;
  }

  const picks: LensPick[] = [];
  const left = { ...counts };
  for (let day = 1; day <= days; day++) {
    const today = new Set<Lens>();
    for (const slot of SLOT_ORDER) {
      let lens: Lens;
      if (day === 1 && slot === "look") lens = opener;
      else {
        const ready = LENSES.filter((l) => left[l] > 0);
        const fresh = ready.filter((l) => !today.has(l));
        lens = (fresh.length ? fresh : ready).sort((a, b) => left[b] - left[a] || weights[b] - weights[a])[0];
      }
      left[lens] -= 1;
      today.add(lens);
      picks.push({ day, slot, lens });
    }
  }
  return picks;
}
