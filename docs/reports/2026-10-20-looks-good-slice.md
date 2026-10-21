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
