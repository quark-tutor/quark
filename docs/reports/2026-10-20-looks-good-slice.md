# Report: the Sunday cron and the Looks-good page, phase 3 step 6 (`docs/looks-good-slice.md`), 20 October 2026

Sonnet 5.5 at xhigh effort (the brief asks for `opusplan`; the session was not switched to it). Branch `phase-3-curation`, pushed.
Nothing to `main`. Nothing on live. No migration. The job was Brandon's `/wwc:job docs/looks-good-slice.md` of 20 October,
with three stops (the write-back and its review, a day over 240 seconds, the tap) and this close. The stop sections that
stood in this file are replaced by this report; their text is in the history (`e12811c`, `a2dcfc1`, `b4938bf`, `8bcc176`).

## What could not be checked (first, because these matter most)

- **A day with pictures through the route.** `content:fetch` has never run on `quark-test`, so every card on the proof
  week said "No approved picture for this topic yet". The timings, the cost and the gate's reading below are of text-only
  cards. A day with pictures adds the offered items to the idea prompt and can send a chain back once for a missing first
  picture, one more call in parallel; my estimate, not measured, is a day of about 160 seconds, under the 240 line. The
  first Sunday on live is the first day with pictures through the route. A board row (content:fetch on test) is added.
- **Anything on Vercel.** The eight cron entries, `CRON_SECRET`, the API key and the three model names in production, the
  Hobby plan and its 300-second cap (from Brandon's notes and the brief's reading of Vercel's documentation, which I
  re-read for the cron pages), and a firing stopped by the cap. `next build` accepts `maxDuration = 300` beside
  `cacheComponents` and carries it into `functions-config-manifest.json`; that is as far as it goes here. Whether the
  prompt files load on Vercel (`outputFileTracingIncludes` covers every route) has never run there.
- **A rate limit in practice.** None occurred in the two days built on the new concurrency (ten card calls and eight gate
  calls in flight). The failure mode is recorded and held by tests and the design, not seen.
- **The exact sequence Brandon saw after the tap** (a second tab after the week went live) was not re-run, because that
  needs another tap that makes the week live. The fix for it, `e7c0a51`, was checked on the same refusal path with a
  pending card, in the browser: the stale tab pressed Looks good, the server refused, the page redrew with the button
  disabled and the reason listed once.
- **A screenshot of the week page.** It timed out at 30 seconds in the browser I drive (the page holds 280 cards), so the
  page was read from its text and structure, not seen. Brandon saw it himself at the tap.
- **Live week 1's start date**, not read (it is a live read). If it has passed, the week stays in review and no firing
  touches it.

## What was done

Built and proven on `quark-test`. 311 tests pass (230 at the start), the typecheck is clean, `next build` is clean, and
no migration changed, so the migrations workflow did not run: `gh run list --workflow migrations.yml --branch
phase-3-curation` still shows the two runs of 20 Oct (09:28Z, 20:05Z), both successes; the job watched none.

**The commits** (all on `phase-3-curation`):

| Commit | What |
|---|---|
| `a398d77` | One copy of the wiring: `core/curation/week-job.ts` and `gate-run.ts`, a per-run meter and `meteredComplete`, `pendingOnly` in `runGate`; `week:build` and `gate` on them |
| `788ffb9` | `buildWeek`'s one-day mode, `deleteDay`, `week:build --day`, and the out-of-order lenses-and-doors test |
| `5a4c84b` | `cron.ts`, `cron-job.ts`, the route, `vercel.json`, `.env.example`, `cron:week`, `fixture`, the models-page line |
| `0477511` | The Looks-good tap and take-back, the week page, the `/parent` lines |
| `634aa46` | Both children's cards at once, five calls a child, the gate eight at a time (stop 2's decision) |
| `e7c0a51` | A refused tap redraws the page (found at the tap) |
| `e12811c`, `a2dcfc1`, `b4938bf`, `8bcc176` | The stop reports; `c3465fe` the board row to *building* |

