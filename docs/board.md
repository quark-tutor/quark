# Board

Every Quark feature from first mention to live or not doing, one row each, newest
movement first. It answers where Quark stands, what is waiting, what needs a brief and
what is only an idea. Features only: bugs are under *Bugs* in `docs/08-open-questions.md`
and show on the page as a count per phase; open questions that are decisions for Brandon
and June stay in docs/08. This repository is public: no row names a child, and "the boys"
is the most a row says.

`/idea` adds a row at the top. `/close` moves the rows a job touched, with today's date.
`npm run docs:board` writes `Quark board.html` at the repository root (not tracked). A
*live* row stays 14 days after it moved and is then deleted by `/close`; the *Where we are*
note and the spec pages are the record of what is live. A *not doing* row stays, with its
reason in Waiting on.

A row names one thing that can be briefed and built. A heading that covers several things
is replaced by its unbuilt pieces, or deleted; nothing is a row that only says "the rest of".

Stages: not fully formed (worth keeping, not described well enough to size) · raised
(sized or sizeable; nobody has promised anything) · briefed (a `docs/<name>-slice.md`
exists) · building (a job is on it) · on test (built and waiting on a person's check or go:
Brandon at the laptop, or the boys on an iPad) · on hold (built; nothing to do until a named
date or event, which goes in Waiting on) · live (merged to `main` and running on Vercel) ·
not doing.

Size: minutes · an hour · a job · a slice · several slices · — (blank until checked
against the code). Importance is Brandon's, then June's, never averaged; — until rated.
Phase: 1–7 from the build order in CLAUDE.md, `tooling` (how Quark is built with Claude),
or — when it fits none; a row that spans phases takes the last one it needs.

