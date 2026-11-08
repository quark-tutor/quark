# Report: the tutor's lines made ahead (`docs/lines-ahead-slice.md`), from 7 November 2026

## Stop 1: the plan, with its numbers (7 Nov, 21:00 HST)

**Where it stands.** I have read the brief, the voice slice's report (*Slices for The tutor*, *Money*), the as-built
sections of docs/13 and docs/04, docs/08's decisions and bugs, and the code the brief names. Nothing is built or
changed, nothing is spent, and nothing on test or live is touched. Size clock: 0.1 hours on a job sized at 4.

**One thing for your hands before go.** This worktree has no `.env.local`. `claude --worktree` does not copy a
gitignored file, and the deny list (rightly) refuses me any command that names it. Without it nothing here can reach
test: not the dev server, `fixture` or `cron:speech`. Type this once. It copies the test file only, never
`.env.live.local`:

`! cp C:/Users/BrandonReisen/Documents/quark/.env.local C:/Users/BrandonReisen/Documents/quark/.claude/worktrees/lines-ahead/.env.local`

On go I commit the brief with its *Before the job* line saying this instead of "Nothing". I run `npm ci` myself.

### The numbers (an estimate; the count is the first thing done on go)

Reading live week 2's cards is a command against the live database, which needs a planned stop. Test can't be read
from this worktree until the file is in. So these figures come from the voice report's measurement of test's week
(22 Oct) and the card prompt's shape (two or three hints a card). On go, the first step counts test's newest week
the same way, and stop 2 carries the real figures.

| A day | |
|---|---|
| Cards | 20 passed per child, 40 in all (5 slots by 4 layers) |
| Lines per card | its read line (text then question), its question, 2 or 3 hints, its handoff: 5 or 6 |
| Lines | about 110 per child, about 220 in all |
| Characters | about 30,000 (25,000 to 35,000): read lines about 15,000 (about 380 each), the other lines about 15,000 |
| One night at list price | about $0.90 ($0.75 to $1.05) |
| A month | about 900,000 characters against Google's free 1,000,000. That fits a 30-day month. A 31-day month with a test run or two may go over by a few dollars at most ($30 a million beyond it) |
| The wall's own sentences | 10 lines, 248 characters, made once ever (most are stored already) |

The brief's "a few cents or nothing" for Sunday night's first firing is $0 inside the free tier, but about $0.90 at
list price.

**How long a firing takes.** Lines are made eight at a time, as the Sunday build's are. Google allows Chirp 3 voices
200 requests a minute per project, and test and live share one project, so the firing keeps to 150 a minute. At
that pace about 220 lines take about 90 seconds, perhaps 120 with the checks for lines already stored. That is
under the 240-second line. The firing stops starting new lines at 240 seconds, so it always writes its end row
inside the 300-second limit. Whatever it leaves, the first taps make, as they do today.

### The shape

- **`core/wall/speech-ahead.ts`** (pure, tested with a fake store): which lines a day's cards give, and the firing
  itself, shaped like `cronFiring()`. Each line goes through the same words `lineText()` uses for that part, then
  `forVoice()` and `speechPath()`. That way a line made ahead is the very file the tap plays.
- **Its database side, `lib/speech-ahead.ts`** (server only): the one family, its children and the audit rows. The
  day's cards and the bucket come from the wall's own store (`wallStore()` in `lib/wall.ts`).
  - **Which day:** today where the family lives.
  - **Which cards:** each child's passed cards of today in a live week, by the wall's own rule (`onWall()`,
    `chainOf()`). A layer that can never be reached (because one before it was held back) gives no lines, since
    `lineText()` can never say them.
- **`app/api/cron/speech/route.ts`:** a `GET` with `maxDuration = 300`, checked by `authorized()`. It answers 401
  with nothing read to anyone without the secret, 403 off Vercel unless `QUARK_TARGET` is `test`, and 200, or 500
  when the firing failed.
