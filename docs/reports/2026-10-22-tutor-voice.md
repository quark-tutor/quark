# Report: the tutor's voice, both ways, from Google (`docs/tutor-voice-slice.md`), 22 October 2026

Opus 5.5. Branch `phase-4-wonder-wall`, as the brief names. Nothing on live, nothing a child sees, nothing pushed.

## Stop 1: after reading, and the voice to pick (22 Oct 2026, 23:32 HST)

**Where it stands.** Read: the brief, CLAUDE.md, docs/03, 04, 08, 12, 13, the slice 1 report, the kid view's code and
`core/model.ts`, and Google's Chirp 3 pages. Step 1 is done. Your Google key works for both sides:

- **The four samples** are in `docs/reports/samples/`: the Harvesters card from test ("In 1565, Pieter Bruegel painted
  The Harvesters…", 281 characters) read by `en-US-Chirp3-HD-Sulafat` and `Aoede` (women's voices), and `Iapetus`
  and `Charon` (men's), all at normal speed. 1,124 characters were sent, inside the free million a month ($0.03 at
  list price). Speed can be set from 0.25 to 2.0 if the voice you pick reads too fast for a 7-year-old.
- **The ears are switched on too:** `npm run speech:check` had Google say "The people far away are painted smaller."
  and Chirp 3 heard it back word for word: 2.1 seconds of audio, heard in 1.4 seconds. No one's voice was used.
- **The adapter's first piece:** `core/speech.ts` (`say()`, `hear()`, the tutor's voice in one line),
  `core/speech/google.ts` (plain REST calls with `google-auth-library` 11.1.0, newly installed), and the two scripts,
  `speech:samples` and `speech:check`. Typecheck clean. Not committed yet.

### What I decided (strike any you don't want)

1. **Talk sends one clip when the child lets go, and the words land in the box about a second later; no words
   appear while the child is still talking.** The brief asked for words streaming in. iPad Safari can't stream an
   upload, Vercel's WebSocket for Next.js is a workaround API the laptop's dev server doesn't run, and Google streams
   only over gRPC; three new moving parts for a word-by-word effect. The child holds, talks, lets go, and the words
   appear. So `hear()` takes a clip, not a stream. The clip is 16 kHz audio made in the page (the format proven
   above), at most 30 seconds.
2. **The tutor can speak only a line the child can see right now:** a hint once earned, the handoff once reached.
   Otherwise the speech route could read a hint or the handoff early (rule 3). For the same reason the card's
   answers are never given to Google as words to listen for: that would pull what is heard toward the right answer.
3. **"Read it to me" plays from a link opened inside the tap** (the route makes the MP3 the first time, stores it in
   the private bucket at `speech/<voice>/<hash>.mp3`, and sends the player to a signed link). iPad Safari plays sound
   only when it starts inside the tap, so the tap never waits for Google before it starts.
4. **The voice is one line of code** (`TUTOR_VOICE` in `core/speech.ts`), not a Vercel setting, so the release needs
   no new step for it.
