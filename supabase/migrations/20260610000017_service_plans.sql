create table service_plans (
  id                 uuid primary key default gen_random_uuid(),
  tenant_id          uuid not null references tenants(id) on delete cascade,
  code               text not null,
  customer_name      text not null,
  company_id         uuid references companies(id) on delete set null,
  contact_name       text not null default '',
  contact_id         uuid references contacts(id) on delete set null,
  phone              text not null default '',
  site_address       text not null default '',
  tier               text not null default 'Essential'
                       check (tier in ('Essential', 'Standard', 'Professional', 'Elite')),
  covered_systems    text[] not null default '{}',
  mrr                numeric(10,2) not null default 0,
  billing_cycle      text not null default 'Monthly'
                       check (billing_cycle in ('Monthly', 'Quarterly', 'Annual')),
  sla_response       text not null default 'Next business day',
  visits_per_year    integer not null default 1,
  visits_used        integer not null default 0,
  start_date         date,
  renewal_date       date,
  status             text not null default 'pending'
                       check (status in ('active', 'expiring', 'expired', 'cancelled', 'pending')),
  account_manager_id uuid references user_profiles(id) on delete set null,
  notes              text not null default '',
  activity           jsonb not null default '[]',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

alter table service_plans enable row level security;

create policy "service_plans_select" on service_plans
  for select using (tenant_id = current_tenant_id());

create policy "service_plans_insert" on service_plans
  for insert with check (tenant_id = current_tenant_id());

create policy "service_plans_update" on service_plans
  for update using (tenant_id = current_tenant_id());

create policy "service_plans_delete" on service_plans
  for delete using (tenant_id = current_tenant_id());

create trigger set_service_plans_updated_at
  before update on service_plans
  for each row execute function set_updated_at();
