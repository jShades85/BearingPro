do $$
declare
  v_tenant  uuid;

  -- Vendor IDs (pre-generated so POs can reference them)
  v_adi     uuid := gen_random_uuid();
  v_anixter uuid := gen_random_uuid();
  v_axis    uuid := gen_random_uuid();
  v_verkada uuid := gen_random_uuid();
  v_biamp   uuid := gen_random_uuid();
  v_leviton uuid := gen_random_uuid();
  v_midatl  uuid := gen_random_uuid();

  -- PO IDs
  v_po1  uuid := gen_random_uuid(); -- PO-1169 cancelled
  v_po2  uuid := gen_random_uuid(); -- PO-1175 received general stock
  v_po3  uuid := gen_random_uuid(); -- PO-1176 received Lakewood
  v_po4  uuid := gen_random_uuid(); -- PO-1177 received NexGen
  v_po5  uuid := gen_random_uuid(); -- PO-1178 received Surgical Center
  v_po6  uuid := gen_random_uuid(); -- PO-1179 received Lakewood cameras
  v_po7  uuid := gen_random_uuid(); -- PO-1180 received general stock
  v_po8  uuid := gen_random_uuid(); -- PO-1181 partial Grand Ballroom
  v_po9  uuid := gen_random_uuid(); -- PO-1182 sent Grand Ballroom Biamp
  v_po10 uuid := gen_random_uuid(); -- PO-1183 draft Verkada restock
  v_po11 uuid := gen_random_uuid(); -- PO-1184 sent NexGen rack

  -- Project IDs (looked up by code)
  v_proj1 uuid; -- AV-2026-001 Grand Ballroom
  v_proj2 uuid; -- AV-2026-002 Surgical Center
  v_proj3 uuid; -- AV-2026-003 Lakewood Academy
  v_proj4 uuid; -- AV-2026-004 NexGen HQ

  -- Catalog item IDs (looked up by SKU)
  v_ci_p3245  uuid;  -- AX-P3245-V
  v_ci_m3106  uuid;  -- AX-M3106L
  v_ci_cd52   uuid;  -- VK-CD52
  v_ci_a1001  uuid;  -- AX-A1001
  v_ci_ad31   uuid;  -- VK-AD31
  v_ci_lev5e  uuid;  -- LV-5G108-RW5
  v_ci_tesira uuid;  -- BA-TESIRA-VT4
  v_ci_parle  uuid;  -- BA-PARLE-TCM1
  v_ci_rack   uuid;  -- LV-47612-FR

