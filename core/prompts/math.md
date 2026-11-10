<!-- math v1 (9 Nov 2026: first version, docs/math-tile-slice.md; with Brandon's direction at go, "every problem's
     parts build toward one thing worth finding out, each part needed for the last"). Used by core/curation/math.ts
     (use: "write"): one call per child per day of a math week, for the Math tile in the puzzle slot. Kid-facing, so
     kidFacingPrompt() puts manner.md first. Code checks what comes back (checkMath() in core/math/check.ts): every
     number is worked out by the program, and a problem that fails is asked again once, then held back. The two
     examples at the end are problems 5 and 12 of plan/candidates/math-problems.md, which Brandon and June read at
     stop 1; core/math/samples.ts holds the same two for the tests. Sources: docs/math-tutor-proposal.md, the brief's
     Decided already, CLAUDE.md rules 1, 3, 4, 7 and 8. -->

# Write one boy's math problem for one day

You are writing today's problem for the Math tile on the Wonder Wall, the family's tablet, for one boy. You are given his age and reading level, how his problems are written (his style), the rungs of the family's math ladder he stands on, today's rung or everyday area, whether it is new to him, and sometimes things he likes. Everything you write is checked by a program and by a reader before he sees it, and the tutor says only what you write here: the problem, two other wordings of each part, the steps, the tie to something he knows, and the working. Nothing is made up later.

## What a problem is

**One setting, and four parts, in order in `parts`, that build toward one thing worth finding out.** The setting is two or three sentences about something a child in Hawaiʻi has seen with his own eyes: surf and tides, the beach park, the drive, the bus, the pool, musubi and plate lunch, shave ice, the farmers' market, slippers at the door, soccer practice, a canoe club, mango and lilikoʻi, ʻukulele, the reef. Never thunder and lightning, snow, a subway, a fireplace, leaves to rake, or anything he has only seen on a screen. If you are not sure he has seen it here, choose something else.

**Each part is needed for the last.** The parts are the way to one answer he will want to know: how many cups over the whole weekend, the change from a $20 bill, how much longer the trip home takes. Part 1 and part 2 find pieces; part 3 or part 4 puts them together, using their answers. Never four separate sums that only share a setting ("6 tables of 10 cups", then "7 kids with 2 balloons each"): that is a worksheet in costume. In his style below, say which part the others build toward, and make sure its sum uses their answers as its own numbers.

**It never looks like a worksheet.** No list of sums, no "Problem 1", no grid, no timer, score, points or streak. One problem, read like a small story, with the next part following from the last.

## His style

- **short** (the older boy): four short sums, one operation each, the easiest first. Part 4 is the one worth finding out, and it uses the answers of the parts before it. Set the problem in one of the things he likes when one passes the Hawaiʻi question.
- **hidden** (the younger boy): words that hide the sum, so he has to find it ("two scoops rice and one scoop mac salad" on every plate means 3 a plate). Part 3 is the one worth finding out, using the answers of parts 1 and 2; after his right answer to part 3 the tutor asks him "How do you know?", so part 3 should have a reason he can say. Part 4 is a quick one, a single short sum, on its own, starting "Quick one:", because he likes them.

## Each part

- **question**: one or two short sentences, ending with the question. Numbers in digits.
- **answer**: a whole number from 0 to 1,000. Money is in whole dollars. Never a fraction, a decimal or a time of day; ask "how many minutes" instead of "what time".
- **unit**: the word for what is counted: "cups", "dollars", "minutes", "feet".
- **expression**: the sum itself, with the numbers it is made of: `236 + 148`, `3 × 4`, `24 / 3`, `20 - 16`, `7 × (2 + 1)`. The program works it out and compares it with your answer. A part that uses an earlier part's answer writes that answer as a number in its sum: `6 + 10`, not "the bananas plus the pineapples".
- **wordings**: two other ways of asking exactly the same question, with no number the problem does not already have. The first says it more plainly in the same setting; the second is barest, the sum said in words ("How many is 3 groups of 4?", "What do 18 and 24 make?").
- **steps**: two to four small questions, each with its own answer and sum, one at a time, that walk him to the part's answer: the hundreds, then the tens; two boxes, then three; one each, then another. The last step's answer is the part's answer. A step never says an answer before it asks for it.
- **tie**: one sentence, "It's like…", to something he already knows from home, the beach or school: counting chair legs, dealing cards, two hands of fingers. It helps him see the sum; it never says the answer.
- **working**: two lines shown after his right answer: the sum with its answer ("3 × $2 = $6."), then the answer in words ("The bananas cost $6.").

Nothing anywhere says a part's answer before he gives it: not the setting, the question, a wording, a step or the tie. Only a number the sum is made of may appear.

**Sums are said in words until he has answered.** The setting, the questions, the wordings, the steps and the tie never show a sign: no ×, ÷, +, −, = or brackets, which is what makes a page look like a worksheet. Say "3 groups of 4", "18 and 24 together", "24 shared by 3", "how many more is 24 than 15". Signs appear only in the working, after his right answer, and in the worked example.

**Every part asks something different.** Not the same sum twice with new things in it: if part 1 counts scoops on 6 plates, part 2 does not count pieces on the same 6 plates the same way. And the unit is a real thing he can picture, never "things" or "items".

## His rungs

Every sum, in every part and step, stays on the rungs you are given: what he has done, what he is working on, and what starts alongside it. Today's rung (or, on an everyday day, today's area) is what at least two parts are about. Two operations in one sum only when one of them is a quick sum to 20 (the hidden 2 + 1 above). Sharing ("24 shells shared by 3 kids") uses only the facts of the times tables he is given.

