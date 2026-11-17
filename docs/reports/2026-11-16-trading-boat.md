# Report: the trading boat, slice 1

Brief: `docs/trading-boat-slice.md` (*Wonder Wall*, phase 4), on `phase-4-wonder-wall`. Size: a slice.
- **Times (16 Nov 2026, HST):** started 17:23. Stop 1 at 17:40, its fix round on paper at 18:00, Brandon's go at
  18:05. The emergency stop at 18:29. Stop 2 (*Your look*) at 18:47, then eleven fix rounds at the look. **Closed by
  Brandon's `/wwc:release` at 20:50**, which releases next.
- **The clock:** about three and a half hours, inside the size.
- **The history:** the stops as printed (stop 1 with its numbers, sentences, art list and clean-up list; the emergency
  stop; stop 2 and every fix round) are in this file's history at `fac7647`.

## What could not be checked, and what is not done

- **June's read of the game's sentences: not done** (rule 5: nothing reaches a child unchecked).
  - The game's words are templates in `core/wall/words.ts` (`BOAT`), with no model writing a word, so her one read is
    the check. She played the game on test, which covered most of them.
  - **The ones play did not reach, for her to read:**
    - "That's 6 and 5 put together. You need 6 lots of 5."
    - "Close. One crate out."
    - "Have a guess first. Any guess is fine."
    - "Good catch. Thank you for telling me."
    - "Want to try fewer?" · "Try fewer" · "Want to sell fewer?" · "Sell fewer"
    - "This one is for a person: Ask a grown-up to work it out with you."
    - "That's right, it's $70. You have $60."
    - "That's all the trader has." · "That's all you have." · "One buyer takes 10 at most. Another buyer comes next."
    - "Count up from $20 to $50."
    - the boat builder's six lines;
    - the six rumor reasons.
  - **One sentence can no longer appear:** "How much less did you get back?". A crate always sells for at least what
    it cost.
  - **Becomes:** part of the next slice, proposed below.
- **Stop 3, a boy plays a day on June's iPad: not taken.** It was the parents' choice, and the look ran late into the
  evening. **Becomes:** part of the next slice, before the boat reaches his own iPad.
- **The boat on the boys' iPads: not in this job.** It runs only on the dev server against test. What it takes is the
  next slice, proposed below.
- **The dial on Safari:** checked only by Brandon's hand at the look (fix rounds 10 and 11). Code's Chrome checks
  were read only, so as not to move his games.
- **Not seen: Vercel** with this branch. The release's deploy is read at the release.

## What a release of this branch would and would not change

`phase-4-wonder-wall` is 49 commits ahead of `main` (`e1046ac`) with this close: the third 9 Nov release's records,
the Math tile's 15, week 4's 7, the Next.js job's 7, and this job's 19. A release fast-forwards `main` and deploys it.

**It would not change anything the boys see, or how a card is judged:**
- **The gate:** `core/prompts/gate.md`, `core/curation/gate.ts`, `core/curation/gate-run.ts` and `gate.test.ts` are
  `main`'s, byte for byte (`git diff origin/main` is empty for each). So are the Sunday build (`week.ts`,
  `week-job.ts`, `schedule.ts`, `cards.ts`), the plan (`lib/plan.ts`), `week:build`, the wall's cards and voice
  (`card.ts`, `flow.ts`, `speech.ts`, `speech-ahead.ts`), the week page and the models page. Every card is judged by
  v2, as on live.
- **The trading boat** is off off the dev server. `lib/boat.ts` returns null and reads no table unless `NODE_ENV` is
  development and `QUARK_TARGET` is test. So:
  - the wall's Math tile does not show;
  - `/kid/boat` goes back to the wall;
  - `/api/kid/boat` answers 404, and a boat line sent to the say route answers 404;
  - the log on `/parent` renders nothing.
- **`lib/wall.ts`** asks the test view for "now", which off the dev server is the real time, as on `main`.