| Feature | Stage | Moved | Waiting on | Size | Importance | Phase | Where |
|---|---|---|---|---|---|---|---|
| Wonder Wall slice 1: today's five cards, layers, hints as written, the handoff, on a paired iPad | building | 21 Oct 2026 | the build (steps 2 and 3), then Brandon on a real iPad at the stop; target: the boys using it on Monday 26 Oct 2026 | a slice | — / — | 4 | `docs/wonder-wall-1-slice.md`; `docs/reports/2026-10-20-wonder-wall-brief.md`; `phase-4-wonder-wall` |
| The boys' first live week: live week 1 deleted and built again to start Monday 26 Oct, read and tapped | briefed | 20 Oct 2026 | slice 1 released; stops M1 to M4 by Brandon's hand (Fri 23 to Sat 24 Oct, about $13); a guardian's tap on Sun 25 Oct; June's read of the safety floor before the build | a job | — / — | 4 | `docs/wonder-wall-1-slice.md`, *The week for Monday* |
| 28 more short lessons for week 2, picked before Saturday 31 Oct, or the wall is empty from Monday 2 Nov | raised | 20 Oct 2026 | Brandon and June picking them (candidates drafted by Claude Code, as for the first 28) | a job | — / — | 3 | `plan/short-lessons.yaml`; `plan/candidates/short-lessons.md`; `docs/wonder-wall-1-slice.md`, *The week for Monday* |
| Wonder Wall slice 2: after a handoff, the card's next layer opens the next day | raised | 20 Oct 2026 | slice 1 built; it widens the docs/04 rule ("its day is today") by one case | a job | — / — | 4 | `docs/wonder-wall-1-slice.md`, decision 2; `docs/08-open-questions.md`, "Wonder Wall, slice 1" |
| Recordings stored in the private bucket like pictures, so the wall never fetches from Wikimedia | raised | 20 Oct 2026 | before offline; a `content:fetch` change and a fetch on live | a job | — / — | 4 | `docs/04-curation-engine.md`, "How the approval rule is built"; `docs/wonder-wall-1-slice.md`, *To settle* |
| Guardians can't write a week's status, a card's verdict or an audit row directly: only the server can | briefed | 20 Oct 2026 | the slice 1 build (its migration, with five `/parent` audit writes moved to the server); then stop M1, `db:push:live` after the release, before any theme is made live on live | an hour | high / — | 4 | `docs/wonder-wall-1-slice.md`, decision 4; `docs/04-curation-engine.md`, "How a week goes live"; `supabase/migrations/20261010000002_data_api_grants.sql` |
| Pictures on the test copy: run content:fetch on quark-test | briefed | 20 Oct 2026 | the slice 1 build's step 3.4 (about $2 on test, then test's week 1 built again with pictures) | minutes | — / — | 4 | `docs/wonder-wall-1-slice.md`, step 3.4; `scripts/content-fetch.mts` |
| A week's lens plan is kept from day 1, so taps on a Sunday cannot change later days | raised | 20 Oct 2026 | the slice that feeds lens history to the picker (`history: {}` in `core/curation/week-job.ts`); slice 1's answers don't | an hour | — / — | 4 | `docs/04-curation-engine.md`, "How the Sunday build is built"; `docs/wonder-wall-1-slice.md`, decision 3 |
| Pilot: four weeks with the boys | raised | 20 Oct 2026 | Wonder Wall slice 1 and the boys' first live week (from Mon 26 Oct 2026); the iPads paired to live; 28 more short lessons before week 2 (decided 20 Oct: slice 1, then the iPads, then the pilot) | — | — / — | 7 | CLAUDE.md, *Build order*; `docs/wonder-wall-1-slice.md` |
| Wonder Wall: five daily cards, layers 1–4, voice, hints as conversation, stamps, calm end | raised | 20 Oct 2026 | slice 1 briefed (`docs/wonder-wall-1-slice.md`); split into its pieces at slice 1's close | several slices | — / — | 4 | `docs/03-touch-points.md`, `docs/12-teaching-that-tests-itself.md` |
| The Sunday cron and the Looks-good page: a guardian's one tap makes a week live | live | 20 Oct 2026 | — (open checks: Brandon sets `CRON_SECRET`, the API key and the three model names on Vercel, which starts the Sunday build; its first Sunday on live; more short lessons before a real week 2; the direct-write row's migration before any week is made live on live) | a slice | — / — | 3 | `docs/looks-good-slice.md`; `docs/reports/2026-10-20-looks-good-slice.md`; `docs/04-curation-engine.md`; `phase-3-curation` |
| Curation engine v1: weekly cron, ideas, cards, gate, load the week | live | 20 Oct 2026 | — (open checks: June on the safety floor and the twenty questions) | several slices | — / — | 3 | `docs/04-curation-engine.md`; `phase-3-curation` |
| The policy gate: every card approved or blocked before a child could see it | live | 20 Oct 2026 | — (open checks: June on the safety floor and the twenty questions) | a slice | — / — | 3 | `docs/gate-slice.md`; `docs/reports/2026-10-20-gate-slice.md`; `docs/reports/2026-10-20-gate-live.md`; `phase-3-curation` |
| A test Supabase project, so a migration from a branch cannot touch the live database | live | 20 Oct 2026 | — (open checks: the migrations workflow's live job waits on `SUPABASE_DB_URL_LIVE`, so a live migration is still `db:push:live` at a stop) | a job | high / — | tooling | `docs/test-database-slice.md`; `test-database` |
| A day cannot be written twice: unique indexes on ideas and cards | raised | 20 Oct 2026 | before a real week 2 on live | an hour | — / — | 3 | `docs/04-curation-engine.md`, "How the Sunday build is built"; `supabase/migrations/20261014000000_week_build.sql` |
| A guardian can ask for a week's cards to be checked again from the week page | not fully formed | 20 Oct 2026 | a brief; it would spend from a page | — | — / — | 3 | `docs/looks-good-slice.md`, *Not in this job* |
| A firing stopped at the time limit still records what it spent | not fully formed | 20 Oct 2026 | a brief; `/parent/models` undercounts it now | — | — / — | 3 | `docs/04-curation-engine.md`, "How the Sunday build is built" |
| A guardian can enter what to be careful about for each child | not fully formed | 20 Oct 2026 | a brief; the gate reads the note now (proven on test) | — | — / — | 3 | `docs/gate-slice.md`, *To settle* |
| Prompt caching of the policy document in the model adapter | not fully formed | 20 Oct 2026 | Brandon: the gate measured at $0.026 a card, about $5 to $7 a week | — | — / — | 3 | `docs/gate-slice.md`, *To settle* |
| Safety-floor lessons in the plan: body safety, telling a trusted adult, emergency basics | not fully formed | 20 Oct 2026 | June reading the safety floor | — | — / — | 3 | `docs/gate-slice.md`, decision 8; `docs/09-family-values.md` |
| Working with Claude, slice 5: the method is the wwc plugin | live | 19 Oct 2026 | — | a slice | — / — | tooling | `BrandonReisen/working-with-claude`, `docs/one-method-slice.md` |
| Ask-list rewrite: stops at steps, not commands; live actions run by Brandon’s hand | live | 18 Oct 2026 | — (the three proofs held; merge `working-with-claude-4` into `phase-3-curation` by Brandon's hand) | a slice | high / — | tooling | `docs/working-with-claude-4-slice.md`; `working-with-claude-4` |
| Vercel preview deployments pointed at the test project | raised | 18 Oct 2026 | the test database job merged | an hour | — / — | tooling | `docs/test-database-slice.md` |
| Working with Claude, Quark: the state board and the seven session skills | live | 17 Oct 2026 | — | a job | — / — | tooling | `docs/board-slice.md` |
| Delete the docs/08 items folded into board rows | raised | 17 Oct 2026 | phase 3 merged | minutes | — / — | tooling | `docs/08-open-questions.md` |
| `docs/decisions.md`, newest first with what each replaced | raised | 17 Oct 2026 (seeded) | its own small job | an hour | — / — | tooling | review, job 8 |
| Checks on GitHub: `checks.yml` running typecheck and tests on push | raised | 17 Oct 2026 (seeded) | its own job | an hour | — / — | tooling | review, job 7 |
| The Claude GitHub app for pull-request review | raised | 17 Oct 2026 (seeded) | — | — | — / — | tooling | review, job 7 |
| Digest and audio: Sunday email, RSS, art of the week | raised | 17 Oct 2026 (seeded) | phase 4 | a slice | — / — | 5 | `docs/03-touch-points.md` |
| Checks and difficulty: delayed recall, hint-count dial, results in the digest | raised | 17 Oct 2026 (seeded) | phase 5 | a slice | — / — | 6 | `docs/12-teaching-that-tests-itself.md` |
| A second reviewer from another vendor (Codex) | not fully formed | 17 Oct 2026 (seeded) | plan mode and the checks becoming habits | — | — / — | tooling | review §8; `AGENTS.md` |
| Where the limits on "Ask" are | not fully formed | 17 Oct 2026 (seeded) | a brainstorm with June | — | — / — | 4 | `docs/08-open-questions.md` |
| A knowledge sequence a family can swap | not fully formed | 17 Oct 2026 (seeded) | — | — | — / — | — | `docs/08-open-questions.md`; `plan_topics` |
| Sample weeks written so they can be shared and reused | not fully formed | 17 Oct 2026 (seeded) | — | — | — / — | 3 | `docs/08-open-questions.md` |
| Working with Claude, slice 1: ask-list, readback reader, plain-words rule | live | 16 Oct 2026 | — | — | — / — | tooling | `docs/working-with-claude-slice-1.md` |
| Phase 2: Our Family's Beliefs, compare, rulebook, conduct questions and blocks | live | 11 Oct 2026 | — | — | — / — | 2 | `docs/09-family-values.md` |
| Phase 1: foundation | live | 10 Oct 2026 | — | — | — / — | 1 | `docs/13-architecture.md` |
