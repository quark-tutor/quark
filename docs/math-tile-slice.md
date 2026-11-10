# Brief: the Math tile (math with the tutor, slice 1)

**Phase 4, on `phase-4-wonder-wall`.** Drafted 9 November 2026 in the chat, 17:20, from
`docs/math-tutor-proposal.md` (accepted by Brandon and June, 9 November). Board row: "The Math tile, slice 1"
(*next*, under *Wonder Wall*). Follows `docs/tile-rotation-slice.md`. **Status: ready.**

**Size:** a slice, over about two weeks. **The date that matters:** released before Sunday 29 November's 6 am
build, so week 6 (30 November) is the first week with Math. Weeks 4 and 5 keep Puzzle and are not touched.

## Why

June asked for math (8 November). The first proposal (`docs/math-practice-proposal.md`) was a history problem a
day and a drill tile, and it is not what the family wants. Brandon, 9 November 2026:

- "i'm not sure that straight drills will be much better than the kumon worksheets june has already tried." The
  younger boy "wants to do worksheets, his older brother avoids them like the plague."
- What works at home: "usually just slow down and talk it through a step at a time. comparing it to real world
  problems they have seen. giving the same question but stated in different ways."
- The thunder question "was a simple division or multiplication problem, but the boys struggled terribly. until i
  reworded the way the question was asked." There is almost no thunder in Hawaiʻi; neither boy could picture it.
- "the important part is [the younger] can run ahead to his ability, and [the older] can work to his ability. i
  don't think [the older boy's] strong suit is going to be math ... but falling too far behind would be another
  type of problem."
- "the math module is something that should be easier to quantitatively zero in on the zone of proximal
  development than the other cards."
- "june and I are on the same page with this ... it's my job to deliver."

So the Puzzle slot becomes **Math**: one problem a day for each boy, at his own place on a ladder the parents
wrote, about something a child in Hawaiʻi has seen, with the parents' own moves when he is stuck.

## Stops

1. **After reading: twelve problems to read, and the shape.** Before any code, Code writes **twelve sample
   problems** into `plan/candidates/math-problems.md`, six for each boy's working rungs (below), each whole: the
   setting, its three or four parts with answers, the two other wordings, the steps, the tie to something he
   knows, and the worked example where the rung is new to him. Brandon and June read them: this is the taste
   test, and a no here costs nothing. Also at this stop: how a problem is kept and checked (recommended below),
   where a boy's place on the ladder is kept, the counts this job cannot settle, each with its recommended answer.
   "go" takes them all; a problem they dislike is named, and that is a fix round.
2. **Your look, on June's iPad as Bug, on test** (the device-test rule), on the dev server, on a math day built
   on test for Bug at the older boy's rungs:
   - **Where:** the wall, then the Math tile.
   - **Do / See, each its own check:**
     1. Answer the first part right → "That's it.", the working shown in two lines, then the next part.
     2. Answer a part wrong → "How did you get that?" and no clue. Say or type how → the same question comes
        back in other words.
     3. Wrong again → one small step, then the next step.
     4. Wrong through every step → "This one is for a person:", as on any card.
     5. Say "I don't know" → "Have a guess first."
     6. Answer by the number pad, by typing "six" and by Talk → each is read as 6.
     7. On a rung marked new → the worked example shows first, with its picture, before the problem.
     8. "Read it to me" reads the problem, and each move, in Sulafat's voice.
   - Pass □ Fail □ each — if fail, what you saw.
3. **Your look, the parents' side, on the laptop, on test:** `/parent/week/<theme>` shows each day's math problem
   for each child with its answers, wordings and steps, readable before the tap; a held-back problem says why.
   Pass □ Fail □.
4. **M1, Brandon's hand: `npm run db:push:live`**, if this job has a migration (a boy's place on the ladder).
   Additive; Code writes the four lines at the stop.
5. **M2, Brandon's hand: each boy's place set on live** (the page or the SQL Code gives; the places are in
   *Decided already*).
6. **`/wwc:release`**, before Sunday 29 November, 6 am. The Sunday build then writes week 6 with Math; Brandon and
   June read the week page and tap as every week.

## Decided already (Brandon and June, 9 November 2026; do not reopen)

