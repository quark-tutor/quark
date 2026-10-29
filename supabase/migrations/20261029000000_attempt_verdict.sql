-- Quark — phase 4, the tutor's slice 2: the judge's verdict kept with each answer (docs/judge-slice.md, What is
-- built, 2). A model judges a child's answer and returns a verdict only; the child hears a line written in advance
-- for it (core/wall/words.ts). What is kept here is for the parents and never reaches the iPad:
--   verdict    right, close, hint (the answer replied to the hint, not the question), not_yet, or not_a_guess;
--              null for an open question's answer, and on every row from before this migration
--   judged_by  model, or rule when the model gave no verdict in time and the word rule judged instead
--   reasoning  the model's one line on what the answer got or missed
-- `correct` is written as before: true for right; false for close, hint and not_yet; null for an open question.
-- Additive: the code on live before the release ignores the columns, so this goes to live first.
--
-- model_runs.kind gains 'judge': one row per answer the model judged, counts and money only (rule 7).

alter table attempts
  add column verdict   text check (verdict in ('right', 'close', 'hint', 'not_yet', 'not_a_guess')),
  add column judged_by text check (judged_by in ('model', 'rule')),
  add column reasoning text;

alter table model_runs drop constraint model_runs_kind_check;
alter table model_runs add constraint model_runs_kind_check check (kind in ('week:build', 'content:fetch', 'gate', 'judge'));
