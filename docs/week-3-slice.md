# Brief: week 3 builds itself

**Phase 3, on `phase-4-wonder-wall`.** Drafted 7 November 2026 in the chat, 18:30, the Saturday week 2 ends with no
week 3 behind it. Board row: "Week 2 on live … and the Sunday build switched on" (*building*, open at stop 6 of
`docs/week-2-slice.md`; this brief resumes that row and widens it to week 3, on Brandon's word at stop 1). Project:
*Week 2 builds itself*. **Status: ready.**

**Size:** a slice, over tonight and Sunday: the candidates, the picks and the library on live tonight; the Sunday
build does the rest by itself; Brandon and June's look and the tap Sunday evening.

## Why

Week 2 (Monday 2 to Sunday 8 November) ends tomorrow and the wall is empty from Monday 9 November. The library holds
exactly the 56 lessons weeks 1 and 2 used, and a week takes lessons no earlier week used (`weekSchedule()`), so week
3 needs 28 new ones before anything can build it. The Sunday build has still never run on Vercel: the week 2 job
stopped at stop 6 waiting for the firing, and `CRON_SECRET` and the three model names were never set (the job's
report, *Go (2 Nov, 05:59 HST)*: "The firing comes later today; wait at this stop"). Nothing was committed after.

So this job does three things in one evening: the firing week 2's job was waiting for, so the route is proven on
Vercel before it has to work unattended; week 3's 28 on live by tonight, so the 6 am firing has a library to build
from; and week 4's candidates banked, so next Saturday is a pick and not a hunt. If it all lands, **Sunday 8
November is the first week Quark builds by itself**, and the by-hand `week:build:live` is the fallback, not the
plan.

What stays by hand every week, by design, and is not this job's to change: the 28 new lessons a week (the chore
this brief makes a read), and the tap (rule 5).

## Stops

1. **After reading: the candidates and the firing's command.** Code has written **40 candidates** (step 1) into
   `plan/candidates/short-lessons-3.md`: the 12 not taken from `short-lessons-2.md` (7, 8, 14, 15, 16, 23, 24, 29,
   31, 32, 39, 40, re-numbered here), each checked still to fit, and 28 new, every one as the week 2 file has them
   (slot, a title naming its idea, one line of what it teaches, picture or recording with source and license, values
   points). Veterans Day, Wednesday 11 November, among them. The stop prints the 40 as a numbered list with the 28
   marked ★ and the day each lands on, and the **exact firing command** (the week 2 report's stop 6, step 3, is the
   model: `read -rsp`, so the secret never enters a transcript) with what each reply means. Brandon and June reply
   with the 28 (numbers, or "the 28 as marked"), and **the firing's reply** (the JSON and the HTTP line). Anything
   the records and this brief cannot settle, with its recommended answer; "go" takes them all.
2. **After step 3, on test: Your look at the library, then M1, M2 and the plan on live, by Brandon's hand.** The 28
   are written, imported on test, their items fetched on test (`content:fetch`, about $0.50), and
   `week:build -- --week 3 --start 2026-11-09 --plan` on test printed seven days with no gap. Brandon, on
   `https://localhost:3000/parent/content` as the test guardian (the dev server is the HTTPS one):
   - "Every new picture is one I'd put in front of the boys, and its credit line reads right."
   - "Anything waiting is approved or rejected."
   "go" means both passed; a picture to drop is named without the word, and that is a fix round (another candidate
   takes its place on test, and the look is taken again). Then, only on go, back to back:
   - **M1: `npm run plan:import:live`.** LIVE: 28 lessons into the live library (56 rows in `plan_topics`, kind
     `short`, positions 57 to 84); undone by deleting them by key. Checked on test at step 3.
   - **M2: `npm run content:fetch:live`.** LIVE, about $0.50: the new items into the live store. It prints nothing
     until every item is done (the 1 Nov bug line), so wait for the table. Anything not approved automatically
     appears at live's `/parent/content`, which Brandon reviews before bed.
   - **The plan on live, spending nothing: `npm run week:build:live -- --week 3 --start 2026-11-09 --plan`.** Read
     it for seven days with no gap, both boys `chapter_books`, and the block "What the family's settings decide":
     a line ending "is parent-led." is fine; "is blocked by a guardian", "is set to Don't bring it up" or "is Not
     yet for this child" means an empty tile Monday, and that lesson is swapped for the next in its slot tonight
     (a few cents on live) before the firing can take it.
   Brandon pastes what M1, M2 and the plan printed. **Nothing else runs tonight.** From here the Sunday build is on
   its own: eight firings, 6 am to 8 pm HST, a day each, about $13.
