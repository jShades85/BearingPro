-- quotes + quote_line_items

CREATE TABLE quotes (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references tenants(id),
  opportunity_id  uuid not null references opportunities(id),
  number          text not null,
  status          text not null default 'draft'
                    check (status in ('draft', 'sent', 'viewed', 'accepted', 'expired')),
  value           numeric(12,2) not null default 0,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

CREATE TABLE quote_line_items (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references tenants(id),
  quote_id        uuid not null references quotes(id) on delete cascade,
  catalog_item_id uuid references catalog_items(id),
  description     text not null,
  quantity        numeric(10,2) not null default 1,
  unit_price      numeric(12,2) not null default 0,
  total           numeric(12,2) generated always as (quantity * unit_price) stored
);

-- updated_at trigger on quotes
CREATE TRIGGER set_quotes_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS
ALTER TABLE quotes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_line_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quotes_tenant" ON quotes
  FOR ALL USING (tenant_id = current_tenant_id());

CREATE POLICY "quote_line_items_tenant" ON quote_line_items
  FOR ALL USING (tenant_id = current_tenant_id());
