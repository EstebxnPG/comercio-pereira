insert into public.businesses (
  category_id,
  slug,
  name,
  short_description,
  full_description,
  logo_url,
  cover_image_url,
  status,
  phone,
  whatsapp,
  address,
  maps_url,
  schedule,
  published,
  featured,
  last_updated_at
)
values
  (
    (select id from public.categories where slug = 'moda-y-ropa'),
    'comercio-ejemplo',
    'Comercio Ejemplo',
    'Comercio pereirano que continua atendiendo a sus clientes desde una ubicacion confirmada.',
    'Este perfil es un ejemplo para validar la vitrina digital. Sustituye esta informacion por datos autorizados del comercio antes del lanzamiento.',
    '/businesses/comercio-ejemplo/logo.svg',
    '/businesses/comercio-ejemplo/cover.svg',
    'relocated',
    '+57 300 123 4567',
    '573001234567',
    'Direccion temporal confirmada, Pereira',
    'https://maps.google.com/?q=Pereira',
    'Lunes a sabado, 9:00 a. m. - 6:00 p. m.',
    true,
    true,
    '2026-08-17'
  ),
  (
    (select id from public.categories where slug = 'comida-y-restaurantes'),
    'cafeteria-centro',
    'Cafeteria Centro',
    'Cafe local con atencion por WhatsApp y recogida coordinada directamente con el establecimiento.',
    null,
    '/businesses/cafeteria-centro/logo.svg',
    '/businesses/cafeteria-centro/cover.svg',
    'delivery_only',
    null,
    '573001112233',
    null,
    null,
    'Lunes a viernes, 8:00 a. m. - 5:00 p. m.',
    true,
    false,
    '2026-08-17'
  ),
  (
    (select id from public.categories where slug = 'papeleria-y-educacion'),
    'papeleria-la-14',
    'Papeleria La 14',
    'Papeleria y servicios de impresion con atencion parcial durante la semana.',
    null,
    '/businesses/papeleria-la-14/logo.svg',
    '/businesses/papeleria-la-14/cover.svg',
    'partial_service',
    '+57 311 555 9090',
    null,
    'Centro de Pereira',
    null,
    null,
    true,
    false,
    '2026-08-17'
  )
on conflict (slug) do update set
  category_id = excluded.category_id,
  name = excluded.name,
  short_description = excluded.short_description,
  full_description = excluded.full_description,
  logo_url = excluded.logo_url,
  cover_image_url = excluded.cover_image_url,
  status = excluded.status,
  phone = excluded.phone,
  whatsapp = excluded.whatsapp,
  address = excluded.address,
  maps_url = excluded.maps_url,
  schedule = excluded.schedule,
  published = excluded.published,
  featured = excluded.featured,
  last_updated_at = excluded.last_updated_at;

insert into public.business_social_links (business_id, platform, url, sort_order)
values
  (
    (select id from public.businesses where slug = 'comercio-ejemplo'),
    'instagram',
    'https://instagram.com/comercioejemplo',
    1
  ),
  (
    (select id from public.businesses where slug = 'comercio-ejemplo'),
    'facebook',
    'https://facebook.com/comercioejemplo',
    2
  ),
  (
    (select id from public.businesses where slug = 'cafeteria-centro'),
    'instagram',
    'https://instagram.com/cafeteriacentro',
    1
  )
on conflict (business_id, platform) do update set
  url = excluded.url,
  sort_order = excluded.sort_order;
