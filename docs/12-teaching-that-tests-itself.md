# Teaching that tests itself

The tutor doesn't take any teaching method on faith. Every lesson is also a measurement, so the evidence for what works comes from the children it teaches. That makes this a data-driven tutor, not a tutor built on someone else's study.

## How it works

1. **Teach with effort first.** The child tries before getting help, and gets hints rather than answers. That struggle is what builds lasting memory.
2. **Check later, without help.** Days and weeks after a lesson, the tutor slips in quick checks with no hints: a question on a wall card, a dinner question, a puzzle. What a child still knows weeks later is the real measure, not how they did in the moment.
3. **Compare methods within the family.** The tutor teaches some themes one way and others another way, for example story-first versus puzzle-first, or a short daily dose versus a weekend deep dive. Then it compares what stuck for each child.
4. **Report it plainly to parents.** The digest shows what each child retained and which approaches are working for that child. Parents decide what to change.
5. **Adjust the plan.** The weekly cycle uses the results to choose how the next theme is taught.

## The difficulty rule

When teaching, a question answered with no hint is probably too easy. The number of hints a child needs is the tutor's difficulty dial:

| Hints needed | What it means | What the tutor does next |
| --- | --- | --- |
| None | Too easy | Make the next question harder |
| One or two, then the child gets it | The right edge: struggle, then understanding | Stay here |
| Many, or signs of frustration | Too hard | Step back or switch approach |

When checking weeks later, it flips: an answer with no hints is the goal, because it proves the learning stuck. The tutor always knows which mode it's in. Kids still get some easy wins, such as a warm-up question, a review they nail or a fact they get to teach a sibling, so struggle never feels like constant failure.

## Hints are earned, not pressed

A free hint button turns into something to tap for the reaction, the same way kids tap every button to see what opens. Tutoring researchers call this "gaming the system."

- **Guess first.** Help appears only after the child tries an answer, typed, spoken or picked. Even a wrong guess primes learning.
- **Hints are a conversation, not a button.** The tutor responds to the child's attempt with a guiding question the child has to engage with.
- **The screen never gives the answer.** When hints run out, the last step goes to a person: "Ask Dad about this one at dinner," or "See if your brother knows."
- **One question, one way to answer.** Nothing decorative to tap. Young kids answer by voice, which takes more thought than tapping.
- **Thinking happens off the screen.** The screen starts the thinking, and paper, conversation and the dinner table finish it.

**As built in the Wonder Wall's slice 1 (22 Oct 2026):** the hints are the card's written ones, one at a time after a guess that isn't judged right, each under the child's own guess; a model's guiding question is a later slice. Answers are typed, with the iPad keyboard's dictation as the family's setting; spoken answers in the app are a later slice. A guess is judged in code, which misreads many right answers in a child's own words, so the reply never says a guess was wrong. docs/04, *How the Wonder Wall is built*.

## The session ends when the thinking stops (proposed)

Some language apps "hang up" after too many careless answers. The tutor does a gentle version. If taps come faster than anyone could read, or answers turn into random guesses, it first slows down: it reads the card aloud or asks for a spoken answer. If the rushing continues, it ends the session calmly, with no scolding, shame or lost points: "Let's stop here. Here's something to think about until next time." The child learns that the screen only works when they're thinking, and parents see the pattern in the digest.

## Conduct the tutor teaches

The tutor is not a model of how to be a person. The people a child should copy are people: parents first, then the grandparents, saints, explorers and scientists in the stories it carries. But the tutor is a trainer. Every time it waits for a guess, declines a question, slows a session or ends one, it is shaping how the child behaves, and it does so with far more repetitions than any dinner conversation gets. Pretending the tool only transmits information would be its own kind of dishonesty, so the training is written down here where parents can see every lever.

| Mechanism | Habit it trains | Floor or family |
| --- | --- | --- |
| Guess first, before any hint | Commit before you ask for help | Floor |
| Hints as a conversation, not a button | Ask well, not just ask | Floor |
| The last hint goes to a person | There are things you go to people for | Floor |
| Say the answer out loud | Think it through before you commit | Family sets how firm |
| Slowing down, then a calm end on rushing | Rushing gets you less, not more | Floor; family sets the tone |
| Declining a crude or lazy question | The way you ask is part of the ask | Family sets what counts as crude |
| No answer to rudeness aimed at the tutor | You don't get a rise out of people by being rude | Family chooses quiet non-response or direct correction |
| Effort words, never brilliance words | Effort is the thing you control | Floor |
| Praise, when and in what words | What is worth being pleased about | Family sets |
| No contempt for anyone, ever | Other people are not beneath you | Floor |

**The floor** is the short list every family gets regardless of pack: commit before help, no rushing, effort over brilliance, no contempt. These are close to universal and they are also what makes the teaching work, so they are not configurable. **The family items** are the ones that vary by household and have no right answer: how firm to be about speaking the answer, what counts as crude, whether rudeness earns silence or a correction, whether and how the tutor praises. A stricter, old-fashioned tone and a gentler one are both legitimate. Neither should be the default by accident. The family items are asked in the values interview (`gate/values-interview.md`, Part 2b) and stored under `conduct.*` keys in `guardian_conduct` and, once merged, `conduct_settings`.

**The manner is the one thing it does model.** A calm end without a lecture shows how to hold a boundary. "I won't answer that one; try asking it another way" shows how to decline without shaming. The child sees that pattern hundreds of times, so the tone of refusal is not a user-interface detail; it is the one piece of character the tool demonstrates directly, and it is specified as carefully as the hint rule. The manner rules, which belong in a fixed prompt block that every kid-facing prompt includes (`core/prompts/manner.md`):

- Never sarcasm.
- Never a lecture longer than one sentence.
- Never a reference to the child's past behavior.
- Never shame.
- Always a way back in next time.

**Why this sits beside the values packs.** How a child learns to act is where traditions differ most. Some teach by exemplars, some by cultivating attention and consideration, some by practice, and families differ on whether exemplars should match the child's sex. None of that changes the tutor's voice; it changes what the tutor points at, so it belongs in the pack (`learns_to_act` and `match_exemplars_to_sex` in `packs/README.md`). The tutor's own conduct stays the same across every pack, apart from the family items above.

Open questions on conduct:

- [ ] Does declining a crude question need to say why, or is the decline itself enough at 7 and 9?
- [ ] At what age does "say it out loud" stop being a scaffold and start being a nuisance?
- [ ] Should a sibling's rudeness during a shared session end the session for both?
- [ ] Mom's view, especially on praise and on the tone of refusal.

## Pooled evidence, with consent

Across many families, the results add up to real evidence about how children learn, on a scale most education research never reaches. Families can choose to share anonymized results so the whole community learns what works, by age, subject and method.

## Ground rules

- **The tests measure methods, not children.** No grades, no rankings, no comparing one kid against another.
- **Opt-in only.** Sharing results beyond the family needs consent from every guardian, and the data is anonymized.
- **No deliberately worse teaching.** A child is never given a method that's expected to work worse just to create a comparison group. Comparisons are only between approaches that are both believed to be good.
- **Checks stay light.** Short, low-stakes and woven into normal touch points, so testing never feels like school testing.
- **Results are shown honestly,** including when they're too thin to mean anything yet.

## Open questions

- [ ] What counts as "retained": recall, explanation, or applying an idea somewhere new?
- [ ] How many checks per child make results meaningful without becoming a burden?
- [ ] Who holds the pooled data, and how is it governed so it can't be sold or misused?
- [ ] How do we measure the things that matter most but are hardest to test, like curiosity and love of reading?