- **Math takes the Puzzle slot.** Five tiles, as now. ("swap puzzle with math, and rotate tiles daily.")
- **One problem a day, three or four parts, five to ten minutes.** No timer, score, streak or points (rule 4).
- **No published curriculum**, no Common Core codes or named methods, **nothing that looks like a worksheet.**
- **Every problem passes the Hawaiʻi question:** has a child here seen this? Surf, tides, the drive, the pool,
  musubi, the market: yes. Thunder, snow, subways: no.
- **A wrong answer does not earn a clue.** The moves, in order: "How did you get that?" (what he says is kept for
  the parents); the same question another way; one small step at a time; a tie to something he knows; a person.
  The tutor never gives the answer (rule 3).
- **The working is shown after a right answer.**
- **A new rung is taught before it is asked:** one worked example with a picture, on other numbers in another
  setting, then his own problem.
- **Everything a child reads or hears is written on Sunday and passes the gate** (rule 5). The model writes no
  live words. **The numbers are checked by code**, not trusted from the model.
- **The ladder is the parents'** (below). A boy never sees the list, a grade or a level. **Division as sharing
  starts alongside the first times tables.**
- **Each boy at his own pace.** The younger: words that hide the sum, saying why, a few quick sums because he
  likes them. The older: shorter sums, more of them, inside problems about things he cares about, the talking
  step first.
- **The ladder file is in the repository; a boy's place on it is not** (the repository is public): places live in
  the database only.

### The ladder

| # | Rung | The older boy | The younger boy |
|---|---|---|---|
| 1 | Add and subtract up to 20, quickly | done | done |
| 2 | Add and subtract up to 100 | done | done |
| 3 | Hundreds, tens and ones | done | done |
| 4 | Add up to 1,000 | working | next |
| 5 | Subtract up to 1,000 | next | |
| 6 | Multiplying as "groups of" | working | done |
| 7 | Times tables: 2s, 5s, 10s | working | done |
| 8 | Times tables: 3s and 4s | | working |
| 9 | Times tables: 6s to 9s | | |
| 10 | Division as sharing (met alongside rungs 7 to 9, on the same facts) | | |
| 11 | Division as the times tables backwards | | |
| 12 | Leftovers (remainders) | | |
| 13 | Two-step problems | | |
| 14 | Multiply bigger numbers (3 × 40, then 3 × 42) | | |

**Everyday math, alongside** (a problem from here about twice a week; "assume no experience", Brandon): telling
time and how long something takes; money; measuring length, weight and how much a container holds; reading a bar
graph; halves, quarters and thirds of real things; shapes.

## What is built

1. **The ladder**, `plan/math-ladder.yaml`: each rung's key, name, one line of what a problem on it asks, and one
   example. Imported like the plan; validated (keys unique, order whole).
2. **A boy's place**: for each child, each rung as *done*, *working* or not yet, and whether he has met it (so the
   worked example shows once). Recommended: the `skills` and `mastery` tables already in the schema if they fit
   without bending; otherwise one small table. Code says which at stop 1. Set by a parent's hand in this job; it
   does not move by itself (slice 2).
3. **A math problem**, written by a new prompt, `core/prompts/math.md` v1, on Sunday, one for each child for each
   day, from his *working* rungs (an everyday one about two days in seven):
   - the setting, in two or three sentences, with a picture from the library where one fits;
   - three or four parts; each part has its question, its answer as a number with its unit, **the sum itself as
     an expression the program works out**, two other wordings, two to four steps (each a question with its own
     checked answer), and one tie to something he knows;
   - the working, in two lines, shown after a right answer;
   - the worked example, when the rung is new to him;
   - a handoff line for a person.
   Recommended: carry the parts on the day-slot's existing chain of layers (a part is a layer; the moves take the
   place of hints), so the wall, the nightly lines, the week page and the handoff need the fewest new paths. Code
   says at stop 1 if that bends the chain too far, and what it would do instead.
4. **The code check** (`checkMath()`, beside `checkCard()`): every part's and step's written answer equals what the
   program works out from its expression; the other wordings hold the same numbers; no wording or step states the
   part's answer; the parts stay on the child's rungs. A problem that fails is written again once, then held back,
   and the week page says why. Tests hold each rule.
