# Teaching that tests itself

The tutor doesn't take any teaching method on faith. Every lesson is also a measurement, so the evidence for what works comes from the children it teaches. That makes this a data-driven tutor, not a tutor built on someone else's study.

## How it works

1. **Teach with effort first.** The child tries before getting help, and gets hints rather than answers. That struggle is what builds lasting memory.
2. **Check later, without help.** Days and weeks after a lesson, the tutor slips in quick checks with no hints: a question on a wall card, a dinner question, a puzzle. What a child still knows weeks later is the real measure, not how they did in the moment.
3. **Compare methods within the family.** The tutor teaches some themes one way and others another way, for example story-first versus puzzle-first, or a short daily dose versus a weekend deep dive. Then it compares what stuck for each child.
4. **Report it plainly to parents.** The digest shows what each child retained and which approaches are working for that child. Parents decide what to change.
5. **Adjust the plan.** The weekly cycle uses the results to choose how the next theme is taught.

## The difficulty rule

When teaching, a question answered with no hint is probably too easy. The number of hints a child needs is the tutor's difficulty dial:

| Hints needed | What it means | What the tutor does next |
| --- | --- | --- |
| None | Too easy | Make the next question harder |
| One or two, then the child gets it | The right edge: struggle, then understanding | Stay here |
| Many, or signs of frustration | Too hard | Step back or switch approach |

When checking weeks later, it flips: an answer with no hints is the goal, because it proves the learning stuck. The tutor always knows which mode it's in. Kids still get some easy wins, such as a warm-up question, a review they nail or a fact they get to teach a sibling, so struggle never feels like constant failure.

## Hints are earned, not pressed

A free hint button turns into something to tap for the reaction, the same way kids tap every button to see what opens. Tutoring researchers call this "gaming the system."

- **Guess first.** Help appears only after the child tries an answer, typed, spoken or picked. Even a wrong guess primes learning.
- **Hints are a conversation, not a button.** The tutor responds to the child's attempt with a guiding question the child has to engage with.
- **The screen never gives the answer.** When hints run out, the last step goes to a person: "Ask Dad about this one at dinner," or "See if your brother knows."
- **One question, one way to answer.** Nothing decorative to tap. Young kids answer by voice, which takes more thought than tapping.
- **Thinking happens off the screen.** The screen starts the thinking, and paper, conversation and the dinner table finish it.

**As built in the Wonder Wall's slice 1 (22 Oct 2026):** the hints are the card's written ones, one at a time after a guess that isn't judged right, each under the child's own guess; a model's guiding question is a later slice. Answers are typed, with the iPad keyboard's dictation as the family's setting; spoken answers in the app are a later slice. A guess is judged in code, which misreads many right answers in a child's own words, so the reply never says a guess was wrong. docs/04, *How the Wonder Wall is built*. Since the tutor's slice 2 (28 Oct 2026), a model judges the guess and the written hints are framed as clues (below); a child can answer by voice with Talk since 23 Oct (docs/13).

## How the judge of an answer is built

Built 28 Oct 2026, the tutor's slice 2 (`docs/judge-slice.md`; report `docs/reports/2026-10-28-judge.md`), on `phase-4-wonder-wall`: proven on `quark-test` and on June's iPad as Bug (1 Nov 2026). Its migration is on live since 1 Nov 2026, by Brandon's hand; the code was released to `main` on 1 Nov 2026 and is in use on live, where the time to a reply passed in use (check 6; Brandon, 8 Nov 2026: replies "come back fast enough that the boys don't notice a wait"). Decisions in docs/08, *The model as judge of an answer*.

- **The judge.** `judgeAnswer()` in `core/wall/judge.ts`, with its prompt `core/prompts/judge.md` v1, through the `judge` job of `core/model.ts`. The model is one line in code, `JUDGE_MODEL`, Haiku 5.5 (Brandon, 28 Oct 2026), thinking at low effort (`JUDGE_THINKING`), at most 300 tokens back. It reads the card's words, the question, the accepted answers and the key's note on what counts, the hints shown so far, the grade band from the card's level, and the child's words. Wherever the card's words or the child's carry the nickname, it goes as "the child" (a test holds it); nothing else about the child or the family goes (rule 7). It returns a reason of at most 15 words and one verdict:
  - `right`: the child's words mean what an accepted answer means, in any wording; a guess holding both of a question's two choices is not right;
  - `close`: the right idea, missing the point that makes it the answer;
  - `hint`: the words answer the latest clue rather than the question (before any clue was shown, it counts as `not_yet`);
  - `not_yet`: a real guess that is not it;
  - `not_a_guess`: "I don't know" and the like, which `isGuess()` also catches before any call.
