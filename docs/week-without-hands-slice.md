# Brief: the week builds with nobody's hands

**Phase 3 work on `phase-4-wonder-wall`.** Drafted 23 November 2026 in the chat, 20:40. Board row: none yet. Brandon
raised it tonight (the quotes below), so on go Code adds, at *building*, under *Week 2 builds itself*: "The week
builds with nobody's hands: the app writes its own short lessons, a Sunday is never refused, and no Puzzle cards are
built while the trading boat is here". **Status: ready.**

**Size:** a slice. **It is wanted on live by Saturday 28 November, 10 pm**, so that Sunday 29 November's build makes
week 6 by itself. What it costs if it is later: the Saturday pick (`docs/saturday-pick-slice.md`, its row at the top
of Next) still works by hand, about two hours of Brandon's Saturday; if that is missed too, a third Monday without
cards.

## Why

Two Saturdays in a row the pick was missed (14 and 21 November), two Sundays the build refused, and two Mondays the
week was built by hand a day late (`docs/reports/2026-11-16-week-4.md`, `docs/reports/2026-11-23-week-5.md`). The
weekly loop depends on a Code session that Brandon has to launch on one particular day. Brandon, 23 November 2026, in
the chat:

- "a one day window on the weekend isn't realistic for us."
- "we still have to approve the weekly cards before the boys see them. Why would we need to approve in triplicate?
  The theme first, then the pantry, then the cards?"
- "we dont actually reject many cards. A short day here or there is not a big deal. It's better then having to
  scramble every week to work around the system not working"
- "we need to get this running on it's own, not stock a big pantry"

So the parents' pick of short lessons goes. The one approval is the tap on **Looks good**, as rule 5 has it.

## What is true when this is done

1. **The app writes its own short lessons.** On Vercel, with no Code session and no file, the library on live gains
   the short lessons next week needs before Sunday's first firing: each with a slot, a title naming its idea, both
   bands' summaries, an open-licensed picture or recording fetched through the adapters and stored, and its values
   points. No lesson repeats an idea an earlier week used.
2. **A Sunday is never refused for want of content.** Brandon, 23 Nov 2026: "The only reason a day should be short is
   if a parent blocks a tile on Sunday before the cards release." If the library is still short at a firing, the
   firing writes what it lacks, then builds. A week no theme holds is built from short lessons alone, on every tile,
   as the code did before *A theme a week*. `/parent` says what the app wrote and what each firing did.
