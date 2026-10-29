# Report: the boys' first live week (`docs/first-live-week-slice.md`), 23 to 28 October 2026

Opus 5.5. Branch `phase-4-wonder-wall`, as the brief names. Pilot, slice 1; board row now *live*. This repository is
public: the boys are "the older" and "the younger" here, never by name, and nothing pasted from a live printout is
copied in with a nickname. The stop sections written during the job are in this file's history (`6f8c530` to
`9faad2c`); this is the final report that replaces them.

## What could not be checked

- **The hear log line has not run on Vercel.** It reaches production with the next release (the judge job's). Two
  tests hold it: the route's only log call is the exact line, and a broken Google key's message quotes none of the
  key. No real failure has written that line yet.
- **Code never looked at live.** Every live result here comes from what Brandon ran, printed, pasted or saw: M1 to
  M4, the week page, the tap, the iPads, and Vercel's logs on Monday. Code ran one command that touched production:
  the push of `main` on Brandon's typed words (26 Oct).
- **How well Talk hears the boys has not been measured.** Brandon's word is that it works; nobody has counted
  misheard words. The boys' own Talk check was dropped in the voice slice ("seen on live in the first week").
- **The reader-note counts are approximate.** They are Code's reading of 265 notes, and one note can say two things.
- **The tap's own time is not recorded.** The week was tapped before Monday, and the wall was in use on Monday
  evening.

## Not done

Nothing is left open. The brief was done in a different way in two places:

- **The brief expected a migrations run on the push after go.** The push changed no migration, so the workflow did
  not start and there was no run to watch. The last run on the branch is `39935530082` (22 Oct, green).
- **Step 1 rebuilt test's day 5, not day 1.** Day 1 held 12 of Bug's answers, and `attempts` doesn't cascade, so a
  rebuild of day 1 would have failed on the delete. Day 5 had the four-notes lesson and an interest door. Decided at
  stop 1 and taken at Brandon's go.

## Your look: Brandon's words

- **Stop 1, card v6 on test (23 Oct, 17:38 HST).** Brandon: "go. June won't read the safety floor as a document;
  she sits with the boys on live the first week, and that is her check. Strike "June reads the safety floor" from
  Before the job, stop 6 and this row's Waiting on; the safety floor stays version 1 until a real card shows
  otherwise."
- **Stop 6, the week on live (23 Oct, 21:50 HST).** Brandon: "go. The week page shows seven days, five first cards
  for each boy with pictures, Before you tap clean, titles as idea names." June read the week with the table under
  *For June's read*, below.
- **Stop 7, the tap and the iPads.** The tap and both pairings were done before Monday. On Monday (26 Oct, 21:06
  HST), Brandon reported "Read it to me": "worked, Sulafat's voice, as on June's iPad", and Talk: "Talk recorded but
  every hold ended 'That didn't come through.'" That started a fix round (below).
- **Stop 7's go (28 Oct, 20:17 HST).** Brandon: "go. Talk and "Read it to me" both work on the boys' iPads since the
  fix; three nights in and they're enjoying it."
- **`/wwc:close` at the last stop (28 Oct, 20:22 HST).** Every check passed.

## What was done

### Step 1: card v6 and ideas v5, proved on test (23 Oct)

- **`core/prompts/card.md` v6** has three new rules:
  - **The idea named.** The title is the idea's name, word for word from the chain, and the card says it in its
    words. The name is never what the question asks for.
  - **The question before the answer.** A card never states its own answer before asking it. A later card says an
    earlier card's answer plainly before building on it.
  - **No `read_aloud`.** The reading-level line is rewritten without it.

  Two more lines come from docs/08: a card that needs a parent's part says so from its first words (the four-notes
  bug), and an interest is walked through, never named to the child (the announced door).
- **`core/prompts/ideas.md` v5.** The idea's title is its name, kept when the idea comes back, and the question
  never asks for it. Without this, the two children got different names for the same idea in 6 of 20 places,
  because each child's cards are a separate call. Brandon's rule is "every time, with the same name", so the name is
  stored on the shared idea.
- **`read_aloud` is gone** from the card writer's schema and checks, the gate's copy of the card, the week page and
  the wall's reply to the iPad. Stored cards keep the column; there is no migration.
- **Rules 1 and 2 have no code check:** only the prompt, a test that the prompt carries them, and the gate's reader
  notes. A card held back twice is an empty tile on a boy's wall.
- **`week:build --plan`** now prints each child's reading level and age. New test-only fixture:
  `fixture -- words <date>`.
- **Test's day 5, rebuilt twice:** $3.79.

