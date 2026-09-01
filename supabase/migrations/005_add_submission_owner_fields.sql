alter table public.business_submissions
  add column if not exists owner_name text,
  add column if not exists owner_phone text;
