# Report: the trading boat, slice 1

Brief: `docs/trading-boat-slice.md` (*Wonder Wall*, phase 4), on `phase-4-wonder-wall`. Size: a slice (8 hours).
Started 16 Nov 2026 at 17:23 HST. Stop 1 was first printed at 17:40, and its fix round on paper (below) at 18:00.
**Brandon's "go" at 18:05** takes every recommendation in the fix round, the numbers as simulated, the one migration
(on test only), and the row out of order.

## Stop 1, fix round 1 on paper (16 Nov 2026, 17:58 HST)

### Brandon's word (16 Nov 2026, after 17:40)

> Not go yet: one fix round on paper. The simulation shows the flaw. The careful player's best move is the same every
> day: fill the canoe with the rumored good at the lowest price (10 × $2), sell it all (10 × $10). A boy finds that in
> three days and then does two easy sums forever. And a bigger boat brings 17 × $5 to a child who can afford it but is
> still on his 5s.
>
> Change the rule: the size of a sum follows his place on the ladder, never his boat or his money.
> - Each trader has a limited stock of each good, a few crates (recommended 3 to 9, varied by day), so filling the
>   boat takes several purchases with different counts, at both markets.
> - Buyers at the landing take a limited number at a time too, so a sale is several sums, never one sum on the whole
>   cargo.
> - A bigger boat means more trades, not bigger numbers. A count above 10 in one sum appears only when the ladder says
>   he is working on bigger multiplying.
> - Check that no single best purchase repeats day after day, and that across a week of careful play he meets most of
>   the facts in the tables he is working on. Show that in the table: for each child, how many different sums a
>   careful week holds, and which.
>
> Run the simulation again with this and choose the boats' prices from it. Show me the page again with what changed.
>
> Everything else stands: the day, the sentences, the clean-up list, the art list, taking the row now. Two notes:
> Documents\quark-art already has a README and four pictures (two markets, a cast-off, a landing), so add to it rather
> than replacing it; and the pictures there are 3:2.

### What changed in this round

1. **The size of a sum follows the ladder.** No sum has more than 10 crates or bills in it unless he is placed on
   *Multiply bigger numbers*, and neither child is. The cap is read from the ladder, so it holds for any boat and any
   amount of money.
2. **Each trader has a few crates of each good:** 2 to 10, different each day. Filling the canoe takes two or three
   purchases at both markets. You recommended 3 to 9; 2 to 10 lets the 2 × and 10 × facts come up, which 3 to 9
   never does.
3. **Buyers take a few at a time.** Each buyer on the dock takes up to 2 to 10 crates, and he chooses how many to sell
   to each. A sale is always several sums.
4. **His buying prices are the tables he is working on:** Kiddo $2 and $5, Bug $3 and $4. In the first run Bug bought
   at $2 first, so his 3s and 4s only ever got the leftover crates.
5. **A usual price.** Every dock pays it for any good that no rumor names: Kiddo $5, Bug $4. This replaces "an unnamed
   good sells at $2". So every cheap crate is worth carrying, and a bigger boat has a use: more cheap crates, more
   trades.
6. **No choice loses money now; it only earns less.** A crate always sells for at least what it cost.
7. **The boats are now 4, 15 and 40 hundred-dollar bills** (were 7, 15 and 30). A price above 10 bills is paid in
   bundles of up to 10, each bundle a sum.
8. **The look back asks only when both totals are $100 or less,** so it stays on adding and taking away to 100.
9. **Each market sells four goods** (was three): the two the rumors name, at both markets with different prices, and
   two of its own.
10. **The art list adds to `README.txt`** in `Documents\quark-art`, keeps its four pictures and its style method, and
    asks for 3:2 throughout.
11. **New sentences for June,** marked *new* or *changed* below.

The day, the rest of the sentences, the clean-up list, the art list and taking the row now stand.

### Where the job stands

- **Read:** the brief; the Math tile's report and the Next.js report's emergency stop; `docs/math-tutor-proposal.md`;
  the ladder and `lib/ladder.ts`; everything in `core/math/`, `core/wall/` and `app/kid/` that the Math tile touched;
  the three math migrations; docs/08's decisions from 1 Nov on, *How Quark is built with Claude* and *Bugs*;
  `docs/15-reward-engine.md`; the rules in `CLAUDE.md`; `Documents\quark-art\README.txt`.
- **Simulated:** the second simulation below, in a scratch file outside the repository. No other file is written and
  nothing has run against a database.
- **Branch:** `phase-4-wonder-wall` is checked out, as the brief names.
- **The board:** the brief's row is third in Next. You said to take it now (above). Nothing else is in hand. The Math
  tile's row is *waiting on*; at the close it is closed as replaced by this one.
- **On go**, first `git pull --rebase --autostash origin phase-4-wonder-wall`, then the row moves to *building* at the
  top with today's date. That first commit holds the board, the brief and this file.
- **The stops pass the test:**
  - stop 2 is *Your look*, and each check is in exact words;
  - stop 3 guards a child (the first time a boy uses a test device);
  - stop 4 is the close.
- **Risky steps:**
  - **A migration (test only).** The game's state needs one migration. On this branch the push applies it to test
    through the migrations workflow, so there is no push stop. CLAUDE.md says a new migration waits for your yes:
    **go is that yes.** It never goes to live in this job.
  - **Live, money, a real person:** none. No model writes a problem. Spend is two kinds, both small and both on test:
    - the no-number judge (Haiku, about $0.0002 a reply, only when a reply has no number);
    - Google's voice, inside the free tier.
  - **A child:** stop 3.
  - **A secret:** none.
