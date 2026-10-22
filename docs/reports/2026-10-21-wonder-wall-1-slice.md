# Report: the Wonder Wall a kid can use, phase 4 slice 1 (`docs/wonder-wall-1-slice.md`), 21 October 2026

Opus 5.5 (the brief asks for `opusplan`; this session ran on Opus 5.5 throughout). Branch `phase-4-wonder-wall`, pushed.
Nothing to `main`. Nothing on live. The job was Brandon's `/wwc:job docs/wonder-wall-1-slice.md` of 20 October, with
stop 1 (the write-back, answered on 21 October) and stop 2 below, resumed in a new session the same night. This file is
the stop's state; `/wwc:close` replaces it with the full report.

## STOP 2: Your look, Brandon on a real iPad (step 3.6)

### Fix round 1, 22 October (from the iPad, as Bug)

Brandon, from a second guardian's iPad paired as Bug, not go yet: "Read it to me" used the robotic compact voice
though Zoe (Premium) is installed and chosen in Spoken Content; the child's own answer vanished after an answer; "That's
it." was small and grey, the quietest line on the screen; Bug's wall on day 2 had four tiles, no Wonder.

**Fixed** (`3e64e4f`, on the dev server now; reload the iPad):

- **The voice.** Safari ignores Spoken Content's choice, so the wall picks: an en-US Premium voice (by voiceURI or name),
  then en-US Enhanced, then any en-US voice (never Apple's novelty or Eloquence voices), then the browser's default;
  within a tier the browser's default first (`pickVoice()` in `core/wall/voice.ts`, 8 tests). The list is read when the
  page loads and again on `voiceschanged`, so the tap never waits: iPad Safari speaks only from inside the tap.
- **The voices the iPad reports:** `http://192.168.50.67:3000/kid/voices` lists every voice the browser reports with the
  pick in bold, and a "Read it to me" to hear it; the same list is printed in the dev server's output, for this report.
  Dev server only (404 in production), and nothing links to it. Checked in the laptop's Chrome: 31 voices, picked
  "Microsoft David - English (United States)", the list printed by the server. The iPad's list goes here when Brandon
  opens the page.
- **The child's answer stays.** Each guess stays on screen as a bubble on the right, with the reply under it: before
  each hint ("Here's something to think about:" and the hint), and before "That's it.", "That's one to talk about." or
  "This one is for a person:". Decided here: the guesses are kept on the page only, so after a reload the hints come
  back from the database without the guesses that earned them; the card's reply carries nothing a child typed back to
  the browser (decision 3's fields, rule 7).
- **The replies as big as the question.** Every reply line is 28 px, bold, in the ink colour, as the question is; a hint
  and the handoff are 28 px too; "Have a guess first. Any guess is fine." the same. Checked in the laptop's Chrome on
  Kiddo's Puzzle card: "eight", then the hint, then "six" and "That's it.", the question and every reply 28 px bold
  ink, the bubbles on the right.

**Bug's Wonder card: the gate held it back, and four tiles is the rule.** `npm run fixture -- day 2026-10-22` (new,
`2031107`, test only, names no child): Bug's Wonder layer 1, "Steps in the River", and layer 3 are `blocked` by the
checker: "caution: Touches what the parents asked Quark to be careful about." The test copy keeps an invented caution
note on Bug for the gate's proof (20 October); Kiddo has none and has all five. Decision 1: a slot with no passed first
card shows nothing and the other tiles keep their order, so a child sees four tiles, Look, Listen, Then, Puzzle, with no
gap. Layer 2 passed, but a child reaches layer 2 only through layer 1, so nothing of Wonder shows. The week page's
missing-first-card line already tells a parent what the day lacks.

Also: the laptop's Chrome is now paired to Kiddo as a second device (Bug's iPad stays paired), and Kiddo's day-2 Puzzle
card is at layer 2 from that check. `npm test` 376 of 376, `npm run typecheck` clean, eslint clean on the changed files.

**After the reload, the checks for this round:**

1. On the iPad, open `http://192.168.50.67:3000/kid/voices`: the voices it reports, and "Picked:" names an en-US Premium
   voice (Zoe, if it is the only one). Its "Read it to me" is Zoe's voice, not the compact one. If Zoe isn't in the list,
   Safari doesn't offer it to a web page, and the pick is the next tier.
2. On a card, "Read it to me" reads in that same voice.
3. A guess that isn't right: your words stay in a bubble on the right, then "Here's something to think about:" and the
   hint, as big and as dark as the question.
4. A right guess: your words in a bubble, then "That's it." as big and as dark as the question, and "Go deeper".
5. Bug's wall today: four tiles, Look, Listen, Then, Puzzle, no gap.

The checks below still stand; say which have passed.

**Resumed 21 October at 10:48 pm** (a new session, `/wwc:job docs/wonder-wall-1-slice.md`). Steps 2 and 3.1 to 3.5 are
done and shown below; no code has changed since the pause. Checked tonight: the branch is level with
`origin/phase-4-wonder-wall`; `npm test` 368 of 368 and `npm run typecheck` clean; the laptop is on the home Wi-Fi at
`192.168.50.67`; a dev server on test, started by this session with that address allowed
(`DEV_ORIGIN=192.168.50.67 npm run dev -- --hostname 0.0.0.0`), answers 200 at `http://192.168.50.67:3000/kid/pair`.
Not live: `quark-test` only; what the iPad writes are test rows, and "Forget this iPad" on `/parent` undoes the pairing.

What is left: Brandon on the iPad as each invented child would, and his choice of the matcher's rule. Then the close,
`/wwc:close`, Brandon's word. Since the pause, the method says this stop is the brief's *Your look* (21 October): each
check below in exact words; "go" means every one passed, or name the one that didn't, and that is a fix round.

**Setting up:**

1. On the iPad, in Safari (not the Home Screen app), open `http://192.168.50.67:3000/kid/pair`. If it doesn't load,
   Windows may be blocking Node on the private network: allow it for private networks.
2. On the laptop, open `http://localhost:3000/parent` in Chrome as the test guardian (if it asks, sign in at
   `/sign-in`). Pick **Bug**, **Get a code**, and type the code on the iPad.

