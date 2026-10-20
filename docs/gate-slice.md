# The policy gate: step 5 of phase 3

Brief drafted in Claude Code on 19 October 2026, on `phase-3-curation`, for
Brandon to settle before the build session. One job, one Claude Code session
in `quark`, on `opusplan` (the brief leaves design choices open, and this is
the step rule 5 rests on). The board's row: *The policy gate: every card
approved or blocked before a child could see it* (briefed, phase 3). It
changes what `week:build` does, adds one command and one block on the
rulebook page for parents. Nothing a child can see changes: there is no kid
view yet.

**Settled with Brandon on 20 October 2026 ("go"):** every decision below and
every recommended answer under *To settle*, with three changes, written in
below: decision 5 (the gate call carries the `careful_about` note and nothing
else about the child), decision 8 (the safety floor starts with the three items
in docs/09 and is marked a first guess, pending June), and decision 10 (a new
run line, measured at step 1, instead of a standing STOP on every full week).
The decisions are dated for docs/08 at the close.

## Why

Rule 5: nothing reaches a child unchecked. Today `week:build` writes every
card `pending`, or `blocked` when the code checks fail twice; nothing in the
code ever sets `passed`. Phase 4's kid view will read only cards that passed,
so until the gate exists there is nothing a child can be shown.

The card writer does not know what the family decided. `cardPrompt()`
carries the family's own words and the names of the subjects a topic touches,
not the answer for each (parent-led, never, from an age). The gate is the one
place those answers are applied to a card, and the one place a blackball is
checked against what was written.

Few topics touch a subject yet. Of the 28 short lessons two do
(`how-fossils-form`, subject 5, and `doubling-grains`, subject 24), and
Egypt's week 3 touches 1, 2, 3, 4 and 12. In week 1 the gate's everyday work
is the safety floor, rules 1 and 6, and a child's own caution; the family's
subjects fire rarely. So the proof has to make one fire.

Parents need to see how the rulebook behaves before it matters:
`gate/values-interview.md` promises a test run of twenty kid questions shown
to them. It is not built.

Money: the gate is a second model call per card, and it is not in the
estimate on `/parent/models` (docs/04 says it will join on its own; `estimate()`
in `core/runs.ts` prices ideas and cards only).

## Proposed decisions, for Brandon to confirm (then dated for docs/08)

1. **Two verdicts: `passed` and `blocked`. `rewritten` stays unused.** The
   brief's word "approved" is the enum's `passed` (`policy_status` is
   pending, passed, rewritten, blocked, from the first migration), so no
   migration for this. The gate never writes words a child will read: a rewrite
   would be kid-facing text that skipped `checkCard`'s hint and brilliance
   checks. A card it dislikes is blocked with the reason and the card is
   rebuilt (`week:build --rebuild --child`) or left out. *Narrows* CLAUDE.md's
   "log what it changed" to "log what it held back and why".
2. **Fail closed.** A card leaves `pending` only on a clean verdict. A model
   error, a refusal, a reply that does not parse, no policy document yet, or a
   rulebook that changed under the run: the card stays `pending`, the run says
   how many and why, and the command exits with an error. Never `passed` by
   default. *Follows rule 5.*
3. **Rules in code, judgment in the model**, the same split as the card
   checks. First, with no model call, the card's topic marks values subjects;
   for each, the family's setting decides from the rows (`values_settings`,
   `child_point_ages`, `blackballs`), not from the document: a blackballed
   subject, or one set to *never*, blocks the topic's cards; *from age* over
   this child's age blocks them for this child. Any one guardian's blackball
   counts the same, and the reason names the subject, never the guardian
   (docs/09). Then the model reads the cards left. It is coarse on purpose: a
   topic that touches a never-subject blocks all four layers, even if only
   layer 4 does. *Touches rule 2.*
