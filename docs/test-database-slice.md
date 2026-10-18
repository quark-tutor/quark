# A test database: the second Supabase project

Brief drafted in the chat on 17 October 2026 (evening), for Brandon to
settle before the session. One job, one Claude Code session on Sonnet, in
`quark`. The board's row: *A test Supabase project, so a migration from a
branch cannot touch the live database* (raised, high, tooling). Nothing here
changes a screen or a card; it changes which database every command points
at by default.

## Why

Quark has one Supabase project and it is the boys' live copy. Every
migration, seed and import runs against it; the ask-list stops each one, but
an ask is a pause, not a proof. On 16 October the `db:push` dry-run ask was
approved by hand, reached the live database and printed its password into the
session. CLAUDE.md now says the live project is never used to prove a rule,
which leaves nowhere to prove one: a new migration goes from a laptop to the
boys' data with no stop in between but Brandon's eye.

PDERP has had this from the start (erp-test, then live, migrations numbered
after the last one on `service`). Phase 4 (the Wonder Wall) is the first
phase the boys will use on the iPads, and from then on a wrong migration is
a wrong evening for them. The review (16 October, section 9) and the board
both put a test project before phase 4. This is it.

## Proposed decisions, for Brandon to confirm (then dated for docs/08)

- **Two Supabase projects: `quark` (live, as now) and `quark-test`.** Same
  organisation, same region, free tier. Nothing is copied from live to
  test, ever: the test project holds the example family from
  `scripts/family.example.json` and never a child's real nickname or a
  guardian's real address. *New; follows rule 7.*
- **Test is the default; live takes the word.** Every script that touches a
  database (`db:push`, `seed`, `packs:import`, `plan:import`,
  `content:fetch`, `week:build`) runs against test unless the command names
  live (`npm run db:push:live`, or whatever shape step 1 settles). A
  command with no `live` in it cannot reach the boys' data. `npm run dev`
  on the laptop runs against test too; Vercel runs against live, as now.
  *Replaces* the one `.env.local` pointing at live.
- **A migration reaches live only after it has run on test** from the same
  branch, in the same session, with its result shown. The ask on the live
  command stays, and its description says LIVE. *Adds to* "a new migration
  always stops".
- **Dashboard settings are Brandon's own steps**, done once from
  `deploy/README.md` step 1 before the session, and listed in the records
  so the next person (or the next project) repeats them. *New.*
- **Other families still run one copy.** The second project is a
  developer's thing; `deploy/README.md` keeps its one-project path and
  gains a short *For developers* note. *New.*

## Read first

1. CLAUDE.md (loaded; *Before a consequential action*, *Where we are*),
   `.claude/settings.json` (the database and script patterns),
   `docs/08-open-questions.md` (*How Quark is built with Claude*, *Bugs*).
2. `package.json` (every `--env-file=.env.local` script),
   `scripts/db-push.mts` (as fixed by the 17 October sweep),
   `scripts/seed-family.mts`, `scripts/family.example.json`, `lib/env.ts`,
   `.env.example`, `supabase/config.toml`, `supabase/migrations/` (names
   and order only), `supabase/.gitignore`, `.gitignore`.
3. `deploy/README.md` (steps 1 and 2 are what the test project repeats),
   `docs/13-architecture.md`, `docs/14-hosting-and-privacy.md`.
4. The Supabase CLI docs for `db push --db-url` and for `supabase link`,
   read at supabase.com/docs. The 17 October sweep found that `db push`
   takes the URL only on the command line, where it shows in the process
   list and in a failed command's output (now scrubbed); the route that
   keeps the password out of the command is `supabase link` with
   `SUPABASE_DB_PASSWORD` in the environment, after which `db push` needs
   no URL. A link is one project per checkout, so two targets mean
   relinking or two checkouts. Step 1 weighs the two and recommends one.
   Never run a `supabase` command to find out.

## Brandon's own steps, before the session

1. In the Supabase dashboard, in the same organisation as `quark`, create
   the project `quark-test` in the same region. Note that free projects
   pause after a week without use and wake with one click in the
   dashboard; that is fine for a test project.
2. Apply `deploy/README.md` step 1 to it: Data API on, automatically expose
   new tables off, automatic RLS on; email sign-up off; Site URL and
   redirect URLs for `http://localhost:3000/**` only (no Vercel address;
   nothing deploys from it).
3. Make the two env files yourself (Claude Code never reads or writes a
   `.env` file): copy today's `.env.local` to `.env.live.local`, then put
   the test project's four values (URL, publishable key, secret key,
   database URL from Connect → Session pooler) into `.env.local`. Keep the
   Anthropic key and model names in both. Both names are already
   gitignored by `.env*`.
