-- Quark — phase 3: what each run spent on models (docs/04, "How the models and costs page is built").
--
-- One row per run of npm run week:build or npm run content:fetch, written by the script at the end,
-- including a run that stopped part way, since it still spent money. Counts and money only: no
-- prompts, no card text, nothing about a child (rule 7). `children` is how many were built for, not
-- which. `models` is one entry per job and model:
--   [{ "use": "curate", "model": "claude-opus-5-5", "calls": 5, "input": 41000, "output": 9000, "cost": 0.344 }]
-- with `cost` null when the model isn't in core/prices.ts. Costs are priced when the run ends, so a
-- later price change doesn't rewrite them.

create table model_runs (
  id            uuid primary key default gen_random_uuid(),
  family_id     uuid not null references families(id) on delete cascade,
  kind          text not null check (kind in ('week:build', 'content:fetch')),
  ok            boolean not null,                        -- false: the run stopped part way
  started_at    timestamptz not null,
  finished_at   timestamptz not null default now(),
  theme_id      uuid references themes(id) on delete set null,
  week          int check (week >= 1),
  days          int check (days between 1 and 7),
  children      int check (children >= 0),
  models        jsonb not null default '[]',
  cost          numeric(10, 4) not null default 0,       -- dollars, the models with a known price
  cost_complete boolean not null default true            -- false: some model had no known price
);

create index on model_runs (family_id, finished_at desc);

alter table model_runs enable row level security;
-- Any guardian of the family can read; only the scripts (service role) write.
create policy family_read on model_runs for select using (family_id = current_family_id());

grant select on model_runs to authenticated;
grant all on model_runs to service_role;
