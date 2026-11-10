# The Math tile: twelve sample problems

For Brandon and June to read at stop 1 of `docs/math-tile-slice.md` (9 November 2026): the taste test. Six for each
boy at his working rungs on the ladder (the brief's table), each whole. On Sundays the model writes one like these
for each boy for each day; the program then works out every number and holds back any problem that does not check.

**At go (Brandon, 9 Nov 2026):** every problem's parts build toward one thing worth finding out, each part needed for
the last, "like problems 1, 5, 6 and 12. Not four separate sums in one setting, like 2, 3 and 8." So problems 2, 3
and 8 below are rewritten to that rule, and problem 1's part 4 now uses part 3's answer; the younger boy's quick one at
the end still stands alone. The rule is in `core/prompts/math.md`, and `checkMath()` holds what code can: no part
before the last stands alone.

How to read a part:

- The question, then **the answer** (the sum the program works out) and the rung it is on.
- **Another way** (two): what the tutor says if the first answer was wrong, after "How did you get that?".
- **One step at a time**: each step is its own small question with its own answer, in brackets. The last step's
  answer is the part's answer.
- **Think of it like this**: the tie to something he knows.
- **After a right answer**: "That's it.", then the working in two lines.

A worked example comes first only where the rung is new to him (here, sharing, money, time, measuring and bar
graphs). The boy never sees a rung's name, a grade or a level. No answer is ever on the screen before he gives it.

---

## The older boy

Working: add up to 1,000; multiplying as "groups of"; times tables 2s, 5s and 10s; and sharing, which starts
alongside the 2s, 5s and 10s, on the same facts. Shorter sums, more of them; "How did you get that?" first when
he is wrong.

### 1. The shave ice truck

*Add up to 1,000. Not new to him: no worked example. Part 4 rewritten at go (9 Nov 2026), so it uses part 3.*

A shave ice truck parks at the beach park every weekend. The people who run it keep count of the cups they sell.

1. On Saturday they sold 120 cups in the morning and 250 in the afternoon. *How many cups did they sell on
   Saturday?* **370 cups** (120 + 250)
   - Another way: 120 cups, then 250 more cups. How many cups is that altogether?
   - Another way: What do 120 and 250 make together?
   - One step at a time: Start with the hundreds: 100 and 200 make how many? (300) · Now the tens: 20 and 50 make
     how many? (70) · Put them together: 300 and 70 make how many? (370)
   - Think of it like this: It's like counting a pile of bills and coins: the big ones first, then the small ones.
   - After a right answer: 120 + 250 = 370. / They sold 370 cups on Saturday.
2. On Sunday they sold 236 cups in the morning and 148 in the afternoon. *How many cups on Sunday?* **384 cups**
   (236 + 148)
   - Another way: Sunday morning, 236 cups. Sunday afternoon, 148 cups. How many cups is that in all?
   - Another way: What do 236 and 148 make together?
   - One step at a time: The hundreds: 200 and 100 make how many? (300) · The tens: 30 and 40 make how many? (70)
     · The ones: 6 and 8 make how many? (14) · Now 300, 70 and 14 together: how many? (384)
   - Think of it like this: It's like trading 10 pennies for a dime: 14 ones is a ten and 4 ones.
   - After a right answer: 236 + 148 = 384. / They sold 384 cups on Sunday.
3. *How many cups over the whole weekend: Saturday's 370 and Sunday's 384?* **754 cups** (370 + 384)
   - Another way: Saturday was 370 cups and Sunday was 384 cups. How many cups for both days?
   - Another way: What do 370 and 384 make together?
   - One step at a time: The hundreds: 300 and 300 make how many? (600) · The tens: 70 and 80 make how many? (150)
     · Now 600, 150 and 4 together: how many? (754)
   - Think of it like this: It's like counting the cars in the beach park lot one row at a time, then adding the
     rows.
   - After a right answer: 370 + 384 = 754. / They sold 754 cups over the weekend.
4. Next weekend they want to sell 100 more cups than this weekend. *How many cups is that?* **854 cups** (754 + 100)
   - Another way: This weekend was 754 cups. Next weekend is 100 cups more. How many cups?
   - Another way: What is 754 and 100 more?
   - One step at a time: How many hundreds are in 754? (7) · 7 hundreds and 1 more hundred make how many hundreds? (8) · So
     754 and 100 more is how many? (854)
   - Think of it like this: It's like jumping ahead one hundred on a number line.
   - After a right answer: 754 + 100 = 854. / Next weekend they hope to sell 854 cups.

For a person: "Ask Mom or Dad to add up the weekend with you, one step at a time."

### 2. Oranges after the relay

*Groups of. Not new to him. Rewritten at go (9 Nov 2026): each part needed for the last.*

The soccer team goes to the beach after its last game. The coach brings oranges to share after the relay race.

1. The team runs the relay in 3 groups, with 4 kids in each group. *How many kids are running?* **12 kids** (3 × 4)
   - Another way: There are 3 groups and 4 kids in each group. How many kids?
   - Another way: How many is 3 groups of 4?
   - One step at a time: How many kids are in 1 group? (4) · In 2 groups? (8) · In 3 groups? (12)
   - Think of it like this: It's like counting chair legs: 4 on every chair.
   - After a right answer: 4 + 4 + 4 = 12, so 3 × 4 = 12. / 12 kids are running.
2. After the relay, every kid gets 2 orange slices. *How many slices do all the kids need?* **24 slices** (12 × 2)
   - Another way: 12 kids, 2 slices each. How many slices?
   - Another way: How many is 12 twos?
   - One step at a time: How many slices for 10 kids? (20) · How many for the other 2 kids? (4) · Together? (24)
   - Think of it like this: It's like counting slippers by the door: 2 for every kid.
   - After a right answer: 12 × 2 = 24. / The kids need 24 slices.
3. The coach cuts 6 oranges, and each orange makes 6 slices. *How many slices is that?* **36 slices** (6 × 6)
   - Another way: 6 oranges, 6 slices from each. How many slices?
   - Another way: How many is 6 groups of 6?
   - One step at a time: How many slices from 3 oranges? (18) · And from the other 3? (18) · Together? (36)
   - Think of it like this: It's like counting the legs on 6 ants: 6 on every ant.
   - After a right answer: 6 × 6 = 36. / The coach has 36 slices.
4. *After every kid has 2 slices, how many slices are left for the grown-ups?* **12 slices** (36 − 24)
   - Another way: The coach has 36 slices and the kids eat 24. How many are left?
   - Another way: What do you add to 24 to make 36?
   - One step at a time: From 24 up to 30 is how many? (6) · From 30 up to 36 is how many? (6) · So from 24 to 36 is how many? (12)
   - Think of it like this: It's like counting up from the price to the bill, the way change is given.
   - After a right answer: 36 − 24 = 12. / 12 slices are left for the grown-ups.

For a person: "Ask Mom or Dad to cut an orange with you and count the slices."

### 3. Party bags

*Times tables, 2s, 5s and 10s. Not new to him. Rewritten at go (9 Nov 2026): each part needed for the last.*

It's a birthday party at a friend's house, slippers piled at the door. The host is filling party bags with li hing mango, 5 pieces in every bag.

1. There are 9 kids at the party, and each gets a bag. *How many pieces of li hing mango go in their bags?* **45 pieces** (9 × 5)
   - Another way: 9 bags, 5 pieces in each bag. How many pieces?
   - Another way: How many is 9 fives?
   - One step at a time: How many pieces in 2 bags? (10) · How many in 8 bags? (40) · And one more bag? (45)
   - Think of it like this: It's like counting nickels: each one is 5 cents.
   - After a right answer: 9 × 5 = 45. / The kids' bags hold 45 pieces.
2. The host makes 3 more bags for little brothers and sisters. *How many pieces go in those?* **15 pieces** (3 × 5)
   - Another way: 3 more bags, 5 pieces in each. How many pieces?
   - Another way: How many is 3 fives?
   - One step at a time: How many pieces in 1 bag? (5) · In 2 bags? (10) · In 3 bags? (15)
   - Think of it like this: It's like counting the fingers on 3 hands.
   - After a right answer: 3 × 5 = 15. / The extra bags hold 15 pieces.
3. *How many pieces of li hing mango are in all the bags?* **60 pieces** (45 + 15)
   - Another way: 45 pieces in the kids' bags and 15 in the extra bags. How many in all?
   - Another way: What do 45 and 15 make?
   - One step at a time: 45 and 5 more make how many? (50) · 50 and the other 10? (60)
   - Think of it like this: It's like filling a jar to the top: first to the next ten, then the rest.
   - After a right answer: 45 + 15 = 60. / The bags hold 60 pieces.
4. The host opened jars with 70 pieces in all. *How many pieces are left after filling the bags?* **10 pieces** (70 − 60)
   - Another way: There were 70 pieces and 60 went in the bags. How many are left?
   - Another way: What do you add to 60 to make 70?
   - One step at a time: How many tens are in 70? (7) · How many tens are in 60? (6) · So how many pieces are left? (10)
   - Think of it like this: It's like the last few crackers left in the box after everyone takes theirs.
   - After a right answer: 70 − 60 = 10. / 10 pieces are left.

For a person: "Ask Mom or Dad to count out a snack with you in groups of 5."

### 4. The mango tree

*Sharing, on the 2s, 5s and 10s. New to him: the worked example comes first.*

**Worked example** (a picture drawn by the program: 2 plates with 5 dots on each): Sharing 10 crackers between 2
kids. Give one to each kid, then another to each kid, and keep going until the crackers are gone. Each kid ends up
with 5. 10 shared by 2 is 5: 10 ÷ 2 = 5, because 5 × 2 = 10.

The neighbor's mango tree drops more mangoes than one family can eat. They put them in bags for the people on the
street.

1. There are 20 mangoes to share fairly between 2 houses. *How many mangoes does each house get?* **10 mangoes**
   (20 ÷ 2)
   - Another way: 20 mangoes go into 2 bags, the same number in each bag. How many in each bag?
   - Another way: If you share 20 between 2, how many does each get?
   - One step at a time: Put one mango in each bag: how many mangoes have you given out? (2) · Each time round
     gives out 2. How many times round until all 20 are given out? (10)
   - Think of it like this: It's like dealing cards for a game: one to you, one to me, until the pile is gone.
   - After a right answer: 20 ÷ 2 = 10, because 10 × 2 = 20. / Each house gets 10 mangoes.
2. 15 mangoes go to 5 houses, the same for each. *How many mangoes for each house?* **3 mangoes** (15 ÷ 5)
   - Another way: Share 15 mangoes fairly among 5 houses. How many does each house get?
   - Another way: 15 shared by 5 is how many each?
   - One step at a time: Give each of the 5 houses one mango: how many have you given out? (5) · Give each house a
     second mango: how many given out now? (10) · Keep going until all 15 are gone: how many did each house get?
     (3)
   - Think of it like this: It's like passing out papers in class: one to each desk, then another, until the stack
     is gone.
   - After a right answer: 15 ÷ 5 = 3, because 3 × 5 = 15. / Each house gets 3 mangoes.
3. A grown-up cuts mangoes into 40 slices for the 10 kids at the block party. *How many slices does each kid get?*
   **4 slices** (40 ÷ 10)
   - Another way: 40 slices, shared fairly by 10 kids. How many slices each?
   - Another way: 40 shared by 10 is how many each?
   - One step at a time: If each kid gets 1 slice, how many slices is that? (10) · If each kid gets 2 slices, how
     many slices is that? (20) · How many slices each uses up all 40? (4)
   - Think of it like this: It's like counting by tens: 10, 20, 30, 40. Count the jumps.
   - After a right answer: 40 ÷ 10 = 4, because 4 × 10 = 40. / Each kid gets 4 slices.
4. 18 mangoes go into 2 bags, the same in each. *How many in each bag?* **9 mangoes** (18 ÷ 2)
   - Another way: Share 18 mangoes between 2 bags. How many in each bag?
   - Another way: 18 shared by 2 is how many each?
   - One step at a time: Put 5 in each bag: how many mangoes is that? (10) · How many are still left to share? (8)
     · Share those 8 between the 2 bags: how many more go in each? (4) · Each bag has 5 and then 4 more: how many
     in each bag? (9)
   - Think of it like this: It's like two teams picking players: one for this team, one for that team.
   - After a right answer: 18 ÷ 2 = 9, because 9 × 2 = 18. / Each bag gets 9 mangoes.

For a person: "Ask Mom or Dad to share out a real snack with you, one at a time, and see what each person gets."

### 5. The farmers' market

*Everyday: money. New to him: the worked example comes first.*

**Worked example** (a picture drawn by the program: two shave ice cups marked $4, and a $10 bill): A shave ice
costs $4. Two of them cost $4 + $4 = $8. Pay with a $10 bill: $8 and $2 more make $10, so you get $2 back.

Saturday morning at the farmers' market. Apple bananas are $2 a bunch. A pineapple is $5.

1. You buy 3 bunches of apple bananas. *How many dollars is that?* **$6** (3 × 2)
   - Another way: Each bunch costs $2, and you take 3 bunches. How much do you pay?
   - Another way: How much is 3 lots of $2?
   - One step at a time: How much do 2 bunches cost? (4) · Add one more bunch: how much now? (6)
   - Think of it like this: It's like counting by 2s.
   - After a right answer: 3 × $2 = $6. / The bananas cost $6.
2. You also buy 2 pineapples. *How much do they cost?* **$10** (2 × 5)
   - Another way: Pineapples are $5 each. How much for 2 of them?
   - Another way: What is $5 and $5 more?
   - One step at a time: How much is one pineapple? (5) · And two? (10)
   - Think of it like this: It's like two hands of fingers, 5 on each.
   - After a right answer: 2 × $5 = $10. / The pineapples cost $10.
3. *How much for the bananas and the pineapples together?* **$16** (6 + 10)
   - Another way: The bananas were $6 and the pineapples were $10. What is the total?
   - Another way: What do $6 and $10 make?
   - One step at a time: Start at $10 and add $5: how much? (15) · Add the last $1: how much? (16)
   - Think of it like this: It's like adding two scores at the end of a game.
   - After a right answer: $6 + $10 = $16. / You spend $16.
4. You pay with a $20 bill. *How much change do you get back?* **$4** (20 − 16)
   - Another way: The total is $16 and you hand over $20. How many dollars come back to you?
   - Another way: What do you add to $16 to make $20?
   - One step at a time: What is $16 and $2 more? (18) · How many more dollars from $18 to $20? (2) · So how many
     dollars from $16 to $20? (4)
   - Think of it like this: It's like the person at the stand counting up from the price to the bill you gave.
   - After a right answer: $20 − $16 = $4. / You get $4 back.

For a person: "Ask Mom or Dad to let you pay at the market and count the change with you."

### 6. To the beach by bus

*Everyday: how long something takes. New to him: the worked example comes first.*

**Worked example** (a picture drawn by the program: a clock face with 35 of its 60 minutes shaded): Lunch is 20
minutes, then recess is 15 minutes. That's 20 + 15 = 35 minutes. An hour is 60 minutes, so 60 − 35 = 25 minutes of
the hour are left.

You go to the beach by bus. You walk 15 minutes to the bus stop, ride the bus for 30 minutes, then walk 5 minutes
to the sand.

1. *How many minutes does the trip take, from your door to the sand?* **50 minutes** (15 + 30 + 5)
   - Another way: Walk 15 minutes, ride 30 minutes, walk 5 minutes. How many minutes in all?
   - Another way: What do 15, 30 and 5 add up to?
   - One step at a time: The two walks, 15 minutes and 5 minutes: how many minutes is that? (20) · Now add the 30
     minutes on the bus: how many minutes? (50)
   - Think of it like this: It's like adding up the songs on the way: one, then the next, then the next.
   - After a right answer: 15 + 30 + 5 = 50. / The trip takes 50 minutes.
2. An hour is 60 minutes. *How many minutes of the hour are left after the 50-minute trip?* **10 minutes**
   (60 − 50)
   - Another way: The trip uses 50 of the hour's 60 minutes. How many minutes are left?
   - Another way: What do you add to 50 to make 60?
   - One step at a time: 50 and how many more make 55? (5) · 55 and how many more make 60? (5) · So from 50 to 60
     is how many minutes? (10)
   - Think of it like this: It's like a game clock: most of the time is gone, so how long until it runs out?
   - After a right answer: 60 − 50 = 10. / 10 minutes of the hour are left.
3. You come home the same way. *How many minutes of travel is that, there and back?* **100 minutes** (50 + 50)
   - Another way: 50 minutes there and 50 minutes back. How many minutes in all?
   - Another way: What is 50 and 50?
   - One step at a time: 5 tens and 5 tens make how many tens? (10) · So 50 and 50 make how many? (100)
   - Think of it like this: It's like doubling: the same trip twice.
   - After a right answer: 50 + 50 = 100. / You travel 100 minutes there and back.
4. *100 minutes is 1 hour and how many more minutes?* **40 minutes** (100 − 60)
   - Another way: Take one hour, 60 minutes, away from 100 minutes. How many minutes are left over?
   - Another way: What do you add to 60 to make 100?
   - One step at a time: 60 and 20 more make how many? (80) · 80 and 20 more make how many? (100) · So 60 and how
     many more make 100? (40)
   - Think of it like this: It's like a long movie: one hour, and then a bit more.
   - After a right answer: 100 − 60 = 40. / 100 minutes is 1 hour and 40 minutes.

For a person: "Ask Mom or Dad to time your next trip somewhere with you, and add it up together."

---

## The younger boy

Working: times tables 3s and 4s; and sharing, which starts alongside them, on the same facts. Words that hide the
sum; one part a day asks "How do you know?" after his right answer, so he says why; the last part is a quick one,
because he likes them.

### 7. The plate lunch wagon

*Times tables, 3s and 4s. Not new to him.*

Every plate lunch from the wagon comes the same way: two scoops rice and one scoop mac salad.

1. The wagon sells 7 plate lunches at noon. *How many scoops did the server dish out?* **21 scoops** (7 × (2 + 1))
   - Another way: Each plate gets 2 scoops of rice and 1 scoop of mac salad. How many scoops go on 7 plates?
   - Another way: If one plate has 3 scoops, how many scoops are on 7 plates?
   - One step at a time: How many scoops go on one plate? (3) · How many on 2 plates? (6) · How many on 7 plates?
     (21)
   - Think of it like this: It's like a tricycle: 3 wheels on every one.
   - After a right answer: 2 + 1 = 3 scoops a plate, and 7 × 3 = 21. / The server dished out 21 scoops.
2. Each plate also gets 4 pieces of teriyaki beef. *How many pieces on the 7 plates?* **28 pieces** (7 × 4)
   - Another way: 7 plates, 4 pieces of beef on each. How many pieces?
   - Another way: How many is 7 fours?
   - One step at a time: How many pieces on 5 plates? (20) · How many on 2 more plates? (8) · Together? (28)
   - Think of it like this: It's like counting the legs on the dogs at the park: 4 for every dog.
   - After a right answer: 7 × 4 = 28. / There are 28 pieces of beef on the plates.
3. A family orders 4 plate lunches. *How many scoops of rice is that? Only the rice.* **8 scoops** (4 × 2), then
   "How do you know?"
   - Another way: Rice is 2 scoops on each plate. How many scoops of rice on 4 plates?
   - Another way: Leave out the mac salad. How many scoops of rice do 4 plates have?
   - One step at a time: How many scoops of rice on one plate? (2) · How many on 4 plates? (8)
   - Think of it like this: It's like counting only the red cars in the parking lot.
   - After a right answer: 4 × 2 = 8. / 4 plates have 8 scoops of rice.
4. Quick one: the wagon fills 6 trays with 4 musubi on each. *How many musubi?* **24 musubi** (6 × 4)
   - Another way: 6 trays, 4 musubi on each tray. How many musubi?
   - Another way: How many is 6 fours?
   - One step at a time: How many on 3 trays? (12) · Double it for 6 trays: how many? (24)
   - Think of it like this: It's like the 4 legs on each of 6 chairs.
   - After a right answer: 6 × 4 = 24. / The trays hold 24 musubi.

For a person: "Ask Mom or Dad to order a plate lunch with you and count the scoops."

### 8. The ʻukulele concert

*Times tables, 3s and 4s. Not new to him. Rewritten at go (9 Nov 2026): parts 1 and 2 needed for part 3.*

The ʻukulele class is getting ready for its winter concert, and the families are coming to listen.

1. The class sets out 7 rows of chairs, with as many chairs in each row as an ʻukulele has strings. *How many chairs is that?* **28 chairs** (7 × 4)
   - Another way: An ʻukulele has 4 strings, so each row has 4 chairs. How many chairs in 7 rows?
   - Another way: How many is 7 fours?
   - One step at a time: How many strings does an ʻukulele have? (4) · How many chairs in 5 rows? (20) · And in 7 rows? (28)
   - Think of it like this: It's like counting the legs on 7 dogs.
   - After a right answer: 7 × 4 = 28. / The class sets out 28 chairs.
2. Then 3 more rows go in at the back for the grandparents, with 3 chairs in each. *How many chairs is that?* **9 chairs** (3 × 3)
   - Another way: 3 rows at the back, 3 chairs in each row. How many chairs?
   - Another way: How many is 3 threes?
   - One step at a time: How many chairs in 1 back row? (3) · In 2 back rows? (6) · In 3? (9)
   - Think of it like this: It's like counting the corners on 3 triangles.
   - After a right answer: 3 × 3 = 9. / The back rows have 9 chairs.
3. *How many chairs are set out in all?* **37 chairs** (28 + 9), then "How do you know?"
   - Another way: 28 chairs in the front rows and 9 in the back. How many in all?
   - Another way: What do 28 and 9 make?
   - One step at a time: 28 and 2 more make how many? (30) · 30 and the other 7? (37)
   - Think of it like this: It's like adding the kids who come late to the line at recess.
   - After a right answer: 28 + 9 = 37. / There are 37 chairs.
4. Quick one: 6 friends each bring 3 picks. *How many picks?* **18 picks** (6 × 3)
   - Another way: 6 friends, 3 picks each. How many picks?
   - Another way: How many is 6 threes?
   - One step at a time: How many picks do 3 friends bring? (9) · And 6 friends? (18)
   - Think of it like this: It's like counting the corners of triangles: 3 on every one.
   - After a right answer: 6 × 3 = 18. / The friends bring 18 picks.

For a person: "Ask Mom or Dad to count the chairs with you the next time you are somewhere with rows of them."

### 9. Shells at the beach

*Sharing, on the 3s and 4s. New to him: the worked example comes first.*

**Worked example** (a picture drawn by the program: 4 plates with 3 dots on each): 12 musubi and 4 plates. Put one
musubi on each plate, then another, then another, until they're gone. Each plate gets 3. 12 shared by 4 is 3:
12 ÷ 4 = 3, because 3 × 4 = 12.

Three of you fill a bucket with shells at the beach. At the end you count 24 shells.

1. The three of you share the 24 shells fairly. *How many shells does each of you get?* **8 shells** (24 ÷ 3)
   - Another way: 24 shells, shared the same way among 3 kids. How many shells each?
   - Another way: 24 shared by 3 is how many each?
   - One step at a time: Give each kid 5 shells: how many shells is that? (15) · How many are left in the bucket?
     (9) · Share those 9 among the 3 kids: how many more does each kid get? (3) · 5 and 3 more: how many shells
     does each kid get? (8)
   - Think of it like this: It's like dealing cards to 3 players, one each, round and round.
   - After a right answer: 24 ÷ 3 = 8, because 8 × 3 = 24. / Each kid gets 8 shells.
2. Then another friend runs up, and now 4 kids share the 24 shells. *How many shells each?* **6 shells** (24 ÷ 4)
   - Another way: Share 24 shells fairly among 4 kids. How many does each kid get?
   - Another way: 24 shared by 4 is how many each?
   - One step at a time: Give each of the 4 kids 5 shells: how many is that? (20) · How many are left? (4) · Share
     those among the 4 kids: how many more each? (1) · So how many shells each? (6)
   - Think of it like this: It's like setting the table for 4: one at each place, then another.
   - After a right answer: 24 ÷ 4 = 6, because 6 × 4 = 24. / Each kid gets 6 shells.
3. With 3 kids, each got 8. With 4 kids, each got 6. *How many more shells did each kid get when there were only 3
   kids?* **2 shells** (8 − 6), then "How do you know?"
   - Another way: 8 shells each, or 6 shells each. How many more is 8 than 6?
   - Another way: What is the difference between 8 and 6?
   - One step at a time: From 6 up to 7 is how many? (1) · And from 6 up to 8? (2)
   - Think of it like this: It's like two stacks of blocks side by side: how much taller is one?
   - After a right answer: 8 − 6 = 2. / With 3 kids, each kid got 2 more shells.
4. Quick one: 15 shells, shared fairly by 3 kids. *How many each?* **5 shells** (15 ÷ 3)
   - Another way: Share 15 shells among 3 kids. How many each?
   - Another way: 15 shared by 3 is how many each?
   - One step at a time: Give each kid 2 shells: how many is that? (6) · Give each kid 2 more: how many given out
     now? (12) · Give out the rest, one each: how many shells does each kid have? (5)
   - Think of it like this: It's like counting by 3s: 3, 6, 9, and on. How many jumps to 15?
   - After a right answer: 15 ÷ 3 = 5, because 5 × 3 = 15. / Each kid gets 5 shells.

For a person: "Ask Mom or Dad to share out a bowl of something with you, one each, round and round."

### 10. The surf shop

*Everyday: measuring length. New to him: the worked example comes first.*

**Worked example** (a picture drawn by the program: two bars on a ruler, 7 and 3 inches long): A pencil is 7
inches long and a crayon is 3 inches long. Laid end to end, they are 7 + 3 = 10 inches. The pencil is 7 − 3 = 4
inches longer than the crayon.

Surfboards stand in a row outside the surf shop. A longboard is 9 feet long. A shortboard is 6 feet long. A boogie
board is 4 feet long.

1. *How many feet longer is the longboard than the shortboard?* **3 feet** (9 − 6)
   - Another way: The longboard is 9 feet and the shortboard is 6 feet. How much longer is the longboard?
   - Another way: What do you add to 6 to make 9?
   - One step at a time: What is 6 and 2 more? (8) · How many more from 8 to 9? (1) · So from 6 feet to 9 feet is
     how many feet? (3)
   - Think of it like this: It's like standing back to back with someone to see who is taller, and by how much.
   - After a right answer: 9 − 6 = 3. / The longboard is 3 feet longer.
2. Lay the shortboard and the boogie board end to end. *How long are they together?* **10 feet** (6 + 4)
   - Another way: 6 feet of shortboard and 4 feet of boogie board, end to end. How many feet?
   - Another way: What do 6 and 4 make?
   - One step at a time: 6 and 2 more is how many? (8) · And 2 more again? (10)
   - Think of it like this: It's like laying two towels on the sand, one after the other.
   - After a right answer: 6 + 4 = 10. / Together they are 10 feet long.
3. The shop's ruler is 1 foot long, and a foot is 12 inches. *How many inches is 2 feet?* **24 inches** (12 + 12),
   then "How do you know?"
   - Another way: 1 foot is 12 inches. 2 feet is 12 inches and 12 inches more. How many inches?
   - Another way: What is 12 and 12?
   - One step at a time: 10 and 10 make how many? (20) · 2 and 2 make how many? (4) · 20 and 4 make how many? (24)
   - Think of it like this: It's like two cartons of a dozen eggs.
   - After a right answer: 12 + 12 = 24. / 2 feet is 24 inches.
4. Quick one: *3 feet is how many inches?* **36 inches** (3 × 12)
   - Another way: Each foot is 12 inches. How many inches in 3 feet?
   - Another way: How many is 3 twelves?
   - One step at a time: How many inches is 2 feet? (24) · Add one more foot: how many inches? (36)
   - Think of it like this: It's like 3 rulers laid end to end.
   - After a right answer: 3 × 12 = 36. / 3 feet is 36 inches.

For a person: "Ask Mom or Dad for a tape measure, and measure a board or a towel together."

### 11. Fish on the reef

*Everyday: reading a bar graph. New to him: the worked example comes first.*

**Worked example** (a bar graph drawn by the program): Shave ice sold at the stand: strawberry 6, lilikoʻi 4, blue
vanilla 2. The tallest bar is strawberry. Strawberry sold 6 − 4 = 2 more than lilikoʻi.

On a snorkel trip you count the fish you see, and make a bar graph (drawn by the program): yellow tang 8,
parrotfish 4, Moorish idol 5, humuhumunukunukuāpuaʻa 3.

1. *How many more yellow tang did you see than parrotfish?* **4 fish** (8 − 4)
   - Another way: The yellow tang bar is taller than the parrotfish bar. By how many fish?
   - Another way: Yellow tang take away parrotfish: how many?
   - One step at a time: How many yellow tang? (8) · How many parrotfish? (4) · How many more is 8 than 4? (4)
   - Think of it like this: It's like two towers of blocks side by side: count how much taller one is.
   - After a right answer: 8 − 4 = 4. / You saw 4 more yellow tang than parrotfish.
2. *How many fish did you see in all?* **20 fish** (8 + 4 + 5 + 3)
   - Another way: Add up all four bars. How many fish is that?
   - Another way: What do 8, 4, 5 and 3 make?
   - One step at a time: Yellow tang and parrotfish together: how many? (12) · Moorish idols and humuhumu together:
     how many? (8) · Put the two together: how many fish? (20)
   - Think of it like this: It's like counting everyone at a party, one family at a time.
   - After a right answer: 8 + 4 + 5 + 3 = 20. / You saw 20 fish.
3. The humuhumu bar is the shortest. *How many fewer humuhumu than Moorish idols?* **2 fish** (5 − 3), then "How do
   you know?"
   - Another way: Moorish idols, 5. Humuhumu, 3. How many fewer humuhumu?
   - Another way: How many more is 5 than 3?
   - One step at a time: How many Moorish idols? (5) · How many humuhumu? (3) · From 3 up to 5 is how many? (2)
   - Think of it like this: It's like two teams' scores: how far behind is the smaller one?
   - After a right answer: 5 − 3 = 2. / You saw 2 fewer humuhumu than Moorish idols.
4. Quick one: on your next trip you see twice as many Moorish idols. *How many is that?* **10 fish** (2 × 5)
   - Another way: Last time, 5 Moorish idols. This time, 2 times as many. How many?
   - Another way: What is double 5?
   - One step at a time: How many Moorish idols last time? (5) · Double it: 5 and 5 make how many? (10)
   - Think of it like this: It's like ordering the same plate lunch twice.
   - After a right answer: 2 × 5 = 10. / That's 10 Moorish idols.

For a person: "Ask Mom or Dad to make a bar graph with you of something at home: shoes, cups, or the fruit in the
bowl."

### 12. Cones at soccer practice

*Times tables, 3s and 4s, with a shape hiding the number. Not new to him.*

At soccer practice, the coach sets out cones for drills. Every drill is a shape on the grass with a cone on each
corner, and no two shapes share a cone. A square has 4 corners and a triangle has 3. *(The corners added at fix round
2, 9 Nov 2026: every number a part's sum needs is on screen.)*

1. The coach makes 6 squares. *How many cones does that take?* **24 cones** (6 × 4)
   - Another way: A square has 4 corners, and each corner gets a cone. How many cones for 6 squares?
   - Another way: How many is 6 fours?
   - One step at a time: How many corners does one square have? (4) · How many cones for 3 squares? (12) · How many
     for 6 squares? (24)
   - Think of it like this: It's like a picnic blanket on a windy day: a rock on each of its 4 corners.
   - After a right answer: 6 × 4 = 24. / 6 squares take 24 cones.
2. Then the coach sets out 5 triangles. *How many cones?* **15 cones** (5 × 3)
   - Another way: A triangle has 3 corners. How many cones for 5 triangles?
   - Another way: How many is 5 threes?
   - One step at a time: How many corners does a triangle have? (3) · How many cones for 2 triangles? (6) · For 4
     triangles? (12) · And 5? (15)
   - Think of it like this: It's like a three-legged stool: 3 legs every time.
   - After a right answer: 5 × 3 = 15. / 5 triangles take 15 cones.
3. *How many more cones do the squares use than the triangles?* **9 cones** (24 − 15), then "How do you know?"
   - Another way: The squares use 24 cones and the triangles use 15. How many more do the squares use?
   - Another way: What do you add to 15 to make 24?
   - One step at a time: From 15 up to 20 is how many? (5) · From 20 up to 24 is how many? (4) · So from 15 to 24
     is how many? (9)
   - Think of it like this: It's like two piles of cones side by side: how many extra are in the big pile?
   - After a right answer: 24 − 15 = 9. / The squares use 9 more cones.
4. Quick one: 7 triangles. *How many cones?* **21 cones** (7 × 3)
   - Another way: Each triangle needs 3 cones. How many for 7 triangles?
   - Another way: How many is 7 threes?
   - One step at a time: How many for 5 triangles? (15) · How many for 2 more triangles? (6) · Together? (21)
   - Think of it like this: It's like counting the wheels on 7 tricycles.
   - After a right answer: 7 × 3 = 21. / 7 triangles take 21 cones.

For a person: "Ask Mom or Dad to set out a shape in the yard with you, something on each corner, and count them
together."
