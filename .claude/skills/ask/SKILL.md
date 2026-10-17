---
name: ask
description: Answers a question about Quark from its records, in plain words with the sources named. Changes nothing.
argument-hint: [your question]
disable-model-invocation: true
allowed-tools: Read Grep Glob
disallowed-tools: Edit Write NotebookEdit Bash PowerShell
---

Answer this question about Quark: `$ARGUMENTS`

1. CLAUDE.md is already loaded. Then find, by search and not by reading whole files, only the parts of these that the question touches: `README.md`, the `docs/*.md` pages, `deploy/supabase/schema.sql`, `gate/values-interview.md`, `packs/README.md`, and `docs/board.md` for where a feature stands. Read the code only if the records do not answer it.
2. Answer in plain words, and name the sources (file and heading).
3. You change nothing and commit nothing. If you are asked to, say that `/ask` is read-only and say which command does it (`/idea`, `/bugs`, `/job`).
4. If the answer is "that is not decided", say so, and offer `/idea <words>` for Brandon to type. Do not add the idea yourself.
