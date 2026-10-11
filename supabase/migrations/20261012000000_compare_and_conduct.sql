-- Quark — phase 2: compare, conduct and the policy document (gate/values-interview.md, Parts 2b and 4).
--
-- 1. Packs and guardians carry how a child learns to act (packs/README.md, "Pack-level fields").
-- 2. Each guardian answers the four conduct questions; the family's merged answers live beside
--    values_settings.
-- 3. The family's values (values_profiles, values_settings, child_point_ages, conduct_settings)
--    are written only by the server, which merges every guardian's answers by fixed rules:
--    differences go parent-led, gentler conduct wins. No guardian can write them directly, so
--    neither can outvote the other (founding rule 2).
-- 4. Only the guardian who placed a blackball can lift it.
-- 5. claim_device_pairing: a note on why its lockout is global.

-- ---------------------------------------------------------------------------
-- 1. How a child learns to act
-- ---------------------------------------------------------------------------

create type learns_to_act as enum ('exemplars', 'consideration', 'practice', 'mixed');

alter table values_packs
  add column learns_to_act          learns_to_act,
  add column match_exemplars_to_sex boolean;

-- A guardian's own choice. Null means "as my quick-start tradition has it".
alter table guardian_values
  add column learns_to_act          learns_to_act,
  add column match_exemplars_to_sex boolean;

alter table values_profiles
  add column learns_to_act          learns_to_act,
  add column match_exemplars_to_sex boolean not null default false,
  add column policy_document        text,          -- the plain-English rulebook the gate reads
  add column saved_at               timestamptz,
  add column source_hash            text;          -- fingerprint of the merge, so an unchanged one isn't re-saved

-- ---------------------------------------------------------------------------
-- 2. Conduct (Part 2b)
-- ---------------------------------------------------------------------------

-- conduct.speak_first is per child (child_id set) with a value; its free-text line sits on the
-- child_id-null row. conduct.crude_line and conduct.praise_words are text only.
create table guardian_conduct (
  guardian_id  uuid not null references guardians(id) on delete cascade,
  family_id    uuid not null references families(id) on delete cascade,
  key          text not null check (key in ('conduct.speak_first', 'conduct.crude_line', 'conduct.rudeness',
                                            'conduct.praise', 'conduct.praise_words')),
  child_id     uuid references children(id) on delete cascade,
  value        text,
  note         text,
  updated_at   timestamptz not null default now(),
  unique nulls not distinct (guardian_id, key, child_id)
);

-- The family's merged conduct. A row exists once every guardian has answered; until then the
-- gentlest setting applies. disputed: the guardians differ and the gentler setting was taken.
create table conduct_settings (
  family_id    uuid not null references families(id) on delete cascade,
  key          text not null,
  child_id     uuid references children(id) on delete cascade,
  value        text,
  notes        text[] not null default '{}',
  disputed     boolean not null default false,
  updated_at   timestamptz not null default now(),
  unique nulls not distinct (family_id, key, child_id)
);

-- Guardians differ on this point: it is parent-led until they agree, and flagged in the digest.
alter table values_settings add column disputed boolean not null default false;

alter table guardian_conduct enable row level security;
alter table conduct_settings enable row level security;

create policy family_read on guardian_conduct for select using (family_id = current_family_id());
create policy own_insert on guardian_conduct for insert
  with check (
    guardian_id = current_guardian_id() and family_id = current_family_id()
    and (child_id is null or exists (select 1 from children c where c.id = child_id and c.family_id = current_family_id()))
  );
create policy own_update on guardian_conduct for update
  using (guardian_id = current_guardian_id())
  with check (
    guardian_id = current_guardian_id() and family_id = current_family_id()
    and (child_id is null or exists (select 1 from children c where c.id = child_id and c.family_id = current_family_id()))
  );
create policy own_delete on guardian_conduct for delete using (guardian_id = current_guardian_id());

create policy family_read on conduct_settings for select using (family_id = current_family_id());

-- ---------------------------------------------------------------------------
-- 3. Only the server writes the family's values
-- ---------------------------------------------------------------------------

revoke insert, update, delete on values_profiles, values_settings, child_point_ages from authenticated;
revoke all on guardian_conduct, conduct_settings from anon;
grant select, insert, update, delete on guardian_conduct to authenticated;
grant select on conduct_settings to authenticated;
grant all on guardian_conduct, conduct_settings to service_role;

-- Replace one family's merged values in one transaction. Called by the server (service role)
-- after any guardian changes an answer; the merge itself is lib/family-values.ts.
create or replace function replace_family_values(
  p_family   uuid,
  p_profile  jsonb,  -- {pack_id, political_lean, statement, learns_to_act, match_exemplars_to_sex, policy_document, source_hash}
  p_settings jsonb,  -- [{point_number, when_setting, perspective, note_to_tutor, from_pack, disputed}]
  p_ages     jsonb,  -- [{child_id, point_number, from_age}]
  p_conduct  jsonb   -- [{key, child_id, value, notes, disputed}]
) returns int
language plpgsql security invoker set search_path = public as $$
declare
  new_version int;
