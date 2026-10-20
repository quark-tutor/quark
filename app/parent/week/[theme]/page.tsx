import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense, type ReactNode } from "react";
import { credit } from "@/core/content/credit";
import type { PolicyNotes } from "@/core/curation/gate";
import { requireGuardian } from "@/lib/guardian";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import styles from "../../beliefs/beliefs.module.css";
import own from "./week.module.css";
import { Zoom } from "./zoom";

export const metadata: Metadata = { title: "This week's cards · Quark" };

// A read-only look at a built week: each child's cards by day and slot, with the lens and all four
// layers, each card's picture or recording with its credit line, and what the gate decided for it
// (passed, held back and why, or not checked yet), with the checker's reader notes. Never which
// guardian a blackball came from. Step 6 builds the "looks good" page on this one.
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
  policy_notes: PolicyNotes | null;
  body: Body;
  ideas: { content_item_id: string | null; topic_id: string | null; plan_topics: { key: string } | null } | null;
};

// An approved item as a card shows it. file is a signed URL to the stored copy, when there is one.
type Media = {
  type: string;
  title: string;
  creator: string | null;
  date: string | null;
  source: string | null;
  license: string;
  attribution: string | null;
  url: string;
  file: string | null;
};

// Wikimedia keeps an MP3 of each sound file, which iPad Safari plays where it may not play Ogg.
const commonsMp3 = (url: string) => {
  const m = url.match(/^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/(\w\/\w\w)\/([^/]+\.(?:ogg|oga|opus|flac|wav))$/);
  return m ? `https://upload.wikimedia.org/wikipedia/commons/transcoded/${m[1]}/${m[2]}/${m[2]}.mp3` : null;
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
  const [theme, kids, cards, rulebook] = await Promise.all([
    supabase.from("themes").select("id, title, week_start, status").eq("id", themeId).maybeSingle(),
    supabase.from("children").select("id, nickname").order("birth_month"),
    supabase
      .from("cards")
      .select("id, child_id, day, slot, lens, layer, door, level, policy, policy_notes, body, ideas(content_item_id, topic_id, plan_topics(key))")
      .eq("theme_id", themeId)
      .order("day")
      .order("layer")
      .returns<Card[]>(),
    supabase.from("values_profiles").select("source_hash").maybeSingle(),
  ]);
  for (const r of [theme, kids, cards, rulebook]) if (r.error) throw new Error(r.error.message);
  if (!theme.data) return <p>No such week.</p>;

  // Pictures and recordings: the approved items, with their stored copies through signed URLs that
  // last an hour. The bucket is private; nothing here is a public URL to it.
  const itemIds = [...new Set((cards.data ?? []).map((c) => c.ideas?.content_item_id).filter((id): id is string => !!id))];
  const items = itemIds.length
    ? await supabase
        .from("content_items")
        .select("id, type, title, creator, url, license, attribution, metadata, content_sources(name)")
        .in("id", itemIds)
        .returns<
          {
            id: string;
            type: string;
            title: string | null;
            creator: string | null;
            url: string;
            license: string;
            attribution: string | null;
            metadata: { storage_path?: string; date?: string } | null;
            content_sources: { name: string } | null;
          }[]
        >()
    : { data: [], error: null };
  if (items.error) throw new Error(items.error.message);
  const paths = (items.data ?? []).map((i) => i.metadata?.storage_path).filter((p): p is string => !!p);
  const signed = paths.length ? await createAdminClient().storage.from("content").createSignedUrls(paths, 60 * 60) : { data: [], error: null };
  if (signed.error) throw new Error(signed.error.message);
  const signedBy = new Map((signed.data ?? []).filter((s) => s.signedUrl).map((s) => [s.path, s.signedUrl]));
  const media = new Map<string, Media>(
    (items.data ?? []).map((i) => [
      i.id,
      {
        type: i.type,
        title: i.title ?? "Untitled",
        creator: i.creator,
        date: i.metadata?.date ?? null,
        source: i.content_sources?.name ?? null,
        license: i.license,
        attribution: i.attribution,
        url: i.url,
        file: (i.metadata?.storage_path && signedBy.get(i.metadata.storage_path)) || null,
      },
    ]),
  );
  // Topics that have an approved item on some layer this week, so a layer without one can say
  // whether the plan has a gap or the picture is simply on another layer.
  const topicsWithMedia = new Set((cards.data ?? []).filter((c) => c.ideas?.content_item_id).map((c) => c.ideas!.topic_id));

  const days = [...new Set((cards.data ?? []).map((c) => c.day))].sort();
  const weekday = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString("en-US", { timeZone: "UTC", weekday: "long", month: "short", day: "numeric" });
  const all = cards.data ?? [];
  const count = (policy: string) => all.filter((c) => c.policy === policy).length;
  const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
  const currentHash = rulebook.data?.source_hash ?? null;
  const older = all.filter((c) => c.policy_notes?.gate && c.policy_notes.gate.rulebook !== currentHash).length;
  // The newest safety floor any verdict was checked against.
  const floor = all
    .map((c) => c.policy_notes?.gate)
    .filter((g) => !!g)
    .sort((a, b) => b!.floor - a!.floor)[0];

  return (
    <>
      <div className={styles.listHead}>
        <Link href="/parent" className={styles.home}>
          &larr; Quark
        </Link>
        <h1>{theme.data.title}</h1>
        <p className={styles.lede}>
          The week starting {weekday(theme.data.week_start)}, status {theme.data.status}. Nothing here is on the kids&rsquo;
          iPads. Each card is shown with its four layers: what the child sees first, then each tap deeper.
        </p>
        <p className={styles.lede}>
          {plural(count("passed"), "card passed", "cards passed")} the checker, {count("blocked")} {count("blocked") === 1 ? "was" : "were"} held
          back, and {count("pending")} {count("pending") === 1 ? "isn't" : "aren't"} checked yet.
          {floor ? ` Checked against safety floor version ${floor.floor}${floor.floor_first_guess ? ", still a first guess" : ""}.` : ""}
          {older ? ` ${plural(older, "card was", "cards were")} checked against an older rulebook and should be checked again.` : ""}
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
                          <Layer
                            key={c.id}
                            card={c}
                            currentHash={currentHash}
                            media={c.ideas?.content_item_id ? media.get(c.ideas.content_item_id) : undefined}
                            topicHasMedia={topicsWithMedia.has(c.ideas?.topic_id ?? null)}
                          />
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

function Layer({ card, media, topicHasMedia, currentHash }: { card: Card; media?: Media; topicHasMedia: boolean; currentHash: string | null }) {
  const b = card.body;
  const key = card.ideas?.plan_topics?.key;
  const gate = card.policy_notes?.gate;
  return (
    <details className={own.layer} open={card.layer === 1}>
      <summary>
        {card.layer}. {b.title}
        {card.policy === "blocked" ? (
          <span className={styles.flag}> held back</span>
        ) : card.policy === "passed" ? (
          <span className={styles.meta}> passed</span>
        ) : (
          <span className={styles.meta}> not checked yet</span>
        )}
      </summary>
      {media ? (
        <MediaBlock media={media} alt={b.image_alt} />
      ) : topicHasMedia ? (
        <p className={styles.meta}>
          No {card.slot === "listen" ? "recording" : "picture"} on this layer; this topic&rsquo;s{" "}
          {card.slot === "listen" ? "recording" : "picture"} is on another.
        </p>
      ) : (
        <p className={styles.meta}>
          No approved {card.slot === "listen" ? "recording" : "picture"} for this topic yet{key ? <> (<code>{key}</code>)</> : null}.
        </p>
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
      {card.policy_notes?.validation?.length ? (
        <p className={styles.flag}>Held back by the card checks: {card.policy_notes.validation.join(" ")}</p>
      ) : null}
      {gate && card.policy === "blocked" ? (
        <p className={styles.flag}>
          {gate.by === "code" ? "Held back by your rulebook, before any checker read it: " : "Held back by the checker: "}
          {gate.reasons.map((r) => r.note).join(" ")}
        </p>
      ) : null}
      {gate?.reader?.length ? <p className={styles.meta}>A teacher&rsquo;s eye: {gate.reader.join(" ")}</p> : null}
      {gate && gate.rulebook !== currentHash ? <p className={styles.meta}>Checked against an older rulebook.</p> : null}
    </details>
  );
}

function MediaBlock({ media, alt }: { media: Media; alt: string }) {
  let shown: ReactNode;
  if (media.type === "audio") {
    const src = media.file ?? media.url;
    const mp3 = media.file ? null : commonsMp3(media.url);
    // Never autoplays: the player waits for a tap, and loads nothing until then.
    shown = (
      <audio className={own.audio} controls preload="none">
        {mp3 ? <source src={mp3} type="audio/mpeg" /> : null}
        <source src={src} />
      </audio>
    );
  } else if (media.file) {
    shown = <Zoom src={media.file} alt={alt || media.title} />;
  } else {
    shown = <p className={styles.meta}>The stored copy of this {media.type} is missing. Run npm run content:fetch.</p>;
  }
  const credited = credit(media);
  return (
    <figure className={own.media}>
      {shown}
      <figcaption className={styles.meta}>
        {/* Title, maker, source and license: the credit CC BY and CC BY-SA ask for, on every item. */}
        <strong>{credited.title}</strong>
        {credited.lines.map((line) => (
          <span key={line}>
            <br />
            {line}
          </span>
        ))}
        {!media.attribution && /^cc by/i.test(media.license) ? (
          <>
            <br />
            <span className={styles.flag}>The credit line is missing, and this license requires one.</span>
          </>
        ) : null}
      </figcaption>
    </figure>
  );
}
