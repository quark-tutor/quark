"use client";

import { useRef, useState } from "react";
import { CONDUCT_CHOICES, CONDUCT_QUESTIONS, type ChoiceKey, type ConductAnswer, type ConductKey } from "@/lib/conduct";
import { LEARNS_LABELS, type LearnsToAct } from "@/lib/values";
import * as actions from "./actions";
import type { Acts, BeliefsData, PackView } from "./data";
import styles from "./beliefs.module.css";

// Part 2b of the interview (the four conduct items that vary by household) and how the kids
// learn to act. Both save as they change; the parent page shows any error.

type Save = (call: () => Promise<{ error?: string }>) => Promise<boolean>;

const cls = (...names: (string | false | null | undefined)[]) => names.filter(Boolean).join(" ");

function Choices({
  label,
  choices,
  value,
  onChange,
}: {
  label: string;
  choices: readonly { id: string; label: string }[];
  value: string | null;
  onChange: (id: string) => void;
}) {
  return (
    <div className={styles.seg} role="group" aria-label={label}>
      {choices.map((c) => (
        <button key={c.id} type="button" aria-pressed={value === c.id} onClick={() => value !== c.id && onChange(c.id)}>
          {c.label}
        </button>
      ))}
    </div>
  );
}

// A free-text line, saved when it loses focus.
function Line({
  label,
  initial,
  placeholder,
  onSave,
}: {
  label: string;
  initial: string;
  placeholder?: string;
  onSave: (text: string) => void;
}) {
  const saved = useRef(initial.trim());
  return (
    <label className={styles.note}>
      <span className={styles.label}>{label}</span>
      <textarea
        defaultValue={initial}
        maxLength={1000}
        placeholder={placeholder}
        onBlur={(e) => {
          const text = e.currentTarget.value.trim();
          if (text === saved.current) return;
          saved.current = text;
          onSave(text);
        }}
      />
    </label>
  );
}

export function ConductPanel({ kids, initial, save }: { kids: BeliefsData["children"]; initial: ConductAnswer[]; save: Save }) {
  const slot = (key: ConductKey, childId: string | null) => `${key}:${childId ?? ""}`;
  const noteOf = (key: ConductKey) => initial.find((c) => c.key === key && c.childId === null)?.note ?? "";
  const [values, setValues] = useState<Record<string, string | null>>(() =>
    Object.fromEntries(initial.map((c) => [slot(c.key, c.childId), c.value])),
  );
  const value = (key: ChoiceKey, childId: string | null = null) => values[slot(key, childId)] ?? null;
  const choose = (key: ChoiceKey, childId: string | null, id: string) => {
    setValues((v) => ({ ...v, [slot(key, childId)]: id }));
    save(() => actions.setConduct(key, childId, { value: id }));
  };
  const note = (key: ConductKey) => (text: string) => save(() => actions.setConduct(key, null, { note: text }));

  return (
    <section className={cls(styles.panel, styles.words)} aria-labelledby="conduct-title">
      <h2 id="conduct-title">How Quark conducts itself</h2>
      <p className={styles.fine}>
        Most of how Quark behaves is the same for every family: your child guesses before any hint, rushing slows things
        down, effort is praised and never cleverness, and nobody is looked down on. These four are yours to set. Where
        you and the other parent differ, the gentler setting applies until you talk.
      </p>

      <div className={styles.conduct}>
        <h3>{CONDUCT_QUESTIONS["conduct.speak_first"]}</h3>
        {kids.map((kid) => (
          <div key={kid.id} className={styles.ages}>
            <span className={styles.label}>{kid.nickname}</span>
            <Choices
              label={`Saying the answer out loud, for ${kid.nickname}`}
              choices={CONDUCT_CHOICES["conduct.speak_first"]}
              value={value("conduct.speak_first", kid.id)}
              onChange={(id) => choose("conduct.speak_first", kid.id, id)}
            />
          </div>
        ))}
        <Line label="Anything to add? (optional)" initial={noteOf("conduct.speak_first")} onSave={note("conduct.speak_first")} />
      </div>

      <div className={styles.conduct}>
        <h3>{CONDUCT_QUESTIONS["conduct.crude_line"]}</h3>
        <p className={styles.fine}>
          Quark declines a crude question without shaming: &ldquo;I won&rsquo;t answer that one; try asking it another
          way.&rdquo; A sentence or two on where your line is.
        </p>
        <Line
          label="In our house"
          initial={noteOf("conduct.crude_line")}
          placeholder="For example: potty words are fine, insults aren't."
          onSave={note("conduct.crude_line")}
        />
      </div>

      <div className={styles.conduct}>
        <h3>{CONDUCT_QUESTIONS["conduct.rudeness"]}</h3>
        <Choices
          label="If a child is rude to the tutor"
          choices={CONDUCT_CHOICES["conduct.rudeness"]}
          value={value("conduct.rudeness")}
          onChange={(id) => choose("conduct.rudeness", null, id)}
        />
        <Line label="Anything to add? (optional)" initial={noteOf("conduct.rudeness")} onSave={note("conduct.rudeness")} />
      </div>

      <div className={styles.conduct}>
        <h3>{CONDUCT_QUESTIONS["conduct.praise"]}</h3>
        <Choices
          label="Praise"
          choices={CONDUCT_CHOICES["conduct.praise"]}
          value={value("conduct.praise")}
          onChange={(id) => choose("conduct.praise", null, id)}
        />
        <Line
          label={`${CONDUCT_QUESTIONS["conduct.praise_words"]} (optional)`}
          initial={noteOf("conduct.praise_words")}
          placeholder={'For example: "You kept at it" is fine; never "genius."'}
          onSave={note("conduct.praise_words")}
        />
      </div>
    </section>
  );
}

// Follows the quick-start tradition until the guardian chooses (packs/README.md, "Pack-level fields").
export function ActsPanel({ initial, tradition, save }: { initial: Acts; tradition: PackView | null; save: Save }) {
  const [acts, setActs] = useState<Acts>(initial);
  const learns = acts.learns ?? tradition?.learns ?? null;
  const match = acts.match ?? tradition?.match ?? false;
  const change = (next: Partial<Acts>) => {
    setActs((a) => ({ ...a, ...next }));
    save(() => actions.setActs(next));
  };
  const chosen = acts.learns !== null || acts.match !== null;

  return (
    <section className={cls(styles.panel, styles.words)} aria-labelledby="acts-title">
      <h2 id="acts-title">How your kids learn to act</h2>
      <p className={styles.fine}>
        Traditions differ most here. This changes which stories and examples Quark leans on, never how it speaks to your
        kids.
        {tradition && !chosen ? ` Until you choose, it follows the ${tradition.shortName} tradition.` : ""}
      </p>
      <div className={styles.conduct}>
        <h3>Mostly, how do you want them to learn it?</h3>
        <Choices
          label="How your kids learn to act"
          choices={LEARNS_LABELS.map(([id, label]) => ({ id, label }))}
          value={learns}
          onChange={(id) => change({ learns: id as LearnsToAct })}
        />
      </div>
      <label className={styles.check}>
        <input type="checkbox" checked={match} onChange={(e) => change({ match: e.target.checked })} /> In stories, start
        with people of each child&rsquo;s own sex. No story is ever left out.
      </label>
      {tradition && chosen ? (
        <p className={styles.fine}>
          <button type="button" className={styles.back} onClick={() => change({ learns: null, match: null })}>
            Go back to the {tradition.shortName} tradition&rsquo;s setting
          </button>
        </p>
      ) : null}
    </section>
  );
}