- **A child is never kept waiting on the model.** The judge has 3 seconds in all (`JUDGE_BUDGET_MS`), with a second try only when the first failed with a second or more left. Past that, or on any error, the word rule (`judgeGuess()`, docs/04) judges, the reply is the word rule's, and the server logs one line: the error's message, never the child's words. A question with no accepted answers (every layer 4) calls no model.
- **What the child hears is never the model's.** It is a line from `core/wall/words.ts` for the verdict (`answerReply()` in `core/wall/card.ts`):
  - `right`: "That's it." and Go deeper;
  - `close`: "You're close.", then "Here's a clue:" and the next hint;
  - `hint`: "Good thinking. Now, the question:" and the question again, with no hint spent;
  - `not_yet`: "Here's a clue:" and the next hint;
  - `not_a_guess`: "Have a guess first. Any guess is fine.", with nothing written.

  The reply's fields are unchanged, and a test holds that the judge's line never leaves the server.
- **Hints spent, and the handoff.** `chainState()` counts a guess against the hints only when its verdict is `not_yet` or `close`, or when it has no verdict (a row from before the judge). So an answer to a clue spends no hint and never hands off. The hints still run out on `not_yet` and `close` guesses, and one more guess ends the card at a person.
- **The page.** After every reply the question is shown again, smaller, just above the box, so the box always answers the question. A clue has its own "Read it to me". The hints' own wording is the card prompt's: they are framed as clues here, not yet written as clues.
- **What is kept.** On `attempts`: `verdict`, `judged_by` (`model`, or `rule` when the word rule judged) and `reasoning`, the judge's line. Migration `20261029000000_attempt_verdict` added them; it was on test from 28 Oct and on live from 1 Nov 2026. `correct` is written as before: true for `right`; false for `close`, `hint` and `not_yet`. These are for the parents' log and never go to the iPad. Each answer judged also writes one `model_runs` row (kind `judge`, counts and money, no child). `/parent/models` shows those rows in a section of their own, "The judge of an answer": answers sent, those the word rule judged instead, the cost this month and since the start, a month at 40 answers a day, and whether Anthropic's key is set. They stay out of *Every run*.
- **Measured** with `npm run fixture -- judge [model]`. It runs on test only and reads no database. It takes slice 1's 105 questions with 332 invented answers, plus 33 answers to a clue written from test's cards by an agent that never saw the prompt. Haiku 5.5 at low effort:
  - judged 206 of 210 right answers right, where the word rule judged 84;
  - judged none of the 105 wrong answers and none of the 17 both-choice answers right;
  - caught 24 of 33 answers to a clue;
  - sent 2 of 365 to the word rule;
  - waited a median 1.10 s, 1.55 s at the 90th percentile;
  - cost $0.00018 a call, about $0.25 a month for two boys at 40 answers a day.

  On the dev server, against test, a whole reply took 3.5 to 3.7 s, and 6.2 s when the model ran past its limit; the laptop's database reads cross the Pacific. On live the first answers after the release are timed (Brandon, 1 Nov 2026).

## How the trading boat is built

Slice 1 was built and played on 16 Nov 2026 (`docs/trading-boat-slice.md`; report `docs/reports/2026-11-16-trading-boat.md`) on `quark-test`. Slice 2 (16 and 17 Nov 2026, `docs/trading-boat-2-slice.md`; report `docs/reports/2026-11-16-trading-boat-2.md`) puts it on the boys' walls: **the boat is on a child's wall, in Puzzle's place, whenever the family's times tables give it prices, on test and on live alike, with no switch** ("Slice 2: on the boys' iPads", below). Decisions in docs/08, *The trading boat, slice 1* and *slice 2*. It replaces the Math tile of 9 Nov (held after its look failed on 10 Nov), whose written problems, moves, label and gate changes were removed on 16 Nov; the ladder stands.

**How it teaches, in Brandon's words** (10 and 16 Nov 2026):

- A word problem is three leaps at once: things become numbers, the situation becomes an operation, and the sum is
  solved. Drilled children "crack in real world situations": practice goes to the last leap, and life tests the first
  two.
