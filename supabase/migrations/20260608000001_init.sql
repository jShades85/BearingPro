-- ─── Tenants ────────────────────────────────────────────────────────────────────
create table tenants (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  tagline         text,
  trade_type      text,
  timezone        text not null default 'America/Chicago',
  phone           text,
  email           text,
  website         text,
  address         text,
  city            text,
  state           text,
  zip             text,
  logo_url        text,
  default_tax_rate        numeric(5,4) default 0.0825,
  default_payment_terms   text default 'Net 30',
  created_at      timestamptz not null default now()
);

alter table tenants enable row level security;

-- ─── User Profiles ──────────────────────────────────────────────────────────────
-- Extends Supabase auth.users — one profile per auth user, scoped to a tenant.
create table user_profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  tenant_id   uuid not null references tenants(id) on delete cascade,
  full_name   text,
  role        text not null default 'member', -- 'admin' | 'member' | 'field_tech'
  created_at  timestamptz not null default now()
);

alter table user_profiles enable row level security;

-- ─── RLS helpers ────────────────────────────────────────────────────────────────
-- Returns the tenant_id for the currently authenticated user.
create or replace function current_tenant_id()
returns uuid
language sql
stable
security definer
as $$
  select tenant_id from user_profiles where id = auth.uid();
$$;

-- ─── Tenant RLS policies ────────────────────────────────────────────────────────
-- Tenants: users can only read/update their own tenant row.
create policy "tenant_select" on tenants
  for select using (id = current_tenant_id());

create policy "tenant_update" on tenants
  for update using (id = current_tenant_id());

-- User profiles: users can read all profiles in their tenant, update only their own.
create policy "profiles_select" on user_profiles
  for select using (tenant_id = current_tenant_id());

create policy "profiles_update" on user_profiles
  for update using (id = auth.uid());