- **Nothing needs your hands** between go and stop 2.
- **No planned command meets the deny list.** Test's math week is cleared by a fixture through `npm run`.

### The day, as a child meets it

The tile is **Math** on the wall, titled **The trading boat**. It shows on the dev server against test only, beside the
five cards, for test's two children.

**The first day** starts at home with $20 and an empty canoe that holds 10 crates. Then:

1. **The harbor market.** At the top: your money, your boat (*3 of 10 crates full*), what is on board, and what any
   dock pays for anything ("Every dock pays $5 a crate for anything"). Then one rumor, and four goods, each with its
   price a crate and how many crates the trader has.
   - Nothing says what to buy or how many.
   - Tap a good, then set how many with − and +. The + stops at the trader's crates or the room left on the boat,
     whichever is less, and never passes 10.
2. **The trade.** The page shows that many crates, each with its price, and nothing else. Beside them:
   - the question, "How much do you owe the trader?";
   - the sum, "6 × $5 = ?";
   - the number pad, the box and Talk.

   A right total takes the money and puts the crates aboard. He buys again, at this market or the next. *Choose
   again* is always there.
3. **The village market.** The same goods the rumors name, at different prices. A second rumor, and two goods of its
   own.
4. **Cast off.** "Where will you sail?" offers the two rumors' islands. He picks one, and the day is over: the tile
   reads *Done for today*.

**Every day after:**

1. **The landing.** He lands where he sailed, and is told why the rumored good is dear there. The buyers come one at a
   time: "A buyer takes up to 6 crates of mangoes at $10 a crate." He sets how many, the crates are drawn, and he says
   what he is owed. Then the next buyer, until he has sold what he wants. *Keep the rest on the boat* ends it.
2. **One look back**, when both totals are $100 or less: "You paid $30 for these mangoes and sold them for $60. How
   much did you make?", "$60 − $30 = ?".
3. **The boat builder**, when he has a bigger boat's price and $20 more. Up to 10 bills is one sum ("4 × $100 = ?").
   More than 10 bills is a sum for each bundle of up to 10.
4. The two markets and the cast-off, as on the first day.

**A missed day costs nothing.** The game counts days played, not calendar days. A day left half-played is waiting at
the same stop, with the same prices.

**A wrong answer, at once:**
- **The two numbers added:** "That's 6 and 5 put together. You need 6 lots of 5."
- **One crate out:** "Close. One crate out."
- **Anything else:** "Let's count them."
- **"I don't know":** "Have a guess first. Any guess is fine."
- **Something is missing or wrong:** "Good catch. Thank you for telling me."
- **The count follows each of these,** except "I don't know". The crates light up two at a time, and he gives each
  total so far ("$10 + $5 + $5 = ?").
  - A wrong step is asked again one crate at a time.
  - A wrong one-crate step brings "Want to try fewer?" (or "Want to sell fewer?"), and he chooses a smaller number.
  - Where there is nothing fewer, it is "This one is for a person: Ask a grown-up to work it out with you."
- **The answer is never shown,** and a wrong sum never costs money.

**Short of money** with a right total: "That's right, it's $70. You have $60." **No room:** the + stops.

### The numbers

Each child's numbers come from his places on the ladder (`tablesOf()`): every number of a times table he has done or is
working on. Test's older child is Kiddo, at the older boy's places; test's younger child is Bug, at the younger
boy's.

| | Kiddo | Bug |
|---|---|---|
| His numbers | $2, $5, $10 | $2, $3, $4, $5, $10 |
| The tables he is working on | 2s, 5s, 10s | 3s, 4s |
| Buying prices: the tables he is working on, under his top number | $2, $5 | $3, $4 |
| The usual price: what any dock pays for a good no rumor names | $5 | $4 |
| A rumor promises (at least $1 over the usual, and $2 over the cheaper price today) | $10 | $5 or $10 |

- **At each market:** four goods. The two goods the rumors name are sold at both markets, at different prices. Each
  market adds two goods of its own.
- **The trader's crates:** 2 to 10 of each good, different each day.
- **The buyers at the dock:** each takes up to 2 to 10, different for each buyer.
- **Each day,** at least one good costs his lowest buying price.
- **The most in one sum: 10** crates or bills. More only when he is placed on *Multiply bigger numbers*.
- **Starting money:** $20. **The canoe:** 10 crates.
- **A crate always sells for at least what it cost**, so no choice loses money; a poor one earns less.

**The boats**, the same for both children:

| Boat | Holds | Price | Its sums | First reached by careful play (median day) |
|---|---|---|---|---|
| Canoe | 10 crates | his from the start | | |
| Double canoe | 20 crates | $400 | 4 × $100 | Kiddo day 7, Bug day 9 |
| Schooner | 50 crates | $1,500 | 10 × $100, then 5 × $100 | Kiddo day 21, Bug day 29 (in 248 runs of 400) |
| Ship | 100 crates | $4,000 | 10 × $100, four times | after day 30 for both |

A boat is offered when he can pay and still keep $20.

**Why $400 for the first boat and not more.** The canoe carries 10 crates, so a canoe day holds about 5 sums, and a
canoe week meets about half of his working facts. The double canoe brings about 9 sums a day and most of them. At $400
a careful boy has it in his second week:
- Kiddo meets 25 of 30 facts that week, and Bug 15 of 20.
- At $600 the boat comes on days 10 and 13, and the second week holds 23 of 30 and 12 of 20.

Both prices fit the brief's "within about two weeks". $400 gets him to most of his facts a week sooner.

**The simulation:** 400 runs of 30 days for each child, with three players.
- **Careful:** buys every crate worth more where he is going than it costs, the best margin first, at both markets,
  and sails to the better of the two rumors.
