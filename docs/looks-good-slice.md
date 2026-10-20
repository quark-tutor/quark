# The Sunday cron and the Looks-good page: step 6 of phase 3

Brief drafted in Claude Code on 20 October 2026, on `phase-3-curation`, for Brandon to settle
before the build session. One job, one Claude Code session in `quark`, on `opusplan` (the brief
changes how `buildWeek` builds a week, and leaves the exact page copy to step 1). The board's
row: *The Sunday cron and the Looks-good page: a guardian's one tap makes a week live* (briefed,
phase 3). It adds a route that builds next week on its own every Sunday once it is released, and
a button that makes a week live. Nothing a child can see changes yet, because there is no kid
view; but the button is the first switch the kid view will read, so this brief treats it as
anything a child will see.

**Decided by Brandon before this brief:**

- 13 October 2026: nothing goes live on its own. The weekly job leaves a theme in review; a
  guardian sees the week and what the gate held back, taps once, and the theme goes live.
- 20 October 2026: the cron is the simple version only: a Vercel cron hitting one route that
  runs the week build for next week into review. Nothing more: no rebuild from the cron, no
  digest, no worker. If a week cannot be filled from the library, it refuses before spending
  anything, as `weekSchedule()` already does.
- 20 October 2026: the Looks-good page is on the critical path. Step 6 is the last phase 3
  build; then the live stops from step 5, `/wwc:release` to `main`, then phase 4 (the Wonder
  Wall), so something reaches the boys' iPads.
- 20 October 2026: the run line is $25 a run; a full week is about $11.55 to $13.44 and runs
  freely. The safety floor stays a first guess until June reads it and a commit removes the
  line; the subject 13 answer and thinking tokens stay open in docs/08 and are not this step's.

**Settled with Brandon on 20 October 2026 ("go"):** every decision below and every recommended
answer under *To settle*, with three additions, written in below. Brandon: "go, taking all of
these: the eight Sunday firings, one day each (the one change to the simple version); 6 am to 8
pm Hawaii with the 8 pm spare; one family per copy; the /parent line and audit rows for a refused
run, no email; live undone by any guardian until Monday midnight Hawaii; no twenty questions
before the tap; refuse when the gate can't run; the whole week through the route on test, about
$13; phase-3-curation." The additions: (1) the guardians' direct write on `themes` and `cards` is
its own board row (phase 4, importance high, waiting on Wonder Wall slice 1), and its migration
lands before any theme is made live on live; (2) step 1 of the build says whether removing the
floor's "first guess" line is a new floor version, recommended not; (3) the week is "ready by 7
pm Sunday", since a Hobby firing lands anywhere within its hour. The decisions are dated for
docs/08 at this brief's close.

## Why

Rule 5 and the 13 October decision: a week reaches a child only after a guardian has seen it
and said it looks good. Today nothing in the code sets a theme `live`: `week:build` leaves it in
`review` and `/parent/week/<theme>` is read-only. Phase 4's wall needs that switch to read.

CLAUDE.md's stack says the weekly curation is a Vercel cron route on Sunday night, Hawaii time,
and a worker if it outgrows the function limit. Today `week:build` runs by hand from the laptop.

**Measured while writing this brief: a week does not fit one Vercel function, on any plan.**
Day 1 of week 1, built with the gate on `quark-test` on 20 October, took 218 seconds; a week is
about seven of those, about 25 minutes. The project is on Vercel's Hobby plan, where a function
runs for at most 300 seconds (Pro: 800). A day fits. So the simple version takes one change: the
one route builds one day each time it is called, and the cron calls it eight times on Sunday
(decisions 1 and 3). Still no worker, no rebuild and no digest.

## Proposed decisions, for Brandon to confirm (then dated for docs/08)

