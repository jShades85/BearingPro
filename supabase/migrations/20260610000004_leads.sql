create table leads (
  id                       uuid primary key default gen_random_uuid(),
  tenant_id                uuid not null references tenants(id) on delete cascade,
  first_name               text,
  last_name                text,
  company_name             text,
  phone                    text,
  email                    text,
  source                   text
    check (source in ('Phone','Web Form','Referral','Email','Walk-in')),
  service_interest         text,
  location                 text,
  status                   text not null default 'new'
    check (status in ('new','contacted','qualified','converted','dismissed')),
  assigned_to              uuid references user_profiles(id) on delete set null,
  notes                    text,
  converted_at             timestamptz,
  converted_contact_id     uuid references contacts(id) on delete set null,
  converted_opportunity_id uuid references opportunities(id) on delete set null,
  created_at               timestamptz not null default now()
);

alter table leads enable row level security;

create policy "leads_select" on leads
  for select using (tenant_id = current_tenant_id());
create policy "leads_insert" on leads
  for insert with check (tenant_id = current_tenant_id());
create policy "leads_update" on leads
  for update using (tenant_id = current_tenant_id());
create policy "leads_delete" on leads
  for delete using (tenant_id = current_tenant_id());
