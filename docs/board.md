# Board

Every Quark feature Brandon has said yes to, one row each, run as GTD (`docs/working-with-claude.md` in
`BrandonReisen/working-with-claude`, *The board*). Bugs are lines under *Bugs* in `docs/08-open-questions.md`;
open questions that are decisions for Brandon and June stay in docs/08. This repository is public: no row names a
child, and "the boys" is the most a row says.

- **Inbox** (`not fully formed`): `/wwc:idea` files here; only Brandon clarifies it, in bulk.
- **Next** (`next`): the build list in Brandon's order, top down; the top row is the next brief. *Depends on*
  names the slice to build first, by its opening words.
- **Projects** (`project`, `someday`, `live`): the name, " — ", the goal. Its slices name it in *Project*: the
  one up at `next`, the rest at `later`, in build order. The phases of CLAUDE.md's build order are projects.
- **Waiting on** (`waiting on`): one significant thing outside the job that has to arrive.
- **Someday** (`someday`): set aside; back only by Brandon's hand.
- **In hand** (`building`, `on test`, `on hold`): one row at a time. **Live** (`live`): deleted 14 days after it
  moved; a project's live slices stay until the project is live.

Size: minutes · an hour · a job · a slice · several slices · — (blank until checked against the code). A *Where*
is a path in this repository or a link; words alone have nothing to open.

