import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense, type ReactNode } from "react";
import { readFloor } from "@/core/curation/gate";
import { readSafetyFloor } from "@/core/prompts";
import { saveFamilyValues } from "@/lib/family-save";
import { requireGuardian } from "@/lib/guardian";
import { createClient } from "@/lib/supabase/server";
import styles from "../beliefs.module.css";
import type { TestResult } from "./actions";
import { TestRun, type KeptRun } from "./test-run";

export const metadata: Metadata = { title: "The rulebook · Quark" };

// The policy document (gate/values-interview.md, "What comes out"), exactly as the gate will read
// it. Generated from the family's merged values by lib/policy.ts; this page only displays it.
export default function RulebookPage() {
  return (
    <main className={styles.page}>
      <Suspense fallback={<p className={styles.muted}>Loading…</p>}>
        <Rulebook />
      </Suspense>
    </main>
  );
}

async function Rulebook() {
  await connection();
  const guardian = await requireGuardian();
  if (!guardian) {
    return <p>This account isn&rsquo;t set up as a guardian. Ask whoever runs Quark to add you.</p>;
  }
  await saveFamilyValues(guardian.familyId, guardian.id);
  const supabase = await createClient();
  const [profile, family, kids, runs] = await Promise.all([
    supabase.from("values_profiles").select("policy_document, version, saved_at, source_hash").maybeSingle(),
    supabase.from("families").select("timezone").single(),
    supabase.from("children").select("id, nickname").order("birth_month"),
    supabase
      .from("gate_test_runs")
      .select("child_id, rulebook_hash, floor_version, results, started_at, finished_at")
      .order("started_at", { ascending: false }),
  ]);
  for (const r of [profile, kids, runs]) if (r.error) throw new Error(r.error.message);
  const floor = readFloor(readSafetyFloor());
  // The most recent run per child.
  const kept = new Map<string, KeptRun>();
  for (const r of runs.data ?? []) {
    if (kept.has(r.child_id)) continue;
    kept.set(r.child_id, {
      startedAt: r.started_at,
      finished: !!r.finished_at,
      results: r.results as TestResult[],
      rulebookChanged: r.rulebook_hash !== profile.data?.source_hash,
      floorVersion: r.floor_version,
    });
  }
  const timeZone = family.data?.timezone ?? "Pacific/Honolulu";
  const saved = profile.data?.saved_at
    ? new Date(profile.data.saved_at).toLocaleString("en-US", { timeZone, dateStyle: "medium", timeStyle: "short" })
    : null;

  return (
    <div className={styles.rulebook}>
      <div className={styles.listHead}>
        <Link href="/parent/beliefs/compare" className={styles.home}>
          &larr; Compare answers
        </Link>
        <p className={styles.lede}>
          This is the whole of what Quark&rsquo;s checker reads before any lesson reaches your kids. It is written from
          your answers and updates whenever either of you changes one.
          {profile.data?.version ? ` Version ${profile.data.version}${saved ? `, ${saved}` : ""}.` : ""}
        </p>
      </div>
      {profile.data?.policy_document ? (
        <>
          <Document text={profile.data.policy_document} />
          <h2>Try it: twenty questions</h2>
          <p>
            Twenty questions a child might ask, answered the way Quark&rsquo;s tutor would answer them under this rulebook.
            Beside each answer: what the rulebook says for that subject, and whether the answer follows it. Nothing here
            reaches the kids, and the run is kept so every guardian sees the same answers.
          </p>
          <div className={styles.cards}>
            {(kids.data ?? []).map((k) => (
              <TestRun key={k.id} childId={k.id} nickname={k.nickname} kept={kept.get(k.id) ?? null} floorFirstGuess={floor.firstGuess} />
            ))}
          </div>
        </>
      ) : (
        <p className={styles.muted}>Nothing yet. Answer a few subjects first.</p>
      )}
    </div>
  );
}

// The document's small format: "# " and "## " headings, "**label**" paragraph openers, "- " lists.
function Document({ text }: { text: string }) {
  const blocks = text.trim().split(/\n{2,}/);
  const out: ReactNode[] = [];
  for (const [i, block] of blocks.entries()) {
    if (block.startsWith("# ")) out.push(<h1 key={i}>{block.slice(2)}</h1>);
    else if (block.startsWith("## ")) out.push(<h2 key={i}>{block.slice(3)}</h2>);
    else if (block.split("\n").every((line) => line.startsWith("- "))) {
      out.push(
        <ul key={i}>
          {block.split("\n").map((line, j) => (
            <li key={j}>{line.slice(2)}</li>
          ))}
        </ul>,
      );
    } else {
      const bold = block.match(/^\*\*(.+?)\*\*\s*/);
      const lines = (bold ? block.slice(bold[0].length) : block).split("\n");
      const [first, ...rest] = lines;
      // A heading line followed by its own list, as the family's words are written.
      if (rest.length && rest.every((line) => line.startsWith("- "))) {
        out.push(
          <div key={i}>
            <p>{first}</p>
            <ul>
              {rest.map((line, j) => (
                <li key={j}>{line.slice(2)}</li>
              ))}
            </ul>
          </div>,
        );
      } else {
        out.push(
          <p key={i}>
            {bold ? <strong>{bold[1]} </strong> : null}
            {lines.join(" ")}
          </p>,
        );
      }
    }
  }
  return <>{out}</>;
}
