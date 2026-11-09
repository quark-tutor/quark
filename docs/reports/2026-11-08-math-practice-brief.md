# Math practice: the proposal (report)

Brief: `docs/math-practice-brief-slice.md` (untracked in the main checkout when the job began). Worktree
`.claude/worktrees/math-practice`, branch `worktree-math-practice`. Size: a job. Begun 8 Nov 2026, 11:18 HST.

## Stop 1: the proposal, for Brandon and June (8 Nov 2026, 11:39 HST)

**Where the job stands.**

- The reading and the survey are done, and the proposal is written: `docs/math-practice-proposal.md`, printed whole
  after this report. It is the brief's one stop, so it was written before go; nothing else is changed.
- Nothing is built, nothing on test or live is touched, and no API money was spent (the survey read web pages only).
- The records and code were read from `origin/phase-4-wonder-wall` (`3c6b314`), not from this worktree, which was
  made from `1f2dc5c`, 25 commits behind it.
- Not read: test's cards and attempts. The test env file is not in this worktree (*Before the job* 1). Nothing
  depends on it: the 18 puzzle lessons' summaries in `plan/short-lessons.yaml` say what the slot teaches, and test's
  answers are an invented child's (Bug's), not the boys'. The boys' answers are on live, which this brief does not
  read.
- June's words (*Before the job* 2) are not in yet. Section 1 of the proposal asks her four questions and marks the
  guesses it was written on.

**The brief, checked.**

- One stop, the proposal. Risky steps: none (no live database, no money, no real person, nothing a child sees, no
  secret). Nothing for Brandon's eyes but the proposal itself, so no *Your look* stop is needed. No step after go
  needs Brandon's hands, and no planned command meets the deny list.
- The branch: the brief names `math-practice`; this is `worktree-math-practice`, the name
  `claude --worktree math-practice` gave it. On go, first `git pull --rebase origin phase-4-wonder-wall`. This branch
  has no commits of its own, so it moves forward 25 commits, and the close's merge carries no stale records.
- The board: the brief's row ("Math tutored in a recognizable way…", *not fully formed*) is on neither this branch
  nor `phase-4-wonder-wall`. It was added by the idea commit `20238f9` on `worktree-theme-a-week` (8 Nov, 09:02),
  which is not merged yet. The job never adds a row, so on go its move to *building* is skipped. At the close, the
  proposal's slices become rows on Brandon's yes, written where the inbox row is by then.
- The row is in the Inbox, not at the top of Next (Wonder Wall slice 2 is), so this job runs out of order, which needs
  Brandon's word at this stop. In hand: A theme a week (*building*, on `worktree-theme-a-week`), Weeks 2 and 3 on live
  (*building*), the tutor's lines made ahead (*on hold*, waiting on Sunday 8 Nov's release).
- The brief is untracked in the main checkout. On go it is copied here and committed with this report and the
  proposal. When this branch is merged into the phase branch at the close, the main checkout's untracked copy will
  block that merge there until it is deleted.
- Size: a job (4 hours); about 20 minutes at this stop.

**For Brandon and June.**

1. **Out of order.** Take this job ahead of Wonder Wall slice 2? Recommended: yes; it reads only and spends nothing.
   On yes: the go steps above.
2. **June's four questions** (the proposal, section 1). Recommended: her answers in her words, now or in a fix round.
   On go without them, section 1 keeps the guesses marked as guesses, and the close records her words as still to
   come.
3. **The twelve decisions, D1 to D12** (the table at the end of the proposal). Recommended: all Proposed. On yes, each
   is marked decided in the proposal with your words; at the close they go to docs/08's new section, "Math practice",
   and the slices become board rows on your yes.
4. **Anything you want explored further** is a fix round back to this stop.

Reply go to take all of these. The board method needs your own word for item 1, so "go, out of order" takes it.

## Go (8 Nov 2026, 12:32 HST)

Brandon, with June's answers:

