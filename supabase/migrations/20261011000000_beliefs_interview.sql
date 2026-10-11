-- Quark — phase 2: the beliefs interview ("Our Family's Beliefs", gate/values-interview.md).
--
-- 1. Packs (traditions, to parents) carry what the chooser shows, and one entry per lean.
-- 2. The family's settings record which pack an answer came from, and "Not yet" ages per child.
-- 3. Each guardian answers alone. Their answers live in guardian_* tables until the compare step
--    writes the family's values_profiles, values_settings and child_point_ages.

-- ---------------------------------------------------------------------------
-- 1. Packs
-- ---------------------------------------------------------------------------

alter table values_packs
  add column short_name text,                      -- what parents see: 'Catholic'
  add column subtitle   text,                      -- an optional second line: 'Sunni'
  add column sort_order int not null default 0,
  add column label      text,                      -- 'Draft by outsiders. Awaiting review ...'
  add column summary    text,
  add column sources    jsonb not null default '[]'; -- [{id, title, publisher, url}]

-- One row per pack, point and lean. Lean 'unset' is the base entry. A row for another lean exists
-- only where the pack has a variant (points 9, 10, 14-19), already merged with the base.
alter table values_pack_entries
  add column lean        political_lean not null default 'unset',
  add column needs_check boolean not null default false;
alter table values_pack_entries drop constraint values_pack_entries_pkey;
alter table values_pack_entries add primary key (pack_id, point_number, lean);

-- ---------------------------------------------------------------------------
-- 2. Family settings
-- ---------------------------------------------------------------------------

-- The pack whose wording an answer took, if any. values_settings.from_age is superseded by
-- child_point_ages: "Not yet" takes an age for each child.
alter table values_settings add column from_pack uuid references values_packs(id);

create table child_point_ages (
  family_id     uuid not null references families(id) on delete cascade,
  child_id      uuid not null references children(id) on delete cascade,
  point_number  int not null references values_points(number),
  from_age      int not null check (from_age between 4 and 18),
  primary key (child_id, point_number)
);

alter table child_point_ages enable row level security;
create policy family_isolation on child_point_ages for all
  using (family_id = current_family_id())
  with check (
    family_id = current_family_id()
    and exists (select 1 from children c where c.id = child_id and c.family_id = current_family_id())
  );

-- ---------------------------------------------------------------------------
-- 3. Each guardian's own answers
-- ---------------------------------------------------------------------------

-- How an answer got there. Changing the political lean re-fills only 'quick_start' answers.
create type answer_origin as enum ('quick_start', 'tradition', 'own');

-- One per guardian: the quick-start tradition and lean, and the three "in your own words" answers.
create table guardian_values (
  guardian_id      uuid primary key references guardians(id) on delete cascade,
  family_id        uuid not null references families(id) on delete cascade,
  pack_id          uuid references values_packs(id),
  political_lean   political_lean not null default 'unset',
  want_understand  text,                           -- What do you most want your kids to understand about the world?
  want_believe     text,                           -- What do you believe that you want them to believe too?
  want_decide      text,                           -- What do you want them to decide for themselves?
  updated_at       timestamptz not null default now()
);

-- One guardian's answer on one point, the same shape as values_settings.
create table guardian_answers (
  guardian_id    uuid not null references guardians(id) on delete cascade,
  family_id      uuid not null references families(id) on delete cascade,
  point_number   int not null references values_points(number),
  when_setting   when_setting not null,
  perspective    perspective not null,             -- for 'from_age': how to answer once the child is ready
  note_to_tutor  text,                             -- "What would you actually say?"
  from_pack      uuid references values_packs(id),
  origin         answer_origin not null,
  updated_at     timestamptz not null default now(),
  primary key (guardian_id, point_number),
  check (when_setting <> 'never' or perspective = 'omitted')
);

-- "Not yet" ages, one per child, for answers with when_setting 'from_age'.
create table guardian_answer_ages (
  guardian_id   uuid not null,
  family_id     uuid not null references families(id) on delete cascade,
  point_number  int not null,
  child_id      uuid not null references children(id) on delete cascade,
  from_age      int not null check (from_age between 4 and 18),
  primary key (guardian_id, point_number, child_id),
  foreign key (guardian_id, point_number) references guardian_answers (guardian_id, point_number) on delete cascade
);

-- Every guardian in the family can read every answer (no answer is hidden from the other
-- guardian). Each guardian writes only their own.
alter table guardian_values enable row level security;
alter table guardian_answers enable row level security;
alter table guardian_answer_ages enable row level security;

create policy family_read on guardian_values for select using (family_id = current_family_id());
create policy family_read on guardian_answers for select using (family_id = current_family_id());
create policy family_read on guardian_answer_ages for select using (family_id = current_family_id());

create policy own_insert on guardian_values for insert
  with check (guardian_id = current_guardian_id() and family_id = current_family_id());
create policy own_update on guardian_values for update
  using (guardian_id = current_guardian_id())
  with check (guardian_id = current_guardian_id() and family_id = current_family_id());

create policy own_insert on guardian_answers for insert
  with check (guardian_id = current_guardian_id() and family_id = current_family_id());
create policy own_update on guardian_answers for update
  using (guardian_id = current_guardian_id())
  with check (guardian_id = current_guardian_id() and family_id = current_family_id());
create policy own_delete on guardian_answers for delete using (guardian_id = current_guardian_id());

create policy own_insert on guardian_answer_ages for insert
  with check (
    guardian_id = current_guardian_id() and family_id = current_family_id()
    and exists (select 1 from children c where c.id = child_id and c.family_id = current_family_id())
  );
create policy own_update on guardian_answer_ages for update
  using (guardian_id = current_guardian_id())
  with check (
    guardian_id = current_guardian_id() and family_id = current_family_id()
    and exists (select 1 from children c where c.id = child_id and c.family_id = current_family_id())
  );
create policy own_delete on guardian_answer_ages for delete using (guardian_id = current_guardian_id());

-- ---------------------------------------------------------------------------
-- Grants (see 20261010000002_data_api_grants.sql)
-- ---------------------------------------------------------------------------

revoke all on child_point_ages, guardian_values, guardian_answers, guardian_answer_ages from anon;
grant select, insert, update, delete on child_point_ages to authenticated;
grant select, insert, update on guardian_values to authenticated;
-- A guardian can clear an answer they haven't settled on; the change is still audit-logged.
grant select, insert, update, delete on guardian_answers, guardian_answer_ages to authenticated;
grant all on child_point_ages, guardian_values, guardian_answers, guardian_answer_ages to service_role;
