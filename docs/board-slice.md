# Working with Claude, Quark: the state board and the seven session skills

Brief settled with Brandon on 17 October 2026, in the chat, from PDERP's two
board briefs (`pderp-release/docs/state-board-slice.md` and
`state-board-slice-2.md`) and the review *Working with Claude: the map, what
works, what doesn't* (16 October, `pderp-release/docs/working-with-claude-review.md`).
One job, one Claude Code session on Sonnet, in `quark`, on a new tooling
branch `working-with-claude-2` made from `main` at the go (slice 1's branch
`working-with-claude` is already merged). Nothing here touches a screen, a
card or the database; it is tooling, not phase work, and is merged to `main`
when it runs. Phase 3 stays where it is on `phase-3-curation`.

## Why

PDERP has had a state board since 16 October: `docs/board.md`, one row per
feature with its stage, and a page written beside the Word copies that
Brandon opens before choosing what to work on. It answered the gap the
review found, that the records say what was built and decided but not
where everything stands. Quark has the same gap and less to cover it: its
"what next" lives in CLAUDE.md's build order and *Where we are* note, in
`docs/08-open-questions.md`, and in Brandon's head.

The review's job 3, the seven session modes as skills, was built on PDERP
the same afternoon (`/idea`, `/ask`, `/job`, `/side`, `/bugs`, `/sweep`,
`/close`) and is still pending on Quark as of 17 October. Quark has only
`/readback` (slice 1). So a Quark session still starts from a pasted prompt,
a bug is still a hand-written line, and a job still closes however the
prompt happened to say.

This job gives Quark both, by copying PDERP's rather than inventing: the
board file, its export script and page, and the seven skills, each adapted
to Quark's records (there is no as-built, no decisions log, no to-test; the
spec pages, CLAUDE.md's *Where we are* note and docs/08 are the records) and
to Quark's branch-per-phase rule.

## Decided by Brandon, 17 October 2026, for the record

Quark has no decisions log yet; these go as *Decided:* lines under *How
Quark is built with Claude* in `docs/08-open-questions.md`.

- **One board per repository.** Quark gets its own `docs/board.md`, a copy
  of PDERP's with Quark's name and stages. The two boards are never merged
  and never read each other. *New.*
- **No Word copies.** Quark's `npm run docs:board` writes `Quark board.html`
  only; there is no `docs:word` and none is added. *Differs from* PDERP,
  whose board is written by `docs:word` too.
- **Seeded from docs/08.** The first rows come from the ideas in
  `docs/08-open-questions.md` (the open questions that name something
  buildable, the *First milestones*) and from CLAUDE.md's build order; the
  bugs under docs/08's *Bugs* heading stay bugs, not rows, and show on the
  page as a count, as on PDERP. *New.*
- **The seven skills are copied from PDERP and adapted**, not written
  fresh: the same names, the same `allowed-tools` discipline, with PDERP's
  records replaced by Quark's and PDERP's one branch (`service`) replaced by
  Quark's branch-per-phase rule. `/readback` is already in place and is not
  touched. *New.*
- **Sonnet for the build.** The brief leaves no design choice open that
  Sonnet cannot settle at step 1. *Follows* the 16 October model rule.
- **The board is public.** Quark's repository is public, so no child's
  name, nickname or anything from rule 7 of CLAUDE.md ever goes in a board
  row or a bug line; "the boys" is the most a row says. *New, from rule 7.*

## Read first

In this order, by search where a file is long:

1. `CLAUDE.md` (loaded; read *Where we are*, *Conventions* and *Before a
   consequential action* again with this brief in mind) and `README.md`.
2. `docs/08-open-questions.md`, all of it: it is the seed and the place
   the decisions go.
3. `.claude/settings.json`, `.claude/agents/readback.md`,
   `.claude/skills/readback/SKILL.md`, `.gitignore`, `package.json`.
4. PDERP's originals, beside this folder in
   `C:\Users\BrandonReisen\Documents\pderp-release`: `docs/board.md` (its
   header has the stage rules), `scripts/export-board.mjs`,
   `.claude/skills/{idea,ask,job,side,bugs,sweep,close}/SKILL.md`,
   `docs/working-with-claude.md` (*Kinds of session* and *The board*), and
   CLAUDE.md's *Toolbelt* section. Read only; never write into that folder.
5. `docs/state-board-slice.md` and `docs/state-board-slice-2.md` in
   `pderp-release/docs/`, for why the board is shaped as it is.

## Steps and stops

