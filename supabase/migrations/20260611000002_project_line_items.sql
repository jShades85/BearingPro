-- Parts list for a project (bill of materials).
-- catalog_item_id is nullable — parts can be freehand (no catalog link).
-- labor_hours is denormalized from the catalog item at add-time so edits
-- to the catalog don't retroactively change project estimates.

create table project_line_items (
  id               uuid primary key default gen_random_uuid(),
  tenant_id        uuid not null references tenants(id) on delete cascade,
  project_id       uuid not null references projects(id) on delete cascade,
  catalog_item_id  uuid references catalog_items(id) on delete set null,
  name             text not null,
  qty              numeric(10,2) not null default 1,
  unit_cost        numeric(10,2) not null default 0,
  labor_hours      numeric(5,2),
  source           text not null default 'stock'
                     check (source in ('stock','special-order')),
  status           text not null default 'needed'
                     check (status in ('needed','ordered','received','installed')),
  phase            text,
  notes            text,
  created_at       timestamptz not null default now()
);

alter table project_line_items enable row level security;

create policy "project_line_items_select" on project_line_items
  for select using (tenant_id = current_tenant_id());
create policy "project_line_items_insert" on project_line_items
  for insert with check (tenant_id = current_tenant_id());
create policy "project_line_items_update" on project_line_items
  for update using (tenant_id = current_tenant_id());
create policy "project_line_items_delete" on project_line_items
  for delete using (tenant_id = current_tenant_id());

-- Backfill: carry quote line items forward for any project that was already
-- converted from an opportunity that had a quote.
insert into project_line_items
  (tenant_id, project_id, catalog_item_id, name, qty, unit_cost, labor_hours)
select
  p.tenant_id,
  p.id,
  qli.catalog_item_id,
  qli.description,
  qli.quantity,
  qli.unit_price,
  ci.labor_hours
from projects p
join opportunities o      on o.id  = p.opportunity_id
join quotes q             on q.opportunity_id = o.id
join quote_line_items qli on qli.quote_id = q.id
left join catalog_items ci on ci.id = qli.catalog_item_id
where p.opportunity_id is not null;
