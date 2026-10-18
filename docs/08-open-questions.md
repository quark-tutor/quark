# Open questions

Add to this list, or pick one up and open a discussion. Features and ideas that can be briefed and built are rows on [`docs/board.md`](board.md), where every feature stands; this page keeps the questions that are decisions for Brandon and June. A few items below were folded into board rows and are deleted from here once phase 3 is merged.

## Product

- [ ] Which screens should the first version support: an iPad in a wall mount, a larger touch monitor, a TV in art mode?
- [ ] How much self-directed exploration versus parent moments? Is the wall the main event or a supplement?
- [ ] Where exactly are the limits on "Ask"?
- [ ] Do two parents share one digest, or does each get their own role?
- [x] Should a family start with the full plan, or with a single theme to test what sticks? **Decided (13 Oct 2026): one theme, Ancient Egypt,** as four weekly themes for grade bands 2-3 and 4-5. The full sequence comes after the pilot. **Replaced (16 Oct 2026): not four weeks straight.** Egypt stays as the first thread, beside short lessons; see "The plan: short lessons and child-chosen depth" below.
- [ ] What does a great parent digest look like? (Mockups welcome.)

## Content

- [ ] Which knowledge sequence should be the default backbone? Should families be able to swap it?
- [ ] How should sample weeks be written so they can be shared and reused?
- [ ] How do we handle content licensing beyond the public domain?

## Community and access

- [ ] How can this reach families in underserved districts, not only families already looking for it?
- [ ] Could schools, libraries or community groups run it?
- [ ] What should the project be called?

## First milestones

- [ ] Write one complete sample week (one theme across all touch points) for two ages.
- [ ] Mock up the Wonder Wall home screen and the parent digest.
- [ ] Define the content item format and the per-child profile.
- [ ] Build a small prototype that runs one theme on a tablet.

## Values interview: choices made while building compare and conduct

Defaults picked so the build could go ahead. Each is one line to change; Brandon and June decide.

- [ ] Which conduct setting is gentler? As built: no "say it out loud" before a hint is gentlest, then a gentle reminder, then required; quiet non-response is gentler than a one-line correction; warm praise is gentler than plain, and plain than none. An argument for the other way on rudeness: a calm correction may be kinder than being ignored.
- [ ] Until both parents answer a conduct item, the gentlest setting applies. docs/12 warns against a tone becoming the default by accident; is "gentlest until you both answer" the right accident?
- [ ] Where both parents choose "Not yet" with different ages, the older age wins per child. Should that count as a difference instead?
- [ ] Where both parents agree on a subject, both of their "What would you actually say?" notes go to the tutor. Should one parent's note need the other's agreement?
- [ ] Stories lean toward the child's own sex only if every guardian wants it; a difference in how kids learn to act becomes "a mix". Right defaults?
- [ ] The pack-level fields (`learns_to_act`, `match_exemplars_to_sex`) in all ten packs are outsiders' first guesses, with a one-line reason beside each. They need the same community review as the 24 points.

## Building a week: choices made while building ideas and cards

