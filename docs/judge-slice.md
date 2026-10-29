# Brief: the model as judge (the tutor, slice 2)

**Phase 4, on `phase-4-wonder-wall`.** Drafted 28 October 2026 in the chat, 19:22 to 19:45, from three nights of the
boys on live (26 to 28 October). Board row: "The model as judge of a card answer" (*next*, top, under *The tutor*).
**Status: ready.**

**Size:** a job.

## Why

Three nights in, the boys like it, and two things in the answer loop are costing them. **Right answers in their own
words are judged wrong**: the wall judges a guess with a word rule (`judgeGuess()`, `core/wall/answer.ts`), which the
slice 1 table showed misjudging 68 of 105 right answers; on Monday "In the background." for *Where in the picture is
Mount Fuji hiding?* got a hint, and on Wednesday the older boy wrote "the house looks smaller because the thumb is
right up to your eye and when something's in front of your eye, it blocks your vision of something else", which is
a nine-year-old reasoning about perspective, and got another hint. **And the hints are written as questions**
(`card.md`: "each hint is a guiding question"), so the boys answer the hint instead of the question, and the word
rule judges that against the original answers and calls it wrong too. Brandon, 28 October: "some of the hints also
sound like questions, so now the children think they need to answer the hint/question, not the original question."

A tutor that can't tell a right answer from a wrong one isn't a tutor. So the judge becomes a model: it reads the
question, the answers it accepts, the hints the child has seen, and the child's words, and returns a **verdict
only**. The child hears a pre-written reply for that verdict, never a word the model wrote (the tutor's live
answers are a later slice). This is the second slice of *The tutor*.

## Stops

1. **After reading, and the judge measured.** Step 1 is done: the judge prompt, and a fixture that runs it over
   the 105 invented answers of the slice 1 table (`docs/reports/2026-10-21-wonder-wall-1-slice.md`, *The matcher
   table*: each with its expected verdict) on two models, Sonnet 5.5 and Haiku 5.5, with the word rule beside them.
   The stop shows the table: right answers judged right, wrong answers judged wrong, and the "answered the hint"
   cases, with the time and cost per call. Brandon picks the model (recommended: the cheaper one that misjudges no
   more right answers than the other; if they tie, Haiku for its speed). Anything the records and this brief cannot
   settle, with its recommended answer; "go" takes them all.
2. **Your look, on June's iPad as Bug, on test** (the device-test rule), after step 5, on the dev server
   (`npm run dev:ipad`), on one of today's cards:
   - "A right answer in my own words gets 'That's it.' and Go deeper."
   - "After a hint, an answer to the hint (not to the question) gets 'Good thinking. Now, the question:' with the
     question repeated, and no hint is spent."
   - "A wrong answer gets 'Here's a clue:' and a hint, and the question stays on screen above the box."
   - "A close answer gets 'You're close.' and a clue."
   - "'I don't know' gets 'Have a guess first.'"
   - "Each reply comes within about two seconds of 'That's my answer'."
   "go" means every one passed, or name the one that did not: a fix round, and this stop comes again.
3. **M1, Brandon's hand, before the close: `npm run db:push:live`.** Applies this job's one migration (the
   `verdict` column on `attempts`, below) to LIVE. It is additive: the code on live today ignores it, so it goes
   first, and the release after the close carries the code that uses it. Undone by dropping the column. Checked on
   test by the migrations workflow at step 3. Brandon says "M1 is in" with what it printed.
4. **`/wwc:release`, one word** (the method, 26 October): typed after "M1 is in", it runs the close, then the
   release's own check, its three lines and Brandon's one "go" before the push. That puts the judge on the boys'
   iPads; nothing on an iPad changes.

No step spends on live before the release; the fixture's runs are on test's cards and invented answers, a few
dollars at most (the 105 answers, twice, on two models: under $1).

## Before the job

Nothing. The Anthropic key is already in Vercel and `.env.local`.

## Read first

1. `core/wall/answer.ts` (the word rule, which stays as the fallback), `core/wall/card.ts` (`chainState()`,
   `answerReply()`, the reply fields: rule 7), `core/wall/flow.ts` (`answer()`), `core/wall/words.ts` (every sentence
   the wall says; June's to read), `app/kid/card/[id]/answer-box.tsx`, `lib/wall.ts`.
2. `core/model.ts` (the adapter), `core/prompts/gate.md` (a judge that returns a verdict, not words for a child),
   `core/prompts/manner.md`, `core/curation/gate.ts` (how a model call is made, retried and costed).
3. `docs/12-teaching-that-tests-itself.md` (hints are earned; the handoff), `docs/wonder-wall-1-slice.md`, decision
   2 (why the word rule, and the table), `docs/08-open-questions.md`, *The tutor's voice, both ways* and *Wonder
   Wall, slice 1*.
4. `supabase/migrations/` (the last three) and `deploy/supabase/schema.sql`, `attempts`.
5. `docs/reports/2026-10-23-first-live-week.md`, *Stop 7's results* (Monday's finding) and the close.

## Decided already (Brandon, 28 October 2026; do not reopen)

