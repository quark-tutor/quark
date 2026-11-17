# Report: the trading boat, slice 2, on the boys' iPads

Brief: `docs/trading-boat-2-slice.md` (*Wonder Wall*, phase 4), on `phase-4-wonder-wall`. Size: a job.
- **Times (16 Nov 2026, HST):** started 21:30. Stop 1 at 21:40. **Go at 21:45:** "go. On 3: luck alone. That way
  they can't copy off each other but they both have a chance to win." Go took every recommendation and decision below.
  On question 3, luck alone: nothing narrows the gap. The tables Brandon gave in the chat were not named at go, so
  whether they are setting A or B is seen at the tap on live (question 2).

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