- [ ] How many days a week should carry new cards? As built: seven, so the wall has something new every day. The alternative is five weekdays plus one weekend card (a longer one, or one meant for doing with a parent), which saves about a quarter of the cost and leaves weekends for the family.
- [ ] One idea chain per day and slot is shared by both boys although they are in different grade bands. As built (decided 14 Oct 2026): layers 1-2 come from the 2-3 summary and layers 3-4 add the 4-5 material, and each card is written at its child's level, so the 7-year-old meets the deeper facts only if he taps that far. Is layer 3-4 material too much for a 7-year-old even at his level?
- [ ] The card prompt carries the child's nickname, age, reading level, one interest as a door and the things that bore him, nothing else (rule 7). It does not carry `careful_about` (a fear, a loss, a sensitive subject), which could matter in the week on death and the afterlife. Should it go to the card writer, to the gate only, or nowhere?
- [ ] The card prompt doesn't yet say how the family's tradition teaches a child to act (`learns_to_act`, `match_exemplars_to_sex`), which decides whom the cards point at as examples. Add it to the card prompt, or leave it to the gate?
- [ ] The sex prior's one lens: build for a boy, care for a girl. Docs/17 allows compete for a boy or story for a girl; story is already one of the shared lenses, and compete is opt-in, so they weren't the first choice. Right?
- [ ] Interests may open at most a quarter of a week's first cards: 8 of 35, spread through the week and taken in turn. Is a quarter of the first cards the right reading of "a quarter of what's shown"?
- [ ] The 3-4-5 rope in week 2 ("the rope that makes a right angle") has no open picture and stays text only (decided 15 Oct 2026). Should it become a parent activity instead: knot a rope into twelve equal spaces and pull it into a 3-4-5 triangle together? Options: a `parent_note` on the week 2 science topic, like the apple-slice experiment in week 3; a weekend card meant for doing with a parent; or both.
- [x] Should a slot's first card always carry a picture? **Decided (15 Oct 2026): check it in code and ask again.** When the topic has an approved item, layer 1 must use one; the idea chain is sent back once with the problem named, and if layer 1 still has none the chain is kept and the week report lists it. Layers 2-4 stay free to go text only. Built as step 2c; see docs/04, "How a topic gets its picture". The idea model chooses per layer whether to use an approved item. In the 15 Oct rebuild of day 1, every slot had one, yet layer 1 of wonder, listen and then came out text only (14 of 20 layers used an item). Options: tell the ideas prompt that layer 1 uses an item whenever one is approved; check it in code and re-ask once, like the card checks; or leave it to the model and list the first cards without a picture in the week report. A related gap: the listen topic's only item is a recording, so "instruments from paintings and tombs" has nothing to show; a Met harp or sistrum beside the Aida march would cover it.
- [ ] A card whose hints still give the answer away after one re-ask is saved as `blocked` with the reason, so it's never shown, and the build goes on. The alternative is to stop the build. Is holding back one card better than stopping?

## How the tutor sounds: raised reviewing the first cards (15 Oct 2026)

Brandon's review of the 14 Oct day 1 cards: a lot of words, one picture, and lines no human tutor would write. The worst was "Asher, you love art" on the listen card: it tells a child what he is instead of letting him see it for himself. Not a rule against definitional statements, which would bite later (calling a child a helper can be the right thing at the right moment). The question is the tutor's voice. Proposed as step 4d, after 2b, since a card that starts from a picture needs the picture.

- [ ] **A character, not a caricature.** The model's default voice talks *to* the child and reflects his profile back at him. Asking for a named teacher ("write this as Miss Frizzle") turns attention to the world instead. A caricature is made of habits (catchphrases); a character is made of what they care about and the choices that follow. Should Quark's voice be a written character sheet: what they care about, how they see the child, what they do (point, ask, wait, admit what nobody knows), what they would never do, and a dozen worked moments taken from the parents' review notes? Test it blind: one idea chain in today's voice, a described stance and a named teacher, read by both parents without knowing which is which.
- [ ] **The stoic as the first character.** Brandon's model: the gym teacher who frowns and shakes his head when you're goofing off and says nothing. Few words; assumes the child already knows; about what he's doing, never who he is; and it passes, with no grudge carried into the next lesson. His silence worked because he was there and had earned respect by being fair. On a screen, silence reads as nothing happened, so how does the stoic show anything? The calm session end on rushing (phase 4) may be his headshake.
- [ ] **One voice or several?** Great teachers didn't share a personality: humorous, caring, stoic, friendly all worked. What they shared was being real, caring about the subject, and taking the child seriously. Should Quark have one voice, or several by subject (a stoic for history, a humorous one for puzzles, a caring one for the week on death and the afterlife)?
- [ ] **The narcissist test.** Some teachers seemed great at the time and were narcissists in hindsight: their personality pointed at themselves. A model playing a charismatic teacher would fail this way. How do the parents check that the voice points at the subject and the child, not at itself? Rule 4 still holds: the great teachers had strong personalities and weren't your friends. The line is whether the tutor needs the child to come back.
- [ ] **The 'Asher, you love art' line specifically.** It comes from the interest-as-door mechanism (`cards.door`): the model announced the door instead of walking through it. Add to the card prompt that the interest chooses the way in and is never named to the child?
- [ ] **A review notebook.** As parents read cards, they write down each line that's wrong and what a good tutor would have said instead. These pairs become the worked examples in `core/prompts/manner.md` and in the character sheet. Where should the notebook live: a file in the repo, or a note field on the week preview page?
- [ ] **A second reader in the gate.** The gate (step 5) is already a second model call per card. Should it also read each card as an experienced teacher would and flag lines that sound wrong, as a judgement logged in `policy_notes`, not a rule?