- **In between:** follows the first rumor he hears and buys its good at the first market, fills up with anything at
  the second, and never compares.
- **Careless:** buys something at random at each market, in any amount, and sails to either rumor's island.

| Median of 400 runs | Day 5 | Day 10 | Day 15 | Day 20 | Day 30 | First boat |
|---|---|---|---|---|---|---|
| Kiddo, careful | $303 | $359 | $905 | $1,434 | $1,319 | day 7, in 400 of 400 |
| Kiddo, in between | $190 | $313 | $254 | $497 | $982 | day 11, in 400 of 400 |
| Kiddo, careless | $65 | $134 | $196 | $259 | $308 | day 28, in 138 of 400 |
| Bug, careful | $213 | $111 | $445 | $816 | $239 | day 9, in 400 of 400 |
| Bug, in between | $120 | $253 | $323 | $148 | $425 | day 17, in 400 of 400 |
| Bug, careless | $36 | $69 | $102 | $131 | $193 | never, in 30 days |

Money is what he has at the end of the day, with his cargo at what he paid for it. It drops on the day a boat is
bought.

**Your checks, measured on the careful player** (median of 400 runs; a working fact is 1 to 10 times a table he is
working on: 30 for Kiddo, 20 for Bug):

| Careful play | Boat | Different sums in the week | Working facts met | The day's biggest buy the same as the day before | Sums a day |
|---|---|---|---|---|---|
| Kiddo, week 1 | canoe | 23 | 17 of 30 | 1 day of 6 | 5 |
| Kiddo, week 2 | double canoe from day 7 | 30 | 25 of 30 | 1 day of 6 | 9 |
| Kiddo, week 3 | double canoe | 32 | 25 of 30 | 1 day of 6 | 9 |
| Kiddo, week 4 | schooner from day 21 | 32 | 26 of 30 | 1 day of 6 | 13 |
| Bug, week 1 | canoe | 23 | 10 of 20 | 1 day of 6 | 5 |
| Bug, week 2 | double canoe from day 9 | 32 | 15 of 20 | 0 days of 6 | 8 |
| Bug, week 3 | double canoe | 33 | 17 of 20 | 1 day of 6 | 9 |
| Bug, week 4 | double canoe | 33 | 17 of 20 | 0 days of 6 | 9 |

**What it says:**
- **No best purchase repeats day after day.** The day's biggest buy matches the day before on about 1 day in 6.
- **Most of his facts in a week**, from the second week on.
  - **The canoe weeks hold about half.** A canoe day has about 5 sums.
  - **The facts he misses** are mostly the high counts: a trader rarely has 8 to 10 crates left by then.
  - **The way to more in week 1 is a cheaper first boat,** not a different rule.
- **Sums a day by boat** (careful): canoe 5 (at most 9); double canoe 9 (at most 15); schooner 13 (at most 22).

**One careful week, which sums** (one run; × is a buy, a sale or a boat bundle, − is the look back):

- **Kiddo, week 1 (canoe; the double canoe on day 7), 23 different sums:**
  - The sums: 10×2, 1×5, 2×5, 3×5, 5×2, 5×5, 7×2, 8×2, 9×2, 9×5, 1×10, 2×10, 3×10, 4×10, 6×10, 8×10, 2×2, 4×100;
    100−20, 100−23, 100−26, 100−29, 100−35.
  - Missed: 1×2, 3×2, 4×2, 6×2, 4×5, 6×5, 7×5, 8×5, 10×5, 5×10, 7×10, 9×10, 10×10.
- **Kiddo, week 3 (double canoe), 35 different sums:** 26 of his 30 facts.
  - Missed: 6×2, 6×5, 8×5, 10×10.
  - Besides his facts: 10×100 and 5×100 (the schooner), and the look backs 10−4, 15−6, 25−10, 35−14, 5−2, 90−24 and
    90−33.
- **Bug, week 1 (canoe), 20 different sums:**
  - The sums: 4×3, 5×3, 6×3, 7×3, 8×3, 9×3, 1×4, 2×4, 3×4, 5×4, 6×4, 2×10, 3×10, 4×10, 6×10; 60−18, 100−32,
    100−33, 100−35, 100−36.
  - Missed: 1×3, 2×3, 3×3, 10×3, 4×4, 7×4, 8×4, 9×4, 10×4.
- **Bug, week 3 (double canoe), 32 different sums:** 17 of his 20 facts.
  - Missed: 8×3, 6×4, 8×4.
  - Besides his facts: 1×10, 2×10 and 4×10 to 9×10 (rumored sales), and the look backs 8−6, 12−9, 20−15, 28−21, 80−28, 90−32 and
    100−35.

**One run, day by day** (⛵ = a boat bought that day):

