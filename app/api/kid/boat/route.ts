import { NextResponse } from "next/server";
import { getDevice } from "@/lib/device";
import { actionOf, boatMove } from "@/lib/boat";

// A move on the trading boat from the paired iPad (docs/trading-boat-slice.md): a named move, never free text but for
// an answer's words. The reply is the next screen. A move he cannot make now, or the boat where it is not (the test
// view off), is refused and nothing is written. Nothing here logs the move or the answer.

export async function POST(request: Request) {
  const device = await getDevice();
  if (!device) return NextResponse.json({ ok: false }, { status: 401 });
  const move = actionOf(await request.json().catch(() => null));
  if (!move) return NextResponse.json({ ok: false }, { status: 400 });
  const screen = await boatMove(device, move);
  if (!screen) return NextResponse.json({ ok: false }, { status: 404 });
  return NextResponse.json(screen);
}