## Faces: raised reviewing the first cards (15 Oct 2026)

Kids read a lot from very little. Asher can text almost entirely in memes and smiley faces. For phase 4, the Wonder Wall; to be designed together with docs/15, the reward engine.

- [ ] **The tutor shows a face: happy, neutral or frowny.** Proposed limits from the rules: happy is for effort, never for being right (rule 8, or it becomes a brilliance word in picture form); frowny is for behaviour (rushing, tapping through, rudeness), never for a wrong answer (rule 1 on shame, rule 3 on guessing first); neutral is the default, so the happy face stays rare enough to mean something. Risk: a happy face becomes a token the child chases (rule 4). Does the face fit the "guide, not a friend" line, and does it need the reward engine settled first?
- [ ] **The child answers with a face.** One tap at the end of a card ("how was that one?"): happy, neutral or frowny. It costs the child a second and tells the curation engine what landed, in line with docs/12, teaching that tests itself. Where is it stored, and how much weight does it carry against delayed recall?

## Review of the 2c rebuild of day 1 (16 Oct 2026)

Brandon's notes from `/parent/week/<theme>` after step 2c. Much better than 14 Oct: four different pictures on the first cards, a recording that plays, and the "Then" card pointing at the photo ("the lit-up towns along the river make the long stem of a glowing flower") instead of telling. Still to fix:

- [ ] **The door is still announced, more softly.** Listen layer 1 opens "Asher, imagine you're a painter": his art interest pulled into a music card where it doesn't fit. Same problem as "Asher, you love art". Belongs to 4d (see How the tutor sounds), and is the first entry for the review notebook.
- [ ] **Too many words.** First cards run about 100 words, and read_aloud repeats nearly all of it. Asher reads chapter books. Should a strong reader get read_aloud at all, or a shorter version? Should layer 1 have a word limit by reading level?
- [x] **Credit lines carry clutter.** Commons credits show the file's edit history ("Przykuta → [edit], 2010-11-08 19:27") and repeat the file name; Met credits appear twice (the credit line and the source line say the same thing). Clean up before anything reaches the iPads, like the earlier `w:` prefix fix. **Decided (16 Oct 2026): cleaned where the credit is shown,** by `credit()` in `core/content/credit.ts`: title; maker and date; source and license. The stored attribution isn't repeated, except the Met's accession number and credit line, which join the source line once. The edit trail, the source file's name, an edit's date, Wikidata codes and upload times are left out. The stored rows are unchanged, so the kid view can use the same function.
- [x] **A date reads wrong.** The Aida credit reads as if the Marine Band played it in 1871; 1871 is when Verdi wrote it. Credit lines should keep a work's date apart from the recording's. **Decided (16 Oct 2026): the work's date goes with the composer and the performance gets its own line** ("Giuseppe Verdi, 1871" / "Performed by the United States Marine Corps Band, …"). The recording's own date shows only where Commons gives one (Syrinx: composed 1913, performed 2006).
- [ ] **Two blocked hints may be good hints.** Listen layer 3 was blocked for both boys: "Put the three on a line: the pharaohs, 1871, and today. Which two are nearer together?" The check counts naming a question's choices as a giveaway, but here the choices are only the three things being compared, and the hint gives a way to work it out rather than the answer. Is the check too strict for comparison questions? A second case (16 Oct 2026, the first mixed day 1): the two-dice layer 1 card was held back for the 7-year-old because one accepted answer is "one and one", and his first hint asks "Does each one count?". The word "one" was in it, so the hint counted as giving the answer away, though it doesn't. Number words that are also ordinary words (one, two) may need to count only as numbers.
- [ ] **How much is one day?** A day is five cards (look, wonder, listen, then, puzzle), each with four layers: up to 20 cards per child. Layers 2-4 are taps the child chooses, so the floor is five. Is five first cards a day the right amount for a 7-year-old?

