# Brief: a day cannot be written twice

**Phase 4, on `phase-4-wonder-wall`.** Drafted 17 November 2026 in the chat, 21:45. Board row: "A day cannot be
written twice: unique indexes on ideas and cards" (*next*, top, under *Week 2 builds itself*). **Status: ready.**

**Size:** an hour.

## Why

Nothing in the database stops a day of a week being written twice. What stands between a doubled delivery of the
Sunday build and a doubled day is the lock made of `audit_log` rows, and `buildWeek`'s own refusal of a day that has
ideas (docs/04, "How the Sunday build is built", *The lock* and *Which week and which day*: "the real lock would be
unique indexes on `ideas` and `cards`"). Weeks 3 and 4 were built on live without it and no day was doubled, so this
is the backstop, not a repair.

**Brandon, 17 November 2026, 21:31:** "i would say the day can't be written twice and then maybe see if we can't get
wonder wall slice 2 after that."

## The goal

The database itself refuses a second copy of an idea or of a card:

- **`ideas`:** one row for a theme, day, slot and layer.
- **`cards`:** one row for a child and an idea.

That is the whole job. The lock, `buildWeek`'s refusal and `--rebuild` stay as they are, in front of it.

## Before the job (Brandon's hands, before launch)

- No dev server is running, and no other Claude Code session is open in `Documents\quark`.
- Nothing else: no token, no secret, no Vercel setting. `SUPABASE_DB_URL_LIVE` stays unset.

## Stops

1. **After reading.** Code writes into the report:
   - **the migration's SQL, whole** (its review here is the decision), with the columns of each index and why those:
     for `cards`, `(child_id, idea_id)` or `(child_id, day, slot, layer)`, which today has a plain index; and whether
     a plain index the new one makes redundant is dropped in the same migration;
   - **what the indexes do not cover**, in a line each: an idea whose `day` is null (the column came on 14 Oct and
     allows it), with how many such rows test holds;
   - **the doubles on test today**, counted for each index, and what is done about any before the push (the push to
     test fails on them otherwise);
   - **how live's doubles are known before M1.** Code cannot read live. Recommended: the push is the check, since a
     `create unique index` that meets a double fails and changes nothing; Code says whether that holds for this
     migration and this CLI, and what Brandon would see;
   - **what a refused write looks like today**, with no code changed, in each place a day is written: the route's
     reply and its `audit_log` row, and `week:build`'s output. If that is not plain enough to act on, Code says the
     smallest change that makes it so and recommends for or against it; it is built only on Brandon's word;
   - **the proof on test and what it costs** (below), in dollars;
   - anything this brief and the records cannot settle, with its recommended answer.
   "go" takes them all, and is the go for the proof's spend on test.
2. **The live database, by Brandon's hand** (guards: LIVE, the boys' one database). After the migration's green run on
   test and the proof, with its three lines in the report first:
   - **M1 `npm run db:push:live -- --yes`** (whole, as typed; the 17 Nov bug line): this job's one migration. The
     report names its green run on test.
   - Not on a Sunday between 6 am and 9 pm Hawaii, while the Sunday build fires.
   - Brandon's read-back of its last lines goes to the chat.
3. **`/wwc:release`**, which closes first. It carries the migration's file to `main`, so `main` agrees with live's
   database, and whatever stop 1 added on Brandon's word.

No *Your look* and no first touch: the job has no screen, and every check has a known answer, so each is Code's.

## What is built

1. **One migration** in `supabase/migrations`, additive: the two unique indexes. Pushed on the phase branch, applied to
   quark-test by the workflow, watched and reported.
2. **The proof on test**, Code's checks, each in the four parts (Where, Do, See, Pass or Fail):
   - a second idea for a theme, day, slot and layer that has one is refused by the database, and the first is
     unchanged;
   - a second card for a child and an idea that has one is refused, and the first is unchanged;
   - a day still builds with the indexes on, through the same path the Sunday build uses (`npm run cron:week`), and
     ends complete: 20 ideas and, for each child, 20 cards and 20 questions;
   - a day rebuilt (`--rebuild`, or a partial day in a firing) is cleared and written again with nothing refused.
   The cheapest way to each is Code's to choose, and is said at stop 1 with its cost. A built day on test is about
   $2 (week 4 was $14.53 for seven). **Not more than $5 in all** without Brandon's word.
3. **Tests** where the code has a path the indexes change; none are invented for the database's own behavior.
4. **The comments and pages that say nothing stops it** now say what does (the records, below; the comment above
   `buildOneDay` in `core/curation/week.ts`).

## The steps, in order

1. Read; count test's doubles; write the migration; **stop 1**.
2. On go: commit and push the migration; watch the workflow's run on test; the proof; `npm test`,
   `npm run typecheck`, `npm run build`.
3. **Stop 2**, M1 by Brandon's hand.
4. **`/wwc:release`**: the records, the report, the release.

## Read first

1. `docs/04-curation-engine.md`, "How the Sunday build is built" (*Which week and which day*, *The lock*, *One-day
   mode*).
2. `supabase/migrations/20261010000000_initial_schema.sql` (`ideas`, `cards`, `questions`),
   `20261014000000_week_build.sql` (`ideas.day` and its index), `deploy/supabase/schema.sql`.
3. `core/curation/week.ts` (`buildOneDay`), `core/curation/week-job.ts` (`saveIdeas`, `saveCard`, `deleteDay`),
   `core/curation/cron.ts` (`dayState`, `nextDay`), `core/curation/cron-job.ts`.
4. `docs/08-open-questions.md`, the *Decided:* line of 20 Oct that begins "step 1 was reviewed before the go" (why
   the refusal and the lock were built in the indexes' place).

## Not in this job

Any change to the lock, to `buildWeek`'s refusal or to `--rebuild`; an index on `questions`; `db:push:live`'s
`--yes` in the script and the unpinned CLI (bug lines, for a sweep); *A week's lens plan is kept from day 1*; the
Saturday pick; anything on the wall. A finding outside the goal goes under *Found, not built*.

## Records to update at the end

`docs/04-curation-engine.md` ("How the Sunday build is built": *The lock* and *Which week and which day*, with a
*Decided:* line carrying Brandon's words); `deploy/supabase/schema.sql`; `CLAUDE.md` *Where we are* (the README's
status line only if it no longer agrees; nothing a visitor sees changes); `docs/board.md` (this row to *live*, its
*Where* naming this brief and the report). `/wwc:release`.
