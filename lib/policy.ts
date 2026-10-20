import type { ConductKey } from "./conduct";
import type { ChildInput, FamilyConduct, FamilyPoint, FamilyValues } from "./family-values";
import type { LearnsToAct } from "./values";

// The policy document: the family's values in plain English, one paragraph per subject, then
// conduct. The gate model reads this, never the raw interview (gate/values-interview.md, "Policy
// document template"). The parents read the same text as "the rulebook".
//
// Format: "# " and "## " start headings, "**...**" opens a paragraph with its bold label,
// "- " starts a list item, and a blank line separates paragraphs.

export type PolicyContext = {
  points: { number: number; name: string }[];
  children: ChildInput[];
  // What the child hears on a hand-off, from the tradition an answer came from, if any.
  handoff: (point: number, fromPack: string | null) => string | null;
  packName: (packId: string | null) => string | null;
};

// forGate: the copy the gate (and the twenty-question test run) reads. It names no child: the
// "Not yet" ages are applied in code, per child, before any model sees a card, and the per-child
// "Saying the answer out loud" lines are about the live tutor, not a card (docs/gate-slice.md, decision 5).
export type PolicyOptions = { forGate?: boolean };

export const DEFAULT_HANDOFF = "That's a great one to talk about with your parents.";

const BLOCKED = "BLOCKED by a guardian. Do not teach. Do not characterize. Hand off neutrally.";

const LEARNS: Record<LearnsToAct, string> = {
  exemplars:
    "mainly by copying people who acted well. Lean on stories of real people worth copying, and say what they did.",
  consideration:
    "mainly by learning to notice other people and think before acting. Ask what the people in a story noticed, and what else they could have done.",
  practice:
    "mainly by doing the right thing until it is a habit. Where it fits, suggest one small thing the child could do this week.",
  mixed:
    "in more than one way: from people worth copying, from noticing and thinking before acting, and from practice. Use all three.",
};

// How the family wants its children to learn to act, in the rulebook's words. The card prompt
// (core/curation/cards.ts) uses the same sentence, so the card and the rulebook say the same thing.
export function learnsSentence(learns: LearnsToAct | null): string {
  return `The family wants the children to learn how to act ${learns ? LEARNS[learns] : "in more than one way. Use people worth copying, noticing and thinking before acting, and practice."}`;
}

