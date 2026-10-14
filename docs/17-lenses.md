# Lenses

A lens is the door into a theme, never the room. It changes the opening question and the framing of a card. It never changes the facts or the plan. Every child meets the same pyramids, the same Nile and the same hieroglyphs, whichever lens opens them.

Kids walk into the same subject through different doors. One wants to know how the pyramid was built, another wants to know who was buried in it, a third wants to know what went wrong for the robbers. The tutor notices which door each child keeps choosing and opens that one first, without ever closing the others.

## The seven lenses

These are the values of `card_lens` in the schema. The examples are from an Ancient Egypt theme.

| Lens | Opening question | Egypt, for example |
| --- | --- | --- |
| **Build and design** (`build`) | How was it made? What would you make? | How the pyramid blocks were cut, moved and stacked. Design your own tomb. |
| **Story and character** (`story`) | Who was there, and what was it like to be them? | A day as a scribe's child on the Nile. Hatshepsut, the woman who ruled as pharaoh. |
| **Compete and strategize** (`compete`) | Who won, and how? | Why the chariot changed war. Plan a Nile trade route. |
| **Collect and complete** (`collect`) | Can you find them all? | The gods: collect all twelve. The hieroglyph alphabet, one letter a day. |
| **Explore and discover** (`explore`) | What's down there? | Opening Tutankhamun's tomb in 1922. What's still buried. |
| **Care and nurture** (`care`) | Who looked after whom? | Cats in Egypt, and why they were sacred. How Egyptians treated the sick. |
| **Humor** (`humor`) | What's funny about this? | Mummified crocodiles. The pharaoh who coated his servants in honey to keep the flies off. |

An idea is written once, anchored to its source (see the `ideas` table). A card renders that idea for one child, at that child's level, through one lens. Two cards for the same idea through different lenses ask different opening questions and teach the same thing.

## Rules

- **Every theme ships cards through at least four lenses.** No child's week is a single door.
- **Week one is a mix.** Every child sees cards led by the shared lenses (explore, collect, humor, and story told as an adventure), plus one lens leaned by the sex prior (CLAUDE.md, rule 6). The prior picks a starting lean, nothing more.
- **From week two, the child leads.** The opening card of each theme uses the child's strongest lens, measured by deep taps: opening layer 2 and beyond. The other lenses stay on the wall, a tap away.
- **Every few weeks, a different door.** The opening card uses a lens the child hasn't been choosing, and the tutor watches. An interest that runs against expectation is a discovery to follow, and it goes in the digest.
- **The prior fades.** The sex prior decays over about two weeks of the child's own behavior. Two weeks is a guess; the pilot measures it.
- **Never gate by sex.** All seven lenses are available to every child. The five daily slots always span art, science, music, history and a puzzle, whatever lens opens them.
- **Competition is opt-in.** The default rival is the child's own past self. Beating a sibling or anyone else is something a family turns on, not something the tutor assumes.
- **Science cards pair how with who.** Every science card pairs "how it works" with "who it helps."

## Interests are the door, not the theme

Roughly three-quarters of what a child sees comes from the plan. A child's interests shape the way in and the optional deep dives, not what gets taught. A child who loves sharks still learns about Egypt, and might meet it through the crocodiles of the Nile.

The tutor looks as hard for new interests as it serves old ones. A child who only ever gets what they already like stops finding anything new to like.

## How the picker works

`lib/lenses.ts` picks a lens for each day-slot card of a child's week. It is a pure function of the child's sex, the child's week number in the pilot and the child's lens history (deep taps per lens, recorded from phase 4; empty until then). Nothing is random, so the same child and history always get the same week.

- **Every lens, every week.** Each lens starts with a weight of 1 and, in any week of two days or more, at least one card. No lens is ever withheld from any child.
- **Week one.** The shared lenses (explore, collect, humor, story) get 2 more, and the one lens leaned by the sex prior gets 2 more: build for a boy, care for a girl (story, the other lens docs allow for a girl, is already shared). For a boy's first week of 35 cards that comes to six each for explore, collect, humor, story and build, and two or three each for compete and care. The week opens with explore.
- **The prior fades** at full strength in week 1, half in week 2 and nothing from week 3, and the shared lenses' extra weight fades with it once the child has history.
- **History.** Each lens gets up to 4 more in proportion to its deep taps against the child's most-tapped lens. The week opens (day 1, look) with the child's strongest lens; every third week (3, 6, 9...) it opens with the least-chosen lens instead, and the tutor watches.
- **Dealing.** The week's slots are split by weight, then dealt day by day so the most-weighted lenses come round most often and no day repeats a lens while another is still waiting.

## Open questions

- [ ] How many deep taps make a lens "strongest," and over what window?
- [ ] How often is "every few weeks" for the off-pattern opening card?
- [ ] Is the two-week decay of the sex prior right? The pilot measures it.
- [ ] Where is a family's opt-in to competition stored, and is it per child?
- [ ] How do lenses relate to the theme-level method experiments (story-first versus puzzle-first, in [Teaching that tests itself](12-teaching-that-tests-itself.md))? Are they the same dial or two?
