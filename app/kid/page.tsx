import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SAY, SLOT_NAMES } from "@/core/wall/words";
import { getDevice } from "@/lib/device";
import { loadWall } from "@/lib/wall";
import styles from "./kid.module.css";

// The Wonder Wall: today's five first cards from the family's live week, passed cards only, in slot order
// (docs/wonder-wall-1-slice.md, decision 1). A tile is the slot and the card's title: no picture, no count,
// no star. Every read goes through lib/wall.ts.
export default function WonderWallPage() {
  return (
    <main className={styles.wall}>
      <Suspense fallback={null}>
        <WonderWall />
      </Suspense>
    </main>
  );
}

async function WonderWall() {
  const device = await getDevice();
  if (!device) redirect("/kid/pair");
  const { nickname, tiles } = await loadWall(device);

  return (
    <>
      <header className={styles.wallTop}>
        <h1 className={styles.hello}>{SAY.hello(nickname)}</h1>
        {tiles.length > 0 && tiles.every((t) => t.done) ? <p className={styles.muted}>{SAY.everythingDone}</p> : null}
      </header>
      {tiles.length === 0 ? (
        <p className={styles.nothing}>{SAY.nothingToday}</p>
      ) : (
        <nav className={styles.tiles} aria-label="Today's cards">
          {tiles.map((t) => (
            // prefetch off: opening a card is a visit, so it happens only on a tap.
            <Link key={t.cardId} href={`/kid/card/${t.cardId}`} prefetch={false} className={t.done ? `${styles.tile} ${styles.tileDone}` : styles.tile}>
              <span className={styles.tileSlot}>{SLOT_NAMES[t.slot]}</span>
              <span className={styles.tileTitle}>{t.title}</span>
              {t.done ? <span className={styles.tileSlot}>{SAY.doneToday}</span> : null}
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}
