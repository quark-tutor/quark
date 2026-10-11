import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { ANSWERS, answerOf, type AnswerId } from "@/lib/beliefs";
import { choiceLabel, CONDUCT_QUESTIONS, PER_CHILD, CHOICE_KEYS, type ConductKey } from "@/lib/conduct";
import { loadFamilyInputs, merge, saveFamilyValues } from "@/lib/family-save";
import type { ChildInput, FamilyConduct, FamilyPoint, GuardianInput } from "@/lib/family-values";
import { requireGuardian } from "@/lib/guardian";
import { createClient } from "@/lib/supabase/server";
import { LEARNS_LABELS, type LearnsToAct, type Perspective, type When } from "@/lib/values";
import { Blackball } from "./blackball";
import styles from "../beliefs.module.css";

export const metadata: Metadata = { title: "Compare answers · Quark" };

// Part 4 of the interview: every guardian's answers side by side, and what the family's values
// became. The merge runs on the server after every change; this page shows its result.
export default function ComparePage() {
  return (
    <main className={styles.page}>
      <Suspense fallback={<p className={styles.muted}>Loading…</p>}>
        <Compare />
      </Suspense>
    </main>
  );
}

const cls = (...names: (string | false | null | undefined)[]) => names.filter(Boolean).join(" ");
const answerLabel = (id: AnswerId) => ANSWERS.find((a) => a.id === id)!.label;

type Setting = { when: When; perspective: Perspective; ages: Record<string, number> };

function SettingChip({ setting, kids }: { setting: Setting; kids: ChildInput[] }) {
  const id = answerOf(setting);
  const label =
    id === "later"
      ? `Not yet: ${kids.map((k) => `${k.nickname} ${setting.ages[k.id] ?? "?"}`).join(", ")}, then ${
          setting.perspective === "family_tradition" ? "from what we believe" : "other views too"
        }`
      : answerLabel(id);
  return <span className={cls(styles.chip, styles[`a-${id}`])}>{label}</span>;
}

