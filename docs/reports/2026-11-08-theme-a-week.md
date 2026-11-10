# Report: a theme a week, picked on Saturday

The brief is `docs/theme-a-week-slice.md`. The job started at 07:41 HST on Sunday 8 November 2026.

- **Where it ran.** A `claude --worktree` session, on branch `worktree-theme-a-week`, because the week 3 job was
  still open in the main checkout.
- **9 November.** The branch was rebased onto `phase-4-wonder-wall` and pushed there. The job closed at 14:41 HST,
  when Brandon typed `/wwc:release` at the last stop, so the release follows this close.
- **Size:** a slice, 8 hours. It took about an hour and 10 minutes:
  - 07:41 to 08:17, to stop 1;
  - 08:47 to 09:00, to stop 2;
  - 10:48 to 10:53, step 4;
  - 12:43 to 12:47, the rebase and push;
  - 14:34 to 14:41, the fix, the records and stop 3.

## What could not be checked

- **The code on Vercel.** It reaches production only with this release's push, and no Sunday firing has run it yet.
  - **Sunday 15 Nov** builds week 4 (Egypt's last three days) on the new code. The schedule test holds weeks 1 to 4
    exactly as before.
  - **Sunday 22 Nov** builds the first theme week.
- **Week 5's seven days on live, with its real 28 short lessons.** That read is the Saturday 21 Nov job's.
  - Live has no unused lessons today, so M3 could only show the refusal.
  - The refusal carried the Moon's slot counts: look 5, wonder 6, listen 6, then 5, puzzle 6. That proves live reads
    week 5 as the Moon's.
- **The Moon's cards.** None is written yet. Sunday 22 Nov's firings write them, and the week page is read before
  the tap.
- **The Met's description of *Two Men Contemplating the Moon*.** The page answered 429. The summary is written from
  the painting as it looks and the Met's data (about 1825 to 1830, 2000.51).
- **No iPad.** Nothing in this job reaches the wall, by the brief's design.

## The look

**Stop 2, *Your look* on the laptop (8 Nov).** All three checks passed at the first look:

1. Week 5's plan on test: seven days, the Moon's seven topics in order on their slots, a short lesson in the other
   four slots, the theme in the title, and no held-back line on a Moon topic.
2. The 11 new items at `/parent/content` on the dev server, with their credits.
3. The two Hawaiʻi lines in `plan/the-moon.yaml`.

Brandon, 10:48: "go. All three pass. The Moon's fine, the 11 pictures are fine, and the Hawaiʻi lines stay: they
talk about local rocks the boys have real experience with, a real tie-in; they're not trying to teach Hawaiian
culture to a child who is already learning from a Kumu."

Stop 3 had no look. Brandon typed `/wwc:release` at 14:41 on 9 Nov.

## What was done

1. **Four themes for week 5** (stop 1), in `plan/candidates/themes.md`, which stays as the bank for later Saturdays.
   - **The four:** Ancient Greece, the Moon, the deep sea and Antarctica, seven topics each.
   - **The sources:** 47 pictures and recordings named, each fetched through Quark's adapters, all CC0 or public
     domain.
   - **The slots:** the same pattern in all four.
   - **Hawaiʻi:** two items marked "your call".
   - **The pick:** Brandon picked the Moon (8 Nov, 08:47).
2. **The code** (`3ac84c4`; docs/04, "The long-term plan").
   - **Every stretch is loaded,** and the week's own stretch is found from `sequence`: a stretch holds its topics ÷ 7
     weeks, rounded up (`stretchForWeek()`).
   - **A stretch after the first** must be one chapter of seven topics (`validatePlan()`).
   - **A gap or a clash** in `sequence` is refused by `plan:import` and by `prepareWeek()` (`sequenceProblems()`).
   - **A week no stretch holds** is refused before anything is spent, naming the file to write.
   - **"The thread has ended"** is said only after a stretch's last topic, inside its own last week.
   - **`week:build --stretch` is gone.**
   - **The Sunday build** takes "No theme for week N" as a refusal, and `/parent`'s line says it plainly.
   - **Tests:** 10 new tests.
3. **Week 5's theme, the Moon** (`3e845e4`): `plan/the-moon.yaml`, sequence 2, with 11 sources. No values point is
   marked, and no age of the Moon or its craters is given. The seven topics:
   - the Moon's seas and Riccioli's map (look);
   - a crater (wonder);
   - Apollo 11's footprints (then);
   - Debussy's Clair de lune (listen);
   - Friedrich's *Two Men Contemplating the Moon* (look);
   - Verne's *From the Earth to the Moon* (then);
   - about thirty Earths between the Earth and the Moon (puzzle).

   On test: `plan:import`, then `content:fetch` (11 items, all approved, $0.15), then week 5's plan, seven days from
   day 1.
4. **The Saturday brief** (`631af26`): `docs/saturday-pick-slice.md`, a standing brief for every Saturday from
   21 Nov. The theme leads by a week, and the Hawaiʻi standard is in its *Decided already*.
5. **The rebase and push** (9 Nov, 12:43 to 12:47).
   - **The rebase** onto `92030b7`, the last release's records, had two conflicts, both in docs: the board and
     docs/08. Both sides were kept.
   - **Tests:** 441 pass, and the typecheck is clean.
   - **The test import from the rebased tree:** Egypt 56 rows, short lessons 168 rows (84 lessons), the Moon 16 rows.
   - **The push:** `phase-4-wonder-wall`, `92030b7..fc9dc22`, a fast-forward. The old remote branch
     `worktree-theme-a-week` is deleted.
6. **On live, by Brandon's hand** (9 Nov, before 14:34), from the main checkout after it pulled `04a448b`:
   - **M1,** `plan:import:live`: `Target: LIVE`. Ancient Egypt 56 rows (4 weeks), short lessons 168 rows (84
     lessons), the Moon 16 rows (1 week), 3 files imported.
   - **M2,** `content:fetch:live`: 11 of 207 items fetched, the Moon's, each approved with no flags; the checks cost
     $0.15. Live's library is now 206 approved, 0 pending, 0 to check by hand and 1 rejected. The rejected one is
     Egypt's old Musopen Handel, rejected earlier at `/parent/content`.
   - **M3,** the plan on live, which spent and wrote nothing. It printed the expected line exactly: "Not enough
     short lessons for week 5: the look card needs 5 and 0 are left; the wonder card needs 6 …; the listen card
     needs 6 …; the then card needs 5 …; the puzzle card needs 6 and 0 are left."
7. **A refusal before spending reads as one** (`db9f25a`).
   - **The fault:** M3's line came out as a crash, with a Node stack trace.
   - **The fix:** `week:build` now prints "Stopped: …" and "Nothing was spent.", and exits 1. A wiring test holds
     it.
   - **Proven on test** with week 6, which has no sequence 3: "Stopped: No theme for week 6: the plan's stretches
     reach week 5. Write plan/<theme>.yaml with sequence: 3 (one week: seven topics), then run npm run plan:import.
     Nothing was spent."
   - **Tests:** 442 pass, and the typecheck is clean.
8. **The records** (`8cf564d` and this close):
   - **docs/04:** a theme a week, how a week's stretch is found, the Hawaiʻi standard, the narrower thread-ended
     line, and the new refusals.
   - **docs/08:** "When the thread runs out" is closed, and *A theme a week* has every decision.
   - **The board:** the Saturday 21 Nov row.
   - **`CLAUDE.md`** *Where we are*, and **the README** status.

## Beyond the brief

- **The import's wording:** `plan:import` printed "(1 weeks)" for a one-week stretch. It now says "1 week"
  (`fc9dc22`).
- **The plain refusal** (above, item 7). It is the same mechanism as the brief's refusal, so it was built here.
- **The Sunday build's refusal** (added at stop 2). "No theme for week N" would have ended a firing as *failed*. It is
  now a refusal, and `/parent`'s line says it in plain words.
- **The math inbox row** "Math tutored in a recognizable way" came back onto the board with the rebase. Brandon kept
  it (9 Nov, 14:34: "keep it, the math proposal is being reworked in the chat"). `CLAUDE.md` no longer says it is
  deleted at this merge.
- **Brandon's finding at stop 2:** `/parent/content` is a hunt; 11 new items among 208 approved. He filed it with
  `/wwc:idea` as an inbox row (`9515f87`). Until it is built, each Saturday's stop 2 names the new items by title.
- **The project's next slice.** *Week 2 builds itself* already has two slices at *next*: week 4's 32 and Saturday
  21 Nov. So its first *later* slice, "A day cannot be written twice", stays at *later* when this row goes live.
  Moving it above the first *next* row would put it ahead of week 4's Saturday deadline. Brandon can move it by
  hand.

## On live

- **`plan_topics`:** the Moon's 16 rows (M1). Egypt's and the library's rows were written again unchanged.
- **`content_items`, and the private bucket:** the Moon's 11 items (M2).
- **The code:** nothing yet. It reaches Vercel with this release. Until then, Vercel's code picks its stretch by the
  lowest sequence, so it ignores the Moon.
- **Nothing a child sees has changed.**

## Money

**$0.30 in all:**
- $0.15 on test (`content:fetch`, 8 Nov);
- $0.15 on live (`content:fetch:live`, 9 Nov).

Both are content flags, on the gate's model. No week was built and no card was written. The four themes' 47 candidates were
fetched without a model call. Google: nothing.

## Not done

Nothing in the brief is left. The release, the brief's step 5, follows this close. The seven-day read of week 5 with
its real 28 belongs to the Saturday 21 Nov row, which is on the board at *next*.

## What you now do differently

- **Each Saturday from 21 Nov,** type `/wwc:job docs/saturday-pick-slice.md`. At stop 1, reply with the week's theme
  (one of Code's, or "four more") and its 28 short lessons. At stop 2, run M1, M2 and M3 by your hand, as on 9 Nov.
- **The theme leads by a week.** Saturday 21 Nov picks week 6's theme and week 5's 28.
- **A Hawaiʻi offer is yours and June's to judge** at the pick, against the standard in docs/04. You may hand Code a
  line of what you or the boys know.
- **`week:build` without a theme or enough lessons** now says "Stopped: …" and "Nothing was spent.", not a stack
  trace.
- **`week:build --stretch` is gone.** A week's theme comes from the files under `plan/`.

## Decisions

All are in docs/08, *A theme a week*:
- the brief's decisions (8 Nov);
- go at stop 1 (the Moon, the row, the code's shape);
- the stop 2 look, and way (a);
- the Moon on live (9 Nov);
- the math row kept;
- the Saturday row and the plain refusal, taken with go;
- the close by `/wwc:release` (14:41).

## Commits

On `phase-4-wonder-wall`, after `92030b7`:

- `e782d1a` Board: a theme a week to building; the brief, four themes and stop 1's report
- `3ac84c4` A theme a week: every stretch is loaded and the week's own is found from the sequence
- `3e845e4` Week 5's theme, the Moon
- `2f1ee2b` Report: stop 2
- `8503bfb` Idea: math tutored in a recognizable way (Brandon's `/wwc:idea`)
- `631af26` Stop 2 passed; the Saturday brief
- `9515f87` Idea: /parent/content is a hunt (Brandon's `/wwc:idea`)
- `fc9dc22` plan:import says "1 week"
- `04a448b` Report: rebased and pushed; M1 to M3 for Brandon's hand
- `ba5b0ec` Report: line 0, M1, M2 and M3 passed
- `db9f25a` week:build prints a refusal from prepareWeek() as a stop
- `8cf564d` Records for a theme a week
- `cbfb5a2` Report: go at 14:34; stop 3, the release
- and this close's commit.

cost: not read