4. **What the model is given.** Per card: the policy document
   (`values_profiles.policy_document`, whole), the safety floor (decision 8),
   the topic's perspective and the family's setting for each subject it
   marks, the card as the child would see it (title, text, read_aloud,
   question, hints, handoff, image_alt), and, when the parents wrote one, the
   `careful_about` note (decision 5). Nothing else about the child: no age,
   reading level, birth month, sex, school, address or interests, and no
   nickname field. The from-age rule is applied in code, so the model does not
   need the age; it judges the card as written for its level. Not kid-facing,
   so `readPrompt`, not `kidFacingPrompt`, in `core/prompts/gate.md` (v1, on
   `QUARK_MODEL_GATE`, like `flag-content.md`). It returns JSON: a verdict,
   reasons (a rule, a subject if any, one plain sentence for parents) and
   reader notes (decision 7). It judges what code cannot: a card that teaches a
   parent-led subject instead of handing off; one that states the family's view
   as the only one when the setting is *several fairly*, or calls other views
   foolish; free-text blackballs (`blackballs.topic`, listed in the document);
   fear, shame or contempt (rule 1); and the child's caution (decision 5). A
   test holds the prompt to the rule in decision 5. *Follows rules 1, 6 and 7.*
   The gate is not told the child's sex and never blocks on it.
5. **`careful_about` goes to the gate only** (CLAUDE.md, *Where we are*; docs/08,
   *Building a week*; confirmed by Brandon, 20 October 2026). The card writer
   still does not get it, and its test stays. **The gate call carries the note
   and nothing else about the child beside it:** the note goes in as "the
   parents asked for care about: …", with no age, reading level, nickname field,
   birth month, sex, school, address or interests; the gate's reasons never
   quote it back; and no `policy_notes` row holds it. A test builds the gate
   prompt for a child with a note and for one without, and checks the note is
   there only in the first and that none of those other fields is in either.
   *Touches rule 7:* the note is a sensitive free-text line about a child (a
   fear, a loss) leaving the machine for the model provider, and June's view of
   that is not recorded here. One limit on the line: it governs what the call
   is given about the child, not the card's own words. The card writer addresses
   the child by nickname, so the card text can carry it, as the card prompt
   already may under rule 7. Step 1 reports how often it does, and it is one
   function to swap the nickname for "the child" if Brandon wants that too (see
   *To settle*). Found while writing this: nothing in the app or the seed file
   can enter the note today.
6. **`learns_to_act` goes into the card prompt, not the gate.** One line in
   `cardPrompt()`, using the words already in `lib/policy.ts` (`LEARNS`) so the
   card and the rulebook say the same thing. `match_exemplars_to_sex` stays out
   until Brandon and June say whether the writer may be told a child's sex;
   that touches rules 6 and 7 and is not decided here. Cards already built are
   not rewritten.
7. **A second reader in the same call, never blocking.** docs/08 asks whether
   the gate should read a card as an experienced teacher would. Proposed yes:
   `reader_notes`, none to two plain sentences, kept in `policy_notes` and
   shown beside the card on the week page, never changing the verdict. It
   costs a few output tokens and feeds the review notebook for step 4d. Drop
   it if, on day 1, more than half the notes are noise.
8. **The safety floor is a file above both guardians, and a first guess.**
   `gate/safety-floor.md` starts with the three items docs/09 names (body
   safety, how to tell a trusted adult, emergency basics), in docs/09's words
   (always taught at an age-appropriate level), and nothing else. Its first line
   says it is **a first guess, pending June**, and that stays until June has
   read it and a commit removes the line; docs/09's open question, "What belongs
   on the safety floor", stays open until then. The gate reads it ahead of the
   family's rulebook: a card on the floor is never blocked by a blackball or by a
   never or parent-led setting, only by rule 1 or 6. Each verdict records the
   floor's version and whether it was still a first guess, and the week page
   says so. No screen lets a guardian change the file; it changes by commit.
   *Touches rule 2:* the floor limits what either guardian can block, which is
   why June reads it before it is more than a guess. The library has no floor
   lesson yet; the gate only has to stand aside, and the test run proves it.
9. **The gate runs at the end of `week:build`, and as its own command.**
   Inside `week:build`, once every card is saved: each card checked once, the
   report gains a gate section (passed, blocked by code, blocked by the model,
   left pending, reasons grouped by rule, tokens and money for `gate`).
   As `npm run gate -- --week N [--child X]` and `gate:live`, the same
   function, because day 1 on the live copy is already `pending` and should
   not cost $0.85 to rebuild, and because a rulebook that changes after a build
   means the cards must be checked again. Each verdict records the rulebook's
   `source_hash`; the command re-checks `pending` cards and any card whose
   hash is not today's. *Adds* the `gate` and `gate:live` scripts to the
   target guard (`scripts/target.ts`; the Vitest check that only `:live`
   scripts read the live file covers them).