5. **The key on Vercel:** the code reads `GOOGLE_CREDENTIALS_JSON` (the key's JSON) or `GOOGLE_APPLICATION_CREDENTIALS`
   (a path, or the JSON). If you named it otherwise in Vercel, rename it before the release.
6. **A card's words can carry the child's nickname** (the card prompt allows it once in four cards); they go to
   Google as they already go to Anthropic. Google's Text-to-Speech keeps no text; Speech-to-Text keeps no audio or
   transcript unless a project joins its data-logging program, which Quark does not. *Touches rule 7.*
7. **The spend goes in a new table, `speech_runs`**: one row each time Google is called (a line said for the first
   time, or a clip heard); a stored line played again writes nothing. No child, no device, no words. The migration,
   for your yes:

   ```sql
   create table speech_runs (
     id          uuid primary key default gen_random_uuid(),
     family_id   uuid not null references families(id) on delete cascade,
     kind        text not null check (kind in ('say', 'hear')),
     model       text not null,                                       -- the voice, or the recognizer's model
     characters  int not null default 0 check (characters >= 0),     -- say: what was sent
     seconds     numeric(8, 2) not null default 0 check (seconds >= 0),  -- hear: the clip's length
     cost        numeric(10, 6) not null default 0,                   -- dollars at list price, before the free tier
     created_at  timestamptz not null default now()
   );
   create index on speech_runs (family_id, created_at desc);
   alter table speech_runs enable row level security;
   create policy family_read on speech_runs for select using (family_id = current_family_id());
   grant select on speech_runs to authenticated;
   grant all on speech_runs to service_role;
   ```

   It reaches `quark-test` through the migrations workflow when the branch is pushed; live only with the release.
8. **The samples are not committed** (the folder goes in `.gitignore`); this report names the pick.

### What needs your answer

1. **The tutor's voice.** You and June listen to the four files and name one. My guess, unheard: Sulafat, which
   Google's own voice notes call warm. On your answer it goes into `TUTOR_VOICE`.
2. **The iPad's microphone needs a secure address, and the dev server isn't one.** Safari gives the microphone only to
   an `https://` page, and the iPad opens the laptop at `http://<address>:3000`, so Talk can't work there as the brief
   plans; Safari won't even ask. (The laptop's Chrome, at `localhost`, is fine.) My recommendation: I make a
   certificate for the laptop's home address only, from a one-time authority whose private key is deleted the moment
   it signs, so it can never sign anything else. At the start of stop 2 you AirDrop one file to June's iPad, install
   it in Settings, and turn it on under General → About → Certificate Trust Settings: about 3 minutes, once, and
   removable any time. Bug stays paired. If the laptop's address ever changes, it is made again. The other way is a
   Vercel preview deployment on the test project first (the board row, about an hour, with your hands in Vercel).
   On yes: the certificate, and the first check below is added to stop 2.
3. **The boys' five answers each.** The check puts both boys in front of test cards, which passed the invented test
   family's rulebook, not yours (rule 5), and it would keep their answers in test's database under Bug, which is meant
   to hold only invented children. My recommendation: they say their answers into Talk on cards you have read first;
   you read each from the box, count the right ones, and clear the box without sending, so nothing is kept. On yes,
   that check's words change as below.

**Stop 2's checks with those changes** (the rest as the brief has them):

- (new, first) "June's iPad trusts the laptop's dev certificate: I AirDropped the file, installed it, and turned it on
  under Certificate Trust Settings."
- "Holding the Talk button and saying an answer puts my words in the answer box a moment after I let go, and nothing
  is sent until I tap 'That's my answer'."
- "Each boy, beside me, says five answers into Talk on cards I have read first; I read each from the box, note how
  many came out right, and clear the box without sending." (Under four of five for either boy is a finding, not a
  failed check.)

### The rest

- **The board:** this row is the top of Next. Two rows are already in hand, Next.js to 16.4.2 and Wonder Wall slice 1,
  both *on hold*, waiting on the release; go takes this one beside them. On go: `git pull --rebase --autostash origin
  phase-4-wonder-wall`, then the row moves to *building* (today's date, the brief's path) in the first commit, with
  this file and the brief, then step 1's code in its own commit.
- **No step needs your hands between go and stop 2,** apart from the certificate at stop 2 if you take question 2.
  Nothing planned meets the deny list. The migration needs no push stop: the push applies it on test, and I watch the
  run.
- **Speech-to-Text's price:** $0.016 a minute (V2, Google's pricing page as search shows it); whether V2 has a free
  tier the page didn't show me. Read again at step 5 for `/parent/models`. Two boys saying 30 five-second answers a
  day would be about $2.40 a month.
- **Size:** a slice (8 hours); 11 minutes used.
- If June would rather listen on her phone, I can put the four samples on one private page.

Reply go to take all of these, with the voice's name.

**Brandon at stop 1, 22 Oct 2026, 23:48 HST:** "go. The voice is Sulafat. Yes to the certificate: the laptop is
Windows, no AirDrop, so put the file at an address on the dev server and give me the address to open in Safari on the
iPad. No to the boys' check: drop it from stop 2; I sit with the boys on live the first week, and how well Talk hears
them is seen there."

So: the tutor's voice is `en-US-Chirp3-HD-Sulafat`; the eight decisions above and the `speech_runs` migration stand;
the certificate is served at an address on the dev server for Safari on June's iPad; the boys' check is dropped from
stop 2, and how well Talk hears the boys is seen on live in the first week.

## Stop 2: your look, on June's iPad as Bug (23 Oct 2026, 00:10 HST)

**Where it stands.** Steps 2 to 5 are built, proven on `quark-test` in the laptop's Chrome, committed and pushed. The
iPad dev server is running now, on HTTPS, for your look. Nothing on live, nothing a child sees.

