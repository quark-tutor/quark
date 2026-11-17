# Report: the trading boat, slice 2, on the boys' iPads

Brief: `docs/trading-boat-2-slice.md` (*Wonder Wall*, phase 4), on `phase-4-wonder-wall`. Size: a job.
- **Times (16 Nov 2026, HST):** started 21:30. Stop 1 at 21:40. **Go at 21:45:** "go. On 3: luck alone. That way
  they can't copy off each other but they both have a chance to win." Stop 2 at 21:58.
- **17 Nov 2026:**
  - **Fix round 1, 04:45 to 04:58:** the look failed on the brief, brought by the chat, quoting Brandon: "we need to
    have code undo the switch, and release the math trading game in place of the puzzle, that was the decision."
  - **Fix round 2, 05:17 to 05:22:** the look failed on (b), by Brandon's decision: "high luck on day 1 will give one
    child an overwhelming lead. fix the first 3 days of the simulation, then luck after that."
  - **The look passed at 06:26:** "It passed. go". Stop 3 at 06:28. Stop 3 was in at 07:45.
  - **Closed by Brandon's `/wwc:release` at 07:45**, which releases next.
- **The clock:** about 1 hour 50 minutes of work over the two days (21:30 to 21:58, then 04:45 to 07:45, most of it
  waiting at stops), inside the size.
- **The history:** the stops as printed (stop 1 with its simulation, plan and questions; stop 2 and its two fix
  rounds; stop 3 with M1 to M3's lines) are in this file's history at `c93dc1f`.

## What could not be checked, and what is not done

- **The boat on the boys' iPads is not seen yet.** It reaches their walls only when Vercel deploys the release. Code
  cannot read live. M3's read-back, by Brandon's hand, said "The trading boat is on the wall, in Puzzle's place."
  Each boy's first day is on his own iPad with a parent beside him (the brief's *After the release*); what they see
  goes to the chat in Brandon's words.
- **`/parent`'s section, as it now stands with no switch, has been seen by no one in a browser.**
  - Code's production checks used curl, which has no guardian's sign-in.
  - The first look's `/parent` checks were set aside when the look failed on the brief, and fix rounds 1 and 2's
    looks asked for no sign-in.
  - The section, the save and its refusals are held by the tests, the typecheck and the build. The same goes for the
    week page's sentence.
  - The first time a guardian opens live's `/parent` after the release is the first sight of it.
- **The brief's checks 5, 6 and 7 were not taken by Brandon.** The fix rounds replaced the brief's eight checks with
  their own: the two of fix round 1, then the one of fix round 2. The three are dropped, each held another way:
  - **5, Math moves with the rotation:** a test puts the Math tile at Puzzle's index on five days.
  - **6, a change of tables changes both boys' prices:** a test over 40 seeds holds that only the prices change. Both
    boys read the same rows at every request, and fix round 1's production proof saw a change of tables take the boat
    off and put it back at once.
  - **7, the log in crates:** a test of the log's singular and plural, and the first round's production proof read
    "Bought 3 crates of sweet potatoes at $5" through the page's own `dayLogs()`.
- **The trade and "Read it to me" were proved once,** in the first round's production build. Fix round 1 did not
  change the game. Fix round 2 changed only how a day is drawn, and its proof read day 1's market for both children.
- **Fix round 2 redraws every game day** under the same rules. Test's games were started over, and live had none, so
  no game in play changed.
- **Not done, nothing open:** every brief check is taken or dropped above. The proposed slices below wait for your
  yes.

## What was built

**No switch** (fix round 1, 17 Nov). `boatHere()` in `lib/boat-here.ts` is the one place that asks whether the boat is
here.
- **Here:** the family's times tables give the child prices that lose no money (`numbersProblem()`). Then the Math
  tile, *The trading boat*, stands where Puzzle falls in the day's order, and Puzzle's tile is not shown.
- **Not here:** with no table working on or done, or with a fault (one log line naming no child). The wall is then
  as the boys have it today.
- **Who asks:** `lib/boat.ts` asks it before every read and write, and `lib/wall.ts` for the Puzzle slot, so the
  wall, the card pages, the boat and its routes agree. The test view's bar no longer decides it.
- **Gone:** `families.boat_on` (dropped by a migration), `setBoat()`, the switch's button and its three states, and
  `fixture -- switch`. A test holds that no file in `app`, `lib`, `core` or `scripts` names them.

**One setting of the times tables for the family.**
- **Where:** on `/parent`, the section *The trading boat* (`app/parent/boat-section.tsx`, `boat-tables.tsx`,
  `setBoatTables()`); or `npm run boat:tables` and `boat:tables:live` (`scripts/boat-tables.mts`).
