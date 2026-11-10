# Brief: the Saturday pick, a theme and 28 short lessons

**Phase 3, on the phase branch (`phase-4-wonder-wall` today), every Saturday from 21 November 2026.** A standing
brief: each Saturday's job is `/wwc:job docs/saturday-pick-slice.md`, and its report is
`docs/reports/<YYYY-MM-DD>-saturday-pick.md`, dated that Saturday. Written 8 November 2026 by Claude Code, step 4 of
`docs/theme-a-week-slice.md`. Board row: "Saturday <date>: week <N+1>'s theme and week <N>'s 28 short lessons", at
the top of Next, put there at the previous Saturday's stop 1; the first is "Saturday 21 Nov: week 6's theme and week
5's 28 short lessons", proposed at the theme-a-week release. Project: *Week 2 builds itself*. **Status: standing,
ready from 21 Nov.**

**Size:** a slice, launched Friday evening or early Saturday: stop 1 by Saturday morning, the parents' reply over
breakfast, and M1 to M3 on live by 10 pm Saturday, ahead of Sunday's 6 am firing.

## Why

Each Sunday, the build makes next week on live by itself: eight firings, a day each, from the theme and the short
lessons already on live (docs/04, "How the Sunday build is built"). Two things in that week are the parents' to
choose, by design (Brandon, 8 Nov 2026: "simple, one week at a time, themes suggested on Saturday and chosen. Cards
built on Sunday for approval."):

- **the theme:** seven topics, one a day, each on the slot it is written for;
- **the 28 short lessons** on the other four slots of each day.

A week takes only lessons no earlier week used (`weekSchedule()`), and a week no theme holds is refused ("No theme
for week N"), so both have to be on live before the Sunday they are built.

**The theme leads by a week** (8 Nov 2026, stop 1 of the theme-a-week job). This Saturday picks **next week's 28**,
built tomorrow, and **the theme for the week after**, built in eight days. Next week's theme was picked last
Saturday and is already on live. The week's lead leaves time to write a theme well, a Hawaiʻi one with June, and to
fetch its pictures.

| Saturday | Next week's 28 (built Sunday) | Days in that week | The theme picked (built the Sunday after) |
|---|---|---|---|
| 21 Nov | week 5, Mon 23 to Sun 29 Nov (the Moon) | Thanksgiving, Thu 26 Nov | week 6, Mon 30 Nov to Sun 6 Dec |
| 28 Nov | week 6 | | week 7, Mon 7 to Sun 13 Dec |
| 5 Dec | week 7 | Pearl Harbor Day, Mon 7 Dec (85 years) | week 8, Mon 14 to Sun 20 Dec |
| 12 Dec | week 8 | | week 9, Mon 21 to Sun 27 Dec |
| 19 Dec | week 9 | Christmas, Fri 25 Dec | week 10, Mon 28 Dec to Sun 3 Jan |
| 26 Dec | week 10 | New Year's Day, Fri 1 Jan | week 11, Mon 4 to Sun 10 Jan |

A day that could carry a theme is named a Saturday early, when the theme for its week is picked: Pearl Harbor Day
on 28 Nov, for week 7.

Below, **N** is next week's number: the week whose 28 this Saturday picks. Week N starts on the Monday two days
later, and week 5 started on 23 November.

## Stops

1. **After reading: the themes for week N+1, the 40 candidates for week N, and next Saturday's row.**
   - **The themes.** Code writes four themes for week N+1 into `plan/candidates/themes.md`, a short page each, as
     the 8 Nov pages are:
     - why this one;
     - the seven topics, one a day, each with its slot and the idea named in its title, one line each;
     - the pictures and recordings found in open sources, each fetched through the adapters;
     - which of the 24 values points it touches;
     - what is close to earlier weeks.

     The four are the bank's still fitting plus at least one new one each Saturday, so the offer never only
     repeats. The page lists the rest of the bank by name. A Hawaiʻi theme is offered only if it clears the Hawaiʻi
     standard (below). The same theme as this week may be offered again, as seven new topics.
   - **The 40 candidates.** Code writes 40 short-lesson candidates for week N into
     `plan/candidates/short-lessons-<N>.md`:
     - the ones last week did not take, each checked to still fit, and new ones to make 40;
     - each as the week 3 and 4 files have them: slot, a title naming its idea, one line of what it teaches, picture
       or recording with source and license, values points;
     - the 28 Code recommends marked ★;
     - the day table at the head, with week N's theme on its slots (from its file) and the day each candidate
       lands on;
     - the counts, from the theme's slots: 7 a slot, less the theme's days on that slot. The Moon's week takes
       **look 5, wonder 6, listen 6, then 5, puzzle 6**.
   - **The stop prints:**
     - the four themes, one line each;
     - the 40 as a numbered list, with the 28 marked ★ and their days;
     - any holiday or Hawaiʻi day in week N, and where it lands; and any in week N+1 a theme could carry;
     - each Hawaiʻi item marked "your call".
   - **Brandon and June reply with:**
     - week N+1's theme, or "four more";
     - the 28 (numbers, or "the 28 as marked");
     - any line they or the boys know, for a Hawaiʻi item;
     - yes to next Saturday's row;
     - for the report, `/parent`'s line on last Sunday's build.

     Anything the records and this brief cannot settle comes with its recommended answer; "go" takes them all.
2. **After step 3, on test: your look on the laptop, then M1, M2 and the plan on live, by Brandon's hand.**
   - **Where:** `http://localhost:3000/parent/content` on the dev server, as the test guardian.
     - **Do:** find the new items (the stop names each by title and gives the count) and read each credit line.
     - **See:** every new picture is one you would put in front of the boys; every credit reads right; nothing
       waits.
     - Pass □ Fail □ (if it fails, say what you saw)
   - **Where:** the stop's report, with `npm run week:build -- --week <N+1> --start <its Monday> --plan` on test
     pasted whole.
     - **Do:** read day 1 to day 7, then "What the family's settings decide".
     - **See:**
       - seven days;
       - each day's thread slot names one of the new theme's seven topics, in order from day 1;
       - the week's title names the theme;
       - no "blocked", "Don't bring it up" or "Not yet" line on a theme topic (test's block on subject 14 aside).

       The short lessons in it are test's leftovers, since test builds no weekly weeks. The 28 in place are read
       at M3.
     - Pass □ Fail □ (if it fails, say what you saw)
   - **Where:** the theme file and the 28 in `plan/short-lessons.yaml`: each Hawaiʻi line, which the stop quotes.
     - **See:** each one gives a child who lives here something to learn, or ties the topic to what the boys know
       firsthand. Otherwise name the one to strike.
     - Pass □ Fail □

   "go" means all three passed. A picture or line to drop, named without the word, is a fix round: another
   candidate takes its place on test, and the look is taken again. Then, only on go, back to back:
   - **M1: `npm run plan:import:live`.**
     - **What it does:** writes the 28 into the live library (56 rows, kind `short`) and week N+1's theme (16
       rows). It writes every earlier file again, unchanged.
     - **What it touches:** LIVE, `plan_topics`. The import must print the library at last week's count plus 28,
       so no lesson is lost.
     - **How it is undone:** delete the new rows by key.
     - **Checked on test:** at step 3.
   - **M2: `npm run content:fetch:live`.**
     - **What it does:** fetches the new items into the live store, under $1.
     - **What it touches:** LIVE, `content_items` and the private bucket. It prints nothing until every item is done
       (the 1 Nov bug line), so wait for the table. Anything not approved automatically waits at live's
       `/parent/content`, which Brandon reviews before bed.
   - **M3, the plan on live, spending nothing: `npm run week:build:live -- --week <N> --start <its Monday> --plan`.**
     - **See:**
       - seven days with no gap;
       - week N's theme on its slots in order, and the 28 on the others;
       - both boys `chapter_books`;
       - the settings block.
     - **How to read the settings block:** a line ending "is parent-led." is fine. A line saying "is blocked by a
       guardian", "is set to Don't bring it up" or "is Not yet for this child" means an empty tile that day. A
       short lesson with such a line is swapped for the next in its slot tonight. A theme topic with one is
       rewritten tonight, a few cents on live, before the firing can take it.

   Brandon pastes what M1, M2 and the plan printed. **Nothing else runs tonight.**
3. **`/wwc:close`** (close and hold). The plan reaches the boys through the live database, not the deployment, so
   no release is needed. The next release carries the records.

## Sunday (no session)

The Sunday build runs on its own: eight firings, 6 am to 8 pm HST, a day each, about $13 on live. `/parent` on live
says what the firings did. When all seven days are in, Brandon and June read the week on `/parent/week/<theme>`:

- seven days, five first cards a day for each boy, each with its picture or recording where the lesson has one;
- *Before you tap* is clean;
- every title is the idea's name, never the answer.

Then they tap **Looks good**, which is the look and the check of rule 5. A bad day is rebuilt on live by Brandon's
hand (`week:build:live -- --week <N> --day <d> --rebuild`, about $2). **If the build did not happen,** `/parent`
names it, and Brandon builds what is missing by hand: `week:build:live -- --week <N> --start <its Monday>`, about
$14 for the week. Next Saturday's stop 1 records how Sunday went, from the line he pastes.

## Before the job (Brandon's hands)

Nothing, if the job runs in the main checkout. In a `claude --worktree` session, he copies the test env file into
the worktree, as he did on 8 Nov, since `claude --worktree` copies no gitignored file. M1 to M3 then run from the
main checkout after the worktree's branch is on the phase branch and pulled.

## Read first

1. The previous Saturday's report, and `plan/candidates/themes.md` in full: the bank, the Hawaiʻi standard as
   applied, and *For a Saturday with June*.
2. `plan/short-lessons.yaml` (every lesson used, and the format), the last `plan/candidates/short-lessons-<n>.md`
   (the ones not taken), and the newest theme file under `plan/` (the format: one chapter of seven, `sequence`,
   `sources`, both summaries).
3. `lib/plan.ts` (`validatePlan()`, `THEME_TOPICS`, `sequenceProblems()`), `core/curation/schedule.ts`
   (`stretchForWeek()`, `weekThread()`, `weekSchedule()`), `core/content/sources.ts`.
4. docs/04: "The long-term plan", "How a week is mixed", "How the Sunday build is built".
5. `core/prompts/ideas.md` v5 and `card.md` v6; `docs/09-family-values.md`, `packs/README.md`;
   `gate/safety-floor.md`.
6. `docs/08-open-questions.md`, *Bugs* (the week 1 card bugs, so no candidate invites a loose fact), and *A theme a
   week*.

## Decided already (Brandon and June, 16 October to 8 November 2026; do not reopen)

- **A theme is one week** (8 Nov). It has seven topics, one a day, each on the slot it is written for, in file
  order. A theme file has the next `sequence` and one chapter of seven topics, the seven subjects one each, with its
  perspective and values points, and the validator refuses anything else. The file is named as its title should
  read, since the title comes from the name. The same theme can run again the next week as a new file with seven
  new topics. Brandon: "Parents choose the theme for now. Let's keep it simple."
- **The parents pick, every Saturday, from Code's suggestions** (8 Nov). Not the tutor, not the code, not the boys,
  for now. One stop and one reply carry the theme and the 28. Themes not picked stay in the bank and are offered
  again.
- **The theme leads by a week** (8 Nov, the theme-a-week job's stop 1). This Saturday picks week N+1's theme and week
  N's 28.
- **The Hawaiʻi standard** (Brandon, 8 Nov). The boys live here and know more than the tutor does in real ways (the
  boys "live in Hawaii and know more about it than the tutor in many real ways. A lot of the Hawaii cards are poor
  in comparison"), so a Hawaiʻi card written for a visitor is poor. There is no "Hawaiʻi in every slot" quota. A
  Hawaiʻi topic or lesson is offered only when it clears "would a child who lives here learn something". It is
  written in specifics from sources deeper than an encyclopedia:
  - the Hawaiʻi State Archives digital collections;
  - the Hawaiian-language newspapers on Chronicling America;
  - Fornander's collected moʻolelo and other public-domain tellings, named as the telling used;
  - the Hawaiian Volcano Observatory and NPS Hawaiʻi;
  - the Honolulu Museum of Art's CC0 works;
  - Ulukau, where its license allows.

  Brandon and June judge each Hawaiʻi offer at the pick, and may hand Code a line of what they or the boys know,
  which is written in (nothing naming a child; the repository is public). A Hawaiʻi theme week is written with
  June, at stop 1 or during the week before its Saturday, never checked after the fact. **A Hawaiʻi line inside a
  theme about something else** clears the standard when it ties the topic to what the boys know firsthand (8 Nov,
  stop 2; Brandon: "they talk about local rocks the boys have real experience with, a real tie-in; they're not
  trying to teach Hawaiian culture to a child who is already learning from a Kumu").
- **Every library import runs from the newest library** (8 Nov). `plan:import` replaces the library with the file
  it runs from, so it runs only from the phase branch's newest `plan/short-lessons.yaml`. A worktree is rebased onto
  the phase branch before every import. M1 prints the library's count, so a lost lesson shows before anything is
  built.
- **What the lessons lean on** (22 Oct), from the school's tests; both boys read two grades above age:
  - for the older: measurement and data, shapes and fractions, multiplication into division, word parts, fables,
    myths, biographies;
  - for the younger: informational text with a "what did it say?" question, describing a picture in full sentences,
    bar graphs.

  No lesson or theme topic repeats an earlier week's idea.
- **Holidays in the weeks they fall** (28 Oct): a holiday's lesson goes on its own day where a slot allows. The day
  table says where.
- **The idea named** (22 Oct): every candidate and theme topic names the idea it teaches, in its title.
- **Open sources only** (1 Nov): every item is fetched through `core/content/sources.ts` before it is offered, and
  each is CC0 or public domain. A recording is used only when it is public domain in the US. Music Quark cannot hold
  openly is played by a parent, never linked (16 Oct).
- **Nothing a child sees is new code.** This job writes plan data only: no migration, no change to the cards, gate,
  wall or cron, and no iPad. A bug seen is a line under *Bugs*.

## The steps, in order

1. **The offer** (Code, Friday evening or early Saturday): the four themes and the 40 candidates, as stop 1 says,
   with the day table and the counts from week N's theme file. If week N's theme is not on live yet (a Hawaiʻi theme
   written with June during the week), it is written and checked first, and this Saturday's stop 2 takes its look.
   **Stop 1.**
2. **The writing.**
   - Week N+1's theme becomes `plan/<theme>.yaml`, with the next `sequence`, one chapter of seven topics, both
     bands' summaries (plain facts, the mechanism named, as exact as the source), its perspective, values points
     and `sources`.
   - The 28 join `plan/short-lessons.yaml` in the file's format, in Brandon's order where he gave one, each fact
     checked as it is written.
   - The candidates file keeps the 40 and marks the picks. `themes.md` marks the pick and keeps the rest as the
     bank.
   - The validator is clean; `npm test` and `npm run typecheck` pass. Commit and push (no migration, so no
     workflow).
3. **On test**, after a rebase onto the phase branch if in a worktree:
   - `npm run plan:import`;
   - `npm run content:fetch` (under $1);
   - `week:build -- --week <N+1> --start <its Monday> --plan`, which shows the theme found for its week from day 1;
   - `week:build -- --week <N> --start <its Monday> --plan`, which shows week N's theme with no gap.

   Commit. **Stop 2, your look**, then M1, M2 and the plan on live by Brandon's hand.
4. `/wwc:close` (stop 3). The records:
   - the plan files;
   - docs/08 *Decided:* for anything new;
   - `CLAUDE.md` *Where we are*, and the README status;
   - the board: this Saturday's row to *live*, and next Saturday's row at the top of Next;
   - the report, with the money (test and live fetches; Sunday's build is the cron's, recorded next Saturday).

## Not in this job

Code changes of any kind; rebuilding a week already built; the boys choosing; a theme longer than a week; fixing
cards already on live (a bug line names the worst, if Brandon wants it noted); Sunday's look and tap, which are the
week page's.

## Records to update at the end

`plan/<theme>.yaml`, `plan/short-lessons.yaml`, `plan/candidates/short-lessons-<N>.md`, `plan/candidates/themes.md`,
`docs/08-open-questions.md` where something was decided, `CLAUDE.md`, `README.md`, `docs/board.md`, the Saturday's
report. `/wwc:close`.
