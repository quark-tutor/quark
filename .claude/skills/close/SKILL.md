---
name: close
description: Ends any job the same way: the records, the board page, the commit list, the full report, then the read-back.
argument-hint: [path to the brief, if any]
disable-model-invocation: true
allowed-tools: Read Grep Glob Edit Write Bash(npm run docs:board*) Bash(git add *) Bash(git commit *) Bash(git log *) Bash(git status*) Bash(git diff *) Bash(git branch --show-current) Bash(git push origin *) Bash(git push -u origin *) Agent(readback) PowerShell(npm run docs:board*) PowerShell(git add *) PowerShell(git commit *) PowerShell(git log *) PowerShell(git status*) PowerShell(git diff *) PowerShell(git branch --show-current) PowerShell(git push origin *) PowerShell(git push -u origin *)
---

Close this job. The brief is `$ARGUMENTS`, or the one named in this session's first message.

1. **The records.** The repository is public: nothing written below names a child.
   - CLAUDE.md's *Where we are* note: date, what is merged, what is on which branch, what is next. A session that skips this is finished by the next one.
   - The spec pages the job touched: their *How it is built* sections, and *Decided:* lines for every decision Brandon made this session, with its date, what it replaced, and his words where he gave them.
   - `docs/08-open-questions.md`: *Decided:* lines under *How Quark is built with Claude* for a tooling job; the *Bugs* list.
   - `docs/board.md`: move each row this job touched to its new stage, today's date and a fresh Waiting on (delete it and re-insert it at the top). A built feature goes to *on test* when it waits on a person's check or go (Brandon at the laptop, or the boys on an iPad), to *on hold* when it waits on a date or event (put the date or event in Waiting on, for example "merge to main"), and to *live* when it is merged to `main`; a merge moves every *on hold* row whose event was that merge to *live*. Anything the report calls beyond the brief or left for another job becomes a row if it has none. Delete *live* rows whose Moved is more than 14 days ago. On a side project, do not touch the board at all: the page reads `docs/side/<name>.md`.
   - The README status line, if what it says changed.
   - On a side project, update `docs/side/<name>.md` and commit it on the side branch instead; leave the spec pages alone. Update *Where we stopped* and **rewrite the `## Summary` block**, always in this shape: `**As of:**` (date and the files the figures came from); `**What it is:**`; `**Tried, by round:**` (one bullet per round, with its figures); `**Best result so far:**` (with its number); `**What stopped it:**`; `**Next thing to try:**`. Figures only from the side project's own records, never recalled.
2. Run `npm run docs:board`. It writes `Quark board.html` at the repository root, which is not tracked. In a side worktree skip it.
3. Commit the records, naming the files; never `git add -A`, `git add .` or `git commit -a`, and never sweep in anything else. Then push the branch that is checked out (`git branch --show-current`; `git push -u origin <branch>` the first time). Never push `main`: a push or merge to `main` is Brandon's own action and stays an ask.
4. List the session's commits (`git log`).
5. Write the **full report**, unchanged, for the records and the next session: what could not be checked first (these lines matter most), then what was done, what is beyond the brief, what is on live, and which asks fired and were approved.
6. Produce the read-back: call the Agent tool once with `subagent_type: "readback"`, giving the brief's path and the report's complete text, unchanged and uncut, and print its four lines exactly as returned. (`/readback` itself cannot be called from here because it is user-only.)
7. Remind Brandon to run `/cost` and ask him for the figure to put in the report.
