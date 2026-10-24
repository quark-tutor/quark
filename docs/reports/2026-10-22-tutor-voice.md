# Report: the tutor's voice, both ways, from Google (`docs/tutor-voice-slice.md`), 22 and 23 October 2026

Opus 5.5. Branch `phase-4-wonder-wall`, as the brief names, pushed. Built, and proven on `quark-test` and on June's
iPad as the invented child Bug. Nothing on live, and nothing a child sees until the release. Cost: not read.

## What could not be checked (first, because these matter most)

- **How well Talk hears the boys.** The brief's check ("Each boy says five card answers into Talk") was dropped at
  stop 1. Brandon: "No to the boys' check: drop it from stop 2; I sit with the boys on live the first week, and how
  well Talk hears them is seen there." Recognizers hear children worse than adults; only Brandon's voice has been
  heard so far.
- **The handoff's voice.** Brandon's go lists "the hint in the same voice" and not the handoff, and says "Every check
  passed". It is recorded as passed on those words. The handoff plays through the same button and route as the hint.
- **Anything on Vercel.** Both routes have run only on the laptop's dev server, where the key is read from a file path
  (`GOOGLE_APPLICATION_CREDENTIALS`). The way Vercel will give it, the key's JSON in `GOOGLE_CREDENTIALS_JSON`, has not
  been tried against Google.
- **Google's prices.** Google's pricing page would not load for me. Speech-to-Text at $0.016 a minute, rounded up to
  the second, with no free tier named for V2, is from search results; two other sites say 15-second rounding.
  Text-to-Speech's $30 a million characters, 1 million free a month, is from the same search. A wrong figure changes
  only `/parent/models`' estimate. One look by hand at cloud.google.com/speech-to-text/pricing settles it.
- **How every number is read.** Chirp 3 writes what it hears in digits, so hearing a line back shows whether a number
  was read whole or split, not every detail (whether 365.2422 is "point two four two two", say). Brandon's ear checked
  3,400.

## Not done, and what each becomes

- **"Each boy says five card answers into Talk":** dropped by Brandon at stop 1 (his words above). Nothing to make: he
  sits with the boys on live in the first week.
- Every other check in the brief passed at stop 2 on June's iPad as Bug, with a certificate check added at stop 1.
- The brief's "the week page's 'Read it to me' too if it has one": the week page has none, so there was nothing to do.

## What was done

All five steps of the brief, on `phase-4-wonder-wall`:

- **One adapter.** `core/speech.ts`, server only and shaped like `core/model.ts`, with Google behind it in
  `core/speech/google.ts`:
  - `say()` uses Chirp 3 HD `en-US-Chirp3-HD-Sulafat` (Brandon and June's pick) and returns MP3.
  - `hear()` uses Chirp 3 (`chirp_3`, region `us`, automatic punctuation) on one 16 kHz clip.
  - The calls are plain REST with a service account's token (`google-auth-library` 11.1.0). The key comes from
    `GOOGLE_CREDENTIALS_JSON` or `GOOGLE_APPLICATION_CREDENTIALS`; `.env.example` names both.
- **The mouth, `GET /api/kid/say?line=<card>.<part>`.**
  - A line is named by its card and part, never by free text.
  - It is said only when the paired child can see it now: a hint once earned, the handoff once reached. Otherwise the
    route answers 404, and nothing is sent to Google.
  - The words are hashed, and the MP3 is stored in the private bucket. It is made on the first tap and played from
    storage after that, through a one-hour signed link.
  - "Read it to me" starts inside the tap, as iPad Safari requires. A second tap stops it, and one line plays at a
    time.
- **Fix round 1 (Brandon: what it read "does not match the text on the screen").** No line had been filed wrong. The
  button said the card's `read_aloud`, the writer's shorter spoken version, while the page shows its `text`. "Read it
  to me" now says the card as the page shows it, its words then its question, and never `read_aloud` (`readLine()`,
  `a1ae45b`).
