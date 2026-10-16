# Quark — instructions for Claude Code

Quark is an AI tutor that works for parents: curated, challenging, values-aware learning at home for kids roughly 6–12. This repo is both the open concept and, from now on, the code. Read this file first, then `README.md`, then the docs it links to. The docs are the spec.

## The first family

Two boys, 7 and 9, in Hawaii, each with a recent iPad. One hosted copy on Vercel + Supabase, used only by this family. Parents: Brandon (builds it) and his wife (co-owner of the values side). Everything is built so other families can run their own copy later.

## Rules that never bend

1. **Not a brainwashing engine.** The tutor teaches how to think, never hides that others believe differently, never uses fear or shame, never teaches a child to look down on anyone.
2. **Every guardian has an equal say.** Any guardian can blackball a topic; only that guardian can lift it. Disagreements default to parent-led.
3. **Hints, never answers.** The child guesses first. Hints are a conversation, not a button. The last hint hands off to a person. The screen never gives the answer.
4. **No engagement hooks.** No autoplay, infinite scroll, streaks, notifications, outbound links, ads, or rewards that exist only to bring kids back. The tutor is a guide, not a friend or companion.
5. **Nothing reaches a child unchecked.** Every card passes the policy gate (family values profile + blackballs + safety floor) before it is shown.
6. **Sex is a starting prior, not a ceiling.** It leans the first week's opening lens; after that the child's own choices carry the weight. Never gate content by sex. All seven lenses stay available to every child.
7. **Minimal data about children.** Nickname, birth month, sex, reading level, interests. Never a full name, photo, school or address. Model prompts never include identifying details.
8. **Effort words, never brilliance words.** "For kids who keep trying," not "for smart kids."

## Where things are

- `docs/` — the concept, one page per topic. `13-architecture.md` has the stack. `12-teaching-that-tests-itself.md` has the hint/difficulty rules. `09-family-values.md` and `packs/README.md` have the values system and the 24 controversial points.
- `supabase/migrations/` — the data model as it actually runs, applied in order. Read it before touching data. `deploy/supabase/schema.sql` is the readable model the migrations started from. Key chain: `plan_topics → themes → ideas (shared, source-anchored) → cards (per child, per lens, layers 1–4) → questions → attempts`.
- `gate/values-interview.md` — how a family's answers become `values_settings` rows and a plain-English policy document the gate reads.
- The private working doc (not in the repo) has more detail on lenses, the learner model, and the reward engine. Brandon can paste sections on request.

## Stack for version one

- Next.js (App Router) on Vercel. One app, two views: `/kid` (the Wonder Wall, locked tablet, voice-first) and `/parent` (settings, values interview, digest).
- Supabase: Postgres (schema above), Auth for guardians, Storage for images/audio. The kid view uses a scoped key that can only read today's passed cards and write attempts.
- Model: Anthropic API via a thin adapter (`core/model.ts`) so the provider can be swapped. Keep prompts in versioned files under `core/prompts/`, never inline.
- Weekly curation: a Vercel cron route on Sunday night (Hawaii time). If it outgrows the function limit, move to a worker.
- Policy gate: a second model call per card, with the family's policy document as the policy. Log what it changed to `cards.policy_notes`.
- Email digest: Resend. Car audio: an RSS file in Storage. Voice: browser speech APIs on iPad Safari first.
- TypeScript throughout. Tests with Vitest. Keep it boring.

## Conventions

