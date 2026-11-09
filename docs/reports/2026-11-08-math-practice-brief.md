# Report: math practice, the proposal (`docs/math-practice-brief-slice.md`), 8 November 2026

Phase 4, an exploration, not a build. It ran in the worktree branch `worktree-math-practice` and was merged into
`phase-4-wonder-wall` at the close. Closed and held: `/wwc:close` at the last stop, 8 Nov, 16:39 HST.

- **The deliverable:** `docs/math-practice-proposal.md`, decided in full.
- **Nothing else changed:** nothing built, nothing on test or live, and no API money spent.
- **Size clock:** about an hour on a job sized at 4:
  - 21 minutes to stop 1;
  - 3 from the first go;
  - 14 in fix round 1;
  - 8 from the second go;
  - the close.

## What could not be checked

- **Test's cards and attempts were not read.** The test env file was not copied into the worktree (*Before the
  job* 1). Nothing depended on them:
  - the 18 puzzle lessons' summaries in `plan/short-lessons.yaml` say what the puzzle slot has taught;
  - test's answers are an invented child's, not the boys'.
- **Five history and licence lines the fact check could not confirm:**
  - **Bachet's race to 100** was not found in his own text. It stays as a return costume, marked to be checked
    against his book in the build, or swapped.
  - **Loyd's vanishing puzzle:** its year and title were not confirmed. The proposal says only that he patented
    one in 1896.
  - **The 2023 Progressions:** their open licence was not confirmed this time, and the Arizona page says "All rights
    reserved". So F1 takes the floor's nudges from the standards themselves, and the Progressions are not used.
  - **The Rhind papyrus:** no online copy of Peet's (1923) or Chace's (1927 to 1929) translation was found.
  - **Alcuin's ladder of pigeons:** his own Latin solution was not read. ProofWiki's pairs the steps.

  C7 has the build check every history line before it ships.
- **Read, not run.** The proposal says a theme's puzzle day needs no code, because `weekSchedule()` takes a slot's
  next unused lesson only on the days the thread leaves it. That was read from `worktree-theme-a-week`, which is not
  merged.
- **The board page** was not rebuilt (a side worktree skips it).

## The stops, and Brandon's words

1. **Stop 1 (11:39):** the first proposal, one strand: a sixth tile, Practice, ordered from Illustrative
   Mathematics' first edition.
2. **Go (12:32), with June's answers:**
   > go, out of order. All Proposed, with one change from June's answers: slice 2 drops the word problems, or puts
   > them last; the focus is the math, not reading a question.
   >
   > June's words:
   > Q1: "Answering multiple math problems where the focus is on the math, not interpreting a verbal question."
   > Q2: "They haven't told us the name, but they don't solve problems the way I did 30 years ago. I would guess
   > Common Core is right." So the nudges follow the Common Core methods the school uses (make a ten, number lines,
   > arrays), from the Progressions.
   > Q3: "Probably 5 is about right." Eight problems stands.
   > Q4: "No. English."
3. **The last stop (12:35).**
4. **Fix round 1 (15:51):**
   > Not closed yet; a fix round. June and I talked it through. Rewrite the proposal with two strands, built in this
   > order:
   >
   > Strand 1, first: the puzzle slot becomes a math circle. One real problem a day with a mathematical idea inside it
   > (parity, invariants, fair sharing into fractions, counting two ways, estimation), from a progression of ideas
   > kept in a file, each problem about something someone actually built or figured out, with the person and the
   > history in it; the hint conversation and the handoff do the teaching; the same idea comes back weeks later in a
   > new costume. Sources: the public-domain puzzle literature (Dudeney, Loyd, Carroll) and the thread themes. No
   > publisher. No new tile.
   >
   > Strand 2, later: the fluency floor, five minutes, as the Practice tile was proposed, but with no Illustrative
   > Mathematics anywhere; the order from the grade standards, written by Code, the nudges in the school's methods.
   >
   > The frame, for docs/08: we prepare them for the future the way Walt Disney thought of it, as a place of progress
   > and opportunity for people willing to look closely and try, where ingenuity and faithfulness to tradition build
   > something better. Math is the tool of people who make things. The older boy starts a real math circle on
   > Saturdays; the younger is too young for it, so this is his.
5. **Stop 1 again (16:05):** the proposal in two strands.
6. **Go (16:32):**
   > go. All Proposed. One addition to C3: a check in the build that every number and accepted answer in a circle
   > card matches the file, not just the prompt asking for it; a card that differs is held back like a gate failure.
7. **The rows (16:38):**
   > Yes to the four rows: the circle's slice 1 at next, the next-block row and the floor at later, the rest at
   > someday.
8. **`/wwc:close` (16:39).**

## What was done

