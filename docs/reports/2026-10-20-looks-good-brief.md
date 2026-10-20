# Report: the step 6 brief, the Sunday cron and the Looks-good page (`docs/looks-good-slice.md`), 20 October 2026

Job: `/wwc:job`, writing the brief for phase 3 step 6 and its board row; closed with
`/wwc:close`. Branch: `phase-3-curation`, pushed. Opus 5.5. Nothing built, nothing on live,
nothing to `main`, nothing set on Vercel.

Brandon's words this job:

- In the command, dated for the brief and docs/08: "13 Oct 2026: nothing goes live on its own";
  "20 Oct 2026: the cron is the simple version only: a Vercel cron hitting one route that runs
  the week build for next week into review. Nothing more: no rebuild from the cron, no digest, no
  worker"; "20 Oct 2026: the Looks-good page is on the critical path"; "20 Oct 2026: the run line
  is $25 a run".
- At step 1: "go, taking all of these: the eight Sunday firings, one day each (the one change to
  the simple version); 6 am to 8 pm Hawaii with the 8 pm spare; one family per copy; the /parent
  line and audit rows for a refused run, no email; live undone by any guardian until Monday
  midnight Hawaii; no twenty questions before the tap; refuse when the gate can't run; the whole
  week through the route on test, about $13; phase-3-curation. Three additions to the brief: (1)
  the direct-write gap is its own board row, phase 4, importance high, waiting on Wonder Wall
  slice 1, with a line that its migration lands before any theme is made live on live; (2) step 1
  of the build says whether removing the floor's "first guess" line is a new floor version, with
  the recommendation that it is not, since each verdict records floor_first_guess on its own, so
  weeks in review need no re-gating for it; (3) say "ready by 7 pm Sunday", since a Hobby firing
  lands anywhere within its hour. Then /wwc:close."

## Couldn't check

- **A full week's time.** About 25 minutes is seven times day 1; no whole week has ever been
  built. Day 1's 218 seconds is one run, on test, with four card second asks in it.
- **The Vercel plan.** Hobby is from Brandon's setup notes of 10 October, not read from Vercel
  (no Vercel CLI and no linked project here). On Pro a week still doesn't fit (800 seconds).
- **Vercel's limits** are from its documentation read today (function duration, updated 24 August
  2026; cron usage and pricing, 15 July 2026; managing cron jobs, 11 August 2026), not tried on a
  deploy. Whether `export const maxDuration` builds beside `cacheComponents` is left to step 1 of
  the build.
- **Live reads, not done:** live week 1's start date, and whether Vercel's production
  environment has `ANTHROPIC_API_KEY` and the three model names.
- **The direct-write gap** is read from the migrations (the grants in `20261010000002` and the
  `family_isolation` policies in the first), not tried against Supabase's data API.
- **`/cost`** I can't run; Brandon types it and the figure goes at the end of this file.

## Done

**Step 1 (write-back).** Read the records the prompt named (CLAUDE.md; docs/04, 08 and 13;
`docs/gate-slice.md` and its report; `scripts/week-build.mts`, `gate-run.ts`, `gate.mts`,
`target.ts`; `core/curation/week.ts`, `schedule.ts`, `gate.ts`; the migrations in order; the
parent pages; the rulebook actions; `lib/family-rulebook.ts`; `next.config.ts`; `proxy.ts`). No
`vercel.json` exists, as Brandon believed. Confirmed and quoted `schedule.ts` line 51, the throw
before anything is built. Read on `quark-test`, spending nothing: `model_runs` (day 1 built with
the gate on 20 October took 218 seconds: 5 idea, 14 card and 30 gate calls, $1.66; the gate's
re-check of 38 cards took 60 seconds), the one theme (week 1, starting 26 October 2026, in
review), the cards (34 passed, 6 blocked) and the newest audit rows. Read Vercel's documentation
on function duration and cron jobs. Drafted the brief in the scratchpad and wrote back the
decisions and the *To settle* list; Brandon took all of them, with three additions.