begin
  insert into values_profiles as v (family_id, pack_id, political_lean, statement, learns_to_act,
                                    match_exemplars_to_sex, policy_document, source_hash, saved_at, updated_at)
  values (p_family, (p_profile->>'pack_id')::uuid, (p_profile->>'political_lean')::political_lean,
          p_profile->>'statement', (p_profile->>'learns_to_act')::learns_to_act,
          coalesce((p_profile->>'match_exemplars_to_sex')::boolean, false), p_profile->>'policy_document',
          p_profile->>'source_hash', now(), now())
  on conflict (family_id) do update set
    pack_id = excluded.pack_id,
    political_lean = excluded.political_lean,
    statement = excluded.statement,
    learns_to_act = excluded.learns_to_act,
    match_exemplars_to_sex = excluded.match_exemplars_to_sex,
    policy_document = excluded.policy_document,
    source_hash = excluded.source_hash,
    saved_at = now(),
    updated_at = now(),
    version = v.version + 1
  returning version into new_version;

  delete from values_settings where family_id = p_family;
  insert into values_settings (family_id, point_number, when_setting, perspective, note_to_tutor, from_pack, disputed)
  select p_family, s.point_number, s.when_setting, s.perspective, s.note_to_tutor, s.from_pack, coalesce(s.disputed, false)
    from jsonb_to_recordset(p_settings) as s(point_number int, when_setting when_setting, perspective perspective,
                                              note_to_tutor text, from_pack uuid, disputed boolean);

  delete from child_point_ages where family_id = p_family;
  insert into child_point_ages (family_id, child_id, point_number, from_age)
  select p_family, a.child_id, a.point_number, a.from_age
    from jsonb_to_recordset(p_ages) as a(child_id uuid, point_number int, from_age int);

  delete from conduct_settings where family_id = p_family;
  insert into conduct_settings (family_id, key, child_id, value, notes, disputed)
  select p_family, c.key, c.child_id, c.value, coalesce(c.notes, '{}'), coalesce(c.disputed, false)
    from jsonb_to_recordset(p_conduct) as c(key text, child_id uuid, value text, notes text[], disputed boolean);

  return new_version;
end $$;

revoke execute on function replace_family_values(uuid, jsonb, jsonb, jsonb, jsonb) from public, anon, authenticated;
grant execute on function replace_family_values(uuid, jsonb, jsonb, jsonb, jsonb) to service_role;

-- ---------------------------------------------------------------------------
-- 4. Blackballs: any guardian places one, only that guardian lifts it
-- ---------------------------------------------------------------------------

drop policy family_isolation on blackballs;
create policy family_read on blackballs for select using (family_id = current_family_id());
create policy own_place on blackballs for insert
  with check (family_id = current_family_id() and placed_by = current_guardian_id() and lifted_at is null);
create policy own_lift on blackballs for update
  using (placed_by = current_guardian_id() and lifted_at is null)
  with check (placed_by = current_guardian_id() and family_id = current_family_id());
revoke update on blackballs from authenticated;
grant update (lifted_at) on blackballs to authenticated;

-- ---------------------------------------------------------------------------
-- 5. claim_device_pairing, unchanged apart from the note
-- ---------------------------------------------------------------------------

create or replace function claim_device_pairing(p_code_hash text, p_token_hash text)
returns table (device_id uuid, family_id uuid, child_id uuid)
language plpgsql security definer set search_path = public as $$
#variable_conflict use_column
declare
  p device_pairings%rowtype;
  new_device uuid;
begin
  select * into p from device_pairings
   where code_hash = p_code_hash
     and used_at is null
     and expires_at > now()
     and failed_attempts < 5
   order by created_at desc
   limit 1
   for update;

  if not found then
    -- The lockout is global: a wrong code counts against every open code in the database, not
    -- just one family's. That is deliberate while each deployment serves one family (docs/14).
    -- A shared deployment would need per-family or per-device counting, or one family's typos
    -- would lock out another's pairing.
    update device_pairings set failed_attempts = failed_attempts + 1
     where used_at is null and expires_at > now();
    return;
  end if;

  insert into devices (family_id, child_id, token_hash, last_seen)
  values (p.family_id, p.child_id, p_token_hash, now())
  returning id into new_device;

  update device_pairings set used_at = now(), device_id = new_device where id = p.id;

  insert into audit_log (family_id, guardian_id, action, target)
  values (p.family_id, p.created_by, 'device.pair',
          jsonb_build_object('device_id', new_device, 'child_id', p.child_id));

  return query select new_device, p.family_id, p.child_id;
end $$;
