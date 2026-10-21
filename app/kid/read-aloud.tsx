"use client";

import { useEffect, useState } from "react";
import { SAY } from "@/core/wall/words";
import styles from "./kid.module.css";

// "Read it to me": the browser's own speech, on a tap only, never by itself. A second tap stops it, and
// starting one stops any other, so only one thing is ever read at a time.
const STARTED = "quark:read-aloud";

export function ReadAloud({ text, small = false }: { text: string; small?: boolean }) {
  const [reading, setReading] = useState(false);

  useEffect(() => {
    const stop = () => setReading(false);
    window.addEventListener(STARTED, stop);
    return () => {
      window.removeEventListener(STARTED, stop);
    };
  }, []);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  if (!text.trim()) return null;

  function toggle() {
    const speech = window.speechSynthesis;
    if (!speech) return;
    if (reading) {
      speech.cancel();
      setReading(false);
      return;
    }
    speech.cancel();
    window.dispatchEvent(new Event(STARTED));
    const said = new SpeechSynthesisUtterance(text);
    said.lang = "en-US";
    said.rate = 0.9;
    said.onend = () => setReading(false);
    said.onerror = () => setReading(false);
    speech.speak(said);
    setReading(true);
  }

  return (
    <button type="button" className={small ? styles.readSmall : styles.read} onClick={toggle} aria-pressed={reading}>
      {reading ? SAY.stop : SAY.readIt}
    </button>
  );
}
