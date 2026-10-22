"use client";

import { useEffect, useState } from "react";
import { pickVoice, type VoiceLike } from "@/core/wall/voice";
import styles from "../kid.module.css";
import { ReadAloud } from "../read-aloud";

// The browser's voices as it reports them, the pick marked, and the same list sent to the dev server's own
// output (app/api/dev/voices) so it can go in the report.

const plain = (v: SpeechSynthesisVoice): VoiceLike => ({ name: v.name, lang: v.lang, voiceURI: v.voiceURI, default: v.default, localService: v.localService });

export function Voices() {
  const [voices, setVoices] = useState<VoiceLike[] | null>(null);

  useEffect(() => {
    const speech = window.speechSynthesis as SpeechSynthesis | undefined;
    let sent = false;
    const read = () => {
      const list = speech ? speech.getVoices().map(plain) : [];
      setVoices(list);
      if (list.length && !sent) {
        sent = true;
        void fetch("/api/dev/voices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ voices: list }) }).catch(() => null);
      }
    };
    read();
    speech?.addEventListener("voiceschanged", read);
    return () => speech?.removeEventListener("voiceschanged", read);
  }, []);

  if (voices === null) return <p>Looking for voices…</p>;
  const picked = pickVoice(voices);

  return (
    <section className={styles.words}>
      <h1 className={styles.cardTitle}>{voices.length} voices</h1>
      <p>
        Picked: <strong>{picked ? `${picked.name} (${picked.lang}) ${picked.voiceURI}` : "none: the browser's default"}</strong>
      </p>
      <ReadAloud text="This is the voice the Wonder Wall reads with." />
      <ol className={styles.voices}>
        {/* By place, not voiceURI: iPad Safari reports some voices twice under one voiceURI. */}
        {voices.map((v, i) => (
          <li key={i} className={v === picked ? styles.voicePicked : undefined}>
            {v.name} · {v.lang} · {v.voiceURI}
            {v.default ? " · default" : ""}
            {v.localService ? "" : " · remote"}
          </li>
        ))}
      </ol>
    </section>
  );
}