- **What it writes:** the same `mastery.place` on the three times-table rungs for every child, with a `boat.tables`
  audit row.
- **What it saves:** 7 of the 27 settings. The 6 that keep the promise (held by a test over 10 seeds, 10 days and 7
  islands), and every table at *Not yet*, which is how the boat comes off. The rest are refused in plain words, and
  the command says "Refused: …" and "Nothing was written."
- **The page** says where the boat stands and the prices in words (`lib/boat-setting.ts`).
- **A change of tables** reaches both boys on the next screen either opens. Only the prices change: `dayOf()` always
  takes the rumor's draw.

**The family's first three days** (fix round 2, 17 Nov).
- **The rule:** game days 1 to 3 are drawn from the family and the day number, the same for both boys (`SHARED_DAYS`,
  `seedOf()` in `core/boat/day.ts`; `roll()` and `dayFor()` in `core/boat/game.ts`). From day 4, each boy's own seed.
  A game day is a day played.
- **Beyond the letter:** where a rumor points is now its own draw, so where a boy stands changes only a rumor's island
  on a shared day, never the goods, crates or prices.
- **The gap between two careful boys** (2,000 pairs, `play()` in `core/boat/sim.ts`):

  | | Day 3 | Day 7 | Day 14 |
  |---|---|---|---|
  | 2s, 5s and 10s done, 3s and 4s working on: before | 29% more (78% at 9 in 10) | 17% (47%) | 14% (42%) |
  | the same: after | level | 14% (35%) | 13% (36%) |
  | 2s, 5s and 10s working on: before | 9% (25%) | 4% (12%) | 4% (10%) |
  | the same: after | level | 3% (7%) | 3% (8%) |

  The island draw alone, with no shared days, gives the same odds as before, within noise.