| Feature | Stage | Moved | Project | Depends on | Waiting on | Size | Where |
|---|---|---|---|---|---|---|---|
| Wonder Wall slice 1: today's five cards, layers, hints as written, the handoff, on a paired iPad | on hold | 22 Oct 2026 | Wonder Wall | — | the release | a slice | `docs/wonder-wall-1-slice.md`; `docs/reports/2026-10-21-wonder-wall-1-slice.md`; `phase-4-wonder-wall` |
| The boys' first live week: live week 1 deleted and built again to start Monday 26 Oct, read and tapped | next | 21 Oct 2026 | Pilot | Wonder Wall slice 1 | June's read of the safety floor before the build | a job | `docs/wonder-wall-1-slice.md`, *The week for Monday* |
| 28 more short lessons for week 2, picked before Saturday 31 Oct, or the wall is empty from Monday 2 Nov | next | 21 Oct 2026 | Week 2 builds itself | — | — | a job | `plan/short-lessons.yaml`; `plan/candidates/short-lessons.md`; `docs/wonder-wall-1-slice.md`, *The week for Monday* |
| Wonder Wall slice 2: after a handoff, the card's next layer opens the next day | next | 21 Oct 2026 | Wonder Wall | Wonder Wall slice 1 | — | a job | `docs/wonder-wall-1-slice.md`, decision 2; `docs/08-open-questions.md`, "Wonder Wall, slice 1" |
| Vercel preview deployments pointed at the test project | next | 21 Oct 2026 | — | — | — | an hour | `docs/test-database-slice.md` |
| Wonder Wall — the boys learn from five daily cards on the iPad: layers 1–4, voice, hints as a conversation, stamps, a calm end | project | 21 Oct 2026 | — | — | — | several slices | `docs/03-touch-points.md`, `docs/12-teaching-that-tests-itself.md` |
| Pilot — four weeks with the boys, from Monday 26 October 2026 | project | 21 Oct 2026 | — | — | — | — | CLAUDE.md, *Build order*; `docs/wonder-wall-1-slice.md` |
| Week 2 builds itself — the Sunday build makes week 2 on live on Sunday 1 November 2026 | project | 21 Oct 2026 | — | — | — | — | `docs/wonder-wall-1-slice.md`, *The week for Monday*; `docs/04-curation-engine.md`, "How the Sunday build is built" |
| Digest and audio — the Sunday email, the RSS feed for the car, art of the week (phase 5) | someday | 21 Oct 2026 | — | — | — | a slice | `docs/03-touch-points.md` |
| Checks and difficulty — delayed recall, the hint-count dial, results in the digest (phase 6) | someday | 21 Oct 2026 | — | — | — | a slice | `docs/12-teaching-that-tests-itself.md` |
| Recordings stored in the private bucket like pictures, so the wall never fetches from Wikimedia | later | 21 Oct 2026 | Wonder Wall | — | — | a job | `docs/04-curation-engine.md`, "How the approval rule is built"; `docs/wonder-wall-1-slice.md`, *To settle* |
| A week's lens plan is kept from day 1, so taps on a Sunday cannot change later days | later | 21 Oct 2026 | Wonder Wall | the slice that feeds lens history to the picker | — | an hour | `docs/04-curation-engine.md`, "How the Sunday build is built"; `docs/wonder-wall-1-slice.md`, decision 3 |
| A day cannot be written twice: unique indexes on ideas and cards; its brief's *Before the job* carries Brandon setting `CRON_SECRET`, `ANTHROPIC_API_KEY` and the three model names in Vercel's production environment | later | 21 Oct 2026 | Week 2 builds itself | — | — | an hour | `docs/04-curation-engine.md`, "How the Sunday build is built"; `supabase/migrations/20261014000000_week_build.sql` |
| A guardian can ask for a week's cards to be checked again from the week page | someday | 21 Oct 2026 | — | — | — | — | `docs/looks-good-slice.md`, *Not in this job* |
| A guardian can enter what to be careful about for each child | someday | 21 Oct 2026 | — | — | — | — | `docs/gate-slice.md`, *To settle* |
| Prompt caching of the policy document in the model adapter | someday | 21 Oct 2026 | — | — | — | — | `docs/gate-slice.md`, *To settle* |
| A second reviewer from another vendor (Codex) | someday | 21 Oct 2026 | — | — | — | — | review §8; `AGENTS.md` |
| A knowledge sequence a family can swap | someday | 21 Oct 2026 | — | — | — | — | `docs/08-open-questions.md`; `plan_topics` |
| Sample weeks written so they can be shared and reused | someday | 21 Oct 2026 | — | — | — | — | `docs/08-open-questions.md` |
| The Claude GitHub app for pull-request review | someday | 21 Oct 2026 | — | — | — | — | review, job 7 |
| `docs/decisions.md`, newest first with what each replaced | someday | 21 Oct 2026 | — | — | — | an hour | review, job 8 |
| Quark's board run as GTD: the plugin's columns, the phases as projects, every row clarified with Brandon | live | 21 Oct 2026 | — | — | — | an hour | `docs/board-gtd-slice.md`; `docs/reports/2026-10-21-board-gtd.md` |
| The Sunday cron and the Looks-good page: a guardian's one tap makes a week live | live | 20 Oct 2026 | — | — | — | a slice | `docs/looks-good-slice.md`; `docs/reports/2026-10-20-looks-good-slice.md`; `docs/04-curation-engine.md`; `phase-3-curation` |
| Curation engine v1: weekly cron, ideas, cards, gate, load the week | live | 20 Oct 2026 | — | — | — | several slices | `docs/04-curation-engine.md`; `phase-3-curation` |
| The policy gate: every card approved or blocked before a child could see it | live | 20 Oct 2026 | — | — | — | a slice | `docs/gate-slice.md`; `docs/reports/2026-10-20-gate-slice.md`; `docs/reports/2026-10-20-gate-live.md`; `phase-3-curation` |
| A test Supabase project, so a migration from a branch cannot touch the live database | live | 20 Oct 2026 | — | — | — | a job | `docs/test-database-slice.md`; `test-database` |
| Working with Claude, slice 5: the method is the wwc plugin | live | 19 Oct 2026 | — | — | — | a slice | `BrandonReisen/working-with-claude`, `docs/one-method-slice.md` |
| Ask-list rewrite: stops at steps, not commands; live actions run by Brandon’s hand | live | 18 Oct 2026 | — | — | — | a slice | `docs/working-with-claude-4-slice.md`; `working-with-claude-4` |
| Working with Claude, Quark: the state board and the seven session skills | live | 17 Oct 2026 | — | — | — | a job | `docs/board-slice.md` |
| Working with Claude, slice 1: ask-list, readback reader, plain-words rule | live | 16 Oct 2026 | — | — | — | — | `docs/working-with-claude-slice-1.md` |
| Phase 2: Our Family's Beliefs, compare, rulebook, conduct questions and blocks | live | 11 Oct 2026 | — | — | — | — | `docs/09-family-values.md` |
| Phase 1: foundation | live | 10 Oct 2026 | — | — | — | — | `docs/13-architecture.md` |