**What the brief says, in short.** A week doesn't fit one Vercel function, so the one route
builds one day a firing, eight firings on Sunday, 6 am to 8 pm Hawaii, the week ready by 7 pm.
It refuses before spending and records every firing in `audit_log`. The Looks-good tap is on the
week page, for any guardian, refused on a pending card or an older rulebook or floor, undone
until Monday midnight. No migration. `CRON_SECRET` on Vercel is Brandon's switch.

**Commits on `phase-3-curation`:**

- `aa8394f`: the board rows: the step 6 row *briefed*; the guardians' direct-write row *raised*.
- `99e6e3d`: `docs/looks-good-slice.md`, settled, with the three additions written in.
- The close: docs/08 (a new heading, *The Sunday cron and the Looks-good page: decided in the
  brief*, with the *Decided:* lines dated 20 October 2026 and Brandon's words, and the floor
  version question open for step 1 of the build); CLAUDE.md *Where we are* (step 6 briefed, the
  next steps, the no-live-week-before-the-migration line, a note on this job); the README status
  line; the board (the curation engine row's Waiting on); this report.

**Board.** *The Sunday cron and the Looks-good page: a guardian's one tap makes a week live*:
briefed, phase 3, waiting on the build session and `CRON_SECRET` in `.env.local`. *Guardians
can't write a week's status or a card's verdict directly: only the server can*: raised, phase 4,
an hour, importance high, waiting on Wonder Wall slice 1, with its migration before any theme is
made live on live. *Curation engine v1*: still building, waiting on step 6 built. No *live* row
is older than 14 days. `npm run docs:board`: In hand 1, Waiting 2, Next 1, Raised 10, Not fully
formed 7, Live lately 6, Bugs 3.

**One slip:** the first commit ran with its `git add` and a `git log` in the same command; the
method asks for each commit as its own command. Nothing else was chained with it.

## Beyond the brief

- The direct-write board row, Brandon's first addition.
- Decision 1 became eight firings, not one, because a week doesn't fit; Brandon took it as the
  one change to the simple version.

## On live

Nothing. No live command ran, nothing was set on Vercel, and nothing went to `main`. The brief's
step 5 lists what the release carries: its first Sunday must refuse week 2 for want of lessons,
spending nothing; the production environment's names; the step 5 live stops first; and no week
made live on live before the direct-write row's migration lands there.

## For the read-back

- **API spend:** $0. One read of the test database.
- **The live database:** untouched. Once released, and once Brandon sets `CRON_SECRET` on Vercel,
  the cron writes to the live database and spends about $12 a week on its own each Sunday
  (Brandon's 20 October decision); removing `CRON_SECRET`, or Vercel's Disable Cron Jobs, stops
  it. The build's proof on test is about $14.
- **Anything a child could see:** nothing now. The Looks-good tap is the first switch the wall
  will read, so the brief treats it as anything a child will see.
- **Naming a child in the public repository:** nothing this job wrote names a child (checked by
  search); the brief uses the invented Pip and Wren.
- **Rules touched:** rule 2 (any one guardian makes a week live, and any one can take it back
  until Monday; the direct-write gap would let one guardian pass a card the other's blackball
  held back); rule 5 (the tap refuses until every card is checked on today's rulebook); rule 4
  (no notification); rule 7 (no GitHub Actions schedule, since its public log would print the
  children's nicknames; no nickname in a route reply or an audit row).

## Migrations runs watched

None: this job changed nothing under `supabase/migrations`.

## `/cost`

From Brandon's `/cost` at the close (this Claude Code session, not Quark's own model spend):
**$6.48** in all (claude-opus-5-5 $6.43, claude-sonnet-5-5 $0.0541, claude-haiku-5-5 $0.0005);
17m 33s of API time over 45m 12s of wall time; 1,120 lines added and 6 removed.
