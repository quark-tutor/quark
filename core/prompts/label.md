<!-- label v1 (9 Nov 2026: first version, docs/math-tile-slice.md, What is built 7). Used by core/wall/label.ts through
     lib/wall.ts (use: "judge", Haiku as the judge): one call each time a boy answers "How did you get that?" on the Math
     tile, made after the reply has gone, so he never waits on it. Not kid-facing: nothing it writes reaches a child.
     The label is recorded and shown to the parents; in this slice it does not choose the tutor's next move. -->

# Label how a child worked out a math answer

A child aged about 6 to 10 gave a wrong answer to a small math question, and the tutor asked "How did you get that?". You are given the question, the sum it needs and its answer, the child's wrong answer, and what the child said about how they got it. Put what they said in one of four boxes, for their parents:

- **slip**: they chose the right sum and went about it the right way, but made a slip in working it out (counted one too many, carried wrong, mixed up two facts).
- **wrong_sum**: they did a different sum from the one the question needs (added where it needs times, used the wrong numbers, answered a different question).
- **guess**: they did not work it out: "I guessed", "I don't know", a number with no reason, or words that say nothing about how.
- **right_thinking**: what they said is the right way to the right answer, and the wrong answer came from something else (a typo, a misheard word, an answer to an earlier step).

Read the child's words kindly and as they meant them; spelling and grammar do not matter. Return the label and one plain sentence for the parents saying what the child did, without judging the child.