3. **Sunday: Your look at week 3 on live, then the tap.** On Sunday, `/parent` on live says what the firings did
   ("Sunday's build: week 3, N of 7 days…"). When all seven are in, Brandon and June on `/parent/week/<theme>`:
   - "Seven days, Mon 9 Nov to Sun 15 Nov, five first cards a day for each boy, each with its picture or recording
     where the lesson has one."
   - "*Before you tap* is clean."
   - "Every title is the idea's name, never the answer."
   Then **Looks good**. From the tap, Monday's cards show Monday. A failure is named without the word go: a bad day
   is rebuilt on live by Brandon's hand (`week:build:live -- --week 3 --day N --rebuild`, about $2) and the look is
   taken again. Brandon also pastes `/parent`'s Sunday line and the week:build rows from live's `/parent/models`
   (the firings' seconds and money are the first measurement of a day with pictures through the route).
   **If the build did not happen** (no firing, or a day still missing after the 8 pm spare): `/parent` names it;
   Brandon builds what is missing by hand, `week:build:live -- --week 3 --start 2026-11-09` (the whole week, about
   $14, if nothing fired; `--day N` for a lost day), and says so, with whatever `/parent` and Vercel's log show.
   That is a finding for the close, not a failure of the look.
4. **`/wwc:close`** (close and hold: the next release carries this with the judge's records).

## Before the job (Brandon's hands, tonight, while Code writes the candidates)

In Vercel, quark, Settings, Environment Variables, Production (and Preview), as the week 2 report's stop 6 says:
1. `CRON_SECRET`: a long random string you make yourself (the one-liner in the week 2 report, stop 1, puts one on
   the clipboard). Keep it on the clipboard for the firing. If Vercel marks it *Sensitive* it is never shown again;
   then make a new one and edit the variable.
2. `QUARK_MODEL_CURATE` = `claude-opus-5-5`, `QUARK_MODEL_WRITE` = `claude-sonnet-5-5`,
   `QUARK_MODEL_GATE` = `claude-opus-5-5`. `ANTHROPIC_API_KEY` is already there (28 Oct).
3. **Redeploy**: Deployments, the top *Production* deployment, its ⋯ menu, Redeploy. A setting reaches only a
   deployment made after it. The boys' wall keeps the same code; the switch has no gap.
4. **The firing**, after the redeploy finishes, before M1 (once week 3's lessons are on live the same call builds
   week 3's day 1 and spends about $2): the command Code prints at stop 1. The pass is `"outcome":"refused"`,
   `"week":3`, a reason beginning "Not enough short lessons for week 3", and `HTTP 200`. "isn't set where the build
   runs" means a setting or the redeploy is missing; `HTTP 401` means the secret does not match; anything else is
   pasted whole. Code checks nothing in Vercel; Brandon says "the firing passed" with its reply at stop 1.

## Read first

1. `docs/week-2-slice.md` and `docs/reports/2026-11-01-week-2.md` in full: the shape this brief repeats, the stop-6
   wording for the firing, what M1 to M3 printed, and the decisions.
2. `plan/short-lessons.yaml` (the 56, the format), `plan/candidates/short-lessons-2.md` (the 12 not taken, and how
   the 40 were found), `plan/candidates/short-lessons.md`, `lib/plan.ts`, `scripts/plan-import.mts`,
   `scripts/content-fetch.mts`, `core/curation/schedule.ts` (`weekSchedule()`: how many of each slot week 3 takes,
   and what week 4 does when Egypt has three topics left).
3. `docs/04-curation-engine.md`: "How the Sunday build is built" (`nextWeek()`, the refusals, the lock, the 240-second
   rule), "How a week is mixed", "Models and costs"; `core/curation/cron.ts`, `cron-job.ts`,
   `app/api/cron/week/route.ts`, `vercel.json`.
4. `core/prompts/ideas.md` v5 and `card.md` v6; `docs/09-family-values.md`, `packs/README.md`; `gate/safety-floor.md`.
5. `docs/08-open-questions.md`, *Bugs* (the `content:fetch:live` silence; the week 1 card bugs, so no candidate
   invites a loose fact).

## Decided already (Brandon, 22 October to 7 November 2026; do not reopen)

- **What the lessons lean on**, from the school's tests (22 October), as the week 2 brief lists; both read two
  grades above age. No lesson repeats a week 1 or week 2 idea.
- **Holidays in the weeks they fall** (28 October): Veterans Day, Wednesday 11 November, is week 3's. Week 3's
  Egypt topics 15 to 21 sit on look, listen, then, puzzle, then, wonder, look, so **Wednesday's *then* is Egypt's**:
  Veterans Day lands Wednesday only as the 2nd look or the 2nd listen (a photograph; Taps, or a 1925-or-earlier
  band recording). Code says which at stop 1. The counts, from the same slots: **look 5, wonder 6, listen 6, then 5,
  puzzle 6**.
- **The idea named** (22 October): every candidate names the idea it teaches, in the title.
- **Hawaiʻi in every slot**, at least one (1 November's practice).
- **Nothing a child sees is new code**: this job writes content and settings only. No migration.
- **The unique indexes wait** (a day written twice; the *later* row of this project). Cost now: a migration tonight
  means a test run and `db:push:live` by Brandon's hand on the same evening as everything else. Cost later: a
  duplicate delivery doubles one day, which the code lock (the ten-minute start rows, the counts read again) is
  built to catch, and a doubled or short day is cleared and built again by the next firing (docs/04, "Which week
  and which day"), so the worst case is one day's firing and about $2. It is the next slice of this project, before
  week 4's Sunday if it can be.
- **The device-test rule** (22 October): no iPad in this job; the looks are on the laptop and the week page.
- **No candidate from a source the adapters cannot fetch** (1 November's practice: every item fetched through
  `core/content/sources.ts` before it is offered, all CC0 or public domain).

## The steps, in order

1. **The candidates** (Code, tonight): 40 into `plan/candidates/short-lessons-3.md`, as *Stops* 1 says, with the
   day table for week 3 (Egypt 15 to 21 on the thread, Monday 9 to Sunday 15 November) at its head, as the week 2
   file has. The 12 held over are checked against week 1 and 2's ideas and the school leanings and kept or struck
   with a line why. Then the firing's command. **Stop 1.**
2. **The 28, written**: `plan/short-lessons.yaml` gains 28 entries in the file's format (both summaries, sources
   with ids, values points), facts checked as they are written (the week 1 bug lines), in Brandon's order where he
   gave one; the candidates file keeps the 40 and the picks. The schedule test holds weeks 1, 2 and 3 and week 4
   refusing. `npm test`, `npm run typecheck`. Commit, push (no migration, so no workflow).
3. **On test**: `npm run plan:import`, `npm run content:fetch` (about $0.50); `week:build -- --week 3 --start
   2026-11-09 --plan` prints seven days with no gap. Commit. **Stop 2, Your look**, then M1, M2 and the plan on
   live by Brandon's hand.
4. **Sunday, nothing by Code.** The route builds a day a firing. **Stop 3**, Brandon and June's look and the tap, with
   what `/parent` and `/parent/models` say.
5. **Candidates for week 4**, 40 more, into `plan/candidates/short-lessons-4.md` (titles, lines, sources; no
   summaries), so next Saturday's pick is a read. And, at the same stop, **what week 4 and week 5 look like**: Egypt
   has topics 22 to 24 left, so Code says from `weekSchedule()` what week 4 takes from the thread and the library,
   and what week 5 needs (a new theme plan, or short lessons alone), as a finding for Brandon, not a row.
6. `/wwc:close`: docs/04 (the library at 84; the Sunday build on Vercel: set up on 7 November, its first firing's
   reply, what Sunday's firings measured, a day with pictures through the route now proved or not), docs/08
   *Decided:*, `CLAUDE.md` *Where we are*, the README status (Quark builds its own week, if it did), the board (the
   resumed row to *live*, its text widened to week 3; the *Week 2 builds itself* project renamed in its goal to the
   week that built itself, and its last slice the unique indexes, still *later*; a row proposed for "week 4's 28,
   picked from the candidates by Sat 14 Nov", on Brandon's yes), the report with the money.

## Not in this job

The judge's timing on live (its own row, *on test*); the unique indexes (above); the lines made ahead; card v7; any
change to the gate, the route or the cron's hours; a new theme plan after Egypt (a finding at step 5, for a brief
of its own); the `content:fetch:live` progress line (a bug line, for a sweep).

## Records to update at the end

`plan/short-lessons.yaml`, `plan/candidates/short-lessons-3.md`, `plan/candidates/short-lessons-4.md`,
`docs/04-curation-engine.md`, `docs/08-open-questions.md`, `CLAUDE.md`, `README.md`, `docs/board.md`;
`docs/reports/2026-11-01-week-2.md` gets one closing line pointing here (its stop 6 was finished by this job).
`/wwc:close`.
