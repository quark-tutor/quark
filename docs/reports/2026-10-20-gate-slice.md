# Report: the policy gate, phase 3 step 5 (`docs/gate-slice.md`), 20 October 2026

Job: `/wwc:job docs/gate-slice.md`, closed with `/close`. Branch: `phase-3-curation`, pushed.
Opus 5.5. Nothing on live, nothing to `main`.

Brandon's words this job:

- At stop 1: "go, taking all four recommended answers (the $35 run line provisional until
  step 3.3's measured figure, confirmed at the close), with two conditions: (1) the family's
  setting per subject comes from the same function the rulebook and compare pages use, not a
  rule of the gate's own — confirm that, and say how many guardians the test family has and
  what the gate does with subject 5 there when only one has answered; (2) no private page for
  June; the write-back is enough. Record the thinking-tokens finding as a docs/08 line at the
  close for a later decision; it's not this job's."
- At stop 2: "done. One correction for the record: the commit message for (b) named "npm run
  gate and gate:live" and tripped the backstop — add it to the bugs line at the close. Go on
  3.3."
- At stop 3: "looked. Go to /close with: run line $25; keep the reader notes, add one line to
  gate.md that a handoff naming a parent is by design; the subject-13 answer goes to docs/08 as
  an open question for June and me, answer.md unchanged; the backstop bugs line with the (b)
  commit message; the thinking-tokens finding as a docs/08 line; and the test-database row's
  Waiting on becomes the live push only, since the migrations workflow has now applied a real
  migration on test."

## Couldn't check

- **The gate's cost on the live rulebook.** The test copy's rulebook is a one-guardian Quick
  start, about 6,500 characters in the gate's copy. The live one carries both parents' notes
  and own words, so it is longer, and every gate call reads it whole: twice as long would put
  a card nearer $0.04 than $0.026. Reading it is a live command; not done. The $25 line rests
  on the test figure.
- **Whether `gate.md` v2 stops the notes about a handoff naming a parent.** The line is added
  and the tests pass; no gate run has used it (a re-check on test costs about $1). The next
  gate run shows it.
- **The twenty-question runs' own cost.** Stored in `gate_test_runs.cost`, not shown on the
  page, and I didn't read it. Each answer is one Sonnet 5.5 call; step 1 estimated about $0.40
  a child a run.
- **The backstop ask on the (b) commit message.** I can't see prompts; it is recorded on
  Brandon's word. It is a finding either way: the pattern for live scripts matched words in a
  commit message, which the method says never quotes a command. The brief missed no stop. A
  bug line in docs/08 (tooling).
- **`next build`** was not run, to leave Brandon's dev server alone. Both pages were opened in
  Brandon's Chrome on localhost (test) and render; the type check is clean.
- **`/cost`** I can't run; Brandon types it and the figure goes at the end of this file.

## Done

**Stop 1 (write-back).** Measured the inputs on test without spending; settled with Brandon:
the run line provisional at $35; Opus 5.5 stays the gate's model; the gate reads a rulebook
copy that names no child, and the answer call the same copy plus a "Not yet" line code writes;
a test-only reorder so day 1 carries how-fossils-form (subject 5) and doubling-grains (subject
24). The migration was reviewed there, so no separate migration stop.

**The build**, each its own commit on `phase-3-curation`:

- Board row to *building* (`e4f5528`).
- (a) The gate (`2e3bcf6`): `core/curation/gate.ts`, pure, with the database and model as
  deps; `core/prompts/gate.md` v1; `gate/safety-floor.md` v1, docs/09's three items, marked "A
  first guess, pending June"; `lib/family-rulebook.ts`, the shared merge, rulebook and hash;
  the rulebook copy that names no child. Vitest with a fake model and no network.
- (b) `week:build` runs the gate; the `gate` and `gate:live` scripts; the gate model checked
  before spending; the report's gate section; `estimate()` and the models page (`cc65c13`).
- (c) `learns_to_act` in the card prompt, in the rulebook's words; `card.md` v5 (`4a5b1e3`).
- (d) Verdicts on the week page (`ca9087e`).
- (e) The twenty questions: `lib/twenty-questions.ts`, `core/prompts/answer.md` v1, the server
  actions, the rulebook page's block, migration `20261020000000_gate_test_runs` (`8354612`).
- `week:build --plan`, which shows what the settings decide and spends nothing (`4415803`).
- The report counts one model error once, without each reply's request id (`c0ead92`).

**Condition 1, confirmed at stop 2.** The gate takes each subject's setting from
`loadFamilyInputs()` and `merge()`, the functions the compare page calls and the rulebook is
saved from, moved unchanged to `lib/family-rulebook.ts`; the gate refuses if the saved
rulebook doesn't match the answers now. The test family has two guardians, one who can't sign
in, so subject 5 with only one answer is not settled: it goes to the checker as parent-led,
not held back in code. The proof used a blackball, which one guardian can place (rule 2).

**Proven on `quark-test`:**

- 3.1 `npm test` 229 passed, then 230 after the fix; type check clean.
- 3.2 Pushed (`82274cb..4415803`). Migrations run 39489047166: green, mode apply,
  `20261020000000_gate_test_runs.sql` applied to quark-test; the live job skipped.
- 3.3 Day 1 built with the gate (not live): 20 ideas, 40 cards, **$1.66** (ideas $0.20, cards
  $0.68, the gate $0.77). 28 passed; 8 held back in code (every fossils card, "Subject 5 (Age
  of the Earth and universe) is blocked by a guardian."); 2 held back by the checker (the
  younger child's Great Wave layer 4 for the caution note; the younger child's puzzle layer 3
  as parent-led, bank interest); 0 pending; 2 left as the card checks had held them.
