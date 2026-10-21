# Report: the Sunday cron and the Looks-good page, phase 3 step 6 (`docs/looks-good-slice.md`), 20 October 2026

Sonnet 5.5 at xhigh effort (the brief asks for `opusplan`). Branch `phase-3-curation`. Nothing to `main`, nothing on
live. The job text is Brandon's `/wwc:job docs/looks-good-slice.md` of 20 October.

This file holds stop 1: the step 1 write-back as it was printed, the review of it in plan mode, and Brandon's go with
three points carried in. Later stops and the close append below.

**Record for the wwc job skill:** the step 1 write-back was printed in the chat before it was written to this file
(Brandon: "the stop goes to the file first"). The skill's first stop prints and the later ones write first, so the
first stop broke the rule the later ones keep. This is the second sighting of the docs/08 bug of 20 October ("the STOP
1 pre-flight was printed in chat twice before it was written to the report file").

## Stop 1, part 1: the step 1 write-back, as printed

Step 1 of `docs/looks-good-slice.md`: I read the code, the spec pages and Vercel's cron docs, and changed and ran
nothing that changes anything. The tree was clean and level with origin.

### Where it stands

- **Branch:** `phase-3-curation` is checked out, and the brief names it. No new branch.
- **Board:** row 33 is *briefed*. On go it moves to *building*, inserted at the top, dated 20 Oct 2026, Where
  `docs/looks-good-slice.md`. It is the first commit and contains only the board file, because the brief is already
  committed. Row 35 (*Curation engine v1*, already *building*) is left alone.
- **Model:** the session is Sonnet 5.5 at xhigh. The brief asks for `opusplan`; run `/model opusplan` before go. Plan
  mode adds nothing for a read-only step 1.
- **Stops:** (1) this write-back, (2) any day over 240 s in 3.5, (3) the end of step 3, where Brandon opens `/parent`
  and taps, (4) `/close`. None is live.
- **Risky steps:**
  - **Money:** test only, about $0.03, $1 and $13, each run under the $25 line, so no stop.
  - **A delete:** test's week 1 in 3.5. Test only; undone only by rebuilding (about $1.70 plus the gate).
  - **A secret:** `CRON_SECRET` in `.env.local` is Brandon's. The file was not read; `cron:week` names the variable if
    it is missing.
  - **Anything a child sees:** nothing. `live` is the first switch the kid view will read, and no kid view or iPad
    reads it yet.
- **Migrations:** the brief's "migration behind a STOP" is out of date: a push of the branch applies one through the
  workflow. None is planned. The workflow only fires on `supabase/migrations/**` or its own file, so the push won't
  trigger it; `gh run list --workflow migrations.yml --branch phase-3-curation --limit 1` should still show the 20 Oct
  run. If one turned up: read it in the diff, push, `gh run watch`, report.

### 1. Cron entries

`vercel.json` has eight entries, all on `/api/cron/week`:

| Hawaii (Sunday) | 6 am | 8 am | 10 am | noon | 2 pm | 4 pm | 6 pm | 8 pm (spare) |
|---|---|---|---|---|---|---|---|---|
| UTC expression | `0 16 * * 0` | `0 18 * * 0` | `0 20 * * 0` | `0 22 * * 0` | `0 0 * * 1` | `0 2 * * 1` | `0 4 * * 1` | `0 6 * * 1` |

Checked in Vercel's docs (pages updated 15 Jul and 11 Aug 2026): Hobby allows one run a day per entry, anywhere in
its hour; several entries on one path are documented, and each request carries an `x-vercel-cron-schedule` header;
Vercel never retries, delivery is best effort and can be doubled; "Disable Cron Jobs" persists across deploys; there
is no `next dev` support (the endpoint is called). A Vitest check on `vercel.json` holds the eight entries, one hour
each, and their Hawaii times.

### 2. The route

`GET app/api/cron/week/route.ts`, `maxDuration = 300`:

- **Secret check:** both sides hashed, then `timingSafeEqual`. A wrong or missing header, or `CRON_SECRET` unset,
  returns 401 and nothing is read or written.
- **Target guard:** off Vercel, 403 unless `QUARK_TARGET=test`, so a localhost call cannot reach live by a pasted key.
- **Then:** `createAdminClient()` and `cronFiring(deps)`.
- **Reply:** `{ outcome: "built" | "nothing" | "refused" | "failed", week, day, theme, reason?, cost?, seconds }`. 200
  except `failed`, which is 500 so Vercel's log shows it. It never carries a nickname and returns only counts from
  the gate.

### 3. `nextWeek()` (pure)

It takes the family's themes and "today" in `families.timezone`. Next Monday is the Monday after the Hawaii date, as
in `week-build.mts`. A theme starting on or after it that the cron isn't building is refused as "week N is already
built". Otherwise the week is the highest `plan_week` plus one (1 if none), starting next Monday. The cron's own theme
is `generating`, with a `week.cron` row naming it; the day is the earliest one that isn't complete.

| Firing | Result |
|---|---|
| Sun 25 Oct 6 am, no themes | week 1, starts 26 Oct, day 1 |
| Sun 25 Oct 10 am, days 1–3 complete | week 1, day 4 |
| `0 4 * * 1` UTC (Mon 26 Oct) | still Sun 25 Oct in Hawaii, so next Monday is 26 Oct |
| Sun 1 Nov, week 1 starts 26 Oct | week 2, starts 2 Nov, day 1 |
| Sun 8 Nov, 1 Nov skipped | week 2, starts 9 Nov (the plan counts weeks built, not calendar weeks) |
| Sun 1 Nov, week 2 already built by hand for 2 Nov | refused, "week 2 is already built" |

### 4. Refusals and audit rows

- **Before anything is written:** the secret and the target guard. Then it reads the state: exactly one family, the
  themes, and which days are complete.
- **The family check can't be recorded.** With 0 or 2+ families, `audit_log` has no `family_id` to write to. That
  refusal is a reply and a Vercel log line only.
- **Then:** the `started` row, then the brief's five refusals in its order: lock, already built, library short, gate
  can't run, model or key missing. Each writes a `refused` row.
- **Rows:** `action: "week.cron"`, no guardian, `target`:
  - `started`: `{outcome, week, day, theme, schedule}`.
  - `built`: `{outcome, started: <row id>, week, day, theme, passed, held_back, pending, cost, seconds}`.
  - `refused`: `{outcome, week, day, reason}`.
  - `failed`: `{outcome, week, day, error}`.
- **Linking:** the `started` id on the end row lets `/parent` say which firing never finished.
- **Failure text:** through `faultText()`, then a nickname scrub (a JSON-parse error can quote a few characters of
  model output).
- **Lock before clear:** a firing takes the lock before it clears a half-built day.
- **What "built" means:** a day is complete when it has 20 ideas, and per child 20 cards and 20 questions. Anything
  less is cleared and rebuilt.
- **`model_runs`:** one row per firing that spent, kind `week:build`, `days` 1, `children` 2.

### 5. `buildWeek` one-day mode

- `WeekOptions` gains `day?`. `days` stays the length the lenses and doors are planned over, 7 from the route.
- With `day` set, `buildWeek` skips the "already built" error and `deleteIdeas`, creates the theme only on day 1,
  loads the earlier days' chains (`loadIdeas`) so layer 1 stays new, writes the five slots side by side, takes day
  d's lens and door from the whole-week plan, and sets `review` only when d is 7.
- A new dep, `deleteDay(themeId, day)`, clears a half-built day.
- **The test:** build a week whole, then build it again seven times in day mode on a fresh fake database. The lens
  and door for every (child, day, slot) are identical; `writeIdeaChain` gets the earlier days; `review` comes only
  after day 7; day mode never calls `deleteIdeas`.
- **Script:** `week:build` gains `--day d`, exclusive with `--days`, an error if d>1 and the week has no theme.

### 6. Module split

- **`core/curation/week-job.ts`:** `prepareWeek(db, {week, start?, stretch?})` does everything before spending,
  including the default start rule moved from the script; `buildDays(prepared, {days}|{day}, opts)` runs
  `buildWeek`, then the gate on the week's pending cards, then writes the `model_runs` row, and returns the report.
- **`core/curation/gate-run.ts`:** `gateSetup`, `themeCards`, `gateTheme` and `gateFailed` move here; `gateTheme`
  takes `complete` as a parameter. `printGate` stays in `scripts/gate-run.ts`.
- **`core/curation/cron.ts`:** pure `nextWeek`, `completeDays`, the scrub, and `cronFiring(deps)`. It doesn't import
  `core/model.ts`.
- **Per-run counter:** `onUsage` in `core/model.ts` gains `use` in its payload. A `meter()` in `core/runs.ts` tallies
  per run, and a wrapped `complete` feeds it. The scripts and the route both record from it.
- **The scripts keep:** their flags, `announceTarget()` and all printing.

### 7. Page copy

- **Week page:** per child, the counts passed, held back by the card checks, held back by your rulebook, held back by
  the checker, and pending; day-slots whose layer 1 was held back named ("No Look card on Tuesday for Pip"), deeper
  held-back layers counted; the floor line ("Checked against safety floor version 1. 38 cards were checked while it
  was still a first guess."); the rulebook line ("Every card was checked against your rulebook as it is today", or
  "12 cards were checked against an older rulebook"); status words "Ready for you to read", "Live from Monday 26
  October", "Being built: 5 of 7 days".
- **Button copy:** the brief's, plus one sentence on the two refusals ("not checked yet", "older rulebook"): "Whoever
  runs Quark can check them again." The button sits in a small client component (`useActionState`), so a refusal from
  the server shows on the page.
- **After the tap:** "Live from Monday 26 October. Made live by [guardian] on Sunday at 7:12 pm."
- **Back to review:** allowed while today in the family's timezone is before `week_start`.
- **`/parent`, under Weeks:** "Week 2 is ready for you to read", plus one Sunday line built from the rows ("Sunday's
  build: week 2, 7 of 7 days, ready at 6:04 pm, $12.31."; "5 of 7 days; the 2 pm firing didn't finish.").
- **Models page:** "The Sunday build: set up / not set up".

### 8. `maxDuration` beside `cacheComponents`

Next 16.4's bundled docs list `dynamic`, `dynamicParams`, `revalidate` and `fetchCache` as removed under Cache
Components; `maxDuration` is not among them. A `GET` handler that reads `request.headers` runs at request time and
isn't prerendered. `next build` was not run (it writes `.next`, which the dev server on test may be using); it is the
first check at 2(c). If it refuses, the fallback is a `functions` entry in `vercel.json`.

### 9. Is removing the safety floor's "first guess" line a new version? No

The gate skips a card only when its stored `floor` equals `floor.version`; it never looks at `floor_first_guess`. The
three items don't change, so the version doesn't. A bump should mean the list changed; if June edits it, that is v2
and everything re-gates. Without a bump, weeks in review need no re-check, and the page counts verdicts by the flag.

### 10. Files, tests, migration

- **Migration:** none.
- **Changed:** `core/curation/week.ts`, `core/model.ts`, `core/runs.ts`; `scripts/week-build.mts`,
  `scripts/gate.mts`, `scripts/gate-run.ts`; the week page, `app/parent/page.tsx`, the models page; `.env.example`,
  `package.json`.
- **New:** `core/curation/week-job.ts`, `gate-run.ts`, `cron.ts`, `live.ts` (`liveProblem()` pure); the route,
  `vercel.json`; `app/parent/week/[theme]/actions.ts` and the client component; `scripts/cron-week.mts`;
  `scripts/fixture.mts`.
- **Tests added:** `nextWeek` across the dates above; `cronFiring` (each refusal spends nothing and writes its row,
  days in order, half-built day cleared, two at once with one stopping, day 7 gives `review`, no nickname anywhere
  including a failure that quotes one); the one-day equivalence test; the secret check (none, wrong, right, unset);
  `vercel.json`; `liveProblem()` for each refusal; `meter()`; a check that only `week-job.ts` calls `buildWeek` or
  `runGate`.
- **Commits:** the brief's four (a)–(d), then the fixture script, then the records at `/close`.

### Decisions taken

- The 3.3 browser steps are driven with Claude in Chrome on localhost, using the test guardian's session; if the
  extension isn't connected they move to Brandon's stop.
- The route's target guard, the nickname scrub, the `started` id and the status codes, as above.
- A pass over pending cards costs nothing when none are pending, and applies to every firing.

### Questions, with recommended answers

1. Floor change as in item 9: not a new version. Recommended yes.
2. When all seven days are built, may a firing still gate cards left pending? Recommended yes.
3. A small test-only `npm run fixture -- delete-week 1` and `-- unpass`, plus `plan:import` on test first.
   Recommended the script.

### Couldn't check

- `CRON_SECRET` in `.env.local` and whether the dev server is running on test.
- Live week 1's start date.
- Vercel production's env, plan and duration cap (the Hobby plan is from Brandon's notes; the cap from the brief's
  reading of Vercel's docs).
- Whether the prompt files load on Vercel (`outputFileTracingIncludes` covers `/**`; never run there).
- `next build` with the new route.
- **Found:** `audit_log` allows a guardian's insert (`for all` policy plus an insert grant), so a signed-in guardian
  can forge `week.cron` or `theme.live` rows. Same class as the direct-write gap.

## Stop 1, part 2: the review of the write-back in plan mode

Brandon asked for a second read of items 2, 4, 5 and 6 and the three questions before go. The plan I wrote for it is
folded in below (it was saved as `docs/reports/2026-10-20-looks-good-plan.md`, untracked, and is deleted).

**Verdict: the shape stands, nine things change.** The route, the eight entries, the secret check, the target guard,
`nextWeek`'s rule and its worked dates, the module split and Question 1 all stand. Four of the changes close real gaps
in "never builds a day twice" and "a lost firing can be recovered" (1 to 4). The rest are smaller.

### What changes, and why

1. **The database does not stop a double-built day.** `ideas` has an index on `(theme_id, day, slot, layer)` but no
   unique constraint (`20261014000000_week_build.sql`), and `cards` has none either. A duplicate firing would silently
   double a day. So:
   - `buildWeek` day mode carries the rule itself: if day d already has ideas it throws "day d is already built (or
     half built)" unless `rebuild` is set, and `rebuild` clears just that day first (`deleteDay`).
   - A day counts as complete only on exact counts: 20 ideas, and per child 20 cards and 20 questions. A doubled day
     is therefore incomplete, and the next firing clears and rebuilds it.
   - The unique indexes (`ideas` on theme, day, slot, layer; `cards` likewise) would be the real lock. They are a
     migration, so they are not taken here; they become a board row (see Brandon's go, point 3).

2. **The lock was wrong in two ways.**
   - It counted any `started` row in the last ten minutes, so a firing that failed in the first minute blocked a
     hand retry for ten minutes (it would bite step 3.5). Only an unfinished `started` row, one with no end row
     pointing at it through `target.started`, now blocks. The earliest by `created_at`, then id, wins.
   - It never re-read the day after taking the lock. After the lock the firing re-reads the day's counts, and if the
     day is now complete it returns `nothing` without building.
   - The clear (`deleteDay`) happens only after both.

3. **A firing killed after it created the theme strands the week.** The day-1 `started` row is written before the
   theme exists, so it names no theme. `nextWeek` identifies the cron's own theme through audit rows, so a killed day
   1 would leave a `generating` theme that reads as hand-built and is refused as "already built" forever. After
   `createTheme`, `cronFiring` appends one row, `{outcome: "theme", theme, week}`. "Cron's own" means any
   `week.cron` row naming the theme.

4. **The gate pass needs a scope.** `runGate` also re-judges cards whose verdict is on an older rulebook. Left as is,
   any firing after a rulebook change, and Question 2's spare pass, would re-gate the week: up to about $7 and past
   300 seconds. The brief says "pending".
   - `runGate` and `gateTheme` gain `pendingOnly`; stale verdicts stay as they are, and the tap's refusal plus
     `npm run gate` already cover them.
   - The report counts them as left alone.
   - Test: pendingOnly checks a pending card, skips a stale one, and spends nothing when none are pending.

5. **`--day` in the script needs the same rules.**
   - `week:build --day d` refuses a built day, `--day d --rebuild` clears and rebuilds only that day (the by-hand
     repair the brief names for a lost day), and `--day` is exclusive with `--days` and `--child`.
   - `--rebuild --child` without `--day` still deletes all of that child's cards, as it does today.
   - With no theme, `--day d` for d above 1 errors.

6. **The lenses-and-doors test was close to a tautology** (both paths call `pickLenses` with `days: 7`). It now:
   - builds the days out of order (1, 2, 4, 3, 5, 6, 7) on a fresh fake database;
   - uses both existing fixture children (`history: {}` and `{story: 5}`);
   - compares the assembled `cards` by (child, day, slot, layer) for lens, door and date against a whole-week build;
   - asserts `writeIdeaChain` got the same `earlier` chains for each slot's day (`ideasPrompt` filters by topic id
     and day, so passing the loaded chains is equivalent).
   - Known limit, recorded in docs/04 and not fixed: once phase 4 records taps, `history` changes between firings
     (the boys use the wall on Sunday), so firing 4 could plan different lenses than firing 3. The fix then is to
     keep the week's lens plan from day 1.

7. **`cron:week` must not use the global `fetch`.** Node's fetch has a 300 s headers timeout, and the dev server has
   no cap, so a slow day would show as a client error while the server finished. The script uses `node:http`, to
   `localhost:3000` only, reads `CRON_SECRET` through `--env-file=.env.local`, and prints the reply, never the secret.

8. **The refusal order among 3 to 5.** `gateSetup()` throws on a missing gate model, so the env check (model names,
   `ANTHROPIC_API_KEY`) runs first, then library, then gate. Nothing is spent either way, and the first reason that
   fails is the one recorded.

9. **Small ones, folded in.**
   - A cron-owned theme that is `live` or `done` returns `nothing` and is never touched.
   - The meter: `meter()` lives in `core/runs.ts` (pure); `meteredComplete(meter)` lives in `core/model.ts`, takes a
     minimal `{add}` so the two files don't import each other, and keeps `complete`'s overloads with one cast. The
     scripts switch to it too.
   - `week-job.ts` tests mock `server-only`, as `model.test.ts` and `prompts.test.ts` do.
   - A firing killed by the time limit writes no `model_runs` row, so `/parent/models` undercounts it. Recorded in
     docs/04.
   - A week left `generating` (a lost day) is visible on `/parent` as "Being built: N of 7 days" and cannot be
     tapped. The cron moves on to the next week and the lost days are built by hand. Recorded in docs/04.
   - Day timings come from the route's own `seconds`, which excludes `next dev`'s first-request compile.

### What stands

- Item 2: `GET`, `maxDuration = 300`, hashed `timingSafeEqual`, 401 before any read, the off-Vercel
  `QUARK_TARGET=test` guard (403), the reply shape, and 200 except `failed` at 500.
- Item 4: the eight Hawaii times and UTC expressions; `nextWeek`'s rule (resume the cron's own theme at next Monday,
  refuse any other theme on or after it, else highest `plan_week` plus one); all six worked dates; the family count
  refusal as reply-only; the row shapes, plus the `started` id link.
