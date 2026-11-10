# Brief: the tiles rotate daily

**Phase 4, on `phase-4-wonder-wall`.** Drafted 9 November 2026 in the chat, 17:05. Board row: "The tiles rotate
daily" (*next*, top, under *Wonder Wall*). **Status: ready.**

**Size:** an hour.

## Why

The wall shows its five tiles in one fixed order (Look, Wonder, Listen, Then, Puzzle: `SLOTS` in
`core/wall/card.ts`, used by `wallFor()` in `core/wall/flow.ts`). The boys' own use on live, 26 October to 9
November (days each first card was answered, of 16 offered, and minutes spent):

| | Look | Wonder | Listen | Then | Puzzle |
|---|---|---|---|---|---|
| The older boy: days | 11 | 11 | 8 | 7 | 7 |
| The older boy: minutes | 71 | 71 | 42 | 32 | 29 |
| The younger boy: days | 11 | 11 | 11 | 10 | 10 |
| The younger boy: minutes | 45 | 53 | 42 | 27 | 32 |

Use falls with a tile's place on the wall. The older boy lingers on the first two and often never reaches the last
two. Math is about to take the Puzzle slot (`docs/math-tutor-proposal.md`), and it must not sit last every day for
the boy who needs it most.

**Brandon, 9 November 2026, 16:48:** "swap puzzle with math, and rotate tiles daily."

## Stops

1. **After reading.** Code shows the rule (below) as the order for each of the next seven days, and anything the
   records and this brief cannot settle, with its recommended answer. "go" takes them all.
2. **Your look, on June's iPad as Bug, on test** (the device-test rule), on the dev server (`npm run dev:ipad`).
   - **Where:** the wall, `/kid`, opened from the Home Screen.
   - **Do:** 1. Read the five tiles from the top. 2. Open one, answer it, go back to the wall.
   - **See:** the tiles are in the order Code named for today at this stop; the finished tile is still in its
     place, marked done.
   - Pass □ Fail □ — if fail, what you saw.
3. **`/wwc:release`.** No migration and no live command before it. From the release, the boys' walls rotate.

## Decided already (Brandon, 9 November 2026; do not reopen)

- **The order changes every day**, and it is the same for both boys on the same day.
- **Each tile takes its turn at the front**: the order moves along by one each day, so over five days every tile
  is first once and last once. No randomness: a parent can say which tile is first tomorrow.
- **Nothing else about the wall changes**: the tile's words, done tiles staying where they are, one card at a time.
- **No count, star or "new" mark** on the first tile (rule 4).

## What is built

1. **`slotOrder(day)`**, a pure function beside `SLOTS` in `core/wall/card.ts`: the five slots, turned by the
   number of days since a fixed Monday (recommended: Monday 26 October 2026, the boys' first day, so that day's
   order is the one they know). The day is the family's own day (`todayIn()`), never the server's.
2. **`wallFor()`** uses it in place of `SLOTS` for the order of the tiles. Nothing else reads the order: the
   Sunday build, the nightly lines and the week page keep `SLOTS`.
3. **Tests:** seven days in a row give seven orders, each a turn of the last; day 6 equals day 1; a day with a
   missing slot keeps the others in their turned order; the day changes at the family's midnight.
4. **The week page says so:** one line on `/parent/week/<theme>`, "The tiles change order each day" (so a parent
   reading the week in slot order is not surprised). Recommended; Code says at stop 1 if it is more than a line.

## The steps, in order

1. Read; the function and its tests; **stop 1**.
2. On go: `wallFor()`, the week page's line, `npm test`, `npm run typecheck`, `npm run build`.
3. The dev server for the iPad; **stop 2, Your look**.
4. **`/wwc:release`**, which closes first: docs/03 (the wall), docs/08 (*Decided:* with Brandon's words and the
   table above), `CLAUDE.md` *Where we are*, the board (this row to *live*), the report.

## Read first

1. `core/wall/card.ts`, `core/wall/flow.ts` (`wallFor()`, `today()`), `core/wall/flow.test.ts`, `app/kid/page.tsx`,
   `lib/wall.ts`.
2. `docs/wonder-wall-1-slice.md`, decision 1 (the wall in slot order); `docs/03-touch-points.md`.
3. `docs/math-tutor-proposal.md`, *Decided* (why this comes first).

## Not in this job

Math in the Puzzle slot (`docs/math-tile-slice.md`, the next job); a different order for each boy; any change to a
card.

## Records to update at the end

`docs/03-touch-points.md`, `docs/08-open-questions.md`, `CLAUDE.md`, `docs/board.md`. `/wwc:release`.
