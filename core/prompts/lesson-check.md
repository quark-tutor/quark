<!-- lesson-check v1 (23 Nov 2026, docs/week-without-hands-slice.md, stop 1, 3 and 4). Used by
     core/curation/lessons-job.ts (use: "gate"): a second call, on the gate's model, checks a short lesson another call
     wrote, before it is saved to the library. It does the work Claude Code did by hand when it checked each fact
     against the source's own record. Not kid-facing. -->

# Check one short lesson against its sources

Another call wrote a short lesson for a children's home tutor from an open item's record and a Wikipedia article. Before it is saved, check it against those same texts, as a careful editor would. You are given the lesson (its title and two summaries, and any parent note), the records of the items it uses, the article, every title the family has already had, and the 24 subjects each family sets its own rules for.

## unsupported

Read the summaries and the parent note sentence by sentence, and list every claim the article or the records do not state, or that they contradict. A claim is supported only when a reader could point to the words that say it. List it when:

- it is not in the texts at all, however well known it seems;
- it is looser or stronger than the texts: a number rounded or changed, "every" or "all" or "never" where the texts say most or some, a cause and effect turned round, a comparison the texts do not make;
- a number in it is worked out from other numbers and comes out wrong;
- it says what is in the picture and neither the record nor the article says so.

For each, give the claim in a few words and why it fails. An empty list means every claim is supported.

## repeats

The title from the family's list that this lesson repeats (the same idea, person, work or object, even under another name), or an empty string.

## values_points

The numbers of the 24 subjects below that the lesson touches at all, even lightly or in passing. When in doubt, list it: a lesson that touches any of them is not written.

1. Is there a God, and whose? 2. Scripture: history, story or both? 3. Prayer, miracles and the supernatural. 4. Other religions. 5. The age of the Earth and the universe. 6. Evolution, including of humans. 7. Do science and faith conflict? 8. Where babies come from. 9. Same-sex couples and families. 10. Gender identity and transition. 11. Marriage, divorce and what a family is. 12. What happens after we die. 13. A death in the family or of a pet. 14. Government, voting and parties. 15. Current wars, elections and news. 16. Wealth, poverty and fairness. 17. Explorers and colonization. 18. Slavery, the founders and national heroes. 19. Religious wars and persecution. 20. Violence and war: how much to show. 21. Alcohol, drugs, tobacco and caffeine. 22. Body image, modesty and dress. 23. Technology, screens and games. 24. Money, work and generosity.

## whole_hawaii

True when the lesson is about Hawaiʻi itself (its places, people, history, language or culture) rather than another idea with one line tying it to Hawaiʻi.

## title_names_idea

True when the title names the idea the lesson teaches, the way someone who knows the subject would say it; false for a tease, a pun, a question, or a title that names only the object.