**It would carry, unused on live:**
- `plan/math-ladder.yaml` and `ladder:import` (and `:live`), which no live job runs;
- the fixtures (test only);
- `public/boat`'s four pictures;
- four migrations that are on test and not on live: the three of 9 Nov and the boat's. The migrations workflow's live
  job waits on `SUPABASE_DB_URL_LIVE`, which is unset, so a push of `main` applies none of them. Nothing on live reads
  what they add.

## What was built

On `phase-4-wonder-wall`, played on `quark-test`. The as-built is in docs/12, *How the trading boat is built*.

- **The clean-up** (`f5c4370`, pushed before any new code).
  - **Removed:**
    - the Math tile's writer (`core/curation/math.ts`, `core/prompts/math.md`);
    - `checkMath()` and its files (`core/math/check.ts`, `problem.ts`, `samples.ts`, `expr.ts`);
    - the moves and the label (`core/wall/math.ts`, `label.ts`, `core/prompts/label.md`);
    - the math box and the drawn math pictures;
    - `plan/candidates/math-problems.md`.
  - **Back to `main`'s:** the 18 files above.
  - **Kept for the boat:**
    - the ladder (`tablesOf`, with the new `workingTablesOf` and `largestCount`);
    - `core/math/numbers.ts`;
    - the number pad, in `app/kid/number-pad.tsx`;
    - the test view;
    - the no-number judge, with "Good catch. Thank you for telling me.".
  - **Test's math week** was cleared by `npm run fixture -- clear-math`: 56 cards on 7 days, 28 idea rows and 1
    answer.
- **The game** (`core/boat/`, pure):
  - `day.ts`: his numbers from the ladder, a day's markets and rumors, the buyers.
  - `game.ts`: the state, every move, the screen and what "Read it to me" says.
  - `sim.ts`: stop 1's simulation, run as a test.
  - `log.ts`: the parents' log.
  - 30 tests.
- **The server and screens:**
  - `lib/boat.ts` reads and writes for the paired iPad, gives the no-number judge's verdict, and makes "Read it to me"
    in Sulafat, stored by its words.
  - `/kid/boat` (`boat-game.tsx`, `crates.tsx`), with its tile on the wall after the cards.
  - `/api/kid/boat`: POST a move, GET the screen.
  - The say route's `boat.screen` line.
  - *The trading boat (test only)* on `/parent`.
- **The words:** every sentence in `core/wall/words.ts` (`BOAT`, `MATH_NAME`). The wiring test runs them all
  through the effort-words and never-wrong checks.
- **The pictures:** Brandon's four (market-stilts, market-hillside, cast-off, landing) in `public/boat` as WebP at
  1344 × 896, 144 to 223 KB each. The art list is added to `Documents\quark-art\README.txt` under its own heading.
- **The fixtures:**
  - `live`, `clear`, `devices` and `places` (without the style), kept from the Math tile;
  - `clear-math`;
  - `boat <n> [money <m> | reset | log]`.

**The numbers, as built:**
- **His buying prices** are the times tables he is working on: Kiddo $2 and $5, Bug $3 and $4. The usual price is $5
  and $4.
- **A rumor** is at least $1 over the usual.
- **Stock and buyers:** each trader has 2 to 10 crates of a good, and a buyer takes up to 10. No sum holds more than
  10 until bigger multiplying.
- **The boats:** 4, 15 and 40 hundred-dollar bills; more than 10 bills is paid in bundles.
- **The simulation test holds the evidence:**
  - a careful boy has the double canoe on day 6 to 9 (Kiddo) or 7 to 11 (Bug);
  - most of his working facts a week from the second week (Kiddo 22 of 30 and Bug 16 of 20 in week 2, with buyers
    taking a whole load);
  - no repeated best purchase;
  - a careless player never loses money.

## Your look: Brandon's words

**`/wwc:release` at *Your look*, 20:50: every check passed.** Before it: "okay, i think we're there. this is much
better."

