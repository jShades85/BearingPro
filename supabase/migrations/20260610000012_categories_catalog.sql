-- categories + catalog_items tables with RLS + test tenant seed

-- ─── Categories ──────────────────────────────────────────────────────────────

create table public.categories (
  id         uuid        primary key default gen_random_uuid(),
  tenant_id  uuid        not null references public.tenants(id) on delete cascade,
  name       text        not null,
  color      text        not null default '#6366f1',
  sort_order int         not null default 0,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "tenant_select" on public.categories for select using (tenant_id = current_tenant_id());
create policy "tenant_insert" on public.categories for insert with check (tenant_id = current_tenant_id());
create policy "tenant_update" on public.categories for update using (tenant_id = current_tenant_id());
create policy "tenant_delete" on public.categories for delete using (tenant_id = current_tenant_id());

-- ─── Catalog Items ────────────────────────────────────────────────────────────

create table public.catalog_items (
  id                  uuid          primary key default gen_random_uuid(),
  tenant_id           uuid          not null references public.tenants(id) on delete cascade,
  category_id         uuid          not null references public.categories(id) on delete restrict,
  name                text          not null,
  manufacturer        text,
  sku                 text,
  description         text,
  cost                numeric(10,2) not null default 0,
  msrp                numeric(10,2) not null default 0,
  unit_of_measure     text          not null default 'ea',
  has_labor           boolean       not null default false,
  labor_hours         numeric(5,2),
  labor_rate_override numeric(10,2),
  image_url           text,
  is_active           boolean       not null default true,
  created_at          timestamptz   not null default now(),
  updated_at          timestamptz   not null default now()
);

alter table public.catalog_items enable row level security;

create policy "tenant_select" on public.catalog_items for select using (tenant_id = current_tenant_id());
create policy "tenant_insert" on public.catalog_items for insert with check (tenant_id = current_tenant_id());
create policy "tenant_update" on public.catalog_items for update using (tenant_id = current_tenant_id());
create policy "tenant_delete" on public.catalog_items for delete using (tenant_id = current_tenant_id());

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger catalog_items_updated_at
  before update on public.catalog_items
  for each row execute function public.set_updated_at();

-- ─── Seed (test tenant — AV + Security categories + sample items) ─────────────

do $$
declare
  tid   uuid;
  c_cam uuid;
  c_ac  uuid;
  c_net uuid;
  c_av  uuid;
  c_cab uuid;
  c_lab uuid;
begin
  select id into tid from public.tenants limit 1;
  if tid is null then return; end if;

  insert into public.categories (tenant_id, name, color, sort_order)
    values (tid, 'Cameras',            '#3b82f6', 0) returning id into c_cam;
  insert into public.categories (tenant_id, name, color, sort_order)
    values (tid, 'Access Control',     '#8b5cf6', 1) returning id into c_ac;
  insert into public.categories (tenant_id, name, color, sort_order)
    values (tid, 'Networking',         '#06b6d4', 2) returning id into c_net;
  insert into public.categories (tenant_id, name, color, sort_order)
    values (tid, 'Audio/Video',        '#10b981', 3) returning id into c_av;
  insert into public.categories (tenant_id, name, color, sort_order)
    values (tid, 'Structured Cabling', '#f59e0b', 4) returning id into c_cab;
  insert into public.categories (tenant_id, name, color, sort_order)
    values (tid, 'Labor',              '#6366f1', 5) returning id into c_lab;

  insert into public.catalog_items
    (tenant_id, category_id, name, manufacturer, sku, description, cost, msrp, unit_of_measure, has_labor, labor_hours)
  values
    (tid, c_cam, 'Axis P3245-V Fixed Dome Camera',      'Axis Communications', 'AX-P3245-V',   'Fixed dome 1080p camera with WDR, IR illumination to 10m. IP66/IK10 rated.',                420,   549, 'ea',  true,  1.5),
    (tid, c_cam, 'Axis M3106-L MkII Mini Dome',         'Axis Communications', 'AX-M3106L',    'Compact 4MP fixed mini dome, indoor ceiling mount, 2.8mm lens.',                           180,   235, 'ea',  false, null),
    (tid, c_cam, 'Verkada CD52 Indoor Dome Camera',     'Verkada',             'VK-CD52',       '5MP IR dome camera, cloud-managed, 30-day onboard storage, PoE.',                          590,   749, 'ea',  true,  1.5),
    (tid, c_ac,  'Axis A1001 Network Door Controller',  'Axis Communications', 'AX-A1001',      '2-door network door controller, OSDP/Wiegand readers, PoE-powered.',                       680,   895, 'ea',  true,  2.0),
    (tid, c_ac,  'Verkada AD31 Access Controller',      'Verkada',             'VK-AD31',       'Cloud-based door access controller, supports up to 2 readers, built-in Bluetooth.',         890,  1150, 'ea',  true,  2.0),
    (tid, c_net, 'Leviton GigaMax 5e QuickPort Jack',   'Leviton',             'LV-5G108-RW5',  'Cat 5e QuickPort jack, 110-style termination, white. Pack of 25.',                          28,    42, 'box', false, null),
    (tid, c_av,  'Biamp Tesira Forte AVB VT4',          'Biamp',               'BA-TESIRA-VT4', 'Network-based fixed I/O DSP, 4-in/4-out, AVB/DANTE, AEC, rackmount.',                    2240,  3150, 'ea',  true,  3.0),
    (tid, c_av,  'Biamp Parlé TCM-1 Ceiling Mic',       'Biamp',               'BA-PARLE-TCM1', 'Beamtracking ceiling microphone, 360° coverage, PoE, white or black.',                     890,  1280, 'ea',  false, null),
    (tid, c_cab, 'Leviton 42" 2-Post Open Frame Rack',  'Leviton',             'LV-47612-FR',   '42U two-post open frame rack, 19-inch, black powder coat, 400 lb capacity.',               285,   415, 'ea',  false, null),
    (tid, c_cab, 'Low-Voltage Cable Run',               'Internal / Custom',   'INT-LV-RUN',    'Per-run pricing for pulling and terminating Cat6/coax from panel to device, up to 150ft.',  40,    85, 'run', false, null),
    (tid, c_lab, 'Camera Install — per drop',           'Internal / Custom',   'INT-CAM-DROP',  'Per-drop labor rate for camera installation including mounting and commissioning.',           55,    95, 'ea',  false, null),
    (tid, c_lab, 'System Programming & Commissioning',  'Internal / Custom',   'INT-PROG-HR',   'Hourly rate for system programming, configuration, and on-site commissioning.',              75,   145, 'hr',  false, null);
end $$;
