# Sweep, 20 October 2026: invented nicknames

Branch `phase-3-curation` (tooling sweep; no phase work). Brief: the batch agreed in the session's step 2.

## Could not be checked

- Nothing was left unchecked. The tests and typecheck are the only checks this fix has; no screen is involved.
- Not claimed: whether the history still holds the real nicknames. It does, and the bug line said it would.

## What was done

- Brandon said yes to the nickname line only (invented names in all six places) and said to leave the other three bugs.
- The bug named "a nickname of one of the boys", but the six places held both boys' nicknames. Both are replaced: the 7-year-old's by Pip, the 9-year-old's by Wren (the names `core/curation/gate.test.ts` already uses). Files: `core/curation/clean.ts`, `scripts/week-build.mts`, `core/curation/curation.test.ts`, `lib/family-values.test.ts`, `gate/values-interview.md`, `docs/08-open-questions.md` (the review notes there quoted the 9-year-old's nickname six times).
- A search of tracked files finds neither real name outside `packs/`, where "Rabbi Asher Resnick" is a real person and was left.
- The bug line is deleted from docs/08. One commit: `5cdb5a7`.
- `npm test`: 20 files, 230 tests passed. `npm run typecheck`: clean.
- No migration, no live database, no API spend, nothing a child will see.

## Left alone, as agreed

- The hint check's comparison false positive (its hint was never recorded).
- The announced door (step 4d).
- The commit message that quoted a command: the wwc sweep skill already says a commit message never quotes a command, so nothing in this repository needs it. The line stays until Brandon says delete.

## Beyond the brief

- Nothing built. I did not add a test that fails when a real nickname appears, because it would have to hold the nickname.

## Records

- `CLAUDE.md`: a sweep bullet under *Where we are*. The README status line is unchanged (nothing it says moved).
- Board: no row touched; the bug count is now 3. `npm run docs:board` run.

## On live

Nothing.

## Choices that touch a guardian's say or a rule

- Rule 7 (minimal data about children) and the public-repository rule: the change removes real nicknames from tracked files. Brandon chose the scope; I chose to include the 9-year-old's name because it sat in the same files.

## Cost

$0.51 for the session (`/cost`: Sonnet 5.5 $0.51, Haiku 5.5 $0.0002; 64 lines added, 19 removed).