async function Compare() {
  await connection();
  const guardian = await requireGuardian();
  if (!guardian) {
    return <p>This account isn&rsquo;t set up as a guardian. Ask whoever runs Quark to add you.</p>;
  }
  // Bring the family's values up to date first (a no-op when nothing changed).
  await saveFamilyValues(guardian.familyId, guardian.id);
  const supabase = await createClient();
  const [inputs, profile] = await Promise.all([
    loadFamilyInputs(supabase, guardian.familyId),
    supabase.from("values_profiles").select("version, saved_at").maybeSingle(),
  ]);
  if (profile.error) throw new Error(profile.error.message);
  const values = merge(inputs);
  const { guardians, children: kids, points } = inputs;
  const name = (id: string) => guardians.find((g) => g.id === id)?.name ?? "A guardian";
  const packName = (id: string | null) => inputs.packs.find((p) => p.id === id)?.shortName;
  const count = (status: FamilyPoint["status"]) => values.points.filter((p) => p.status === status);
  const differ = count("differ");
  const waiting = count("waiting");

  return (
    <>
      <div className={styles.listHead}>
        <Link href="/parent/beliefs" className={styles.home}>
          &larr; Your answers
        </Link>
        <h1>Compare answers</h1>
        <p className={styles.lede}>
          {guardians.map((g) => g.name).join(" and ")}, side by side. Where you agree, Quark follows your answer. Where you
          differ, the subject waits for you: Quark sends the question to you until you agree. Either of you can block
          any subject, and only the one who blocked it can lift it.
        </p>
        <p className={styles.fine}>
          <Link href="/parent/beliefs/rulebook">Read the rulebook Quark follows &rarr;</Link>
          {profile.data?.version ? ` Version ${profile.data.version}.` : ""}
        </p>
      </div>

      <section className={styles.panel} aria-labelledby="summary-title">
        <h2 id="summary-title">Where you stand</h2>
        <ul className={styles.summary}>
          <li>
            <strong>{count("agreed").length}</strong> agreed
          </li>
          <li>
            <strong>{differ.length}</strong> where you differ
            {differ.length ? (
              <>
                {": "}
                {differ.map((p, i) => (
                  <span key={p.point}>
                    {i ? ", " : ""}
                    <a href={`#c${p.point}`}>{p.point}</a>
                  </span>
                ))}
              </>
            ) : null}
          </li>
          <li>
            <strong>{waiting.length}</strong> waiting for an answer
            {guardians.map((g) => {
              const n = waiting.filter((p) => p.waitingOn.includes(g.id)).length;
              return n ? ` · ${g.name} has ${n} to go` : "";
            })}
          </li>
          <li>
            <strong>{count("blocked").length}</strong> blocked
          </li>
        </ul>
      </section>

      {groupByArea(points).map(({ area, items }) => (
        <section key={area} className={styles.area}>
          <h2>{area}</h2>
          {items.map((pt) => {
            const fp = values.points[pt.number - 1];
            const mine = fp.blackballs.find((b) => b.placedBy === guardian.id);
            return (
              <div key={pt.number} id={`c${pt.number}`} className={cls(styles.point, styles.compare, fp.status === "differ" && styles.differ)}>
                <div className={styles.pointHead}>
                  <span className={styles.num}>{pt.number}</span>
                  <h3>{pt.name}</h3>
                </div>
                <dl className={styles.sides}>
                  {guardians.map((g) => {
                    const a = g.answers[pt.number];
                    return (
                      <div key={g.id}>
                        <dt>{g.name}</dt>
                        <dd>
                          {a ? <SettingChip setting={a} kids={kids} /> : <span className={styles.muted}>Not answered yet</span>}
                          {a?.fromPack ? <span className={styles.from}> from {packName(a.fromPack)}</span> : null}
                          {a?.note ? <span className={styles.from}> · with their words</span> : null}
                        </dd>
                      </div>
                    );
                  })}
                  <div className={styles.result}>
                    <dt>Quark follows</dt>
                    <dd>
                      <PointResult fp={fp} kids={kids} name={name} />
                    </dd>
                  </div>
                </dl>
                <Blackball point={pt.number} mine={mine?.id ?? null} />
              </div>
            );
          })}
        </section>
      ))}

      <section className={cls(styles.panel, styles.words)} aria-labelledby="conduct-title">
        <h2 id="conduct-title">How Quark conducts itself</h2>
        <p className={styles.fine}>Where you differ, or one of you hasn&rsquo;t answered, the gentler setting applies.</p>
        {CHOICE_KEYS.map((key) => (
          <div key={key} className={styles.conduct}>
            <h3>{CONDUCT_QUESTIONS[key]}</h3>
            {(PER_CHILD.includes(key) ? kids : [null]).map((kid) => {
              const fc = values.conduct.find((c) => c.key === key && c.childId === (kid?.id ?? null));
              return (
                <dl key={kid?.id ?? "all"} className={styles.sides}>
                  {kid ? <div className={styles.label}>{kid.nickname}</div> : null}
                  {guardians.map((g) => (
                    <div key={g.id}>
                      <dt>{g.name}</dt>
                      <dd>{conductOf(g, key, kid?.id ?? null) ?? <span className={styles.muted}>Not answered yet</span>}</dd>
                    </div>
                  ))}
                  <div className={styles.result}>
                    <dt>Quark follows</dt>
                    <dd>
                      <ConductResult fc={fc} />
                    </dd>
                  </div>
                </dl>
              );
            })}
          </div>
        ))}
        <div className={styles.conduct}>
          <h3>{CONDUCT_QUESTIONS["conduct.crude_line"]}</h3>
          <dl className={styles.sides}>
            {guardians.map((g) => (
              <div key={g.id}>
                <dt>{g.name}</dt>
                <dd>{noteOf(g, "conduct.crude_line") ?? <span className={styles.muted}>Nothing written</span>}</dd>
              </div>
            ))}
            <div className={styles.result}>
              <dt>Quark follows</dt>
              <dd>
                {guardians.filter((g) => noteOf(g, "conduct.crude_line")).length > 1
                  ? "Declines a question as crude only when it fits both descriptions."
                  : "Declines what fits the description, without shaming."}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className={cls(styles.panel, styles.words)} aria-labelledby="acts-title">
        <h2 id="acts-title">How your kids learn to act</h2>
        <dl className={styles.sides}>
          {guardians.map((g) => {
            const learns = g.learns ?? (g.packId ? inputs.packActs[g.packId]?.learns : null) ?? null;
            const match = g.match ?? (g.packId ? inputs.packActs[g.packId]?.match : null) ?? false;
            return (
              <div key={g.id}>
                <dt>{g.name}</dt>
                <dd>
                  {learnsLabel(learns)}
                  {match ? "; heroes of each child's own sex first" : ""}
                </dd>
              </div>
            );
          })}
          <div className={styles.result}>
            <dt>Quark follows</dt>
            <dd>
              {learnsLabel(values.profile.learns)}
              {values.profile.match ? "; heroes of each child's own sex first" : ""}
              {guardians.length > 1 ? (
                <span className={styles.from}> (a difference becomes &ldquo;a mix&rdquo;; own-sex heroes only if you both want it)</span>
              ) : null}
            </dd>
          </div>
        </dl>
      </section>
    </>
  );
}

