# Math practice: the proposal

For Brandon and June. Written 8 November 2026 by Claude Code from the brief `docs/math-practice-brief-slice.md`,
and rewritten the same afternoon in fix round 1, after Brandon and June talked it through. It is an exploration:
nothing is built, nothing on test or live is changed, and no API money was spent. Each open choice has its options
and one marked **Proposed**; they are gathered at the end. The first version (one strand, a Practice tile ordered
from a published curriculum) is in git at `358b00b`.

**Decided (8 Nov 2026, fix round 1).** Brandon:

> June and I talked it through. Rewrite the proposal with two strands, built in this order:
>
> Strand 1, first: the puzzle slot becomes a math circle. One real problem a day with a mathematical idea inside it
> (parity, invariants, fair sharing into fractions, counting two ways, estimation), from a progression of ideas kept
> in a file, each problem about something someone actually built or figured out, with the person and the history in
> it; the hint conversation and the handoff do the teaching; the same idea comes back weeks later in a new costume.
> Sources: the public-domain puzzle literature (Dudeney, Loyd, Carroll) and the thread themes. No publisher. No new
> tile.
>
> Strand 2, later: the fluency floor, five minutes, as the Practice tile was proposed, but with no Illustrative
> Mathematics anywhere; the order from the grade standards, written by Code, the nudges in the school's methods.
>
> The frame, for docs/08: we prepare them for the future the way Walt Disney thought of it, as a place of progress
> and opportunity for people willing to look closely and try, where ingenuity and faithfulness to tradition build
> something better. Math is the tool of people who make things. The older boy starts a real math circle on
> Saturdays; the younger is too young for it, so this is his.