- **The judge is a model, and it returns a verdict only.** What the child hears is a pre-written line from
  `words.ts` for that verdict. The model writes nothing a child sees (the tutor's live answers are the next slice).
- **An answer to the hint is not wrong.** It is a step on the way: the reply says so and repeats the question, and
  it costs no hint.
- **The question stays visible above the answer box** at every layer, after every hint, so the box always has one
  thing to answer.
- **The hints read as clues, not questions.** The wall's heading becomes "Here's a clue:". The hints' own wording is
  the card prompt's (card v7, a later job); this job changes how they are framed, not written.
- **The child's words go to Anthropic to be judged**, as decided for the tutor (22 October); nothing identifying
  goes with them (rule 7): no nickname, no age beyond the band, nothing about the family.
- **Never block a child on the model.** If the judge does not answer within its time, or errors, the word rule
  judges instead, and the reply says nothing different.

## What is built

1. **The judge**, `core/wall/judge.ts` and `core/prompts/judge.md` v1. The call carries: the question, the accepted
   answers (the key, with any choice-of-two the question offers), the card's text (so the judge knows what the
   child was told), the hints shown so far, the child's reading band, and the child's words. It returns one of:
   - `right`: the child's words mean what an accepted answer means, in any wording; a guess that holds both of a
     question's two choices is not right (Brandon, 20 October);
   - `close`: the right idea, missing the point that makes it the answer (the thumb "blocks" rather than "is nearer
     the eye");
   - `hint`: the words answer the most recent hint rather than the question;
   - `not_yet`: a real guess that is not it;
   - `not_a_guess`: "I don't know" and the like (the word rule's `isGuess()` is asked first and skips the call).
   And one short line of reasoning (for the parents' log, never for the child, stored with the attempt). No model
   output reaches the browser: a test holds that the reply's fields are unchanged and that the reasoning never leaves
   the server. The model is one line (`JUDGE_MODEL`), picked at stop 1. The call has a time limit (about 3 seconds)
   and one retry; past it, `judgeGuess()` decides and the reply is the word rule's.
2. **The verdict kept**: migration `2026102900000_attempt_verdict.sql` adds `verdict text` (nullable; the five
   values) and `judged_by text` (`model` or `rule`) to `attempts`, and `reasoning text`. `correct` stays, written as
   before (`right` and `close` are not correct; `hint` is written with `correct = false` and `verdict = 'hint'`).
   `chainState()` counts a wrong guess only where `verdict` is `not_yet` or `close` (a row with no verdict, from
   before this job, counts as it did): an answer to the hint spends no hint and never hands off.
3. **The replies**, `words.ts` and `answerReply()`: `right` as now ("That's it."); `close`: "You're close." then a
   clue; `hint`: "Good thinking. Now, the question:" and the question again, no clue; `not_yet`: "Here's a clue:"
   (replacing "Here's something to think about:") and the hint; `not_a_guess` as now. The handoff rule is unchanged:
   the hints run out on `not_yet` and `close` guesses, and one more guess ends the card at a person.
4. **The page**, `answer-box.tsx` and the card page: the question is shown again directly above the answer box
   after each reply (small, the same words), so the box always answers the question; the clue sits above that with
   its own "Read it to me"; the child's bubbles and replies as now. Layouts at 820 × 1180 and 1180 × 820 hold.
5. **The spend**: each judge call writes to `model_runs` as the gate does (counts and money, no child), shown on
   `/parent/models` with its estimate (two boys, about 40 answers a day).
6. **The fixture**, `npm run fixture -- judge [model]` (test only): the 105 table through the judge, the word rule
   beside it, the counts, the time and cost per call. Run at stop 1; run again at the close with the chosen model.

## The steps, in order

1. Read; the judge and its prompt; the fixture; the table on both models; **stop 1**.
2. On go: the model set; the migration, the verdict kept, `chainState()`; tests.
3. Push; the migrations workflow applies the column to test; watch the run.
4. The replies and the page; `words.ts` (June's lines: say in the report what changed).
5. `npm test`, `npm run typecheck`, `npm run build`; the dev server for the iPad; **stop 2, Your look**.
6. **M1** on Brandon's go; then `/wwc:release`, which closes first: docs/12 (*How it is built*: the judge and its verdicts), docs/08
   (*Decided:* with Brandon's words above; the matcher question closed), `CLAUDE.md` *Where we are*, the README
   status, the board (this row to *on hold*, waiting on the release; the Tutor project 2 of N built), the full
   report with the table and the money. Then `/wwc:release`.

## Not in this job

The hints' own wording (card v7: hints as clues, the lens-question openers, the lessons said outright, the loose
facts: one prompt job, proposed in the close); the tutor's live answers and the parents' review page (the next
tutor slices); the lines made ahead (Next, after this); any change to the gate or the Sunday build.

## Records to update at the end

`docs/12-teaching-that-tests-itself.md`, `docs/08-open-questions.md`, `CLAUDE.md`, `README.md`, `docs/board.md`,
`core/wall/words.ts` (named in the report for June). `/wwc:release` (the close, then the release).
