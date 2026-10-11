"use client";

import Link from "next/link";
import { Fragment, useRef, useState, type ReactNode } from "react";
import {
  ANSWERS,
  answerOf,
  defaultAge,
  MAX_AGE,
  MIN_AGE,
  parseChooserExport,
  settingFor,
  type AnswerId,
  type LeanChoice,
} from "@/lib/beliefs";
import * as actions from "./actions";
import type { Result } from "./actions";
import { Blackball } from "./compare/blackball";
import { ActsPanel, ConductPanel } from "./conduct";
import type { AnswerView, Answers, BeliefsData, BlockView, EntryView, PackView, PointView, Words } from "./data";
import styles from "./beliefs.module.css";

const LEAN_LABELS: [LeanChoice, string][] = [
  ["progressive", "Progressive"],
  ["moderate", "Moderate"],
  ["conservative", "Conservative"],
  ["unset", "Rather not say"],
];

const WORD_PROMPTS: [keyof Words, string][] = [
  ["understand", "What do you most want your kids to understand about the world?"],
  ["believe", "What do you believe that you want them to believe too?"],
  ["decide", "What do you want them to decide for themselves?"],
];

type Screen = "start" | "quick" | "import" | "list";

const cls = (...names: (string | false | null | undefined)[]) => names.filter(Boolean).join(" ");
const color = (id: AnswerId | null) => (id ? styles[`a-${id}`] : undefined);
const answerLabel = (id: AnswerId) => ANSWERS.find((a) => a.id === id)!.label;

