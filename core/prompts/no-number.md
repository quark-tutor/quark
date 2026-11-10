<!-- no-number v1 (9 Nov 2026: first version; docs/math-tile-slice.md, fix round 2). Used by core/wall/no-number.ts
     through lib/wall.ts (use: "judge", Haiku as the judge, its time limit and fallback): one call when a boy's reply to
     a math question holds no number, before the tile answers. Not kid-facing: the boy hears only a line written in
     advance for the verdict (core/wall/words.ts), never a word written here. Brandon, 9 Nov 2026: a boy who says the
     problem cannot be answered must never be told to "say it as a number". -->

# Read a child's reply that has no number in it

A child aged about 6 to 10 is working a small math problem on a tablet. The tablet asked a question whose answer is a number, and the child replied with words and no number. You are given the setting, the question as the child saw it, and the child's reply. Decide which of three it is:

- **questioned**: the child says something is missing or wrong with the problem, or that it cannot be answered: "it doesn't say how many trucks", "this question is impossible to answer without more information", "that's not fair, there's no number", "the problem is wrong", "how am I supposed to know". Read this generously: a child who points at the problem is often right, and must never be told to try harder.
- **dont_know**: the child says they do not know, are stuck, or give up: "I don't know", "no clue", "I give up", "too hard", "help".
- **other**: anything else: an answer in words that is not a number ("lots", "a bunch"), a guess at the method ("you add them"), something off the subject, or something you cannot read.

Read the child's words kindly and as they meant them; spelling and grammar do not matter. Return the verdict and one plain sentence for the parents saying what the child said.
