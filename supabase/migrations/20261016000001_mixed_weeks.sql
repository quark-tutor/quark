-- Quark — phase 3, step 2d: mixed weeks (docs/04, "How a week is mixed"; decided 16 Oct 2026).
--
-- A week is a mix: one slot a day carries the running thread (a stretch, Egypt for now), and the
-- other four carry short lessons from plan/short-lessons.yaml.
--
-- 1. plan_topics.kind: 'week' (a stretch's chapter row), 'thread' (a stretch topic) or 'short'
--    (a short lesson, keyed short/<key>/<band>, with no week and no parent).
-- 2. plan_topics.position: a thread topic's place in its stretch (day 1 of the thread is 1), or a
--    short lesson's place in the library. npm run plan:import fills it.
-- 3. themes.plan_week: the family's week number in the plan. A mixed week is found by it; it used
--    to be found by its one stretch week row, which a mixed week doesn't have.

alter table plan_topics
  add column kind     text check (kind in ('week', 'thread', 'short')),
  add column position int check (position > 0);

update plan_topics set kind = case when subject = 'week' then 'week' else 'thread' end;

alter table plan_topics alter column kind set not null;

create index on plan_topics (kind, position);

alter table themes
  add column plan_week int check (plan_week > 0);

-- Weeks already built were built from one stretch week: that week's number is the plan week.
update themes t
   set plan_week = p.week
  from plan_topics p
 where p.kind = 'week'
   and p.grade_band = '2-3'
   and p.id = any (t.topic_ids);

create unique index themes_family_plan_week on themes (family_id, plan_week);
