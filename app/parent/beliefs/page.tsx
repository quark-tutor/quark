import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { requireGuardian } from "@/lib/guardian";
import { createClient } from "@/lib/supabase/server";
import { Beliefs } from "./beliefs";
import { loadBeliefs } from "./data";
import styles from "./beliefs.module.css";

export const metadata: Metadata = { title: "Our Family's Beliefs · Quark" };

export default function BeliefsPage() {
  return (
    <main className={styles.page}>
      <Suspense fallback={<p className={styles.muted}>Loading…</p>}>
        <BeliefsLoader />
      </Suspense>
    </main>
  );
}

async function BeliefsLoader() {
  await connection(); // children's ages are computed from today's date, per request
  const guardian = await requireGuardian();
  if (!guardian) {
    return <p>This account isn&rsquo;t set up as a guardian. Ask whoever runs Quark to add you.</p>;
  }
  const data = await loadBeliefs(await createClient(), guardian.id);
  if (data.packs.length === 0) {
    return <p className={styles.muted}>The traditions haven&rsquo;t been loaded yet. Run npm run packs:import.</p>;
  }
  return <Beliefs initial={data} />;
}