| Day | Kiddo, careful | Kiddo, in between | Kiddo, careless | Bug, careful | Bug, in between | Bug, careless |
|---|---|---|---|---|---|---|
| 1 | $20 | $20 | $20 | $20 | $20 | $20 |
| 2 | $100 | $100 | $90 | $62 | $62 | $32 |
| 3 | $174 | $170 | $146 | $130 | $124 | $35 |
| 4 | $251 | $202 | $149 | $194 | $152 | $35 |
| 5 | $322 | $250 | $152 | $261 | $161 | $35 |
| 6 | $402 | $314 | $200 | $329 | $217 | $84 |
| 7 | $67 ⛵ | $369 | $203 | $394 | $276 | $84 |
| 8 | $190 | $411 | $203 | $63 ⛵ | $284 | $114 |
| 9 | $311 | $49 ⛵ | $233 | $164 | $340 | $118 |
| 10 | $420 | $93 | $248 | $261 | $384 | $146 |
| 11 | $540 | $132 | $263 | $291 | $392 | $146 |
| 12 | $653 | $178 | $266 | $393 | $40 ⛵ | $156 |
| 13 | $779 | $213 | $305 | $513 | $82 | $180 |
| 14 | $890 | $265 | $314 | $615 | $130 | $189 |
| 15 | $988 | $293 | $314 | $679 | $154 | $191 |
| 16 | $1,111 | $333 | $314 | $798 | $164 | $193 |
| 17 | $1,230 | $360 | $332 | $907 | $173 | $223 |
| 18 | $1,320 | $401 | $347 | $976 | $203 | $229 |
| 19 | $1,419 | $426 | $347 | $1,051 | $250 | $229 |
| 20 | $33 ⛵ | $442 | $353 | $1,128 | $264 | $237 |
| 21 | $115 | $495 | $365 | $1,216 | $327 | $240 |
| 22 | $299 | $567 | $381 | $1,315 | $390 | $248 |
| 23 | $408 | $644 | $387 | $1,344 | $409 | $258 |
| 24 | $553 | $654 | $396 | $1,373 | $419 | $262 |
| 25 | $704 | $710 | $411 | $1,470 | $486 | $262 |
| 26 | $891 | $772 | $43 ⛵ | $47 ⛵ | $537 | $278 |
| 27 | $1,052 | $857 | $46 | $72 | $546 | $279 |
| 28 | $1,210 | $937 | $54 | $198 | $616 | $279 |
| 29 | $1,340 | $993 | $79 | $230 | $635 | $282 |
| 30 | $1,526 | $1,043 | $112 | $357 | $712 | $295 |

**A finding about the ship.** By the rules above, two markets hold about 30 crates a day worth buying, on average, so
a ship of 100 never fills in one day. A full ship would take more traders and about 30 sums a day. Neither child reaches it in 30 days, even
playing carefully.

Recommended: leave the boats as decided, and look again at the day's length when a boy nears the schooner, on his
real play. Nothing in this job depends on it.

### Every sentence the game says, for June

These sentences are written into `core/wall/words.ts`, read by June, and never by a model (rule 5: no gate call,
since no problem is written by a model). Words in {braces} are filled in by the program. *New* and *changed* mark this
round.

**The tile and the first day**
- Math · The trading boat · Done for today
- You have a canoe that holds 10 crates, and $20.
- Buy crates at the markets. Sell them for more on another island.
- Go to the harbor market

**Your boat (at the top of each market)**
- Your money: ${money}
- Your {canoe | double canoe | schooner | ship}: {used} of {space} crates full
- On board: {n} crates of {good}, {n} crates of {good} · On board: nothing yet
- Every dock pays ${usual} a crate for anything. A rumor says where one thing sells for more. *(new)*

**A market**
- The harbor market at home · The harbor market on {island} · The village market on {island}
- {Good}: ${price} a crate · {n} crates left *(changed: the trader's crates)* · Sold out *(new)*
- A trader says: {reason} {Good} will sell for ${price} a crate on {island}.
- How many crates of {good}?
- That's all the trader has. *(new: when + reaches the trader's crates)*
- That's all the room on your boat. *(when + reaches the room left)*
- That many
- Go to the village market · Cast off

**The rumors' reasons**
- Mangoes: A ship full of mangoes sank near {island}.
- Coconuts: {island} is making coconut candy for a festival.
- Bananas: A storm blew down the banana trees on {island}.
- Pineapples: A big lūʻau on {island} needs pineapples.
- Taro: The taro patches on {island} flooded.
- Sweet potatoes: Pigs dug up the sweet potato fields on {island}.

**A trade**
- How much do you owe the trader? · {n} × ${price} = ?
- That's right. {n} crates of {good} are on your boat.
- That's right, it's ${total}. You have ${money}.
- Choose again
- That's my answer · Type your answer · Delete

**A wrong answer and the count**
- That's {n} and {price} put together. You need {n} lots of {price}.
- Close. One crate out.
- Let's count them.
- Have a guess first. Any guess is fine.
- Good catch. Thank you for telling me.
- {k} crates: how much so far? · ${so far} + ${price} + ${price} = ?
- 1 more crate: how much so far? · ${so far} + ${price} = ?
- Want to try fewer? · Try fewer
- Want to sell fewer? · Sell fewer
- This one is for a person: · Ask a grown-up to work it out with you.
- *(removed: "10 crates: how much?", since no sum now holds more than 10)*

**Cast off**
- Where will you sail?
- {island}: {reason} {Good} will sell for ${price} a crate there.
- You cast off for {island}. You'll land there next time.
- Your boat is sailing to {island}. You'll land there next time.
- Back to the wall

**The landing**
- You land on {island}.
- {reason, as it happened} So {good} sell for ${price} a crate here.
- Here {good} sell for the usual ${usual} a crate. *(changed: his usual price, not $2)*
- A buyer takes up to {k} crates of {good} at ${price} a crate. *(changed: a buyer at a time)*
- How many will you sell? *(new)*
- How much does the buyer owe you? · {n} × ${price} = ?
- That's right. You have ${money} now.
- Keep the rest on the boat *(changed from "Keep them on the boat")*
- Go to the harbor market

**The look back** (one a day, when both totals are $100 or less)
- You paid ${paid} for these {good} and sold them for ${sold}. How much did you make? · ${sold} − ${paid} = ?
- You paid ${paid} for these {good} and sold them for ${sold}. How much less did you get back? · ${paid} − ${sold} = ?
- That's right.
- Count up from ${smaller} to ${larger}.
- This one is for a person: · Ask a grown-up to work it out with you.

