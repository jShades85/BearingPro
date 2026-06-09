do $$
declare
  v_tenant_id uuid;
  -- team members for account_manager_id
  v_user_1 uuid; -- owner (index 0)
  v_user_2 uuid; -- index 1
  v_user_3 uuid; -- index 2
  v_user_4 uuid; -- index 3
  v_user_5 uuid; -- index 4
  -- company IDs (look up from seed data)
  v_vertex   uuid;
  v_helio    uuid;
  v_pinecrest uuid;
  v_northbeam uuid;
  v_arden    uuid;
  v_quay     uuid;
  v_halcyon  uuid;
  v_cinder   uuid;
begin
  select id into v_tenant_id from tenants limit 1;
  if v_tenant_id is null then return; end if;

  if exists (select 1 from service_plans where tenant_id = v_tenant_id limit 1) then
    return;
  end if;

  -- grab up to 5 team members
  select id into v_user_1 from user_profiles where tenant_id = v_tenant_id order by created_at limit 1 offset 0;
  select id into v_user_2 from user_profiles where tenant_id = v_tenant_id order by created_at limit 1 offset 1;
  select id into v_user_3 from user_profiles where tenant_id = v_tenant_id order by created_at limit 1 offset 2;
  select id into v_user_4 from user_profiles where tenant_id = v_tenant_id order by created_at limit 1 offset 3;
  select id into v_user_5 from user_profiles where tenant_id = v_tenant_id order by created_at limit 1 offset 4;

  -- look up companies by name
  select id into v_vertex    from companies where tenant_id = v_tenant_id and name ilike '%Vertex%'    limit 1;
  select id into v_helio     from companies where tenant_id = v_tenant_id and name ilike '%Helio%'     limit 1;
  select id into v_pinecrest from companies where tenant_id = v_tenant_id and name ilike '%Pinecrest%' limit 1;
  select id into v_northbeam from companies where tenant_id = v_tenant_id and name ilike '%Northbeam%' limit 1;
  select id into v_quay      from companies where tenant_id = v_tenant_id and name ilike '%Quay%'      limit 1;
  select id into v_halcyon   from companies where tenant_id = v_tenant_id and name ilike '%Halcyon%'   limit 1;
  select id into v_cinder    from companies where tenant_id = v_tenant_id and name ilike '%Cinder%'    limit 1;

  insert into service_plans (
    tenant_id, code, customer_name, company_id, contact_name, phone, site_address,
    tier, covered_systems, mrr, billing_cycle, sla_response,
    visits_per_year, visits_used, start_date, renewal_date,
    status, account_manager_id, notes, activity
  ) values
  (
    v_tenant_id, 'SP-2026-008', 'Vertex Capital Partners', v_vertex,
    'Iris Wang', '(312) 555-9090', '200 W Madison St, Chicago, IL 60606',
    'Elite', array['Security', 'Surveillance', 'Networking'],
    1850, 'Monthly', '2 hours', 12, 5,
    '2026-01-01', '2027-01-01', 'active', v_user_1,
    'Key account — any visit requires 48hr notice to building security.',
    '[
      {"time":"Jun 06, 10:00 AM","actor":"Chris Navarro","text":"Monthly visit completed — all systems nominal"},
      {"time":"May 06, 9:30 AM","actor":"Riley Torres","text":"Monthly visit completed — camera firmware updated"},
      {"time":"Jan 01, 8:00 AM","actor":"Chris Navarro","text":"Plan activated — Elite tier"}
    ]'::jsonb
  ),
  (
    v_tenant_id, 'SP-2026-007', 'Helio Health Systems', v_helio,
    'Priya Anand', '(303) 555-2230', '1719 E 19th Ave, Denver, CO 80206',
    'Elite', array['AV / Audio', 'Surveillance', 'Networking'],
    2100, 'Monthly', '2 hours', 12, 6,
    '2025-07-01', '2026-07-01', 'active', v_user_2,
    'HIPAA-sensitive environment. All techs must sign visitor log. No personal devices in surgical suites.',
    '[
      {"time":"Jun 01, 9:00 AM","actor":"Riley Torres","text":"Monthly visit — wireless mic frequencies recoordinated"},
      {"time":"May 01, 10:00 AM","actor":"Riley Torres","text":"Monthly visit — telehealth cart AV confirmed"}
    ]'::jsonb
  ),
  (
    v_tenant_id, 'SP-2026-006', 'Pinecrest Hospitality Group', v_pinecrest,
    'Marcus Bell', '(512) 555-0911', '905 Congress Ave, Austin, TX 78701',
    'Professional', array['AV / Audio', 'Access Control'],
    980, 'Quarterly', '4 hours', 4, 2,
    '2026-01-15', '2027-01-15', 'active', v_user_3,
    '',
    '[
      {"time":"Apr 15, 9:00 AM","actor":"Mike Okafor","text":"Q2 visit completed — lobby AV and access control inspected"},
      {"time":"Jan 15, 9:00 AM","actor":"Mike Okafor","text":"Q1 visit completed — plan activated"}
    ]'::jsonb
  ),
  (
    v_tenant_id, 'SP-2026-005', 'Northbeam Architects', v_northbeam,
    'Audrey Chen', '(718) 555-0142', '44 Berry St, Brooklyn, NY 11211',
    'Professional', array['AV / Audio'],
    720, 'Monthly', '4 hours', 4, 2,
    '2025-07-01', '2026-07-01', 'expiring', v_user_4,
    'Renewal discussion needed — Audrey hinted at upgrading to Elite given new penthouse project.',
    '[
      {"time":"Jun 01, 2:00 PM","actor":"Jordan Vale","text":"Renewal reminder sent — 30 days to expiry"},
      {"time":"Apr 01, 9:00 AM","actor":"Jordan Vale","text":"Q2 visit completed — conference room AV inspected"}
    ]'::jsonb
  ),
  (
    v_tenant_id, 'SP-2026-004', 'Arden & Loom Studios', null,
    'Lena Romero', '(323) 555-7741', '5200 Lankershim Blvd, Los Angeles, CA 91601',
    'Professional', array['AV / Audio', 'Networking'],
    860, 'Monthly', '4 hours', 4, 1,
    '2026-03-01', '2027-03-01', 'active', v_user_5,
    '',
    '[
      {"time":"Mar 01, 9:00 AM","actor":"Dana Park","text":"Plan activated — Q1 visit completed, DSP baseline documented"}
    ]'::jsonb
  ),
  (
    v_tenant_id, 'SP-2026-003', 'Quay Residential', v_quay,
    'Theodore Fox', '(305) 555-1108', '1408 Bayshore Dr, Miami, FL 33132',
    'Standard', array['Smart Home', 'AV / Audio'],
    290, 'Monthly', '8 hours', 2, 1,
    '2026-01-01', '2027-01-01', 'active', v_user_2,
    'Residential client — schedule visits Tue–Thu only. Contact Theodore directly, not the property manager.',
    '[
      {"time":"Apr 01, 10:00 AM","actor":"Riley Torres","text":"H1 visit completed — Lutron and Sonos systems checked"},
      {"time":"Jan 01, 9:00 AM","actor":"Riley Torres","text":"Plan activated"}
    ]'::jsonb
  ),
  (
    v_tenant_id, 'SP-2026-002', 'Halcyon Public Schools', v_halcyon,
    'Damon Reyes', '(503) 555-4422', '1010 SE Powell Blvd, Portland, OR 97202',
    'Standard', array['AV / Audio'],
    420, 'Annual', '8 hours', 2, 0,
    '2026-09-01', '2027-09-01', 'pending', v_user_4,
    'Contract signed — plan starts Sep 1 with new school year. First visit scheduled for Sep 10.',
    '[
      {"time":"Jun 05, 11:00 AM","actor":"Jordan Vale","text":"Contract signed — plan created, pending start date Sep 1"}
    ]'::jsonb
  ),
  (
    v_tenant_id, 'SP-2025-011', 'Cinder & Oak Hospitality', v_cinder,
    'Hugo Albright', '(615) 555-3201', '112 3rd Ave S, Nashville, TN 37201',
    'Essential', array['AV / Audio'],
    150, 'Annual', 'Next business day', 1, 1,
    '2025-06-01', '2026-06-01', 'expired', v_user_3,
    'Plan lapsed — Hugo was unresponsive to renewal outreach. Follow up Q3 2026.',
    '[
      {"time":"Jun 01, 8:00 AM","actor":"Mike Okafor","text":"Plan expired — no renewal response"},
      {"time":"May 15, 9:00 AM","actor":"Mike Okafor","text":"Renewal reminder sent — no reply"},
      {"time":"Jun 01, 2025, 10:00 AM","actor":"Mike Okafor","text":"Annual visit completed — plan activated"}
    ]'::jsonb
  );
end $$;
