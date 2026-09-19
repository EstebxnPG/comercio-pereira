create table if not exists public.business_audit_logs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null check (
    action in (
      'business_profile_updated',
      'business_logo_updated',
      'business_cover_updated',
      'business_invites_claimed',
      'business_owner_assigned',
      'product_created',
      'product_updated',
      'product_image_updated',
      'product_approved',
      'product_rejected',
      'product_hidden',
      'product_featured'
    )
  ),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists business_audit_logs_business_created_at_idx
  on public.business_audit_logs(business_id, created_at desc);

create index if not exists business_audit_logs_actor_created_at_idx
  on public.business_audit_logs(actor_user_id, created_at desc);

alter table public.business_audit_logs enable row level security;

create policy "Admins can read business audit logs"
  on public.business_audit_logs for select
  to authenticated
  using (private.is_admin());

create policy "Business owners can read their business audit logs"
  on public.business_audit_logs for select
  to authenticated
  using (
    private.has_business_role(business_id, array['owner', 'manager'])
  );

create policy "Authenticated members can insert their business audit logs"
  on public.business_audit_logs for insert
  to authenticated
  with check (
    actor_user_id = (select auth.uid())
    and private.has_business_role(business_id, array['owner', 'manager', 'editor'])
  );

create policy "Service role can manage business audit logs"
  on public.business_audit_logs for all
  to service_role
  using (true)
  with check (true);
