-- Rebuilds all operational seed data with a cohesive narrative where every record
-- traces back to the same 7 CRM companies. Companies, contacts, leads, service
-- tickets, service plans, catalog, and stock are left untouched.
--
-- Trail: Company → Contact → Opportunity → Project → Work Order
--        Project → PO → Vendor
--        Project → Invoice → Payment
--
-- Companies covered:
--   Northbeam Architects      → completed project, paid invoice
--   Pinecrest Hospitality     → in-progress project, deposit + milestone invoices
--   Helio Health Systems      → in-progress project, overdue + sent invoices, standalone WO
--   Halcyon Public Schools    → completed project, paid invoice; Phase 2 opp in pipeline
--   Vertex Capital Partners   → on-hold project, proposal opp; partial + draft invoices
--   Cinder & Oak Hospitality  → closed-lost opp, overdue invoice
--   Arden & Loom Studios      → site-visit opp, paid consulting invoice

do $$
declare
  v_tenant uuid := (select id from tenants order by created_at limit 1);

  -- ── Existing company IDs ─────────────────────────────────────────────
  v_northbeam uuid := (select id from companies where name = 'Northbeam Architects'        and tenant_id = v_tenant limit 1);
  v_pinecrest uuid := (select id from companies where name = 'Pinecrest Hospitality Group'  and tenant_id = v_tenant limit 1);
  v_helio     uuid := (select id from companies where name = 'Helio Health Systems'         and tenant_id = v_tenant limit 1);
  v_vertex    uuid := (select id from companies where name = 'Vertex Capital Partners'      and tenant_id = v_tenant limit 1);
  v_halcyon   uuid := (select id from companies where name = 'Halcyon Public Schools'       and tenant_id = v_tenant limit 1);
  v_cinder    uuid := (select id from companies where name = 'Cinder & Oak Hospitality'     and tenant_id = v_tenant limit 1);
  v_arden     uuid := (select id from companies where name = 'Arden & Loom Studios'         and tenant_id = v_tenant limit 1);

  -- ── Existing contact IDs ─────────────────────────────────────────────
  v_audrey  uuid := (select id from contacts where email = 'audrey@northbeam.co'       and tenant_id = v_tenant limit 1);
  v_marcus  uuid := (select id from contacts where email = 'mbell@pinecrest.com'       and tenant_id = v_tenant limit 1);
  v_priya_c uuid := (select id from contacts where email = 'panand@heliohealth.org'    and tenant_id = v_tenant limit 1);
  v_iris    uuid := (select id from contacts where email = 'iwang@vertexcap.io'        and tenant_id = v_tenant limit 1);
  v_noor    uuid := (select id from contacts where email = 'nsaleh@vertexcap.io'       and tenant_id = v_tenant limit 1);
  v_damon   uuid := (select id from contacts where email = 'dreyes@halcyon.k12.or.us'  and tenant_id = v_tenant limit 1);
  v_hugo    uuid := (select id from contacts where email = 'hugo@cinderoak.co'         and tenant_id = v_tenant limit 1);
  v_lena    uuid := (select id from contacts where email = 'lena@ardenloom.tv'         and tenant_id = v_tenant limit 1);

  -- ── Existing team member IDs ─────────────────────────────────────────
  v_chris  uuid := (select id from user_profiles where email = 'chris.navarro@example.com' limit 1);
  v_sarah  uuid := (select id from user_profiles where email = 'sarah.kim@example.com'     limit 1);
  v_riley  uuid := (select id from user_profiles where email = 'riley.torres@example.com'  limit 1);
  v_mike   uuid := (select id from user_profiles where email = 'mike.okafor@example.com'   limit 1);
  v_jordan uuid := (select id from user_profiles where email = 'jordan.vale@example.com'   limit 1);

  -- ── Existing catalog item IDs ────────────────────────────────────────
  v_ci_p3245  uuid := (select id from catalog_items where tenant_id = v_tenant and sku = 'AX-P3245-V'    limit 1);
  v_ci_m3106  uuid := (select id from catalog_items where tenant_id = v_tenant and sku = 'AX-M3106L'     limit 1);
  v_ci_cd52   uuid := (select id from catalog_items where tenant_id = v_tenant and sku = 'VK-CD52'        limit 1);
  v_ci_a1001  uuid := (select id from catalog_items where tenant_id = v_tenant and sku = 'AX-A1001'      limit 1);
  v_ci_ad31   uuid := (select id from catalog_items where tenant_id = v_tenant and sku = 'VK-AD31'        limit 1);
  v_ci_lev5e  uuid := (select id from catalog_items where tenant_id = v_tenant and sku = 'LV-5G108-RW5'  limit 1);
  v_ci_tesira uuid := (select id from catalog_items where tenant_id = v_tenant and sku = 'BA-TESIRA-VT4'  limit 1);
  v_ci_parle  uuid := (select id from catalog_items where tenant_id = v_tenant and sku = 'BA-PARLE-TCM1'  limit 1);
  v_ci_rack   uuid := (select id from catalog_items where tenant_id = v_tenant and sku = 'LV-47612-FR'    limit 1);

  -- ── Pre-generated record IDs ─────────────────────────────────────────
  v_opp_northbeam uuid := gen_random_uuid();
  v_opp_pinecrest uuid := gen_random_uuid();
  v_opp_helio1    uuid := gen_random_uuid();
  v_opp_helio2    uuid := gen_random_uuid();
  v_opp_vertex    uuid := gen_random_uuid();
  v_opp_halcyon1  uuid := gen_random_uuid();
  v_opp_halcyon2  uuid := gen_random_uuid();
  v_opp_arden     uuid := gen_random_uuid();
  v_opp_cinder    uuid := gen_random_uuid();

  v_proj1 uuid := gen_random_uuid(); -- AV-2026-001 Northbeam
  v_proj2 uuid := gen_random_uuid(); -- AV-2026-002 Pinecrest
  v_proj3 uuid := gen_random_uuid(); -- AV-2026-003 Helio
  v_proj4 uuid := gen_random_uuid(); -- AV-2026-004 Halcyon
  v_proj5 uuid := gen_random_uuid(); -- AV-2026-005 Vertex

  v_wo1 uuid := gen_random_uuid();
  v_wo2 uuid := gen_random_uuid();
  v_wo3 uuid := gen_random_uuid();
  v_wo4 uuid := gen_random_uuid();
  v_wo5 uuid := gen_random_uuid();

  v_adi     uuid := gen_random_uuid();
  v_anixter uuid := gen_random_uuid();
  v_axis    uuid := gen_random_uuid();
  v_verkada uuid := gen_random_uuid();
  v_biamp   uuid := gen_random_uuid();
  v_leviton uuid := gen_random_uuid();
  v_midatl  uuid := gen_random_uuid();

  v_po1  uuid := gen_random_uuid();
  v_po2  uuid := gen_random_uuid();
  v_po3  uuid := gen_random_uuid();
  v_po4  uuid := gen_random_uuid();
  v_po5  uuid := gen_random_uuid();
  v_po6  uuid := gen_random_uuid();
  v_po7  uuid := gen_random_uuid();
  v_po8  uuid := gen_random_uuid();
  v_po9  uuid := gen_random_uuid();
  v_po10 uuid := gen_random_uuid();
  v_po11 uuid := gen_random_uuid();

  v_inv1  uuid := gen_random_uuid();
  v_inv2  uuid := gen_random_uuid();
  v_inv3  uuid := gen_random_uuid();
  v_inv4  uuid := gen_random_uuid();
  v_inv5  uuid := gen_random_uuid();
  v_inv6  uuid := gen_random_uuid();
  v_inv7  uuid := gen_random_uuid();
  v_inv8  uuid := gen_random_uuid();
  v_inv9  uuid := gen_random_uuid();
  v_inv10 uuid := gen_random_uuid();