**The checks, as Bug first (all five of Bug's cards are fresh today):**

1. The wall says "Hi, Bug." and shows five tiles in the order Look, Wonder, Listen, Then, Puzzle, each with the card's
   title. Nothing scrolls: five stacked in portrait; three and two in landscape.
2. Look opens to its picture, the credit line in small type, the card's words, the question, a box saying "Type your
   answer", and "That's my answer".
3. "Read it to me": you hear the card read (volume up, silent mode off); the button now says "Stop", and tapping it stops
   the voice.
4. Tapping the box opens the keyboard and the box stays in sight above it. The keyboard's microphone key puts your spoken
   words in the box (if dictation is on: Settings, General, Keyboard, Enable Dictation).
5. Type "I don't know" and tap "That's my answer": "Have a guess first. Any guess is fine." and no hint.
6. A wrong guess: "Here's something to think about:" and one hint, with its own "Read it to me".
7. A right guess: "That's it." and "Go deeper", which opens layer 2.
8. Listen: a player saying "Play" that plays nothing until tapped; tapped, the music plays, and "Pause" pauses it.
9. On any card, wrong guesses until the hints run out, then one more: "This one is for a person:" and the handoff line,
   with no answer box and no "Go deeper". "Back to the wall": that tile now says "Done for today".
10. Leave a card part way, reload Safari, open the tile again: the same layer, with the hints already seen.
11. Nothing plays or reads by itself, and nothing on any screen leads out of the wall.
12. On `/parent`, **Forget this iPad**, then a code for **Kiddo**: the wall says "Hi, Kiddo.", Kiddo's own cards. Before
    midnight, Wonder, Then and Puzzle say "Done for today" and Look opens at layer 2 (the laptop proof used them); after
    midnight it is Thursday, day 2, and all five are fresh for both.
13. Used as each would, a 7-year-old and a 9-year-old: name anything that would stop or puzzle a child.

**Brandon's choice at this stop: the matcher's rule.** The wall runs `every` (`WALL_RULE` in `lib/wall.ts`). Over the same
invented answers (table below): `every` misjudges 68 of 105 right answers in a child's own words and takes 1 of 105 wrong
answers as right; `any` misjudges 22 and takes 35 wrong answers as right, and 4 of 17 both-choices answers. Recommended:
**keep `every`**. A misjudged right answer now costs a hint (the reply no longer says "Not yet"); a misjudged wrong answer
is told "That's it." and opens the next layer, so the screen confirms a mistake.

**Found since the pause, decided here:**

- The board is run as GTD now (21 October): this row is *building*, in hand, waiting on this stop; no other row is in
  hand. The brief's step 4 asks the close to move a direct-write row and a content:fetch-on-test row (neither is on the
  board any more) and to split the Wonder Wall heading row into five rows (it is a project now, and a job never adds a
  row). So at the close only this row moves, to *on test*, waiting on the release and the week for Monday; the five
  pieces (hints as a conversation, spoken answers, stamps, the calm end, the Ask box) go in the full report for Brandon
  to add if he wants them.
- CLAUDE.md's *Where we are* still says slice 1 "is briefed, not built" (the board job's close left it); the close
  rewrites it, and the README status line with it.
- The brief's `/close` is `/wwc:close` now, Brandon's word; it does step 4's records.

**On go:** `git pull --rebase origin phase-4-wonder-wall`; the matcher's rule as Brandon picks it (`every` changes
nothing); any check he names as failed is a fix round, shown again here. When every check has passed: the dev server on
the home network stopped (the address closes), the state written here, committed and pushed, and then "run `/wwc:close`
when ready".

## What could not be checked (first, because these matter most)

- **A real iPad.** Speech on iPad Safari, the iPad keyboard and its dictation, the answer box staying above the keyboard,
  the player and Wikimedia's MP3 on iPad Safari, the picture load time of a large stored copy on home Wi-Fi, both
  orientations on the device. This stop.
- **Anything on Vercel or live.** The release, M1 to M4, the boys' iPads.
- **Layouts at iPad size were checked in an 820 × 1180 and a 1180 × 820 frame inside Chrome**, because the Chrome window
  would not shrink below the screen's width. The frame is the same origin, so cookies, the media queries and the
  orientation rules apply as on the iPad; Safari's own rendering is the iPad step.

## What was done

**The commits** (all on `phase-4-wonder-wall`, pushed):

- `0e54574` board: slice 1 to *building*.
- `30f0bd9` (a) the direct-write migration `20261021000000_server_writes_weeks.sql`; the five `/parent` audit writes through
  `lib/audit.ts` on the service role (forgetting an iPad now checks its error); tests that audit rows are written only
  through the service role.
- `e7bcbc5` (b) `judgeGuess()` in `core/wall/answer.ts` with the rule `every` or `any` (Brandon, 21 Oct); the word rule
  exported from `core/curation/cards.ts` unchanged; `chainState()` and the three replies in `core/wall/card.ts`.
- `0a47146` (c) the read path: `lib/wall.ts` (every read and write, service role scoped to the iPad's child and family),
  the steps and the rule in `core/wall/flow.ts`, decision 4's checks on a fake store that returns every card it holds;
  `commonsMp3()` moved to `core/content/commons.ts` (the week page shows the same).
- `9d73457` (d) `/kid`, `/kid/card/[id]`, `POST /api/kid/answer`, "Read it to me", the one-button player, the credit line;
  the wall's sentences in `core/wall/words.ts`, with "Here's something to think about:" and no "Not yet" (Brandon, 21 Oct);
  tests that the kid path reads only through `lib/wall.ts`, logs nothing, links nowhere, and uses effort words.
- `f79c8c5` (e) the week page's two sentences.
- `d60618d` (f) `npm run fixture -- answers [n]`; `next.config.ts` takes the dev server's iPad address from `DEV_ORIGIN`.
- `6715bc2` a fix found on test (below): a word the question uses is never read as a slip.

**The migrations workflow:** run `39584301538` on the push of `d60618d`, green; the test job ran the tests and typecheck and
applied `20261021000000_server_writes_weeks.sql` to `quark-test` ("Applying migration … Finished supabase db push"); the
live job did nothing (a phase branch). The fix push (`6715bc2`) changed no migration, so no run.

**Proved on test** (nothing live):

- **3.1** `npm test`: 368 tests pass; `npm run typecheck` clean.
- **3.2** The workflow run above, green, the migration applied.
- **3.3** With the test guardian's own session (made by the service role's `generateLink`, which sends no email, and signed
  out after): a card's `policy`, a theme's `status`, an insert into `sessions` and an insert into `audit_log` through the
  Data API were each refused, `42501 permission denied`; reading cards, themes and the audit log still worked. In Chrome as
  the test guardian, each moved write left its audit row: `device.forget`, `content.approve` (the CC BY-SA Rosetta photo),
  `blackball.place` and `blackball.lift` on subject 1 (with their `values.save` rows), and `beliefs.answer` twice (subject 1
  changed and changed back). The rulebook came back to the hash the week was checked against: the tap was not refused.
