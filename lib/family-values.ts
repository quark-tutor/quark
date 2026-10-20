import { defaultAge, type LeanChoice } from "./beliefs.ts";
import { CHOICE_KEYS, gentler, gentlest, PER_CHILD, TEXT_KEYS, type ConductAnswer, type ConductKey } from "./conduct.ts";
import type { LearnsToAct, Perspective, When } from "./values.ts";

// Part 4 of the interview (gate/values-interview.md): every guardian's answers in, the family's
// values out. Pure, so the compare page shows exactly what the server writes.
//
//   A subject is written once every guardian has answered it, or one has blackballed it.
//   Same answer: written as is. "Not yet" ages take the older age per child.
//   Different answers: parent-led until they agree, flagged as disputed.
//   Conduct: the gentler setting wins where guardians differ, and applies until both have answered.

export type GuardianAnswer = {
  when: When;
  perspective: Perspective;
  note: string;
  fromPack: string | null;
  ages: Record<string, number>; // child id -> "Not yet" age
};

export type Words = { understand: string; believe: string; decide: string };

export type GuardianInput = {
  id: string;
  name: string;
  answers: Record<number, GuardianAnswer>;
  conduct: ConductAnswer[];
  packId: string | null;
  lean: LeanChoice;
  words: Words;
  learns: LearnsToAct | null; // their own choice; null = as their quick-start tradition has it
  match: boolean | null;
};

export type ChildInput = { id: string; nickname: string; age: number };
export type BlackballInput = { id: string; point: number | null; topic: string | null; placedBy: string };
export type PackActs = Record<string, { learns: LearnsToAct | null; match: boolean | null }>;

export type PointStatus = "agreed" | "differ" | "waiting" | "blocked";

export type FamilySetting = {
  when: When;
  perspective: Perspective;
  notes: string[]; // each guardian's "What would you actually say?", where given
  fromPack: string | null;
  ages: Record<string, number>;
};

export type FamilyPoint = {
  point: number;
  status: PointStatus;
  setting: FamilySetting | null; // null while waiting: nothing is written
  waitingOn: string[]; // guardian ids
  blackballs: BlackballInput[];
};

export type ConductStatus = "agreed" | "differ" | "waiting";

export type FamilyConduct = {
  key: ConductKey;
  childId: string | null;
  status: ConductStatus;
  value: string | null; // what applies now; for "waiting", the gentlest setting
  notes: string[];
};

export type FamilyProfile = {
  packId: string | null;
  lean: LeanChoice;
  statement: string | null;
  learns: LearnsToAct | null;
  match: boolean;
};

export type FamilyValues = {
  points: FamilyPoint[];
  conduct: FamilyConduct[];
  profile: FamilyProfile;
  topics: BlackballInput[]; // blackballed topics outside the 24
};

export const WORD_PROMPTS: [keyof Words, string][] = [
  ["understand", "What do you most want your kids to understand about the world?"],
  ["believe", "What do you believe that you want them to believe too?"],
  ["decide", "What do you want them to decide for themselves?"],
];

const distinct = (texts: (string | null | undefined)[]) => [
  ...new Set(texts.map((t) => (t ?? "").trim()).filter(Boolean)),
];

function mergePoint(point: number, guardians: GuardianInput[], children: ChildInput[], blackballs: BlackballInput[]): FamilyPoint {
  const blocks = blackballs.filter((b) => b.point === point);
  if (blocks.length) {
    return {
      point,
      status: "blocked",
      setting: { when: "never", perspective: "omitted", notes: [], fromPack: null, ages: {} },
      waitingOn: [],
      blackballs: blocks,
    };
  }

  const waitingOn = guardians.filter((g) => !g.answers[point]).map((g) => g.id);
  if (waitingOn.length || !guardians.length) {
    return { point, status: "waiting", setting: null, waitingOn, blackballs: [] };
  }

  const answers = guardians.map((g) => g.answers[point]);
  const [first] = answers;
  const same = answers.every((a) => a.when === first.when && a.perspective === first.perspective);
  if (!same) {
    return {
      point,
      status: "differ",
      setting: { when: "parent_led", perspective: "omitted", notes: [], fromPack: null, ages: {} },
      waitingOn: [],
      blackballs: [],
    };
  }

  const ages: Record<string, number> = {};
  if (first.when === "from_age") {
    for (const kid of children) {
      const given = answers.map((a) => a.ages[kid.id]).filter((n): n is number => Number.isInteger(n));
      ages[kid.id] = given.length ? Math.max(...given) : defaultAge(null, kid.age);
    }
  }
  return {
    point,
    status: "agreed",
    setting: {
      when: first.when,
      perspective: first.perspective,
      notes: distinct(answers.map((a) => a.note)),
      fromPack: answers.every((a) => a.fromPack === first.fromPack) ? first.fromPack : null,
      ages,
    },
    waitingOn: [],
    blackballs: [],
  };
}

