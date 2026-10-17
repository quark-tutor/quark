# Board

Every Quark feature from first mention to live or not doing, one row each, newest
movement first. It answers where Quark stands, what is waiting, what needs a brief and
what is only an idea. Features only: bugs are under *Bugs* in `docs/08-open-questions.md`
and show on the page as a count per phase; open questions that are decisions for Brandon
and June stay in docs/08. This repository is public: no row names a child, and "the boys"
is the most a row says.

`/idea` adds a row at the top. `/close` moves the rows a job touched, with today's date.
`npm run docs:board` writes `Quark board.html` at the repository root (not tracked). A
*live* row stays 14 days after it moved and is then deleted by `/close`; the *Where we are*
note and the spec pages are the record of what is live. A *not doing* row stays, with its
reason in Waiting on.

A row names one thing that can be briefed and built. A heading that covers several things
is replaced by its unbuilt pieces, or deleted; nothing is a row that only says "the rest of".

Stages: not fully formed (worth keeping, not described well enough to size) · raised
(sized or sizeable; nobody has promised anything) · briefed (a `docs/<name>-slice.md`
exists) · building (a job is on it) · on test (built and waiting on a person's check or go:
Brandon at the laptop, or the boys on an iPad) · on hold (built; nothing to do until a named
date or event, which goes in Waiting on) · live (merged to `main` and running on Vercel) ·
not doing.

Size: minutes · an hour · a job · a slice · several slices · — (blank until checked
against the code). Importance is Brandon's, then June's, never averaged; — until rated.
Phase: 1–7 from the build order in CLAUDE.md, `tooling` (how Quark is built with Claude),
or — when it fits none; a row that spans phases takes the last one it needs.

| Feature | Stage | Moved | Waiting on | Size | Importance | Phase | Where |
|---|---|---|---|---|---|---|---|
| Working with Claude, Quark: the state board and the seven session skills | building | 17 Oct 2026 | — | a job | — / — | tooling | `docs/board-slice.md` |
