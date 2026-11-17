import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MATH_NAME, SAY } from "@/core/wall/words";
import { boatScreen } from "@/lib/boat";
import { getDevice } from "@/lib/device";
import styles from "../kid.module.css";
import { BoatGame } from "./boat-game";

// The trading boat (docs/trading-boat-slice.md): the Math tile, while the family's switch is on and its times tables
// give him prices (lib/boat-here.ts; docs/trading-boat-2-slice.md). Otherwise lib/boat.ts gives no screen and the page
// goes back to the wall. Every read and write goes through
// lib/boat.ts.
export default function BoatPage() {
  return (
    <main className={styles.card}>
      <Suspense fallback={null}>
        <Boat />
      </Suspense>
    </main>
  );
}

async function Boat() {
  const device = await getDevice();
  if (!device) redirect("/kid/pair");
  const screen = await boatScreen(device);
  if (!screen) redirect("/kid");
  return (
    <>
      <header className={styles.cardTop}>
        <Link href="/kid" className={styles.back}>
          {SAY.back}
        </Link>
        <span className={styles.cardSlot}>{MATH_NAME}</span>
      </header>
      <BoatGame initial={screen} />
    </>
  );
}