begin
  select id into v_tenant from tenants order by created_at limit 1;
  if v_tenant is null then return; end if;

  if exists (select 1 from vendors where tenant_id = v_tenant limit 1) then
    return;
  end if;

  -- Look up project IDs
  select id into v_proj1 from projects where tenant_id = v_tenant and code = 'AV-2026-001' limit 1;
  select id into v_proj2 from projects where tenant_id = v_tenant and code = 'AV-2026-002' limit 1;
  select id into v_proj3 from projects where tenant_id = v_tenant and code = 'AV-2026-003' limit 1;
  select id into v_proj4 from projects where tenant_id = v_tenant and code = 'AV-2026-004' limit 1;

  -- Look up catalog item IDs
  select id into v_ci_p3245  from catalog_items where tenant_id = v_tenant and sku = 'AX-P3245-V'    limit 1;
  select id into v_ci_m3106  from catalog_items where tenant_id = v_tenant and sku = 'AX-M3106L'     limit 1;
  select id into v_ci_cd52   from catalog_items where tenant_id = v_tenant and sku = 'VK-CD52'        limit 1;
  select id into v_ci_a1001  from catalog_items where tenant_id = v_tenant and sku = 'AX-A1001'      limit 1;
  select id into v_ci_ad31   from catalog_items where tenant_id = v_tenant and sku = 'VK-AD31'        limit 1;
  select id into v_ci_lev5e  from catalog_items where tenant_id = v_tenant and sku = 'LV-5G108-RW5'  limit 1;
  select id into v_ci_tesira from catalog_items where tenant_id = v_tenant and sku = 'BA-TESIRA-VT4'  limit 1;
  select id into v_ci_parle  from catalog_items where tenant_id = v_tenant and sku = 'BA-PARLE-TCM1'  limit 1;
  select id into v_ci_rack   from catalog_items where tenant_id = v_tenant and sku = 'LV-47612-FR'   limit 1;

  -- ── Vendors ─────────────────────────────────────────────────────────────────

  insert into vendors
    (id, tenant_id, name, category, status, account_number, payment_terms,
     website, phone, email, city, state, rep_name, rep_phone, rep_email, notes)
  values
  (
    v_adi, v_tenant, 'ADI Global Distribution', 'Hardware', 'preferred',
    'PCSS-ADI-4412', 'Net 30',
    'adisecurity.com', '(800) 233-6261', 'orders@adisecurity.com',
    'Melville', 'NY',
    'Marcus Webb', '(847) 555-0182', 'm.webb@adisecurity.com',
    'Primary hardware distributor. Net 30 terms locked in after first full year. Marcus is our rep — call him directly for backorder status.'
  ),
  (
    v_anixter, v_tenant, 'Anixter / Wesco', 'Cabling', 'active',
    'PCSS-ANX-8870', 'Net 30',
    'wesco.com', '(800) 323-8167', 'customerservice@wesco.com',
    'Glenview', 'IL',
    'Diane Flores', '(847) 555-0219', 'd.flores@wesco.com',
    'Use for bulk cable and conduit. Pricing beat ADI on Cat6 bulk runs last year. One cancelled PO — check pricing before reordering Biamp through them.'
  ),
  (
    v_axis, v_tenant, 'Axis Communications', 'Security', 'preferred',
    'PCSS-AXS-2201', 'Net 30',
    'axis.com', '(800) 444-2947', 'orders.us@axis.com',
    'Chelmsford', 'MA',
    'Tom Nakamura', '(978) 555-0144', 't.nakamura@axis.com',
    'Direct Axis partner account. Tom is our territory SE — loop him in on large camera specs for volume pricing.'
  ),
  (
    v_verkada, v_tenant, 'Verkada', 'Security', 'preferred',
    'PCSS-VRK-0557', 'Net 15',
    'verkada.com', '(415) 231-7277', 'orders@verkada.com',
    'San Mateo', 'CA',
    'Priya Nair', '(415) 555-0193', 'p.nair@verkada.com',
    'Verkada Cloud Managed reseller account. Priya handles NFR units and demo stock — coordinate with her before committing access control to a new project.'
  ),
  (
    v_biamp, v_tenant, 'Biamp Systems', 'AV', 'active',
    'PCSS-BAP-3318', 'Net 45',
    'biamp.com', '(503) 641-7287', 'customerservice@biamp.com',
    'Beaverton', 'OR',
    'Carlos Estrada', '(503) 555-0167', 'c.estrada@biamp.com',
    'Net 45 terms — plan cash flow accordingly on large AV projects. Carlos can usually get 5–8% project pricing on DSPs for jobs over $10K.'
  ),
  (
    v_leviton, v_tenant, 'Leviton', 'Networking', 'active',
    'PCSS-LEV-7740', 'Net 30',
    'leviton.com', '(800) 323-8920', 'prosupport@leviton.com',
    'Little Neck', 'NY',
    null, null, null,
    'Order through distributor portal — no dedicated rep at this volume. Follow up directly with pro support for ETA on rack SKUs.'
  ),
  (
    v_midatl, v_tenant, 'Middle Atlantic Products', 'AV', 'active',
    'PCSS-MAP-6629', 'Net 30',
    'middleatlantic.com', '(800) 266-7255', 'sales@middleatlantic.com',
    'Fairfield', 'NJ',
    'Jess Thornton', '(973) 555-0208', 'j.thornton@middleatlantic.com',
    'Racks, enclosures, and power distribution. Jess can expedite rack builds if we spec early enough.'
  );

  -- ── Purchase Orders ──────────────────────────────────────────────────────────

  insert into purchase_orders
    (id, tenant_id, po_number, vendor_id, status,
     order_date, expected_date, received_date,
     vendor_order_number, tracking_number,
     linked_project_id, linked_work_order_id, notes)
  values
  -- PO-1169: Anixter, cancelled, no link
  (v_po1,  v_tenant, 'PO-1169', v_anixter,  'cancelled',
   '2026-03-20', '2026-03-28', null,
   null, null, null, null,
   'Cancelled — quote came in over budget. Switched to ADI for better pricing on this SKU.'),

  -- PO-1175: ADI, received, general stock
  (v_po2,  v_tenant, 'PO-1175', v_adi,      'received',
   '2026-04-02', '2026-04-07', '2026-04-05',
   'ADI-SO-247891', '1ZAX175023456789', null, null,
   'Bulk networking and hardware restock.'),

  -- PO-1176: ADI, received, Lakewood Academy
  (v_po3,  v_tenant, 'PO-1176', v_adi,      'received',
   '2026-05-12', '2026-05-17', '2026-05-15',
   'ADI-SO-251334', '1ZAX176034567890', v_proj3, null,
   'Axis M3106 mini domes for Lakewood Academy classroom rollout.'),

  -- PO-1177: Verkada, received, NexGen HQ
  (v_po4,  v_tenant, 'PO-1177', v_verkada,  'received',
   '2026-05-25', '2026-05-30', '2026-05-28',
   'VRK-2026-04412', '784177012345678', v_proj4, null,
   'Verkada access controllers for NexGen HQ Conference Suite.'),

  -- PO-1178: Axis, received, Surgical Center
  (v_po5,  v_tenant, 'PO-1178', v_axis,     'received',
   '2026-05-29', '2026-06-03', '2026-06-01',
   'AXS-ORD-789234', '1ZAX178045678901', v_proj2, null,
   'Axis P3245-V cameras for Surgical Center A/V Overhaul.'),

  -- PO-1179: Verkada, received, Lakewood Academy cameras
  (v_po6,  v_tenant, 'PO-1179', v_verkada,  'received',
   '2026-06-02', '2026-06-05', '2026-06-03',
   'VRK-2026-04889', '784179023456789', v_proj3, null,
   'Verkada CD52 cameras for Lakewood Academy classroom rollout.'),

  -- PO-1180: ADI, received, general stock
  (v_po7,  v_tenant, 'PO-1180', v_adi,      'received',
   '2026-05-17', '2026-05-22', '2026-05-20',
   'ADI-SO-250107', '1ZAX180056789012', null, null,
   'Leviton networking top-up.'),

  -- PO-1181: ADI, partial, Grand Ballroom
  (v_po8,  v_tenant, 'PO-1181', v_adi,      'partial',
   '2026-06-04', '2026-06-09', null,
   'ADI-SO-253781', '1ZAX181067890123', v_proj1, null,
   'Axis cameras and access control for Grand Ballroom A/V System. M3106 mini domes on backorder from ADI, ETA Jun 15.'),

  -- PO-1182: Biamp, sent, Grand Ballroom
  (v_po9,  v_tenant, 'PO-1182', v_biamp,    'sent',
   '2026-06-06', '2026-06-12', null,
   'BAP-ORD-031245', '784182034567891', v_proj1, null,
   'Biamp AV equipment for Grand Ballroom A/V System.'),

  -- PO-1183: Verkada, draft, no link
  (v_po10, v_tenant, 'PO-1183', v_verkada,  'draft',
   '2026-06-07', null, null,
   null, null, null, null,
   'Quarterly Verkada restock — confirm quantities with PM before sending.'),

  -- PO-1184: Leviton, sent, NexGen HQ
  (v_po11, v_tenant, 'PO-1184', v_leviton,  'sent',
   '2026-05-30', '2026-06-05', null,
   'LV-PO-089234', '1ZLV184078901234', v_proj4, null,
   'Rack for NexGen HQ Conference Suite. Follow up with Leviton rep, shipment not yet received.');

  -- ── Line Items ───────────────────────────────────────────────────────────────

  insert into po_line_items
    (tenant_id, po_id, catalog_item_id, description, sku,
     qty_ordered, qty_received, unit_cost, sort_order)
  values
  -- PO-1169 (Anixter cancelled)
  (v_tenant, v_po1, v_ci_tesira, 'Biamp Tesira Forte AVB VT4',         'BA-TESIRA-VT4',  2, 0, 2450.00, 1),

  -- PO-1175 (ADI general stock)
  (v_tenant, v_po2, v_ci_lev5e, 'Leviton GigaMax Cat5e QuickPort Jack', 'LV-5G108-RW5',  25, 25, 28.00, 1),
  (v_tenant, v_po2, null,        'Single-Gang Low-Voltage Mounting Plate','MISC-SGMNT',   50, 50,  3.00, 2),

  -- PO-1176 (ADI Lakewood)
  (v_tenant, v_po3, v_ci_m3106, 'Axis M3106-L MkII Mini Dome',          'AX-M3106L',    10, 10, 180.00, 1),
  (v_tenant, v_po3, null,       'Cat6 Cable 1000ft Bulk Box',            'CAT6-BULK-1K',  5,  5, 110.00, 2),

  -- PO-1177 (Verkada NexGen)
  (v_tenant, v_po4, v_ci_ad31, 'Verkada AD31 Access Controller',        'VK-AD31',        8,  8, 890.00, 1),

  -- PO-1178 (Axis Surgical Center)
  (v_tenant, v_po5, v_ci_p3245, 'Axis P3245-V Fixed Dome Camera',       'AX-P3245-V',   24, 24, 420.00, 1),

  -- PO-1179 (Verkada Lakewood cameras)
  (v_tenant, v_po6, v_ci_cd52, 'Verkada CD52 Indoor Dome Camera',       'VK-CD52',       12, 12, 590.00, 1),

  -- PO-1180 (ADI general stock)
  (v_tenant, v_po7, v_ci_lev5e, 'Leviton GigaMax Cat5e QuickPort Jack', 'LV-5G108-RW5',  30, 30,  28.00, 1),

  -- PO-1181 (ADI partial Grand Ballroom)
  (v_tenant, v_po8, v_ci_p3245, 'Axis P3245-V Fixed Dome Camera',       'AX-P3245-V',    8,  8, 420.00, 1),
  (v_tenant, v_po8, v_ci_m3106, 'Axis M3106-L MkII Mini Dome',          'AX-M3106L',    12,  0, 180.00, 2),
  (v_tenant, v_po8, v_ci_a1001, 'Axis A1001 Network Door Controller',   'AX-A1001',       4,  4, 680.00, 3),

  -- PO-1182 (Biamp Grand Ballroom sent)
  (v_tenant, v_po9, v_ci_tesira, 'Biamp Tesira Forte AVB VT4',          'BA-TESIRA-VT4',  3,  0, 2240.00, 1),
  (v_tenant, v_po9, v_ci_parle,  'Biamp Parlé TCM-1 Ceiling Mic',       'BA-PARLE-TCM1',  6,  0,  890.00, 2),

  -- PO-1183 (Verkada draft)
  (v_tenant, v_po10, v_ci_cd52, 'Verkada CD52 Indoor Dome Camera',      'VK-CD52',       10,  0, 590.00, 1),
  (v_tenant, v_po10, v_ci_ad31, 'Verkada AD31 Access Controller',       'VK-AD31',        4,  0, 890.00, 2),

  -- PO-1184 (Leviton NexGen sent)
  (v_tenant, v_po11, v_ci_rack, 'Leviton 42" 2-Post Open Frame Rack',  'LV-47612-FR',    4,  0, 285.00, 1);

end $$;
