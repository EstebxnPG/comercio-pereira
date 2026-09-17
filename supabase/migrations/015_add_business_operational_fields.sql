alter table public.businesses
  add column if not exists owner_user_id uuid references auth.users(id) on delete set null,
  add column if not exists publication_status text not null default 'published',
  add column if not exists verification_status text not null default 'unverified',
  add column if not exists onboarding_status text not null default 'complete',
  add column if not exists plan_id uuid,
  add column if not exists published_at timestamptz,
  add column if not exists created_by uuid references auth.users(id) on delete set null,
  add column if not exists updated_by uuid references auth.users(id) on delete set null;

alter table public.businesses
  add constraint businesses_publication_status_check
    check (publication_status in (
      'draft',
      'pending_review',
      'published',
      'hidden',
      'rejected',
      'suspended'
    )),
  add constraint businesses_verification_status_check
    check (verification_status in (
      'unverified',
      'pending',
      'verified',
      'rejected'
    )),
  add constraint businesses_onboarding_status_check
    check (onboarding_status in (
      'not_started',
      'profile_pending',
      'pending_review',
      'complete'
    ));

update public.businesses
set published_at = coalesce(published_at, created_at)
where published = true
  and published_at is null;

create index if not exists businesses_owner_user_id_idx
  on public.businesses(owner_user_id);

create index if not exists businesses_publication_status_idx
  on public.businesses(publication_status);

create index if not exists businesses_onboarding_status_idx
  on public.businesses(onboarding_status);
