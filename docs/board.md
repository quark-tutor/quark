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
| The policy gate: every card approved or blocked before a child could see it | briefed | 19 Oct 2026 | Brandon's own steps on the test copy; June on the safety floor and the twenty questions; then the build session | a slice | — / — | 3 | `docs/gate-slice.md`; `phase-3-curation` |
| Working with Claude, slice 5: the method is the wwc plugin | live | 19 Oct 2026 | — | a slice | — / — | tooling | `BrandonReisen/working-with-claude`, `docs/one-method-slice.md` |
| Ask-list rewrite: stops at steps, not commands; live actions run by Brandon’s hand | live | 18 Oct 2026 | — (the three proofs held; merge `working-with-claude-4` into `phase-3-curation` by Brandon's hand) | a slice | high / — | tooling | `docs/working-with-claude-4-slice.md`; `working-with-claude-4` |
| Vercel preview deployments pointed at the test project | raised | 18 Oct 2026 | the test database job merged | an hour | — / — | tooling | `docs/test-database-slice.md` |
| A test Supabase project, so a migration from a branch cannot touch the live database | on test | 18 Oct 2026 | the first real migration proven on test, then live | a job | high / — | tooling | `docs/test-database-slice.md`; `test-database` |
| Working with Claude, Quark: the state board and the seven session skills | live | 17 Oct 2026 | — | a job | — / — | tooling | `docs/board-slice.md` |
| Curation engine v1: weekly cron, ideas, cards, gate, load the week | building | 17 Oct 2026 | merge to `main` when it runs; next is step 5, the gate | several slices | — / — | 3 | `docs/04-curation-engine.md`; `phase-3-curation` |
| Delete the docs/08 items folded into board rows | raised | 17 Oct 2026 | phase 3 merged | minutes | — / — | tooling | `docs/08-open-questions.md` |
| `docs/decisions.md`, newest first with what each replaced | raised | 17 Oct 2026 (seeded) | its own small job | an hour | — / — | tooling | review, job 8 |
| Checks on GitHub: `checks.yml` running typecheck and tests on push | raised | 17 Oct 2026 (seeded) | its own job | an hour | — / — | tooling | review, job 7 |
| The Claude GitHub app for pull-request review | raised | 17 Oct 2026 (seeded) | — | — | — / — | tooling | review, job 7 |
| Wonder Wall: five daily cards, layers 1–4, voice, hints as conversation, stamps, calm end | raised | 17 Oct 2026 (seeded) | phase 3 merged | several slices | — / — | 4 | `docs/03-touch-points.md`, `docs/12-teaching-that-tests-itself.md` |
| Digest and audio: Sunday email, RSS, art of the week | raised | 17 Oct 2026 (seeded) | phase 4 | a slice | — / — | 5 | `docs/03-touch-points.md` |
| Checks and difficulty: delayed recall, hint-count dial, results in the digest | raised | 17 Oct 2026 (seeded) | phase 5 | a slice | — / — | 6 | `docs/12-teaching-that-tests-itself.md` |
| Pilot: four weeks with the boys | raised | 17 Oct 2026 (seeded) | phases 3–6; the iPads set up | — | — / — | 7 | CLAUDE.md, *Build order* |
| A second reviewer from another vendor (Codex) | not fully formed | 17 Oct 2026 (seeded) | plan mode and the checks becoming habits | — | — / — | tooling | review §8; `AGENTS.md` |
| Where the limits on "Ask" are | not fully formed | 17 Oct 2026 (seeded) | a brainstorm with June | — | — / — | 4 | `docs/08-open-questions.md` |
| A knowledge sequence a family can swap | not fully formed | 17 Oct 2026 (seeded) | — | — | — / — | — | `docs/08-open-questions.md`; `plan_topics` |
| Sample weeks written so they can be shared and reused | not fully formed | 17 Oct 2026 (seeded) | — | — | — / — | 3 | `docs/08-open-questions.md` |
| Working with Claude, slice 1: ask-list, readback reader, plain-words rule | live | 16 Oct 2026 | — | — | — / — | tooling | `docs/working-with-claude-slice-1.md` |
| Phase 2: Our Family's Beliefs, compare, rulebook, conduct questions and blocks | live | 11 Oct 2026 | — | — | — / — | 2 | `docs/09-family-values.md` |
| Phase 1: foundation | live | 10 Oct 2026 | — | — | — / — | 1 | `docs/13-architecture.md` |
