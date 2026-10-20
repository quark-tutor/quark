# Report: the policy gate, phase 3 step 5 (`docs/gate-slice.md`), 20 October 2026

Job: `/wwc:job docs/gate-slice.md`. Branch: `phase-3-curation`, pushed. Opus 5.5.
Brandon's go at stop 1: "go, taking all four recommended answers (the $35 run line
provisional until step 3.3's measured figure, confirmed at the close), with two
conditions: (1) the family's setting per subject comes from the same function the
rulebook and compare pages use, not a rule of the gate's own — confirm that, and say
how many guardians the test family has and what the gate does with subject 5 there
when only one has answered; (2) no private page for June; the write-back is enough.
Record the thinking-tokens finding as a docs/08 line at the close for a later
decision; it's not this job's."

## Stop 2: the build is pushed; step 3 waits on Brandon's steps on the test copy

### Couldn't check

- **Whether subject 5 is blackballed and the caution note is set on test.** No day-1
  topic marks a subject yet, so the free check below can't show either.
- **The gate's real cost per card.** Nothing has called the gate model yet. The
  $35 run line stays provisional until step 3.3.
- **The two pages in a browser.** The week page and the rulebook page are type
  checked and linted, not opened. `next build` was not run, to leave Brandon's dev
  server alone.
- I can't see permission prompts and claim nothing about any. No command named a
  backstop pattern: no push to `main`, no `:live` script, no live env file, no
  `db-push`, no `git add -A`, `git add .` or `git commit -a`. Files were added by name.

### Condition 1, confirmed

- **The gate takes each subject's setting from `loadFamilyInputs()` and `merge()`
  (`mergeFamily()`),** the functions the compare page calls and `saveFamilyValues()`
  uses to write the rulebook. They moved, unchanged, from `lib/family-save.ts` to
  `lib/family-rulebook.ts` so the scripts can import them; `lib/family-save.ts`
  re-exports them and the pages are unchanged. The rulebook's hash is computed the same
  way, from the same function (`familyRulebook()`), and the gate refuses (every card
  left pending) if the saved rulebook doesn't match the family's answers now.
- **The test family has two guardians:** the plus-address one, who can sign in, and
  an invented one at a reserved example domain, who can't (`scripts/family.test.json`).
- **Subject 5 with only one of the two answered** is *waiting* in the merge: nothing
  is written for it, the rulebook says "Not settled yet … the tutor does not raise
  this", and the gate gives the topic's cards to the model as parent-led. Code does
  not block them. So "Don't bring it up" from one guardian cannot make a code block on
  test; a blackball by one guardian can (rule 2). The proof uses a blackball instead
  (below).

### Done

- **Board row** to *building* (`e4f5528`).
- **(a) The gate** (`2e3bcf6`): `core/curation/gate.ts`, pure, with the database and the
  model as deps; `core/prompts/gate.md` v1; `gate/safety-floor.md` v1, docs/09's three
  items, marked "A first guess, pending June"; `lib/family-rulebook.ts` (the shared
  merge, rulebook and hash); `renderPolicy(..., { forGate: true })`, the rulebook copy
  that names no child. 20 Vitest cases with a fake model, no network: every code
  check, either guardian's blackball blocking with no guardian named, parent-led and
  unsettled subjects going to the model, every fail-closed case, the rule 7 prompt
  test (the note only with a note, the band in both, nothing else about the child,
  no child named in the rulebook copy), caution notes never quoted back, and the age
  cut (8 and under 2-3, 9 and over 4-5).
- **(b) week:build and the gate scripts** (`cc65c13`): `QUARK_MODEL_GATE` checked before
  anything is spent; a list, before spending, of what the family's settings decide
  for each child's slots; the gate at the end of the build; the report's gate section
  and its cost per card; `npm run gate` and `gate:live` (`scripts/gate.mts`,
  `scripts/gate-run.ts`); anything left pending ends the run with an error;
  `estimate()` prices the gate per child per day; the models page says so.