What stands from go at 12:32 (Brandon, with June's answers) is now strand 2's: eight problems a day, a try, a nudge,
then a person, never the answer, judged in code, and word problems last, only if the parents ask. The rest of that
version (its order of steps, its sources, its slices) is replaced by this page.

## In short

- **Two strands, in this order.** First, the puzzle card becomes a small math circle every day. Later, a five-minute
  fluency floor on a sixth tile.
- **Strand 1, the math circle.** The puzzle slot's card is one real problem with an idea inside it. The problem is
  about a real person who built or figured something out: Ahmes sharing loaves, Euler's seven bridges, Alcuin's
  wolf, goat and cabbages. Its four layers are a circle session in small: a small case, a bigger case, the pattern,
  and the why. The hints are a leader's questions, and the handoff gives the child something to do with a parent's
  hands. The problems come from a file, `plan/math-circle.yaml`, in an order that builds. **Proposed:** the file
  holds each problem whole, with its four questions and their answers, so a person reads the math once and no model
  remakes it on Sunday. Each idea comes back three weeks later in a new costume. It needs no new tile, no Saturday
  work and no new spend.
- **Strand 2, the fluency floor.** The Practice tile as proposed this morning: eight problems a day, about five
  minutes, judged in code, $0 a day. The order of steps comes from the Common Core grade standards, written by
  Code. The nudges teach the methods the standards themselves name (make a ten, place value, the number line,
  arrays). No Illustrative Mathematics.
- **The first slice** is the circle. It can be on the boys' iPads from week 5 (Monday 23 Nov) if it ships with the
  theme-a-week release by Saturday 21 Nov, and from week 6 (Monday 30 Nov) if not.

## 1. What June means

June's words, 8 Nov 2026:

> Q1: "Answering multiple math problems where the focus is on the math, not interpreting a verbal question."
>
> Q2: "They haven't told us the name, but they don't solve problems the way I did 30 years ago. I would guess Common
> Core is right."
>
> Q3: "Probably 5 is about right."
>
> Q4: "No. English."

The questions were these:

- Q1: what "tutored in a recognizable way" looks like to her.
- Q2: what the school's math program is called, and what each boy is on this quarter.
- Q3: how many minutes a day.
- Q4: whether the school teaches math in ʻōlelo Hawaiʻi.

What her answers settle now:

- **Q1.** Strand 2 is numbers only. Strand 1's problems come with a person and a story, by Brandon and June's
  choice. So the file keeps the story to a sentence or two and the question short and plain, and every card already
  has "Read it to me". The math is the point, not the reading.
- **Q2.** Common Core. Strand 2's order follows its grade 2 and grade 3 codes. Its nudges teach the methods the
  standards name, which are the ones the school teaches. What each boy is on this quarter is not known, so a parent
  sets each boy's first step on `/parent`.
- **Q3.** Five minutes is strand 2: eight problems. Strand 1 adds no minutes, because it is the puzzle card the boys
  already open.
- **Q4.** English.

**What "recognizable" looks like on the iPad.**

- **Strand 1.** The Puzzle tile, as now. Inside, for example, a photograph of the Rhind papyrus and: "About 3,500
  years ago, a scribe in Egypt named Ahmes copied a scroll of math problems. One asks how to share loaves fairly. Two
  workers share 3 loaves. How much bread does each one get?" A wrong guess brings a question back ("What if each
  worker takes a whole loaf first?"), not the answer. A right answer opens the bigger case. The last hint sends the
  child to a parent, with three crackers to share.
- **Strand 2.** A sixth tile, *Practice*. One problem at a time, large: `38 + 5 = ▢`, a number pad, and "3 of 8".
  After the eighth, "That's today's practice." and the tile turns grey. No clock, no score, no stars.

**In the Sunday digest** (phase 5, still *someday*; on `/parent` until then), one block per boy:

> Math circle, this week: 6 problems. Fair sharing (Ahmes's loaves): to the third card, one clue. Counting two ways
> (Alcuin's ladder of pigeons): a person at the second card. Back from three weeks ago, odd and even (the 15
> puzzle): first card right with no clue.
>
> Practice: 6 of 7 days. Step: adding across a ten. Right the first time: 41 of 48. For a person: 38 + 5 and 27 + 6.

## 2. What to borrow

**No publisher** (Brandon). Strand 1 borrows from public-domain books and from the plan's own themes. Strand 2
borrows only the Common Core's codes. The first version's survey of curricula is in git and is not used.

Each status below was read on the source's own page on 8 November 2026, by an agent of this session.

| Source | What it gives | Its status, as its own page says it | In the public repository? |
|---|---|---|---|
| **Dudeney**, *The Canterbury Puzzles* (1907; Project Gutenberg 27635) and *Amusements in Mathematics* (1917; 16713) | Kayles (No. 73), the haberdasher's puzzle (No. 26), river crossings, measuring and weighing | Gutenberg marks each "Public domain in the USA", and the ebook says: "This eBook is for the use of anyone anywhere in the United States and most other parts of the world at no cost and with almost no restrictions whatsoever." | **Yes**, retold, with the book and puzzle cited |
| **Loyd**, *Cyclopedia of Puzzles* (1914; not on Gutenberg; archive.org's scan) | puzzles to retell with care, and a history to check (section 2's cautions) | archive.org marks it "Public Domain Mark 1.0" | **Yes**, retold; never its pictures |
| **Carroll**, *The Game of Logic* (1886; Gutenberg 4763), *Symbolic Logic* (1896; Gutenberg has the fourth edition of 1897, 28696), *A Tangled Tale* (1885; 29042) | syllogisms and the logic board; *A Tangled Tale* is too hard for these ages | as Dudeney's | **Yes** |
| **The older books they drew on**: the Rhind papyrus (translated by Peet, 1923, and Chace, 1927 to 1929), Alcuin's *Propositiones* (about 800), Archimedes' *Sand Reckoner* (Heath's translation, 1897, on archive.org), Bachet (1612; second edition 1624), Euler (1735), Fibonacci (1202); Rouse Ball's *Mathematical Recreations and Essays* (1892; Gutenberg 26839) as a guide to them | the oldest costumes | Published before 1931, so in the public domain in the United States. archive.org's Heath page states no licence of its own. | **Yes**, retold from the original or a translation published before 1931 |
| **The thread themes** | a costume on a theme's puzzle day | the plan's own files | **Yes** |
| **Common Core State Standards** (strand 2) | the steps' codes (2.OA.B.2, 3.OA.C.7 and so on) | "a limited, non-exclusive, royalty-free license to copy, publish, distribute, and display", "for purposes that support the Common Core State Standards Initiative", with the notice "© Copyright 2010. National Governors Association Center for Best Practices and Council of Chief State School Officers. All rights reserved." | The codes only, with each step in Code's own words, so no text of the standards is copied |

The pictures are checked one by one, as now. For example, the Met's impression of Dürer's *Melencolia I* (object
360018) is marked public domain.

**What is borrowed, and how.**

- **The problem and its history.** Both are retold in Quark's own words, with the source and its licence in the
  file, as every lesson in the library has.
- **Never a translation's words.** A modern translation can be under copyright even when the original is not: the
  only full English Fibonacci is Sigler's of 2002. Quark retells from the original, or from a translation published
  before 1931.
- **Pictures.** They come through `content:fetch` from the open collections, as every card's do.

**Two cautions for whoever writes the file:**

- **The history must be true.** Loyd claimed the 15 puzzle, which a postmaster, Noyes Chapman, made. The "3, 4, 5
  rope" of Egypt's builders is a modern guess, not a record. The best-known Gauss story (a boy adding 1 to 100) is
  told in numbers its first source does not give. Each history line is checked against a source and cited, or left
  out. That is also why Alcuin's ladder of pigeons, written down about 800, stands in for the Gauss story.
- **The old books carry their time's prejudices.** Loyd's *Get Off the Earth* drew its vanishing figures as
  caricatures. So a problem is retold in plain words, its picture is chosen fresh, never the book's own engraving,
  and the gate reads every card, as now (rule 1).

**The first ideas, in order.** These are hands-on ideas first (share, count, estimate), and odd and even before the
things that never change, since odd and even is the first of those. Weeks 1 to 3 of the circle meet the ideas, and
weeks 4 to 6 bring each one back in a new costume.

| | The idea | First meeting | Back in a new costume, three weeks later |
|---|---|---|---|
| 1 | Fair sharing, into fractions | Ahmes's loaves among ten men (the Rhind papyrus, Egypt, about 1550 BC) | Alcuin's three sons and thirty flasks, ten full, ten half full, ten empty (about 800) |
| 2 | Counting two ways | Alcuin's ladder of 100 steps, a pigeon on the first, two on the second… | Dürer's magic square, where every row, column and diagonal makes 34 (*Melencolia I*, 1514) |
| 3 | Estimating from a small part | Archimedes counting grains of sand by the poppy seed (*The Sand Reckoner*, about 250 BC) | a theme's costume: the Moon week's thirty Earths, or a later theme's |
| 4 | Odd and even | Euler's seven bridges of Königsberg (1735): every piece of land touches an odd number of bridges | Chapman's 15 puzzle, and why two tiles can never be swapped (Johnson and Story, 1879) |
| 5 | States and moves | Alcuin's wolf, goat and cabbages | a crossing from Dudeney's *Amusements in Mathematics*, which has a chapter of them (1917) |
| 6 | A plan that always wins | Dudeney's Kayles: leave two matching rows, then copy (*The Canterbury Puzzles*, 1907) | the race to 100, adding 1 to 10 each turn, as told of Bachet's book of 1612 (checked against his text in the build, or another costume) |
| 7 | Guess, check and scale | Ahmes's "a quantity and its seventh make 19", met first as a number and its half that make 9 | Fibonacci's rule of false position (*Liber Abaci*, 1202, chapter 13) |
| 8 | Something that never changes | Dudeney's haberdasher's puzzle: a triangle cut into four pieces that make a square, with the same paper | Loyd's vanishing-figure puzzle (he patented one in 1896), drawn fresh: count before and after, and nothing vanished |
| 9 | Weighing with a balance | Bachet's weights, 1, 3, 9 and 27 pounds (his second edition, 1624) | (the next block) |
| 10 | If this, then that | Carroll's syllogisms (*Symbolic Logic*, 1896) | Carroll's board of *The Game of Logic* (1886) |
| 11 | Growing patterns | Fibonacci's rabbits (1202) | (the next block) |
| 12 | Measuring what can't be reached | Thales and the pyramid's shadow (told by Diogenes Laertius and Plutarch) | Eratosthenes and the size of the Earth (about 240 BC) |

Six more of the same kind fill the first three weeks; the build writes them: the drawer principle (Dirichlet, 1834),
doubling to multiply (the Rhind papyrus), Napier's bones (1617), the Lo Shu square, Fibonacci's numerals (why a
zero matters), and a symmetry.
Where the puzzle slot already met an idea (the estimate of a flock, a tangram's area, knights and knaves, doubling),
the circle's first meeting counts as its return.

**Where it is kept: `plan/math-circle.yaml`**, beside the library. Each problem has:

- a key that is never reused;
- the idea's key and its name (ideas v5: an idea keeps its name when it comes back);
- the person and the history, in a sentence or two, with sources and licences;
- the four steps, each a question, its accepted answers and a line for the judge (layer 4: the rubric of a question
  to talk about);
- the leader's questions for the hints (try a smaller case, act it out, draw it, count it another way);
- a parent's part (`parent_note`, which the card prompt already turns into the first handoff);
- values points, as every lesson has.

A validator checks the file as `validateLibrary()` checks the library: every return comes three weeks after its
first meeting, every problem has a person and a source, and no hint holds an accepted answer.

## 3. What shape

The brief's shapes were (a) a sixth tile, (b) the puzzle slot on alternate days, (c) a page the parents open, and (d)
a set at the end of each puzzle card. Brandon's words settle the shape: strand 1 is the puzzle slot every day, with
no new tile, and strand 2 is (a).

**Strand 1, the details.**

- **The card.** The four layers are a circle session in small: layer 1 a small case a 7-year-old can act out, layer
  2 a bigger case, layer 3 the pattern or the real problem, and layer 4 the why, a question to talk about at dinner.
  The cards' rules stay as they are: guess first, two or three hints, the handoff, and a right answer opening the
  next layer. One day, whole:

  | Layer | The question | Accepted | Hints (questions, never the answer) |
  |---|---|---|---|
  | 1 | Two workers share 3 loaves fairly. How much bread does each one get? | one and a half; 1½; a loaf and a half | What if each worker takes a whole loaf first? / One loaf is left for two workers. How would you cut it so it's fair? |
  | 2 | Now four workers share 3 loaves. How much does each one get? | three quarters; 3/4; a half and a quarter | Could you cut two of the loaves down the middle first? How many pieces is that? / Then one loaf is left for four workers. How would you cut it? |
  | 3 | Ahmes shared 6 loaves among 10 men, and each got a half and a tenth. How many loaves did the halves use? | 5; five | Ten men each get a half. How many halves is that? / How many halves make one loaf? |
  | 4 | Ahmes wrote three quarters as "a half and a quarter". Why might that be a handy way to share bread? | (to talk about: you can see the cuts; everyone gets the same pieces; the big pieces come first) | |

  Handoff on the first card: "Get Mom or Dad, and share three crackers fairly between the two of you."
- **Who writes the four steps.** (a) **Proposed:** the file. A person reads the math and the answers once, before
  they ship, and the Sunday build turns them into each boy's words without changing a number. (b) The Sunday build's
  model writes them from a summary, as for every short lesson today: no new code, but a model remakes math problems
  and their answer keys every week, and the gate does not check arithmetic.
- **The rhythm.** (a) **Proposed:** blocks of six weeks. For three weeks the circle meets a new idea each day. For
  the next three it brings each one back in the same order, three weeks to the day after it was met, in a new
  costume and a step deeper. The next block goes on with new ideas and brings the first block's back once more. It
  is easy to read and check, and a return answered with no clue is the project's own measure of success (recall from
  three weeks earlier without hints). (b) Every week half new and half returns: the same spacing, harder to read in
  the file. (c) A week per idea, seven problems on parity: too long on one idea for a 7-year-old. (d) Returns chosen
  by code from each child's answers, sooner after a handoff: phase 6's work, later.
- **Both boys, or the younger.** (a) **Proposed:** both. An idea is shared and a card is written for each child, as
  for every slot today. The problems are pitched at the younger, whose circle this is, and layers 3 and 4 reach the
  older. (b) The younger alone, with the older keeping picked puzzle lessons: two kinds of puzzle slot and six more
  picks each Saturday. (c) A second file for the older: twice the writing. The older's Saturday circle needs no
  coordination, since Quark does not know its program. If a parent names an idea from it, the next block can bring it
  back in a costume.
- **A theme's puzzle day.** The Moon's week has one topic on the puzzle slot ("Distance, and about thirty Earths").
  (a) **Proposed:** a theme keeps at most one puzzle day, written as a circle problem in the theme's costume. That
  day is how "the thread themes" feed the circle. The file's next problem simply waits a day: `weekSchedule()`
  already takes a slot's next unused lesson only on the days the thread leaves it, so this needs no code. (b) Themes
  leave the puzzle slot to the circle.
- **The parents at the handoff.** The parent's part on the first card is something for the hands (crackers, coins, a
  drawing of the bridges). **Proposed:** `/parent` also shows today's circle problem for each boy, with its four
  questions and their answers, so a parent who is called over can look first. It is on slice 1's cut list.

**Strand 2, the details, as decided at 12:32 and still standing.**

- **The problems.** Eight a set, one set a day, with yesterday's misses first, up to three. There is no second set.
- **A wrong answer.** "Try again.", then the step's nudge, then "This one is for a person." The problem goes to the
  parents' list and comes back tomorrow, and an easier problem follows. The screen never shows the answer.
- **The level.** It moves up after a set answered all right the first time, back after two problems in one set go to
  a person, and either parent can move it on `/parent`.
- **No voice on practice** (problems are digits; Talk can hear "fifteen" as "fifty").

What changes from that version:

- **The order of steps.** Code writes it from the grade standards' codes, with no curriculum behind it.
- **The nudges.** They teach the strategies the standards themselves name, which are the school's methods. Each
  nudge is written once per step and never holds a number from the problem.

## 4. Judging in code

- **Strand 1.** Today's judge, unchanged: the model, with the word rule when it is slow. It compares a guess with
  the accepted answers the file holds, which a person has read. A circle answer is often a reason ("because each land
  has three bridges"), which code cannot judge and the judge already does. The spend is the puzzle slot's today,
  about $0.00018 a judged answer. The Sunday build's spend falls a little, since the puzzle slot's chain comes from
  the file and not from a model call (one of five ideas calls a day).
- **Strand 2.** Every answer is judged by code, with no model call: **$0 a day.** Whole numbers are the digits
  typed, with spaces and commas taken out. Later, only if asked: fractions by value (or by form, when the step asks
  for one), times, money and units.
- **What neither can judge:** a drawing, the working shown, or a number line marked. Those go to the person at the
  handoff.

## 5. The rules

- **Rule 3 (hints, never answers).**
  - *Strand 1* is the cards' rule as it stands: the hints are the leader's questions, the hint check holds that none
    says an accepted answer, and the handoff sends the child to a person with something to do. Nothing strains.
  - *Strand 2*: a try, a nudge, then a person. The strain, named this morning: a fact like 7 × 8 is not discovered.
    Keeping the rule sends it to a person and back tomorrow. It was decided at 12:32: keep the rule.
- **Rule 4 (no engagement hooks).** Neither strand has a streak, points, stars, a timer or "you missed a day". The
  circle is the card the boys already open. The floor is short, its end is in sight ("3 of 8"), and it has no second
  set. What brings a child back is the problem itself and the person at the handoff, not a reward.
- **Rule 5 (nothing unchecked) and the gate.**
  - *Strand 1*: every circle card is a card and passes the gate, as now. The people and histories carry values
    points like any lesson, and the gate reads them.
  - *Strand 2*: generated sums do not go through the gate. They hold no subject the rulebook could hold back, and the
    parents read the steps file before it ships (decided at 12:32).
- **Rule 7 (minimal data).**
  - *Strand 1* records what a card records now: `sessions` and `attempts`.
  - *Strand 2* adds one row per answer and each child's step (decided at 12:32; *touches rule 7*).
  - Neither sends anything new to a model.
- **Rule 8 (effort words).** The frame says it: the future belongs to "people willing to look closely and try." A
  costume tells what its person noticed and tried (Ahmes cut the loaves in halves first; Euler counted the bridges on
  each piece of land), never that they were a genius. The floor's words stand: "Try again.", "This one is for a person.",
  "That's today's practice."
- **Rule 1 (not a brainwashing engine).** The costumes come from many places and times: Egypt, Greece, Charlemagne's
  court, France, Königsberg, Victorian England, the themes. A tradition is shown with respect ("faithfulness to
  tradition"), and an old book's prejudice is left out, as in section 2.
- **Rules 2 and 6.** Either guardian moves a floor step. The ideas and steps go by grade, never by a child's sex.

## 6. Where it fits what exists

**Strand 1:**

- **The file.** `plan/math-circle.yaml`, its validator, and `plan:import`, which writes each problem into
  `plan_topics` as a puzzle-slot lesson, in the file's order.
- **One migration.** A `steps` column on `plan_topics` (null for every other topic) holds the four steps. Applied to
  test by the workflow, to live at a stop by Brandon's hand.
- **The schedule.** `weekSchedule()` takes the puzzle slot's lessons from the circle, in order, unpicked.
- **The ideas.** `writeIdeaChain()` makes the puzzle slot's chain from the file's steps, with no model call.
- **The card prompt.** `card.md` gains a circle section (v7): keep every number and question as written, hints as a
  leader's questions, the handoff with the parent's part.
- **The Saturday pick.** It no longer picks puzzle lessons: 22 a week, not 28 (the Moon's week: look 5, wonder 6,
  listen 6, then 5). Its brief changes its counts.
- **The circle's next block.** Code writes it about every three weeks, ahead of time, for the parents' read.
- **Untouched:** the gate, the judge, the wall, the night's lines and the digest.

**Strand 2** (as proposed this morning, without its curriculum):

- **The steps file.** `plan/practice.yaml`: each step with its Common Core code, a title for the parents, its kind
  and number ranges, and its nudge.
- **The rest.** Problems made on the server from the step, the child and the day. A new `practice_answers` table
  and one column on `children` for the step a parent set. The tile, `/kid/practice`, `/api/kid/practice` through
  `lib/wall.ts`, and a *Practice* block on `/parent`. The Sunday build and the Saturday pick are untouched.

## 7. The build, sliced

1. **Slice 1: the math circle in the puzzle slot** (a job). The file's first three weeks (18 problems), the
   validator, the import, the migration, the schedule's puzzle queue, the chain from the file, card v7's circle
   section, the Saturday brief's counts, and the `/parent` block of today's problem. Cut list if it runs long: the
   `/parent` block (the handoff's parent part stays). On live from week 5 if it ships with the theme-a-week release
   by Saturday 21 Nov; otherwise from week 6.
   - *Look:* **Where** the stop's report, with `npm run week:build -- --week <n> --plan` on test pasted whole; then
     June's iPad as Bug, against test.
   - **Do** read the week's puzzle slot; open day 1's Puzzle card; guess wrong twice on the first card, then right;
     go on to the third card.
   - **See** in the plan, the circle's first problems on the puzzle slot in the file's order (the theme's puzzle day
     aside). On the iPad, the card's numbers as the file has them, hints that ask and never tell, the next card on a
     right answer, and the parent's part in the first handoff.
   - **Pass** if no hint or handoff gives an answer and every number matches the file. **Fail** if a number differs
     from the file, or a hint says an answer.
2. **The circle's next block** (an hour, then every three weeks). The returns of the first 18 ideas, in new costumes,
   for the parents' read before they ship. It is a standing row like the Saturday pick, due before the circle's
   week 4.
3. **Slice 2: the fluency floor, whole numbers** (a job, later). The steps file for both boys, written by Code from
   the codes: the younger from sums within 20 (2.OA.B.2) to adding and subtracting within 100 (2.NBT.B.5); the older
   from multiplying by 2, 5 and 10 to division as a missing factor (3.OA.C.7). Then the generator, the judge in code,
   the level rule, the table, the tile, the page, the route and the *Practice* block.
   - *Look:* **Where** June's iPad as Bug, and `/parent` in the laptop's browser.
   - **Do** tap Practice; answer three right; type a wrong answer three times on the fourth; finish the set.
   - **See** "Try again.", the nudge, "This one is for a person.", an easier problem next, "3 of 8", and the tile grey
     after the eighth; on `/parent`, the fourth problem with the three answers.
   - **Pass** if no answer is ever shown and nothing can be tapped but the pad, "That's my answer" and "Back to the
     wall". **Fail** if an answer is shown or a second set starts.
4. **Later, only if the parents ask:**
   - fractions, time, money and units on the floor;
   - word problems, last;
   - both strands' blocks in the digest when phase 5 comes;
   - returns chosen from each child's answers in phase 6.

## 8. What this does not solve

- **A method a child does not have.** The circle teaches through problems and a person, and the floor drills facts.
  Neither explains a method from scratch: that is a person, or later the tutor (the Ask box and hints as a
  conversation, *The tutor* project).
- **The talk.** A real math circle is children and a leader talking. Quark's circle is one child and a screen until
  the handoff, and the handoff is where the talk happens. For the older boy, Saturday's circle is the real thing;
  Quark's daily problem only sits beside it.
- **Working and drawings.** Neither strand can judge them.
- **The 28 Oct inbox rows.** The circle answers part of both: a different kind of learning on the wall, and a more
  Socratic card (hints as a leader's questions). Neither row is closed by it.

## The decisions

**Decided in fix round 1 (Brandon, 8 Nov 2026, quoted at the top):**

- two strands, the circle first and the floor later;
- the puzzle slot becomes the math circle, with no new tile;
- one real problem a day about a real person, the ideas in a file, each coming back weeks later in a new costume;
- public-domain puzzle literature and the thread themes, no publisher;
- the floor with no Illustrative Mathematics, its order from the grade standards written by Code, its nudges in the
  school's methods;
- the frame, for docs/08.

**Decided at go (Brandon, 8 Nov 2026, 12:32), standing for strand 2:**

- a sixth tile, Practice: eight problems a set, one set a day, yesterday's misses first;
- a try, a nudge, then a person, never the answer;
- the level moves up after a clean set and back after two to a person, and a parent can move it;
- no voice on practice;
- judged in code, $0 a day;
- no gate for generated problems;
- a `practice_answers` table and the child's step (*touches rule 7*);
- word problems last, only if the parents ask.

**Proposed, for your reply:**

| | Decision | Proposed |
|---|---|---|
| C1 | "Public-domain puzzle literature" (section 2) | Dudeney, Loyd and Carroll, and the older puzzle books they drew on (the Rhind papyrus, Alcuin, Archimedes, Fibonacci, Bachet, Euler), retold in Quark's words, never a modern translation's |
| C2 | The file (section 2) | `plan/math-circle.yaml`, each problem whole, with its person, history, sources, four steps and answers, leader's questions and parent's part; checked by a validator |
| C3 | Who writes the four steps (section 3) | the file, read by a parent before it ships; the Sunday build words them for each boy and changes no number |
| C4 | The rhythm (section 3) | blocks of six weeks: three meeting ideas, three bringing each back three weeks later in a new costume |
| C5 | Which boys (section 3) | both, pitched at the younger, with layers 3 and 4 reaching the older; no tie to the Saturday circle beyond an idea a parent names |
| C6 | A theme's puzzle day (section 3) | at most one a week, written as a circle problem in the theme's costume; the file waits a day |
| C7 | History and pictures (section 2) | every history line checked and cited or left out; pictures chosen fresh, never an old book's caricature |
| C8 | The parents at the handoff (section 3) | today's problem and its answers on `/parent` (on slice 1's cut list) |
| C9 | The migration (section 6) | a `steps` column on `plan_topics`, to live at slice 1's stop by Brandon's hand |
| F1 | The floor's nudges (section 3) | the strategies the grade standards name (make a ten, place value, the number line, arrays, equal groups), written once per step by Code |
| B1 | The build (section 7) | slice 1 the circle; its next block every three weeks; slice 2 the floor, whole numbers; the rest only if asked |
