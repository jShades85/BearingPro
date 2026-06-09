-- Add slug column to tenants
alter table tenants add column if not exists slug text unique;

-- Backfill: <slugified-name>-<first-8-chars-of-uuid> guarantees uniqueness
update tenants
set slug = lower(regexp_replace(trim(name), '[^a-z0-9]+', '-', 'g'))
         || '-'
         || replace(substr(id::text, 1, 8), '-', '')
where slug is null;

-- Public lookup by slug — used by the unauthenticated /join/:slug page
create or replace function public.get_tenant_by_slug(p_slug text)
returns table(id uuid, name text, slug text)
language sql
stable
security definer
set search_path = public
as $$
  select id, name, slug from tenants where slug = p_slug limit 1;
$$;

grant execute on function public.get_tenant_by_slug(text) to anon, authenticated;

-- Update handle_new_user to auto-generate slug when creating a new tenant.
-- The tenant id is pre-generated so we can use it in the slug.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_tenant_id    uuid;
  assigned_role_id uuid;
  company_name     text;
  tenant_slug      text;
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
    company_name  := coalesce(new.raw_user_meta_data->>'company_name', 'My Company');
    new_tenant_id := gen_random_uuid();
    tenant_slug   := lower(regexp_replace(trim(company_name), '[^a-z0-9]+', '-', 'g'))
                   || '-'
                   || replace(substr(new_tenant_id::text, 1, 8), '-', '');

    insert into public.tenants (id, name, slug)
      values (new_tenant_id, company_name, tenant_slug);

    perform seed_default_roles(new_tenant_id);

    select id into assigned_role_id
      from roles where tenant_id = new_tenant_id and name = 'Owner'
      limit 1;
  end if;

  insert into public.user_profiles (id, tenant_id, full_name, role_id, email, is_active)
  values (
    new.id,
    new_tenant_id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    assigned_role_id,
    new.email,
    true
  )
  on conflict (id) do update set
    tenant_id = excluded.tenant_id,
    role_id   = excluded.role_id,
    full_name = excluded.full_name,
    is_active = true;

  return new;
end;
$$;
