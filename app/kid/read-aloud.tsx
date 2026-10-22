"use client";

import { useEffect, useState } from "react";
import { pickVoice } from "@/core/wall/voice";
import { SAY } from "@/core/wall/words";
import styles from "./kid.module.css";

// "Read it to me": the browser's own speech, on a tap only, never by itself. A second tap stops it, and
// starting one stops any other, so only one thing is ever read at a time.
const STARTED = "quark:read-aloud";

// The voice it reads with (core/wall/voice.ts). Safari fills its list of voices after the page loads, so the
// pick is made on load and again when the list changes; the tap only reads it, because iPad Safari speaks
// only from inside the tap itself, never after waiting for an event.
let voice: SpeechSynthesisVoice | null = null;
const choose = () => {
  voice = pickVoice(window.speechSynthesis.getVoices());
};

export function ReadAloud({ text, small = false }: { text: string; small?: boolean }) {
  const [reading, setReading] = useState(false);

  useEffect(() => {
    const stop = () => setReading(false);
    window.addEventListener(STARTED, stop);
    const speech = window.speechSynthesis;
    if (speech) {
      choose();
      speech.addEventListener("voiceschanged", choose);
    }
    return () => {
      window.removeEventListener(STARTED, stop);
      speech?.removeEventListener("voiceschanged", choose);
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
    if (!voice) choose(); // the list can fill without the event firing
    const said = new SpeechSynthesisUtterance(text);
    if (voice) said.voice = voice;
    said.lang = voice?.lang.replace("_", "-") ?? "en-US";
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