1. **Write back, then STOP.** Before any file is written, show Brandon:

   - **The seed table as it would be committed**: every row with its
     stage, Moved date, Waiting on, Size, Importance, Phase and Where, and
     under it one line per docs/08 item saying whether it became a row,
     stayed a question, or was folded into a row (and which). The chat's
     reading on 17 October, for you to check against the repository and
     correct, is in *The seed* below.
   - **The two questions left open for Brandon**, each with your
     recommended answer and what happens on yes:
     - *Does Quark's board need a Phase column?* The chat's recommendation:
       yes, in place of PDERP's Module column. Quark has no as-built
       modules; what a row belongs to is a phase of the build order (1–7),
       *tooling* (how Quark is built with Claude), or — when it fits none.
       On yes, the page shows the phase where PDERP's shows the module and
       counts bugs by phase. Say if you find a reason the column misleads
       (for instance a row that spans phases).
     - *Does the Codex-reads-AGENTS.md convention change the skills?* The
       chat's recommendation: no. Quark's `AGENTS.md` today is only the
       block `next dev` writes and re-adds; no Codex agent is in use, and
       the review keeps one as a later experiment. The skills are Claude
       Code's; the rules they enforce live in `docs/board.md`'s header,
       CLAUDE.md and docs/08, which any agent can read. If Codex is tried
       later, a one-line pointer in `AGENTS.md` outside Next's block is its
       own small job, not this one.
   - **The exact text of each of the seven skills** as adapted (the full
     SKILL.md, not a diff), and the exact changes to `export-board.mjs`.
   - **The things to settle that the brief leaves to you**, with your
     answer: where `Quark board.html` is written (the chat's suggestion:
     the repository root, added to `.gitignore`, so the Where links work
     and the public repo never carries it; `npm run docs:board --
     "<folder>"` for anywhere else); how the page reads Quark's bugs (they
     are bullet lines under docs/08's *Bugs*, not PDERP's table; the chat's
     suggestion is that the script reads that section and the bugs stay
     there, per slice 1's "until it needs its own file"); which branch
     `/idea` and `/bugs` commit on when a phase branch is checked out
     (the chat's suggestion: the branch you are on, since it merges to
     `main`; the page's header names the branch and commit so Brandon
     knows which copy he is reading); and whether a docs/08 item that
     becomes a row is deleted from docs/08 (the chat's suggestion: yes,
     the board is the one record, and one line at the top of docs/08
     points at it).
   - Anything in this brief that does not fit the repository.

   Brandon corrects stages, keeps or cuts rows, answers the two questions,
   and says go. Suggest plan mode for this step. **On go, the first thing
   done** is `git switch -c working-with-claude-2` from `main`, then a
   commit containing only `docs/board.md` with its header and one row for
   this job at *building* (the board's own first row; there is no `/job`
   yet to do it).

