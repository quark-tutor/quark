# Report: a theme a week, picked on Saturday

The brief is `docs/theme-a-week-slice.md`, and the job started at 07:41 HST on Sunday 8 November 2026. It runs in a
`claude --worktree` session (branch `worktree-theme-a-week`), because the week 3 job is still open at its stop 3 in
the main checkout.

## Stop 1 (8 Nov, 08:17 HST): four themes for week 5, the code's shape, and the row

### Where the job stands

- **Step 1 is done.** Four themes, a short page each, are in `plan/candidates/themes.md`:
  - **Ancient Greece:**
    - a city-state;
    - a lunar eclipse (how the Greeks knew the Earth is round);
    - an Olympiad;
    - an octave (Pythagoras);
    - black-figure and red-figure;
    - the Midas touch (Hawthorne's telling);
    - circumference (Eratosthenes measuring the Earth from Egypt).
  - **The Moon:**
    - the Moon's seas;
    - a crater;
    - Apollo 11;
    - Clair de lune;
    - Friedrich's *Two Men Contemplating the Moon*;
    - Verne's *From the Earth to the Moon*;
    - thirty Earths to the Moon.
  - **The deep sea:**
    - Kamaʻehuakanaloa;
    - bioluminescence;
    - the *Trieste*;
    - Debussy's *La Mer*;
    - Haeckel's jellyfish;
    - *Twenty Thousand Leagues*;
    - pressure and the shrunken cups.
  - **Antarctica:**
    - an ice sheet;
    - emperor penguins;
    - Shackleton's *Endurance*;
    - the banjo the men kept;
    - Church's *The Icebergs*;
    - *The Snow Queen*;
    - below zero.
- **What each page has.** For each theme: why this one; the seven days, each with its slot and with the idea named
  in the title; the pictures and recordings found; the values points; and what is close to earlier weeks.
- **The pictures and recordings.** 47 were named, and each was fetched through Quark's own adapters. Every one came
  back CC0 or public domain.
- **The full Moon falls in week 5,** at 4:55 am on Tuesday 24 November, Hawaiʻi time.
- **The slot pattern is the same in all four themes,** so week 5's 28 short lessons are the same whichever is picked:
  look 5, wonder 6, listen 6, then 5, puzzle 6.
- **The Hawaiʻi standard is applied.** No theme is a Hawaiʻi theme, and nothing is there for its own sake. Two topics
  carry a Hawaiʻi item marked "your call", each with a swap: the Apollo crews training on Kīlauea's lava, and
  Kamaʻehuakanaloa. The file ends with what a Hawaiʻi theme could be built on, for a Saturday with June.
- **Nothing else has happened.** Nothing is committed, nothing has run against either database, and nothing is spent.

### What I need from you

1. **Week 5's theme:** one of the four, or "four more".
   - **My recommendation: the Moon.**
     - It is full on its first two nights, so day 1 sends the boys outside with you to find the seas the card
       showed them.
     - No topic touches a values point.
     - It is the clearest change from a month of Egypt.
     - Its pictures are NASA's, all public domain.
   - **What the Moon costs:** week 4's candidate 26 (Clair de lune) moves into the Moon week, so Saturday's pick
     leaves it out. Week 4 still has nine listen candidates for its six.
   - **Greece** follows Egypt in the plan, but it is a second ancient civilization straight after the first. It
     stays in the bank for a later Saturday.
2. **The board row.** On your yes, I add it as the brief words it: "A theme a week: each Saturday the parents pick
   next week's theme from Code's suggestions, Code writes its seven topics, the Sunday build builds them beside 28
   short lessons". It goes in straight at *building* (today, the brief in Where), in the *Week 2 builds itself*
   project, whose goal becomes "the week builds itself" unless the week 3 close has already changed it.
   - **This is out of order.** The top of Next is "Wonder Wall slice 2", so your yes is also the word to take this
     job before it.
   - **Two rows are already in hand:**
     - "Weeks 2 and 3 on live" (*building*; the week 3 job, waiting at its stop 3);
     - "The tutor's lines made ahead" (*on hold*, waiting on Sunday 8 Nov's release).
   - Go takes this job beside them, so the board will show three in hand.
3. **Before go, by your hand: the test env file in this worktree.** The worktree has none:
   - `claude --worktree` copies no gitignored file;
   - the deny list keeps me from naming it;
   - step 3 (the import, the fetch and the plan on test) and stop 2's dev server need it.
   - The brief's *Before the job* missed this. On go I add the line "Copy the test env file into the worktree"
     there when I commit the brief. Type this at the prompt:

     `! cp /c/Users/BrandonReisen/Documents/quark/.env.local /c/Users/BrandonReisen/Documents/quark/.claude/worktrees/theme-a-week/.env.local`

### Decided here (taken with go)

- **The branch.**
  - **On go:** `git pull --rebase origin phase-4-wonder-wall` brings this worktree's branch, made from `1f2dc5c`,
    up to the phase branch's tip, `3c6b314` now. Then comes the first commit. This job's pushes go to
    `origin/worktree-theme-a-week`.
  - **Before stop 2:** the branch is rebased onto `phase-4-wonder-wall`, which by then has the week 3 close and, if
    they are in, week 4's 32. It is then pushed there as a fast-forward, so the brief's code is on the brief's
    branch for the release.
  - **M1, M2 and the live plan** then run from the main checkout after a `git pull`, where the live env file
    already is, so no second copy of the live key is made. That needs no session open in the main checkout at
    stop 2. If one is, stop 2 says so and gives the other way.
- **Every library import runs from the newest library.**
  - **The risk:** `plan:import` replaces the whole library with the file it runs from. A lesson the file lacks is
    deleted, unless something already points at it, and before the Sunday build nothing does.
  - **On live,** an import run from a branch without week 4's 32 would silently delete them before Sunday 15 Nov's
    build.
  - **So** every `plan:import`, on test and at M1, runs straight after a rebase onto `phase-4-wonder-wall`. Stop 2
    names the commit and how many lessons the import holds, so you can see week 4's are there before M1.
- **The code's shape is the brief's recommendation.** These details are settled:
  - **How a week finds its stretch.** A stretch holds its topics ÷ 7 weeks, rounded up: Egypt's 24 hold weeks 1 to
    4, with three thread days in week 4. Each next `sequence` starts the week after the last one ends.
  - **A stretch after the first is one chapter of exactly seven topics,** or the validator refuses it ("a theme is
    one week"). With the existing rules (each subject at most once, every slot fed) that makes it the seven
    subjects, one each.
  - **A gap or a clash in `sequence` is refused** by the import before it writes anything. `prepareWeek()` refuses
    the same in the database's own rows, because a deleted stretch file leaves its rows behind.
  - **"The thread has ended" is narrower.** It is now said only for days after a stretch's last topic inside its own
    last week (week 4, days 4 to 7).
  - **A week no stretch holds is refused before anything is spent,** naming the file to write: "No theme for week 6:
    write plan/<theme>.yaml with sequence: 3, then npm run plan:import." The Sunday build takes it as it takes the
    short-lessons refusal: a refused firing, nothing spent.
  - **`week:build --stretch` goes,** since a week's stretch now comes from the files.
  - **The thread's title still comes from the file name** ("ancient-greece" reads "Ancient Greece"), so a theme
    file is named as its title should read. A theme picked again is a new file named for its own seven topics.
  - **Weeks 1 to 4 are unchanged,** and the schedule test holds them exactly as today.
- **The theme leads by a week.** The Saturday 21 Nov job picks week 6's theme and week 5's 28, as the row the brief
  proposes for the close says. That leaves a week to write a theme, and a Hawaiʻi one with June, and to fetch its
  pictures. The Saturday brief (step 4) is written that way.
- **The stops stand.**
  - **Stop 2** is your look on the laptop, then M1, M2 and the live plan by your hand: it guards the live database
    and money.
  - **Stop 3** is the release before Sunday 22 Nov's 6 am firing.
- **Every risky step has its stop.**
  - The fetch on test is under $1, inside the $25 line.
  - The live import, the live fetch and the live plan are stop 2.
  - The release is stop 3.
  - The theme's cards reach the boys only through Sunday 22 Nov's build and your tap.
- **What does not happen.** There is no migration, so no workflow runs and no iPad is needed. Nothing planned meets
  the deny list, and I never read an env file.

### Noted, not blocking

- **The main checkout holds two untracked briefs:**
  - `docs/theme-a-week-slice.md`, this brief, which I copy here on go;
  - `docs/second-stretch-slice.md` (07:19), the four-chapter draft this brief replaced.
  - Both must go before the main checkout pulls this job's commits, because git will not overwrite an untracked
    file. Recommended: delete both once the week 3 job has closed.
- **Your `/wwc:idea` did not run.** It is about math practice, June's ask. It came in mid-turn, and that skill runs
  only when you type it.
  - **When to type it:** after go, when this worktree's board is current; or in the main checkout once the week 3
    job has closed.
  - **Not before go:** before go it would commit onto this branch's 1 Nov board and clash on the pull.
  - **Related:** each theme's puzzle is arithmetic in a real setting, one card a week, which is not practice, so the
    idea's new format stays its own row.
- **The brief's header says it was rewritten at 08:20,** but its file was saved at 07:40 and the job read it at
  07:41. I read it as it stands.

### On go

1. The pull above.
2. The brief copied in, with the env line added to its *Before the job*.
3. One commit: the board row, this report, the brief and `plan/candidates/themes.md`. Then a push.
4. `npm ci` (the worktree has no `node_modules`).
5. Step 2, the code, with its tests, then step 3 with the picked theme.

**Size:** a slice, 8 hours. The clock ran from 07:41 to this stop at 08:17.

**At this stop, reply with:**
- go;
- week 5's theme, or "four more";
- yes to the row, taken before Wonder Wall slice 2;
- and that the env file is copied.

Reply go to take all of these.

### Go (8 Nov, 08:47 HST)

Brandon: "go. The Moon. Yes to the row, taken before Wonder Wall slice 2. The env file is copied."

- **Week 5's theme is the Moon.** Week 4's candidate 26 (Clair de lune) moves into it, so Saturday 14 Nov's pick
  leaves 26 out. The two Hawaiʻi items stay marked "your call" until the theme is written (step 3).
- **The row is in at *building*,** taken before Wonder Wall slice 2. The *Week 2 builds itself* project's goal is
  now "the week builds itself".
- **The test env file is in the worktree,** copied by Brandon's hand. The brief's *Before the job* now says so.
- **Everything under *Decided here* is taken.**
- **The pull** brought this worktree's branch from `1f2dc5c` to `3c6b314`, the tip of `phase-4-wonder-wall`.

## Stop 2 (8 Nov, 09:00 HST): your look on the laptop, then M1, M2 and the live plan by your hand

### Where the job stands

- **Step 2 is done:** the code, `6fc820c`, pushed to `origin/worktree-theme-a-week`.
  - **The plan's rules** (`lib/plan.ts`):
    - a stretch after the first must be one chapter of seven topics;
    - `sequenceProblems()` refuses a gap or a clash.
  - **The schedule** (`core/curation/schedule.ts`):
    - `stretchForWeek()` finds which stretch holds a week, from every stretch's sequence and topic count, and
      refuses a week no stretch holds, naming the file to write;
    - `weekSchedule()` takes the week's own thread from its day 1.
  - **The week build** (`core/curation/week-job.ts`): `prepareWeek()` loads every stretch, not just the first.
  - **The import** (`scripts/import-plan.mts`) refuses a gap or a clash before it writes anything.
  - **The flag:** `week:build --stretch` is gone.
  - **Added while building:** the Sunday build (`core/curation/cron.ts`) took only the short-lessons error as a
    refusal, so "No theme for week N" would have ended a firing as *failed*. It is now a refusal too, and the
    `/parent` line says it in plain words (`core/curation/sunday-line.ts`): "Sunday's build refused at 6:02 am: no
    theme for week 6: the plan's stretches reach week 5. Nothing was spent."
  - **Tests and typecheck:** 439 tests pass, 10 of them new, and the typecheck is clean. The schedule test holds
    Egypt's weeks 1 to 4 exactly as before.
- **Step 3 is done on test.**
  - **The file:** `plan/the-moon.yaml` (`cd3605e`, pushed) holds seven topics, sequence 2, with both summaries and
    11 sources. No values point is marked, and no age of the Moon or its craters is given.
  - **`plan:import`** imported three files: Ancient Egypt 56 rows; short lessons 168 rows (84 lessons, the same
    library as the phase branch, which has not moved); the Moon 16 rows.
  - **`content:fetch`** brought in 11 items in 102 seconds, for **$0.15**. All 11 were approved automatically with
    no flags, and nothing new waits. The one "to check by hand" is Egypt's old Musopen Handel.
- **The dev server** is running from this worktree on test, at http://localhost:3000.
- **The Met's description could not be read** (the page answered 429). The Friedrich summary is written from the
  painting as it looks, plus the Met's data: about 1825 to 1830, 2000.51.

### `npm run week:build -- --week 5 --start 2026-11-23 --plan`, on test, whole

```
Target: test (mnftudfnnfvxilnmwvvo.supabase.co)
Week 5: The Moon, with short lessons: starting 2026-11-23, 7 days.
  Day 1: The Moon on look (The Moon's seas, and the map that named them); short lessons: wonder why-ice-floats, listen carillon-twinkle, then tele-words, puzzle measuring-feet.
  Day 2: The Moon on wonder (A crater, and why the Moon keeps every one); short lessons: look snap-the-whip, listen steel-guitar, then duke-kahanamoku, puzzle how-a-vote-counts.
  Day 3: The Moon on then (A lunar landing, and Apollo 11's footprints in the Sea of Tranquility); short lessons: look durer-rhinoceros, wonder rain-shadow, listen bumblebee, puzzle first-bar-chart.
  Day 4: The Moon on listen (The sustain pedal, and Debussy's Clair de lune); short lessons: look blue-armchair, wonder thunder-after-lightning, then maui-and-the-sun, puzzle quilt-eighths.
  Day 5: The Moon on look (A figure seen from behind, in Friedrich's Two Men Contemplating the Moon); short lessons: wonder air-pressure, listen maple-leaf-rag, then tortoise-and-hare, puzzle hawaiian-quarter.
  Day 6: The Moon on then (Science fiction, and Jules Verne's From the Earth to the Moon); short lessons: look star-tiles, wonder bat-echolocation, listen hawaiian-petrel, puzzle flag-arrays.
  Day 7: The Moon on puzzle (Distance, and about thirty Earths between the Earth and the Moon); short lessons: look hawaiian-kapa, wonder kolea-migration, listen mountain-king, then louis-braille.
What the family's settings decide before anything is spent (the gate holds these back in code, or reads them as parent-led):
  Kiddo: day 2 puzzle (A majority, and how a vote is counted): Subject 14 (Government, voting and parties) is blocked by a guardian.
  Kiddo: day 4 then (Moʻolelo, and how Māui slowed the sun): Subject 4 (Other religions: equally true, partly true, or mistaken?) is parent-led.
  Bug: day 2 puzzle (A majority, and how a vote is counted): Subject 14 (Government, voting and parties) is blocked by a guardian.
  Bug: day 4 then (Moʻolelo, and how Māui slowed the sun): Subject 4 (Other religions: equally true, partly true, or mistaken?) is parent-led.
Ideas on claude-opus-5-5; cards on claude-sonnet-5-5; the gate on claude-opus-5-5. 2 children.
  Kiddo: written for chapter_books, age 9.
  Bug: written for reads_alone, age 7.
--plan: stopped before spending anything; nothing was written. The gate's copy of the rulebook is 6,495 characters.
```

**What it shows.**
- **The thread:** seven days. The Moon takes look, wonder, then, listen, look, then and puzzle, its seven topics in
  the file's order, from day 1.
- **The title** names the theme: "Week 5: The Moon, with short lessons".
- **The short lessons are test's leftovers:** test never built a week 2, so week 2's 28 count as unused there. On
  live, week 5's 28 are the ones picked on Saturday 21 Nov.
- **The settings lines** fall on two of those leftovers, not on the Moon: test's own block on subject 14 (the
  vote lesson, excepted by the brief), and a parent-led Māui. No line touches a Moon topic, as expected, since the
  Moon marks no values point.

### Your look (on the laptop)

1. **Where:** the week 5 plan above.
   - **Do:** read day 1 to day 7, then "What the family's settings decide".
   - **See:**
     - seven days;
     - each day's thread slot names one of the Moon's seven topics, in order;
     - the other four slots have a short lesson;
     - the week's title names the theme;
     - no "blocked", "Don't bring it up" or "Not yet" line, apart from test's subject 14.
   - Pass □ Fail □ (if it fails, say what you saw)
2. **Where:** http://localhost:3000/parent/content on the dev server, as the test guardian.
   - **Do:** scroll the 11 new items among the approved ones and read each credit line. They are *Two Men
     Contemplating the Moon*, the Apollo 11 full Moon, Riccioli's map, the bootprint, Lovell and Haise at
     Kīlauea, the Verne telescope, the Moon in front of the Earth, the Clair de lune recording, Debussy by Nadar,
     Daedalus crater and Tycho.
   - **See:**
     - every picture is one you would put in front of the boys;
     - every credit reads right;
     - nothing waits.
   - Pass □ Fail □ (if it fails, say what you saw)
3. **Where:** `plan/the-moon.yaml`, the two Hawaiʻi lines. This is the Hawaiʻi standard: your call, since you
   picked the Moon without ruling on them.
   - **Do:** read day 1's older summary ("basalt, a dark lava rock, the same kind of rock as the lava flows on
     Hawaiʻi Island"), then day 3's older summary ("in 1969 and 1970 crews trained on Kīlauea's lava fields and at
     Kapoho, on Hawaiʻi Island"), with NASA's photograph of Lovell and Haise on Kīlauea.
   - **See:** each one gives a child who lives here something to learn. Otherwise name the one to strike: I take
     the line out, and for day 3 the photograph with it, before M1.
   - Pass □ Fail □

"go" means all three passed. A failure named without the word go is a fix round.

### Then, only on go, by your hand: M1, M2 and the live plan

**Where they run.** They need this branch's code and the Moon file, and the week 3 job is still open in the main
checkout. Two ways:
- **(a) Recommended: after the week 3 job has closed.**
  - Tell me "week 3 closed". I rebase onto the closed phase branch, run the tests, and push this branch onto
    `phase-4-wonder-wall`, so the brief's code is on the brief's branch.
  - Then, in the main checkout: delete the two untracked briefs (`docs/theme-a-week-slice.md` and
    `docs/second-stretch-slice.md`), then `git pull`, then the three commands below.
  - No second copy of the live key is made.
- **(b) Now, from this worktree.**
  - Copy the live env file in, run the three, then delete the copy.
  - This is faster, but leaves a second copy of the live key on disk for a few minutes.

Whichever way, run M1 before Saturday 14 Nov's week 4 job imports its lessons on live, or from a tree that has
them. At M1, the import must print the library as the phase branch holds it: "Short lessons: 168 rows (84
lessons)" today, or more once week 4's are in.

**M1: `npm run plan:import:live`**
- **What it does:** writes the Moon's 16 rows into live's plan, and writes Egypt's 56 and the library's 168 again,
  unchanged.
- **What it touches:** **LIVE**, `plan_topics`. The code on Vercel ignores the Moon until the release, because its
  first-stretch query still picks Egypt (sequence 1). So Sunday 15 Nov's build of week 4 is unchanged.
- **How it is undone:** delete the Moon's rows by the key prefix `the-moon/`. No idea or card points at them
  before 22 Nov.
- **Checked on test:** yes, above.

**M2: `npm run content:fetch:live`**
- **What it does:** fetches, flags and stores the Moon's 11 items. About $0.15, as on test.
- **What it touches:** **LIVE**, `content_items` and the private bucket. It prints nothing until it is done (the
  1 Nov bug line), so wait for the table.
- **How it is undone:** the items are unused until a card offers one; any item can be rejected at live's
  `/parent/content`.
- **Checked on test:** yes, above.

**M3: `npm run week:build:live -- --week 5 --start 2026-11-23 --plan`**
- **What it does:** reads live's plan for week 5. **LIVE**, read only, spends nothing.
- **What to expect today:** weeks 1 to 3 on live have used all 84 lessons and week 5's 28 are not picked yet, so
  it stops before printing the days. The pass is this exact line:

  `Not enough short lessons for week 5: the look card needs 5 and 0 are left; the wonder card needs 6 and 0 are left; the listen card needs 6 and 0 are left; the then card needs 5 and 0 are left; the puzzle card needs 6 and 0 are left. Add lessons to plan/short-lessons.yaml and run npm run plan:import.`

- **How to read it.** Those counts are the Moon's slots. Egypt's old reading would ask 7 a slot, and a missing
  Moon would say "No theme for week 5".
- **If week 4's 32 are on live and not yet built,** it prints seven days with week 4's lessons in them. Read those
  days as the brief says: a "Not yet" or "blocked" line on a Moon topic is rewritten or swapped before the close.
- **The seven-day read with the real 28** is the Saturday 21 Nov job's.

Paste all three outputs. Then step 4 (the Saturday brief), then stop 3, the release.

**Size:** a slice, 8 hours. The clock ran 36 minutes to stop 1, then from go (08:47) to this stop (09:00).

### Go (8 Nov, 10:48 HST)

Brandon: "go. All three pass. The Moon's fine, the 11 pictures are fine, and the Hawaiʻi lines stay: they talk
about local rocks the boys have real experience with, a real tie-in; they're not trying to teach Hawaiian culture to
a child who is already learning from a Kumu. Quote that in docs/08 with the standard. (a): I'll tell you "week 3
closed" tonight. One finding, not for this job: finding 11 new items among 208 approved on /parent/content is a
hunt; the page could show newest first or group by week."

- **All three checks passed:** the week 5 plan on test, the 11 items and their credits, and the two Hawaiʻi lines.
- **The two Hawaiʻi lines stay** in `plan/the-moon.yaml`: day 1's basalt and day 3's crews on Kīlauea and at
  Kapoho, with the Lovell and Haise photograph. Brandon's words and the standard are now in docs/08, *A theme a
  week*. The rest of this job's decisions join them at the release.
- **M1, M2 and the live plan go way (a).** When Brandon says "week 3 closed", I rebase this branch onto the closed
  phase branch, run the tests and the import on test again, and push it onto `phase-4-wonder-wall`. Then, in the
  main checkout, Brandon deletes the two untracked briefs, pulls, and runs the three.
- **Step 4 runs now:** the Saturday brief, `docs/saturday-pick-slice.md`.
- **Brandon's finding, for him and not for this job:** `/parent/content` lists every approved item in one run, so
  finding a week's new ones among 208 is a hunt. The page could show the newest first, or group the items by week.
  It is a different feature from this brief, so I add no row; `/wwc:idea` files it if he wants it on the board.
  Until then, each Saturday's stop 2 names the new items by title, as this one did.

## Stop 2, continued (9 Nov, 12:47 HST): rebased and pushed onto `phase-4-wonder-wall`; M1, M2 and the live plan by your hand

Resumed at 12:43 HST on Brandon's word: "This job is resumed, not new. … Week 3 is closed and released (main is at
3af36b8, 9 Nov). Pick up where the report stops: rebase this branch onto phase-4-wonder-wall, run the tests, push
onto phase-4-wonder-wall, then stop for M1 with the exact commands for my hand."

