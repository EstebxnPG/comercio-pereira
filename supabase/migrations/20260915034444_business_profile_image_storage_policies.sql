insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'business-logos',
    'business-logos',
    true,
    5242880,
    array['image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif']
  ),
  (
    'business-covers',
    'business-covers',
    true,
    5242880,
    array['image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif']
  )
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

grant update (logo_url, cover_image_url)
  on public.businesses to authenticated;

drop policy if exists "Business managers can read business image objects"
  on storage.objects;

drop policy if exists "Business managers can insert business image objects"
  on storage.objects;

drop policy if exists "Business managers can update business image objects"
  on storage.objects;

drop policy if exists "Business managers can delete business image objects"
  on storage.objects;

create policy "Business managers can read business image objects"
  on storage.objects for select
  to authenticated
  using (
    bucket_id in ('business-logos', 'business-covers')
    and name ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/'
    and private.has_business_role(
      split_part(name, '/', 1)::uuid,
      array['owner', 'manager']
    )
  );

create policy "Business managers can insert business image objects"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id in ('business-logos', 'business-covers')
    and name ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/'
    and private.has_business_role(
      split_part(name, '/', 1)::uuid,
      array['owner', 'manager']
    )
  );

create policy "Business managers can update business image objects"
  on storage.objects for update
  to authenticated
  using (
    bucket_id in ('business-logos', 'business-covers')
    and name ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/'
    and private.has_business_role(
      split_part(name, '/', 1)::uuid,
      array['owner', 'manager']
    )
  )
  with check (
    bucket_id in ('business-logos', 'business-covers')
    and name ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/'
    and private.has_business_role(
      split_part(name, '/', 1)::uuid,
      array['owner', 'manager']
    )
  );

create policy "Business managers can delete business image objects"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id in ('business-logos', 'business-covers')
    and name ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/'
    and private.has_business_role(
      split_part(name, '/', 1)::uuid,
      array['owner', 'manager']
    )
  );