**The boat builder**
- A boat builder has a {double canoe | schooner | ship} that holds {space} crates. It costs {k} hundred-dollar bills.
- Buy it · Not now
- How much do you owe the boat builder? · {k} × $100 = ? *(up to 10 bills)*
- The builder counts them in bundles of 10. How much is this bundle? · {b} × $100 = ? *(new: more than 10 bills)*
- That's right. The {boat} is yours. It holds {space} crates.

**Read it to me** on each screen says that screen's words in order. On a trade it says the question and its sum in
words ("How much do you owe the trader? 6 times 5 dollars equals what?").

**Off the screen:** "How did you get that?" and every other move of the Math tile are gone.

### What the parents see

`/parent`, on the dev server against test only, shows *The trading boat (test only)*. For each child, newest day
first:

> Day 3 · Maui · started with $100, ended with $174
> - Sold 6 mangoes at $10: 6 × $10 = 60. Right at once.
> - Sold 4 mangoes at $10: 4 × $10 = 40. Said 14 (the two numbers added); right on the count's 2nd step.
> - Look back: $100 − $26. Said 74, right at once.
> - Harbor market: bought 9 taro at $2: 9 × $2 = 18. Right at once.
> - Village market: bought 1 taro at $5: 1 × $5 = 5. Right at once.
> - Sailed to Kauaʻi, on the taro rumor ($10).

A wrong answer is named as one of these:
- the two numbers added;
- one crate out;
- another number;
- said he didn't know;
- said something was wrong with it.

### The art list, for Midjourney (added to `Documents\quark-art\README.txt`)

**The four pictures there stand**, used as their README says:

| Their file | What the game uses it for |
|---|---|
| `market-stilts.png` | the harbor market, and the first day's screen |
| `market-hillside.png` | the village market |
| `cast-off.png` | the cast-off and *Done for today* |
| `landing.png` | every landing, for now |

**To make**, all 3:2, with the README's style reference and its line "no text, no letters --ar 3:2":

| # | Picture | What it shows | Where it is used |
|---|---|---|---|
| 1–6 | `good-mangoes`, `-coconuts`, `-bananas`, `-pineapples`, `-taro`, `-sweet-potatoes` | the good alone, a few of it, in a basket or loose (never neat crates), on a plain background | each good's line at a market, and once beside the drawn crates |
| 7–10 | `boat-canoe`, `boat-double`, `boat-schooner`, `boat-ship` | an outrigger canoe, a double-hulled sailing canoe, a two-masted schooner and a three-masted ship, each with a coral sail, side on, on a plain background | your boat at the top of the page, the boat builder, the cast-off |
| 11–13 | `trader`, `buyer`, `builder` | a trader at a stall, a buyer on the dock, a boat builder at work; people at work, not mascots, who never react to an answer (the faces question in docs/08 is open) | beside their lines, small |
| later | `island-kauai`, `-oahu`, `-molokai`, `-lanai`, `-maui`, `-hawaii` | each island as you sail in | the landing; `landing.png` serves every island until then |

**The README's open question** is whether the boat is a different boat in each scene. Four boat sizes mean the game
must show his own boat, so I recommend the second way:
- each boat as its own picture;
- `cast-off.png` and `landing.png` made again later with open water and an empty dock.

This job uses placeholders throughout, so nothing waits on it.

The close adds this list to `README.txt`, under its own heading, and changes nothing already there.

### The clean-up, file by file (first on go, in its own commits)

Unchanged from the first print except one line in `lib/ladder.ts`, now marked.

**Back to exactly what `main` has.** The first group carries the gate, and is proven by an empty
`git diff origin/main` for each file:
- **The gate:** `core/prompts/gate.md`, `core/curation/gate.ts`, `core/curation/gate-run.ts` and `gate.test.ts`. This
  takes away `not_here`, "A math card", and the family list and interests sent to the gate.
- **The Sunday build:** `core/curation/week.ts`, `week-job.ts`, `schedule.ts`, `cards.ts` and `curation.test.ts`.
  `schedule.test.ts` goes back to `main` too, keeping week 4's lines (`de0e9a1`).
- **The plan:** `lib/plan.ts` and `plan.test.ts`; `scripts/week-build.mts`.
- **The wall's moves:** `core/wall/card.ts`, `flow.ts`, `flow.test.ts`, `speech.ts`, `speech.test.ts`,
  `speech-ahead.ts` and `speech-ahead.test.ts`.
- **The pages:** `app/kid/card/[id]/page.tsx`, `app/parent/week/[theme]/page.tsx`, `app/parent/models/page.tsx`
  and `core/runs.ts`.

**Deleted:**
- the writer and its prompt: `core/curation/math.ts` and `core/prompts/math.md`;
- `checkMath()`: `core/math/check.ts`, `check.test.ts`, `problem.ts` and `samples.ts`;
- the moves and the label: `core/wall/math.ts`, `math.test.ts`, `label.ts` and `core/prompts/label.md`;
- `app/kid/card/[id]/math-box.tsx`, once its number pad is moved out;
- `plan/candidates/math-problems.md`.

**Dropped from the brief's kept list,** because the boat does not need them:
- **`core/math/expr.ts`.** The boat writes its three kinds of sum from its own numbers.
- **`app/kid/math-picture.tsx`.** The boat draws crates and bills, in a new file. That file reuses `plural()` and the
  drawing styles.
- **In `lib/ladder.ts`:** `onRule()`, `rungsOf()` and `rungsFor()`. *Changed:* a new `largestCount()` reads the cap of
  10, or more on *Multiply bigger numbers*, from the ladder.

