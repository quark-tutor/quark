-- The app writes its own short lessons (docs/week-without-hands-slice.md; reviewed at its stop 1, 23 Nov 2026).
-- model_runs.kind gains 'lessons': one row per firing of the app's lesson writer (core/curation/lessons.ts), counts and
-- money only (rule 7), so /parent/models counts what the writing spends beside the week's build.

alter table model_runs drop constraint model_runs_kind_check;
alter table model_runs add constraint model_runs_kind_check
  check (kind in ('week:build', 'content:fetch', 'gate', 'judge', 'label', 'lessons'));
