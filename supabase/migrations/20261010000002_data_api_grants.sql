-- Quark — explicit Data API grants.
--
-- The project is created with "Automatically expose new tables" off, so no table is reachable
-- through the API until it is granted here. Row-level security still decides which rows.
--   anon           nothing. The kid view and sign-in pages never query tables directly.
--   authenticated  a signed-in guardian: read and write their family's rows, read shared lists.
--                  No deletes; audit_log is append-only.
--   service_role   the server: everything (seed script, device lookups, later the weekly cron).
-- Tables added by later migrations grant their own access.

revoke all on all tables in schema public from anon;

-- Family-scoped tables, guarded by family_isolation and family_via_* policies.
grant select, insert, update on
  families, guardians, children, child_observations,
  values_profiles, values_settings, blackballs,
  themes, ideas, cards, questions,
  sessions, attempts, mastery, review_schedule,
  ask_log, digests, parent_notes,
  experiments, experiment_assignments
to authenticated;

grant select, insert on audit_log to authenticated;

-- Shared reference tables, guarded by read_all / read_approved policies.
grant select on
  values_points, values_packs, values_pack_entries,
  plan_topics, content_sources, content_items, skills
to authenticated;

grant all on all tables in schema public to service_role;

-- Policies call these as the signed-in user.
grant execute on function current_family_id() to authenticated, service_role;
grant execute on function current_guardian_id() to authenticated, service_role;
