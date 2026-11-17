# Brief: the trading boat on the boys' iPads

**Phase 4, on `phase-4-wonder-wall`.** Drafted 16 November 2026 in the chat, 21:40, from Brandon's answers of the
same evening. Board row: "The trading boat, slice 2: on the boys' iPads" (*later*, under *Wonder Wall*; Brandon names
it, ahead of the top of Next). **Status: ready.**

**Size:** a job. It ends with the boat released to `main`, **off**, with everything it needs on live. Turning it on
is Brandon's or June's tap on live's `/parent`, after the release.

## Why

Slice 1 built the game and Brandon passed its look on test (16 November, 20:50: "okay, i think we're there. this is
much better."). It runs only on the dev server against test. Brandon, 16 November, 21:22: "we would like to get the
math boat trading game on live for the kids."

What stands between test and the boys is in slice 1's report (`docs/reports/2026-11-16-trading-boat.md`, *What could
not be checked* and *Slices for Wonder Wall*): June's read, the migrations and the ladder on live, a switch, the tile's
place on the wall, and the log's grammar. One thing is new: the boys compete, so their prices must be the same.

## Before the job (Brandon's hands, before launch)

- No dev server is running, and no other Claude Code session is open in `Documents\quark` (the two 16 November bug
  lines: a dev server left running served old code).
- June's iPad is to hand for the look, paired as Bug.
- Nothing else: no token, no secret, no Vercel setting. `SUPABASE_DB_URL_LIVE` stays unset.

## Stops

