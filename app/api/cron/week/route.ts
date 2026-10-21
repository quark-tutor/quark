import { makeCronDeps } from "@/core/curation/cron-job";
import { cronFiring, type CronReply } from "@/core/curation/cron";
import { faultText } from "@/core/curation/gate";
import { meteredComplete } from "@/core/model";
import { makeMeter } from "@/core/runs";
import { authorized } from "@/lib/cron-auth";
import { createAdminClient } from "@/lib/supabase/admin";

// The Sunday build (docs/looks-good-slice.md): Vercel calls this once at each of eight hours on Sunday,
// Hawaii time (vercel.json), and each call builds the next day of next week into review, or says why it
// did not. A week does not fit one function, a day does: day 1 took 218 seconds on test, and a Hobby
// function stops at 300. Nothing here goes live; a guardian's tap on the week page does that.
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
    const reply = await cronFiring(makeCronDeps(createAdminClient(), { complete: meteredComplete(meter), meter }), {
      schedule: request.headers.get("x-vercel-cron-schedule"),
    });
    return Response.json(reply, { status: reply.outcome === "failed" ? 500 : 200 });
  } catch (e) {
    // A read failed before anything was recorded: a database error names a table, never a child.
    const reply: CronReply = { outcome: "failed", week: null, day: null, theme: null, reason: faultText(e), seconds: 0 };
    return Response.json(reply, { status: 500 });
  }
}
