# Report: a day cannot be written twice

Brief: `docs/unique-indexes-slice.md` (*Week 2 builds itself*), on `phase-4-wonder-wall`. Size: an hour. Started
21:35 HST on 17 Nov 2026; stop 1 at 21:45; go at 22:05; M1 by Brandon's hand at about 22:35; closed by
`/wwc:release` at 22:41. About 35 minutes from go to the close.

## Couldn't check

- **No pictures.** Every check is a reading in the terminal, with no browser, so the words quoted are the results.
- **The CLI on live.** M1 ran the CLI that `npx` fetched for `db:push:live` (3.2.0 on 17 Nov), not the workflow's
  pinned 2.121.0. It applied cleanly, so the one-batch behavior that the stop 1 plan rested on never had to be relied
  on.
- **The live migrations run on `main`** is the release's to watch, after this close.

## What was done

- **The migration,** `supabase/migrations/20261117000001_unique_ideas_cards.sql` (`866c648`), as reviewed at stop 1
  and taken with go, unchanged:
  ```sql
  create unique index ideas_theme_day_slot_layer on ideas (theme_id, day, slot, layer);
  create unique index cards_idea_child on cards (idea_id, child_id);

  drop index ideas_theme_id_day_slot_layer_idx;
  drop index cards_idea_id_idx;
  ```
  - The file has its comment block above these lines.
  - **`ideas`:** one row for a theme, day, slot and layer.
  - **`cards`:** one row for an idea and a child. The idea comes first so the index also serves reads by idea, which
    makes the plain `cards (idea_id)` index redundant. A card's day, slot and layer come from its idea, so this also
    means one card per child, day, slot and layer within a week.
  - **The drops:** the two plain indexes these make redundant. `cards (child_id, day, slot, layer)`, which the wall
    reads by, stays.
  - **Not covered:** an idea whose day is null, since nulls are distinct (test held 0); questions (outside the
    brief); and two weeks over the same dates, since the wall reads only the live week.
- **The doubles before the push:** test held 0 on each index (252 ideas, 504 cards), so nothing was done first.
- **On test,** by the push of the phase branch: migrations run **44264033725, green**.
  - It printed "Mode: apply (this push changed supabase/migrations)."
  - Its tests passed: 43 files, 523 tests. The typecheck passed.
  - The push printed "Applying migration 20261117000001_unique_ideas_cards.sql... Finished supabase db push." So the
    names of the two dropped indexes were right.
  - Its live job was skipped, as on every branch push.
- **On live, M1 by Brandon's hand** (about 22:35), `npm run db:push:live -- --yes`, typed in this session.
  - It printed `Target: LIVE`, with the live project's address, and then the live database user.
  - Next came the CLI's result line,
    `{"upToDate":false,"dryRun":false,"migrations":["20261117000001_unique_ideas_cards.sql"],…,"message":"Finished
    supabase db push.",…}`.
  - Then the CLI's notes: the `--db-url` deprecation warning (the 17 Nov bug line) and two `auth` config warnings.
  - Last came `Confirmed by --yes: Apply 1 migration…` and `Applying migration 20261117000001_unique_ideas_cards.sql...`.
    It comes last only because `scripts/db-push.mts` writes the CLI's stdout before its stderr.
  - There was no error, so **live held no doubles**: both unique indexes are on it, and both plain indexes are gone.
- **The two comments** (`2385017`): above `buildOneDay` in `core/curation/week.ts`, and above `dayState` in
  `core/curation/cron.ts`. They now say what refuses a second copy. No code path changed, so no test was added.
- **The refusal stays in the database's own words,** with no code to reword it (go at stop 1).
  - **The Sunday build:** a firing that meets an index ends `failed`. Its audit row and, if nothing else built that
    Sunday, `/parent` carry `ideas: duplicate key value violates unique constraint "ideas_theme_day_slot_layer"` (or
    `cards_idea_child`).
  - **The route:** answers 500 with no reason.
  - **The day:** left partial, and the next firing clears it and builds it again.
  - **`week:build`:** stops with the same sentence and its advice to run again with `--rebuild`.
- **Test's weeks.**
  - Week 5, the held Math tile's Moon week from 10 Nov (112 ideas, 224 cards, no answers), was deleted so that the
    cron's next week on test was week 2. `week:build -- --week 2 --plan` passed first, at $0.
  - The proof's week 2 (40 ideas, 80 cards over 2 days) was deleted after the proof.
  - Test holds week 1 alone. The audit rows and model runs of both firings stay.
- **The dev server** was started for the firings and stopped after them. Stopping its task left `next` holding port
  3000 again, the 17 Nov bug line, so the job's own process was stopped by its id. The port was free before the
  build.
- **Tests and build:** `npm test` 43 files and 523 tests, passed. `npm run typecheck` clean. `npm run build` exit 0,
  "Compiled successfully".
