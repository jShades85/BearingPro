-- Allow tenant members to remove other profiles within their tenant.
-- Self-deletion is blocked (id != auth.uid()) so you can't remove yourself.
create policy "profiles_delete" on user_profiles
  for delete using (tenant_id = current_tenant_id() and id != auth.uid());