- **(c) `learns_to_act` in the card prompt** (`4a5b1e3`), in the rulebook's own words
  (`learnsSentence()` in `lib/policy.ts`); `card.md` v5; its test.
- **(d) Verdicts on the week page** (`ca9087e`): a count, the floor version, each card's
  verdict and reasons, reader notes, and a line on a card checked against an older
  rulebook.
- **(e) The twenty questions** (`8354612`): `lib/twenty-questions.ts` and its test,
  `core/prompts/answer.md` v1, the server actions and the block on the rulebook page,
  and the migration `20261020000000_gate_test_runs.sql` as reviewed at stop 1 (comments
  added). `core/model.ts` gains an `onUsage` callback so a server action can price its
  own call.
- **`week:build --plan`** (`4415803`): prints the week and what the settings decide,
  and stops before spending or writing anything. Added so this stop could be checked
  for nothing.
- **3.1** `npm test`: 20 files, 229 tests passed. `npm run typecheck`: clean.
- **3.2** Pushed `phase-3-curation` (`82274cb..4415803`). Migrations run 39489047166:
  green, mode apply ("this push changed supabase/migrations"),
  `20261020000000_gate_test_runs.sql` applied to quark-test; the live job was skipped.
- **The free check on test** (`npm run week:build -- --week 1 --days 1 --rebuild --plan`,
  not live, spent nothing): `QUARK_MODEL_GATE` is set (claude-opus-5-5); the rulebook
  exists and is current, 6,598 characters in the gate's copy; day 1 is still the Nile,
  great-wave, leap-years, carnival-of-the-animals and two-dice, so **the reorder has not
  been run**.

### Not done

- Step 3.3 onward: the day-1 build with the gate, the week page, the rulebook change,
  the fail-closed run, the twenty questions. Then step 3's stop for Brandon's look, and
  step 4, the records and `/close`.

### Brandon's steps on the test copy, before 3.3

1. In the **quark-test** dashboard's SQL editor (test only, invented children only):

   ```sql
   update plan_topics set position = 1 where key in ('short/how-fossils-form/2-3','short/how-fossils-form/4-5','short/doubling-grains/2-3','short/doubling-grains/4-5');
   update children set careful_about = 'Frightened of big ocean waves since a tsunami siren; go gently with waves and floods.' where nickname = '<the younger invented child>';
   ```

   `npm run plan:import` on test undoes the first; setting the column back to null
   undoes the second.
2. On localhost:3000, signed in as the test guardian: **Compare**
   (`/parent/beliefs/compare`), subject 5, **Block this subject** (tap twice). Not
   "Don't bring it up": with the second guardian unanswered, that stays not settled.
3. Reply "done". I'll run the free `--plan` check again first: it should show day 1's
   wonder slot as how-fossils-form, "Subject 5 … is blocked by a guardian" for both
   children, and subject 24 as parent-led.

### The decision at this stop: step 3.3, the day-1 build on test

- **What it does:** `npm run week:build -- --week 1 --days 1 --rebuild` on quark-test.
  It writes day 1's ideas and both children's cards, then runs the gate on the 40
  cards. About $2.75 by the step 1 estimate, under the $10 line.
- **What it touches:** not live. The test copy's week 1 theme, its ideas, cards and
  questions, and one `model_runs` row.
- **How it is undone:** the money can't be. The data is replaced by running the same
  command again; nothing else depends on it.
- **After it, without another stop** (each on test, each under $10): the rulebook change
  (Brandon lifts the blackball, or I ask him to), the fail-closed run with
  `QUARK_MODEL_GATE` set to a name that doesn't exist for that one command ($0), the real
  re-check with `npm run gate -- --week 1` (about $2), and the twenty questions for each
  invented child on the rulebook page (about $0.80, through Brandon's Chrome on
  localhost:3000, or his own clicks).
