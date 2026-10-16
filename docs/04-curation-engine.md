# Curation engine

The engine follows a multi-year plan, not a random stream. It runs every week on its own, and a guardian taps once to make the week live.

## The long-term plan

The backbone is a knowledge sequence such as the [Core Knowledge Sequence](https://www.coreknowledge.org), organized as a timeline of history. Each theme ties several subjects together. For example, an Ancient Egypt week might include:

- the Nile and the pyramids on the map
- Egyptian art on the wall
- simple machines and levers in science
- hieroglyphs as a puzzle
- Greek and Egyptian myths in the car

Tying the subjects together is what makes knowledge stick.

## The weekly cycle

1. Read last week's activity and the results of delayed checks (see [Teaching that tests itself](12-teaching-that-tests-itself.md)), the questions kids asked and any notes from parents.
2. Choose next week's theme from the plan, adjusted for what caught each child's interest.
3. Pull material only from trusted, free, public-domain or museum sources (see [Resources](05-resources.md)).
4. Write explanations at each child's level, through the [lenses](17-lenses.md) that open the theme for that child. For example, one version for a 7-year-old who likes building things and another for a 9-year-old who likes stories. The lens changes the way in, never the facts.
5. Load the touch points, queue the audio and send the parent digest.

## Per-child profile (draft)

- Age and reading level
- Current interests (sharks, knights, space, Minecraft and so on)
- Topics explored and how deep they went
- Questions asked
- Parent notes ("go deeper on this", "skip that for now")

## Open technical questions

- [ ] Can a content item be stored as a portable format (JSON or Markdown with metadata) so families and contributors can share themes?
- [x] How is the long-term plan represented: a shared, versioned file anyone can improve? **Decided (13 Oct 2026): the plan is YAML under `plan/`, one file per stretch, imported by `npm run plan:import`.** Each week covers the five wall slots; history or geography feeds the "then" card, and literature sits beside it there. The format is in `lib/plan.ts`; the first stretch is `plan/ancient-egypt.yaml`.
- [ ] Which parts need a live AI model, and which can be pre-generated and reviewed by people?
- [x] Which outside content items need a person to approve them? **Decided (13 Oct 2026): items from open-access APIs that are CC0 or public domain and carry no model-tagged flag (`nudity`, `violence`, `frightening`, `needs_review`) are approved automatically.** Flagged items wait for a guardian on a review page in `/parent`. How it is built is below.
- [x] Does every topic get a picture? **Decided (15 Oct 2026): yes, every topic, puzzles included, with one or two approved items, so a topic can look different when it comes back in the week.** Claude Code proposes candidates and Brandon picks; how it is built is below.
- [x] Musopen and CC BY-SA items for Egypt. **Decided (15 Oct 2026): keep them, and add an open item beside each.** Handel's Israel in Egypt keeps its Musopen source and adds the 1888 Edison recording from Commons; the Rosetta Stone topic keeps its CC BY-SA photo and adds a CC0 photo of the stone and a public-domain photo of Howard Carter. The shakuhachi recording was dropped because its public-domain date is unknown.
- [x] Does a week go live on its own? **Decided (13 Oct 2026): no.** The weekly job leaves a theme in status `review`. A guardian sees each child's cards and what the gate changed, and taps once to make it live. Nothing goes live on its own.
- [x] Can a guardian change which model does which job from `/parent`? **Decided (16 Oct 2026): no, the models page is read-only.** The models stay in `.env.local` (and Vercel's environment), which keeps the page simple and hard to change by accident. How it is built is below.

## How the approval rule is built

Everything a child sees comes from `content_items` with `approved = true`. `npm run content:fetch` fills that table from the sources the imported plan names, and `/parent/content` is where a guardian decides the rest.

- **Sources and adapters.** `content_sources` has four rows, each with its rule in `license_note`: the Met (CC0 when `isPublicDomain`), the Art Institute of Chicago (CC0 when `is_public_domain`, images through IIIF at 843 pixels), Wikimedia Commons (the license read from each file's own page) and Musopen (checked by hand, never approved automatically, because its site refuses automated requests). Each has one adapter under `core/content/` that fetches one item by its id with plain `fetch`. There is no search: the plan names exact items.
- **Flags.** The gate model looks at each item's image and what its source says about it (`core/prompts/flag-content.md`) and returns flags from a fixed list: `nudity`, `violence`, `frightening` and `needs_review`, with one sentence for parents. Frightening is judged for a 7-year-old: a mummy's face can pass, a flayed figure can't.
- **The rule.** An item is approved automatically only when its license is CC0 or public domain and it has no flags (`core/content/rule.ts`). `approved_how` records `auto` or `guardian`. Everything else stays unapproved and waits. A guardian's rejection is kept in `rejected_at` and `rejected_by`, and a rejected item is never approved again.
- **The stored copy.** Every approved or waiting image is copied into the private Storage bucket `content` at `<source>/<external_id>.<ext>`, recorded in `metadata.storage_path` beside the original URL, because the wall works offline and never loads images from museum sites. Recordings keep their URL only, for now.
- **Running it again** changes nothing: an item already in the table isn't fetched, flagged or copied again. A failed fetch stops the run and names the item.
- **The review page.** `/parent/content` lists the items waiting, then the approved ones, then the rejected ones, each with its picture, source, license, flags and the model's note. Any guardian can approve or reject; both are written to the audit log.

## How a topic gets its picture

Every topic in a stretch names one or two items in its `sources`, so that no card comes out text only and a topic can look different when it comes back later in the week. The adapters fetch by exact id and never search, so finding the items is a separate step that a person signs off on.

- **Finding candidates.** For each topic without sources, Claude Code searches the Met (Collection API search), the Art Institute of Chicago (API search, public domain only) and Wikimedia Commons (file search), using throwaway code that isn't kept and isn't added to the adapters. Every candidate is then fetched through the real adapter, so its id and license are the ones `content:fetch` will see.
- **The rules for a candidate.** CC0 or public domain only; for Commons, the license on the file's own page. No nudity. Nothing frightening for a 7-year-old: a mummy's face can pass, a flayed figure can't. A real object or place that shows the topic's mechanism (a nilometer for the flood, a sledge for hauling, a weight carved with number signs for the puzzle) before a modern illustration. A "listen" topic gets a recording, preferably from Commons, because Musopen is checked by hand and never approved automatically.
- **The candidates file.** `plan/candidates/<stretch>.md` has one section per topic (week, slot, title) with 2-4 candidates: source, id, title, URL, license, what it shows and why it fits, with the one or two Claude Code would take marked. It's committed before anything changes, and a guardian picks. The chosen items go into the stretch's `sources` and each topic's `sources`. The file stays as the record of why each was picked.
- **The validator warning.** `planWarnings()` in `lib/plan.ts` names every topic without sources, and `plan:import` prints them. It's a warning, not an error, so a stretch can be imported while its pictures are still being found. A test holds the Egypt stretch to none.
- **When a topic has no good item.** The candidates file says so plainly, naming what was looked for and not found (for Egypt: a photo of a nilometer's scale marks, a knotted 3-4-5 rope, papyrus being made, a recording of a ney). If one of a topic's items fits, the rest of the topic stays text only. If none fits, the topic stays text only, the warning keeps it visible, and the week report and `/parent/week` name the gap. Anything better done by hand than shown goes to [open questions](08-open-questions.md) as a possible parent activity.
- **After picking.** `plan:import`, then `content:fetch`, which flags and approves as above. Anything flagged waits at `/parent/content` for a guardian. The first run, on 15 Oct 2026, added 33 items for Egypt: all passed automatically, with no flags.
- **Layer 1 always has one** (decided 15 Oct 2026). Layer 1 is the card a child meets first, so when a day-slot's topic has an approved item, layer 1 of its idea chain must use one; layers 2-4 may go text only. The ideas prompt says so, and `firstLayerProblem()` in `core/curation/ideas.ts` checks it the way the hint check works. A chain whose layer 1 has no item (or an id that wasn't offered) is sent back once with the problem named. If it still has none, the chain is kept, and the `week:build` report lists it under "first cards without a picture" with the number of chains sent back. The first day 1 rebuild after this (15 Oct 2026) needed no second asks: all five first cards had an item, and the six text-only layers per child were all in layers 2-4.
- **A topic whose only item can't show its first idea.** Week 1's listen topic had only the Aida recording, so "instruments from paintings and tombs" had nothing to show. A Met harp (`met-arched-harp`) and a bronze sistrum (`met-bronze-sistrum`) were added beside it, picked the same way as the rest.

## How a week is built

`npm run week:build -- --week 1` turns one week of the imported plan into a theme, its shared ideas, and every child's cards and questions. The theme is `generating` while it runs and `review` when it's done; nothing goes live here, and every card is written with policy `pending` for the gate (step 5). A week already built is refused unless `--rebuild` is given, which deletes that week's ideas, cards and questions first (or, with `--child`, only that child's cards). `--days` builds fewer days, for a cheap trial. The run ends with a report: ideas and cards per child, the lenses used, cards without a picture, slots with no approved item, and the tokens and cost per model. `/parent/week/<theme>` shows the result, read-only, before the gate: each card's picture (tap to open it large, from a signed URL to the private copy) or recording (a player that never autoplays; for Commons sound files the MP3 copy Wikimedia keeps, which iPad Safari plays), with its title, creator, date, source, license and credit line, and, where a topic has no approved item, a note naming the plan topic so the gap can be filled.

- **Units.** A theme is one week. A day is five cards, one per slot: look, wonder, listen, then, puzzle. An idea is one fact or concept, anchored to a plan topic and, where one is approved, a content item, with its question and answer key; ideas are shared by every child. A card is one child's rendering of an idea, at that child's level, through a lens. Layers 1-4 are separate cards on the same idea, each a step deeper, linked by `parent_idea_id` and `parent_card_id`.
- **Ideas** (`core/curation/ideas.ts`, `core/prompts/ideas.md`, on `QUARK_MODEL_CURATE`). One call per day and slot returns a chain of four layers on that slot's topic: title, statement (the fact in plain words, mechanism named), question, acceptable answers with a one-line rubric, and which approved content item it uses, if any. A slot's topics are taken in turn through the week, so each is met more than once, and each call sees the chains already written for that slot so the day's first layer is new. Layers 1-2 draw on the 2-3 summary and layers 3-4 may add the 4-5 material, since both children share the chain. Only approved items are offered; a slot whose topic has none is text only, and the report lists it. `source_refs` holds the plan topic keys and the item with its attribution.
- **Lenses** (`lib/lenses.ts`). A pure function picks a lens per day-slot for each child; see [Lenses](17-lenses.md), "How the picker works".
- **Cards** (`core/curation/cards.ts`, `core/prompts/card.md` behind `manner.md`, on `QUARK_MODEL_WRITE`). One call per child per day-slot renders the four layers as cards: title, text, image_alt, read_aloud, question, hints and handoff. The prompt carries the idea chain, the lens and its question, the child's nickname, age and reading level and nothing else about the child (rule 7), the family's own words (`values_profiles.statement`), and the week's perspective and values points, so a card is written right the first time rather than fixed by the gate. An interest may open the first card on at most a quarter of the week's day-slots (`cards.door`), and never changes what is taught. Science cards pair how it works with who it helps. `cards.level` records the reading level and age written for.
- **Checks, in code.** Each card is checked before it's saved: four cards, two or three hints, a handoff, a description when there's a picture, the whole card in read_aloud for a child who is read to, no brilliance words, no links, and no hint that gives the answer away (every meaningful word of an accepted answer appearing in a hint counts). A failed check sends the call back once with the problems named. A card still failing after that is saved as `blocked` with the reason in `policy_notes`, and is never shown.
- **Questions.** One `questions` row per card: the card's question, the idea's answer key, and the hints in order. The handoff ("Ask Dad what a dam does to a river") stays on the card, not among the hints. `difficulty` is left empty until phase 6.
- **Models and cost** (decided 14 Oct 2026). Ideas run on the strongest model because they carry the facts and are shared; cards run on a cheaper one because they are many and are mostly writing. At Claude Opus 5.5 for ideas and Claude Sonnet 5.5 for cards, a seven-day week for two children is about 35 idea calls and 70 card calls, estimated at about $5.70.

## How the models and costs page is built

`/parent/models` shows what Quark spends on language models and on which ones, so a guardian doesn't need a terminal to find out. It is read-only (decided 16 Oct 2026), any guardian can open it, and it is linked from `/parent`. Nothing on it reaches the kid view.

- **Which model does which job.** Ideas (`QUARK_MODEL_CURATE`), cards (`QUARK_MODEL_WRITE`), and the gate and content flags (`QUARK_MODEL_GATE`), read from the environment where the page runs, with each one's price. A variable that isn't set says so. Locally that is `.env.local`; on Vercel the same names are set in the project's environment.
- **Prices.** The table in `core/prices.ts` (Anthropic's list prices, dollars per million tokens, input and output), with `PRICES_CHECKED`, the date they were last checked against Anthropic's list (16 Oct 2026). Whoever checks them again moves the date.
- **Every run.** `core/model.ts` counts calls and tokens per job and model as a run goes. At the end, `week:build` and `content:fetch` write one row to `model_runs` (migration `20261016000000_model_runs`), including a run that stopped part way, since it still spent money: the kind of run, whether it finished, when, the theme, week, days built, how many children it built for, and per job and model the calls, tokens in and out and cost. Counts and money only: no prompts, no card text, and never which child (rule 7). A run is priced when it ends (`runRow()` in `core/runs.ts`), so a later price change doesn't rewrite it. Guardians read the rows through row-level security; only the scripts write them. If the table is missing the script says so and finishes anyway. Runs before 16 Oct weren't recorded; day 1 on 15 Oct cost $0.91.
- **The estimate.** `estimate()` in `core/runs.ts` takes the five most recent finished `week:build` runs and prices ideas per day (they are shared) and cards per child per day, then a seven-day week for the family's children and a month (52 weeks over 12). A one-child rebuild counts toward cards only; a run that stopped counts toward neither. It includes the second asks those runs needed, and leaves out fetching pictures (once per item) and the gate (step 5, which will run inside `week:build` on `QUARK_MODEL_GATE` and so join the estimate on its own). The page shows it beside the first guess above ($5.70 a week), says plainly that it is an estimate and what it is based on, and points to Anthropic's console for the real bill. Until a week build is recorded, the page shows only the first guess.