function PointResult({ fp, kids, name }: { fp: FamilyPoint; kids: ChildInput[]; name: (id: string) => string }) {
  switch (fp.status) {
    case "blocked":
      return (
        <span className={cls(styles.chip, styles["a-never"])}>
          Blocked by {fp.blackballs.map((b) => name(b.placedBy)).join(" and ")}
        </span>
      );
    case "waiting":
      return (
        <span className={styles.muted}>
          Waiting for {fp.waitingOn.map(name).join(" and ")}. Until then, Quark sends this question to you.
        </span>
      );
    case "differ":
      return (
        <span>
          <span className={cls(styles.chip, styles["a-us"])}>Send them to us</span>
          <span className={styles.flag}> You differ. Quark sends this to you until you agree.</span>
        </span>
      );
    case "agreed":
      return (
        <span>
          <SettingChip setting={fp.setting!} kids={kids} />
          {fp.setting!.notes.length ? <span className={styles.from}> · with your words</span> : null}
        </span>
      );
  }
}

function ConductResult({ fc }: { fc: FamilyConduct | undefined }) {
  if (!fc || fc.key === "conduct.crude_line") return null;
  const label = choiceLabel(fc.key as (typeof CHOICE_KEYS)[number], fc.value);
  return (
    <span>
      <strong>{label}</strong>
      {fc.status === "differ" ? <span className={styles.flag}> You differ; the gentler one applies until you talk.</span> : null}
      {fc.status === "waiting" ? <span className={styles.muted}> Not settled yet, so the gentlest setting applies.</span> : null}
    </span>
  );
}

function conductOf(g: GuardianInput, key: (typeof CHOICE_KEYS)[number], childId: string | null) {
  return choiceLabel(key, g.conduct.find((c) => c.key === key && c.childId === childId)?.value);
}

function noteOf(g: GuardianInput, key: ConductKey) {
  return g.conduct.find((c) => c.key === key && c.childId === null)?.note || null;
}

function learnsLabel(learns: LearnsToAct | null) {
  return LEARNS_LABELS.find(([id]) => id === learns)?.[1] ?? "Not chosen yet";
}

function groupByArea<P extends { area: string }>(points: P[]) {
  const out: { area: string; items: P[] }[] = [];
  for (const pt of points) {
    if (out.at(-1)?.area !== pt.area) out.push({ area: pt.area, items: [] });
    out.at(-1)!.items.push(pt);
  }
  return out;
}