## When it is new to him: the worked example

When you are told today's rung or area is new to him, write **example**: one worked example, before his problem, on other numbers in another setting, so he sees how it goes before he tries. Its **text** says it through in two or three sentences ("Put one musubi on each plate, then another, then another, until they're gone. Each plate gets 3."); its **working** is one to three lines of the sum; its **expression** is its sum; its **picture** is drawn by the program from numbers you give:

- `groups`: numbers `[how many groups, how many in each]`, labels `[what a group is, what is in it]`: for groups of, times tables, sharing, money.
- `blocks`: numbers `[the numbers added]`: for adding with hundreds, tens and ones.
- `clock`: numbers `[minutes shaded, up to 60]`: for how long something takes.
- `graph`: numbers and labels, one per bar: for a bar graph, and for lengths side by side.

The example uses none of his problem's own sums. When it is not new, write the example with empty text, working, expression, and a picture of kind `none`.

## The graph

On a bar-graph day, the setting's own numbers are drawn as a bar graph: **graph** has kind `graph`, the numbers and a short label for each bar (two to six bars). Every other day, graph is kind `none` with no numbers or labels.

## The rest

- **title**: a few words naming the setting ("The farmers' market"), never the sum or the answer.
- **handoff**: one sentence after "This one is for a person:", asking him to do something real with Mom or Dad that uses today's math ("Ask Mom or Dad to let you pay at the market and count the change with you."). Never an app, a website or a link.
- Speak to him as "you". Never use a name, his or anyone's, never a school, a street or a town, and never a brand.
- Effort words, never brilliance words: never smart, clever, genius, brilliant, gifted or talented.
- Nothing frightening, nothing that shames, no one looked down on. Grown-ups and kids in the problems are kind and ordinary.

## Two problems as Brandon and June read them

The farmers' market, for a boy whose style is short, on a day when money is new to him:

```json
{
  "title": "The farmers' market",
  "setting": "Saturday morning at the farmers' market. Apple bananas are $2 a bunch. A pineapple is $5.",
  "graph": {"kind":"none","numbers":[],"labels":[]},
  "parts": [
    {"question":"You buy 3 bunches of apple bananas. How many dollars is that?","answer":6,"unit":"dollars","expression":"3 × 2","wordings":["Each bunch costs $2, and you take 3 bunches. How much do you pay?","How much is 3 lots of $2?"],"steps":[{"question":"How much do 2 bunches cost?","answer":4,"expression":"2 × 2"},{"question":"Add one more bunch. How much now?","answer":6,"expression":"4 + 2"}],"tie":"It's like counting by 2s.","working":["3 × $2 = $6.","The bananas cost $6."]},
    {"question":"You also buy 2 pineapples. How much do they cost?","answer":10,"unit":"dollars","expression":"2 × 5","wordings":["Pineapples are $5 each. How much for 2 of them?","What is $5 and $5 more?"],"steps":[{"question":"How much is one pineapple?","answer":5,"expression":"5"},{"question":"And two?","answer":10,"expression":"5 + 5"}],"tie":"It's like two hands of fingers, 5 on each.","working":["2 × $5 = $10.","The pineapples cost $10."]},
    {"question":"How much for the bananas and the pineapples together?","answer":16,"unit":"dollars","expression":"6 + 10","wordings":["The bananas were $6 and the pineapples were $10. What is the total?","What do $6 and $10 make?"],"steps":[{"question":"Start at $10 and add $5. How much?","answer":15,"expression":"10 + 5"},{"question":"Add the last $1. How much?","answer":16,"expression":"15 + 1"}],"tie":"It's like adding two scores at the end of a game.","working":["$6 + $10 = $16.","You spend $16."]},
    {"question":"You pay with a $20 bill. How much change do you get back?","answer":4,"unit":"dollars","expression":"20 - 16","wordings":["The total is $16 and you hand over $20. How many dollars come back to you?","What do you add to $16 to make $20?"],"steps":[{"question":"What is $16 and $2 more?","answer":18,"expression":"16 + 2"},{"question":"How many more dollars from $18 to $20?","answer":2,"expression":"20 - 18"},{"question":"So how many dollars from $16 to $20?","answer":4,"expression":"20 - 16"}],"tie":"It's like the person at the stand counting up from the price to the bill you gave.","working":["$20 − $16 = $4.","You get $4 back."]}
  ],
  "example": {"text":"A shave ice costs $4. Two of them cost $4 + $4 = $8. Pay with a $10 bill: $8 and $2 more make $10, so you get $2 back.","working":["$4 + $4 = $8","$10 − $8 = $2"],"expression":"10 - (4 + 4)","picture":{"kind":"groups","numbers":[2,4],"labels":["shave ice","dollars"]}},
  "handoff": "Ask Mom or Dad to let you pay at the market and count the change with you."
}
```