- **Fix round 2 (Brandon: "3,400 years ago" read as "three, four hundred").** `forVoice()` drops the comma inside a
  number before a line goes to Google (`5220b09`). The stored line is named by the words as sent, so the old reading is
  never played again. Chirp 3 heard each shape in test's week 1 (280 cards, listed by `fixture -- numbers 1`) said by
  Google:
  - **Handled.** Heard back, "3,400" was "3 400" and "1,234" was "1 234". The week has 24 numbers with a comma: 18
    like 3,400, 5,000 and 1,000, 4 of 10,000 and 100,000, and 2 of 1,000,000. The round ones were already read whole,
    and still are without the comma. A comma in a list ("400, 800, 1200") stays.
  - **Left as written, because they are already read whole:**
    - years such as 1582 and 2026 (52 in the week);
    - decades (1660s, 1670s, 1960s) and year ranges (1811-12, heard as "1811 to 12"; 1827-1838);
    - dates (17 December 1903, February 29th);
    - decimals (365.2422, 137.5, 2.3 million), 24-hour, 400s, 7s, and lists.
  - **Not in the week, tried anyway, and read whole:** 1/4, 1/6, 3/4, 10/26, 2–3 hours, a 3-4-5 rope, 6 × 6 = 36.
- **The ears, `POST /api/kid/hear`.** Talk is a hold-to-talk button under the answer box, the full width:
  - The microphone opens on the press, and a hold stops itself at 30 seconds.
  - On release, one 16 kHz clip goes to Chirp 3, and the words land in the box about two seconds later.
  - Nothing is sent as an answer until "That's my answer", and no clip or heard words are kept.
  - A tap too short to hold a word says "Keep holding the button while you talk." and never reaches Google. A
    refused microphone says so.
- **Gone:** the browser voice (`core/wall/voice.ts`, `pickVoice()`, `/kid/voices`, `/api/dev/voices`). Tests hold
  that nothing uses `speechSynthesis` or `SpeechRecognition`, that no browser code imports the speech code, and that
  the speech files are server only.
- **Prices and counts on `/parent/models`:** whether the key is set, the voice, the ears, Google's prices and free
  tier, and lines, clips and cost this month and since the start. They come from the new `speech_runs` table: one row
  per call to Google, counts and money only, with no child, no device and no words.
- **For testing:**
  - `npm run dev:ipad` runs the dev server over HTTPS at the laptop's home address. Safari gives the microphone only to
    a secure page. The one-time authority's key was deleted once it signed. The certificate is good to November 2027
    and is served for the iPad at `http://<address>:3001`.
  - `npm run speech:check` has Google say lines and Chirp 3 hear them back, keeping nothing.
  - `npm run speech:line -- <card id>` says one card's line through the wall's own code, stores it and hears it back.
    `scripts/server-alias.mts` lets a script load the app's `@/` code.
  - `npm run fixture -- speech | card <id> | numbers <week>`.
- **The plate:** 386 of 386 tests, typecheck clean, `npm run build` clean (with `/api/kid/say` and `/api/kid/hear`),
  lint clean on every file this job changed.
- **Along the way:** a dev server started at 22:43 on 22 Oct, before this session, had gone stale and threw on the
  card page. I stopped it, and the iPad dev server replaced it. After the laptop restarted on 23 Oct, `npm run
  dev:ipad` started again on the same address with the same certificate. It is still running.

## The migrations run

- `20261022000000_speech_runs`: pushed with `a3da4b3` and applied to `quark-test` by the migrations workflow, run
  `39935530082`, success. Not on live.

## Decisions (docs/08, "The tutor's voice, both ways")

- 22 Oct 2026, the brief (Brandon, 07:13 to 07:54), each with his words in docs/08:
  - no browser voice, in or out ("robot voice is a no-go");
  - Google Cloud for both, for cost;
  - one voice everywhere;
  - pay for what is heard;
  - the tutor teaches, and this slice gives it its voice and ears.
