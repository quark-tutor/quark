# Report: the tutor's lines made ahead (`docs/lines-ahead-slice.md`), 7 and 8 November 2026

Phase 4, the tutor's slice 3, in the worktree branch `lines-ahead` made from `phase-4-wonder-wall` (`c6d9e38`),
merged into it at the close. Closed and held: `/wwc:close` at *Your look*, 8 Nov, 06:52 HST. Nothing on live; it
reaches Vercel and the boys with Sunday 8 Nov's release, which carries it with week 3. Size clock: about 0.8 hours on
a job sized at 4.

## What could not be checked

- **Anything on Vercel.** The ninth cron entry, the route on Vercel and the first firing against live come only with
  Sunday's release. The brief's *After the release* has the first firing as Brandon's hands, Sunday night, with the
  `curl` line on `/api/cron/speech`. Monday's first "Read it to me" on a boy's iPad is the proof, seen in use.
- **An iPad.** The job used no iPad (the device-test rule of 22 Oct). The busy words, the voice's one line at a time,
  the music under the voice and leaving a card were seen in the laptop's browser on the dev server only. The leaving
  fix rests on Next.js's own behaviour, which is the same on iPad Safari, but it was not seen there.
- **Live's numbers.** The counts come from test's proof week (21 Oct, card v5 and v6 shapes). Live's weeks may run
  a little longer or shorter. The first night on live replies with its own count, and `/parent/models` shows it.
- **Test and live firing together.** They share one Google project and its 200 requests a minute. Each firing keeps
  to 150 a minute, and the two never run at the same hour unless a firing is run by hand at 3 am. Not tried.
- **The say route's log line on Vercel.** Its shape is held by a test. No real failure was seen.

## The look

**`/wwc:close` at *Your look*, 8 Nov, 06:52 HST: every check passed**, after one fix round.

- **First look (7 and 8 Nov).** Brandon moved the cards to the new day after midnight with
  `fixture -- today 2026-11-07`. Brandon, 06:28: "Checks 1 and 2 pass. Check 3 fails on purpose: the recording
  stopping when "Read it to me" starts breaks what the boys love most, listening to the music while Quark reads to
  them. Take that change out: a recording and the tutor's voice may play together, by design. Keep "one line at a
  time" for the voice itself. Delete the 26 Oct bug line in docs/08 and record this as a decision (Brandon, 8 Nov
  2026)." And, in the same round: "One more for the same fix round: leaving the card stops every sound on it. I've
  seen the boys go to a completely different screen with the Listen recording still playing. Record it with the other
  decision (Brandon, 8 Nov 2026), and give the look a check for it."
- **Fix round 1 (`88f8edc`).**
  - The recording's player went back to playing on its own.
  - The voice keeps one line at a time.
  - Both players pause when their card is left. The cause of what Brandon saw: Next.js 16 does not unmount a page
    you leave. It hides it with React's `<Activity>`, so its `<audio>` stays in the document and plays on behind the
    next screen.
  - Two tests hold these. The decisions are in docs/08 and the bug line is deleted.
- **The checks, as given:**
  1. The busy words and a quick start: "Getting it ready…", then "Stop", the voice in about a second. **Passed.**
  2. A hint made ahead is refused until earned: `/api/kid/say?line=<card>.hint.0` gives 404, and nothing plays.
     **Passed.**
  3. *First look:* the recording stops when the voice starts. **Failed, on purpose:** the behaviour was wrong.
     *Fix round 1:* the recording plays on under the voice, and the card's line stops as a clue's line starts.
     **Passed.**
  4. *Fix round 1, new:* "Back to the wall" with the recording and the voice playing leaves the wall in silence.
     **Passed.**

## What was done

