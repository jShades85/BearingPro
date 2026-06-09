create table purchase_orders (
  id                   uuid primary key default gen_random_uuid(),
  tenant_id            uuid not null references tenants(id) on delete cascade,
  po_number            text not null,
  vendor_id            uuid not null references vendors(id) on delete restrict,
  status               text not null default 'draft'
                         check (status in ('draft','sent','partial','received','cancelled')),
  order_date           date not null,
  expected_date        date,
  received_date        date,
  vendor_order_number  text,
  tracking_number      text,
  linked_project_id    uuid references projects(id) on delete set null,
  linked_work_order_id uuid references work_orders(id) on delete set null,
  notes                text not null default '',
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create table po_line_items (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references tenants(id) on delete cascade,
  po_id           uuid not null references purchase_orders(id) on delete cascade,
  catalog_item_id uuid references catalog_items(id) on delete set null,
  description     text not null,
  sku             text not null default '',
  qty_ordered     integer not null default 1 check (qty_ordered >= 0),
  qty_received    integer not null default 0 check (qty_received >= 0),
  unit_cost       numeric(10,2) not null default 0,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now()
);

-- ── RLS: purchase_orders ──────────────────────────────────────────────────────

alter table purchase_orders enable row level security;

create policy "purchase_orders_select" on purchase_orders
  for select using (tenant_id = current_tenant_id());

create policy "purchase_orders_insert" on purchase_orders
  for insert with check (tenant_id = current_tenant_id());

create policy "purchase_orders_update" on purchase_orders
  for update using (tenant_id = current_tenant_id());

create policy "purchase_orders_delete" on purchase_orders
  for delete using (tenant_id = current_tenant_id());

create trigger set_purchase_orders_updated_at
  before update on purchase_orders
  for each row execute function set_updated_at();

-- ── RLS: po_line_items ────────────────────────────────────────────────────────

alter table po_line_items enable row level security;

create policy "po_line_items_select" on po_line_items
  for select using (tenant_id = current_tenant_id());

create policy "po_line_items_insert" on po_line_items
  for insert with check (tenant_id = current_tenant_id());

create policy "po_line_items_update" on po_line_items
  for update using (tenant_id = current_tenant_id());

create policy "po_line_items_delete" on po_line_items
  for delete using (tenant_id = current_tenant_id());
