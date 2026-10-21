import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SAY, SLOT_NAMES } from "@/core/wall/words";
import { getDevice } from "@/lib/device";
import { loadCard } from "@/lib/wall";
import styles from "../../kid.module.css";
import { Player } from "../../player";
import { ReadAloud } from "../../read-aloud";
import { AnswerBox } from "./answer-box";

// One card: its picture or recording with the credit, its words, "Read it to me", and the question with one
// box and one button (docs/wonder-wall-1-slice.md, decision 1). It opens at the layer the child is at; a card
// that isn't on the wall today goes back to the wall. The Home Screen app has no back gesture, hence the button.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function CardPage({ params }: PageProps<"/kid/card/[id]">) {
  return (
    <main className={styles.card}>
      <Suspense fallback={null}>
        <Card params={params} />
      </Suspense>
    </main>
  );
}

async function Card({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const device = await getDevice();
  if (!device) redirect("/kid/pair");
  const found = UUID.test(id) ? await loadCard(device, id) : null;
  if (!found) redirect("/kid");
  if ("goTo" in found) redirect(`/kid/card/${found.goTo}`);
  const c = found.card;

  return (
    <>
      <header className={styles.cardTop}>
        <Link href="/kid" className={styles.back}>
          {SAY.back}
        </Link>
        <span className={styles.cardSlot}>{SLOT_NAMES[c.slot]}</span>
      </header>
      <div className={c.media ? styles.cardWithMedia : styles.cardPlain}>
        {c.media ? (
          <figure className={styles.media}>
            {c.media.type === "audio" ? (
              <Player url={c.media.url} mp3={c.media.mp3} />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- a signed URL to the family's private copy
              <img className={styles.picture} src={c.media.url} alt={c.image_alt || c.media.credit.title} />
            )}
            <figcaption className={styles.credit}>
              {/* Title, maker, source and license: the credit CC BY and CC BY-SA ask for. */}
              <strong>{c.media.credit.title}</strong>
              {c.media.credit.lines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </figcaption>
          </figure>
        ) : null}
        <section className={styles.words}>
          <h1 className={styles.cardTitle}>{c.title}</h1>
          <p className={styles.cardText}>{c.text}</p>
          <ReadAloud text={c.read_aloud} />
          <AnswerBox key={c.id} id={c.id} question={c.question} hints={c.hints} state={c.state} handoff={c.handoff ?? null} />
        </section>
      </div>
    </>
  );
}