- **The mouth.** "Read it to me" asks Quark's own route for the line by its card and part. The first tap has Google
  make it in Sulafat's voice and stores it in the private bucket; after that it plays the stored file. In Chrome on
  test: a new line started playing 3 to 5 seconds after the tap (Google, the store, the dev server); a stored line after
  a reload in 1.6 seconds; a second tap on the same page started in 3 milliseconds; a tap while it plays stops it;
  starting a hint stopped the card. A hint not yet earned, a handoff not yet reached, free text, another child's card
  and an iPad with no pairing were all refused, and nothing was made for them.
- **The ears.** Talk sits under the box, the whole width, 96 px tall, and turns the accent colour while it listens. In
  Chrome the microphone was fed a stored tutor line (the card's question, 4.4 seconds), since I can't speak into the
  laptop; everything after the microphone was the real code. The words landed in the box exactly, 2.3 seconds after
  letting go, and nothing was sent as an answer. A quick tap says "Keep holding the button while you talk."; a refused
  microphone says "The microphone is off. A grown-up can turn it on."; neither reaches Google.
- **Spent on test** (`npm run fixture -- speech`): 5 lines made once each (743 characters) and 1 clip heard (5.5
  seconds), $0.02 at list price, inside the free tier; reloads and second taps added nothing. `/parent/models` shows
  the voice, these counts and Google's prices.
- **Checks:** `npm test` 382 of 382, `npm run typecheck` clean, `npm run build` clean (with `/api/kid/say` and
  `/api/kid/hear`), lint clean on every file this job changed. Migration `20261022000000_speech_runs` was applied to
  `quark-test` by the migrations workflow, run `39935530082`, green.
- **Commits:** `aa182ad` (board, brief, stop 1), `7d5613c` (the adapter's first piece), `a3da4b3` (server: lines,
  store, both routes, the migration), `8155af7` (the page: Read it to me, Talk, the browser voice and `/kid/voices`
  deleted), `ac33845` (the iPad dev server), `c94ca93` (a Talk guard, `fixture -- speech`), `149f628` (the models page,
  `.env.example`), `0d6176a` (the launcher started without a shell).

**Done along the way, so you know:**

- A dev server started at 22:43 from Git Bash (before this session; likely the Next.js job's look) was still running on
  port 3000 and had gone stale through the file changes: its card page threw "Jest worker encountered 2 child process
  exceptions". A clean production build had no such fault. I stopped it and started a fresh one; it is now the iPad
  server below.
- **Google's pricing page wouldn't load for me.** The Speech-to-Text figures ($0.016 a minute, each request rounded up
  to the second, no free tier named for V2) are from search results of that page; two other sites say 15-second
  rounding. Text-to-Speech's ($30 per million characters, 1 million free a month) are from the same search. Worth one
  look by hand at cloud.google.com/speech-to-text/pricing; a wrong figure only changes what `/parent/models` estimates.
- The certificate: `certificates/` (ignored by git) holds it for 192.168.50.67, good to November 2027. The authority's
  private key was deleted the moment it signed. If the laptop's address changes, `npm run dev:ipad` makes a new pair
  and the iPad installs the new one.

### Your look

On June's iPad, in Safari, on the home Wi-Fi (the laptop's dev server is running):

1. Open **http://192.168.50.67:3001**. Safari asks to download a configuration profile: Allow. Then Settings, the
   *Profile Downloaded* line near the top, Install (it asks for the passcode). Then Settings, General, About,
   Certificate Trust Settings, and turn on "Quark dev, this laptop at 192.168.50.67 only".
2. Open **https://192.168.50.67:3000/kid**. Bug should still be paired; if the iPad shows the pairing screen, pair it
   as Bug from `/parent` as before. The first time you hold Talk, Safari asks for the microphone: let go, tap Allow,
   then hold again.

The checks, in exact words:

- "June's iPad trusts the laptop's dev certificate: I opened the address in Safari, installed the profile in Settings,
  and turned it on under General, About, Certificate Trust Settings."
- "On a card, 'Read it to me' speaks in the voice we picked at stop 1, and only after my tap."
- "The second tap of the same line starts at once: no wait, no spend (it is stored)." (On the same page it is
  instant; after leaving and reopening a card, expect a second or two while the server checks the line again.)
- "A hint's 'Read it to me' and the handoff's are the same voice."
- "Holding the Talk button and saying an answer puts my words in the answer box a moment after I let go, and nothing
  is sent until I tap 'That's my answer'."
- "The dev page `/kid/voices` is gone."

The boys' check is dropped (your word at stop 1). Talk on the iPad is the first real microphone this code has heard:
if every hold ends in "That didn't come through", that is a fix round, not a failed slice.

**Size:** a slice (8 hours); 22 minutes since go.

Reply go if every check passed, or name the one that didn't.

## Stop 2 again: fix round 1, "Read it to me" did not read the screen (23 Oct 2026, 06:56 HST)

Brandon at stop 2, 23 Oct 2026: "The certificate is installed and trusted, https works, and "Read it to me" speaks in
Sulafat's voice. But what it reads does not match the text on the screen." The card was Bug's Look card today,
"Painted Walls by the Nile", layer 1.

### What was wrong

- **No line was filed wrong.** A line is filed under a hash of its own words, and the stored "read" line for that
  card was made from the card's `read_aloud` field (the hash matches it exactly). The part asked for was `read`
  (the dev server: `GET /api/kid/say?line=5f565ffb-….read 302 in 6.3s`, made on that tap). Nothing from the laptop
  proof is involved, and a line can't land under another card.
- **The page shows the card's `text`, and the button said its `read_aloud`.** The card writer
  (`core/prompts/card.md`) makes `read_aloud` "a short spoken version" for a child who reads alone (the whole card only
  for a child who is read to), and slice 1 chose to speak it (`docs/wonder-wall-1-slice.md`, *Read aloud*). This
  slice kept that. On this card the spoken version leaves out the nickname, "a scribe", "near Thebes", the
  Metropolitan Museum and the tempera, and ends with the question in other words. The words you quoted are the
  spoken ones (the voice says 3,400 as "three thousand four hundred"). The screen's begin "Bug, if you draw, you
  know how a picture gets made. Nakht was a scribe…".

### The fix (`a1ae45b`)

- **"Read it to me" now says the card as the page shows it: its words, then its question, word for word**
  (`readLine()` in `core/wall/speech.ts`). The question is included because it sits right under the button with no
  button of its own, and a child who is read to needs to hear it (the old `read_aloud` carried it for that child).
  `read_aloud` is never said. The hints and the handoff already said exactly what they show.
- A new test holds that the read line is the page's text and question and never `read_aloud`. 383 of 383 tests
  pass; the typecheck is clean; lint is clean on the changed files.
- New: `npm run fixture -- card <id>` prints one card's shown words, what "Read it to me" says, and `read_aloud`,
  each with whether it is stored in the voice. Test only.
- This card's text opens with the nickname, so this line sends it to Google and the stored sound says it, as
  decision 6 at stop 1 allowed (`read_aloud` happened to leave it out). *Touches rule 7.*
- Not made yet: the new line is made by your next tap (one call to Google, about 430 characters, under 2 cents at
  list price, inside the free tier). The say route answers only a paired iPad, and June's is the paired one.

Found, not changed: the card writer still writes `read_aloud` and the gate still reads it, but nothing says it now.
Dropping it from `card.md` (with its check for a child who is read to) would save output tokens and bears on docs/08's
open "Too many words" question. The card prompt is outside this brief, so this is for the close or a later job.

### Your look

On June's iPad, as Bug, at https://192.168.50.67:3000/kid:

1. If the Look card is open, tap "Back to the wall" first, so the page drops the sound it already loaded. Then open
   the Look card, "Painted Walls by the Nile".
2. Tap "Read it to me". The first tap takes a few seconds while the line is made. It should say the paragraph on the
   screen word for word, from "Bug, if you draw…" to "…tempera paint on paper.", then "What crop are the men in the
   painting working to grow?"
3. Tap once to stop it and again to play: it starts at once.

The check for this fix, in exact words:

- "On a card, 'Read it to me' says the words on the screen and then the question, word for word."

The stop-2 checks above stand as written. You have passed the certificate and the voice; the rest (the second tap,
the hint and handoff voice, Talk, `/kid/voices` gone) are still to take.

**Size:** a slice (8 hours); 22 minutes to stop 2, and this fix round about 5 minutes from your word.

Reply go if every check passed, or name the one that didn't.

## Stop 2 again: fix round 2, a thousands comma read as a pause (23 Oct 2026, 07:10 HST)

Brandon at stop 2, 23 Oct 2026: ""Read it to me" now says the screen word for word, good. But it reads "3,400 years
ago" as "three, four hundred years ago": the thousands comma is read as a pause. Before a line goes to Google, drop
the comma inside a number (3,400 → 3400) so it is read as one number; do the same for any other number shape you find
in the week's cards (a year, a date, a fraction, "1/4") and say in the report which ones you handled and which you
left."

### How the shapes were found and checked

- `npm run fixture -- numbers 1` lists every number in the spoken words (text, question, hints, handoff) of test's
  week 1, 280 cards, grouped by shape.
- Each shape was said by Google in Sulafat's voice and heard back by Chirp 3 (`npm run speech:check`, which now takes
  several lines). A number read whole comes back whole; one read with a pause comes back split ("3 400").