## The plan: short lessons and child-chosen depth (16 Oct 2026)

Decided by Brandon (16 Oct 2026), for step 2d:

- Decided (16 Oct 2026): a week is a mix. One slot a day carries the running thread (Egypt for now); the other four carry short lessons.
- Decided (16 Oct 2026): short lessons are units of their own: one idea chain (the usual four layers) on one slot, not tied to a stretch or a week.
- Decided (16 Oct 2026): Claude Code drafts the short-lesson library; Brandon and his wife pick.
- Decided (16 Oct 2026): for now, short lessons run in the plan's order. Steering by each child's interest comes after phase 4, when the wall gives signals.
- Decided (16 Oct 2026): both boys get the same short lessons for now (ideas stay shared); each card is still written at his own level and through his own lens.

- [x] **Four weeks on Ancient Egypt?** **Decided (16 Oct 2026): no, not four weeks straight.** A 7-year-old won't stay interested in one subject for a month, and a plan made only of month-long themes rules out important things that are short lessons (why we have leap years, how a lie differs from a mistake, what compound interest does). This replaces the 13 Oct decision's shape (four weekly Egypt themes), not its aim of testing what sticks. Egypt stays as the first thread.
- [x] **Short lessons as units of their own.** The plan should hold a one-day lesson (one idea chain, one slot) as easily as a stretch, with a library of short lessons beside the stretches. What does the format in `lib/plan.ts` look like for both, and what does a short lesson need (subject, slot, grade bands, sources) that a stretch topic doesn't? **Decided (16 Oct 2026): yes.** A short lesson is one idea chain (the usual four layers) on one slot, not tied to a stretch or a week. Claude Code drafts the library; Brandon and his wife pick. The format is proposed in `plan/candidates/short-lessons.md`; its open choices are under "Mixed weeks: the format and the build" below.
- [x] **A week is a mix.** Some slots follow a running thread (for example, one day of Egypt a week), and the rest carry short lessons from anywhere. How many slots or days go to threads and how many to short lessons, and who picks the short lessons: the plan's order, the engine, or the parents? **Decided (16 Oct 2026): one slot a day carries the running thread (Egypt for now), and the other four carry short lessons.** For now short lessons run in the plan's order; steering by each child's interest comes after phase 4, when the wall gives signals.
- [ ] **The child pulls the thread.** Brandon's example: one day of Egypt in a week, and Asher spends a long time on it, asking questions and going deeper. Next week the engine gives him a little more Egypt, or more lessons of a similar style. Which signals count (time on the card, layers tapped, questions asked, the child's face rating), how strongly does one week's interest move the next, and how does a thread rest when the interest fades? The signals come from the wall, so this is built after phase 4; the plan format can change before then. (Decided 16 Oct 2026: not before phase 4; until then short lessons run in the plan's order.)
- [ ] **The boys' weeks may diverge.** Ideas are shared by both children today, which keeps cost down. If each child's interest steers his own threads, some slots become per child. How much divergence is allowed, and what does it cost? **For now (decided 16 Oct 2026): no.** Both boys get the same short lessons and ideas stay shared; each card is still written at his own level and through his own lens. The question comes back with steering, after phase 4.
- [ ] **Coming back is a recall check.** A thread that returns after a break gives phase 6 a natural delayed-recall check (docs/12). Should the engine schedule returns on purpose?