- **The night's firing.**
  - `core/wall/speech-ahead.ts` (pure, 12 tests) does the work: `dayLines()` walks each child's cards of today in
    the live week by the wall's own rule (`chainOf()`). It makes each part's line through `partWords()`, `voiceText()`
    and `speechPath()`, the same functions the tap uses, so a line made ahead is the very file a tap plays.
    `nightLines()` puts the wall's sentences first, then the read lines of layer 1, then the rest, layer by layer.
  - `aheadFiring()` runs it. Lines are made 8 at a time and at most 150 a minute; a line already stored is skipped.
    No new line starts after 240 seconds or after three failures. It writes two `audit_log` rows (`speech.ahead`,
    naming no child) and a `speech_runs` row per line made.
  - The database side is `lib/speech-ahead.ts` (server only). The route is `app/api/cron/speech/route.ts`
    (`maxDuration` 300, `authorized()`'s 401, 403 off Vercel unless test). `vercel.json` has the ninth entry,
    `0 13 * * *`.
- **Rule 3 by construction.** Making a line stores a file and says nothing. Saying it is still `lineText()` on the
  paired child's tap. A test proves it at the function the say route calls: a hint and the handoff made ahead are
  `null` (404) until earned and reached, then served with no call to Google. curl proved it on the route itself.
- **"Read it to me"** says "Getting it ready…" from the tap until the audio's `playing` event, then "Stop", and a
  screen reader hears it as busy.
  - The voice says one line at a time (`app/kid/one-at-a-time.ts`, used only by "Read it to me").
  - A card's recording plays on under it.
  - Leaving a card stops both (`app/kid/stops-on-leave.ts`).
- **The say route** logs one line on a failure: "say: Read it to me failed" and the error's first line, with anything
  it quotes taken out. *This touches rule 7*: Google can quote the words it was sent, and a card's words can hold a
  nickname.
- **`/parent/models`** shows the last firing in one line: when it ran, for which day, lines made, already stored, and
  the cost. Its sentence on the voice now says lines are made overnight, or else on the first tap.
- **For testing:**
  - `npm run cron:speech` (`scripts/cron.mts`, with `cron:week` unchanged).
  - `fixture -- lines <week|date>`: a week's counts, or which of a day's lines are stored.
  - `fixture -- code <n>`: a pairing code for test's child n.
- **The records:**
  - docs/13: "Lines made ahead", the say route's line, and the busy and sound rules.
  - docs/04: "The second cron" under *How the Sunday build is built*, and the Wonder Wall's read-aloud line.
  - docs/08: a new section, "The tutor's lines made ahead". Both 26 Oct bug lines are deleted: the say route's as
    fixed, the recording's as decided against.
  - CLAUDE.md: *Where we are* and the stack's voice line.
  - The README status, and the board (below).

## The numbers, measured on test

Test's proof week, counted with the firing's own code:

| Day on test | Passed cards | Lines (files) | Characters | At list price |
|---|---|---|---|---|
| 21 Oct | 38 | 201 | 32,877 | $0.99 |
| 22 Oct | 38 | 200 | 32,103 | $0.96 |
| 23 Oct | 37 | 182 | 29,969 | $0.90 |
| 24 Oct | 39 | 204 | 32,822 | $0.98 |
| 26 Oct | 40 | 213 | 33,989 | $1.02 |
| 27 Oct | 34 | 131 | 20,116 | $0.60 |
| 1 Nov | 40 | 210 | 35,848 | $1.08 |

- **An average day** is 192 lines and 31,100 characters, $0.93 at list price. A day with all 40 cards passed is about
  210 lines and 34,000 to 36,000 characters.
- **The read lines** are about 470 characters each.
- **A month** comes to about 930,000 characters against Google's free million. A month of full days is a dollar or
  two over at list price.

**The firing**, against the dev server on test, on the 40 cards of 26 Oct moved to 7 Nov:

```
HTTP 200 after 88s
{ "outcome": "made", "day": "2026-11-07", "lines": 223, "made": 223, "already": 0, "failed": 0,
  "left": 0, "characters": 34237, "cost": 1.0271, "seconds": 87.2 }
```

- That's 223 lines (213 for the 40 cards, plus the wall's 10 sentences) in 87 seconds, under the 240-second line.
- A second firing replied `nothing` in 5 seconds, with no call to Google.
- **curl, as a paired test device:**
  - The read line redirected to its stored audio in 0.9 to 1.6 seconds.
  - `hint.0`, `hint.1` and the handoff gave 404 though stored.
  - The cron route without the secret gave 401.
- **On the new day:** after `fixture -- today` moved the cards to 8 Nov, all 6 of each look card's lines were still
  stored, because a line is stored by its words, not its day.

## Beyond the brief

- **Leaving a card stops every sound on it**, from Brandon's fix round. Live has this bug today: a recording plays
  on behind the wall on the boys' iPads until Sunday's release carries the fix.
- **The two adjacent bug lines** in docs/08:
  - The say route's is fixed.
  - The recording's became the opposite decision: the music plays on under the voice.
- **`fixture -- lines` and `fixture -- code`**, for counting a week's lines and pairing a laptop's browser.
- **The board:** eight *live* rows moved more than 14 days ago, none a slice of a project still open, were deleted
  under the board's rule: Next.js 16.4.2, Quark's board run as GTD, the Sunday cron and Looks-good page, Curation
  engine v1, the policy gate, the test Supabase project, Working with Claude slice 5, and the ask-list rewrite.
- **Found, for Brandon (not a row):** every `claude --worktree` session starts without `.env.local`. If I have
  Claude Code right, a `.worktreeinclude` file at the repository root naming `.env.local` (and not
  `.env.live.local`) would copy the test file into each new worktree. It becomes a tooling row only on your word.

## On live

Nothing. No live command was run, no migration was written, and nothing reached a child. The cron entry, the busy
button and the sound fixes reach the boys with Sunday's release.

## Money

- **Google:** 34,237 characters on test, $1.03 at list price, inside the free tier, so $0 billed. The second firing
  and the curl checks made no new lines.
- **Anthropic:** check 3's guess asked the judge once on test, about $0.0002.
- **Live:** $0.
- **Cost:** not read.

## Not done

- **The first firing on Vercel** is not a check of this job. It is the release's step, written in the brief's *After
  the release* for the week 3 close and the release: Brandon's hands, Sunday night after the tap. After that the cron
  runs every night with nothing for anyone to do.
- Every check in the brief was taken at *Your look*. None is left.

## The merge into `phase-4-wonder-wall`

- **At the close:** `lines-ahead` was pushed to `origin/phase-4-wonder-wall` as a fast-forward from `c6d9e38`, and
  `lines-ahead` itself was pushed.
- **For the week 3 job in the main checkout:**
  - Its local `phase-4-wonder-wall` is now behind `origin`. Its close pulls first, as every close does.
  - **First delete the main checkout's untracked `docs/lines-ahead-slice.md`.** It is the chat's first draft. The
    committed copy has the rewritten *Before the job*, and git refuses a pull that would overwrite an untracked file.
  - Four record files may need merging by hand: the board (this row sits just above week 3's), CLAUDE.md's *Where
    we are* (its 8 Nov lead says the week 3 close replaces the 1 Nov parts), the README status, and docs/08.
- **Test's state:**
  - Test's cards of 26 Oct are now dated 8 Nov, their week is live, and every line of them is stored.
  - The laptop's browser is paired as test's child 1.
  - There is one answer on "Who Starts First?" from check 3, and four `speech.ahead` audit rows.
  - The dev server was stopped at the close.

## Commits

See the commit list printed with this report at the close: `5e88ab7` (the brief, stop 1, go, the row to
building), `5eca520` (the build), `be840ca` (stop 2), `88f8edc` (fix round 1), and the close's own commit.