- The limit: the ears write numbers in digits, so they show whether a number was read whole or split, not every
  detail (whether 365.2422 is "point two four two two", say). Your ear is the check.

### Handled

- **A comma inside a number is dropped before the line goes to Google:** 3,400 is sent as 3400 (`forVoice()` in
  `core/wall/speech.ts`). Heard back, "3,400" was "3 400" and "1,234" was "1 234"; "3400" is one number. The week has
  24 of them: x,xxx numbers such as 3,400, 5,000 and 1,000 (18), 10,000 and 100,000 (4), 1,000,000 (2). Round ones
  (5,000, 100,000, 1,000,000) were already read whole; without the comma they still are (checked both ways).
- A comma followed by a space, as in a list ("400, 800, 1200"), stays as it is. So does any comma not between digit
  groups of three.

### Left as written, because Google already reads them whole

- Years: 1582, 1884, 1900, 2026 and the rest (52 four-digit numbers in the week).
- Decades: 1660s, 1670s, 1960s.
- Year ranges: 1811-12 (heard "1811 to 12"), (1827-1838) (heard "1827 to 1838").
- Dates: 17 December 1903 (heard "the 17th of December, 1903"), February 29th.
- Decimals: 365.2422, 137.5, 2.3 million.
- 24-hour, 400s, 7s (heard "sevens"), and lists of numbers.
- Not in this week's cards, tried anyway and read whole: 1/4, 1/6, 3/4, 10/26, 2–3 hours (heard "2 to 3"), a
  3-4-5 rope, 6 × 6 = 36. No fraction or slash date is in the week. If a later week shows one misread, that is a
  bug line.

