# Brief: the trading boat, one playable day (math, a second try)

**Phase 4, on `phase-4-wonder-wall`.** Drafted 16 November 2026 in the chat, 16:20, from Brandon's thinking of 10
and 16 November. Board row: "The trading boat, slice 1" (*next*, under *Wonder Wall*). It answers the Math tile's
failed look (`docs/reports/2026-11-09-math-tile.md`). **Status: ready.**

**Size:** a slice. **Test only: nothing goes to live, nothing is released, math stays off.** The job starts by
clearing out the Math tile's failed parts, and ends with a day Brandon, June and (if they choose) a boy can play on
June's iPad.

## Why

The Math tile's look failed on 10 November: the problems were cluttered, had no pictures, and met a wrong answer
with "How did you get that?". Brandon then took the problem apart (10 November):

- A word problem is three leaps at once: things become numbers, the situation becomes an operation, the sum is
  solved. The card asked for all three and could not tell which one failed.
- "Roughly right beats exactly wrong almost always." And advanced math gives credit for the work; a single answer
  box has no place for *about* or *almost*.
- "Why am I dividing? I guess this is something the teacher wants. Not: I need to divide to split pancakes fairly."
- Children who are drilled extensively "crack in real world situations": practice goes to the last leap, and life
  tests the first two.
- What worked at home was a game. Monopoly: "The first time we played both children had no idea what they were
  doing. By the third time we played they could count our money and tell me how much to give back." The child
  "tells me how much he wants back."
- A trading game does this for multiplication: "Buy 150 at $4? You better have $600 on you."
- "The best part of the boat game is its day to day nature. They may only be able to visit two or three local
  markets a day, then they have to cast their boat off to a faraway island. Then they're done until the next day."

**And the old math code goes.** On 16 November the held Math tile stopped a release: its change to the gate's
prompt made the gate stricter on cards that are not math (`docs/reports/2026-11-16-next-16-4-5.md`), so the Next.js
fix had to go out alone, around the branch. Brandon, 16 November, 16:40: "yeah the math code didn't work. can we
scrap it?" Yes: what failed is removed, and only the tools the boat uses are kept.

So math becomes a game in which **the sum is the move**: a child with money, a boat and a rumor decides what to buy
and how many, and tells the trader what he owes.

## Stops

1. **After reading: the game on one page, before any code.** Code writes into the report, for Brandon and June:
   - the day, step by step, as a child meets it;
   - **the numbers**: each child's prices, the starting money, each boat's size and price, and a table from a
     simulation of 30 days for a careful player and a careless one (money by day, the day each boat is reached),
     so the upgrade prices are chosen from evidence;
   - **every sentence the game says**, whole, for June to read;
   - **the art list**: each picture Brandon would make in Midjourney (what it shows, where it is used, its shape
     and size), so he can make them while Code builds;
   - **the clean-up list**, file by file: what is removed, what is kept and why the boat needs it, and which
     database columns on test are left in place unused (*The clean-up*, below);
   - anything this brief and the records cannot settle, with its recommended answer.
   "go" takes them all; anything Brandon dislikes is named, and that is a fix round on paper.
