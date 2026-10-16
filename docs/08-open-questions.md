# Open questions

Add to this list, or pick one up and open a discussion.

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
- [ ] **Two blocked hints may be good hints.** Listen layer 3 was blocked for both boys: "Put the three on a line: the pharaohs, 1871, and today. Which two are nearer together?" The check counts naming a question's choices as a giveaway, but here the choices are only the three things being compared, and the hint gives a way to work it out rather than the answer. Is the check too strict for comparison questions?
- [ ] **How much is one day?** A day is five cards (look, wonder, listen, then, puzzle), each with four layers: up to 20 cards per child. Layers 2-4 are taps the child chooses, so the floor is five. Is five first cards a day the right amount for a 7-year-old?

## The plan: short lessons and child-chosen depth (16 Oct 2026)

- [x] **Four weeks on Ancient Egypt?** **Decided (16 Oct 2026): no, not four weeks straight.** A 7-year-old won't stay interested in one subject for a month, and a plan made only of month-long themes rules out important things that are short lessons (why we have leap years, how a lie differs from a mistake, what compound interest does). This replaces the 13 Oct decision's shape (four weekly Egypt themes), not its aim of testing what sticks. Egypt stays as the first thread.
- [ ] **Short lessons as units of their own.** The plan should hold a one-day lesson (one idea chain, one slot) as easily as a stretch, with a library of short lessons beside the stretches. What does the format in `lib/plan.ts` look like for both, and what does a short lesson need (subject, slot, grade bands, sources) that a stretch topic doesn't?
- [ ] **A week is a mix.** Some slots follow a running thread (for example, one day of Egypt a week), and the rest carry short lessons from anywhere. How many slots or days go to threads and how many to short lessons, and who picks the short lessons: the plan's order, the engine, or the parents?
- [ ] **The child pulls the thread.** Brandon's example: one day of Egypt in a week, and Asher spends a long time on it, asking questions and going deeper. Next week the engine gives him a little more Egypt, or more lessons of a similar style. Which signals count (time on the card, layers tapped, questions asked, the child's face rating), how strongly does one week's interest move the next, and how does a thread rest when the interest fades? The signals come from the wall, so this is built after phase 4; the plan format can change before then.
- [ ] **The boys' weeks may diverge.** Ideas are shared by both children today, which keeps cost down. If each child's interest steers his own threads, some slots become per child. How much divergence is allowed, and what does it cost?
- [ ] **Coming back is a recall check.** A thread that returns after a break gives phase 6 a natural delayed-recall check (docs/12). Should the engine schedule returns on purpose?

## Models and costs: raised building the page (16 Oct 2026)

The page is read-only (decided 16 Oct 2026; see docs/04, "How the models and costs page is built"). Defaults picked so it could be built; each is small to change.

- [ ] **What the estimate is built from.** As built: the five most recent finished week builds, priced per day for ideas and per child per day for cards. Options: all runs ever; only runs that built a full week; or the most recent week alone. Five keeps one odd run from swinging it, but a one-day trial costs more per day than a full week would if the first day's chains are longer.
- [ ] **A spending line.** Should the page show a monthly limit the parents set, and say plainly when a month is past it? Not a notification (rule 4 is about kids, but the parents asked for under 30 minutes a week), only a line on the page and maybe in the Sunday digest. Options: no limit; a limit in `.env.local` beside the models; a limit set on the page, which would make the page no longer read-only.
- [ ] **Runs before 16 Oct.** The 14 Oct trial runs kept their replies in `.quark-debug/` (with token counts), and the 15 Oct day 1 printed only its total ($0.91). Leave them out, as built, or backfill the debug runs so the estimate starts with real numbers?
- [ ] **Clean credits at fetch time too?** As built, credits are cleaned where they're shown and the stored rows keep what the source said. Cleaning in the Commons adapter as well would make `content_items` tidy for a shared theme file later, but rows already fetched stay as they are unless fetched again.
