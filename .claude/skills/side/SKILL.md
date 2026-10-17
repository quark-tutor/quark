---
name: side
description: Opens or resumes a side project: its own branch side/<name>, its own worktree under .claude/worktrees/<name>, and a record docs/side/<name>.md with a Where we stopped section.
argument-hint: [name]
disable-model-invocation: true
allowed-tools: Read Grep Glob Edit(docs/side/*) Write(docs/side/*) EnterWorktree ExitWorktree Bash(git worktree *) Bash(git branch --list *) Bash(git show *) Bash(git add docs/side/*) Bash(git commit docs/side/* *) PowerShell(git worktree *) PowerShell(git branch --list *) PowerShell(git show *) PowerShell(git add docs/side/*) PowerShell(git commit docs/side/* *)
---

Open or resume the side project `$ARGUMENTS`.

Side work never touches `main`, a phase branch, the board or the spec pages. The board page reads `docs/side/*.md` itself, so a side project has no row and `/side` writes none. What it learns goes in its own record, `docs/side/$ARGUMENTS.md`, on its own branch. The repository is public: the record names no child.

**Resume.** If `.claude/worktrees/$ARGUMENTS` already exists (`git worktree list`), enter it with EnterWorktree (path). Read its `docs/side/$ARGUMENTS.md`, the *Where we stopped* section first, and say in a few lines where it stands.

**Open.** Otherwise:
1. Ask Brandon for the base branch, naming a suggestion (`main`). Never `main` or a phase branch as the answer to "where do I commit".
2. `git worktree add .claude/worktrees/$ARGUMENTS -b side/$ARGUMENTS <base>` (Claude Code's own `--worktree` cannot name the branch or the base, so this is a plain git worktree; say so). `.claude/worktrees/` is already in `.gitignore`.
3. Enter it with EnterWorktree (path).
4. Create `docs/side/$ARGUMENTS.md` there if absent: take `git show main:docs/side/$ARGUMENTS.md` when it exists, otherwise write a short record with a `## Summary` block (shape in `/close`: As of, What it is, Tried by round, Best result so far, What stopped it, Next thing to try) and a *Where we stopped* section, and a link to any earlier record. Commit only that file on the side branch.

**Secrets.** A fresh worktree has no `node_modules` and no `.env.local`. Never read, copy or create a `.env` file, in the worktree or beside it. If a script needs one, say which and stop: Brandon runs it himself. Nothing in a side project touches the live database.

**Closing a side session** is `/close`, which updates `docs/side/$ARGUMENTS.md`, commits it on the side branch, and leaves the worktree in place (ExitWorktree, keep). Nothing is deleted without Brandon's word.