1. **The cron: eight firings on Sunday, one route, one day each.**
   - **`vercel.json`** (none exists today) with eight entries under `crons`, all on the path
     `/api/cron/week`, two hours apart on Sunday, Hawaii time, written in UTC. Hawaii is UTC−10
     all year, with no daylight saving:

     | Sunday, Hawaii | Expression (UTC) |
     |---|---|
     | 6 am | `0 16 * * 0` |
     | 8 am | `0 18 * * 0` |
     | 10 am | `0 20 * * 0` |
     | noon | `0 22 * * 0` |
     | 2 pm | `0 0 * * 1` |
     | 4 pm | `0 2 * * 1` |
     | 6 pm | `0 4 * * 1` |
     | 8 pm (spare) | `0 6 * * 1` |

     On Hobby each entry may fire once a day, anywhere within its hour; one expression listing
     several hours fails the deploy. Two hours apart, with each firing capped at five minutes,
     two firings never overlap. **The week is ready by 7 pm Sunday**: the 6 pm firing lands
     anywhere between 6:00 and 6:59 and runs for at most five minutes. The 8 pm firing builds a
     day an earlier firing missed or lost. If a week fitted one function, this would be one
     entry, `0 4 * * 1` (6 pm Sunday). It doesn't (decision 3).
   - **The route:** `app/api/cron/week/route.ts`, `GET` (Vercel calls a cron with `GET`),
     `export const maxDuration = 300`. It compares the `Authorization` header with
     `Bearer <CRON_SECRET>` (constant-time), and answers 401, having done nothing, when the
     header is wrong or `CRON_SECRET` is not set. It is outside `proxy.ts`'s matcher
     (`/parent`, `/sign-in`, `/auth` only), so no sign-in redirect reaches it; a cron does not
     follow redirects.
   - **Where it runs.** On Vercel, in the production deployment, with Vercel's environment,
     which is **the boys' live copy**. Once released, every Sunday it writes to the live
     database and spends on the Anthropic key with nobody at the laptop. That is what Brandon
     decided on 20 October, and it is why `CRON_SECRET` on Vercel is his switch (decision 6).
     Preview deployments never fire a cron; only production does. On the laptop, `npm run dev`
     reads `.env.local`, so a call to localhost is a call on `quark-test`.
   - **Which week.** One family per copy, as every script assumes: the route refuses if the
     database holds any other number. "Today" is the date in the family's timezone
     (`families.timezone`, Pacific/Honolulu), so a firing at 04:00 UTC on Monday is still
     Sunday. Next Monday is the Monday after today. Next week is the family's highest
     `plan_week` plus one (1 when there is none), starting next Monday. The route passes that
     start itself: `week-build.mts` counts on from week 1's start, which after a skipped Sunday
     would give a date in the past.
   - **Each firing, refusing before it spends:**
     1. Another firing of the same week and day started in the last ten minutes: this one stops
        (the lock, below).
     2. A theme already starts on or after next Monday and is not one the cron is building:
        refused, "week N is already built". Never rebuilt. One the cron is building is in
        `generating` and was started by a firing, as that firing's audit row says.
     3. The library can't fill the week: `weekSchedule()` throws before anything is built
        (`core/curation/schedule.ts`, line 51: `Not enough short lessons for week ${week}: …`,
        naming the short slots). Refused, nothing spent.
     4. The gate can't run: no rulebook, or a saved rulebook older than the guardians' answers
        (the two cases in `gateSetup()`). Refused, because a week built now would stay
        pending and could not go live. `week:build` by hand still builds and leaves the cards
        pending, as now.
     5. A model name or the API key is missing: refused.

     Then it builds the next day of the week not yet built (day 1 creates the theme as
     `generating`; days 2 to 7 add to it) and gates the week's cards still pending. After day
     7 the theme goes to `review`. A day an earlier firing left half built (it ran out of time
     or failed) is cleared and built again; no other day is touched. Once all seven days are
     built, a firing does nothing and says so.
   - **What it records, so a guardian is never guessing on Monday.** One `audit_log` row when
     a firing starts (`week.cron`, outcome `started`, with the week, the day and the theme) and
     one when it ends: `built` (the day's cards passed, held back and pending, and its cost),
     `refused` (the reason) or `failed` (the error in a few words, as `faultText()` writes it).
     `guardian_id` is empty, because no guardian did it. A `started` row with no end means the
     time limit stopped the firing. A `model_runs` row of kind `week:build` for each firing
     that spent anything (`days` 1, `children` 2), as the script writes now, so `/parent/models`
     and `estimate()` count it. Nothing in either names a child. `model_runs` has no column for
     a reason, which is why the reason goes to `audit_log`.
   - **On `/parent`, under Weeks:** next week's line once it is in review ("Week 2 is ready for
     you to read", linking to it), and one line on this Sunday's build, from those rows. For
     example: "Sunday's build: week 2, 7 of 7 days, ready at 6:04 pm, $12.31."; "Sunday's
     build refused at 6:02 am: not enough short lessons for week 2 (the look card needs 7 and
     0 are left). Nothing was spent."; "Sunday's build: 5 of 7 days; the 2 pm firing didn't
     finish." No email and no notification.
   - **The lock.** Vercel's delivery is best effort: a firing can be missed or, now and then,
     delivered twice. Two copies of day 1 can't both make a theme (`themes` is unique on
     family and week start, and on family and plan week), but nothing stops two copies of day
     3. So each firing writes its `started` row first, then reads the `started` rows for the
     same week and day from the last ten minutes, and only the earliest goes on. No migration.
   - **Money.** Vercel stops a firing at 300 seconds, which also bounds what it can spend: day
     1 on test cost $1.66 in 218 seconds, so one firing can't spend much over $2.50, and a
     Sunday where every firing ran to the cap about $20. A normal full week is about $11.55 to
     $13.44, under the $25 run line.
   - **How Brandon stops it.** Vercel, the project's Settings, Cron Jobs, Disable Cron Jobs (it
     stays off through later deploys); or remove `CRON_SECRET` from Vercel's environment, so
     every firing gets 401 and does nothing.

