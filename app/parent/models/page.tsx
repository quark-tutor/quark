import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { PRICES, PRICES_CHECKED, SPEECH_PRICES, SPEECH_PRICES_CHECKED } from "@/core/prices";
import { HEAR_MODEL, TUTOR_VOICE } from "@/core/speech";
import { estimate, OLD_WEEK_ESTIMATE, type RecordedRun, type RunModel } from "@/core/runs";
import { requireGuardian } from "@/lib/guardian";
import { createClient } from "@/lib/supabase/server";
import styles from "../beliefs/beliefs.module.css";
import own from "./models.module.css";

export const metadata: Metadata = { title: "Models and costs · Quark" };

// What Quark spends on language models and on which ones, read-only. The models are set in
// .env.local (and Vercel's environment), never here (decided 16 Oct 2026). Runs come from
// model_runs, which week:build and content:fetch write at the end of each run.
export default function ModelsPage() {
  return (
    <main className={styles.page}>
      <Suspense fallback={<p className={styles.muted}>Loading…</p>}>
        <Models />
      </Suspense>
    </main>
  );
}

const JOBS = [
  { use: "curate", env: "QUARK_MODEL_CURATE", job: "Ideas", what: "The facts for each day and slot, shared by both children. One call per day-slot." },
  { use: "write", env: "QUARK_MODEL_WRITE", job: "Cards", what: "Each child's cards, written at their level through a lens. One call per child per day-slot." },
  { use: "gate", env: "QUARK_MODEL_GATE", job: "Gate and content flags", what: "Flags pictures and recordings when they're fetched, and checks every card against your rulebook. One call per card." },
] as const;

type Run = RecordedRun & { id: string; started_at: string; theme_id: string | null; week: number | null; cost: number; cost_complete: boolean };

const money = (n: number) => `$${n < 10 ? n.toFixed(2) : n.toFixed(0)}`;
const tokens = (n: number) => (n >= 10_000 ? `${Math.round(n / 1000).toLocaleString()}k` : n.toLocaleString());

