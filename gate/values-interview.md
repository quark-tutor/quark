# The values interview

How a family's beliefs become rows in the database and then a policy the gate can enforce. Each guardian takes it alone, about 20 minutes, then the two compare. It ends with a generated policy document the parents can read in plain English, and a test run that shows how the tutor would answer.

**What parents see.** The interview is called **Our Family's Beliefs**. Parents never see the word "pack": in the app a pack is a **tradition**, and a point is a **subject**. It opens on a start screen with three short lines (Quark follows these answers when a lesson touches a sensitive subject; there are 24 subjects, each with five ways to handle it; anything can be changed later) and two choices: **Quick start** (tradition + political leaning, about 2 minutes, then review) or **Go through each one** (about 20 minutes). It lives at `/parent/beliefs`. The tryout page it grew from is `scripts/pack-compare.mts`; its "Copy my answers" button hands answers to the app's "Bring those answers over" screen.

**Where answers are kept.** Each guardian's answers are their own until the compare step: `guardian_values` (quick-start tradition, lean, the three "in your own words" answers), `guardian_answers` (one row per point, same shape as `values_settings`, plus `origin`: quick_start, tradition or own) and `guardian_answer_ages` ("Not yet" age per child). Every guardian in the family can read all of them; each writes only their own. The compare step writes the family's `values_profiles`, `values_settings` and `child_point_ages`. Packs reach the app through `npm run packs:import`, one `values_pack_entries` row per pack, point and lean.

## Part 1: starting point (3 minutes)

1. **Pick a starting pack**, or start blank. It is a quick start, not a commitment: the pack fills every point you haven't answered, and each point can later take its answer from any pack. → `values_profiles.pack_id`
2. **Political lean**: progressive, moderate, conservative, or "I'd rather not say." → `values_profiles.political_lean`. Together with the pack it pre-fills the answers on points 9, 10 and 14–19 from the pack's variant for that lean. After that, only the answers count: the lean is never a separate instruction to the tutor, and changing it later re-fills only the points you haven't edited.
3. **In your own words.** Three prompts, a sentence or two each. → `values_profiles.statement`. This text goes into every card-writing prompt.
   - What do you most want your kids to understand about the world?
   - What do you believe that you want them to believe too?
   - What do you want them to decide for themselves?

## Part 2: the 24 points (15 minutes)

Every point shows the kid's question, the same five answers, a free-text box, and each pack's answer for that point side by side (as in the pack chooser, `scripts/pack-compare.mts`). A guardian can tap one of the five answers, or tap a pack's answer to take that pack's answer and wording for this point only, so a family can mix packs point by point. Which pack an answer came from is stored (`values_settings.from_pack`). An answered point folds to one line with a Change button, so the unanswered ones stand out, and a progress count shows how many of the 24 are done. Guardians are expected to go back and forth.

| If your child asked this... | `when` | `perspective` |
| --- | --- | --- |
| Answer it, from what we believe. | `anytime` | `family_tradition` |
| Answer it, and show that other people see it differently. | `anytime` | `several_fairly` |
| Not yet. (then one of the two above, and an age for each child) | `from_age`, ages in `child_point_ages` | as chosen |
| Send them to us. | `parent_led` | — |
| Don't bring it up. | `never` | `omitted` |
| *What would you actually say?* (free text, optional) | → `note_to_tutor` | |

The free-text box matters more than the buttons. The family's own words can be echoed on the card.

Extra controls:
- **Point 8** (where babies come from): each child's age picker defaults to that child's current age plus two.
- **"Not yet" asks for each child separately.** Different children are ready at different ages, so Asher and Rex can get different ages on the same point. A good tutor knows when each child is ready; for these points the guardians decide, and the tutor follows.
- **Point 20** (violence and war): a second slider, "words only" to "period art is fine."

## Part 2b: how the tutor conducts itself (3 minutes)

The tutor's own behavior shapes the child's whether we like it or not (see "Conduct the tutor teaches" in `docs/12-teaching-that-tests-itself.md`). Most of that conduct is floor and is not asked. Four items vary by household and are asked here, each with fixed answers plus a free-text line, shown and compared the same way as the 24 points.

