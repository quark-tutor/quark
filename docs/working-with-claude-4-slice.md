# Working with Claude, slice 4: stops at steps, not commands

Brief settled with Brandon in the chat on 17–18 October 2026, from one day
of using the ask-list built on 16 October (slice 1). Two jobs, one per
repository, each its own Claude Code session on Sonnet: Quark first (its
hole is proven), then PDERP the same way. Quark's runs on a branch
`working-with-claude-4` made from `phase-3-curation` after `test-database`
is merged into it, and is merged back; PDERP's runs on `service`. Nothing
here touches a screen or a database.

## Why

Slice 1 put an ask-list in each repository: patterns that make Claude Code
stop and ask before a push to `main`, a migration, a delete, a secret, money
or mail. In two days of use it did the opposite of what was wanted:

- **It stopped on text, not action.** On 17 October it fired on a search
  string that happened to contain `scripts/db-push`, and on an edit to
  `.env.example`, the one `.env` file that is public. Neither touched
  anything.
- **It did not stop the one thing it was for.** On 18 October
  `npm run db:push:live -- --dry-run` reached the boys' live database with
  no ask. Every command Claude Code runs is `cd …/quark && …`, and every
  pattern in the list is anchored at the start of the line
  (`Bash(npm run db:push*)`, `Bash(git push *main*)`), so none of them ever
  saw the command. The four test commands before it ran unasked for the
  same reason, and the 16 October proofs on both repos passed only because
  those commands happened to run without a prefix. PDERP's list has the
  same shape and the same hole.
- **Brandon cannot evaluate a command.** His words, 17 October: "I can read
  it just enough to think I'm understanding it, with no way to parse the
  deeper meaning of what is happening." A description line written by the
  same agent that wrote the command is self-report; approving it is a
  click, not a check. "I'll sit here and hit approve to every bash request,
  but I just don't see the value for anyone involved."

What has worked, every time, is the other loop: the full report at the end
of a job, read by the chat against the brief and the records. It caught the
untested scrubber, the migration applied inside a fix, the import that had
never run. Brandon's conclusion, 17 October: the report is the control,
not the ask; and the few things that cannot be undone should not be asks
at all, because an ask is a click and a click is not a check.

## Decided by Brandon, 17 October 2026 (evening), for the records

- **The report is the control.** Risk is caught by the full report read in
  the chat, before a go and at the close, not by permission prompts.
  *Replaces* slice 1's ask-list as the first line.
- **Three things are run by Brandon's hand, never by Claude Code**: any
  command against the live database (PDERP's live and Quark's `quark`),
  anything that moves money, and anything that sends to a real person.
  Claude Code prepares the command, writes the pre-flight report (below)
  and stops; Brandon pastes the report to the chat, gets a go or a change,
  and types the command in PowerShell himself. *Replaces* "stops and asks
  first" for those three.
- **A brief names its risky steps, and each gets a STOP before it.** The
  pre-flight report says what is about to happen, what it touches, how it
  is undone (or that it cannot be), and what was checked on test. `/job`
  lists the risky steps it finds in a brief at its start, adds any the
  brief missed, and confirms each has a stop. *New.*
- **Everything below that line runs without asking.** Deletes, kills, npm,
  gh, curl, Vercel reads, the test database, reads of anything but a secret
  file. *Replaces* the 113-pattern (Quark) and 84-pattern (PDERP) lists.
- **The ask-list stays only as a backstop**, a handful of patterns that mark
  the "Brandon's hand" boundary in case a brief forgot a stop, each with a
  leading `*` so a `cd … &&` prefix cannot hide the command. A backstop
  ask firing is itself a finding: it means a brief missed a stop, and the
  close report says so. *Refines* slice 1.
- **The plain-words description rule stays** for the backstop asks and for
  the pre-flight report; it is not what makes anything safe, it is what
  makes the report readable. *Kept from* slice 1.

## What this slice builds (each repository)

1. **`.claude/settings.json`**: `permissions.ask` cut to the backstop. Every
   pattern starts with `*`, Bash and PowerShell both. Quark: a push to
   `main` or any force push; `*npm run *:live*`; `*env.live*`; `*supabase *`
   and `*db-push*`; `*stripe *`; the secret files (`.env.local`,
   `.env.*.local`, never `.env.example`); `git add -A`, `git add .`,
   `git commit -a` (the repo is public). PDERP: a push to `main` or any
   force push; `supabase db push`, `supabase migration`, `supabase db
   reset`, `test-db-remote` and whatever applies migrations to live;
   `*stripe *` and the mail-sending scripts; the secret files. Nothing
   else. Nothing in `deny`. **The classifier blocked Claude Code's own edit
   to this file on 18 October as self-modification**, so Claude Code writes
   the new file as `.claude/settings.proposed.json`, shows the diff, and
   Brandon renames it over the old one in File Explorer, then restarts.