3. **No Puzzle cards while the trading boat is here** (Brandon, 23 Nov 2026, on taking slice 2's proposal: "That's
   fine to add it in"). While the family's times tables give the boat prices, the build makes no Puzzle ideas or
   cards and takes no Puzzle lesson; when the boat is not here, Puzzle is built as now. The week page counts four
   tiles a day while the boat is here.
4. **Nothing else about what reaches a child changes.** Every card still passes the gate, and the week still waits in
   review for a guardian's tap.

## What Code will meet (read by the chat, 23 Nov; check each)

- `weekSchedule()` (`core/curation/schedule.ts`) throws "Not enough short lessons for week N" when any slot is
  short, and `stretchForWeek()` throws "No theme for week N" when no stretch holds the week.
- `scripts/import-plan.mts` deletes every `plan_topics` row its file no longer has. A lesson the app wrote must
  survive a later `plan:import`.
- The adapters (`core/content/sources.ts`) fetch an item by its URL; nothing in the app searches the Met, the Art
  Institute or Commons. `core/model.ts` has no search tool. Tonight's job found the Met's v1 search retired on 1 Oct
  2026 and used v1.1.
- The Sunday build is eight firings (`vercel.json`), one day each, each stopped at five minutes
  (`core/curation/cron.ts`). Writing lessons inside those eight would crowd them; a firing of its own on other days
  is the likely answer.
- The boat is here by `lib/boat-here.ts`; the wall hides Puzzle by it (`lib/wall.ts`), and the build does not ask.
- `content:fetch` stops a whole run at the first dropped connection (tonight's report, *Found, not built*, 1). The
  app's own fetch cannot do that.
- A recording is used only when it is public domain in the US; a picture only when CC0 or public domain. Tonight
  Code turned down seven items the adapters read as CC BY or CC BY-SA.

## Stops

1. **After reading: the design, on one page.** Code says, with its recommended answer for each:
   - where the writing runs (which firings, on which days), how far ahead it keeps the library, and how a missed or
     doubled firing is survived, as the Sunday build's lock does;
   - how a candidate item is found in the open sources with no person searching, and how its license is read;
   - **how a lesson's facts are checked with no Code session.** Today Code checks each fact against the source's own
     record as it writes. The design names what does that work now (a second model call against the fetched record,
     claims the record does not support left out), and what it cannot catch. The loose-fact bug lines of 23 Oct and
     16 Nov are the test;
   - how values points are set on a lesson the app wrote, so the family's settings can hold it back;
   - where an app-written lesson is kept so `plan:import` does not delete it, and whether that needs a migration (its
     SQL shown here; this is its review);
   - what a week with no theme is called and how its tiles are filled;
   - what a week costs now: the writing, the fetch, and the build without Puzzle, against about $14.50 today and the
     $25 line;
   - what `/parent` says;
   - whether this fits by Saturday 28 November, and if not, what is cut so that 1 and 2 above are live by then.
   Anything the records and this brief cannot settle comes with its recommended answer; "go" takes them all.
2. **Your look, on test: a week nobody picked.** Checks direction: that a self-written week is one Brandon and June
   would tap. Before the stop Code empties test's unused short lessons, lets the app's own firings write and build
   next week on test with the boat here, and takes every check with a known answer itself, with pictures: no
   refusal; seven days; four tiles a day and no Puzzle card; every first card with its picture or recording; every
   credit line reading right; the money. Brandon's look is judgment only, about ten minutes, on test's week page:
   - Are these lessons ones you would have picked?
   - Does any card state something you know to be wrong?
   - Does `/parent` tell you plainly what the app did this week?
   Each ends Pass □ Fail □ — if fail, what you saw.
3. **The release, and any live migration by Brandon's hand.** Guards: `main`, the live database, and what the boys
   see next week. `/wwc:release`, with its three lines. If there is a migration, its live command is Brandon's hand
   here, before the push. The report says in plain words what will happen on Sunday 29 November with nobody touching
   anything, and what to look for on `/parent` that morning.

## Decided already (do not reopen)

- **The parents do not pick short lessons** (Brandon, 23 Nov 2026, quoted above). *Replaces* "one stop and one reply
  carry the theme and the 28" (8 Nov). The candidates files stay as history.
- **The app stocks itself; no big pantry by hand** (Brandon, 23 Nov 2026: "Fully automatic on Vercel"; "not stock a
  big pantry").
- **A day is short only by a parent's block** (Brandon, 23 Nov 2026, quoted above). *Replaces* "When a slot runs out
  of lessons, nothing is built" (16 Oct).
- **No Puzzle cards while the boat is here** (Brandon, 23 Nov 2026).
- **Rule 5 stands.** The gate checks every card; a guardian's tap makes the week live. Nothing the app writes
  reaches a child without both.
- **Open sources only**, through the adapters, as decided 1 Nov. Music Quark cannot hold openly is never linked.
- **The idea named in every title; no idea repeated; what the lessons lean on; the Hawaiʻi standard** (22 Oct, 8
  Nov): the app's writer is held to them as Code was. A Hawaiʻi lesson that cannot clear the standard is not written.
- **Every live command is Brandon's hand** at a planned stop.

## Not in this job

- **The theme.** Brandon, 23 Nov 2026: "we should have all week to pick the next weeks theme". Themes offered on
  `/parent` all week, written by the app when picked, are the next slice of this project. Until then a week with no
  theme file is short lessons alone, and a theme can still be written by a Code job.
- **The week page:** striking a card (Brandon, 23 Nov 2026: yes), releasing one the card checks held back, and a
  preview that shows what the wall will show: `docs/week-page-slice.md`, ready beside this one.
- The fetch's retry on `content:fetch` the script, and `credit()`'s titles (tonight's *Found, not built*, 1 and 2),
  except where the app's own writing meets them.
- Rewriting `docs/saturday-pick-slice.md`: at the close its row is proposed for deletion, on Brandon's yes.

## Read first

1. `docs/reports/2026-11-23-week-5.md` and `docs/reports/2026-11-16-week-4.md`: the two hand builds, and what a
   person did in each that the app must now do.
2. `docs/04-curation-engine.md`: "How a week is mixed", "How the Sunday build is built", "How the approval rule is
   built"; `docs/saturday-pick-slice.md`, *Decided already*.
3. `core/curation/schedule.ts`, `week-job.ts`, `cron.ts`, `cron-job.ts`; `app/api/cron`; `vercel.json`.
4. `lib/plan.ts`, `scripts/import-plan.mts`, `plan/short-lessons.yaml` (the format and 144 examples).
5. `core/content/` whole; `core/prompts/ideas.md`, `card.md`, `flag-content.md`.
6. `lib/boat-here.ts`, `lib/wall.ts`; `docs/trading-boat-2-slice.md`, *The Sunday build without Puzzle*.
7. `docs/08-open-questions.md`, *Bugs*.

## Records to update at the end

`docs/04-curation-engine.md` (*How it is built* and *Decided:* for each line above, with what it replaces),
`docs/08-open-questions.md`, `docs/03-touch-points.md` if `/parent` changes, `CLAUDE.md` *Where we are*, `README.md`'s
status line, `docs/board.md`, the report (`docs/reports/<date>-week-without-hands.md`). `/wwc:release`.