- **The proposal, `docs/math-practice-proposal.md`.** It answers the brief's eight questions in order, decided in
  full:
  - **Strand 1, first, the math circle.**
    - The puzzle slot's card becomes one real problem a day about someone who built or figured something out. Its
      four layers are a circle session in small, the hints are a leader's questions, and the handoff gives the child
      something to do with a parent.
    - The problems come from `plan/math-circle.yaml`, each whole, with four steps and their answers read once by a
      parent.
    - A card check in code holds back any card whose numbers or accepted answers differ from the file.
    - The rhythm is blocks of six weeks, each idea back three weeks later in a new costume. It is for both boys,
      pitched at the younger.
    - A theme may keep one puzzle day as a circle problem.
    - It needs one migration (a `steps` column), the Saturday pick at 22 lessons, and no new spend.
  - **Strand 2, later, the fluency floor.** The sixth tile as decided at 12:32, its order from the Common Core grade
    codes, written by Code, and its nudges from the strategies the standards name. No publisher and no Illustrative
    Mathematics.
  - **A first progression:** twelve ideas, each with a first costume and its return, from the Rhind papyrus,
    Alcuin, Archimedes, Euler, Dürer, Dudeney, Loyd, Carroll, Bachet, Fibonacci, Thales and Eratosthenes, with six
    more named.
  - **One day worked whole:** Ahmes's loaves.
- **The survey of curricula (round one):** Illustrative Mathematics' two editions, Open Up, Eureka Math, Khan
  Academy, CK-12, Open Middle, the Progressions, the Common Core and others, each licence read on its own page. It
  is kept in git at `358b00b` and not used, since round two takes no publisher.
- **The fact check (round two):** 18 items, read on each source's own page by an agent (web pages only). Its
  corrections are in the proposal:
  - Tartaglia is not shown to have set the 8, 5 and 3 jugs, so he is out.
  - Bachet's weights are in his second edition, 1624.
  - The Gauss story's 1 to 100 is not in its 1856 source, so Alcuin's ladder (about 800) stands in.
  - The Egyptian 3, 4, 5 rope is Cantor's guess of 1882.
  - The Common Core's arrays are in 3.OA.A.3, not 3.OA.A.1.
- **The records:**
  - docs/08: a new section, "Math practice", with the frame, June's four answers and every decision, each with
    what it replaced; and one bug line, the worktree branch made from `main`.
  - `docs/board.md`: four rows, on Brandon's yes (below).
  - CLAUDE.md *Where we are*: one bullet, and the Next line.
  - The README status is unchanged: nothing reached the boys.

## The board

On Brandon's yes, 16:38:

- **Math circle, slice 1:** `next`, third in Next under Wonder Wall slice 2 and Vercel preview deployments. It
  depends on *A theme a week*, whose schedule code it builds on. The top of Next is Brandon's to reorder.
- **The math circle's next block:** `later` (an hour; a standing row).
- **The fluency floor, slice 2:** `later` (a job).
- **The floor's fractions, time, money and units, and word problems, only if the parents ask:** `someday`.

The three rows at `next` and `later` name the *Wonder Wall* project (phase 4, the brief's phase): the circle changes
a Wonder Wall card and the floor adds a Wonder Wall tile. So Wonder Wall has two rows at `next` for now. A project of
its own, *Math practice*, is one row on Brandon's word.

The idea row these clarify, "Math tutored in a recognizable way…", is only on `worktree-theme-a-week` (`20238f9`).
When that branch merges, its row is deleted.

## Beyond the brief, for Brandon

- **A worktree brief's branch** (a bug line in docs/08, tooling, minutes). `claude --worktree math-practice` made
  the branch from `main` (`1f2dc5c`), 25 commits behind the phase branch the brief names. Go's pull brought it there.
- **`attempts` and `review_schedule` cannot serve the floor.** `attempts.question_id` is not null, and
  `review_schedule` points at `questions`, so the floor has its own `practice_answers` table (decided).
- **`children` holds no grade or math level.** So a parent sets each boy's first floor step on `/parent`.
- **`/parent/week` shows no card's answers today.** A parent called over at a handoff has nothing to look at, which
  is C8.
- **Strand 1 needs little that is new.** A card already takes its accepted answers from the idea chain
  (`core/curation/cards.ts`), and a topic's `parentNote` already becomes the first handoff.

## On live

Nothing.

## Money

$0 of API money: no model, voice or database call. The survey and the fact check read web pages through this
session's agents.

## Not done

- **No build:** the next brief is *Math circle, slice 1*, at `next`.
- **The brief had one stop, the proposal, and it is decided.** No check of the brief is left.

## The merge into `phase-4-wonder-wall`

- **At the close:** `worktree-math-practice` was pushed to `origin/phase-4-wonder-wall` as a fast-forward from
  `3c6b314`, and `worktree-math-practice` itself was pushed.
- **For the main checkout** (the week 3 job):
  - Its local `phase-4-wonder-wall` is now behind `origin`. Its close pulls first, as every close does.
  - **First delete the main checkout's untracked `docs/math-practice-brief-slice.md`.** It is byte for byte the
    committed copy, checked at the close, and a pull that would overwrite an untracked file is refused.
  - Three record files may need merging by hand:
    - the board (one row under Vercel preview deployments, two under the calm end, one under Checks and difficulty);
    - CLAUDE.md's *Where we are* (a clause in its lead and a last bullet);
    - docs/08 (a section before "How the tutor sounds", and a bug line at the top of *Bugs*).
- **For `worktree-theme-a-week`:**
  - when it merges, delete its inbox row "Math tutored in a recognizable way…";
  - its board edits may need merging by hand beside these rows.

## Commits

See the commit list printed with this report at the close:

- `358b00b`: the brief, stop 1 and go, the proposal decided;
- `3cf0259`: fix round 1, the proposal in two strands;
- `69c6a32`: Euler's bridges, worded;
- `9d422b0`: go after fix round 1, the card check;
- `f5ab4c7`: the rows' yes;
- the close's own commit.

Cost: not read.