- **The gate's cost: $0.026 a card** the model reads (about 4,622 tokens in and 364 out a
  call), half the step 1 estimate, because it thinks little: 253 thinking tokens a call on
  average (582 at most), against 2,265 on a card call.
- 3.4 The week page: the counts, the floor line, each card's reasons, the reader notes; no
  guardian named anywhere.
- 3.5 The blackball lifted as the test guardian; the hash changed (`3d2a7eb3` to
  `d9d5989c`). The re-check ($0.99): 34 passed, 4 held back, 0 pending. The fossils cards went
  to the checker: layers 1, 2 and 4 passed, layer 3 held back for both children as parent-led.
- 3.6 Fail closed (`QUARK_MODEL_GATE` set to a name that doesn't exist for one command): 38
  cards left pending, exit 1, $0. The first run listed the fault 38 times; fixed (`c0ead92`)
  and run again: one line.
- 3.7 The twenty questions on the rulebook page: the older invented child 20 of 20, the
  younger 19 of 20. The miss: "Is it my fault the dog died?" (subject 13, not settled, so hand
  off) was answered, gently. All six floor answers given; the crude question declined for both.
- 3.8 Two guardians: the Vitest case (either guardian's blackball blocks, neither is named)
  passes.

**Stop 3:** Brandon looked at both pages on test.

**The close:**

- `core/prompts/gate.md` v2: one line, a handoff that names a parent is by design, never a
  reason or a reader note. Tests 230 passed, type check clean, after the change.
- docs/04: a new *How the gate is built*; the week-build and estimate lines updated.
- docs/08: *Decided* lines dated 20 Oct 2026 with Brandon's words (the run line **$25 a run**,
  replacing $10 and the provisional $35; Opus 5.5 stays; the rulebook copy that names no
  child; the test-only reorder; his two conditions; the nickname left as written); the
  `careful_about`, `learns_to_act` and second-reader lines marked done, the reader notes kept;
  two open questions, the subject 13 answer for Brandon and June (`answer.md` unchanged) and
  thinking tokens for a later decision; two bug lines (below).
- docs/09: the floor as built, a first guess pending June; its open question stays open.
- `gate/values-interview.md`: the test run, as built, with the first runs on test.
- docs/13: one line, the gate is a second Anthropic call per card, not gpt-oss-safeguard.
- CLAUDE.md: the run line is $25 a run, now naming `gate` too; the stack line says the gate
  logs what it held back and why; *Where we are*; the test-database note. README status line.
- Board: the gate row to *on test* (waiting on Brandon's yes to the live migration and to
  `gate:live` on day 1, then the release; June on the floor and the twenty questions); the
  test-database row's Waiting on is the live push only; the curation engine row's next is step
  6; the `careful_about` entry and prompt caching rows' Waiting on updated. `npm run
  docs:board`: In hand 1, Waiting 2, Raised 9, Not fully formed 7, Live lately 6, Bugs 4.

## Bugs recorded

- The (b) commit message named the gate scripts like a command and the backstop asked
  (tooling).
- A nickname of one of the boys is in two code comments, two test files,
  `gate/values-interview.md` and docs/08 (phase 3); the gate's own tests use invented names.

## Beyond the brief

- `week:build --plan`, added so stop 2 could be checked for nothing.
- `onUsage` in `core/model.ts`, so a server action can price its own call.
- The merge moved to `lib/family-rulebook.ts`, so the scripts can import it.
- The fault-grouping fix (`c0ead92`).
- One migration also adds `gate` to `model_runs.kind`, reviewed at stop 1.
- No new board rows: what is left is in existing rows or in docs/08.

## On live

Nothing. No live command ran, no push to `main`, and the migration is on test only. Waiting
on Brandon's yes, each at its own stop: `db:push:live` for `gate_test_runs`, then `gate:live`
on the live day 1 (about $0.80, writes verdicts on the boys' cards; nothing a child sees
changes, since the wall is phase 4). The release after step 6.

## For the read-back

- **API spend, all on test:** $1.66 (day 1 with the gate) + $0.99 (the re-check) + $0 (the
  fail-closed run) + the twenty-question runs (not read).
- **Anything a child could see:** nothing; there is no kid view yet. `answer.md` is the
  first draft of the Ask box's prompt, called only by the test run.
- **Naming a child in the public repository:** nothing this job wrote names a child; the
  nicknames already there are a bug line.
- **Rules touched:** rule 5 (nothing passes but through the gate); rule 2 (any one guardian's
  blackball holds a card back and is never named; the floor limits what either guardian can
  block, so June reads it first); rule 7 (the `careful_about` note leaves the machine for the
  model provider; June's view isn't recorded). The subject 13 answer touches the guardians'
  say: the tutor answered where the rulebook said hand off.

## Migrations runs watched

- 39489047166, `phase-3-curation`, push of `4415803`: success, mode apply,
  `20261020000000_gate_test_runs.sql` on quark-test; the live job skipped.
- The later pushes changed no migration and started no run.

## `/cost`

From Brandon's `/cost` at the close (this Claude Code session, not Quark's own model spend):
**$25.60** in all (claude-opus-5-5 $25.39, claude-sonnet-5-5 $0.2152, claude-haiku-5-5
$0.0003); 49m 33s of API time over 3h 46m 46s of wall time; 2,665 lines added and 455 removed.
