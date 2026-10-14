import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { ageFrom } from "@/lib/beliefs";
import { requireGuardian } from "@/lib/guardian";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { forgetDevice, signOut } from "./actions";
import { PairIpad } from "./pair-ipad";
import styles from "./parent.module.css";

export default function ParentPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Quark</h1>
        <form action={signOut}>
          <button className={styles.link}>Sign out</button>
        </form>
      </header>
      <Suspense fallback={<p className={styles.muted}>Loading…</p>}>
        <ParentHome />
      </Suspense>
    </main>
  );
}

async function ParentHome() {
  await connection(); // ages are computed from today's date, per request
  const guardian = await requireGuardian();
  if (!guardian) {
    return <p>This account isn&rsquo;t set up as a guardian. Ask whoever runs Quark to add you.</p>;
  }

  const supabase = await createClient();
  // Waiting content items aren't readable through row-level security, so the server counts them.
  const waiting = createAdminClient()
    .from("content_items")
    .select("id", { count: "exact", head: true })
    .eq("approved", false)
    .is("rejected_at", null);
  const [family, guardians, kids, devices, answers, content, themes] = await Promise.all([
    supabase.from("families").select("name, timezone").single(),
    supabase.from("guardians").select("id, display_name").eq("active", true).order("created_at"),
    supabase.from("children").select("id, nickname, birth_month").order("birth_month"),
    supabase
      .from("devices")
      .select("id, child_id, created_at, last_seen")
      .is("revoked_at", null)
      .order("created_at"),
    supabase.from("guardian_answers").select("guardian_id"),
    waiting,
    supabase.from("themes").select("id, title, week_start, status").order("week_start"),
  ]);
  for (const result of [family, guardians, kids, devices, answers, content, themes]) if (result.error) throw result.error;

  const timeZone = family.data?.timezone ?? "Pacific/Honolulu";
  const when = (iso: string | null) =>
    iso ? new Date(iso).toLocaleString("en-US", { timeZone, dateStyle: "medium", timeStyle: "short" }) : "never";
  const children = kids.data ?? [];
  const nickname = new Map(children.map((k) => [k.id, k.nickname]));
  const paired = devices.data ?? [];
  const answeredBy = new Map<string, number>();
  for (const a of answers.data ?? []) answeredBy.set(a.guardian_id, (answeredBy.get(a.guardian_id) ?? 0) + 1);

  return (
    <>
      <p className={styles.muted}>
        Signed in as {guardian.displayName}. {family.data?.name}:{" "}
        {(guardians.data ?? []).map((g) => g.display_name).join(" and ")}.
      </p>

      <section className={styles.section}>
        <h2>Children</h2>
        <ul className={styles.list}>
          {children.map((kid) => (
            <li key={kid.id}>
              {kid.nickname}, age {ageFrom(kid.birth_month)}
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h2>iPads</h2>
        {paired.length === 0 ? (
          <p className={styles.muted}>No iPads paired yet.</p>
        ) : (
          <ul className={styles.list}>
            {paired.map((device) => (
              <li key={device.id} className={styles.device}>
                <span>
                  <strong>{nickname.get(device.child_id)}&rsquo;s iPad</strong>
                  <br />
                  <span className={styles.muted}>
                    Paired {when(device.created_at)}. Last opened {when(device.last_seen)}.
                  </span>
                </span>
                <form action={forgetDevice.bind(null, device.id)}>
                  <button className={styles.danger}>Forget this iPad</button>
                </form>
              </li>
            ))}
          </ul>
        )}
        <PairIpad kids={children.map(({ id, nickname }) => ({ id, nickname }))} />
      </section>

      <section className={styles.section}>
        <h2>Our Family&rsquo;s Beliefs</h2>
        <p className={styles.muted}>
          How Quark handles 24 sensitive subjects. Each parent answers on their own, then you compare.
        </p>
        <ul className={styles.list}>
          {(guardians.data ?? []).map((g) => (
            <li key={g.id}>
              {g.display_name}: {answeredBy.get(g.id) ?? 0} of 24 answered
            </li>
          ))}
        </ul>
        <p className={styles.row}>
          <Link href="/parent/beliefs" className={styles.button}>
            {answeredBy.get(guardian.id) ? "Review your answers" : "Start"}
          </Link>
          <Link href="/parent/beliefs/compare">Compare answers</Link>
          <Link href="/parent/beliefs/rulebook">Read the rulebook</Link>
        </p>
      </section>

      {themes.data?.length ? (
        <section className={styles.section}>
          <h2>Weeks</h2>
          <ul className={styles.list}>
            {themes.data.map((t) => (
              <li key={t.id}>
                <Link href={`/parent/week/${t.id}`}>{t.title}</Link>{" "}
                <span className={styles.muted}>
                  from {new Date(`${t.week_start}T00:00:00Z`).toLocaleDateString("en-US", { timeZone: "UTC", month: "short", day: "numeric" })},{" "}
                  {t.status === "review" ? "ready for you to read" : t.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className={styles.section}>
        <h2>Pictures and recordings</h2>
        <p className={styles.muted}>
          {content.count
            ? `${content.count} waiting for one of you to look at.`
            : "Nothing waiting. Quark approves an item by itself only when it is free of copyright and nothing in it was flagged."}
        </p>
        <p className={styles.row}>
          <Link href="/parent/content" className={styles.button}>
            {content.count ? "Review them" : "See them all"}
          </Link>
        </p>
      </section>

      <section className={styles.section}>
        <h2>Coming next</h2>
        <p className={styles.muted}>The test run, the weekly theme and the Sunday digest.</p>
      </section>
    </>
  );
}
