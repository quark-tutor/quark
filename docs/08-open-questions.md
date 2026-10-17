# Open questions

Add to this list, or pick one up and open a discussion. Features and ideas that can be briefed and built are rows on [`docs/board.md`](board.md), where every feature stands; this page keeps the questions that are decisions for Brandon and June. A few items below were folded into board rows and are deleted from here once phase 3 is merged.

## Product

- [ ] Which screens should the first version support: an iPad in a wall mount, a larger touch monitor, a TV in art mode?
- [ ] How much self-directed exploration versus parent moments? Is the wall the main event or a supplement?
- [ ] Where exactly are the limits on "Ask"?
- [ ] Do two parents share one digest, or does each get their own role?
- [ ] Should a family start with the full plan, or with a single theme to test what sticks?
- [ ] What does a great parent digest look like? (Mockups welcome.)

## Content

- [ ] Which knowledge sequence should be the default backbone? Should families be able to swap it?
- [ ] How should sample weeks be written so they can be shared and reused?
- [ ] How do we handle content licensing beyond the public domain?

## Community and access

- [ ] How can this reach families in underserved districts, not only families already looking for it?
- [ ] Could schools, libraries or community groups run it?
- [ ] What should the project be called?

## First milestones

- [ ] Write one complete sample week (one theme across all touch points) for two ages.
- [ ] Mock up the Wonder Wall home screen and the parent digest.
- [ ] Define the content item format and the per-child profile.
- [ ] Build a small prototype that runs one theme on a tablet.

## Values interview: choices made while building compare and conduct

Defaults picked so the build could go ahead. Each is one line to change; Brandon and June decide.

- [ ] Which conduct setting is gentler? As built: no "say it out loud" before a hint is gentlest, then a gentle reminder, then required; quiet non-response is gentler than a one-line correction; warm praise is gentler than plain, and plain than none. An argument for the other way on rudeness: a calm correction may be kinder than being ignored.
- [ ] Until both parents answer a conduct item, the gentlest setting applies. docs/12 warns against a tone becoming the default by accident; is "gentlest until you both answer" the right accident?
- [ ] Where both parents choose "Not yet" with different ages, the older age wins per child. Should that count as a difference instead?
- [ ] Where both parents agree on a subject, both of their "What would you actually say?" notes go to the tutor. Should one parent's note need the other's agreement?
- [ ] Stories lean toward the child's own sex only if every guardian wants it; a difference in how kids learn to act becomes "a mix". Right defaults?
- [ ] The pack-level fields (`learns_to_act`, `match_exemplars_to_sex`) in all ten packs are outsiders' first guesses, with a one-line reason beside each. They need the same community review as the 24 points.

## How Quark is built with Claude

Decided (16 Oct 2026), "Working with Claude, slice 1" (`docs/working-with-claude-slice-1.md`); a tooling change, not phase work, so it lives on `working-with-claude` and is merged to `main` when it runs. Nothing here touches a screen.

- **The close-check list.** Money (API spend), anything that communicates with a real person, and any database migration on live get a real look before they happen. Everything else runs under the existing rules.
- **Auto mode stays, with an ask-list.** `.claude/settings.json` (`permissions.ask`, nothing in `deny`) stops and asks first. The command's description line carries all three plain-words facts itself, compressed: what it does, what it touches on live (LIVE in capitals for the live database), whether it can be undone. Chat lines above it are extra. *Replaces* the rules written into individual prompts ("don't kill processes", "a new migration always stops").
- **Two outputs.** Every job ends with the full report, unchanged, then the four-line read-back from the `readback` reader on Sonnet (`/readback <brief>`). Under *On live* the reader says when a stop fired but was approved. *Replaces* the builder summarising itself.
- **One writer per working tree.** The chat never edits files in the folder while a Claude Code session is open in it; a second job uses `claude --worktree`.
- **Sonnet for a briefed job**; Opus or `opusplan` when the brief leaves a design choice open.
- **A bug seen is one line under Bugs below, not a brief.** One sweep job fixes a batch.
- **In Quark a dry run against the live database is not a safe proof.** The live project is never used to prove a rule. There is one Supabase project and it is the boys' live copy. `db:push` stays an ask, not a block.
- Built differently from the brief, as at PDERP: no `defaultMode` line (Claude Code ignores it in a project file and auto is already the start mode); `/readback` runs in the main session, not as a forked skill.
- Proven 16 Oct 2026: the pushes to `main`, `Remove-Item` and `npm run db:push` asks all fired and named their rules. The `db:push` one was approved by hand and the command ran, which is why the rule above exists.