4. Make `scripts/family.test.json` from `family.example.json` with your own
   email as the one guardian, so you can sign in to the test copy, and
   invented children. Gitignored? It is not today, and it holds your
   address: step 1 of the job adds it to `.gitignore`, so do not commit it.

If the final names in step 1 of the job differ from these, Claude Code
says so and Brandon renames the files before step 2.

## Steps and stops

1. **Write back, then STOP.** Read the files above and show: the env-file
   layout (names, which script reads which); the exact `package.json`
   scripts after the change, with the rule that *no script without `live`
   in its name can read `.env.live.local`*; whether `--db-url` per target
   is enough or linking is simpler, with a recommendation; the ask-list
   changes (`Bash(npm run *live*)` and the PowerShell twin, and anything
   else so that every route to live still asks); how `db-push.mts` names
   its target in the plain-words description (LIVE in capitals, as CLAUDE.md
   requires); the exact *For developers* text for `deploy/README.md`; and
   anything in this brief that does not fit the repository. Also say which
   branch the job runs on and why (see *To settle* below). Suggest plan
   mode. **Brandon confirms the decisions above, corrects names, and says
   go.** On go, the board row moves to *building* as the first commit.
2. **Build.** The scripts, `package.json`, `.env.example` (document both
   files), `.gitignore` (`scripts/family.test.json`), the ask-list, CLAUDE.md
   (*Before a consequential action*: there are two projects now; test is
   the default; the live rule and the LIVE word stay; the test project is
   where a rule is proven), `deploy/README.md`, `docs/13-architecture.md`
   (*How it is built*: one line), docs/08 (*Decided:* lines).
3. **Prove it on test, then STOP.** In this order, each shown:
   `npm run db:push` applies all migrations present on the branch to
   `quark-test` (the first migration run in Quark's history that is not
   against live); `npm run seed -- scripts/family.test.json` creates the
   test family; `npm run packs:import` and `npm run plan:import` load the
   packs and the plan; `npm run dev` starts against test and Brandon signs
   in at `/parent` with the test guardian's email. Then the negative
   proof: `npm run db:push:live --dry-run` (or the live name chosen) must
   stop with an ask whose description says LIVE, and Brandon **declines**
   it; a declined ask is the proof, not a run. Nothing is run against live
   in this job. **STOP** for Brandon to see the test copy in the browser
   and the declined ask.
4. **Records and `/close`.** The row goes to *on test* (Waiting on "the
   first real migration proven on test, then live") or *live* if Brandon
   says the declined ask is enough. Branch pushed; nothing to `main`
   unless the branch is `main`'s.

## To settle with Brandon at step 1

- **Which branch.** The five newest migrations exist only on
  `phase-3-curation`, so a `db:push` to test from `main` would apply an
  older schema than the one live runs. The chat's recommendation: a branch
  `test-database` made from `phase-3-curation`, merged back into
  `phase-3-curation` at the close (and so into `main` when phase 3
  merges). That is tooling on a phase branch, which bends the
  branch-per-phase rule once, for the reason above; Claude Code says at
  step 1 if it sees a cleaner way.
- **`content:fetch` and `week:build` on test.** Both spend API money and
  the fetch copies about 45 MB of pictures. Not run in this job; they stay
  pointed at test by default so the first time they are needed on test,
  they go there. Brandon can say otherwise.
- **Vercel preview deployments** could point at the test project (a
  preview per branch, against test data). Its own row, *raised*, not this
  job.
- **The Sunday cron** runs on Vercel against live and is untouched.

## Not in this job

- Supabase branching or a paid plan; a CI step; Vercel previews; any
  change to the Sunday cron.
- Copying any data from live to test, or any script that could.
- Running `content:fetch` or `week:build` anywhere.
- Any new migration; any command against live, dry-run included (the one
  declined ask in step 3 is the exception, and it is declined).
- Fixing the open bugs (the sweep has them).

## What done means

- `quark-test` exists with the schema the branch holds, the test family,
  the packs and the plan, and no child's or guardian's real data.
- On the laptop, every database script defaults to test; the live
  variants carry `live` in their name, their description says LIVE, and
  the ask-list stops each of them (one declined ask shown).
- `.env.example`, `deploy/README.md`, CLAUDE.md, docs/13 and docs/08 say
  how the two projects are used; `scripts/family.test.json` is gitignored.
- Brandon signed in to the test copy in a browser.
- The job closed with `/close`: the row moved, the records committed by
  name, the branch pushed, the full report with its "couldn't check"
  lines first, the four-line read-back, and the `/cost` figure.
