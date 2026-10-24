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
| The tutor's voice, both ways, from Google: Chirp 3 HD reads every line the tutor says (made on first tap, stored like a picture), Chirp 3 hears the child through a Talk button; one adapter, no browser voice in or out | live | 23 Oct 2026 | The tutor | — | — | a slice | `docs/tutor-voice-slice.md`; `docs/reports/2026-10-22-tutor-voice.md` |
| Next.js to 16.4.2 before the release: 16.4.0 carries a critical advisory (image optimizer, SVG) and a high one (Server Actions, which Quark uses); the local production build stops on it, and Vercel's may; the bump, tests, typecheck, the build, a look | live | 23 Oct 2026 | — | — | — | an hour | `docs/next-16-4-2-slice.md`; `docs/reports/2026-10-22-next-16-4-2.md`; `docs/reports/2026-10-21-wonder-wall-1-slice.md`, *What could not be checked* |
| Wonder Wall slice 1: today's five cards, layers, hints as written, the handoff, on a paired iPad | live | 23 Oct 2026 | Wonder Wall | — | — | a slice | `docs/wonder-wall-1-slice.md`; `docs/reports/2026-10-21-wonder-wall-1-slice.md`; `phase-4-wonder-wall` |
| The boys' first live week: live week 1 deleted and built again to start Monday 26 Oct, read and tapped | next | 21 Oct 2026 | Pilot | Wonder Wall slice 1 | June's read of the safety floor before the build | a job | `docs/wonder-wall-1-slice.md`, *The week for Monday* |
| The tutor's lines made ahead: each night, every passed card of the next day has its lines made in the tutor's voice and stored, so no first tap waits 4–5 seconds; and "Read it to me" shows it is busy from the tap until the voice starts | next | 23 Oct 2026 | The tutor | The tutor's voice | — | a job | `docs/reports/2026-10-22-tutor-voice.md`, *Slices for The tutor* |
| 28 more short lessons for week 2, picked before Saturday 31 Oct, or the wall is empty from Monday 2 Nov | next | 21 Oct 2026 | Week 2 builds itself | — | — | a job | `plan/short-lessons.yaml`; `plan/candidates/short-lessons.md`; `docs/wonder-wall-1-slice.md`, *The week for Monday* |
| Wonder Wall slice 2: after a handoff, the card's next layer opens the next day | next | 21 Oct 2026 | Wonder Wall | Wonder Wall slice 1 | — | a job | `docs/wonder-wall-1-slice.md`, decision 2; `docs/08-open-questions.md`, "Wonder Wall, slice 1" |
| Vercel preview deployments pointed at the test project | next | 21 Oct 2026 | — | — | — | an hour | `docs/test-database-slice.md` |
| Wonder Wall — the boys learn from five daily cards on the iPad: layers 1–4, voice, hints as a conversation, stamps, a calm end | project | 21 Oct 2026 | — | — | — | several slices | `docs/03-touch-points.md`, `docs/12-teaching-that-tests-itself.md` |
| Pilot — four weeks with the boys, from Monday 26 October 2026 | project | 21 Oct 2026 | — | — | — | — | CLAUDE.md, *Build order*; `docs/wonder-wall-1-slice.md` |
| Week 2 builds itself — the Sunday build makes week 2 on live on Sunday 1 November 2026 | project | 21 Oct 2026 | — | — | — | — | `docs/wonder-wall-1-slice.md`, *The week for Monday*; `docs/04-curation-engine.md`, "How the Sunday build is built" |
| The tutor — the child asks, the tutor answers and teaches, inside the family's filter, every word kept for the parents (Brandon, 22 Oct 2026: "an app that never answers the child's questions won't get used. A tutor that's lobotomized is not a tutor") | project | 22 Oct 2026 | — | — | — | several slices | `docs/tutor-voice-slice.md`, *Why* and *Decided already*; `docs/08-open-questions.md`, "Where the limits on Ask are" |
| Digest and audio — the Sunday email, the RSS feed for the car, art of the week (phase 5) | someday | 21 Oct 2026 | — | — | — | a slice | `docs/03-touch-points.md` |
| Checks and difficulty — delayed recall, the hint-count dial, results in the digest (phase 6) | someday | 21 Oct 2026 | — | — | — | a slice | `docs/12-teaching-that-tests-itself.md` |
| Recordings stored in the private bucket like pictures, so the wall never fetches from Wikimedia | later | 21 Oct 2026 | Wonder Wall | — | — | a job | `docs/04-curation-engine.md`, "How the approval rule is built"; `docs/wonder-wall-1-slice.md`, *To settle* |
| A week's lens plan is kept from day 1, so taps on a Sunday cannot change later days | later | 21 Oct 2026 | Wonder Wall | the slice that feeds lens history to the picker | — | an hour | `docs/04-curation-engine.md`, "How the Sunday build is built"; `docs/wonder-wall-1-slice.md`, decision 3 |
| Hints as a conversation, and the tutor's live answers: the child's own question answered and taught, every line through the family's filter before it is spoken, every word logged for the parents | later | 22 Oct 2026 | The tutor | The tutor's voice | — | a slice | `docs/12-teaching-that-tests-itself.md`, *Hints are earned*; `docs/tutor-voice-slice.md`, *Not in this job* |
| The parents' review page: every question and answer, what the filter held back, with an AI summary of what is worth a look, in the Sunday digest too | later | 22 Oct 2026 | The tutor | Hints as a conversation | — | a job | `docs/03-touch-points.md` |
| The Ask box: anything the child asks, after "Where the limits on Ask are" with June | later | 22 Oct 2026 | The tutor | Hints as a conversation | — | a slice | `docs/08-open-questions.md` |
| The model as judge of a card answer: the child's words understood, a verdict only (`judgeGuess()` misjudges 68 of 105 right answers in a child's own words) | later | 22 Oct 2026 | The tutor | The tutor's voice | — | a job | `docs/reports/2026-10-21-wonder-wall-1-slice.md`, *The matcher table* |
| Explorer stamps, with the reward engine | later | 22 Oct 2026 | Wonder Wall | — | — | a job | `docs/15-reward-engine.md` |
| The calm end when a child rushes | later | 22 Oct 2026 | Wonder Wall | — | — | a job | `docs/12-teaching-that-tests-itself.md`, *The session ends when the thinking stops* |
| A day cannot be written twice: unique indexes on ideas and cards; its brief's *Before the job* carries Brandon setting `CRON_SECRET`, `ANTHROPIC_API_KEY` and the three model names in Vercel's production environment | later | 21 Oct 2026 | Week 2 builds itself | — | — | an hour | `docs/04-curation-engine.md`, "How the Sunday build is built"; `supabase/migrations/20261014000000_week_build.sql` |
| A guardian can enter each child's reading level and what to lean on or be careful about, from the school's results (both boys read two grades above age; the test family's cards are pitched by age) | not fully formed | 22 Oct 2026 | — | — | — | — | the chat, 22 Oct 2026, 08:08 to 08:12; `docs/gate-slice.md`, *To settle* |
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