### The fix (`5220b09`)

- `forVoice()` runs on every line the tutor says, and the stored line is now named by the words as sent. Bug's old
  recording with the pause is never played again, and a line with such a number is made again on its next tap (one
  call to Google each).
- 386 of 386 tests pass (3 new: the commas dropped, every other shape in the week left alone, and the line sent and
  filed as 3400). The typecheck is clean; lint is clean on the changed files.
- New: `npm run fixture -- numbers <week>`; `npm run speech:line -- <card id> [part]`, which says one card's line
  through the wall's own code, as a tap on that child's paired iPad would, stores it, and hears it back
  (`scripts/server-alias.mts` lets a script load the app's `@/` code, as Next does). `speech:check` takes several
  lines.

### Proven on test

`npm run speech:line` on Bug's Look card, "Painted Walls by the Nile": said through `sayLine()` as Bug's paired iPad
would, stored (`fixture -- card` says "stored"), and recorded as one speech run of 436 characters ($0.013 at list
price). Heard back: "…a scribe who lived about 3,400 years ago…", one number.

Spent this round: that line, plus about 30 short lines said and heard by `speech:check`, which records nothing on
`/parent/models`. Together under 10 cents at list price, all inside Google's free tiers.

### Your look

On June's iPad as Bug:

1. If the Look card is open, tap "Back to the wall", then open "Painted Walls by the Nile" again.
2. Tap "Read it to me". It starts at once: the line is already made and stored.

The check for this fix, in exact words:

- "On a card, 'Read it to me' says '3,400 years ago' as one number, with no pause after 'three'."

Fix round 1's check passed in your words ("now says the screen word for word, good"). The other stop-2 checks are
still to take: the second tap, the hint and handoff voice, Talk, and `/kid/voices` gone.

**Size:** a slice (8 hours); 22 minutes to stop 2, about 5 for fix round 1, about 10 for this one.

Reply go if every check passed, or name the one that didn't.
