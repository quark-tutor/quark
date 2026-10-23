# Brief: the tutor's voice, both ways, from Google (the tutor, slice 1)

**Phase 4, on `phase-4-wonder-wall`.** Drafted 22 October 2026 in the chat, 06:45 to 07:55, from Brandon's look at
slice 1 on a real iPad and the design talk that followed. Board row: "The tutor's voice" (*next*, under the project
*The tutor*). **Status: ready once the *Before the job* list is done.**

**Size:** a slice.

## Why

On the iPad, "Read it to me" is Apple's compact voice: Safari gives web pages only that one, never the Premium voices
a family installs (proved 22 October on `/kid/voices`: Zoe (Premium) installed and chosen, not in the list). Brandon:
"robot voice is a no-go." And the voice is not one feature: the tutor will read a card, speak a hint, and in later
slices answer what a child asks, live. The child must hear one tutor. So Quark owns both sides of speech in one place:
what the tutor says (text to speech) and what the child says (speech to text), from one vendor, behind one adapter,
never from the browser's own engines. Brandon: "let's not use the best output speech and still rely on a second best
or input speech from apple, let's control it all in one spot."

## Stops

1. **After reading, and the voice to pick.** Code says where it stands, then makes the samples: the Harvesters card's
   text ("In 1565, Pieter Bruegel painted The Harvesters…") read by four Chirp 3 HD voices that suit reading to a
   7-year-old, as MP3 files at `docs/reports/samples/` (test only, nothing a child sees, under a dollar). Brandon and
   June listen and name one: that is the tutor's voice. Any question the records and this brief cannot settle, with its
   recommended answer; "go" takes them all.
2. **Your look, on the second guardian's iPad as Bug** (the device-test rule, 22 October), after step 5:
   - "On a card, 'Read it to me' speaks in the voice we picked at stop 1, and only after my tap."
   - "The second tap of the same line starts at once: no wait, no spend (it is stored)."
   - "A hint's 'Read it to me' and the handoff's are the same voice."
   - "Holding the Talk button and saying an answer puts my words in the answer box, and nothing is sent until I tap
     'That's my answer'."
   - "Each boy says five card answers into Talk; I note how many came out right." (This is the check that matters:
     recognizers hear children worse than adults. Under four of five for either boy is a finding for the report, not a
     failed check.)
   - "The dev page `/kid/voices` is gone."
   "go" means every one passed, or name the one that did not: a fix round, and this stop comes again.
3. **`/wwc:close`.**

No step touches the live database, money beyond the Google free tier, a real person, or a child: everything runs on
`quark-test` and the dev server until the release.

## Before the job (Brandon's hands; nothing in the job waits on them)

1. A Google Cloud project for Quark, with billing on (the free tier needs it), and the **Cloud Text-to-Speech API** and
   **Cloud Speech-to-Text API** enabled.
2. A service account with the roles those two APIs need, and its JSON key saved **outside the repository**, with its
   path in `.env.local` as `GOOGLE_APPLICATION_CREDENTIALS` (Code never reads `.env.local`; the deny list is the wall).
   `.env.example` gets the name with a placeholder, by Code.
3. The same key in Vercel's environments, test and production, as a secret (the key's JSON as one variable, or the file
   as a secret file, Brandon's choice; the brief's step 2 reads either).
4. On the second guardian's iPad: Safari allowed to use the microphone for the dev server's address, when it asks.

## Read first

1. `CLAUDE.md` (*Rules that never bend* 4, 5 and 7; *Stack for version one*, the voice line, which this job replaces;
   *Stops*), `docs/03-touch-points.md`, `docs/13-architecture.md`, `docs/12-teaching-that-tests-itself.md`.
2. `app/kid/read-aloud.tsx`, `app/kid/player.tsx`, `app/kid/card/[id]/answer-box.tsx`, `core/wall/voice.ts` and
   `app/kid/voices/` (both to be deleted), `lib/wall.ts` (every kid read and write), `core/model.ts` (the adapter this
   one copies), `core/content/` (how pictures are stored in the private bucket and signed).
3. `docs/reports/2026-10-21-wonder-wall-1-slice.md`, *Fix round 1* (the voice finding) and its close.
4. Google's docs for Chirp 3 HD voices (Text-to-Speech) and Chirp 3 streaming recognition (Speech-to-Text), and the
   pricing pages, read by search; the prices go on `/parent/models` beside the model prices.

## Decided already (Brandon, 22 October 2026, 07:13 to 07:54; do not reopen)

- **No browser voice, in or out.** "Robot voice is a no-go." Quark controls both sides of speech "in one spot".
- **Google Cloud for both**: Chirp 3 HD for the tutor's voice, Chirp 3 for hearing the child. Chosen for cost: "the
  cost will become a barrier for families." ElevenLabs was the better read at $22–30 a month; Google's free tier (1M
  characters of speech a month) covers a family.