- Small commits with plain messages. Branch per phase (`phase-1-foundation`, …); merge to `main` when it runs.
- Secrets in `.env.local` only; never commit them. Add `.env.example` with placeholder names.
- Every outside content item carries its source and license. Nothing unapproved is shown to a child.
- When a design question comes up that the docs don't settle, write the options into `docs/08-open-questions.md` (or the open questions of the page it belongs to) and ask Brandon rather than guessing.
- Don't rename "Quark" or "Wonder Wall". Don't add "AI" to any user-facing name.
- End every build session the same way, before the last commit: update the Where we are note under Build order (date, what's merged, what's on which branch, what's next), then update the Status line in README.md so it agrees with it. The README status is for visitors and stays short; CLAUDE.md carries the detail. If a session ends without this, the next session does it first.

## Build order

1. **Foundation** — Next.js app, Supabase project wired up, schema applied, guardian sign-in, empty `/kid` and `/parent` views, iPad in Guided Access can open it.
2. **Values interview + policy gate** — the interview UI per `gate/values-interview.md`, rows written, policy document generated, the 20-question test run shown to parents.
3. **Curation engine v1** — weekly cron: pick theme from `plan_topics`, generate ideas (source-anchored), render cards per child per lens, gate them, load the week.
4. **Wonder Wall** — five daily cards, layers 1–4, voice answers, hints as conversation, profiles, explorer stamps, calm session end on rushing.
5. **Digest and audio** — Sunday email, RSS feed, art-of-the-week.
6. **Checks and difficulty** — delayed recall via `review_schedule`, hint-count difficulty dial, results in the digest.
7. **Pilot** — four weeks with the boys.

**Where we are (end of 16 Oct 2026):** phases 1 and 2 are merged to `main`. Phase 3 is on `phase-3-curation`, not merged, and nothing is on the iPads yet.
- Done: step 1 (model adapter, lenses spec), 2 (the plan), 2b (a picture for every topic), 2c (layer 1 always has a picture), 3 (content), 4 (ideas and cards), 4b (the models and costs page), 4c (the week preview with pictures and sound).
- 4b: `/parent/models`, read-only, linked from `/parent`: the model per job from the environment, the price table in `core/prices.ts` (checked 16 Oct), every run, and an estimate for a week and a month beside the old $5.70. `week:build` and `content:fetch` now write a row to `model_runs` at the end of each run (counts and money only); migration `20261016000000_model_runs` is applied live. One run is recorded so far, a $0 `content:fetch`; the estimate appears after the next `week:build`. Defaults to settle are in docs/08, "Models and costs".
- Credit lines on the week preview are clean (`credit()` in `core/content/credit.ts`): no Commons edit trail or repeats, the Met once, and Aida's 1871 kept with Verdi, apart from the Marine Band.
- 2b: all 24 Egypt topics have sources (Brandon's picks from `plan/candidates/ancient-egypt.md`), plus a Met harp and sistrum for week 1's listen topic; `planWarnings()` names topics without any. 35 new items, all approved automatically. Still waiting at `/parent/content`: the CC BY-SA Rosetta photo and Musopen's Handel, neither in week 1.
- 2c: `firstLayerProblem()` in `core/curation/ideas.ts` sends a chain back once when layer 1 has no item but the topic has one; the report lists any still missing.
- Day 1 was rebuilt again on 15 Oct for $0.91 and is in review at `/parent/week/[theme]`. All five first cards have an item, with no second asks needed; 14 of 20 layers use one. Two listen layer 3 cards (one per child) were blocked by the hint check, so they won't be shown. The 14 Oct day 1 is exported to `plan/candidates/day1-2026-10-14.json`, gitignored because it names the children.
- Open, in docs/08: the 3-4-5 rope as a parent activity; the tutor's voice (proposed as step 4d) and faces; the rest of the 2c review (the announced door, too many words, two blocked hints, how much is one day); mixed weeks (2d); the models page defaults.
- 2d, stage 1 (16 Oct): the format for mixed weeks and a first library of 28 short lessons, each with checked CC0 or public-domain candidates, are in `plan/candidates/short-lessons.md`; Brandon's five decisions are in docs/08, with the open choices under "Mixed weeks: the format and the build". Nothing is imported or built yet. Thin spots: no open recording of Beethoven 5 for four-notes, whale calls rather than a song, tangram has no museum object.
- Next, in order: Brandon and his wife pick the lessons and settle the docs/08 choices; then 2d stage 2 (the format, migration, validator, plan:import and week:build for mixed weeks, content:fetch, rebuild day 1); then 5, the policy gate, the twenty-question test run, `careful_about` to the gate only, `learns_to_act` into the card prompt; 6, the Sunday cron and the Looks-good page.

Success for version one: both boys use it unprompted 4+ days a week, sessions of 15+ minutes of real engagement, recall from three weeks earlier without hints, under 30 minutes a week of parent time.
