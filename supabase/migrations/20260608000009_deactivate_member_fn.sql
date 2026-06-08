create or replace function deactivate_member(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from user_profiles
    where id = p_id and tenant_id = current_tenant_id()
  ) then
    raise exception 'Not authorized';
  end if;

  if p_id = auth.uid() then
    raise exception 'Cannot deactivate yourself';
  end if;

  update user_profiles set is_active = false where id = p_id;
end;
$$;
