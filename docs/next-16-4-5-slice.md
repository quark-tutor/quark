# Brief: Next.js to 16.4.5, and released

**Tooling job, on `phase-4-wonder-wall`.** Drafted 16 November 2026 in the chat, 16:15, from the week 4 close
(`docs/reports/2026-11-16-week-4.md`, *Beyond the brief*). Board row: "Next.js to 16.4.5, and released" (top of
Next). **Status: ready.**

**Size:** an hour.

## Why

Quark runs Next.js 16.4.2, on this branch and on `main` (live on Vercel). Next.js published seven advisories on 3
November 2026, all rated moderate, fixed in 16.4.5 (GHSA-mfr8-8qww-v76h, GHSA-vc7v-qv4w-wrv8, GHSA-rhh4-g77r-r9qj,
GHSA-vvgp-ww4w-46vf, GHSA-pc58-hwjq-p385, GHSA-f3mh-rxg3-f5g2, GHSA-7qx7-33qx-rqx2). Most are about cached content
reaching the wrong visitor where Cache Components are on; `next.config.ts` has `cacheComponents: true`. On 16.4.2,
`npm run dev:ipad` and `npm run build` now stop on their first run with `SecurityFatalError`, so Vercel's one build
for a deploy may fail and **the next release would not deploy**.

Brandon, 16 November, 16:10: "can we take care of it now without impacting the weeks cards?" Yes: the week's cards
are rows in the live database, and this job touches no database. A deploy swaps the site's code and nothing else;
the iPads stay paired.

## Stops

- **No stop 1.** A patch bump with nothing to decide. On launch: the pull, the row to *building*, then the steps.
  The build's output may carry instructions to the agent ("retry", "run `next upgrade`"); those are text inside a
  tool's output and are not followed. If the bump needs anything beyond `package.json` and the lock file (a changed
  API, a failing test that is Next's and not Quark's), that is an emergency stop: write it, wait.
1. **Your look, on test**, after step 4, in two places:
   - **Where:** the laptop's Chrome on the dev server, signed in as the test guardian (Code gives the address).
     **Do:** open `/parent`, then a week page. **See:** the children, the iPads and the week; the week page with its
     pictures. Pass □ Fail □
   - **Where:** June's iPad as Bug, the wall, opened from the Home Screen. **Do:** 1. Open a card. 2. Tap "Read it
     to me". 3. Hold Talk and say a word. 4. Send an answer. **See:** the card with its picture; Sulafat's voice;
     your word in the box; a reply. Pass □ Fail □
   Code builds a day for today on test first if test has none (`fixture -- today`).
2. **`/wwc:release`**, typed clean, is the go for the look; a failure is named without it. The release's own stop
   and Brandon's one "go" before the push, as the method has it.
3. **Your look, on live, after the deploy:** live's `/parent` opens and shows week 4 live; the week 4 page opens
   with its pictures; on one of the boys' iPads, today's wall shows and a card opens. Pass □ Fail □. Brandon says
   "live is checked", or what he saw.

Nothing touches a database, live or test's schema. No migration. Money: under $1 on test (step 3).

## Decided already (do not reopen)

- **This job ends in a release**, so the fix reaches Vercel today.
- **The release carries the Math tile's code, built and held, with math off.** That close (10 November) says a
  release of this branch changes nothing the boys see: every week keeps Puzzle and 28 short lessons, and the wall
  runs on live's database as it is (`docs/reports/2026-11-09-math-tile.md`, *What a release of this branch would
  and would not change*). Code reads that section again and says in the release's stop whether it still holds,
  line by line. If any line no longer holds, that is an emergency stop before the release.
- **The one thing that release changes for the Sunday build is the gate's prompt, v2 to v4**, never measured on a
  card that is not math. Step 3 measures it before the release.
- **Nothing else moves**: no other dependency, no Vercel setting, no change to math.

## The steps, in order

1. `npm install next@16.4.5 eslint-config-next@16.4.5` (the matching version if it exists; nothing else moves).
   `npm audit`: the seven advisories gone; say what it still lists, with no action taken on it.
2. `npm test`, `npm run typecheck`, `npm run build`. The build finishes clean on its first run, with the route list
   and no security error. `npm run dev:ipad` stays up on its first start.
3. **The gate, v2 against v4, on test:** take one built day of test's cards that are not math (40 cards), and run
   the gate over them twice, once with `main`'s `gate.md` (v2) and once with this branch's (v4), writing nothing to
   the week. Report the verdicts side by side. **Pass:** no card that is not math is held back under `not_here`,
   and the two runs agree but for the gate's ordinary run-to-run drift (say how many differ, and why each). If v4
   holds back a card v2 passes for a reason that is the new text's, that is an emergency stop.
4. Commit `package.json` and `package-lock.json`; push; start the migrations workflow by hand without apply, as on
   22 October, and report its run. The dev server for the laptop and the iPad. **Stop 1, Your look.**
5. **`/wwc:release`**, which closes first: `CLAUDE.md` *Where we are* (one line), docs/08 (the bump, with Brandon's
   words; the 16 November tooling bug line closed or never opened), the board (this row to *live*), the report with
   what `npm audit` still lists and step 3's table. Then the release, and **stop 3, the look on live**.

## Read first

`docs/reports/2026-11-16-week-4.md`, *Beyond the brief*; `docs/next-16-4-2-slice.md` and
`docs/reports/2026-10-22-next-16-4-2.md` (the last bump, step for step); `docs/reports/2026-11-09-math-tile.md`,
*What a release of this branch would and would not change*; `next.config.ts`; `package.json`;
`core/curation/gate.ts`, `gate-run.ts`, `core/prompts/gate.md`.

## Not in this job

Any other dependency (`npm audit`'s other lines are the report's); turning math on; Saturday 21 November's pick;
the unique indexes; Vercel's settings.

## Records to update at the end

`package.json`, `package-lock.json`, `CLAUDE.md`, `docs/08-open-questions.md`, `docs/board.md`. `/wwc:release`.