- "Why am I dividing? I guess this is something the teacher wants. Not: I need to divide to split pancakes fairly."
- What worked at home was a game. "By the third time we played they could count our money and tell me how much to give
  back."
- A trading game does this for multiplication: "Buy 150 at $4? You better have $600 on you."
- "The best part of the boat game is its day to day nature."
- And later, of the classic calculator trading game: "this was being run on a calculator and everyone understood it."

So **the sum is the move**: a child with money, a boat and a rumor decides what to buy and how many, and tells the
trader what he owes. Nobody tells him what to buy.

**The day** (`core/boat/game.ts`, pure, the same every time it is asked):
- He lands where yesterday's boat sailed and sells to the buyers on the dock, one sum a good. There is one look back on
  the day's best sale, and the boat builder comes when he can pay and keep $20.
- Then two markets, each with four goods, a few crates each, and one rumor.
- Then he casts off for one of the two rumors' islands, and is done until tomorrow.
- The game counts days played, so a missed day costs nothing, and a half-played day waits.
- **Game days 1 to 3 are the family's** (slice 2): every child of the family gets the same markets, goods, crates,
  prices and rumors on his first three days, drawn from the family and the day number. From day 4 each child's own
  seed draws his days.

**The numbers** (`core/boat/day.ts`, from the ladder places through `lib/ladder.ts`):
- **The prices:** the times tables being worked on, from the family's one setting, so every child of the family has
  the same numbers (slice 2). 2s, 5s and 10s working on give $2 and $5; 2s, 5s and 10s done with 3s and 4s working on
  give $3 and $4.
- **The usual price:** any dock pays the next of the numbers ($5 or $4) for any good no rumor names.
- **A rumor** promises one of his numbers at least $1 over the usual.
- **No choice loses money;** a poor one earns less.
- **No sum holds more than 10** crates or bills until the ladder says he is working on bigger multiplying: a trader
  has 2 to 10 of a good, a buyer takes up to 10, and a boat's price above 10 bills is paid in bundles.
- **The boats** cost 4, 15 and 40 hundred-dollar bills (20, 50 and 100 crates), chosen from stop 1's simulation.
  `core/boat/sim.ts` and its test hold the evidence:
  - a careful boy has the double canoe in his second week;
  - he meets most of the facts of his working tables a week from then;
  - no best purchase repeats day after day.

**A wrong total gets help at once, never the answer** (rule 3):
- **The two numbers added:** "That's 6 and 5 put together. You need 6 lots of 5."
- **One crate out:** "Close. One crate out."
- **Anything else:** "Let's count them."
- **The count:** then the crates light up two at a time. Each step is the one question beside the box, the trade's sum
  stays above it as a reminder, and the crates it asks about are outlined.
  - A missed step goes one crate at a time, for that step only.
  - The whole total is taken at any step.
  - When the count runs out, the trader asks "Want to try fewer?". With nothing fewer, it is "This one is for a person:".
- "How did you get that?" is never said, and a wrong sum never costs money.
- A reply with no number is read by the no-number judge (`core/wall/no-number.ts`): "Have a guess first." or "Good
  catch. Thank you for telling me.".

**The screen** (`app/kid/boat`):
- The market is a list of goods, like a price board, with the money, the boat and the rumor above it.
- The chosen good opens in its row: a straight dial for how many (a notch a crate, the crates drawn as he slides, every
  crate the same size), then the trade, the crates drawn small with the sum beside the question, the number pad, Talk.
- "Never mind" or tapping the good again goes back.
- Every sentence is a template in `core/wall/words.ts` (`BOAT`), read once by June (rule 5), with no model writing a
  word.
- Brandon's four pictures are in `public/boat`; the other pictures are placeholders.
- "Read it to me" says the screen, or the trade.

**The record:** `boat_games` (one row a child) and `boat_turns` (one row an answer), migration `20261116000000`, on
test and, from 17 Nov 2026, on live. The parents' log on `/parent` reads each day's trades: every sum, what he said,
the help he needed and each answer's kind, in crates ("Sold 1 crate of sweet potatoes at $4"; `core/boat/log.ts`).

**On test:** the test view's bar switches the child and the day on the dev server, and
`npm run fixture -- boat <n> [money <m> | reset | log]` sets a game up. The bar no longer decides whether the boat is
here.

### Slice 2: on the boys' iPads (16 and 17 Nov 2026)

