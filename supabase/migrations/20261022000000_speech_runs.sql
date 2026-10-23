-- What the tutor's voice and ears spend (docs/tutor-voice-slice.md): one row each time Google is called, a
-- line said for the first time or a clip heard. A stored line played again writes nothing. Counts and money
-- only: no child, no device, no words (rule 7). /parent/models reads it.

create table speech_runs (
  id          uuid primary key default gen_random_uuid(),
  family_id   uuid not null references families(id) on delete cascade,
  kind        text not null check (kind in ('say', 'hear')),
  model       text not null,                                       -- the voice, or the recognizer's model
  characters  int not null default 0 check (characters >= 0),     -- say: what was sent
  seconds     numeric(8, 2) not null default 0 check (seconds >= 0),  -- hear: the clip's length
  cost        numeric(10, 6) not null default 0,                   -- dollars at list price, before the free tier
  created_at  timestamptz not null default now()
);

create index on speech_runs (family_id, created_at desc);

alter table speech_runs enable row level security;
-- Any guardian of the family can read; only the server (service role) writes.
create policy family_read on speech_runs for select using (family_id = current_family_id());

grant select on speech_runs to authenticated;
grant all on speech_runs to service_role;
