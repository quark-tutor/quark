// Fire one of Vercel's cron routes once by hand, against the dev server on this laptop (localhost:3000, which
// reads .env.local, so the test copy). It calls the same route Vercel calls, with CRON_SECRET from .env.local,
// and prints the reply. It never prints the secret and never goes anywhere but localhost.
//   npm run dev                (in another terminal, and kept running)
//   npm run cron:week          the Sunday build: the next unbuilt day of next week (docs/looks-good-slice.md),
//                              about $1.90 and two to four minutes a day, so it can be called again for the next one
//   npm run cron:speech        the tutor's lines made ahead: every line of today's cards in the tutor's voice
//                              (docs/lines-ahead-slice.md), about a minute and a half, inside Google's free tier
//   npm run cron:week -- --port 3001
// Exits 1 on anything but a 200. Not a live script: each route off Vercel refuses unless its own QUARK_TARGET is test.

import { request } from "node:http";
import { parseArgs } from "node:util";
import { announceTarget } from "./target.ts";

const ROUTES = { week: "/api/cron/week", speech: "/api/cron/speech" } as const;

announceTarget(); // prints which database the dev server will use, and refuses live values in .env.local
const { values: args } = parseArgs({ options: { port: { type: "string", default: "3000" }, route: { type: "string", default: "week" } } });
const port = Number(args.port);
if (!Number.isInteger(port) || port < 1) throw new Error("--port must be a port number");
const path = ROUTES[args.route as keyof typeof ROUTES];
if (!path) throw new Error(`--route must be one of ${Object.keys(ROUTES).join(", ")}`);
const secret = process.env.CRON_SECRET;
if (!secret) throw new Error("Set CRON_SECRET in .env.local (see .env.example), then restart the dev server so it reads it too.");

// node:http, not fetch: fetch gives up waiting for a reply after five minutes, and the dev server has no
// limit on a firing the way a Vercel function has.
const started = Date.now();
const { status, body } = await new Promise<{ status: number; body: string }>((resolve, reject) => {
  const req = request({ host: "localhost", port, path, method: "GET", headers: { authorization: `Bearer ${secret}` } }, (res) => {
    let text = "";
    res.setEncoding("utf8");
    res.on("data", (chunk) => (text += chunk));
    res.on("end", () => resolve({ status: res.statusCode ?? 0, body: text }));
  });
  req.on("error", (e) => reject(new Error(`Could not reach the dev server on localhost:${port}: ${e.message}. Is npm run dev running?`)));
  req.end();
});

console.log(`HTTP ${status} after ${Math.round((Date.now() - started) / 1000)}s`);
try {
  console.log(JSON.stringify(JSON.parse(body), null, 2));
} catch {
  console.log(body.slice(0, 500));
}
if (status !== 200) process.exit(1);
