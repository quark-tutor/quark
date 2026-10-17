# Quark — instructions for Claude Code

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
- `deploy/supabase/schema.sql` — the data model, 28 tables, validated on Postgres 16. Read it before touching data. Key chain: `plan_topics → themes → ideas (shared, source-anchored) → cards (per child, per lens, layers 1–4) → questions → attempts`.
- `gate/values-interview.md` — how a family's answers become `values_settings` rows and a plain-English policy document the gate reads.
- The private working doc (not in the repo) has more detail on lenses, the learner model, and the reward engine. Brandon can paste sections on request.

## Stack for version one

- Next.js (App Router) on Vercel. One app, two views: `/kid` (the Wonder Wall, locked tablet, voice-first) and `/parent` (settings, values interview, digest).
- Supabase: Postgres (schema above), Auth for guardians, Storage for images/audio. The kid view uses a scoped key that can only read today's passed cards and write attempts.
- Model: Anthropic API via a thin adapter (`core/model.ts`) so the provider can be swapped. Keep prompts in versioned files under `core/prompts/`, never inline.
- Weekly curation: a Vercel cron route on Sunday night (Hawaii time). If it outgrows the function limit, move to a worker.
- Policy gate: a second model call per card, with the family's policy document as the policy. Log what it changed to `cards.policy_notes`.
- Email digest: Resend. Car audio: an RSS file in Storage. Voice: browser speech APIs on iPad Safari first.
- TypeScript throughout. Tests with Vitest. Keep it boring.

## Conventions

- Small commits with plain messages. Branch per phase (`phase-1-foundation`, …); merge to `main` when it runs.
- Secrets in `.env.local` only; never commit them. Add `.env.example` with placeholder names.
- Every outside content item carries its source and license. Nothing unapproved is shown to a child.
- When a design question comes up that the docs don't settle, write the options into `docs/open-questions.md` and ask Brandon rather than guessing.
- Don't rename "Quark" or "Wonder Wall". Don't add "AI" to any user-facing name.

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

`.claude/settings.json` lists what stops and asks first: a push to `main` or any force push, `git add -A`, `git add .` and `git commit -a` (the repo is public), any Supabase CLI use and `npm run db:push`, the scripts that write to the live database or spend API money, deletes and kills, secrets, Vercel, and outbound web writes. Nothing is blocked; it is asked. Brandon sees only the prompt, so **the command's description line carries all three plain-words facts itself, compressed**: what it does, what it touches on live (write LIVE in capitals when it is the live database), and whether it can be undone. Chat lines above the command are extra, never the rule. Say first if it cannot be undone. Never show a bare command as the question.

- There is one Supabase project and it is the boys' live copy, so every migration command is on the list, and a new migration always stops, inside a fix too.
- The live project is never used to prove a rule. Do not run `db:push`, `supabase` or any script that reads `SUPABASE_DB_URL` to test a permission, not even with `--dry-run`.
- A stop that fired and was approved is still a stop: say so in the report.
- Claude Code runs as one writer per working tree: the chat never edits files in this folder while a session is open in it; a second parallel job uses `claude --worktree`. Sonnet for a briefed job; Opus or `opusplan` when the brief leaves a design choice open.
- Every job's last message is the full report, unchanged, for the records and the next session, then the read-back from the `readback` reader (`/readback <brief>`, Sonnet): four lines, under 25 words each. Brandon answers the read-back. The reader never says Brandon approved or decided something the report does not quote him on. See docs/08, "How Quark is built with Claude".
- A bug seen is one line under Bugs in `docs/08-open-questions.md`, not a brief. When a handful have gathered, one sweep job fixes a batch.

### Toolbelt

- At the start of a `/job`, suggest plan mode (`/plan`) for step 1.
- After a run that has to be undone, mention `/rewind`.
- At `/close`, remind Brandon to run `/cost` and put the figure in the report.
- When a brief leaves a design choice open, suggest `opusplan`.

## Build order

1. **Foundation** — Next.js app, Supabase project wired up, schema applied, guardian sign-in, empty `/kid` and `/parent` views, iPad in Guided Access can open it. ← start here
2. **Values interview + policy gate** — the interview UI per `gate/values-interview.md`, rows written, policy document generated, the 20-question test run shown to parents.
3. **Curation engine v1** — weekly cron: pick theme from `plan_topics`, generate ideas (source-anchored), render cards per child per lens, gate them, load the week.
4. **Wonder Wall** — five daily cards, layers 1–4, voice answers, hints as conversation, profiles, explorer stamps, calm session end on rushing.
5. **Digest and audio** — Sunday email, RSS feed, art-of-the-week.
6. **Checks and difficulty** — delayed recall via `review_schedule`, hint-count difficulty dial, results in the digest.
7. **Pilot** — four weeks with the boys.

**Where we are (17 Oct 2026):** phases 1 and 2 are merged to `main`. Tooling slice "working with Claude, slice 1" (ask-list, `/readback`, the plain-words rule) is merged to `main`; it is not phase work. Tooling slice "working with Claude, slice 2" (17 Oct: `docs/board.md`, `npm run docs:board`, the seven session skills) is built, closed and pushed on `working-with-claude-2` (Brandon opened the page and it reads), on hold until Brandon merges it to `main`; merge `main` into `phase-3-curation` afterwards so phase 3 has the skills and the board. Phase 3 is on `phase-3-curation`, not merged, with its own, fuller Where we are note: when it merges, keep that note and add this line. Migrations 13–16 Oct are live but exist only on `phase-3-curation`, so `db:push` cannot run from this branch. Nothing is on the iPads yet.

Success for version one: both boys use it unprompted 4+ days a week, sessions of 15+ minutes of real engagement, recall from three weeks earlier without hints, under 30 minutes a week of parent time.
