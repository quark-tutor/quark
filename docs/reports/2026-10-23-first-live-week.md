# Report: the boys' first live week (`docs/first-live-week-slice.md`), 23 to 25 October 2026

Opus 5.5. Branch `phase-4-wonder-wall`, as the brief names. Nothing on live, nothing a child sees, nothing committed or
pushed yet. This repository is public: the boys are "the older" and "the younger" here, never by name, and nothing
pasted from a live printout is copied in with a nickname.

## Stop 1: after reading, and the new cards on test (23 Oct 2026, 17:12 HST)

**Where it stands.** Read: the brief and its read-first list (`docs/wonder-wall-1-slice.md` *The week for Monday*,
`card.md` v5, `gate.md`, `cards.ts`, `gate.ts`, `core/wall/speech.ts`, docs/04's week and Sunday-build sections,
docs/08's slice 1, voice, 2c-review, step 4d and Bugs sections, the voice report's findings, `deploy/README.md`,
`vercel.json`). Step 1 is done and not committed:

- **`core/prompts/card.md` v6**: the idea named (a new section), never the answer before the question (a new section),
  no `read_aloud`, the reading-level line rewritten. The diff is at the end of this stop.
- **`core/prompts/ideas.md` v5**: the idea's title is its name, kept when the idea comes back, and the question never
  asks for it (decision 2 below).
- **`read_aloud` is gone** from the card writer's schema and checks, the gate's prompt, the week page and the wall's
  reply to the iPad. Stored cards keep theirs (no migration).
- `npm test`: 389 passed. `npm run typecheck`: clean.
- **One day of test's week was rebuilt twice** (day 5, Sunday 25 Oct; decision 1): $1.83 with the first wording,
  $1.96 with the final one. **$3.79 on test**, nothing on live.

### What the rebuilt day shows

Test's day 5, card v5 (built 21 Oct) against v6: Seurat's dots, sunlight and the sky, Beethoven's four notes (a parent
plays it), Ra's sun boat (Egypt), the tangram. 40 cards, two invented children.