The checks are as written in the brief's stop 2, on June's iPad as Bug and as Kiddo, and on `/parent`.

**Passed in his own words along the way:**
- "Yes, never mind works perfectly now."
- "it only gave me 3 intermediate problems not 10, so much better."

**The fix rounds**, each committed, pushed and tested; his words are quoted in docs/08, *The trading boat, slice 1*:
1. **His four pictures in** (18:53).
2. **The trade screen laid out again** (19:21): "This screen layout seems a little weird."
3. **One question at a time during the count** (19:25): "Do I answer the top one or the bottom?"
4. **The landing says why a buyer stops** (19:32): "It only let me sell 3 for some reason."
5. **A buyer takes the whole load, up to 10** (19:34): "5 pineapples is not a lot of pineapples."
6. **The count goes two at a time again after a missed step, and takes the whole total at any step** (19:35): "I'm
   currently stuck adding 2 at a time".
7. **The trade is a row on the market screen** (19:46). This came after "Or maybe, boring?", the calculator trading
   game ("everyone understood it") and "we're going to fix it".
8. **"Never mind", and tapping the good again** (about 19:52): "There is no way back from this screen."
9. **How many typed on the number pad** (about 20:00): "If I want to buy 25 bananas I need to press 25 times?"
10. **A straight dial** (about 20:02): "How about a dial instead?", then his choice of straight.
11. **The dial holds still** (about 20:10): "Dynamic sizing of the numbers causes the slider to jump down and up like
    crazy."

**Before the look, from Code's own check through the dev server:** the page kept every screen's "Read it to me",
because three parts shared one key. Fixed in `f62f595`.

## The emergency stop (18:29), and how it ended

The Next.js job's `npm run dev:ipad` (16:16) was still running.
- **What went wrong:** after a production build ran beside it, its API routes served code from before the clean-up
  ("workingTablesOf is not a function").
