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