- **One voice everywhere.** The same voice reads a card, a hint, a handoff, and in later slices answers live. Picked
  by Brandon and June at stop 1.
- **Pay for what is heard.** Audio is made the first time a line is tapped and stored; never a whole week recorded
  ahead. (The chat's design, taken 07:54.)
- **The tutor teaches** (the project this slice opens). Brandon, 07:27: "An app that never answers the child's
  questions won't get used. A tutor that's lobotomized is not a tutor. We generate the content in the beginning
  (curate) to start a conversation … Then we give the children a tutor who can answer what they're curious about.
  The tutor gets filters obviously (belief filter), and output is tracked for parents to review." Live answers are
  **not** this slice; this slice gives the tutor its voice and its ears so they are ready.
- **Device tests** use one invented child (Bug) on the second guardian's iPad; the boys' iPads only for live.

## What is built

1. **The speech adapter**, `core/speech.ts`, shaped like `core/model.ts`: `say(text, { voice }) → audio bytes` and
   `hear(audioStream, { language }) → text, streaming partials`, one provider (`core/speech/google.ts`), the vendor
   swappable. The key is read on the server only. A Vitest check holds that nothing under `app/kid/` imports the
   adapter or the Google client: the browser only ever calls Quark's own routes.
2. **The mouth.** `GET /api/kid/say?line=<id>`: the line is a card's text, question, one hint, the handoff, or one of
   the wall's replies (`core/wall/words.ts`), named by the card and the part, never by free text from the browser.
   On first call the server makes the MP3 with the tutor's voice, stores it in the private bucket at a path from the
   hash of (text, voice), writes nothing about the child, and returns a signed URL; later calls return the stored
   file. "Read it to me" (`read-aloud.tsx`) plays that URL in an `<audio>` element started from the tap, never by
   itself (rule 4); the second tap stops it; starting one stops any other. `core/wall/voice.ts`, `pickVoice()` and
   `/kid/voices` are deleted. A line's audio is made at most once a voice: a week costs what is tapped.
3. **The ears.** A **Talk** button beside the answer box: hold to talk (pointer down to up), the microphone through
   `getUserMedia`, chunks streamed to `POST /api/kid/hear` (a streaming request, or a WebSocket if Next.js on Vercel
   needs it: Code decides at stop 1 and says), the server streams them to Chirp 3 and returns partial text as it
   arrives; the words land in the answer box, where the child sees them, can fix them with the keyboard, and sends
   them with "That's my answer" as now. Quark stores no audio and no transcript beyond the answer the child sends
   (`attempts`, as now). The keyboard's own dictation key still works; Talk is the first choice on screen.
4. **The page.** The Talk button is big, under the box, with the microphone's state plain (listening or not);
   layouts at 820 × 1180 and 1180 × 820 hold. No sound plays on its own; nothing links out.
5. **The prices** on `/parent/models`: Text-to-Speech and Speech-to-Text per character and per minute, from Google's
   pricing page, with the free tier named; each `say` and each `hear` adds to a `speech_runs` count the page shows
   (counts and money only; no child named). A migration if a table is the right place; Code decides at stop 1.
6. **Records.** `CLAUDE.md`'s stack line ("Voice: browser speech APIs on iPad Safari first") replaced; `docs/13`
   *How it is built* gains the adapter and both routes; `docs/03` the Talk button; *Decided:* lines dated 22 October
   with Brandon's words above; `docs/08` *How Quark is built with Claude* the privacy line below.

**Privacy, for the records (and for June):** the child's voice goes to Google's API to be heard, as text goes to
Anthropic's to be judged; Google's API does not use it to train and Quark keeps none of it. Nothing sent names a
child (rule 7). The recognizer hears a prompt-free stream; nothing about the child is sent with it.

## The steps, in order

1. Read; the adapter stub; the four samples; **stop 1**.
2. The adapter, the Google provider, the key from the environment, the browser-never-imports check; `say` proven on
   test with one line stored and served.
3. The mouth: the route, the store, `read-aloud.tsx` on it, the old voice code deleted; the week page's "Read it to
   me" too if it has one.
4. The ears: the route and the Talk button; proven in the laptop's Chrome with its microphone.
5. The prices and counts; `npm test`, `npm run typecheck`, the build; push, the migrations run if there is one; the
   state written; **stop 2, Your look**.
6. `/wwc:close`.

## Not in this job

The tutor answering a child's questions (the next slice of *The tutor*: the live answer, the filter on every line
before it is spoken, the parents' log); the model as judge of a card answer (`judgeGuess()` stays the word rule);
recordings of music (the player stays as it is); offline use; the Ask box; any change to the Sunday build or the
gate; anything on live (the release carries this, and the key in production is Brandon's).

## Records to update at the end

`CLAUDE.md` (*Where we are*, the stack line), `docs/13-architecture.md`, `docs/03-touch-points.md`,
`docs/08-open-questions.md` (*Decided:* and the privacy line), `docs/board.md` (this row), `.env.example`.
`/wwc:close`.
