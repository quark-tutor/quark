# Open questions

Add to this list, or pick one up and open a discussion.

## Product

- [ ] Which screens should the first version support: an iPad in a wall mount, a larger touch monitor, a TV in art mode?
- [ ] How much self-directed exploration versus parent moments? Is the wall the main event or a supplement?
- [ ] Where exactly are the limits on "Ask"?
- [ ] Do two parents share one digest, or does each get their own role?
- [x] Should a family start with the full plan, or with a single theme to test what sticks? **Decided (13 Oct 2026): one theme, Ancient Egypt,** as four weekly themes for grade bands 2-3 and 4-5. The full sequence comes after the pilot.
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
- [ ] A card whose hints still give the answer away after one re-ask is saved as `blocked` with the reason, so it's never shown, and the build goes on. The alternative is to stop the build. Is holding back one card better than stopping?
