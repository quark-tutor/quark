# Values packs

A values pack is a community's starting answers to the controversial points below, which a family then adjusts. The project defines the points and drafts the first packs. The communities take it from there.

## How this works

1. **The project defines the controversial points.** This list is the neutral, shared part. Every pack answers the same points, so packs can be compared and a family can switch between them.
2. **Starter packs are drafted for the nine largest US belief communities,** built only from each community's own published sources, with citations. Where a community has no official position, the draft says so and cites surveys instead.
3. **Every starter pack is labeled a draft by outsiders.** It stays marked "awaiting review by members of this community" until enough self-identified members endorse it. Then it becomes community-reviewed.
4. **Official teaching and family practice are kept separate.** A pack records the official position. Families adjust from there.
5. **Anyone can fork.** A disagreement inside a community produces two packs rather than a fight over one.
6. **A pack never speaks for anyone outside the family using it.**

## The controversial points

Twenty-four points, grouped under eight sensitive areas. Each is phrased as the question a 6-to-12-year-old might ask. For every point, a pack records a **when** (anytime, from a set age, parent-led only, or never) and a **perspective** (family tradition, several traditions fairly, or omitted), plus the community's position with a source.

| # | Area | Point | The question a kid asks |
| --- | --- | --- | --- |
| 1 | Religion and faith | Is there a God, and whose? | "Is God real?" "Why does my friend go to a different church?" |
| 2 | Religion and faith | Scripture: history, story or both? | "Did Noah's flood really happen?" |
| 3 | Religion and faith | Prayer, miracles and the supernatural | "Does praying work?" "Are ghosts real?" |
| 4 | Religion and faith | Other religions: equally true, partly true, or mistaken? | "Are Muslims going to heaven?" |
| 5 | Origins | Age of the Earth and universe | "How old is the Earth?" |
| 6 | Origins | Evolution, including of humans | "Did people come from monkeys?" |
| 7 | Origins | Do science and faith conflict? | "Can you believe in God and dinosaurs?" |
| 8 | Sexuality, gender and family | Where babies come from | "How did the baby get in her tummy?" |
| 9 | Sexuality, gender and family | Same-sex couples and families | "Why does Sam have two dads?" |
| 10 | Sexuality, gender and family | Gender identity and transition | "Can a boy become a girl?" |
| 11 | Sexuality, gender and family | Marriage, divorce and what a family is | "Why don't some kids live with both parents?" |
| 12 | Death | What happens after we die | "Where did Grandpa go?" |
| 13 | Death | How to talk about a death in the family or a pet | "Is it my fault the dog died?" |
| 14 | Politics and current events | Government, voting and parties | "Are Democrats bad?" "Who's the good guy?" |
| 15 | Politics and current events | Current wars, elections and news | "Are we going to have a war?" |
| 16 | Politics and current events | Wealth, poverty and fairness | "Why are some people homeless?" |
| 17 | How history is framed | Explorers and colonization | "Was Columbus a hero?" |
| 18 | How history is framed | Slavery, the founders and national heroes | "Did George Washington own slaves?" |
| 19 | How history is framed | Religious wars and persecution | "Why did people fight about God?" |
| 20 | Violence and war | How much to show, and when | "What happened in the Holocaust?" "Can I see the battle?" |
| 21 | Habits and the body | Alcohol, drugs, tobacco and caffeine | "Why can't I have a sip of beer?" "What's a drug?" |
| 22 | Habits and the body | Body image, modesty and dress | "Am I fat?" "Why can't I wear that?" |
| 23 | Habits and the body | Technology, screens and games | "Why can't I have YouTube?" "Why do you get a phone and I don't?" |
| 24 | Habits and the body | Money, work and generosity | "Are we rich?" "Why do we give money away?" |