**Kept, and why the boat needs each:**

| What | Why the boat needs it |
|---|---|
| `plan/math-ladder.yaml`, `lib/ladder.ts` (`validateLadder`, `ladderRows`, `tablesOf`), `ladder:import` and its `:live` twin, and `import-plan.mts` skipping the ladder | his prices and his cap |
| `mastery.place`, and `skills.key`, `position` and `ladder` | where each child is |
| `core/math/numbers.ts` and its test | reads "30", "$30" or "thirty dollars" |
| the number pad, moved to `app/kid/number-pad.tsx`, and its styles | the boat's sums |
| the test view: `lib/dev-view.ts` and its test, `app/kid/dev-bar.tsx`, `app/kid/dev/route.ts`, `wallNow()` in `lib/wall.ts` | switches child and day for the look |
| the no-number judge: `core/wall/no-number.ts`, its test and `core/prompts/no-number.md` | a reply that questions the sum, or says "I don't know" |
| the fixtures that are not math: `devices`, `live`, `clear`, and `places`, without the style | the look's setup |

**Fixtures** `math`, `math-check` and `familiar` go, and `answers` goes back to `main`'s. New:
- `clear-math`: clears test's math week, once;
- `boat <n> money <amount>` and `boat <n> reset`: for check 11.

**The database: nothing is deleted or reversed.** Left in place on test, unused after the clean-up:
- `children.math_style`;
- `families.familiar`;
- `attempts.move` and `attempts.label`;
- `attempts.verdict`'s values `questioned` and `no_number`;
- `model_runs.kind` `label`.

Test's week 5 math cards are deleted from test, with their questions, answers and idea rows.

**After the clean-up, a release of this branch** would change nothing a child sees and nothing about how a card is
judged. Stop 2 says so line by line.

### What is built

- **One migration, `boat_games` and `boat_turns`.** It goes to test by the push and the workflow, and is never on live
  in this job.
  - `boat_games` is one row a child: money, boat size, cargo, island, the rumor he sailed on, the game's day number,
    the calendar day he last played, and where he is in today's day, including how many crates each trader and
    buyer has left.
  - `boat_turns` is one row an answer.
  - No name, nothing about the family (rule 7). Guardians read; only the server writes.
- **The rules as pure functions,** with tests, in `core/boat/`. A day comes from the child, the day number and the
  island, and is the same every time it is asked. The tests include:
  - the cap: no sum above 10 without the rung, at any boat and any money;
  - a trade, the count, the landing, the boats;
  - the simulation, run as a test that holds the medians above within a day or two.
- **`/kid/boat` and its answer route,** with the tile added to the wall only when the test view is on. "Read it to me"
  says only what is on the screen.
- **The parents' section** on `/parent`, test view only.

### Decided here (from the brief, the records and your word; say if any is wrong)

1. **Real islands** (Kauaʻi, Oʻahu, Molokaʻi, Lānaʻi, Maui, Hawaiʻi Island). Home is just "home". Two markets an
   island: the harbor market and the village market.
2. **Six goods:** mangoes, coconuts, bananas, pineapples, taro, sweet potatoes.
3. **Two rumors a day,** one at each market. Cast off is the choice between them.
4. **Selling is a buyer at a time,** each taking up to a few. He chooses how many for each, or keeps the rest.
   *Changed by your word.*
5. **The look back** is on the good he sold for the most, when both totals are $100 or less. It ends at a person after
   two tries (rule 3).
6. **The voice: no lines made ahead in this job.** A line is stored by its words, so each waits 4 to 5 seconds only the
   first time it is ever said.
7. **Kept tools dropped:** `expr.ts`, `math-picture.tsx` and three functions of `lib/ladder.ts`.
8. **Two other rules are touched:**
   - rule 5: the words are templates read once by June, with no gate call;
   - rule 4: the boats are the game's world, bought with its money, and nothing nags.
9. **The trader's crates and the buyers' takes are 2 to 10,** not 3 to 9, so 2 × and 10 × come up. *New.*

### Your word

1. **The numbers as simulated:**
   - buying on his working tables;
   - usual prices of $5 and $4;
   - 2 to 10 crates a trader and a buyer;
   - boats at 4, 15 and 40 hundred-dollar bills.

   **Recommended: yes.** At $600 for the first boat the canoe weeks last three or four days longer, and the second
   week holds fewer of his facts (23 of 30 and 12 of 20).

   On yes, they go into the code as they are, with the simulation as a test.
2. **June reads the new and changed sentences** with the rest. Any she changes go in before the screens are built.

**What go takes:** reply **go** to take all of these, and the row out of order. Name anything you dislike instead,
and that is another fix round on paper.

## Emergency stop (16 Nov 2026, 18:30 HST): the old dev server needs your hands

### What went wrong

The iPad dev server from the Next.js job is still running, and it serves stale code to the boat.
- **What it is:** `npm run dev:ipad`, started at 16:16 HST, processes 22840 (`scripts/dev-ipad.mts`), 22284
  (`next dev`) and 2080 (its server).
- **What it does wrong:** it picked up the new pages, and Bug's wall shows the trading boat tile, and the boat opens on
  day 1. But its copy of `lib/ladder.ts` for the API routes is from before the clean-up, so every move answers 500.
  Its log, `.next/dev/logs/next-development.log`, says "workingTablesOf is not a function". Touching the file did not
  reload it.
- **Why I stopped:** stopping those processes and clearing `.next` was refused to me (auto mode: destructive). Next.js
  refuses a second dev server while this one holds its lock ("Another next dev server is already running"). So the
  steps left need it restarted, and that is your hands.

