# Brief: a theme a week, picked on Saturday

**Phase 3 work on `phase-4-wonder-wall`** (after Sunday 8 Nov's release; the week 3 job is closed by then, so no
worktree). Drafted 8 November 2026 in the chat, 07:40; rewritten 08:20 on Brandon's word (below). Board row: none
yet; proposed at stop 1 as "A theme a week: each Saturday the parents pick next week's theme from Code's
suggestions, Code writes its seven topics, the Sunday build builds them beside 28 short lessons" at *next*, on
Brandon's word; the *Week 2 builds itself* project's goal becomes "the week builds itself". **Status: ready.**

**Size:** a slice, over the week: the code and week 5's theme this week, on live by Saturday 21 November, the release
before Sunday 22 November's 6 am firing.

## Why

Egypt is 24 topics over four weeks, and four weeks of one theme is already old (Brandon, 8 Nov 2026: "this Egypt
for 4 weeks thing is already getting old"). Week 4 (16 to 22 Nov) takes Egypt's last three topics and then has no
thread; from week 5 (23 Nov) a week would be 35 short lessons with nothing running through it. docs/08 left "when
the thread runs out" open on 16 Oct until the parents picked a theme.

**Brandon's word (8 Nov 2026):** "Parents choose the theme for now. Let's keep it simple. We've barely got the tool
running, let's not hide a bunch of fudge in the code that may or may not work how we think. So simple, one week at
a time, themes suggested on Saturday and chosen. Cards built on Sunday for approval." And on Hawaiʻi: the boys "live
in Hawaii and know more about it than the tutor in many real ways. A lot of the Hawaii cards are poor in
comparison."

So: **a theme is one week.** Each Saturday, Code suggests themes, the parents pick one (a new one, or the same theme
again if they want more of it), Code writes its seven topics beside the week's 28 short lessons, and Sunday builds
it for the parents' tap. The code change is the smallest that does this, with no new table and no new rule the
parents cannot see in a file.

## Stops

1. **After reading: four themes for week 5, the code's shape, and the row.** Code writes **four themes** into
   `plan/candidates/themes.md`, a short page each: why this one, the seven topics it would run (one a day, slot
   named, the idea in the title, one line each), the music and pictures that exist for it in open sources (a first
   search of the Met, the Art Institute, Commons, LoC, NASA/NOAA/NPS and the Hawaiʻi sources below), and which of
   the 24 values points it touches. One of the four is Ancient Greece (Egypt's own story reaches it); one may be a
   Hawaiʻi theme only if it meets the Hawaiʻi standard below. The file stays as the bank: themes not picked are
   offered again on later Saturdays, with new ones. Brandon and June reply with week 5's theme, or ask for four more.
   Also at this stop: the board row on Brandon's yes; the code's shape (recommended below) with anything the
   records cannot settle, recommended answers, and "go" taking them all.
2. **After step 3, on test: Your look, on the laptop.**
   - **Where:** the stop's report, with `npm run week:build -- --week 5 --start 2026-11-23 --plan` on test pasted
     whole.
   - **Do:** 1. Read day 1 to day 7. 2. Read "What the family's settings decide".
   - **See:** seven days; each day's thread slot names one of the theme's seven topics, in order; the other four
     slots a short lesson; the week's title names the theme; no "blocked", "Don't bring it up" or "Not yet" line
     (test's blackball on subject 14 excepted, which is test's).
   - Pass □ Fail □ — if fail, what you saw.
   - **Where:** `http://localhost:3000/parent/content` on the dev server, as the test guardian.
   - **Do:** 1. Scroll the new items (Code names the count). 2. Read each credit line.
   - **See:** every picture is one you would put in front of the boys; every credit reads right; nothing waits.
   - Pass □ Fail □ — if fail, what you saw.
   Then, only on go, by Brandon's hand, back to back: **M1 `npm run plan:import:live`** (LIVE, the plan only: the
   theme's rows; undone by deleting them by key), **M2 `npm run content:fetch:live`** (LIVE, the theme's items,
   under $1), and **the plan on live, spending nothing: `npm run week:build:live -- --week 5 --start 2026-11-23
   --plan`**, read the same way. Brandon pastes all three. A "Not yet" or "blocked" line on live is a topic rewritten
   or swapped before the close (a parent-led line is fine).
3. **`/wwc:release`** when the records are done: the Sunday build on Vercel must run this code before 22 Nov's 6 am
   firing. If `main` has moved, Brandon merges by hand. Either word typed clean at stop 2 is the go for the look; a
   failure named without it is a fix round.

## Before the job (Brandon's hands)

Nothing before launch. Between stop 1 and go, a few minutes with June over the four themes, and the test env file
copied into the worktree (`claude --worktree` copies no gitignored file, and the deny list refuses Code any command
naming it; added at stop 1, done by Brandon 8 Nov 2026).

## Read first

1. `plan/ancient-egypt.yaml` (the format, `sequence`, `sources`), `plan/candidates/ancient-egypt.md`, `lib/plan.ts`
   (`validateStretch()`, `planRows()`, `position`, `sequence`), `scripts/import-plan.mts`.
2. `core/curation/schedule.ts` (`weekSchedule()`: `thread[(week-1)*7 + day-1]`), `core/curation/week-job.ts`
   (`prepareWeek()`: one stretch, `opts.stretch ?? firstStretch`; `threadTitles`, `stretchTitle`, `earlierInThread`,
   the chapter in a topic's prompt), `core/curation/schedule.test.ts`.
3. docs/04: "The long-term plan", "How a week is mixed", "How the Sunday build is built"; docs/08: "When the thread
   runs out" (16 Oct) and the decisions above it; docs/17.
4. `core/prompts/ideas.md` v5 and `card.md` v6 (what a topic's summary, chapter and `earlierInThread` become).
5. `docs/09-family-values.md`, `packs/README.md`; `gate/safety-floor.md`; `docs/reports/2026-10-23-first-live-week.md`,
   *What the reader notes say* (loose facts in a summary become loose facts on a card).
6. The Hawaiʻi lessons in `plan/short-lessons.yaml` (weeks 2 and 3: kapa, the rain shadow, the ʻōpeʻapeʻa, the
   steel guitar, the ʻuaʻu, Duke Kahanamoku, Māui, the quilt, the quarter, the flag; the petroglyphs, the kōlea,
   coral, the ʻokina, humuhumu, Mauna Kea, the Oʻahu map), to see what "poor in comparison" means before writing
   the standard.

## Decided already (Brandon and June, 13 October to 8 November 2026; do not reopen)

- **A theme is one week**: seven topics, one a day, each on the slot it is written for, in file order (16 Oct's
  rule), the chapter's perspective and values points with it. The same theme can run again the next week as a new
  file with seven new topics, if the parents pick it again. No theme is longer than a week in one file.
- **The parents pick, every Saturday, from Code's suggestions.** Not the tutor, not the code, not the boys (for
  now). The pick is part of the Saturday job with the 28 short lessons; one stop, one reply.
- **The smallest code change, visible in the files.** Recommended: no new table and no migration. A stretch file
  keeps `sequence`; the thread for plan week N is the stretch whose weeks hold N, counting from sequence 1: Egypt
  (sequence 1, 24 topics) holds weeks 1 to 4 (week 4 with three thread days, as today); sequence 2 holds week 5;
  sequence 3 week 6; and so on, each one-week stretch one week. `prepareWeek()` loads every stretch, not the first;
  `weekSchedule()` is given the week's own thread and starts it at day 1; the week's title and `thread.title`
  come from that stretch; `earlierInThread` is that stretch's earlier topics only; "the thread has ended" is said
  only when no stretch holds the week. Weeks already built never change (the schedule test holds Egypt's weeks 1
  to 4 exactly as today). A gap in the sequence, or two stretches with one sequence, is refused by the validator
  and the import. Code may propose a simpler mechanism at stop 1, never a more clever one.
- **Week 4 stays as planned**: Egypt's last three topics, then 32 short lessons from the banked candidates, picked
  Saturday 14 Nov. Week 5 (23 Nov) is the first picked theme.
- **The Hawaiʻi standard** (Brandon, 8 Nov 2026). The boys live here and know more than the tutor does in real
  ways; a Hawaiʻi card written for a visitor is poor. So: no "Hawaiʻi in every slot" quota (the practice of 1 and
  7 Nov ends). A Hawaiʻi topic or lesson is offered only when it clears "would a child who lives here learn
  something", and is written in specifics from sources deeper than an encyclopedia: Hawaiʻi State Archives digital
  collections, the Hawaiian-language newspapers on Chronicling America, Fornander's collected moʻolelo and
  other public-domain tellings named as the telling used, the Hawaiian Volcano Observatory, NPS Hawaiʻi, the
  Honolulu Museum of Art's CC0 works, Ulukau where its license allows. Brandon and June judge each Hawaiʻi offer at
  the pick and may hand Code a line of what they or the boys know, which is written in (nothing naming a child;
  the repository is public). A Hawaiʻi theme week is written with June, at stop 1 or in the Saturday job, never
  checked after the fact. Code records this standard in docs/04 at the close and applies it to the four themes.
- **What the topics lean on** (22 Oct): for the older, measurement and data, shapes and fractions, multiplication
  into division, word parts, fables, myths, biographies; for the younger, informational text with a "what did it
  say?" question, describing a picture in full sentences, bar graphs.
- **The idea named** (22 Oct). **Open sources only**, every item fetched through the adapters before it is offered;
  a recording only when public domain in the US.
- **Nothing a child sees changes** in this job but the plan data and the schedule code; no wall, voice or judge
  change. **No iPad** (22 Oct).

## The steps, in order

1. **The four themes** for week 5, into `plan/candidates/themes.md`, as stop 1 says. **Stop 1.**
2. **The code**: every stretch loaded; the week's stretch found from the sequence; the validator and import refusing a
   gap or a clash; titles, `earlierInThread` and the chapter from the week's own stretch. Tests: Egypt's weeks 1 to 4
   unchanged; week 5 on sequence 2 from its day 1; week 6 with no sequence 3 refusing with a plain message naming
   the file to write; a sequence gap refused. `npm test`, `npm run typecheck`. Commit, push (no migration, so no
   workflow).
3. **Week 5's theme written**: `plan/<theme>.yaml`, `sequence: 2`, one chapter of seven, both bands' summaries
   (plain facts, the mechanism named, as exact as the source), its perspective and values points, its `sources`;
   the validator clean. On test: `plan:import`, `content:fetch` (under $1), `week:build -- --week 5 --start
   2026-11-23 --plan`. Commit, push. **Stop 2, Your look**, then M1, M2 and the live plan by Brandon's hand.
4. **The Saturday brief**: `docs/saturday-pick-slice.md`, a standing brief for every Saturday from 21 Nov: Code
   offers the week's themes (the bank plus new ones, the Hawaiʻi standard applied) and 28 short-lesson candidates
   at stop 1; the parents reply with the theme and the 28; Code writes the theme file (next `sequence`) and the
   lessons, imports and fetches on test, and hands M1, M2 and the live plan to Brandon at stop 2; Sunday builds;
   the look and the tap are the week page's. Written in the shape of `docs/week-3-slice.md`, with the Hawaiʻi
   standard in its *Decided already*.
5. **`/wwc:release`**: docs/04 ("The long-term plan": a theme a week, picked by the parents, how a stretch's week is
   found; "How a week is mixed": the thread-ended line's meaning; the Hawaiʻi standard), docs/08 ("When the
   thread runs out" closed; the theme-a-week and Hawaiʻi decisions quoting Brandon), `CLAUDE.md` *Where we are*,
   the README status (a theme a week, chosen by the parents), the board (this row to *live* at the release; a
   *next* row "Saturday 21 Nov: week 6's theme and week 5's 28 short lessons" on Brandon's yes), the report with
   the money. Before Sunday 22 November, 6 am.

## Not in this job

Week 4's pick (Saturday 14 Nov, 32 lessons from the banked 51; no theme, Egypt's last three days); fixing the
Hawaiʻi cards already built (weeks 2 and 3 are on live; the standard applies from week 5; a bug line may name the
worst if Brandon wants them noted); the boys choosing; a theme longer than a week; the unique indexes; any change
to the cards, the gate, the wall or the cron's hours.

## Records to update at the end

`plan/<theme>.yaml`, `plan/candidates/themes.md`, `docs/saturday-pick-slice.md`, `lib/plan.ts`,
`core/curation/schedule.ts`, `core/curation/week-job.ts`, `docs/04-curation-engine.md`, `docs/08-open-questions.md`,
`CLAUDE.md`, `README.md`, `docs/board.md`. `/wwc:release`.