2. **One copy of the week-build wiring.** The route can't run a script, so what
   `scripts/week-build.mts` does around `buildWeek()` moves into
   `core/curation/week-job.ts`, written with relative imports and extensions like
   `lib/family-rulebook.ts`, so the scripts and the app both load it:
   - `prepareWeek(db, { week, start, stretch? })`: everything before spending: the one family,
     its children, profile and points; the stretch and the library; earlier themes;
     `weekSchedule()` (which throws when a slot is short); the approved items; the topics and
     the plan; `gateSetup()`; and the list of what the family's settings decide. It spends
     nothing.
   - `buildDays(prepared, { days } | { day }, { rebuild?, onlyChild? })`: `buildWeek()`, then
     the gate on the week's pending cards, then the `model_runs` row; it returns the report.
   - The data half of `scripts/gate-run.ts` (`gateSetup`, `themeCards`, `gateTheme`,
     `gateFailed`) moves to `core/curation/gate-run.ts`; `printGate` stays in `scripts/`.
   - **A run counts its own calls.** `usageSoFar()` is one counter for the whole process. On
     Vercel a warm instance keeps last Sunday's counts and can serve another request at the
     same moment, which is why the twenty-question action already prices its calls with
     `onUsage`. `complete()` is given a counter for the run, and the script and the route both
     record from it.
   - **`buildWeek()` gains a one-day mode.** `{ day: d }` builds day d into the existing
     theme, loading the earlier days' chains so each slot's ideas carry on (`loadIdeas` exists),
     and leaves the theme `generating` until day 7 is built. Lenses and doors are planned for
     the whole week and day d's are taken, because `pickLenses()` and `planDoors()` plan over
     the days they are given (a quarter of the day-slots get a door: one in a one-day build,
     eight in a week). A test holds that a week built a day at a time has the lenses and doors
     of one built whole. `week:build` gains `--day d`.
   - **The cron's own logic** is `core/curation/cron.ts`: `nextWeek()`, pure (the family's
     themes and today in its timezone in; the week, its start and the day to build, or the
     refusal, out), and `cronFiring(deps)`, which runs decision 1's order with the database,
     the clock and the build passed in, as `buildWeek` takes them.
   - **What stays where.** The script keeps its flags (`--week`, `--days`, the new `--day`,
     `--child`, `--rebuild`, `--start`, `--stretch`, `--debug`, `--plan`), `announceTarget()`
     and all the printing. The route keeps the secret, `maxDuration` and its JSON reply
     (outcome, week, day, reason, cost; never a nickname).
   - **Tests** (Vitest, a fake model and database, no network): `nextWeek` across dates (04:00
     UTC on a Monday is Sunday in Hawaii; no themes yet; a skipped Sunday; a week already built;
     a later week built by hand); `cronFiring`: each refusal spends nothing and writes its row,
     days in order, a half-built day cleared and built again, two firings at once with one
     stopping, day 7 setting `review`, and no nickname in any row or reply (the invented Pip and
     Wren); the one-day build's lenses and doors; the secret check (none, wrong, right, and
     `CRON_SECRET` unset); and a check that neither the script nor the route calls `buildWeek`
     or `runGate` except through `week-job.ts`. The curation and gate tests that exist still
     pass.

