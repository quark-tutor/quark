-- Quark — phase 4, the Math tile, slice 1 (docs/math-tile-slice.md; decided at stop 1, 9 Nov 2026). Additive: the
-- code on live before the release ignores every column here, so this goes to live first (stop M1).
--
-- skills: the math ladder (plan/math-ladder.yaml, written by npm run ladder:import). The table is in the first
--   schema and was unused; a row is now a rung or an everyday area, found by its key.
--     key       the rung's key in the file, never reused ("times-3-4")
--     position  its place on the ladder, or in the everyday list
--     ladder    what the file says of it: what a problem on it asks, an example, and its rule
--   kind keeps its column: 'rung' or 'everyday' for these rows.
-- mastery: a boy's place on a rung. A row with place 'done' or 'working'; no row is "not yet". Set by a parent's
--   hand in this slice (the places are never in the repository, which is public); p_known and attempts stay for
--   slice 2, when the place moves by itself.
-- children.math_style: how a boy's problems are written. 'short': shorter sums, more of them, one operation a part.
--   'hidden': words that hide the sum, "How do you know?" after one right answer, and a quick one at the end.
--   Null writes no math for him.
-- attempts.move: which of the tutor's moves an answer was to, on a math part: the question, how (his answer to "How
--   did you get that?"), wording_1, step_1 to step_4, wording_2, or why (his answer to "How do you know?"). Null on
--   every other card.
-- attempts.label: the judge's label on what he said to "How did you get that?": a slip in the sum, the wrong sum,
--   a guess, or right thinking. Recorded for the parents; it does not choose the next move in this slice.
-- model_runs.kind gains 'label': one row per label, counts and money only (rule 7).

alter table skills
  add column key      text unique,
  add column position int,
  add column ladder   jsonb;

alter table mastery
  add column place text check (place in ('done', 'working'));

alter table children
  add column math_style text check (math_style in ('short', 'hidden'));

alter table attempts
  add column move  text check (move in ('question', 'how', 'wording_1', 'step_1', 'step_2', 'step_3', 'step_4', 'wording_2', 'why')),
  add column label text check (label in ('slip', 'wrong_sum', 'guess', 'right_thinking'));

alter table model_runs drop constraint model_runs_kind_check;
alter table model_runs add constraint model_runs_kind_check check (kind in ('week:build', 'content:fetch', 'gate', 'judge', 'label'));
