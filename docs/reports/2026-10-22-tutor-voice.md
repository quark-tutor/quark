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
