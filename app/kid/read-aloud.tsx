"use client";

import { useRef, useState } from "react";
import { SAY } from "@/core/wall/words";
import { started, useOneAtATime } from "./one-at-a-time";
import styles from "./kid.module.css";

// "Read it to me": the tutor's voice (docs/tutor-voice-slice.md), from Quark's own route, on a tap only, never by
// itself (rule 4). The line is named by its card and part ("<card id>.hint.0"), never sent as words. The tap
// sets the player's address and starts it in the same moment, because iPad Safari plays sound only when it
// starts inside the tap; the route answers with the stored audio, made overnight or on the first tap anywhere.
// From the tap until the voice starts the button says it is getting the line ready (docs/lines-ahead-slice.md),
// then "Stop" while it plays. A tap while it is getting ready or playing stops it, and starting it stops anything
// else playing, a recording too, so only one thing is ever heard at a time.
type State = "idle" | "loading" | "playing";

export function ReadAloud({ line, small = false }: { line: string; small?: boolean }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [state, setState] = useState<State>("idle");
  useOneAtATime(audio);

  function toggle() {
    const a = audio.current;
    if (!a) return;
    if (state !== "idle") {
      a.pause();
      setState("idle");
      return;
    }
    started(a);
    const src = `/api/kid/say?line=${encodeURIComponent(line)}`;
    if (a.getAttribute("src") !== src) a.src = src;
    else a.currentTime = 0;
    setState("loading");
    void a.play().catch(() => setState("idle"));
  }

  const idle = () => setState("idle");
  return (
    <>
      <audio ref={audio} preload="none" onPlaying={() => setState("playing")} onPause={idle} onEnded={idle} onError={idle} />
      <button
        type="button"
        className={small ? styles.readSmall : styles.read}
        onClick={toggle}
        aria-pressed={state !== "idle"}
        aria-busy={state === "loading"}
      >
        {state === "loading" ? SAY.gettingReady : state === "playing" ? SAY.stop : SAY.readIt}
      </button>
    </>
  );
}