10. **Per card, on `QUARK_MODEL_GATE`, as CLAUDE.md decided.** The decided line
    stands; the money is stated so Brandon can see it. 280 cards a week
    (2 children × 7 days × 5 slots × 4 layers). My guess, from the list prices
    in `core/prices.ts` and about 4,500 tokens in and 200 out a card (the
    policy document is most of it), is about $0.02 a card on Opus 5.5, so about
    $6 a week; about $3 on Sonnet 5.5. Ideas and cards were $0.85 for day 1,
    about $6 a week. So a full week with the gate is about $12 and crosses the
    $10 a run that runs freely (decided 18 October 2026, when a full week was
    $5.70). **Proposed instead of a standing STOP on every full week: a new run
    line for docs/08**, set by the rule behind the old one: about one and three
    quarters times a normal full week, so a normal week and one with re-asks run
    freely and a runaway stops. On my guess that is about $20 a run. Step 1
    measures the policy document on test and the gate's real cost per card, gives
    the full-week figure with the gate and the line the rule makes of it, and
    Brandon confirms the number. It then goes into docs/08 as a *Decided:* line
    and replaces the "$10 a run" line in CLAUDE.md's *Before a consequential
    action* at the close; a brief still puts a STOP above whatever the line is,
    as now. Until then the $10 line stands, and nothing in this job comes near
    it. `estimate()` in `core/runs.ts` gains the gate (priced per child per
    day, like cards) once a `week:build` run has recorded one.
