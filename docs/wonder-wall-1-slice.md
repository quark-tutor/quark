# The Wonder Wall a kid can use: phase 4, slice 1

Brief drafted in Claude Code on 20 October 2026, on `phase-4-wonder-wall` (made from `phase-3-curation` at
`1bb496b`, which is `origin/main` plus the release's two record commits), for the build session. One job, one
Claude Code session in `quark`, on `opusplan` (the brief settles the design; the wall's copy, its layout at iPad
size and the answer matcher's edges are step 1's). The board's row: *Wonder Wall slice 1: today's five cards,
layers, hints as written, the handoff, on a paired iPad* (briefed, phase 4). It is the first thing a child sees:
`/kid` today says "Your Wonder Wall is getting ready" and nothing else. **The target is the boys using it on
Monday 26 October 2026**, so the slice is sized to that, with a cut list.

**Decided by Brandon before this brief:**

- 20 October 2026: the road is slice 1, then the iPads, then the pilot. Slice 1 is the minimum a kid can use,
  not the whole of phase 4.
- 20 October 2026: the target is the boys using it on Monday 26 October. The live week for it is built on
  Saturday with `week:build:live -- --start 2026-10-26`, after the existing live week 1 is deleted, each a live
  command at its own STOP by Brandon's hand, so a guardian can read it and tap on Sunday.
- 13 October 2026: nothing goes live on its own; a week reaches a child only after a guardian's tap.
- 20 October 2026: the direct-write migration (guardians lose update on `themes`, `ideas`, `cards` and
  `questions`, and insert on `audit_log`; the server keeps them) lands in this slice, before any theme is made
  live on live.
- Rules 3 and 4 are not negotiable: the child guesses first; hints come one at a time after an attempt; the
  last step hands off to a person; the screen never gives the answer; no autoplay, streaks, notifications,
  outbound links, or rewards that exist to bring a child back.
- Rule 7: the kid routes carry nothing about the child to the browser beyond the nickname, and no model prompt
  is built in slice 1.

**Settled with Brandon on 20 October 2026 ("go"):** every decision below and every recommended answer under
*To settle*, with two changes, written in below. Brandon: "go, taking all of these, with two changes: (1) take
cut 1 now: no next-day layer in slice 1; the docs/04 rule stays "its day is today", commit (f) goes, and the
carry-over is a slice 2 row; (2) in judgeGuess, on a question whose accepted answers are a choice of two, a guess
that contains both choices is not right. Everything else as recommended: the branch from phase-3-curation at
1bb496b; a card is done at the handoff, a right answer finishes a layer; layer 1 right before layer 2; "I don't
know" gets no hint; typed answers with the keyboard's dictation as our setting; "Read it to me" never automatic;
the migration with insert and sessions and attempts, the five audit writes moved, the release before M1; the
proof week on test with pictures, about $15; recordings from Wikimedia's copy for now, a board row to store them;
the live delete by my hand in the SQL editor at M2; one build session with the cut list. Add a board row for the
28 short lessons needed before 31 October (raised, phase 3, Brandon and June)." The decisions are dated for
docs/08 at this brief's close.

## Why

The pipeline ends at a switch nobody reads: a guardian can make a week `live` (docs/04, "How a week goes
live"), and the kid view shows only "Hi, [nickname]." Phase 3 wrote the rule for phase 4: **the wall shows a
card only when its theme is `live`, the card has `passed`, and its day is today.** Slice 1 is that rule, the
card a child reads and answers, and the hand-off to a person, with no model call. It is what the pilot needs
first; the conversation, the voice and the rest are later slices.

## Sized for Monday 26 October

**What has to be true by Monday morning:**

1. Slice 1 built, proven on `quark-test` on the laptop and on a real iPad, used by Brandon as a child would,
   released to `main` and deployed on Vercel.
2. The direct-write migration on live (after the release, since the release moves five audit writes to the
   server first).
3. A seven-day live week starting 26 October, built on Saturday, every card checked by the gate, read and
   tapped Looks good on Sunday (*The week for Monday*, below).
4. Both iPads paired to live from `/parent`, each to its child, in Guided Access.

**The calendar:**

| Day | What | Whose |
|---|---|---|
| Tue 20 Oct | This brief | Brandon's go (given) |
| Wed 21 Oct | The build: step 1 write-back and STOP, then step 2 | Claude Code; Brandon's go at stop 1 |
| Thu 22 Oct | Step 3, the proof on test; STOP for Brandon on the iPad | Claude Code; Brandon |
| Fri 23 Oct | Step 4, the close; `/wwc:release`; stop M1, the migration on live; June reads the safety floor | Brandon |
| Sat 24 Oct | Stops M2 to M4: delete live week 1, read its plan, build it (about $13) | Brandon's hand |
| Sun 25 Oct | A guardian reads week 1 and taps Looks good; the iPads paired to live, Guided Access | Brandon and June |
| Mon 26 Oct | The boys | — |

The slack: the build can run on Sunday morning and the tap on Monday morning before school (making a week live
has no cut-off; only taking it back does). A day the week isn't ready is a day the wall says "Nothing on the
wall today"; that day's cards are never shown later.

**Taken already (Brandon, 20 October):** the next layer the next day after a handoff is not in slice 1. The
handoff ends the card; the carry-over is a slice 2 board row; the docs/04 rule stays "its day is today".

**What to cut if it doesn't fit, first cut first:**

1. The one-letter slip in the answer matcher (decision 2): exact words only.
2. The session's end time (decision 3): sessions keep their start only.
3. Pictures in the test proof (step 3.4): test's text-only week 1 is moved to start on the proof day by a
   test-only `fixture` command instead of rebuilt (saves about $15 on test); pictures are first seen on Saturday's
   live build, in the week page, before the tap.
4. Layers 2 to 4: the wall shows the five first cards only, each with its guess, hints and handoff. Still inside
   rules 3 and 4. The last cut.

**Never cut:** guess first, hints after a guess, the handoff, no autoplay; the read path's rule and its tests;
nothing a child typed leaving the family's rows; the direct-write migration on live before the tap; Brandon
using it on test as a child would.

## Decisions (settled 20 October 2026, dated for docs/08 at the close)

1. **What a kid can do in slice 1.**
   - **The wall.** `/kid` on a paired iPad: "Hi, [nickname]." and today's five first cards in slot order (Look,
     Wonder, Listen, Then, Puzzle), from the family's live week, passed cards only, for today in the family's
     timezone (`families.timezone`, Pacific/Honolulu). A slot with no passed first card shows nothing (the
     other tiles keep their order). With none: "Nothing on the wall today." A tile is the slot's name and the
     card's title in big type; no picture on the tile (stored copies run up to 20 MB, and five at once is slow on
     home Wi-Fi), no count, no star, no progress bar.
   - **A card.** Tap a tile: one screen with the picture (a signed URL to the private copy, as the week page
     does) or the recording (a player that never autoplays and loads nothing until tapped), its credit line in
     small type (`credit()`), the card's words, a "Read it to me" button, the question, one answer box and one
     button, "That's my answer". "Back to the wall" at the top: the wall runs as a Home Screen app, which has
     no back gesture (deploy/README).
   - **Read aloud.** "Read it to me" reads `read_aloud` with the browser's speech synthesis (iPad Safari first;
     `read_aloud` is written for this, the whole card for a child who is read to); a second tap stops it. The
     same button sits beside each hint and the handoff, which `read_aloud` doesn't carry. Never automatic.
   - **Answering, one layer at a time, to layer 4, then the handoff** (decision 2).
   - **Coming back the same day:** a card opens where the child left it, with the hints already seen, read from
     the database (an iPad reload or the other iPad agree; nothing is kept in the browser).
   - **Not in slice 1, and the slice each belongs to:** the next layer the next day after a handoff (slice 2, a
     board row); hints as a conversation from a model (slice 2); the Ask box (its own slice, after "Where the
     limits on Ask are" with June); spoken answers by speech recognition in the app (slice 3, voice); explorer
     stamps (with the reward engine, docs/15); the calm end on rushing (the rushing slice, docs/12); profiles
     beyond the paired child (an iPad is one child); offline and stored recordings (a board row); the tutor's
     voice and faces (4d, docs/08).

2. **How an answer is handled, with no model call.**
   - **The matcher.** `judgeGuess(guess, answerKey, question)` in `core/wall/answer.ts`, pure: the same word rule
     the hint check uses (`words()` and the stop list in `core/curation/cards.ts`, exported, so the two can't
     drift): lowercased, accents folded, a trailing s dropped from words over four letters, stop words dropped;
     a guess is right when it holds every meaningful word of some accepted answer, as often as the answer uses
     it. Three additions:
     - a one-letter slip is forgiven in a word of five letters or more ("chello" is "cello"), because a
       7-year-old types (cut 1 if Monday doesn't fit);
     - a guess with "not", "no", "never" or "n't" is not right unless the accepted answer has it too ("not
       north" is not "north"; "not the animal" is an accepted answer on day 1);
     - **a choice of two** (Brandon, 20 October): on a question that offers two choices ("…: north toward the
       sea, or south away from it?"), a guess that contains both choices is not right: "north or south" is not
       "north". The side an accepted answer matches is the right one; a guess that also holds a meaningful word
       found only on the other side is not right. Step 1 shows the rule that finds the two sides, run over every
       question of test's week 1, and lists the questions it reads wrong. Known edge: a sentence that explains
       with the other side ("north, because the south is higher") is not right either; the step 1 table counts
       how often.
   - **The steps.** A blank box can't be sent. "I don't know", "idk", "dunno", "no idea" or a guess with no
     letter or digit is not a guess: "Have a guess first. Any guess is fine.", and no hint (docs/12: help only
     after a try). A guess that isn't right shows the next pre-written hint ("Not yet. Here's something to think
     about:"). After the last hint, one more guess; if it isn't right, the handoff ("This one is for a person:",
     then the card's handoff line), and the card is done. A right guess: "That's it." and "Go deeper", which
     opens the next layer if it passed (a held-back layer stops the child at the one before). A question with no
     accepted answers is open: any real guess is taken, recorded with `correct` empty, and the handoff follows
     ("That's one to talk about."). Layer 4 ends with its handoff, which carries the chain's last question
     (`card.md`).
   - **After a handoff, the card is done** and doesn't open deeper, in this session or later: the wall shows only
     today's cards, as the docs/04 rule says. The next layer the next day is slice 2 (Brandon, 20 October).
   - **What code matching gets wrong, with day 1 of test's week 1** (built 20 October; the ideas are shared, so
     these are the questions both children get; read from the build's local debug copy):
     - **5 of 20 it can't judge at all.** Every layer 4 has no accepted answers, only a rubric ("Is a picture less
       special if thousands of copies exist…?"). Hence the open-question rule above.
     - **7 of 20 it judges well:** numbers ("8", "15", "about 400", "five") and one-word facts ("cello",
       "water", "minerals"). It misses a misspelling worse than one letter, and the rubric's "nearly right"
       ("a big violin", "mud"), which it calls not yet.
     - **6 of 20 are a choice of two** ("brush, or pressed from carved wood?", "north toward the sea, or
       south?", "the bottom or the top?"). A blind pick is right half the time; typing both choices back is now
       not right. Low stakes (a wrong pick costs a hint), but on these "right" doesn't mean understood.
     - **2 of 20 are explanations** ("Why did every block need the same notches?", accepted "so colors line
       up"; "Why does the Nile run north?", accepted "it flows downhill"). Most right answers in other words
       fail: "because it goes downhill" lacks "flow"; "so the picture isn't messy" matches nothing.
     - So a right answer will sometimes be told "Not yet" and get a hint it didn't need. The reply never says
       "wrong", the hint leads back to the same idea, and the handoff sends the rest to a person. How often is
       measured, not guessed: step 1 of the build runs the matcher over every question of test's week 1 with
       invented answers (right in other words, misspelled, wrong, both choices) and puts the table in the report;
       the attempts rows show it in the pilot. A model reading the guess against the rubric is slice 2.
   - **Typed answers in slice 1.** The card prompt writes every question to be answered "by voice" (`card.md`
     v5). The bridge is the iPad keyboard's own dictation key: a child taps the microphone on the keyboard and
     says it, and the words land in the box. It is an iPad setting (Settings, General, Keyboard, Enable
     Dictation), Brandon's and June's (decided 20 October: their setting); Apple's dictation may run on the iPad
     or send the audio to Apple, depending on the model. Quark records only the words. A grown-up may also type
     for the 7-year-old. Spoken answers in the app are slice 3.

3. **What is recorded, and nothing more.**
   - **`sessions`**, one row per visit: made when the wall or a card loads and the child has had no activity in
     the last 30 minutes (`family_id`, `child_id`, `started_at`, `device` = the device's id); `ended_at` moved to
     the time of each answer, so it is the last activity; `ended_reason` `child_left` when the next visit starts.
     `engaged_sec` stays empty (the rushing slice). The end time is cut 2.
   - **`attempts`**, one row per guess that counts (a "Have a guess first" writes nothing): `family_id`,
     `session_id`, `child_id`, `question_id` (the card is reached through it), `mode` `teach`, `answer` (the
     guess, trimmed, at most 200 characters), `correct` (true, false, or empty for an open question),
     `hints_used` (hints shown before this guess), `seconds` (from the question shown to the guess, sent by the
     page, clamped to an hour), `created_at`. `rushed` stays false and `input` empty (typed and dictated can't
     be told apart).
   - **Untouched:** `mastery`, `review_schedule`, `child_observations`, `ask_log`, `experiments`,
     `questions.difficulty` (phase 6), and the lens picker's history (`history: {}` in `week-job.ts`): slice 1's
     answers don't change any lens, so the board row *A week's lens plan is kept from day 1* waits on the slice
     that feeds the picker, not on this one.
   - **Nothing a child typed leaves the family's rows:** no model call, no third party, and never in a server
     log (no `console.log` of a guess, a nickname or a reply; a test holds it on the route).
   - **Rule 7, the replies line by line.** The wall sends: the nickname; per tile the slot, title and card id. A
     card sends: id, slot, layer, title, text, image_alt, read_aloud, question, the media's type, signed URL and
     credit lines, the hints seen so far, its state, the handoff only once reached, and the next card's id only
     once earned. An answer's reply: the outcome, the next hint or the handoff, and the next card's id. Never:
     the answer key or rubric, a hint not yet earned, a handoff not yet reached, `policy`, `policy_notes` (the
     checker's reasons and the teacher's-eye notes are for parents), lens, door, level, birth month, age, sex,
     reading level, interests, `careful_about`, another child's anything. A test holds each reply to exactly
     these fields.

4. **The read path and its proof.**
   - **One module.** `lib/wall.ts` (server-only) does every read and write the kid view makes, always starting
     from `getDevice()`: the device cookie resolved to one child, and the admin client scoped in code to that
     child's family and that child. The `/kid` pages render on the server from it; the one write is
     `POST /api/kid/answer`. A test holds that nothing else under `app/kid` or `app/api/kid` queries the
     database.
   - **The rule, in one query:** cards of this family and this child, `policy = 'passed'`, `day =` today in
     the family's timezone, whose theme is this family's and `live`. A card whose picture or recording is no
     longer approved (`content_items.approved` false, as after a guardian's rejection) is not shown. An answer to
     any card outside the rule is refused and writes nothing.
   - **Vitest, one check per rule** (a fake database, as the curation tests do): a pending or blocked card never
     returned; another child's card never; another family's never; a `review`, `generating` or `done` theme's
     never; yesterday's and tomorrow's not (and 11:30 pm in Hawaii is still today, though it is 09:30 UTC the
     next day); a blocked layer 2 stops the child at layer 1; an unapproved item hides its card; an answer to a
     card outside the rule writes nothing; hints come one per wrong guess and never ahead; a card handed off
     opens no deeper layer; the answer key in no reply; the replies' fields exactly as decision 3; no guess
     logged.
   - **The direct-write migration**, written out, reviewed at stop 1 of the build and applied to test by the
     workflow on push (`supabase/migrations/20261021000000_server_writes_weeks.sql`):

     ```sql
     -- Quark — phase 4, slice 1: only the server writes a week, its verdicts, a child's answers and the audit
     -- log (docs/04, "How a week goes live"; decided 20 Oct 2026). A signed-in guardian could write these
     -- through the Data API (20261010000002), so the Looks-good tap's checks could be gone around and a card
     -- one guardian's blackball held back could be marked passed by the other (rules 2 and 5). Guardians keep
     -- reading all of it; the service role keeps writing it.
     revoke insert, update on themes, ideas, cards, questions from authenticated;
     revoke insert, update on sessions, attempts from authenticated;
     revoke insert on audit_log from authenticated;
     ```

     It is wider than the 20 October decision's words in two places (settled the same day): `insert` as well as
     `update` on the four week tables (a guardian could otherwise insert a passed card into a live week), and
     `sessions` and `attempts` (no page writes them; slice 1 starts writing them through the server).
   - **Five audit writes move to the server** in the same commit, because today they go through the guardian's
     own session and the migration would break them: forgetting an iPad (`app/parent/actions.ts`, which doesn't
     check the error, so it would fail silently), the beliefs saves (`app/parent/beliefs/actions.ts`),
     approving and rejecting an item (`app/parent/content/actions.ts`), and placing and lifting a blackball
     (`app/parent/beliefs/compare/actions.ts`). Each keeps `guardian_id` from `requireGuardian()`, as
     `lib/family-save.ts` does. The blackball and device writes themselves stay with the guardian (their own
     policies already limit them).

5. **The layout, for an iPad in Guided Access.**
   - One wall screen that never scrolls at 820 × 1180 (a recent iPad, portrait) or 1180 × 820 (landscape): five
     tiles stacked in portrait, three and two in landscape; type at least 28 px on a tile, 22 px on a card; every
     target at least 64 px. A card screen may scroll down when the words are long; nothing scrolls without end.
     The answer box stays above the keyboard when it opens.
   - What is tapped: a tile; on a card, "Back to the wall", "Read it to me", the player, the answer box, "That's
     my answer", and, when earned, "Go deeper". Nothing else: no decoration, no animation, no sound but the
     reading and the player; one question, one way to answer. No link anywhere, and no way out but Guided
     Access's own.
   - **The wall's own sentences** (June may want to read them at step 1): "Hi, [nickname]."; "Nothing on the
     wall today."; "That's everything on the wall today."; "Read it to me" / "Stop"; "Type your answer"; "That's
     my answer"; "Have a guess first. Any guess is fine."; "Not yet. Here's something to think about:"; "That's
     it."; "Go deeper"; "That's one to talk about."; "This one is for a person:"; "Done for today" (a done tile,
     plain and grey, no count); "Back to the wall". Effort words only (rule 8; none of the brilliance words, a
     test holds it); the manner rules for each (no sarcasm, no lecture, nothing about the child's past behaviour,
     no shame, always a way back in). They are written to hold under every family's praise setting
     (`conduct.praise`); reading the conduct settings is slice 2's, with the conversation.

6. **What June and Brandon see.** Nothing new on `/parent`. The week page's missing-first-card lines already say
   what a day will lack. Two sentences on the week page stop being true and change: "Nothing here is on the kids'
   iPads." goes, and "The wall isn't on the iPads yet, so for now nothing changes for the kids." becomes "From
   [Monday], the Wonder Wall shows the cards that passed and nothing that was held back." What the boys answered
   reaches the parents in the digest (phase 5); in the first week, a parent can sit beside them.

7. **The stops in the build** are the ones in *Steps and stops*: (1) the write-back; (2) none for the test
   migration, which the workflow applies on push (a red run is a stop the job failed to plan); (3) Brandon on the
   iPad. Nothing in the build is live. The live steps are the next section's, run in their own session after the
   release.

8. **The week for Monday.** Below.

## The week for Monday

**Where live stands.** Live week 1 started on Monday 19 October and has one day (built 16 October, checked by
the gate on 20 October; Brandon). It can't go live: the tap refuses a week with fewer than seven days, and its
days are past. The boys need a seven-day live week starting Monday 26 October.

**What the library means for it: it is week 1 again.** The library's 28 short lessons are all used by week 1
(docs/04), and `weekSchedule()` gives a week the lessons no earlier week used. With the old week 1 deleted,
there is no earlier week, so the new week is plan week 1 again: the same 28 lessons and Egypt's topics 1 to 7,
with new cards (the ones the parents read on 16 October are gone). A week numbered 2 would refuse for want of
lessons. It also means **the wall is empty from Monday 2 November** unless week 2 is built: 28 more short lessons,
picked by Brandon and June, before Saturday 31 October (a board row), and the unique-index board row, which waits
on a real week 2 on live.

**Why delete it rather than rebuild it.** `week:build --rebuild` keeps an existing week's start date (in
`prepareWeek()` the week's own date wins over `--start`), so a rebuild would make a week starting 19 October.
The test fixture's `delete-week` has no live twin, by design. So the delete is one SQL statement Brandon runs in
the live project's SQL editor (settled 20 October).

**When.** Saturday 24 October, so a guardian reads it and taps on Sunday. The build takes about 15 to 25
minutes on the laptop (by the script, with no 300-second cap).

**The stops, each by Brandon's hand, each with its four lines:**

- **M1, Friday 23 October, after the release: `npm run db:push:live`.**
  - What: applies `20261021000000_server_writes_weeks` to the live database (decision 4's migration).
  - Touches: LIVE.
  - Undone by: a new migration granting the six tables back to `authenticated` (written out at the stop; itself
    a stop).
  - Checked on test: the workflow applied it; the five moved audit writes worked and a guardian's direct write to
    a card and to the audit log was refused (step 3.3). It comes after the release because the moved audit
    writes must be on Vercel first.
- **M2, Saturday: delete live week 1.** Brandon, in the live project's SQL editor:

  ```sql
  select id, week_start, plan_week, status from themes where plan_week = 1;   -- expect one row: 2026-10-19
  delete from themes where plan_week = 1 and week_start = '2026-10-19';        -- its ideas, cards, questions go too
  ```

  - Touches: LIVE. **Cannot be undone.** The old day 1's 40 cards were never live and no child answered them;
    their check is recorded in `docs/reports/2026-10-20-gate-live.md`. `model_runs` rows keep their cost with
    the theme emptied (`on delete set null`).
  - Checked on test: the fixture's `delete-week` (20 October, and again at step 3.4).
- **M3, Saturday: `npm run week:build:live -- --week 1 --start 2026-10-26 --plan`.**
  - What: reads the live database and prints the seven days (the slot the thread takes, the lessons on the rest)
    and what the family's settings decide; spends and writes nothing.
  - Touches: LIVE, read only. Nothing to undo.
  - **The plan reorder check, Brandon's:** day 1 should be the Nile on the then card with great-wave, leap-years,
    carnival-of-the-animals and two-dice (docs/04). If how-fossils-form or doubling-grains is on day 1, test's
    reorder of 20 October is on live too, and `plan:import:live` (a live write, at a stop of its own) puts the
    files' order back first.
  - Checked on test: `--plan` there on 20 October.
- **M4, Saturday: `npm run week:build:live -- --week 1 --start 2026-10-26`.**
  - What: builds week 1 on live, seven days, both children, with pictures, then the gate; leaves it in `review`.
  - Touches: LIVE, and about **$13** (the whole test week cost $12.64 through the route on 20 October; the live
    rulebook is about 5% longer; pictures add the offered items to the idea calls). Under the $25 line, but live.
  - Undone by: nothing reaches a child until a guardian taps; a bad day is rebuilt with `--day d --rebuild`
    (live, a stop); the money is spent.
  - Checked on test: step 3.4's whole week with pictures.

**Then, not a command:** on Sunday, a guardian opens `/parent/week/<theme>` on Vercel, reads it, and taps Looks
good. If the beliefs answers change between Saturday's build and the tap, every verdict is on an older rulebook
and the tap refuses: `gate:live -- --week 1` (about $7, a live stop) checks them again. So nobody changes the
beliefs answers that weekend. The iPads: each paired to its child from `/parent` inside its Home Screen app,
then Guided Access (deploy/README).

**The Sunday build is not in the way.** Whether or not `CRON_SECRET` is set on Vercel, Sunday's firings look for
the Monday after (26 October), find week 1 there, not one the cron made, and refuse ("already built"), spending
nothing. Recommended: leave it unset until week 2 has its lessons.

**The week-ready checks, and whose:**

- **Brandon's:** the release (his go); M1 to M4, each a yes at its stop; reading M3's printout (the reorder);
  pairing both iPads to live and Guided Access; whether the keyboard's dictation is on (with June); using slice 1
  on test as a child would (step 3, before any of this).
- **June's:** the safety floor, by Friday 23 October, before the build (if she changes its three items, that is
  a new floor version, and a week checked before it can't go live until `gate:live` checks it again: about $7
  and a stop); the wall's own sentences at step 1, if she'd like.
- **Either guardian's, one is enough (rule 2):** reading week 1 on Sunday and tapping Looks good. Recommended:
  both read it.
- **Not needed for Monday:** the twenty questions and the subject 13 question. Both are about the Ask box's
  answers, and slice 1 has no Ask box.

## Read first

1. CLAUDE.md (loaded): the eight rules (3, 4, 5, 7 and 8 above all), the stack, *Before a consequential
   action*, *Where we are*; this brief.
2. docs/03 (the Wonder Wall sketch), docs/06, docs/12 (*Hints are earned*; *The session ends when the
   thinking stops*; *Conduct the tutor teaches*), docs/15, docs/17; docs/04 (*How a week is built*: a card's
   body; *How a week goes live*); docs/13 (*What version one actually uses*); docs/08 (*How the tutor sounds*;
   *Faces*; *Review of the 2c rebuild*; the Decided lines of 20 October on the direct-write gap; *Wonder Wall,
   slice 1*); deploy/README (the iPad steps); the board.
3. `app/kid/*`, `app/api/kid/pair/route.ts`, `lib/device.ts`, `lib/pairing*.ts`, `lib/supabase/*`, `proxy.ts`
   (the kid view is outside its matcher), `app/manifest.ts`; the first migration (cards, questions, sessions,
   attempts, the RLS policies), `20261010000001` (devices), `20261010000002` (the grants), `20261014000000`
   (`ideas.day`); `core/curation/cards.ts` (`CardBody`, `words()`, `givesAway()`, `checkCard()`),
   `core/curation/types.ts`, `core/curation/week.ts` (`todayIn`, `addDays`), `core/content/credit.ts`;
   `app/parent/week/[theme]/page.tsx` (the signed URLs, `MediaBlock`, the player); the five audit writes in
   decision 4; `core/prompts/card.md` and `manner.md`; `scripts/fixture.mts`.
4. `docs/reports/2026-10-20-looks-good-slice.md`; `docs/reports/2026-10-20-wonder-wall-brief.md`.

## Brandon's own steps, before the session

1. Nothing new in `.env.local`: the wall needs no new secret.
2. For step 3, an iPad with Safari (not the Home Screen app: it keeps its own cookies, so its pairing stays as
   it is), on the same Wi-Fi as the laptop. Windows may ask whether Node may take connections on the private
   network; say yes for private.
3. Keep the dev server on test for step 3; step 3 says when it restarts to listen on the home network.
4. With June: whether the keyboard's dictation is on for the boys (decision 2); her read of the safety floor
   by Friday.

## Steps and stops

Every STOP carries the four-line pre-flight report: what is about to happen; what it touches (LIVE in capitals,
or "not live"); how it is undone; what was checked on test. No step of the build is live.

1. **Write back, then STOP.** Read the files above and show: the read path's query and every test of decision
   4; the matcher's rules, including how a choice of two is found, and its table over every question of test's
   week 1 with invented answers (right in other words, misspelled, wrong, both choices), with the share
   misjudged; a card's states and each reply's fields; the wall's sentences; the layout at 820 × 1180 and
   1180 × 820, in words; the migration and the five moved audit writes; the proof's day and its spend (about $15
   on test); the files to change and the tests to add; which cuts are taken, if any. Branch
   `phase-4-wonder-wall`. Suggest plan mode and `opusplan`. **Brandon confirms and says go.** On go the board row
   moves to *building* as the first commit.
2. **Build,** each a commit: (a) the migration and the five audit writes on the server's client, with tests;
   (b) `core/wall/answer.ts` (`judgeGuess`) and the card's state from its attempts (pure), with tests; (c)
   `lib/wall.ts`, the read path and the answer's write, with decision 4's tests; (d) the `/kid` wall,
   `/kid/card/[id]`, `POST /api/kid/answer`, read aloud, the player and the credit line; (e) the week page's two
   sentences; (f) `fixture -- answers [n]`, a test-only read of the last answers and sessions, naming no child.
   Push the branch: the migration changed, so the migrations workflow runs on `phase-4-wonder-wall` and applies
   it to `quark-test`. `gh run list --workflow migrations.yml --branch phase-4-wonder-wall --limit 1`,
   `gh run watch` on it, and the result in the report. A red run is a stop the job failed to plan.
3. **Prove it on test, then STOP.** In this order, each shown:
   1. `npm test` and `npm run typecheck`.
   2. The workflow's run, green, with the migration applied on test.
   3. The migration: as the test guardian, in Chrome, the five moved audit writes still work (forget a test
      iPad, save a belief, place and lift a blackball; approve or reject an item once step 3.4 has fetched some);
      a write to a card's `policy` and an insert into `audit_log` through the data API with the guardian's own
      session are both refused.
   4. **A week with pictures, starting the proof day.** `npm run content:fetch` on test (about $2: one flag call
      per item, about 90 items, on Opus 5.5; it has never run on test). Then `npm run fixture -- delete-week 1`
      and `npm run week:build -- --week 1 --start <the proof day>` (about $13, about 15 minutes): test's week 1
      today starts 26 October, so on the proof day its wall would be empty, and its cards were written with no
      pictures, which a fetch after the fact doesn't add. Each run is under the $25 line. Then the test guardian's
      Looks good (Claude Code, in Chrome, on test). This is also the first week with pictures built by the code.
   5. **The laptop's browser** at 820 × 1180 and 1180 × 820, paired to an invented child: the wall; a card with
      a picture, one with a recording (nothing plays until tapped); "Read it to me"; "I don't know" (no hint);
      both choices typed back on a choice of two (not right); a wrong guess, hint 1, hint 2, the handoff, and no
      way deeper after it; a right guess, "Go deeper", layer 4 open, its handoff; a reload that keeps the place;
      the other child's cards never; the rows, with `fixture -- answers`.
   6. **A real iPad**, Safari, on the laptop's dev server over the home Wi-Fi (`npm run dev -- --hostname
      0.0.0.0`; Next may need the laptop's address in `allowedDevOrigins`, step 1 says), paired to the test copy
      from `/parent`: read aloud heard (check the iPad's volume and silent mode), the keyboard and its dictation
      key, the player, the picture, both orientations.

   **STOP** for Brandon to use it on the iPad as each invented child would.
4. **Records and `/close`.** docs/04 (*How the Wonder Wall is built*; *How a week goes live*: "what live means
   today"); docs/12 and docs/03 where slice 1 settles a line; docs/13 (the kid view); CLAUDE.md's stack line on
   the kid view ("a scoped key that can only read today's passed cards" becomes the device cookie and the server)
   and *Where we are*, then the README status line; docs/08, the *Decided:* lines under *Wonder Wall, slice 1*;
   the board: this row to *on test* (waiting on: the release; the week for Monday), the direct-write row to *on
   test* (waiting on M1), the content:fetch-on-test row to *live*, the Wonder Wall heading row split into its
   pieces (hints as a conversation; spoken answers; stamps; the calm end; the Ask box), and the lens-plan row's
   Waiting on. The full report, the four-line read-back, `/cost`.
5. **The release: `/wwc:release`, Brandon's go,** Friday 23 October. Vercel deploys `main`.
6. **The week for Monday: its own session, after the release,** the stops M1 to M4 above, its own report
   (`docs/reports/<date>-week-for-monday.md`) and `/close`. Then Sunday's read and tap, and the iPads.

## To settle with Brandon at step 1

Settled on 20 October 2026 ("go"), every one as recommended, with the two changes above (cut 1 taken; a choice
of two typed back is not right).

- **The branch's base.** `phase-4-wonder-wall` from `phase-3-curation` at `1bb496b`, which is `origin/main`
  (`9694b58`) plus the release's two record commits (the *Where we are* paragraph, the release entry, four board
  rows to live, the release report), so the records come along and reach `main` with phase 4. Not from local
  `main`, which is 137 commits behind (`d9bd970`).
- **What makes a slot's card done.** The handoff reached, after the hints ran out on any layer or after layer 4's
  answer; a right answer finishes a layer, not the card.
- **Layer 1 answered before layer 2 opens.** Yes, right. After a handoff, no deeper layer in slice 1 (Brandon's
  change: the next-day layer is a slice 2 row, and the docs/04 rule stays "its day is today").
- **"I don't know."** Not a guess, so no hint ("Have a guess first"), because docs/12 gives help only after a
  try.
- **Typed answers for a 7-year-old who is read to.** The iPad keyboard's dictation key, on or off by Brandon and
  June (their setting; Quark keeps only the words), and a grown-up may type for him; the wall reads every card,
  hint and handoff aloud on a tap.
- **The read-aloud control.** "Read it to me" on the card and beside each hint and the handoff; a second tap
  stops; never automatic.
- **How much of day 1 to read for the answer-matching question.** Done for this brief: all 20 of day 1's
  questions and accepted answers (decision 2). For step 1 of the build: every question of test's week 1, run
  through the matcher with invented answers, as a table.
- **The migration's scope.** `insert` as well as `update` on `themes`, `ideas`, `cards` and `questions`, and
  `sessions` and `attempts` too (decision 4); with the five audit writes moved to the server, and the release
  before the live push (M1).
- **The proof week on test.** `content:fetch` on test and test's week 1 built again starting the proof day, about
  $15 on test (step 3.4). The other way is cut 3.
- **Recordings.** The wall plays a recording from Wikimedia's copy, as the week page does (docs/04: recordings
  keep their URL only, for now). The iPad fetches the file; nothing the child can tap leads anywhere, and no link
  is shown. Storing recordings like pictures is a board row.
- **The live delete.** The SQL above in the live project's SQL editor, by Brandon's hand (M2).
- **The size of the slice.** A slice: one build session on Wednesday, the proof on Thursday, the close and the
  release on Friday, with the cut list above if it runs long.
- **Found while writing this brief, where it and the repository disagree:**
  - Local `main` is 137 commits behind `origin/main`, and the release's records are on `phase-3-curation` only
    (the branch's base, above).
  - CLAUDE.md's stack line and the first migration's comment say the kid view uses "a scoped key that can only
    read today's passed cards and write attempts". docs/13, migration `20261010000001` and the code say it holds
    no key: a device cookie to the app's own server, which reads with the admin client. The brief follows
    docs/13; the stack line changes at the build's close.
  - The decided migration covered `update`, not `insert`: a guardian could still insert a passed card (the scope,
    above).
  - Five `/parent` audit writes go through the guardian's own session, and one of them ignores its error; the
    migration would break them (decision 4).
  - "content:fetch on test first so the cards have pictures": a fetch adds items, but test's week was written
    with none, so its cards stay text only; and test's week 1 starts 26 October, so the wall on test would be
    empty on the proof day (step 3.4).
  - Recordings aren't in the bucket, so the wall's player fetches from Wikimedia (recordings, above).
  - `card.md` v5 writes each question "to be answered by voice"; slice 1 takes typed answers (decision 2).
  - Every layer 4 on day 1 has no accepted answers; code can't judge them (decision 2's open questions).
  - `week:build --rebuild` can't move a week's start, and the fixture's delete has no live twin (*The week for
    Monday*).
  - `attempts.question_id` has no cascade: once a child has answered a week, the week can't be deleted or rebuilt
    (the delete fails, and nothing is spent). Kept: an answered week is the record, and holding back one card of
    a live week is a later slice.
  - The lens picker reads no history (`history: {}`), so slice 1's answers change no lens; the lens-plan board
    row's trigger moves (decision 3).
  - The board's rule replaces a heading row with its pieces; the Wonder Wall heading row says slice 1 is briefed
    for now and is split at slice 1's close.
  - The wall runs as a Home Screen app with no back gesture, so "the back-to-wall gesture" is a button (decision
    1).
  - The week page says "Nothing here is on the kids' iPads" and "for now nothing changes for the kids"; both stop
    being true (decision 6).
  - Not read, because they are live or on Vercel: live week 1's start and day count (Brandon's, above), whether
    live's plan carries test's reorder (M3), the Vercel production environment, and the Supabase plan (image
    resizing is not assumed).

## Not in this job

- Any code, any command that spends, anything live; more short lessons; the unique-index migration (its own
  row); 4d (the tutor's voice and faces); the digest.
- In the build, as decision 1 lists: the next layer the next day, the Ask box, hints from a model, spoken answers
  in the app, stamps, the calm end, profiles beyond the paired child, offline and stored recordings; holding back
  one card of a live week; any change to `/parent` beyond the week page's two sentences.

## What done means

- On a paired iPad against `quark-test`, a child sees today's five first cards from the live week, passed only;
  reads one with its picture or recording and credit, hears it read on a tap, guesses first, gets the written
  hints one at a time after wrong guesses, reaches the handoff, and goes a layer deeper on a right answer, to
  layer 4. Nothing plays by itself; no link; no count.
- The read path holds decision 4's rules, each under a Vitest check; no reply carries more than decision 3's
  fields; no guess leaves the family's rows or reaches a log.
- One `attempts` row per guess and a `sessions` row per visit, as decision 3.
- The direct-write migration applied on test by the workflow, the five audit writes on the server, and a
  guardian's direct write refused on test.
- Brandon has used it on a real iPad as each invented child would.
- docs/04, docs/13, docs/08, CLAUDE.md and the README say how it is built; the board row is *on test*.
- The job closed with `/close`: the records committed by name, the branch pushed, the full report with its
  "couldn't check" lines first, the four-line read-back, `/cost`. Nothing on live, and nothing to `main`; the
  release and the week for Monday follow, each by Brandon's go.
