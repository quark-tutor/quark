import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BOAT, MATH_NAME, SAY, SLOT_NAMES } from "@/core/wall/words";
import { boatTile } from "@/lib/boat";
import { getDevice } from "@/lib/device";
import { loadWall } from "@/lib/wall";
import { DevBar } from "./dev-bar";
import styles from "./kid.module.css";

// The Wonder Wall: today's five first cards from the family's live week, passed cards only (docs/wonder-wall-1-slice.md,
// decision 1), in today's order: the slots turned by one each day (slotOrder() in core/wall/card.ts;
// docs/tile-rotation-slice.md). A tile is the slot and the card's title: no picture, no count, no star, no mark on the
// first tile. Every read goes through lib/wall.ts.
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
  // The trading boat's tile (docs/trading-boat-2-slice.md): while the family's times tables give him prices, the Math
  // tile stands where Puzzle falls in today's order and Puzzle's tile is not shown; otherwise null, and the wall is as
  // it was. boatAt comes from the wall's own read of the same tables (lib/wall.ts, lib/boat-here.ts).
  const [{ nickname, tiles, boatAt }, boat] = await Promise.all([loadWall(device), boatTile(device)]);
  const mathAt = boat && boatAt !== undefined ? boatAt : null;
  const allDone = tiles.length > 0 && tiles.every((t) => t.done) && (mathAt === null || boat!.done);

  const mathTile =
    mathAt !== null ? (
      <Link key="boat" href="/kid/boat" prefetch={false} className={boat!.done ? `${styles.tile} ${styles.tileDone}` : styles.tile}>
        <span className={styles.tileSlot}>{MATH_NAME}</span>
        <span className={styles.tileTitle}>{BOAT.tile}</span>
        {boat!.done ? <span className={styles.tileSlot}>{SAY.doneToday}</span> : null}
      </Link>
    ) : null;

  return (
    <>
      <header className={styles.wallTop}>
        <h1 className={styles.hello}>{SAY.hello(nickname)}</h1>
        {allDone ? <p className={styles.muted}>{SAY.everythingDone}</p> : null}
      </header>
      {tiles.length === 0 ? <p className={styles.nothing}>{SAY.nothingToday}</p> : null}
      {tiles.length > 0 || mathTile ? (
        <nav className={styles.tiles} aria-label="Today's cards">
          {tiles.map((t, i) => [
            i === mathAt ? mathTile : null,
            // prefetch off: opening a card is a visit, so it happens only on a tap.
            <Link key={t.cardId} href={`/kid/card/${t.cardId}`} prefetch={false} className={t.done ? `${styles.tile} ${styles.tileDone}` : styles.tile}>
              <span className={styles.tileSlot}>{SLOT_NAMES[t.slot]}</span>
              <span className={styles.tileTitle}>{t.title}</span>
              {t.done ? <span className={styles.tileSlot}>{SAY.doneToday}</span> : null}
            </Link>,
          ])}
          {mathAt !== null && mathAt >= tiles.length ? mathTile : null}
        </nav>
      ) : null}
      <DevBar device={device} />
    </>
  );
}
