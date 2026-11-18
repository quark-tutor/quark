# Report: a day cannot be written twice

Brief: `docs/unique-indexes-slice.md` (*Week 2 builds itself*), on `phase-4-wonder-wall`. Size: an hour.

## Stop 1: after reading (17 Nov 2026, 21:45 HST)

**Where it stands.** Read, nothing written but this file, nothing spent. Test holds **no doubles** on either index, and
no idea with a null day, so the push to test needs no clean-up first. The migration is below, whole, for your review.
The proof costs about **$4.20** on test, under the brief's $5. Go takes everything here, the spend included.

- **Branch:** `phase-4-wonder-wall`, checked out, as the brief names. On go: `git pull --rebase --autostash origin
  phase-4-wonder-wall`, then the board row's move.
- **Board:** the row "A day cannot be written twice…" is the top row of Next. No row is in hand. On go it moves to
  *building* at the top of the table, dated 17 Nov 2026, with the brief's path in *Where*, committed with this file
  and the brief (still untracked) as the job's first commit.
- **Stops:** each one passes the test. Stop 2 guards LIVE (M1); stop 3 guards the release. The brief has no *Your
  look* and no first touch, correctly: there is no screen, and every check has a known answer. It has no
  test-database push stop, also correctly: the workflow applies the migration. Nothing between go and stop 2 needs
  your hands, and no planned command meets the deny list.

### The migration, whole

`supabase/migrations/20261117000001_unique_ideas_cards.sql`:

```sql
-- Quark: a day cannot be written twice (docs/unique-indexes-slice.md; docs/04, "How the Sunday build is
-- built", The lock). The database itself refuses a second copy of an idea or of a card. The Sunday build's
-- lock, buildWeek's refusal of a day that has ideas, and --rebuild stay as they are, in front of it.
--
-- 1. ideas: one row for a theme, day, slot and layer. An idea whose day is null (the column came on
--    14 Oct 2026 and allows it) is not covered: nulls are distinct, so such rows never meet.
-- 2. cards: one row for an idea and a child. The idea comes first, so this index also serves every read
--    by idea alone (a day's ideas deleted take their cards with them).
-- 3. The two plain indexes the new ones make redundant are dropped: ideas (theme_id, day, slot, layer)
--    from 20261014000000, and cards (idea_id) from 20261010000000. cards (child_id, day, slot, layer),
--    which the wall reads by, stays.
--
-- A create that meets a double fails. The CLI sends the file's statements and its history row as one
-- batch, which Postgres runs as one transaction, so a failure changes nothing.

create unique index ideas_theme_day_slot_layer on ideas (theme_id, day, slot, layer);
create unique index cards_idea_child on cards (idea_id, child_id);

drop index ideas_theme_id_day_slot_layer_idx;
drop index cards_idea_id_idx;
```

- **Why these columns, for `ideas`:** `(theme_id, day, slot, layer)` is the brief's rule as written. It is the key
  that the week page and `loadIdeas()` already read by.
- **Why these columns, for `cards`:** the rule is "one row for a child and an idea", so the key is `idea_id` and
  `child_id`. I recommend that over `(child_id, day, slot, layer)`, for three reasons:
  - `cards.day` is a date, and test's fixtures move it (`fixture -- today` moved three of test's week 1 days to
    27 Oct, 1 Nov and 17 Nov), so a date key would turn a move onto another week's date into a failure.
  - Inside one week a date key adds nothing: with ideas held to one per theme, day, slot and layer, a card's day,
    slot and layer come from its idea, so one card per idea and child already means one per child, day, slot and
    layer.
  - Across weeks the wall reads only the live week, so two weeks' cards on one date do not meet on a child's wall.
- **Column order and the drops:** with the idea first, the new `cards` index covers every lookup that `cards
  (idea_id)` serves, so that index goes. The `ideas` index has the same four columns as the plain one from 14 Oct,
  so that one goes too. Each drop is undone by creating the index again. The names come from Postgres's rule for an
  unnamed index. Test proves them: a wrong name turns the run red and nothing is applied. The new names follow
  `themes_family_plan_week` (16 Oct).