- **The report's live details.** Before the close, Brandon asked: "take the live project's address and the database
  user out of stop 3 in the report, and say whether that commit was already pushed".
  - They were taken out in `da15ec4`.
  - `9f85f6f` had already been pushed to `origin/phase-4-wonder-wall`, so the two values are in the public history.
    Only a force push could take them out, and force pushes are on the deny list, so that is Brandon's hands.
  - `docs/reports/2026-10-20-gate-live.md` (lines 86, 87 and 105, committed 20 Oct) holds the same two values. Taking
    them out there was offered, with no answer before the release.
- **The records:**
  - docs/04, *Which week and which day* and *The lock*, with the *Decided:* line in Brandon's words.
  - docs/08, "A day cannot be written twice".
  - `deploy/supabase/schema.sql`: a note of the migration, and a comment on `cards (idea_id)`.
  - CLAUDE.md, *Where we are*: the job's bullet, and the Next list without this row.
  - The board row, to *on hold* for the next release.
  - The README status still agrees, so it was not touched.
- **Spent:** $3.71 of Anthropic's money, all on test: the two firings, $1.948 and $1.7598. The brief's line was $5.

## Code's checks

A scratchpad script (`proof.mts`) ran each check against quark-test. It refuses anything but test, and prints ids,
counts and the database's own sentences, never a name.

1. **A second idea is refused.**
   - **Where:** quark-test after run 44264033725. Week 1's idea for day 1, look, layer 1 (`7957aac5…`).
   - **Do:** 1. Insert a copy of it: the same theme, day, slot and layer. 2. Read the first back. 3. Count the rows
     for that key.
   - **See:** code 23505 naming `ideas_theme_day_slot_layer`; the first row unchanged; 1 row.
   - **Pass.** "refused, code 23505: duplicate key value violates unique constraint "ideas_theme_day_slot_layer"; Key
     (theme_id, day, slot, layer)=(2766c559…, 1, look, 1) already exists." Then "first unchanged: true; rows for that
     theme, day, slot and layer: 1".
2. **A second card is refused.**
   - **Where:** the same, for child 1's card of that idea (`6780439c…`).
   - **Do:** 1. Insert a copy of it: the same idea and child. 2. Read the first back. 3. Count the cards for that
     idea and child.
   - **See:** code 23505 naming `cards_idea_child`; the first row unchanged; 1 card.
   - **Pass.** "refused, code 23505: duplicate key value violates unique constraint "cards_idea_child"; Key (idea_id,
     child_id)=(7957aac5…, 6643533e…) already exists." Then "first unchanged: true; cards for that idea and child: 1".
3. **A day still builds through the Sunday build's path.**
   - **Where:** quark-test with the indexes on and week 1 its only week, so the cron's next week is week 2, from
     Mon 23 Nov. The dev server is running.
   - **Do:** 1. `npm run cron:week`. 2. Read the audit rows. 3. Count the day.
   - **See:** `built`, week 2, day 1; then 20 ideas and, for each child, 20 cards and 20 questions.
   - **Pass.**
     - The reply was `"outcome": "built", "week": 2, "day": 1`, $1.948, 134.9 seconds.
     - The audit rows read *started*, *theme* (`b6fa8945…`), then *built* with 39 passed and 0 pending. The 40th card
       was held by the card checks.
     - The count: "day 1 (2026-11-23): 20 ideas; child 1 20 cards, 20 questions; child 2 20 cards, 20 questions".
4. **A partial day in a firing is cleared and written again.**
   - **Where:** the same week. Day 2 holds one planted idea (`77eee125…`), a copy of a day 1 idea with its day set
     to 2: the count read "day 2: 1 ideas; child 1 0 cards…".
   - **Do:** 1. `npm run cron:week`. 2. Ask whether the planted idea is still there. 3. Count the day. 4. Search the
     dev server's log for "duplicate" and "23505".
   - **See:**
     - `built`, day 2.
     - The planted idea gone.
     - 20 ideas, and 20 cards and 20 questions for each child.
     - Nothing refused.
   - **Pass.**
     - The reply was `"outcome": "built", "week": 2, "day": 2`, $1.7598, 119.7 seconds.
     - The planted idea: "gone".
     - The count: "day 2 (2026-11-24): 20 ideas; child 1 20 cards, 20 questions; child 2 20 cards, 20 questions".
     - The log held 0 matches.

The brief had no *Your look* (no screen; every check had a known answer). Brandon's word at the last stop was
`/wwc:release`, typed clean at 22:41.

## Not done

Nothing. Every check in the brief was taken, above.

## Found, not built

- The Sunday route's 500 reply for a `failed` firing carries no reason, for any fault. The reason is kept only in the
  audit row, so Vercel's log shows a bare 500 (`core/curation/cron.ts`, `end()`). The route's own catch does give
  one. For Brandon to take or drop.

## On live

- **The migration** `20261117000001_unique_ideas_cards`, by Brandon's hand (M1, 17 Nov 2026, about 22:35): the two
  unique indexes are made, and the two plain indexes are dropped. No row changed.
- **Nothing a child sees changed.** No code that reaches Vercel changes how anything runs: the release carries the
  migration file, two comments and the records.
- **The release** carries the file to `main`, so `main` agrees with live's database. The board row is *on hold* for
  it.

cost: not read
