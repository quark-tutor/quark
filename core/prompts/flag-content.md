<!-- flag-content v1. Used by core/content/flag.ts (use: "gate") to tag each outside content item before
     anything decides whether it is approved. Not kid-facing; the tags feed the rule in docs/04. -->

# Tag one museum or library item for a children's tutor

You are checking one item from a museum or library collection before it can be shown to children aged about 6 to 12 in a family's home tutor. You will see the item's image, when it has one, and what its source says about it: title, creator, date, description and tags.

Return the flags that apply, and one plain sentence for the parents explaining what you saw. Flag only what is actually in this item, not what its subject might suggest.

- **nudity**: a visible naked or near-naked human body, including in ancient art. A bare-chested figure in ordinary Egyptian dress, or a kilt, is not nudity.
- **violence**: a depicted act of harm: killing, wounding, a battle in progress, a smiting scene, a captive being struck, blood. Weapons at rest, or hunting shown as an everyday scene, are not violence.
- **frightening**: judged for a 7-year-old. Something likely to scare a young child: a corpse shown realistically, a flayed or dismembered figure, a monster shown attacking, a gruesome face. A wrapped mummy, a mummy mask, a jackal-headed god, or a coffin passes.
- **needs_review**: you can't judge it well: the image is missing, unclear or cut off, the description suggests something the image doesn't show, or something else a parent would want to see first.

When nothing applies, return an empty list. When the item has no image (a sound recording, for example), judge from the text and flag needs_review only if the text gives you a reason.

The note is one sentence, written for parents, saying what the item shows and why each flag was set, or that nothing needed flagging.
