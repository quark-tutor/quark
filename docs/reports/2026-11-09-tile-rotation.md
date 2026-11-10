# Report: the tiles rotate daily

Brief: `docs/tile-rotation-slice.md` (phase 4, *Wonder Wall*), on `phase-4-wonder-wall`. Size: an hour. Started
9 Nov 2026, 17:05 HST.

## Stop 1, after reading (9 Nov 2026, 17:15 HST)

**Where it stands.** Read, nothing changed. `phase-4-wonder-wall` is checked out, the branch the brief names. The
board row "The tiles rotate daily" is the top row of Next (in the board's uncommitted changes from the chat), and
no row is in hand. On go it moves to *building* (9 Nov, the brief's path in Where) in the job's first commit, with
the brief and this report. No live command, no migration, no money and no real person before stop 3, the release.
What a child sees changes only at that release: the boys' walls. Stop 2 is a *Your look* with its checks in
exact words; stop 3 guards the release. No step needs your hands before the look, and no planned command meets
the deny list.

**The rule.** `slotOrder(day)` turns the five slots by the days since Monday 26 Oct 2026, the boys' first day.
Each day the front tile goes to the back and the others move up one, so **tomorrow's first tile is the one after
today's first** in Look, Wonder, Listen, Then, Puzzle (and back to Look). The day is the family's day in Hawaii
(`todayIn()`), the same for both boys. In five days every tile is first once and last once.

| Day | 1st | 2nd | 3rd | 4th | 5th |
|---|---|---|---|---|---|
| Mon 9 Nov (today) | Puzzle | Look | Wonder | Listen | Then |
| Tue 10 Nov | Look | Wonder | Listen | Then | Puzzle |
| Wed 11 Nov | Wonder | Listen | Then | Puzzle | Look |
| Thu 12 Nov | Listen | Then | Puzzle | Look | Wonder |
| Fri 13 Nov | Then | Puzzle | Look | Wonder | Listen |
| Sat 14 Nov | Puzzle | Look | Wonder | Listen | Then |
| Sun 15 Nov | Look | Wonder | Listen | Then | Puzzle |
| Mon 16 Nov | Wonder | Listen | Then | Puzzle | Look |

Tuesday 10 Nov falls on the order the boys know (15 days after 26 Oct, three full turns). Released tonight, the
first change they see is Wednesday 11 Nov; if they open the wall again tonight after the release, today's tiles
show in Monday's order, the done ones still done.

**Decided by Code, said here (go takes them):**

1. **The direction:** the front tile goes to the back, as above. The other turn (the last tile jumps to the front)
   also puts each tile first once in five days, but the first tile would walk the order backwards.
2. **The anchor:** Monday 26 Oct 2026, as the brief recommends. Every wall test already runs on that Monday, so
   their orders stand unchanged.
3. **The week page's line is one sentence**, added to the page's opening paragraph: "On the Wonder Wall the tiles
   change order each day." The page keeps showing each day in slot order. No more than a line.
4. **The function and its tests are written after go,** not before this stop: the job writes nothing before go.
5. **The wall's as-built is also in docs/04,** *How the Wonder Wall is built* ("up to five tiles in slot order"),
   and the comment at the top of `app/kid/page.tsx` says "in slot order": both are updated with docs/03.
6. **For the look:** test has no cards today. After the build, `npm run fixture -- today 2026-11-08` moves test's
   8 Nov day (both invented children have all five first cards, passed) to today and sets its week live, and
   Code starts `npm run dev:ipad`.
7. **Check 2's words:** a tile is marked done only at the card's end, not after one answer, so the check reads
   "play it to its end" (below), and its *See* says what done looks like.

**The look tonight, not tomorrow.** Tonight the wall reads Puzzle first, which shows the turn at a glance. After
midnight it is Tuesday, whose order is the old one, so a look then cannot tell a turn from none (the tests still
prove it). Recommended: the look tonight, before midnight HST. If it slips past midnight, stop 2 names Tuesday's
order and says so, and Code moves the cards to the new day first.

**The one question.** The board's uncommitted changes from the chat also hold the Math tile rows, whose Where
names `docs/math-tile-slice.md` and `docs/math-tutor-proposal.md`; both are untracked, and this brief's *Read
first* names the proposal. Recommended: put both in go's first commit, so every Where on the board opens. On
yes, that commit holds the board, this brief, the two math files and this report, and the release at stop 3
puts all of them on `main` in the public repository; neither names a child as far as a search for the invented
names shows, and both are the chat's words, not changed here.

**Stop 2, *Your look*, as it will read** (on June's iPad as Bug, on test, on `npm run dev:ipad`):

- **Where:** the wall, `/kid`, opened from the Home Screen.
- **Do:** 1. Read the five tiles from the top. 2. Open one and play it to its end: a wrong guess each time until
  "This one is for a person:", then "Back to the wall".
- **See:** the tiles in the order named for today (tonight: Puzzle, Look, Wonder, Listen, Then); the tile you
  finished is still in its place, grey, "Done for today".
- Pass □ Fail □ — if fail, what you saw.

Reply go to take all of these.

**Go (17:40 HST).** Brandon: "go. Yes to the one question: both math files go in the first commit." So the
first commit holds the board (this row at *building*), the brief, `docs/math-tile-slice.md`,
`docs/math-tutor-proposal.md` and this report.

## Stop 2, *Your look* (9 Nov 2026, 17:45 HST)

**Built and pushed** (`3159d89` on `phase-4-wonder-wall`; nothing on live, no migration, so the migrations workflow
did not run; nothing spent):

- **`slotOrder(day)`** in `core/wall/card.ts`, beside `SLOTS`: the five slots turned by the days since Monday 26
  Oct 2026 (`TURNS_FROM`), the front tile to the back. A day it cannot read keeps the usual order.
- **`wallFor()`** in `core/wall/flow.ts` orders the tiles by it, from the family's day (`today()`, `todayIn()`).
  Nothing else changed: `onWall()`, the Sunday build, the nightly lines and the week page keep `SLOTS`.
- **The week page** (`/parent/week/<theme>`): its opening paragraph ends "On the Wonder Wall the tiles change order
  each day." The comment at the top of `app/kid/page.tsx` says the new order.
- **Tests,** 9 new, all passing: in `core/wall/card.test.ts`, 26 Oct is the old order; seven days in a row (across
  the end of October) are seven orders, each the last turned by one, day 6 equal to day 1, each tile first once and
  last once in five days; the orders named at stop 1; a day before the start, and a day it cannot read. In
  `core/wall/flow.test.ts`, through `wallFor()`: the first day and two days on; a slot whose first card is held back
  leaves the others in their turned order; the order changes at 12:30 am Hawaii, not at midnight UTC; both children
  get the same order; a done tile stays in its place.
- `npm test`: 451 passed, 34 files. `npm run typecheck`: clean. `npm run build`: clean.

**For the look, on test:** `fixture -- today 2026-11-08` moved test's 8 Nov day (40 cards, all passed; both
invented children have all five first cards) to today, 9 Nov, and set its week live. `npm run dev:ipad` is running:
https://192.168.50.67:3000/kid.

**Your look, on June's iPad as Bug, on test, tonight (Monday 9 Nov, before midnight HST):**

- **Where:** the wall, `/kid`, opened from the Home Screen.
- **Do:** 1. Read the five tiles from the top. 2. Open one that is not grey and play it to its end: a wrong guess
  each time until "This one is for a person:", then "Back to the wall".
- **See:** the tiles in Monday's order: Puzzle, Look, Wonder, Listen, Then. The tile you finished is still in its
  place, grey, "Done for today".
- Pass □ Fail □ — if fail, what you saw.

If the look slips past midnight, Tuesday's order is the old one (Look, Wonder, Listen, Then, Puzzle), so the look
cannot tell a turn from none; say so, and Code moves the cards to Wednesday's date instead on Wednesday.

**Then stop 3, the release.** `/wwc:release` closes first (docs/03 and docs/04's wall, docs/08's *Decided* with
your words and the table, `CLAUDE.md`'s *Where we are*, the README status, this row to *live*), then puts
`phase-4-wonder-wall` on `main` as a fast-forward, by your go at its stop. What it changes: **the boys' walls on
live**, from the deploy on, in Monday's order tonight, then the table at stop 1. No migration and no live command.
It is undone by putting `main` back and redeploying, or by a release of a change that returns `SLOTS` to `wallFor()`.

At the last stop, type `/wwc:close` to close and hold, or `/wwc:release` to close and release; either, typed
clean, is your go for the look; name a failure without it.
