# Brief: week 4 on live, a day late

**Phase 3 work on `phase-4-wonder-wall`.** Drafted 16 November 2026 in the chat, 12:15. Board row: "Week 4's 32
short lessons, picked from the candidates by Sat 14 Nov" (*next*, top, under *Week 2 builds itself*). **Status:
ready.**

**Size:** a job, today. The boys have no cards on Monday 16 November; the aim is the week on their walls by this
evening, or Tuesday morning at the latest.

## Why

Saturday 14 November's pick did not happen, so the library had no unused short lessons on Sunday 15 November and
the Sunday build refused week 4 (16 to 22 November), as it is built to. Brandon, Monday 16 November, 12:08: "i
just checked and i have no week 4 waiting." Nothing is broken; the week needs its 32 lessons, then a build by hand,
as week 2 had on Monday 2 November.

The 51 candidates are already written (`plan/candidates/short-lessons-4.md`, 7 November), with ★ on the 32 Code
would take and the day each lands on.

## Stops

1. **After reading: the pick, and three checks.** Code prints the ★ 32 as a numbered list by slot (title and one
   line each), and says:
   - what live's `/parent` shows for Sunday 15 November's firings (Brandon reads it out if Code cannot), so the
     refusal is confirmed as "Not enough short lessons" and nothing else;
   - any ★ that can no longer be taken (a source gone), with its replacement from the same slot;
   - **whether a week built by hand from this branch is the same as one built by the code on Vercel.** The branch
     holds the Math tile's code, built and held, with math off (`docs/reports/2026-11-09-math-tile.md`, *What a
     release would change*: the gate's prompt is v4 here and v2 on `main`). If there is any difference in what a
     card that is not math is sent or how it is stored, say so and build from `main` in a worktree instead.
   Brandon replies "the stars" to take the ★ 32, or gives numbers. Anything else the records cannot settle, with
   its recommended answer; "go" takes them all, the stars included.
2. **After step 2, on test: Your look at the library, then the live commands by Brandon's hand.**
   - **Where:** `/parent/content` on the dev server, as the test guardian (Code gives the address).
   - **Do:** 1. Scroll the new items (Code names the count). 2. Read each credit line.
   - **See:** every picture is one you would put in front of the boys; every credit reads right; nothing waits.
   - Pass □ Fail □ — if fail, what you saw.
   Then, only on go, back to back, each with its four lines: **M1 `npm run plan:import:live`** (LIVE, the 32
   lessons; undone by deleting them by key), **M2 `npm run content:fetch:live`** (LIVE, under $1), **M3
   `npm run week:build:live -- --week 4 --start 2026-11-16 --plan`** (reads only: seven days, Egypt topics 22 to 24
   on days 1 to 3, no gap), then **M4, the build, the same command without `--plan`** (LIVE, about $14, under the
   $25 line; left in review until the tap).
3. **Your look, the week on live, then the tap.** Brandon and June on live's `/parent/week/<theme>`:
   - **See:** seven days, five first cards for each boy on each, pictures on them; *Before you tap* names every card
     held back and why.
   - Pass □ Fail □ — if fail, what you saw.
   Then **Looks good**. From the tap, today's cards show today.
4. **`/wwc:close`** (close and hold; no code changes in this job, so nothing to release).

## Decided already (do not reopen)

- **The order stays as the candidates file marks it**, so the lessons tied to a date still land on it (time zones on
  Wednesday 18 November, the phonograph on Saturday 21 November). Monday's (ʻIolani Palace's electric light, on King
  Kalākaua's birthday) is built for Monday and may be seen a day late or not at all; that is accepted.
- **No code changes.** This job writes content and runs the build. Math stays off; the tiles rotate as released.
- **The Sunday build stays as it is.** It did what it should: it refused, and spent nothing.
- **Every live command is Brandon's hand** at a planned stop.

## The steps, in order

1. Read; the list and the three checks; **stop 1**.
2. On the pick: `plan/short-lessons.yaml` gains the 32 in the file's format (both summaries, sources with ids, values
   points), each fact checked as it is written, as weeks 2 and 3 did; the candidates file keeps the 51 and the picks.
   `npm test`, `npm run typecheck`. On test: `npm run plan:import`, `npm run content:fetch`,
   `week:build -- --week 4 --start 2026-11-16 --plan` prints seven days with no gap. Commit, push. **Stop 2.**
3. **M1 to M4** by Brandon's hand; **stop 3**, the look and the tap.
4. **`/wwc:close`**: docs/04 (the library's count), docs/08 (*Decided:* a missed Saturday means a refused Sunday and
   a hand build on Monday; what it cost: one day), `CLAUDE.md` *Where we are*, the board (this row to *live*; the
   Saturday 21 November row stays next), the report with the money.

## Read first

1. `plan/candidates/short-lessons-4.md`, whole; `plan/short-lessons.yaml` (the format, the last 28).
2. `docs/week-3-slice.md` and `docs/reports/2026-11-07-week-3.md` (how the last pick was written, checked and built);
   `docs/reports/2026-11-01-week-2.md` (the hand build of Monday 2 November).
3. `docs/reports/2026-11-09-math-tile.md`, *What a release of this branch would and would not change*.
4. `core/curation/schedule.ts`, `scripts/week-build.mts`, `docs/04-curation-engine.md`, "How a week is mixed".

## Not in this job

Saturday 21 November's pick (week 5's 28 lessons and week 6's theme: `docs/saturday-pick-slice.md`, its own job this
Saturday); anything about math; any change to the Sunday build, such as a reminder when the library is short
(proposed at the close as an inbox row, on Brandon's yes).

## Records to update at the end

`plan/short-lessons.yaml`, `plan/candidates/short-lessons-4.md`, `docs/04-curation-engine.md`,
`docs/08-open-questions.md`, `CLAUDE.md`, `docs/board.md`. `/wwc:close`.
