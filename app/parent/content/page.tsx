import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { requireGuardian } from "@/lib/guardian";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import styles from "../beliefs/beliefs.module.css";
import { approveItem, rejectItem } from "./actions";
import own from "./content.module.css";

export const metadata: Metadata = { title: "Pictures and recordings · Quark" };

// Every outside item the plan uses (content_items). Open-licensed items the model found nothing
// in were approved automatically; the rest wait here for a guardian (docs/04, decided 13 Oct 2026).
export default function ContentPage() {
  return (
    <main className={styles.page}>
      <Suspense fallback={<p className={styles.muted}>Loading…</p>}>
        <ContentReview />
      </Suspense>
    </main>
  );
}

type Item = {
  id: string;
  type: string;
  title: string | null;
  creator: string | null;
  url: string;
  license: string;
  attribution: string | null;
  approved: boolean;
  approved_how: "auto" | "guardian" | null;
  approved_by: string | null;
  rejected_at: string | null;
  rejected_by: string | null;
  flags: string[];
  metadata: { page_url?: string; date?: string; storage_path?: string; flag_note?: string } | null;
  content_sources: { slug: string; name: string } | null;
};

async function ContentReview() {
  await connection();
  const guardian = await requireGuardian();
  if (!guardian) {
    return <p>This account isn&rsquo;t set up as a guardian. Ask whoever runs Quark to add you.</p>;
  }

  // Waiting items aren't readable through row-level security (only approved ones are), so the
  // server reads them with the service-role client, after the guardian check above.
  const admin = createAdminClient();
  const supabase = await createClient();
  const [items, guardians] = await Promise.all([
    admin
      .from("content_items")
      .select(
        "id, type, title, creator, url, license, attribution, approved, approved_how, approved_by, rejected_at, rejected_by, flags, metadata, content_sources(slug, name)",
      )
      .order("title")
      .returns<Item[]>(),
    supabase.from("guardians").select("id, display_name"),
  ]);
  if (items.error) throw new Error(items.error.message);
  if (guardians.error) throw new Error(guardians.error.message);
  const name = new Map((guardians.data ?? []).map((g) => [g.id, g.display_name as string]));

  const all = items.data ?? [];
  const paths = all.map((i) => i.metadata?.storage_path).filter((p): p is string => !!p);
  const signed = paths.length ? await admin.storage.from("content").createSignedUrls(paths, 60 * 60) : { data: [] };
  const picture = new Map((signed.data ?? []).filter((s) => s.signedUrl).map((s) => [s.path, s.signedUrl]));

  const waiting = all.filter((i) => !i.approved && !i.rejected_at);
  const approved = all.filter((i) => i.approved);
  const rejected = all.filter((i) => i.rejected_at);

  const section = (title: string, list: Item[], empty: string) => (
    <section className={own.section}>
      <h2>
        {title} <span className={styles.muted}>({list.length})</span>
      </h2>
      {list.length === 0 ? (
        <p className={styles.muted}>{empty}</p>
      ) : (
        <div className={styles.cards}>
          {list.map((item) => (
            <Card key={item.id} item={item} picture={picture.get(item.metadata?.storage_path ?? "") ?? undefined} name={name} />
          ))}
        </div>
      )}
    </section>
  );

  return (
    <>
      <div className={styles.listHead}>
        <Link href="/parent" className={styles.home}>
          &larr; Quark
        </Link>
        <h1>Pictures and recordings</h1>
        <p className={styles.lede}>
          Every painting, object and recording this stretch of the plan uses. Quark approves an item by itself only when
          it is free of copyright (CC0 or public domain) and its checker found nothing to flag. Everything else waits for
          one of you. A rejected item is never shown to the kids.
        </p>
      </div>
      {section("Waiting for you", waiting, "Nothing is waiting.")}
      {section("Approved", approved, "Nothing approved yet.")}
      {section("Rejected", rejected, "Nothing rejected.")}
    </>
  );
}

function Card({ item, picture, name }: { item: Item; picture?: string; name: Map<string, string> }) {
  const m = item.metadata ?? {};
  const source = item.content_sources;
  const status = item.rejected_at
    ? `Rejected by ${name.get(item.rejected_by ?? "") ?? "a guardian"}`
    : item.approved
      ? item.approved_how === "auto"
        ? "Approved automatically"
        : `Approved by ${name.get(item.approved_by ?? "") ?? "a guardian"}`
      : source?.slug === "musopen"
        ? "Check this one by hand"
        : "Waiting";
  return (
    <article className={styles.card}>
      {picture ? (
        // eslint-disable-next-line @next/next/no-img-element -- a short-lived signed URL from private storage
        <img className={own.thumb} src={picture} alt={item.title ?? ""} loading="lazy" />
      ) : item.type === "audio" && source?.slug !== "musopen" ? (
        <audio className={own.audio} controls preload="none" src={item.url} />
      ) : null}
      <div className={styles.cardHead}>
        <strong>{m.page_url ? <a href={m.page_url}>{item.title}</a> : item.title}</strong>
      </div>
      <p className={styles.meta}>
        {[item.creator, m.date].filter(Boolean).join(", ")}
        {item.creator || m.date ? <br /> : null}
        {source?.name} &middot; {item.license}
      </p>
      <p className={styles.meta}>
        {item.flags.length ? (
          item.flags.map((f) => (
            <span key={f} className={styles.flag}>
              {f.replace("_", " ")}{" "}
            </span>
          ))
        ) : (
          <span>No flags.</span>
        )}{" "}
        {m.flag_note}
      </p>
      {item.attribution && !/^(cc0|public domain)/i.test(item.license) ? (
        <p className={styles.meta}>Credit to show with it: {item.attribution}</p>
      ) : null}
      <p className={styles.meta}>
        <strong>{status}.</strong>
      </p>
      {item.rejected_at ? null : (
        <div className={own.actions}>
          {item.approved ? null : (
            <form action={approveItem.bind(null, item.id)}>
              <button className={styles.btn}>Approve</button>
            </form>
          )}
          <form action={rejectItem.bind(null, item.id)}>
            <button className={`${styles.btn} ${styles.warn}`}>Reject</button>
          </form>
        </div>
      )}
    </article>
  );
}