1. **After reading.** Code writes into the report:
   - the plan for each part of *What is built*, with the files it touches;
   - **the new migration's SQL**, whole (the switch; its review here is the decision);
   - **what "the same prices" does to the game's evidence**: slice 1's simulation run for two children on the same
     numbers with their own seeds, 30 days, careful play: each one's money by day and the day each reaches each boat,
     so Brandon sees how far apart luck alone can put two boys who play equally well. If the gap is large, say what
     would narrow it (recommended answer included), and do not build that without his word;
   - what happens to a game in play when the tables are changed on `/parent` (today's day is already rolled);
   - what a child sees if he opens a Puzzle card's address while the boat holds its slot;
   - anything this brief and the records cannot settle, with its recommended answer.
   "go" takes them all.
2. **Your look, on test** (checks direction: the last look before anything reaches live). On June's iPad through
   `npm run dev:ipad`, and `/parent` on the dev server as the test guardian. Each its own check:
   1. `/parent` has a section for the trading boat: a switch, off, and the times tables, one setting for the family.
      Pass □ Fail □
   2. With the switch off: the wall is as the boys have it today, Puzzle in its place, no Math tile. Pass □ Fail □
   3. Turn the switch on and set the tables: the wall shows Math, *The trading boat*, **where Puzzle was in today's
      order**, and no Puzzle tile; the other four tiles have not moved. Pass □ Fail □
   4. As Bug and as Kiddo (the test view's bar): **the prices are the same numbers for both**; the markets, goods and
      rumors are each boy's own. Pass □ Fail □
   5. Move the test view to tomorrow: Math has moved along with the rotation, as Puzzle would have. Pass □ Fail □
   6. Change the tables on `/parent`: both boys' prices change together, from the day Code named at stop 1.
      Pass □ Fail □
   7. Play one sale of a single crate, then read the log on `/parent`: "Sold 1 crate of …". The log's heading no
      longer says "test only". Pass □ Fail □
   8. Turn the switch off: Puzzle is back at once, the Math tile is gone, and turning it on again finds each boy's
      game where he left it. Pass □ Fail □
   His clean "go" means every one passed.
3. **The live database, by Brandon's hand** (guards: LIVE, the boys' one database). Back to back, each with its three
   lines in the report first:
   - **M1 `npm run db:push:live`**: the five migrations (`20261109000000`, `…0001`, `…0002`, `20261116000000`, and
     this job's). All additive; the code on Vercel reads none of what they add. The report names each one's green run
     on test (the four from their own reports, this job's from this session). Known: the script answers the CLI's
     `[Y/n]` with yes by itself (bug line, 23 October).
   - **M2 `npm run ladder:import:live`**: the ladder's rows into `skills`. Safe to run again.
   Brandon says "stop 3 is in" with what each printed. No place is set and no switch is turned at this stop.
4. **`/wwc:release`**, typed by Brandon at the last stop: the close, then the release. `main` gets the boat with the
   switch off, so nothing the boys see changes at the release.

## After the release (Brandon's or June's hands; not a stop)

1. On live's `/parent`: set the trading boat's times tables (the value is Brandon's, given in the chat on 16
   November; it is not written in this repository), then turn the switch on.
2. Each boy's first day is on his own iPad **with a parent beside him**. What they see goes to the chat in Brandon's
   own words; a fault is a bug line or the next brief.
3. If anything is wrong: the switch off. Puzzle is back and nothing is lost.

## Decided already (Brandon, 16 November 2026, in the chat; do not reopen)

- **June has read the game's sentences**, those play did not reach included: all fine. Rule 5's check for the boat is
  done. A sentence added or changed in this job is listed in the report for her, and is read before the switch is
  turned on.
- **No test play by a boy.** The first day is on live, on his own iPad, a parent beside him. *Settles* slice 1's
  stop 3.
- **Math takes the Puzzle slot** (confirms 9 November). When the boat is on, Puzzle's tile is not shown.
- **The boys' prices are equal.** Brandon, 21:25: "the boys prices better be equal, they're competitive with each
  other." One set of times tables for the family. *Replaces* "each boy plays the same game on his own numbers" (10
  November) for this family's boat; the ladder itself and a place per child stand for later slices.
- **Same prices only.** Each boy keeps his own markets, goods and rumors, so neither can copy the other's best trade.
- **Every live command is Brandon's hand** at stop 3. The switch and the tables on live are a guardian's tap.

## What is built (the chat's recommendations; stop 1's "go" takes them or changes them)

1. **The switch.** One new migration: `families.boat_on boolean not null default false`. Any guardian turns it on
   or off on `/parent` (rule 2), written by the server with an `audit_log` row, as the other `/parent` writes are.
   **`lib/boat.ts` asks "is the boat here?" in one place:** the family's switch is on, and the child has numbers.
   The test view no longer decides it; on test the switch is turned on by the same control. With the switch off,
   every function returns null and reads only the switch, so the wall, `/kid/boat`, `/api/kid/boat`, the say route's
   boat line and the log behave exactly as on `main` today.
2. **The family's times tables.** On `/parent`, beside the switch: for each times-table rung of the ladder, *not
   yet*, *working on* or *done*. One setting; saving it writes the same `mastery.place` rows for every child in the
   family, for those rungs only. The boat's numbers are read as now (`tablesOf`, `workingTablesOf`, `largestCount`),
   so equal places give equal prices, usual price and cap. The page says in plain words what the prices will be
   ("Buying prices $… and $…; every dock pays $…"), and says so when the setting gives the boat no numbers. Nothing
   on the page or the wall shows a child a level or a rung's name.
3. **Each boy's own day.** The seed stays the child's. Stop 1 shows what that does between two equal players.
4. **The Puzzle slot.** When the boat is here for a child, `wallFor()` puts the Math tile where Puzzle falls in
   `slotOrder()` for the day and leaves Puzzle's tile out; "everything done" counts the boat's day in Puzzle's place.
   When the boat is not here (the switch off, or no numbers), the wall is today's, Puzzle included. The Sunday build,
   the Saturday pick, the nightly lines and the week page are not touched: they still make and show Puzzle cards.
   The week page says in one line that the trading boat is in Puzzle's place on the wall while it is on.
5. **The parents' log** shows on `/parent` whenever the switch is on, without "(test only)", and its grammar is
   fixed ("Sold 1 crate of sweet potatoes at $4"; the 16 November bug line, deleted by this job).
6. **Proved in a production build, on test.** The boat has only ever run on the dev server. With no dev server
   running: `npm run build`, `npm run start` against test, a browser paired by `fixture -- code`: with the switch on,
   the wall, a trade, a wrong answer's help, "Read it to me" and the log all work, and the test view's bar is not
   there; with it off, `/kid/boat` goes back to the wall and `/api/kid/boat` answers 404. Stop the server before the
   dev server starts again. The report says what was seen.
7. **Tests:** the switch off is `main`'s behaviour; equal places give equal numbers for two children with different
   seeds; the Math tile takes Puzzle's index on each of five days; the log's singular. The Vitest check that only
   `:live` scripts read the live file still holds.
8. **Voice.** "Read it to me" on the boat is made on the first tap and stored by its words, as on test. The report
   says how long a first tap waited in the production build. Making the boat's lines ahead is not in this job.

## The steps, in order

1. Read; the two-seed simulation; the page for stop 1. **Stop 1.**
2. On go: the migration, pushed, its run on test watched and reported; the switch and `lib/boat.ts`; the `/parent`
   control; the wall's slot; the log; the tests.
3. `npm test`, `npm run typecheck`, `npm run build`; the production-build proof on test; then `npm run dev:ipad`.
   **Stop 2, Your look.**
4. **Stop 3**, the live database, Brandon's hand.
5. The last stop. Brandon types **`/wwc:release`**. The records: docs/12 (*How the trading boat is built*: the
   switch, the family's tables, the Puzzle slot), docs/08 (*Decided:* lines above, dated, with what each replaces;
   the fixed bug line removed), docs/04 and docs/03 where they say Puzzle is on the wall, `CLAUDE.md` *Where we are*,
   the README status line, `docs/board.md`, the report with *What you now do differently* (the switch, the tables,
   how to turn it off) and the next slices proposed.

## Read first

1. `docs/reports/2026-11-16-trading-boat.md` and `docs/reports/2026-11-16-release.md`, whole.
2. `docs/12-teaching-that-tests-itself.md`, *How the trading boat is built*; `docs/08-open-questions.md`, *The
   trading boat, slice 1* and *Bugs*.
3. `lib/boat.ts`, `lib/ladder.ts`, `lib/dev-view.ts`, `core/boat/` (`day.ts`, `game.ts`, `sim.ts`, `log.ts`),
   `core/wall/card.ts` (`slotOrder`), `lib/wall.ts` (`wallFor`), `app/kid/page.tsx`, `app/kid/boat/`,
   `app/api/kid/boat/route.ts`, `app/api/kid/say/route.ts`, `app/parent/page.tsx`, `app/parent/boat-log.tsx`,
   `app/parent/actions.ts`.
4. The four migrations of 9 and 16 November in `supabase/migrations/`; `scripts/import-ladder.mts`;
   `scripts/db-push.mts`; `scripts/fixture.mts` (`places`, `boat`, `code`).
5. `CLAUDE.md`, *Rules that never bend* and *Stops*.

## Not in this job

- **The Sunday build without Puzzle, and the Saturday pick's count.** While the boat holds the slot, each week still
  builds seven Puzzle days nobody opens: about a fifth of a week's cards, near $2.80 of about $14, and 7 of Saturday's
  28 picks. Taking it now would change the Sunday build five days before it makes week 5, for a game the boys have
  not yet played once; left, it costs that $2.80 a week and keeps Puzzle ready the moment the switch goes off.
  Proposed as its own slice once the boys have played a week.
- A place per child moving by his own results, and the parents' page of where each boy stands (*The Math tile, slice
  2*, which this job's report should propose rewording for the boat).
- The boat's lines made ahead; more pictures; rumors that can be wrong; a second game.
- Any change to the game's rules, numbers or sentences beyond what stop 1's simulation leads Brandon to ask for.
- `SUPABASE_DB_URL_LIVE`; the `db:push:live` prompt bug; preview deployments.

## Records to update at the end

`docs/12-teaching-that-tests-itself.md`, `docs/08-open-questions.md`, `docs/04-curation-engine.md`,
`docs/03-touch-points.md`, `CLAUDE.md`, `README.md`, `docs/board.md`. `/wwc:release`.
