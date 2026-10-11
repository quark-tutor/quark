-- Quark — migration 1 on top of the initial schema.
--
-- 1. Fix: current_family_id() reads guardians, and the guardians policy calls current_family_id().
--    As a plain function that recursed through row-level security ("infinite recursion detected
--    in policy"). security definer runs the one lookup as the table owner, skipping RLS for it.
-- 2. Devices: an iPad paired to one child. The kid view never holds a Supabase key; it sends a
--    device cookie to our own server routes, which look up the token's hash here.
-- 3. Device pairings: short-lived six-digit codes a guardian makes on /parent and types on the iPad.

-- ---------------------------------------------------------------------------
-- 1. Family lookup without recursion
-- ---------------------------------------------------------------------------

create or replace function current_family_id() returns uuid
language sql stable security definer set search_path = public as $$
  select family_id from guardians where auth_user_id = auth.uid() limit 1
$$;

-- The guardian row for the signed-in user, used by policies below.
create or replace function current_guardian_id() returns uuid
language sql stable security definer set search_path = public as $$
  select id from guardians where auth_user_id = auth.uid() limit 1
$$;

-- ---------------------------------------------------------------------------
-- 2. Devices
-- ---------------------------------------------------------------------------

-- One row per paired iPad. The token itself lives only in the iPad's cookie; we keep its SHA-256.
-- "Forget this iPad" sets revoked_at; the row stays for the audit.
create table devices (
  id            uuid primary key default gen_random_uuid(),
  family_id     uuid not null references families(id) on delete cascade,
  child_id      uuid not null references children(id) on delete cascade,
  token_hash    text not null unique,
  created_at    timestamptz not null default now(),
  last_seen     timestamptz,
  revoked_at    timestamptz
);
create index on devices (family_id) where revoked_at is null;

-- ---------------------------------------------------------------------------
-- 3. Device pairings
-- ---------------------------------------------------------------------------

-- A code is good for ten minutes and one use. Every wrong code typed on any iPad counts against
-- every open code, and five strikes closes them, so guessing a six-digit code is not practical.
create table device_pairings (
  id               uuid primary key default gen_random_uuid(),
  family_id        uuid not null references families(id) on delete cascade,
  child_id         uuid not null references children(id) on delete cascade,
  code_hash        text not null,
  created_by       uuid not null references guardians(id),
  created_at       timestamptz not null default now(),
  expires_at       timestamptz not null default now() + interval '10 minutes',
  failed_attempts  int not null default 0,
  used_at          timestamptz,
  device_id        uuid references devices(id)
);
create index on device_pairings (code_hash) where used_at is null;

-- Called only by the server (service role) when an iPad submits a code.
-- Returns the new device, or no rows if the code is wrong, used, expired or locked out.
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

-- ---------------------------------------------------------------------------
-- Access
-- ---------------------------------------------------------------------------

-- Guardians see and forget their family's iPads, and make codes for their own children.
-- Only the server creates devices, through claim_device_pairing.
alter table devices enable row level security;
alter table device_pairings enable row level security;

create policy family_read on devices for select using (family_id = current_family_id());
create policy family_forget on devices for update
  using (family_id = current_family_id())
  with check (family_id = current_family_id());

create policy family_read on device_pairings for select using (family_id = current_family_id());
create policy family_create on device_pairings for insert
  with check (
    family_id = current_family_id()
    and created_by = current_guardian_id()
    and exists (select 1 from children c where c.id = child_id and c.family_id = current_family_id())
  );

revoke all on devices, device_pairings from anon;
grant select, update (revoked_at) on devices to authenticated;
grant select, insert on device_pairings to authenticated;
grant all on devices, device_pairings to service_role;

revoke execute on function claim_device_pairing(text, text) from public, anon, authenticated;
grant execute on function claim_device_pairing(text, text) to service_role;