| | v5 (21 Oct) | v6 |
|---|---|---|
| Titles, for example | "Seurat's Park Contest", "Who Does the Mixing?", "Same Pattern, New Clothes" | "Optical mixing", "Pointillism", "Scattering", "A motif", "Myth", "Maat", "Tangram paradox" |
| Title said in the card's own words | 16 of 40 | 29 of 40 |
| Same title for both children on the same idea | (each child's own) | 19 of 20 |
| Reader notes: the answer before the question | about 10 | 3 |
| Reader notes: the card leaves out what the child needs | 2 | 7 |
| Verdicts | 40 passed | 40 passed |

The four-notes card now opens "Ask Mom or Dad to play you the first movement of Beethoven's Fifth…". The interest
doors were walked through without being named.

### On go (23 Oct, 17:38 to 17:41)

- The brief got two fixes:
  - M2 also sets the younger's reading level, because no `/parent` page sets one.
  - Stop 7 pairs each iPad from inside the Home Screen app, because the app keeps its own cookies apart from
    Safari's.
- June's read of the floor was struck.
- `scripts/family.local.json` (gitignored) was changed to match M2, so a later `seed:live` keeps the reading level.
- Commits `6f8c530`, `6ebb262` and `5ce5b92`, pushed. 389 tests passed; typecheck clean.

### M1: the two migrations on live (23 Oct, 20:37, Brandon's hand)

`npm run db:push:live` printed `Target: LIVE`, the database user, then applied
`20261021000000_server_writes_weeks` and `20261022000000_speech_runs` in order, with no error.

**Found:** the script never answers the CLI's `[Y/n]`, which takes its default, yes. Its comment says it asks
first. It is now a bug line in docs/08.

### M2: live week 1 deleted, the younger at chapter books (23 Oct, 20:52, Brandon's hand)

Brandon: "The select found one theme, 2026-10-19, in review. The delete succeeded. The children select showed two
rows, chapter_books and reads_alone. The update succeeded."

### M3: the plan check (23 Oct, 21:01, Brandon's hand)

Both checks passed:

- Day 1, word for word: "Ancient Egypt on then (The Nile, from source to sea); short lessons: look great-wave,
  wonder leap-years, listen carnival-of-the-animals, puzzle two-dice."
- Both boys "written for chapter_books" (ages 9 and 7).
- The family's settings hold back nothing in the week. The gate's copy of the rulebook is unchanged since 20 Oct
  (6,823 characters).

### M4: week 1 built on live (23 Oct, 21:20, Brandon's hand)

Theme `be339f66-4940-4fdb-acbc-84c8891b8e2b`, Mon 26 Oct to Sun 1 Nov: 140 ideas and 280 cards in 571 seconds.

**The cards, for each boy:**

- 140 cards.
- Lenses (day-slots): explore 6, build 6, humor 6, collect 6, story 6, compete 3, care 2.
- 8 first cards opened by an interest.
- 45 cards without a picture or recording.
- 1 card held back by the card checks: on Thu 29 Oct, a hint that gives the answer away. That stops the older's
  Audubon chain at layer 2 and the younger's Greenland chain at layer 1.

**Pictures:** every first card has a picture or recording where its topic has one.

**The gate** (Opus 5.5, safety floor v1): 278 of 280 passed. None was held back in code or by the checker, and none
is pending.

**The money:** **$14.32** (ideas $1.85, cards $5.63, the gate $6.84, $0.025 a card).

**What the reader notes say** (265 of 280 cards have one):

1. **The lens's question pasted on as the opener: about 80 cards.** For example, "What's down there?" on maps and
   tangrams, and "What's funny about…" on dice. `card.md` tells every card to open with the lens's question.
2. **The answer before the question: about 40 cards**, one in seven, against about half on v5's day 1.
3. **An earlier card's point not said again: about 20 cards.** For example, the Wright brothers never named, and
   Verdi never introduced.
4. **A lesson said outright: about 18 cards** ("that is worth copying"). It comes from the `learns_to_act` line.
5. **Loose facts: about 15 cards.** For example, the leap-year drift "a few hundred years" where the card's own
   numbers make about 700; and al-Biruni to Mellan "a thousand years", where it is about 650.
6. **Hints that get vaguer, or give most of the answer: about 10 cards.**
7. **Words hard for the younger: about 15 cards** ("Rayleigh scattering", 365.2422). This was expected now that he is
   written for chapter books.
8. **The interest doors: about 5 notes** say a comparison sits oddly. None says a door was named to the child.

### For June's read (the cards a guardian should see)

These touch a feeling, a safety point, or one of the project's rules. The gate passed each.

| Day | Boy | Card | The reader note, short | Touches |
|---|---|---|---|---|
| Wed 28 Oct | older | wonder (new land from lava), layer 1 | hint 1: picture dipping a hot pan into cold water; a curious child might try it | safety |
| Wed 28 Oct | older | look (Nakht's tomb), layer 4 | hint 2 asks him to think of something hard or scary in his own life | a feeling |
| Sun 1 Nov | both | listen (Aloha ʻOe), layer 4 | "the song you'd want sung when you say goodbye" could be heard as about dying | a feeling |
| Sun 1 Nov | younger | listen (Aloha ʻOe), layer 1 | a chipmunk joke about the Queen's farewell song | rule 1, and Hawaiʻi |
| Sun 1 Nov | both | listen (Aloha ʻOe), layer 3 | Liliʻuokalani's "funny job change" from songwriter to queen: glib, and not accurate | rule 1, and Hawaiʻi |
| Wed 28 Oct | older | puzzle (knights and knaves), layer 3 | "funny to watch two people tangle themselves up" could read as laughing at someone | rule 1 |
| Tue 27 Oct | older | puzzle (snowflake six), layer 1 | the snowflakes as "a crowd of show-offs" | rule 1, lightly |
| Fri 30 Oct | younger | wonder (blue sky, red sunset), layer 2 | "Good thinkers try pretend skies like this" praises a kind of person | rule 8 |
| Fri 30 Oct | both | then (Ra and the sun boat), layer 4 | "what Egyptians believed, not how the sun really moves" reads flat about a belief held deeply | rule 1 |
| Fri 30 Oct | older | then (Ra), layer 3 | hint 3: picture a morning with no sun | a feeling, lightly |

### Stop 6's go (23 Oct, 21:50)

- **The week was tapped as built.** No card was held back by hand.
- **Done by Brandon on live, through `/parent`:**
  - the old iPad's pairing forgotten;
  - of the two items waiting (Musopen's Handel and the CC BY-SA Rosetta Stone photograph), one approved and one
    rejected.
- **The rejected item is on no card of this week, and could not be.**
  - The build offers only approved items, and both were still waiting when M4 ran.
  - Neither item's topic is in week 1: they are plan weeks 3 and 4.
  - Had a card used it, `onWall()` would have taken that card off the wall.

### Stop 7: the tap and the iPads

- **The voice checks moved from Sunday to Monday morning.** The wall shows a card only on its own day, so on Sunday a
  paired iPad has no card to read or answer.
- **On both boys' iPads:** the live address allowed in Screen Time, Quark saved to the Home Screen, opened from
  there, paired with a code from live's `/parent`, then Guided Access.

### Monday's fix round (26 Oct, 21:06 to 21:26)

- **Talk answered 502 on Vercel.**
  - **Cause:** `hear()` names the Google project in its address. Given the key as JSON, google-auth-library 11.1.0
    does not read the project from it. It looks for a key file, `gcloud` and Google's metadata server instead,
    finds none on Vercel, and throws. On the laptop the key is a file, so every check passed there. "Read it to
    me" names no project, so it worked.
  - **Fix:** `core/speech/google.ts` gives the library the key's own `project_id`. A test sends the key only as
    JSON: it timed out on the old code and passes on the new.
- **`/kid` logged "getDevice: device lookup failed" on every visit.**
  - **Cause:** `partialPrefetching` renders each kid page a second time as a runtime prefetch, where every `fetch()`
    rejects.
  - **Fix:** `getDevice()` now waits on `connection()`. Proved on a production build against test with a device
    paired by the new `fixture -- device 1` (and `fixture -- forget`): one error before the fix, none in three
    visits after it.
- **Checks:** 390 tests passed; typecheck clean. Commit `77f187e`. Nothing spent, nothing on live.
- **The push to `main`:** Claude Code's auto mode refused it as a production deploy, and Code did not try it another
  way. Brandon typed `! git push origin phase-4-wonder-wall:main`. It reached the session as text, so Code ran that
  command on his words: `ab9a2f7..b031221`. Vercel's production deployment of `b031221` succeeded at 21:25:59 HST.

### 28 Oct: the go, and the hear log line (`178b0f0`)

- **A failed hear now logs one line:** "hear: Talk failed" and the error's message. It never logs the clip, its
  words or the child, and the child still gets a 502. Brandon: "Yes to the one log line on a hear failure, never the
  child's words."
- **A broken Google key now fails with a plain message.** `JSON.parse` quotes the text around a fault (Node 24, on a
  broken key: `Unexpected token 'M', ..."ate_key": MIIEvQIBAD"... is not valid JSON`). So the new log line could have
  put a piece of the private key into Vercel's logs. The adapter now fails with "GOOGLE_CREDENTIALS_JSON is not
  valid JSON." and quotes nothing.
- **The tests:** `lib/kid-wiring.test.ts` held "nothing on the kid path logs". It now holds that the hear route is
  the one file that logs, and that its only call is that exact line. `core/speech/google.test.ts` holds the plain
  message.
- **Checks:** 391 tests passed; typecheck clean; lint clean on the four files.
- **A rule changed:** this replaces slice 1's "nothing on the kid path logs", on Brandon's words. Rule 7 holds: no
  child data reaches a log.

### The close (28 Oct)

- **The chat's edits of 28 Oct** were committed as they were, on their own (`af9b176`): the judge brief, its row to
  the top of Next, and two rows at *not fully formed*.
- **Records:**
  - docs/04: *How a week is built* (the idea's name, card v6, live week 1's numbers and notes), *How the gate is
    built*, *How a week goes live* and *How the Wonder Wall is built* (on live, the device lookup, the log line).
  - docs/13: the key's project, the key's plain message, the log line.
  - docs/08: a section of decisions, *The boys' first live week*. The two door questions are ticked, and "Too many
    words" keeps only the word limit open.
  - `CLAUDE.md` *Where we are* and the README status.
- **Bugs in docs/08:**
  - Deleted, closed by card v6: four-notes (21 Oct) and the announced door (16 Oct).
  - Added, six new lines:
    1. the lens-question openers;
    2. lessons said outright;
    3. loose facts;
    4. a recording and "Read it to me" playing at once;
    5. the say route's silent failure;
    6. `db:push:live`'s unanswered `[Y/n]`.
- **The board:**
  - This row to *live* (28 Oct).
  - Phase 1 and Phase 2, *live* since 10 and 11 Oct, deleted under the 14-day rule.
  - Pilot has no slice at *later*, so nothing moved up.
- **Board page:** `npm run docs:board`.
- **The plate:** 391 tests passed; typecheck clean; `npm run build` clean.

## Beyond the brief

- **Beyond the brief's three card changes:** ideas v5 (the name on the shared idea), and two lines in card v6 (a
  parent's part from the first words, the door never named).
- **New tools and code:**
  - `week:build --plan` prints the reading level.
  - Test-only fixtures: `fixture -- words`, `fixture -- device`, `fixture -- forget`.
  - The device-lookup fix and the hear log line, with the key's plain message.
- **Found:**
  - `db:push:live` never answers the CLI.
  - Auto mode refuses a push to `main` as a production deploy, so it is Brandon's hand.
  - Hints written as questions make the boys answer the hint, not the question (Brandon, 28 Oct). This is already
    in `docs/judge-slice.md`, *Why*, and its board row.
- **On Brandon's hand, on live:** the old iPad's pairing forgotten; one waiting item approved and one rejected.
- **For Brandon: Pilot has no slice left on the board.** The close rule moves a project to *live* when its last
  slice does, but Pilot's four weeks run to Sun 22 Nov, so I left its project row as it is. Say if it should go to
  *live* now, or name its next slice. Week 2 itself sits in *Week 2 builds itself* (the 28 short lessons by Sat
  31 Oct are a row at Next).

## On live

- **The database (Brandon's hand at each stop):**
  - `20261021000000_server_writes_weeks` and `20261022000000_speech_runs` applied (M1).
  - Live week 1 of 19 Oct deleted, and the younger set to `chapter_books` (M2).
  - Week 1 built to start 26 Oct, 278 of 280 cards passed (M4), then tapped Looks good.
  - Two iPads paired and the old one forgotten.
  - One content item approved, one rejected.
- **Production:** `main` at `b031221`, deployed on Vercel 26 Oct, 21:25:59 HST. It carries card v6, the Talk fix and
  the device-lookup fix. The hear log line (`178b0f0`) is not on Vercel yet.
- **What a child sees:** both boys have used the Wonder Wall on live since Monday 26 Oct, with "Read it to me" and
  Talk working.
- **Money:** $18.11 in all: test $3.79 (two rebuilds of day 5) and live $14.32 (M4). The brief estimated about $15;
  each run stayed under the $25 line.

## Commits

`6f8c530`, `6ebb262`, `5ce5b92` (23 Oct: go, card v6, the plan line); the stop reports `db9c8eb`…`f2ad9dc`
(23 to 26 Oct); `77f187e` (Talk and the device lookup, 26 Oct); `27d70fc`, `178b0f0`, `9faad2c` (28 Oct); `af9b176`
(the chat's edits); and the close's commit. All on `phase-4-wonder-wall`.

## What you now do differently

- **To pair an iPad,** open Quark from the Home Screen first, then type the code there. A pairing made in Safari does
  not carry over to the Home Screen app.
- **When Talk fails** (once the next release is out), Vercel's logs will say why on a line starting
  `hear: Talk failed`. "Read it to me" still fails silently; that is a bug line.

cost: not read
