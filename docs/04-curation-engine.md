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
- [x] Does a week go live on its own? **Decided (13 Oct 2026): no.** The weekly job leaves a theme in status `review`. A guardian sees each child's cards and what the gate changed, and taps once to make it live. Nothing goes live on its own.

## How the approval rule is built

Everything a child sees comes from `content_items` with `approved = true`. `npm run content:fetch` fills that table from the sources the imported plan names, and `/parent/content` is where a guardian decides the rest.

- **Sources and adapters.** `content_sources` has four rows, each with its rule in `license_note`: the Met (CC0 when `isPublicDomain`), the Art Institute of Chicago (CC0 when `is_public_domain`, images through IIIF at 843 pixels), Wikimedia Commons (the license read from each file's own page) and Musopen (checked by hand, never approved automatically, because its site refuses automated requests). Each has one adapter under `core/content/` that fetches one item by its id with plain `fetch`. There is no search: the plan names exact items.
- **Flags.** The gate model looks at each item's image and what its source says about it (`core/prompts/flag-content.md`) and returns flags from a fixed list: `nudity`, `violence`, `frightening` and `needs_review`, with one sentence for parents. Frightening is judged for a 7-year-old: a mummy's face can pass, a flayed figure can't.
- **The rule.** An item is approved automatically only when its license is CC0 or public domain and it has no flags (`core/content/rule.ts`). `approved_how` records `auto` or `guardian`. Everything else stays unapproved and waits. A guardian's rejection is kept in `rejected_at` and `rejected_by`, and a rejected item is never approved again.
- **The stored copy.** Every approved or waiting image is copied into the private Storage bucket `content` at `<source>/<external_id>.<ext>`, recorded in `metadata.storage_path` beside the original URL, because the wall works offline and never loads images from museum sites. Recordings keep their URL only, for now.
- **Running it again** changes nothing: an item already in the table isn't fetched, flagged or copied again. A failed fetch stops the run and names the item.
- **The review page.** `/parent/content` lists the items waiting, then the approved ones, then the rejected ones, each with its picture, source, license, flags and the model's note. Any guardian can approve or reject; both are written to the audit log.