### Working with Claude, slice 2: the board and the seven session skills

Decided (17 Oct 2026), `docs/board-slice.md`; a tooling change on `working-with-claude-2`, merged to `main` when it runs.

- **Decided: one board per repository.** `docs/board.md` is Quark's own, a copy of PDERP's shape with Quark's stages; the two boards never read each other. Public: no row names a child or a nickname; "the boys" is the most a row says.
- **Decided: no Word copies.** `npm run docs:board` writes `Quark board.html` at the repository root (not tracked) and nothing else; there is no `docs:word`.
- **Decided: seeded from this page and the build order.** Open questions that name something buildable became rows; bugs stay bugs and show on the page as a count per phase. The items folded into rows stay here until phase 3 is merged, because that branch has edited the same lines; deleting them is a row on the board.
- **Decided: the seven skills are copied from PDERP and adapted** (`/idea`, `/ask`, `/job`, `/side`, `/bugs`, `/sweep`, `/close`) to Quark's records and its branch-per-phase rule; `/readback` is untouched. `/close` calls the `readback` reader directly, because `/readback` is user-only. *Replaces* the starter prompt pasted at the start of a job.
- **Decided: a Phase column** (`1`–`7`, `tooling`, or `—`) in place of PDERP's Module. The bug panel counts by the first "phase N" or "tooling" in each bug line, so `/bugs` writes it in brackets after *where*.
- **Decided: the Codex-reads-`AGENTS.md` convention changes nothing in the skills.** `AGENTS.md` is untouched; a second reviewer is a row at *not fully formed*.
- **Decided: Sonnet for the build.** `/idea` and `/bugs` commit on the branch that is checked out; the page header names the branch and commit.
- **Decided (17 Oct 2026): `/ask` has no `disallowed-tools` line.** Running it switched Edit, Write, Bash and PowerShell off for the rest of the session. `allowed-tools` only pre-approves tools, it does not remove the others, so `/ask` is read-only by its instructions, like every other skill, not by a lock. *Replaces* the line copied from PDERP.
- Proven on PDERP, 16 Oct 2026: an ask rule beats an allow rule even in auto, so a skill's `allowed-tools` cannot make a push to `main` run without asking.

## Bugs

One line each, newest first: date, where, what happened, what was expected, file, size guess. No diagnosis.

- 17 Oct 2026, `/sweep` (`.claude/skills/sweep/SKILL.md`, step 6) (tooling): the last step says "End with `/close`", but `/close` is user-only like `/bugs`, so a sweep cannot call it; expected: the last step says "ask Brandon to type /close". Size: minutes.

- 16 Oct 2026, `scripts/db-push.mts` (`npm run db:push`): on failure it prints the full connection string, password included, because it passes `--db-url` on the command line and the error repeats it; expected: never print the URL. Needs a fix in a phase 3 session (that branch has the migrations the script applies). Size: minutes.
- 16 Oct 2026, hint check in the curation build (phase 3): the two-dice layer 1 card was held back because the hint "Does each one count?" contains "one", an accepted answer; expected: ordinary words like "one" count only as numbers. A second case: a comparison hint that names the things being compared was blocked. Size: an hour.
- 16 Oct 2026, the week preview's first cards (phase 3): a card announces the child's interest ("imagine you're a painter") where it doesn't fit the lens; expected: the door is never announced. Size: a job (belongs to step 4d).
