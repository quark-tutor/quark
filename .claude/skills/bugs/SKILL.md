---
name: bugs
description: Adds one bullet line at the top of the Bugs list in docs/08-open-questions.md for a bug seen, in the format slice 1 set, and commits it. No diagnosis. No screenshot is saved.
argument-hint: [what you saw]
disable-model-invocation: true
allowed-tools: Read(docs/08-open-questions.md) Edit(docs/08-open-questions.md) Bash(git add docs/08-open-questions.md) Bash(git commit docs/08-open-questions.md *) PowerShell(git add docs/08-open-questions.md) PowerShell(git commit docs/08-open-questions.md *)
---

Log this bug: `$ARGUMENTS`

1. Add one bullet at the top of the list under `## Bugs` in `docs/08-open-questions.md` (newest first), in this shape: `- <date>, <where> (<phase N or tooling>): <what happened>; expected: <what should have happened>. <File, if any.> Size: <minutes, an hour, a job>.` The date is `16 Oct 2026` form. Brandon's words, tidied. The phase in brackets is what the board page counts by. Ask nothing back unless "where" is missing entirely.
2. No diagnosis, no reading of the code. A bug is a line, not a brief.
3. **No screenshot is saved into the repository.** It is public and a screen can show a child's nickname. Describe what was seen instead, and leave any child's name out of the line.
4. Commit only that file, on the branch that is checked out: `git add docs/08-open-questions.md`, then `git commit docs/08-open-questions.md -m "Bug: <first words>"`.
5. Reply with the one line and the branch it is on. If the bug belongs to another branch's code, say which; it is fixed on that branch.
