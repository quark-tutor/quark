"use client";

import { useRef } from "react";
import own from "./week.module.css";

// A picture on a card that opens large: a native <dialog>, so Escape closes it; tapping anywhere
// on it closes it too. The URL is a short-lived signed URL to the stored copy, never a public one.
export function Zoom({ src, alt }: { src: string; alt: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button type="button" className={own.thumbButton} onClick={() => dialog.current?.showModal()} aria-label={`Open larger: ${alt}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- a short-lived signed URL from private storage */}
        <img className={own.picture} src={src} alt={alt} loading="lazy" />
      </button>
      <dialog ref={dialog} className={own.zoom} onClick={() => dialog.current?.close()}>
        {/* eslint-disable-next-line @next/next/no-img-element -- the same signed URL, full size */}
        <img src={src} alt={alt} />
      </dialog>
    </>
  );
}
