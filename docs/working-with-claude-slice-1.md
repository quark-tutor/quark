# Working with Claude, slice 1: the ask-list and the read-back

Brief settled with Brandon on 16 October 2026, from the review *Working with
Claude: the map, what works, what doesn't* (Claude Doc, 16 October). Two
small jobs, one per repository, each its own Claude Code session: PDERP
first, then Quark. Nothing here touches a product feature; it changes how
jobs are run and reported.

## Why

Two findings from the 27 Claude Code transcripts of 18 September to 16
October.

First, every late session runs in auto mode with no prompts, because manual
mode "stops every 2 seconds" with a bare bash command Brandon is not
qualified to judge. Auto mode is right; what is missing is the one kind of
question he can answer: "I'd like to push to main; here is what could be
affected." Without it a migration reached the test database inside a fix
(15 October), `taskkill /IM node.exe` ran on the website job, and the rule
"a new migration always stops" lives only in prompts and memory.

Second, the end-of-job report serves two readers with different needs. The
next session needs all of it, so Brandon pastes it whole; Brandon needs the
decisions and the implications, and 1,500 words is too much to answer, so
the questions at the top and bottom get answered and the second-order lines
in the middle do not ("I couldn't check the screens in a browser", 12
October; test records written under his name with a real-looking customer
email, 13 October). Three pasted prompts still carried placeholders.

The fix is the same shape for both: a short list, in plain words, that is
the only thing Brandon has to answer.

## Decided by Brandon, 16 October 2026, for the decisions log

- **The close-check list.** Three kinds of action get a real look before
  they happen: anything that moves money, anything that communicates with
  a real customer, and any database migration on live. Everything else runs
  under the existing rules (nothing to live without his go; test before
  live). *Replaces* nothing; it names what "looked at closely" means.