3. **The function time limit: a week doesn't fit; a day does.**
   - **Calls in a full week:** ideas 35 (one per day and slot, plus a second ask when layer 1
     lacks a picture; none on day 1); cards 70 (one per child per day-slot, plus second asks:
     4 of 14 calls on day 1); the gate up to 280 (one per card the model reads: 30 of 40 on day
     1, with 8 held back in code and 2 by the card checks). About 350 to 400 calls.
   - **Measured on `quark-test`** (`model_runs`, read on 20 October, nothing spent): day 1 of
     week 1, built with the gate on 20 October, took **218 seconds** (5 idea calls, 14 card
     calls, 30 gate calls; $1.66). The gate's re-check of 38 cards took 60 seconds, about 1.6
     seconds a card at four at a time.
   - **A full week**, built the way the script builds it (the five slots side by side, each
     slot's days one after another; one child's cards after the other's, four at a time; the
     gate four at a time), is about seven times day 1: **about 25 minutes**, the gate about 7
     of them. A whole week has never been built, so this is not measured.
   - **Vercel** (its documentation, read 20 October 2026). The project is on the Hobby plan.
     With fluid compute, which is on by default, a function on Hobby runs for at most 300
     seconds; on Pro, 800 (1,800 in a beta). Cron entries: 100 a project; on Hobby, once a day
     each, fired anywhere within the hour. The limit is set on the route as
     `export const maxDuration = 300`, the App Router's named export; step 1 of the build
     confirms that `next build` accepts it beside `cacheComponents`.
   - **So a week fits no plan, and a day fits Hobby:** 218 of 300 seconds, with four second
     asks in it, about three quarters of the cap. Hence decision 1's eight firings. If any day
     built through the route on test takes over 240 seconds (80% of the cap), the build stops
     (step 3) and Brandon chooses between building both children's cards side by side, which
     takes about a third off a day and changes `buildWeek`, and moving to Pro.
   - **A firing stopped by the limit** leaves a half-built day and a `started` row with no
     end; the next firing clears the day and builds it again. A day the 8 pm spare also loses
     stays missing: the theme stays `generating`, `/parent` names the day, and Brandon builds
     it by hand (`week:build:live -- --week N --day d`, a live command, at a stop of its own).
   - **Not taken** (*To settle*): Pro on its own (a week still doesn't fit 800 seconds); a
     worker on Railway or Fly, as docs/13 says (a second service holding the live database's
     secret key and the API key); a scheduled GitHub Actions run (the repository is public, so
     its run logs are public, and `week:build` prints the children's nicknames and the gate's
     reasons); Vercel Workflows (a new product to depend on).

4. **The Looks-good page.**
   - **Where.** `/parent/week/[theme]` gains it at the top; `/parent` says when next week is
     ready (decision 1).
   - **What a guardian sees before tapping, per child:** the cards that passed; those held
     back by the card checks, by the rulebook in code, and by the checker; those still
     pending. The day-slots whose layer 1 is held back, by name ("No Look card on Tuesday for
     [nickname]"), because that card is missing that day. Deeper layers held back, counted,
     since the child stops at the layer before one. The safety floor's version, and "still a
     first guess" while it is one. The rulebook: "Every card was checked against your rulebook
     as it is today", or how many were checked against an older one.
   - **The tap.** One button, "Looks good". Any guardian (rule 2), and one is enough. One
     server action, `makeWeekLive(themeId)` in `app/parent/week/[theme]/actions.ts`, copying
     `app/parent/beliefs/rulebook/actions.ts`: `requireGuardian()`, the admin client scoped to
     the guardian's family, and everything read again on the server, never taken from the
     page. It is refused, with the reason on the page and nothing written, when the theme isn't
     this family's or isn't in `review`; when any card is `pending`; when any verdict's
     rulebook hash isn't today's, today's being the hash of the guardians' answers now
     (`familyRulebook()`, as the twenty-question run checks), so a saved rulebook older than
     the answers refuses too; or when any verdict's floor version isn't the floor file's now.
     It checks the floor's version, not whether the floor is still a first guess: each verdict
     records `floor_first_guess` on its own (step 1 settles whether removing that line is a new
     version; recommended not). Otherwise `themes.status` goes to `live`, by an update that only
     matches a theme still in `review` (two guardians tapping at once: one wins, the other is
     told it is already live), and an `audit_log` row is written (`theme.live`: the theme, the
     week, the rulebook hash, the floor version, and the cards passed and held back). If the
     audit row fails, the status goes back and the page says so.
   - **After the tap:** "Live from Monday 26 October. Made live by [guardian] on Sunday at 7:12
     pm." Naming the guardian is fine here: the audit log is open to every guardian.
   - **Back to review:** any guardian, until the week's first day begins in the family's
     timezone (Monday, midnight, Hawaii), with an audit row (`theme.review`). After that,
     holding back one card is phase 4's, with the wall.
   - **Copy** says "checker", "held back" and "your rulebook", never "AI". Proposed:
     - Under the button: "Any one of you can do this. From Monday, the Wonder Wall will show
       the cards that passed and nothing that was held back. The wall isn't on the iPads yet,
       so for now nothing changes for the kids."
     - Refused: "3 cards aren't checked yet. This week can go live once every card is
       checked."; "12 cards were checked against an older rulebook and need checking again
       before this week can go live."; "This week is already live."
     - The status line, in place of the raw word: "Ready for you to read" (review), "Live from
       Monday 26 October" (live), "Being built: 5 of 7 days" (generating).
   - **What live means today:** nothing a child sees, since the wall is phase 4. It is the
     first switch the kid view will read, so it is treated as anything a child will see, and
     docs/04 records the rule for phase 4: the wall shows a card only when its theme is `live`,
     the card has `passed`, and its day is today.

5. **Migrations: none.**
   - `theme_status` already has `live` (`planned`, `generating`, `review`, `live`, `done`,
     from the first migration), so `themes.status` is the switch.
   - `audit_log` (first migration) has an optional `guardian_id`, a free-text `action` and a
     `target` in JSON, and every guardian of the family reads it; so the tap's rows
     (`theme.live`, `theme.review`) and the cron's (`week.cron`) need nothing new.
   - The stored hash: each verdict carries `policy_notes.gate.rulebook` and `floor` (step 5),
     checked against `values_profiles.source_hash`, `familyRulebook()` and the floor file.
   - `model_runs` takes a firing as kind `week:build`; the reason for a refusal goes to
     `audit_log`.
   - The lock is the `started` rows; the two unique indexes on `themes` stop a second theme.
   - The one gap found that needs a migration, the guardians' direct write on `themes` and
     `cards`, is a board row of its own (*To settle*). If step 1 of the build finds a migration
     is needed after all, it is shown and reviewed at stop 1, and waits for Brandon's yes.

6. **Secrets and the environment.**
   - `CRON_SECRET`: in `.env.local` (test) by Brandon's hand before the session; in Vercel's
     production environment by Brandon's hand when he wants the Sunday build to start, after
     the release. `vercel env` is on the ask list, and the value never passes through Claude
     Code. Until it is set on Vercel, every firing gets 401 and nothing runs, so the release
     can reach `main` with the cron asleep.
   - `.env.example` gains `CRON_SECRET=`, with a line on what it is (at least 16 random
     characters, Vercel's advice).
   - `/parent/models` gains one line: "The Sunday build: set up" or "not set up" (whether
     `CRON_SECRET` is set; never its value).
   - For the release: Vercel's production environment also needs `ANTHROPIC_API_KEY` and the
     three model names (`QUARK_MODEL_CURATE`, `QUARK_MODEL_WRITE`, `QUARK_MODEL_GATE`); the
     models page shows which are set.

7. **The stops** are the five in *Steps and stops*, in that order. There is no live command
   in this build.

## Read first

1. CLAUDE.md (loaded): the *Method* block, *Before a consequential action*, *Where we are*;
   this brief.
2. docs/04: the 13 October decision ("Does a week go live on its own? No"), *How a week is
   built*, *How a week is mixed*, *How the gate is built*, *How the models and costs page is
   built*; docs/13, the weekly curation row; docs/08, *Building a week*, *The policy gate*,
   *Models and costs*, *The Sunday cron and the Looks-good page*, *Bugs*; `docs/gate-slice.md`
   and `docs/reports/2026-10-20-gate-slice.md`.
3. `scripts/week-build.mts` whole, `scripts/gate-run.ts`, `scripts/gate.mts`,
   `scripts/target.ts` and its test; `core/curation/week.ts`, `schedule.ts`, `gate.ts`,
   `cards.ts` (`planDoors`); `lib/lenses.ts` (`pickLenses`); `core/model.ts` (`usageSoFar`,
   `onUsage`); `core/runs.ts`; `gate/safety-floor.md` and `readFloor()`.
4. `supabase/migrations/` in order: `theme_status`, `themes` and `audit_log` in the first;
   `20261010000002` (a signed-in guardian may update `themes` and `cards`); `model_runs` in
   `20261016000000`; `plan_week` and its unique index in `20261016000001`; `gate_test_runs` and
   `model_runs.kind` in `20261020000000`.
5. `app/parent/page.tsx`, `app/parent/week/[theme]/page.tsx`,
   `app/parent/beliefs/rulebook/actions.ts`, `app/parent/models/page.tsx`,
   `lib/family-rulebook.ts`, `lib/guardian.ts`, `lib/supabase/admin.ts`, `proxy.ts`,
   `next.config.ts`; Vercel's pages on managing cron jobs, their usage and pricing, and
   function duration.

## Brandon's own steps, before the session

1. Add `CRON_SECRET` to `.env.local` (the test file): a random string of at least 16
   characters (a password generator will do), then restart your dev server on localhost:3000
   so it reads it. Claude Code never reads a `.env` file.
2. Nothing on Vercel yet. `CRON_SECRET` (a different value from the test one),
   `ANTHROPIC_API_KEY` and the three model names in Vercel's production environment come with
   the release, by your hand.
3. Keep the dev server running on test for step 3.
4. If June would like to, read the page copy in step 1's write-back together.

## Steps and stops

Every STOP carries the four-line pre-flight report: what is about to happen; what it touches
(LIVE in capitals, or "not live"); how it is undone; what was checked on test. No step here is
live.

1. **Write back, then STOP.** Read the files above and show: the eight cron entries with their
   Hawaii times; the route in outline and its JSON reply; `nextWeek`'s rule with worked dates;
   the refusals in order and the audit rows' shapes; `buildWeek`'s one-day mode and the test
   that holds lenses and doors; `week-job.ts`'s functions and what stays in the script; the
   page copy and the `/parent` lines; whether `maxDuration` builds beside `cacheComponents`;
   **whether removing the floor's "A first guess, pending June" line is a new floor version**
   (recommended not: each verdict records `floor_first_guess` on its own, so weeks in review
   need no re-gating for it, and the page goes on saying which verdicts were reached while it
   was a first guess); the files to change; the tests to add; and that no migration is needed,
   or the one that is, written out. Say the branch (`phase-3-curation`, no new one). Suggest
   plan mode and `opusplan`. **Brandon confirms and says go.** On go the board row moves to
   *building* as the first commit.
2. **Build,** each a commit: (a) `core/curation/week-job.ts` and `core/curation/gate-run.ts`,
   the run's own counter, and `week:build` and `gate` on them, with tests; (b) `buildWeek`'s
   one-day mode and `--day`, with tests; (c) `core/curation/cron.ts`, the route, `vercel.json`,
   `.env.example`, the models page's line, and `npm run cron:week` (a script that calls the
   route on localhost only, with the secret from `.env.local`, printing the reply and never the
   secret), with tests; (d) the Looks-good block, `makeWeekLive` and back to review, with their
   refusals as a pure function (`liveProblem()`) under test, and the `/parent` lines. No
   migration; one found at step 1 is its own commit, behind a STOP for Brandon's yes (CLAUDE.md).
3. **Prove it on test, then STOP.** In this order, each shown:
   1. `npm test` and `npm run typecheck`.
   2. Push the branch. No migration changed, so the migrations workflow may not run; `gh run
      list --workflow migrations.yml --branch phase-3-curation --limit 1`, and say what it
      shows.
   3. The tap on test's week 1 as it is (day 1, 40 cards, in review, starting 26 October):
      (a) one card set back to `pending` on test: refused, nothing written; `npm run gate --
      --week 1` checks it again (about $0.03). (b) The test guardian changes one subject's
      setting: the page counts the cards checked against an older rulebook and the tap is
      refused; `npm run gate -- --week 1` (about $1); the tap is allowed. (c) The tap: `live`
      and its audit row; a second tap is told it's already live; back to review with its row
      if the week hasn't begun, or refused if it has.
   4. The route: (a) called without the secret, 401 and nothing written; (b) one firing with
      week 1 there: refused (already built, or the library, depending on the date), nothing
      spent, its two audit rows, the `/parent` line; (c) `npm run week:build -- --week 2
      --plan`: the library's refusal through the same module, nothing spent.
   5. **A whole week through the route**, the first ever built. Test's week 1 is deleted on
      test (test only; its cards were step 5's proof, kept in that job's report). Then the
      firings by hand, one at a time: day 1 creates week 1 starting next Monday; days 2 to 7
      add to it, each timed and costed; on one day, two firings at once, and one stops; a
      ninth firing does nothing. **Any day over 240 seconds: STOP**, with the timings. About
      $13 on test in all; each firing about $1.90, under the $25 line.
   6. The `/parent` lines and the models page after it; the week page on the whole week.

   **STOP** for Brandon to open `/parent` and the whole week on test, read it, and tap Looks
   good as the test guardian.
4. **Records and `/close`.** docs/04 (*How the Sunday build is built*; *How a week goes live*;
   the 13 October line says "what the gate held back", not "changed"); docs/13 (the weekly
   curation row: a day a firing, eight firings, Hobby); docs/08 (the *Decided:* lines under
   *The Sunday cron and the Looks-good page*, as built); CLAUDE.md's stack line ("If it outgrows
   the function limit, move to a worker" becomes a day a firing) and *Where we are*, then the
   README status line; the board row to *on test* (waiting on: the release; `CRON_SECRET` on
   Vercel by Brandon's hand; more short lessons before a real week 2; the direct-write row's
   migration before any week is made live on live). The full report, the four-line read-back,
   `/cost`.
5. **Live: only by Brandon's yes, and not in this job.** The first production firing comes with
   the release, and only once Brandon sets `CRON_SECRET` on Vercel. The release brief carries:
   - its first Sunday builds week 2 and must refuse for want of lessons, spending nothing; the
     library needs lessons before a real week 2 (week 1 uses all 28);
   - Vercel's production environment needs `CRON_SECRET`, `ANTHROPIC_API_KEY` and the three
     model names;
   - the step 5 live stops come first (`db:push:live` for `gate_test_runs` before `main`, then
     `gate:live` on week 1);
   - **no theme is made live on live until the migration of the board row *Guardians can't
     write a week's status or a card's verdict directly* has landed there** (decided 20 October
     2026): the Looks-good button reaches production with the release, but nobody taps it on the
     live copy before then;
   - live week 1's start date has not been read (a live read); if it has passed, the week stays
     in review and no firing touches it.

## To settle with Brandon at step 1

Settled on 20 October 2026 ("go"), every one as recommended.

- **The fallback, since a week doesn't fit.** One day a firing, eight Sunday firings
  (decisions 1 and 3). It is the one change to the simple version: eight entries in place of
  one, and `buildWeek`'s one-day mode; still one route, no worker, no rebuild, no digest. The
  others: Pro alone doesn't fit a week either; a worker is a second service with the live keys;
  a GitHub Actions schedule would print the children's nicknames in a public log; Vercel
  Workflows is a new product.
- **The Hawaii hours.** 6 am to 8 pm Sunday, every two hours; the week is ready by 7 pm Sunday,
  and the 8 pm firing is a spare. Later hours leave less time to build a lost day by hand before
  Monday.
- **Every family, or the first only.** One family per copy, as every script assumes; the route
  refuses with a recorded reason if there are more or fewer.
- **What a refused or failed firing shows a guardian.** The line on `/parent` and the audit
  rows; no email (the digest is phase 5).
- **Whether live can be undone, and until when.** Yes, any guardian, back to review, until the
  week's first day begins (Monday, midnight, Hawaii), with an audit row. After that, holding
  back one card is phase 4's, with the wall.
- **The twenty questions before the tap.** No. They test the Ask box's answers, not the cards,
  and the tap already checks that every card's verdict is on today's rulebook.
- **Refusing when the gate can't run.** Yes (decision 1, refusal 4): a week built without a
  rulebook can't go live, so the cron doesn't spend on it.
- **How much to prove on test.** A whole week through the route (step 3.5), about $13 on test.
  It is the first whole week ever built, and the first on live runs with nobody watching.
- **Branch.** `phase-3-curation`, no new branch; this is phase 3's step 6.
- **Left for step 1 of the build:** whether removing the floor's first-guess line is a new
  floor version. Recommended not (step 1 above).
- **Found while writing this brief, where it and the repository disagree:**
  - A week doesn't fit one Vercel function on any plan (decision 3). CLAUDE.md's "move to a
    worker" and docs/13's row change at the build's close.
  - **A signed-in guardian can update `themes` and `cards` directly** through Supabase's data
    API (`20261010000002` grants select, insert and update, and `family_isolation` allows any of
    the family's rows). So the tap's refusals can be gone around, and a card one guardian's
    blackball held back could be set to `passed` by the other (rule 2, rule 5). No page does
    either today. Closing it is a migration (guardians lose update on `themes`, `ideas`, `cards`
    and `questions`; the server keeps it). **Settled:** its own board row, *Guardians can't
    write a week's status or a card's verdict directly: only the server can* (phase 4, an hour,
    importance high, waiting on Wonder Wall slice 1), not this job, which stays without a
    migration; and its migration lands before any theme is made live on live (step 5).
  - `week-build.mts` sets a week's start from week 1's start, not "the next Monday"; the route
    passes the start itself (decision 1).
  - `usageSoFar()` is one counter for the process, wrong for a route (decision 2).
  - `buildWeek()` has no way to add one day to a week, and plans lenses and doors over the
    days it builds (decision 2).
  - Vercel can deliver a firing twice or not at all; nothing in the database stops a duplicate
    day (decision 1, the lock).
  - `model_runs` has no column for a reason (decision 1: the reason goes to `audit_log`).
  - `buildWeek()` sets `review` even when the gate then leaves cards pending; the tap's refusal
    covers it.
  - docs/04's 13 October line says the guardian sees "what the gate changed"; the gate never
    changes a card (step 5, decision 1). It becomes "what the gate held back" at the build's
    close.
  - Not read, because they are live: live week 1's start date, and whether Vercel's production
    environment has the API key and the model names. The Hobby plan is from Brandon's setup
    notes of 10 October, not read from Vercel (no Vercel CLI here).

## Not in this job

- Any live command; anything set on Vercel; the release; the step 5 live stops.
- The kid view, and what the wall shows from a live week (phase 4); holding back one card once a
  week is live; the digest (phase 5); a worker; Vercel Pro; a rebuild from the cron; a "check
  again" button on the page (it would spend from a page); the `done` status (unused).
- More short lessons; closing the guardians' direct write on `themes` and `cards` (its own row);
  prompt caching; thinking tokens; the open bugs.

## What done means

- On the laptop against `quark-test`, the route builds next week one day a firing, refuses
  before spending in each case named, records every firing in `audit_log` (and a `model_runs`
  row when it spent), and never builds a day twice. A whole week built through it on test, each
  day under 240 seconds, timed and costed.
- One copy of the wiring: `week:build`, `gate` and the route all go through
  `core/curation/week-job.ts`; each run counts its own calls.
- The week page shows, per child, the cards passed, held back and pending, the first cards
  missing, the floor's version and the rulebook's state. The tap makes a week live for any
  guardian, with an audit row, and is refused on a pending card, an older rulebook or an older
  floor; a week goes back to review until its first day.
- `/parent` says when next week is ready and what Sunday's build did.
- `vercel.json` has the eight entries; `.env.example` names `CRON_SECRET`; the models page says
  whether it is set.
- No migration, or the one reviewed at stop 1.
- Proven on `quark-test` through steps 3.1 to 3.6, shown, and Brandon has opened the week there
  and tapped it.
- docs/04, docs/13, docs/08, CLAUDE.md and the README say how it is built; the board row is
  *on test*.
- The job closed with `/close`: the records committed by name, the branch pushed, the full
  report with its "couldn't check" lines first, the four-line read-back, and the `/cost`
  figure. Nothing on live, and nothing to `main`.
