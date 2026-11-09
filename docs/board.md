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
| The model as judge of a card answer: the child's words understood by a model that returns a verdict only (right, close, answered the hint, not yet); an answer to the hint costs no hint and repeats the question; hints framed as clues; the question kept above the box (three nights on live: right answers in the boys' own words judged wrong, and the boys answering the hint) | live | 8 Nov 2026 | The tutor | — | — | a job | `docs/judge-slice.md`; `docs/reports/2026-10-28-judge.md`; docs/12, *How the judge of an answer is built* |
| The tutor's lines made ahead: each night at 3 am Hawaii, every passed card of the day beginning has its lines made in the tutor's voice and stored, so no first tap waits 4–5 seconds; and "Read it to me" shows it is busy from the tap until the voice starts | on hold | 8 Nov 2026 | The tutor | The tutor's voice | Sunday 8 Nov's release | a job | `docs/lines-ahead-slice.md`; `docs/reports/2026-11-07-lines-ahead.md`; `docs/reports/2026-10-22-tutor-voice.md`, *Slices for The tutor* |
| Weeks 2 and 3 on live: week 2 picked, written, fetched, built from Monday 2 Nov and tapped; the Sunday build switched on in Vercel and its first firing proven; week 3's 28 short lessons picked from 40 candidates, written, checked on test and put on live by Saturday night, so the Sunday build makes week 3 by itself on 8 Nov (the wall is empty from Monday 9 Nov otherwise); week 4's candidates banked | building | 7 Nov 2026 | Week 2 builds itself | — | — | a slice | `docs/week-3-slice.md`; `docs/week-2-slice.md`; `plan/candidates/short-lessons-3.md`; `plan/short-lessons.yaml` |
| The boys' first live week: card prompt v6 (the idea named, no answer before the question, `read_aloud` dropped), live week 1 deleted and built again to start Monday 26 Oct, read and tapped, both iPads paired to live | live | 28 Oct 2026 | Pilot | — | — | a job | `docs/first-live-week-slice.md`; `docs/reports/2026-10-23-first-live-week.md`; `docs/wonder-wall-1-slice.md`, *The week for Monday* |
| The tutor's voice, both ways, from Google: Chirp 3 HD reads every line the tutor says (made on first tap, stored like a picture), Chirp 3 hears the child through a Talk button; one adapter, no browser voice in or out | live | 23 Oct 2026 | The tutor | — | — | a slice | `docs/tutor-voice-slice.md`; `docs/reports/2026-10-22-tutor-voice.md` |
| Wonder Wall slice 1: today's five cards, layers, hints as written, the handoff, on a paired iPad | live | 23 Oct 2026 | Wonder Wall | — | — | a slice | `docs/wonder-wall-1-slice.md`; `docs/reports/2026-10-21-wonder-wall-1-slice.md`; `phase-4-wonder-wall` |
| Wonder Wall slice 2: after a handoff, the card's next layer opens the next day | next | 21 Oct 2026 | Wonder Wall | Wonder Wall slice 1 | — | a job | `docs/wonder-wall-1-slice.md`, decision 2; `docs/08-open-questions.md`, "Wonder Wall, slice 1" |
| Vercel preview deployments pointed at the test project | next | 21 Oct 2026 | — | — | — | an hour | `docs/test-database-slice.md` |
| Math circle, slice 1: the puzzle slot becomes a math circle: one real problem a day about someone who built or figured something out, from `plan/math-circle.yaml` (four steps and their answers written once and read by a parent), each idea back three weeks later in a new costume; a card check holds back any card whose numbers or accepted answers differ from the file; the Saturday pick at 22 lessons | next | 8 Nov 2026 | Wonder Wall | A theme a week | — | a job | `docs/math-practice-proposal.md`, sections 2, 3, 6 and 7; `docs/08-open-questions.md`, "Math practice" |
| Wonder Wall — the boys learn from five daily cards on the iPad: layers 1–4, voice, hints as a conversation, stamps, a calm end | project | 21 Oct 2026 | — | — | — | several slices | `docs/03-touch-points.md`, `docs/12-teaching-that-tests-itself.md` |
| Pilot — four weeks with the boys, from Monday 26 October 2026 | project | 21 Oct 2026 | — | — | — | — | CLAUDE.md, *Build order*; `docs/wonder-wall-1-slice.md` |
| Week 2 builds itself — the Sunday build makes week 2 on live on Sunday 1 November 2026 | project | 21 Oct 2026 | — | — | — | — | `docs/wonder-wall-1-slice.md`, *The week for Monday*; `docs/04-curation-engine.md`, "How the Sunday build is built" |
| The tutor — the child asks, the tutor answers and teaches, inside the family's filter, every word kept for the parents (Brandon, 22 Oct 2026: "an app that never answers the child's questions won't get used. A tutor that's lobotomized is not a tutor") | project | 22 Oct 2026 | — | — | — | several slices | `docs/tutor-voice-slice.md`, *Why* and *Decided already*; `docs/08-open-questions.md`, "Where the limits on Ask are" |
| Digest and audio — the Sunday email, the RSS feed for the car, art of the week (phase 5) | someday | 21 Oct 2026 | — | — | — | a slice | `docs/03-touch-points.md` |
| Checks and difficulty — delayed recall, the hint-count dial, results in the digest (phase 6) | someday | 21 Oct 2026 | — | — | — | a slice | `docs/12-teaching-that-tests-itself.md` |
| The fluency floor's fractions, time, money and units, and word problems last, only if the parents ask | someday | 8 Nov 2026 | — | — | — | — | `docs/math-practice-proposal.md`, section 7 |
| Recordings stored in the private bucket like pictures, so the wall never fetches from Wikimedia | later | 21 Oct 2026 | Wonder Wall | — | — | a job | `docs/04-curation-engine.md`, "How the approval rule is built"; `docs/wonder-wall-1-slice.md`, *To settle* |
| A week's lens plan is kept from day 1, so taps on a Sunday cannot change later days | later | 21 Oct 2026 | Wonder Wall | the slice that feeds lens history to the picker | — | an hour | `docs/04-curation-engine.md`, "How the Sunday build is built"; `docs/wonder-wall-1-slice.md`, decision 3 |
| Hints as a conversation, and the tutor's live answers: the child's own question answered and taught, every line through the family's filter before it is spoken, every word logged for the parents | later | 22 Oct 2026 | The tutor | The tutor's voice | — | a slice | `docs/12-teaching-that-tests-itself.md`, *Hints are earned*; `docs/tutor-voice-slice.md`, *Not in this job* |
| The parents' review page: every question and answer, what the filter held back, with an AI summary of what is worth a look, in the Sunday digest too | later | 22 Oct 2026 | The tutor | Hints as a conversation | — | a job | `docs/03-touch-points.md` |
| The Ask box: anything the child asks, after "Where the limits on Ask are" with June | later | 22 Oct 2026 | The tutor | Hints as a conversation | — | a slice | `docs/08-open-questions.md` |
| Explorer stamps, with the reward engine | later | 22 Oct 2026 | Wonder Wall | — | — | a job | `docs/15-reward-engine.md` |
| The calm end when a child rushes | later | 22 Oct 2026 | Wonder Wall | — | — | a job | `docs/12-teaching-that-tests-itself.md`, *The session ends when the thinking stops* |
| The math circle's next block: the returns of the first 18 ideas in new costumes, then a block about every three weeks, written ahead for the parents' read (a standing row, due before the circle's week 4) | later | 8 Nov 2026 | Wonder Wall | Math circle, slice 1 | — | an hour | `docs/math-practice-proposal.md`, section 7 |
| The fluency floor, slice 2: a sixth tile, Practice, eight whole-number problems a day (about five minutes) in an order Code writes from the Common Core grade codes; a try, a nudge in the school's methods, then a person, never the answer; judged in code, $0 a day | later | 8 Nov 2026 | Wonder Wall | Math circle, slice 1 | — | a job | `docs/math-practice-proposal.md`, sections 3, 6 and 7 |
| A day cannot be written twice: unique indexes on ideas and cards; its brief's *Before the job* carries Brandon setting `CRON_SECRET`, `ANTHROPIC_API_KEY` and the three model names in Vercel's production environment | later | 21 Oct 2026 | Week 2 builds itself | — | — | an hour | `docs/04-curation-engine.md`, "How the Sunday build is built"; `supabase/migrations/20261014000000_week_build.sql` |
| Different types of learnings that pop up, so the format doesn't go stale (Brandon, 28 Oct 2026: "if we stick to the same format too long the children will lose interest"): a pop quiz in one of the cards, an idea from weeks ago asked again with no hints | not fully formed | 28 Oct 2026 | — | — | — | — | the chat, 28 Oct 2026, 19:41; `docs/12-teaching-that-tests-itself.md`; the *Checks and difficulty* project |
| A card with a more Socratic learning method: the tutor and the child discussing a problem rather than looking for a fixed solution (Brandon, 28 Oct 2026) | not fully formed | 28 Oct 2026 | — | — | — | — | the chat, 28 Oct 2026, 19:41; the *Hints as a conversation, and the tutor's live answers* row |
| A guardian can enter each child's reading level and what to lean on or be careful about, from the school's results (both boys read two grades above age; the test family's cards are pitched by age) | not fully formed | 22 Oct 2026 | — | — | — | — | the chat, 22 Oct 2026, 08:08 to 08:12; `docs/gate-slice.md`, *To settle* |
| A guardian can ask for a week's cards to be checked again from the week page | someday | 21 Oct 2026 | — | — | — | — | `docs/looks-good-slice.md`, *Not in this job* |
| A guardian can enter what to be careful about for each child | someday | 21 Oct 2026 | — | — | — | — | `docs/gate-slice.md`, *To settle* |
| Prompt caching of the policy document in the model adapter | someday | 21 Oct 2026 | — | — | — | — | `docs/gate-slice.md`, *To settle* |
| A second reviewer from another vendor (Codex) | someday | 21 Oct 2026 | — | — | — | — | review §8; `AGENTS.md` |
| A knowledge sequence a family can swap | someday | 21 Oct 2026 | — | — | — | — | `docs/08-open-questions.md`; `plan_topics` |
| Sample weeks written so they can be shared and reused | someday | 21 Oct 2026 | — | — | — | — | `docs/08-open-questions.md` |
| The Claude GitHub app for pull-request review | someday | 21 Oct 2026 | — | — | — | — | review, job 7 |
| `docs/decisions.md`, newest first with what each replaced | someday | 21 Oct 2026 | — | — | — | an hour | review, job 8 |