- **Auto mode stays**, with an ask-list for consequential actions. A
  question Claude Code asks is always in plain words: what it is about to
  do, what could be affected on live, how it is undone. Never a bare
  command. *Replaces* the rules written into individual prompts ("don't
  kill processes", "a new migration always stops"), which move into
  settings and CLAUDE.md.
- **Every job produces two outputs.** The full report, unchanged, for the
  records and the next session; and a read-back of at most four short
  lines for Brandon, which is the only thing he answers before a go. The
  read-back is produced by a reader on Sonnet, not by the builder, and
  never spends the Fable or Opus budget. *Replaces* the 16 October prompt
  line "end with a short plain-language section for Brandon".
- **One writer per working tree.** The chat never edits files in a
  repository folder while a Claude Code session is open in it; a second
  parallel job uses `claude --worktree`. *Replaces* the 14 October line
  about fresh copies, which stays but was not enough.
- **Sonnet by default for a briefed CLI job**; Opus or `opusplan` when the
  brief leaves a design choice open; Fable or Opus for the deciding chats.
  *Replaces* Opus for everything.

## What this slice builds

1. **The ask-list**, `.claude/settings.json` at the repository root,
   committed. `permissions.defaultMode` is `auto`. `permissions.ask` lists,
   as command patterns, the actions that must stop and ask:
   - a push to `main` (and any `--force` push anywhere);
   - any migration against any database (`supabase db push`, `supabase
     migration`, `supabase db reset`, and whatever script the repository
     uses to apply migrations to test or live; Claude Code reads
     `package.json`, `docs/operations-log.md` and `docs/restore.md` to find
     them rather than assuming);
   - deletes and kills: `rm`, `Remove-Item`, `del`, `rmdir`, `taskkill`,
     `git branch -D`, `git reset --hard`, `git clean`;
   - secrets: reading or printing `.env*`, `vercel env pull`, `supabase
     secrets`, anything under the Supabase vault;
   - money and customer mail: `stripe` CLI commands, and any script in
     `scripts/` that sends mail or charges (Claude Code lists what exists
     and proposes the patterns).
   Patterns are written for both shells Claude Code uses on this laptop
   (the transcripts show `Bash` and `PowerShell` tools both in use), and
   Claude Code states which shell each pattern matches. Nothing goes in
   `permissions.deny`; the point is to be asked, not blocked.
2. **The plain-words rule**, in CLAUDE.md under a new short heading *Before
   a consequential action*: when stopped by the ask-list, say in three
   lines what the command does, what could be affected on live, and how it
   is undone, then ask. If it cannot be undone, say so first. Never show a
   bare command as the question.
3. **The read-back reader**, `.claude/agents/readback.md`, `model: sonnet`,
   tools read-only. Given the job's brief and the session's final report,
   it returns at most four lines, each under 25 words, in plain English:
   *Not checked:* what the report says it could not verify; *Beyond the
   brief:* what was built or changed that the brief did not ask for;
   *On live:* what breaks or is exposed if the unchecked thing is wrong,
   naming money, customer communication or a live migration explicitly
   when one is involved; *Yours to decide:* the questions only Brandon can
   answer. Nothing else: no summary of what went well, no commit list.
4. **The `/readback` skill**, `.claude/skills/readback/SKILL.md`, which
   runs the reader on the last report in the session (or on a pasted
   report) and the brief named in its argument, and prints the four lines.
5. **The close-out rule**, in `docs/working-with-claude.md` (PDERP) and in
   Quark's CLAUDE.md conventions: every job's final message ends with the
   read-back, produced by the reader, after the full report. Brandon
   answers the read-back; the full report goes to the records unchanged.
6. **Records.** `docs/working-with-claude.md` gets the ask-list (as a
   sentence, not the patterns), the plain-words rule, the two-outputs rule,
   one writer per working tree, and the model rule; `docs/decisions.md`
   gets the five decisions above, dated, with what each replaces; the
   as-built's *Claude, and how it connects* section gets one line pointing
   at working-with-claude.md; `npm run docs:word`. Quark: the same in
   CLAUDE.md's Conventions, a *Decided:* line in `docs/08-open-questions.md`
   under a new heading *How Quark is built with Claude*, and the *Where we
   are* note.

7. **The bug list**, `docs/bugs.md` (PDERP; Quark's goes in
   `docs/08-open-questions.md` under a *Bugs* heading until it needs its
   own file). One line per bug, newest first: date, where (page or
   command), what happened in one sentence, what was expected, a file or
   screenshot name if there is one, and a size guess (minutes, an hour, a
   job). Nothing else: no diagnosis, no brief. The rule, in
   working-with-claude.md: **a bug seen is one line in the list, not a
   brief**; when the list holds a handful, one *sweep* job fixes a batch,
   with a brief that just names the lines it takes. Claude Code seeds the
   file from the open issues in `docs/to-test.md` that are bugs rather than
   tests (Brandon, 16 October: the Deep Review broken-PDF bug is one). A
   `/bug` skill that adds a line from the chat or the CLI, and the sweep
   skill, belong to the session-modes job, not this one.

Not in this slice: hooks of any kind; a `/bug` or `/sweep` skill; the five session-mode skills
(`/idea`, `/ask`, `/brief`, `/job`, `/side`); the state board; the GitHub
app and CI changes; CLAUDE.md imports; pruning branches or tests; anything
that changes a PDERP or Quark screen.

## Steps and stops

1. Read first: `docs/working-with-claude.md`, CLAUDE.md, the *Security*
   and *Claude, and how it connects* sections of `docs/pderp-as-built.md`,
   `docs/operations-log.md` (the last two weeks), `package.json`, and the
   Claude Code docs for `permissions`, `permission-modes`, `sub-agents` and
   `skills` at code.claude.com. Then write back, before any file is
   written: the proposed ask patterns with the shell each matches and the
   action it catches, the reader's exact wording, and anything in the
   repository the list above missed. **STOP** for Brandon.
2. Write `.claude/settings.json`, the CLAUDE.md rule, the agent and the
   skill. Add `.claude/worktrees/` to `.gitignore`.
3. Prove it, without touching anything real: attempt `git push origin main
   --dry-run`, a migration command against test with `--dry-run`, and a
   `Remove-Item` on a scratch file, and show that each one stops with a
   three-line plain-words question. Then run `/readback` on this session's
   own report so far and show its four lines. **STOP** for Brandon to see
   one ask and one read-back and say whether the wording is right.
4. Records (item 6), commit, `npm run docs:word`. The full report, then the
   read-back. Nothing goes to `main`; this is a tooling change on `service`
   and reaches live with the next release.

## To decide while building (Brandon to correct)

- If a pattern cannot be written to catch a migration because the script
  that applies them is PDERP's own, the script itself gets a confirmation
  prompt instead, and the brief says so.
- The reader's four headings are fixed; its wording is Claude Code's to
  draft and Brandon's to correct at the step 3 stop.
- The skill's argument is the brief's path; with no argument it uses the
  brief named in the session's first message.
- Quark's job is the same four files and the same stops, on a branch
  `working-with-claude` merged to `main` when it runs, since this is not
  phase work.
