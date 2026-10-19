---
name: job
description: Starts a build session from a brief: reads the records, says where the job stands and which branch it is on, does the brief's step 1 and stops before any file is written.
argument-hint: [path to the brief, e.g. docs/name-slice.md]
disable-model-invocation: true
allowed-tools: Read Grep Glob Edit(docs/board.md) Bash(git branch --show-current) Bash(git branch --list *) Bash(git switch -c *) Bash(git status*) Bash(git add docs/board.md) Bash(git commit docs/board.md *) PowerShell(git branch --show-current) PowerShell(git branch --list *) PowerShell(git switch -c *) PowerShell(git status*) PowerShell(git add docs/board.md) PowerShell(git commit docs/board.md *)
---

Start the job in the brief at `$ARGUMENTS`.

1. CLAUDE.md is already loaded. Read its *Where we are* note and the README status line, then docs/08 (*How Quark is built with Claude* and *Bugs*), then, by search, the spec pages the brief touches (and `deploy/supabase/schema.sql` if it touches data).
2. Read the brief in full, then any file it tells you to read first. List the risky steps in it (live database, money, a real person, anything a child will see), say which command Brandon will run by hand at each, name any risky step the brief did not mark, and confirm each has a STOP before it.
3. At the stop, say in a few plain lines where the job stands, with that list of risky steps. Ask Brandon only what the records and the brief cannot settle; decide the rest and say what you decided. Every question you do raise comes with your recommended answer and what happens on yes. End with "reply go to take all of these".
4. Say which branch is checked out (`git branch --show-current`) and whether the brief names it. A phase job runs on its phase branch (`phase-N-...`), a tooling job on a tooling branch, never on `main`. If the brief's branch does not exist, say that making it (`git switch -c <name>`, from the base the brief names, else `main`) is the first thing done on go, before the board row's move.
5. Check `docs/board.md` for the brief's row: say whether it is at *briefed*, and if it is missing or at another stage, say it will be moved there (inserted at the top, with today's date) as the job's first commit on the branch, made on go, containing only `docs/board.md`. If `docs/board.md` is not on this branch, say so and skip the row.
6. Suggest plan mode (`/plan`) for step 1, and `opusplan` if the brief leaves a design choice open.
7. Do the brief's step 1 and **stop**. Write no file, run nothing that changes anything, until Brandon says go. On go, first the branch if it is needed, then the board row's move, committed alone.
8. Dated decisions Brandon typed after the command are for docs/08's *Decided:* lines at `/close`.
