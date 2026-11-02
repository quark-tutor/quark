# Brief: week 2 on live, and the Sunday build switched on

**Phase 3, on `phase-4-wonder-wall`.** Drafted 1 November 2026 in the chat, 20:50, the night week 1 ended with no
week 2 behind it. Board row: "28 more short lessons for week 2" (*next*; this brief widens it to the whole of week 2
and the Sunday build). Project: *Week 2 builds itself*. **Status: ready.**

**Size:** a slice, over two evenings: the candidates tonight, the picks and the build Monday (the boys have week 2
from Tuesday 3 November, day 2; Monday's cards are the one day lost).

## Why

Week 1 (26 October to 1 November) is over and the wall is empty from Monday 2 November. The library holds exactly
the 28 short lessons week 1 used, and a week takes lessons no earlier week used (`weekSchedule()`), so week 2
needs 28 new ones before it can be built. The Sunday build on Vercel never ran either: its settings
(`CRON_SECRET`, the model names) were never set. This job does both, so week 3 builds itself next Sunday.

## Stops

1. **After reading: the candidates, for Brandon and June to pick from.** Code has written **40 candidates** (step 1)
   into `plan/candidates/short-lessons-2.md`: for each, its slot, a title, one line of what it teaches, the idea it
   names (card v6), the picture or recording it would use with its source and license, and the values points it
   touches. Spread: 8 look, 8 wonder, 8 listen, 8 then, 8 puzzle. The stop prints the 40 as a numbered list. Brandon
   and June reply with the 28 they take (numbers), or "take the first 28 of each slot". Anything the records and this
   brief cannot settle, with its recommended answer; "go" takes them all.
2. **After step 3, on test: Your look at the library, on the laptop.** The 28 are written, imported on test, their
   items fetched on test (`content:fetch`, about $2); `/parent/content` on test shows them. Brandon, on
   `http://localhost:3000/parent/content` as the test guardian:
   - "Every new picture is one I'd put in front of the boys, and its credit line reads right."
   - "Anything waiting is approved or rejected."
   "go" means both passed; a picture to drop is named without the word, and that is a fix round (another candidate
   takes its place).
3. **M1, Brandon's hand: `npm run plan:import:live`.** LIVE: the 28 lessons into the live library (28 rows in
   `plan_topics`, kind `short`); undone by deleting them by key. Checked on test at step 3.
4. **M2, Brandon's hand: `npm run content:fetch:live`.** LIVE, about $2: the new items into the live store;
   anything not approved automatically appears at live's `/parent/content`, which Brandon reviews before M3.
5. **M3, Brandon's hand: `npm run week:build:live -- --week 2 --start 2026-11-02 --plan`**, then the build without
   `--plan`. LIVE, about $14, under the $25 line. The plan is read first: seven days, Egypt topics 8 to 14 on the
   thread, the 28 new lessons on the other slots, both boys `chapter_books`. Then the build, the gate, the week in
   review. Brandon pastes what each printed.
6. **Your look, the week on live:** Brandon and June on `/parent/week/<theme>` on live: seven days, five first cards
   each with pictures, *Before you tap* clean, titles as idea names. Then **Looks good**. From the tap, Tuesday's cards
   show Tuesday.