2. **Build.**
   - `docs/board.md`: PDERP's header reworded for Quark (what it is, that
     it is public, the stages, Size, Importance as Brandon's then June's,
     the Phase column if decided), then the seed table, newest movement
     first. Stage meanings adapted: *on test* is built and waiting on a
     person's check or go (Brandon at the laptop, or the boys on an iPad),
     since Quark has no test environment; *live* is merged to `main` and
     running on Vercel; *on hold*, *briefed*, *building*, *raised*, *not
     fully formed*, *not doing* as PDERP has them. A *live* row stays 14
     days after it moved and `/close` then deletes it; the *Where we are*
     note and the spec pages are the record of what is live.
   - `scripts/export-board.mjs`, copied from PDERP and changed only where
     Quark differs: the title and file name `Quark board.html`; the default
     output folder; Module → Phase; the bug reader pointed at docs/08's
     *Bugs* section; a missing `docs/side/` folder tolerated (Quark has no
     side project yet, so the section is simply absent). Still one
     self-contained file: no script, no network, no font or image fetched.
     `"docs:board": "node scripts/export-board.mjs"` in `package.json`.
   - The seven skills in `.claude/skills/<name>/SKILL.md`, each PDERP's
     with these adaptations and no others unless step 1 found one:
     - `/idea`: unchanged but for the commit rule above.
     - `/ask`: the records are CLAUDE.md (loaded), `README.md`, the
       `docs/*.md` pages (by search), `deploy/supabase/schema.sql`,
       `gate/values-interview.md`, `packs/README.md`; the code only if they
       do not answer. Still read-only, still commits nothing.
     - `/job`: reads CLAUDE.md's *Where we are*, the README status line,
       docs/08 (*How Quark is built with Claude* and *Bugs*), the spec
       pages the brief touches, then the brief. At its stop it also says
       which branch is checked out (`git branch --show-current`) and
       whether the brief names it: a phase job runs on its phase branch
       (`phase-N-…`), a tooling job on a tooling branch, never on `main`;
       if the brief's branch does not exist, making it is the first thing
       on go, before the board row's move to *briefed*.
     - `/side`: unchanged; the base branch it suggests is `main`; never
       `main` or a phase branch as the answer to "where do I commit";
       `.claude/worktrees/` is already in `.gitignore`.
     - `/bugs`: one bullet line at the top of docs/08's *Bugs* list, in the
       format slice 1 set (date, where, what happened, expected, file,
       size), committed alone with "Bug: <first words>". **No screenshot is
       saved into the repository** (it is public and a screen can show a
       child's nickname); the line describes instead.
     - `/sweep`: reads docs/08's *Bugs*; proposes a batch that fits one
       session **and the branch checked out**, saying which lines belong to
       another branch (the `db-push` URL bug needs `phase-3-curation`);
       stops for a yes; `npm test` and `npm run typecheck` per fix; a new
       migration always stops; deletes a fixed line; anything bigger than a
       fix becomes a board row at *raised*, Size "a job".
     - `/close`: the records are CLAUDE.md's *Where we are* note (and the
       rule that a session which skips it is finished by the next one), the
       spec pages the job touched (*How it is built* sections and
       *Decided:* lines), docs/08 (*Decided:* lines under *How Quark is
       built with Claude*; *Bugs*), `docs/board.md` (the same row moves as
       PDERP's, *on test* / *on hold* / *live* by the same rules), and the
       README status line if what it says changed. Then `npm run
       docs:board` (not `docs:word`). Commit the records naming the files
       (never `git add -A`, which the ask-list stops anyway), then push the
       current branch unless it is `main`; a push to `main` is Brandon's
       own action and stays an ask. Then the commit list, the full report
       unchanged, `/readback <brief>`, and the `/cost` reminder.
   - `CLAUDE.md`: a short *Kinds of session* list (one line per skill, as
     PDERP's `working-with-claude.md` has) and a four-line *The board*
     section under *Conventions*; the *Where we are* note gains one line
     for this job; a four-line *Toolbelt* section copied from PDERP's
     CLAUDE.md (suggest plan mode at a job's start, `/rewind` after a bad
     run, `/cost` at `/close`). Quark gets no `docs/working-with-claude.md`
     and no `@import`: CLAUDE.md already carries its rules and stays the
     one place.
   - `docs/08-open-questions.md`: the *Decided:* lines above under *How
     Quark is built with Claude*; the items that became rows removed and a
     line at the top pointing at `docs/board.md` (if step 1 settled it so);
     *Bugs* unchanged.
   - `README.md`: the *Open questions* row of the table gains "and
     `docs/board.md`, where every feature stands"; nothing else.

3. **Prove it, then STOP.** Run `npm run docs:board`; say what the page
   shows section by section with counts and that it fits one screen at
   1920 with Raised and Not fully formed folded. Prove `/idea` once with a
   throwaway row after a restart (skills load at start), show the board and
   the regenerated page, and remove the row in the same session. Run
   `/ask` once with a real question and show the answer and its sources.
   Run `/bugs` once with a throwaway line and remove it. Say which skills
   you could not exercise (`/side`, `/sweep`, `/job` from cold) and why.
   **STOP** for Brandon to open `Quark board.html` and say whether the top
   of it is what he would work on in Quark today.

4. **`/close`**, the first real proof of the skill: it moves this job's
   row to *on hold* (Waiting on "merge to main"), updates *Where we are*,
   docs/08 and the README line, runs `docs:board`, commits, pushes
   `working-with-claude-2`, reports, reads back. Nothing to `main` in this
   job.

Brandon's own steps, not Claude Code's: open the page at step 3; after the
close, merge `working-with-claude-2` to `main` (an ask fires; the page then
reads the *on hold* row as *live* at the next close), and merge `main` into
`phase-3-curation` so the next phase 3 session has the skills and the
board.

## The seed

The chat's reading of docs/08, CLAUDE.md's build order and the review on
17 October 2026, for Claude Code to check against the repository at step 1
(git dates, what `schema.sql` already holds, what phase 3 has built) and
for Brandon to correct. Importance is Brandon's; June has rated none.

| Row | Stage | Waiting on | Phase | Where | Note |
|---|---|---|---|---|---|
| Working with Claude, Quark: the board and the seven skills | building | — | tooling | `docs/board-slice.md` | this job |
| Curation engine v1 (weekly cron, ideas, cards, gate, load the week) | building | merge to `main` when it runs | 3 | `docs/04-curation-engine.md`, `phase-3-curation` | its own Where we are note is on the branch |
| Wonder Wall (five daily cards, layers 1–4, voice, hints, stamps, calm end) | raised | phase 3 merged | 4 | `docs/03-touch-points.md`, `docs/12-teaching-that-tests-itself.md` | the milestone "mock up the Wonder Wall home screen" and the product question "which screens" fold in here |
| Digest and audio (Sunday email, RSS, art of the week) | raised | phase 4 | 5 | `docs/03-touch-points.md` | "what does a great parent digest look like" and "one digest or one per parent" fold in here |
| Checks and difficulty (delayed recall, hint-count dial, results in the digest) | raised | phase 5 | 6 | `docs/12-teaching-that-tests-itself.md` | |
| Pilot: four weeks with the boys | raised | phases 3–6; the iPads set up | 7 | CLAUDE.md, *Build order* | the milestone "a prototype that runs one theme on a tablet" is this and phase 4, so it is not its own row |
| A test Supabase project, so a migration from a branch cannot touch the live database | raised | its own job before phase 4 | tooling | review, section 9; docs/08 *How Quark is built* | high; the one live database is why every migration asks |
| `docs/decisions.md` for Quark, newest first with what each replaced | raised | its own small job | tooling | review, job 8 | the Egypt reversal is the case for it |
| Checks on GitHub: a `checks.yml` running typecheck and tests on push, and the Claude GitHub app for pull-request review | raised | its own job | tooling | review, job 7 | |
| A second reviewer from another vendor (Codex) | not fully formed | the plan change and jobs 2 and 7 becoming habits | tooling | review, section 8 | AGENTS.md is the convention it would read |
| Where the limits on "Ask" are | not fully formed | a brainstorm with June | 4 | docs/08 *Product* | |
| A family starts with the full plan or a single theme | not fully formed | — | 3 | docs/08 *Product* | check: phase 3 may already have settled it |
| A default knowledge sequence a family can swap | not fully formed | — | 3 | docs/08 *Content*; `plan_topics` | the backbone exists; swapping does not |
| Sample weeks written so they can be shared and reused | not fully formed | — | 3 | docs/08 *Content* | the milestone "one complete sample week for two ages" folds in here |
| The content item format and the per-child profile | live or delete | — | 1 | `deploy/supabase/schema.sql` | the milestone; check whether the schema already is this, and if so it is not a row |

Stay in docs/08, not rows (a row names one thing that can be briefed and
built): the self-directed-versus-parent-moments question, content
licensing beyond the public domain, the three *Community and access*
questions (the project's name is settled by CLAUDE.md's "don't rename";
say so and tick it or leave it, Brandon's call), and all six *Values
interview* choices, which are decisions for Brandon and June, not features.
Phases 1 and 2 are live and merged before 16 October; they are rows only if
their merge is inside the last 14 days, which `git log` settles.

The three bugs under *Bugs* stay there and show on the page as a count of
three with the oldest date, by phase if the column is decided (the
`db-push` echo and the hint check are phase 3; the announced interest is
phase 3, step 4d).

## Not in this job

- A page inside Quark, a phone view, or anything a child or a parent
  could open; the board is read at Brandon's laptop.
- Word copies or a `docs:word` script.
- Hooks of any kind; CI; the GitHub app; the test Supabase project; a
  Codex reviewer; `docs/decisions.md` (each is a row on the board).
- Any change to `/readback`, to `.claude/settings.json`'s ask-list, or to
  `AGENTS.md`.
- Any change on `phase-3-curation`, any migration, any script that reads
  `SUPABASE_DB_URL`, anything that spends API money.
- Rating importance with June (rows stay "— / —" until the two of them
  rate together).
- Merging to `main` (Brandon's own step after the close).
- Fixing any bug, including the three listed (`/sweep` is for a later
  session, on the right branch).

## What done means

- `docs/board.md` exists on `working-with-claude-2` with the header, the
  stages and every row Brandon kept at step 1, newest movement first, and
  nothing in it names a child.
- `npm run docs:board` writes `Quark board.html`, self-contained, that
  Brandon opened at step 3 and said reads; the file is not tracked.
- `.claude/skills/` holds `idea`, `ask`, `job`, `side`, `bugs`, `sweep`,
  `close` and the untouched `readback`; `/idea`, `/ask` and `/bugs` each
  ran once in the session and left no trace; the skills you could not run
  are named in the report.
- CLAUDE.md has *Kinds of session*, *The board*, *Toolbelt* and the new
  *Where we are* line; docs/08 has the *Decided:* lines and the pointer;
  the README's table row is changed; nothing else in the spec pages moved.
- The job closed with `/close`: the row at *on hold*, the records
  committed by name, the branch pushed, `main` untouched, the full report
  with its "couldn't check" lines first, the four-line read-back, and the
  `/cost` figure in the report.
- The two open questions (Phase column; Codex and AGENTS.md) have
  Brandon's answer written as *Decided:* lines in docs/08, dated 17
  October 2026.
