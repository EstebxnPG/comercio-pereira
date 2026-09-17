create schema if not exists private;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text check (phone is null or phone ~ '^\d{10,15}$'),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'moderator', 'support')),
  created_at timestamptz not null default now()
);

create table if not exists public.business_members (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'manager', 'editor', 'viewer')),
  invited_email text,
  status text not null default 'active' check (status in ('active', 'invited', 'removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint business_members_user_or_invite_check check (
    user_id is not null or invited_email is not null
  ),
  constraint business_members_active_user_check check (
    status <> 'active' or user_id is not null
  )
);

create unique index if not exists business_members_business_user_uidx
  on public.business_members(business_id, user_id)
  where user_id is not null;

create index if not exists business_members_user_status_idx
  on public.business_members(user_id, status);

create index if not exists business_members_business_status_idx
  on public.business_members(business_id, status);

create index if not exists admin_users_role_idx
  on public.admin_users(role);

alter table public.profiles enable row level security;
alter table public.admin_users enable row level security;
alter table public.business_members enable row level security;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger business_members_set_updated_at
  before update on public.business_members
  for each row execute function public.set_updated_at();

create or replace function private.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.admin_users au
    where au.user_id = (select auth.uid())
      and au.role in ('admin', 'moderator', 'support')
  );
$$;

create or replace function private.is_business_member(p_business_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.business_members bm
    where bm.business_id = p_business_id
      and bm.user_id = (select auth.uid())
      and bm.status = 'active'
  );
$$;

create or replace function private.has_business_role(
  p_business_id uuid,
  p_roles text[]
)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.business_members bm
    where bm.business_id = p_business_id
      and bm.user_id = (select auth.uid())
      and bm.status = 'active'
      and bm.role = any(p_roles)
  );
$$;

revoke all on function private.is_admin() from public, anon, authenticated;
revoke all on function private.is_business_member(uuid) from public, anon, authenticated;
revoke all on function private.has_business_role(uuid, text[]) from public, anon, authenticated;

grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;
grant execute on function private.is_business_member(uuid) to authenticated;
grant execute on function private.has_business_role(uuid, text[]) to authenticated;

create policy "Users can read their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id or private.is_admin());

create policy "Users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Admins can read admin users"
  on public.admin_users for select
  to authenticated
  using (private.is_admin());

create policy "Admins can manage admin users"
  on public.admin_users for all
  to service_role
  using (true)
  with check (true);

create policy "Business members can read peers in their businesses"
  on public.business_members for select
  to authenticated
  using (private.is_admin() or private.is_business_member(business_id));

create policy "Business owners can invite members"
  on public.business_members for insert
  to authenticated
  with check (
    private.is_admin()
    or private.has_business_role(business_id, array['owner'])
  );

create policy "Business owners can update members"
  on public.business_members for update
  to authenticated
  using (
    private.is_admin()
    or private.has_business_role(business_id, array['owner'])
  )
  with check (
    private.is_admin()
    or private.has_business_role(business_id, array['owner'])
  );

create policy "Service role can manage business members"
  on public.business_members for all
  to service_role
  using (true)
  with check (true);
