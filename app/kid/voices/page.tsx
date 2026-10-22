import { notFound } from "next/navigation";
import styles from "../kid.module.css";
import { Voices } from "./voices";

// Which voices this browser has, and the one "Read it to me" picks (core/wall/voice.ts): for checking an iPad
// on the dev server. Nothing links here, and it doesn't exist in production.

export default function VoicesPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main className={styles.card}>
      <Voices />
    </main>
  );
}
