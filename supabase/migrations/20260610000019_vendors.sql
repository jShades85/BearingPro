create table vendors (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references tenants(id) on delete cascade,
  name           text not null,
  category       text not null default 'Hardware'
                   check (category in ('Security','AV','Networking','Cabling','Hardware','Specialty')),
  status         text not null default 'active'
                   check (status in ('preferred','active','inactive')),
  account_number text,
  payment_terms  text not null default 'Net 30',
  website        text not null default '',
  phone          text not null default '',
  email          text not null default '',
  city           text not null default '',
  state          text not null default '',
  rep_name       text,
  rep_phone      text,
  rep_email      text,
  notes          text not null default '',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table vendors enable row level security;

create policy "vendors_select" on vendors
  for select using (tenant_id = current_tenant_id());

create policy "vendors_insert" on vendors
  for insert with check (tenant_id = current_tenant_id());

create policy "vendors_update" on vendors
  for update using (tenant_id = current_tenant_id());

create policy "vendors_delete" on vendors
  for delete using (tenant_id = current_tenant_id());

create trigger set_vendors_updated_at
  before update on vendors
  for each row execute function set_updated_at();
