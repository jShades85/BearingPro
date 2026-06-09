create table opportunities (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  title       text not null,
  company_id  uuid references companies(id) on delete set null,
  contact_id  uuid references contacts(id) on delete set null,
  assigned_to uuid references user_profiles(id) on delete set null,
  value       numeric(12,2),
  stage       text not null default 'site-visit'
    check (stage in ('site-visit','estimating','proposal-sent','negotiation','closed-won','closed-lost')),
  close_date  date,
  source      text
    check (source in ('Referral','Repeat Client','Cold Outreach','Bid/RFP','Phone','Web Form','Email','Walk-in')),
  priority    text not null default 'medium'
    check (priority in ('low','medium','high','urgent')),
  notes       text,
  created_at  timestamptz not null default now()
);

alter table opportunities enable row level security;

create policy "opportunities_select" on opportunities
  for select using (tenant_id = current_tenant_id());
create policy "opportunities_insert" on opportunities
  for insert with check (tenant_id = current_tenant_id());
create policy "opportunities_update" on opportunities
  for update using (tenant_id = current_tenant_id());
create policy "opportunities_delete" on opportunities
  for delete using (tenant_id = current_tenant_id());