2. **CLAUDE.md, *Before a consequential action*** rewritten: the three
   classes run by Brandon's hand; the brief names stops; the pre-flight
   report's four lines; what the backstop is and that its firing is a
   finding; the description rule kept. The 17 October lines about chaining
   and descriptions fold into it. Quark's "there is one Supabase project"
   sentence goes (there are two); "a dry run against the live database is
   never a proof" stays.
3. **`/job`**: step 1 gains "list the risky steps in this brief (live
   database, money, a real person, anything a child will see), say which
   command Brandon will run by hand at each, and name any risky step the
   brief did not mark; confirm each has a STOP before it".
4. **`/close`**: the report gains a *Stops and hand-runs* section: each stop
   that fired, what Brandon ran himself and when, and any backstop ask that
   fired (with whether it was a true or false positive). The claim "asks
   fired" is never made without a prompt having been seen.
5. **The brief shape** gains a *Stops* line after *Steps and stops* in the
   next brief written; PDERP's `docs/working-with-claude.md` *Stops* and
   *Asks* sections are rewritten to say the above in six lines; Quark's
   docs/08 gets the *Decided:* lines; PDERP's `docs/decisions.md` the same,
   dated 17 October, with what each replaces.
6. **The money line** (Brandon to settle at step 1): API spend from
   `week:build` and `content:fetch` on Quark is the phase 3 development
   loop, about a dollar a run. The chat's recommendation: it runs freely
   below a stated figure (say $5 a run) and a brief puts a STOP above it,
   with the estimate in the pre-flight report; the two `npm run` asks go.
   PDERP's only money is Stripe, which is Brandon's hand regardless.

## Read first

Quark: CLAUDE.md (*Before a consequential action*, *Kinds of session*),
`.claude/settings.json`, `.claude/skills/job/SKILL.md`,
`.claude/skills/close/SKILL.md`, `docs/08-open-questions.md` (*How Quark is
built with Claude*, the two 17–18 October bug lines under *Bugs*),
`docs/test-database-slice.md`, `scripts/target.ts`, `package.json`, and
`pderp-release/docs/working-with-claude-slice-1.md` for what slice 1
intended. PDERP, in its turn: the same files there, `docs/working-with-
claude.md` (*Stops*, *Asks*), `docs/decisions.md` (16 October entries),
`docs/operations-log.md` for the scripts that touch live or send mail.

## Steps and stops

1. **Write back, then STOP.** The proposed `settings.json` in full, with one
   line per pattern saying what it catches and that it has its leading
   `*`; the CLAUDE.md section as it will read; the `/job` and `/close`
   text; the money-line recommendation with what happens on yes; anything
   in this brief that does not fit the repository. Brandon settles the
   money line and says go. On go, the board row moves to *building* (Quark)
   and the branch is made.
2. **Build.** Items 1–5; the settings file written as
   `.claude/settings.proposed.json`. **STOP**: Brandon renames it over
   `.claude/settings.json` in File Explorer and restarts Claude Code
   (`claude -c --model sonnet`), since settings load at start.
3. **Prove it, then STOP.** Three proofs, each with its exact command line
   quoted in the report:
   - a harmless command with a `cd … &&` prefix that matches a backstop
     pattern must ask: `cd … && git push --dry-run origin main`. Brandon
     **declines** it. (On PDERP the same.)
   - a test-side command with the same prefix must *not* ask:
     `cd … && npm run db:push` on Quark (it prints `Target: test` and
     reports "up to date"); on PDERP `npm test`.
   - `/job docs/test-database-slice.md` run cold must list that brief's
     risky step (the live dry-run) and say Brandon runs it by hand, then
     stop; it is not continued.
   No command touches live, money or a real person in this job.
4. **`/close`**: Quark's row to *live* if all three proofs hold (there is
   nothing left to wait on), else *on test* with what failed; the test
   database row's Waiting on loses "the live ask proven to stop", since the
   live ask is no longer the control; `docs:board`; the branch pushed.
   Then Brandon merges it into `phase-3-curation` by hand, and runs the
   PDERP half as its own session.

## Not in this job

- Hooks (a PreToolUse hook could enforce the boundary without patterns;
  it is its own row if the backstop proves thin).
- Any change to `/readback`, `/sweep`, `/idea`, `/ask`, `/side`, `/bugs`.
- The `.env.example` over-match and the `/ask` tool line, which this
  rewrite makes moot (their bug lines close with it).
- Running anything against live, spending anything, or sending anything.
- PDERP's branch pruning, CI, or the GitHub app.

## What done means

- Each repository's `settings.json` holds under fifteen patterns, every one
  with a leading `*`, and the three proofs in step 3 hold with their
  command lines quoted.
- CLAUDE.md, `/job` and `/close` say the model above in both repositories;
  the records carry the decisions dated 17 October with what they replace.
- A brief written after this has a *Stops* line, and the first job run
  from it has Brandon typing the live command himself.
- The close report has a *Stops and hand-runs* section and makes no claim
  about an ask that nobody saw.
