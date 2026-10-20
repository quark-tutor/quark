# Report: the brief for the policy gate (phase 3, step 5), 20 October 2026

Job: `/job Write the brief for Phase 3 step 5, the policy gate, as docs/gate-slice.md …`
(the first message of the session; no brief file, the brief is what the job wrote).
Branch: `phase-3-curation`, pushed. Sonnet 5.5. Brandon's go and five changes
are in the chat; his words are in docs/08, *The policy gate: decided in the
brief*.

## What could not be checked

- **Nothing was run that the brief's work needs.** The job changed documents
  only. I did not run `npm test` or `npm run typecheck`.
- **Every cost figure in the brief is my guess, not a measurement:** about $0.02
  a card, about $6 a week for the gate, about $12 for a full week with it, about
  $20 for the proposed run line, about $1.70 for the day-1 proof, about $0.20 a
  child for the test run. They come from the list prices in `core/prices.ts` and
  an assumed 4,500 tokens in and 200 out a card. Step 1 of the build measures the
  real policy document and the real cost.
- **Two statements in the brief are from memory, not checked:** that Node's
  `--env-file` does not override a variable already set in the shell (step 3.6),
  and that Vercel deploys `main`.
- **`.env.local` was not read** (a secret file), so whether `QUARK_MODEL_GATE` is
  set there is unchecked; it is Brandon's step 2 in the brief.
- **June has not read** the safety floor, the twenty questions or the
  `careful_about` decision. The brief and docs/08 say her view is not recorded;
  the floor is marked a first guess for that reason.
- **`/idea` and `/job` were not in this session's skill list.** I read their
  files from the plugin cache and followed them by hand. The board row is
  *briefed* (a brief now exists), not `/idea`'s default *not fully formed*.
- **`/wwc:release` was misreported once, then corrected.** The first draft of the
  brief said I could not read it, because the installed plugin copy
  (`75332818d9f8`) has no `release` skill. It is in the plugin's source
  (`working-with-claude/skills/release`), read at this close, and the brief's
  *To settle* now says what it does. The ordering in step 6 of the brief is
  unchanged.
- **`/cost` is not run yet.** I cannot run it; Brandon types it and the figure
  goes at the bottom of this file.
- I cannot see permission prompts, so I claim nothing about any. I ran no command
  that names a backstop pattern: no push to `main`, no `:live` script, no live env
  file, no `db-push`, no `git add -A`, `git add .` or `git commit -a`.

## What was done

- Read CLAUDE.md, the three 19 October commits (migrations workflow, release line,
  migrations line), docs/04, docs/09, docs/08, `gate/values-interview.md`, the
  migrations, `core/curation/cards.ts`, `week.ts`, `core/prompts/flag-content.md`,
  `core/model.ts`, `core/runs.ts`, `lib/policy.ts`, `scripts/week-build.mts` and the
  plan files, and wrote `docs/gate-slice.md` in the shape of
  `docs/test-database-slice.md`: Why, 13 proposed decisions, Read first,
  Brandon's own steps, Steps and stops, To settle at step 1, Not in this job,
  What done means.
- Added the board row (*briefed*, phase 3). It is stage *briefed*, not *building*,
  because no build session has started.
- Brandon said "go", taking every recommended answer, with changes, all written
  into the brief and pushed:
  1. `careful_about` goes to the gate only, and the gate call carries the note
     and nothing else about the child.
  2. `gate/safety-floor.md` starts as the three items in docs/09 and is marked a
     first guess, pending June.
  3. A new run line, measured at step 1 of the build, replaces a standing STOP on
     every full week.
  4. The gate call also carries the child's age band, because the frightening
     judgement is age-relative; reading level stays out.
  5. The band is the plan's grade band, 2-3 or 4-5. A child has no grade on file,
     so the brief proposes code picks it from the age, 8 and under 2-3, 9 and over
     4-5; step 1 shows the cut.
- Close: Where we are note and README status line, docs/08 (three open lines
  marked decided, a new section, a proposed run line and one open question), the
  board (gate row moved, three rows added), this report. `npm run docs:board`
  wrote `Quark board.html` (untracked, not committed).
- **Migrations runs watched: none.** No migration was written or pushed. After
  the pushes `gh run list` for the migrations workflow still shows only the
  20 October 09:28 UTC run (success, 35 s) for the workflow commit; its path
  filter does not fire on a documents-only push.
- Where the brief and the repository disagree (all in the brief): the brief's
  "approved" is the enum's `passed`; docs/04 says the gate joins the cost estimate
  on its own and `estimate()` does not include it; `week-build.mts` checks only
  the idea and card models before spending; `careful_about` cannot be entered
  anywhere.

## Beyond the brief

- Three board rows for things the report leaves to other jobs: safety-floor
  lessons in the plan, a way for a guardian to enter what to be careful about,
  and prompt caching of the policy document. All *not fully formed*.
- I changed the gate row's *Waiting on* after the go, and re-dated it, as
  `/close` does; it is not *building*.
- Decisions the brief records as made but that are Brandon's and June's to
  answer: `match_exemplars_to_sex` (rules 6 and 7) is left out of the card
  prompt and undecided; the nickname that can appear in a card's own words is an
  open line in docs/08, recommended left as written.

## On live

Nothing. No command against the live database, no live env file, no migration,
no model call, no API spend, nothing a child can see changed. The brief lists the
live steps (the migration, `gate:live` on day 1, the release) as separate stops
for the build session, each Brandon's yes.

## Rules touched

Rule 2: the safety floor limits what either guardian can block (a first guess
pending June), and a blackball blocks in code without naming the guardian.
Rule 7: a sensitive free-text note about a child, and a grade band, reach the
model provider in the gate call and nothing else about the child does. Rules 5
and 6: the gate is the check rule 5 asks for, and it is not told a child's sex.

## Commits

- `ca58af7` Brief for phase 3 step 5, the policy gate: docs/gate-slice.md
- `3dd4a4e` Idea: the policy gate, phase 3 step 5, as a board row
- `2968c72` Gate brief settled: careful_about alone with the gate, safety floor
  a first guess pending June, a measured run line
- `175838a` Board: the gate row now waits on Brandon's test steps, June, and the
  build session
- `d65b350` Gate brief: the gate call carries the careful_about note and the
  child's age band, nothing else
- `3bd5c22` Gate brief: the gate's age band is the plan's grade band, 2-3 or 4-5
- The close commit follows this report.

## Cost

`/cost`: not run yet. Brandon types `/cost`; the figure is added here.
