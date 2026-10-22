# Brief: Quark's board run as GTD

**Tooling job, on `phase-4-wonder-wall`.** Drafted 21 October 2026 in the chat, 21:48 to 22:08, from a clarify pass with
Brandon over every row of `docs/board.md`. Board row: "Quark's board run as GTD" (*briefed*, added by the chat with this
brief, uncommitted). **Status: ready.**

**Size:** an hour.

## Stops

- **No stop 1.** Every row's outcome was settled in the clarify pass below, and nothing here touches a database, money,
  a real person, a secret or anything a child sees. On launch: the pull, the row's move, then the steps, without stopping.
  If reading finds a row or a rule this brief does not settle, decide it and say so at stop 1 below. A finding that makes
  the brief wrong is an emergency stop.
1. **Your look, the page.** After step 4, the rebuilt `Quark board.html`. Brandon opens it at the laptop and checks, in
   these words:
   - "In hand shows one card: Wonder Wall slice 1."
   - "Next shows four, in this order: the boys' first live week, 28 more short lessons, Wonder Wall slice 2, Vercel
     preview deployments."
   - "Projects shows Wonder Wall, Pilot and Week 2 builds itself, and each opens to its slices with N of M built."
   - "Someday shows the two phase projects and the eight rows, dimmed."
   - "Waiting on and the inbox are empty, and the stamp says read as GTD."
   His "go" means every one passed. If he names one that did not, that is a fix round, and this stop comes again.
2. **`/wwc:close`.** The plate.

## Before the job

Nothing. The plugin's export script already reads the GTD shape (`../working-with-claude/scripts/export-board.mjs`), and
no token, project or secret is needed.

## Read first

1. `../working-with-claude/docs/working-with-claude.md`, *The board* (21 October 2026: run as GTD), and
   `../working-with-claude/docs/board.md`: its header and columns are the model this board follows.
2. `docs/board.md` (37 rows, the older shape) and `CLAUDE.md`: the `## Method` block, *Kinds of session*, *The board*.
3. `docs/08-open-questions.md`, *Bugs* (the line format is in the Method block) and *How Quark is built with Claude*.
4. `package.json`, the `docs:board` script.

## Decided already (Brandon, 21 October 2026, 21:48 to 22:08; do not reopen)

- **Quark's board is run as GTD,** the same rules as the WWC and BUTLR boards. Brandon: "help me get quark's state board
  into a GTD format, the same as we've already done for WWC, and butlr."
- **The columns** are the plugin's eight: `Feature | Stage | Moved | Project | Depends on | Waiting on | Size | Where`.
  *Importance* and *Phase* go: the projects carry the phases, and the order of Next carries the priority.
- **The phases become projects.**
- **Every row's outcome** is in the table below, taken as the chat proposed it ("yes, these look good"). The two
  waiting-on rows are thrown away instead ("clear the two waiting on, we don't need those").

## The board, row by row

Each existing row keeps its Feature words and its Where unless a change is named below. Its Moved becomes the job's
date where its stage changes, and stays where it does not. "Delete" means no row is kept.

**In hand**

| Row | Stage | Project | Depends on | Waiting on |
|---|---|---|---|---|
| Wonder Wall slice 1: today's five cards, layers, hints as written, the handoff, on a paired iPad | building | Wonder Wall | — | the iPad check at stop 2 of its job, then its close |

