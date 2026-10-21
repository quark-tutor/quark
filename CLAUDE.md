# Quark — instructions for Claude Code

## Method

The `wwc` plugin (`/wwc:job` and the rest; the method is in `BrandonReisen/working-with-claude`) reads these names; its skills name no project file themselves.

- As built: the *Where we are* note under Build order in this file, and the *How it is built* sections of the spec pages in `docs/`
- Decisions: the *Decided:* lines in the spec pages a job touched; for a tooling job, under *How Quark is built with Claude* in `docs/08-open-questions.md`
- To test: none; the board's *on test* rows are the list
- Board: `docs/board.md`
- Board page: `npm run docs:board` (writes `Quark board.html` at the repository root, untracked; skip it in a side worktree)
- Branches: working is the phase branch (`phase-N-...`; a phase job runs on its phase branch, a tooling job on a tooling branch, never `main`); finished `main`, and a push or merge to `main` is Brandon's go
- Release: `/wwc:release` when `main` has not moved; otherwise Brandon merges by hand
- Tests: `npm test`, and `npm run typecheck`
- Migrations: applied by `.github/workflows/migrations.yml` on a push of the phase branch (test: quark-test), after the tests pass. A job pushes, watches the run (`gh run watch`) and reports it; a brief has no test-database push stop. Live: the workflow's live job waits on `SUPABASE_DB_URL_LIVE`, left unset (Brandon, 19 October 2026), so a live migration is still `db:push:live` at a stop
- Bugs: `docs/08-open-questions.md`, a bullet at the top of the list under `## Bugs`: `- <date>, <where> (<phase N or tooling>): <what happened>; expected: <what should have happened>. <File, if any.> Size: <minutes, an hour, a job>.` The phase in brackets is what the board page counts by. No screenshot is saved: the repository is public.
- Also read at /job: the README status line; `docs/08-open-questions.md` (*How Quark is built with Claude* and *Bugs*); by search, the spec pages the brief touches, `deploy/supabase/schema.sql` if it touches data, `gate/values-interview.md` and `packs/README.md` for values
- Also at close: update the *Where we are* note in this file (date, what is merged, what is on which branch, what is next), then the README status line so it agrees; the spec pages' *How it is built* sections and *Decided:* lines; for a tooling job, the *Decided:* lines in `docs/08-open-questions.md`. The repository is public: nothing written names a child.
- Read-back adds: the one live database, API spend, anything a child could see, anything naming a child in the public repository; if a choice touches a guardian's say or one of the project's rules, say so

Quark is an AI tutor that works for parents: curated, challenging, values-aware learning at home for kids roughly 6–12. This repo is both the open concept and, from now on, the code. Read this file first, then `README.md`, then the docs it links to. The docs are the spec.

## The first family

Two boys, 7 and 9, in Hawaii, each with a recent iPad. One hosted copy on Vercel + Supabase, used only by this family. Parents: Brandon (builds it) and his wife (co-owner of the values side). Everything is built so other families can run their own copy later.

## Rules that never bend

1. **Not a brainwashing engine.** The tutor teaches how to think, never hides that others believe differently, never uses fear or shame, never teaches a child to look down on anyone.
2. **Every guardian has an equal say.** Any guardian can blackball a topic; only that guardian can lift it. Disagreements default to parent-led.
3. **Hints, never answers.** The child guesses first. Hints are a conversation, not a button. The last hint hands off to a person. The screen never gives the answer.
4. **No engagement hooks.** No autoplay, infinite scroll, streaks, notifications, outbound links, ads, or rewards that exist only to bring kids back. The tutor is a guide, not a friend or companion.
5. **Nothing reaches a child unchecked.** Every card passes the policy gate (family values profile + blackballs + safety floor) before it is shown.
6. **Sex is a starting prior, not a ceiling.** It leans the first week's opening lens; after that the child's own choices carry the weight. Never gate content by sex. All seven lenses stay available to every child.
7. **Minimal data about children.** Nickname, birth month, sex, reading level, interests. Never a full name, photo, school or address. Model prompts never include identifying details.
8. **Effort words, never brilliance words.** "For kids who keep trying," not "for smart kids."

