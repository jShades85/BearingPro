-- ─── Permission Tier Enum ────────────────────────────────────────────────────
create type permission_tier as enum (
  'owner',      -- everything + billing + tenant deletion
  'admin',      -- everything except billing/tenant deletion
  'office',     -- CRM, sales, scheduling, finance, reports — no settings
  'field',      -- own jobs, own truck inventory, time tracking only
  'warehouse',  -- inventory module only
  'readonly'    -- view-only
);

-- ─── Roles ───────────────────────────────────────────────────────────────────
-- Tenant-customizable roles. Each maps to a fixed permission tier.
-- Companies can rename defaults, add new roles under any tier, delete unused ones.
create table roles (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  name        text not null,
  tier        permission_tier not null,
  color       text not null default '#6366f1',
  is_default  boolean not null default false,
  created_at  timestamptz not null default now(),
  unique (tenant_id, name)
);

create index roles_tenant_id_idx on roles (tenant_id);
create index roles_tenant_tier_idx on roles (tenant_id, tier);

alter table roles enable row level security;

create policy "roles_select" on roles
  for select using (tenant_id = current_tenant_id());

create policy "roles_insert" on roles
  for insert with check (tenant_id = current_tenant_id());

create policy "roles_update" on roles
  for update using (tenant_id = current_tenant_id());

create policy "roles_delete" on roles
  for delete using (tenant_id = current_tenant_id());

-- ─── Vehicles ────────────────────────────────────────────────────────────────
create table vehicles (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references tenants(id) on delete cascade,
  name          text not null,
  make          text,
  model         text,
  year          smallint,
  license_plate text,
  color         text,
  created_at    timestamptz not null default now()
);

create index vehicles_tenant_id_idx on vehicles (tenant_id);

alter table vehicles enable row level security;

create policy "vehicles_select" on vehicles
  for select using (tenant_id = current_tenant_id());

create policy "vehicles_insert" on vehicles
  for insert with check (tenant_id = current_tenant_id());

create policy "vehicles_update" on vehicles
  for update using (tenant_id = current_tenant_id());

create policy "vehicles_delete" on vehicles
  for delete using (tenant_id = current_tenant_id());

-- ─── Inventory Locations ─────────────────────────────────────────────────────
create type location_type as enum ('warehouse', 'vehicle', 'other');

create table inventory_locations (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  name        text not null,
  type        location_type not null default 'warehouse',
  vehicle_id  uuid references vehicles(id) on delete set null,
  created_at  timestamptz not null default now()
);

create index inventory_locations_tenant_id_idx on inventory_locations (tenant_id);
create index inventory_locations_vehicle_id_idx on inventory_locations (vehicle_id);

alter table inventory_locations enable row level security;

create policy "locations_select" on inventory_locations
  for select using (tenant_id = current_tenant_id());

create policy "locations_insert" on inventory_locations
  for insert with check (tenant_id = current_tenant_id());

create policy "locations_update" on inventory_locations
  for update using (tenant_id = current_tenant_id());

create policy "locations_delete" on inventory_locations
  for delete using (tenant_id = current_tenant_id());

-- ─── Alter user_profiles ─────────────────────────────────────────────────────
alter table user_profiles
  add column role_id    uuid references roles(id) on delete set null,
  add column vehicle_id uuid references vehicles(id) on delete set null;

-- Drop the old freeform role text column — replaced by role_id
alter table user_profiles drop column role;

create index user_profiles_role_id_idx on user_profiles (role_id);

-- ─── Seed default roles ───────────────────────────────────────────────────────
create or replace function seed_default_roles(p_tenant_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into roles (tenant_id, name, tier, color, is_default) values
    (p_tenant_id, 'Owner',           'owner',     '#8b5cf6', true),
    (p_tenant_id, 'Admin',           'admin',     '#6366f1', true),
    (p_tenant_id, 'Office Manager',  'office',    '#0ea5e9', true),
    (p_tenant_id, 'Technician',      'field',     '#10b981', true),
    (p_tenant_id, 'Warehouse Staff', 'warehouse', '#f59e0b', true),
    (p_tenant_id, 'View Only',       'readonly',  '#94a3b8', true);
end;
$$;

-- Seed roles for any existing tenants and assign owner role to existing users
do $$
declare
  t record;
begin
  for t in select id from tenants loop
    perform seed_default_roles(t.id);
  end loop;
end;
$$;

update user_profiles up
  set role_id = (
    select r.id from roles r
    where r.tenant_id = up.tenant_id and r.tier = 'owner'
    limit 1
  );

-- ─── Update handle_new_user trigger ──────────────────────────────────────────
-- New signup: create tenant → seed default roles → assign Owner role.
-- Invited user: look up role by name in metadata, fallback to Admin tier.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_tenant_id    uuid;
  assigned_role_id uuid;
begin
  if (new.raw_user_meta_data->>'tenant_id') is not null then
    -- Invited user — join existing tenant
    new_tenant_id := (new.raw_user_meta_data->>'tenant_id')::uuid;

    -- Look up role by name passed in metadata
    select id into assigned_role_id
      from roles
      where tenant_id = new_tenant_id
        and name = coalesce(new.raw_user_meta_data->>'role_name', 'Technician')
      limit 1;

    -- Fallback to any admin-tier role if name not found
    if assigned_role_id is null then
      select id into assigned_role_id
        from roles
        where tenant_id = new_tenant_id and tier = 'admin'
        limit 1;
    end if;
  else
    -- New signup — create tenant
    insert into public.tenants (name)
      values (coalesce(new.raw_user_meta_data->>'company_name', 'My Company'))
      returning id into new_tenant_id;

    -- Seed default roles for the new tenant
    perform seed_default_roles(new_tenant_id);

    -- Assign Owner role to the first user
    select id into assigned_role_id
      from roles
      where tenant_id = new_tenant_id and tier = 'owner'
      limit 1;
  end if;

  insert into public.user_profiles (id, tenant_id, full_name, role_id)
  values (
    new.id,
    new_tenant_id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    assigned_role_id
  );

  return new;
end;
$$;
