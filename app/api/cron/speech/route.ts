import { faultText } from "@/core/curation/gate";
import { aheadFiring, type AheadReply } from "@/core/wall/speech-ahead";
import { authorized } from "@/lib/cron-auth";
import { aheadDeps } from "@/lib/speech-ahead";

// The tutor's lines made ahead (docs/lines-ahead-slice.md): Vercel calls this once a night at 3 am Hawaii
// (vercel.json), and each call makes every line of the day beginning in the tutor's voice and stores it, so a
// child's first "Read it to me" doesn't wait on Google. It says nothing to anyone: a line is still said only on the
// paired child's tap, once the child can see it (rule 3). The firing stops starting new lines at 240 seconds; the
// first taps make whatever it leaves, as they always have.
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

  try {
    const reply = await aheadFiring(aheadDeps(), { schedule: request.headers.get("x-vercel-cron-schedule") });
    return Response.json(reply, { status: reply.outcome === "failed" ? 500 : 200 });
  } catch (e) {
    // A read failed before anything was recorded: a database error names a table, never a child.
    const reply: AheadReply = { outcome: "failed", day: null, error: faultText(e), seconds: 0 };
    return Response.json(reply, { status: 500 });
  }
}