### Where the job stands

- **Rebased** onto `92030b7`, the release's records on `phase-4-wonder-wall`. Two conflicts, both in docs:
  - **The board.** This row stays at *building*, at the top. The two rows the week 3 job moved to *live* stay as it
    left them. The project's goal now reads "the week builds itself: each Sunday the build makes next week on live
    from the theme and the short lessons the parents picked on Saturday, and a guardian's tap makes it live; week 3
    was the first …". "28" is dropped, since week 4 takes 32.
  - **docs/08.** Both sides kept: the phase branch's *Math practice* and *Weeks 2 and 3 on live*, then this job's
    *A theme a week*.
- **Tests:** 441 pass (439 at stop 2, plus the plan test's two for the Moon file), and the typecheck is clean.
- **The import on test, from the rebased tree:**

  ```
  Target: test (mnftudfnnfvxilnmwvvo.supabase.co)
  Ancient Egypt: 56 rows (4 weeks)
  Short lessons: 168 rows (84 lessons)
  The Moon: 16 rows (1 week)
  Imported 3 files.
  ```

  The library is 84 lessons, the same as live holds; week 4's 32 are not on the phase branch yet.
- **Added while doing it:** the import printed "The Moon: 16 rows (1 weeks)". It now says "1 week" (`fc9dc22`).
- **Week 5's plan on test,** read again from the rebased tree: the same seven days as at stop 2.
- **Pushed:** `phase-4-wonder-wall` `92030b7..fc9dc22`, a fast-forward. There is no migration, so no workflow ran.
  - The old remote branch `worktree-theme-a-week` is deleted; its commits are on the phase branch, rebased.
  - This worktree's branch now tracks `origin/phase-4-wonder-wall`, and the rest of the job's pushes go there.
- **Checked for M1:** `main` (`3af36b8`, on Vercel) picks its stretch as the lowest `sequence`
  (`core/curation/week-job.ts`, `.order("sequence").limit(1)`). So the Moon's rows on live leave Sunday 15 Nov's
  build of week 4 as it is.
- **Step 4,** the Saturday brief (`docs/saturday-pick-slice.md`), was done on 8 Nov and came through the rebase.

### What I need from you

1. **The math inbox row came back with the rebase.** "Math tutored in a recognizable way" (*not fully formed*) was
   filed on this branch at 09:02 on 8 Nov. The math practice job answered it the same day, in its own worktree: the
   proposal is decided and its four rows are on the board. Only you clarify the inbox.
   - **My recommendation: strike it.** On yes, I delete the row at the release.
2. **M1, M2 and the live plan, by your hand,** below.

### By your hand: the main checkout first, then M1, M2 and M3

Type each line at the prompt, one at a time. The `!` runs it here, so its output lands in this conversation. Each
line starts with a `cd` into the main checkout, where the live env file already is, so no second copy of the live
key is made.

**Line 0, the main checkout.** It is on `phase-4-wonder-wall` at `92030b7`, clean apart from the two untracked
briefs. Git will not pull over an untracked file the pull brings in (`docs/theme-a-week-slice.md`). This deletes both
briefs, as decided at stop 1, then fast-forwards to this stop's commit:

`! cd /c/Users/BrandonReisen/Documents/quark && rm docs/theme-a-week-slice.md docs/second-stretch-slice.md && git pull --ff-only && git log --oneline -1`

The last line should be this stop's commit, "Report: rebased onto the release's records and pushed onto
phase-4-wonder-wall …". If it is not, stop there and tell me.

**M1: `plan:import:live`**

`! cd /c/Users/BrandonReisen/Documents/quark && npm run plan:import:live`

- **What it does:** writes the Moon's 16 rows into live's plan, and writes Egypt's 56 and the library's 168 again,
  unchanged.
- **What it touches:** **LIVE**, `plan_topics`. The code on Vercel ignores the Moon until the release (checked
  above), so Sunday 15 Nov's build of week 4 is unchanged.
- **How it is undone:** delete the Moon's rows by the key prefix `the-moon/`. No idea or card points at them before
  22 Nov.
- **Checked on test:** yes, above, from the same tree.
- **The pass:** the first line is `Target: LIVE (…)`, and the rest reads exactly as on test:
  `Ancient Egypt: 56 rows (4 weeks)`, `Short lessons: 168 rows (84 lessons)`, `The Moon: 16 rows (1 week)`,
  `Imported 3 files.` A library count other than 84 lessons means stop and tell me.
- **When:** today, straight after line 0. Saturday 14 Nov's week 4 job imports from the phase branch, which now
  holds the Moon too, so from here on every import carries both.

**M2: `content:fetch:live`**

`! cd /c/Users/BrandonReisen/Documents/quark && npm run content:fetch:live`

- **What it does:** fetches, flags and stores the Moon's 11 items. About $0.15, as on test.
- **What it touches:** **LIVE**, `content_items` and the private bucket. It prints nothing until it is done (about
  100 seconds on test; the 1 Nov bug line), so wait for the table.
- **How it is undone:** the items are unused until a card offers one; any item can be rejected at live's
  `/parent/content`.
- **Checked on test:** yes, at stop 2: 11 items, all approved automatically with no flags.
- **The pass:** the Moon's 11 items, each approved, and nothing new waiting.

**M3: the plan on live, spending nothing**

`! cd /c/Users/BrandonReisen/Documents/quark && npm run week:build:live -- --week 5 --start 2026-11-23 --plan`

- **What it does:** reads live's plan for week 5. **LIVE**, read only; it spends nothing and writes nothing.
- **What to expect today:** weeks 1 to 3 on live have used all 84 lessons, and week 5's 28 are not picked yet, so it
  stops before printing the days. The pass is this exact line:

  `Not enough short lessons for week 5: the look card needs 5 and 0 are left; the wonder card needs 6 and 0 are left; the listen card needs 6 and 0 are left; the then card needs 5 and 0 are left; the puzzle card needs 6 and 0 are left. Add lessons to plan/short-lessons.yaml and run npm run plan:import.`

- **How to read it:** those counts are the Moon's slots. Egypt's old reading would ask 7 a slot, and a missing Moon
  would say "No theme for week 5". The seven-day read with the real 28 is the Saturday 21 Nov job's.

### Then

The records for the release: docs/04, docs/08, `CLAUDE.md` *Where we are*, the README status and the board, as the
brief's step 5 lists. Then the last stop, stop 3: the release, before Sunday 22 Nov's 6 am firing.

**Size:** a slice, 8 hours. The clock ran 36 minutes to stop 1, 08:47 to 09:00 to stop 2, 10:48 to 10:53 for step 4,
and 12:43 to 12:47 today: about an hour in all.

**At this stop:** run line 0, then M1, M2 and M3, in order, and say yes or no to striking the math inbox row. Reply
go to take all of these.

### Line 0, M1, M2 and M3, by Brandon's hand (9 Nov, read here at 14:34 HST): all four passed

- **Line 0:** the main checkout fast-forwarded `92030b7..04a448b`. The two untracked briefs are deleted.
- **M1, `plan:import:live`:** `Target: LIVE`; Ancient Egypt 56 rows (4 weeks), short lessons 168 rows (84 lessons),
  the Moon 16 rows (1 week), 3 files. The library on live is unchanged, and the Moon is in live's plan.
- **M2, `content:fetch:live`:** `Target: LIVE`; the checks cost **$0.15**.
  - **Fetched:** 11 of 207 items, the Moon's 11, each approved with no flags.
  - **Live's library now:** 206 approved, 0 pending, 0 to check by hand, 1 rejected.
  - **The one rejected:** Egypt's old Musopen Handel. Its `rejected_at` was set earlier at live's `/parent/content`;
    this run only reads it.
- **M3, the plan on live:** `Target: LIVE`, then exactly the expected line: "Not enough short lessons for week 5:
  the look card needs 5 and 0 are left; the wonder card needs 6 …; the listen card needs 6 …; the then card needs
  5 …; the puzzle card needs 6 and 0 are left." So live reads week 5 as the Moon's. Nothing spent and nothing
  written.
- **Found at M3:** the refusal came out as a crash, with a Node stack trace under it, not a plain line.
  - **The cause:** `scripts/week-build.mts` catches errors from the build, but not from `prepareWeek()`, which is
    where both refusals come from, "Not enough short lessons" and this job's "No theme for week N".
  - **Next:** a Saturday job meets this line by design, so it should read as a refusal. This is the same mechanism
    as the brief's, so I fix it in this job: `Stopped:` and the message, "Nothing was spent.", and exit 1, as a build
    failure already prints. A test holds it.

### What I still need from you

1. **The math inbox row** (above): strike it. **Recommended: yes.** On yes, I delete it with the records.
2. **The Saturday row the brief names for the close:** "Saturday 21 Nov: week 6's theme and week 5's 28 short
   lessons", in project *Week 2 builds itself*, at *next*, with `docs/saturday-pick-slice.md` in Where. The brief
   adds it only on your yes.
   - **Recommended: yes, second in Next, straight after week 4's 32.** Its date comes before the others.
   - On yes, it goes in with the records.

**On go:**
1. The plain refusal, with its test. Then `npm test` and `npm run typecheck`.
2. The records, as the brief's step 5 lists them: docs/04, docs/08, `CLAUDE.md` *Where we are*, the README status
   and the board. This row stays at *building*; `/wwc:release` moves it to *live*.
3. Push, then the last stop, stop 3, written here.

**Size:** unchanged, about an hour of the job's 8. The clock stopped at 12:47, and the time since was the stop's.

Reply go to take all of these.

### Go (9 Nov, 14:34 HST)

Brandon: "All four lines are in and passed. No to striking the math inbox row: keep it, the math proposal is being
reworked in the chat. Go on to the records and stop 3."

- **The math inbox row stays** at *not fully formed*. *Replaces* my recommendation to strike it. `CLAUDE.md` no
  longer says it is deleted at this merge.
- **The Saturday row is taken with go.** Brandon's reply did not name it; the stop said go takes all of these, and
  this was the one question his reply left open.
- **The plain refusal is taken with go.**

## Stop 3 (9 Nov, 14:39 HST): the release

### Where the job stands

Every step of the brief is done.

- **The plain refusal** (`db9f25a`). `week:build` catches a refusal from `prepareWeek()` and prints it as a stop,
  then exits 1:

  ```
  Target: test (mnftudfnnfvxilnmwvvo.supabase.co)

  Stopped: No theme for week 6: the plan's stretches reach week 5. Write plan/<theme>.yaml with sequence: 3 (one week: seven topics), then run npm run plan:import.
  Nothing was spent.
  ```

  - That is `npm run week:build -- --week 6 --start 2026-11-30 --plan` on test, which has no sequence 3. It spent
    and wrote nothing.
  - A wiring test in `core/curation/wiring.test.ts` holds it.
  - **Tests:** 442 pass, and the typecheck is clean.
- **The records** (`8cf564d`):
  - **docs/04, "The long-term plan":** a theme a week, the Saturday pick, how a week's stretch is found, and the
    Hawaiʻi standard.
  - **docs/04, the rest:** "How a week is mixed" says "the thread has ended" only after a stretch's last topic, and
    that a week from week 5 needs 28 by its theme's slots. "How the Sunday build is built" lists the new refusals.
  - **docs/08:**
    - *When the thread runs out* (16 Oct) is closed.
    - *A theme a week* has every decision of the job, quoting Brandon: the brief, go at stops 1 and 2, the Moon on
      live, the math row kept, the Saturday row and the plain refusal.
  - **The board:** "Saturday 21 Nov: week 6's theme and week 5's 28 short lessons" is at *next*, second, after
    week 4's 32. It depends on *A theme a week*. This row is still at *building*; the release moves it to *live*.
  - **`CLAUDE.md`, *Where we are*:** a bullet for this job, and the Next list.
  - **The README status:** a sentence on the theme a week.
- **The money:** $0.30 in all. $0.15 on test (`content:fetch`, 8 Nov) and $0.15 on live (`content:fetch:live`,
  9 Nov), both on content flags. No week was built, and no card was written.
- **On live:** the plan and the Moon's 11 items, by Brandon's hand. On Vercel: nothing yet.

### The release: what it does

`/wwc:release` closes this job, then moves `main` up to `phase-4-wonder-wall`.

- **What the command does.** `main` (`3af36b8`) is an ancestor of the phase branch, so the release is a fast-forward,
  and Vercel deploys `main` to production. It carries this job's commits and `92030b7`, the last release's own
  records.
- **What it touches: LIVE, the production site the boys use.**
  - **The Sunday build's code:** `prepareWeek()` finds the week's stretch from every stretch's sequence. Nothing a
    child sees changes; the wall, the voice and the judge are untouched.
  - **No migration,** so the migrations workflow does not run.
  - **Sunday 15 Nov:** if the release is before then, the new code builds week 4. The schedule test holds weeks 1
    to 4 exactly as before: Egypt's last three topics on days 1 to 3, then five short lessons a day.
- **How it is undone.** In Vercel, promote the previous production deployment (`3af36b8`) again, or revert the
  commits on `main` and push. Nothing in the database depends on the code: the Moon's rows on live are read only by
  the new code.
- **What was checked on test:** 442 tests, the typecheck, week 5's plan (the Moon's seven days), week 6's refusal,
  and stop 2's look.
- **The deadline** is before Sunday 22 Nov's 6 am firing, which builds week 5. Without the release, the old code
  takes Egypt as the only thread, so week 5 has no theme and needs 35 short lessons. With the 28 picked on 21 Nov,
  the firing refuses and no week 5 is built.
  - **My recommendation: release now.** That leaves Saturday 14 and Saturday 21 with the same code on the branch as
    on Vercel, and a week of room if anything is wrong.

### After the release (Brandon's hands, none needed now)

- Saturday 14 Nov: the week 4 job, the top of Next.
- Saturday 21 Nov: the first Saturday pick, `/wwc:job docs/saturday-pick-slice.md`.
- Two branches can go:
  - the local branch `worktree-theme-a-week`;
  - this worktree, once the session ends.
  The remote branch is already deleted.

**Size:** a slice, 8 hours. About an hour and 10 minutes in all: 36 minutes to stop 1, 08:47 to 09:00, 10:48 to
10:53, 12:43 to 12:47, and 14:34 to 14:39.

At the last stop, type `/wwc:close` to close and hold, or `/wwc:release` to close and release.
