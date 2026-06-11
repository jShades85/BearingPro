-- ── scheduled_jobs
-- A dispatch event linking a project or work order to a date/time slot.
-- job_id is a soft FK — it references either projects.id or work_orders.id
-- depending on job_type. Nullable so standalone events (site surveys, meetings)
-- can be scheduled without a linked record.

create table scheduled_jobs (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references tenants(id) on delete cascade,
  job_type       text not null check (job_type in ('project','work_order')),
  job_id         uuid,
  job_reference  text,
  title          text not null,
  category       text not null
    check (category in ('security','networking','audio_video','access_control','service_call','other')),
  customer_name  text not null,
  address        text,
  date           date not null,
  start_time     time not null,
  end_time       time not null,
  status         text not null default 'scheduled'
    check (status in ('scheduled','in_progress','completed','cancelled')),
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table scheduled_jobs enable row level security;

create policy "scheduled_jobs_select" on scheduled_jobs
  for select using (tenant_id = current_tenant_id());
create policy "scheduled_jobs_insert" on scheduled_jobs
  for insert with check (tenant_id = current_tenant_id());
create policy "scheduled_jobs_update" on scheduled_jobs
  for update using (tenant_id = current_tenant_id());
create policy "scheduled_jobs_delete" on scheduled_jobs
  for delete using (tenant_id = current_tenant_id());

create trigger set_scheduled_jobs_updated_at
  before update on scheduled_jobs
  for each row execute function set_updated_at();

-- ── scheduled_job_techs
-- Many-to-many: one scheduled event can have multiple assigned team members.

create table scheduled_job_techs (
  id                uuid primary key default gen_random_uuid(),
  scheduled_job_id  uuid not null references scheduled_jobs(id) on delete cascade,
  team_member_id    uuid not null references user_profiles(id) on delete cascade,
  unique (scheduled_job_id, team_member_id)
);

alter table scheduled_job_techs enable row level security;

create policy "scheduled_job_techs_select" on scheduled_job_techs
  for select using (
    exists (
      select 1 from scheduled_jobs sj
      where sj.id = scheduled_job_id
        and sj.tenant_id = current_tenant_id()
    )
  );
create policy "scheduled_job_techs_insert" on scheduled_job_techs
  for insert with check (
    exists (
      select 1 from scheduled_jobs sj
      where sj.id = scheduled_job_id
        and sj.tenant_id = current_tenant_id()
    )
  );
create policy "scheduled_job_techs_delete" on scheduled_job_techs
  for delete using (
    exists (
      select 1 from scheduled_jobs sj
      where sj.id = scheduled_job_id
        and sj.tenant_id = current_tenant_id()
    )
  );

-- ── Seed data
-- 9 scheduled events spread across June–July 2026, linked to real
-- work orders and projects from migration 024.

do $$
declare
  v_tenant uuid := (select id from tenants order by created_at limit 1);

  v_mike   uuid := (select id from user_profiles where email = 'mike.okafor@example.com' limit 1);
  v_jordan uuid := (select id from user_profiles where email = 'jordan.vale@example.com' limit 1);
  v_riley  uuid := (select id from user_profiles where email = 'riley.torres@example.com' limit 1);
  v_chris  uuid := (select id from user_profiles where email = 'chris.navarro@example.com' limit 1);

  v_wo1 uuid := (select id from work_orders where code = 'WO-0001' and tenant_id = v_tenant limit 1);
  v_wo2 uuid := (select id from work_orders where code = 'WO-0002' and tenant_id = v_tenant limit 1);
  v_wo3 uuid := (select id from work_orders where code = 'WO-0003' and tenant_id = v_tenant limit 1);
  v_wo4 uuid := (select id from work_orders where code = 'WO-0004' and tenant_id = v_tenant limit 1);
  v_wo5 uuid := (select id from work_orders where code = 'WO-0005' and tenant_id = v_tenant limit 1);

  v_proj1 uuid := (select id from projects where code = 'AV-2026-001' and tenant_id = v_tenant limit 1);
  v_proj2 uuid := (select id from projects where code = 'AV-2026-002' and tenant_id = v_tenant limit 1);
  v_proj3 uuid := (select id from projects where code = 'AV-2026-003' and tenant_id = v_tenant limit 1);
  v_proj4 uuid := (select id from projects where code = 'AV-2026-004' and tenant_id = v_tenant limit 1);

  v_sj1  uuid := gen_random_uuid();
  v_sj2  uuid := gen_random_uuid();
  v_sj3  uuid := gen_random_uuid();
  v_sj4  uuid := gen_random_uuid();
  v_sj5  uuid := gen_random_uuid();
  v_sj6  uuid := gen_random_uuid();
  v_sj7  uuid := gen_random_uuid();
  v_sj8  uuid := gen_random_uuid();
  v_sj9  uuid := gen_random_uuid();

begin
  if v_tenant is null then return; end if;

  insert into scheduled_jobs
    (id, tenant_id, job_type, job_id, job_reference, title, category,
     customer_name, address, date, start_time, end_time, status, notes)
  values

    -- Past: Northbeam punch list (WO-0001, completed May 28)
    (v_sj1, v_tenant, 'work_order', v_wo1, 'WO-0001',
     'Northbeam AV — Punch List & Sign-Off',
     'service_call', 'Northbeam Architects', '44 Berry St, Brooklyn, NY 11211',
     '2026-05-28', '09:00', '17:00', 'completed',
     'Cable dress, label wall plates, verify Crestron macros, client training.'),

    -- Today: Helio PA Zone 3 amplifier fault (WO-0005, in_progress)
    (v_sj2, v_tenant, 'work_order', v_wo5, 'WO-0005',
     'Helio PA — Zone 3 Amplifier Fault',
     'service_call', 'Helio Health Systems', '1719 E 19th Ave, Denver, CO 80218',
     '2026-06-10', '09:00', '13:00', 'in_progress',
     'Zone 3 amp reporting E-04. Crown XLS 1002 replacement pulled from stock.'),

    -- Today: Helio Surgical Center cable run (project AV-2026-003)
    (v_sj3, v_tenant, 'project', v_proj3, 'AV-2026-003',
     'Helio Surgical Center — Rooms 1-7 Cable Pull',
     'audio_video', 'Helio Health Systems', '1719 E 19th Ave, Denver, CO 80218',
     '2026-06-10', '07:00', '16:00', 'in_progress',
     'Infection-control routing required — coordinate with facilities before entering procedure wing.'),

    -- Jun 11: Pinecrest panel hang day 2 (project AV-2026-002)
    (v_sj4, v_tenant, 'project', v_proj2, 'AV-2026-002',
     'Pinecrest Video Wall — Panel Hang Day 2',
     'audio_video', 'Pinecrest Hospitality Group', '905 Congress Ave, Austin, TX 78701',
     '2026-06-11', '07:00', '17:00', 'scheduled',
     '8 panels remaining. Novastar controller staged and ready.'),

    -- Jun 12: Helio rooms 1-7 AV device install (project AV-2026-003)
    (v_sj5, v_tenant, 'project', v_proj3, 'AV-2026-003',
     'Helio Surgical Center — Rooms 1-7 Device Install',
     'audio_video', 'Helio Health Systems', '1719 E 19th Ave, Denver, CO 80218',
     '2026-06-12', '08:00', '16:00', 'scheduled',
     'Install Crestron panels, speakers, and Biamp zone cards for rooms 1-7.'),

    -- Jun 17: Pinecrest final panel install (WO-0002)
    (v_sj6, v_tenant, 'work_order', v_wo2, 'WO-0002',
     'Pinecrest Video Wall — Final Panel Install',
     'audio_video', 'Pinecrest Hospitality Group', '905 Congress Ave, Austin, TX 78701',
     '2026-06-17', '07:00', '17:00', 'scheduled',
     null),

    -- Jun 20: Helio rooms 8-12 prep (project AV-2026-003)
    (v_sj7, v_tenant, 'project', v_proj3, 'AV-2026-003',
     'Helio Surgical Center — Rooms 8-12 Prep',
     'audio_video', 'Helio Health Systems', '1719 E 19th Ave, Denver, CO 80218',
     '2026-06-20', '08:00', '17:00', 'scheduled',
     'Pre-stage racks and cable before WO-0003 install window.'),

    -- Jun 23: Helio rooms 8-12 full install (WO-0003)
    (v_sj8, v_tenant, 'work_order', v_wo3, 'WO-0003',
     'Helio Surgical Center — Rooms 8-12 Install',
     'audio_video', 'Helio Health Systems', '1719 E 19th Ave, Denver, CO 80218',
     '2026-06-23', '08:00', '17:00', 'scheduled',
     'Infection control must approve scheduling window before work begins.'),

    -- Jul 15: Halcyon commissioning & handover (WO-0004)
    (v_sj9, v_tenant, 'work_order', v_wo4, 'WO-0004',
     'Halcyon Phase 1 — Commissioning & Handover',
     'audio_video', 'Halcyon Public Schools', '1010 SE Powell Blvd, Portland, OR 97202',
     '2026-07-15', '09:00', '17:00', 'scheduled',
     'Final commissioning, staff training with Damon Reyes + IT team, documentation handover.');

  -- Assign techs
  insert into scheduled_job_techs (scheduled_job_id, team_member_id) values
    (v_sj1, v_mike),
    (v_sj2, v_jordan),
    (v_sj3, v_mike),
    (v_sj3, v_chris),
    (v_sj4, v_jordan),
    (v_sj4, v_mike),
    (v_sj5, v_mike),
    (v_sj6, v_jordan),
    (v_sj7, v_mike),
    (v_sj7, v_jordan),
    (v_sj8, v_mike),
    (v_sj8, v_jordan),
    (v_sj9, v_mike);

end $$;
