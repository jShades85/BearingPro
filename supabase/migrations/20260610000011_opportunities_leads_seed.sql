-- Seed opportunities + leads for the default test tenant.
-- Uses name-based lookups so it's safe across any tenant UUID.

do $$
declare
  v_tenant   uuid := (select id from tenants order by created_at limit 1);

  -- Companies (from crm_seed + fix_operations_companies)
  v_northbeam  uuid := (select id from companies where name = 'Northbeam Architects'       and tenant_id = v_tenant limit 1);
  v_pinecrest  uuid := (select id from companies where name = 'Pinecrest Hospitality Group' and tenant_id = v_tenant limit 1);
  v_helio      uuid := (select id from companies where name = 'Helio Health Systems'        and tenant_id = v_tenant limit 1);
  v_vertex     uuid := (select id from companies where name = 'Vertex Capital Partners'     and tenant_id = v_tenant limit 1);
  v_halcyon    uuid := (select id from companies where name = 'Halcyon Public Schools'      and tenant_id = v_tenant limit 1);
  v_cinder     uuid := (select id from companies where name = 'Cinder & Oak Hospitality'   and tenant_id = v_tenant limit 1);
  v_arden      uuid := (select id from companies where name = 'Arden & Loom Studios'        and tenant_id = v_tenant limit 1);

  -- Contacts (from crm_seed)
  v_audrey     uuid := (select id from contacts where email = 'audrey@northbeam.co'    and tenant_id = v_tenant limit 1);
  v_marcus     uuid := (select id from contacts where email = 'mbell@pinecrest.com'    and tenant_id = v_tenant limit 1);
  v_priya_c    uuid := (select id from contacts where email = 'panand@heliohealth.org' and tenant_id = v_tenant limit 1);
  v_iris       uuid := (select id from contacts where email = 'iwang@vertexcap.io'     and tenant_id = v_tenant limit 1);
  v_damon      uuid := (select id from contacts where email = 'dreyes@halcyon.k12.or.us' and tenant_id = v_tenant limit 1);
  v_hugo       uuid := (select id from contacts where email = 'hugo@cinderoak.co'      and tenant_id = v_tenant limit 1);
  v_lena       uuid := (select id from contacts where email = 'lena@ardenloom.tv'      and tenant_id = v_tenant limit 1);

  -- Team members (from user_seed)
  v_sarah      uuid := (select id from user_profiles where email = 'sarah.kim@example.com'     limit 1);
  v_chris      uuid := (select id from user_profiles where email = 'chris.navarro@example.com' limit 1);