**The route and the build** (docs/04, "How the Sunday build is built"). One route, `/api/cron/week`, `GET`, `maxDuration
300`, called eight times on Sunday, Hawaii time, 6 am to 8 pm (`vercel.json`; the week is ready by 7 pm and the 8 pm
firing is a spare). It checks the secret by hash (401, nothing read or written), refuses off Vercel unless the target is
test, then builds the next unbuilt day of next week into the theme (`buildWeek`'s one-day mode), checks the cards still
pending, and records the firing in `audit_log` (`week.cron`, no guardian, no child named) and, when it spent, in
`model_runs`. It refuses before spending for: another firing on the day, a week already built, a model name or the key
missing, a library that cannot fill the week, a gate that cannot run. A day is complete only on exact counts, so a day that
is short or was written twice is cleared and built again; a live theme is never touched.

**The tap** (docs/04, "How a week goes live"). On `/parent/week/[theme]`, any one guardian presses Looks good. The server
reads everything again and refuses for a week not in review, with fewer than seven days, with a card pending, with a
verdict under a rulebook other than the one the guardians' answers make now, or under an older safety floor. The status
moves only from `review`, an audit row records who and when (and the status goes back if it cannot be written), and a
live week can be taken back until Monday midnight in Hawaii. `/parent` says which week is ready and what Sunday did;
`/parent/models` says whether the build is set up.

**Proved on test** (all by running it, nothing live):

- 3.1: the tests, typecheck and `next build` above. 3.2: pushed; the workflow did not run.
- 3.4: no secret and a wrong one give 401 with nothing written; a firing with a week built by hand is refused at no cost,
  with its two audit rows; `week:build -- --week 2 --plan` shows the library's refusal ("the look card needs 6 and 0 are
  left; …"); after the week was built a firing says "all seven days of week 1 are built" in 2 seconds for $0.
- 3.5, the whole week through the route: test's week 1 deleted (`fixture`), `plan:import` on test undid step 5's reorder,
  then the seven days below. On day 3 two firings at once: one built it, the other answered "another firing is working on
  day 3 of week 1" in 1.3 seconds.
- 3.3 on the whole week, in Chrome as the test guardian: (a) a card set back to pending behind an open page, the stale
  button pressed, **refused by the server** ("1 card isn't checked yet…"), nothing written, the card checked again for
  $0.03; (b) a block on subject 14 (the merge ignores one guardian's answer on this copy, so a block is what changes the
  rulebook), the page counting 278 cards on an older rulebook and disabling the button, then 278 cards re-checked in 179
  seconds for $6.91 (269 passed, 9 held back by the checker), then the button enabled. (c) was Brandon's: he pressed Looks
  good; the audit log has `theme.live` at 03:03 UTC (269 passed, 11 held back, floor 1) and `theme.review` at 03:04.
- 3.6: `/parent` read "Week 1 is ready for you to read" and "Sunday's build: week 1, 7 of 7 days, ready at 4:37 pm,
  $12.64."; `/parent/models` read "The Sunday build: set up" and an estimate of about $13 a week.

**The per-day table** (the whole of test's week 1 through the route; also in docs/04):

| Day | Seconds | Cost | Calls (ideas, cards, gate) | Concurrency |
|---|---|---|---|---|
| 1 | 209.4 | $1.7072 | 5, 10, 40 | old |
| 2 | 237.0 | $1.8584 | 5, 13, 40 | old |
| 3 | 198.6 | $1.7064 | 5, 10, 40 | old |
| 4 | 206.2 | $1.7947 | 5, 12, 40 | old |
| 5 | 268.5 | $1.8757 | 5, 12, 39 | old (the stop) |
| 6 | 131.4 | $1.8534 | 5, 13, 39 | new |
| 7 | 125.2 | $1.8419 | 5, 11, 40 | new |

Old: a child's cards after the other's, four at a time, the gate four at a time. New: both children at once, five calls a
child, the gate eight at a time. The days did not follow their call counts, so the model's latency moves them. **The rule
(Brandon): under 240 seconds is fine; over 240 is the Pro conversation.** A rate limit fails a day, which the next firing
clears and rebuilds.

**Money, test only:** the route's seven days $12.64; two script runs of day 2 $3.52; the gate re-checks $0.03, $6.91 and
$0.03 (the last after the redraw check). About $23.13 in all, each run under the $25 line. Nothing was spent on live.

## Beyond the brief

- **`fixture`** (test only, no live twin, cannot pass a card): `show`, `unpass`, `delete-week`, `audit`, `runs`. The brief
  had no way to set test's state; Brandon approved it in the review.
- **The tap refuses a week with fewer than seven days.** Added in the build; it moved 3.3 (a) and (b) to the whole week.
  Brandon: "All four decisions you took stand."
- **The stale-tab fix** (`e7c0a51`), at Brandon's "your call": a one-line-per-refusal fix instead of a bugs line.
- **The off-Vercel target guard** on the route and the **nickname scrub** on every failure text.
- **A mistake of mine:** to see the script refuse, I ran `week:build -- --week 1 --day 2` on test thinking day 2
  existed. Test's week 1 held only day 1, so it built day 2: $1.75, test only, under the line. I look at the state before
  a run that spends now. It is why a day added to a theme puts it back to `generating`.
- **A bugs line** for the raw reading level in the week page's heading (docs/08), pre-existing, Brandon's.
- **Board rows added** for what the job left: unique indexes (waiting: before a real week 2 on live); content:fetch on the
  test copy; the lens plan kept from day 1; a check-again button; a firing stopped at the cap recording what it spent.
  The direct-write row now covers `audit_log` inserts.
- **For the wwc job skill:** step 1 was printed in the chat before it was written to this file, the same bug as the docs/08
  line of 20 Oct (a second sighting). From the second stop on the file came first.

## What is on live

Nothing. No live command was run, no `.env.live.local` was read, no migration was written or pushed, nothing was set on
Vercel, and nothing went to `main`. The code is on `phase-3-curation`, which is unreleased. Left on test: week 1 in
review, and a block on subject 14 (lifting it makes every verdict stale: about $7 and three minutes to check them
again).

## Still to do, and whose

- **Brandon, at the release or after:** `/wwc:release`; then on Vercel's production environment set `CRON_SECRET` (a
  different value from the test one), `ANTHROPIC_API_KEY` and the three model names, which starts the Sunday build. Its
  first Sunday builds week 2 and refuses for want of lessons, spending nothing: the library needs more short lessons first.
  June reads the safety floor and the twenty questions. Nobody makes a theme live on live until the direct-write row's
  migration is there.
- **Next in the build order:** phase 4, the Wonder Wall. Its rule, written in docs/04: the wall shows a card only when its
  theme is `live`, the card has `passed`, and its day is today.

## Cost

`/cost`, from Brandon's screen at the end of the close: **$21.61** for the session. API time 47m 55s, wall time 6h 28m 18s,
3,885 lines of code added and 1,173 removed. By model: `claude-sonnet-5-5` 18.2k input, 398.5k output, 104.4m cache read,
1.8m cache write, $21.61; `claude-haiku-5-5` (the read-back reader) 1.3k input, 299 output, $0.0003. That is Claude Code's
own spend, apart from the about $23.13 of Anthropic API spend on `quark-test` above (the curation and gate models).