## Mixed weeks: the format and the build (step 2d, 16 Oct 2026)

The proposal, with a first library of 28 short lessons, is in `plan/candidates/short-lessons.md`. These are the places where there's a real choice; **Proposed** marks the one Claude Code would build. **Decided by Brandon (16 Oct 2026): every Proposed option, and the seven subjects stay for now.** Built in step 2d; see docs/04, "How a week is mixed".

- [x] **Which slot the thread takes each day.** (a) **Proposed:** each thread topic keeps the slot it was written for, and the topics run in the file's order, one a day. Egypt's order is then, wonder, look, listen, then, puzzle in every week, so the thread meets every slot within a week; "then" comes twice as often because history or geography and literature both feed it. A topic's pictures and recordings still fit its slot (the listen day has a recording). (b) A fixed rotation (day 1 look, day 2 wonder...), and the topic is written for whatever slot comes up: an even spread, but Khufu would become a puzzle and a listen day of Egypt might have nothing to hear. (c) A fixed rotation, taking the next thread topic whose slot matches: slots stay honest, but the stretch runs out of order and Egypt's eight "then" topics pile up at the end.
- [x] **One library file or several.** (a) **Proposed:** one file, `plan/short-lessons.yaml`, with its own `sources` and its `lessons` in the order they run. (b) One file per subject: easier to browse, but the running order has to be stated somewhere else. (c) One file per lesson: suits sharing between families later, but the order and the sources are harder to see.
- [x] **How the schema tells them apart.** Today `plan_topics` has one row per week per band and one per topic per band, keyed `<stretch>/w<week>/<subject>/<band>`. (a) **Proposed:** one small migration. `plan_topics.kind` (`week`, `thread`, `short`) and `plan_topics.position` (a thread topic's place in its stretch, 1-24 for Egypt; a short lesson's place in the library); short lessons keyed `short/<key>/<band>`, with no week and no parent; and `themes.plan_week`, the family's week number in the plan, unique per family, by which a mixed week is found (today a theme is found by its one stretch week row, and a mixed week has none). Thread topic keys stay as they are, so nothing already built points at a missing row. (b) No migration: tell them apart by key prefix and an empty week, and find a theme by its `week_start`. Fewer moving parts, but the order of short lessons and thread topics would live only in key strings and the import.
- [x] **Which short lessons a week gets.** In the plan's order, each of the day's four open slots takes the next lesson written for that slot. (a) **Proposed:** "next" means not used by an earlier week of this family (a theme with a lower `plan_week`); a rebuild keeps the week's own lessons. Adding a lesson to the library changes only weeks not yet built. (b) Work it out from the order alone (week N skips as many lessons per slot as weeks 1 to N-1 used): no database read, but adding or cutting a lesson in the middle of the library shifts every later week, including weeks already built.
- [x] **When a slot runs out of short lessons.** (a) **Proposed:** stop the build before spending anything and say which slot needs more lessons. (b) Fill the slot from another slot's lessons (a picture lesson on the listen card). (c) Give the slot a second thread topic.
- [x] **When the thread runs out.** Egypt is 24 topics: all seven days of weeks 1-3 and three days of week 4. (a) The next stretch by `sequence` starts the next day, once there is one. (b) **Proposed for now:** days without a thread take five short lessons, and the week report says the thread has ended, until Brandon and his wife pick the next thread. (c) The build stops and asks for a thread.
- [x] **Does a short lesson's slot have to match its subject?** Egypt pairs look with art, wonder with science, listen with music, then with history, geography or literature, and puzzle with math. The draft keeps those pairs except once: humpback whale song is science on the listen card. (a) **Proposed:** any subject on any slot, since the slot is what the child does (look, wonder, listen, place in time, solve). (b) The fixed pairs, checked by the validator. Docs/17 says the five daily slots span art, science, music, history and a puzzle; with (a), a day may miss one of those.
- [x] **Do the seven subjects cover short lessons?** The draft fits every lesson into history, geography, science, art, music, literature or math: the lie and the mistake is literature (Aesop), knights and knaves is math. A subject for thinking and character (honesty, fairness, how we know) may be wanted later. Keep the seven for now, or add one? **Decided (16 Oct 2026): keep the seven for now.**
- [x] **Music Quark can't hold openly.** Beethoven's Fifth has no open recording of its first movement. **Decided (16 Oct 2026): music Quark can't hold openly is played by a parent, never linked from the kid view (rule 4), never copied in.** The lesson keeps a picture (Beethoven's handwritten first page), a parent note says what to play, and the first card's handoff asks the child to get a parent for it.
- [ ] **The overthrow of the Hawaiian Kingdom as its own lesson.** Aloha ʻOe is about the song and the queen who wrote it and touches no values point (decided 16 Oct 2026: the 1893 overthrow is left out of its summary for now). The overthrow could be a lesson of its own later, marked point 17 (explorers and colonization), after Brandon and June decide how it should be told.

