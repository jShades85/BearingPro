-- Auto-creates a tenant + user_profile when a new auth user signs up.
-- For invited users (tenant_id in metadata), adds them to the existing tenant instead.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_tenant_id uuid;
begin
  if (new.raw_user_meta_data->>'tenant_id') is not null then
    -- Invited user — join existing tenant
    new_tenant_id := (new.raw_user_meta_data->>'tenant_id')::uuid;
  else
    -- New signup — create tenant
    insert into public.tenants (name)
    values (coalesce(new.raw_user_meta_data->>'company_name', 'My Company'))
    returning id into new_tenant_id;
  end if;

  insert into public.user_profiles (id, tenant_id, full_name, role)
  values (
    new.id,
    new_tenant_id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'admin')
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