async function Models() {
  await connection(); // the environment and the runs are read per request
  const guardian = await requireGuardian();
  if (!guardian) {
    return <p>This account isn&rsquo;t set up as a guardian. Ask whoever runs Quark to add you.</p>;
  }

  // Row-level security keeps the runs to the guardian's own family.
  const supabase = await createClient();
  const [family, kids, runs, themes, speech] = await Promise.all([
    supabase.from("families").select("timezone").single(),
    supabase.from("children").select("id", { count: "exact", head: true }),
    supabase
      .from("model_runs")
      .select("id, kind, ok, started_at, finished_at, theme_id, week, days, children, models, cost, cost_complete")
      .order("finished_at", { ascending: false })
      .returns<Run[]>(),
    supabase.from("themes").select("id, title"),
    supabase.from("speech_runs").select("kind, characters, seconds, cost, created_at").returns<SpeechRow[]>(),
  ]);
  for (const r of [family, kids, runs, themes, speech]) if (r.error) throw new Error(r.error.message);

  const timeZone = family.data?.timezone ?? "Pacific/Honolulu";
  const when = (iso: string) => new Date(iso).toLocaleString("en-US", { timeZone, dateStyle: "medium", timeStyle: "short" });
  const checked = new Date(`${PRICES_CHECKED}T00:00:00Z`).toLocaleDateString("en-US", { timeZone: "UTC", dateStyle: "long" });
  const children = kids.count ?? 0;
  const all = runs.data ?? [];
  const themeTitle = new Map((themes.data ?? []).map((t) => [t.id, t.title as string]));
  const est = estimate(all, children);
  const spent = all.reduce((s, r) => s + Number(r.cost), 0);
  const inUse = new Set(JOBS.map((j) => process.env[j.env]).filter(Boolean));
  const monthStart = new Date().toLocaleDateString("en-CA", { timeZone }).slice(0, 7); // "2026-10", where the family lives
  const thisMonth = (speech.data ?? []).filter((r) => new Date(r.created_at).toLocaleDateString("en-CA", { timeZone }).startsWith(monthStart));
  const speechAll = tally(speech.data ?? []);
  const speechMonth = tally(thisMonth);
  const speechChecked = new Date(`${SPEECH_PRICES_CHECKED}T00:00:00Z`).toLocaleDateString("en-US", { timeZone: "UTC", dateStyle: "long" });
  const speechKey = Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GOOGLE_CREDENTIALS_JSON);

  return (
    <>
      <div className={styles.listHead}>
        <Link href="/parent" className={styles.home}>
          &larr; Quark
        </Link>
        <h1>Models and costs</h1>
        <p className={styles.lede}>
          Which language model does each job, what they charge, and what every run has spent so far. This page only
          shows them: the models are chosen in the settings file where Quark runs (<code>.env.local</code>, and
          Vercel&rsquo;s environment), so they can&rsquo;t be changed here by accident.
        </p>
      </div>

      <section className={own.section}>
        <h2>Which model does which job</h2>
        <div className={own.scroll}>
          <table className={own.table}>
            <thead>
              <tr>
                <th>Job</th>
                <th>Model</th>
                <th className={own.num}>Per million tokens in / out</th>
              </tr>
            </thead>
            <tbody>
              {JOBS.map((j) => {
                const model = process.env[j.env];
                const price = model ? PRICES[model] : undefined;
                return (
                  <tr key={j.env}>
                    <td>
                      <strong>{j.job}</strong>
                      <br />
                      <span className={styles.meta}>{j.what}</span>
                    </td>
                    <td>
                      {model ? <code>{model}</code> : <span className={styles.flag}>Not set</span>}
                      <br />
                      <span className={styles.meta}>
                        <code>{j.env}</code>
                      </span>
                    </td>
                    <td className={own.num}>
                      {price ? `$${price.input} / $${price.output}` : model ? <span className={styles.flag}>Price unknown</span> : "–"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className={own.section}>
        <h2>The tutor&rsquo;s voice and ears</h2>
        <p>
          <strong>Google&rsquo;s key: {speechKey ? "set up" : "not set up"}</strong>
        </p>
        <p className={styles.muted}>
          The tutor reads a card, a hint or a handoff aloud in one voice, <code>{TUTOR_VOICE}</code>, and hears a
          child&rsquo;s spoken answer through Talk with <code>{HEAR_MODEL}</code>, both from Google Cloud. A line&rsquo;s
          audio is made the first time a child taps it and kept, so a line is paid for once; a clip is paid for each time,
          by its length. Quark keeps no recording of a child and no words but the answer the child sends. The voice is set
          in <code>core/speech.ts</code>; the key is never shown here.
        </p>
        <div className={own.scroll}>
          <table className={own.table}>
            <thead>
              <tr>
                <th>What</th>
                <th className={own.num}>This month</th>
                <th className={own.num}>Since the start</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  Lines made
                  <br />
                  <span className={styles.meta}>and the characters sent to the voice</span>
                </td>
                <td className={own.num}>
                  {speechMonth.says.toLocaleString()}
                  <br />
                  <span className={styles.meta}>{speechMonth.characters.toLocaleString()}</span>
                </td>
                <td className={own.num}>
                  {speechAll.says.toLocaleString()}
                  <br />
                  <span className={styles.meta}>{speechAll.characters.toLocaleString()}</span>
                </td>
              </tr>
              <tr>
                <td>
                  Clips heard
                  <br />
                  <span className={styles.meta}>and the minutes of talking</span>
                </td>
                <td className={own.num}>
                  {speechMonth.hears.toLocaleString()}
                  <br />
                  <span className={styles.meta}>{(speechMonth.seconds / 60).toFixed(1)}</span>
                </td>
                <td className={own.num}>
                  {speechAll.hears.toLocaleString()}
                  <br />
                  <span className={styles.meta}>{(speechAll.seconds / 60).toFixed(1)}</span>
                </td>
              </tr>
              <tr>
                <td>At list price, before the free tier</td>
                <td className={own.num}>{money(speechMonth.cost)}</td>
                <td className={own.num}>{money(speechAll.cost)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className={styles.muted}>
          This month&rsquo;s lines used {speechMonth.characters.toLocaleString()} of the{" "}
          {SPEECH_PRICES.say.freeCharactersPerMonth.toLocaleString()} characters Google gives free each month. The real bill
          is in the Google Cloud console.
        </p>
      </section>

      <section className={own.section}>
        <h2>The Sunday build</h2>
        <p>
          <strong>The Sunday build: {process.env.CRON_SECRET ? "set up" : "not set up"}</strong>
        </p>
        <p className={styles.muted}>
          On Sunday, Hawaii time, Vercel calls the build once at each of eight hours, and each call builds a day of next
          week and leaves it for you to read. It runs only where <code>CRON_SECRET</code> is set, the same value Vercel
          sends. The value is never shown here.
        </p>
      </section>

      <section className={own.section}>
        <h2>Prices</h2>
        <p className={styles.muted}>
          Anthropic&rsquo;s list prices in dollars per million tokens, last checked {checked}. They live in{" "}
          <code>core/prices.ts</code>; a run is priced when it ends, so a later change doesn&rsquo;t rewrite past runs.
        </p>
        <div className={own.scroll}>
          <table className={own.table}>
            <thead>
              <tr>
                <th>Model</th>
                <th className={own.num}>Input</th>
                <th className={own.num}>Output</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(PRICES).map(([model, p]) => (
                <tr key={model}>
                  <td>
                    <code>{model}</code>
                    {inUse.has(model) ? <span className={styles.meta}> · in use</span> : null}
                  </td>
                  <td className={own.num}>${p.input.toFixed(2)}</td>
                  <td className={own.num}>${p.output.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={styles.muted}>
          Google&rsquo;s list prices for the tutor&rsquo;s voice and ears, last checked {speechChecked}, also in{" "}
          <code>core/prices.ts</code>:
        </p>
        <div className={own.scroll}>
          <table className={own.table}>
            <thead>
              <tr>
                <th>Service</th>
                <th className={own.num}>Price</th>
                <th className={own.num}>Free each month</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{SPEECH_PRICES.say.name}</td>
                <td className={own.num}>${SPEECH_PRICES.say.perMillionCharacters} per million characters</td>
                <td className={own.num}>{SPEECH_PRICES.say.freeCharactersPerMonth.toLocaleString()} characters</td>
              </tr>
              <tr>
                <td>{SPEECH_PRICES.hear.name}</td>
                <td className={own.num}>${SPEECH_PRICES.hear.perMinute} a minute, each clip rounded up to the second</td>
                <td className={own.num}>
                  {SPEECH_PRICES.hear.freeMinutesPerMonth === null ? "none named" : `${SPEECH_PRICES.hear.freeMinutesPerMonth} minutes`}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className={own.section}>
        <h2>What a week costs</h2>
        {est ? (
          <>
            <div className={own.estimate}>
              <div className={own.figure}>
                <span className={styles.meta}>A seven-day week, {est.children === 1 ? "one child" : `${est.children} children`}</span>
                <strong>about {money(est.week)}</strong>
              </div>
              <div className={own.figure}>
                <span className={styles.meta}>A month</span>
                <strong>about {money(est.month)}</strong>
              </div>
              <div className={own.figure}>
                <span className={styles.meta}>The first guess (docs/04, 14 Oct)</span>
                <strong>{money(OLD_WEEK_ESTIMATE)} a week</strong>
              </div>
            </div>
            <p className={styles.muted}>
              This is an estimate, not a bill. It takes the cost per day of the most recent week builds: ideas at{" "}
              {money(est.ideasPerDay)} a day ({est.ideaDays} day{est.ideaDays === 1 ? "" : "s"} built in {est.ideaRuns} run
              {est.ideaRuns === 1 ? "" : "s"}) and cards at {money(est.cardsPerChildDay)} per child per day ({est.cardChildDays}{" "}
              child-day{est.cardChildDays === 1 ? "" : "s"} in {est.cardRuns} run{est.cardRuns === 1 ? "" : "s"})
              {est.gateRuns ? (
                <>
                  {" "}and the checker at {money(est.gatePerChildDay)} per child per day ({est.gateChildDays} child-day
                  {est.gateChildDays === 1 ? "" : "s"} in {est.gateRuns} run{est.gateRuns === 1 ? "" : "s"})
                </>
              ) : null}
              , times seven days, with the second asks those runs needed. A month is 52 weeks over 12. It leaves out fetching
              pictures (a one-off per item)
              {est.gateRuns ? "" : " and the checker, which no recorded week build has run yet"}. The real bill is in
              Anthropic&rsquo;s console.
            </p>
            {est.pricesMissing ? (
              <p className={styles.flag}>Some runs used a model without a known price, so this estimate is too low.</p>
            ) : null}
          </>
        ) : (
          <p className={styles.muted}>
            No week build has been recorded yet, so there&rsquo;s nothing real to estimate from. The first guess, in docs/04
            on 14 Oct, was about {money(OLD_WEEK_ESTIMATE)} for a seven-day week for two children. The next{" "}
            <code>npm run week:build</code> will give a real figure.
          </p>
        )}
      </section>

      <section className={own.section}>
        <h2>Every run</h2>
        {all.length === 0 ? (
          <p className={styles.muted}>
            None recorded yet. Runs are recorded from 16 Oct 2026; earlier ones only printed their cost (day 1 on 15 Oct came
            to $0.91).
          </p>
        ) : (
          <>
            <p className={styles.muted}>
              {all.length} run{all.length === 1 ? "" : "s"}, {money(spent)} in all
              {all.some((r) => !r.cost_complete) ? ", plus models without a known price" : ""}.
            </p>
            <div className={own.scroll}>
              <table className={own.table}>
                <thead>
                  <tr>
                    <th>When</th>
                    <th>What</th>
                    <th>Calls per model</th>
                    <th className={own.num}>Tokens in / out</th>
                    <th className={own.num}>Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {all.map((r) => (
                    <tr key={r.id}>
                      <td>{when(r.finished_at)}</td>
                      <td>
                        {describe(r, r.theme_id ? themeTitle.get(r.theme_id) : undefined)}
                        {r.ok ? null : (
                          <>
                            <br />
                            <span className={styles.flag}>Stopped part way</span>
                          </>
                        )}
                      </td>
                      <td>
                        {r.models.length === 0 ? <span className={styles.meta}>No model calls</span> : r.models.map((m) => <ModelLine key={`${m.use} ${m.model}`} m={m} />)}
                      </td>
                      <td className={own.num}>
                        {r.models.map((m) => (
                          <div key={`${m.use} ${m.model}`}>
                            {tokens(m.input)} / {tokens(m.output)}
                          </div>
                        ))}
                      </td>
                      <td className={own.num}>
                        {money(Number(r.cost))}
                        {r.cost_complete ? "" : "+"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </>
  );
}

type SpeechRow = { kind: string; characters: number; seconds: number; cost: number; created_at: string };

// Counts and money only: how many lines were made and clips heard, and what they came to.
function tally(rows: SpeechRow[]) {
  const t = { says: 0, characters: 0, hears: 0, seconds: 0, cost: 0 };
  for (const r of rows) {
    if (r.kind === "say") {
      t.says += 1;
      t.characters += r.characters;
    } else {
      t.hears += 1;
      t.seconds += Number(r.seconds);
    }
    t.cost += Number(r.cost);
  }
  return t;
}

const USE_NAMES: Record<string, string> = { curate: "ideas", write: "cards", gate: "gate" };

function ModelLine({ m }: { m: RunModel }) {
  return (
    <div>
      {m.calls} {USE_NAMES[m.use] ?? m.use} on <code>{m.model}</code>
      {m.cost === null ? <span className={styles.flag}> price unknown</span> : null}
    </div>
  );
}

function describe(r: Run, title?: string) {
  if (r.kind === "content:fetch") return "Fetching pictures and recordings";
  const days = r.days ? `${r.days} day${r.days === 1 ? "" : "s"}` : "";
  const kids = r.children ? `${r.children === 1 ? "one child" : `${r.children} children`}` : "";
  return (
    <>
      Week {r.week ?? "?"}
      {title ? `, ${title}` : ""}
      <br />
      <span className={styles.meta}>{[days, kids].filter(Boolean).join(", ")}</span>
    </>
  );
}