## Models and costs: raised building the page (16 Oct 2026)

The page is read-only (decided 16 Oct 2026; see docs/04, "How the models and costs page is built"). Defaults picked so it could be built; each is small to change.

- [ ] **What the estimate is built from.** As built: the five most recent finished week builds, priced per day for ideas and per child per day for cards. Options: all runs ever; only runs that built a full week; or the most recent week alone. Five keeps one odd run from swinging it, but a one-day trial costs more per day than a full week would if the first day's chains are longer.
- [ ] **A spending line.** Should the page show a monthly limit the parents set, and say plainly when a month is past it? Not a notification (rule 4 is about kids, but the parents asked for under 30 minutes a week), only a line on the page and maybe in the Sunday digest. Options: no limit; a limit in `.env.local` beside the models; a limit set on the page, which would make the page no longer read-only.
- [ ] **Runs before 16 Oct.** The 14 Oct trial runs kept their replies in `.quark-debug/` (with token counts), and the 15 Oct day 1 printed only its total ($0.91). Leave them out, as built, or backfill the debug runs so the estimate starts with real numbers?
- [ ] **Clean credits at fetch time too?** As built, credits are cleaned where they're shown and the stored rows keep what the source said. Cleaning in the Commons adapter as well would make `content_items` tidy for a shared theme file later, but rows already fetched stay as they are unless fetched again.

## How Quark is built with Claude

Decided (16 Oct 2026), "Working with Claude, slice 1" (`docs/working-with-claude-slice-1.md`); a tooling change, not phase work, so it lives on `working-with-claude` and is merged to `main` when it runs. Nothing here touches a screen.

- **The close-check list.** Money (API spend), anything that communicates with a real person, and any database migration on live get a real look before they happen. Everything else runs under the existing rules.
- **Auto mode stays, with an ask-list.** `.claude/settings.json` (`permissions.ask`, nothing in `deny`) stops and asks first. The command's description line carries all three plain-words facts itself, compressed: what it does, what it touches on live (LIVE in capitals for the live database), whether it can be undone. Chat lines above it are extra. *Replaces* the rules written into individual prompts ("don't kill processes", "a new migration always stops").
- **Two outputs.** Every job ends with the full report, unchanged, then the four-line read-back from the `readback` reader on Sonnet (`/readback <brief>`). Under *On live* the reader says when a stop fired but was approved. *Replaces* the builder summarising itself.
- **One writer per working tree.** The chat never edits files in the folder while a Claude Code session is open in it; a second job uses `claude --worktree`.
- **Sonnet for a briefed job**; Opus or `opusplan` when the brief leaves a design choice open.
- **A bug seen is one line under Bugs below, not a brief.** One sweep job fixes a batch.
- **In Quark a dry run against the live database is not a safe proof.** The live project is never used to prove a rule. There is one Supabase project and it is the boys' live copy. `db:push` stays an ask, not a block.
- Built differently from the brief, as at PDERP: no `defaultMode` line (Claude Code ignores it in a project file and auto is already the start mode); `/readback` runs in the main session, not as a forked skill.
- Proven 16 Oct 2026: the pushes to `main`, `Remove-Item` and `npm run db:push` asks all fired and named their rules. The `db:push` one was approved by hand and the command ran, which is why the rule above exists.

