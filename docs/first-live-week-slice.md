# Brief: the boys' first live week (Pilot, slice 1)

**Phase 4, on `phase-4-wonder-wall`.** Drafted 23 October 2026 in the chat, 16:40, from `docs/wonder-wall-1-slice.md`
(*The week for Monday*, settled 20 October) and the decisions of 22 and 23 October. Board row: "The boys' first live
week" (*next*, under *Pilot*). **Status: ready once *Before the job* is done.**

**Size:** a job, over three days: the card prompt and its proof tonight (Friday), the live stops Saturday, the tap
and the iPads Sunday. The size clock counts Code's own time.

## What this job is for

Live week 1 is the one-day week of 19 October, and it cannot go live. The boys need a seven-day week on live from
Monday 26 October, written by a card prompt that names the idea it teaches, checked by the gate, read by a guardian
and tapped, on two iPads paired to live. Every live command is Brandon's hand at a planned stop; Code writes the
four lines and waits.

## Stops

1. **After reading, and the new cards on test.** Code has done step 1 (card prompt v6) and rebuilt one day of test's
   week with it. The stop shows the diff of `core/prompts/card.md` and, for Brandon's eyes on the laptop, that day on
   `/parent/week/<theme>` on test:
   - "Every card's title is the name of the idea it teaches ('Perspective', not 'Big People, Tiny People'), and the
     name appears in the card's words."
   - "No card gives its answer before its question."
   Anything the records and this brief cannot settle, with its recommended answer. "go" takes them all.
2. **M1, Brandon's hand: `npm run db:push:live`.** Applies `20261021000000_server_writes_weeks` and
   `20261022000000_speech_runs` to LIVE. Undone by a new migration granting back what the first revokes (written out
   at the stop) and dropping the table. Checked on test by the workflow (21 and 22 October). Brandon types it in his
   own PowerShell, in the repository, and says "M1 is in" with what it printed.
3. **M2, Brandon's hand, Saturday: delete live week 1, and the younger's reading level,** in the live project's SQL
   editor:
   ```sql
   select id, week_start, plan_week, status from themes where plan_week = 1;   -- expect one row: 2026-10-19
   delete from themes where plan_week = 1 and week_start = '2026-10-19';
   select id, birth_month, reading from children;                                  -- expect two rows: chapter_books, reads_alone
   update children set reading = 'chapter_books' where reading = 'reads_alone';    -- the younger only
   ```
   LIVE. The delete cannot be undone; no child ever saw the week (`docs/reports/2026-10-20-gate-live.md`). The update
   is undone by setting that id back to `reads_alone`. Both boys read well above their age (the school's tests,
   22 October: the younger at 145 words a minute with 100% accuracy; the older at a Lexile of about 785), and no
   `/parent` page sets a reading level (only `seed:live`, from `scripts/family.local.json`, which is changed to match;
   stop 1, 23 October). Brandon says "M2 is in".
4. **M3, Brandon's hand: `npm run week:build:live -- --week 1 --start 2026-10-26 --plan`.** LIVE, read only, spends
   nothing. Brandon pastes the printed plan into the session (a fact of the moment). Code checks two things and says:
   - the plan order: day 1 is the Nile on the Then card with great-wave, leap-years, carnival-of-the-animals and
     two-dice (docs/04); if not, `plan:import:live` is a stop of its own, before M4;
   - **each child's reading level as the plan prints it** ("written for chapter_books, age 9"): both *chapter books*
     after M2; if not, the update is a stop of its own, before M4.
5. **M4, Brandon's hand: `npm run week:build:live -- --week 1 --start 2026-10-26`.** LIVE, about $13, under the $25
   line; seven days, both children, pictures, the gate; left in review. Undone by nothing a child sees until the tap;
   a bad day by `--day d --rebuild` at a stop of its own. Brandon pastes the summary it prints. Code reads the
   week's own report (`fixture` has no live twin, so from what Brandon pastes and what the live week page shows him).
6. **Your look, the week on live.** Brandon, on the laptop at the live address, signed in:
   - "The week page shows seven days, every day with five first cards for each boy, pictures on them, and the
     *Before you tap* box names no card that isn't checked."
   - "The titles are the ideas' names."
   June, the same page: she reads the week, as the brief of 20 October asked. "go" here is Brandon's word that both
   looks are done. (The safety floor is not read as a document: June sits with the boys on live the first week, and
   that is her check; the floor stays version 1 until a real card shows otherwise. Brandon, at stop 1's go,
   23 October.)
7. **The tap, Sunday: a guardian taps Looks good** on live. From then the week is live from Monday. Then the iPads:
   - On each boy's iPad: the live address allowed in Screen Time (Settings → Screen Time → Content & Privacy →
     Web Content → add it under Always Allow); Safari opened at `<live>/kid`; saved to the Home Screen (Share → Add
     to Home Screen); Quark opened from the Home Screen; on the laptop, live's `/parent`, that boy, **Get a code**; the
     six digits typed on the iPad; then Guided Access. A Home Screen app keeps its own cookies, apart from Safari's,
     so it is paired from inside the app (`deploy/README.md`, step 4; stop 1, 23 October).
   - On each iPad, one tap of "Read it to me" on Monday's first card: Sulafat's voice, on live, through Vercel
     (the first proof that `GOOGLE_CREDENTIALS_JSON` works there), and one hold of Talk with a word spoken.
   Each is Brandon's and June's, Sunday; "go" means every one passed, or the one that did not is named.
8. **`/wwc:close`.**

## Before the job (Brandon's hands)

