import { connection } from "next/server";
import { Suspense } from "react";
import { requireGuardian } from "@/lib/guardian";
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
  const [family, guardians, kids, devices] = await Promise.all([
    supabase.from("families").select("name, timezone").single(),
    supabase.from("guardians").select("id, display_name").eq("active", true).order("created_at"),
    supabase.from("children").select("id, nickname, birth_month").order("birth_month"),
    supabase
      .from("devices")
      .select("id, child_id, created_at, last_seen")
      .is("revoked_at", null)
      .order("created_at"),
  ]);
  for (const result of [family, guardians, kids, devices]) if (result.error) throw result.error;

  const timeZone = family.data?.timezone ?? "Pacific/Honolulu";
  const when = (iso: string | null) =>
    iso ? new Date(iso).toLocaleString("en-US", { timeZone, dateStyle: "medium", timeStyle: "short" }) : "never";
  const children = kids.data ?? [];
  const nickname = new Map(children.map((k) => [k.id, k.nickname]));
  const paired = devices.data ?? [];

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
        <h2>Coming next</h2>
        <p className={styles.muted}>The values interview, the weekly theme and the Sunday digest.</p>
      </section>
    </>
  );
}

// birth_month is the first of the month, e.g. "2017-03-01".
function ageFrom(birthMonth: string): number {
  const [year, month] = birthMonth.split("-").map(Number);
  const now = new Date();
  return now.getFullYear() - year - (now.getMonth() + 1 < month ? 1 : 0);
}
