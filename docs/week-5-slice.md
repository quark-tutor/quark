# Brief: week 5 on live, a day late

**Phase 3 work on `phase-4-wonder-wall`.** Drafted 23 November 2026 in the chat, 18:05. Board row: "Saturday 21 Nov:
week 6's theme and week 5's 28 short lessons" (*next*, under *Week 2 builds itself*); this job takes its week 5 half
(stop 1 says what becomes of the row). **Status: ready.**

**Size:** a job, tonight. The boys have no cards on Monday 23 November; the aim is the week on their walls tonight,
or Tuesday morning at the latest.

## Why

Saturday 21 November's pick did not happen (the repository's last commit is 17 November, and there is no
`plan/candidates/short-lessons-5.md`), so the library had no unused short lessons on Sunday 22 November and the
Sunday build will have refused week 5 (23 to 29 November, the Moon), as it is built to and as it did for week 4.
Brandon, Monday 23 November, about 17:45: "i'm afraid i'm behind, its monday and the week isnt ready for tonights
lesson". Nothing is broken; the week needs its 28 lessons, then a build by hand, as weeks 2 and 4 had.

The Moon (`plan/the-moon.yaml`) has been in live's plan, with its 11 items, since 9 November. Unlike week 4, no
candidates file is written for this week. Seventeen candidates are left over in `plan/candidates/short-lessons-4.md`.

## The week

Week 5 is Monday 23 to Sunday 29 November 2026. The Moon takes one slot a day, so the short lessons are **look 5,
wonder 6, listen 6, then 5, puzzle 6: 28** (`docs/saturday-pick-slice.md`).

| Day | Date | The Moon (thread) | look | wonder | listen | then | puzzle |
|---|---|---|---|---|---|---|---|
| 1 | Mon 23 Nov | look: the Moon's seas, and the map that named them | **Moon** | 1st | 1st | 1st | 1st |
| 2 | Tue 24 Nov | wonder: a crater, and why the Moon keeps every one | 1st | **Moon** | 2nd | 2nd | 2nd |
| 3 | Wed 25 Nov | then: a lunar landing, and Apollo 11's footprints | 2nd | 2nd | 3rd | **Moon** | 3rd |
| 4 | Thu 26 Nov, Thanksgiving | listen: the sustain pedal, and Clair de lune | 3rd | 3rd | **Moon** | 3rd | 4th |
| 5 | Fri 27 Nov | look: a figure seen from behind, Friedrich's Two Men | **Moon** | 4th | 4th | 4th | 5th |
| 6 | Sat 28 Nov | then: science fiction, and Jules Verne | 4th | 5th | 5th | **Moon** | 6th |
| 7 | Sun 29 Nov | puzzle: distance, and about thirty Earths | 5th | 6th | 6th | 5th | **Moon** |

The plan on test (step 2) is the check of this table; if it differs, the plan is right and the stop says so.

**The seventeen left over** in `plan/candidates/short-lessons-4.md`, by its numbers: look 4, 8, 10, 11; wonder 20,
21, 22; listen 29, 30, 31; then 39, 40, 41, 42; puzzle 49, 50, 51. Pāhoehoe and ʻaʻā (15) was struck on 16 November
and is not offered again. **Eleven new are needed: look 1, wonder 3, listen 3, then 1, puzzle 3.**

## Stops

