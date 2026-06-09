-- Seed test team members across all default roles.
-- Inserts into auth.users; the handle_new_user trigger creates user_profiles.
-- All accounts use password: Test1234!
-- Safe to run on any environment; skips if no tenant exists.

DO $$
DECLARE
  tid uuid;
  pw  text;
BEGIN
  SELECT id INTO tid FROM tenants LIMIT 1;
  IF tid IS NULL THEN RETURN; END IF;

  -- Skip if seed users already exist
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'sarah.kim@example.com') THEN RETURN; END IF;

  pw := extensions.crypt('Test1234!', extensions.gen_salt('bf'));

  INSERT INTO auth.users (
    instance_id, id, aud, role,
    email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_user_meta_data, raw_app_meta_data,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) VALUES
  (
    '00000000-0000-0000-0000-000000000000', gen_random_uuid(),
    'authenticated', 'authenticated',
    'chris.navarro@example.com', pw, now(), now(), now(),
    jsonb_build_object('full_name','Chris Navarro','tenant_id',tid::text,'role_name','Admin'),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '','','',''
  ),
  (
    '00000000-0000-0000-0000-000000000000', gen_random_uuid(),
    'authenticated', 'authenticated',
    'sarah.kim@example.com', pw, now(), now(), now(),
    jsonb_build_object('full_name','Sarah Kim','tenant_id',tid::text,'role_name','Sales Rep'),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '','','',''
  ),
  (
    '00000000-0000-0000-0000-000000000000', gen_random_uuid(),
    'authenticated', 'authenticated',
    'riley.torres@example.com', pw, now(), now(), now(),
    jsonb_build_object('full_name','Riley Torres','tenant_id',tid::text,'role_name','Dispatcher'),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '','','',''
  ),
  (
    '00000000-0000-0000-0000-000000000000', gen_random_uuid(),
    'authenticated', 'authenticated',
    'mike.okafor@example.com', pw, now(), now(), now(),
    jsonb_build_object('full_name','Mike Okafor','tenant_id',tid::text,'role_name','Technician'),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '','','',''
  ),
  (
    '00000000-0000-0000-0000-000000000000', gen_random_uuid(),
    'authenticated', 'authenticated',
    'jordan.vale@example.com', pw, now(), now(), now(),
    jsonb_build_object('full_name','Jordan Vale','tenant_id',tid::text,'role_name','Technician'),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '','','',''
  ),
  (
    '00000000-0000-0000-0000-000000000000', gen_random_uuid(),
    'authenticated', 'authenticated',
    'dana.park@example.com', pw, now(), now(), now(),
    jsonb_build_object('full_name','Dana Park','tenant_id',tid::text,'role_name','Warehouse Staff'),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '','','',''
  ),
  (
    '00000000-0000-0000-0000-000000000000', gen_random_uuid(),
    'authenticated', 'authenticated',
    'priya.anand@example.com', pw, now(), now(), now(),
    jsonb_build_object('full_name','Priya Anand','tenant_id',tid::text,'role_name','Service Coordinator'),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '','','',''
  ),
  (
    '00000000-0000-0000-0000-000000000000', gen_random_uuid(),
    'authenticated', 'authenticated',
    'morgan.ellis@example.com', pw, now(), now(), now(),
    jsonb_build_object('full_name','Morgan Ellis','tenant_id',tid::text,'role_name','Finance'),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '','','',''
  );

END $$;