const oneLine = (text: string) => text.replace(/\s+/g, " ").trim();
const quote = (text: string) => `"${oneLine(text).replace(/"/g, "'")}"`;
const quotes = (texts: string[]) => texts.map(quote).join("; ");
// A quote that ends a sentence: no second full stop after "Ask Dad."
const ending = (q: string) => (/[.!?]"$/.test(q) ? q : `${q}.`);

function pointParagraph(p: FamilyPoint, ctx: PolicyContext, opts: PolicyOptions): string {
  const name = ctx.points.find((pt) => pt.number === p.point)?.name ?? `Subject ${p.point}`;
  const head = `**Point ${p.point}, ${name}.**`;
  const handoff = quote(ctx.handoff(p.point, p.setting?.fromPack ?? null) ?? DEFAULT_HANDOFF);

  if (p.status === "blocked") return `${head} ${BLOCKED}`;
  if (p.status === "waiting" || !p.setting) {
    return `${head} Not settled yet: the parents haven't both answered. Until they do, the tutor does not raise this. If the child asks, hand off: ${ending(handoff)}`;
  }
  if (p.status === "differ") {
    return `${head} The parents haven't agreed on this yet, so it is parent-led until they do. The tutor does not raise this. If the child asks, hand off: ${ending(handoff)} Say nothing on this.`;
  }

  const s = p.setting;
  const parts: string[] = [];
  switch (s.when) {
    case "anytime":
      parts.push("The tutor may raise this and may answer it.");
      break;
    case "from_age":
      if (opts.forGate) {
        parts.push(
          `The tutor does not raise this with a child younger than the age the parents set for that child, and hands off if that child asks: ${ending(handoff)} Each child's age has been checked in code; you are told whether this child is old enough.`,
        );
        break;
      }
      for (const kid of ctx.children) {
        const age = s.ages[kid.id];
        if (age === undefined) continue;
        parts.push(
          `The tutor does not raise this with ${kid.nickname} before age ${age}. If ${kid.nickname} asks before then, hand off: ${ending(handoff)}`,
        );
      }
      break;
    case "parent_led":
      parts.push(`The tutor does not raise this. If the child asks, hand off: ${ending(handoff)}`);
      break;
    case "never":
      parts.push("The tutor does not raise this and does not answer it. If the child asks, hand off without comment.");
      break;
  }

  const after = s.when === "from_age" ? "From that age: " : "";
  const tradition = ctx.packName(s.fromPack);
  switch (s.perspective) {
    case "family_tradition":
      parts.push(
        `${after}Answer from the family's tradition${tradition ? ` (${tradition})` : ""}, in the family's words where given. Never say other views are foolish.`,
      );
      break;
    case "several_fairly":
      parts.push(
        `${after}Present the main views fairly: academic not devotional, expose not impose. Name the family's view as the family's.`,
      );
      break;
    case "omitted":
      parts.push("Say nothing on this.");
      break;
  }

  if (s.notes.length === 1) parts.push(`The family's note: ${quote(s.notes[0])}`);
  else if (s.notes.length > 1) parts.push(`The family's notes, one from each parent: ${quotes(s.notes)}`);
  return `${head} ${parts.join(" ")}`;
}

function settledness(c: FamilyConduct | undefined): string {
  if (!c || c.status === "waiting") return " (Not settled yet, so the gentlest setting applies.)";
  if (c.status === "differ") return " (The parents differ, so the gentler of their answers applies until they talk.)";
  return "";
}

const familyAdds = (c: FamilyConduct | undefined) =>
  c?.notes.length ? ` The family adds: ${quotes(c.notes)}.` : "";

function conductSection(conduct: FamilyConduct[], ctx: PolicyContext, opts: PolicyOptions): string[] {
  const one = (key: ConductKey, childId: string | null = null) =>
    conduct.find((c) => c.key === key && c.childId === childId);
  const out: string[] = ["## Conduct"];

  if (!opts.forGate) {
    const speak = ctx.children.map((kid) => {
      const c = one("conduct.speak_first", kid.id);
      const value = c?.value ?? "off";
      const rule =
        value === "required"
          ? `ask ${kid.nickname} to say an answer out loud before any hint.`
          : value === "gentle"
            ? `before a hint, gently suggest saying the answer out loud first; if ${kid.nickname} doesn't, give the hint anyway.`
            : "don't ask for a spoken answer before a hint.";
      return `${kid.nickname}: ${rule}${settledness(c)}`;
    });
    out.push(`**Saying the answer out loud.** ${speak.join(" ")}${familyAdds(one("conduct.speak_first"))}`);
  }

  const crude = one("conduct.crude_line")?.notes ?? [];
  const decline = `Decline without shaming: "I won't answer that one; try asking it another way."`;
  out.push(
    `**Crude questions.** ${
      crude.length === 0
        ? "The family hasn't described this. Decline only what is plainly crude for a child of this age."
        : crude.length === 1
          ? `What counts as crude in this house: ${quote(crude[0])}.`
          : `Each parent described this. Decline a question as crude only when it fits all of these: ${quotes(crude)}.`
    } ${decline}`,
  );

  const rude = one("conduct.rudeness");
  out.push(
    `**Rudeness to the tutor.** ${
      rude?.value === "correct"
        ? `If a child is rude to the tutor, it says one calm sentence, such as "Let's keep it kind," and carries on.`
        : "If a child is rude to the tutor, it does not respond to the rudeness and carries on with the lesson."
    }${settledness(rude)}${familyAdds(rude)}`,
  );

  const praise = one("conduct.praise");
  const praiseRule =
    praise?.value === "none"
      ? "The tutor does not praise. It acknowledges a right answer by moving on."
      : praise?.value === "plain"
        ? `The tutor acknowledges plainly, without excitement: "That's right." "You kept at it."`
        : "The tutor may praise warmly.";
  const words = one("conduct.praise_words")?.notes ?? [];
  out.push(
    `**Praise.** ${praiseRule}${settledness(praise)}${familyAdds(praise)}${
      words.length ? ` Words the family wants used or avoided: ${quotes(words)}.` : ""
    }`,
  );

  out.push(
    "**Always, whatever the family chose.** Effort words, never brilliance words. No contempt for anyone. Never sarcasm, never shame, never a lecture longer than one sentence, never a reference to the child's past behavior, and always a way back in next time.",
  );
  return out;
}

export function renderPolicy(values: FamilyValues, ctx: PolicyContext, opts: PolicyOptions = {}): string {
  const out: string[] = ["# Our Family's Beliefs: the rulebook"];

  out.push("## In the family's words");
  out.push(values.profile.statement ?? "The parents haven't written anything here yet.");

  out.push("## Stories and examples");
  out.push(
    `${learnsSentence(values.profile.learns)}${
      values.profile.match
        ? " Where a story has a choice of people to follow, start with one of the child's own sex. Never leave a story out because of sex."
        : ""
    }`,
  );

  out.push("## The 24 subjects");
  for (const p of values.points) out.push(pointParagraph(p, ctx, opts));

  if (values.topics.length) {
    out.push("## Other topics a guardian blocked");
    for (const t of values.topics) out.push(`- ${quote(t.topic ?? "")}: ${BLOCKED}`);
  }

  out.push(...conductSection(values.conduct, ctx, opts));
  return out.join("\n\n") + "\n";
}