5. **The gate** reads every word as it does a card's, with the Hawaiʻi question added to what it is asked.
6. **On the wall:** the slot's name is "Math" (`SLOT_NAMES`); the database's slot value stays `puzzle`
   (recommended: no change to the enum). The answer box gains a number pad; typing and Talk stay. **A number is
   read in code** ("6", "six", "6 sets", "about six"): right or not is never the model's call. The replies, in
   `words.ts` for June to read: "How did you get that?", "Here it is another way:", "One step at a time:", "Think
   of it like this:", "Here's the whole thing:". "Go deeper" becomes the next part.
7. **What he said is kept**: his answer to "How did you get that?" is stored with the attempt, and the judge
   (Haiku, as now, verdict only) labels it: a slip in the sum, the wrong sum chosen, a guess, or right thinking.
   **In this job the label is recorded and shown to the parents; it does not yet choose the move** (the moves run
   in their fixed order). Choosing the move from the label is slice 2, once there are real answers to tune on.
8. **The week:** from the first math week, the Puzzle slot takes no short lesson and no theme topic.
   `weekSchedule()` asks for 22 short lessons beside a theme (not 28); `validatePlan` and
   `docs/saturday-pick-slice.md` say a theme's seven topics go on Look, Wonder, Listen and Then. The puzzle
   lessons still in the library stay unused, not deleted.
9. **The nightly lines** include every math line, so no first tap waits.
10. **The money:** the report gives the added cost of a week's math (writing, the gate, the labels) from test,
    and the estimate on `/parent/models`.

## The steps, in order

1. Read; the twelve problems; **stop 1**.
2. On go: the ladder file and its import; a boy's place; `math.md`, the problem's shape and `checkMath()`; tests.
3. The Sunday build writes math for the slot; the gate; the week page shows it. One math week built on test.
4. The wall: the name, the number pad, the reading of a number, the moves, the working, the worked example; the
   label kept. `npm test`, `npm run typecheck`, `npm run build`. **Stops 2 and 3, Your look.**
5. The week's counts (22) and the Saturday brief; the nightly lines; the money.
6. **M1, M2** by Brandon's hand; then **`/wwc:release`**, which closes first.

## Read first

1. `docs/math-tutor-proposal.md`, whole. `docs/math-practice-proposal.md` only for what it found in the code
   (its sections on the puzzle slot and judging in code); its design is not taken.
2. `core/wall/card.ts`, `flow.ts`, `answer.ts`, `judge.ts`, `words.ts`, `speech-ahead.ts`;
   `app/kid/card/[id]/answer-box.tsx`, `talk.tsx`.
3. `core/curation/cards.ts` (`checkCard()`), `ideas.ts`, `gate.ts`, `schedule.ts`, `week-job.ts`, `week.ts`;
   `core/prompts/card.md`, `ideas.md`, `gate.md`, `judge.md`; `lib/plan.ts`.
4. `deploy/supabase/schema.sql`: `skills`, `mastery`, `attempts`, `cards`, `questions`.
5. `docs/12-teaching-that-tests-itself.md`; `docs/saturday-pick-slice.md`; `docs/04-curation-engine.md`, "How a
   week is mixed"; `CLAUDE.md`, *Rules that never bend*.

## Not in this job

The ladder moving by itself, the label choosing the move, the parents' page of where each boy stands and the
three-week flag (slice 2, proposed at the close); the tutor doing the moves in its own live words (the Tutor
project); the tiles' order (`docs/tile-rotation-slice.md`, done first); weeks 4 and 5; deleting the old proposal
(marked replaced at the close).

## Records to update at the end

`plan/math-ladder.yaml`, `plan/candidates/math-problems.md`, `core/prompts/math.md`, `core/wall/words.ts` (named
in the report for June), `docs/04-curation-engine.md`, `docs/12-teaching-that-tests-itself.md`,
`docs/08-open-questions.md` (*Decided:* with the words above), `docs/saturday-pick-slice.md`,
`docs/math-practice-proposal.md` (one line at its top: replaced by `docs/math-tutor-proposal.md`, 9 November 2026),
`CLAUDE.md`, `README.md`, `docs/board.md`. `/wwc:release`.
