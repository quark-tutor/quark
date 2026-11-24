import { faultText } from "@/core/curation/gate";
import { lessonsFiring, type LessonsReply } from "@/core/curation/lessons";
import { makeFiringDeps } from "@/core/curation/lessons-job";
import { meteredComplete } from "@/core/model";
import { makeMeter } from "@/core/runs";
import { authorized } from "@/lib/cron-auth";
import { createAdminClient } from "@/lib/supabase/admin";

// The app writes its own short lessons (docs/week-without-hands-slice.md): Vercel calls this six times a day (vercel.json),
// and each call writes what the week the next Sunday build makes still lacks, one lesson a tile, or does nothing. The
// lessons go into the library on review like any other; nothing here reaches a child. The gate checks every card the
// Sunday build makes from them, and a guardian's tap makes the week live (rule 5).
export const maxDuration = 300;

export async function GET(request: Request) {
  // Nothing is read or written for a caller without the secret.
  if (!authorized(request.headers.get("authorization"), process.env.CRON_SECRET)) {
    return new Response("Unauthorized", { status: 401 });
  }
  // Off Vercel this is a laptop: it may only be the test copy, so a pasted live key can't be reached by a call to localhost.
  if (!process.env.VERCEL && process.env.QUARK_TARGET !== "test") {
    return new Response("Refused: this isn't on Vercel and QUARK_TARGET is not test.", { status: 403 });
  }

  const meter = makeMeter(); // this firing's own tally: a warm instance keeps earlier ones
  try {
    const reply = await lessonsFiring(makeFiringDeps(createAdminClient(), { complete: meteredComplete(meter), meter }));
    return Response.json(reply, { status: reply.outcome === "failed" ? 500 : 200 });
  } catch (e) {
    // A read failed before anything was recorded: a database error names a table, never a child.
    const reply: LessonsReply = { outcome: "failed", week: null, reason: faultText(e), seconds: 0 };
    return Response.json(reply, { status: 500 });
  }
}
