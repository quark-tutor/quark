-- Quark — phase 3: the plan as data (docs/04, decided 13 Oct 2026).
--
-- The long-term plan lives as YAML under plan/, one file per stretch, and npm run plan:import
-- loads it into plan_topics. Rows are matched by a stable text key, so the import can run again.
--
-- 1. key replaces (sequence, subject) as the uniqueness rule: the same subject now appears in
--    many weeks and in two grade bands.
-- 2. week orders themes within a stretch; sequence orders the stretches.
-- 3. What the YAML says about each topic: the wall slot it feeds, the sources to anchor it to,
--    the perspective and values points a week touches, and a note for parents.
--
-- Shape: one row per week per grade band (subject 'week', summary = why), and one row per topic
-- per grade band, its parent_id pointing at that band's week row.

alter table plan_topics
  add column key           text,
  add column week          int check (week > 0),
  add column slot          card_slot,
  add column sources       jsonb not null default '[]',  -- [{id, title, publisher, url, license, check?}]
  add column perspective   perspective,                   -- set when a week touches the values points
  add column values_points int[] not null default '{}',
  add column parent_note   text;                          -- a bedtime pick, a weekend experiment

update plan_topics set key = id::text where key is null;

alter table plan_topics
  alter column key set not null,
  add constraint plan_topics_key_key unique (key),
  drop constraint if exists plan_topics_sequence_subject_key;

create index on plan_topics (sequence, week);