- Item 5: the one-day mode's shape, now with change 1's refusal.
- Item 6: the module split, `gateTheme` taking `complete`, and `cron.ts` pure.
- Q1 (no new floor version).
- Item 8: `maxDuration` is not among the options Next 16.4 removes under Cache Components; the first `next build` at
  2(c) is the check.

### The three questions, revised

1. **Floor line is not a new version: yes.**
2. **A firing that finds all seven days built still gates cards left pending: yes, with `pendingOnly`** (change 4)
   **and leaving a live theme alone** (change 9). Nothing when none are pending, about $0.026 a card when some are.
3. **Test-state script: yes, `npm run fixture -- delete-week <n>` and `-- unpass <n>`.** No live twin;
   `announceTarget()` refuses a live file. `unpass` only ever writes `pending` (it clears the card's gate notes);
   neither command writes `passed`. Both print the week and the counts they will touch before touching them.
   `npm run plan:import` on test runs after the delete, to undo step 5's day-1 reorder.

## Brandon's go (20 October 2026)

Brandon: "Approved, all nine." Three things carried in:

1. **The stop goes to the file first.** Step 1 and this review are written here with Write and committed on their own
   before anything else. The saved plan file is folded in and deleted. The record that step 1 was printed before it
   was written is at the top of this file.
2. **3.3(c) is Brandon's.** The tap that makes the week live is his at stop 3. Claude Code drives 3.3(a) and (b) in
   Chrome and does not tap (c). At stop 3 Brandon taps; the second tap (told it's already live) and the back-to-review
   check are his checks there too, and Claude Code reads the audit rows afterwards on test.
3. **Two board changes, made at the close:** the unique-index row's *Waiting on* is "before a real week 2 on live",
   and the `audit_log` insert finding goes into the direct-write row's scope (*Guardians can't write a week's status
   or a card's verdict directly: only the server can*).

Then go: pull, the board row to *building*, and build.

## Build sequence after go

0. Report committed alone; `git pull --rebase origin phase-3-curation`; the board row moved to *building* as the next
   commit, alone. Capture `npm run week:build -- --week 1 --days 1 --plan` on test before touching the script.
1. 2(a) `week-job.ts`, `gate-run.ts` (with `pendingOnly`), the meter and `meteredComplete`, and `week:build` and
   `gate` on them, with tests. Diff the `--plan` output against step 0's.
2. 2(b) `buildWeek` day mode, `deleteDay`, `--day`, and the out-of-order equivalence test.
3. 2(c) `cron.ts`, the route, `vercel.json` and its test, `.env.example`, the models-page line, `cron:week`, and
   `fixture`. `next build` is the first check.
4. 2(d) `liveProblem()`, `makeWeekLive` and back to review, the client component, the week-page block, and the
   `/parent` lines.
5. Step 3 as the brief has it, with the additions above: one real script run through `week-job` before 3.5; Chrome
   for 3.3(a) and (b); 3.3(c) at stop 3, Brandon's.
6. Stop 3, then the records and `/close`.

## Stop 2: a day took 268.5 seconds, over the 240-second line (20 October 2026, evening)

The brief's stop for step 3.5: "Any day over 240 seconds: STOP, with the timings." Days 1 to 5 of test's week 1 are built
through the route; days 6 and 7, the ninth firing, 3.3 (a) and (b), 3.6 and Brandon's tap are not done. Nothing is live
and nothing is on `main`.

### What is built (the four commits, pushed)

| Step | Commit | What |
|---|---|---|
| 2(a) | `a398d77` | `week-job.ts` and `gate-run.ts` in `core/curation`, the per-run meter and `meteredComplete`, `pendingOnly` in `runGate`; `week:build` and `gate` on them |
| 2(b) | `788ffb9` | `buildWeek`'s one-day mode, `deleteDay`, `--day`, and the out-of-order lenses-and-doors test |
| 2(c) | `5a4c84b` | `cron.ts`, `cron-job.ts`, the route, `vercel.json`, `cron:week`, `fixture`, the models-page line, `.env.example` |
| 2(d) | `0477511` | `live.ts` and the Looks-good tap, `makeWeekLive` and back to review, the week page, the `/parent` lines |

The records (stop 1's report and the board row) are `e12811c` and `c3465fe`. Step 3.1: `npm test` 308 passed (230 at the
start), `npm run typecheck` clean, `next build` clean: `/api/cron/week` is dynamic and the build output carries
`maxDuration: 300` for it (`.next/server/functions-config-manifest.json`), so the open question in the write-back's item 8
is closed. Step 3.2: pushed; no migration changed, so the migrations workflow did not run (`gh run list` still shows the
two runs of 20 Oct, 09:28Z and 20:05Z).

### Proved on test so far

- **3.4(a):** the route with no secret, and with a wrong one: 401 `Unauthorized`; no audit row written.
- **3.4(b):** `npm run cron:week` with week 1 as it was: `refused`, "week 1 is already built", nothing spent, two audit
  rows (`started`, `refused`, linked by `started`). `CRON_SECRET` is set in `.env.local` and the dev server reads it.
- **3.4(c):** `week:build -- --week 2 --plan`: the library's refusal ("the look card needs 6 and 0 are left; …") from
  `weekSchedule` inside `prepareWeek`, nothing spent.
- **The refactor changed nothing:** `week:build -- --week 1 --days 1 --plan` printed the same bytes before and after 2(a);
  `npm run gate -- --week 1` ran through the moved code at $0.00 (38 cards already checked against this rulebook).
- **The script's day mode on the real database,** by `week:build -- --week 1 --day 2` (a mistake, below) and then
  `--day 2 --rebuild`: the rebuild cleared and rewrote only day 2 (ideas stayed 20 a day, cards 40 a day, no doubles, the
  cascade through `ideas` took the day's cards and questions), the theme went to `generating`, a second `--day 2` is
  refused with "Day 2 of week 1 is already built, or half built" at $0.00.
- **3.5, the whole week through the route:** test's week 1 deleted (`fixture -- delete-week 1`: 40 ideas and 80 cards over 2
  days), `plan:import` on test undid the step 5 reorder (day 1 is now leap-years and two-dice with the Nile), then the
  firings below. **Two at once on day 3:** one built it, the other answered `refused`, "another firing is working on day
  3 of week 1", in 1.3 seconds.

### The timings

| Firing | Day | Route seconds | Run row seconds | Calls (ideas, cards, gate) | Cost |
|---|---|---|---|---|---|
| route | 1 | 209.4 | 203 | 5, 10, 40 | $1.7072 |
| route | 2 | 237.0 | 233 | 5, 13, 40 | $1.8584 |
| route | 3 | 198.6 | 195 | 5, 10, 40 | $1.7064 |
| route | 4 | 206.2 | 203 | 5, 12, 40 | $1.7947 |
| route | **5** | **268.5** | 265 | 5, 12, 39 | $1.8757 |
| script, `--day 2` (mistake) | 2 | n/a | 257 | 5, 12, 37 | $1.75 |
| script, `--day 2 --rebuild` | 2 | n/a | 267 | 5, 12, 39 | $1.77 |

Seven days built: 195 to 267 seconds, mean about 232; three of the seven were over 250. The day's time does not follow
its call count (day 4 and day 5 both made 12 card calls and took 206 and 268 seconds), so it is the model's latency, not
the work, that moves it. Hobby stops a function at 300; the worst so far is 89.5% of that, and 237 and 267 were within
three and twenty-seven seconds of 240. Money on test: the five route days $8.94, the two script days $3.52, the earlier
gate re-check $0.00: $12.46 in all, each run under the $25 line. The twin firing and the three refused ones spent nothing.

### Where the day goes (estimated; nothing records phases)

One day is five idea calls side by side (about 45 s), then each child's cards one child after the other with the calls
four at a time (five chains a child, so a round of four and a round of one: about 70 s a child, 140 s), then the gate on
40 cards four at a time (about 60 s). That adds to about 245 s, which matches.

### Mistakes in this stretch

- **A build I ran by mistake.** To see the script's refusal I ran `week:build -- --week 1 --day 2` on test, thinking day 2
  existed. Test's week 1 held only day 1 (the brief says so, and I wrote it myself), so it built day 2: $1.75 on test, 257
  seconds. Under the $25 line and test only, so no stop was crossed, but I should have run `fixture -- show 1` first; I now
  look before a run that spends. It left a theme in review with two days, which is why 2(b) sets a theme back to
  `generating` whenever it adds a day.

### Decisions taken in the build (for Brandon to strike)

1. **`liveProblems` refuses a week in review that has fewer than seven days** ("Only 2 of 7 days are built…"). A trial
   `--days 3` week sits in review today and would otherwise go live with four empty days. Consequence: 3.3 as the brief
   wrote it (a tap on test's one-day week) cannot be allowed, so 3.3 (a) and (b) run on the whole week after 3.5. (c) is
   Brandon's at stop 3, as he said.
2. A day added to an existing theme puts it back to `generating`; the theme goes to review only when all seven days are in.
3. A run that made no model call writes no `model_runs` row.
4. `fixture` also has `show`, `audit` and `runs`, all read-only.
5. A firing that finds all seven days built still gates cards left pending, `pendingOnly` (the review's question 2).

### The decision: what to do about the 240-second line

The brief gave two ways out: build both children's cards side by side (about a third off a day, changes `buildWeek`), or
move to Pro (800 seconds). Measured above, there are three cheap levers inside the code and none changes the cost:

- **Both children's cards at once.** One pool across children instead of a child after a child: about 70 s saved.
- **Five at a time for cards** (a child has five chains a day, so four leaves a second round of one): the same round
  again if it stands alone, and together with the first the whole card phase becomes one round of about 35 s.
- **The gate eight at a time** instead of four: about 30 s saved.

Together they would take a typical day from about 230 s to about 120 to 150 s, and the worst seen from 268 to about 190.
The risks: ten or so calls at once on one API key (the SDK retries a 429 twice by itself), and more database writes at
once. Pro (800 s) fixes the cap but not the slowness, and costs money every month. A third way, no change at all, leaves
a 10% margin on the worst day: a firing killed at 300 s is recovered by the next one, but the week would no longer be
reliably ready by 7 pm.

**Recommended: the code change (children side by side, five a chain-round, the gate eight at a time), not Pro.** It
touches `buildWeek` and `runGate`'s default concurrency, test only, no cost. After it I time days 6 and 7 through the
route, rebuild day 5 by hand to compare, and carry on from 3.5. It is undone by reverting its commit.

Pre-flight for this stop:
1. **What is about to happen:** the card writing for both children and the gate run with more calls at once.
2. **What it touches:** not live. `core/curation/week.ts` and `core/curation/gate.ts` (a default), their tests; test's days 6
   and 7 are then built through the route at about $1.90 each.
3. **How it is undone:** revert the commit; no data is changed by it.
4. **What was checked on test:** the timings above; nothing of this change yet.

Brandon: "go: the code change, not Pro. Both children's cards at once, five card calls per child, the gate eight at a time,
with tests; one commit. Then days 6 and 7 through the route; the 240-second line still stops you. Record the per-day table
and the rule (under 240 fine; over 240 is the Pro conversation) in docs/04 at the close, and name the rate-limit failure
mode there: a day that fails on a rate limit is cleared and rebuilt by the next firing. All four decisions you took stand."
(Five decisions are listed above; the review's question 2 is the fifth. He said four: I read it as all of them.)

## Stop 3: the whole week is built and checked on test; the tap is Brandon's (20 October 2026, evening)

The code change is `634aa46` (one commit, with tests: 311 pass, typecheck clean). Days 6 and 7 went through the route on
it. 3.3 (a) and (b) are done on the whole week; the tap (c) is not done, on purpose. Nothing is live and nothing is on `main`.

### The per-day table (every day built through the route or, for the first two script rows, the script)

| Day | Seconds (route) | Run row seconds | Calls (ideas, cards, gate) | Cost | Concurrency |
|---|---|---|---|---|---|
| 1 | 209.4 | 203 | 5, 10, 40 | $1.7072 | old |
| 2 | 237.0 | 233 | 5, 13, 40 | $1.8584 | old |
| 3 | 198.6 | 195 | 5, 10, 40 | $1.7064 | old |
| 4 | 206.2 | 203 | 5, 12, 40 | $1.7947 | old |
| 5 | 268.5 | 265 | 5, 12, 39 | $1.8757 | old (the stop) |
| 6 | **131.4** | 128 | 5, 13, 39 | $1.8534 | new |
| 7 | **125.2** | 122 | 5, 11, 40 | $1.8419 | new |

Old: cards a child after a child, four at a time, the gate four at a time. New: both children at once, five a child, the
gate eight at a time. The new days took 125 to 131 seconds, about half of the old mean (232) and 44% of the 300-second
Hobby cap; the worst day under the new setting has 169 seconds of room. The eighth firing found all seven days built and
did nothing, in 2 seconds, for $0. The route cost for the week is $12.64 (a normal full week is about $11.55 to $13.44).
The estimate on `/parent/models` reads "about $13 a week, about $55 a month".

No rate-limit failure showed in the two new days (the call counts are the same as the old days, so the SDK did not
need to retry visibly). The failure mode is still real and recorded for docs/04 at the close: a day that fails on a
rate limit after the SDK's two retries ends as a `failed` row, leaves a half-built day, and is cleared and built again by
the next firing (the 8 pm spare covers one lost firing; two lost firings leave a day missing on Monday).

### 3.3 (a) and (b), on the whole week, in Chrome as the test guardian

- **The page, whole week, before anything:** "Ready for you to read", the Looks good button enabled, per child "Kiddo: 136
  passed. Held back: 2 by the card checks, 0 by your rulebook, 2 by the checker. 0 cards aren't checked yet.", the first
  cards missing named ("No Then card on Saturday for Kiddo."), "3 deeper cards are held back; Kiddo stops at the layer
  before one.", "Safety floor version 1, still a first guess.", "Every card was checked against your rulebook as it is
  today."
- **(a) a card back to pending:** `fixture -- unpass 1` set the 26 Oct look card, layer 1, to pending *while the page
  was open with an enabled button*. Pressing the stale button was **refused by the server**: "1 card isn't checked yet. This
  week can go live once every card is checked. Whoever runs Quark can check them again." No `theme.live` row was written
  and the week stayed in review. A reload showed the button disabled with the same reason. `npm run gate -- --week 1`
  checked the card again (1 call, $0.03) and the page allowed the tap. This was a tap that could only be refused; it is the
  one tap I made, and it did not make the week live.
- **(b) a changed setting:** the test guardian's answer on subject 14 changed in the app (`beliefs.answer`), which moved
  nothing: on the test copy only one guardian has answered each subject, so the merge ignores it (the rulebook says 24
  waiting). A **block on subject 14** (`blackball.place`, then `values.save` version 5) is what changes the rulebook, as in
  step 5's proof. The answer was set back first. Then the page said "278 cards were checked against an older rulebook and
  need checking again before this week can go live. Whoever runs Quark can check them again." and the button was disabled.
  `npm run gate -- --week 1` checked 278 cards in 179 seconds for **$6.91** (the brief's "about $1" was for the one-day
  week): 269 passed, 9 held back by the checker (parent_led 7, caution 2), none pending. The page then allowed the tap.
- **Left on test:** the block on subject 14 stays (lifting it changes the rulebook again and every verdict goes stale: about
  $7 and three minutes to check them again). Test only. The test family's answer on subject 14 is as it was.

### 3.4 again, with the week built

- No secret, and a wrong one: 401, nothing written.
- A firing with the week built: `nothing`, "all seven days of week 1 are built", $0, two audit rows linked by `started`.
- `week:build -- --week 2 --plan`: the library's refusal ("the look card needs 6 and 0 are left; …"), nothing spent.

### 3.6, the pages after

- `/parent`, under Weeks: "Week 1 is ready for you to read" (a link), then "Sunday's build: week 1, 7 of 7 days, ready at 4:37
  pm, $12.64." (the hand-fired days all fell on one Hawaii date, so they read as one Sunday), then the week in the list
  as "from Oct 26, ready for you to read".
- `/parent/models`: "The Sunday build: set up", and the estimate above.
- The week page on the whole week: as above; the browser could not take a screenshot of it (it timed out at 30 seconds; the
  page holds 280 cards), so these were read from the page's text and structure rather than seen.

### Money, test only

Route days 1 to 7 $12.64; the two script runs of day 2 $3.52; the gate re-checks $0.03 and $6.91. About $23.10 in all, each run
under the $25 line. Nothing was spent on live.

### What Brandon does now (the tap, 3.3(c))

The dev server on test is up, and a tab of the week page is open in the browser I drive. Open
`http://localhost:3000/parent` on test, read the Weeks section, open "Week 1 is ready for you to read", and read the week.
Then:

1. Open the week page in a **second tab** too, so there is a stale button to press afterwards.
2. In the first tab press **Looks good**. Expected: "Live from Monday 26 October. Made live by [you] on Tuesday at [time]."; the
   heading becomes "Live from Monday 26 October"; the button becomes "Take it back to review".
3. In the second tab (not reloaded) press **Looks good**. Expected: "This week is already live." and nothing written.
4. In the first tab press **Take it back to review**. Expected: "This week is back in review…", the heading "Ready for you to
   read" again (allowed because the week starts on 26 October and today is the 20th).
5. Tell me when done (any order is fine). I then read the audit rows (`theme.live`, `theme.review`) and finish the records.

Pre-flight:
1. **What is about to happen:** Brandon presses Looks good on the test copy's week 1, then takes it back.
2. **What it touches:** not live. The test copy's `themes.status` for week 1 and two rows in the test copy's `audit_log`. Nothing
   on an iPad, because there is no kid view yet.
3. **How it is undone:** "Take it back to review" on the same page, until Monday 26 October 00:00 Hawaii time.
4. **What was checked on test:** the tap's refusals (a pending card, an older rulebook, with the server's answer to a stale
   page), the allowed state of the button, and the pages' lines. The allowed tap itself, the stale second tap and the
   take-back have not been done; they are this step.

### Couldn't check

- The tap, the second stale tap and the take-back (Brandon's, above).
- A screenshot of the week page (timed out; read from text).
- Vercel production: the eight entries, `CRON_SECRET`, the three model names and the key there, and a firing that ends at
  300 seconds (a Hobby function stopped mid-run); live week 1's start date. None is in this job.
- A rate-limit failure in practice (none occurred); that a firing killed at the cap leaves the day recoverable is held by
  tests and by the design, not seen.

### Carried to the close (Brandon's instructions and mine)

- docs/04: the per-day table above and the rule (**under 240 seconds is fine; over 240 is the Pro conversation**), and the
  rate-limit failure mode (a day that fails on a rate limit is cleared and rebuilt by the next firing); how the Sunday build
  and the Looks-good page are built; the lens plan limit once phase 4 records taps (history can change between firings);
  `/parent/models` undercounts a firing killed by the time limit; a week left `generating` is visible and untappable.
- docs/13 (weekly curation row), docs/08 (the *Decided:* lines), CLAUDE.md (the stack line, *Where we are*), the README status.
- Board: the unique-index row ("Waiting on": before a real week 2 on live), and the `audit_log` insert finding into the
  direct-write row's scope; this row to *on test*.
- The bug for the wwc job skill (printed before written) is recorded at the top of this file.

## After the tap (20 October 2026, evening)

Brandon: "done. Three things for the close: (1) every card on the test week says 'No approved picture for this topic yet',
because content:fetch has never run on quark-test; the proof week was text-only, so a day with pictures through the route
is a 'couldn't check', and content:fetch on test goes on the to-do before the Wonder Wall slice; (2) after 'This week is
already live' the stale tab keeps its old heading and an enabled Looks good; the component should redraw to the live
state after a refusal: beyond the brief, your call whether it is a one-line fix now or a bugs line; (3) the heading
'Kiddo (chapter_books, age 9)' shows the raw reading-level code; pre-existing, one bugs line."

### What the tap wrote (read from the test copy's audit log)

- `theme.live` at 03:03:25 UTC: week 1, floor 1, 269 passed, 11 held back (the 9 the checker held back and the 2 the card
  checks held back), under the rulebook of the block on subject 14. Then `theme.review` at 03:04:38 UTC. The week is in
  review again. Brandon's description: the first tab went live and the stale second tab was refused with "This week is
  already live" and kept its old heading and an enabled button.

### (2) The stale tab: fixed now, `e7c0a51`

My call: a fix, not a bugs line, because it was three small edits in the page I had just built. A refused Looks-good or
take-back tap now revalidates `/parent/week/<theme>` and `/parent` as well as answering (`refused()` in
`app/parent/week/[theme]/actions.ts`), and the tap button is keyed on whether it is blocked, so it starts afresh when
the page redraws and the reason is in the list above it rather than twice. The "Reload the page" wording is gone from
both refusals. Checked in the browser on the same pending-card scenario as 3.3(a): the stale tab pressed Looks good,
the server refused, and the page redrew with the button disabled and the reason listed once and no message left over;
the card was then checked again ($0.03, none pending). Not checked: the exact sequence Brandon saw (a second tab after
the week went live), which needs a second tap that makes the week live; it goes through the same `refused()` call, and
the redrawn page for a live week is the one the first tab already shows. Tests: 311 pass, typecheck clean.

### (3) The raw reading-level code: a bugs line, not fixed

One line at the top of the Bugs list in docs/08: the heading shows `cards.level` as stored, the reading-level code and
the age. Size: minutes. (This page names the invented test family's children; the line in the repository uses an invented
nickname.)

### (1) Pictures: a "couldn't check", and a to-do

`npm run content:fetch` has never run on `quark-test`, so test has no approved items: every topic is text only, every
card says "No approved picture for this topic yet", and the whole proof week above (the timings, the costs, the gate's
reading) is of text-only cards. Live has its pictures (CLAUDE.md's 2b and 2d notes: the items were fetched and approved there). What differs on
a day with pictures, unproved: the ideas prompt lists the offered items; layer 1 must use one, and a chain without is
sent back once (a second idea call of the same chain, in parallel with the other slots, so up to one more call's time
on the day, perhaps half a minute); cards carry `image_alt`. My estimate, not measured: a day of about 130 seconds
becomes about 160, still under 240. The rule in docs/04 (under 240 fine) stands, and the first real Sunday on live is
the first day with pictures through the route.

To-do, for `/close` to put on the board as its own row: **content:fetch on quark-test, so a test week has pictures** (a
job of minutes; the model cost of flagging each item is not measured, so check the estimate with `content:fetch` first; waits
on: before the Wonder Wall slice). Phase 4.

### For the close (everything carried)

- docs/04: *How the Sunday build is built* and *How a week goes live*; the per-day table; the rule (**under 240 seconds is
  fine; over 240 is the Pro conversation**); the rate-limit failure mode (**a day that fails on a rate limit is cleared and
  rebuilt by the next firing**); the 13 Oct line ("what the gate held back", not "changed"); the lens plan limit once phase 4
  records taps; `/parent/models` undercounts a firing killed at the time limit; a week left `generating` is visible and
  untappable; the pictures "couldn't check".
- docs/13 (weekly curation row: a day a firing, eight firings, Hobby), docs/08 (the *Decided:* lines under *The Sunday cron
  and the Looks-good page*, as built; the first-guess question answered: not a new version), CLAUDE.md (stack line; *Where we
  are*), the README status line.
- Board rows: this row to *on test* (waiting on: the release; `CRON_SECRET` on Vercel by Brandon's hand; more short lessons
  before a real week 2; the direct-write row's migration before any week is made live on live); the unique-index row
  (ideas and cards, "an hour", phase 3, **waiting on: before a real week 2 on live**); the `audit_log` insert finding added
  to the direct-write row's scope; the content:fetch-on-test row above.
- Test state left behind, for the record: the block on subject 14 on `quark-test` (lifting it makes every verdict stale: about
  $7 and three minutes to check them again), and week 1 in review there.
- Spend on test this job: about $23.10 (the table above), plus $0.03 for the card checked after the redraw check.
