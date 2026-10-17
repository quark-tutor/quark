---
name: sweep
description: Takes a batch of bugs from docs/08's Bugs list that fits one session and the branch checked out, stops for Brandon's yes, fixes them in order, deletes their lines and ends with /close.
disable-model-invocation: true
allowed-tools: Read Grep Glob Edit Write Bash(npm test*) Bash(npm run typecheck*) Bash(git add *) Bash(git commit *) Bash(git log *) Bash(git status*) Bash(git branch --show-current) PowerShell(npm test*) PowerShell(npm run typecheck*) PowerShell(git add *) PowerShell(git commit *) PowerShell(git log *) PowerShell(git status*) PowerShell(git branch --show-current)
---

Sweep the bug list.

1. Read the `## Bugs` list in `docs/08-open-questions.md`, and run `git branch --show-current`. Propose a batch that fits one session, by the size guesses, in the order you would fix them, and only lines whose code exists on this branch. Name the lines that belong to another branch (for example the `db-push` line needs `phase-3-curation`) and leave them. Say what else you are leaving out and why.
2. **Stop** for Brandon's yes. Change nothing before it.
3. Fix them in the order agreed, one commit each, with a test for each where a rule is involved. Run `npm test` and `npm run typecheck` per fix. A new migration always stops for Brandon, inside a fix too. Never run `db:push`, `supabase`, or any script that reads `SUPABASE_DB_URL`, and never use the live project to prove a fix.
4. When a bug is fixed, delete its line from docs/08; the fix is in the commit and the records. Do not tick it.
5. Anything that turns out bigger than a fix is not built: add a row to `docs/board.md` at stage *raised*, Size "a job", and leave its bug line.
6. End with `/close`.