1. ~~June reads the safety floor~~ Struck (Brandon, 23 October, at stop 1's go): "June won't read the safety floor
   as a document; she sits with the boys on live the first week, and that is her check."
2. `GOOGLE_CREDENTIALS_JSON` is in Vercel's production environment (done 23 October, 16:21).
3. The boys' iPads charged, on the home Wi-Fi, with Guided Access on (Settings → Accessibility → Guided Access).
4. Not needed for this week: `CRON_SECRET`, `ANTHROPIC_API_KEY` and the model names in Vercel (the Sunday build on
   Vercel is week 2's, in the *Week 2 builds itself* project).

## Read first

1. `docs/wonder-wall-1-slice.md`, *The week for Monday* (the stops as settled 20 October) and *Decisions*.
2. `core/prompts/card.md` (v5), `core/prompts/gate.md`, `core/curation/cards.ts`, `core/curation/gate.ts` (what
   reads `read_aloud`), `core/wall/speech.ts` (what "Read it to me" says now: the text and the question).
3. `docs/04-curation-engine.md`, "How a week is built" and "How the Sunday build is built"; `docs/12`.
4. `docs/08-open-questions.md`: *Wonder Wall, slice 1*, *The tutor's voice, both ways*, "Too many words", the
   announced door (step 4d), and the gate's reader notes on cards that give the answer before the question.
5. `docs/reports/2026-10-22-tutor-voice.md`, *Found along the way* (`read_aloud` written but never said).
6. `deploy/README.md` and `vercel.json` for the live address and the Home Screen app.

## Decided already (Brandon, 22 and 23 October 2026; do not reopen)

- **Name the idea, every time, with the same name.** Brandon, 22 October, 07:06: "the page has fallen into AI's
  favorite past-time of using a verb as a title … when it could just be called - Perspective. we can use the text and
  question and image to help the child understand - this is what perspective is, things that are far away look small.
  if we never say perspective anywhere the child never has a bucket to put this knowledge in." And 07:09: "some
  ideas we're teaching will be easy and fast to teach, and some will take many iterations at different levels
  before they really soak in. keeping that naming the idea convention gives a logical link over time to the
  theories the child is learning." The name is never what is tested.
- **The release is done** (23 October, `main` at `ab9a2f7`): the Wonder Wall, the tutor's voice and Next.js 16.4.2
  are on Vercel. M1 follows it.
- **Monday's first taps wait 4–5 seconds** for a line's first making; the row "the tutor's lines made ahead" is
  Next after this job (Brandon's yes, 23 October).
- **Device tests use June's iPad as Bug; the boys' iPads only for live** (22 October). This job is live, so the
  boys' iPads come in at stop 7.
- **The reading levels come from the school's tests** (22 October, the chat, 08:08 to 08:12), not from age.

## Step 1: card prompt v6, in one revision

Three changes to `core/prompts/card.md`, each a tested rule, then one day of test's week rebuilt with it
(`week:build -- --week 1 --day 1 --rebuild` on test, about $2) for stop 1:

1. **Name the idea.** A new section: when a card teaches a concept that has a name (perspective, erosion, a fraction,
   a round, a remainder), the card says the name plainly and the **title is that name**; the text, picture and
   question show what it means ("Things far away look small. Painters call this perspective."). When the idea comes
   back in a later layer or week, it comes back under the same word. The name is never the answer the child is asked
   for. *Recommended wording at stop 1; the rule is Brandon's.*
2. **Never the answer before the question.** The gate's reader notes say about half of day 1's cards state the
   answer in the text and then ask for it. The text sets up the question and leaves the finding to the child; the
   answer may appear only in a later layer's text, after the question that earned it. (docs/08, step 4d.)
3. **Drop `read_aloud`.** Nothing says it since the voice slice ("Read it to me" reads the text and the question).
   Remove the field from the prompt, the card writer's schema, the gate's read of it and the week page's use, with
   the reading-level section rewritten: *read to* means two or three short sentences the tablet will read; *reads
   alone* and *chapter books* as now, without the spoken version. Existing cards keep their stored `read_aloud`
   column untouched (no migration). *Recommended; Code says at stop 1 if the gate's check for a read-to child needs
   `read_aloud` and, if so, keeps it there only.*

The version comment at the top of `card.md` becomes v6 with the date and the three rules. `npm test`,
`npm run typecheck`. The rebuilt day is read on test's week page at stop 1.

## The steps, in order

1. Read; step 1 above; the rebuilt day on test; **stop 1**.
2. On go: the prompt committed and pushed (the migrations workflow runs its tests; no migration). **M1.**
3. Saturday: **M2**, **M3** (with the two checks), **M4**.
4. **Stop 6**, the look at the live week; then **stop 7**, Sunday's tap and the iPads.
5. **`/wwc:close`**: the records (docs/04 *How a week is built* for v6; docs/08's *Decided:* lines with Brandon's
   words; the four-notes and step-4d items that this closes; `CLAUDE.md` *Where we are* and the README status: the
   boys are on live), the board (this row to *live*; the Pilot project's next slice, if one is named, is a proposal
   in the report), the full report with the money (test about $2, live about $13).

## Not in this job

The lines made ahead (Next, after this); the 28 short lessons and week 2 (the *Week 2 builds itself* project, with
the Vercel production settings in its *Before the job*); `SUPABASE_DB_URL_LIVE` (the WWC board's waiting-on row);
the reading-level row in the inbox; anything the tutor says beyond the cards; any change to the gate.

## Records to update at the end

`core/prompts/card.md` (v6), `docs/04-curation-engine.md`, `docs/08-open-questions.md`, `CLAUDE.md`, `README.md`,
`docs/board.md`. `/wwc:close`.
