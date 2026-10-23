"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { SAY } from "@/core/wall/words";
import styles from "../../kid.module.css";

// Talk (docs/tutor-voice-slice.md): hold to talk, let go to send. The microphone opens on the press and closes
// on the release; what it heard goes to Quark's own route as one clip of 16 kHz PCM, never to anyone else from
// here, and the words come back into the answer box, where the child sees them, can fix them with the keyboard
// and sends them with "That's my answer". Nothing is sent before the child lets go, and nothing plays: the
// recorder's output to the speaker is silence. A hold stops itself after 30 seconds.

const RATE = 16_000; // CLIP_RATE in core/wall/speech.ts
const MAX_MS = 30_000;

type Phase = "idle" | "starting" | "listening" | "writing";
type Notice = "keepHolding" | "didntHear" | "noMicrophone" | null;

type Recording = {
  stream: MediaStream;
  source: MediaStreamAudioSourceNode;
  node: ScriptProcessorNode;
  chunks: Float32Array[];
  rate: number;
};

// The browser's samples, at its own rate, as 16-bit mono PCM at 16 kHz.
function toClip(chunks: Float32Array[], rate: number): ArrayBuffer {
  const length = chunks.reduce((n, c) => n + c.length, 0);
  const all = new Float32Array(length);
  let at = 0;
  for (const c of chunks) {
    all.set(c, at);
    at += c.length;
  }
  const step = rate / RATE;
  const out = new DataView(new ArrayBuffer(Math.floor(length / step) * 2));
  for (let i = 0; i < out.byteLength / 2; i++) {
    // The average of the samples this one stands for, so the clip isn't sharpened into noise.
    const from = Math.floor(i * step);
    const to = Math.min(length, Math.max(from + 1, Math.floor((i + 1) * step)));
    let sum = 0;
    for (let j = from; j < to; j++) sum += all[j];
    const v = Math.max(-1, Math.min(1, sum / (to - from)));
    out.setInt16(i * 2, v < 0 ? v * 0x8000 : v * 0x7fff, true);
  }
  return out.buffer;
}

export function Talk({ onHeard, disabled = false }: { onHeard: (words: string) => void; disabled?: boolean }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [notice, setNotice] = useState<Notice>(null);
  const context = useRef<AudioContext | null>(null);
  const recording = useRef<Recording | null>(null);
  const held = useRef(false);
  const limit = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      stopRecording();
      void context.current?.close();
    },
    [],
  );

  function stopRecording(): Recording | null {
    if (limit.current) clearTimeout(limit.current);
    const r = recording.current;
    recording.current = null;
    if (!r) return null;
    r.node.onaudioprocess = null;
    r.source.disconnect();
    r.node.disconnect();
    for (const track of r.stream.getTracks()) track.stop();
    return r;
  }

  async function press(e: PointerEvent<HTMLButtonElement>) {
    if (disabled || phase !== "idle") return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId); // a finger that slides off still lets go here
    } catch {
      // no capture for this pointer; the release still comes on pointerup
    }
    held.current = true;
    setNotice(null);
    setPhase("starting");
    // Made and started inside the press, so Safari lets it run; kept for the next hold.
    context.current ??= new AudioContext();
    const ctx = context.current;
    void ctx.resume();
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
    } catch {
      setPhase("idle");
      setNotice("noMicrophone");
      return;
    }
    if (!held.current) {
      // Let go before the microphone opened (or to answer Safari's question): nothing was heard.
      for (const track of stream.getTracks()) track.stop();
      setPhase("idle");
      setNotice("keepHolding");
      return;
    }
    await ctx.resume();
    const source = ctx.createMediaStreamSource(stream);
    const node = ctx.createScriptProcessor(4096, 1, 1);
    const chunks: Float32Array[] = [];
    node.onaudioprocess = (ev) => chunks.push(new Float32Array(ev.inputBuffer.getChannelData(0)));
    source.connect(node);
    node.connect(ctx.destination); // it runs only when connected; it writes nothing, so nothing is heard
    recording.current = { stream, source, node, chunks, rate: ctx.sampleRate };
    limit.current = setTimeout(() => void release(), MAX_MS);
    setPhase("listening");
  }

  async function release() {
    held.current = false;
    const r = stopRecording();
    if (!r) return;
    const clip = toClip(r.chunks, r.rate);
    if (clip.byteLength < RATE * 2 * 0.3) {
      setPhase("idle");
      setNotice("keepHolding");
      return;
    }
    setPhase("writing");
    const res = await fetch("/api/kid/hear", { method: "POST", headers: { "Content-Type": "application/octet-stream" }, body: clip }).catch(() => null);
    const reply = res?.ok ? ((await res.json().catch(() => null)) as { text?: string } | null) : null;
    setPhase("idle");
    if (!reply?.text) {
      setNotice("didntHear");
      return;
    }
    onHeard(reply.text);
  }

  const label = phase === "listening" ? SAY.listening : phase === "writing" ? SAY.writing : SAY.talk;
  return (
    <>
      <button
        type="button"
        className={styles.talk}
        disabled={disabled || phase === "writing"}
        aria-pressed={phase === "listening"}
        onPointerDown={(e) => void press(e)}
        onPointerUp={() => void release()}
        onPointerCancel={() => void release()}
        onContextMenu={(e) => e.preventDefault()}
      >
        {label}
      </button>
      {notice ? <p className={`${styles.reply} ${styles.notice}`}>{SAY[notice]}</p> : null}
    </>
  );
}