**Projects** (a project row's Feature is its name, " — " and its goal; stage `project` or `someday`)

| New project row | Stage | Replaces |
|---|---|---|
| Wonder Wall — the boys learn from five daily cards on the iPad: layers 1–4, voice, hints as a conversation, stamps, a calm end | project | the row "Wonder Wall: five daily cards, layers 1–4, voice, hints as conversation, stamps, calm end" (deleted; its Where moves to the project row) |
| Pilot — four weeks with the boys, from Monday 26 October 2026 | project | the row "Pilot: four weeks with the boys" (deleted; its Where moves to the project row) |
| Week 2 builds itself — the Sunday build makes week 2 on live on Sunday 1 November 2026 | project | new; Where: `docs/wonder-wall-1-slice.md`, *The week for Monday*; `docs/04-curation-engine.md`, "How the Sunday build is built" |
| Digest and audio — the Sunday email, the RSS feed for the car, art of the week (phase 5) | someday | the row "Digest and audio: Sunday email, RSS, art of the week" (deleted) |
| Checks and difficulty — delayed recall, the hint-count dial, results in the digest (phase 6) | someday | the row "Checks and difficulty: delayed recall, hint-count dial, results in the digest" (deleted) |

**Next, in this order** (the top row is the next brief)

| Row | Stage | Project | Depends on |
|---|---|---|---|
| The boys' first live week: live week 1 deleted and built again to start Monday 26 Oct, read and tapped | next | Pilot | Wonder Wall slice 1 |
| 28 more short lessons for week 2, picked before Saturday 31 Oct, or the wall is empty from Monday 2 Nov | next | Week 2 builds itself | — |
| Wonder Wall slice 2: after a handoff, the card's next layer opens the next day | next | Wonder Wall | Wonder Wall slice 1 |
| Vercel preview deployments pointed at the test project | next | — | — |

The boys' first live week keeps its Waiting on cell only for what is outside the job: "June's read of the safety floor
before the build". The stop list (M1 to M4) belongs to its brief, not the row.

**Later** (a project's slices after the one at next, in build order)

| Row | Stage | Project | Depends on | Waiting on |
|---|---|---|---|---|
| Recordings stored in the private bucket like pictures, so the wall never fetches from Wikimedia | later | Wonder Wall | — | — |
| A week's lens plan is kept from day 1, so taps on a Sunday cannot change later days | later | Wonder Wall | the slice that feeds lens history to the picker | — |
| A day cannot be written twice: unique indexes on ideas and cards | later | Week 2 builds itself | — | — |

Add one line to the unique-indexes row's Feature cell, or keep it in its Where: "its brief's *Before the job* carries
Brandon setting `CRON_SECRET`, `ANTHROPIC_API_KEY` and the three model names in Vercel's production environment".

**Someday** (stage `someday`, no project)

- A guardian can ask for a week's cards to be checked again from the week page
- A guardian can enter what to be careful about for each child
- Prompt caching of the policy document in the model adapter
- A second reviewer from another vendor (Codex)
- A knowledge sequence a family can swap
- Sample weeks written so they can be shared and reused
- The Claude GitHub app for pull-request review
- `docs/decisions.md`, newest first with what each replaced (the *Decided:* lines are working)

**To the bug list** (delete the row, and add one line to the top of `docs/08-open-questions.md`, *Bugs*, in the Method
block's format, dated with the job's date)

- "A firing stopped at the time limit still records what it spent": `/parent/models` undercounts a firing stopped at the
  time limit; expected: it records what it spent. (phase 3) Size: an hour.
- "Delete the docs/08 items folded into board rows": docs/08 still holds items the board's rows replaced; expected: each
  is deleted. (tooling) Size: minutes.

**Delete** (thrown away, no row kept)

- Checks on GitHub: `checks.yml` running typecheck and tests on push. The migrations workflow already runs the tests and
  typecheck on every push of the phase branch.
- Guardians can't write a week's status, a card's verdict or an audit row directly. Built in slice 1; its live push is
  stop M1 of the boys' first live week.
- Pictures on the test copy: run content:fetch on quark-test. Done in slice 1, step 3.4.
- Where the limits on "Ask" are. (Brandon: "clear the two waiting on")
- Safety-floor lessons in the plan: body safety, telling a trusted adult, emergency basics. (the same)

**Live** (all ten stay: none is past 14 days; Project, Depends on: —)

Each live row's Waiting on becomes "—". The open checks written there come out, because a close leaves nothing open:
June's read of the safety floor and the twenty questions is in the first live week; the Vercel production settings are in
the unique-indexes row; `SUPABASE_DB_URL_LIVE` is a *waiting on* row on the WWC board; the merge of
`working-with-claude-4` was done long ago. This brief's own row goes to *building* on launch and to *live* at its close.

## The steps, in order

1. **On launch.** `git pull --rebase --autostash origin phase-4-wonder-wall`, said in one line. Then this brief's row to
   *building*, committed with the brief. The board is in the older shape until step 2, so the row moves as the older
   shape does.
2. **The board converted.** The header of `docs/board.md` is rewritten to the WWC board's in fewer words, keeping
   Quark's own line: "This repository is public: no row names a child, and 'the boys' is the most a row says." The
   stages, sizes and *Where* rule are as WWC's. The rows go in the order above: in hand, Next, projects, later,
   someday, live. Then the two bug lines in docs/08.
3. **`CLAUDE.md` agrees with the board.**
   - In the `## Method` block, *To test* becomes "none; a check is taken at a stop before the close, never parked".
   - In the *Bugs* line, "The phase in brackets is what the board page counts by" becomes "The phase in brackets
     says where it belongs".
   - *Kinds of session* and *The board* are replaced by one line each pointing at the plugin's page
     (`docs/working-with-claude.md` in `BrandonReisen/working-with-claude`, *Kinds of session* and *The board*). Keep only
     what is Quark's own: the board is public and names no child, and `/wwc:bugs` saves no screenshot.
   - In `package.json`, the `docs:board` script drops `--second June`, which only the older shape reads.
4. **The page.** `npm run docs:board`, then confirm it printed "GTD shape" and the counts: In hand 2 (slice 1 and this
   job's row), Next 4, Projects 3, Someday 10, Live lately 10, Waiting on 0, Inbox 0, nothing under *Not placed*. Fix any
   row the script does not place. Commit, push, then **stop 1, Your look**.
5. **`/wwc:close`.** The *Decided:* lines under *How Quark is built with Claude* in docs/08 (this brief's *Decided
   already*). The *Where we are* note gets one tooling line. This row goes to *live*, with the page redrawn showing one
   in hand.

## Not in this job

- Anything in slice 1, which stays paused at its stop 2 and is resumed in its own session.
- Splitting Wonder Wall's remaining pieces (voice, hints as a conversation, stamps, the calm end) into slices. That is
  proposed at slice 1's close and added only on Brandon's yes.
- The WWC row "each project's page stops repeating the plugin's page". This job does Quark's part of it and says so in
  the report.
- Any database, Vercel, or anything a child sees.

## Records to update at the end

`docs/board.md`, `docs/08-open-questions.md` (two bug lines and the *Decided:* lines), `CLAUDE.md` (*Where we are*, the
Method lines, the two sections), `package.json`. `/wwc:close`.
