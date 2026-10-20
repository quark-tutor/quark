# Family beliefs and values

Every learning tool already has a belief layer. Usually it's hidden: in what gets included, what gets left out, and how things are framed. This tutor makes that layer visible and puts parents in charge of it, so families can trust it the way they'd trust themselves.

Parents rarely leave a school over one lesson. They leave when they find out values were being taught without their knowledge or consent. A clear, editable values profile is meant to prevent that surprise.

## Two founding rules

Every other decision about beliefs has to fit inside these. The details will take a lot of work from the project and the community.

1. **This is not a brainwashing engine.** Families shape what comes up, when, and how it's framed. The tutor still teaches kids how to think, not only what to think. It never hides that other people believe differently. It never uses fear, shame or manipulation to make a belief stick. It never teaches a child to look down on people who believe otherwise.
2. **Every guardian has an equal say.** Every guardian who actively configures the tutor has equal weight in the values profile, and no one can override another alone. When guardians disagree on a topic, the tutor doesn't pick a side. It treats that topic as parent-led, and it shows the disagreement to all guardians in the digest so they can settle it together (proposed).

## The blackball

Rule 2 is enforced with a blackball. Any one guardian can block a topic, but every guardian has to agree before a topic is taught. Picture guardians with opposite views on gender identity in the middle of a hostile divorce. Neither can use the tutor to teach their side against the other's wishes, so the tutor stays out of it.

- **Blocked means silent, not opposed.** The tutor doesn't teach a blocked topic. It also never says the topic is bad, wrong or shameful, because that would be teaching the other side, and it would break rule 1.
- **When a child asks anyway,** the tutor gives a calm, neutral handoff: "That's a good one to talk about with your parents." It never lies, and it never tells the child which guardian blocked the topic.
- **Every guardian sees every blackball,** along with every question the child asked that hit one. Nothing is hidden from any guardian.
- **Everything is reversible.** A guardian can lift their own blackball at any time. Nobody else can lift it.
- **A safety floor no one can block (proposed).** A few things are always taught at an age-appropriate level, because a blackball could otherwise be used to harm a child. These are body safety, how to tell a trusted adult, and emergency basics. The community would define this list, and it should stay short. **As built (20 Oct 2026):** these three items are `gate/safety-floor.md`, marked "A first guess, pending June" until June has read it and a commit removes the line. The gate reads it ahead of the family's rulebook, so a card on the floor is never held back by a blackball or a never or parent-led setting, only by rule 1 or 6; it changes by commit only (docs/04, "How the gate is built"). The open question below on what belongs on the floor stays open.
- **Limits on scope (proposed).** A blackball applies to specific belief-sensitive topics, not whole subjects. A guardian can block a topic like the age of the Earth, but not all of science or all of history. That keeps the tutor from being emptied out in a dispute.

## Principles

- **Explicit, not hidden.** Each family has a values profile written in plain language. Parents can read and edit it, and the tutor can show which rule shaped any card.
- **Parents control framing, timing and emphasis.** They decide which topics come up, at what age, from what perspective, and which questions always go to a parent.
- **Facts stay facts (proposed).** The tutor doesn't state things it knows are false. Instead, it can present the family's belief alongside what others hold. For example: "Scientists estimate the Earth is about 4.5 billion years old. Our family believes..." This keeps the tutor credible, and it prepares kids for the views they'll meet later.
- **Hand off by default on contested topics.** The child hears "That's a great one to ask Mom or Dad." The parent gets a note in the digest with talking points drawn from their own tradition.
- **The project stays neutral.** The project builds the mechanism. It doesn't pick a set of beliefs or rank anyone's.

## How parents express their beliefs

1. **Start from a values pack.** These are starting profiles maintained by communities themselves, for example Latter-day Saint, Catholic, Evangelical, Jewish, Muslim, secular, progressive or conservative. The project doesn't write them.
2. **Refine through a short interview.** The tutor asks scenario questions in plain language, such as: "Your 9-year-old asks where people come from. How would you answer?"
3. **Adjust topic by topic.** Use the settings below.
4. **Review what changed.** The weekly digest lists every card the profile changed, so nothing happens out of sight.

## Topic settings

Every sensitive area gets the same two settings:

- **When:** anytime, from a set age, or parent-led only.
- **Perspective:** the family's tradition, several traditions presented fairly, or left out.

Sensitive areas to start with:

- Religion and faith
- Origins (evolution, age of the Earth)
- Sexuality, gender and family structures
- Death and the afterlife
- Politics and current events
- How history is framed (colonization, national heroes)
- Violence and war

## Draft profile format

```yaml
family_values:
  based_on: "community-pack-name@version"
  statement: >
    A few sentences, in the parents' own words, about what they want
    their children to understand and how.
  topics:
    origins:
      when: parent_led
      perspective: family_tradition
      note_to_tutor: "Present the scientific view, then our faith's view."
    death_and_afterlife:
      when: from_age_8
      perspective: family_tradition
  guardians:            # equal weight; disagreements make a topic parent-led
    - guardian_a
    - guardian_b
  blackballs:           # any one guardian blocks; only that guardian can lift
    - topic: example_topic
      by: guardian_a
      since: 2026-10-08
  safety_floor: community_default   # cannot be blackballed
  always_hand_off:
    - sexuality
    - current_events
```

See [Values packs: prior art](16-values-packs-prior-art.md) for what existing systems already define and a proposed pack format.

## Open questions

- [ ] Who maintains values packs, and how is a pack verified as truly representing its community?
- [ ] How do guardians settle a disagreement, and what counts as "actively configuring" (for example, in shared custody)?
- [ ] What should the tutor do if a profile asks it to teach something factually false?
- [ ] What belongs on the safety floor, and how granular can a blackball be?
- [ ] How should the profile loosen as children become teenagers and form their own views?
