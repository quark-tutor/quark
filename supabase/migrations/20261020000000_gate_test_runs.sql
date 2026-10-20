-- Quark — phase 3, step 5: the rulebook's twenty-question test run, and the gate's own run
-- (docs/gate-slice.md, decisions 9, 11 and 12).
--
-- 1. gate_test_runs: one row per run of the twenty questions for one child, so every guardian sees
--    the same answers (rule 2: nothing hidden from the other guardian). Guardians read their
--    family's rows; only the server writes them, one answer at a time, so no result comes from a
--    browser. rulebook_hash is values_profiles.source_hash when the run started, so the page can say
--    when the rulebook has changed since. results, one entry per question as it is answered:
--      [{ "id": "q06", "kind": "subject", "subject": 9, "question": "...", "rule": "Subject 9, ...: Send them to us.",
--         "expected": "hand_off", "answer": "...", "handed_off": true, "declined": false, "ok": true, "cost": 0.021 }]
--    finished_at is set when all twenty are in. Who started a run is in audit_log (gate_test.run).
-- 2. model_runs.kind gains 'gate', for npm run gate on its own (week:build records the gate in its
--    own row).

create table gate_test_runs (
  id            uuid primary key default gen_random_uuid(),
  family_id     uuid not null references families(id) on delete cascade,
  child_id      uuid not null references children(id) on delete cascade,
  rulebook_hash text not null,
  floor_version int not null,
  results       jsonb not null default '[]',
  model         text,
  cost          numeric(10, 4) not null default 0,       -- dollars, summed as answers come in
  started_at    timestamptz not null default now(),
  finished_at   timestamptz
);

create index on gate_test_runs (family_id, child_id, started_at desc);

alter table gate_test_runs enable row level security;
create policy family_read on gate_test_runs for select using (family_id = current_family_id());

grant select on gate_test_runs to authenticated;
grant all on gate_test_runs to service_role;

alter table model_runs drop constraint model_runs_kind_check;
alter table model_runs add constraint model_runs_kind_check check (kind in ('week:build', 'content:fetch', 'gate'));
