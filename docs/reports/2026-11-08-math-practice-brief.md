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
