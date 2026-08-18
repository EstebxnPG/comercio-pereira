create extension if not exists "pgcrypto";

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null unique,
  icon text not null,
  description text not null,
  sort_order integer not null default 0,
  show_on_home boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id),
  slug text not null unique,
  name text not null,
  short_description text not null,
  full_description text,
  logo_url text not null,
  cover_image_url text not null,
  status text not null check (
    status in (
      'open',
      'partial_service',
      'relocated',
      'delivery_only',
      'temporarily_closed'
    )
  ),
  phone text,
  whatsapp text check (whatsapp is null or whatsapp ~ '^\d{10,15}$'),
  address text,
  maps_url text,
  schedule text,
  published boolean not null default false,
  featured boolean not null default false,
  verified boolean not null default false,
  last_updated_at date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.business_social_links (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  platform text not null check (
    platform in ('instagram', 'facebook', 'tiktok', 'website', 'linkedin', 'youtube')
  ),
  url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, platform)
);

create table if not exists public.business_events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  event_type text not null check (
    event_type in (
      'profile_view',
      'click_whatsapp',
      'click_phone',
      'click_instagram',
      'click_facebook',
      'click_maps',
      'click_website',
      'share_profile'
    )
  ),
  utm_source text,
  utm_medium text,
  utm_campaign text,
  referrer text,
  path text,
  created_at timestamptz not null default now()
);

create table if not exists public.business_submissions (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  category_id uuid references public.categories(id),
  contact_name text,
  phone text,
  whatsapp text,
  email text,
  description text,
  instagram_url text,
  facebook_url text,
  address text,
  status text not null default 'pending' check (
    status in ('pending', 'approved', 'rejected', 'needs_info')
  ),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists businesses_category_id_idx on public.businesses(category_id);
create index if not exists businesses_published_idx on public.businesses(published);
create index if not exists business_events_business_id_created_at_idx
  on public.business_events(business_id, created_at desc);
create index if not exists business_events_type_created_at_idx
  on public.business_events(event_type, created_at desc);

alter table public.categories enable row level security;
alter table public.businesses enable row level security;
alter table public.business_social_links enable row level security;
alter table public.business_events enable row level security;
alter table public.business_submissions enable row level security;

create policy "Public can read categories"
  on public.categories for select
  using (true);

create policy "Public can read published businesses"
  on public.businesses for select
  using (published = true);

create policy "Public can read social links for published businesses"
  on public.business_social_links for select
  using (
    exists (
      select 1
      from public.businesses
      where businesses.id = business_social_links.business_id
        and businesses.published = true
    )
  );

create policy "Public can submit businesses"
  on public.business_submissions for insert
  with check (true);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

create trigger businesses_set_updated_at
  before update on public.businesses
  for each row execute function public.set_updated_at();

create trigger business_social_links_set_updated_at
  before update on public.business_social_links
  for each row execute function public.set_updated_at();

create trigger business_submissions_set_updated_at
  before update on public.business_submissions
  for each row execute function public.set_updated_at();
