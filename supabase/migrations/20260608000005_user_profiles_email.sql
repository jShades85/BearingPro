-- Add email to user_profiles so it's queryable without auth.users access
alter table user_profiles add column email text;

-- Populate from auth.users for existing rows
update user_profiles up
  set email = au.email
  from auth.users au
  where au.id = up.id;

-- Update handle_new_user to persist email on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_tenant_id    uuid;
  assigned_role_id uuid;
begin
  if (new.raw_user_meta_data->>'tenant_id') is not null then
    new_tenant_id := (new.raw_user_meta_data->>'tenant_id')::uuid;

    select id into assigned_role_id
      from roles
      where tenant_id = new_tenant_id
        and name = coalesce(new.raw_user_meta_data->>'role_name', 'Technician')
      limit 1;

    if assigned_role_id is null then
      select id into assigned_role_id
        from roles where tenant_id = new_tenant_id and name = 'Admin'
        limit 1;
    end if;
  else
    insert into public.tenants (name)
      values (coalesce(new.raw_user_meta_data->>'company_name', 'My Company'))
      returning id into new_tenant_id;

    perform seed_default_roles(new_tenant_id);

    select id into assigned_role_id
      from roles where tenant_id = new_tenant_id and name = 'Owner'
      limit 1;
  end if;

  insert into public.user_profiles (id, tenant_id, full_name, role_id, email)
  values (
    new.id,
    new_tenant_id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    assigned_role_id,
    new.email
  );

  return new;
end;
$$;