export function Beliefs({ initial }: { initial: BeliefsData }) {
  const { points, packs, children } = initial;
  const [answers, setAnswers] = useState<Answers>(initial.answers);
  const [lean, setLeanState] = useState<LeanChoice>(initial.lean);
  const [quickPack, setQuickPack] = useState<string | null>(initial.packId);
  const [quickLean, setQuickLean] = useState<LeanChoice>(initial.lean);
  const [screen, setScreen] = useState<Screen>(Object.keys(initial.answers).length ? "list" : "start");
  const [open, setOpen] = useState<Set<number>>(new Set());
  const [hidden, setHidden] = useState<string[]>([]);
  const [diffOnly, setDiffOnly] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(0);
  const latest = useRef(0);

  const go = (next: Screen) => {
    setScreen(next);
    window.scrollTo(0, 0);
  };

  // Save through a server action. The optimistic change shows at once; the server's copy of the
  // answers replaces it when the latest save comes back.
  async function run(call: () => Promise<Result>, optimistic?: (prev: Answers) => Answers): Promise<boolean> {
    const n = ++latest.current;
    if (optimistic) setAnswers(optimistic);
    setBusy((b) => b + 1);
    let result: Result;
    try {
      result = await call();
    } catch {
      result = { error: "Couldn't reach Quark. Check the connection." };
    }
    setBusy((b) => b - 1);
    if (result.error) {
      setError(`${result.error} Reload the page to see what was saved.`);
      return false;
    }
    if (n === latest.current && result.answers) setAnswers(result.answers);
    return true;
  }

  const entryFor = (pack: PackView, point: number): EntryView | null =>
    pack.entries[point]?.[lean] ?? pack.entries[point]?.unset ?? null;
  const packById = (id: string | null) => packs.find((p) => p.id === id) ?? null;
  const answeredCount = points.filter((p) => answers[p.number]).length;

  const setPointOpen = (point: number, isOpen: boolean) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (isOpen) next.add(point);
      else next.delete(point);
      return next;
    });

  function choose(point: number, id: AnswerId, pack: PackView | null) {
    const entry = pack ? entryFor(pack, point) : null;
    // "Not yet" stays open so the ages can be set.
    setPointOpen(point, id === "later");
    run(
      () => actions.setAnswer(point, id, pack?.id ?? null),
      (prev) => {
        const current = prev[point];
        const setting = settingFor(id, entry, current);
        const ages: Record<string, number> = {};
        if (setting.when === "from_age") {
          for (const kid of children) {
            ages[kid.id] = !pack && current?.ages[kid.id] ? current.ages[kid.id] : defaultAge(entry?.from_age, kid.age);
          }
        }
        return {
          ...prev,
          [point]: { ...setting, note: current?.note ?? "", fromPack: pack?.id ?? null, origin: pack ? "tradition" : "own", ages },
        };
      },
    );
  }

  function clear(point: number) {
    run(
      () => actions.clearAnswer(point),
      (prev) => {
        const next = { ...prev };
        delete next[point];
        return next;
      },
    );
  }

  const edit = (point: number, change: Partial<AnswerView>) => (prev: Answers) =>
    prev[point]
      ? {
          ...prev,
          [point]: {
            ...prev[point],
            ...change,
            origin: prev[point].origin === "quick_start" && !("note" in change) ? "tradition" : prev[point].origin,
          },
        }
      : prev;

  function labelFor(answer: AnswerView) {
    const id = answerOf(answer);
    if (id !== "later") return answerLabel(id);
    return `Not yet: ${children.map((k) => `${k.nickname} ${answer.ages[k.id] ?? "?"}`).join(", ")}`;
  }
  const entryLabel = (e: EntryView) =>
    e.when === "from_age" && e.from_age ? `Not yet: from about ${e.from_age}` : answerLabel(answerOf(e));

  const errorBanner = error ? (
    <div className={styles.error} role="alert">
      <span>{error}</span>
      <button className={cls(styles.btn, styles.quiet)} onClick={() => setError(null)}>
        Dismiss
      </button>
    </div>
  ) : null;
  const saving = busy > 0 ? <div className={styles.saving}>Saving…</div> : null;

  // -------------------------------------------------------------------------
  // 1. Start
  // -------------------------------------------------------------------------
  if (screen === "start") {
    return (
      <section className={styles.intro}>
        <Link href="/parent" className={styles.home}>
          &larr; Quark home
        </Link>
        <h1>Our Family&rsquo;s Beliefs</h1>
        <ul className={styles.facts}>
          <li>
            <span className={styles.dot}>1</span>
            <span>
              Quark writes your kids&rsquo; lessons. When a lesson touches a sensitive subject, it follows the answers you
              give here.
            </span>
          </li>
          <li>
            <span className={styles.dot}>2</span>
            <span>
              There are 24 sensitive subjects, like <span className={styles.examples}>&ldquo;Is God real?&rdquo;</span> or{" "}
              <span className={styles.examples}>&ldquo;Where do babies come from?&rdquo;</span> For each one, you choose how
              Quark handles it: answer from what you believe, show several views, wait until your child is older, send
              them to you, or leave it alone.
            </span>
          </li>
          <li>
            <span className={styles.dot}>3</span>
            <span>
              You can change any answer later. Each parent answers on their own, then you compare. Nothing reaches your
              kids until you&rsquo;ve both finished.
            </span>
          </li>
        </ul>
        <div className={styles.paths}>
          <button type="button" className={styles.path} onClick={() => go("quick")}>
            <strong>Quick start</strong>
            <span className={styles.time}>About 2 minutes</span>
            <span>
              Pick the religious tradition closest to yours and your political leaning. We fill in all 24 answers for you
              to look over.
            </span>
          </button>
          <button type="button" className={styles.path} onClick={() => go("list")}>
            <strong>Go through each one</strong>
            <span className={styles.time}>About 20 minutes</span>
            <span>See each subject and how different traditions handle it, then choose your own answer.</span>
          </button>
        </div>
        <p className={styles.fine}>
          Already answered on the tryout page?{" "}
          <button type="button" className={styles.back} onClick={() => go("import")}>
            Bring those answers over
          </button>
        </p>
        <p className={styles.fine}>
          The traditions&rsquo; answers are drafts made from each tradition&rsquo;s own published teaching or, where
          there is none, from surveys. Members of each tradition haven&rsquo;t reviewed them yet.
        </p>
      </section>
    );
  }

  // -------------------------------------------------------------------------
  // 2. Quick start
  // -------------------------------------------------------------------------
  if (screen === "quick") {
    const chosen = packById(quickPack);
    return (
      <section className={styles.intro}>
        {errorBanner}
        <button type="button" className={styles.back} onClick={() => go("start")}>
          &larr; Back
        </button>
        <h1>Quick start</h1>
        <div className={styles.step}>
          <h2>1. Which tradition is closest to your family&rsquo;s?</h2>
          <div className={styles.trads} role="group" aria-label="Tradition">
            {packs.map((p) => (
              <button
                key={p.id}
                type="button"
                className={styles.trad}
                aria-pressed={quickPack === p.id}
                onClick={() => setQuickPack(p.id)}
              >
                <strong>{p.shortName}</strong>
                {p.subtitle ? <small>{p.subtitle}</small> : null}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.step}>
          <h2>2. Your political leaning</h2>
          <p className={styles.fine}>It changes how a few traditions handle 8 subjects, like politics and how history is told.</p>
          <LeanPicker value={quickLean} onChange={setQuickLean} />
        </div>
        <div className={styles.step}>
          <button
            type="button"
            className={styles.btn}
            disabled={!chosen || busy > 0}
            onClick={async () => {
              if (!chosen) return;
              if (await run(() => actions.quickStart(chosen.id, quickLean))) {
                setLeanState(quickLean);
                go("list");
              }
            }}
          >
            {busy > 0 ? "Filling in…" : "Fill in our answers"}
          </button>
          <p className={styles.fine}>
            {!chosen
              ? "Pick a tradition first."
              : answeredCount
                ? `Fills the ${points.length - answeredCount} subjects you haven't answered and keeps your ${answeredCount} answers.`
                : `Fills all ${points.length} subjects from the ${chosen.shortName} answers. You can change any of them next.`}
          </p>
        </div>
      </section>
    );
  }

  // -------------------------------------------------------------------------
  // 3. Bring answers over from the tryout page
  // -------------------------------------------------------------------------
  if (screen === "import") {
    return (
      <ImportScreen
        answeredCount={answeredCount}
        busy={busy > 0}
        errorBanner={errorBanner}
        onBack={() => go("start")}
        onImport={async (text) => {
          const parsed = parseChooserExport(text);
          if ("error" in parsed) {
            setError(parsed.error);
            return;
          }
          setError(null);
          if (await run(() => actions.importAnswers(text))) {
            setLeanState(parsed.lean);
            setQuickLean(parsed.lean);
            setQuickPack(packs.find((p) => p.slug === parsed.quick)?.id ?? null);
            go("list");
          }
        }}
      />
    );
  }

  // -------------------------------------------------------------------------
  // 4. The list
  // -------------------------------------------------------------------------
  const shownPacks = packs.filter((p) => !hidden.includes(p.slug));
  const answered = points.filter((p) => answers[p.number]);
  const ranking = packs
    .map((p) => ({
      p,
      score: answered.filter((pt) => {
        const e = entryFor(p, pt.number);
        return e && answerOf(e) === answerOf(answers[pt.number]);
      }).length,
    }))
    .sort((a, b) => b.score - a.score);

  const areas: { area: string; points: PointView[] }[] = [];
  for (const pt of points) {
    const kinds = new Set(shownPacks.map((p) => entryFor(p, pt.number)).map((e) => (e ? answerOf(e) : null)));
    if (diffOnly && kinds.size < 2 && !answers[pt.number]) continue;
    if (areas.at(-1)?.area !== pt.area) areas.push({ area: pt.area, points: [] });
    areas.at(-1)!.points.push(pt);
  }

  return (
    <>
      {errorBanner}
      {saving}
      <div className={styles.listHead}>
        <Link href="/parent" className={styles.home}>
          &larr; Quark home
        </Link>
        <h1>Our Family&rsquo;s Beliefs</h1>
        <p className={styles.lede}>
          For each subject, tap the answer you&rsquo;d give, or tap a tradition&rsquo;s answer to use its wording too.
          Answered subjects fold up. Tap Change to look again or to add your own words.{" "}
          <button type="button" className={styles.back} onClick={() => go("start")}>
            How this works
          </button>
        </p>
        <p className={styles.fine}>
          <Link href="/parent/beliefs/compare">Compare with the other parent and read the rulebook &rarr;</Link>
        </p>
      </div>

      <section className={styles.panel} aria-labelledby="yours-title">
        <div className={styles.progressRow}>
          <h2 id="yours-title">Your answers</h2>
          <span className={styles.count}>
            {answeredCount} of {points.length} answered
          </span>
        </div>
        <div className={styles.progress}>
          <span style={{ width: `${(answeredCount / points.length) * 100}%` }} />
        </div>
        <div className={styles.controls}>
          <div className={styles.control}>
            <span className={styles.label} id="lean-label">
              Political leaning
            </span>
            <LeanPicker
              value={lean}
              labelledBy="lean-label"
              onChange={(next) => {
                setLeanState(next);
                setQuickLean(next);
                run(() => actions.setLean(next));
              }}
            />
          </div>
          <label className={cls(styles.check, styles.control)}>
            <input type="checkbox" checked={diffOnly} onChange={(e) => setDiffOnly(e.target.checked)} /> Hide subjects
            where every tradition agrees
          </label>
          {answeredCount === 0 ? (
            <button type="button" className={cls(styles.btn, styles.quiet)} onClick={() => go("quick")}>
              Quick start
            </button>
          ) : (
            <ClearAll onClear={() => run(() => actions.clearAll(), () => ({}))} />
          )}
        </div>
        <p className={styles.fine}>
          Changing your leaning re-fills only the subjects quick start filled in that you haven&rsquo;t changed since.
        </p>
      </section>

      <section className={styles.panel} aria-live="polite">
        <h2>Traditions closest to your answers</h2>
        <p className={styles.fine}>
          {answered.length
            ? `How many of your ${answered.length} answer${answered.length === 1 ? "" : "s"} each tradition shares. Tap a name to hide or show its cards.`
            : "As you answer, the traditions that share the most of your answers rise to the top."}
        </p>
        <div className={styles.ranks}>
          {ranking.map(({ p, score }) => {
            const shown = !hidden.includes(p.slug);
            const pct = answered.length ? Math.round((score / answered.length) * 100) : 0;
            return (
              <div key={p.id} className={styles.rank}>
                <button
                  type="button"
                  aria-pressed={shown}
                  title={shown ? "Hide this tradition's cards" : "Show this tradition's cards"}
                  onClick={() => setHidden((h) => (shown ? [...h, p.slug] : h.filter((x) => x !== p.slug)))}
                >
                  {p.shortName}
                </button>
                <span className={styles.score}>{answered.length ? `${score} of ${answered.length}` : ""}</span>
                <div className={styles.bar}>
                  <span style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div>
        {areas.length === 0 ? (
          <p className={styles.muted}>
            Every shown tradition gives the same answer on every subject. Show more traditions, or untick the filter.
          </p>
        ) : null}
        {areas.map(({ area, points: pts }) => (
          <section key={area} className={styles.area}>
            <h2>{area}</h2>
            {pts.map((pt) => {
              const mine = answers[pt.number];
              if (mine && !open.has(pt.number)) {
                const src = packById(mine.fromPack);
                return (
                  <div key={pt.number} className={cls(styles.point, styles.done)} id={`p${pt.number}`}>
                    <div className={styles.doneRow}>
                      <span className={styles.num}>{pt.number}</span>
                      <span className={styles.name}>{pt.name}</span>
                      <span className={cls(styles.chip, color(answerOf(mine)))}>{labelFor(mine)}</span>
                      <span className={styles.from}>
                        {src ? `from ${src.shortName}` : "your own pick"}
                        {mine.note ? " · with your words" : ""}
                      </span>
                      <button
                        type="button"
                        className={cls(styles.btn, styles.quiet)}
                        onClick={() => setPointOpen(pt.number, true)}
                      >
                        Change
                      </button>
                    </div>
                    <Blocks point={pt.number} blocks={initial.blocks} />
                  </div>
                );
              }
              return (
                <OpenPoint
                  key={pt.number}
                  point={pt}
                  blocks={initial.blocks}
                  mine={mine}
                  packs={shownPacks}
                  kids={children}
                  entryFor={entryFor}
                  entryLabel={entryLabel}
                  onChoose={(id, pack) => choose(pt.number, id, pack)}
                  onClear={() => clear(pt.number)}
                  onDone={() => setPointOpen(pt.number, false)}
                  onAge={(childId, age) =>
                    run(
                      () => actions.setAge(pt.number, childId, age),
                      edit(pt.number, { ages: { ...mine?.ages, [childId]: age } }),
                    )
                  }
                  onReady={(ready) =>
                    run(
                      () => actions.setReady(pt.number, ready),
                      edit(pt.number, { perspective: ready === "ours" ? "family_tradition" : "several_fairly" }),
                    )
                  }
                  onNote={(note) => run(() => actions.setNote(pt.number, note), edit(pt.number, { note: note.trim() }))}
                />
              );
            })}
          </section>
        ))}
      </div>

      <ConductPanel kids={children} initial={initial.conduct} save={(call) => run(call)} />

      <ActsPanel initial={initial.acts} tradition={packById(quickPack)} save={(call) => run(call)} />

      <section className={cls(styles.panel, styles.words)}>
        <h2>Last: in your own words</h2>
        <p className={styles.fine}>
          A sentence or two each, if you like. Quark reads these whenever it writes a lesson, so the lessons sound like
          your family.
        </p>
        {WORD_PROMPTS.map(([field, prompt]) => (
          <label key={field}>
            {prompt}
            <textarea
              defaultValue={initial.words[field]}
              maxLength={1000}
              onBlur={async (e) => {
                const value = e.currentTarget.value;
                if (value.trim() === (e.currentTarget.dataset.saved ?? initial.words[field]).trim()) return;
                e.currentTarget.dataset.saved = value;
                const result = await actions.setWords(field, value).catch(() => ({ error: "Couldn't reach Quark." }));
                if (result.error) setError(`${result.error} Reload the page to see what was saved.`);
              }}
            />
          </label>
        ))}
      </section>

      <footer className={styles.footer}>
        Your answers are saved as you go. The other parent can see them, and you&rsquo;ll{" "}
        <Link href="/parent/beliefs/compare">compare answers together</Link> before anything reaches your kids. The traditions&rsquo; answers are drafts made from each tradition&rsquo;s own
        published documents, or from surveys where it has no official body, with sources on every card. Members of each
        tradition haven&rsquo;t reviewed them yet, and they describe official teaching, not what every family in a
        tradition believes.
      </footer>
    </>
  );
}

function LeanPicker({
  value,
  onChange,
  labelledBy,
}: {
  value: LeanChoice;
  onChange: (lean: LeanChoice) => void;
  labelledBy?: string;
}) {
  return (
    <div className={styles.seg} role="group" aria-label={labelledBy ? undefined : "Political leaning"} aria-labelledby={labelledBy}>
      {LEAN_LABELS.map(([id, label]) => (
        <button key={id} type="button" aria-pressed={value === id} onClick={() => value !== id && onChange(id)}>
          {label}
        </button>
      ))}
    </div>
  );
}

function ClearAll({ onClear }: { onClear: () => void }) {
  const [armed, setArmed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  return (
    <button
      type="button"
      className={cls(styles.btn, styles.warn)}
      onClick={() => {
        clearTimeout(timer.current);
        if (!armed) {
          setArmed(true);
          timer.current = setTimeout(() => setArmed(false), 4000);
          return;
        }
        setArmed(false);
        onClear();
      }}
    >
      {armed ? "Tap again to clear all 24" : "Clear all"}
    </button>
  );
}

// Who has blocked this subject, and the block / lift-my-block button. The blocks come from the
// server on every refresh, so they are read from props, not kept in state.
function Blocks({ point, blocks }: { point: number; blocks: BlockView[] }) {
  const here = blocks.filter((b) => b.point === point);
  const mine = here.find((b) => b.mine);
  return (
    <div className={styles.blockRow}>
      {here.length ? (
        <span className={styles.fine}>
          <span className={cls(styles.chip, styles["a-never"])}>Blocked by {here.map((b) => b.by).join(" and ")}</span>{" "}
          Quark won&rsquo;t bring this up, whatever either of you answers.
        </span>
      ) : null}
      <Blackball point={point} mine={mine?.id ?? null} />
    </div>
  );
}

function OpenPoint({
  point,
  blocks,
  mine,
  packs,
  kids,
  entryFor,
  entryLabel,
  onChoose,
  onClear,
  onDone,
  onAge,
  onReady,
  onNote,
}: {
  point: PointView;
  blocks: BlockView[];
  mine: AnswerView | undefined;
  packs: PackView[];
  kids: BeliefsData["children"];
  entryFor: (pack: PackView, point: number) => EntryView | null;
  entryLabel: (e: EntryView) => string;
  onChoose: (id: AnswerId, pack: PackView | null) => void;
  onClear: () => void;
  onDone: () => void;
  onAge: (childId: string, age: number) => void;
  onReady: (ready: "ours" | "fair") => void;
  onNote: (note: string) => void;
}) {
  const mineId = mine ? answerOf(mine) : null;
  return (
    <div className={styles.point} id={`p${point.number}`}>
      <div className={styles.pointHead}>
        <span className={styles.num}>{point.number}</span>
        <h3>{point.name}</h3>
      </div>
      <p className={styles.kidq}>{point.question}</p>
      <Blocks point={point.number} blocks={blocks} />

      <div className={styles.mine} role="group" aria-label={`Your answer on subject ${point.number}`}>
        <span className={styles.label}>Your answer</span>
        {ANSWERS.map((a) => {
          const pressed = mineId === a.id && !mine?.fromPack;
          return (
            <button
              key={a.id}
              type="button"
              className={color(a.id)}
              aria-pressed={pressed}
              onClick={() => (pressed ? onClear() : onChoose(a.id, null))}
            >
              {a.label}
            </button>
          );
        })}
        {mine ? (
          <button type="button" className={cls(styles.btn, styles.quiet)} onClick={onDone}>
            Done
          </button>
        ) : null}
      </div>

      {mine ? (
        <div className={cls(styles.extras, color(mineId))}>
          {mine.when === "from_age" ? (
            <>
              <div className={styles.ages}>
                <span className={styles.label}>Not until</span>
                {kids.map((kid) => {
                  const age = mine.ages[kid.id] ?? defaultAge(null, kid.age);
                  return (
                    <span key={kid.id} className={styles.age}>
                      {kid.nickname} <span className={styles.muted}>(now {kid.age})</span>
                      <span className={styles.stepper}>
                        <button
                          type="button"
                          aria-label={`Younger for ${kid.nickname}`}
                          disabled={age <= MIN_AGE}
                          onClick={() => onAge(kid.id, age - 1)}
                        >
                          &minus;
                        </button>
                        <span aria-live="polite">{age}</span>
                        <button
                          type="button"
                          aria-label={`Older for ${kid.nickname}`}
                          disabled={age >= MAX_AGE}
                          onClick={() => onAge(kid.id, age + 1)}
                        >
                          +
                        </button>
                      </span>
                    </span>
                  );
                })}
              </div>
              <div className={styles.ages}>
                <span className={styles.label}>Then</span>
                <div className={styles.seg} role="group" aria-label="Once they're old enough">
                  <button type="button" aria-pressed={mine.perspective === "family_tradition"} onClick={() => onReady("ours")}>
                    Answer from what we believe
                  </button>
                  <button type="button" aria-pressed={mine.perspective !== "family_tradition"} onClick={() => onReady("fair")}>
                    Answer, and show other views
                  </button>
                </div>
              </div>
            </>
          ) : null}
          <label className={styles.note}>
            <span className={styles.label}>What would you actually say? (optional)</span>
            <textarea
              key={`${point.number}:${mine.note}`}
              defaultValue={mine.note}
              maxLength={1000}
              placeholder="Your own words. Quark can use them when this comes up."
              onBlur={(e) => {
                if (e.currentTarget.value.trim() !== mine.note) onNote(e.currentTarget.value);
              }}
            />
          </label>
        </div>
      ) : null}

      <div className={styles.cards}>
        {packs.map((p) => {
          const e = entryFor(p, point.number);
          if (!e) {
            return (
              <div key={p.id} className={styles.card}>
                <strong>{p.shortName}</strong>
                <span className={styles.meta}>No answer for this subject.</span>
              </div>
            );
          }
          const id = answerOf(e);
          const chosen = !!mine && mine.fromPack === p.id;
          const match = !!mine && mineId === id;
          return (
            <article key={p.id} className={cls(styles.card, color(id), chosen ? styles.chosen : match && styles.match)}>
              <div className={styles.cardHead}>
                <strong>{p.shortName}</strong>
                {chosen ? (
                  <span className={styles.tick}>Your pick</span>
                ) : match ? (
                  <span className={styles.tick}>Same as yours</span>
                ) : null}
              </div>
              <div>
                <button
                  type="button"
                  className={cls(styles.chip, color(id))}
                  aria-pressed={chosen}
                  title={chosen ? "Tap to undo" : "Use this tradition's answer for this subject"}
                  onClick={() => (chosen ? onClear() : onChoose(id, p))}
                >
                  {entryLabel(e)}
                </button>
                {chosen ? null : <span className={styles.useHint}> tap to use</span>}
              </div>
              <p className={styles.position}>{e.position}</p>
              {e.split && e.split !== "none" ? (
                <div className={styles.meta}>
                  <strong>Split: </strong>
                  {e.split}
                </div>
              ) : null}
              {e.needs_check ? <div className={styles.flag}>Needs checking: the drafter wasn&rsquo;t sure of this one.</div> : null}
              <details>
                <summary>What your child would hear, notes for you, sources</summary>
                <div className={styles.meta}>
                  <strong>Your child hears: </strong>
                  {e.handoff || "None"}
                </div>
                {e.parent_note ? (
                  <div className={styles.meta}>
                    <strong>For you: </strong>
                    {e.parent_note}
                  </div>
                ) : null}
                <div className={styles.meta}>
                  <strong>Sources: </strong>
                  <SourceLinks pack={p} source={e.source} />
                </div>
              </details>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function SourceLinks({ pack, source }: { pack: PackView; source: string | null }) {
  const ids: string[] = String(source ?? "").match(/[a-z0-9][a-z0-9._-]*/gi) ?? [];
  const found = pack.sources.filter((s) => ids.includes(s.id) && /^https?:\/\//.test(s.url));
  if (!found.length) return <span>{source || "No source listed"}</span>;
  return (
    <>
      {found.map((s, i) => (
        <Fragment key={s.id}>
          {i ? "; " : ""}
          <a href={s.url} target="_blank" rel="noopener noreferrer">
            {s.title}
          </a>
        </Fragment>
      ))}
    </>
  );
}

function ImportScreen({
  answeredCount,
  busy,
  errorBanner,
  onBack,
  onImport,
}: {
  answeredCount: number;
  busy: boolean;
  errorBanner: ReactNode;
  onBack: () => void;
  onImport: (text: string) => void;
}) {
  const [text, setText] = useState("");
  return (
    <section className={styles.intro}>
      {errorBanner}
      <button type="button" className={styles.back} onClick={onBack}>
        &larr; Back
      </button>
      <h1>Bring your answers over</h1>
      <ol className={styles.facts}>
        <li>
          <span className={styles.dot}>1</span>
          <span>On the same computer and browser you used before, open the tryout page.</span>
        </li>
        <li>
          <span className={styles.dot}>2</span>
          <span>
            At the bottom of its list, tap <strong>Copy my answers</strong>.
          </span>
        </li>
        <li>
          <span className={styles.dot}>3</span>
          <span>Paste them below.</span>
        </li>
      </ol>
      <textarea
        className={styles.paste}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder='{"kind":"quark-beliefs", …}'
        aria-label="Answers copied from the tryout page"
      />
      <div className={styles.step}>
        <button type="button" className={styles.btn} disabled={!text.trim() || busy} onClick={() => onImport(text)}>
          {busy ? "Bringing them over…" : "Bring them over"}
        </button>
        {answeredCount ? (
          <p className={styles.fine}>
            You already have {answeredCount} answers here. Answers you bring over replace these on the same subjects.
          </p>
        ) : null}
      </div>
    </section>
  );
}
