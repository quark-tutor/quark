---
name: readback
description: Prints the four-line read-back for Brandon from a job's brief and the session's final report, written by the readback reader on Sonnet.
argument-hint: [path to the brief]
disable-model-invocation: true
---

Produce the read-back for this job.

1. The brief is the file at `$ARGUMENTS`. With no argument, use the brief named in this session's first message. If there is none, say so and stop.
2. The report is the last full end-of-job report in this session, as written, or a report the person pasted. If this session has not written one yet, use what it has reported so far and say that on a line above the four.
3. Call the Agent tool once with `subagent_type: "readback"`. Its prompt holds the brief's path and the report's complete text, unchanged and uncut. Add nothing of your own: no summary, no opinion.
4. Print the reader's four lines exactly as returned. Do not reword, shorten or add to them.
