-- Seed projects + work orders for the default test tenant.
-- Uses name-based lookups so it's safe across any tenant UUID.

do $$
declare
  v_tenant   uuid := (select id from tenants order by created_at limit 1);

  -- Companies (from crm_seed)
  v_nexgen   uuid := (select id from companies where name = 'NexGen A/V Solutions'   and tenant_id = v_tenant limit 1);
  v_helio    uuid := (select id from companies where name = 'Helio Health Systems'    and tenant_id = v_tenant limit 1);
  v_crestline uuid:= (select id from companies where name = 'Crestline Hotels Group'  and tenant_id = v_tenant limit 1);
  v_lakewood  uuid:= (select id from companies where name = 'Lakewood Academy'         and tenant_id = v_tenant limit 1);
  v_harbor   uuid := (select id from companies where name = 'Harbor View Properties'  and tenant_id = v_tenant limit 1);

  -- Team members (from user_seed)
  v_chris    uuid := (select id from user_profiles where email = 'chris.navarro@example.com' limit 1);
  v_sarah    uuid := (select id from user_profiles where email = 'sarah.kim@example.com'     limit 1);
  v_riley    uuid := (select id from user_profiles where email = 'riley.torres@example.com'  limit 1);
  v_mike     uuid := (select id from user_profiles where email = 'mike.okafor@example.com'   limit 1);
  v_jordan   uuid := (select id from user_profiles where email = 'jordan.vale@example.com'   limit 1);
  v_priya    uuid := (select id from user_profiles where email = 'priya.anand@example.com'   limit 1);

begin

  -- ── Projects ──────────────────────────────────────────────────────────────

  insert into projects
    (id, tenant_id, code, name, company_id, site_address, status,
     contract_value, budgeted_cost, budgeted_hours,
     start_date, target_end_date, pm_id, notes)
  values

    -- 1. Large multi-room hotel AV install — in progress
    (gen_random_uuid(), v_tenant,
     'AV-2026-001', 'Grand Ballroom A/V System', v_crestline,
     '700 Lake Shore Dr, Chicago, IL 60611',
     'in-progress', 184500, 118000, 420,
     '2026-05-01', '2026-07-09', v_chris,
     'Full ballroom install: 4K laser projectors, distributed audio, confidence monitors, and AV control system.'),

    -- 2. Healthcare facility overhaul — in progress
    (gen_random_uuid(), v_tenant,
     'AV-2026-002', 'Surgical Center A/V Overhaul', v_helio,
     '1719 E 19th Ave, Denver, CO 80206',
     'in-progress', 148000, 96000, 310,
     '2026-05-15', '2026-08-01', v_chris,
     'Replace legacy paging and video conferencing across 12 procedure rooms. Infection-control cable routing required.'),

    -- 3. School district — scheduled
    (gen_random_uuid(), v_tenant,
     'AV-2026-003', 'Lakewood Academy Classroom Rollout', v_lakewood,
     '4200 W Peterson Ave, Chicago, IL 60646',
     'scheduled', 96000, 62000, 240,
     '2026-07-14', '2026-08-22', v_riley,
     '24 classrooms — interactive flat panels, ceiling speakers, teacher control tablets. Summer break window.'),

    -- 4. Corporate HQ build-out — on hold
    (gen_random_uuid(), v_tenant,
     'AV-2026-004', 'NexGen HQ Conference Suite', v_nexgen,
     '233 S Wacker Dr, Chicago, IL 60606',
     'on-hold', 72000, 48000, 180,
     '2026-06-01', '2026-07-15', v_chris,
     'On hold pending client interior construction completion. Estimated 3-week delay.'),

    -- 5. Completed project
    (gen_random_uuid(), v_tenant,
     'AV-2026-005', 'Harbor View Lobby Display Wall', v_harbor,
     '900 N Michigan Ave, Chicago, IL 60611',
     'completed', 38500, 24000, 95,
     '2026-04-01', '2026-04-30', v_riley,
     'LED video wall installation in main lobby. 5×3 panel configuration, content management system included.');


  -- ── Work Orders ──────────────────────────────────────────────────────────

  insert into work_orders
    (id, tenant_id, code, name, company_id, site_address, status,
     contract_value, budgeted_hours, scheduled_date, assigned_to, notes)
  values

    -- 1. Scheduled service call
    (gen_random_uuid(), v_tenant,
     'WO-0001', 'Projector Calibration — Board Room', v_nexgen,
     '233 S Wacker Dr, Chicago, IL 60606',
     'scheduled', 850, 2,
     '2026-06-16', v_mike,
     'Annual calibration for (2) Christie 4K projectors. Customer reports color shift on screen B.'),

    -- 2. In progress repair
    (gen_random_uuid(), v_tenant,
     'WO-0002', 'Helio PA System Fault', v_helio,
     '1719 E 19th Ave, Denver, CO 80206',
     'in-progress', 1200, 4,
     '2026-06-10', v_jordan,
     'Zone 3 amplifier reporting fault code E-04. Possible DSP failure. Parts on order.'),

    -- 3. Scheduled maintenance
    (gen_random_uuid(), v_tenant,
     'WO-0003', 'Quarterly AV Maintenance — Crestline East Wing', v_crestline,
     '700 Lake Shore Dr, Chicago, IL 60611',
     'scheduled', 2400, 6,
     '2026-06-18', v_mike,
     'Q2 preventive maintenance: clean lenses, check cable terminations, update firmware on all control processors.'),

    -- 4. Completed repair
    (gen_random_uuid(), v_tenant,
     'WO-0004', 'Microphone System Replacement', v_lakewood,
     '4200 W Peterson Ave, Chicago, IL 60646',
     'completed', 3200, 5,
     '2026-05-28', v_jordan,
     'Replaced 3x lapel and 2x handheld wireless mic systems. Old Sennheiser units exceeded end-of-life.'),

    -- 5. Urgent service call
    (gen_random_uuid(), v_tenant,
     'WO-0005', 'Control System Unresponsive — Harbor Lobby', v_harbor,
     '900 N Michigan Ave, Chicago, IL 60611',
     'scheduled', 450, 1,
     '2026-06-11', v_mike,
     'Client reports lobby display wall not waking from standby. Likely Crestron processor reboot needed.');

end $$;
