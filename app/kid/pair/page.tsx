"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PAIRING_CODE_LENGTH } from "@/lib/pairing-shared";
import styles from "../kid.module.css";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "back"];

// Shown on an iPad that isn't paired yet. A grown-up types the code from /parent.
export default function PairPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"typing" | "checking" | "wrong">("typing");

  async function submit(full: string) {
    setStatus("checking");
    const response = await fetch("/api/kid/pair", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: full }),
    }).catch(() => null);
    if (response?.ok) {
      router.replace("/kid");
      router.refresh();
      return;
    }
    setCode("");
    setStatus("wrong");
  }

  function press(key: string) {
    if (status === "checking") return;
    if (key === "clear") return setCode("");
    if (key === "back") return setCode((c) => c.slice(0, -1));
    if (code.length >= PAIRING_CODE_LENGTH) return;
    const next = code + key;
    setCode(next);
    setStatus("typing");
    if (next.length === PAIRING_CODE_LENGTH) void submit(next);
  }

  return (
    <main className={styles.center}>
      <h1 className={styles.heading}>Grown-ups: set up this iPad</h1>
      <p className={styles.muted}>
        {status === "wrong"
          ? "That code didn't work. Get a new one on the parent page."
          : "Type the six-digit code from the parent page."}
      </p>
      <div className={styles.slots} aria-label={`${code.length} of ${PAIRING_CODE_LENGTH} digits`}>
        {Array.from({ length: PAIRING_CODE_LENGTH }, (_, i) => (
          <span key={i} className={styles.slot}>
            {code[i] ?? ""}
          </span>
        ))}
      </div>
      <div className={styles.keypad}>
        {KEYS.map((key) => (
          <button
            key={key}
            className={key.length === 1 ? styles.key : styles.keySmall}
            onClick={() => press(key)}
            disabled={status === "checking"}
            aria-label={key === "back" ? "Delete" : key === "clear" ? "Clear" : key}
          >
            {key === "back" ? "⌫" : key === "clear" ? "Clear" : key}
          </button>
        ))}
      </div>
    </main>
  );
}
