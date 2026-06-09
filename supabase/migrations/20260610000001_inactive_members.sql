-- Returns inactive profiles for the current tenant (bypasses RLS)
create or replace function public.get_inactive_members()
returns table (
  id          uuid,
  tenant_id   uuid,
  full_name   text,
  email       text,
  role_id     uuid,
  vehicle_id  uuid,
  is_active   boolean,
  created_at  timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
    select
      p.id, p.tenant_id, p.full_name, p.email,
      p.role_id, p.vehicle_id, p.is_active, p.created_at
    from user_profiles p
    where p.tenant_id = current_tenant_id()
      and p.is_active = false;
end;
$$;

-- Reactivates a soft-deleted member within the caller's tenant
create or replace function public.reactivate_member(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update user_profiles
  set is_active = true
  where id = p_id
    and tenant_id = current_tenant_id();
end;
$$;

grant execute on function public.get_inactive_members()    to authenticated;
grant execute on function public.reactivate_member(uuid)   to authenticated;
