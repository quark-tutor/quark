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