2. **Your look, on June's iPad, on test**, as Bug and then as Kiddo (the test view's bar), each its own check:
   - **Where:** the wall, the Math tile. **Do / See:**
     1. A market shows goods and prices, your money, your boat's space, and one rumor. Nothing tells you what to
        buy or how many. Pass □ Fail □
     2. Pick a good and a number: the picture shows exactly that many crates, each with its price, and the sum is
        written beside the question ("6 × $5 = ?"). Pass □ Fail □
     3. Give the right total: the money goes down, the crates are on the boat, and you can buy again. Pass □ Fail □
     4. Give the two numbers added together: the reply says so, and the crates light up to count. Give a total one
        crate out: the reply says you are close. Give something else: the count begins at once. No reply asks how
        you got it. Pass □ Fail □
     5. Ask for more than you can pay for, with the right total: the trader agrees with the sum and says you are
        short. Pass □ Fail □
     6. Ask for more than the boat holds: it will not let the number go past the space left. Pass □ Fail □
     7. After the last market, cast off: the day is over, the tile is done, and nothing more can be played today.
        Pass □ Fail □
     8. Move the test view to tomorrow: you land where the rumor pointed, the price there is what the rumor
        promised, with its reason, and you tell the buyer what you are owed. Pass □ Fail □
     9. Skip a day in the test view, then come back: the boat is where you left it and nothing is lost. Pass □ Fail □
     10. As Kiddo and as Bug the prices are different numbers; the game is the same. Pass □ Fail □
     11. Reach the first boat's price (Code gives a test command that sets the money): the bigger boat is offered,
         and buying it asks for its sum. Pass □ Fail □
   - **Where:** `/parent` on the dev server, as the test guardian. **See:** each day's trades for each child: what
     he bought and sold, every sum, whether it was right at once or which help he needed, and each wrong answer
     with its kind. Pass □ Fail □
3. **A boy plays, if Brandon and June choose** (recommended): one of the boys plays one day on June's iPad, on
   test, with a parent beside him. This is the first time a child uses a test device, so it is their decision
   alone. Brandon tells the session what he saw, in his own words.
4. **`/wwc:close`** (close and hold: nothing is released). The next job is proposed in the report from what the
   looks found.

## Decided already (Brandon, 9 to 16 November 2026; do not reopen)

- **The child chooses.** "we shouldn't tell the children how many of something they want. the whole point is they
  have money and there is a salesman and they've got some rumors that what is for sale here is expensive somewhere
  else. then they choose how many they want to buy, and have to give the correct dollar value." (16 November)
- **Rumors are "always true for the first couple of weeks."** (16 November)
- **Selling asks for the sum too**: he tells the buyer what he is owed. (16 November)
- **The boat has a limit, and it grows**: "start at 10, once they hit some amount of money they can upgrade their
  boat." The largest holds 100. (16 November)
- **A day is two or three markets, then the boat casts off** for a far island, and he is done until tomorrow. (10
  November)
- **"Nothing lost for waiting at the dock."** A missed day costs nothing and nothing nags. (10 November)
- **Each boy plays the same game on his own numbers**; neither sees a level. (10 November)
- **The written sum sits beside the words from the start**: "this is still math. The written format should be there
  from the start to accompany the words." (9 November)
- **A picture of exactly what is in the sum, and nothing else on the page.** Help starts at once on a wrong answer.
  "How did you get that?" is not said. (10 November)
- **Math takes the Puzzle slot** when it goes to live (9 November). Not in this job.
- **No prizes, points, streaks or timers** (rule 4). The bigger boat is part of the game's world, bought with the
  game's money.
- **Pictures:** Brandon makes the scenes, traders, islands, boats and goods in Midjourney. Anything a child counts
  is drawn by the program, so the count is always exact.

## The clean-up (first, on go, in its own commits, before any new code)

**Removed, because the look failed on them:**
- the written problems: `core/prompts/math.md`, the writer and `planMath()` in `core/curation/math.ts`,
  `checkMath()` and what serves only it in `core/math/` (`check.ts`, `problem.ts`, `samples.ts`),
  `plan/candidates/math-problems.md`;
- the moves: "How did you get that?", the other wordings, the steps, the tie, "So far:", "How do you know?", and the
  label on what he said (`core/wall/label.ts`, `label.md`), with their lines in `words.ts` and the nightly lines;
- the Sunday build's math: the math paths in `week.ts` and `week-job.ts`, `week:build --math` and `--math-only`,
  `MATH_FROM_WEEK` and `MATH_FROM_SEQUENCE`, the week page's math problems, the math fixtures;