- **Recommended: as written.** On yes, the commit carries this file unchanged.

### What the indexes do not cover

- **An idea whose day is null.** It never meets another, because Postgres treats nulls as different. Test holds
  **0** such rows. Every idea since 14 Oct has a day (`saveIdeas()` always writes one), and live's weeks are all
  from 23 Oct on.
- **Questions.** A card's question has no index (the brief's *Not in this job*). One card per idea and child leaves
  one place a question is written for it.
- **Two weeks over the same dates.** That is a different rule (above), and the wall reads only the live week.

### The doubles on test today

Read on test by a read-only scratchpad script, which loads test's env file the way the test scripts do and printed
counts only:

- 2 themes (week 1 from 21 Oct, live; week 5 from 10 Nov, live), 252 ideas, 504 cards.
- `ideas (theme_id, day, slot, layer)`: **0** doubles. With null days counted as one value: still 0.
- `cards (idea_id, child_id)`: **0**. The other choice, `(child_id, day, slot, layer)`: also **0**.
- So nothing is done before the push.

### How live's doubles are known before M1

**Recommended, as the brief says: the push is the check.** It holds for this migration:

- A `create unique index` that meets a double fails.
- Both creates come before both drops.
- The Supabase CLI sends a migration file's statements and its history row as one batch, and Postgres runs that
  batch as one transaction. So a failure leaves no index made, none dropped, and the migration unrecorded.
- **The caveat:** the test run uses CLI 2.121.0 (pinned in the workflow). `db:push:live` gets whatever `npx` fetches
  (3.2.0 on 17 Nov). I know the batch from the 2.x CLI and cannot read 3.2.0's source here, so for 3.2.0 this rests
  on the CLI's word.

What you would see at M1:

- **Clean:** `Applying migration 20261117000001_unique_ideas_cards.sql...` then `Finished supabase db push.`
- **A double on live:**
  ```
  Applying migration 20261117000001_unique_ideas_cards.sql...
  ERROR: could not create unique index "ideas_theme_day_slot_layer" (SQLSTATE 23505)
  At statement 0: create unique index ideas_theme_day_slot_layer on ideas (...)
  ```
  The command exits 1 and nothing has changed. Finding and clearing the doubles on live would then be a new stop.

Weeks 1 to 4 on live were each built once (by hand, or a day per firing for week 3), with no day written twice, so I
expect it to be clean.

### What a refused write looks like today, with no code changed

The database's sentence is `duplicate key value violates unique constraint "ideas_theme_day_slot_layer"` (or
`"cards_idea_child"`). The code puts the table's name in front of it. A refusal needs two builds writing the same day
at once: buildOneDay already refuses a day that has ideas, and a second theme is refused by
`themes_family_plan_week`. So it is met only when the lock fails, or when a hand `--day` run starts in the same
minute as a firing.

- **The Sunday build (Vercel, and `cron:week`):**
  - The firing ends `failed`. Its audit row reads `{"outcome":"failed", "week":N, "day":D, "theme":…, "error":"ideas:
    duplicate key value violates unique constraint \"ideas_theme_day_slot_layer\""}`.
  - The route answers **500** with `{"outcome":"failed","week":N,"day":D,"theme":…,"seconds":…}` and no reason, the
    same as for any failed firing. The reason is kept in the audit row only.
  - The firing writes a `model_runs` row, marked not ok, for what it spent.
  - `/parent`: if nothing else built that Sunday, "Sunday's build failed at 6:21 am: ideas: duplicate key value
    violates unique constraint "ideas_theme_day_slot_layer"." Otherwise "…; the 10 am firing failed."
  - The day is left partial. The next firing clears it and builds it again, as it does a doubled day today. After
    the 8 pm spare, the theme stays *generating*, so it cannot be tapped live. The repair is `week:build:live --
    --week N --day D --rebuild` at a stop (docs/04, *One-day mode*).
