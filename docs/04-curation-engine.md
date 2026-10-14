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
- [x] Which outside content items need a person to approve them? **Decided (13 Oct 2026): items from open-access APIs that are CC0 or public domain and carry no model-tagged flag (`nudity`, `violence`, `needs_review`) are approved automatically.** Flagged items wait for a guardian on a review page in `/parent`.
- [x] Does a week go live on its own? **Decided (13 Oct 2026): no.** The weekly job leaves a theme in status `review`. A guardian sees each child's cards and what the gate changed, and taps once to make it live. Nothing goes live on its own.
