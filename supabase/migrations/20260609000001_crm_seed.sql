-- Seed test companies + contacts for the first tenant.
-- Safe to run on any environment; skips if no tenant exists.

DO $$
DECLARE
  tid  uuid;
  c_northbeam   uuid;
  c_pinecrest   uuid;
  c_helio       uuid;
  c_vertex      uuid;
  c_halcyon     uuid;
  c_cinder      uuid;
  c_arden       uuid;
BEGIN
  SELECT id INTO tid FROM tenants LIMIT 1;
  IF tid IS NULL THEN RETURN; END IF;

  -- ─── Companies ──────────────────────────────────────────────────────────────

  INSERT INTO companies (tenant_id, name, industry, stage, phone, email, website, city, state, billing_address, service_address, notes)
  VALUES (tid, 'Northbeam Architects', 'AV & Technology', 'active',
          '(718) 555-0142', 'contact@northbeam.co', 'northbeam.co',
          'Brooklyn', 'NY', '44 Berry St, Brooklyn, NY 11211', '44 Berry St, Brooklyn, NY 11211',
          'Long-term AV client. Multiple active projects each year.')
  RETURNING id INTO c_northbeam;

  INSERT INTO companies (tenant_id, name, industry, stage, phone, email, website, city, state, billing_address, service_address, notes)
  VALUES (tid, 'Pinecrest Hospitality Group', 'Hospitality', 'active',
          '(512) 555-0911', 'av@pinecrest.com', 'pinecresthospitality.com',
          'Austin', 'TX', '905 Congress Ave, Austin, TX 78701', '905 Congress Ave, Austin, TX 78701',
          'Regional hotel group. Large lobby video wall project in progress.')
  RETURNING id INTO c_pinecrest;

  INSERT INTO companies (tenant_id, name, industry, stage, phone, email, website, city, state, billing_address, service_address, notes)
  VALUES (tid, 'Helio Health Systems', 'Healthcare', 'active',
          '(303) 555-2230', 'facilities@heliohealth.org', 'heliohealth.org',
          'Denver', 'CO', '1719 E 19th Ave, Denver, CO 80218', '1719 E 19th Ave, Denver, CO 80218',
          'Multi-site health system. AV overhaul across surgical centers.')
  RETURNING id INTO c_helio;

  INSERT INTO companies (tenant_id, name, industry, stage, phone, email, website, city, state, billing_address, service_address, notes)
  VALUES (tid, 'Vertex Capital Partners', 'AV & Technology', 'active',
          '(312) 555-9090', 'ops@vertexcap.io', 'vertexcap.io',
          'Chicago', 'IL', '200 W Madison St, Chicago, IL 60606', '200 W Madison St, Chicago, IL 60606',
          'High-value account. Trading floor latency upgrade in pipeline.')
  RETURNING id INTO c_vertex;

  INSERT INTO companies (tenant_id, name, industry, stage, phone, email, website, city, state, billing_address, service_address, notes)
  VALUES (tid, 'Halcyon Public Schools', 'Education', 'active',
          '(503) 555-4422', 'dreyes@halcyon.k12.or.us', 'halcyon.k12.or.us',
          'Portland', 'OR', '1010 SE Powell Blvd, Portland, OR 97202', '1010 SE Powell Blvd, Portland, OR 97202',
          'District-wide classroom AV standardization. Multi-phase project.')
  RETURNING id INTO c_halcyon;

  INSERT INTO companies (tenant_id, name, industry, stage, phone, email, website, city, state, billing_address, notes)
  VALUES (tid, 'Cinder & Oak Hospitality', 'Hospitality', 'inactive',
          '(615) 555-3201', 'hugo@cinderoak.co', 'cinderoak.co',
          'Nashville', 'TN', '112 3rd Ave S, Nashville, TN 37201',
          'Lost bid in May. New location opening Q4 — follow up then.')
  RETURNING id INTO c_cinder;

  INSERT INTO companies (tenant_id, name, industry, stage, phone, email, website, city, state, billing_address, notes)
  VALUES (tid, 'Arden & Loom Studios', 'AV & Technology', 'prospect',
          '(323) 555-7741', 'lena@ardenloom.tv', 'ardenloom.tv',
          'Los Angeles', 'CA', '5200 Lankershim Blvd, North Hollywood, CA 91601',
          'Sound stage control room project. Budget TBD.')
  RETURNING id INTO c_arden;

  -- ─── Contacts ───────────────────────────────────────────────────────────────

  -- Northbeam Architects
  INSERT INTO contacts (tenant_id, company_id, full_name, title, phone, email, address,
    contact_type, source, stage, customer_type, tags, notes)
  VALUES
    (tid, c_northbeam, 'Audrey Chen', 'Principal Architect',
     '(718) 555-0142', 'audrey@northbeam.co', '44 Berry St, Brooklyn, NY 11211',
     'Decision Maker', 'Referral', 'Customer', 'commercial', ARRAY['VIP'],
     'Key contact for all Northbeam AV projects. Prefers email.'),
    (tid, c_northbeam, 'Caleb Ortiz', 'Project Architect',
     '(718) 555-0188', 'caleb@northbeam.co', '44 Berry St, Brooklyn, NY 11211',
     'Influencer', 'Referral', 'Lead', 'commercial', ARRAY['Referral Source'],
     'Referred Audrey Chen. Potential to influence future residential projects.');

  -- Pinecrest Hospitality Group
  INSERT INTO contacts (tenant_id, company_id, full_name, title, phone, email, address,
    contact_type, source, stage, customer_type, tags, notes)
  VALUES
    (tid, c_pinecrest, 'Marcus Bell', 'Director of IT',
     '(512) 555-0911', 'mbell@pinecrest.com', '905 Congress Ave, Austin, TX 78701',
     'Decision Maker', 'Web Form', 'Lead', 'commercial', ARRAY[]::text[],
     'Evaluating multiple vendors. Budget confirmed at $200k+.');

  -- Helio Health Systems
  INSERT INTO contacts (tenant_id, company_id, full_name, title, phone, email, address,
    contact_type, source, stage, customer_type, tags, notes)
  VALUES
    (tid, c_helio, 'Priya Anand', 'Facilities Manager',
     '(303) 555-2230', 'panand@heliohealth.org', '1719 E 19th Ave, Denver, CO 80218',
     'Site Contact', 'Referral', 'Customer', 'commercial', ARRAY[]::text[],
     'On-site coordinator for all installs. CC on all scheduling.');

  -- Vertex Capital Partners
  INSERT INTO contacts (tenant_id, company_id, full_name, title, phone, email, address,
    contact_type, source, stage, customer_type, tags, notes)
  VALUES
    (tid, c_vertex, 'Iris Wang', 'VP Operations',
     '(312) 555-9090', 'iwang@vertexcap.io', '200 W Madison St, Chicago, IL 60606',
     'Decision Maker', 'Referral', 'Customer', 'commercial', ARRAY['VIP'],
     'Key decision maker. High priority account.'),
    (tid, c_vertex, 'Noor Saleh', 'CTO',
     '(312) 555-9111', 'nsaleh@vertexcap.io', '200 W Madison St, Chicago, IL 60606',
     'Site Contact', 'Referral', 'Customer', 'commercial', ARRAY[]::text[],
     'Technical point of contact. Coordinates with Iris on approvals.');

  -- Halcyon Public Schools
  INSERT INTO contacts (tenant_id, company_id, full_name, title, phone, email, address,
    contact_type, source, stage, customer_type, tags, notes)
  VALUES
    (tid, c_halcyon, 'Damon Reyes', 'Superintendent',
     '(503) 555-4422', 'dreyes@halcyon.k12.or.us', '1010 SE Powell Blvd, Portland, OR 97202',
     'Billing Contact', 'Email', 'Customer', 'commercial', ARRAY[]::text[],
     'Approves all POs. Prefers invoices via email.');

  -- Cinder & Oak Hospitality
  INSERT INTO contacts (tenant_id, company_id, full_name, title, phone, email, address,
    contact_type, source, stage, customer_type, tags, notes)
  VALUES
    (tid, c_cinder, 'Hugo Albright', 'General Manager',
     '(615) 555-3201', 'hugo@cinderoak.co', '112 3rd Ave S, Nashville, TN 37201',
     'Decision Maker', 'Walk-in', 'Inactive', 'commercial', ARRAY[]::text[],
     'Lost bid in May. Follow up Q4 — new location opening.');

  -- Arden & Loom Studios
  INSERT INTO contacts (tenant_id, company_id, full_name, title, phone, email, address,
    contact_type, source, stage, customer_type, tags, notes)
  VALUES
    (tid, c_arden, 'Lena Romero', 'Head of Production',
     '(323) 555-7741', 'lena@ardenloom.tv', '5200 Lankershim Blvd, Los Angeles, CA 91601',
     'Decision Maker', 'Phone', 'Lead', 'commercial', ARRAY[]::text[],
     'Wants full sound stage control room. Budget TBD.');

  -- Residential contacts (no company)
  INSERT INTO contacts (tenant_id, full_name, phone, email, address,
    source, stage, customer_type, tags, notes)
  VALUES
    (tid, 'Theodore Fox', '(305) 555-1108', 'tfox@quay.dev',
     '1408 Bayshore Dr, Miami, FL 33132',
     'Referral', 'Customer', 'residential', ARRAY['VIP'],
     'High-value residential client. Very detail-oriented.'),
    (tid, 'Sandra Mitchell', '(614) 555-0374', 'smitchell@gmail.com',
     '219 Birchwood Ln, Columbus, OH 43215',
     'Referral', 'Customer', 'residential', ARRAY[]::text[],
     'Referred by Theodore Fox. Interested in full home automation and whole-home audio.'),
    (tid, 'James Whitfield', '(919) 555-2287', 'jwhitfield@outlook.com',
     '17 Oak Ridge Ct, Raleigh, NC 27615',
     'Web Form', 'Lead', 'residential', ARRAY[]::text[],
     'Looking for home theater and outdoor speaker install.'),
    (tid, 'Elena Vasquez', '(210) 555-8819', 'evasquez@icloud.com',
     '832 Sycamore Ave, San Antonio, TX 78210',
     'Phone', 'Customer', 'residential', ARRAY[]::text[],
     'Completed smart lighting and security camera install last quarter. Wants to add door locks and thermostat control.');

END $$;
