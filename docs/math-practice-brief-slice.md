# Brief: math tutored in a recognizable way (an exploration, not a build)

**Phase 4 work, in a worktree branch `math-practice` made from `phase-4-wonder-wall`** (`claude --worktree
math-practice`; two jobs hold the phase branch today; skip the board page; merged into `phase-4-wonder-wall` at the
close). Drafted 8 November 2026 in the chat, 10:10. Board row: "Math tutored in a recognizable way … explore a new
format (a card or a day) built from an openly licensed math curriculum, before deciding" (*not fully formed*, 8 Nov;
this brief is its clarifying: on Brandon's word at stop 1 it moves to *building* as "Math practice: the proposal",
and at the close the proposal's pieces become rows on his yes). **Status: ready.**

**Size:** a job, for the exploration alone. The build is the next brief, written from what this one decides.

## Why

June's ask, 8 Nov 2026: the cards teach ideas, reading comprehension, exposure to culture, social studies and
engineering well, but they do not tutor mathematics in a recognizable way. Brandon's guess, to be confirmed or
overturned here: a new format (a card or a day), built by borrowing lessons from an openly licensed math
curriculum.

The chat's reading of why, for Code to test against the records and the cards: the puzzle slot gives one math
*idea* a day (a standard unit, a bar chart, base sixty, an array) and the card's shape is guess, clue, clue,
handoff. Arithmetic is not learned that way. It is learned by doing many of one thing with the answer checked at
once, in a sequence that builds (2 + 9 before 12 + 9 before 120 + 90), and by coming back tomorrow to what was
missed. A math question has one right answer, so the judge and the clue conversation are the wrong tools; a
"yes, next" and a "not quite, try again, then an easier one" are the right ones. None of that exists in Quark.

## Stop

1. **After reading and the survey: the proposal, for Brandon and June.** One file,
   `docs/math-practice-proposal.md`, in plain words, with every option laid out and one marked **Proposed**, as
   `docs/wonder-wall-1-slice.md`'s *To settle* was. It answers the questions below, in this order. The stop prints
   it whole. Brandon and June reply with their decisions (or "all Proposed"), and anything they want explored
   further; that is a fix round back to this stop. Then `/wwc:close`: the proposal is the deliverable; the close
   proposes the build's rows on Brandon's yes.

## Before the job (Brandon and June's hands)

1. Copy the test env file into the worktree before go:
   `! cp /c/Users/BrandonReisen/Documents/quark/.env.local /c/Users/BrandonReisen/Documents/quark/.claude/worktrees/math-practice/.env.local`.
   The survey may read test's cards and attempts (what the puzzle slot has taught so far, how the boys answered);
   nothing is written.
