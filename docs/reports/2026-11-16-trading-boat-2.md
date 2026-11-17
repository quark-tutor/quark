# Report: the trading boat, slice 2, on the boys' iPads

Brief: `docs/trading-boat-2-slice.md` (*Wonder Wall*, phase 4), on `phase-4-wonder-wall`. Size: a job.
- **Times (16 Nov 2026, HST):** started 21:30. Stop 1 at 21:40. **Go at 21:45:** "go. On 3: luck alone. That way
  they can't copy off each other but they both have a chance to win." Go took every recommendation and decision below.
  On question 3, luck alone: nothing narrows the gap. The tables Brandon gave in the chat were not named at go, so
  whether they are setting A or B is seen at the tap on live (question 2). Stop 2 at 21:58.
- **17 Nov 2026:** stop 2's look failed on the brief, not on the build. The chat brought it, quoting Brandon: "we
  need to have code undo the switch, and release the math trading game in place of the puzzle, that was the
  decision." The fix round started at 04:45. Stop 2, fix round 1, at 04:58.
- **17 Nov, fix round 2:** the look failed on (b), by Brandon's decision, brought by the chat: "high luck on day 1
  will give one child an overwhelming lead. fix the first 3 days of the simulation, then luck after that." It started
  at 05:17. Stop 2, fix round 2, at 05:22.
- **17 Nov, the look passed:** "It passed. go" (06:26). Stop 3 at 06:28.

## Stop 3: the live database, by your hand

### Where the job stands

Your look passed, so everything on test is done. What is left is live's three commands, by your hand, and then the
release.
- **Live:** nothing has touched it yet.
- **Spent:** nothing since stop 2.
- **The branch:** pushed, ahead of `main` (`5663851`) by this job's commits and behind it by none, so the release still
  fast-forwards.
- **On Vercel now:** `main` shows the boat only on the dev server against test, and reads no table. So M1 to M3 change
  nothing the boys see. The release is what puts the boat on their walls.

Run the three back to back, in this order. Each needs the one before it:
- without M1's columns, M2 stops with "is the Math tile's migration on this database?";
- without M2's rows, M3 refuses: "skills holds no times-table rung: run the ladder import first."

If one prints anything else, stop there and paste it in the chat. Nothing after it is run.

### M1 `npm run db:push:live`

- **What it does:** applies the six migrations live does not have, in order:
  - `20261109000000_math_tile`: new columns on `skills` (`key`, `position`, `ladder`), `mastery` (`place`), `children`
    (`math_style`) and `attempts` (`move`, `label`); `model_runs` may also take `label`;
  - `20261109000001_math_questioned`: `attempts.verdict` may also take `questioned` and `no_number`;
  - `20261109000002_family_familiar`: `families.familiar`, empty by default;
  - `20261116000000_trading_boat`: two new tables, `boat_games` and `boat_turns`, which a family can read only its own
    rows of;
  - `20261116000001_boat_switch` adds `families.boat_on`, and `20261117000000_boat_switch_gone` drops it in the same
    push.
- **What it touches: LIVE**, the boys' one database. It changes the shape of `skills`, `mastery`, `children`,
  `attempts`, `model_runs` and `families`, and adds two new tables. No existing value changes: every new column is
  empty or takes its default. The code on Vercel reads none of it.
- **How it is undone:** not by a command. A migration can only be taken back by a new one, and none should be needed,
  since all six only add, and the switch's column comes and goes in one push. The CLI records each migration as it
  applies it, so if the push stops partway, running it again applies only what is left.
- **Checked on test:** each one is green in the migrations workflow from this branch:
  - the Math tile's three: runs 42757383298, 42765079572 and 42765695820 (9 and 10 Nov, in their own report);
  - the trading boat's: run 44017188011 (16 Nov, in its report);
  - this job's two: runs 44041186215 and 44107585185 (this session).

  Every proof in this job ran on test with all six applied.
- **What you will see:**
  - `Target: LIVE`, then the database user;
  - the six names, then "Applying migration …" for each;
  - "Finished supabase db push."

  The script answers the CLI's `[Y/n]` with yes by itself, so "Finished" may print before the question. That is the
  23 Oct bug line, not a fault.
- **The first run (07:25), by your hand: nothing was changed.**
  - **What happened:** the CLI, fetched new by `npx` as supabase 3.2.0 because the project does not pin it, now
    refuses to take the default when it cannot ask. It printed: "Confirmation required: Apply 6 migrations … This run
    can't ask because it is running in agent mode. Nothing was changed."
  - **It counts six,** as above.
  - **So M1 is now `npm run db:push:live -- --yes`.** The script passes `--yes` on to the CLI, and that flag is the
    answer to the one question this stop is for. Nothing else about M1 changes.
  - **For the close, two bug lines:**
    - the 23 Oct line is now "the CLI refuses with no `--yes`", and the script should say so and take it;
    - the CLI is unpinned, and 3.2.0 warns that `--db-url` goes in v4.
- **M1 is in (about 07:40), by your hand, with `--yes`:** `Target: LIVE`, then "Confirmed by --yes: Apply 6
  migrations", "Applying migration …" for each of the six in order, from `20261109000000_math_tile.sql` to
  `20261117000000_boat_switch_gone.sql`, and "Finished supabase db push." No error. The only warnings were the CLI's
  deprecations (`--db-url`, and two `auth` settings in `supabase/config.toml`).

### M2 `npm run ladder:import:live`

- **What it does:** writes the math ladder (`plan/math-ladder.yaml`) into `skills`: 14 rungs and 6 everyday areas, so
  20 rows, matched by key. Three of the rungs are the times tables the boat reads.
- **What it touches: LIVE**, `skills` only.
- **How it is undone:** it is safe to run again, since it updates the same rows by key, and nothing on Vercel reads
  them until the release. To take them out, delete the 20 rows whose key is set, in SQL, before M3 puts a place on
  them.
