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