### What is done

- **Go, 18:05.** The row is at *building* (`45bb7fb`).
- **The clean-up** (`f5c4370`, pushed).
  - **The gate is `main`'s:** `gate.md`, `gate.ts`, `gate-run.ts` and `gate.test.ts` have an empty diff against
    `origin/main`. So do the Sunday build, the plan, `week:build`, the wall's cards and voice, the week page, the
    models page and the run kinds: 18 files.
  - **Deleted:** every file the stop-1 list named.
  - **What still differs from `main`** is the kept list alone: the ladder, the number reader and pad, the test view,
    the no-number judge, the fixtures and the three math migrations.
  - **Test's math week is cleared** (`npm run fixture -- clear-math`): 56 math cards on 7 days, 28 idea rows and 1
    answer, with none left.
  - That push changed no migration, so it started no migrations run. The tests ran on the laptop: 466 passed, the
    typecheck was clean, and `npm run build` was clean.
- **The game** (`cf27641`, pushed).
  - **`core/boat/`:** the day, the game, the simulation and the parents' log, all pure, with 27 tests.
  - **The simulation test holds the stop-1 numbers on the game's own rules:**
    - the careful first boat on days 6 to 9 (Kiddo) and 7 to 11 (Bug);
    - nothing above 10 in one sum;
    - no repeated best purchase;
    - most working facts a week from the second week;
    - no money lost by a careless player.
  - **The game's tests** cover checks 1 to 9 and 11 move by move, and the log covers stop 2's last check.
  - **The words:** every sentence is in `core/wall/words.ts` (`BOAT`). The wiring test runs them through the effort
    words and "never tell a guess it was wrong" checks.
  - **The server and the screens:** `lib/boat.ts` returns null with the test view off, `/kid/boat`, `/api/kid/boat`,
    "Read it to me" through the say route, the tile, the section on `/parent`, and the fixture
    `boat <n> [money <m> | reset]`.
  - **The checks:** 494 tests and the typecheck pass.