11. **The twenty-question test run**, on the rulebook page
    (`/parent/beliefs/rulebook`), for parents. Twenty questions, fixed, in a
    list in `lib/` with a test: 16 from the 24 subjects, at least one from each
    of the eight areas (1 and 4; 5 and 6; 8, 9 and 10; 12 and 13; 14 and 16;
    17 and 18; 20; 21 and 24), and 4 off the list: body safety, telling a
    trusted adult, an emergency, and a crude question. "Run it for [child]":
    for each question, one call on `QUARK_MODEL_WRITE` with a new
    `core/prompts/answer.md` (kid-facing, so `manner.md` first; the policy
    document, the question, the child's age and reading level) returning the
    answer and whether it handed off. Beside each answer, code (not the model)
    shows what the rulebook says for that subject and whether the tutor's
    behavior matches it ("subject 6 is parent-led; handed off ✓"); a mismatch
    is marked, the safety floor questions must be answered, not handed off.
    Per child, because *from age* differs; one server action per question, so
    nothing hits a function limit and each answer appears as it arrives. About
    $0.20 a child a run, my guess. `answer.md` is written as the first draft of
    the Ask box's prompt but called only here; the Ask box and the gate on its
    answers are phase 4. The page copy says "checker" and "subject", never
    "pack" or "AI".
12. **The results are kept, so every guardian sees them** (rule 2: nothing
    hidden from the other guardian). One new table, `gate_test_runs` (family,
    child, the rulebook's `source_hash`, the twenty results as JSON, cost, when),
    read by guardians through row-level security, written only by the server,
    with an `audit_log` row. The page shows the last run and says plainly when
    the rulebook has changed since. This is the job's only migration. Step 6's
    Looks-good page may use the stored hash; this job only stores it.
13. **`policy_notes` is jsonb, so the verdict needs no migration.** Shape:
    `{ validation?: string[], gate?: { by: "code" | "model", rulebook: <hash>,
    floor: <version>, model, reasons: [{ rule, subject?, note }], reader?: string[],
    checked_at } }`. `/parent/week/[theme]` shows each card's verdict and
    reasons, and a count at the top; nothing else on it changes. The page
    never shows which guardian a blackball came from on a card; the compare
    page already shows that to guardians.

## Read first

1. CLAUDE.md (loaded): *Where we are*, *Before a consequential action*, and the
   *Method* block's *Migrations* and *Release* lines. The three 19 October
   commits behind them: `3db642c` (`.github/workflows/migrations.yml`),
   `9118cd3` (release is `/wwc:release` when `main` has not moved) and `cdc3d02`
   (migrations are applied by the workflow on a push of the phase branch; live
   stays by hand while `SUPABASE_DB_URL_LIVE` is unset). Also
   `.claude/settings.json` and docs/08 (*Building a week*, the `careful_about`
   and `learns_to_act` lines; *How the tutor sounds*, the second reader; *Bugs*).
2. docs/04, *How a week is built*, *How the approval rule is built* and *How the
   models and costs page is built*; docs/09; `gate/values-interview.md` (*What
   comes out*, the test run); `packs/README.md` (the 24 subjects, the floor);
   docs/12 (*Conduct the tutor teaches*).
3. `supabase/migrations/` in order (`policy_status` and `cards` in the first;
   `policy_document` and `source_hash` in `20261012000000`; `perspective` and
   `values_points` on `plan_topics` in `20261013000000`; `model_runs` in
   `20261016000000`) and `deploy/supabase/schema.sql`.
4. `core/curation/cards.ts` (`cardPrompt`, `checkCard`), `week.ts` (`CardRow`,
   `buildWeek`), `types.ts`; `core/content/flag.ts` and
   `core/prompts/flag-content.md` (the one existing `gate` call); `core/model.ts`;
   `core/runs.ts`; `lib/policy.ts`; `lib/family-values.ts`; `scripts/week-build.mts`,
   `scripts/target.ts` and its test; `app/parent/week/[theme]/page.tsx`;
   `app/parent/beliefs/rulebook/page.tsx`; `plan/short-lessons.yaml`
   (`how-fossils-form`, `doubling-grains`) and `plan/ancient-egypt.yaml` (week 3).

## Brandon's own steps, before the session

1. On `quark-test`, sign in at `/parent` as the test guardian and take Our
   Family's Beliefs (Quick start is enough, about 2 minutes), so the test
   family has a policy document. Then set subject 5 (age of the Earth) to
   "Don't bring it up" and leave subject 24 on the tradition's answer. Step 1
   of the job tells you if it wants other settings.
2. Check `.env.local` has `QUARK_MODEL_GATE` (and the other two model names and
   the key). Claude Code never reads a `.env` file. Vercel's copy of the name
   is only needed when this goes live.
3. Optional, for the caution check: in the `quark-test` dashboard's SQL editor,
   `update children set careful_about = '<a note step 1 gives you>' where
   nickname = '<one of the invented children>';`. Test project only, invented
   children only. Step 1 names a note that day 1's cards will touch.
4. Read the twenty questions and the safety floor in step 1's write-back, with
   June, and mark what to change. They are what the parents will read. The
   floor stays a first guess until June has read it.

## Steps and stops

Every STOP carries the four-line pre-flight (what is about to happen; what it
touches, LIVE in capitals or "not live"; how it is undone; what was checked on
test). No step here is live unless it says so.

1. **Write back, then STOP.** Read the files above and show: the policy
   document's size on test and the per-card cost at the configured model
   (measured, replacing my guess), the full-week figure with the gate, and the
   run line the rule in decision 10 makes of it, as one number for Brandon to
   confirm; the exact gate input, field by field, with rule 7 checked line by
   line: the `careful_about` note and nothing else about the child beside it,
   and how often a card's own text carries the nickname; the verdict schema and
   the `policy_notes.gate` shape; the code checks and what each blocks; the
   first `gate/safety-floor.md`, the three items from docs/09 with its
   "first guess, pending June" line; the twenty questions with the subject each
   draws on; the page copy; the migration written out; the tests to add; the
   files to change; the note for the caution check; and anything here that does
   not fit the repository. Say
   the branch (`phase-3-curation`, no new one; see *To settle*). Suggest plan
   mode and `opusplan`. **Brandon confirms the decisions, answers *To settle*,
   and says go.** On go the board row moves to *building* as the first commit.
2. **Build,** each a commit: (a) `core/curation/gate.ts` (pure, the database and
   model as deps, like `buildWeek`), `core/prompts/gate.md`,
   `gate/safety-floor.md` (the three items, marked a first guess, pending June),
   the code checks, Vitest with a fake model and no network, including the
   rule 7 test in decision 5; (b) `week:build` calls it, `gate` and `gate:live` scripts, the
   report's gate section, `QUARK_MODEL_GATE` checked before anything is spent,
   `estimate()` and the models page; (c) `learns_to_act` in the card prompt, with
   its test; (d) verdicts on the week page; (e) `answer.md`, the question list,
   the server action and the rulebook page's block, and the `gate_test_runs`
   migration. **STOP: the new migration waits for Brandon's yes** (CLAUDE.md,
   inside any job). Show the SQL and its row-level security: not live; applied
   to `quark-test` by the workflow when pushed; undone by a later migration
   that drops the table (it holds only test runs); tests passing. No stop is
   added for the push to test itself (the *Method* block).
3. **Prove it on test, then STOP.** In this order, each shown:
   1. `npm test` and `npm run typecheck`.
   2. Push the branch. The migrations workflow applies the migration to
      `quark-test` after the tests pass; `gh run watch`, report the result.
   3. `npm run week:build -- --week 1 --days 1 --rebuild` on test, about $1.70
      by my guess (day 1 about $0.85; the gate on 40 cards about $0.80), under
      the $10 line that stands until decision 10's new one is confirmed. No
      `content:fetch` is needed: the gate reads card text, not pictures. Show
      the report's gate section, and the gate's real cost per card, which
      confirms or replaces the run line proposed at step 1.
   4. The week page: `how-fossils-form`'s cards blocked by code for subject 5,
      the reason naming the subject and no guardian; the other cards passed or
      held back with reasons; reader notes; the caution firing if set.
   5. Change the rulebook on test (subject 5 to *several fairly*), run
      `npm run gate -- --week 1`: the hash differs, the cards are checked again,
      and the fossils cards now go to the model.
   6. Fail closed: `QUARK_MODEL_GATE` set to a name that does not exist for that
      one command only (`$env:QUARK_MODEL_GATE='no-such-model'` in PowerShell,
      which node's `--env-file` does not override). Every card stays `pending`,
      the report says why, the exit is an error.
   7. The twenty questions for each invented child, on the rulebook page. One
      answer opened in full to read; the floor questions answered, not handed
      off.
   8. Two guardians: a Vitest case where either guardian's blackball blocks and
      neither is named in a reason.
   **STOP** for Brandon to open `/parent/week/<theme>` and the rulebook page on
   test.
4. **Records and `/close`.** docs/04 (*How the gate is built*), docs/09 (the
   floor, as a first guess pending June; its open question stays open), docs/08
   (*Decided:* lines; the `careful_about`, `learns_to_act` and second-reader
   lines marked done; the new run line, with the figures it was measured from),
   CLAUDE.md's *Before a consequential action* ("$10 a run" becomes the
   confirmed line), `gate/values-interview.md` (the test run,
   as built), docs/13 (one line), CLAUDE.md *Where we are* then the README
   status line, the board row to *on test* (Waiting on: Brandon's look at the
   test copy, the live migration, the release). The full report, the four-line
   read-back, `/cost`.
5. **Live, only by Brandon's yes, each its own STOP, and not in this job unless
   he says so at step 1.** (a) `npm run db:push:live` for `gate_test_runs`:
   LIVE, the boys' database; undone by a migration dropping the table; it ran
   on `quark-test` in this session. (b) `npm run gate:live -- --week 1` on
   day 1, rebuilt on 16 October and `pending` since: LIVE, writes verdicts on
   the boys' cards and spends about $0.80; undone by setting those cards back
   to `pending`; nothing a child sees changes, since the wall comes in phase 4.
6. **Release, Brandon's go.** `/wwc:release` when `main` has not moved: today
   `git log phase-3-curation..main` is empty. If it has moved by then, Brandon
   merges by hand. Order matters: the live migration (5a) before `main`,
   because Vercel deploys `main` and the new page reads a table live would
   lack. Recommended after step 6 (the cron and the Looks-good page), not at
   this job's close.

## To settle with Brandon at step 1

- **Branch.** Recommend `phase-3-curation`, no new branch: this is phase 3's
  step 5, and the migrations workflow runs on a push of a `phase-*` branch.
- **Cost.** Recommend keeping Opus 5.5 for the gate (the `.env.example`
  default), per card, as decided. About $6 a week on top of $6 is the number
  to look at, and the new run line (decision 10, about $20 on my guess) is
  measured at step 1 and confirmed by Brandon, not assumed. Levers if it is
  too much, none recommended now: Sonnet 5.5 for the
  gate (about half); one call per chain of four (under half, a change to "per
  card"); caching the policy document (cached input costs a tenth, which also
  brings it under half, but it is an adapter change that touches every call and
  needs its own price rows).
- **Before it spends.** Recommend `week:build`'s existing report before spending
  also lists, per child, the slots whose topic marks a never, blackballed,
  too-young or parent-led subject. It changes nothing and costs nothing, and
  Brandon sees the blocks before the money. The alternative, skipping those
  slots, is a bigger change to the week and is not proposed.
- **Entering `careful_about`.** Nothing in the app or in the seed file sets it.
  Recommend this job reads the column and tests it on test with the SQL above,
  and entering it (a field per child on `/parent`, with an audit row) is a
  separate board row for Brandon to `/idea` when he wants it. Until then the
  live column is empty and that check does nothing there.
- **The twenty questions and the floor.** Whether Brandon and June change a
  question or a floor line. Each change is a one-line edit. The floor is a first
  guess until June has read it, so the job can ship with the mark still on.
- **The nickname in a card's own words.** Decision 5's line governs what the
  gate call is given about the child, not the card's text, which can carry the
  nickname because the writer used it. Recommend leaving the card as written
  and reporting how often at step 1. Swapping the nickname for "the child" is one
  function, but a nickname that is also an ordinary word (the invented family has
  one) would mangle a card that uses the word; Brandon says if he wants it.
- **Live in this job.** Recommend no: end on test (step 4), and take 5 and 6
  when Brandon has looked at the test copy.
- **Found while writing this brief, where it and the repository disagree:**
  the brief said "approved" and the enum says `passed`; docs/04 says the gate
  joins the estimate on its own and `estimate()` does not include it;
  `week-build.mts` checks only the idea and card models before spending;
  `careful_about` cannot be entered; and the installed `wwc` plugin copy here
  (`75332818d9f8`) has no `release` skill, so I could not read what
  `/wwc:release` does and only quote the *Method* line.

## Not in this job

- The kid view and the row-level security that lets a scoped key read only
  `passed` cards; the Ask box and the gate on its answers (phase 4).
- The Sunday cron and the Looks-good page (step 6). A theme stays `review`.
- Rewriting a card; the tutor's voice and faces (step 4d); floor lessons in
  the plan; the entry form for `careful_about`; `match_exemplars_to_sex` in the
  card prompt; prompt caching.
- `content:fetch` anywhere; any full-week `week:build`; any change to
  `.claude/settings.json`; the open bugs (the sweep has them).
- Any command against live, except the two named in step 5 and only on his yes.

## What done means

- A card leaves `pending` only through the gate, to `passed` or `blocked`, with
  `policy_notes.gate` saying who decided (code or model), against which
  rulebook, and why; a fault leaves it `pending`.
- A blackballed or never subject blocks in code, any guardian's blackball
  counts the same, and no reason names a guardian; the safety floor is never
  blocked by a blackball.
- `week:build` and `npm run gate` (and `gate:live`, never run here) do this;
  the gate's cost is in the report, the `model_runs` row and the models page
  estimate; `QUARK_MODEL_GATE` is checked before money is spent.
- The gate call carries the `careful_about` note and nothing else about the
  child beside it, and a test holds that; `careful_about` reaches the gate and
  not the card writer; `learns_to_act` reaches the card writer.
- `gate/safety-floor.md` holds the three items from docs/09 and says it is a
  first guess, pending June; each verdict and the week page say which floor
  version they were checked against.
- The run line is measured, confirmed by Brandon and written to docs/08 and
  CLAUDE.md, with no standing STOP on a full week.
- The rulebook page runs the twenty questions per child, keeps the results for
  both guardians and says when the rulebook has changed since; one run read in
  full.
- Proven on `quark-test` through steps 3.1 to 3.8, shown, and Brandon has looked
  at the week page and the rulebook page there.
- docs/04, docs/09, docs/08, `gate/values-interview.md`, docs/13, CLAUDE.md and
  the README say how it is built; the board row is *on test*.
- The job closed with `/close`: the records committed by name, the branch
  pushed and the workflow run watched, the full report with its "couldn't
  check" lines first, the four-line read-back, and the `/cost` figure. Nothing
  on live, and nothing to `main`.
