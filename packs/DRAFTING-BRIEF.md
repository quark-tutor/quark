# Drafting brief for a starter pack

The instructions each starter pack is drafted from. Read `packs/README.md` (the 24 points, the communities and drafting rules) and `docs/09-family-values.md` (the founding rules on beliefs) first. They are the spec; this brief only adds the file format and the bar for sources.

## What a pack is for

A family picks a pack in the values interview, and the pack pre-fills its answers to the 24 points. The family then changes any answer. So each entry has two jobs:

1. **Record the community's position honestly.** What its own official documents teach, in plain words a parent could read aloud. Where there is no official position, say so and cite surveys. Where the community is split, name the camps.
2. **Suggest a starting setting** (`when`, `from_age`, `perspective`) that a typical family following that teaching would probably choose. This is a suggestion the family will review, not a claim about the community.

## Rules

- **Sources first.** Every `position` must come from a source you actually opened during this task: an official document, statement or resolution of the community, or for communities without one, a survey (Pew Research Center first). Give the document name, section or paragraph, and a URL. Never write a position from memory. If you can't find a source, write `position: "No source found yet."` and `needs_check: true`.
- **Plain words, no spin.** Describe what the community teaches without praising or criticising it. Never characterise other communities.
- **Founding rules hold in every field.** No fear, shame or manipulation. Never teach a child to look down on anyone. `handoff` lines are calm and neutral, spoken to a 6–12-year-old, e.g. "That's a great one to ask Mom or Dad about." No threats, no sin or hell language aimed at the child, even where the community teaches it (record that teaching in `position` and `parent_note`, where parents read it).
- **The safety floor is not yours to set.** Body safety, telling a trusted adult and emergency basics are always taught. Don't write entries that would block them.
- **Effort words, never brilliance words**, if you write about learning.
- **Split, don't pick.** Where a community is genuinely divided (for example Evangelicals on the age of the Earth), set `split` to name the camps and choose `several_fairly` unless the official body takes a clear side.

## Lean variants

For points 9, 10, 14, 15, 16, 17, 18 and 19 only, add `by_lean` with `progressive`, `moderate` and `conservative`. Each overrides any of `when`, `from_age`, `perspective`, `position`, `handoff`, `parent_note`, describing how members of this community with that political lean typically frame the point. Base the variants on surveys or statements where they exist (Pew breaks down many beliefs by party within a tradition) and cite them in `source`. If the community's teaching doesn't change with politics on a point, say so in a one-line `position` and keep the base settings.

## File format

Write exactly one file, `packs/<slug>.yaml`, valid YAML, with all 24 points in order:

```yaml
pack: <slug>
name: <community name as in packs/README.md>
status: draft-by-outsiders
label: "Draft by outsiders. Awaiting review by members of this community."
version: 1
drafted: 2026-10-11
summary: >
  Two or three sentences: who this pack is for and what its main sources are.
sources:                         # every source cited below, once
  - id: short-id
    title: Full title of the document or survey
    publisher: Who published it
    url: https://...
entries:
  - point: 1
    when: anytime                # anytime | from_age | parent_led | never
    from_age: null               # an integer 6-14 when when is from_age, else null
    perspective: several_fairly  # family_tradition | several_fairly | omitted
    position: >
      One to three sentences, the community's position in plain words.
    source: "short-id, section or paragraph"   # one or more ids from sources
    split: none                  # or name the camps
    handoff: "What the child hears when the tutor hands off."
    parent_note: >
      Talking points for the parent, from the same source, in the tradition's own words.
    needs_check: false           # true if anything above is uncertain
  # ... points 2-24; points 9, 10, 14-19 also carry:
    by_lean:
      progressive: { perspective: several_fairly, position: "...", source: "..." }
      moderate: { }
      conservative: { perspective: family_tradition, position: "...", source: "..." }
```

`when: never` pairs with `perspective: omitted`. `when: parent_led` may leave `perspective` as `omitted`. Keep `position` and `parent_note` short: parents will read 24 of them.

## When you finish

Check the file parses as YAML and has 24 entries numbered 1–24, each with a `source` id that exists in `sources`. Then report back: the path, the number of entries with `needs_check: true` and why, and any point where you were unsure what a typical family would choose.