- 22 Oct 2026, stop 1: "go. The voice is Sulafat. Yes to the certificate: the laptop is Windows, no AirDrop, so put the
  file at an address on the dev server and give me the address to open in Safari on the iPad. No to the boys' check:
  drop it from stop 2; I sit with the boys on live the first week, and how well Talk hears them is seen there." His go
  also took the build's eight decisions:
  - one clip on release, not streaming (*replaces* the brief's words streaming in);
  - a line only when the child can see it, and the answers never given to Google to listen for;
  - a link opened inside the tap;
  - the voice as one line of code;
  - the key's two names;
  - the nickname going to Google as to Anthropic;
  - `speech_runs`;
  - the samples not committed.
- 23 Oct 2026, stop 2, fix round 1: "Read it to me" reads the card's text, then its question, and never `read_aloud`.
  Brandon: it "does not match the text on the screen", then "now says the screen word for word, good". *Replaces*
  Wonder Wall slice 1's choice to read `read_aloud`.
- 23 Oct 2026, stop 2, fix round 2: the comma inside a number is dropped. Brandon: "drop the comma inside a number
  (3,400 → 3400) so it is read as one number".
- 23 Oct 2026, stop 2: "go. Every check passed on June's iPad as Bug: the certificate, Sulafat reading the screen word
  for word, 3,400 as one number, the second tap instant, the hint in the same voice, Talk putting my words in the box
  exactly with nothing sent, /kid/voices gone. The whole thing was intuitive."

## Found along the way, beyond the brief (for Brandon)

- **The brief's privacy line was not true as written.** It said "Nothing sent names a child".
  - A card's words can carry the nickname (decision 6 at stop 1), and "Read it to me" sends the card's text. Bug's Look
    card opens with the nickname, so Google receives it and the stored recording says it.
  - docs/08 now says it plainly, for June: the nickname can go to Google as it goes to Anthropic, and nothing else
    about a child does. *Touches rule 7.*
  - The line is in docs/08's *The tutor's voice, both ways* section, not under *How Quark is built with Claude* as the
    brief said, because it is about the product, not the tooling.
- **A line's first-ever tap waits 4–5 seconds before the voice starts** (Brandon's finding after the go). A stored line
  waits 1 to 1.6 seconds, because the route checks the line and signs its link on every tap. The proposed slice below
  answers both.
- **`read_aloud` is written but never said.** The card writer still makes it and the gate reads it. Dropping it from
  `core/prompts/card.md`, with its check for a child who is read to, would save output tokens on every card; noted in
  docs/08's open "Too many words". That is a change to the Sunday build, so a later job.
- **`speech:check` spend is not counted** on `/parent/models`. It is a few cents, and only when checking.

## Slices for The tutor

The tutor's voice found the project needs one more slice: **4 slices becomes 5**, in build order:

1. The tutor's voice, both ways, from Google (this slice, *on hold*, waiting on the release).
2. **New: the tutor's lines made ahead.** Each night, every passed card of the next day has its lines made in the
   tutor's voice and stored, so no first tap waits 4–5 seconds; and "Read it to me" shows it is busy from the tap
   until the voice starts. A job. Its brief would propose:
   - **Overnight, not Sunday.** One more daily Vercel cron at about 3 am Hawaii. The Sunday build already spends about
     130 of its 240 seconds a day; a card held back, or a week taken back to review, would have spent on lines never
     said; and a card passed late is caught.
   - **Which lines.** Every passed card's lines: its read line, hints and handoff. Each is still said only once
     earned, so rule 3 holds. That is about 900,000 characters a month, at the edge of the free 1 million; read lines
     alone are about 460,000.
   - **The busy button.** "Getting it ready…" from the tap until the voice starts, which also covers the 1 to 1.6
     seconds of a stored line.
   - **Monday.** Until it is built, each line's first tap in the boys' first week waits 4–5 seconds.
3. Hints as a conversation, and the tutor's live answers.
4. The parents' review page.
5. The Ask box.

It is added as a `later` row under The tutor on your yes; if you want it before Monday, say so and it goes to `next`.
Reply yes to add them.

## On live

