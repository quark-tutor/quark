# Report: the tiles rotate daily

Brief: `docs/tile-rotation-slice.md` (phase 4, *Wonder Wall*), on `phase-4-wonder-wall`. Size: an hour. Started
9 Nov 2026, 17:05 HST; stop 1 at about 17:10; go at 17:40; stop 2 at 17:45; closed at 18:01 by Brandon's
`/wwc:release` at *Your look*, so the release follows this close. About 25 minutes of work. Cost: not read.

## Not checked

- **The boys' walls on live.** They change only when the release deploys. Tonight (Monday 9 Nov) a wall opened
  after the deploy reads Puzzle first. Tuesday 10 Nov falls on the order the boys knew (Look first), so
  **Wednesday 11 Nov (Wonder first) is the first day they see a change**, in normal use. Nothing more to check:
  it is the same code as the look, on live's cards.
- Everything else in the brief was checked: the tests and the build by Code, the look by Brandon.

## Done

- **The rule** (`3159d89`). `slotOrder(day)` in `core/wall/card.ts`, beside `SLOTS`, turns Look, Wonder, Listen,
  Then, Puzzle by one for each day since Monday 26 Oct 2026 (`TURNS_FROM`), the front tile to the back. So
  tomorrow's first tile is the one after today's first, and in five days each tile is first once and last once.
  No randomness. A day it cannot read keeps the usual order.
- **The wall.** `wallFor()` in `core/wall/flow.ts` orders the tiles by it, on the family's day (`today()`,
  `todayIn()`), the same for both boys. A slot with no tile leaves the others in their turned order, and a done
  tile keeps its place. Nothing else reads it: `onWall()`, the Sunday build, the nightly lines and the week page
  keep `SLOTS`. No word on a tile changed, and the first tile carries no mark (rule 4).
- **The week page** (`/parent/week/<theme>`): its opening paragraph ends "On the Wonder Wall the tiles change
  order each day." The page still shows each day in slot order.
- **The next seven days,** as named at stop 1:

  | Day | 1st | 2nd | 3rd | 4th | 5th |
  |---|---|---|---|---|---|
  | Mon 9 Nov | Puzzle | Look | Wonder | Listen | Then |
  | Tue 10 Nov | Look | Wonder | Listen | Then | Puzzle |
  | Wed 11 Nov | Wonder | Listen | Then | Puzzle | Look |
  | Thu 12 Nov | Listen | Then | Puzzle | Look | Wonder |
  | Fri 13 Nov | Then | Puzzle | Look | Wonder | Listen |
  | Sat 14 Nov | Puzzle | Look | Wonder | Listen | Then |
  | Sun 15 Nov | Look | Wonder | Listen | Then | Puzzle |
  | Mon 16 Nov | Wonder | Listen | Then | Puzzle | Look |

- **Tests,** 9 new, all passing.
  - In `core/wall/card.test.ts`:
    - 26 Oct gives the old order.
    - Seven days in a row, across the end of October, give seven orders, each the last turned by one. Day 6 equals
      day 1, and each tile is first once and last once in five days.
    - The orders named at stop 1.
    - A day before the start, and a day it cannot read.
  - In `core/wall/flow.test.ts`, through `wallFor()`:
    - the first day, and two days on;
    - a slot whose first card is held back leaves the others in their turned order;
    - the order changes at 12:30 am Hawaii, not at midnight UTC;
    - both children get the same order;
    - a done tile stays in its place.
- `npm test`: 451 passed, 34 files. `npm run typecheck`: clean. `npm run build`: clean. Pushed; no migration, so
  the migrations workflow did not run.
- **The look**, on June's iPad as Bug, on test. Test's 8 Nov day (40 cards, all passed) was moved to 9 Nov with
  `fixture -- today 2026-11-08` and its week set live, on `npm run dev:ipad`. **`/wwc:release` at *Your look*,
  18:01: every check passed.** The checks, in the words of stop 2:
  - Where: the wall, `/kid`, opened from the Home Screen.
  - Do: 1. Read the five tiles from the top. 2. Open one that is not grey and play it to its end: a wrong guess
    each time until "This one is for a person:", then "Back to the wall".
  - See: the tiles in Monday's order: Puzzle, Look, Wonder, Listen, Then. The tile you finished is still in its
    place, grey, "Done for today".
- **The records:**
  - docs/03, the wall's sketch: an as-built line.
  - docs/04, *How the Wonder Wall is built*, "The pages": the day's order.
  - docs/08, *The tiles rotate daily*: Brandon's words, the use table and each decision.
  - `CLAUDE.md`'s *Where we are*: the note and a bullet.
  - The README status line.
  - The board: the row to *on hold*, waiting on the next release, which the release moves to *live*.
  - The board page, rebuilt.
- **Decisions this session:**
  - In the brief, from the chat (16:48): "swap puzzle with math, and rotate tiles daily."
  - Go at stop 1 (17:40): "go. Yes to the one question: both math files go in the first commit." Taken with
    it: the front tile to the back; counted from 26 Oct; the week page's one sentence; check 2 played to the
    card's end.
  - `/wwc:release` at *Your look* (18:01), with no other words.

## Beyond the brief

- **docs/04's as-built and the kid page's comment** said "in slot order"; both now say the day's order. The brief
  named docs/03 only.
- **Check 2's words.** "Answer it" became "play it to its end": a tile is marked done only at the card's
  handoff, not after one answer, so the brief's words could not have shown a done tile.
- **The chat's two math files,** `docs/math-tile-slice.md` and `docs/math-tutor-proposal.md`, went in with the
  job's first commit (`8f80a7d`), on Brandon's yes, since the board's Math tile rows name them. The release puts
  them on `main`, in the public repository. Neither names a child, as far as a search for the invented names
  shows. Both are the chat's words, unchanged.
- **The board's next slice for *Wonder Wall*.** When this row goes live, the GTD rule moves the project's first
  `later` slice to `next`. Nothing moved, because *Wonder Wall* already has two slices at `next` (the Math tile,
  slice 1, which depends on this row, and Wonder Wall slice 2). A third would go against the board's "the one up
  at `next`".
- **Test's state:** test's 8 Nov cards are now on 9 Nov, and Bug's played card has its attempts there. The iPad
  dev server was stopped after the look.

## On live

- **Nothing before the release:** no migration, no live command, nothing spent.
- **The release** (`/wwc:release`, typed at this close) changes **what the boys see**: their walls turn from the
  deploy on.

## Not done

Nothing: every check in the brief was done.

## Commits

- `8f80a7d` Go: the tiles rotate daily, to building; the brief, the chat's two math files and the stop-1 report
- `3159d89` The tiles rotate daily: slotOrder() turns the wall's five slots by one each day from Monday 26 Oct
  2026, the front tile to the back, in the family's own day; wallFor() uses it; the week page says so in one line
- `14be6ce` Report: stop 2, the look on June's iPad as Bug, tonight's order Puzzle first
- The close: the records and this report (below, in `git log`).
