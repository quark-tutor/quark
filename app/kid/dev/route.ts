import { NextResponse, type NextRequest } from "next/server";
import { getDevice } from "@/lib/device";
import { DEV_DAY_COOKIE, devSwitchChild, devViewOn } from "@/lib/dev-view";

// The test view's switch (lib/dev-view.ts): on the dev server against test only, anything else is a 404.
//   /kid/dev?child=<id>      the paired iPad becomes that child of its own family
//   /kid/dev?day=2026-11-12  the wall reads that day as today; ?day=today goes back
// Then back to the wall, by a relative address: the dev server's own URL is the address it listens on, 0.0.0.0,
// which the iPad cannot reach (found by curl at stop 2's setup, 9 Nov 2026).
const to = (path: string) => new NextResponse(null, { status: 303, headers: { Location: path } });

export async function GET(request: NextRequest) {
  if (!devViewOn()) return new NextResponse(null, { status: 404 });
  const device = await getDevice();
  if (!device) return to("/kid/pair");
  const params = request.nextUrl.searchParams;
  const back = to("/kid");
  const child = params.get("child");
  if (child) await devSwitchChild(device, child);
  const day = params.get("day");
  if (day === "today") back.cookies.delete(DEV_DAY_COOKIE);
  else if (day && /^\d{4}-\d{2}-\d{2}$/.test(day)) back.cookies.set(DEV_DAY_COOKIE, day, { path: "/", sameSite: "lax", maxAge: 60 * 60 * 12 });
  return back;
}
