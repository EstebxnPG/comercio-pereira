create table if not exists public.product_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null unique,
  description text,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  slug text not null unique,
  name text not null,
  short_description text not null,
  description text,
  price_cents integer check (price_cents is null or price_cents >= 0),
  currency text not null default 'COP',
  price_label text,
  status text not null default 'draft' check (
    status in ('draft', 'pending_review', 'published', 'hidden', 'rejected', 'archived')
  ),
  moderation_status text not null default 'draft' check (
    moderation_status in ('draft', 'pending', 'approved', 'rejected')
  ),
  availability text not null default 'available' check (
    availability in ('available', 'out_of_stock', 'on_request', 'discontinued')
  ),
  primary_image_url text,
  featured boolean not null default false,
  published_at timestamptz,
  rejection_reason text,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_name_not_blank check (length(btrim(name)) > 0),
  constraint products_short_description_not_blank check (length(btrim(short_description)) > 0),
  constraint products_currency_code_check check (currency ~ '^[A-Z]{3}$')
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  bucket text not null default 'product-images',
  storage_path text not null,
  public_url text not null,
  alt_text text,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (bucket, storage_path)
);

create table if not exists public.product_category_links (
  product_id uuid not null references public.products(id) on delete cascade,
  category_id uuid not null references public.product_categories(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (product_id, category_id)
);

create index if not exists products_business_status_idx
  on public.products(business_id, status, updated_at desc);

create index if not exists products_public_catalog_idx
  on public.products(status, featured desc, updated_at desc)
  where status = 'published';

create index if not exists products_moderation_idx
  on public.products(moderation_status, updated_at desc);

create index if not exists products_search_idx
  on public.products using gin (
    to_tsvector(
      'spanish',
      coalesce(name, '') || ' ' || coalesce(short_description, '') || ' ' || coalesce(description, '')
    )
  );

create index if not exists product_images_product_sort_idx
  on public.product_images(product_id, sort_order, created_at);

create trigger product_categories_set_updated_at
  before update on public.product_categories
  for each row execute function public.set_updated_at();

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create trigger product_images_set_updated_at
  before update on public.product_images
  for each row execute function public.set_updated_at();

alter table public.product_categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_category_links enable row level security;

create policy "Public can read active product categories"
  on public.product_categories for select
  to anon
  using (active = true);

create policy "Admins can manage product categories"
  on public.product_categories for all
  to authenticated
  using (private.is_admin())
  with check (private.is_admin());

create policy "Public can read published products"
  on public.products for select
  to anon
  using (
    status = 'published'
    and moderation_status = 'approved'
    and exists (
      select 1
      from public.businesses b
      where b.id = products.business_id
        and b.published = true
    )
  );

create policy "Business members can read their products"
  on public.products for select
  to authenticated
  using (
    private.is_admin()
    or private.is_business_member(business_id)
    or (
      status = 'published'
      and moderation_status = 'approved'
      and exists (
        select 1
        from public.businesses b
        where b.id = products.business_id
          and b.published = true
      )
    )
  );

create policy "Business editors can create products"
  on public.products for insert
  to authenticated
  with check (
    created_by = (select auth.uid())
    and updated_by = (select auth.uid())
    and status in ('draft', 'pending_review')
    and moderation_status in ('draft', 'pending')
    and not featured
    and published_at is null
    and rejection_reason is null
    and private.has_business_role(business_id, array['owner', 'manager', 'editor'])
  );

create policy "Business editors can update their products"
  on public.products for update
  to authenticated
  using (
    private.has_business_role(business_id, array['owner', 'manager', 'editor'])
  )
  with check (
    private.has_business_role(business_id, array['owner', 'manager', 'editor'])
    and updated_by = (select auth.uid())
    and status in ('draft', 'pending_review', 'hidden', 'archived')
    and moderation_status in ('draft', 'pending', 'approved')
    and not featured
    and rejection_reason is null
  );

create policy "Service role can manage products"
  on public.products for all
  to service_role
  using (true)
  with check (true);

create policy "Public can read published product images"
  on public.product_images for select
  to anon
  using (
    exists (
      select 1
      from public.products p
      join public.businesses b on b.id = p.business_id
      where p.id = product_images.product_id
        and p.status = 'published'
        and p.moderation_status = 'approved'
        and b.published = true
    )
  );

create policy "Business editors can manage product images"
  on public.product_images for all
  to authenticated
  using (
    private.is_admin()
    or exists (
      select 1
      from public.products p
      where p.id = product_images.product_id
        and private.has_business_role(p.business_id, array['owner', 'manager', 'editor'])
    )
  )
  with check (
    private.is_admin()
    or exists (
      select 1
      from public.products p
      where p.id = product_images.product_id
        and private.has_business_role(p.business_id, array['owner', 'manager', 'editor'])
    )
  );

create policy "Public can read published product categories"
  on public.product_category_links for select
  to anon
  using (
    exists (
      select 1
      from public.products p
      join public.businesses b on b.id = p.business_id
      where p.id = product_category_links.product_id
        and p.status = 'published'
        and p.moderation_status = 'approved'
        and b.published = true
    )
  );

create policy "Business editors can manage product categories"
  on public.product_category_links for all
  to authenticated
  using (
    private.is_admin()
    or exists (
      select 1
      from public.products p
      where p.id = product_category_links.product_id
        and private.has_business_role(p.business_id, array['owner', 'manager', 'editor'])
    )
  )
  with check (
    private.is_admin()
    or exists (
      select 1
      from public.products p
      where p.id = product_category_links.product_id
        and private.has_business_role(p.business_id, array['owner', 'manager', 'editor'])
    )
  );

insert into public.product_categories (slug, name, description, sort_order)
values
  ('moda-y-accesorios', 'Moda y accesorios', 'Ropa, calzado, bolsos, bisuteria y complementos.', 10),
  ('belleza-y-cuidado', 'Belleza y cuidado', 'Cosmeticos, peluqueria, cuidado personal y bienestar.', 20),
  ('hogar-y-decoracion', 'Hogar y decoracion', 'Articulos para casa, decoracion, muebles y regalos.', 30),
  ('alimentos-y-bebidas', 'Alimentos y bebidas', 'Mercado, comidas preparadas, cafes y productos alimenticios.', 40),
  ('servicios-locales', 'Servicios locales', 'Servicios profesionales, reparaciones, salud, tecnologia y atencion local.', 50)
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  active = true;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Business editors can read product image objects"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'product-images'
    and name ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/'
    and private.has_business_role(
      split_part(name, '/', 1)::uuid,
      array['owner', 'manager', 'editor']
    )
  );

create policy "Business editors can insert product image objects"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'product-images'
    and name ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/'
    and private.has_business_role(
      split_part(name, '/', 1)::uuid,
      array['owner', 'manager', 'editor']
    )
  );

create policy "Business editors can update product image objects"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'product-images'
    and name ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/'
    and private.has_business_role(
      split_part(name, '/', 1)::uuid,
      array['owner', 'manager', 'editor']
    )
  )
  with check (
    bucket_id = 'product-images'
    and name ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/'
    and private.has_business_role(
      split_part(name, '/', 1)::uuid,
      array['owner', 'manager', 'editor']
    )
  );

create policy "Business editors can delete product image objects"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'product-images'
    and name ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/'
    and private.has_business_role(
      split_part(name, '/', 1)::uuid,
      array['owner', 'manager', 'editor']
    )
  );

grant select on public.product_categories to anon, authenticated;
grant select on public.products to anon, authenticated;
grant select on public.product_images to anon, authenticated;
grant select on public.product_category_links to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant insert, update, delete on public.product_images to authenticated;
grant insert, update, delete on public.product_category_links to authenticated;