- **What it writes:**
  - Two `audit_log` rows, `speech.ahead`, one at the start and one at the end, with no guardian and no child. The
    end row has the day, lines made, lines already there, lines failed, lines left, characters, cost and seconds.
  - A `speech_runs` row for each line made, as a tap writes one.
  - The reply is the end row's numbers.
- **`vercel.json`:** a ninth entry, `/api/cron/speech` at `0 13 * * *` (3 am Hawaii; Hobby fires it between 3 and
  4).
- **`npm run cron:speech`:** the `cron:week` script with the route named, so the two stay one file.
- **`/parent/models`:** one line under the voice's totals: last night's firing, the day it was for, lines made and
  cost.
- **Tests:**
  - The lines a day gives: each part once each, and nothing from another child's card, a card held back, a week
    not live or a layer out of reach.
  - A line made ahead is the file the tap plays, and the tap makes no second call to the voice.
  - **Rule 3:** a hint and the handoff made ahead are still refused (the say route's 404) until the hint is earned
    and the handoff reached.
  - The firing's refusals, its audit rows (no nickname in them) and its time budget.
  - The wiring test: nothing on the kid path imports the firing.
  - `vercel.json`'s nine entries, and the new route's 300 seconds.

**The busy button.** From the tap until the audio starts playing, "Read it to me" says **"Getting it ready…"**.
That was the voice report's proposal: effort words, no "wait", nothing about the child. A screen reader hears that
the button is busy. A second tap stops it, as now, and it says "Stop" while the voice plays.

**The two adjacent bug lines, fixed in this job** (both are in files the brief already has open):
- **A recording and "Read it to me" playing at once:** the player joins the "one thing at a time" signal that "Read
  it to me" already uses, so starting either one stops the other (`app/kid/player.tsx`, `app/kid/read-aloud.tsx`).
- **The say route's silent 502:** it logs one line, "say: Read it to me failed" and the error's message alone, as
  the hear route has since your word of 28 Oct. *Touches rule 7*, in the same way: never the line's words, never
  the child.

### Decided here (go takes them)

- The count is taken from test, not live.
- The pace (150 calls a minute) and the 240-second budget, as above.
- The look uses a day of test's newest week before week 3, moved to today with `fixture -- today`. That leaves the
  week 3 job's copy of week 3 on test alone. Stop 2 names the card and how the laptop's browser is paired as test's
  child.

### Stops, spend, branch, board

- **Stops.** This one, and stop 2, your look on the laptop: a check of direction, with its two checks in exact words
  in the brief. Nothing in this job touches the live database, spends money past the $25 line, reaches a real person
  or reaches a child. The new cron entry and the busy button reach the boys only with Sunday's release, which has its
  own stop.
- **Spend.** One firing on test, about 30,000 characters (about $0.90 at list price, inside the free tier). A second
  firing to time a night with nothing new to make costs $0.
- **Branch.** The checkout is `worktree-lines-ahead`, which `claude --worktree` made from `main` (`1f2dc5c`). The
  brief names `lines-ahead`. On go, the first thing is `git switch -c lines-ahead phase-4-wonder-wall`, at
  `c6d9e38`, the same commit as origin's, so the pull has nothing to take. Then `npm ci`. Pushing `lines-ahead`
  starts no workflow (the migrations workflow runs only for `phase-*` and `main`), and the job has no migration.
- **The board** (`docs/board.md` on `phase-4-wonder-wall`).
  - This row, "The tutor's lines made ahead", is at *next* and is the top row of Next.
  - Two rows are already in hand: "Weeks 2 and 3 on live" (*building*; the week 3 job is at its stop 3) and the
    judge (*on test*, waiting on check 6, timed on live). Go takes this job beside them, so three are in hand.
  - On go the row moves to *building* at the top, dated 7 Nov 2026, with `docs/lines-ahead-slice.md` first in Where.
    That is the first commit, together with this report and the brief, which is not yet committed and is copied in
    from the main checkout. The board page is skipped, since this is a side worktree.
- **At the close.** Merging into `phase-4-wonder-wall` will meet the week 3 job's changes to the records (the board,
  CLAUDE.md's Where we are, the README, docs/08). Those four files may need merging by hand; the code does not
  overlap.

**Found, for you (not this job).** Every `claude --worktree` session will start without `.env.local`. If I have
Claude Code right, a `.worktreeinclude` file at the repository root naming `.env.local` (and not `.env.live.local`)
copies the test file into each new worktree. Check that before it becomes a tooling row on your word.

Copy the file with the command above, then reply go to take all of these.

**Go (7 Nov, 21:03 HST).** Brandon copied the test env file into the worktree with one `!` command, then typed
"go". `lines-ahead` was made from `phase-4-wonder-wall` at `c6d9e38`; it had no origin branch, so there was
nothing to pull. The row moved to *building*.

## Stop 2: Your look, on the laptop (7 Nov, 21:20 HST)

**Where it stands.** Built, and proven on `quark-test` through the dev server. Nothing on live, nothing a child
sees: the new cron entry and the busy button reach the boys only with Sunday's release. The tests (427) and the
typecheck pass, lint is clean on every file changed, and `npm run build` is clean, with the new route at 300 seconds
in the build's function settings. Pushed: `lines-ahead`. It has no migration, so no workflow ran. Size clock: 0.4
hours on a job sized at 4.

### The numbers, measured

Test holds one week, the proof week from 21 Oct (it has no week 2 or 3), counted with the firing's own code
(`fixture -- lines 1`):

| Day on test | Passed cards | Lines (files) | Characters | At list price |
|---|---|---|---|---|
| 21 Oct | 38 | 201 | 32,877 | $0.99 |
| 22 Oct | 38 | 200 | 32,103 | $0.96 |
| 23 Oct | 37 | 182 | 29,969 | $0.90 |
| 24 Oct | 39 | 204 | 32,822 | $0.98 |
| 26 Oct | 40 | 213 | 33,989 | $1.02 |
| 27 Oct | 34 | 131 | 20,116 | $0.60 |
| 1 Nov | 40 | 210 | 35,848 | $1.08 |

- **A day on average:** 192 lines, 31,100 characters, $0.93 at list price.
- **A day with all 40 cards passed:** about 210 lines and 34,000 to 36,000 characters, about $1.05.
- **The read lines** are about 470 characters each (the longest line is 722), more than stop 1's estimate of 380.
- **Repeats:** about 15 lines a day are the same for both children and are made once.
- **A month:** about 930,000 characters at the average. A month of full days runs a little past Google's free
  million, by a dollar or two at list price. Stop 1's estimate stands: inside the free tier or near it, a few
  dollars at most.

### The firing on test

The day of 26 Oct (40 passed, never answered) was moved to today with `fixture -- today 2026-10-26`. Its week was
already live on test. Before the firing, none of its lines were stored. `npm run cron:speech` against the dev
server replied:

```
HTTP 200 after 88s
{
  "outcome": "made",
  "day": "2026-11-07",
  "lines": 223,
  "made": 223,
  "already": 0,
  "failed": 0,
  "left": 0,
  "characters": 34237,
  "cost": 1.0271,
  "seconds": 87.2
}
```

- 223 lines: 213 for the two children's 40 cards and the wall's 10 sentences. They took 87 seconds, under the
  240-second line, at about 150 a minute, which was the pace limit at work.
- A second firing replied `nothing` in 5 seconds, with "every line of 2026-11-07 is stored already". That is what a
  night costs with nothing new: no call to Google.
- The audit log holds two rows a firing (`speech.ahead`, started and ended), with the day, the counts, the cost and
  the seconds. No child is named.

### Checked with curl, as a paired test device (paired with `fixture -- device 1`, forgotten after)

- On the look's card, the read line and the question redirected to the stored audio in 0.9 to 1.6 seconds, and the
  audio came back in 0.7 seconds (141,504 bytes).
- `hint.0`, `hint.1` and the handoff answered 404, though all three are stored: rule 3 holds on the route itself.
- `/api/cron/speech` without the secret answered 401.

### What was built

- **The firing** (`core/wall/speech-ahead.ts`, pure, 12 tests), as planned at stop 1. Its database side is in
  `lib/speech-ahead.ts`, the route is `app/api/cron/speech/route.ts`, and `vercel.json` has a ninth entry,
  `0 13 * * *`.
- **One source of words.** `core/wall/speech.ts` gains `partWords()`, `voiceText()` and `makeSpeech()`. The tap
  (`spokenUrl()`) and the firing take a line's words, its voice text and its path from the same three functions.
  The tap still checks a stored line with a single signing call.
- **The rule-3 test** is at the function the say route calls: a hint and the handoff made ahead give `null` (the
  route's 404) until earned and reached, and are then served with no call to the voice. curl checked the route
  itself, above.
- **"Read it to me"** says "Getting it ready…" from the tap until the audio's `playing` event, then "Stop".
  A screen reader hears it as busy. A tap while it is getting ready or playing stops it.
- **The two bug lines** from docs/08:
  - The recording and "Read it to me" share one "one sound at a time" signal (`app/kid/one-at-a-time.ts`), so
    starting either stops the other.
  - The say route logs one line on a failure, "say: Read it to me failed" and the error's first line. *This touches
    rule 7.* Anything the error quotes is taken out, because Google can quote the words it was sent and a card's
    words can hold a nickname. That is one step stricter than the hear route's line.
- **`/parent/models`** has one line under the voice's totals: when the last firing ran, how many lines it made for
  which day, how many were stored already, and the cost. The page's sentence on the voice now says lines are made
  overnight, or else on the first tap.
- **For testing:**
  - `npm run cron:speech` (the cron script is now `scripts/cron.mts`, with the route as an option, and `cron:week`
    is unchanged).
  - `fixture -- lines <week>` gives the counts above. `fixture -- lines <date>` lists each card on the wall that
    day, with its id and how many of its lines are stored.
  - `fixture -- code <n>` makes a pairing code, so the laptop's browser can be paired as a test child without
    signing in.

### Spend

Google: 34,237 characters on test ($1.03 at list price, inside the free tier). Anthropic: $0. Live: nothing.

### Test's state after this

- Test's cards of 26 Oct are now dated 7 Nov, and every line of them is stored.
- Two devices were paired and forgotten.
- Four `speech.ahead` audit rows.
- The dev server is running on localhost:3000 (test).

### Your look

**Before the checks:** pair the laptop's browser as test's child 1.
1. In this terminal, type `! npm run fixture -- code 1`.
2. Open `http://localhost:3000/kid/pair` in the laptop's browser and type the six digits within ten minutes.
3. The wall greets the child.

The card is on the wall only on 7 Nov. **If you look after midnight**, first type
`! npm run fixture -- today 2026-11-07`. That moves the same cards to the new day, and their lines stay stored.

**Check 1, the busy words and a quick start**
- **Where:** `http://localhost:3000/kid/card/d849fc09-c782-4380-885c-3efa1aaf437d` ("A Head Made of Harvest", look,
  layer 1), a card whose lines the firing made.
- **Do:** 1. Tap "Read it to me". 2. Look at the button from the tap until the voice starts.
- **See:** the button says "Getting it ready…", then "Stop" once the voice starts, about a second after the tap,
  not four to five.
- Pass □ Fail □ — if fail, what you saw.

**Check 2, a line made ahead is still said only once earned**
- **Where:** the same card, with no guess given.
- **Do:** 1. In the browser's address bar, open
  `http://localhost:3000/api/kid/say?line=d849fc09-c782-4380-885c-3efa1aaf437d.hint.0`.
- **See:** a 404 page showing `{"ok":false}`, and nothing plays.
- Pass □ Fail □ — if fail, what you saw.

**Check 3, one sound at a time** (one of the two bug lines, not in the brief's look)
- **Where:** `http://localhost:3000/kid/card/c4159028-db5b-4f2b-85cb-c0d61ff47ffd` ("Who Starts First?", listen,
  layer 1), which has a recording.
- **Do:** 1. Tap "Play". 2. While the recording plays, tap "Read it to me".
- **See:** the recording stops when the voice starts, and the two are never heard together.
- Pass □ Fail □ — if fail, what you saw.

At the last stop, type `/wwc:close` to close and hold. Typed clean, it is your go for the look; name a failure
without it.

Brandon (8 Nov, 06:28 HST): "Checks 1 and 2 pass. Check 3 fails on purpose: the recording stopping when "Read it
to me" starts breaks what the boys love most, listening to the music while Quark reads to them. Take that change
out: a recording and the tutor's voice may play together, by design. Keep "one line at a time" for the voice
itself. Delete the 26 Oct bug line in docs/08 and record this as a decision (Brandon, 8 Nov 2026)."

And, in the same round: "One more for the same fix round: leaving the card stops every sound on it. I've seen the
boys go to a completely different screen with the Listen recording still playing. Record it with the other
decision (Brandon, 8 Nov 2026), and give the look a check for it."

## Stop 2 again: Your look, fix round 1 (8 Nov, 06:40 HST)

Both changes are made on `lines-ahead`. Checks 1 and 2 passed and are not repeated. Check 3 is rewritten, and check
4 is new. The tests (429, two new), the typecheck, the lint of the kid view and the production build pass. Nothing
touched live. Size clock: about 0.6 hours on a job sized at 4.

### What changed

- **A recording and the voice play together.** `app/kid/player.tsx` is back to playing on its own: starting "Read
  it to me" never stops it, and it never stops the voice. **One line at a time** stays for the voice: starting any
  "Read it to me" on the page (the card's, a clue's, the handoff's) stops another line the tutor is saying
  (`app/kid/one-at-a-time.ts`, now used only by `app/kid/read-aloud.tsx`). A test holds that the player takes no
  part.
- **Leaving a card stops every sound on it.** The cause of what you saw: Next.js 16 does not unmount a page you
  leave. It hides it with React's `<Activity>` (to keep its state for the back button), so the card's `<audio>`
  stays in the page and plays on behind the next screen. Both players now pause as the page is hidden
  (`app/kid/stops-on-leave.ts`, a layout-effect cleanup, as Next's guide to preserved pages says). A test holds
  that every `<audio>` on the kid view uses it. **What follows:** "Go deeper" opens the next card, so it also stops a
  recording that is playing. *Live has the same cause today:* the boys' iPads run `main`, which has none of this,
  until Sunday's release carries it.
- **docs/08:** the 26 Oct bug line about the recording and the voice is deleted. Both decisions are recorded under
  a new heading, "The tutor's lines made ahead", which the close fills with the job's other decisions. The say
  route's bug line is fixed in this job, and the close removes it with the records.

### Your look

The laptop's browser is still paired as test's child 1, and the cards from 7 Nov are on today's wall. If the wall
asks to pair, type `! npm run fixture -- code 1` and enter the digits at `http://localhost:3000/kid/pair`.

**Check 3, the music under the voice, and one line at a time**
- **Where:** `http://localhost:3000/kid/card/c4159028-db5b-4f2b-85cb-c0d61ff47ffd` ("Who Starts First?", listen,
  layer 1), which has a recording. Reload the page first, so it has the new code.
- **Do:** 1. Tap "Play". 2. While the recording plays, tap "Read it to me". 3. Type `a new tune` in the box and tap
  "That's my answer". A clue appears with its own small "Read it to me". 4. Tap the big "Read it to me" under the
  card's words, and while it reads, tap the clue's small one.
- **See:** at step 2, the recording plays on under the voice. At step 4, the card's line stops as the clue's line
  starts, and the recording plays on through both.
- Pass □ Fail □ — if fail, what you saw.

Step 3 writes one attempt on test and asks the judge once (about $0.0002 on test).

**Check 4, leaving the card stops every sound on it**
- **Where:** the same card.
- **Do:** 1. Tap "Play". 2. Tap "Read it to me". 3. While both play, tap "Back to the wall" at the top.
- **See:** the wall, in silence. Both the recording and the voice stop as you leave.
- Pass □ Fail □ — if fail, what you saw.

At the last stop, type `/wwc:close` to close and hold. Typed clean, it is your go for the look; name a failure
without it.