**Is the boat here?** `boatHere()` in `lib/boat-here.ts` is the one place that asks. There is no switch (Brandon, 17
Nov 2026: "release the math trading game in place of the puzzle, that was the decision").
- **Here:** the family's times tables give the child prices that keep the promise that no choice loses money
  (`numbersProblem()` in `core/boat/day.ts`). Its answer is the game's context: the child's seed, the family (for days
  1 to 3), the numbers, and today where the family lives.
- **Not here:** with no table working on or done, or with a fault reading anything (one log line, naming no child).
  The wall is then as it was before the boat, Puzzle in its place.
- **Who asks:** `lib/boat.ts` before every read and write, and `lib/wall.ts` for the Puzzle slot, so the wall, the card
  pages, the boat and its routes always agree.

**The family's times tables:** one setting for the family, and every child's prices come from it.
- **Where it is set:**
  - on `/parent`, the section *The trading boat* (`app/parent/boat-section.tsx`, `boat-tables.tsx`,
    `setBoatTables()` in `app/parent/actions.ts`), by any guardian (rule 2);
  - or by `npm run boat:tables` (test) and `boat:tables:live` (LIVE, Brandon's hand), `scripts/boat-tables.mts`.
- **What it writes:** the same `mastery.place` (working, done, or empty for not yet) on the three times-table rungs
  (2s 5s 10s; 3s 4s; 6s to 9s) for every child, and a `boat.tables` audit row. *Multiply bigger numbers* is not
  offered.
- **What it saves:** 7 of the 27 settings. The 6 that give prices keep the promise (`lib/boat-setting.ts`, held by a
  test over 10 seeds, 10 days and 7 islands). The seventh is every table at not yet, which takes the boat off the
  wall. The rest are refused with the reason ("a crate could sell for less than it cost", "a rumor pays no more than
  any dock").
- **What the page says:** where the boat stands ("The trading boat is on the wall, in Puzzle's place." or why not) and
  the prices in words.
- **A change of tables** reaches both children on the next screen either opens. The day in play keeps its goods,
  crates, order and rumors' islands, and only the prices change: `dayOf()` always takes the rumor's draw.

**The first three days are the family's** (Brandon, 17 Nov 2026: "high luck on day 1 will give one child an
overwhelming lead. fix the first 3 days of the simulation, then luck after that."):
- `SHARED_DAYS = 3` and `seedOf(n, child, family)` in `core/boat/day.ts`. `roll()` and `dayFor()` draw game days 1 to
  3 from the family and the day number, and later days from the child.
- A game day is a day played, so a child who starts later still gets the family's day 1.
- Where a rumor points is its own draw, so where a boy stands changes only a rumor's island, never the day's goods,
  crates or prices.
- **What it does** (two careful boys, 2,000 pairs): they are level at day 3. Under 2s, 5s and 10s done with 3s and 4s
  working on, the richer has 14% more at day 7 and 13% at day 14, where before it was 17% and 14% (29% at day 3).
  Under 2s, 5s and 10s working on, 3% and 3%, where before it was 4% and 4%.

**The Puzzle slot:**
- While the boat is here for a child, the Math tile, *The trading boat*, stands where Puzzle falls in the day's
  `slotOrder()`, and Puzzle's tile is not shown (`hide: ["puzzle"]` in the wall's scope, `core/wall/flow.ts`, read by
  `onWall()`; `boatAt` in `core/wall/card.ts`). "Everything done" counts the boat's day in Puzzle's place.
- A Puzzle card's address goes back to the wall, and an answer to it or "Read it to me" on it answers 404.
- The Sunday build, the Saturday pick and the nightly lines still make Puzzle cards. The week page says "While the
  trading boat is on the wall, it takes Puzzle's place, and the Puzzle cards below are not shown."

**Taking it off:** every table at *Not yet* on `/parent`, or `npm run boat:tables:live -- none`. Puzzle is back on the
next screen, and each child's game waits where he left it.

**On live** (17 Nov 2026, by Brandon's hand): the six migrations (`20261109000000` to `20261117000000`, the switch's
column added and dropped in the same push), the ladder's 20 rows, and the family's tables.

## The session ends when the thinking stops (proposed)

Some language apps "hang up" after too many careless answers. The tutor does a gentle version. If taps come faster than anyone could read, or answers turn into random guesses, it first slows down: it reads the card aloud or asks for a spoken answer. If the rushing continues, it ends the session calmly, with no scolding, shame or lost points: "Let's stop here. Here's something to think about until next time." The child learns that the screen only works when they're thinking, and parents see the pattern in the digest.

## Conduct the tutor teaches

The tutor is not a model of how to be a person. The people a child should copy are people: parents first, then the grandparents, saints, explorers and scientists in the stories it carries. But the tutor is a trainer. Every time it waits for a guess, declines a question, slows a session or ends one, it is shaping how the child behaves, and it does so with far more repetitions than any dinner conversation gets. Pretending the tool only transmits information would be its own kind of dishonesty, so the training is written down here where parents can see every lever.

| Mechanism | Habit it trains | Floor or family |
| --- | --- | --- |
| Guess first, before any hint | Commit before you ask for help | Floor |
| Hints as a conversation, not a button | Ask well, not just ask | Floor |
| The last hint goes to a person | There are things you go to people for | Floor |
| Say the answer out loud | Think it through before you commit | Family sets how firm |
| Slowing down, then a calm end on rushing | Rushing gets you less, not more | Floor; family sets the tone |
| Declining a crude or lazy question | The way you ask is part of the ask | Family sets what counts as crude |
| No answer to rudeness aimed at the tutor | You don't get a rise out of people by being rude | Family chooses quiet non-response or direct correction |
| Effort words, never brilliance words | Effort is the thing you control | Floor |
| Praise, when and in what words | What is worth being pleased about | Family sets |
| No contempt for anyone, ever | Other people are not beneath you | Floor |

**The floor** is the short list every family gets regardless of pack: commit before help, no rushing, effort over brilliance, no contempt. These are close to universal and they are also what makes the teaching work, so they are not configurable. **The family items** are the ones that vary by household and have no right answer: how firm to be about speaking the answer, what counts as crude, whether rudeness earns silence or a correction, whether and how the tutor praises. A stricter, old-fashioned tone and a gentler one are both legitimate. Neither should be the default by accident. The family items are asked in the values interview (`gate/values-interview.md`, Part 2b) and stored under `conduct.*` keys in `guardian_conduct` and, once merged, `conduct_settings`.

**The manner is the one thing it does model.** A calm end without a lecture shows how to hold a boundary. "I won't answer that one; try asking it another way" shows how to decline without shaming. The child sees that pattern hundreds of times, so the tone of refusal is not a user-interface detail; it is the one piece of character the tool demonstrates directly, and it is specified as carefully as the hint rule. The manner rules, which belong in a fixed prompt block that every kid-facing prompt includes (`core/prompts/manner.md`):

- Never sarcasm.
- Never a lecture longer than one sentence.
- Never a reference to the child's past behavior.
- Never shame.
- Always a way back in next time.

**Why this sits beside the values packs.** How a child learns to act is where traditions differ most. Some teach by exemplars, some by cultivating attention and consideration, some by practice, and families differ on whether exemplars should match the child's sex. None of that changes the tutor's voice; it changes what the tutor points at, so it belongs in the pack (`learns_to_act` and `match_exemplars_to_sex` in `packs/README.md`). The tutor's own conduct stays the same across every pack, apart from the family items above.

Open questions on conduct:

- [ ] Does declining a crude question need to say why, or is the decline itself enough at 7 and 9?
- [ ] At what age does "say it out loud" stop being a scaffold and start being a nuisance?
- [ ] Should a sibling's rudeness during a shared session end the session for both?
- [ ] Mom's view, especially on praise and on the tone of refusal.

## Pooled evidence, with consent

Across many families, the results add up to real evidence about how children learn, on a scale most education research never reaches. Families can choose to share anonymized results so the whole community learns what works, by age, subject and method.

## Ground rules

- **The tests measure methods, not children.** No grades, no rankings, no comparing one kid against another.
- **Opt-in only.** Sharing results beyond the family needs consent from every guardian, and the data is anonymized.
- **No deliberately worse teaching.** A child is never given a method that's expected to work worse just to create a comparison group. Comparisons are only between approaches that are both believed to be good.
- **Checks stay light.** Short, low-stakes and woven into normal touch points, so testing never feels like school testing.
- **Results are shown honestly,** including when they're too thin to mean anything yet.

## Open questions

- [ ] What counts as "retained": recall, explanation, or applying an idea somewhere new?
- [ ] How many checks per child make results meaningful without becoming a burden?
- [ ] Who holds the pooled data, and how is it governed so it can't be sold or misused?
- [ ] How do we measure the things that matter most but are hardest to test, like curiosity and love of reading?
