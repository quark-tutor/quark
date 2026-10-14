import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { requireGuardian } from "@/lib/guardian";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import styles from "../../beliefs/beliefs.module.css";
import own from "./week.module.css";

export const metadata: Metadata = { title: "This week's cards · Quark" };

// A read-only look at a built week before the gate checks it: each child's cards by day and slot,
// with the lens and all four layers. Step 6 builds the "looks good" page on this one.
export default function WeekPage({ params }: { params: Promise<{ theme: string }> }) {
  return (
    <main className={styles.page}>
      <Suspense fallback={<p className={styles.muted}>Loading…</p>}>
        <Week params={params} />
      </Suspense>
    </main>
  );
}

const SLOTS = ["look", "wonder", "listen", "then", "puzzle"] as const;
const SLOT_NAMES: Record<string, string> = { look: "Look", wonder: "Wonder", listen: "Listen", then: "Then", puzzle: "Puzzle" };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Body = { title: string; text: string; image_alt: string; read_aloud: string; question: string; hints: string[]; handoff: string };
type Card = {
  id: string;
  child_id: string;
  day: string;
  slot: string;
  lens: string;
  layer: number;
  door: string | null;
  level: string | null;
  policy: string;
  policy_notes: { validation?: string[] } | null;
  body: Body;
  ideas: { content_item_id: string | null } | null;
};

async function Week({ params }: { params: Promise<{ theme: string }> }) {
  await connection();
  const { theme: themeId } = await params;
  const guardian = await requireGuardian();
  if (!guardian) {
    return <p>This account isn&rsquo;t set up as a guardian. Ask whoever runs Quark to add you.</p>;
  }
  if (!UUID.test(themeId)) return <p>No such week.</p>;

  // Row-level security keeps all of this to the guardian's own family.
  const supabase = await createClient();
  const [theme, kids, cards] = await Promise.all([
    supabase.from("themes").select("id, title, week_start, status").eq("id", themeId).maybeSingle(),
    supabase.from("children").select("id, nickname").order("birth_month"),
    supabase
      .from("cards")
      .select("id, child_id, day, slot, lens, layer, door, level, policy, policy_notes, body, ideas(content_item_id)")
      .eq("theme_id", themeId)
      .order("day")
      .order("layer")
      .returns<Card[]>(),
  ]);
  for (const r of [theme, kids, cards]) if (r.error) throw new Error(r.error.message);
  if (!theme.data) return <p>No such week.</p>;

  // Pictures: the approved items' stored copies, through short-lived signed URLs.
  const itemIds = [...new Set((cards.data ?? []).map((c) => c.ideas?.content_item_id).filter((id): id is string => !!id))];
  const items = itemIds.length
    ? await supabase.from("content_items").select("id, type, title, url, metadata").in("id", itemIds)
    : { data: [], error: null };
  if (items.error) throw new Error(items.error.message);
  const paths = (items.data ?? []).map((i) => i.metadata?.storage_path).filter((p): p is string => !!p);
  const signed = paths.length ? await createAdminClient().storage.from("content").createSignedUrls(paths, 60 * 60) : { data: [] };
  const signedBy = new Map((signed.data ?? []).filter((s) => s.signedUrl).map((s) => [s.path, s.signedUrl]));
  const media = new Map(
    (items.data ?? []).map((i) => [i.id, { type: i.type as string, title: i.title as string, url: i.url as string, picture: signedBy.get(i.metadata?.storage_path) ?? undefined }]),
  );

  const days = [...new Set((cards.data ?? []).map((c) => c.day))].sort();
  const weekday = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString("en-US", { timeZone: "UTC", weekday: "long", month: "short", day: "numeric" });
  const blocked = (cards.data ?? []).filter((c) => c.policy === "blocked").length;

  return (
    <>
      <div className={styles.listHead}>
        <Link href="/parent" className={styles.home}>
          &larr; Quark
        </Link>
        <h1>{theme.data.title}</h1>
        <p className={styles.lede}>
          The week starting {weekday(theme.data.week_start)}, status {theme.data.status}. These cards haven&rsquo;t been
          checked against your rulebook yet, and nothing here is on the kids&rsquo; iPads. Each card is shown with its
          four layers: what the child sees first, then each tap deeper.
          {blocked ? ` ${blocked} card${blocked === 1 ? " was" : "s were"} held back because a hint still gave the answer away.` : ""}
        </p>
      </div>

      {(kids.data ?? []).map((kid) => {
        const mine = (cards.data ?? []).filter((c) => c.child_id === kid.id);
        if (mine.length === 0) return null;
        return (
          <section key={kid.id} className={own.child}>
            <h2>
              {kid.nickname} <span className={styles.muted}>({mine[0].level})</span>
            </h2>
            {days.map((day) => (
              <div key={day} className={own.day}>
                <h3>{weekday(day)}</h3>
                <div className={styles.cards}>
                  {SLOTS.map((slot) => {
                    const layers = mine.filter((c) => c.day === day && c.slot === slot).sort((a, b) => a.layer - b.layer);
                    if (layers.length === 0) return null;
                    return (
                      <article key={slot} className={styles.card}>
                        <div className={styles.cardHead}>
                          <strong>{SLOT_NAMES[slot]}</strong>
                          <span className={styles.meta}>
                            {layers[0].lens}
                            {layers[0].door ? `, through ${layers[0].door}` : ""}
                          </span>
                        </div>
                        {layers.map((c) => (
                          <Layer key={c.id} card={c} media={c.ideas?.content_item_id ? media.get(c.ideas.content_item_id) : undefined} />
                        ))}
                      </article>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>
        );
      })}
    </>
  );
}

function Layer({ card, media }: { card: Card; media?: { type: string; title: string; url: string; picture?: string } }) {
  const b = card.body;
  return (
    <details className={own.layer} open={card.layer === 1}>
      <summary>
        {card.layer}. {b.title}
        {card.policy === "blocked" ? <span className={styles.flag}> held back</span> : null}
      </summary>
      {media?.picture ? (
        // eslint-disable-next-line @next/next/no-img-element -- a short-lived signed URL from private storage
        <img className={own.picture} src={media.picture} alt={b.image_alt || media.title} loading="lazy" />
      ) : media ? (
        <p className={styles.meta}>
          With it: {media.type} &ldquo;{media.title}&rdquo;
        </p>
      ) : (
        <p className={styles.meta}>No picture.</p>
      )}
      <p>{b.text}</p>
      {b.read_aloud && b.read_aloud !== b.text ? <p className={styles.meta}>Read aloud: {b.read_aloud}</p> : null}
      <p>
        <strong>{b.question}</strong>
      </p>
      <ol className={own.hints}>
        {b.hints.map((h, i) => (
          <li key={i}>{h}</li>
        ))}
      </ol>
      <p className={styles.meta}>Then: {b.handoff}</p>
      {card.policy_notes?.validation?.length ? <p className={styles.flag}>{card.policy_notes.validation.join(" ")}</p> : null}
    </details>
  );
}