begin
  if v_tenant is null then return; end if;

  -- ── Opportunities ───────────────────────────────────────────────────────────

  insert into opportunities
    (tenant_id, title, company_id, contact_id, assigned_to,
     value, stage, close_date, source, priority, notes)
  values

    -- 1. Closed-won — linked to the Northbeam project
    (v_tenant, 'Northbeam Office A/V Expansion', v_northbeam, v_audrey, v_sarah,
     58000, 'closed-won', '2026-05-20', 'Referral', 'high',
     'Full conference room and lobby AV. Signed and in production.'),

    -- 2. Negotiation — Pinecrest lobby wall
    (v_tenant, 'Pinecrest Lobby Video Wall', v_pinecrest, v_marcus, v_sarah,
     185000, 'negotiation', '2026-07-01', 'Web Form', 'urgent',
     'Budget confirmed at $200k. Client requesting 5% discount. Counter at $185k.'),

    -- 3. Proposal sent — Vertex trading floor
    (v_tenant, 'Vertex Trading Floor Upgrade', v_vertex, v_iris, v_sarah,
     240000, 'proposal-sent', '2026-07-15', 'Referral', 'high',
     'Proposal v2 sent June 6. Awaiting sign-off from CTO. High-priority account.'),

    -- 4. Estimating — Helio paging overhaul
    (v_tenant, 'Helio Paging System Overhaul', v_helio, v_priya_c, v_chris,
     148000, 'estimating', '2026-08-01', 'Repeat Client', 'high',
     'Scope finalized. Building estimate for 4 additional campuses beyond current project.'),

    -- 5. Site visit — Halcyon Phase 2
    (v_tenant, 'Halcyon Classroom Rollout Phase 2', v_halcyon, v_damon, v_sarah,
     96000, 'site-visit', '2026-09-01', 'Repeat Client', 'med',
     'Phase 1 completing summer 2026. Phase 2 covers remaining 18 classrooms.'),

    -- 6. Site visit — Arden sound stage
    (v_tenant, 'Arden Sound Stage Control Room', v_arden, v_lena, v_sarah,
     72000, 'site-visit', '2026-08-15', 'Phone', 'med',
     'Visited site June 3. Complex routing requirements. Budget still TBD with client.'),

    -- 7. Closed-lost — Cinder & Oak
    (v_tenant, 'Cinder & Oak New Location A/V', v_cinder, v_hugo, v_sarah,
     45000, 'closed-lost', '2026-05-15', 'Cold Outreach', 'low',
     'Lost to lower bid. Follow up Q4 when new Nashville location opens.');


  -- ── Leads ───────────────────────────────────────────────────────────────────

  insert into leads
    (tenant_id, first_name, last_name, company_name, phone, email,
     source, service_interest, location, status, assigned_to, notes)
  values

    -- 1. New — web form, residential home theater
    (v_tenant, 'Rachel', 'Nguyen', null,
     '(469) 555-3391', 'rachel.nguyen@gmail.com',
     'Web Form', 'Home Theater & Whole-Home Audio', 'Frisco, TX',
     'new', v_sarah,
     'Submitted form June 8. Wants 4K projector setup and multi-room Sonos. Budget unspecified.'),

    -- 2. Contacted — phone, conference room upgrade
    (v_tenant, 'Brian', 'Kowalski', 'Kowalski & Partners Law',
     '(414) 555-0872', 'bkowalski@kplaw.com',
     'Phone', 'Conference Room A/V', 'Milwaukee, WI',
     'contacted', v_sarah,
     'Called in June 5. Looking to upgrade 3 conference rooms before September. Left voicemail June 8.'),

    -- 3. Qualified — referral, retail display
    (v_tenant, 'Patricia', 'Okonkwo', 'Okonkwo Boutique',
     '(773) 555-6614', 'patricia@okonkwoboutique.com',
     'Referral', 'Digital Signage & Retail Display', 'Chicago, IL',
     'qualified', v_sarah,
     'Referred by Northbeam. Opening new flagship store in August. Budget $15–25k. Ready to move forward.'),

    -- 4. New — email, gym sound system
    (v_tenant, 'Derek', 'Sutton', 'Iron District Gym',
     '(312) 555-4490', 'derek@irondistrict.com',
     'Email', 'Commercial Sound System', 'Chicago, IL',
     'new', null,
     'Emailed June 7. Two-floor gym, wants distributed audio with zone control. No response yet.'),

    -- 5. Contacted — walk-in, outdoor event AV
    (v_tenant, 'Simone', 'Hargrove', 'Hargrove Events Co.',
     '(615) 555-2287', 'simone@hargroveevents.com',
     'Walk-in', 'Outdoor Event A/V', 'Nashville, TN',
     'contacted', v_sarah,
     'Walked in June 4. Event rental company looking for portable outdoor PA and projection. Meeting scheduled June 12.'),

    -- 6. Dismissed — wrong fit
    (v_tenant, 'Tommy', 'Birch', null,
     '(800) 555-0000', 'tbirch@tempmail.com',
     'Web Form', 'Home Security', 'Unknown',
     'dismissed', null,
     'Looking for DIY home security cameras only. Outside our service scope.');

end $$;
