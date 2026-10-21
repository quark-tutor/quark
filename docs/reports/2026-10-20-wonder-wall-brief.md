# Report: the brief for phase 4 slice 1, the Wonder Wall a kid can use (`docs/wonder-wall-1-slice.md`), 20 October 2026

Job: `/wwc:job`, writing the brief for Wonder Wall slice 1 and its board row; closed with `/wwc:close`. Branch:
`phase-4-wonder-wall`, new, made from `phase-3-curation` at `1bb496b`, pushed. Opus 5.5. Nothing built, nothing on
live, nothing to `main`, nothing spent, nothing set on Vercel.

Brandon's words this job:

- In the command, dated for the brief and docs/08: "the road is slice 1 → the iPads → the pilot, so slice 1 is
  the minimum a kid can use, not the whole of phase 4"; "13 Oct 2026: nothing goes live on its own; a week
  reaches a child only after a guardian's tap"; "20 Oct 2026: the direct-write migration (guardians lose update
  on themes, ideas, cards, questions and insert on audit_log; the server keeps them) lands in this slice, before
  any theme is made live on live"; "Rules 3 and 4 are not negotiable"; "Rule 7: the kid routes carry nothing
  about the child to the browser beyond the nickname, and no model prompt is built in slice 1."
- During step 1: "the target is the boys using it on Monday 26 October. Size slice 1 to that, say what has to be
  true by then and what to cut if it doesn't fit. Add to the brief a section 'The week for Monday': live week 1
  started 19 October and has one day, so the boys need a seven-day live week starting 26 October; propose how it
  is built (week:build:live with --start 2026-10-26, about $13, after the existing live week 1 is deleted, each a
  live command at its own STOP by my hand), when (Saturday, so a guardian can read it and tap on Sunday), and
  what the library's 28 lessons being all in week 1 means for it (it is week 1 again; the plan reorder on live is
  Brandon's to check). Say which of the week-ready checks are mine and June's."
- At step 1: "go, taking all of these, with two changes: (1) take cut 1 now: no next-day layer in slice 1; the
  docs/04 rule stays "its day is today", commit (f) goes, and the carry-over is a slice 2 row; (2) in judgeGuess,
  on a question whose accepted answers are a choice of two, a guess that contains both choices is not right.
  Everything else as recommended: the branch from phase-3-curation at 1bb496b; a card is done at the handoff, a
  right answer finishes a layer; layer 1 right before layer 2; "I don't know" gets no hint; typed answers with
  the keyboard's dictation as our setting; "Read it to me" never automatic; the migration with insert and
  sessions and attempts, the five audit writes moved, the release before M1; the proof week on test with
  pictures, about $15; recordings from Wikimedia's copy for now, a board row to store them; the live delete by my
  hand in the SQL editor at M2; one build session with the cut list. Add a board row for the 28 short lessons
  needed before 31 October (raised, phase 3, Brandon and June). Then /wwc:close."

## Couldn't check

- **Live, not read:** live week 1's start (19 October) and its one day are Brandon's words, not read; whether
  live's plan carries test's 20 October reorder is left to stop M3; the live rulebook since 20 October.
- **Vercel, not read:** the production environment, whether the eight cron entries are registered, and the
  Supabase plan (so the brief does not assume image resizing in Storage).