- **Checked on test:** it ran again from this branch this morning, unchanged.
- **What you will see:** `Target: LIVE`, then "The math ladder: 14 rungs and 6 everyday areas, 20 rows in skills."
- **M2 is in (07:43), by your hand:** exactly that, and nothing else. No row was left over from before.

### M3 `npm run boat:tables:live -- times-2-5-10=<place> times-3-4=<place>`

- **What it does:** sets the family's times tables, the same for both boys, with the tables you gave in the chat. Each
  place is `done`, `working` or `not-yet`, and a table not named is not yet. A setting that would lose money is
  refused before anything is written: "Refused: …" and "Nothing was written."
- **What it touches: LIVE**:
  - `mastery.place` on the three times-table rungs, for each of the family's children;
  - one `audit_log` row holding the setting.

  It counts the children and names none.
- **Before the release** it changes nothing the boys see, since the code on Vercel reads no table.
- **How it is undone:** `npm run boat:tables:live -- none` sets every table back to not yet. After the release, live's
  `/parent` does the same. Neither touches a game.
- **Checked on test:** the command set test's tables, took them off with `none`, then set them again (fix round 1).
  The production build showed Math in Puzzle's place, and Puzzle back after `none`. This morning it read test's
  tables back as "The trading boat is on the wall, in Puzzle's place."
- **What you will see:**
  - `Target: LIVE`;
  - "About to set, for each of the family's 2 children on LIVE:", then the three tables;
  - "Done. Read back:", the three tables again;
  - "The trading boat is on the wall, in Puzzle's place.", and the prices.

  The tables are yours and stay out of this public report. So "in" is enough for M3, with whether it said the boat is
  on the wall.
- **M3 is in (07:44), by your hand,** with your tables from the chat, on the second try. The first try was the line
  with its `<place>` words left in; the shell refused it before npm started, so nothing ran.
  - It set them for the family's 2 children and read them back the same.
  - It said "The trading boat is on the wall, in Puzzle's place." and gave a prices line.
  - Its printout is not copied here.

### Stop 3 is in (07:45)

All three commands ran on live by your hand, each printing what this section said it would:
- **M1:** the six migrations, with `--yes` on the second run;
- **M2:** the ladder's 20 rows;
- **M3:** the family's tables, the boat on the wall.

The boys see nothing new yet: the code on Vercel reads no table. **Nothing was spent.**

### Then

Say "stop 3 is in", with whether M1 and M2 printed what is above, and M3 said the boat is on the wall.

The last stop is `/wwc:release`, typed by you: the close (the records), then the release to `main`.
- **When Vercel deploys it:** the boat is on both boys' walls in Puzzle's place, on the next screen each one opens.
- **Each boy's first day:** on his own iPad, with a parent beside him (the brief's *After the release*).
- **How it comes off again:** as fix round 1 says, below. Live's `/parent`, all *Not yet*, or
  `npm run boat:tables:live -- none`. Puzzle is back at once, and each game is kept.

## Stop 2, fix round 2: Your look, on test

### Where the job stands

Game days 1, 2 and 3 are now the same for every child of a family. They are drawn from the family and the day number,
not the child, and from day 4 each child has his own seed, as before. A game day is a day played, so each boy gets the
same first three whenever he plays them.
- **The clock:** 5 minutes since the fix round began.
- **Live:** nothing has touched it.
- **Spent:** nothing.
- **This replaces** "same prices only" (16 Nov) for days 1 to 3.

**Built** (`8727d94`):
- **The rule:**
  - `SHARED_DAYS = 3` and `seedOf(n, child, family)` in `core/boat/day.ts`;
  - the game's context carries the family (`lib/boat-here.ts`: `device.familyId`);
  - `roll()` and `dayFor()` draw each day from `seedOf()`.
- **The sim:** `play()` takes the family too, so it can measure the change.
- **One thing beyond the letter of the ask:**
  - **The problem:** `dayOf()` drew where the rumors point from the same random stream as everything else. A boy on
    another island on day 2 would then have had a wholly different day 2, though it was a shared day.
  - **The fix:** the islands are now a draw of their own, one order for the day's seed less the island he is on. Where
    he is changes only a rumor's island, never the day's goods, crates, prices or rumors' goods and prices.
  - **What is left:** on a shared day, two boys on different islands differ only where the family's rumor points at the
    island one of them stands on. His then points at the next island in the order, since a rumor never names his own
    island.
  - **No rule changed:** the change re-draws every day, the child's own days included, with the same rules. The test
    games were started over, and live has no game.
- **Nothing else changes:** no sentence, screen, number or rule. `dayOf()`'s rumor draw is kept.
- **A commit missed last round:** `37444a1` commits the command's plain refusals, which fix round 1 made and ran but
  left out of its commits.

**The plate:**
- `npm test`: 43 files, 523 tests (5 new);
- `npm run typecheck`: clean;
- `npm run build`: clean.

