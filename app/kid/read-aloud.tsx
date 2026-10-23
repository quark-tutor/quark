"use client";

import { useEffect, useRef, useState } from "react";
import { SAY } from "@/core/wall/words";
import styles from "./kid.module.css";

// "Read it to me": the tutor's voice (docs/tutor-voice-slice.md), from Quark's own route, on a tap only, never by
// itself (rule 4). The line is named by its card and part ("<card id>.hint.0"), never sent as words. The tap
// sets the player's address and starts it in the same moment, because iPad Safari plays sound only when it
// starts inside the tap; the route answers with the stored audio, made on the first tap anywhere. A second tap
// stops it, and starting one stops any other, so only one thing is ever read at a time.
const STARTED = "quark:read-aloud";

export function ReadAloud({ line, small = false }: { line: string; small?: boolean }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [reading, setReading] = useState(false);

  useEffect(() => {
    const a = audio.current;
    const other = (e: Event) => {
      if ((e as CustomEvent<HTMLAudioElement>).detail !== a) a?.pause();
    };
    window.addEventListener(STARTED, other);
    return () => {
      window.removeEventListener(STARTED, other);
      a?.pause();
    };
  }, []);

  function toggle() {
    const a = audio.current;
    if (!a) return;
    if (reading) {
      a.pause();
      setReading(false);
      return;
    }
    window.dispatchEvent(new CustomEvent(STARTED, { detail: a }));
    const src = `/api/kid/say?line=${encodeURIComponent(line)}`;
    if (a.getAttribute("src") !== src) a.src = src;
    else a.currentTime = 0;
    setReading(true);
    void a.play().catch(() => setReading(false));
  }

  return (
    <>
      <audio ref={audio} preload="none" onPause={() => setReading(false)} onEnded={() => setReading(false)} onError={() => setReading(false)} />
      <button type="button" className={small ? styles.readSmall : styles.read} onClick={toggle} aria-pressed={reading}>
        {reading ? SAY.stop : SAY.readIt}
      </button>
    </>
  );
}