function mergeConduct(guardians: GuardianInput[], children: ChildInput[]): FamilyConduct[] {
  const find = (g: GuardianInput, key: ConductKey, childId: string | null) =>
    g.conduct.find((c) => c.key === key && c.childId === childId);
  const out: FamilyConduct[] = [];

  for (const key of CHOICE_KEYS) {
    const units = PER_CHILD.includes(key) ? children.map((k) => k.id) : [null];
    for (const childId of units) {
      const values = guardians.map((g) => find(g, key, childId)?.value ?? null);
      const given = values.filter((v): v is string => !!v);
      const notes = PER_CHILD.includes(key) ? [] : distinct(guardians.map((g) => find(g, key, null)?.note));
      if (!guardians.length || given.length < guardians.length) {
        out.push({ key, childId, status: "waiting", value: gentlest(key), notes });
      } else if (new Set(given).size > 1) {
        out.push({ key, childId, status: "differ", value: gentler(key, given), notes });
      } else {
        out.push({ key, childId, status: "agreed", value: given[0], notes });
      }
    }
    // A per-child question's free-text line sits on its child_id-null row.
    if (PER_CHILD.includes(key)) {
      const notes = distinct(guardians.map((g) => find(g, key, null)?.note));
      if (notes.length) out.push({ key, childId: null, status: "agreed", value: null, notes });
    }
  }
  for (const key of TEXT_KEYS) {
    const notes = distinct(guardians.map((g) => find(g, key, null)?.note));
    if (notes.length) out.push({ key, childId: null, status: "agreed", value: null, notes });
  }
  return out;
}

function mergeProfile(guardians: GuardianInput[], packActs: PackActs): FamilyProfile {
  const all = <T,>(values: T[]): T | null => (values.length && values.every((v) => v === values[0]) ? values[0] : null);

  const sections = WORD_PROMPTS.map(([field, prompt]) => {
    const said = distinct(guardians.map((g) => g.words[field]));
    return said.length ? `${prompt}\n${said.map((s) => `- ${s}`).join("\n")}` : null;
  }).filter(Boolean);

  const learns = distinct(guardians.map((g) => g.learns ?? (g.packId ? packActs[g.packId]?.learns : null))) as LearnsToAct[];
  const match = guardians.map((g) => g.match ?? (g.packId ? packActs[g.packId]?.match : null) ?? false);

  return {
    packId: all(guardians.map((g) => g.packId)),
    lean: all(guardians.map((g) => g.lean)) ?? "unset",
    statement: sections.length ? sections.join("\n\n") : null,
    learns: learns.length === 0 ? null : learns.length === 1 ? learns[0] : "mixed",
    // Every guardian has to want it. It only shifts which stories come first; none is left out.
    match: match.length > 0 && match.every(Boolean),
  };
}

export function mergeFamily(
  guardians: GuardianInput[],
  children: ChildInput[],
  blackballs: BlackballInput[],
  packActs: PackActs,
): FamilyValues {
  return {
    points: Array.from({ length: 24 }, (_, i) => mergePoint(i + 1, guardians, children, blackballs)),
    conduct: mergeConduct(guardians, children),
    profile: mergeProfile(guardians, packActs),
    topics: blackballs.filter((b) => b.point === null && b.topic),
  };
}
