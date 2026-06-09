-- Fill out full profile data for seeded test users.

DO $$
BEGIN
  -- Chris Navarro — Admin
  UPDATE user_profiles SET
    phone          = '(312) 555-0101',
    availability   = 'full_time',
    skills         = ARRAY['Team Management','Client Relations','Project Oversight','Estimating'],
    certifications = ARRAY['PMP','OSHA 10'],
    pay_type       = 'salary',
    pay_rate       = 72000.00,
    start_date     = '2023-03-15'
  WHERE id = (SELECT id FROM auth.users WHERE email = 'chris.navarro@example.com');

  -- Sarah Kim — Sales Rep
  UPDATE user_profiles SET
    phone          = '(904) 555-0202',
    availability   = 'full_time',
    skills         = ARRAY['CRM','Lead Generation','Proposal Writing','Client Presentations','Salesforce'],
    certifications = ARRAY['Salesforce Certified'],
    pay_type       = 'salary',
    pay_rate       = 58000.00,
    start_date     = '2023-07-01'
  WHERE id = (SELECT id FROM auth.users WHERE email = 'sarah.kim@example.com');

  -- Riley Torres — Dispatcher
  UPDATE user_profiles SET
    phone          = '(904) 555-0303',
    availability   = 'full_time',
    skills         = ARRAY['Scheduling','Route Optimization','Field Coordination','Work Order Management'],
    certifications = ARRAY[]::text[],
    pay_type       = 'hourly',
    pay_rate       = 24.50,
    start_date     = '2024-01-08'
  WHERE id = (SELECT id FROM auth.users WHERE email = 'riley.torres@example.com');

  -- Mike Okafor — Technician (senior)
  UPDATE user_profiles SET
    phone          = '(904) 555-0404',
    availability   = 'full_time',
    skills         = ARRAY['AV Installation','Low Voltage Wiring','Rack Building','Control4','Crestron','Lutron'],
    certifications = ARRAY['CEDIA ESC','OSHA 10','Low Voltage License'],
    pay_type       = 'hourly',
    pay_rate       = 32.00,
    start_date     = '2022-09-12'
  WHERE id = (SELECT id FROM auth.users WHERE email = 'mike.okafor@example.com');

  -- Jordan Vale — Technician (junior)
  UPDATE user_profiles SET
    phone          = '(904) 555-0505',
    availability   = 'full_time',
    skills         = ARRAY['AV Installation','Smart Home','Network Cabling','Security Cameras'],
    certifications = ARRAY['CompTIA Network+','OSHA 10'],
    pay_type       = 'hourly',
    pay_rate       = 28.00,
    start_date     = '2024-03-20'
  WHERE id = (SELECT id FROM auth.users WHERE email = 'jordan.vale@example.com');

  -- Dana Park — Warehouse Staff
  UPDATE user_profiles SET
    phone          = '(904) 555-0606',
    availability   = 'full_time',
    skills         = ARRAY['Inventory Management','Receiving','Order Fulfillment','Forklift Operation'],
    certifications = ARRAY['Forklift Certified','Hazmat Handling'],
    pay_type       = 'hourly',
    pay_rate       = 22.00,
    start_date     = '2023-11-06'
  WHERE id = (SELECT id FROM auth.users WHERE email = 'dana.park@example.com');

  -- Priya Anand — Service Coordinator
  UPDATE user_profiles SET
    phone          = '(904) 555-0707',
    availability   = 'full_time',
    skills         = ARRAY['Customer Service','Ticket Triage','Service Scheduling','Technical Documentation'],
    certifications = ARRAY['CompTIA A+'],
    pay_type       = 'hourly',
    pay_rate       = 26.00,
    start_date     = '2023-05-22'
  WHERE id = (SELECT id FROM auth.users WHERE email = 'priya.anand@example.com');

  -- Morgan Ellis — Finance
  UPDATE user_profiles SET
    phone          = '(904) 555-0808',
    availability   = 'full_time',
    skills         = ARRAY['Bookkeeping','Invoicing','Accounts Receivable','Accounts Payable','QuickBooks','Financial Reporting'],
    certifications = ARRAY['QuickBooks ProAdvisor'],
    pay_type       = 'salary',
    pay_rate       = 65000.00,
    start_date     = '2023-01-03'
  WHERE id = (SELECT id FROM auth.users WHERE email = 'morgan.ellis@example.com');

END $$;
