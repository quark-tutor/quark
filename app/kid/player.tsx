"use client";

import { useRef, useState } from "react";
import { SAY } from "@/core/wall/words";
import { useStopsOnLeave } from "./stops-on-leave";
import styles from "./kid.module.css";

// One big button for a recording. It never autoplays and loads nothing until it is tapped (preload none).
// Wikimedia's MP3 first, since iPad Safari may not play Ogg; the original after it. It plays on while "Read it to
// me" talks, and the voice never stops it: the music under the tutor's voice is by design (Brandon, 8 Nov 2026).
// Leaving the card stops it (the same day).
export function Player({ url, mp3 }: { url: string; mp3: string | null }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  useStopsOnLeave(audio);

  function toggle() {
    const a = audio.current;
    if (!a) return;
    if (a.paused) void a.play().catch(() => setPlaying(false));
    else a.pause();
  }

  return (
    <div className={styles.player}>
      <audio ref={audio} preload="none" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)}>
        {mp3 ? <source src={mp3} type="audio/mpeg" /> : null}
        <source src={url} />
      </audio>
      <button type="button" className={styles.play} onClick={toggle} aria-pressed={playing}>
        {playing ? SAY.pause : SAY.play}
      </button>
    </div>
  );
}