1. **After reading: the pick, and three checks.** Code writes `plan/candidates/short-lessons-5.md` in the shape of
   the week 4 file (the day table at its head; each candidate with its slot, a title naming its idea, one line of
   what it teaches, its picture or recording with source and license, its values points): every one of the
   seventeen that still fits, and new candidates only to fill each slot's count, each item fetched through the
   adapters. It prints the 28 as a numbered list by slot, ★ on each with its day, title and one line each, and says:
   - what live's `/parent` shows for Sunday 22 November's firings (Brandon reads it out if Code cannot), so the
     refusal is confirmed as "not enough short lessons" and nothing else;
   - any left-over candidate that can no longer be taken (a source gone, or its idea now inside the Moon's own
     topics), with what takes its place in the same slot;
   - **whether a week built by hand from this branch is the same as one built by the code on Vercel.** *Where we
     are* (17 November) says the branch is ahead of `main` only by a release's records. If `git diff main` shows any
     difference outside `docs/`, `CLAUDE.md` and `README.md`, say so and build from `main` in a worktree, as week 4
     did; if none, M1 to M4 run from the main checkout;
   - Thanksgiving, Thursday 26 November: which lesson lands on it, if a slot allows one (look, wonder, then or
     puzzle; listen is the Moon's that day);
   - each Hawaiʻi item marked "your call", against the Hawaiʻi standard;
   - **the board row**, for Brandon's yes: at the close this row is rewritten as "Saturday 28 Nov: week 6's theme
     and 28 short lessons, and week 7's theme" and stays at the top of Next.
   Brandon replies "the stars" to take the ★ 28, or strikes by number. Anything else the records cannot settle comes
   with its recommended answer; "go" takes them all, the stars included.
2. **After step 2, on test: Your look at the library, then the live commands by Brandon's hand.** Guards: the live
   database and about $15 of API spend.
   - **Where:** `/parent/content` on the dev server, as the test guardian (Code gives the address, and names each
     new item by title, with the count, in the page's order).
   - **Do:** 1. Find the new items. 2. Read each credit line.
   - **See:** every new picture is one you would put in front of the boys; every credit reads right; nothing waits.
   - Pass □ Fail □ — if fail, what you saw.

   Then, only on go, back to back, each with what it does, what it touches and how it is undone:
   - **M1 `npm run plan:import:live`** (LIVE, `plan_topics`; must print "Short lessons: 288 rows (144 lessons)", so
     no lesson is lost; undone by deleting the 28 by key);
   - **M2 `npm run content:fetch:live`** (LIVE, under $1; prints nothing until every item is done, so wait for the
     table);
   - **M3 `npm run week:build:live -- --week 5 --start 2026-11-23 --plan`** (reads only: seven days, the Moon's
     seven topics on their slots in order, the 28 on the others, no gap, both boys `chapter_books`, and no "blocked",
     "Don't bring it up" or "Not yet" line);
   - **M4, the build, the same command without `--plan`** (LIVE, about $14, under the $25 line; left in review
     until the tap).

   Brandon pastes what each printed.
3. **Your look, the week on live, then the tap.** Guards: what the boys see (rule 5). Brandon and June on live's
   `/parent/week/<theme>` (Code gives the link):
   - **See:** seven days, five first cards for each boy on each, pictures or recordings on them; *Before you tap*
     names every card held back and why; every title is the idea's name, never the answer.
   - Pass □ Fail □ — if fail, what you saw.

   The stop names every empty tile and offers the choice week 4 had: tap as built, or rebuild the named days first
   (`--day <d> --rebuild`, about $2 each). A day is rebuilt before the tap or not at all. Then **Looks good**. From
   the tap, today's cards show today.
4. **`/wwc:close`** (close and hold; no code changes in this job, so nothing to release).

## Decided already (do not reopen)

- **The whole week in one build, as week 4** (Brandon, 23 Nov 2026, 18:00, in the chat: "Whole week, as week 4"),
  not day 1 first. Monday's cards may be seen late tonight, or not at all; that is accepted.
- **The pick is the left-overs plus eleven new**, not a fresh forty (Brandon, 23 Nov 2026, 18:00: "Leftovers plus
  11 new"). Code marks its 28; Brandon and June take the stars or strike by number.
- **Week 6's theme is not in this job** (Brandon, 23 Nov 2026, 18:00: "Leave to Saturday 28"). Saturday 28
  November's pick carries week 6's theme, week 6's 28 and week 7's theme; the theme loses its week of lead once.
- **No code changes.** This job writes content and runs the build. The Sunday build stays as it is: it refused, and
  spent nothing.
- **Every live command is Brandon's hand** at a planned stop.
- Everything `docs/saturday-pick-slice.md` lists under *Decided already* holds here: the idea named in every title,
  open sources only, the Hawaiʻi standard, what the lessons lean on, holidays in the weeks they fall, every library
  import from the newest library.

## The steps, in order

1. Read; write the candidates file; the list and the checks; **stop 1**.
2. On the pick: `plan/short-lessons.yaml` gains the 28 in the file's format (both summaries, sources with ids, values
   points), in the pick's order, each fact checked as it is written, as weeks 2 to 4 did; the candidates file marks
   the picks. The schedule test holds week 5 as picked, day by day. `npm test`, `npm run typecheck`. On test:
   `npm run plan:import`, `npm run content:fetch`, `week:build -- --week 5 --start 2026-11-23 --plan` pasted whole
   into the report. Commit, push (no migration, so no workflow). **Stop 2.**
3. **M1 to M4** by Brandon's hand; **stop 3**, the look and the tap.
4. **`/wwc:close`**: docs/04 (the library's count; live week 5 built by hand, its numbers), docs/08 (*Decided:* the
   lines above, and that a second missed Saturday cost a second day), `CLAUDE.md` *Where we are*, the README status
   if it no longer agrees, the board (the row as stop 1 settled it), the report with the money.

## Read first

1. `docs/week-4-slice.md` and `docs/reports/2026-11-16-week-4.md`: the same job a week ago, and what it found
   (*Beyond the brief*: a rebuild after a tap empties the wall; a live script in a worktree needs the live env file
   at the worktree's root).
2. `plan/candidates/short-lessons-4.md`, whole, and `plan/candidates/short-lessons-3.md` for the held-over lines;
   `plan/short-lessons.yaml` (every lesson used, the format, the last 32); `plan/the-moon.yaml`.
3. `docs/saturday-pick-slice.md`: *Decided already*, and how M1 to M3 are read.
4. `core/curation/schedule.ts`, `scripts/week-build.mts`, docs/04, "How a week is mixed" and "How the Sunday build
   is built".
5. `docs/08-open-questions.md`, *Bugs*, so no candidate invites a loose fact.

## Not in this job

Week 6's theme and 28, and week 7's theme (Saturday 28 November, `docs/saturday-pick-slice.md`); any code change;
any change to the Sunday build, such as a reminder when the library is short (named in week 4's report under *Not
done*; Brandon's to take or drop); fixing cards already on live.

## Records to update at the end

`plan/short-lessons.yaml`, `plan/candidates/short-lessons-5.md`, `core/curation/schedule.test.ts`,
`docs/04-curation-engine.md`, `docs/08-open-questions.md`, `CLAUDE.md`, `README.md` if needed, `docs/board.md`, the
report (`docs/reports/2026-11-23-week-5.md`). `/wwc:close`.