| Question | Answers | Stored as |
| --- | --- | --- |
| Should the tutor make the child say an answer out loud before any hint? | Gentle reminder / Required / Off for this child | `conduct.speak_first` (per child) |
| What counts as a crude question in your house? | Free text, one or two sentences | `conduct.crude_line` |
| If a child is rude to the tutor, what should it do? | Quiet non-response / One-line correction | `conduct.rudeness` |
| Should the tutor praise, and how? | None / Plain acknowledgement / Warm; plus words to use or avoid | `conduct.praise`, `conduct.praise_words` |

Where guardians differ (Part 4), the gentler setting wins until they talk. The answers appear in the policy document as a short "Conduct" section after the 24 points, so the gate and the kid-facing prompts read the same thing.

## Part 3: what did we miss? (2 minutes)

"Is there anything else you'd want Quark to handle carefully, or stay away from?" Free text, as many entries as they like. Each becomes a `blackballs` row with `topic` set, or a note the tutor treats as an extra point. This is how the 24 get corrected by real families.

## Part 4: compare (5 minutes, both guardians)

Both sets of answers side by side, differences highlighted. Where they agree, the row is written. Where they differ, the point defaults to `parent_led` and is flagged in the digest until settled (founding rule 2). Either guardian can blackball any point from this screen. Nothing is written for a point until both have answered it or one has blackballed it.

## What comes out

1. One `values_profiles` row, 24 `values_settings` rows for the points plus the conduct rows from Part 2b, zero or more `blackballs`.
2. **A policy document**, generated from those rows into plain English, one paragraph per point. This is what the gate model reads when it checks a card. Example paragraph:

   > **Point 6, evolution.** Ask Mom or Dad first. If a card touches how living things changed over time, the tutor keeps to what's observable (fossils, how dogs were bred from wolves) and hands the origin of people to a parent: "That's a great one to ask Dad." The family's note: "We believe God made people. We're fine with the kids learning what scientists have found. We want to be the ones to talk about how those fit together."

3. **A test run.** Twenty kid questions, drawn from the list, answered by the tutor under the new policy, shown to the parents before anything goes live. If an answer looks wrong, they fix the setting and rerun.

## Rules the interview follows

- Every answer can be changed later from the parent app.
- No answer is hidden from the other guardian.
- The tutor never sees the raw interview; it sees the policy document. That keeps the gate's input readable and auditable.
- The safety floor isn't in the interview. It can't be turned off, so there's nothing to ask.

## Policy document template

One paragraph per point, rendered from `values_settings`:

```
Point {number}, {name}.
{when_sentence}
{perspective_sentence}
{note_sentence}
```

| `when` | when_sentence |
| --- | --- |
| anytime | The tutor may raise this and may answer it. |
| from_age | The tutor does not raise this with {child} before age {child_age_for_point}. If {child} asks before then, hand off. (One sentence per child.) |
| parent_led | The tutor does not raise this. If the child asks, hand off: "{handoff}". |
| never | The tutor does not raise this and does not answer it. If the child asks, hand off without comment. |

| `perspective` | perspective_sentence |
| --- | --- |
| family_tradition | Answer from the family's tradition, in the family's words where given. Never say other views are foolish. |
| several_fairly | Present the main views fairly: academic not devotional, expose not impose. Name the family's view as the family's. |
| omitted | Say nothing on this. |

note_sentence: `The family's note: "{note_to_tutor}"` when present.

A blackball adds: `BLOCKED by a guardian. Do not teach. Do not characterize. Hand off neutrally.`

## Open questions

- [x] Five answer choices, or should "answer it" split into brief versus deep? **Decided: keep five.** Depth comes from reading level, layers and the family's note.
- [x] Age picker per child or per family? **Decided: per child.** "Not yet" takes an age for each child.
- [x] How does political lean change a card? **Decided: it pre-fills answers, it is not a policy paragraph.** Each pack carries a variant per lean for points 9, 10 and 14–19.