- **the gate's changes, all of them:** `gate.md`, the list of rule names, and what `gate.ts` and `gate-run.ts` send
  go back to exactly what `main` has. Prove it by diff against `main`, and say so in the report. No card is judged
  by anything but `main`'s gate after this;
- the family's places-and-things list and `children.math_style`, as used by code;
- test's math week: its cards cleared from the test database.

**Kept, because the boat uses them** (Code confirms each at stop 1, and drops any the boat turns out not to need):
- the ladder (`plan/math-ladder.yaml`, `lib/ladder.ts`, `ladder:import`) and a child's place (`mastery.place`);
- the number pad and the reading of a number (`core/math/numbers.ts`); the written sum (`expr.ts`, `sumLine`,
  `sumSpoken`); the drawn pictures (`app/kid/math-picture.tsx`);
- the test view's bar (`lib/dev-view.ts`, `app/kid/dev-bar.tsx`, `app/kid/dev/route.ts`);
- the reply to a child who says something is missing or wrong ("Good catch. Thank you for telling me.") and to "I
  don't know", with the judge that reads a reply with no number.

**The database:** no migration is deleted or reversed (test has them applied). Columns nothing reads any more are
left in place and named in the report.

**The test of the clean-up:** `npm test`, `npm run typecheck`, `npm run build`; and for everything that is not the
boat, the branch behaves as `main` does, so a later release of this branch changes nothing the boys see and nothing
about how a card is judged. The report says what a release would and would not change, as the 10 November close
did.

## What is built (the chat's recommendations; stop 1's "go" takes them or changes them)

1. **The day.** He lands where yesterday's boat was sent and **sells** what he carried (one stop), then visits
   **two markets to buy** (prices differ between them), then **casts off** toward the island a rumor named. The
   first day starts at home with money and an empty canoe.
2. **The numbers come from his place on the ladder.** Every price he meets is a number whose times table he has
   done or is working on (`plan/math-ladder.yaml`, `mastery.place`): for a child working on 2s, 5s and 10s, prices
   are $2, $5 and $10; for a child working on 3s and 4s, $3 and $4 with $2, $5 and $10. A good bought at one price
   sells at a higher one from the same set. With a 10-crate canoe every sum stays inside his tables; bigger boats
   bring bigger sums when he has earned them.
3. **Made by the program, not by a model.** Markets, prices, rumors and results are worked out in code from the
   child, the day and his place, and are the same if the page is opened twice. No model writes a problem, so no
   answer can be wrong and no clutter can appear. Every sentence is a template in `core/wall/words.ts`, read once
   by June (rule 5): no gate call, and nothing spent each day.
4. **The market screen**, as the chat's mock (16 November): the place, his money, his boat's space and cargo, one
   rumor, the goods with prices; he picks a good and a number; the crates are drawn, each with its price; "How much
   do you owe the trader?" with the sum written beside it; the number pad, typing and Talk, read by
   `core/math/numbers.ts`.
5. **What a wrong answer gets**, at once:
   - the two numbers added: "That's 6 and 5 put together. You need 6 lots of 5." then the count;
   - one crate out: "Close. One crate out." then the count;
   - anything else: the count. The crates light up two at a time and he says the total so far, step by step.
   - **He is never blocked and never loses money for a wrong sum.** If the count does not get him there, the trader
     offers a smaller load ("Want to try fewer?"), so he can pick a number he can work out. The last step's answer
     is never shown (rule 3). The only cost in the game comes from his own choices.
   - "I don't know" and a questioned problem are answered as the Math tile's last round left them ("Have a guess
     first.", "Good catch. Thank you for telling me.").
6. **Not enough money, or not enough room:** a right total he cannot pay gets "That's right, it's $70. You have
   $60." and he chooses again; the number cannot pass the space left on the boat.
