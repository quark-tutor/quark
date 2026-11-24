# Report: the week builds with nobody's hands (`docs/week-without-hands-slice.md`), 23 November 2026

Brief: `docs/week-without-hands-slice.md` (phase 3 work, project *Week 2 builds itself*), on `phase-4-wonder-wall`.
Started Monday 23 November 2026, 20:46 HST. Size: a slice (8 hours).

## Stop 1: the design, on one page (20:54)

**Where it stands.** Read: the brief, both hand-build reports, docs/04's build sections, the Saturday brief's
*Decided already*, the schedule, the week job, the Sunday build, the import, the content adapters, the prompts, the
boat check and docs/08's bugs and newest decisions. Nothing written or run, apart from five read-only searches of the
open sources' public APIs (below). `phase-4-wonder-wall` is checked out, and the brief names it. Every line under
*What Code will meet* is true as written; one adds to it: `plan:import` deletes only rows under its own file's key
prefix (`short/`), so a lesson kept under another prefix survives with no change to it.

### 1. Where the writing runs

- **A new route, `/api/cron/lessons`, six times every day** (1, 5 and 9 am, 1, 5 and 9 pm Hawaii; six Vercel entries,
  each once a day, as Hobby allows). Each firing finds the week the next Sunday build makes (the same rule as the
  Sunday build), counts what that week needs per tile against the unused lessons, and writes what is short: up to 5
  lessons, side by side, stopping at about 200 seconds. A firing with nothing to write writes no row and spends nothing.
- **How far ahead:** exactly the next unbuilt week, no more (Brandon: "not stock a big pantry"). From Monday, it writes
  for the Monday after; 28 lessons at about 5 a firing is about six firings, so the week is written by Tuesday.
- **A doubled firing:** the same lock as the Sunday build (start rows in `audit_log`, action `lessons.write`; only the
  earliest unended firing in ten minutes goes on), and a lesson's key is unique, so a second copy of one is refused.
- **A missed firing:** the next one carries on; there are about 40 a week for a week's worth of work.
- **The Sunday build writes what it lacks** (brief, 2). If the day a firing is about to build has a tile with no
  lesson, it writes that day's missing lessons first, under the same lock, then builds if there is time, else the next
  firing builds. **So the Sunday build fires every hour, 6 am to 9 pm (16 entries, not 8)**, leaving nine spares.
- **Recommended:** as above.

### 2. How an item is found, with no person searching

- **The idea first.** One call (the curate model) proposes ideas for the short tiles, given each tile's job, every
  title already in the plan (no idea repeated), the subjects lately on that tile, what the lessons lean on (22 Oct),
  and the rules below. Each idea comes with its English Wikipedia article and search words.
- **Then the search, in code:** the Met's v1.1 search, the Art Institute's search and Commons' file search (all three
  answered tonight, read-only; the Met's v1 says it was retired on 1 Oct). Every candidate is then fetched **through
  the real adapter**, so its license is read exactly as `content:fetch` reads it.
- **The license:** a picture only when CC0 or public domain, as now. **A recording only when its Commons page carries
  CC0 or a US public-domain template** (`PD-USGov…`, `PD-US…`), read from the page's templates; anything else is
  skipped. Musopen is never searched (checked by hand).
- **The writer sees up to four candidates**, their records and their thumbnails, and takes the one or two that show
  the idea. Each is then fetched, stored and flagged as `content:fetch` does (`syncItem`); a flagged one is not used.
- **A credit line that reads wrong is skipped** (a title carrying Wikidata codes, a doubled "Unknown author"), the
  only place this job meets tonight's *Found, not built* 2.