- **Why it needed Brandon:** stopping it was refused to Code.
- **How it ended:**
  - Brandon stopped it with `! taskkill //PID 22840 //T //F`, after a first try with single slashes failed in Git Bash
    (Code's mistake).
  - His "go, and clear .next first" followed. `.next` was cleared, the build ran clean, and the dev server was started
    again.

Both causes are bug lines in docs/08.

## Migrations

`20261116000000_trading_boat` (`boat_games`, `boat_turns`; guardians read, the server writes) was pushed with the game
and applied to test by `.github/workflows/migrations.yml`: run **44017188011, green**, "Applying migration
20261116000000_trading_boat.sql... Finished supabase db push." Its live job did nothing. **Not on live.** No migration
was deleted or reversed.

**Left in place on test, unused after the clean-up:**
- `children.math_style`;
- `families.familiar`;
- `attempts.move` and `attempts.label`;
- `attempts.verdict`'s `questioned` and `no_number`;
- `model_runs.kind` `label`.

The ladder's `skills` columns and `mastery.place` are used by the boat.

## On live, money, a child

- **Live: nothing.** No command touched the live database, and no migration reached it.
- **Money:**
  - two no-number judge calls on Haiku, about $0.0004, in `model_runs` on test;
  - a few lines of Google's voice, inside the free tier;
  - no model writes a problem, so a day of play spends nothing else.
- **A child: nothing on live changed.** On test, the boat was played on June's iPad (paired as Bug, switched to Kiddo
  by the test view's bar).
- **Rule 7:** `boat_games` and `boat_turns` hold no name and nothing about the family. The answers a child types are
  kept for the parents, as on the cards.
- **Rule 4:** no prize, point, streak or timer. The boats are the game's world, bought with its money. Nothing moves
  or makes a sound by itself.
- **Rule 3:** the answer is never shown. The count's last step is his, and with nothing fewer the sum goes to a
  grown-up.
- **Rule 5:** the sentences are templates, with no gate call. June's read is open, above.
- **The public repository** names no child. Kiddo and Bug are test's invented children. The four pictures are now
  public.

## Test, as left

- Both test children's games are as Brandon left them at the look:
  - Kiddo on day 1 at the village market, his canoe full of mangoes;
  - Bug on day 3 at the village market on Lānaʻi, with $74, 6 crates of bananas and 4 of taro.
- `npm run fixture -- boat <n> reset` starts either over.
- June's iPad stays paired as Bug, and the laptop's Chrome as Kiddo. Code's check device is forgotten.
- **The iPad dev server is stopped** (this close). Run `npm run dev:ipad` to play again.

## What you now do differently

- **On test, the wall has a Math tile, *The trading boat*,** after the cards. It shows only on the dev server against
  test (`npm run dev:ipad`), with the test view's bar to switch the child and the day.
- **New fixtures:**
  - `npm run fixture -- boat 2 money 500` sets a child's money;
  - `boat 2 reset` starts his game over;
  - `boat 2 log` prints his log as `/parent` shows it.
- **A Windows command in a `!` line needs doubled slashes** in this shell: `taskkill //PID … //T //F`.

## Beyond the brief

- **Built inside the brief's screens, from your looks:**
  - the trade as a row on the market screen;
  - the dial;
  - "Never mind";
  - the count's way out (the whole total at any step).
- **Found and fixed before the look:** duplicate keys kept every screen's "Read it to me".
- **`GET /api/kid/boat`:** the screen as it stands, with no move. It was used to check a landing without playing it.
- **For you to decide, not changed:**
  - **The board's *The Math tile, slice 2* row** (later) names the label choosing the next move, which is gone. Its
    other half, the ladder moving by his results and the parents' page showing where each boy stands, still fits the
    boat.
  - ***The tutor does the math moves in its own live words*** (later, *The tutor*) names moves that are gone.
- **The 9 Nov decision gave Math the Puzzle slot.** On test the boat is a sixth tile. Which it is on live is the next
  slice's question.

## Slices for Wonder Wall

One slice, after this one (the project's slices: 9 becomes 10, with the Math tile's slice 1 closed as replaced):
1. **The trading boat, slice 2: on the boys' iPads.**
   - June reads the sentences (the list above), and a boy plays a day on test with a parent beside him.
   - Then, by your hand at stops: the four migrations on live, the ladder and each boy's places on live, and a switch
     that turns the boat on for the family.
   - The Puzzle slot or a sixth tile, your call.
   - The log's grammar fix.

Reply yes to add it.

## Records

- `CLAUDE.md`: *Where we are*, a new lead and this job's bullet; the Math tile and gate lines brought up to date.
- `README.md`: the status line's math sentence.
- `docs/12-teaching-that-tests-itself.md`: *How the trading boat is built*, in place of the Math tile's section.
- `docs/04-curation-engine.md`: *No math in the week*, in place of "The Math tile, built and off".
- `docs/08-open-questions.md`:
  - *The trading boat, slice 1* (the decisions, a note, what is open);
  - a replaced line under *The Math tile, slice 1*;
  - three bug lines.
- `docs/math-tutor-proposal.md`: the line at its top.
- `docs/board.md`:
  - this row to *on hold*, waiting on the next release, which moves it to *live*;
  - the Math tile's slice 1 row closed as replaced;
  - the art's home is in this row's Where.
- The board page is rebuilt.
- `Documents\quark-art\README.txt`: the picture list, added under its own heading.
- `core/wall/words.ts`: every sentence, named above for June.

## Commits

On `phase-4-wonder-wall`:
- `45bb7fb` go;
- `f5c4370` the clean-up;
- `cf27641` the game and its migration;
- `ff79913` the emergency stop;
- `f62f595` the dev server check;
- `deed71e` stop 2;
- the fix rounds: `a281351`, `f6ece0c`, `8337f42`, `a3787fc`, `076101b`, `266ba7a`, `ee20d74` (the release check),
  `e496d0e`, `b40cd58`, `c4eb455`, `d1f8d81`, `fac7647`;
- this close.

cost: not read