begin
  if v_tenant is null then return; end if;

  -- ── Delete existing operational seed data (FK-safe order) ────────────
  delete from invoice_payments  where tenant_id = v_tenant;
  delete from invoice_line_items where invoice_id in
    (select id from invoices where tenant_id = v_tenant);
  delete from invoices           where tenant_id = v_tenant;
  delete from po_line_items      where tenant_id = v_tenant;
  delete from purchase_orders    where tenant_id = v_tenant;
  delete from vendors            where tenant_id = v_tenant;
  delete from work_orders        where tenant_id = v_tenant;
  update projects set opportunity_id = null where tenant_id = v_tenant;
  delete from projects           where tenant_id = v_tenant;
  delete from opportunities      where tenant_id = v_tenant;

  -- ── Opportunities ────────────────────────────────────────────────────
  -- 4 closed-won (backed by projects) + 5 open/lost across the pipeline
  insert into opportunities
    (id, tenant_id, title, company_id, contact_id, assigned_to,
     value, stage, close_date, source, priority, notes)
  values

    (v_opp_northbeam, v_tenant, 'Northbeam Office A/V Expansion',
     v_northbeam, v_audrey, v_sarah,
     58000, 'closed-won', '2026-05-20', 'Referral', 'high',
     'Full conference room and lobby AV. Signed and completed. Invoice paid.'),

    (v_opp_pinecrest, v_tenant, 'Pinecrest Lobby Video Wall',
     v_pinecrest, v_marcus, v_sarah,
     185000, 'closed-won', '2026-06-01', 'Web Form', 'urgent',
     'Client signed at $185k. Install underway. 50% deposit collected; milestone 2 invoice pending approval.'),

    (v_opp_helio1, v_tenant, 'Helio Surgical Center A/V Overhaul',
     v_helio, v_priya_c, v_chris,
     148000, 'closed-won', '2026-05-10', 'Repeat Client', 'high',
     'Multi-room AV replacement across 12 procedure rooms. Signed; project in progress.'),

    (v_opp_helio2, v_tenant, 'Helio Paging System Phase 2',
     v_helio, v_priya_c, v_chris,
     96000, 'estimating', '2026-08-01', 'Repeat Client', 'high',
     'Phase 2 expansion: paging across 4 additional Helio campuses. Building estimate now.'),

    (v_opp_vertex, v_tenant, 'Vertex Trading Floor Upgrade',
     v_vertex, v_iris, v_sarah,
     240000, 'proposal-sent', '2026-07-15', 'Referral', 'high',
     'Proposal v2 sent June 6. Awaiting CTO sign-off from Noor Saleh.'),

    (v_opp_halcyon1, v_tenant, 'Halcyon Classroom AV Phase 1',
     v_halcyon, v_damon, v_sarah,
     96000, 'closed-won', '2026-04-15', 'Email', 'med',
     'Phase 1 — 24 classrooms. Completed on schedule. Phase 2 in planning.'),

    (v_opp_halcyon2, v_tenant, 'Halcyon Classroom AV Phase 2',
     v_halcyon, v_damon, v_sarah,
     112000, 'site-visit', '2026-09-01', 'Repeat Client', 'med',
     'Phase 2 covers remaining 18 classrooms + media center. Site visit June 8.'),

    (v_opp_arden, v_tenant, 'Arden Sound Stage Control Room',
     v_arden, v_lena, v_sarah,
     72000, 'site-visit', '2026-08-15', 'Phone', 'med',
     'Visited site June 3. Complex routing requirements. Budget still TBD with client.'),

    (v_opp_cinder, v_tenant, 'Cinder & Oak New Location A/V',
     v_cinder, v_hugo, v_sarah,
     45000, 'closed-lost', '2026-05-15', 'Cold Outreach', 'low',
     'Lost to a lower bid. Follow up Q4 when Nashville location opens.');

  -- ── Projects ─────────────────────────────────────────────────────────
  insert into projects
    (id, tenant_id, code, name, company_id, contact_id, opportunity_id,
     site_address, status, contract_value, budgeted_cost, budgeted_hours,
     start_date, target_end_date, pm_id, notes)
  values

    (v_proj1, v_tenant, 'AV-2026-001', 'Northbeam Office A/V Expansion',
     v_northbeam, v_audrey, v_opp_northbeam,
     '44 Berry St, Brooklyn, NY 11211', 'completed',
     58000, 38000, 160, '2026-04-21', '2026-05-30', v_riley,
     'Conference rooms x2 with displays, UC video bars, ceiling speakers; lobby digital signage; Crestron control. Punch list closed May 30.'),

    (v_proj2, v_tenant, 'AV-2026-002', 'Pinecrest Lobby Video Wall',
     v_pinecrest, v_marcus, v_opp_pinecrest,
     '905 Congress Ave, Austin, TX 78701', 'in-progress',
     185000, 122000, 420, '2026-06-02', '2026-08-15', v_chris,
     'Samsung IFR LED wall 6x4 panel config, Novastar controller, custom structural mount, full signal and power distribution. Cable pull complete; panel install in progress.'),

    (v_proj3, v_tenant, 'AV-2026-003', 'Surgical Center A/V Overhaul',
     v_helio, v_priya_c, v_opp_helio1,
     '1719 E 19th Ave, Denver, CO 80218', 'in-progress',
     148000, 96000, 310, '2026-05-15', '2026-08-01', v_chris,
     'Legacy paging + video conferencing replacement across 12 procedure rooms. Biamp Tesira DSP, Crestron panels, overhead projectors in training rooms. Infection-control cable routing required.'),

    (v_proj4, v_tenant, 'AV-2026-004', 'Halcyon Classroom AV Phase 1',
     v_halcyon, v_damon, v_opp_halcyon1,
     '1010 SE Powell Blvd, Portland, OR 97202', 'completed',
     96000, 62000, 240, '2026-05-20', '2026-07-18', v_riley,
     '24 classrooms: Axis P3245-V dome cameras, Verkada CD52 IP cameras, interactive flat panels, ceiling speakers, teacher control tablets. Installed during summer break window.'),

    (v_proj5, v_tenant, 'AV-2026-005', 'Vertex HQ Conference Suite',
     v_vertex, v_iris, null,
     '200 W Madison St, Chicago, IL 60606', 'on-hold',
     72000, 48000, 180, '2026-06-01', '2026-07-15', v_chris,
     'On hold — interior construction 3 weeks behind schedule. Covers executive boardroom + 4 huddle rooms. Separate from active trading floor proposal (AV-2026-005 is a prior engagement).');

  -- ── Work Orders ───────────────────────────────────────────────────────
  insert into work_orders
    (id, tenant_id, code, name, company_id, project_id, site_address, status,
     contract_value, budgeted_hours, scheduled_date, assigned_to, notes)
  values

    (v_wo1, v_tenant, 'WO-0001', 'Northbeam AV — Punch List & Sign-Off',
     v_northbeam, v_proj1, '44 Berry St, Brooklyn, NY 11211', 'completed',
     1200, 8, '2026-05-28', v_mike,
     'Final walk-through with Audrey Chen. Cable dress, label wall plates, verify Crestron macros, client training on app. Signed off May 30.'),

    (v_wo2, v_tenant, 'WO-0002', 'Pinecrest Video Wall — Panel Installation',
     v_pinecrest, v_proj2, '905 Congress Ave, Austin, TX 78701', 'in-progress',
     18500, 32, '2026-06-17', v_jordan,
     'Installing 24 Samsung IFR LED panels on structural mount. 8 panels remaining as of June 17. Novastar controller staged and ready.'),

    (v_wo3, v_tenant, 'WO-0003', 'Helio Surgical Center — Rooms 8-12 Install',
     v_helio, v_proj3, '1719 E 19th Ave, Denver, CO 80218', 'scheduled',
     22400, 48, '2026-06-23', v_mike,
     'Install Crestron touchpanels, projectors, and Biamp DSP for rooms 8-12. Infection control team must approve scheduling window before work begins.'),

    (v_wo4, v_tenant, 'WO-0004', 'Halcyon Phase 1 — Commissioning & Handover',
     v_halcyon, v_proj4, '1010 SE Powell Blvd, Portland, OR 97202', 'completed',
     4800, 16, '2026-07-15', v_riley,
     'Final system commissioning, staff training (Damon Reyes + IT team), documentation handover. All 24 classrooms verified operational.'),

    (v_wo5, v_tenant, 'WO-0005', 'Helio PA — Zone 3 Amplifier Fault',
     v_helio, null, '1719 E 19th Ave, Denver, CO 80218', 'in-progress',
     1200, 4, '2026-06-10', v_jordan,
     'Zone 3 amplifier reporting fault code E-04. Replacement Crown XLS 1002 pulled from stock. Helio is on service plan — no PO required.');

  -- ── Vendors ───────────────────────────────────────────────────────────
  insert into vendors
    (id, tenant_id, name, category, status, account_number, payment_terms,
     website, phone, email, city, state, rep_name, rep_phone, rep_email, notes)
  values

    (v_adi, v_tenant, 'ADI Global Distribution', 'Hardware', 'preferred',
     'PCSS-ADI-4412', 'Net 30', 'adisecurity.com', '(800) 233-6261',
     'orders@adisecurity.com', 'Melville', 'NY',
     'Marcus Webb', '(847) 555-0182', 'm.webb@adisecurity.com',
     'Primary hardware distributor. Net 30 terms locked in. Marcus is our rep — call directly for backorder status.'),

    (v_anixter, v_tenant, 'Anixter / Wesco', 'Cabling', 'active',
     'PCSS-ANX-8870', 'Net 30', 'wesco.com', '(800) 323-8167',
     'customerservice@wesco.com', 'Glenview', 'IL',
     'Diane Flores', '(847) 555-0219', 'd.flores@wesco.com',
     'Use for bulk cable and conduit. Better Cat6 bulk pricing than ADI.'),

    (v_axis, v_tenant, 'Axis Communications', 'Security', 'preferred',
     'PCSS-AXS-2201', 'Net 30', 'axis.com', '(800) 444-2947',
     'orders.us@axis.com', 'Chelmsford', 'MA',
     'Tom Nakamura', '(978) 555-0144', 't.nakamura@axis.com',
     'Direct Axis partner account. Loop Tom in on large camera specs for volume pricing.'),

    (v_verkada, v_tenant, 'Verkada', 'Security', 'preferred',
     'PCSS-VRK-0557', 'Net 15', 'verkada.com', '(415) 231-7277',
     'orders@verkada.com', 'San Mateo', 'CA',
     'Priya Nair', '(415) 555-0193', 'p.nair@verkada.com',
     'Verkada Cloud Managed reseller. Priya handles NFR units and demo stock.'),

    (v_biamp, v_tenant, 'Biamp Systems', 'AV', 'active',
     'PCSS-BAP-3318', 'Net 45', 'biamp.com', '(503) 641-7287',
     'customerservice@biamp.com', 'Beaverton', 'OR',
     'Carlos Estrada', '(503) 555-0167', 'c.estrada@biamp.com',
     'Net 45 — plan cash flow on large AV jobs. Carlos can get 5-8% project pricing on DSPs over $10K.'),

    (v_leviton, v_tenant, 'Leviton', 'Networking', 'active',
     'PCSS-LEV-7740', 'Net 30', 'leviton.com', '(800) 323-8920',
     'prosupport@leviton.com', 'Little Neck', 'NY',
     null, null, null,
     'Order through distributor portal — no dedicated rep at this volume.'),

    (v_midatl, v_tenant, 'Middle Atlantic Products', 'AV', 'active',
     'PCSS-MAP-6629', 'Net 30', 'middleatlantic.com', '(800) 266-7255',
     'sales@middleatlantic.com', 'Fairfield', 'NJ',
     'Jess Thornton', '(973) 555-0208', 'j.thornton@middleatlantic.com',
     'Racks, enclosures, power distribution. Jess can expedite rack builds with enough lead time.');

  -- ── Purchase Orders ───────────────────────────────────────────────────
  insert into purchase_orders
    (id, tenant_id, po_number, vendor_id, status, order_date, expected_date,
     received_date, vendor_order_number, tracking_number,
     linked_project_id, linked_work_order_id, notes)
  values

    (v_po1,  v_tenant, 'PO-1169', v_anixter, 'cancelled',
     '2026-03-20', '2026-03-28', null, null, null, null, null,
     'Cancelled — quote came in over budget. Switched to ADI for better pricing on this SKU.'),

    (v_po2,  v_tenant, 'PO-1175', v_adi, 'received',
     '2026-04-02', '2026-04-07', '2026-04-05',
     'ADI-SO-247891', '1ZAX175023456789', null, null,
     'Bulk networking hardware restock.'),

    (v_po3,  v_tenant, 'PO-1176', v_adi, 'received',
     '2026-05-12', '2026-05-17', '2026-05-15',
     'ADI-SO-251334', '1ZAX176034567890', v_proj4, null,
     'Axis M3106 mini domes for Halcyon Classroom AV Phase 1.'),

    (v_po4,  v_tenant, 'PO-1177', v_verkada, 'received',
     '2026-05-25', '2026-05-30', '2026-05-28',
     'VRK-2026-04412', '784177012345678', v_proj5, null,
     'Verkada AD31 access controllers for Vertex HQ Conference Suite.'),

    (v_po5,  v_tenant, 'PO-1178', v_axis, 'received',
     '2026-05-29', '2026-06-03', '2026-06-01',
     'AXS-ORD-789234', '1ZAX178045678901', v_proj3, null,
     'Axis P3245-V cameras for Helio Surgical Center A/V Overhaul.'),

    (v_po6,  v_tenant, 'PO-1179', v_verkada, 'received',
     '2026-06-02', '2026-06-05', '2026-06-03',
     'VRK-2026-04889', '784179023456789', v_proj4, null,
     'Verkada CD52 cameras for Halcyon Classroom AV Phase 1.'),

    (v_po7,  v_tenant, 'PO-1180', v_adi, 'received',
     '2026-05-17', '2026-05-22', '2026-05-20',
     'ADI-SO-250107', '1ZAX180056789012', null, null,
     'Leviton networking components — general stock top-up.'),

    (v_po8,  v_tenant, 'PO-1181', v_adi, 'partial',
     '2026-06-04', '2026-06-09', null,
     'ADI-SO-253781', '1ZAX181067890123', v_proj2, null,
     'Axis cameras and access controllers for Pinecrest Lobby Video Wall. M3106 mini domes on backorder — ADI ETA June 15.'),

    (v_po9,  v_tenant, 'PO-1182', v_biamp, 'sent',
     '2026-06-06', '2026-06-12', null,
     'BAP-ORD-031245', null, v_proj2, null,
     'Biamp Tesira DSP + Parle ceiling mics for Pinecrest Lobby Video Wall.'),

    (v_po10, v_tenant, 'PO-1183', v_verkada, 'draft',
     '2026-06-07', null, null, null, null, null, null,
     'Quarterly Verkada camera restock — confirm quantities with PM before sending.'),

    (v_po11, v_tenant, 'PO-1184', v_leviton, 'sent',
     '2026-05-30', '2026-06-05', null,
     'LV-PO-089234', null, v_proj5, null,
     'Equipment rack for Vertex HQ Conference Suite. Leviton shipment not yet confirmed received.');

  -- ── PO Line Items ─────────────────────────────────────────────────────
  insert into po_line_items
    (tenant_id, po_id, catalog_item_id, description, sku,
     qty_ordered, qty_received, unit_cost, sort_order)
  values

    -- PO-1169 (Anixter, cancelled)
    (v_tenant, v_po1,  v_ci_tesira, 'Biamp Tesira Forte AVB VT4',           'BA-TESIRA-VT4', 2,  0,  2450.00, 1),

    -- PO-1175 (ADI, received — general stock)
    (v_tenant, v_po2,  v_ci_lev5e,  'Leviton GigaMax 5e QuickPort Jack',    'LV-5G108-RW5', 25, 25,   28.00, 1),
    (v_tenant, v_po2,  null,        'Single-Gang Low-Voltage Mounting Plate','MISC-SGMNT',   50, 50,    3.00, 2),

    -- PO-1176 (ADI, received — Halcyon Phase 1)
    (v_tenant, v_po3,  v_ci_m3106,  'Axis M3106-L MkII Mini Dome',          'AX-M3106L',    10, 10,  180.00, 1),
    (v_tenant, v_po3,  null,        'Cat6 Bulk Cable 1000ft Box',            'CAT6-BULK-1K',  5,  5,  110.00, 2),

    -- PO-1177 (Verkada, received — Vertex HQ)
    (v_tenant, v_po4,  v_ci_ad31,   'Verkada AD31 Access Controller',        'VK-AD31',       8,  8,  890.00, 1),

    -- PO-1178 (Axis, received — Helio Surgical Center)
    (v_tenant, v_po5,  v_ci_p3245,  'Axis P3245-V Fixed Dome Camera',       'AX-P3245-V',   24, 24,  420.00, 1),

    -- PO-1179 (Verkada, received — Halcyon Phase 1)
    (v_tenant, v_po6,  v_ci_cd52,   'Verkada CD52 Indoor Dome Camera',      'VK-CD52',      12, 12,  590.00, 1),

    -- PO-1180 (ADI, received — general stock)
    (v_tenant, v_po7,  v_ci_lev5e,  'Leviton GigaMax 5e QuickPort Jack',    'LV-5G108-RW5', 30, 30,   28.00, 1),

    -- PO-1181 (ADI, partial — Pinecrest Video Wall)
    (v_tenant, v_po8,  v_ci_p3245,  'Axis P3245-V Fixed Dome Camera',       'AX-P3245-V',    8,  8,  420.00, 1),
    (v_tenant, v_po8,  v_ci_m3106,  'Axis M3106-L MkII Mini Dome',          'AX-M3106L',    12,  0,  180.00, 2),
    (v_tenant, v_po8,  v_ci_a1001,  'Axis A1001 Network Door Controller',   'AX-A1001',      4,  4,  680.00, 3),

    -- PO-1182 (Biamp, sent — Pinecrest Video Wall)
    (v_tenant, v_po9,  v_ci_tesira, 'Biamp Tesira Forte AVB VT4',           'BA-TESIRA-VT4', 3,  0, 2240.00, 1),
    (v_tenant, v_po9,  v_ci_parle,  'Biamp Parle TCM-1 Ceiling Mic',        'BA-PARLE-TCM1', 6,  0,  890.00, 2),

    -- PO-1183 (Verkada, draft — quarterly restock)
    (v_tenant, v_po10, v_ci_cd52,   'Verkada CD52 Indoor Dome Camera',      'VK-CD52',      10,  0,  590.00, 1),
    (v_tenant, v_po10, v_ci_ad31,   'Verkada AD31 Access Controller',       'VK-AD31',       4,  0,  890.00, 2),

    -- PO-1184 (Leviton, sent — Vertex HQ)
    (v_tenant, v_po11, v_ci_rack,   'Leviton 42" 2-Post Open Frame Rack',   'LV-47612-FR',   4,  0,  285.00, 1);

  -- ── Invoices ──────────────────────────────────────────────────────────
  -- Subtotals verified against line items below.
  -- Tax rate of 0 = tax-exempt (Halcyon educational). All others have state/local rates.
  insert into invoices
    (id, tenant_id, invoice_number, status, company_name, contact_name,
     linked_project_id, issued_date, due_date, payment_terms,
     subtotal, tax_rate, tax_amount, total, amount_paid, balance_due, notes)
  values

    -- Northbeam: completed project, paid in full
    (v_inv1,  v_tenant, 'INV-04809', 'paid',
     'Northbeam Architects', 'Audrey Chen', v_proj1,
     '2026-05-22', '2026-06-21', 'Net 30',
     12886, 0.08, 1030.88, 13916.88, 13916.88, 0, ''),

    -- Pinecrest: 50% deposit received, milestone 2 pending
    (v_inv2,  v_tenant, 'INV-04790', 'partial',
     'Pinecrest Hospitality Group', 'Marcus Bell', v_proj2,
     '2026-06-03', '2026-07-03', 'Net 30',
     102000, 0.0825, 8415.00, 110415.00, 55207.50, 55207.50,
     '50% deposit per contract. Balance due upon substantial completion.'),

    -- Pinecrest: milestone 2 invoice, awaiting approval
    (v_inv3,  v_tenant, 'INV-04794', 'sent',
     'Pinecrest Hospitality Group', 'Marcus Bell', v_proj2,
     '2026-06-17', '2026-07-17', 'Net 30',
     40880, 0.0825, 3372.60, 44252.60, 0, 44252.60,
     'Milestone 2 — cable pull and structural mount complete. Approved by Marcus Bell June 15.'),

    -- Helio: overdue (original AV scope)
    (v_inv4,  v_tenant, 'INV-04806', 'overdue',
     'Helio Health Systems', 'Priya Anand', v_proj3,
     '2026-05-18', '2026-06-17', 'Net 30',
     51700, 0.029, 1499.30, 53199.30, 0, 53199.30,
     'AP: finance@heliohealth.org — PO# HHS-2026-0441 required on remittance.'),

    -- Helio: milestone 2, sent
    (v_inv5,  v_tenant, 'INV-04812', 'sent',
     'Helio Health Systems', 'Priya Anand', v_proj3,
     '2026-06-03', '2026-07-03', 'Net 30',
     40880, 0.029, 1185.52, 42065.52, 0, 42065.52,
     'PO# HHS-2026-0448 required on remittance.'),

    -- Halcyon: completed project, paid in full (tax-exempt)
    (v_inv6,  v_tenant, 'INV-04802', 'paid',
     'Halcyon Public Schools', 'Damon Reyes', v_proj4,
     '2026-07-20', '2026-08-19', 'Net 30',
     21810, 0, 0, 21810, 21810, 0,
     'Tax exempt — educational institution. Cert on file. Final payment received Aug 15.'),

    -- Vertex: draft invoice for on-hold project
    (v_inv7,  v_tenant, 'INV-04815', 'draft',
     'Vertex Capital Partners', 'Noor Saleh', v_proj5,
     '2026-06-06', '2026-07-06', 'Net 30',
     33362, 0.0625, 2085.13, 35447.13, 0, 35447.13,
     'Draft — pending scope sign-off from Noor. Conference Suite project still on hold.'),

    -- Vertex: partial deposit on on-hold project
    (v_inv8,  v_tenant, 'INV-04811', 'partial',
     'Vertex Capital Partners', 'Iris Wang', v_proj5,
     '2026-05-28', '2026-06-27', 'Net 30',
     31580, 0.0625, 1973.75, 33553.75, 15000, 18553.75,
     '50% deposit received. Balance due upon punch-list sign-off once hold is lifted.'),

    -- Cinder & Oak: overdue, no project (pre-loss scope work)
    (v_inv9,  v_tenant, 'INV-04799', 'overdue',
     'Cinder & Oak Hospitality', 'Hugo Albright', null,
     '2026-05-04', '2026-06-03', 'Net 30',
     8030, 0.0925, 742.78, 8772.78, 0, 8772.78,
     'Second reminder sent Jun 10. Follow up directly with owner.'),

    -- Arden & Loom: paid consulting invoice (site survey before full scope)
    (v_inv10, v_tenant, 'INV-04795', 'paid',
     'Arden & Loom Studios', 'Lena Romero', null,
     '2026-04-28', '2026-05-28', 'Net 30',
     7034, 0.1025, 720.99, 7754.99, 7754.99, 0,
     'Site survey, acoustic assessment, and control room concept design.');

  -- ── Invoice Line Items ────────────────────────────────────────────────
  insert into invoice_line_items
    (invoice_id, description, qty, unit_price, total, sort_order)
  values

    -- INV-04809 (Northbeam): subtotal = 12,886
    (v_inv1, 'Samsung 75" QM75B Commercial Display',      2,   3200,  6400, 0),
    (v_inv1, 'Logitech Rally Bar Mini UC Video Bar',       2,   1299,  2598, 1),
    (v_inv1, 'HDMI 2.1 Active Cable 15ft',                6,     48,   288, 2),
    (v_inv1, 'Ceiling-Recessed Speaker Pair',             2,    420,   840, 3),
    (v_inv1, 'Installation & Configuration Labor',        24,   115,  2760, 4),

    -- INV-04790 (Pinecrest deposit): subtotal = 102,000
    (v_inv2, 'Samsung IFR LED Cabinet Panel 900x450mm',  24,   3400, 81600, 0),
    (v_inv2, 'Novastar MCTRL4K LED Video Processor',      1,   6200,  6200, 1),
    (v_inv2, 'Custom Structural Mounting Frame',          1,   4500,  4500, 2),
    (v_inv2, 'Signal & Power Distribution Package',       1,   2800,  2800, 3),
    (v_inv2, 'LED Wall Structural Install Labor',         60,   115,  6900, 4),

    -- INV-04794 (Pinecrest milestone 2): subtotal = 40,880
    (v_inv3, 'Crestron DM-NVX-D80 AV over IP Decoder',   2,   2100,  4200, 0),
    (v_inv3, 'Shure MXA920 Ceiling Array Microphone',     1,   2800,  2800, 1),
    (v_inv3, 'Biamp TesiraFORTE AVB VT4 DSP',             1,   3400,  3400, 2),
    (v_inv3, 'AV Systems Integration Labor',             40,    145,  5800, 3),
    (v_inv3, 'Rack Build & Wiring Labor',                24,    115,  2760, 4),
    (v_inv3, 'Cable Pull & Termination (per drop)',       76,    85,  6460, 5),
    (v_inv3, 'Structural Mount Material & Labor',         1,  15460, 15460, 6),

    -- INV-04806 (Helio overdue): subtotal = 51,700
    (v_inv4, 'LG 55" Medical-Grade Display DICOM',        4,   4200, 16800, 0),
    (v_inv4, 'Extron XTP CrossPoint 1600 Matrix Switcher',1,  18500, 18500, 1),
    (v_inv4, 'Biamp Devio SCX-20 Room Kit',               2,   2200,  4400, 2),
    (v_inv4, 'Rack Equipment & Cable Management',         1,   1800,  1800, 3),
    (v_inv4, 'Engineering & Project Management',         20,    165,  3300, 4),
    (v_inv4, 'Installation Labor',                       60,    115,  6900, 5),

    -- INV-04812 (Helio milestone 2): subtotal = 40,880
    (v_inv5, 'Crestron DM-MD6X6-CPU3 6x6 Matrix',        1,   4800,  4800, 0),
    (v_inv5, 'Crestron TSW-770 7" Wall Touchpanel',       4,   1600,  6400, 1),
    (v_inv5, 'Epson EB-PU2220B Laser Projector',          2,   9800, 19600, 2),
    (v_inv5, 'Draper Motorized Projection Screen 133"',   2,   2400,  4800, 3),
    (v_inv5, 'Crestron Control System Programming',      32,    165,  5280, 4),

    -- INV-04802 (Halcyon, tax-exempt): subtotal = 21,810
    (v_inv6, 'Axis P3245-V Fixed Dome Camera',           12,    380,  4560, 0),
    (v_inv6, 'Verkada Door Access Controller (6-door)',   3,   1400,  4200, 1),
    (v_inv6, 'Verkada Access Badge Reader',              18,    220,  3960, 2),
    (v_inv6, 'Cat6A Cable Pull & Termination (per drop)',42,     85,  3570, 3),
    (v_inv6, 'Security System Labor & Commissioning',    48,    115,  5520, 4),

    -- INV-04815 (Vertex draft): subtotal = 33,362
    (v_inv7, 'Cisco Catalyst 9300-48P PoE+ Switch',       2,   5800, 11600, 0),
    (v_inv7, 'Cisco Catalyst 9200L-24P PoE Switch',       4,   2200,  8800, 1),
    (v_inv7, 'Ubiquiti UniFi AP U6 Pro',                 18,    179,  3222, 2),
    (v_inv7, 'Middle Atlantic WRK-44-27 Equipment Rack',  2,   1100,  2200, 3),
    (v_inv7, 'Network Install & Configuration Labor',    52,    145,  7540, 4),

    -- INV-04811 (Vertex partial): subtotal = 31,580
    (v_inv8, 'Samsung 98" QN900D Neo QLED Display',       1,  14000, 14000, 0),
    (v_inv8, 'Shure MXA920 Ceiling Array Microphone',     1,   2800,  2800, 1),
    (v_inv8, 'Biamp TesiraFORTE AVB VT4 DSP',             1,   3400,  3400, 2),
    (v_inv8, 'AV Systems Integration Labor',             40,    145,  5800, 3),
    (v_inv8, 'Rack Build & Wiring Labor',                12,    115,  1380, 4),
    (v_inv8, 'Crestron DM-NVX-D80 AV over IP Decoder',   2,   2100,  4200, 5),

    -- INV-04799 (Cinder overdue): subtotal = 8,030
    (v_inv9, 'Sonos Amp (bar & patio zone)',               4,    699,  2796, 0),
    (v_inv9, 'Sonos Era 100 Indoor Zone Speaker',          6,    249,  1494, 1),
    (v_inv9, 'TOA CS-304 Outdoor Ceiling Speaker Pair',    3,    480,  1440, 2),
    (v_inv9, 'Audio Zone Wiring & Installation Labor',    20,    115,  2300, 3),

    -- INV-04795 (Arden paid): subtotal = 7,034
    (v_inv10, 'Shure SM7dB Active Dynamic Microphone',    4,    499,  1996, 0),
    (v_inv10, 'Focusrite Scarlett 18i20 Interface',       2,    499,   998, 1),
    (v_inv10, 'Yamaha DXS15mkII Subwoofer',               2,   1100,  2200, 2),
    (v_inv10, 'Studio Wiring & Patch Bay Labor',         16,    115,  1840, 3);

  -- ── Invoice Payments ──────────────────────────────────────────────────
  insert into invoice_payments
    (tenant_id, invoice_id, date, amount, method, reference)
  values
    (v_tenant, v_inv1,  '2026-06-18', 13916.88, 'ach',         'NBA-ACH-0618'),
    (v_tenant, v_inv2,  '2026-06-04', 55207.50, 'wire',        'PHG-WIRE-0604'),
    (v_tenant, v_inv6,  '2026-08-15', 21810.00, 'check',       'HPS-CHK-44219'),
    (v_tenant, v_inv8,  '2026-06-05', 15000.00, 'wire',        'VCP-WIRE-0605'),
    (v_tenant, v_inv10, '2026-05-22',  7754.99, 'credit_card', 'CC-STRIPE-7F2A9');

end $$;