- **A dropped connection is retried once and then skipped**, never stopping the firing (tonight's *Found, not
  built* 1, for the app's own fetch only).
- **Recommended:** as above.

### 3. How a lesson's facts are checked with no Code session

- **What the writer may use:** the chosen items' own records and the idea's English Wikipedia article, fetched by
  code as plain text. It is read, never shown, linked or copied in. A museum record alone is a title, a date and a
  medium, too thin to write two summaries from.
- **The checker:** a second call, on the gate model, reads each summary sentence by sentence against the same texts,
  and returns every claim they do not support, whether the lesson repeats an earlier idea, and which values points it
  touches. A lesson with an unsupported claim is sent back once with the claims named; if any remain, it is not written
  and another idea is tried.
- **What it cannot catch:**
  - a mistake in the reference itself, or one the writer and checker both read the same wrong way;
  - **anything written after the lesson.** The ideas and card calls add their own numbers, comparisons and hints, and
    this slice does not touch them.
- **The test, the bug lines' seven loose facts:**
  - One is the kind it meets: "every snowflake has six arms… all of them have six" is in the snowflake lesson's own
    summary today, and Wikipedia's article says most snowflakes are irregular.
  - Six were written later: about 700 years called "a few hundred"; about 650 called "a thousand"; Seurat's green "not
    painted anywhere"; the fossil's cause and effect backwards; sunrise times changing from year to year; "the exact
    number is about 3.14".
  - The gate's reader notes stay the only check on those, as now. The 23 Oct bug line stays open: the same checker
    run on each idea chain would meet them, about $1.50 a week (*Found, not built*).
- **Recommended:** Wikipedia as the reference, the checker as above.

### 4. Values points on a lesson the app wrote

- **The app writes only lessons that touch no values point.** 140 of the library's 144 touch none today.
- The checker tags each lesson against the 24 points, and a lesson it tags with any point is not written.
- The gate still reads every card against the family's rulebook, as now.
- **Recommended.** A lesson that needs a values point stays a Code job's, with the parents.

### 5. Where an app-written lesson is kept

- **In `plan_topics`, as now:**
  - keyed `app/<key>/<band>` rather than `short/…`, with kind `short`;
  - positioned after every file lesson (from 100001), in the order written.
- `plan:import` deletes only `short/…` rows its file no longer has, so these survive; a test holds it.
  `content:fetch` still sees their items.
- **No migration for that.**
- **One migration, for the money:** `model_runs.kind` gains `lessons`, so each writing firing's spend is on
  `/parent/models` beside the build's. Its whole SQL, for review here:

  ```sql
  -- model_runs.kind gains 'lessons': one row per firing of the app's lesson writer (docs/04), counts and money only.
  alter table model_runs drop constraint model_runs_kind_check;
  alter table model_runs add constraint model_runs_kind_check
    check (kind in ('week:build', 'content:fetch', 'gate', 'judge', 'label', 'lessons'));
  ```

  It is applied on test by the workflow when the branch is pushed. On live it is `npm run db:push:live -- --yes` by your
  hand at stop 3, before the push to `main`. Without it, the spend would be only in the audit rows, and the models
  page would undercount every week.
- **Recommended:** the migration.

### 6. A week with no theme

- It is called **"Week 6: short lessons"**, the title the code gave before *A theme a week*.
- Every tile takes the next unused lesson written for it.
- `stretchForWeek()` stops refusing: a week no stretch holds has no thread.
- **The trap, and a rule for it.** Once a week is built with no theme, a theme file written later by a Code job would
  be counted onto that week, not the next. **Recommended: no theme written by hand until the next slice**, whose
  themes name their own week. Until then every week is short lessons alone.

### 7. No Puzzle while the boat is here

- **The family test.** The build asks whether the boat is here for every child of the family, from the same tables
  and the same promise check as `lib/boat-here.ts` (one setting for both boys).
- **When it is here:**
  - the week's tiles are look, wonder, listen and then: 16 ideas and 16 cards a day for each boy, not 20;
  - a week keeps the tiles of its first built day, so a change of tables on a Sunday cannot mix them;
  - the week page counts four tiles a day and says the week has no Puzzle cards while the boat takes Puzzle's place.
- **If the tables go to *Not yet* in the middle of such a week,** there is no Puzzle tile until the next week.
- **A theme's puzzle topic** is not built while the boat is here. It is moot until the next slice, since there are no
  themes now.
- **Recommended.**

### 8. Where nothing can be found

- After three ideas for a tile find no open item, the writer writes that tile's lesson **text only**, rather than leave
  the tile empty. `/parent` names it. Brandon: "The only reason a day should be short is if a parent blocks a tile."
- A first card the card checks hold back still leaves its tile empty, as now. Releasing one is the week page's slice.
- **Recommended.**

### 9. What it holds to, with no pick

- **Held as Code was held:**
  - the idea named in every title, and no idea repeated;
  - what the lessons lean on;
  - open sources only, and music Quark cannot hold is never linked.
- **The app writes no Hawaiʻi lesson.** The Hawaiʻi standard needs sources deeper than an encyclopedia and the parents'
  judgment, which an unattended writer has neither of.
- **Holidays are not placed on their days** in this slice.
- **Every listen lesson has a recording Quark holds.** A "a parent plays it" lesson stays a Code job's.
- **Recommended.**

### 10. What a week costs

| | Today (week 5) | From week 6, boat here |
|---|---|---|
| Lessons: idea, writer, checker, flags (about $0.18 a lesson, a quarter of tries thrown away) | by hand | $5 to $7 |
| Ideas, cards, gate | $14.33 | about $11.50 (four tiles of five) |
| **A week** | **about $14.50** | **about $17 to $18.50** |

- Each run is far under the $25 line: a writing firing is about $1, and a Sunday day about $1.65.
- With the boat off, a week is 35 lessons and about $22.
- This job on test is about $20 to $25 in all, every run far under $25:
  - writing test's week 6 (about $6), once more after any fix (about $6);
  - building it (about $11.50).

### 11. What `/parent` says

- **A line under the Sunday line**, in one of three forms:
  - "Short lessons for week 6 (from Mon 30 Nov): 28 of 28 written by the app, Tue 24 Nov, $6.10."
  - while it writes: "…: 12 of 28 written; it writes more at 5 pm."
  - after a failure: "…: 20 of 28; the 1 pm try failed: <the reason>. Sunday's build writes what is missing first."
- **Under it, folded,** each lesson the app wrote for that week, with its tile, its title and its item's source, any
  text-only one named, and each firing of the last seven days: when, how many, $.
- **The Sunday line** adds "; it wrote 3 short lessons first" when a Sunday firing wrote.
- The models page counts `lessons` runs.

### 12. Does it fit by Saturday 28 November?

- **Yes, with a day to spare:** about 12 hours of Code's time. Stop 2 by Wednesday 25 Nov, the release Thursday or
  Friday.
- **What happens after the release:** the lesson firings write week 6's 28 on live before Sunday, and Sunday's
  firings build it.
- **If it runs late, cut in this order,** so 1 and 2 are live by Saturday 10 pm:
  1. the folded list on `/parent` (its one line stays);
  2. no Puzzle (3): the week then needs 35 lessons and costs about $22, still under the line.

### The stops, read against the test

- **Stop 2, *Your look*,** checks direction (would you tap a week nobody picked).
  - It is not a first touch: no new screen goes into anyone's hand, only lines on `/parent` and a note on the week page.
  - **Go takes its three checks reworded in the shape:** each opens with its link on test's dev server and ends Pass □
    Fail □.
  - Before it, on test, by Code:
    - test's one built week is renumbered week 5, so its next week is 6 with no theme, as on live;
    - test's unused file lessons are deleted (`plan:import` on test brings them back);
    - the boat's tables are set on test if they are not;
    - the lesson firings, then the Sunday firings, run through the dev server.
- **Stop 3** guards `main`, live's database and what the boys see from Sunday: the release, with the one migration by
  your hand first.
- **Nothing between go and stop 2 needs your hands.** The writer uses the model names and key already in Vercel's
  Production, and the same `CRON_SECRET`. No planned command meets the deny list.
- **Risky steps:**
  - the live migration (stop 3, your hand);
  - the money: test runs, each far under $25; on live, after the release, about $17 a week spent by the app itself;
  - what a child sees: only cards that pass the gate in a week a guardian taps.

  No real person is sent anything, and no secret is new.

### The board

- This brief has no row yet. The top of Next is *Saturday 28 Nov: week 6's theme and 28 short lessons, and week 7's
  theme*, and nothing is in hand.
- **I need your word to take this job ahead of that row**, and to add this job's row at *building* under *Week 2 builds
  itself*, as the brief says. Recommended: yes.
  - The Saturday row stays at *next* as the fallback.
  - The close proposes deleting it, on your yes.

### On go

1. `git pull --rebase --autostash origin phase-4-wonder-wall`.
2. The row at *building*, at the top, dated 23 Nov 2026, Where `docs/week-without-hands-slice.md`. It is committed with
   this report and the brief. The chat's `docs/week-page-slice.md` stays untracked.
3. Then the build:
   - the schedule (no theme, four tiles), the writer and its two prompts, the search, the route and its entries, the
     Sunday changes, `/parent`, tests;
   - the push, and the migration's workflow run watched;
   - test's week 6, written and built by the firings, and every check with a known answer, with pictures;
   - then stop 2.

**Reply go to take all of these:** this job out of order, with its row; Wikipedia as the reference; the migration;
lessons with no values point, no Hawaiʻi lesson and no holidays placed; hourly Sunday firings; text only as the last
resort; no theme by hand until the next slice; and stop 2's checks reworded.

## Go (21:10)

Brandon: "go, with four changes." Go took everything stop 1 offered, apart from these four, in his words:

1. "Holidays are placed on their days, as decided 28 Oct; the writer is given next week's dates and holidays."
   *Replaces* stop 1's "holidays are not placed".
2. "Never text only. A first card always has a picture or recording; try another idea until one is found."
   *Replaces* stop 1's text-only last resort (8).
3. "Themes keep working: a theme file names its week, so one written later lands on the week it names, and a week with
   none is short lessons alone. If this puts Saturday at risk, say so and leave it for the theme job." *Replaces* stop
   1's "no theme written by hand until the next slice".
4. "No whole Hawaiʻi lesson, but a Hawaiʻi tie-in line inside another lesson is allowed when the reference supports
   it."

And: "Also confirm Vercel's limit on the number of cron entries before building on 23 of them."

- **Vercel's limit, confirmed.** Its usage page for cron jobs (`vercel.com/docs/cron-jobs/usage-and-pricing`, last
  updated 15 Jul 2026) reads "Hobby | 100 cron jobs | Once per day | Per-hour (±59 min)", and "Expressions like
  `0 * * * *` (per-hour) … will fail deployment". So 23 entries fit, each once a day or once a week. The newer Schedules
  page (in beta) caps a team at 5,000 runs a billing period. 23 entries come to about 270 runs a month: 180 from the
  lesson firings, about 64 from Sunday's and 30 from the nightly lines.
- **Change 3 and Saturday.** A theme names its week in its one chapter's own `week:` line: `week: 7` holds family week 7.
  The Moon keeps `week: 1`, which means it is counted on from Egypt, as now, so live's rows need no new import. About
  an hour with its tests, so it does not put Saturday at risk. It is built here.
- **Holidays without storing a day.** The writer fills each tile's days in order, one lesson per tile per firing, so it
  knows the day each new lesson lands on. A holiday's lesson is written for the tile whose next open day is the holiday.
  The list is the US federal holidays and a few days everyone keeps. The Hawaiʻi days are not on it (change 4), but the
  writer is told them for a tie-in line. A holiday whose lesson would touch a values point gets none, and the report
  says so.

The row is at *building*, at the top of the board.