Nothing. For "Read it to me" and Talk to work on the boys' iPads, the release must carry three things. Without the
first two, every first tap of a line answers 502 and nothing plays:

1. **`speech_runs` on live.** `db:push:live` at stop M1 now applies two migrations, `20261021000000_server_writes_weeks`
   and `20261022000000_speech_runs`.
2. **Google's key in Vercel's production environment** as `GOOGLE_CREDENTIALS_JSON`, the key's JSON on one line
   (Brandon's, *Before the job* 3).
3. **Billing on the Google Cloud project**, which the free tier needs. It is already on, and the same project serves
   test and live.

## Money

- On test, recorded in `speech_runs`: 11 lines made and 3 clips heard, $0.086 at list price.
- Not recorded: the four samples at stop 1 (1,124 characters, $0.03) and about 40 short lines said and heard by
  `speech:check`, under 20 cents together.
- All of it is inside Google's free tiers. Nothing on Anthropic.

## What you now do differently

- **The iPad looks at the laptop through `npm run dev:ipad`, not `npm run dev`,** at `https://192.168.50.67:3000/kid`.
  The plain `http://` address gets no microphone. June's iPad trusts the laptop's certificate once. If the laptop's
  address changes, the script makes a new one, and the iPad installs it from `http://<address>:3001`.
- **A child answers by voice with Talk:** hold, speak, let go, check the words, tap "That's my answer". The keyboard's
  dictation still works, but nothing needs it.
- **Before the release, set `GOOGLE_CREDENTIALS_JSON` in Vercel's production environment.** Without it, "Read it to
  me" and Talk fail on live.
- **`/parent/models` shows what the voice and ears have spent;** `npm run fixture -- speech` shows the same on test.
- **New commands for a look:** `speech:check`, `speech:line`, and `fixture -- card` and `-- numbers`. `/kid/voices` is
  gone.

## Records updated at the close

- `CLAUDE.md`: the stack's voice line, *Where we are* (23 Oct; M1 now two migrations; the key), and this job's note.
- `docs/13-architecture.md`: the stack's Voice row, and *How the tutor's voice and ears are built*.
- `docs/03-touch-points.md`: "Read it to me" in the tutor's voice and the Talk button.
- `docs/04-curation-engine.md`: *How the Wonder Wall is built* (read aloud and Talk; the card page).
- `docs/08-open-questions.md`:
  - *The tutor's voice, both ways* (every decision above, with Brandon's words, and the privacy line);
  - slice 1's natural-voice decision marked done;
  - a note on "Too many words".
- `docs/board.md`: the row moved from *building* to *on hold*, waiting on the release, 23 Oct 2026.
- `README.md`: the status line. `.env.example` was updated in the job (`149f628`).
- The board page was rebuilt (`npm run docs:board`, untracked).

## Commits

| Commit | What |
|---|---|
| `aa182ad` | the row to building, the brief, stop 1 and Brandon's go |
| `7d5613c` | the adapter's first piece, the samples and the round trip, Sulafat |
| `a3da4b3` | the mouth and ears on the server, the store, both routes, the migration |
| `8155af7` | the page: Read it to me in the tutor's voice, Talk, the browser voice and `/kid/voices` gone |
| `ac33845` | the iPad dev server over HTTPS, with its certificate |
| `c94ca93` | a Talk guard; `fixture -- speech` |
| `149f628` | the models page, Google's prices, `.env.example` |
| `0d6176a` | the iPad dev server starts Next directly |
| `d0c850f` | stop 2 |
| `a1ae45b` | Read it to me reads the screen; `fixture -- card` |
| `ad25b50` | stop 2, fix round 1 |
| `5220b09` | the comma inside a number; `speech:line`, `fixture -- numbers` |
| `f2dd61a`, `380b382` | stop 2, fix round 2 |
| `7833bf2`, `f8626d9` | the state at stop 2's go; the proposed row |
| the close | the records and this report |

**Size:** a slice (8 hours). About 50 minutes of work: 11 minutes to stop 1, 22 from go to stop 2, about 5 and 10 for
the two fix rounds, and the close.