- **The matcher's misjudgement rate** comes from day 1's 20 questions and accepted answers only (test's week 1,
  built 20 October, read from the build's local debug copy), not from children's answers. Step 1 of the build
  measures it over the whole test week with invented answers. The rule for finding a choice of two's two sides
  is not written yet; step 1 shows it.
- **iPad behaviour** is from what I know, not tried: speech synthesis in a Home Screen app, the keyboard's
  dictation key under Guided Access, and the dev server over the home Wi-Fi (`allowedDevOrigins`). Step 3 of
  the build tries them.
- **`/cost`** I can't run; Brandon types it and the figure goes at the end of this file.

## What was done

- **Step 1 (read only, then a stop).** Read CLAUDE.md; docs/03, 04, 06, 08, 12, 13, 15, 17; the board; the
  looks-good brief and its brief report, the looks-good slice report, the release report; deploy/README; the kid
  view and pairing code; the first migration and the device, grants, week-build, model-runs and mixed-weeks
  migrations, and the blackball policies; `core/curation/cards.ts`, `types.ts`, the start and rebuild logic in
  `week-job.ts` and `week.ts`; `core/content/credit.ts`; the week page; every `audit_log` write under `app/` and
  `lib/`; `card.md`, `manner.md`, the conduct keys, the fixture's commands, the prices, and the migrations
  workflow's triggers. Day 1's questions, accepted answers, hints and handoffs were read from the local debug copy
  of test's 20 October build (invented children), by a scratchpad script that printed no name. The draft brief
  went to the scratchpad, and the step 1 state to this file before it was printed.
- **On go:** the branch, cut from `1bb496b` (the branch was new, so there was nothing to pull); the board row
  committed alone (`7758a50`); the brief written from the draft with Brandon's two changes and committed
  (`0e62662`); the branch pushed with its upstream set. The push changed no migration, so it started no
  migrations run (`gh run list --workflow migrations.yml --branch phase-4-wonder-wall --limit 1` showed none).
- **The brief** (`docs/wonder-wall-1-slice.md`):
  - **Sized for Monday 26 October:** what has to be true, a calendar (the build on Wednesday, the proof on
    Thursday, the close, the release and M1 on Friday, M2 to M4 on Saturday, the tap and the iPads on Sunday),
    and four cuts in order (the one-letter slip, the session's end time, pictures in the test proof, then layers
    2 to 4). Cut 1 is already taken: no next-day layer.
  - **Eight decisions:**
    1. What a kid can do.
    2. Answers judged in code by `judgeGuess()`, with Brandon's choice-of-two rule. On day 1: 5 of 20 questions
       are open (every layer 4), 7 are judged well, 6 are a choice of two, and 2 are explanations it mostly
       misjudges. Typed answers, with the keyboard's dictation.
    3. What is recorded: `sessions` and `attempts` only, each reply held to a field list.
    4. The read path and its tests, and the migration written out, with five `/parent` audit writes moved to
       the server.
    5. The layout and the wall's own sentences.
    6. Nothing new on `/parent`, apart from two week-page sentences.
    7. The build's stops.
    8. The week for Monday.
  - **The week for Monday:** stops M1 (`db:push:live`, after the release), M2 (live week 1 deleted by SQL in the
    live project's editor, by Brandon's hand, which cannot be undone), M3 (`--plan`, the reorder check) and M4
    (the build, about $13). Then a guardian's read and tap on Sunday, and the iPads. Who checks what: Brandon,
    June, or either guardian.
- **The records (this close):**
  - CLAUDE.md's *Where we are*: the headline, the *Next* bullet as the Monday calendar, and a bullet for this job.
  - The README status line: phase 3 done, the Wonder Wall's first slice planned for the kids' first week from
    26 October.
  - docs/08: *Wonder Wall, slice 1: decided in the brief*, seventeen *Decided:* lines and one open line for June.
  - The board:
    - The slice 1 row, at *briefed*.
    - The Wonder Wall heading row, saying slice 1 is briefed.
    - Four new rows: the boys' first live week; the 28 short lessons before 31 October (raised, phase 3, Brandon
      and June); slice 2's next-day layer; stored recordings.
    - Moved: the direct-write row and the content:fetch-on-test row to *briefed* (both are inside this brief);
      the lens-plan row's Waiting on (slice 1 doesn't feed the picker); the pilot row's Waiting on (the road).
  - `npm run docs:board` wrote `Quark board.html`: Next 4, Raised 14, Not fully formed 9, Live lately 10, Bugs 5.
- No spec page's *How it is built* changed: nothing was built. The docs/04 rule stays "its day is today".

## Beyond the brief, and found along the way

- **Local `main` is 137 commits behind `origin/main`** (`d9bd970` against `9694b58`). The release's two record
  commits were only on `phase-3-curation`, so the branch was cut from `1bb496b` rather than from `main`. Those
  two commits reach `main` with phase 4.
- **CLAUDE.md's stack line says the kid view uses "a scoped key that can only read today's passed cards and
  write attempts"**, and so does the first migration's comment. docs/13 and the code say it holds no key. Left
  for the build's close to fix, as the brief says.
- **Five `/parent` audit writes go through the guardian's own session.** The forget-an-iPad write ignores its
  error. The migration would break all five, so they move in the same commit (decision 4).
- **The decided migration covered update but not insert,** so it is widened (settled).
- **Every layer 4 on day 1 has no accepted answers.** `card.md` v5 writes every question to be answered "by
  voice".
- **A fetch adds no pictures to cards already written.** Test's week 1 starts 26 October, so its wall would be
  empty on the proof day; hence the proof week is rebuilt (about $15 on test).
- **`--rebuild` keeps a week's start date,** and the fixture's `delete-week` has no live twin; hence M2's SQL.
- **`attempts.question_id` has no cascade,** so once a child has answered a week, it can't be deleted or rebuilt.
  Kept as it is.
- **The lens picker reads no history** (`history: {}`), so the lens-plan row's trigger moved.
- **Recordings aren't in the bucket,** so the wall plays them from Wikimedia (settled for now; a board row).
- **The job skill says to write no file before go; the brief asked for the step 1 state in this file first.**
  This file was written untracked before the print, and nothing else in the repository changed before go.
- **`/wwc:close` is user-only.** I tried to start it from the job and it refused, so Brandon typed it.
- **The session left plan mode before step 1 and ran on Opus 5.5,** not `opusplan`. The step was read only, apart
  from this file and the scratchpad draft.
- **No backstop ask is known to have fired.** Claude Code can't see prompts. Nothing this job ran matches a
  backstop pattern: the one push was to `phase-4-wonder-wall`, and no `:live` script, secret file or `git add -A`
  was used.

## On live

Nothing. No live command was run, no live file was read, and nothing a child can see changed. The brief's live
steps (M1 to M4) are for a later session, each at a stop by Brandon's hand.

## Commits this job

- `7758a50` Board: Wonder Wall slice 1 briefed, and the Wonder Wall heading row says so
- `0e62662` Brief for Wonder Wall slice 1: the wall a kid can use, sized for Monday 26 October, with the week for
  Monday
- The close's commit: CLAUDE.md, README.md, docs/08, the board and this report.

## Cost

`/cost`, typed by Brandon at the close: **$8.44** for the session (Opus 5.5 $8.24, Sonnet 5.5 $0.19 for the
read-back, Haiku 5.5 $0.0005); 23 minutes 22 seconds of API time, 56 minutes on the clock. This is Claude Code's
own cost, not Quark's API spend (none this job).