**Not on this list, by design:** the safety floor (body safety, telling a trusted adult, emergency basics are always taught and can't be blackballed); plain facts; and matters of taste.

## The first communities

Nine communities, chosen by how many US families each pack would serve (Pew Research Center Religious Landscape Study shares, 2023–24), with the Jewish pack split in two because Reform and Orthodox answer most points differently.

| # | Community | Share of US adults | Sources the draft is built from |
| --- | --- | --- | --- |
| 1 | Evangelical, including non-denominational (Southern Baptist as the concrete case) | About 30% | Baptist Faith and Message 2000; SBC resolutions; National Association of Evangelicals statements; Answers in Genesis and BioLogos as the two poles on origins |
| 2 | Nothing in particular | 19% | No official body. Often believes in God or a higher power, keeps a light tie to a tradition, and wants kids taught decency without doctrine. Drafted from Pew's surveys of the "nones," labeled survey-based. |
| 3 | Catholic | 19% | Catechism of the Catholic Church; USCCB statements; papal encyclicals (Laudato si' on science) |
| 4 | Mainline Protestant (United Methodist, Episcopal, ELCA, PCUSA) | 11% | Each denomination's social statements; the ELCA and Episcopal Church positions on science and sexuality |
| 5 | Atheist, agnostic and secular humanist | 11% | American Humanist Association; Humanists International declarations; Pew surveys for family practice |
| 6 | Historically Black Protestant (National Baptist, AME, COGIC) | 5% | Each denomination's statements; answers several points differently from white Evangelicals, especially how history is framed |
| 7a | Jewish, Reform | 2% combined | Union for Reform Judaism resolutions; CCAR responsa |
| 7b | Jewish, Orthodox | (with 7a) | Orthodox Union and Rabbinical Council of America statements |
| 8 | Latter-day Saint | About 2% | Gospel Topics essays; General Handbook; Family Proclamation; church statements on evolution. Kept despite its size because it's distinctive on many points. |
| 9 | Muslim (Sunni mainstream) | 1% | Fiqh Council of North America; ISNA; Yaqeen Institute papers for a mainstream American view |

Hindu, Buddhist, Eastern Orthodox and Pentecostal (about 1% each) wait for a community volunteer. Communities outside the US are welcome from the start; the list above only reflects where the first family lives.

**Politics is a separate dial, not a pack.** Progressive and conservative aren't communities in the way the nine above are. They cut across every one of them: there are progressive Catholics and conservative Catholics, and the same for the "nothing in particular" group. So a family picks a belief pack and then sets a political lean separately. The lean mainly changes points 14 to 19 (politics, current events and how history is framed) and the perspective on points 9 and 10. The family's lean is a `political_lean` field on its profile. Each pack carries a variant per lean for those eight points (see `by_lean` below), and the interview uses it to pre-fill the family's answers. After that the lean has no separate effect: the answers are what the tutor follows.

### Drafting rules

- Quote or cite the community's own documents for every point. No paraphrasing from memory.
- Where the community has no official position, write "no official position" and cite a survey if one exists.
- Where a community is split, name the split and its two main camps rather than picking one.
- Record the official teaching. Family practice is for families to adjust.
- Each draft carries the label "Draft by outsiders. Awaiting review by members of this community."

### How a pack becomes community-reviewed (proposed)

1. Members who self-identify with the community review the draft, point by point.
2. When a set number have endorsed it (say, ten), with no unresolved objection, the label changes to "community-reviewed."
3. Later edits go through the same review.
4. Anyone who disagrees can fork. The fork is named for who it serves, such as "Catholic (traditionalist)."

## Pack entry format

One entry per point, in a fixed shape. The position text below is a placeholder to show the format, not a researched draft.

```yaml
pack: catholic
status: draft-by-outsiders       # becomes community-reviewed after endorsement
point: 6                         # Evolution, including of humans
when: anytime                    # anytime | from_age: N | parent_led | never
perspective: family_tradition    # family_tradition | several_fairly | omitted
position: >
  One or two sentences stating the official teaching, in plain words
  a parent could read aloud. Written from the cited source, not memory.
source: "Catechism of the Catholic Church, paragraphs 282-289; Pius XII, Humani Generis (1950)"
split: none                      # or name the camps if the community is divided
handoff: "That's a great one to ask Mom or Dad about."
parent_note: >
  Talking points for the digest, drawn from the same source,
  so the parent can answer in their own tradition's words.
```

For points 9, 10 and 14–19, an entry may add `by_lean`, overriding any of the fields above for each lean. A lean with no override uses the base entry.

```yaml
point: 17                        # Explorers and colonization
when: anytime
perspective: several_fairly
position: >
  Placeholder for the base position.
by_lean:
  progressive:
    perspective: several_fairly
    position: Placeholder for how progressive members of this community frame it.
  conservative:
    perspective: family_tradition
    position: Placeholder for how conservative members of this community frame it.
```

Packs live in this folder, one file per pack (`catholic.yaml`, `nothing-in-particular.yaml`, and so on). Propose changes by pull request. To endorse a pack as a member of its community, open an issue using the "Pack endorsement" template.
