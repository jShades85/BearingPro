-- Operational fields for the team management page
alter table user_profiles
  add column phone          text,
  add column availability   text not null default 'full_time'
    check (availability in ('full_time', 'part_time', 'on_call', 'inactive')),
  add column skills         text[] not null default '{}',
  add column certifications text[] not null default '{}',
  add column pay_type       text not null default 'hourly'
    check (pay_type in ('hourly', 'salary')),
  add column pay_rate       numeric(8,2) not null default 0,
  add column start_date     date;