**The new tests** (`core/boat/game.test.ts`, *the family's first three days*):
- two children of one family get identical days 1 to 3 on every pair of islands, but where a rumor points at his own
  island, and identical days on the same island;
- both start on the same day 1, the same `today`;
- each gets his own days from day 4, through day 12, on every island;
- a child of another family gets different days 1 to 3;
- a child who starts on 2 Dec still gets the family's day 1.

**The gap:** two careful boys under 2s, 5s and 10s done and 3s and 4s working on, over 2,000 pairs. Before, the richer
has 17% more at day 7 and 14% more at day 14 (47% and 42% at 9 in 10). After, 14% and 13% (35% and 36% at 9 in 10).
At day 3 they are level, where before the richer had 29% more (78% at 9 in 10).
- **What it means:** the overwhelming early leads are gone, and the worst gaps at 9 in 10 narrow by about a quarter.
  The typical gap at day 7 is from days 4 to 7's luck, and barely moves.
- **Checked:** the island draw alone, with no shared days, gives 15% and 15%, so it changes the game's odds by no more
  than noise.
- **Under stop 1's other setting** (2s, 5s and 10s working on; run at stop 3, 17 Nov, with the same script):
  - **before:** the richer has 4% more at day 7 and 4% at day 14 (12% and 10% at 9 in 10), and 9% at day 3 (25%);
  - **after:** 3% and 3% (7% and 8% at 9 in 10), and level at day 3.

  The gaps there were small from the start, and the shared days still close the first three.
- **The script:** a scratch script outside the repository, which runs `core/boat/sim.ts`'s `play()` with and without
  the family.

### Proved in a production build, on test

- **How:** `npm run build`, then `npm run start` on port 3000, with the dev server stopped. Both test games were
  started over first, and test's children 1 and 2 were each paired through `/api/kid/pair`. The cookies stayed in jar
  files that were never printed, and were deleted after.
- **Day 1's harbor market** was identical for both, word for word:
  - pineapples $3 (4 crates), mangoes $3 (10), sweet potatoes $4 (4), taro $3 (10);
  - "Every dock pays $4 a crate for anything";
  - the trader's rumor: "Pigs dug up the sweet potato fields on Hawaiʻi Island. Sweet potatoes will sell for $10 a
    crate on Hawaiʻi Island."
- **Today's wall** still reads Listen, Then, Math, Look, Wonder.
- **After:**
  - both games were started over again, for the look;
  - the two check devices were forgotten (`67d31984…`, `1937b612…`);
  - `next start` was stopped by its command line;
  - `npm run dev:ipad` was started; it is running.
- **Test, otherwise as fix round 1 left it:** the tables are 2s, 5s and 10s done and 3s and 4s working on, today has 9
  Nov's cards, and June's iPad is paired.

### Sentences

None new or changed, for a child or for the parents.

### Stop 3 and how the boat comes off

As fix round 1 says, below. Nothing in this round is a migration, so M1 is the same six.

### Your look

On June's iPad at `https://192.168.50.67:3000/kid` (`npm run dev:ipad`, running), with no sign-in. Both games start
on day 1. Tap *The trading boat*, then *Go to the harbor market*.

The one check:
- As Bug and as Kiddo (the test view's bar), day 1's harbor market shows the same goods, prices, crates and rumor.
  Pass □ Fail □

Your clean "go" means it passed. A failure, named, is a fix round back to this stop. After it, stop 3 is the three
commands on live by your hand.

## Stop 2, fix round 1: Your look, on test (failed on (b), 17 Nov)

### Where the job stands

There is no switch. The boat is on a child's wall, in Puzzle's place, whenever the family's times tables give it
prices, on test and on live alike. With no table set, the wall shows Puzzle, as the boys have it today.
- **The clock:** 13 minutes since the fix round began.
- **Live:** nothing has touched it.
- **Spent:** nothing. No model call, and no new voice line.

**What the fix round asked, and what was done:**
1. **The switch is gone.**
   - Gone from code: no code reads `families.boat_on`, and `setBoat()` is gone.
   - Gone from `/parent`: the switch's button and its three states are gone.
   - `fixture -- switch` is gone, and so are their tests.
   - `lib/boat-here.ts` now asks only the tables: with prices, the boat is here; with none, or with a fault, it is
     not, and Puzzle is on the wall.
   - A new test holds it: no file in `app`, `lib`, `core` or `scripts` names `boat_on`, `setBoat` or the fixture.
2. **The migration.** `20261117000000_boat_switch_gone.sql` holds one line, `alter table families drop column
   boat_on;`, under a header quoting Brandon. It was pushed (`5234be8`), and run **44107585185** applied it on test,
   **green**: "Applying migration 20261117000000_boat_switch_gone.sql... Finished supabase db push." Its live job did
   nothing.
3. **The command.** `npm run boat:tables` sets the family's tables, and `boat:tables:live` is its twin
   (`scripts/boat-tables.mts`).
   - It writes the same `mastery.place` for every child on the three times-table rungs, with a `boat.tables` audit
     row, as `/parent` saves it.
   - It refuses, with `/parent`'s words, a setting that loses money or has nothing to sail for. It also refuses any
     word it does not know. A refusal prints "Refused: …" and "Nothing was written.", with no stack trace.
   - With no words, it prints the setting and what it gives. With `none`, it sets every table to not yet, which takes
     the boat off the wall.
   - The package test holds that only the `:live` twin reads the live file, and that the twin differs from the test
     script only in that file.
   - It accepts 7 of the 27 settings: the 6 that give prices, and none.
   - **Used on test:** test's two children are now 2s, 5s and 10s *done* and 3s and 4s *working on*, both the same.
     It read back: "The trading boat is on the wall, in Puzzle's place. Buying prices $3 and $4. Every dock pays $4 a
     crate for anything. A rumor pays $5 or $10 a crate."
4. **Kept as built:**
   - the Puzzle slot;
   - equal prices from one setting;
   - the tables setting and the log on `/parent`;
   - the log in crates;
   - the `dayOf()` line.
5. **One change of my own, adjacent:** with no switch, the setting is the only way off. So **`/parent` now saves
   every table at *Not yet*** as the boat off the wall, where before it refused that setting.
   - The section says so in words: "To take the boat off the wall, set every table to not yet: Puzzle is back at
     once, and each child's game waits where they left it."
   - The log shows while the boat is on the wall.
   - The week page's sentence now follows the tables.

**The plate:**
- `npm test`: 43 files, 518 tests;
- `npm run typecheck`: clean;
- `npm run build`: clean (`38c599c`, `5234be8`).

### Proved in a production build, on test, without the switch

`npm run build`, then `npm run start` on port 3000 against test, with the dev server stopped. The checks used curl,
with test's child 1 and child 2 each paired through the app's own `/api/kid/pair`. Their cookies stayed in jar files
in the scratchpad, never printed, and were deleted after.
- **Today's wall** (17 Nov's order is Listen, Then, Puzzle, Look, Wonder): **Listen, Then, Math (*The trading boat*),
  Look, Wonder**, the same for both children. There was no Puzzle tile and no test-view bar.
- **The prices,** at each child's first market:
  - **child 1:** sweet potatoes $4, pineapples $3, coconuts $4, mangoes $4. Every dock pays $4. Today's rumor is
    pineapples to Lānaʻi at $5.
  - **child 2:** bananas $4, pineapples $4, mangoes $4, sweet potatoes $3. Every dock pays $4. Today's rumor is
    pineapples to Kauaʻi at $10.
  - **The same numbers** ($3 and $4 to buy, $4 at any dock, a rumor at $5 or $10), with each boy's own goods and
    rumors.
- **Off with `none`:** the wall read Listen, Then, **Puzzle**, Look, Wonder. `/api/kid/boat` answered 404, and
  `/kid/boat` went back to the wall (Next's streamed redirect to `/kid`).
- **On again** (the tables set back): Math was back where Puzzle falls, and child 1's game was where he left it, at
  the harbor market.
- **Not seen:** `/parent` needs a guardian's sign-in, which curl does not have. Its section and the week page's
  sentence are covered by the tests, the typecheck and the build. The look below asks for no sign-in.
- **Not repeated:** the trade and "Read it to me". The game and the voice did not change in this round; stop 2's
  first proof has them, below.
- **After:**
  - the server was stopped, and `next start` (PID 20788) was stopped by its command line;
  - both test games were started over;
  - the two check devices were forgotten (`f64fc14d…`, `54689500…`);
  - `npm run dev:ipad` was started; it is running.

### Done on test along the way, for the record

- **Today's cards:** test had no card on 17 Nov, so `fixture -- today 2026-11-09` moved 9 Nov's 40 passed cards to
  today and set their week live. Today's wall is now five tiles, so check (a) is a real wall and not Math alone. 9 Nov
  now has no cards on test.
- **The tables** on test: 2s, 5s and 10s done; 3s and 4s working on, for both children. They were set by the command,
  then by `none`, then set again.
- **Both games** were started over (`fixture -- boat 1 reset`, `boat 2 reset`).
- **June's iPad** stays paired as Bug (`7bf285e9…`).

### Sentences

- **For a child:** none new or changed.
- **For the parents,** changed on `/parent`:
  - "Math as a trading game, in Puzzle's place on the wall: each child buys crates at the markets and tells the
    trader what they owe. Every child gets the same prices, from the times tables below; each has their own markets
    and rumors."
  - **Where the boat stands, one of three:**
    - "The trading boat is on the wall, in Puzzle's place."
    - "The trading boat is not on the wall: no times table is working on or done, so the wall shows Puzzle."
    - "The trading boat is not on the wall: these times tables give it no prices that work, so the wall shows
      Puzzle."
  - **The tables:** "One setting for the family. Every child's prices come from it. To take the boat off the wall, set
    every table to not yet: Puzzle is back at once, and each child's game waits where they left it."
  - **With no ladder loaded:** "The math ladder isn't loaded on this copy of Quark yet, so the wall shows Puzzle."
  - **Gone:** the switch's three states and its button, and the refusal "With no times table working on or done…".
- **On the week page:** "While the trading boat is on the wall, it takes Puzzle's place, and the Puzzle cards below
  are not shown."

### Stop 3, as it now stands, and how the boat comes off

Stop 3 is three commands by your hand. Each gets its three lines in the report before you run it.
- **M1 `npm run db:push:live`:** six migrations on **LIVE**.
  - **The Math tile's three:** `20261109000000`, `…0001` and `…0002`, green on test in runs 42757383298, 42765079572
    and 42765695820.
  - **The trading boat's:** `20261116000000`, green in run 44017188011.
  - **This job's two:** `20261116000001` adds `boat_on` (run 44041186215) and `20261117000000` drops it (run
    44107585185). On live the two run in the same push, so `families` ends as it is now.
  - The code on Vercel reads none of what they add.
- **M2 `npm run ladder:import:live`:** the ladder's rows into `skills` on **LIVE**. Safe to run again.
- **M3 `npm run boat:tables:live -- times-2-5-10=<place> times-3-4=<place>`** on **LIVE**, with the tables you gave in
  the chat. A table not named is not yet, and the places are `done`, `working` and `not-yet`.
  - The value stays out of this public repository, so the report records that it ran, not what it printed.
  - Setting it changes nothing the boys see until the release, because the code on Vercel shows the boat only on the
    dev server against test and reads no table.
  - If the release went first, nothing would change either: with no table set, the wall shows Puzzle.
- **The release** (`/wwc:release`, typed by you) then puts the boat on both boys' walls, in Puzzle's place, on the
  first screen each opens.

**How it is taken off again, if it has to be** (each way keeps both games, and putting the tables back finds each
boy where he left off):
1. **On live's `/parent`:** *The trading boat*, set every table to *Not yet*, then *Save the times tables*. Puzzle is
   back on the next screen either boy opens. Any guardian can do it, from any device.
2. **By command:** `npm run boat:tables:live -- none`.
3. **Already built in:** a fault reading the tables counts as no boat, so Puzzle shows.
4. **If the code itself had to go:** a revert of the release on `main`, which is your merge.

**Proved on test:** way 2, at the production build above. Way 1 is the same write through `/parent`, covered by the
tests.

### Your look

On June's iPad at `https://192.168.50.67:3000/kid` (`npm run dev:ipad`, running), with no sign-in. Today's wall on
test is 9 Nov's cards moved to today. 17 Nov's order is Listen, Then, Puzzle, Look, Wonder, so the boat stands third.
Both games start on day 1.

The two checks, each its own:
- **(a)** Today's wall shows *The trading boat* where Puzzle goes, and it is the game approved on 16 Nov.
  Pass □ Fail □
- **(b)** As Bug and as Kiddo (the test view's bar), the prices are the same numbers. Pass □ Fail □

Your clean "go" means both passed. A failure, named, is a fix round back to this stop. After it, stop 3 is the three
commands on live by your hand.

## Stop 2, first time: Your look, on test (failed on the brief, 17 Nov)

### Where the job stands

Everything in the plan is built, tested and proved in a production build. The dev server is running for the look.
- **The clock:** 13 minutes since go.
- **Live:** nothing has touched it.
- **Spent:** no Anthropic money (no-number judge calls, none). Google's voice made one boat line, inside the free tier.

**The migration on test:** `20261116000001_boat_switch` was pushed with go's commit.
- `.github/workflows/migrations.yml` applied it: run **44041186215, green**, "Applying migration
  20261116000001_boat_switch.sql... Finished supabase db push."
- Its live job did nothing.

**The plate:**
- `npm test`: 43 files, 515 tests (497 before);
- `npm run typecheck`: clean;
- `npm run build`: clean on its first run.

**Built** (`d63f5d2`; the migration `a9712cf`), as stop 1's plan says:
- **The switch:**
  - `lib/boat-here.ts` asks "is the boat here?" in one place;
  - `lib/boat.ts` asks it before every read and write, and no longer reads the test view;
  - `setBoat()` writes the switch and a `boat.switch` audit row.
- **The tables:**
  - `lib/boat-setting.ts` reads the family's setting, checks it and words its prices;
  - `numbersProblem()` in `core/boat/day.ts`;
  - `setBoatTables()` writes `mastery.place` for every child and a `boat.tables` audit row.
- **The section on `/parent`:** `app/parent/boat-section.tsx` and `boat-tables.tsx`.
- **The Puzzle slot:**
  - the scope's hidden slots in `core/wall/flow.ts`, read by `onWall()`;
  - `slotAt()` and `boatAt` in `core/wall/card.ts`;
  - `lib/wall.ts` asks `boatHere()`;
  - the Math tile at `boatAt` on `/kid`;
  - "everything done" counts it;
  - the week page's sentence.
- **`dayOf()`** always takes the rumor's draw.
- **The log** reads in crates, inside the boat's section, while the switch is on. The 16 Nov bug line is deleted at
  the close.
- **New for testing:** `npm run fixture -- switch [on|off]`.
- **The 18 new tests:**
  - the switch off reads only the switch, and a fault is off;
  - all 27 settings: the 6 saved never let a crate sell under its cost, over 10 seeds, 10 days and 7 islands;
  - equal places give two seeds equal prices and different markets;
  - a change of tables changes only prices, over 40 seeds;
  - the Math tile at Puzzle's index on five days, and where Puzzle has no card;
  - a Puzzle card's page, answer and line refused while the boat is here;
  - the log's singular and plural.

### Proved in a production build, on test

`npm run build`, then `npm run start` (port 3000) against test, with no dev server running.
- **The browser:** the Chrome extension was not connected, so the checks used curl. It was paired through the app's
  own `/api/kid/pair` with a `fixture -- code 1` code, as test's child 1, and its cookie stayed in a jar file that was
  never printed.

**With the switch off:**
- the wall showed Wonder, Listen, Then, Look. Test has no Puzzle card on 16 Nov: the clean-up of slice 1 removed the
  math week that held that slot;
- `/api/kid/boat` answered 404 to GET and POST;
- the boat's "Read it to me" answered 404;
- `/kid/boat` went back to the wall (Next's streamed redirect to `/kid`).

**With the switch on** (`fixture -- switch on`):
- **the wall:** Wonder, Listen, Then, **Math (The trading boat)**, Look. Math stood where Puzzle falls on 16 Nov, with
  no Puzzle card that day;
- **the test view's bar:** not on the page;
- **`/kid/boat`:** the game.

**A trade** (child 1's test game was started over first, since its canoe was full with $0, `fixture -- boat 1 reset`):
- 3 crates of sweet potatoes at $5;
- a wrong total of 8 got "That's 3 and 5 put together. You need 3 lots of 5." and the count's first step;
- 15 got "That's right. 3 crates of sweet potatoes are on your boat."

**"Read it to me" on the boat:**
- the first tap took **8.1 seconds** (made by Google and stored; the first Google call since the server started);
- the second took **0.8 seconds**, from the store.

**The log** (`fixture -- boat 1 log`, the same `dayLogs()` the page uses): "Bought 3 crates of sweet potatoes at $5: 3 ×
$5 = 15. Said 8 (the two numbers added). Then right (said 15)." `/parent` itself needs a guardian's sign-in, which curl
does not have, so its section is check 1 and check 7 below.

**Switch off again:**
- the Math tile was gone at once;
- `/api/kid/boat` answered 404;
- `/kid/boat` went back to the wall;
- child 1's game was kept ($5, 3 crates).

**No error** in the server's log. The server was stopped:
- the background task stopped `npm`;
- `next start` (PID 21808, checked by its command line) was stopped by Code, and port 3000 was free;
- then `npm run dev:ipad` started.

### Done on test along the way, for the record

- **`fixture -- places` ran by mistake,** chained into a read. It set test's two children to slice 1's places again
  (child 1 working on 2s, 5s and 10s; child 2 done on those and working on 3s and 4s), which is where slice 1 left
  them. Test only.
- **Both test games were started over** (`fixture -- boat 1 reset`, `boat 2 reset`), so the look's day 1 begins on the
  day the look starts and lands the next day:
  - Bug's was slice 1's (day 3, Lānaʻi, $74);
  - Kiddo's was the production check's.
- **Code's check device was forgotten** (`ba9bb088…`). June's iPad stays paired as Bug, and the laptop's Chrome as
  Kiddo.
- **The switch is off.**

### Sentences

- **For a child:** none new (stop 1). June's read is done.
- **For the parents,** new on `/parent`:
  - "Math as a trading game: each child buys crates at the markets and tells the trader what they owe. Every child gets
    the same prices, from the times tables below; each has their own markets and rumors."
  - **The switch's three states:** "Off. Puzzle is on the wall." · "On. The trading boat takes Puzzle's place on the
    wall." · "On, but the times tables below give it no prices, so the wall still shows Puzzle."
  - **The switch's button:** "Turn the trading boat on" / "Turn the trading boat off".
  - **The tables:** "One setting for the family. Every child's prices come from it."
    - When the places differ: "The children's places differ on … Saving sets them the same."
  - **The prices:** "Buying prices $3 and $4. Every dock pays $4 a crate for anything. A rumor pays $5 or $10 a crate."
  - **A refusal:**
    - "With these tables a crate could sell for less than it cost, and the boat promises that no choice loses
      money." / "With these tables a rumor pays no more than any dock, so there is nothing to sail for." / "With no
      times table working on or done, the boat has no prices. Set one to working on or done."
    - The first two add: "The settings that work: 2s, 5s and 10s alone, working on or done; or 3s and 4s working on,
      with 2s, 5s and 10s done."
  - **The log:** headed "What each child traded".
- **On the week page:** "While the trading boat is on, it takes Puzzle's place on the wall, and the Puzzle cards below
  are not shown."

### Your look

On June's iPad through `npm run dev:ipad` (running: `https://192.168.50.67:3000/kid`), and `/parent` on the dev
server as the test guardian.

**Before check 2:**
- test's one nearby day with Puzzle cards is **Monday 9 Nov**. On the iPad, open
  `https://192.168.50.67:3000/kid/dev?day=2026-11-09`; the bar's *Today* comes back to 16 Nov.
- 9 Nov's order is Puzzle, Look, Wonder, Listen, Then. 10 Nov's is Look, Wonder, Listen, Then, Puzzle, and 10 Nov has
  no Puzzle card on test, so check 5 shows Math where Puzzle would be.
- **For check 7:** a sale happens at the landing. Buy 1 crate on day 1 and cast off before moving to the next day.
- **For check 3:** "set the tables" to the ones you gave in the chat. If the page refuses them, that answers stop 1's
  question 2.
- **Until check 3 saves,** test's two children have different places, so the section says they differ.

The checks, in the brief's words; each its own:
1. `/parent` has a section for the trading boat: a switch, off, and the times tables, one setting for the family.
   Pass □ Fail □
2. With the switch off: the wall is as the boys have it today, Puzzle in its place, no Math tile. Pass □ Fail □
3. Turn the switch on and set the tables: the wall shows Math, *The trading boat*, **where Puzzle was in today's
   order**, and no Puzzle tile; the other four tiles have not moved. Pass □ Fail □
4. As Bug and as Kiddo (the test view's bar): **the prices are the same numbers for both**; the markets, goods and
   rumors are each boy's own. Pass □ Fail □
5. Move the test view to tomorrow: Math has moved along with the rotation, as Puzzle would have. Pass □ Fail □
6. Change the tables on `/parent`: both boys' prices change together, from the day Code named at stop 1 (**at once:
   the next screen either boy opens**). Pass □ Fail □
7. Play one sale of a single crate, then read the log on `/parent`: "Sold 1 crate of …". The log's heading no longer
   says "test only". Pass □ Fail □
8. Turn the switch off: Puzzle is back at once, the Math tile is gone, and turning it on again finds each boy's game
   where he left it. Pass □ Fail □

Your clean "go" means every one passed. A failure, named, is a fix round back to this stop. After it, stop 3 is the
live database by your hand.

## Stop 1: after reading

### Where the job stands

- **Read:** the brief, slice 1's report and the release report, whole. Also docs/12 *How the trading boat is built*,
  docs/08 *The trading boat, slice 1* and *Bugs*, every file in the brief's *Read first*, the four migrations, the
  ladder, the grants on `families` and `mastery`, and the deny lists.
- **Nothing is changed.** One file is written, this one. The brief is not yet committed.
- **The branch:** `phase-4-wonder-wall` is checked out, as the brief names. The tree is clean but for the brief. No dev
  server or node process is running.
- **The board:**
  - The brief's row (*The trading boat, slice 2: on the boys' iPads*) is at *later* under Wonder Wall.
  - The top of Next is *A day cannot be written twice: unique indexes on ideas and cards*.
  - Nothing is in hand.
  - On go, the row moves to *building* (top, today's date, the brief's path in Where). That is the first commit, with
    this file and the brief.
- **The stops pass the test.**
  - Stop 2 checks direction (*Your look*), with each check in exact words.
  - Stop 3 guards LIVE.
  - Stop 4 guards the release.
  - The test migration is a step: the push, then `gh run watch`.
  - M1 is `db:push:live` by Brandon's hand, as the *Migrations* line says, since the live job waits on an unset
    secret.
  - Nothing between go and stop 2 needs Brandon's hands.
  - No planned command meets the deny list.
  - The brief's *Before the job* holds: no dev server is running.
- **The order holds.** The migration reaches live at stop 3, before the release, so the released wall never asks for a
  column live does not have.

### The two-seed simulation: how far apart luck alone puts two careful boys

**The method:**
- slice 1's `play()` (`core/boat/sim.ts`), careful play, 30 days;
- 500 pairs of boys on the same numbers, each with his own seed (a random id, as a child's is);
- the same code the game runs: `dayOf()`, `takeOf()`, the boats at 4, 15 and 40 bills;
- "earned" is money, plus crates at cost, plus what his boats cost.

The family's tables are Brandon's, given in the chat and in no file, so both of slice 1's settings were run. They are
also the two sensible settings that work (the next section).

**Setting A: 2s, 5s and 10s.** Prices $2 and $5; every dock pays $5; a rumor pays $10.

| | One careful boy | The gap between two careful boys |
|---|---|---|
| Double canoe | day 7 (7 to 8) | the same day in 4 pairs of 5; never more than 1 day |
| Schooner | day 21 (20 to 22) | 1 day; 9 pairs in 10 within 1; the worst 3 |
| Earned, day 7 | $446 | the richer has 5% more; 9 pairs in 10 within 12% |
| Earned, day 14 | $1,191 | 4% more; within 10% |
| Earned, day 30 | $3,204 | 4% more; within 9% |

**Setting B: 3s and 4s, with 2s, 5s and 10s done.** Prices $3 and $4; every dock pays $4; a rumor pays $5 or $10.

| | One careful boy | The gap between two careful boys |
|---|---|---|
| Double canoe | day 9 (8 to 11) | 1 day; 9 pairs in 10 within 2 or 3; the worst 6 |
| Schooner | day 30 (28 to 33) | 2 days; 9 pairs in 10 within 5; the worst 12 |
| Earned, day 7 | $316 | the richer has 17% more; 1 pair in 10 has 45% more |
| Earned, day 14 | $763 | 16% more; 1 pair in 10 has 41% more |
| Earned, day 30 | $1,944 | 9% more; 1 pair in 10 has 24% more |

**One pair under B, day by day** (a median gap on the double canoe; money and crates, after a boat is paid for):

| Day | 1 | 3 | 5 | 7 | 9 | 10 | 12 | 14 | 18 | 22 | 26 | 29 | 30 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| A | $20 | $117 | $155 | $239 | $369 | $31, double | $141 | $318 | $740 | $1,002 | $1,213 | $1,401 | $25, schooner |
| B | $20 | $81 | $212 | $344 | $76, double | $100 | $330 | $489 | $774 | $1,090 | $1,319 | $91, schooner | $155 |

**Play counts for more than luck.** Under the same numbers:

| Earned, setting B | Day 7 | Day 14 | Day 30 |
|---|---|---|---|
| A careful boy | $316 | $763 | $1,944 |
| One in between | $169 | $356 | $817 |
| A careless one | $48 | $95 | $189 |

Under A the in-between boy has $283, $610 and $1,394.

**Is the gap large?**
- **Under A: no.** Two careful boys get the double canoe on the same day 4 times in 5.
- **Under B: noticeable in the first two weeks, then it closes.**
  - In 1 pair in 10, one boy has about 45% more in week 1, and the double canoe up to 3 days sooner.
  - The cause is the rumor's price. Under B a rumor pays $5 or $10 at random; under A it is always $10.
- **What would narrow it:** a rumor that always pays the top number, so B's is always $10.
  - Simulated, B's gap falls to A's: 2% at day 7 and 4% at day 30, with the double canoe on the same day.
  - It is a change to the game. It makes B richer (the double canoe on day 8, not 9; $2,653 at day 30, not $1,944),
    and it takes the $5 rumors, and their × 5 sums, out of B.
- **Recommended: build nothing to narrow it.** A careful boy has twice what an in-between one has, far more than luck's
  gap, and luck's gap closes by itself. The lever is named here for later.
- Per the brief, it is not built without your word.

### Found: most settings of the tables make a crate lose money

Slice 1 promised that no choice loses money: a crate always sells for at least what it cost.
- **Why it holds only sometimes:** `numbersFor()` makes the usual price the first of his numbers above his lowest
  buying price. With a family control that sets any rung to *not yet*, *working on* or *done*, the usual price can
  fall below a buying price.
- **The count:** of the 27 settings of the three times-table rungs, 1 gives no numbers and 6 keep the promise. 18 let a
  crate bought at the dearer prices sell for less than it cost. In 2 more, a rumor pays no more than the usual.

**The settings that work:**
- **A:** 2s, 5s and 10s working or done; 3s and 4s and 6s to 9s not yet. Prices $2 and $5, every dock $5.
- **B:** 2s, 5s and 10s done; 3s and 4s working. Prices $3 and $4, every dock $4.
- Three odd ones: either of the above with 6s to 9s *done*, or 3s and 4s working with 6s to 9s done.

**Settings that lose money:**
- every setting with 6s to 9s *working*. For example, the prices are $6 to $9 and every dock pays $7;
- 2s, 5s and 10s working with 3s and 4s working or done;
- 2s, 5s and 10s done with 3s and 4s done: the natural next step after B. Prices $2 to $5, every dock pays $3.

**Question 2, below.**

### What happens to a game in play when the tables change

**Decided: at once, for both boys.**
- The next screen either boy opens shows the new prices.
- Both read the same rows at every request, so their prices are never different.
- **The day in play** keeps its goods, its crates, its order and its rumors' islands. Only the prices change.
- **For that to be exact, one line changes in `dayOf()`.**
  - Today a rumor's random draw is skipped when the tables offer no rumor price, so a change of tables could reshuffle
    the rest of the day.
  - After the change the draw is always taken. It changes nothing in any game played so far: under A and B the draw is
    never skipped.
  - A test holds that a change of tables changes only the prices.
- **What a boy notices:**
  - A trade already open finishes at the price it was opened at.
  - Crates already on board sell at the next landing at the new prices. Moving from A to B, a crate bought at $5 that no
    rumor names sells at the usual $4, once. Careful play never buys those: under A they earn nothing.
  - Brandon's check 6 then reads "from the next screen".

### What a child sees if he opens a Puzzle card's address while the boat holds its slot

**Decided: the wall.**
- While the boat is here for him, Puzzle is not on his wall: the card page goes back to `/kid`, as it does for any card
  not on today's wall.
- An answer to it, and "Read it to me" on it, are refused (404) and write nothing.
- **How:** one rule does this. The scope that `core/wall/flow.ts` checks every row against gains the slots hidden
  today; `onWall()` reads it, and the wall, the card page, the answer route and the say route all go through it.
- **When it could happen:** the boys' Home Screen app has no address bar. Only a Puzzle card opened before the switch
  went on, and reached again by going back, could bring him there.
- When the switch goes off, the same card opens as it does today.

### The plan, part by part

1. **The switch.**
   - The migration below.
   - **`lib/boat-here.ts` (new): the one place that asks "is the boat here?"** It reads the family's switch. Only when
     it is on, it reads the times-table places and works out the numbers and today. It answers with the game's context,
     or null.
     - It is its own file because `lib/wall.ts` needs the answer and `lib/boat.ts` already imports `lib/wall.ts`.
     - An error reading the switch counts as off and logs one line, so the boat can never break the wall.
   - **`lib/boat.ts`:** every `devViewOn()` gate becomes that answer. With the switch off each function returns null,
     having read only the switch.
   - **The test view** (`lib/dev-view.ts`, the bar) stays as it is, for the child and the day on the dev server. It no
     longer decides the boat.
   - **`app/parent/actions.ts`:** `setBoat(on)`. Any guardian's session updates its own family's row, as row-level
     security allows, and `audit()` writes `boat.switch` (rule 2).
2. **The family's times tables.**
   - **`lib/ladder.ts`:** the times-table rungs are `tablesOf()`'s rungs: 2s 5s 10s, 3s 4s, and 6s to 9s.
     - *Multiply bigger numbers* is not offered. It would put sums above 10 into the game, which slice 1 left for later.
   - **`core/boat/day.ts`:** `boatProblem(numbers)`, the plain sentence when a setting loses money or has no rumor
     worth sailing for, else null.
     - The page and the boat both use it, so a setting the page refuses never reaches a game.
   - **`app/parent/actions.ts`:** `setBoatTables()` refuses a setting with a problem, saying why. Otherwise it writes
     `mastery.place` (working, done, or null for not yet) for every child, for those three rungs only, and audits
     `boat.tables`.
     - It goes through the guardian's session: no delete is needed, since not yet is a null place.
   - **`app/parent/boat-section.tsx` (new):** on `/parent`, the section *The trading boat*.
     - **The switch** and what it does now: "Off: Puzzle is on the wall.", "On: the trading boat takes Puzzle's place
       on the wall.", or on with no prices.
     - **The three rungs,** each *not yet*, *working on* or *done*, with Save.
     - **The prices in words:** "Buying prices $3 and $4; every dock pays $4 a crate; a rumor pays $5 or $10."
     - When the children's places differ (test's do), it says so, and saving makes them the same.
     - No rung's name or level reaches a child.
3. **Each boy's own day:** the seed stays the child's (above).
4. **The Puzzle slot.**
   - **`core/wall/flow.ts`:** the hidden slots in the scope, as above.
   - **`core/wall/card.ts`:** `WallReply` carries `boatAt`, the place among the shown tiles where Puzzle falls in
     `slotOrder()` that day, only while the boat is here.
   - **`lib/wall.ts`:** the scope asks `lib/boat-here.ts`.
   - **`app/kid/page.tsx`:** the Math tile at `boatAt`. "Everything done" counts the boat's day in Puzzle's place.
   - **The week page** (`app/parent/week/[theme]/page.tsx`) adds one sentence while the switch is on: "While the
     trading boat is on, it takes Puzzle's place on the wall, and the Puzzle cards below are not shown."
   - The Sunday build, the Saturday pick and the nightly lines are not touched.
5. **The parents' log** (`app/parent/boat-log.tsx`, `core/boat/log.ts`):
   - it shows inside the boat's section while the switch is on, headed *The trading boat*;
   - a trade reads in crates, from the game's own `BOAT.crates()`: "Sold 1 crate of sweet potatoes at $4", "Bought 3
     crates of mangoes at $2". The bug line goes.
6. **Proved in a production build, on test:**
   - `npm run build`, then `npm run start`, run by Code in the background and stopped by Code;
   - **the browser:** the laptop's Chrome, paired by `fixture -- code`, if the Chrome extension answers; else curl with
     a `fixture -- device` cookie, said at stop 2;
   - **the checks:** the brief's list;
   - **then** `npm run dev:ipad`, started by Code in the background for the look.
7. **Tests,** as the brief lists them, and:
   - the 27 settings: none that the page accepts loses money;
   - a change of tables changes only the prices.
8. **Voice:** the boat's "Read it to me" is made on the first tap, as on test. The wait in the production build goes in
   the report.

**Sentences.**
- **For a child:** none new. The Math tile, its name and every boat sentence are slice 1's, read by June. The log uses
  `BOAT.crates()`, which she read.
- **For the parents:** the boat section's lines and the week page's line, listed at stop 2.

**Rules this touches.**
- **Rule 2:** any guardian turns the switch on or off and sets the tables. The switch is not a blackball, so the other
  guardian can undo either.
- **Rule 5:** no new sentence reaches a child.
- **Rule 7:** the switch and the places name no child. The audit rows carry the setting, never a child.

### The new migration, whole

`supabase/migrations/20261116000001_boat_switch.sql`:

```sql
-- Quark — phase 4, the trading boat, slice 2 (docs/trading-boat-2-slice.md). Additive: the code on live before this
-- slice's release never reads it.
--
-- families.boat_on: the family's switch for the trading boat. Off unless a guardian turns it on at /parent; any
--   guardian turns it on or off (rule 2), written by the server with an audit_log row. While it is on and the
--   family's times tables give the boat its prices, the wall's Math tile, The trading boat, takes Puzzle's place in
--   the day's order and Puzzle's tile is not shown. Off, the wall is as it was, Puzzle in its place. The tables
--   themselves are each child's mastery.place rows on the times-table rungs, set the same for every child.

alter table families
  add column boat_on boolean not null default false;
```

Guardians already have select and update on `families` (`20261010000002`), under `family_isolation`, so it needs no
grant or policy.

### Questions

1. **Take this row ahead of the top of Next, the unique indexes?** Recommended: yes. The brief says you named it. Yes:
   the row moves to *building* and the indexes stay at the top of Next.
2. **The settings that lose money: refuse them on `/parent`?** Recommended: yes.
   - **Yes:** the page saves only settings that keep the promise (A, B and the three odd ones above). It refuses any
     other with "With these tables a crate could sell for less than it cost.", or with "With these tables a rumor pays
     no more than any dock." It says which settings work.
   - **Later:** 6s to 9s, and 3s and 4s *done*, wait for a change to how the usual price is set. That is the next slice
     I would propose, with its own simulation.
   - **Please check** that the tables you gave in the chat are A or B. If they are not, say which, and the boat cannot
     start on them in this slice.
3. **The gap between two careful boys: build nothing to narrow it?** Recommended: yes, as above. The lever, a rumor that
   always pays the top number, is named for later.

Decided by Code, taken with go:
- the tables change at once for both boys, with the one line in `dayOf()`;
- a Puzzle card's address goes back to the wall;
- *Multiply bigger numbers* is not offered;
- the log reads in crates for every count;
- an error reading the switch is off;
- `lib/boat-here.ts` is the one place;
- the production proof in Chrome, or else curl.

**Reply go to take all of these.**