| | v5 | v6 |
|---|---|---|
| Titles, for example | "Seurat's Park Contest", "Who Does the Mixing?", "Same Pattern, New Clothes", "Clue 2: The Night Trip" | "Optical mixing", "Pointillism", "Scattering", "A motif", "Variation", "A score", "Myth", "Maat", "Area", "Tangram paradox" |
| Title said in the card's own words (a strict word check) | 16 of 40 | 29 of 40 |
| Same title for both children on the same idea | (each child's own) | 19 of 20 (only "Sunlight" against "White light") |
| Reader notes saying the card gives its answer before the question | about 10 | 3 |
| Reader notes saying the card leaves out what the child needs to answer | 2 | 7 |
| Reader notes, all | 57 | 50 |
| Verdicts | 40 passed (21 Oct) | 40 passed |

- **Titles that are not a concept's name** are the plain name of the thing, which the rule allows when an idea has
  none: "A Sunday on La Grande Jatte", "The sun boat", "Beethoven's deafness", "The night journey", "Tangram figures".
- **Of the 11 titles not found in their card's words**, most are said another way ("deaf" for "Beethoven's
  deafness"); two are real misses: "Optical mixing" on the older child's card and "Variation" on the younger's.
- **The trade in rule 2.** Answers given early fell from about 10 cards to 3; cards that stop short of what the child
  needs rose from 2 to 7. Most of the 7 are where the idea's own answer is the story's turn (the question asks why the
  sun comes back; the answer, "Ra beat the serpent", is exactly what the card may not say). The first wording had 9;
  one more line (decision 3) brought it to 7. Recommended: leave it, and read for it at stop 6.
- **Four-notes** (the bug of 21 Oct): the card that needs the music now opens "Ask Mom or Dad to play you the first
  movement of Beethoven's Fifth, then listen for the four-note motif coming back"; v5's said "you would listen
  closely" with no recording. The first card asks for the handwritten page instead, which it has.
- **The interest door** (the bug of 16 Oct): each child had one first card opened by an interest, and both walked
  through it unnamed (a model taken apart, for building bricks; lines drawn across a square, for drawing).
- One card was held back by the checker on the first try (parent-led: a layer 4 card set the myth against science);
  none on the final.

### Your look, on the laptop

The dev server is running (decision 10). Open
`https://localhost:3000/parent/week/2766c559-3b8d-4464-9664-c387d0dbfbd1`, signed in as the test guardian, and read
**Sunday 25 October** (day 5) for both children:

- "Every card's title is the name of the idea it teaches ('Perspective', not 'Big People, Tiny People'), and the name
  appears in the card's words."
- "No card gives its answer before its question."

The other six days are still v5 cards, for comparison.

### What I decided (strike any you don't want)

1. **Day 5 on test, not day 1.** Day 1 (21 Oct) holds 12 of Bug's answers, and `attempts` doesn't cascade, so
   `--day 1 --rebuild` would set the week to `generating` and then fail on the delete. Day 5 has no answers, and it has
   the four-notes lesson and an interest door. The brief's day 1 matters for M3's plan check, not for this proof.
2. **The name lives on the shared idea (ideas v5), beyond the brief's three changes to `card.md`.** With `card.md`
   alone, the two children got different names for the same idea in 6 of 20 places ("Rhythm" and "The returning
   pattern"; "Dispersion" and "A prism"), because each child's cards are a separate call. Your rule is "every time,
   with the same name", and a later week can only keep a name that is stored, so the idea's title (shared, stored,
   and passed to the next day's ideas call) is now the name, and `card.md` takes it word for word. The chain reaches
   the card writer as `Layer 1, named "Pointillism"`.
3. **Rule 2 has one more line:** a later card says an earlier card's answer plainly before it builds on it, so the
   child never needs to remember a card to answer this one.
4. **Two lines beyond the three rules, both from docs/08:** the four-notes bug ("a card with no recording says from
   its first words that a grown-up plays the music"; the brief's close counts it as closed by v6), and the announced
   door (docs/08's open question, "the interest chooses the way in and is never named to the child"). Say "strike"
   and either goes; it needs no new proof.
5. **No code check for rules 1 and 2**, only the prompt, a Vitest check that the prompt carries them, and the gate's
   reader notes. A card that fails a code check twice is held back, and on Monday a held-back first card is an empty
   tile on a boy's wall. The hint check's word rule is too blunt for the text: it flags "who plays it" in "Ask Mom to
   play" (7 such matches on the v5 day and 7 on the v6 day, mostly false).
6. **`read_aloud` and the gate:** the gate read it as one more line of the card and never needed it; the only thing
   that did was the card check "the whole card in read_aloud for a child who is read to", which goes ("Read it to me"
   reads the text and the question). The wall also stops sending `read_aloud` to the iPad, which never used it.
   `fixture -- card` prints it only on a card that has one.
7. **`week:build --plan` now prints each child's reading level and age** ("Kiddo: written for chapter_books, age 9" on
   test). M3's second check needs it, and the script printed none.
8. **New for testing: `npm run fixture -- words <date>`** (test only, read-only): every card of a day with its title,
   verdict, text, question, accepted answers and reader notes. The comparison above is from it.
9. **Test's week 1 is in review now** (a day rebuild moves a week back), so Bug's wall on June's iPad is empty until
   a guardian taps Looks good on test. Nothing in this job needs it.
10. **The dev server.** My `npm run dev` at 17:08 found your `dev:ipad` server running (since 15:54), and from then
    the week page answered 500 (Next's worker crashing). I stopped it (PID 21188) and started `npm run dev:ipad` again
    as this session's background task; the week page answers again. It stops when this session ends; after that,
    `npm run dev:ipad` in a window as before.

### Fixed in the brief on go (it is not committed yet)

1. **The younger boy's reading level has no `/parent` control.** M3's "Brandon sets it on live's `/parent`" cannot be
   done: a reading level is set only by `seed:live` from `scripts/family.local.json` (gitignored), which has the older
   at *chapter books* and the younger at *reads alone*. The brief already settles the level (both chapter books, from
   the school's tests); the fix is where it is set. **M2 carries two more lines**, since you are in the live SQL
   editor then, and M3's new printout confirms them:

   ```sql
   select id, birth_month, reading from children;                                  -- expect two rows: chapter_books, reads_alone
   update children set reading = 'chapter_books' where reading = 'reads_alone';    -- the younger only
   ```

   LIVE; undone by setting that id back to `reads_alone`. On go I also change `scripts/family.local.json` to match
   (local, gitignored), so a later `seed:live` does not put it back.
2. **Stop 7's iPad steps are in the wrong order.** A Home Screen app keeps its own cookies, apart from Safari's
   (`deploy/README.md`, step 4; the pairing box on `/parent` says "open Quark from the Home Screen and type"), so an
   iPad paired in Safari opens unpaired from the Home Screen. The order becomes: Screen Time allows the live address;
   Safari at `<live>/kid`; Share → Add to Home Screen; open Quark from the Home Screen; on the laptop, live's `/parent`,
   that boy, **Get a code**; type the six digits on the iPad; Guided Access.

### The stops and the risky steps

- **M1** `db:push:live` (LIVE, Brandon's hand) stands: CLAUDE.md's *Migrations* line keeps a live migration at a stop,
  since the workflow's live job waits on the unset `SUPABASE_DB_URL_LIVE`. The push on go runs the workflow on test;
  there is no new migration, and I watch the run.
- **M2** the delete (LIVE, cannot be undone), now with the reading level. **M3** the plan (LIVE, read only). **M4** the
  build (LIVE, about **$14**: day 5 cost $1.96 with v6 against $1.71 to $1.88 a day with v5, and the live rulebook is
  about 5% longer; under the $25 line). **Stop 6** your look and June's; **stop 7** the tap and the iPads (what the boys
  see). Each has its stop.
- **Not marked in the brief:** the reading-level write (now in M2), and the boys' nicknames in what M3 and M4 print
  (the plan's settings lines, the reader notes). The paste stays in this session; the report names neither boy.
- No planned command meets the deny list. Nothing between go and M1 needs your hands.
- **Before the job:** June's read of the safety floor is still open (before M4); Google's key is in Vercel (16:21);
  the iPads are Sunday's.

### The board and the branch

- `phase-4-wonder-wall` is checked out, as the brief names.
- The row "The boys' first live week" is the top row of Next (your edit of today, uncommitted). No row is in hand.
- **On go:** `git pull --rebase --autostash origin phase-4-wonder-wall`; the brief's two fixes above; the row to
  *building* with today's date, committed with this report and the brief; then the prompts and code committed and
  pushed, the migrations workflow watched, and **M1**'s four lines written for your hand.

**Reply go to take all of these.**

**Brandon's go (23 Oct 2026, 17:38 HST):** "go. June won't read the safety floor as a document; she sits with the boys
on live the first week, and that is her check. Strike "June reads the safety floor" from Before the job, stop 6 and
this row's Waiting on; the safety floor stays version 1 until a real card shows otherwise." Done on go: the brief's
two fixes and the strike (*Before the job* 1, stop 6), the row to *building* with no Waiting on. For the decisions
log at the close.

### The diff of `core/prompts/card.md` (v5 to v6)

```diff
-<!-- card v5 (20 Oct 2026: how the family wants its children to learn to act; v4: ...
+<!-- card v6 (23 Oct 2026: the idea named, every time, with the same name, the chain's (ideas v5), and never what is asked; never the answer before the question, with what earlier cards taught said again; no read_aloud, since "Read it to me" reads the text and the question; a card that needs a parent's part says so from its first words; the interest is walked through, never named. v5, 20 Oct: ...

+## Name the idea
+
+Most ideas have a name: perspective, erosion, a fraction, a round, a remainder, a leap year. Give the child that name, so they have a place to put what they learn, and the same name every time the idea comes back.
+
+- **The title is the idea's name**, as the chain gives it for each layer: use it word for word. It is the word or two someone who knows the subject would use ("Perspective", "Erosion", "A round"), or the plain name of what the idea is about ("The Nile's flood"); never a phrase that teases, puns or describes an action ("Big People, Tiny People", "Painting Far Away").
+- **The card says the name plainly in its words**, and the text, the picture and the question show what it means: "Things far away look small. Painters call this perspective."
+- **The same name every time.** Never a synonym of your own: the idea is called the same thing on every card, for every child, and in a later week.
+- **The name is never what the question asks for.** The child is asked what the idea means or does, never to recall its name. If an idea's answer is its own name, that card's title and words leave the name out, and the next card gives it once the child has found the idea.
+
+## The question comes before the answer
+
+A card sets up its question and leaves the finding to the child. Its text never states the answer to its own question, in any words, before asking it: not "The Nile flows north. Which way does the Nile flow?" Give the child everything they need to work it out (what to look for in the picture, a clue, something they already know) and stop there. A later card says an earlier card's answer plainly before it builds on it ("Because the Nile flows north, ..."), so the child never needs to remember a card to answer this one; only this card's own answer is left out. The title and the picture's description keep it too.

-When you're given an interest as the way in, use it to open the first card only (...), and only if it fits honestly. It never changes what the card teaches, ...
+When you're given an interest as the way in, use it to open the first card only (...), and only if it fits honestly. Walk through it; never name it to the child ("you love art", "imagine you're a painter"): the interest chooses what the card opens on, and the child sees it for themselves. It never changes what the card teaches, ...

-- **Reading level.** "Read to" means the child doesn't read yet: keep text to two or three short sentences, and make read_aloud the whole card, text and question together, as it will be spoken. "Reads alone" means short sentences and common words, up to about five sentences, with read_aloud a short spoken version. "Chapter books" means up to about seven sentences and richer words, with read_aloud a short spoken version.
+- **Reading level.** "Read to" means the child doesn't read yet: keep text to two or three short sentences, which the tablet reads to the child with the question. "Reads alone" means short sentences and common words, up to about five sentences. "Chapter books" means up to about seven sentences and richer words.

+- **A parent's part, from the first words.** When a card's question needs what the parent does and the card has no recording or picture of it, the card's text says so from its first words ("Ask Mom or Dad to play you the start of Beethoven's Fifth, then listen for ..."). Never "listen closely" to a recording the card doesn't have.

-- **title**: a few words.
+- **title**: the idea's name, as above.
-- **read_aloud**: what the tablet says aloud, as above.
```

And `core/prompts/ideas.md` (v4 to v5):

```diff
-- **title**: a few words.
+- **title**: the idea's name, the word or two someone who knows the subject would use for it ("Perspective", "Erosion", "A round", "Scattering"); when it has no such name, the plain name of what it is about ("The Nile's flood", "Khufu's pyramid"). Never a phrase that teases, puns or describes an action. When an idea comes back from an earlier layer or day, keep its name; a new idea brings its own. Both children's cards take this name as their title and say it in their words.
-... It must not be answerable only by recalling a name or date the child was never told.
+... It must not be answerable only by recalling a name or date the child was never told, and it never asks for the idea's own name.
```

## After the go (23 Oct 2026, 17:38 to 17:41 HST)

- `git pull --rebase --autostash`: already up to date.
- `6f8c530`: the row to *building* (no Waiting on), the brief with its fixes, and stop 1 with your go.
- `scripts/family.local.json` (gitignored, never committed): the younger's reading level is now `chapter_books`, so
  a later `seed:live` keeps M2's update.
- `6ebb262`: card v6, ideas v5 and `read_aloud` gone; `5ce5b92`: the plan's reading-level line and `fixture -- words`.
  Tests 389 passed, typecheck clean, both again before the commit.
- **Pushed** (`ba8a2de..5ce5b92`). **No migrations run:** the workflow starts only on a push that changes
  `supabase/migrations/` or the workflow file, and this one changed neither, so there is no run to watch (the brief
  expected one). The latest run on the branch is still `39935530082` (22 Oct, green).

## Stop M1: the two migrations on live, by your hand (23 Oct 2026, 17:41 HST)

**What it does:** `npm run db:push:live` applies the two migrations live does not have, in order:
`20261021000000_server_writes_weeks` (a signed-in guardian can no longer insert or update `themes`, `ideas`, `cards`,
`questions`, `sessions` or `attempts`, or insert `audit_log` rows, through the data API; the server does all of it)
and `20261022000000_speech_runs` (the table that counts what the tutor's voice and ears spend).

**What it touches:** **LIVE**: grants on seven tables, and one new empty table. No row is changed. It comes after the
release (done, `main` at `ab9a2f7` on Vercel), because the five `/parent` audit writes it moves to the server must
already be there.

**How it is undone:** by a new migration, itself a stop:

```sql
grant insert, update on themes, ideas, cards, questions to authenticated;
grant insert, update on sessions, attempts to authenticated;
grant insert on audit_log to authenticated;
drop table speech_runs;
```

**Checked on test:** the workflow applied `20261021000000` (run `39584301538`, green) and `20261022000000` (run
`39935530082`, green); on test the five moved audit writes worked, a guardian's direct write to a card and to the
audit log was refused, and the voice wrote its rows (`$0.09`).

**Your step:** in your own PowerShell, in the repository:

```
npm run db:push:live
```

It prints `Target: LIVE` first, then the database user, then the two migrations it applies. Say **"M1 is in"** with
what it printed. Saturday's M2 to M4 follow.

## M1 is in (23 Oct 2026, 20:37 HST)

What it printed (Brandon's screenshot), in order: `Target: LIVE` with the live project's address; `Database user:
postgres.<the live project's ref>`; `Finished supabase db push.`; the CLI's `Connecting to remote database...`, its
question listing `20261021000000_server_writes_weeks.sql` and `20261022000000_speech_runs.sql` with `[Y/n]`; then
`Applying migration` for each, in order. No error. Both migrations are on live. Code ran nothing against live and
has not looked at it; the first sight of them working there is stop 6 (the live week page, and `/parent/models`,
which reads `speech_runs`).

**Found along the way (tooling, for the close as one bug line):** the CLI's `[Y/n]` is never answered.
`scripts/db-push.mts` runs the CLI through `spawnSync` with no input, so the question meets an empty stdin and takes
its default, yes. The output is held back to be scrubbed and printed only when the push is done, stdout before
stderr, which is why `Finished` comes first. The file's comment says `db:push:live` "asks first"; it does not (the
gate-live report of 20 Oct saw the same: "the CLI did not prompt"). Nothing went wrong: the stop is the guard, and
"M1 is in" follows it. The fix is minutes: pass `--yes` and say so in the comment, so the script does what it says.

## Stop M2: live week 1 deleted, and the younger's reading level, by your hand (23 Oct 2026, 20:37 HST)

The brief has this on Saturday. Nothing holds it to Saturday: no child has seen live week 1 and no iPad is paired to
live, so it can be done whenever you are ready.

**What it does:** four statements in the live project's SQL editor, one at a time, each select read before the
statement after it:

```sql
select id, week_start, plan_week, status from themes where plan_week = 1;   -- expect one row: 2026-10-19
delete from themes where plan_week = 1 and week_start = '2026-10-19';       -- expect DELETE 1
select id, birth_month, reading from children;                              -- expect two rows: chapter_books, reads_alone
update children set reading = 'chapter_books' where reading = 'reads_alone'; -- expect UPDATE 1: the younger only
```

The delete takes the theme's ideas, cards, questions and any review rows with it (each `on delete cascade`). The
`model_runs` rows of the 19 and 20 Oct builds stay, with their theme set to null, so `/parent/models` keeps the money.
An answer recorded against one of its questions would stop the delete (`attempts` does not cascade): if it fails on
`attempts_question_id_fkey`, nothing is deleted; paste the error and stop there.

**What it touches:** **LIVE**: one theme and everything under it (one day, 40 cards); one child's reading level.

**How it is undone:** the delete cannot be undone; the week can be built again, not restored, and no child ever saw
it (`docs/reports/2026-10-20-gate-live.md`). The update is undone by
`update children set reading = 'reads_alone' where id = '<the younger's id from the select>';`.

**Checked on test:** the same cascade is what `--day 5 --rebuild` used tonight (the day's ideas deleted, their cards
and questions with them; then built again). The reading level is read by `levelOf()`, which the build's plan now
prints for each child, so M3 shows whether the update took. `scripts/family.local.json` already has the younger at
`chapter_books`, so a later `seed:live` keeps it.

**Your step:** the Supabase dashboard, the live project, SQL Editor, a new query. Run the four lines one at a time.
Say **"M2 is in"** with what each printed (the row counts and the two reading levels are enough; the ids and birth
months stay in the session, never in the report). Then M3, the plan check.

## M2 is in (23 Oct 2026, 20:52 HST)

Brandon: "The select found one theme, 2026-10-19, in review. The delete succeeded. The children select showed two
rows, chapter_books and reads_alone. The update succeeded." Live has no week now, and both children read at
`chapter_books`; M3's plan shows the second.

## Stop M3: the plan check on live, by your hand (23 Oct 2026, 20:52 HST)

**What it does:** `npm run week:build:live -- --week 1 --start 2026-10-26 --plan` prints what week 1 would be on
live and what the family's settings decide about it, then stops. It reads the plan, the children and the rulebook;
`prepareWeek()` writes nothing and `--plan` exits before any model is called.

**What it touches:** **LIVE**, read only. Nothing written, nothing spent.

**How it is undone:** nothing to undo.

**Checked on test:** the same command on test tonight (`--week 1 --plan`, test's week starting 21 Oct) printed day 1
as below and one "written for" line per child, then "--plan: stopped before spending anything; nothing was written."

**What Code checks in what you paste:**

1. Day 1 reads, word for word:
   `Day 1: Ancient Egypt on then (The Nile, from source to sea); short lessons: look great-wave, wonder leap-years, listen carnival-of-the-animals, puzzle two-dice.`
   If not, `plan:import:live` is a stop of its own before M4.
2. Both children: `written for chapter_books, age N` (9 and 7). If either says `reads_alone`, the update is a stop
   of its own before M4.
3. Also read: the first line says `starting 2026-10-26, 7 days`, and the settings list names what the gate will hold
   back or read as parent-led on live. Not a check that stops anything; it goes to stop 6 for your look.

**Your step:** in your own PowerShell, in the repository:

```
npm run week:build:live -- --week 1 --start 2026-10-26 --plan
```

Paste everything it prints. The nicknames in it stay in the session; the report says "the older" and "the
younger". Then M4, the build.

## M3 is in (23 Oct 2026, 21:01 HST)

From Brandon's screenshot, `Target: LIVE` first, then:

1. **The plan order: passes.** "Week 1: The river, with short lessons: starting 2026-10-26, 7 days." Day 1 is word
   for word the line expected: "Ancient Egypt on then (The Nile, from source to sea); short lessons: look great-wave,
   wonder leap-years, listen carnival-of-the-animals, puzzle two-dice." Days 2 to 7 are the same as test's plan,
   line for line. No `plan:import:live` is needed.
2. **The reading levels: pass.** The older "written for chapter_books, age 9"; the younger "written for
   chapter_books, age 7". M2's update took.
3. Also read: "No topic built here touches a subject the family's settings hold back or keep parent-led." (Test's
   invented family has two parent-led subjects in its week; the live family has none.) The gate still reads every
   card. Its copy of the rulebook is 6,823 characters, the same as at the gate-live run of 20 Oct, so the live
   rulebook has not changed since. The models are the three expected (ideas and gate on Opus 5.5, cards on Sonnet
   5.5).

## Stop M4: the week built on live, by your hand (23 Oct 2026, 21:01 HST)

**What it does:** `npm run week:build:live -- --week 1 --start 2026-10-26` builds week 1 on live: seven days, both
children, five day-slots a day, four layers each (280 cards), on card v6 and ideas v5, with pictures from live's
approved items, then the gate reads every card. The theme ends in `review`: nothing reaches an iPad until a guardian
taps Looks good (stop 7). It writes one `model_runs` row with the counts and the money.

**What it touches:** **LIVE**: one new theme and its ideas, cards and questions. **Money:** about $13 to $14 of
Anthropic spend (test's proof week, 21 Oct: $13.62; tonight's two v6 builds of day 5 on test came to $3.79, about the same a day), under the
$25 line. It takes a while: let it run to the end, about 15 to 20 minutes.

**How it is undone:** nothing a child sees until the tap. A bad day is `--day d --rebuild` at a stop of its own; the
whole week is M2's delete again, or `--rebuild`, each a stop of its own. The money cannot be undone.

**If it stops part way:** it says so and leaves the theme `generating`; paste what it printed and stop there (a
rebuild spends again, so it is its own stop). If the gate leaves any card pending, the run ends with an error;
`gate:live -- --week 1` checks them again, at a stop of its own.

**Checked on test:** the proof week on test was built the same way, seven days with pictures (21 Oct, $13.62); day 5
was rebuilt tonight on v6, and the gate passed 40 of 40. M3 above showed live's plan, children, levels and rulebook.

**What Code reads in what you paste:** each child's card count, the cards held back and why, the text-only
day-slots, first cards without a picture, the gate's summary (passed, held back in code, held back by the checker,
pending), the total spend, and the week page's address for stop 6.

**Your step:** in your own PowerShell, in the repository:

```
npm run week:build:live -- --week 1 --start 2026-10-26
```

Paste everything it prints after the plan (the nicknames stay in the session). Then stop 6, your look at the week on
live.

## M4 is in (23 Oct 2026, 21:20 HST)

From what Brandon pasted (the nicknames are left out here: "the older", "the younger"). Days are dated: day 1 is
Mon 26 Oct, day 7 Sun 1 Nov.

**The build:** theme `be339f66-4940-4fdb-acbc-84c8891b8e2b`, now in `review`; 140 ideas; 571 seconds (9.5 minutes).

| | the older | the younger |
|---|---|---|
| Cards | 140 | 140 |
| Lenses (day-slots) | explore 6, build 6, humor 6, collect 6, story 6, compete 3, care 2 | the same |
| First cards opened by an interest | 8 | 8 |
| Cards without a picture or recording | 45 | 45 |
| Day-slots the card checks asked twice | 12 | 12 |
| Held back by the card checks | 1 | 1 |

- **Held back, the older:** Thu 29 Oct, look (Audubon's birds), layer 3: hint 2 gives the answer away ("Think of a
  coloring book: the lines are printed first, and then what happens?"). His chain that day stops at layer 2: a
  layer held back stops the child at the one before (`core/wall/card.ts`), so layer 4 is never reached.
- **Held back, the younger:** Thu 29 Oct, then (why Greenland looks huge), layer 2: hint 3 gives the answer away. His
  chain that day stops at layer 1.
- Every day-slot had an approved item; no idea chain was sent back; every first card has a picture or recording
  where its topic has one. So every day has five first cards for each boy.

**The gate** (rulebook `b025a471`, safety floor v1, Opus 5.5): 280 cards, **278 passed**, 0 held back in code, 0 by
the checker, 0 pending; 2 left as the card checks held them. The tap counts a held-back card as checked
(`core/curation/live.ts`), so nothing here stops Looks good.

**The money:** **$14.32** (ideas $1.85, cards $5.63, the gate $6.84, $0.025 a card), against the brief's "about $13"
and under the $25 line. With test's $3.79 tonight, this job has spent $18.11.

### What the reader notes say

The gate left a reader note on 265 of the 280 cards (on 20 Oct, card v5's live day 1: 36 of 40). Notes never change
a verdict. My count, by reading them; each is "about", since one note can say two things:

1. **The lens's question pasted on as the opener, about 80 cards.** "What's down there?" (explore) opens maps,
   fables, tangrams and Kitty Hawk; "What's funny about…" (humor) opens dice, snowflakes and the chessboard legend;
   "Who won…" (compete), "Can you find them all?" (collect) and "Who looks after whom?" (care) likewise, and the
   gate reads most of them as not fitting the card. This is not v6: `card.md` line 27 tells every card to open
   "with the lens's question and framing", and the questions are `lib/lenses.ts` word for word. Test's day 5 had
   it too (16 "down there"s on v5, 4 on v6). It is the biggest thing a boy will notice this week, and it is odd,
   not harmful.
2. **The answer before the question, about 40 cards** (the text or the question says what is then asked). Card v5's
   live day 1 had it on about half; this week, about one card in seven. Better, not gone.
3. **Something an earlier card taught, not said again, about 20 cards**: the Wright brothers never named (four
   cards), Verdi never introduced (five), the knights-and-knaves rules not restated (three), the chessboard story
   untold (three).
4. **A lesson said outright, about 18 cards**: "that is worth copying", "thinking about both sides takes effort",
   "careful counters make fewer mistakes"; from the `learns_to_act` line of card v5, kept in v6.
5. **Facts a parent should know are loose, about 15 cards**: the leap-year drift (summer reaches winter in "a few
   hundred years"; the card's own numbers make it about 700); every snowflake with six matching arms; Seurat's
   green "not painted anywhere" (he used green dots); "a thousand years from al-Biruni to Mellan" (about 650);
   the Canon's oldest copy "in his own hand" (it is a later copy); the Hōkūleʻa photo is the Yokohama arrival, not
   the 1976 Tahiti sail; the fossil's cause and effect backwards; an ammonite as "a kind of shellfish"; a compass
   needle that "stays put"; "the seven-piece rule" given as a tangram term, which it is not.
6. **Hints**: about 10 where a later hint is vaguer than an earlier one, or one gives most of the answer.
7. **The younger's words**: about 15 notes say a word or number is hard for seven or eight ("Rayleigh scattering",
   365.2422, "a 137.5-degree turn", 7 percent interest). Expected from M2: he is written for chapter books now.
8. **The interest doors**: about 5 say an interest comparison sits oddly on the card. None says a door was named
   to the child; v6's rule held.

### For June's read (the cards a guardian should see before the tap)

These touch a feeling, a safety point, or one of the project's rules. The gate passed each:

| Day | Boy | Card | The reader note, short | Touches |
|---|---|---|---|---|
| Wed 28 Oct | older | wonder (new land from lava), layer 1 | hint 1: picture dipping a hot pan into cold water; a curious child might try it in the kitchen | safety |
| Wed 28 Oct | older | look (Nakht's tomb), layer 4 | hint 2 asks him to think of something hard or scary in his own life | a feeling |
| Sun 1 Nov | both | listen (Aloha ʻOe), layer 4 | "the song you'd want sung when you say goodbye" could be heard as about dying | a feeling |
| Sun 1 Nov | younger | listen (Aloha ʻOe), layer 1 | a chipmunk joke about the Queen's farewell song | rule 1, and Hawaiʻi |
| Sun 1 Nov | both | listen (Aloha ʻOe), layer 3 | Liliʻuokalani's "funny job change" from songwriter to queen: glib, and not accurate | rule 1, and Hawaiʻi |
| Wed 28 Oct | older | puzzle (knights and knaves), layer 3 | "funny to watch two people tangle themselves up" could read as laughing at someone | rule 1 |
| Tue 27 Oct | older | puzzle (snowflake six), layer 1 | the snowflakes as "a crowd of show-offs" | rule 1, lightly |
| Fri 30 Oct | younger | wonder (blue sky, red sunset), layer 2 | "Good thinkers try pretend skies like this" praises a kind of person | rule 8 |
| Fri 30 Oct | both | then (Ra and the sun boat), layer 4 | "what Egyptians believed, not how the sun really moves" reads flat about a belief held deeply | rule 1 |
| Fri 30 Oct | older | then (Ra), layer 3 | hint 3: picture a morning with no sun | a feeling, lightly |

## Stop 6: your look, the week on live (23 Oct 2026, 21:20 HST)

**Brandon, on the laptop at the live address, signed in, at `/parent/week/be339f66-4940-4fdb-acbc-84c8891b8e2b`:**

- "The week page shows seven days, every day with five first cards for each boy, pictures on them, and the *Before
  you tap* box names no card that isn't checked."
- "The titles are the ideas' names."

**June, the same page:** she reads the week, with the table above beside her.

"go" here is Brandon's word that both looks are done. Do not tap Looks good yet: the tap is stop 7.

**What I decided, and what I recommend (strike any you don't want):**

1. **Tap this week as it is** (recommended). Nothing the gate holds a card back for is in it, and the patterns
   above are the card prompt's, not the rulebook's; June sits with the boys this week, which is her check. A full
   rebuild to fix the openers would cost about $14 more, want the whole read again, and should be proved on test
   first.
2. **If June wants one of the cards above gone,** name it at the go. The narrowest way is to hold back that one card
   by SQL (`policy` to `blocked`, which stops his chain at the layer before, or takes the tile away for a layer 1).
   It is LIVE, so it is a stop of its own with the line written out, undone by setting it back to `passed`. A day's
   `--day d --rebuild` (about $2) changes every card of that day for both boys, so I do not recommend it for one
   card.
3. **For the close, not this job:** the lens-question openers (`card.md` line 27 and `lib/lenses.ts`), the lessons
   said outright (`learns_to_act`), the loose facts, and the `db:push:live` question nobody answers, as bug lines in
   docs/08; the openers and the lessons as a proposed row for card v7, which the job does not add.
