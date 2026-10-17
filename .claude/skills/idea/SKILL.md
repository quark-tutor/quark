---
name: idea
description: Adds one row to docs/board.md and commits it. Capture only: no reading of the records, no diagnosis, no questions back.
argument-hint: [the idea, in your words]
disable-model-invocation: true
allowed-tools: Read(docs/board.md) Edit(docs/board.md) Bash(git add docs/board.md) Bash(git commit docs/board.md *) PowerShell(git add docs/board.md) PowerShell(git commit docs/board.md *)
---

Capture this idea, fast: `$ARGUMENTS`

1. Add one row at the top of the table in `docs/board.md`: the idea in Brandon's words tidied to a short name, stage *not fully formed*, Moved today's date (`16 Oct 2026` form), Waiting on "—", Size "—", Importance "— / —", Phase only if obvious (`1`–`7`, or `tooling`), Where blank. The repository is public: if the words name a child, use "the boys" or "a child" and leave the name out. If `docs/board.md` does not exist on this branch, say so and stop (it arrives when `main` is merged in).
2. Do not read any other record, diagnose, plan, or ask a question. Speed is the point.
3. Commit only that file, on the branch that is checked out: `git add docs/board.md`, then `git commit docs/board.md -m "Idea: <first words>"`. Never commit anything else, whatever else is changed in the tree.
4. Reply with the one line you added, and the branch it is on.
