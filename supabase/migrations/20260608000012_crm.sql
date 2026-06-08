-- ─── Companies ───────────────────────────────────────────────────────────────

create table companies (
  id               uuid primary key default gen_random_uuid(),
  tenant_id        uuid not null references tenants(id) on delete cascade,
  name             text not null,
  industry         text,
  stage            text not null default 'prospect'
    check (stage in ('active', 'prospect', 'inactive')),
  phone            text,
  email            text,
  website          text,
  city             text,
  state            text,
  billing_address  text,
  service_address  text,
  notes            text,
  created_at       timestamptz not null default now()
);

alter table companies enable row level security;

create policy "companies_select" on companies
  for select using (tenant_id = current_tenant_id());
create policy "companies_insert" on companies
  for insert with check (tenant_id = current_tenant_id());
create policy "companies_update" on companies
  for update using (tenant_id = current_tenant_id());
create policy "companies_delete" on companies
  for delete using (tenant_id = current_tenant_id());

-- ─── Contacts ─────────────────────────────────────────────────────────────────

create table contacts (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references tenants(id) on delete cascade,
  company_id    uuid references companies(id) on delete set null,
  full_name     text not null,
  title         text,
  phone         text,
  email         text,
  address       text,
  contact_type  text
    check (contact_type in ('Decision Maker', 'Billing Contact', 'Site Contact', 'Influencer')),
  source        text
    check (source in ('Phone', 'Web Form', 'Referral', 'Email', 'Walk-in')),
  assigned_to   uuid references user_profiles(id) on delete set null,
  stage         text not null default 'Lead'
    check (stage in ('Lead', 'Customer', 'Inactive')),
  customer_type text not null default 'commercial'
    check (customer_type in ('commercial', 'residential')),
  tags          text[] not null default '{}',
  notes         text,
  created_at    timestamptz not null default now()
);

alter table contacts enable row level security;

create policy "contacts_select" on contacts
  for select using (tenant_id = current_tenant_id());
create policy "contacts_insert" on contacts
  for insert with check (tenant_id = current_tenant_id());
create policy "contacts_update" on contacts
  for update using (tenant_id = current_tenant_id());
create policy "contacts_delete" on contacts
  for delete using (tenant_id = current_tenant_id());
