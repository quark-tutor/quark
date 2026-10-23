import { NextResponse } from "next/server";
import { CLIP_MAX_SECONDS, CLIP_RATE } from "@/core/wall/speech";
import { getDevice } from "@/lib/device";
import { hearClip } from "@/lib/wall";

// Talk from the paired iPad (docs/tutor-voice-slice.md): one clip of 16-bit mono PCM at 16 kHz, sent when the
// child lets go of the button, and its words back for the answer box, where the child sees them, can fix them
// and sends them as before. Quark keeps neither the audio nor the words; only the answer the child sends is
// kept, as an attempt. Nothing here logs.

const MAX_BYTES = (CLIP_MAX_SECONDS + 1) * CLIP_RATE * 2;

export async function POST(request: Request) {
  const device = await getDevice();
  if (!device) return NextResponse.json({ ok: false }, { status: 401 });

  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BYTES) return NextResponse.json({ ok: false }, { status: 413 });
  const pcm = new Uint8Array(await request.arrayBuffer());
  if (pcm.length > MAX_BYTES) return NextResponse.json({ ok: false }, { status: 413 });

  const text = await hearClip(device, pcm).catch(() => undefined);
  if (text === undefined) return NextResponse.json({ ok: false }, { status: 502 });
  if (text === null) return NextResponse.json({ ok: false }, { status: 400 });
  return NextResponse.json({ text });
}
