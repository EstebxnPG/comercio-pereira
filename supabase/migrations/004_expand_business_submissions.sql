alter table public.business_submissions
  add column if not exists tiktok_url text,
  add column if not exists website_url text,
  add column if not exists full_description text,
  add column if not exists neighborhood text,
  add column if not exists maps_url text,
  add column if not exists schedule text,
  add column if not exists logo_url text,
  add column if not exists cover_image_url text,
  add column if not exists logo_bucket text,
  add column if not exists logo_storage_path text,
  add column if not exists cover_image_bucket text,
  add column if not exists cover_image_storage_path text,
  add column if not exists products_or_services text,
  add column if not exists delivery_available text check (
    delivery_available is null or delivery_available in ('yes', 'no', 'pickup')
  ),
  add column if not exists payment_methods text,
  add column if not exists additional_notes text,
  add column if not exists accepts_publication boolean not null default false;