- **`week:build` (and `:live`):**
  ```
  Stopped: ideas: duplicate key value violates unique constraint "ideas_theme_day_slot_layer"
  The theme is left as 'generating'. Fix the problem and run again with --rebuild.
  ```
  Then the usage lines. That advice is right: `--day D --rebuild` clears that day and builds it again.
- **Plain enough to act on: yes. I recommend no code change.** The index's name says what was refused, and what to
  do is what any failed firing needs.
  - The smallest change, if you want one: `saveIdeas()` and `saveCard()` in `core/curation/week-job.ts` read
    Postgres's code 23505 and throw "Day D's ideas are already being written by another build. Nothing was doubled;
    the next firing clears the day and builds it again." That is about a dozen lines and one test.
  - I recommend against it: the path needs the lock to fail first, and it would be built only on your word.

### The proof on test, and what it costs

Each check is in the four parts, at the end, quoted from what the terminal printed.

1. **A second idea is refused:** $0. A scratchpad script inserts a copy of an idea in test's week 1 (same theme,
   day, slot and layer). It expects code 23505 naming `ideas_theme_day_slot_layer`, then reads the first row back
   unchanged, still one row for that key.
2. **A second card is refused:** $0. The same, for a card (same idea, same child), naming `cards_idea_child`.
3. **A day still builds through `npm run cron:week`:** about $2.10.
   - On test the cron's next week is week 6, which no stretch holds, so a firing would refuse. So first, `fixture --
     delete-week 5` deletes test's week 5. That week is the held Math tile's Moon week from 10 Nov, all past dates,
     with no answers on its cards (counted: 0), and nothing reads it.
   - Then the cron's next week is week 2, from Mon 23 Nov. `week:build -- --week 2 --plan` checks it first ($0).
   - Then `npm run dev` and `npm run cron:week`. Expected: `built`, day 1, then 20 ideas and, for each of test's two
     children, 20 cards and 20 questions.
4. **A partial day in a firing is cleared and written again:** about $2.10.
   - The script plants one idea for day 2, a copy of a day 1 idea with its day set to 2, so day 2 is partial.
   - A second `npm run cron:week` should find day 2 partial, clear it and build it. Expected: `built`, day 2, the
     planted row gone, 20, 20 and 20, nothing refused.
   - The planted row has the same slot and layer as a new one, so the index would refuse the rebuild if the clearing
     did not come first.

- **In all:** about **$4.20**. Live's days were $1.95 to $2.11 with the gate (week 3).
- **The $5 line:** if the first firing costs over $2.50, the second waits for your word at an emergency stop.
- **Afterwards:** the proof's week 2 is deleted, so test holds week 1 alone. The dev server is stopped, and port
  3000 checked free, before `npm test`, `npm run typecheck` and `npm run build` run.

### Tests, and the words that change

- **No new tests.** No code path changes: a refusal goes through the error handling every insert already has, and
  the brief rules out tests of the database's own behavior. `dayState()` and its "written twice" tests stay as they
  are, as the lock and the refusal do.
- **The comments that say nothing stops it:** above `buildOneDay` in `core/curation/week.ts`, and above `dayState`
  in `core/curation/cron.ts`, which says "the database has no unique constraint to stop it".
- **The records, at the close:** docs/04, *Which week and which day* and *The lock*.

### Decided here (go takes them)

- The migration as written: both indexes, and both drops.
- No plain-words change to the refusal.
- Test's week 5 deleted for the proof, and the proof's week 2 deleted after it.
- The proof as above, about $4.20 on test.

### After go, in order

1. The board commit.
2. The migration committed and pushed. `gh run list --workflow migrations.yml --branch phase-4-wonder-wall --limit
   1`, then `gh run watch` on that run, with its result reported.
3. The two comments.
4. The proof.
5. `npm test`, `npm run typecheck` and `npm run build`.
6. **Stop 2:** M1, `npm run db:push:live -- --yes`, by your hand, with its three lines.

Reply **go** to take all of these.

**Go (17 Nov 2026, 22:05):** Brandon: "go". The pull found the branch up to date; the board row is at *building*.

## Stop 2: the live database, by your hand (17 Nov 2026, 22:15 HST)

Everything before M1 is done: the migration on test, the proof, and tests, typecheck and the build. Test has
nothing new on it: it now holds week 1 alone. The job spent **$3.71**, all on test (the brief's line was $5). The
size clock reads about 20 minutes since go, against an hour.

### Couldn't check

- **No pictures.** Every check is a reading in the terminal, with no browser, so the words below are the results.

### What was done

- **The migration** `supabase/migrations/20261117000001_unique_ideas_cards.sql` (`866c648`), as reviewed at stop 1,
  unchanged. Pushed on `phase-4-wonder-wall`, it was applied to quark-test by the workflow: run **44264033725,
  green**.
  - The run printed "Mode: apply (this push changed supabase/migrations)."
  - Its tests passed: 43 files, 523 tests. The typecheck passed.
  - The push printed "Applying migration 20261117000001_unique_ideas_cards.sql... Finished supabase db push."
  - So the two names it drops were right, and test is the first copy with the indexes.
  - Its live job was skipped, as on every branch push.
- **The two comments** (`2385017`), above `buildOneDay` in `core/curation/week.ts` and above `dayState` in
  `core/curation/cron.ts`, now say what refuses a second copy. No code path changed, so no test was added.
- **Test's week 5 was deleted** (the held Math tile's Moon week, from 10 Nov: 112 ideas, 224 cards, no answers), so
  the cron's next week on test was week 2. `week:build -- --week 2 --plan` passed first, at $0.
- **The proof's week 2 was deleted after the proof** (40 ideas, 80 cards over 2 days). Its audit rows and model runs
  stay.
- **The dev server** was started for the firings and stopped after them. Stopping its task left `next` holding port
  3000 again, the 17 Nov bug line, so it was stopped by its process id. The port was checked free before the build.
- **`npm test`:** 43 files, 523 tests, passed. **`npm run typecheck`:** clean. **`npm run build`:** exit 0,
  "Compiled successfully".

### Code's checks

A scratchpad script (`proof.mts`) ran each one against quark-test. It refuses anything but test, and prints ids,
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
     - A firing that had not cleared the day would have been refused at buildOneDay's "already built, or half built"
       check, or by the index on the planted row's key. It got neither.

### Found, not built

- The Sunday route's 500 reply for a `failed` firing carries no reason, for any fault. The reason is kept only in the
  audit row, so Vercel's log shows a bare 500 (`core/curation/cron.ts`, `end()`). The route's own catch does give
  one. For you to take or drop.

### M1, by your hand (LIVE)

Type, whole, as typed:

```
npm run db:push:live -- --yes
```

- **What it does:** applies this job's one migration, `20261117000001_unique_ideas_cards`, to the live database. It
  makes two unique indexes, `ideas_theme_day_slot_layer` and `cards_idea_child`, and drops the two plain indexes they
  replace. No row is added, changed or deleted.
- **What it touches:** **LIVE**, the boys' one database: the `ideas` and `cards` tables. Each index builds in well
  under a second at live's size, and the change holds each table for about that long. A wall that reads cards at that
  instant waits that long. Nothing a child sees changes. It is Tuesday night, so the Sunday rule (no M1 between 6 am
  and 9 pm on a Sunday) is met.
- **How it is undone:** by a later migration that drops the two unique indexes and makes the two plain ones again.
  Nothing is lost either way. If live holds a double, the push fails at the first create and changes nothing: no
  index made, none dropped, and the migration not recorded.
- **What was checked on test:** run 44264033725 (green) applied this same file from this branch, in this session,
  and checks 1 to 4 passed on it.

**Clean, its last lines read:**

```
Applying migration 20261117000001_unique_ideas_cards.sql...
Finished supabase db push.
```

**A double on live reads** `ERROR: could not create unique index "…" (SQLSTATE 23505)` and exits 1. Then do not
release: say so, and finding the doubles on live is a new stop.

After M1, say here what its last lines read (and to the chat). On a clean M1 I record it, and the last stop is
yours: type `/wwc:release` (stop 3), which closes first, then carries the migration file to `main` so `main`
agrees with live.