7. **`/wwc:close`** (close and hold: the release is the judge's, already out, or carries this with the next).

## Before the job (Brandon's hands; before step 5, not before launch)

In Vercel, quark, Settings, Environment Variables, Production (and Preview), so that **the Sunday build runs on 8
November for week 3**:
1. `CRON_SECRET`: any long random string (Code prints one at stop 1 for Brandon to paste; it is a secret).
2. `ANTHROPIC_API_KEY`: set on 28 October.
3. The three model names the build reads from the environment (`docs/04`, "Models and costs"; Code names the three
   variables and their values at stop 1).
Code checks nothing in Vercel; Brandon says "the Vercel settings are in" before step 5.

## Read first

1. `plan/short-lessons.yaml` (the format, the 28, its `sources`), `plan/candidates/short-lessons.md` (how the first
   28 were argued, and the six spare ideas at its end), `lib/plan.ts`, `scripts/plan-import.mts`,
   `scripts/content-fetch.mts`, `core/curation/schedule.ts` (`weekSchedule()`).
2. `docs/04-curation-engine.md`: "How a week is mixed", "How the Sunday build is built", "Models and costs";
   `vercel.json` (the cron); `app/api/cron/week/route.ts`.
3. `core/prompts/ideas.md` v5 and `card.md` v6 (the idea named: each candidate names its idea).
4. `docs/09-family-values.md`, `packs/README.md` (the 24 points, so each candidate says which it touches);
   `gate/safety-floor.md`.
5. `docs/reports/2026-10-23-first-live-week.md`, *What the reader notes say* (what went wrong in week 1's cards:
   the lens question pasted on, the loose facts) and *M4 is in*.

## Decided already (Brandon, 22 October to 1 November 2026; do not reopen)

- **What the lessons lean on**, from the school's tests (22 October): for the older (grade 3), measurement and data
  (time, money, length, bar graphs), shapes and fractions of shapes, multiplication into division, word parts
  (prefixes, suffixes, roots), fables, myths, biographies; for the younger (grade 2), informational text with a
  "what did it say?" question, describing a picture in full sentences, bar graphs. Both read two grades above age.
- **Holidays in the weeks they fall** (the older boy, 28 October): week 2 holds Tuesday 3 November, election day,
  so "how a vote counts" (point 14, marked parent-led where the pack says) is a candidate; Veterans Day (11
  November) is week 3's.
- **The idea named** (22 October): every candidate names the idea it teaches, in the title.
- **Nothing a child sees is new code**: this job writes content and settings only. The judge's code is the judge
  job's release.
- **The device-test rule** (22 October): no iPad in this job; the looks are on the laptop and the week page.

## The steps, in order

1. **The candidates** (Code, tonight): 40, as stop 1 says, each with a real source found by search (CC0, public
   domain, or CC BY with the credit; the museums and archives week 1 used first: the Met, the Art Institute,
   Wikimedia Commons, the Library of Congress, Musopen, the Marine Band), the summaries not yet written. Lean as
   *Decided already* says; no lesson repeats a week 1 idea; at least one per slot touches Hawaiʻi; two or three
   are "worth a thought" items from the first file (a vote, why ice floats, time zones, a seed, a fraction of a
   pizza, a bridge). **Stop 1.**
2. **The 28, written**: `plan/short-lessons.yaml` gains 28 entries in the file's format (both summaries, sources
   with ids, values points), in Brandon's order where he gave one; `plan/candidates/short-lessons-2.md` keeps the
   40 and the picks. `npm test`, `npm run typecheck`.
3. **On test**: `npm run plan:import`, `npm run content:fetch` (about $2); `week:build -- --week 2 --start
   2026-11-02 --plan` on test prints a seven-day plan with no gap. Commit, push. **Stop 2, Your look.**
4. **M1, M2** by Brandon's hand; the pending items reviewed on live. Brandon: "the Vercel settings are in".
5. **M3**, the plan then the build; **stop 6**, the look and the tap.
6. **The Sunday build proven as far as it can be without a Sunday**: `GET /api/cron/week` with the secret, by
   Brandon's hand against live (it refuses, "already built" or "not Sunday", and writes its audit row), so the
   first real firing on 8 November is not the first time the route runs on Vercel. Code says the exact command at
   stop 6.
7. **Candidates for week 3**, 40 more, written at the close into `plan/candidates/short-lessons-3.md` (titles,
   lines, sources; no summaries), so next week's pick is a read, not a wait; Veterans Day among them.
8. `/wwc:close`: docs/04 (the library at 56; the Sunday build's settings set, with what the first firing will do),
   docs/08 *Decided:*, `CLAUDE.md` *Where we are*, the README status, the board (this row to *live*; the *Week 2
   builds itself* project: the unique-index row is its last slice, still *later*; a row proposed for "week 3's 28,
   picked from the candidates by Sat 7 Nov", on Brandon's yes), the report with the money.

## Not in this job

The judge (its own job, released first); the unique indexes (a day written twice: the next slice of this project,
before the first unattended Sunday build if it can be); the lines made ahead; card v7; any change to the gate.

## Records to update at the end

`plan/short-lessons.yaml`, `plan/candidates/short-lessons-2.md`, `plan/candidates/short-lessons-3.md`,
`docs/04-curation-engine.md`, `docs/08-open-questions.md`, `CLAUDE.md`, `README.md`, `docs/board.md`. `/wwc:close`.