2. **From June, before or at stop 1, in her words:** what "tutored in a recognizable way" looks like to her (a
   worksheet? a drill? a problem a day with working shown? the school's homework?), what the school's math program
   is called and what each boy is on this quarter if she knows, and how many minutes a day of math she would want.
   The exploration is for her; her words go in the proposal's first section, quoted. The repository is public:
   nothing naming a child.

## Read first

1. `docs/12-teaching-that-tests-itself.md` (hints are earned; the session ends when the thinking stops; delayed
   recall; the hint-count dial: phase 6's plan, which this may bring forward), `docs/15-reward-engine.md` (what may
   and may not bring a child back), `docs/06-design-principles.md`, `docs/03-touch-points.md`.
2. `CLAUDE.md`, *Rules that never bend*: 3 (hints, never answers: the screen never gives the answer) and 4 (no
   engagement hooks), 7 (minimal data), 8 (effort words). The proposal must say, for each, how a practice format
   obeys it or why it needs a ruling from the parents.
3. `plan/short-lessons.yaml`, the puzzle lessons of weeks 1 to 3, and `plan/candidates/short-lessons*.md`, *What the
   school's tests lean on*: for the older (grade 3), measurement and data, shapes and fractions of shapes,
   multiplication into division, word parts; for the younger (grade 2), informational text, describing a picture,
   bar graphs. On test, `fixture -- answers` for how puzzle cards were answered.
4. `core/wall/flow.ts`, `card.ts`, `answer.ts`, `judge.ts` (how a card and an answer work today), `core/wall/words.ts`
   (the wall's sentences), `app/kid/page.tsx` (the five tiles), `lib/wall.ts`, `supabase/migrations/*` for `cards`,
   `questions`, `attempts`, `review_schedule` (phase 6's table, if it exists in the schema), `docs/04`, "How the
   Wonder Wall is built".
5. docs/08: "Where the limits on Ask are", the two inbox rows of 28 Oct (different kinds of learning so the format
   doesn't go stale; a more Socratic card), and *Checks and difficulty* (phase 6) on the board.

## The questions the proposal answers

1. **What June means**, in her words, and what "recognizable" would look like on the iPad and in the Sunday digest.
2. **What to borrow.** A survey of openly licensed elementary math curricula and problem banks, with each one's
   license as it stands on its own site, checked by Code: Illustrative Mathematics K–5 (the chat read its footer on
   8 Nov 2026: CC BY 4.0, name and logo excluded; grade 2 and grade 3 units, daily warm-ups and "centers" such as
   Target Numbers, Five in a Row, Mystery Number, Rolling for Fractions), Open Up Resources, Eureka Math/EngageNY
   (CC BY-NC-SA, which the public repository cannot carry), Khan Academy (exercises not open), and any other Code
   finds. What is borrowable is the *sequence* and the *problem types*, and the problems themselves where the
   license allows with credit; what is generated is the numbers. Which grade-2 and grade-3 units match the school's
   leanings above. How the borrowed sequence is kept in the repository (a file under `plan/`, like the library, is
   the chat's guess).
3. **What shape.** At least these, with what each costs the boys, the parents and the code: (a) a sixth tile on
   the wall every day, "Practice", five to eight problems; (b) the puzzle slot on alternate days; (c) a separate
   page off the wall the parents open with the boys; (d) a practice set at the end of each puzzle card. For the
   recommended one: how many problems, how a wrong answer is handled under rule 3 (the chat's guess: one nudge,
   then an easier problem, then a handoff to a person; the screen never shows the answer, so the proposal must say
   whether that holds for arithmetic or needs the parents' ruling), how yesterday's misses come back (phase 6's
   `review_schedule`, brought forward), how the level moves (the hint-count dial of docs/12, or something simpler),
   and whether a problem can be spoken and heard (the tutor's voice and Talk exist).
4. **Judging in code.** Numbers, fractions, units, times and money judged with no model call: what the rule is,
   what it cannot judge (a shape drawn, working shown), and what that leaves for a person. API spend expected: $0
   a day; say so.
5. **The rules.** Rule 4 with no streaks and no rewards: what makes a child do the practice, and what the parents
   see (the digest, `/parent`). Rule 3 as above. Rule 7: what is recorded (an attempt row per problem, as today).
   Rule 8: the words. The policy gate: whether arithmetic needs it (the chat's guess: no, and the proposal says why
   and what the gate would still see).
6. **Where it fits what exists.** `cards`/`questions`/`attempts` reused or a new table; the Sunday build untouched or
   not; the Saturday pick unchanged (the chat's guess: the practice runs from its own sequence file and needs no
   Saturday work, which is the point).
7. **The build, sliced.** Two or three slices in build order, each a job, with the first one small enough to be
   on the boys' iPads within two weeks, and what each slice's look would be (Where, Do, See, Pass/Fail).
8. **What this does not solve**, said plainly: a tutor that explains a method a child does not have is the Ask
   box's work (The tutor project), not practice.

## Decided already (do not reopen)

- **The eight rules stand.** Where a practice format strains one (rule 3 on arithmetic answers, rule 4 on what
  brings a child back), the proposal names the strain and offers the parents a ruling; it does not quietly bend
  the rule.
- **Open sources only**, the license read on the source's own page and quoted; nothing CC BY-NC-SA or stricter in
  the repository.
- **Keep it simple** (Brandon, 8 Nov 2026): the recommended shape is the one with the fewest moving parts that
  June would call recognizable, not the cleverest.
- **No build in this job.** No migration, no code, nothing on test or live changed; reads only. The proposal is
  the output.
- **No iPad** (22 Oct).

## Not in this job

The build (the next brief); the Ask box; the reward engine; any change to the cards, the gate or the Sunday build;
Hawaiian-language math (if the school teaches in ʻōlelo Hawaiʻi, the proposal notes it as a question for the build,
nothing more).

## Records to update at the end

`docs/math-practice-proposal.md` (new), `docs/08-open-questions.md` (a new section, "Math practice", with the
parents' decisions at the stop quoted), `docs/board.md` (the inbox row clarified; the build's rows on Brandon's
yes), `CLAUDE.md` *Where we are* (one line). `/wwc:close`.