7. **The rumor and the result.** A rumor names a good and a place, with a reason a child can follow ("A ship of
   mangoes sank near Maui"). Tomorrow's price is what it promised. Rumors are always true in this job.
8. **One look back a day** (recommended): after selling, "You paid $30 for these and sold them for $60. How much
   did you make?" with its sum. One question, and the log keeps it.
9. **The boats:** canoe (10 crates), then 20, 50 and 100, each bought with the game's money at a price chosen from
   stop 1's simulation (the first within about two weeks of careful play). Buying one is a sum like any other.
10. **The game's state**, a row a child: money, boat, cargo, place and day. One migration, on test only in this
    job. No name, nothing about the family (rule 7).
11. **The parents' side**: each day's trades and sums on `/parent`, as stop 2 says.
12. **Voice:** "Read it to me" reads the question and the sum; a line with new numbers is made on the tap, as before
    the lines were made ahead. Say at stop 1 what that wait is and whether making the day's lines when the tile
    opens is worth it.
13. **Pictures in this job are placeholders** drawn by the program. Stop 1's art list says what to replace them
    with; Brandon's pictures go in `public/` in a later job.
14. **Where it shows:** on test only, as a Math tile for the test children, through the test view's bar. It is a
    tile the wall adds on the dev server against test and nowhere else; no week's cards and no Sunday build know
    of it. It uses what *The clean-up* kept.

## The steps, in order

1. Read; the simulation; the page for stop 1 (the day, the numbers, the sentences, the art list, the clean-up
   list). **Stop 1.**
2. On go: **the clean-up**, committed and pushed on its own, with its diff against `main` reported. Then the
   game's rules as pure functions with tests (a market from a child and a day; a trade; the count; the
   landing; the boats); the migration on test; the state.
3. The screens: selling, buying, casting off, the landing with its reason, the boat for sale; the parents' log.
4. `npm test`, `npm run typecheck`, `npm run build`; the dev server for the iPad. **Stop 2, Your look.**
5. **Stop 3**, if they choose. Then **`/wwc:close`**: docs/12 (how the game teaches, with Brandon's words above),
   docs/08 (*Decided:*), `docs/math-tutor-proposal.md` (a line at its top: the written problems are replaced by the
   trading boat; the ladder and each boy's pace stand), `CLAUDE.md` *Where we are*, the board (this row *on hold*,
   waiting on the next job; the Math tile's row closed as replaced by this one; the art's home noted as
   `Documents\quark-art` outside the repository, with its README), the report with what the looks found and the next
   job proposed (the pictures, live, the sharing and fractions games).

## Read first

1. `docs/reports/2026-11-09-math-tile.md`, whole: what is built and held, and why the look failed;
   `docs/reports/2026-11-16-next-16-4-5.md`, the emergency stop: what the gate's v4 did to a card that is not math.
2. `docs/math-tutor-proposal.md` (the ladder and each boy's pace stand; its written problems do not).
3. `plan/math-ladder.yaml`, `lib/ladder.ts`, `core/math/` (`numbers.ts`, `expr.ts`), `core/wall/math.ts`,
   `app/kid/card/[id]/math-box.tsx`, `app/kid/math-picture.tsx`, `lib/dev-view.ts`, `app/kid/dev-bar.tsx`.
4. `core/wall/flow.ts`, `card.ts`, `words.ts`, `speech.ts`; `app/kid/page.tsx`.
5. `CLAUDE.md`, *Rules that never bend*; `docs/15-reward-engine.md` (what a reward may and may not be).

## Not in this job

Anything on live or released; turning math on; Midjourney pictures in the app; rumors that can be wrong; a second
game (sharing, fractions, a tape measure or stock prices in eighths: later games, each for its own rungs); the week's
theme as the game's setting; the ladder moving by itself.

## Records to update at the end

`docs/12-teaching-that-tests-itself.md`, `docs/08-open-questions.md`, `docs/math-tutor-proposal.md`, `CLAUDE.md`,
`core/wall/words.ts` (named in the report for June), `docs/board.md`. `/wwc:close`.