### Working with Claude, slice 2: the board and the seven session skills

Decided (17 Oct 2026), `docs/board-slice.md`; a tooling change on `working-with-claude-2`, merged to `main` when it runs.

- **Decided: one board per repository.** `docs/board.md` is Quark's own, a copy of PDERP's shape with Quark's stages; the two boards never read each other. Public: no row names a child or a nickname; "the boys" is the most a row says.
- **Decided: no Word copies.** `npm run docs:board` writes `Quark board.html` at the repository root (not tracked) and nothing else; there is no `docs:word`.
- **Decided: seeded from this page and the build order.** Open questions that name something buildable became rows; bugs stay bugs and show on the page as a count per phase. The items folded into rows stay here until phase 3 is merged, because that branch has edited the same lines; deleting them is a row on the board.
- **Decided: the seven skills are copied from PDERP and adapted** (`/idea`, `/ask`, `/job`, `/side`, `/bugs`, `/sweep`, `/close`) to Quark's records and its branch-per-phase rule; `/readback` is untouched. `/close` calls the `readback` reader directly, because `/readback` is user-only. *Replaces* the starter prompt pasted at the start of a job.
- **Decided: a Phase column** (`1`–`7`, `tooling`, or `—`) in place of PDERP's Module. The bug panel counts by the first "phase N" or "tooling" in each bug line, so `/bugs` writes it in brackets after *where*.
- **Decided: the Codex-reads-`AGENTS.md` convention changes nothing in the skills.** `AGENTS.md` is untouched; a second reviewer is a row at *not fully formed*.
- **Decided: Sonnet for the build.** `/idea` and `/bugs` commit on the branch that is checked out; the page header names the branch and commit.
- **Decided (17 Oct 2026): `/ask` has no `disallowed-tools` line.** Running it switched Edit, Write, Bash and PowerShell off for the rest of the session. `allowed-tools` only pre-approves tools, it does not remove the others, so `/ask` is read-only by its instructions, like every other skill, not by a lock. *Replaces* the line copied from PDERP.
- **Decided (17 Oct 2026): `db:push` keeps `--db-url` and scrubs its output.** Brandon asked for the URL to go through the environment if the Supabase CLI allows it; its reference page for `db push` shows no environment route (`SUPABASE_DB_PASSWORD` is for `link` only), so the script captures the CLI's output and removes the URL and password before printing (`scripts/scrub-url.ts`). Not yet run against the real CLI: the live project is never used to test it. The URL can still show in the process list while the command runs. Asked: Brandon, "pass it through the environment ... if the CLI allows it, and scrub the output as well".
- Proven on PDERP, 16 Oct 2026: an ask rule beats an allow rule even in auto, so a skill's `allowed-tools` cannot make a push to `main` run without asking.

## Bugs

One line each, newest first: date, where, what happened, what was expected, file, size guess. No diagnosis.

- 17 Oct 2026, Claude Code's own commands during the test database job (tooling): a chained shell command whose text contained `scripts/db-push` fired the `*scripts/db-push*` ask, and the prompt showed a bare command with "Run shell command" as its description, not the three plain-words facts; nothing ran that script. Expected: one action per command near the ask-list, and a description that always says what it does, what it touches (LIVE or not) and whether it can be undone. Fixed by two lines in CLAUDE.md, *Before a consequential action*. Size: minutes.

- 16 Oct 2026, hint check in the curation build (phase 3): a comparison hint that names the things being compared was blocked as giving the answer away. The exact hint and answer key were not recorded; the next held-back hint of this kind needs copying here before it can be fixed (the "each one" case is fixed). Size: an hour.
- 16 Oct 2026, the week preview's first cards (phase 3): a card announces the child's interest ("imagine you're a painter") where it doesn't fit the lens; expected: the door is never announced. Size: a job (belongs to step 4d).
