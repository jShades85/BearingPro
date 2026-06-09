-- The operations_seed referenced companies that weren't in crm_seed.
-- This migration adds those 4 companies and re-links the projects + work orders.

do $$
declare
  v_tenant    uuid := (select id from tenants order by created_at limit 1);
  v_nexgen    uuid;
  v_crestline uuid;
  v_lakewood  uuid;
  v_harbor    uuid;
begin
  if v_tenant is null then return; end if;

  -- ── Add missing companies ───────────────────────────────────────────────────

  insert into companies (tenant_id, name, industry, stage, phone, email, city, state, billing_address, notes)
  values (v_tenant, 'NexGen A/V Solutions', 'AV & Technology', 'active',
          '(312) 555-7700', 'ops@nexgenav.com', 'Chicago', 'IL',
          '233 S Wacker Dr, Chicago, IL 60606',
          'Systems integrator partner. Conference suite build-out in progress.')
  returning id into v_nexgen;

  insert into companies (tenant_id, name, industry, stage, phone, email, city, state, billing_address, notes)
  values (v_tenant, 'Crestline Hotels Group', 'Hospitality', 'active',
          '(312) 555-4400', 'facilities@crestlinehotels.com', 'Chicago', 'IL',
          '700 Lake Shore Dr, Chicago, IL 60611',
          'Full ballroom AV install ongoing. Quarterly maintenance contract active.')
  returning id into v_crestline;

  insert into companies (tenant_id, name, industry, stage, phone, email, city, state, billing_address, notes)
  values (v_tenant, 'Lakewood Academy', 'Education', 'active',
          '(773) 555-2100', 'facilities@lakewoodacademy.edu', 'Chicago', 'IL',
          '4200 W Peterson Ave, Chicago, IL 60646',
          'District classroom rollout. Summer install window confirmed.')
  returning id into v_lakewood;

  insert into companies (tenant_id, name, industry, stage, phone, email, city, state, billing_address, notes)
  values (v_tenant, 'Harbor View Properties', 'AV & Technology', 'active',
          '(312) 555-9200', 'mgmt@harborviewproperties.com', 'Chicago', 'IL',
          '900 N Michigan Ave, Chicago, IL 60611',
          'Lobby LED wall completed. Ongoing service calls as needed.')
  returning id into v_harbor;

  -- ── Re-link projects ────────────────────────────────────────────────────────

  update projects set company_id = v_crestline
  where tenant_id = v_tenant and code = 'AV-2026-001' and company_id is null;

  update projects set company_id = v_nexgen
  where tenant_id = v_tenant and code = 'AV-2026-004' and company_id is null;

  update projects set company_id = v_lakewood
  where tenant_id = v_tenant and code = 'AV-2026-003' and company_id is null;

  update projects set company_id = v_harbor
  where tenant_id = v_tenant and code = 'AV-2026-005' and company_id is null;

  -- ── Re-link work orders ─────────────────────────────────────────────────────

  update work_orders set company_id = v_nexgen
  where tenant_id = v_tenant and code = 'WO-0001' and company_id is null;

  update work_orders set company_id = v_crestline
  where tenant_id = v_tenant and code = 'WO-0003' and company_id is null;

  update work_orders set company_id = v_lakewood
  where tenant_id = v_tenant and code = 'WO-0004' and company_id is null;

  update work_orders set company_id = v_harbor
  where tenant_id = v_tenant and code = 'WO-0005' and company_id is null;

end $$;