## Where things are

- `docs/` — the concept, one page per topic. `13-architecture.md` has the stack. `12-teaching-that-tests-itself.md` has the hint/difficulty rules. `09-family-values.md` and `packs/README.md` have the values system and the 24 controversial points.
- `supabase/migrations/` — the data model as it actually runs, applied in order. Read it before touching data. `deploy/supabase/schema.sql` is the readable model the migrations started from. Key chain: `plan_topics → themes → ideas (shared, source-anchored) → cards (per child, per lens, layers 1–4) → questions → attempts`.
- `gate/values-interview.md` — how a family's answers become `values_settings` rows and a plain-English policy document the gate reads.
- The private working doc (not in the repo) has more detail on lenses, the learner model, and the reward engine. Brandon can paste sections on request.

## Stack for version one

- Next.js (App Router) on Vercel. One app, two views: `/kid` (the Wonder Wall, locked tablet, voice-first) and `/parent` (settings, values interview, digest).
- Supabase: Postgres (schema above), Auth for guardians, Storage for images/audio. The kid view uses a scoped key that can only read today's passed cards and write attempts.
- Model: Anthropic API via a thin adapter (`core/model.ts`) so the provider can be swapped. Keep prompts in versioned files under `core/prompts/`, never inline.
- Weekly curation: one Vercel cron route, called eight times on Sunday (Hawaii time, 6 am to 8 pm, every two hours), each call building one day of next week into review, because a week does not fit one function and a day does (decided 20 Oct 2026; docs/04, "How the Sunday build is built"). If a day ever takes over 240 seconds, the next step is the Pro plan, not a worker.
- Policy gate: a second model call per card, with the family's policy document as the policy. It passes or holds back a card, never rewrites it, and logs what it held back and why to `cards.policy_notes` (decided 20 Oct 2026).
- Email digest: Resend. Car audio: an RSS file in Storage. Voice: browser speech APIs on iPad Safari first.
- TypeScript throughout. Tests with Vitest. Keep it boring.

## Conventions