**Kept as built at the first round:** the Puzzle slot (`hide: ["puzzle"]` in the wall's scope, `boatAt`); a Puzzle
card's address goes back to the wall, and its answer and "Read it to me" answer 404; equal prices from one setting;
the log on `/parent` in crates ("Sold 1 crate of sweet potatoes at $4"; the 16 Nov bug line is deleted); the week
page's sentence; `dayOf()`'s rumor draw.

**Tests:** 523 in 43 files (497 before the job), typecheck and build clean, at fix round 2's commit `8727d94`. The
new ones cover: a fault counts as no boat; all 27 settings; equal places give equal prices; a change of tables changes
only prices; the Math tile at Puzzle's index on five days; a Puzzle card refused while the boat is here; the log's
grammar; the setting written and read back the same; no switch left in the code; the family's first three days (two
children of one family identical on days 1 to 3 on every pair of islands, their own from day 4, another family's
different, a later start still on the family's day 1).

## Your look: Brandon's words

- **Stop 2, 16 Nov 21:58:** eight checks, in the brief's words, with the switch.
- **Failed on the brief, 17 Nov** (brought by the chat): "we need to have code undo the switch, and release the math
  trading game in place of the puzzle, that was the decision." **The fix:** the switch removed and its column dropped;
  the boat here whenever the tables give prices; the `boat:tables` command; test's tables set to 2s, 5s and 10s done
  and 3s and 4s working on. The new look, on June's iPad with no sign-in:
  - (a) today's wall shows *The trading boat* where Puzzle goes, the game approved on 16 Nov;
  - (b) as Bug and as Kiddo, the prices are the same numbers.
- **Failed on (b), 17 Nov, by Brandon's decision:** "high luck on day 1 will give one child an overwhelming lead. fix
  the first 3 days of the simulation, then luck after that." **The fix:** the family's first three days. The new look:
  as Bug and as Kiddo, day 1's harbor market shows the same goods, prices, crates and rumor.
- **Passed, 17 Nov 06:26:** "It passed. go". Then `/wwc:release` at 07:45 at the last stop.

## My checks: the production builds, on test

Each round was proved with `npm run build` and `npm run start` against test, with no dev server running. Test's
children 1 and 2 were paired through `/api/kid/pair`, by curl; the Chrome extension was not connected. Their cookies
stayed in jar files that were never printed, and were deleted after. Each check device was forgotten after.
- **The first round, with the switch:**
  - off: the wall without Math, `/api/kid/boat` 404, `/kid/boat` back to the wall;
  - on: Math in Puzzle's place, and no test-view bar;
  - a trade: a wrong 8 got "That's 3 and 5 put together. You need 3 lots of 5."; 15 got "That's right."
  - "Read it to me": 8.1 seconds on the first tap, made and stored, then 0.8 seconds;
  - off again: the game kept.
- **Fix round 1, with no switch:**
  - today's wall read Listen, Then, Math (*The trading boat*), Look, Wonder for both children, with no Puzzle tile;
  - both had $3 and $4 to buy and $4 at any dock, with their own goods and rumors;
  - `boat:tables -- none` put Puzzle back, with `/api/kid/boat` 404;
  - set again, child 1's game was where he left it.
- **Fix round 2:** both children's day 1 harbor market was identical, word for word:
  - pineapples $3 (4 crates), mangoes $3 (10), sweet potatoes $4 (4), taro $3 (10);
  - "Every dock pays $4 a crate for anything";
  - the same rumor.
- **No error** in the server's log in any round.

## Migrations

- **On test, from this branch:**
  - `20261116000001_boat_switch` (`families.boat_on`), run 44041186215, green;
  - `20261117000000_boat_switch_gone` (`alter table families drop column boat_on;`, Brandon's yes in the chat), run
    44107585185, green.

  Each run's live job found no secret and did nothing.
- **On live, M1 by Brandon's hand (17 Nov):**
  - the first run, at 07:25, changed nothing. The Supabase CLI, fetched new by `npx` as 3.2.0, refused with no
    `--yes`: "This run can't ask because it is running in agent mode. Nothing was changed.";
  - `npm run db:push:live -- --yes` applied the six, in order: `20261109000000_math_tile`, `…0001_math_questioned`,
    `…0002_family_familiar`, `20261116000000_trading_boat`, `20261116000001_boat_switch` and
    `20261117000000_boat_switch_gone`. It ended "Finished supabase db push.", with no error.
- **Their green runs on test:** 42757383298, 42765079572 and 42765695820 (the Math tile, 9 and 10 Nov);
  44017188011 (the boat, 16 Nov); and this job's two.

## On live, money, a child

- **Live, by Brandon's hand at stop 3, 17 Nov:**
  - M1, the six migrations;
  - M2 `ladder:import:live`, "The math ladder: 14 rungs and 6 everyday areas, 20 rows in skills.";
  - M3 `boat:tables:live`, the family's tables, Brandon's value from the chat, read back for the family's 2 children.
    Its printout is not copied here.

  The code on Vercel reads none of it until the release.
- **Money:** no Anthropic money. Google's voice made one boat line on test, inside the free tier.
- **A child:** nothing on live changed yet. The release puts the boat on both boys' walls, in Puzzle's place, on the
  next screen each opens.
- **Rule 2:** any guardian sets the tables, and any guardian can take the boat off. It is not a blackball.
- **Rule 4:** no prize, point, streak or timer is added. The boat replaces Puzzle and is not a sixth tile.
- **Rule 5:** no sentence for a child is new or changed. June's read of the game's sentences (16 Nov) stands.
- **Rule 7:** the tables, the audit rows and the log's lines name no child. The command counts the children.
- **The public repository** names no child, and holds neither live's tables nor M3's printout.

## Sentences for the parents (new or changed on `/parent`)

- "Math as a trading game, in Puzzle's place on the wall: each child buys crates at the markets and tells the trader
  what they owe. Every child gets the same prices, from the times tables below; each has their own markets and
  rumors."
- **Where the boat stands, one of three:**
  - "The trading boat is on the wall, in Puzzle's place."
  - "The trading boat is not on the wall: no times table is working on or done, so the wall shows Puzzle."
  - "The trading boat is not on the wall: these times tables give it no prices that work, so the wall shows Puzzle."
- "One setting for the family. Every child's prices come from it. To take the boat off the wall, set every table to
  not yet: Puzzle is back at once, and each child's game waits where they left it."
- **The prices,** for example "Buying prices $3 and $4. Every dock pays $4 a crate for anything. A rumor pays $5 or
  $10 a crate."
- **The refusals,** "With these tables a crate could sell for less than it cost…" and "…a rumor pays no more than any
  dock…", with the settings that work.
- "The math ladder isn't loaded on this copy of Quark yet, so the wall shows Puzzle."
- **On the week page:** "While the trading boat is on the wall, it takes Puzzle's place, and the Puzzle cards below
  are not shown."

## Test, as left

- **The tables:** both test children at 2s, 5s and 10s done and 3s and 4s working on.
- **Today's cards:** today (17 Nov) holds 9 Nov's 40 passed cards (`fixture -- today 2026-11-09`), and 9 Nov has none.
- **The games:** both as Brandon left them at the look, after being started over for it. `npm run fixture -- boat <n>
  reset` starts either over.
- **June's iPad** stays paired as Bug. Code's check devices are forgotten.
- **The iPad dev server is stopped** (this close). Run `npm run dev:ipad` to play again.

## What you now do differently

- **There is no switch.** The boat is on both boys' walls, in Puzzle's place, while the family's times tables give it
  prices.
- **To take it off:** on live's `/parent`, *The trading boat*, set every table to *Not yet*, then *Save the times
  tables*. Any guardian, from any device. Or `npm run boat:tables:live -- none`. Puzzle is back on the next screen,
  and each boy's game waits where he left it. Set the tables again to put it back.
- **To change the tables:** the same section, or `npm run boat:tables:live -- times-2-5-10=done times-3-4=working`
  (each `done`, `working` or `not-yet`; a table not named is not yet). With no words it prints the setting now. It
  refuses a setting that loses money.
- **`db:push:live` now needs `-- --yes`**, since the Supabase CLI fetched today (3.2.0) refuses without it (a bug line).
- **A command handed for `!` comes whole** from now on, with no `<…>` left in it (a bug line).

## Beyond the brief

- **`/parent` saves every table at *Not yet*** as the boat off. With no switch, it is the only way off.
- **Where a rumor points is its own draw** (fix round 2), so that a shared day stays shared wherever a boy stands.
- **The `boat:tables` command** was asked by fix round 1. Its plain refusals were left out of fix round 1's commits
  and committed in fix round 2 (`37444a1`).
- **Found, not built** (each for you to take or drop):
  - **The next tables lose money.** 3s and 4s *done* with 2s, 5s and 10s, and any setting with 6s to 9s *working*,
    let a crate sell under its cost, because the usual price is the first number above the lowest buying price. The
    boat cannot move up from 3s and 4s working on until the usual price is set another way (proposed below).
  - **The Sunday build still makes seven Puzzle cards a week** that the boys will not open, about $2.80 of a week's
    $14 and 7 of Saturday's 28 picks (the brief's *Not in this job*; proposed below).
  - **The lever for the gap,** a rumor that always pays the top number, is named for later, not proposed.
  - **Four bug lines,** in docs/08: `db:push:live`'s `--yes`; the CLI unpinned, with `--db-url` going in v4; a `!`
    command handed with placeholders; a `next` process left holding port 3000 after its task stopped.

## Slices for Wonder Wall

Two new slices, and one reworded. The project's slices still to build are 6, and become 8:
1. **The Sunday build without Puzzle, and the Saturday pick's count:** while the boat is here, the week is built with
   no Puzzle cards and 7 fewer short lessons. After the boys have played a week. A job.
2. **The trading boat, slice 3: the next tables:** the usual price set so that 3s and 4s *done*, and 6s to 9s, keep
   the promise that no choice loses money, with its own simulation. When the boys are ready for them. A job.
3. **The Math tile, slice 2, reworded for the boat:** *The trading boat: where each boy stands*. The parents' page shows
   which facts of the working tables each boy has met and got right at the first try, beside his grade, so the
   parents know when to move the family's tables. The label and moves of the old wording are gone, and the family
   keeps one setting, since the prices are equal. A job.

Reply yes to add them.

## Records

- `docs/12-teaching-that-tests-itself.md`: *How the trading boat is built* is now the whole boat, with a new
  subsection, "Slice 2: on the boys' iPads". The prices are the family's, and the record is on live.
- `docs/08-open-questions.md`:
  - a new section, *The trading boat, slice 2* (the decisions, dated, with what each replaces);
  - slice 1's open lines marked settled;
  - the fixed log line deleted, the 23 Oct `db:push:live` line replaced, and four bug lines added.
- `docs/04-curation-engine.md`: *No math in the week* and *The pages* say the boat takes Puzzle's place on the wall,
  and that the week is built as before.
- `docs/03-touch-points.md`: the wall's five cards, with the boat in Puzzle's place.
- `CLAUDE.md`: *Where we are*, a new lead and this job's bullet; the Next list's last line.
- `README.md`: the status line's math sentence.
- `docs/board.md`: this row to *on hold*, waiting on the next release, which moves it to *live*. Wonder Wall slice 2
  is already the project's row at *next*, so no row moves up.
- The board page is rebuilt.

## Commits

On `phase-4-wonder-wall`:
- `3dd9129` go;
- `a9712cf` the switch's migration, `d63f5d2` the build, `309f7d8` stop 2;
- fix round 1: `38c599c` no switch, `5234be8` the column dropped, `d617750` the stop;
- fix round 2: `8727d94` the family's first three days, `37444a1` the command's plain refusals, `6366462` the stop;
- stop 3: `fe218b5`, `04e7cce`, `085e35a`, `eac91ea`, `7f360ec`, `c93dc1f`;
- this close.

cost: not read