- **The migration `20261116000000_trading_boat` is on test:** run 44017188011, green ("Applying migration
  20261116000000_trading_boat.sql... Finished supabase db push."). The live job did nothing.
- **A device for my own check is paired on test** to child 2: `36e90f0b-d44f-4c6e-afbd-f38c3463e4c3`. Bug's game
  stands at day 1, opened and not played. After my check I reset his game and forget the device
  (`fixture -- boat 2 reset`, `fixture -- forget …`), so the look starts clean.

### What is not done

- The boat played end to end through the dev server (the moves, the next day, "Read it to me", the no-number judge,
  the log on `/parent`).
- `npm run build` on the finished branch, which runs before the dev server starts, never beside it.
- Stop 2, *Your look*.

### What I need

**Stop the old dev server.** Either way works:
- in the terminal where it runs, press Ctrl+C;
- or type: `! taskkill /PID 22840 /T /F` (it stops 22284 and 2080 with it).

Then type **go**. On go I:
1. clear `.next` (only if you say so with the go; otherwise the dev server starts on it as it is);
2. run `npm run build`;
3. start `npm run dev:ipad`;
4. play a day through it as child 2 and check the next day;
5. reset that game, forget the device, and write stop 2.

### How it ended

- **The first `!` command failed (my mistake).** It was `taskkill /PID 22840 /T /F`, and Git Bash turned `/PID` into
  `C:/Program Files/Git/PID`. The doubled form, `taskkill //PID 22840 //T //F`, stopped all three processes.
- **Brandon's "go, and clear .next first".** I had already started a dev server on the old `.next`, so I stopped it
  (my own, started at 18:35), cleared `.next`, built and started it again.

## Stop 2: Your look, on June's iPad, on test (16 Nov 2026, 18:50 HST)

### Where it stands

**The iPad dev server is running against test**, started at about 18:40 on an empty `.next`, after a clean
`npm run build`. June's iPad opens the wall as before, from the Home Screen (`https://192.168.50.67:3000/kid`).

**Checked through the dev server**, as test's child 2 with a device paired for the check:
- **A buy:** 3 crates at $4, answered 7, met "That's 3 and 4 put together. You need 3 lots of 4." (on Bug's
  numbers), then the count.
- **The count:** a missed step went one crate at a time.
- **A total he could not pay:** "That's right, it's $15. You have $8."
- **Number words:** "six dollars" was read as 6.
- **The no-number judge** (two calls, Haiku): "I don't know" got "Have a guess first. Any guess is fine.", and "you
  never told me how many I have" got "Good catch. Thank you for telling me." and the count.
- **The cast-off** offered the two rumors' islands.
- **"Read it to me"** made the screen's line in Sulafat and stored it.
- **The next day, through the test view's day:**
  - landed on Kauaʻi, with "A big lūʻau on Kauaʻi needs pineapples. So pineapples sell for $10 a crate here.";
  - "A buyer takes up to 3 crates of pineapples at $10 a crate.", then the second buyer;
  - the look back, "$50 − $20 = ?", with "Count up from $20 to $50." after a miss.
- **The double canoe:** after `fixture -- boat 2 money 500` and a skipped day, it was offered at the landing, and
  buying it asked "4 × $100 = ?" and counted in bills.
- **The log** (`fixture -- boat 2 log`, the same function `/parent` uses) read each day with each sum and each
  answer's kind.

**Found in Chrome, and fixed (`f62f595`):** the page kept every earlier screen's "Read it to me" button. Three parts
shared one key; each has its own now. After the fix, one button and the crates drawn and lit as the count says
(4 crates, 2 lit).

**Then cleaned up:** both test children's games are reset (each starts at home with $20), and the device paired for
the check is forgotten. June's iPad stays paired as Bug. The laptop's Chrome is paired as Kiddo.

**The checks:** 494 tests, the typecheck, and lint on every new file pass. `npm run build` was clean on the empty
`.next`. It ran before the last commit (the keys, a read-only GET of the screen, the fixture's log); that commit's
tests and typecheck pass, and the dev server serves it. A build now would run beside the dev server, so it waits for
the close.

### What a release of this branch would and would not change

`phase-4-wonder-wall` is ahead of `main` by the Math tile's commits, week 4's and the Next.js job's records, and this
job's. After the clean-up:

**It would not change anything the boys see, or how a card is judged:**
- **The gate:** `gate.md`, `gate.ts` and `gate-run.ts` are `main`'s, byte for byte (no diff). Every card is judged by
  v2.
- **The Sunday build, the plan, `week:build`, the week page and `/parent/models`:** `main`'s.
- **The wall's cards, "Read it to me" on a card, Talk and the night's lines:** `main`'s.
- **The trading boat:** on Vercel the test view is off (it needs the dev server and `QUARK_TARGET=test`).
  - The wall's tile, `/kid/boat`, `/api/kid/boat`, the boat's line in the say route and the section on `/parent`
    each return nothing and read no table.
  - A boat line sent to the say route answers 404, as any unknown line does.
- **`lib/wall.ts`** asks the test view for "now". Off the dev server that is the real time, as on `main`.

**It would carry, unused on live:**
- the ladder file and `ladder:import` (and `:live`), which no live job runs;
- the fixtures (test only);
- four migrations that are on test and not on live: the three math ones and the boat's. A release does not apply
  them to live (the workflow's live job waits on a secret left unset), and nothing on live reads what they add.

### Your look

On June's iPad, on test, as Bug, and then as Kiddo (tap the name in the test view's bar at the foot of the wall). Each
check is its own.

**Where:** the wall, the Math tile (*The trading boat*, after the cards). **Do / See:**

1. A market shows goods and prices, your money, your boat's space, and one rumor. Nothing tells you what to buy or
   how many. Pass □ Fail □
2. Pick a good and a number: the picture shows exactly that many crates, each with its price, and the sum is written
   beside the question ("6 × $5 = ?"). Pass □ Fail □
3. Give the right total: the money goes down, the crates are on the boat, and you can buy again. Pass □ Fail □
4. Give the two numbers added together: the reply says so, and the crates light up to count. Give a total one crate
   out: the reply says you are close. Give something else: the count begins at once. No reply asks how you got it.
   Pass □ Fail □
5. Ask for more than you can pay for, with the right total: the trader agrees with the sum and says you are short.
   Pass □ Fail □
6. Ask for more than the boat holds: it will not let the number go past the space left. Pass □ Fail □
7. After the last market, cast off: the day is over, the tile is done, and nothing more can be played today.
   Pass □ Fail □
8. Move the test view to tomorrow (▶): you land where the rumor pointed, the price there is what the rumor promised,
   with its reason, and you tell the buyer what you are owed. Pass □ Fail □
9. Skip a day in the test view (▶ twice), then come back: the boat is where you left it and nothing is lost.
   Pass □ Fail □
10. As Kiddo and as Bug the prices are different numbers; the game is the same. Pass □ Fail □
11. Reach the first boat's price: type `! npm run fixture -- boat 2 money 500` (Bug; `boat 1` for Kiddo). Finish
    the day, cast off, then ▶ to the next day. At the landing the bigger boat is offered, and buying it asks for its
    sum ("4 × $100 = ?"). Pass □ Fail □

**Where:** `/parent` on the dev server, as the test guardian (the laptop's Chrome, `https://localhost:3000/parent`).
**See:** under *The trading boat (test only)*, each day's trades for each child: what he bought and sold, every sum,
whether it was right at once or which help he needed, and each wrong answer with its kind. Pass □ Fail □

**To know before you start:**
- **Placeholders:** each screen's picture is a dashed box with the name of your picture that goes there. The crates
  and bills are drawn.
- **One move at a time:** each move goes to the server, so a tap waits a moment.
- **"Read it to me" waits the first time:** about 4 to 5 seconds for a line never said before, then it is stored.
- **To start a child over:** `! npm run fixture -- boat 2 reset` (or `boat 1`).
- **To see a child's log from here:** `! npm run fixture -- boat 2 log`.

### Then

- **Stop 3, if you and June choose:** one of the boys plays one day on June's iPad, on test, with a parent beside him.
  Before it, `! npm run fixture -- boat 2 reset` starts Bug's game fresh (or `boat 1`, with the bar on Kiddo, for the
  older's numbers). Tell me what you saw, in your own words.
- **Then `/wwc:close`** (close and hold: nothing is released). At the close:
  - docs/12 (how the game teaches), docs/08's decisions and `docs/math-tutor-proposal.md`'s top line;
  - *Where we are* and the README status;
  - the board: this row *on hold*, the Math tile's row closed as replaced;
  - the art list added to `Documents\quark-art\README.txt`;
  - a bug line for the `!` command's slashes;
  - the next job proposed from what the looks found.

### Spend, live, a child

- **Money:** two no-number judge calls on Haiku (about $0.0004) and two lines of Google's voice (inside the free
  tier), all on test. The judge's runs are in `model_runs` on test.
- **Live:** nothing. No command touched it.
- **A child:** nothing on live changed. On test, the boat is on June's iPad, paired as Bug.
- **Rule 7:** `boat_games` and `boat_turns` hold no name. The answers he types are kept for the parents, as on the
  cards.
