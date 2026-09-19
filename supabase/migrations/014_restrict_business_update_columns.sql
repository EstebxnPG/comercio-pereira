revoke update on public.businesses from authenticated;

grant update (
  name,
  short_description,
  full_description,
  status,
  phone,
  whatsapp,
  address,
  maps_url,
  schedule
) on public.businesses to authenticated;