- **3.4** `content:fetch` on test: 102 items, 100 approved automatically, 1 pending (the Rosetta photo, then approved by the
  test guardian), 1 to check by hand (Musopen's Handel); $0.98. `fixture -- delete-week 1`, then
  `week:build -- --week 1 --start 2026-10-21`: 7 days, 280 cards, 266 passed and 14 held back, 712 seconds, $13.62. 174 cards
  carry a picture or recording (154 stored pictures, 20 recordings from Wikimedia); all ten of day 1's first cards passed,
  each with one. The test guardian's Looks good: "Live from Wednesday 21 October. Made live by [the test guardian] on
  Wednesday at 7:39 am." Both new week-page sentences show.
- **3.5** In Chrome, paired to the older invented child:
  - the wall at 820 × 1180: five tiles stacked, no scroll; at 1180 × 820: three and two, the second row centred, no scroll;
    before the tap, "Nothing on the wall today.";
  - a card with a picture (signed URL to test's private copy) and its credit; at 1180 × 820 the picture holds the left and
    the words scroll on the right;
  - a recording: `preload="none"`, nothing loaded until tapped (`readyState` 0); a real tap on Play played Wikimedia's MP3
    (4.5 s), Pause paused it;
  - "Read it to me" started the speech, "Stop" on the second tap stopped it;
  - a blank box can't be sent; "I don’t know" (curly apostrophe): "Have a guess first. Any guess is fine.", no hint, no row;
  - both choices typed back ("brush or pressed"): not right, hint 1;
  - the Then card: three wrong guesses, hints 1 to 3 one at a time under "Here's something to think about:", each with its
    own "Read it to me"; the fourth: "This one is for a person:" and the handoff; no box, no way deeper;
  - the Wonder card: right at layers 1, 2 and 3 ("That's it.", "Go deeper"), layer 4 open: "That's one to talk about." and
    its handoff;
  - the Puzzle card, whose layer 2 is held back for this child: right at layer 1, "That's it.", "This one is for a person:",
    the handoff, no "Go deeper";
  - reopening a tile goes to the layer the child is at; the wall shows "Done for today" on the three finished cards;
  - paired to the younger invented child: the wall is that child's own ("Hi, Bug."); the older child's card URL sends none
    of its words and lands on the younger child's wall; an answer to the older child's card is refused (404) and writes nothing;
  - `npm run fixture -- answers`: 12 rows, one per real guess, `hints_used` counting the hints seen before each, `correct`
    empty for the open question, nothing for "I don't know"; two sessions, one per child, each with its device.
- **The dev server for the iPad:** the old dev server (PID 20868, started 12:23 am, not this session's) was stopped and a new
  one started with `--hostname 0.0.0.0` and `DEV_ORIGIN=192.168.50.67`; `/kid/pair` at the network address loads and its
  keypad works in Chrome.

**Money, test only:** `content:fetch` $0.98, `week:build` $13.62: $14.60, against the brief's about $15. Each run under the
$25 line.

## Found along the way

- **"painted" was judged right on "painted with a brush, or pressed?"** "painted" is one letter from the accepted "printed",
  so the one-letter slip forgave it. Fixed in `6715bc2`: a word the question itself uses is never read as a slip. The step 1
  table doesn't change with it. The attempt row from before the fix stays on test as `right`.
- **A redirect inside a streamed page answers 200**, with the redirect in the stream (Next's way with Suspense); the page
  sends none of the refused card's words. Recorded, not changed.
- **The card text often gives its answer before the question** (day 1's Look: "Nobody brushed it … pressed onto paper"
  above "painted with a brush, or pressed?"). The gate's reader notes say the same about half the cards; it is the card
  prompt's (step 4d), not this slice's.
- **The four-notes card** says "Listen closely" with no recording; only its handoff asks a parent to play the music
  (Brandon, 21 Oct: a bugs line at the close, phase 3).

## The matcher table (step 1, both rules)

Over test's week 1 as built on 20 October (deleted at step 3.4; its 105 questions with accepted answers are in the table;
the 35 layer 4s are open). The invented answers were written by a separate agent that never saw the matcher. "ok" means
judged as intended.

| Invented answer, over 105 questions | `every`, misjudged | `any`, misjudged |
|---|---|---|
| Right, in a child's own words | 68 (65%) | 22 (21%) |
| Right, misspelled as a 7-year-old types | 58 (55%) | 21 (20%) |
| Wrong | 1 (1%) | 35 (33%) |
| Both choices typed back (17 questions offering two) | 2 | 4 |
| An accepted answer, word for word | 0 | 0 |

The briefed rule without the three additions (curly apostrophes, yeah and nope, digits as number words) misjudged 75 own-words
answers; the additions fixed 7 and broke none. The choice of two is found on 15 questions (10 with "or", 5 yes-or-no), all
read right; 2 that name their choices without "or" (#36, #96) are not found.

| # | Day, slot, layer | Question | Accepted | Choices found | Own words | Misspelled | Wrong | Both choices |
|---|---|---|---|---|---|---|---|---|
| 1 | 10-26 look 1 | If you have the carved wooden blocks, can you make the same picture more than once? | yes; yes, many times; you can print it again; lots of copies | yes / no | yeah you can do it over and over → every ok, any ok | yes meny tims → every ok, any ok | no only once → every ok, any ok | yes or no i dont know → every ok, any ok |
| 2 | 10-26 look 2 | If a print has three colors, how many wooden blocks would you need? | three; 3; three blocks; one for each color |  | 3 cuz each color gets its own block → every ok, any ok | thre → every ok, any ok | one → every ok, any **miss** |  |
| 3 | 10-26 look 3 | What would go wrong if the printer put the paper down in a slightly different spot for the blue block? | the blue would be in the wrong place; colors wouldn't line up; blue would miss the lines; it would look smudged or shifted |  | the blue would be crooked and not match the picture → every **miss**, any ok | the colers woudnt line up → every **miss**, any ok | nothing it would still look the same → every ok, any **miss** |  |
| 4 | 10-26 wonder 1 | After 365 whole days, how much longer does the Earth still need to finish its trip around the Sun? | about six hours; six hours; 6 hours; a quarter of a day |  | 6 more hours i think → every ok, any ok | six ours → every **miss**, any ok | one day → every ok, any **miss** |  |
| 5 | 10-26 wonder 2 | How many years of saving up the leftover pieces does it take to make one whole extra day? | four; 4; four years; 4 years |  | every 4 years → every ok, any ok | fore → every **miss**, any **miss** | 6 → every ok, any ok |  |
| 6 | 10-26 wonder 3 | Using the rule that a century year is a leap year only if it divides evenly by 400, will the year 2100 be a leap year? | no; not a leap year; no, 2100 won't be; no, it doesn't divide by 400 | no / yes | nope 400 doesnt go into it evenly → every ok, any ok | not a leep year → every **miss**, any ok | yes cuz 2100 divides by 4 → every ok, any ok | maybe yes maybe no → every ok, any ok |
| 7 | 10-26 listen 1 | Which instrument plays the swan in this music? | the cello; cello; the big violin |  | the cello one → every ok, any ok | the selo → every **miss**, any **miss** | the violin → every ok, any **miss** |  |
| 8 | 10-26 listen 2 | Why does the cello's tune sound like a swan gliding instead of hopping? | the notes are smooth; notes flow together; no gaps between notes; long, smooth notes; the bow moves slowly |  | cuz the notes kind of slide into each other → every **miss**, any ok | the notes are smoth → every ok, any ok | cuz it goes fast → every ok, any ok |  |
| 9 | 10-26 listen 3 | Would a big, heavy elephant suit high, quick notes or low, slow notes? | low, slow notes; low notes; slow low notes; the double bass; deep notes | low slow note / high quick | slow and low cuz hes heavy → every **miss**, any ok | low slo notes → every ok, any ok | high quick notes → every ok, any ok | high and low → every ok, any ok |
| 10 | 10-26 then 1 | Which direction does the Nile flow as it goes through Egypt? | north; northward; to the north; up north; toward the sea |  | it goes north into the sea → every ok, any ok | nort → every ok, any ok | south → every ok, any ok |  |
| 11 | 10-26 then 2 | Why does the Nile's water move from the south to the north? | the land slopes down; it runs downhill; the south is higher; the sea is lower; starts in mountains |  | cuz the land is higher where it starts → every **miss**, any ok | it runs downhil → every ok, any ok | because the wind pushes it → every ok, any ok |  |
| 12 | 10-26 then 3 | Upper Egypt was upriver. Was it in the north or the south? | south; the south; in the south; southern part | south / north | its south cuz thats upriver → every ok, any ok | sowth → every ok, any ok | north → every ok, any ok | north or south → every ok, any ok |
| 13 | 10-26 puzzle 1 | How many ways can you roll a total of 12 with two dice? | one; 1; one way; only 6 and 6; 6 and 6 |  | just double 6 → every **miss**, any ok | wun → every **miss**, any **miss** | 2 → every ok, any ok |  |
| 14 | 10-26 puzzle 2 | Counting both orders, how many ways can you roll a total of 3? | two; 2; two ways; 1 and 2, 2 and 1 |  | 1 then 2 and 2 then 1 so 2 → every ok, any ok | tow → every **miss**, any **miss** | 1 → every ok, any **miss** |  |
| 15 | 10-26 puzzle 3 | If you rolled two dice 36 times, about how many times would you expect a total of 7? | six; 6; about 6; about six times |  | like 6 times maybe → every ok, any ok | siks → every **miss**, any **miss** | 7 → every ok, any ok |  |
| 16 | 10-27 look 1 | In The Harvesters, are the people far away painted bigger or smaller than the people up close? | smaller; tiny; small; little | smaller / bigger | littler cuz there far away → every ok, any ok | smaler → every ok, any ok | bigger → every ok, any ok | bigger or smaller → every ok, any ok |
| 17 | 10-27 look 2 | Why does the sea at the back of the painting look pale and blue instead of sharp and bright? | it is far away; lots of air in between; the air makes it pale; air makes it blue; because of the haze |  | cuz its really far back → every **miss**, any ok | its far awey → every **miss**, any ok | because the water is just blue → every ok, any **miss** |  |
| 18 | 10-27 look 3 | After the men cut the wheat with scythes, what do the women in the painting do with it? | tie it into bundles; tie it up; make sheaves; bundle it; tie sheaves |  | they put it in bunches and tie it → every **miss**, any ok | tie it into bundels → every ok, any ok | they carry it to the house → every ok, any ok |  |
| 19 | 10-27 wonder 1 | Why did the Nile rise in Egypt in summer, even though it hardly ever rained in Egypt? | rain fell far south; rain in the mountains; rain in Ethiopia; water came from far away; monsoon rains upstream |  | it rained a lot somewhere else and the water came down the river → every **miss**, any ok | rane in the mountins → every **miss**, any ok | because the sea came in → every ok, any **miss** |  |
| 20 | 10-27 wonder 2 | What did the flood leave behind on the fields that helped crops grow? | silt; mud; dark mud; rich soil; black mud |  | good dirt → every **miss**, any **miss** | mudd → every **miss**, any **miss** | water → every ok, any ok |  |
| 21 | 10-27 wonder 3 | Why would officials want to measure how high the flood rose each year? | to predict the harvest; to know how much food; to guess the crops; to plan for hunger; to see if crops would grow |  | so they know if there will be enough food → every **miss**, any ok | to predikt the harvist → every ok, any ok | to see if their houses would flood → every ok, any **miss** |  |
| 22 | 10-27 listen 1 | Why can a band walk and play The Stars and Stripes Forever at the same time? | the beat matches walking; it goes left-right; steady beat like steps; beat matches their feet |  | cuz you step to the beat → every **miss**, any ok | the beet matches walking → every **miss**, any ok | because they practiced a lot → every ok, any ok |  |
| 23 | 10-27 listen 2 | What would happen to a marching band if the beat kept changing speed? | they'd get out of step; they'd bump into each other; they couldn't walk together; feet wouldn't match |  | they would all mess up and walk different → every **miss**, any ok | thed bump into each uther → every ok, any ok | they would just walk faster → every ok, any **miss** |  |
| 24 | 10-27 listen 3 | If a march has about 120 steps a minute, about how many steps is that each second? | two; 2; two steps; 2 steps a second |  | 2 every second i think → every ok, any ok | tow steps → every **miss**, any ok | 12 → every ok, any ok |  |
| 25 | 10-27 then 1 | When the real wolf came, why did nobody come to help the boy? | they didn't believe him; he lied before; they thought it was a trick; he fooled them; he tricked them twice |  | cuz he kept saying wolf when there was no wolf → every **miss**, any **miss** | they didnt beleve him → every **miss**, any ok | they didnt hear him → every ok, any **miss** |  |
| 26 | 10-27 then 2 | If the boy saw a big gray dog in the dark, truly thought it was a wolf, and shouted "Wolf!", was that a lie or a mistake? | a mistake; mistake; not a lie; he believed it | mistake / lie | he just got it wrong he didnt mean to → every **miss**, any ok | a mistak → every ok, any ok | a lie → every ok, any **miss** | a lie or a mistake → every ok, any **miss** |
| 27 | 10-27 then 3 | A girl says "It's raining!" knowing the sky is sunny, just to fool her brother, and then it suddenly starts to rain. Did she lie? | yes; yes, she lied; still a lie; yes, she knew it wasn't | yes / no | yeah cuz she was trying to trick him → every ok, any ok | yse she lyed → every **miss**, any ok | no because it really rained → every ok, any ok | yes and no → every ok, any ok |
| 28 | 10-27 puzzle 1 | If you fold a paper circle into sixths, cut it, and open it, how many matching arms will your paper snowflake have? | six; 6; six arms; 6 arms |  | it will have 6 → every ok, any ok | sixx arms → every **miss**, any ok | 12 → every ok, any ok |  |
| 29 | 10-27 puzzle 2 | What shape do the tiny bits of water fit together in when they make ice? | six-sided rings; six-sided shape; hexagon; hexagons; a six-sided ring |  | a shape with 6 sides → every ok, any ok | hexigon → every ok, any ok | a cube → every ok, any ok |  |
| 30 | 10-27 puzzle 3 | How many sixth-turns does it take to spin a snowflake all the way around back to where it started? | six; 6; six turns; 6 turns |  | 6 little turns → every ok, any ok | sicks turns → every **miss**, any ok | 4 → every ok, any ok |  |
| 31 | 10-28 look 1 | What kind of work are the men doing in the fields in Nakht's tomb paintings? | farming; growing grain; plowing and sowing; cutting grain; harvesting; planting |  | plowing the dirt and putting seeds in → every **miss**, any ok | harvisting → every ok, any ok | building a pyramid → every ok, any ok |  |
| 32 | 10-28 look 2 | Why did farmers plow and sow right after the Nile's flood went down? | the mud was wet; the soil was rich; flood left good mud; the ground was soft; fresh mud for seeds |  | cuz the dirt was still wet and soft → every **miss**, any ok | the grownd was soft → every ok, any ok | because it was spring → every ok, any ok |  |
| 33 | 10-28 look 3 | Why would Nakht's painters show the river full of food but not its dangers? | for a good afterlife; to give him a good life forever; they wanted the best life; so he would be happy forever; for his life after death |  | so he could have nice things after he died → every **miss**, any ok | so he wud be happy forevr → every **miss**, any ok | they didnt want to scare people → every ok, any ok |  |
| 34 | 10-28 wonder 1 | When lava flows into the ocean and turns into rock, what happens to the island? | it gets bigger; it grows; more land; the island grows bigger; new land |  | the island gets wider → every **miss**, any ok | it gets biger → every ok, any ok | it sinks → every ok, any ok |  |
| 35 | 10-28 wonder 2 | What does the cold ocean water take away from the lava that makes it go hard? | heat; its heat; the hotness; warmth |  | how hot it is → every **miss**, any **miss** | the heet → every **miss**, any **miss** | the red color → every ok, any ok |  |
| 36 | 10-28 wonder 3 | The Big Island still has very active volcanoes and Kauaʻi does not. Which of the two islands is younger? | the Big Island; Big Island; Hawaii; the one with active volcanoes |  | the big one cuz its volcanos still work → every **miss**, any ok | big iland → every ok, any ok | kauai → every ok, any ok | kauai or big island idk → every **miss**, any **miss** |
| 37 | 10-28 listen 1 | Name one kind of sound a humpback whale makes. | moan; moans; whoop; whoops; grunt; grunts; a low moan; a whoop |  | a low groaning sound → every **miss**, any ok | mone → every **miss**, any **miss** | clicks → every ok, any ok |  |
| 38 | 10-28 listen 2 | Why did people put the microphone into the sea instead of holding it in the air? | the sounds are underwater; whale sounds travel in water; to hear the whales underwater; the whales are underwater |  | cuz you cant hear them from up in the air → every **miss**, any ok | the whales are under woter → every **miss**, any ok | so the whales could hear the people → every ok, any **miss** |  |
| 39 | 10-28 listen 3 | Why can whales hear each other from miles away? | sound travels far in water; water carries sound; sound goes farther underwater; sound travels well in water |  | the water makes the sound go really far → every **miss**, any ok | sound travls far in water → every ok, any ok | because they have big ears → every ok, any ok |  |
| 40 | 10-28 then 1 | How many times did the Wright brothers fly on that first day? | four; 4; four times; 4 times |  | 4 flights → every ok, any ok | for times → every **miss**, any ok | once → every ok, any ok |  |
| 41 | 10-28 then 2 | Why did the brothers want to take off facing into the wind? | more air over the wings; more lift; helps it lift off; easier to take off; wind helps it go up |  | so the wind pushes it up into the sky → every **miss**, any ok | eazier to take off → every ok, any ok | so the wind pushes them along → every ok, any **miss** |  |
| 42 | 10-28 then 3 | What happened to the plane when the brothers twisted the tips of its wings? | it turned; it tilted; it steered; one wing went up; it leaned to turn |  | it could go left or right → every **miss**, any **miss** | it steerd → every ok, any ok | it went up higher → every ok, any **miss** |  |
| 43 | 10-28 puzzle 1 | An islander says, "Two plus two makes four." Is that islander a knight or a knave? | a knight; knight; the knight; they tell the truth | knight / knave | hes a truth teller → every **miss**, any ok | a nite → every **miss**, any **miss** | a knave → every ok, any ok | knight or knave → every ok, any ok |
| 44 | 10-28 puzzle 2 | Could a knave say, "I am a knave"? | no; no, it would be true; it would be the truth; knaves can't tell the truth | no / yes | nope cuz then hed be telling the truth → every ok, any ok | no it wud be tru → every ok, any ok | yes → every ok, any ok | maybe yes maybe no → every ok, any ok |
| 45 | 10-28 puzzle 3 | A says "B is a knave" and B says "We are both knights." B turns out to be a knave. So is A a knight or a knave? | a knight; knight; A is a knight; A tells the truth | knight / knave | he told the truth about B so hes a knight → every ok, any ok | kniht → every ok, any ok | a knave → every ok, any ok | knight or knave idk → every ok, any ok |
| 46 | 10-29 look 1 | Why did Audubon need such enormous paper for his bird paintings? | to paint birds life-size; so big birds fit; to show real size; birds at true size; so they're not shrunk |  | cuz he wanted the birds as big as real ones → every **miss**, any ok | so big brids fit → every **miss**, any ok | so people could see them from far away → every ok, any **miss** |  |
| 47 | 10-29 look 2 | Why is the flamingo's neck curved down to the ground in Audubon's picture? | so it fits on the page; to fit at real size; too tall otherwise; so it stays life-size; so he didn't shrink it |  | cuz the flamingo was too tall for the paper → every **miss**, any ok | so it fits on the paje → every **miss**, any ok | cuz its eating food → every ok, any ok |  |
| 48 | 10-29 look 3 | Why do you think making The Birds of America took about eleven years? | so many pictures; 435 pictures; colored by hand; huge pages; each engraved on copper; lots of handwork |  | he had to paint a ton of birds → every **miss**, any **miss** | so meny pictures → every **miss**, any ok | because the birds kept flying away → every ok, any ok |  |
| 49 | 10-29 wonder 1 | Where does the light we see on the Moon really come from? | the Sun; sunlight; the Sun shining on it; from the Sun |  | its the sun bouncing off it → every ok, any ok | the son → every **miss**, any **miss** | the moon glows by itself → every ok, any ok |  |
| 50 | 10-29 wonder 2 | When we see a full, round Moon, which way is the Moon's lit half facing? | toward us; toward the Earth; facing us; at Earth |  | it faces our way → every **miss**, any **miss** | tords us → every **miss**, any ok | away from us → every ok, any **miss** |  |
| 51 | 10-29 wonder 3 | At a quarter moon, why do we see exactly half of the Moon's face lit up? | we see it from the side; looking from the side; side view of the lit half; we see the lit half sideways |  | cuz were off to the side of it → every **miss**, any ok | we see it from the sid → every **miss**, any ok | because the earths shadow covers half → every ok, any **miss** |  |
| 52 | 10-29 listen 1 | Which Egyptian instrument was a metal rattle shaken in temples? | the sistrum; sistrum; a metal rattle; the rattle |  | the shaker thing → every **miss**, any **miss** | sistrom → every ok, any ok | the harp → every ok, any ok |  |
| 53 | 10-29 listen 2 | Why can't we know exactly how ancient Egyptian music sounded? | tunes weren't written down; no one wrote the music down; we can't read their music; the songs weren't recorded |  | nobody could record it back then → every **miss**, any **miss** | no one rote the music down → every ok, any ok | because all the instruments broke → every ok, any ok |  |
| 54 | 10-29 listen 3 | Is the Triumphal March from Aida real ancient Egyptian music? | no; no, Verdi wrote it; no, it's from the 1800s; no, it was made up later | no / yes | nah a guy wrote it way later → every ok, any ok | no verdy wrote it → every ok, any ok | yes → every ok, any ok | yes or no → every ok, any ok |
| 55 | 10-29 then 1 | Which is really bigger, Greenland or Africa? | Africa; Africa is bigger; Africa, by a lot; Africa is 14 times bigger | africa / greenland | africa is way more big → every ok, any ok | afrika → every ok, any ok | greenland → every ok, any ok | greenland or africa → every ok, any ok |
| 56 | 10-29 then 2 | If you press an orange peel flat on a table, what happens to it? | it tears; it rips; it splits; it stretches; it breaks into pieces; it cracks |  | it falls apart in bits → every **miss**, any **miss** | it ripps → every **miss**, any **miss** | it goes flat → every ok, any ok |  |
| 57 | 10-29 then 3 | On Mercator's map, which gets stretched more: a place near the equator or a place near the North Pole? | near the North Pole; the pole; the one near the pole; near the top; far from the equator | near north pole / equator | the one way up at the top where its cold → every **miss**, any ok | the north pol → every **miss**, any ok | the equator → every ok, any **miss** | the equator or the north pole → every ok, any **miss** |
| 58 | 10-29 puzzle 1 | The squares go 1, 2, 4, 8 grains. How many grains go on the 5th square? | 16; sixteen; 16 grains |  | 8 plus 8 so 16 → every ok, any ok | sixten → every ok, any ok | 12 → every ok, any ok |  |
| 59 | 10-29 puzzle 2 | Squares 1 to 4 together hold 15 grains. How many grains go on square 5 by itself? | 16; sixteen; one more than 15 |  | 16 cuz its double the 4th one → every ok, any ok | sixtean → every ok, any ok | 30 → every ok, any ok |  |
| 60 | 10-29 puzzle 3 | If 100 dollars grows at 7 percent a year, about how much is it after 20 years? | about 400 dollars; 400; four hundred; about 400 |  | like 4 hundred bucks → every ok, any ok | fore hundrid → every **miss**, any ok | 240 → every ok, any ok |  |
| 61 | 10-30 look 1 | If you walked right up close to Seurat's park painting, what would you see it is made of? | tiny dots; dots of color; little dots; spots of paint; lots of dots |  | a bunch of teeny dots → every **miss**, any ok | tiny dotts → every **miss**, any ok | little lines → every ok, any **miss** |  |
| 62 | 10-30 look 2 | Seurat puts tiny blue dots and tiny yellow dots side by side. When you step back, what color might that patch look? | green; greenish; a green color |  | the color of grass → every **miss**, any ok | gren → every ok, any ok | purple → every ok, any ok |  |
| 63 | 10-30 look 3 | Why did Seurat put pure dots side by side instead of mixing his paints first? | to keep colors bright; brighter colors; mixed paint gets dull; so the eye mixes them; so colors stay bright |  | so the colors look shiny and not muddy → every **miss**, any **miss** | to keep colors brite → every **miss**, any ok | because it was faster → every ok, any ok |  |
| 64 | 10-30 wonder 1 | If sunlight looks white, what is it really made of? | all the colors; rainbow colors; all the rainbow colors; lots of colors mixed; every color |  | its a rainbow inside → every **miss**, any ok | all the colers → every ok, any ok | fire → every ok, any ok |  |
| 65 | 10-30 wonder 2 | Which color of sunlight does the air bounce around the most? | blue; blue light; the blue |  | the sky color → every **miss**, any **miss** | blu → every **miss**, any **miss** | red → every ok, any ok |  |
| 66 | 10-30 wonder 3 | Why is the sunset red instead of blue? | blue gets bounced away; light goes through more air; more air scatters blue; the blue is scattered out; longer path through air |  | the light has to go through way more air and the blue gets lost → every **miss**, any ok | the blue gets bounsed away → every ok, any ok | cuz the sun gets closer to us → every ok, any **miss** |  |
| 67 | 10-30 listen 1 | In the opening pattern, how many short notes come before the long one? | three; 3; three short notes; three short ones |  | 3 short then a long → every ok, any ok | three shrt ones → every ok, any ok | four → every ok, any ok |  |
| 68 | 10-30 listen 2 | When the pattern is played higher, lower or by a different instrument, what stays the same so you still know it? | the rhythm; short-short-short-long; the pattern of short and long; the timing; the beat pattern |  | the da da da dum → every **miss**, any **miss** | the rythm → every ok, any ok | the notes → every ok, any ok |  |
| 69 | 10-30 listen 3 | Why would the four-note pattern be written on several lines of the page at the same time? | several instruments play it; many instruments together; each line is an instrument; the orchestra plays it together |  | cuz lots of different instruments play it at once → every **miss**, any ok | the orkestra plays it together → every **miss**, any ok | so you play it again and again → every ok, any **miss** |  |
| 70 | 10-30 then 1 | In the Egyptian story, which way does Ra's boat sail across the sky? | east to west; from east to west; starts east, ends west; from sunrise to sunset |  | where the sun comes up to where it goes down → every **miss**, any **miss** | est to west → every **miss**, any ok | west to east → every **miss**, any **miss** |  |
| 71 | 10-30 then 2 | According to the story, how does the sun get back to the east to rise each morning? | travels through the underworld; goes under the world at night; sails through the dark underworld; boat goes underneath at night |  | it sails under the ground in the dark at night → every **miss**, any ok | it goes thru the underwurld → every **miss**, any ok | it turns around and sails back across the sky → every ok, any **miss** |  |
| 72 | 10-30 then 3 | In the story, what would happen if Apophis beat Ra one night? | the sun would not rise; no sunrise; it would stay dark; chaos would win |  | there wouldnt be a morning → every **miss**, any **miss** | it wud stay dark → every **miss**, any ok | the sun would come up in the west → every ok, any **miss** |  |
| 73 | 10-30 puzzle 1 | Of the seven tangram pieces, how many are triangles? | five; 5; five triangles; 5 triangles |  | 5 of the 7 → every ok, any ok | fiv → every **miss**, any **miss** | 4 → every ok, any ok |  |
| 74 | 10-30 puzzle 2 | You build a cat with a tangram and then take it apart to build a boat. How many pieces will the boat use? | seven; 7; all seven; all of them; the same seven |  | you use every single one → every **miss**, any **miss** | sevin → every ok, any ok | 14 → every ok, any ok |  |
| 75 | 10-30 puzzle 3 | A big tangram triangle is a quarter of the square and a small one is a sixteenth. How many small triangles would cover the same space as one big triangle? | four; 4; four small triangles; 4 small ones |  | 4 little ones → every ok, any ok | fowr → every **miss**, any **miss** | 16 → every ok, any ok |  |
| 76 | 10-31 look 1 | Arcimboldo painted a nose, but it wasn't a real nose. What did he paint instead? | a pear; pear; a fruit; fruit |  | he made it out of a pear → every ok, any ok | a pare → every **miss**, any **miss** | a carrot → every ok, any ok |  |
| 77 | 10-31 look 2 | What is the smallest set of shapes you need to make something look like a face? | two eyes and a mouth; eyes and a mouth; two dots and a line; two circles and a line |  | 2 dots for eyes and a smile → every **miss**, any ok | two eys and a mowth → every **miss**, any ok | a circle → every ok, any **miss** |  |
| 78 | 10-31 look 3 | Why did Arcimboldo use fruit and flowers from every season, not just one, to paint Rudolf II as Vertumnus? | god of all seasons; he was god of the seasons; Vertumnus ruled every season; to show the whole year |  | cuz vertumnus was in charge of all the seasons → every **miss**, any ok | god of all the seesons → every ok, any ok | because rudolf liked lots of fruit → every ok, any ok |  |
| 79 | 10-31 wonder 1 | Why had nobody seen these little animals in water before Leeuwenhoek? | they were too small; too tiny to see; eyes can't see them; nobody had a strong magnifier |  | they were so little you needed a microscope → every **miss**, any **miss** | they were to smal → every **miss**, any ok | cuz they hid in the mud → every ok, any ok |  |
| 80 | 10-31 wonder 2 | What does the curved glass do to the light so a tiny thing looks bigger? | bends it; bends the light; makes the light bend; curves the light |  | it turns the light a different way → every **miss**, any ok | bens the lite → every **miss**, any **miss** | makes it brighter → every ok, any **miss** |  |
| 81 | 10-31 wonder 3 | Why was it useful for Leeuwenhoek to send drawings along with his letters? | to show what he saw; so others could see it; so people would believe him; to help them check |  | so the people could see the tiny animals too → every **miss**, any ok | so peple would beleeve him → every ok, any ok | to make the letters look nice → every ok, any ok |  |
| 82 | 10-31 listen 1 | In a round, does each group sing a different tune or the same tune? | the same tune; same; the same one; same song | same tune / different | everybody sings one song but starts at different times → every **miss**, any **miss** | the saim tune → every **miss**, any ok | a different tune → every ok, any ok | different or same → every ok, any ok |
| 83 | 10-31 listen 2 | When the second group starts singing 'Row, row, row your boat', what is the first group singing? | gently down the stream; the second line; gently down the stream line; the next line |  | the part after row row row your boat → every **miss**, any **miss** | jently down the streem → every ok, any ok | merrily merrily merrily → every ok, any ok |  |
| 84 | 10-31 listen 3 | Why does each violin's tune fit, no matter when it comes in? | the bass repeats; same chords keep coming; the bass plays the same notes; it repeats over and over |  | the low part keeps playing the same thing → every **miss**, any ok | the base repeets → every **miss**, any ok | because the violins are all the same kind → every ok, any **miss** |  |
| 85 | 10-31 then 1 | The first sailors to reach Hawaii had no map or compass. What in the sky could they use to find their way? | the stars; stars; stars at night; the night sky |  | they looked up at the stars → every ok, any ok | the starrs → every **miss**, any **miss** | the moon → every ok, any ok |  |
| 86 | 10-31 then 2 | If a star always comes up at the same spot on the edge of the sea, how can a sailor use it to go straight? | steer toward it; point the canoe at it; sail toward where it rises; follow it |  | keep going to where the star comes up → every **miss**, any ok | foller it → every **miss**, any **miss** | look at it to know what time it is → every ok, any ok |  |
| 87 | 10-31 then 3 | Some birds fly out to sea to fish in the morning and go home to land in the evening. Which way should a sailor follow them at dusk to find an island? | the way they fly; follow them home; where they fly at evening; same direction as birds |  | go where the birds go → every **miss**, any ok | folow them home → every ok, any ok | the opposite way → every ok, any **miss** |  |
| 88 | 10-31 puzzle 1 | If you drew two heel bones and four strokes, what number did you write? | 24; twenty-four; twenty four |  | 2 tens and 4 ones so 24 → every ok, any ok | twenty for → every **miss**, any ok | 6 → every ok, any ok |  |
| 89 | 10-31 puzzle 2 | How many signs in all does it take to write 2026 the Egyptian way? | 10; ten; ten signs |  | 2 plus 2 plus 6 so 10 → every ok, any ok | tenn → every **miss**, any **miss** | 4 → every ok, any ok |  |
| 90 | 10-31 puzzle 3 | Our 2026 uses a 0 to show there are no hundreds. How did an Egyptian show no hundreds when writing 2026? | left out the rope; no coils of rope; drew no hundreds signs; just left it out; didn't draw anything |  | they just skipped it → every **miss**, any ok | they didnt drow anything → every **miss**, any ok | they drew a zero → every ok, any **miss** |  |
| 91 | 11-01 look 1 | How many chairs are in Van Gogh's bedroom painting? | two; 2; two chairs; a pair |  | i count 2 → every ok, any ok | two chares → every ok, any ok | one → every ok, any ok |  |
| 92 | 11-01 look 2 | What feeling did Van Gogh want his bedroom painting to give? | restful; calm; peaceful; relaxed; sleepy; quiet |  | like you want to take a nap → every **miss**, any **miss** | peacefull → every ok, any ok | happy → every ok, any ok |  |
| 93 | 11-01 look 3 | Blue walls sit next to furniture of which opposite color? | orange; orange-brown; brown; orangey |  | like a pumpkin color → every **miss**, any **miss** | ornge → every ok, any ok | yellow → every ok, any ok |  |
| 94 | 11-01 wonder 1 | An ammonite fossil looks like a shell, but what is it actually made of now? | stone; rock; it is stone; rock in a shell shape; minerals |  | it turned into a rock → every ok, any ok | stoan → every **miss**, any **miss** | its still shell → every ok, any **miss** |  |
| 95 | 11-01 wonder 2 | What carried the minerals into the shell's shape? | water; the water; seeping water; water in the mud |  | water dripping in → every ok, any ok | watter → every ok, any ok | the mud → every ok, any **miss** |  |
| 96 | 11-01 wonder 3 | If you find one fossil deep down in the cliff and another near the top, which was buried first? | the deep one; the lower one; the one at the bottom; the deeper fossil |  | the one farther down → every **miss**, any ok | the deep won → every **miss**, any ok | the one at the top → every ok, any **miss** | the deep one or the top one → every **miss**, any **miss** |
| 97 | 11-01 listen 1 | Aloha ʻOe means 'farewell to you.' What kind of song is it? | a goodbye song; farewell song; a song for goodbyes; saying goodbye |  | a song you sing when someone leaves → every **miss**, any ok | a goodby song → every ok, any ok | a hello song → every ok, any **miss** |  |
| 98 | 11-01 listen 2 | Why does a slow chorus that repeats make it easy for a group to sing along? | you can learn it; you hear it again; easy to remember; easy to follow; everyone can keep up |  | cuz you know the words after a while → every **miss**, any **miss** | eazy to remember → every **miss**, any ok | cuz its a happy song → every ok, any ok |  |
| 99 | 11-01 listen 3 | What did Liliʻuokalani see that gave her the idea for this song? | two people saying goodbye; people saying goodbye; a goodbye; a farewell |  | two people hugging before one left → every **miss**, any ok | peple saying goodby → every ok, any ok | the ocean → every ok, any ok |  |
| 100 | 11-01 then 1 | What was the Great Pyramid built to be for the pharaoh Khufu? | a tomb; his tomb; a burial place; where he was buried; a grave |  | where they put him when he died → every **miss**, any ok | a toom → every **miss**, any **miss** | his palace → every ok, any **miss** |  |
| 101 | 11-01 then 2 | If thousands of workers were given bread every day, what kind of building would archaeologists expect to find in their town? | bakeries; a bakery; ovens; a place to make bread; bread ovens |  | a big kitchen for baking bread → every **miss**, any ok | a bakry → every ok, any ok | a grocery store → every ok, any ok |  |
| 102 | 11-01 then 3 | Why would a crew rather move a huge stone block by boat than drag it over land? | water holds it up; floating is easier; less pulling; boats carry heavy things; it is easier |  | cuz the boat floats so you dont have to drag it → every **miss**, any ok | floting is eazier → every ok, any ok | boats go faster → every ok, any **miss** |  |
| 103 | 11-01 puzzle 1 | A sunflower's seeds make spirals that curve in how many different directions? | two; both ways; clockwise and counterclockwise; two directions; left and right |  | one way and the other way → every **miss**, any **miss** | bothe ways → every **miss**, any ok | lots → every ok, any ok |  |
| 104 | 11-01 puzzle 2 | In the pattern 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, what number comes next? | 89; eighty-nine; 34 plus 55; 89 seeds |  | 34 and 55 added up is 89 → every ok, any ok | eity nine → every **miss**, any ok | 79 → every ok, any ok |  |
| 105 | 11-01 puzzle 3 | If every new seed turned exactly half a circle from the last one, would the seeds spread out to fill the flower, or line up in rows? | line up; line up in rows; in two straight lines; they'd make rows; leave gaps; not fill it | line up rows / out fill flower | they would make straight lines and not fill it up → every ok, any ok | line up in rowes → every ok, any ok | spread out to fill the flower → every ok, any ok | spread out or line up → every ok, any ok |

## Still to do, and whose

- **Brandon:** the iPad (this stop), and the rule.
- **Then, at go:** step 4, the close: docs/04, docs/12, docs/03, docs/13, CLAUDE.md's stack line and *Where we are*, the
  README status, docs/08 (the *Decided:* lines, the bugs line for four-notes), the board rows, the full report, the
  read-back, `/cost`.
- **After:** the release (`/wwc:release`, Brandon's go), then the week for Monday, M1 to M4, each by Brandon's hand.