- Small commits with plain messages. Branch per phase (`phase-1-foundation`, …); merge to `main` when it runs.
- Secrets in `.env.local` only; never commit them. Add `.env.example` with placeholder names.
- Every outside content item carries its source and license. Nothing unapproved is shown to a child.
- When a design question comes up that the docs don't settle, write the options into `docs/08-open-questions.md` (or the open questions of the page it belongs to) and ask Brandon rather than guessing.
- Don't rename "Quark" or "Wonder Wall". Don't add "AI" to any user-facing name.
- End every build session the same way, before the last commit: update the Where we are note under Build order (date, what's merged, what's on which branch, what's next), then update the Status line in README.md so it agrees with it. The README status is for visitors and stays short; CLAUDE.md carries the detail. If a session ends without this, the next session does it first.

### Kinds of session

Each starts with a skill typed in Claude Code (`.claude/skills/`).

- `/idea <words>`: one row in `docs/board.md`, committed on the branch you are on. Never reads, diagnoses or asks.
- `/ask <question>`: answers from the records, sources named. Read only.
- `/job <brief>`: reads the records and the brief, says where it stands and which branch is checked out, does step 1 and stops. Every question comes with a recommended answer; it ends "reply go to take all of these".
- `/side <name>`: opens or resumes `side/<name>` in its own worktree, with `docs/side/<name>.md`. Never touches `main`, a phase branch or the board.
- `/bugs <words>`: one line under Bugs in docs/08, committed. Never diagnoses; saves no screenshot (the repo is public).
- `/sweep`: proposes a batch of bugs that fits the branch checked out, stops for a yes, deletes the lines it fixes.
- `/close`: the end of any job: the records, `npm run docs:board`, the commits, the full report, the read-back, `/cost`.

### The board

- `docs/board.md` is the one list of every feature, from first mention to live or not doing, one row each, with its stage, what it waits on, size, importance and phase. Public: no row names a child.
- `/idea` adds a row; `/close` moves the rows a job touched; nothing else writes it.
- `npm run docs:board` writes `Quark board.html` at the repository root (not tracked), to open in a browser at the laptop. Bugs stay in docs/08 and show as a count per phase.
- A row names one thing that can be briefed and built. Open questions that are decisions for Brandon and June stay in docs/08.

## Before a consequential action

**The report is the control, not the ask** (decided 17 Oct 2026, replacing slice 1's ask-list as the first line). Risk is caught by the full report read in the chat, before a go and at the close. A permission prompt is a click, not a check.

- **Three stops.** Three classes Claude Code runs only at a stop the brief names: any command against the live database (`:live` scripts, `supabase`, anything that reads `.env.live.local`), anything that moves money, and anything that sends to a real person. Claude Code prepares the command, writes the pre-flight report to the report file and stops; Brandon says yes, and Claude Code runs the command. A new migration always waits for his yes, inside a fix too. The "real person" class has no command yet; the phase 5 digest brief adds it when Resend arrives.
- **Stops in the brief.** A brief lists its risky steps (live database, money, a real person, anything a child will see) and puts a STOP before each. The pre-flight report at a stop has four lines: what is about to happen; what it touches (LIVE in capitals, or "not live"); how it is undone, or that it cannot be; what was checked on test.
- **Everything else runs without asking:** deletes, kills, npm, gh, curl, Vercel reads, the test database, reads of anything but a secret file. API spend from `week:build`, `gate` and `content:fetch` runs freely up to $25 a run (decided 20 Oct 2026, measured with the gate: a full week is about $11.55 to $13.44; it replaces the $10 line of 18 Oct 2026); a brief puts a STOP above that, with the estimate in the pre-flight report.
- **The backstop.** `.claude/settings.json` asks on a short list that marks the three stop classes: a push to `main` or any force push, `npm run *:live*`, the live env file, the Supabase CLI and `db-push`, `stripe`, the secret files (`.env.local`, `.env.*.local`, never `.env.example`), and `git add -A`, `git add .`, `git commit -a` (the repo is public). Each pattern starts with `*` so a `cd … &&` prefix cannot hide the command. It is a backstop, not the control: **a backstop ask that fires is itself a finding**, because a brief missed a stop, and the close report says so, true or false positive. Never claim an ask fired unless a prompt was seen.
- **The description rule stays.** Any command near the backstop, and the pre-flight report, carry three plain-words facts: what it does, what it touches (LIVE in capitals, or "not live"), whether it can be undone; say first if it cannot. "Run shell command" is never a description. One action per command near the backstop: never chain it with others (a `grep` whose text names `db-push` matches too).
- There are two Supabase projects: the boys' live copy and `quark-test`. Test is the default: `.env.local` points at it, and `npm run dev`, `db:push`, `seed`, `packs:import`, `plan:import`, `content:fetch` and `week:build` run against it. Live has its own file, `.env.live.local`, read only by the scripts with `:live` in their name (`db:push:live` and so on; a Vitest check holds that rule). Each script prints `Target: LIVE` or `Target: test` first and refuses if `QUARK_TARGET` in its env file disagrees.
- A migration reaches live only after it has run on test from the same branch, in the same session, with the result shown.
- The test project is where a rule is proven. The live project is never used to prove one: do not run `db:push:live`, `supabase` or any script that reads `.env.live.local` to test a permission, not even with `--dry-run`. Nothing is ever copied from live to test; test holds `scripts/family.example.json`-style invented children and a plus-address guardian (`scripts/family.test.json`, gitignored).
- Claude Code runs as one writer per working tree: the chat never edits files in this folder while a session is open in it; a second parallel job uses `claude --worktree`. Sonnet for a briefed job; Opus or `opusplan` when the brief leaves a design choice open.
- Every job's last message is the full report, unchanged, for the records and the next session, then the read-back from the `readback` reader (`/readback <brief>`, Sonnet): four lines, under 25 words each. Brandon answers the read-back. The reader never says Brandon approved or decided something the report does not quote him on. See docs/08, "How Quark is built with Claude".
- A bug seen is one line under Bugs in `docs/08-open-questions.md`, not a brief. When a handful have gathered, one sweep job fixes a batch.

### Toolbelt

- At the start of a `/job`, suggest plan mode (`/plan`) for step 1.
- After a run that has to be undone, mention `/rewind`.
- At `/close`, remind Brandon to run `/cost` and put the figure in the report.
- When a brief leaves a design choice open, suggest `opusplan`.

## Build order

1. **Foundation** — Next.js app, Supabase project wired up, schema applied, guardian sign-in, empty `/kid` and `/parent` views, iPad in Guided Access can open it.
2. **Values interview + policy gate** — the interview UI per `gate/values-interview.md`, rows written, policy document generated, the 20-question test run shown to parents.
3. **Curation engine v1** — weekly cron: pick theme from `plan_topics`, generate ideas (source-anchored), render cards per child per lens, gate them, load the week.
4. **Wonder Wall** — five daily cards, layers 1–4, voice answers, hints as conversation, profiles, explorer stamps, calm session end on rushing.
5. **Digest and audio** — Sunday email, RSS feed, art-of-the-week.
6. **Checks and difficulty** — delayed recall via `review_schedule`, hint-count difficulty dial, results in the digest.
7. **Pilot** — four weeks with the boys.

**Where we are (end of 20 Oct 2026):** phases 1 and 2 are merged to `main`. Phase 3 is on `phase-3-curation`, not merged, and nothing is on the iPads yet.
- Done: step 1 (model adapter, lenses spec), 2 (the plan), 2b (a picture for every topic), 2c (layer 1 always has a picture), 2d (short lessons and mixed weeks), 3 (content), 4 (ideas and cards), 4b (the models and costs page), 4c (the week preview with pictures and sound); 5 (the policy gate) is built, on test and on live (day 1 checked 20 Oct); 6 (the Sunday cron and the Looks-good page) is built and proven on test, not on live (20 Oct; see the note at the end of this list).
- 4b: `/parent/models`, read-only, linked from `/parent`: the model per job from the environment, the price table in `core/prices.ts` (checked 16 Oct), every run, and an estimate for a week and a month beside the old $5.70. `week:build` and `content:fetch` now write a row to `model_runs` at the end of each run (counts and money only); migration `20261016000000_model_runs` is applied live. One run is recorded so far, a $0 `content:fetch`; the estimate appears after the next `week:build`. Defaults to settle are in docs/08, "Models and costs".
- Credit lines on the week preview are clean (`credit()` in `core/content/credit.ts`): no Commons edit trail or repeats, the Met once, and Aida's 1871 kept with Verdi, apart from the Marine Band.
- 2b: all 24 Egypt topics have sources (Brandon's picks from `plan/candidates/ancient-egypt.md`), plus a Met harp and sistrum for week 1's listen topic; `planWarnings()` names topics without any. 35 new items, all approved automatically. Still waiting at `/parent/content`: the CC BY-SA Rosetta photo and Musopen's Handel, neither in week 1.
- 2c: `firstLayerProblem()` in `core/curation/ideas.ts` sends a chain back once when layer 1 has no item but the topic has one; the report lists any still missing.
- Day 1 was rebuilt as a mixed day on 16 Oct for $0.85 and is in review at `/parent/week/[theme]`: Egypt on then (the Nile), with great-wave, leap-years, carnival-of-the-animals (The Swan) and two-dice. Every first card has an item, with no second asks; 11 of 20 layers per child use one. The 7-year-old's two-dice layer 1 was held back by a hint-check false positive ("each one" read as the answer "one and one"; docs/08). The 14 Oct day 1 is exported to `plan/candidates/day1-2026-10-14.json`, gitignored because it names the children.
- Open, in docs/08: the 3-4-5 rope as a parent activity; the tutor's voice (proposed as step 4d) and faces; the rest of the 2c review (the announced door, too many words, the hint check's false positives, how much is one day); the Hawaiian overthrow as its own lesson; the models page defaults.
- 2d: a week is mixed (docs/04, "How a week is mixed"): Egypt is a thread, one topic a day on its own slot, and the other four slots take short lessons from `plan/short-lessons.yaml` (28, picked by Brandon and June; candidates in `plan/candidates/short-lessons.md`). `weekSchedule()` in `core/curation/schedule.ts`; migration `20261016000001_mixed_weeks` (`plan_topics.kind` and `position`, `themes.plan_week`) is applied live and the library imported. content:fetch added 50 items, all approved automatically with no flags; only the old Rosetta photo and Musopen Handel still wait at `/parent/content`. Two fetch fixes: the Art Institute's images need its header, and an original over 20 MB is stored as its preview. Four-notes has no recording: a parent plays it (decided 16 Oct).
- Next, in order: June reads the safety floor, the twenty questions and the subject 13 question in docs/08; then the release (`/wwc:release`; step 6 is the last phase 3 build). The Sunday build starts only when Brandon sets `CRON_SECRET`, `ANTHROPIC_API_KEY` and the three model names in Vercel's production environment; its first Sunday will refuse for want of lessons and spend nothing. Before week 2 is built, the library needs more lessons: week 1 uses all 28. No week is made live on live until the board row *Guardians can't write a week's status or a card's verdict directly* has its migration there (phase 4, decided 20 Oct); the unique-index row waits on a real week 2 on live.
- Tooling: slice 2 of "working with Claude" (17 Oct: `docs/board.md`, `npm run docs:board`, the seven session skills, with slice 1's ask-list and `/readback`) is merged into this branch from `main` (17 Oct, `2ec4762`, pushed; the merge job was one session, no new decisions); it is not phase work. Phase 3 still waits to merge to `main`, and when it does this note stays as the record.
- A sweep (17 Oct, on `phase-3-curation`, pushed): three bugs fixed. `db:push` scrubs the connection string and password from the CLI's output (the CLI has no environment route for the URL, so `--db-url` stays; untried against the real CLI); the sweep skill's last step asks Brandon to type `/close`; the hint check counts a repeated word in an accepted answer as often as the answer uses it ("Does each one count?" no longer matches "one and one"; the leak tests still pass). Left in docs/08: the comparison-hint false positive (its example was never recorded) and the announced door (step 4d).
- A test database (18 Oct, on `test-database`, made from `phase-3-curation`, pushed, not merged; tooling): a second Supabase project, `quark-test`, now holds the 10 migrations, an invented family (plus-address guardian, signed in at `/parent`), the 10 packs and the plan. `.env.local` is test and `.env.live.local` is live; both carry `QUARK_TARGET`. Every database script defaults to test, the six that touch data have `:live` twins, each prints `Target: LIVE|test` first and refuses a mismatch (`scripts/target.ts`, with a Vitest check that only `:live` scripts read the live file). `test-database` is merged into `phase-3-curation`. Board row: *on test*, waiting on the live push only, since the migrations workflow applied a real migration (`gate_test_runs`) on test on 20 Oct.
- Slice 4 of "working with Claude" (18 Oct, on `working-with-claude-4`, made from `phase-3-curation`, pushed, not merged; tooling): the report is the control, not the ask. Live-database commands, money and anything sent to a real person are run by Brandon's hand; a brief names its stops; the ask-list is cut to a 14-pattern backstop with leading `*` (`.claude/settings.json`, swapped in by Brandon); API spend runs freely up to $10 a run. CLAUDE.md's *Before a consequential action*, `/job` and `/close` say so; decisions are in docs/08. Proven on the restarted session: a `cd`-prefixed dry-run push to `main` asked and Brandon declined it; `cd … && npm run db:push` did not ask and printed `Target: test`; `/job docs/test-database-slice.md` listed its live dry-run as Brandon's by-hand step and stopped. Board row: *live*. Brandon merges the branch into `phase-3-curation` by hand. The PDERP half is its own session on `service`. Phase 3 is otherwise as above; next is still step 5, the gate.
- The policy gate (20 Oct, on `phase-3-curation`, pushed; phase 3 step 5, `docs/gate-slice.md`, report `docs/reports/2026-10-20-gate-slice.md`): built and proven on `quark-test`, and on live since the evening of 20 Oct (see the next note). Each card goes from `pending` to `passed` or `blocked` and is never rewritten; any fault leaves it `pending` (docs/04, "How the gate is built"). A blackballed, never or too-young subject holds a card back in code, from the same merge the compare page uses (`lib/family-rulebook.ts`); one Opus 5.5 call per card judges the rest, given a rulebook copy that names no child, the topic's subjects, the child's grade band and the `careful_about` note, nothing else about the child. Reader notes are kept (a handoff naming a parent is by design, `gate.md` v2). `gate/safety-floor.md` is docs/09's three items, a first guess pending June. It runs at the end of `week:build` (`--plan` shows what the settings decide and spends nothing) and as `npm run gate`; `learns_to_act` is in the card prompt (`card.md` v5). The rulebook page has the twenty-question test run, kept in `gate_test_runs` (migration `20261020000000`, applied to test by the workflow; on live since the gate-live job). Measured: $0.026 a card; day 1 with the gate $1.66; a full week about $11.55 to $13.44; the run line is now $25 (Brandon, 20 Oct). On test, day 1: 28 passed, 8 held back in code, 2 by the checker; the twenty questions 20 of 20 and 19 of 20, the miss being subject 13 (an open question in docs/08). The test copy keeps a reorder of day 1 (`plan:import` on test undoes it) and a caution note on an invented child. Board row: *on test*, waiting on the release and June.
- The gate on live (20 Oct, on `phase-3-curation`; report `docs/reports/2026-10-20-gate-live.md`): `db:push:live` applied `20261020000000` (Brandon's yes at stop 1; the CLI did not prompt), then `gate:live -- --week 1` ran on his yes at stop 2: of week 1's 40 cards 39 `passed`, none held back in code or by the checker, none pending, one left as the card checks held it. Measured on the live rulebook (6,823 characters in the gate's copy): $0.93, $0.024 a card, so the week estimate stands (docs/04). `gate.md` v2 held on its first real run: 36 reader notes, none about a handoff naming a parent. About half the notes say a card gives its answer before the question (the card prompt's, step 4d). Nothing a child sees changed. Not done: the release, step 6, any rebuild.
- A sweep (20 Oct, on `phase-3-curation`; tooling): one bug fixed, `5cdb5a7`. Both boys' nicknames are replaced by invented ones (Pip, Wren, as `core/curation/gate.test.ts` has) in `core/curation/clean.ts`, `scripts/week-build.mts`, the two test files, `gate/values-interview.md` and `docs/08-open-questions.md`; no tracked file outside `packs/` carries either real name now (the history does). Left in docs/08: the hint check's comparison false positive, the announced door (step 4d), and the commit message that quoted a command (the wwc sweep skill already forbids it). Tests and typecheck pass. Not pushed until this close.
- The Sunday build and the Looks-good page (20 Oct, on `phase-3-curation`, pushed; phase 3 step 6, `docs/looks-good-slice.md`, report `docs/reports/2026-10-20-looks-good-slice.md`): built and proven on `quark-test`, nothing on live, no migration. One route, `/api/cron/week`, called eight times on Sunday from 6 am to 8 pm Hawaii (`vercel.json`), builds the next unbuilt day of next week, because a week does not fit a Hobby function and a day does; it refuses before spending, records every firing in `audit_log` (no child named), and takes a lock out of those rows. The whole of test's week 1 was built through it, and a day takes about 130 seconds since both children's cards are written at once (the rule and the per-day table are in docs/04: under 240 seconds is fine, over 240 is the Pro conversation). The Looks-good tap is on `/parent/week/[theme]`: any one guardian, refused unless the week is in review with all seven days and every card checked against today's rulebook and floor, taken back to review until Monday midnight Hawaii; `/parent` says which week is ready and what Sunday did. Found along the way: nothing in the database stops a day being written twice (a board row for the unique indexes), and a guardian can insert audit rows (added to the direct-write row). Not proved: a day with pictures (test has never run `content:fetch`; a board row), and anything on Vercel. Test holds week 1 in review and a block on subject 14.

Success for version one: both boys use it unprompted 4+ days a week, sessions of 15+ minutes of real engagement, recall from three weeks earlier without hints, under 30 minutes a week of parent time.
