-- Quark — family version one schema (Supabase / Postgres)
-- Draft 1, October 2026. Everything here is open for argument.
--
-- Shape of the system:
--   family -> guardians, children
--   values: 24 controversial points, a per-family setting for each, blackballs
--   plan: topics in sequence -> weekly themes -> ideas (shared, source-anchored) -> cards (per child, per lens)
--   activity: sessions -> attempts (with hint counts) -> mastery + review schedule
--   ask box, digests, parent steering notes, audit log, experiments
--
-- Conventions: uuid keys, timestamptz, snake_case, every family-scoped table has family_id for RLS.
--
-- This file is the readable model. What a Supabase project actually runs is supabase/migrations/,
-- which starts from this draft and adds changes in order (the RLS fix below, devices, ...).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Families and people
-- ---------------------------------------------------------------------------

create table families (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  timezone      text not null default 'Pacific/Honolulu',
  created_at    timestamptz not null default now()
);

-- One row per guardian. auth_user_id links to Supabase Auth.
-- "active" = actively configuring the tutor; only active guardians count for equal say.
create table guardians (
  id            uuid primary key default gen_random_uuid(),
  family_id     uuid not null references families(id) on delete cascade,
  auth_user_id  uuid unique,                       -- auth.users.id
  display_name  text not null,
  email         text,
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

create type reading_level as enum ('read_to', 'reads_alone', 'chapter_books');
create type stamina_level as enum ('gives_up_fast', 'in_between', 'keeps_trying');
create type input_pref    as enum ('talk', 'tap', 'either');
create type child_sex     as enum ('boy', 'girl');

-- The parent form. Deliberately holds no full name, photo, school or address.
create table children (
  id                 uuid primary key default gen_random_uuid(),
  family_id          uuid not null references families(id) on delete cascade,
  nickname           text not null,
  birth_month        date not null,                -- first of the month; age derived
  sex                child_sex,                    -- starting prior for the first week's lens; pronouns; later body topics
  reading            reading_level not null,
  stamina            stamina_level not null default 'in_between',
  input              input_pref not null default 'either',
  interests          text[] not null default '{}', -- three things they're into
  bored_by           text[] not null default '{}', -- two things to avoid as doors
  hidden_strength    text,                         -- one thing they're good at and may not know
  parent_wants       text,                         -- one thing the parent wants more of this year
  careful_about      text,                         -- a fear, a loss, a sensitive subject
  created_at         timestamptz not null default now()
);

-- What the tutor learns about a child over time. Append-only; the latest row per kind/key wins.
-- kind examples: 'interest', 'lens_affinity', 'session_length', 'rush_rate', 'hint_rate'
create table child_observations (
  id            uuid primary key default gen_random_uuid(),
  family_id     uuid not null references families(id) on delete cascade,
  child_id      uuid not null references children(id) on delete cascade,
  kind          text not null,
  key           text not null,                     -- e.g. 'sharks', 'lens:build'
  value         numeric not null,                  -- strength, 0..1 or a count
  evidence      jsonb,                             -- what produced it (card ids, counts)
  observed_at   timestamptz not null default now()
);
create index on child_observations (child_id, kind, key, observed_at desc);

-- ---------------------------------------------------------------------------
-- Values: the 24 points, family settings, packs, blackballs
-- ---------------------------------------------------------------------------

-- Reference list. Seeded from packs/README.md. Shared across all families.
create table values_points (
  number        int primary key,                   -- 1..24
  area          text not null,                     -- 'Religion and faith', 'Origins', ...
  name          text not null,
  kid_question  text not null
);

create type when_setting  as enum ('anytime', 'from_age', 'parent_led', 'never');
create type perspective   as enum ('family_tradition', 'several_fairly', 'omitted');
create type pack_status   as enum ('draft_by_outsiders', 'community_reviewed');

-- Community packs. Mirrors packs/*.yaml in the repo; this table is a cache for the app.
create table values_packs (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,              -- 'catholic', 'nothing-in-particular'
  name          text not null,
  status        pack_status not null default 'draft_by_outsiders',
  source_url    text,
  version       int not null default 1
);

create table values_pack_entries (
  pack_id       uuid not null references values_packs(id) on delete cascade,
  point_number  int not null references values_points(number),
  when_setting  when_setting not null,
  from_age      int,                               -- only when when_setting = 'from_age'
  perspective   perspective not null,
  position      text not null,                     -- official teaching, plain words, cited
  source        text,
  split         text,                              -- named camps if the community is divided
  handoff       text,                              -- what the child hears
  parent_note   text,                              -- talking points for the digest
  primary key (pack_id, point_number)
);

create type political_lean as enum ('progressive', 'moderate', 'conservative', 'unset');

-- One per family. The pack is the starting point; settings below override per point.
create table values_profiles (
  family_id       uuid primary key references families(id) on delete cascade,
  pack_id         uuid references values_packs(id),
  statement       text,                            -- a few sentences in the parents' own words
  political_lean  political_lean not null default 'unset',
  version         int not null default 1,
  updated_at      timestamptz not null default now()
);

-- The family's answer for each point. Every guardian can see every row.
create table values_settings (
  family_id     uuid not null references families(id) on delete cascade,
  point_number  int not null references values_points(number),
  when_setting  when_setting not null,
  from_age      int,
  perspective   perspective not null,
  note_to_tutor text,                              -- 'Present the scientific view, then our faith's view.'
  updated_by    uuid references guardians(id),
  updated_at    timestamptz not null default now(),
  primary key (family_id, point_number)
);

-- The beliefs interview adds, in supabase/migrations/20261011000000_beliefs_interview.sql:
--   each guardian's own answers until the two compare (guardian_values, guardian_answers,
--   guardian_answer_ages); "Not yet" ages per child (child_point_ages, superseding
--   values_settings.from_age); values_settings.from_pack; and one values_pack_entries row per lean.
-- Compare and conduct add, in supabase/migrations/20261012000000_compare_and_conduct.sql:
--   conduct answers (guardian_conduct, conduct_settings); values_settings.disputed; how a child
--   learns to act on packs, guardians and the profile; values_profiles.policy_document; family
--   values writable only by the server (replace_family_values); blackballs lifted only by their placer.

-- Any one guardian can place one. Only that guardian can lift it. Lifted rows stay for the audit.
create table blackballs (
  id            uuid primary key default gen_random_uuid(),
  family_id     uuid not null references families(id) on delete cascade,
  point_number  int references values_points(number),
  topic         text,                              -- free text when it isn't one of the 24
  placed_by     uuid not null references guardians(id),
  placed_at     timestamptz not null default now(),
  lifted_at     timestamptz,
  check (point_number is not null or topic is not null)
);
create index on blackballs (family_id) where lifted_at is null;

-- ---------------------------------------------------------------------------
-- The learning plan and weekly themes
-- ---------------------------------------------------------------------------

-- The multi-year plan as data. Typed in from the Core Knowledge topic order (topics, not text).
create table plan_topics (
  id            uuid primary key default gen_random_uuid(),
  sequence      int not null,                      -- order in the plan
  grade_band    text not null,                     -- 'K-1', '2-3', '4-5'
  subject       text not null,                     -- history, science, art, music, literature, math, geography
  title         text not null,
  summary       text,
  parent_id     uuid references plan_topics(id),   -- for sub-topics
  unique (sequence, subject)
);

create type theme_status as enum ('planned', 'generating', 'review', 'live', 'done');

-- One theme per family per week. Ties several topics together ("Ancient Egypt").
create table themes (
  id            uuid primary key default gen_random_uuid(),
  family_id     uuid not null references families(id) on delete cascade,
  week_start    date not null,
  title         text not null,
  topic_ids     uuid[] not null default '{}',
  status        theme_status not null default 'planned',
  method        text,                              -- experiment variant, e.g. 'story_first', 'puzzle_first'
  generated_at  timestamptz,
  unique (family_id, week_start)
);

-- ---------------------------------------------------------------------------
-- Content sources and the allowlist
-- ---------------------------------------------------------------------------

create table content_sources (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,              -- 'met', 'aic', 'gutendex', 'librivox', 'nasa', 'phet'
  name          text not null,
  license_note  text not null,                     -- what may be bundled, what must be filtered
  base_url      text
);

create type content_type as enum ('image', 'audio', 'text', 'simulation', 'map', 'video');

-- Every outside item the tutor may show. Nothing reaches a child unless approved.
create table content_items (
  id            uuid primary key default gen_random_uuid(),
  source_id     uuid not null references content_sources(id),
  external_id   text not null,
  type          content_type not null,
  title         text,
  creator       text,
  url           text not null,
  thumbnail_url text,
  license       text not null,                     -- 'CC0', 'public domain', 'CC BY 4.0', ...
  attribution   text,
  approved      boolean not null default false,    -- the hand-curated allowlist
  approved_by   uuid references guardians(id),
  flags         text[] not null default '{}',      -- 'nudity', 'violence', 'needs_review'
  metadata      jsonb,
  unique (source_id, external_id)
);
create index on content_items (approved) where approved;

-- ---------------------------------------------------------------------------
-- Cards: what a child sees
-- ---------------------------------------------------------------------------

create type card_slot     as enum ('look', 'wonder', 'listen', 'then', 'puzzle', 'ask', 'check');
create type card_lens     as enum ('build', 'story', 'compete', 'collect', 'explore', 'care', 'humor');
create type policy_status as enum ('pending', 'passed', 'rewritten', 'blocked');

-- Skills the plan tracks, for the learner model. Coarse at first ("find the Nile on a map").
create table skills (
  id            uuid primary key default gen_random_uuid(),
  topic_id      uuid references plan_topics(id),
  name          text not null,
  kind          text not null default 'knowledge'  -- 'knowledge', 'skill', 'concept'
);

-- An idea is the shared unit: one fact or concept, anchored to a source, with its picture,
-- question and answer key. Generated once per theme, reused across children and years.
create table ideas (
  id              uuid primary key default gen_random_uuid(),
  theme_id        uuid not null references themes(id) on delete cascade,
  topic_id        uuid references plan_topics(id),
  slot            card_slot not null,
  layer           int not null default 1 check (layer between 1 and 4),
  parent_idea_id  uuid references ideas(id),       -- the idea this one deepens
  title           text not null,
  statement       text not null,                   -- the fact or concept, in plain words, for the tutor
  content_item_id uuid references content_items(id),
  source_refs     text[] not null default '{}',    -- what the statement is anchored to
  question        text,
  answer_key      jsonb,
  skill_id        uuid references skills(id),
  created_at      timestamptz not null default now()
);
create index on ideas (theme_id, slot, layer);

-- One card = one screen = one child's rendering of an idea, at that child's level, through a lens.
-- Cheap to make; the careful work was done on the idea. The policy gate runs here.
create table cards (
  id              uuid primary key default gen_random_uuid(),
  family_id       uuid not null references families(id) on delete cascade,
  theme_id        uuid not null references themes(id) on delete cascade,
  idea_id         uuid not null references ideas(id) on delete cascade,
  child_id        uuid not null references children(id) on delete cascade,
  day             date not null,
  slot            card_slot not null,
  lens            card_lens,
  layer           int not null default 1 check (layer between 1 and 4),
  parent_card_id  uuid references cards(id),       -- the card this one deepens
  body            jsonb not null,                  -- {title, text, image_alt, read_aloud, question, hints[], handoff}
  level           text,                            -- reading level it was written for
  policy          policy_status not null default 'pending',
  policy_notes    jsonb,                           -- which rule changed what; shown in the digest
  created_at      timestamptz not null default now()
);
create index on cards (child_id, day, slot, layer);
create index on cards (idea_id);

-- A question as rendered on a card (teach or check). The answer key lives on the idea;
-- the per-child wording and hints live here. Never shown to the child.
create table questions (
  id            uuid primary key default gen_random_uuid(),
  card_id       uuid not null references cards(id) on delete cascade,
  idea_id       uuid not null references ideas(id) on delete cascade,
  skill_id      uuid references skills(id),
  prompt        text not null,
  answer_key    jsonb not null,                    -- acceptable answers, rubric, or choice index
  hints         text[] not null default '{}',      -- ordered; the last one never gives the answer
  difficulty    numeric                            -- tutor's estimate, 0..1
);

-- ---------------------------------------------------------------------------
-- Activity: sessions, attempts, mastery, review schedule
-- ---------------------------------------------------------------------------

create type session_end as enum ('child_left', 'time_limit', 'rushing', 'parent', 'error');

create table sessions (
  id            uuid primary key default gen_random_uuid(),
  family_id     uuid not null references families(id) on delete cascade,
  child_id      uuid not null references children(id) on delete cascade,
  started_at    timestamptz not null default now(),
  ended_at      timestamptz,
  ended_reason  session_end,
  device        text,                              -- 'ipad-1', 'wall'
  engaged_sec   int                                -- seconds of real engagement, not wall-clock
);

create type attempt_mode as enum ('teach', 'check');

-- The richest signal in the system. One row per answer.
create table attempts (
  id            uuid primary key default gen_random_uuid(),
  family_id     uuid not null references families(id) on delete cascade,
  session_id    uuid not null references sessions(id) on delete cascade,
  child_id      uuid not null references children(id) on delete cascade,
  question_id   uuid not null references questions(id),
  mode          attempt_mode not null,             -- teach: hints allowed; check: no hints, delayed
  answer        text,
  correct       boolean,
  hints_used    int not null default 0,            -- the difficulty dial
  seconds       int,                               -- time to answer
  rushed        boolean not null default false,    -- faster than anyone could read
  input         input_pref,                        -- how they answered this one
  created_at    timestamptz not null default now()
);
create index on attempts (child_id, created_at desc);
create index on attempts (question_id, mode);

-- Knowledge tracing state (pyBKT). One row per child per skill.
create table mastery (
  child_id      uuid not null references children(id) on delete cascade,
  skill_id      uuid not null references skills(id) on delete cascade,
  p_known       numeric not null default 0.1,      -- probability the skill is known
  attempts      int not null default 0,
  updated_at    timestamptz not null default now(),
  primary key (child_id, skill_id)
);

-- Spaced review state (py-fsrs). One row per child per thing worth remembering.
create table review_schedule (
  child_id      uuid not null references children(id) on delete cascade,
  question_id   uuid not null references questions(id) on delete cascade,
  due_at        timestamptz not null,
  stability     numeric not null default 0,        -- FSRS fields
  difficulty    numeric not null default 0,
  reps          int not null default 0,
  lapses        int not null default 0,
  last_review   timestamptz,
  primary key (child_id, question_id)
);
create index on review_schedule (child_id, due_at);

-- ---------------------------------------------------------------------------
-- The Ask box
-- ---------------------------------------------------------------------------

create table ask_log (
  id              uuid primary key default gen_random_uuid(),
  family_id       uuid not null references families(id) on delete cascade,
  child_id        uuid not null references children(id) on delete cascade,
  session_id      uuid references sessions(id),
  question        text not null,
  answer          text,                            -- what the child was told, or null if handed off
  handed_off      boolean not null default false,  -- 'ask Mom or Dad'
  point_number    int references values_points(number), -- which point it touched, if any
  blackball_id    uuid references blackballs(id),  -- which blackball it hit, if any
  created_at      timestamptz not null default now()
);
create index on ask_log (family_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Parents: digests, steering, audit
-- ---------------------------------------------------------------------------

create table digests (
  id            uuid primary key default gen_random_uuid(),
  family_id     uuid not null references families(id) on delete cascade,
  week_start    date not null,
  body          jsonb not null,                    -- per child: explored, asked, retained, lenses, policy changes; next week; 3 dinner questions
  sent_at       timestamptz,
  unique (family_id, week_start)
);

-- A guardian's reply to steer next week ("the 9-year-old is into sharks, go deeper").
create table parent_notes (
  id            uuid primary key default gen_random_uuid(),
  family_id     uuid not null references families(id) on delete cascade,
  guardian_id   uuid not null references guardians(id),
  child_id      uuid references children(id),
  note          text not null,
  applied_to    uuid references themes(id),
  created_at    timestamptz not null default now()
);

-- Every change a guardian makes to values, blackballs, settings. Visible to all guardians.
create table audit_log (
  id            uuid primary key default gen_random_uuid(),
  family_id     uuid not null references families(id) on delete cascade,
  guardian_id   uuid references guardians(id),
  action        text not null,                     -- 'blackball.place', 'values_setting.update', ...
  target        jsonb,
  created_at    timestamptz not null default now()
);
create index on audit_log (family_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Teaching that tests itself: experiments
-- ---------------------------------------------------------------------------

-- Which method a child got for a theme, so retention can be compared across methods.
create table experiments (
  id            uuid primary key default gen_random_uuid(),
  family_id     uuid not null references families(id) on delete cascade,
  name          text not null,                     -- 'story_first_vs_puzzle_first'
  variants      text[] not null,
  started_at    timestamptz not null default now()
);

create table experiment_assignments (
  family_id     uuid not null references families(id) on delete cascade,
  experiment_id uuid not null references experiments(id) on delete cascade,
  theme_id      uuid not null references themes(id) on delete cascade,
  child_id      uuid not null references children(id) on delete cascade,
  variant       text not null,
  primary key (experiment_id, theme_id, child_id)
);

-- ---------------------------------------------------------------------------
-- Row-level security: a guardian sees only their own family
-- ---------------------------------------------------------------------------

-- security definer: the guardians policy calls this function, so it must skip RLS for this lookup.
create or replace function current_family_id() returns uuid
language sql stable security definer set search_path = public as $$
  select family_id from guardians where auth_user_id = auth.uid() limit 1
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'families','guardians','children','child_observations','values_profiles','values_settings',
    'blackballs','themes','cards','sessions','attempts','ask_log','digests','parent_notes',
    'audit_log','experiments','experiment_assignments'
  ] loop
    execute format('alter table %I enable row level security', t);
    if t = 'families' then
      execute 'create policy family_isolation on families for all using (id = current_family_id())';
    else
      execute format('create policy family_isolation on %I for all using (family_id = current_family_id())', t);
    end if;
  end loop;
end $$;

-- Shared reference tables are readable by any signed-in user, written only by the service role.
alter table values_points enable row level security;
alter table values_packs enable row level security;
alter table values_pack_entries enable row level security;
alter table plan_topics enable row level security;
alter table content_sources enable row level security;
alter table content_items enable row level security;
alter table skills enable row level security;
alter table questions enable row level security;
alter table mastery enable row level security;
alter table review_schedule enable row level security;
create policy read_all on values_points for select using (auth.role() = 'authenticated');
create policy read_all on values_packs for select using (auth.role() = 'authenticated');
create policy read_all on values_pack_entries for select using (auth.role() = 'authenticated');
create policy read_all on plan_topics for select using (auth.role() = 'authenticated');
create policy read_all on content_sources for select using (auth.role() = 'authenticated');
create policy read_approved on content_items for select using (approved and auth.role() = 'authenticated');
create policy read_all on skills for select using (auth.role() = 'authenticated');
-- ideas are reached through the theme's family:
alter table ideas enable row level security;
create policy family_via_theme on ideas for all
  using (exists (select 1 from themes t where t.id = theme_id and t.family_id = current_family_id()));
-- questions, mastery, review_schedule are reached through the child's family:
create policy family_via_child on questions for all
  using (exists (select 1 from cards c where c.id = card_id and c.family_id = current_family_id()));
create policy family_via_child on mastery for all
  using (exists (select 1 from children ch where ch.id = child_id and ch.family_id = current_family_id()));
create policy family_via_child on review_schedule for all
  using (exists (select 1 from children ch where ch.id = child_id and ch.family_id = current_family_id()));

-- The kid-facing app holds no Supabase key. A paired iPad sends a device cookie to the app's own
-- server routes, which check it against the devices table and read or write only for that child.
-- See supabase/migrations/20261010000001_family_lookup_and_devices.sql.

-- ---------------------------------------------------------------------------
-- Seed: the 24 controversial points
-- ---------------------------------------------------------------------------

insert into values_points (number, area, name, kid_question) values
 (1,'Religion and faith','Is there a God, and whose?','"Is God real?" "Why does my friend go to a different church?"'),
 (2,'Religion and faith','Scripture: history, story or both?','"Did Noah''s flood really happen?"'),
 (3,'Religion and faith','Prayer, miracles and the supernatural','"Does praying work?" "Are ghosts real?"'),
 (4,'Religion and faith','Other religions: equally true, partly true, or mistaken?','"Are Muslims going to heaven?"'),
 (5,'Origins','Age of the Earth and universe','"How old is the Earth?"'),
 (6,'Origins','Evolution, including of humans','"Did people come from monkeys?"'),
 (7,'Origins','Do science and faith conflict?','"Can you believe in God and dinosaurs?"'),
 (8,'Sexuality, gender and family','Where babies come from','"How did the baby get in her tummy?"'),
 (9,'Sexuality, gender and family','Same-sex couples and families','"Why does Sam have two dads?"'),
 (10,'Sexuality, gender and family','Gender identity and transition','"Can a boy become a girl?"'),
 (11,'Sexuality, gender and family','Marriage, divorce and what a family is','"Why don''t some kids live with both parents?"'),
 (12,'Death','What happens after we die','"Where did Grandpa go?"'),
 (13,'Death','How to talk about a death in the family or a pet','"Is it my fault the dog died?"'),
 (14,'Politics and current events','Government, voting and parties','"Are Democrats bad?" "Who''s the good guy?"'),
 (15,'Politics and current events','Current wars, elections and news','"Are we going to have a war?"'),
 (16,'Politics and current events','Wealth, poverty and fairness','"Why are some people homeless?"'),
 (17,'How history is framed','Explorers and colonization','"Was Columbus a hero?"'),
 (18,'How history is framed','Slavery, the founders and national heroes','"Did George Washington own slaves?"'),
 (19,'How history is framed','Religious wars and persecution','"Why did people fight about God?"'),
 (20,'Violence and war','How much to show, and when','"What happened in the Holocaust?" "Can I see the battle?"'),
 (21,'Habits and the body','Alcohol, drugs, tobacco and caffeine','"Why can''t I have a sip of beer?" "What''s a drug?"'),
 (22,'Habits and the body','Body image, modesty and dress','"Am I fat?" "Why can''t I wear that?"'),
 (23,'Habits and the body','Technology, screens and games','"Why can''t I have YouTube?" "Why do you get a phone and I don''t?"'),
 (24,'Habits and the body','Money, work and generosity','"Are we rich?" "Why do we give money away?"');
