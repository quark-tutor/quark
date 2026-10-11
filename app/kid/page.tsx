import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getDevice } from "@/lib/device";
import styles from "./kid.module.css";

// The Wonder Wall. Empty in phase 1: it knows which child this iPad belongs to, and nothing else.
export default function WonderWallPage() {
  return (
    <main className={styles.center}>
      <Suspense fallback={null}>
        <WonderWall />
      </Suspense>
    </main>
  );
}

async function WonderWall() {
  const device = await getDevice();
  if (!device) redirect("/kid/pair");

  return (
    <>
      <h1 className={styles.hello}>Hi, {device.nickname}.</h1>
      <p className={styles.muted}>Your Wonder Wall is getting ready.</p>
    </>
  );
}