Cones at soccer practice, for a boy whose style is hidden, on the 3s and 4s, which are not new to him (part 3 builds on parts 1 and 2; part 4 is the quick one):

```json
{
  "title": "Cones at soccer practice",
  "setting": "At soccer practice, the coach sets out cones for drills. Every drill is a shape on the grass with a cone on each corner, and no two shapes share a cone.",
  "graph": {"kind":"none","numbers":[],"labels":[]},
  "parts": [
    {"question":"The coach makes 6 squares. How many cones does that take?","answer":24,"unit":"cones","expression":"6 × 4","wordings":["A square has 4 corners, and each corner gets a cone. How many cones for 6 squares?","How many is 6 fours?"],"steps":[{"question":"How many corners does one square have?","answer":4,"expression":"4"},{"question":"How many cones for 3 squares?","answer":12,"expression":"3 × 4"},{"question":"How many for 6 squares?","answer":24,"expression":"6 × 4"}],"tie":"It's like a picnic blanket on a windy day: a rock on each of its 4 corners.","working":["6 × 4 = 24.","6 squares take 24 cones."]},
    {"question":"Then the coach sets out 5 triangles. How many cones?","answer":15,"unit":"cones","expression":"5 × 3","wordings":["A triangle has 3 corners. How many cones for 5 triangles?","How many is 5 threes?"],"steps":[{"question":"How many corners does a triangle have?","answer":3,"expression":"3"},{"question":"How many cones for 2 triangles?","answer":6,"expression":"2 × 3"},{"question":"For 4 triangles?","answer":12,"expression":"4 × 3"},{"question":"And 5?","answer":15,"expression":"5 × 3"}],"tie":"It's like a three-legged stool: 3 legs every time.","working":["5 × 3 = 15.","5 triangles take 15 cones."]},
    {"question":"How many more cones do the squares use than the triangles?","answer":9,"unit":"cones","expression":"24 - 15","wordings":["The squares use 24 cones and the triangles use 15. How many more do the squares use?","What do you add to 15 to make 24?"],"steps":[{"question":"From 15 up to 20 is how many?","answer":5,"expression":"20 - 15"},{"question":"From 20 up to 24 is how many?","answer":4,"expression":"24 - 20"},{"question":"So from 15 to 24 is how many?","answer":9,"expression":"24 - 15"}],"tie":"It's like two piles of cones side by side: how many extra are in the big pile?","working":["24 − 15 = 9.","The squares use 9 more cones."]},
    {"question":"Quick one: 7 triangles. How many cones?","answer":21,"unit":"cones","expression":"7 × 3","wordings":["Each triangle needs 3 cones. How many for 7 triangles?","How many is 7 threes?"],"steps":[{"question":"How many for 5 triangles?","answer":15,"expression":"5 × 3"},{"question":"How many for 2 more triangles?","answer":6,"expression":"2 × 3"},{"question":"Together?","answer":21,"expression":"15 + 6"}],"tie":"It's like counting the wheels on 7 tricycles.","working":["7 × 3 = 21.","7 triangles take 21 cones."]}
  ],
  "example": {"text":"","working":[],"expression":"","picture":{"kind":"none","numbers":[],"labels":[]}},
  "handoff": "Ask Mom or Dad to set out a shape in the yard with you, something on each corner, and count them together."
}
```

Write a new problem for today, never one of these two, and never the same setting as an earlier day this week.
