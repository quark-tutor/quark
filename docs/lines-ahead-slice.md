# Brief: the tutor's lines made ahead

**Phase 4, the tutor's slice 3, in a worktree branch `lines-ahead` made from `phase-4-wonder-wall`** (the week 3 job
holds that branch at its stop 3 until Sunday evening; `claude --worktree`, as CLAUDE.md's *Stops* has it; skip the
board page). Drafted 7 November 2026 in the chat, 21:05. Board row: "The tutor's lines made ahead" (*next*, the top
row). Project: *The tutor*. **Status: ready.**

**Size:** a job.

## Why

Every line the tutor says is made by Google on its first tap and stored, so the first "Read it to me" on each card,
hint and handoff waits 4 to 5 seconds with nothing on the screen saying why, and a stored line still takes 1 to 1.6
seconds to start (`docs/reports/2026-10-22-tutor-voice.md`, *Slices for The tutor*). Two weeks of live use say the
boys use "Read it to me" on most cards. This job makes each day's lines overnight, so a first tap plays like a
second one, and makes the button say it is busy from the tap until the voice starts, which also covers the stored
line's delay. Nothing about what is said, or when a line may be said, changes.

## Stops

1. **After reading: the plan, with its numbers.** From live week 2's cards (the shape every week has: 20 passed
   cards a day per child, 5 slots by 4 layers), Code says: how many lines a day (read, question, each hint, handoff,
   per card, per child), how many characters, what one night costs at list price and against Google's free
   million characters a month (`SPEECH_PRICES`), and how long the firing takes with lines made eight at a time
   (the Sunday build's rule: under 240 seconds is fine). Then the shape: the route, its cron entry, what it writes,
   the test that proves rule 3 still holds, the busy button's words. Anything the records and this brief cannot
   settle, with its recommended answer; "go" takes them all.
2. **After the build, on test: Your look, on the laptop.** The dev server on test, the proof week's day as `fixture
   -- today` sets it, the night's firing run once by hand against the dev server (`npm run cron:speech`, the twin
   of `cron:week`), its reply pasted in the report. Brandon in the laptop's browser as the test child, on a card
   whose lines the firing made:
   - **Where:** a card page on `/kid`, the dev server, after the firing.
   - **Do:** 1. Tap "Read it to me". 2. Look at the button from the tap until the voice starts.
   - **See:** the button says the busy words (Code names them at stop 1) and the voice starts in about a second,
     not four to five.
   - Pass □ Fail □ — if fail, what you saw.
   And one more, on a card the firing could not have reached (a hint not yet earned):
   - **Where:** the same card, no wrong guess given yet.
   - **Do:** 1. Open the browser's address bar and request `/api/kid/say?line=<card id>.hint.0`.
   - **See:** 404, nothing plays: a line made ahead is still said only once earned.
   - Pass □ Fail □ — if fail, what you saw.
   Then `/wwc:close` (close and hold, merged into `phase-4-wonder-wall`; Sunday's release carries it with week 3).
   Either, typed clean, is the go for the look; a failure named without it is a fix round.

## Before the job (Brandon's hands)

The test env file in the worktree: `claude --worktree` does not copy a gitignored file, and the deny list refuses
Code any command naming it, so Brandon copies the main checkout's `.env.local` (test only, never `.env.live.local`)
into the worktree with one `!` command (done 7 Nov, at stop 1). `CRON_SECRET` is in Vercel's Production since
tonight, and the new cron entry rides the next Production deployment, which is Sunday's release.

## After the release (Sunday night, Brandon's hands; written here so the week 3 close and the release know it)

The first firing on Vercel: the same `read -rsp … curl` line as tonight's, with `/api/cron/speech` in place of
`/api/cron/week`, Sunday night after the tap. It makes Monday's lines for both boys (about a minute, a few cents or
nothing inside the free tier) and replies with the count. Monday's first "Read it to me" on a boy's iPad is the
proof, seen as the boys use it; nothing else to check.

## Read first

1. `docs/tutor-voice-slice.md` and `docs/reports/2026-10-22-tutor-voice.md` (*Slices for The tutor*, the proposal
   this brief takes up, and *Money*); docs/13, *How the tutor's voice and ears are built*; docs/08, *The tutor's
   voice, both ways*.
2. `core/wall/speech.ts` (`lineText()`, `spokenUrl()`, `speechPath()`, `forVoice()`, `readLine()`; the wall's own
   sentences in `SPOKEN_REPLIES`), `lib/wall.ts` (`sayLine()`, the store), `app/api/kid/say/route.ts`,
   `app/kid/read-aloud.tsx`, `core/wall/words.ts`, `core/speech.ts`, `core/prices.ts` (`SPEECH_PRICES`).
3. `app/api/cron/week/route.ts`, `lib/cron-auth.ts`, `core/curation/cron.ts` and `cron-job.ts` (the firing's shape:
   the secret, the audit rows, the lock, the meter), `vercel.json`, `scripts/cron-week.mts` (or wherever
   `cron:week` lives), docs/04, "How the Sunday build is built".
4. `core/wall/flow.ts` (`onWall()`, `today()`), `lib/kid-wiring.test.ts` (what the kid path may import and log),
   `core/wall/speech.test.ts`.
5. `docs/08-open-questions.md`, *Bugs*: the two "Read it to me" lines (a recording and the voice at once; the say
   route's silent 502). Adjacent to this brief; fix them in this job if they are where the hands already are, and
   list them in the report.

## Decided already (Brandon, 22 October to 7 November 2026; do not reopen)

- **Overnight, not Sunday** (the voice report's proposal, 23 Oct): one more Vercel cron, once a day at 3 am Hawaii
  (`0 13 * * *`; Hobby fires it between 3 and 4). Vercel's Hobby plan now allows 100 cron jobs a project, each once
  a day (checked 7 Nov 2026, `vercel.com/docs/cron-jobs/usage-and-pricing`), so the ninth entry deploys.
- **Which day:** the day beginning where the family lives when it fires: today in Hawaii, in the family's live
  week. Every passed card of that day, for every child. Not the week ahead: a card held back later, or a week
  taken back to review, would have spent on lines never said; a card passed late is caught the next night.
- **Which lines:** every line `lineText()` can ever give for a passed card: its read line (text then question, as
  `readLine()` makes it), its question, each hint, its handoff; and the wall's own sentences once (`SPOKEN_REPLIES`,
  stored by hash like any line, so made once ever). Made through the same `forVoice()` and `speechPath()`, so a
  line the firing made is the very file the first tap would have made, and a line the firing missed is still
  made on its first tap as today.
- **Rule 3 holds by construction.** Making a line ahead stores a file; saying it still goes through
  `lineText()` on the paired child's tap, which refuses a hint not yet earned and a handoff not yet reached. A test
  holds it: a hint made ahead is 404 from the say route until it is earned.
- **The firing is one of the Sunday build's kind:** the same `CRON_SECRET` check (`authorized()`), 401 with
  nothing read for anyone else, 403 off Vercel unless `QUARK_TARGET` is `test`; one `audit_log` row when it starts
  and one when it ends (`speech.ahead`: the day, lines made, lines already there, characters, cost, seconds; no
  child named); a `speech_runs` row per line made, as a tap writes today, so `/parent/models` counts it. Lines made
  eight at a time, inside `maxDuration`. A failure makes what it can, ends as `failed` with `faultText()`, and the
  first taps cover the rest. No lock is needed: a line made twice is the same file written twice.
- **The busy button:** from the tap until the audio element starts playing, "Read it to me" shows the busy words
  (`core/wall/words.ts`, effort words, Code proposes them at stop 1); a second tap still stops it. iPad Safari's
  rule stands: the audio starts inside the tap.
- **No migration.** `audit_log` and `speech_runs` carry it.
- **The device-test rule** (22 October): no iPad in this job; the look is the laptop's browser on the dev server.
  The Monday tap on a boy's iPad is the live proof, seen in use.
- **`npm run cron:speech`** fires the route once against the dev server on this laptop (test), as `cron:week` does.
- **`/parent`'s Sunday line is not touched.** `/parent/models` shows last night's firing in one line (lines made,
  cost) beside the voice's totals.

## The steps, in order

1. Read; the numbers from live week 2's cards for stop 1 (`fixture -- card`/`-- numbers` on test, or the live
   week's row counts, nothing spent). **Stop 1.**
2. The firing: `core/wall/speech-ahead.ts` (pure where it can be: which lines a day's cards give), its database side
   beside `cron-job.ts`'s pattern, `app/api/cron/speech/route.ts`, the `vercel.json` entry, `cron:speech`, the
   `/parent/models` line, the audit rows. Tests: the lines a day gives, the rule-3 test, the wiring test's lists
   (nothing on the kid path imports it), `vercel.json`'s nine entries.
3. The busy button in `read-aloud.tsx` and its words in `words.ts` (the effort-words test). The two adjacent bug
   lines if their fix is in these files.
4. `npm test`, `npm run typecheck`, `npm run build`; commit, push (no migration, so no workflow). Run `cron:speech`
   against the dev server on test; its reply into the report. **Stop 2, Your look.**
5. `/wwc:close`: docs/13 (*How the tutor's voice and ears are built*: a new bullet, the lines made ahead), docs/04
   ("How the Sunday build is built": the second cron named), docs/08 *Decided:*, `CLAUDE.md` *Where we are* (this
   job's branch and that Sunday's release carries it), the README status, the board (this row to *on hold*,
   waiting on the release, as the voice slice was), the report with the money; the merge into
   `phase-4-wonder-wall`.

## Not in this job

Hints as a conversation; the tutor's live answers; a different voice; making lines at the Sunday build or at the
tap; week 3 (its own job, at stop 3); the release (Sunday's, after week 3 closes; it carries both).

## Records to update at the end

`docs/13-architecture.md`, `docs/04-curation-engine.md`, `docs/08-open-questions.md`, `CLAUDE.md`, `README.md`,
`docs/board.md`, `vercel.json`, `package.json`. `/wwc:close`.