> go, out of order. All Proposed, with one change from June's answers: slice 2 drops the word problems, or puts them
> last; the focus is the math, not reading a question.
>
> June's words:
> Q1: "Answering multiple math problems where the focus is on the math, not interpreting a verbal question."
> Q2: "They haven't told us the name, but they don't solve problems the way I did 30 years ago. I would guess Common
> Core is right." So the nudges follow the Common Core methods the school uses (make a ten, number lines, arrays),
> from the Progressions.
> Q3: "Probably 5 is about right." Eight problems stands.
> Q4: "No. English."

**Done on go.**

- `git pull --rebase origin phase-4-wonder-wall`: a fast-forward from `1f2dc5c` to `3c6b314`.
- The brief copied from the main checkout, committed here with this report and the proposal.
- The board row's move skipped: the row is not on this branch (it is on `worktree-theme-a-week`, `20238f9`).
- The decisions written into `docs/math-practice-proposal.md`: a *Decided* paragraph under its heading, June's
  words quoted in section 1 with what each answer settles, slice 2 without word problems, a fourth slice ("last, only
  if the parents ask: word problems"), the nudges in the school's Common Core methods, and the decisions table's
  column now *Decided (8 Nov 2026)*, with D2, D4, D7 and D12 as they now read. The options stay as they were offered.

**How the change was read.** "Drops the word problems, or puts them last" is taken as both: they are out of slice 2,
and they come last, after slice 3, only if the parents ask. "Read it to me" on practice goes with them, since it was
proposed for word problems (D7 now: not in slices 1 to 3).

**Found, for Brandon** (nothing here to build; the close can add the first as a bug line):

- `claude --worktree math-practice` made the branch from `main`'s `1f2dc5c`, not from `phase-4-wonder-wall` as the
  brief says; the go step's pull put it right here. Tooling: a worktree brief's go, or its *Before the job*, should
  say so.
- `attempts.question_id` is not null, and `review_schedule` points at `questions`: practice can use neither without
  making card rows, so D10 is a new table.
- `children` holds no grade or math level, and June does not know each boy's unit this quarter, so a parent sets
  each boy's first step on `/parent` (slice 1).

## The last stop (8 Nov 2026, 12:35 HST)

The brief's work is done: the proposal is decided and committed. There is nothing for Brandon's eyes but the proposal
itself, so there is no *Your look*. Nothing is built, nothing on test or live is touched, and no API money was spent.
Size: a job (4 hours); about 25 minutes in all (21 to stop 1, 3 from go).

**For the close** (the brief's *Records to update at the end*):

- docs/08: a new section, "Math practice", with the decisions above and Brandon's and June's words quoted.
- The board: the inbox row clarified, and the build's rows on Brandon's yes. Proposed rows, in build order:
  1. Math practice, slice 1: whole numbers on the wall, a sixth tile with eight problems a day (a job; `next`).
  2. Math practice, slice 2: fractions, time, money and measurement, and two problems a set from steps passed (a
     job; `later`).
  3. Math practice, slice 3: spaced return, Talk on practice, the block in the digest (a job; `later`, depends on
     phase 5 for the digest).
  4. Math practice, last and only if asked: word problems with "Read it to me" (a job; `someday`).

  The inbox row is only on `worktree-theme-a-week`, so the rows land cleanly only once that branch is merged into
  `phase-4-wonder-wall`; otherwise the close names them for that merge.
- CLAUDE.md *Where we are*: one line.
- The merge into `phase-4-wonder-wall`: the main checkout's untracked copy of the brief must be deleted first, or the
  merge there refuses.

## Fix round 1 (8 Nov 2026, 15:51 HST)

Not closed: a fix round back to stop 1. Brandon:

> Not closed yet; a fix round. June and I talked it through. Rewrite the proposal with two strands, built in this
> order:
>
> Strand 1, first: the puzzle slot becomes a math circle. One real problem a day with a mathematical idea inside it
> (parity, invariants, fair sharing into fractions, counting two ways, estimation), from a progression of ideas kept
> in a file, each problem about something someone actually built or figured out, with the person and the history in
> it; the hint conversation and the handoff do the teaching; the same idea comes back weeks later in a new costume.
> Sources: the public-domain puzzle literature (Dudeney, Loyd, Carroll) and the thread themes. No publisher. No new
> tile.
>
> Strand 2, later: the fluency floor, five minutes, as the Practice tile was proposed, but with no Illustrative
> Mathematics anywhere; the order from the grade standards, written by Code, the nudges in the school's methods.
>
> The frame, for docs/08: we prepare them for the future the way Walt Disney thought of it, as a place of progress
> and opportunity for people willing to look closely and try, where ingenuity and faithfulness to tradition build
> something better. Math is the tool of people who make things. The older boy starts a real math circle on
> Saturdays; the younger is too young for it, so this is his.

**Done.**

- **The proposal, rewritten** in two strands, in the brief's eight sections and in order. It keeps June's four
  answers and quotes Brandon's words whole under *Decided*. What stands from 12:32 is now strand 2's. Illustrative
  Mathematics is gone, and so is every publisher in the survey. The first version is at `358b00b`.
- **Read for strand 1's fit** (from `origin/worktree-theme-a-week`, not merged):
  - `weekSchedule()` on that branch;
  - the Moon's file (one topic on the puzzle slot, "Distance, and about thirty Earths");
  - `docs/saturday-pick-slice.md` (28 short lessons a Saturday; the Moon's week takes 6 on the puzzle slot);
  - the 18 puzzle lessons of weeks 1 to 3;
  - `card.md` v6 and `ideas.md` v5;
  - `core/curation/ideas.ts` and `cards.ts` (a card takes its accepted answers from the idea chain; `parentNote`
    already becomes the first handoff);
  - `plan_topics` in the migrations (one `summary` a row, so the four steps need a column).
- **A fact check of every source and history line**, by an agent reading the sources' own pages (web only, $0 of
  API money). The proposal uses only what it confirmed, with these corrections:
  - Tartaglia is not shown to have set the 8, 5 and 3 jugs, so he is out. A Dudeney crossing takes that place.
  - Bachet's race to 100 was not found in his text. It stays as a return costume, marked to be checked in the build
    or swapped.
  - Bachet's 1, 3, 9 and 27 weights are in his second edition, 1624, not 1612.
  - The year and title of Loyd's vanishing puzzle were not confirmed. Only "he patented one in 1896" is used.
  - The Gauss story's 1 to 100 is not in its first source (1856), so Alcuin's ladder of pigeons (about 800)
    replaces it.
  - The Egyptian 3, 4, 5 rope is Cantor's guess of 1882, with no evidence. It is named as a caution.
  - The Common Core's 3.OA.A.1 names equal groups; arrays are in 3.OA.A.3.
  - The 2023 Progressions' CC BY line could not be confirmed this time; the Arizona page says "All rights
    reserved". So F1 takes the floor's nudges from the strategies the standards themselves name, and the Progressions
    are not used.
- **Pushed:** not yet; with this stop's commit.

**Found, for Brandon:**

- **The circle can run with almost no new machinery.** `weekSchedule()` already takes a slot's next unused lesson,
  in file order, only on the days the theme leaves it. So the circle's problems ride the puzzle slot's queue, and a
  theme's puzzle day makes the file wait a day by itself.
- **The new pieces are few:**
  - one migration (a `steps` column on `plan_topics`, live at a stop by Brandon's hand);
  - `writeIdeaChain()` taking the puzzle chain from the file, not a model;
  - a circle section in `card.md`;
  - the Saturday pick's count, 22 lessons, not 28.
- **The parents cannot see a card's answers today.** `/parent/week` shows none. So a parent called over at a
  handoff has nothing to look at: C8.

## Stop 1 again: the proposal in two strands (8 Nov 2026, 16:05 HST)

**Where the job stands.**

- `docs/math-practice-proposal.md` is rewritten in two strands, the circle first. It is printed whole after this
  report.
- Nothing is built, nothing on test or live is touched, and no API money was spent.
- Size: a job (4 hours). About 40 minutes in all: 21 to stop 1, 3 from go, about 15 in this round.

**For Brandon and June.**

1. **The eleven open choices, C1 to C9, F1 and B1** (the table at the end of the proposal). Recommended: all
   Proposed. On yes, each is marked decided in the proposal with your words. Then the last stop.
2. **Anything to explore further** (another idea in the table, a costume swapped, the rhythm) is another fix round
   back to this stop.

Reply go to take all of these.

**For the close, after your reply** (replacing the last stop's list):

- docs/08, a new section, "Math practice":
  - the frame, in Brandon's words;
  - June's four answers;
  - both rounds' decisions.
- The board: the inbox row clarified, then rows on Brandon's yes:
  1. Math circle, slice 1: the puzzle slot becomes a math circle (a job; `next`).
  2. The circle's next block, every three weeks (a standing row, an hour; `later`, due before the circle's week 4).
  3. The fluency floor, slice 2: whole numbers on a sixth tile (a job; `later`).
  4. The floor's fractions, time and money, and word problems, only if the parents ask (`someday`).

  The inbox row is only on `worktree-theme-a-week`, so the rows land cleanly once that branch is merged into
  `phase-4-wonder-wall`.
- CLAUDE.md *Where we are*: one line.
- Before the merge into `phase-4-wonder-wall`, the main checkout's untracked copy of the brief is deleted.

## Go (8 Nov 2026, 16:32 HST)

Brandon:

> go. All Proposed. One addition to C3: a check in the build that every number and accepted answer in a circle card
> matches the file, not just the prompt asking for it; a card that differs is held back like a gate failure.

**Done on go.**

- `phase-4-wonder-wall` has not moved since the first go (`3c6b314`), so the pull had nothing to bring.
- The proposal now records the decisions:
  - a *Decided* paragraph quoting Brandon's go;
  - the strand 1 line of *In short*;
  - the decisions table, now *Decided after fix round 1*, with C3's addition in Brandon's words.

  The options are kept as they were offered.
- **C3's addition**, written into four sections:
  - **Section 3:** every number in a circle card (text, question, hints, handoff, with number words read as
    numbers) must appear in its problem in the file, and its accepted answers must be the file's. A card that differs
    is `blocked`, with the reason in `cards.policy_notes`, so the parents see it on the week page before Looks good.
  - **Section 5:** rule 5.
  - **Section 6:** the card check runs before the gate, spends nothing, and has a test that changes a number and
    sees the card held back.
  - **Section 7:** in slice 1, never on its cut list; the look's *See* adds the test and the count of test's circle
    cards it held back.

## The last stop (8 Nov 2026, 16:40 HST)

The brief's work is done: the proposal is decided and committed. There is nothing for Brandon's eyes but the
proposal itself, so there is no *Your look*. Nothing is built, nothing on test or live is touched, and no API money
was spent (the fact check read web pages only).

Size: a job (4 hours); about 50 minutes in all:

- 21 minutes to stop 1;
- 3 from the first go;
- about 15 in fix round 1;
- about 8 from this go.

**For the close** (the brief's *Records to update at the end*):

- **docs/08**, a new section, "Math practice":
  - the frame, in Brandon's words;
  - June's four answers;
  - the decisions of both rounds and this go, C3's addition among them.
- **The board:** the inbox row clarified, and rows on Brandon's yes, in build order:
  1. Math circle, slice 1: the puzzle slot becomes a math circle, with the card check (a job; `next`).
  2. The circle's next block, every three weeks (a standing row, an hour; `later`, due before the circle's week 4).
  3. The fluency floor, slice 2: whole numbers on a sixth tile (a job; `later`).
  4. The floor's fractions, time and money, and word problems, only if the parents ask (`someday`).

  The inbox row is only on `worktree-theme-a-week`, so the rows land cleanly once that branch is merged into
  `phase-4-wonder-wall`. Otherwise the close names them for that merge.
- **CLAUDE.md** *Where we are*: one line.
- **The merge** into `phase-4-wonder-wall`: the main checkout's untracked copy of the brief is deleted first, or the
  merge there refuses.
