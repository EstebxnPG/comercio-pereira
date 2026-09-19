create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  event_type text not null check (
    event_type in (
      'business_profile_view',
      'product_view',
      'click_whatsapp',
      'click_phone',
      'click_maps',
      'click_website',
      'click_social',
      'share_business',
      'share_product',
      'search_result_view'
    )
  ),
  anonymous_session_id text,
  ip_hash text,
  user_agent_hash text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  referrer text,
  path text,
  created_at timestamptz not null default now(),
  constraint analytics_events_target_check check (
    business_id is not null or product_id is not null
  )
);

create table if not exists public.analytics_daily_business (
  business_id uuid not null references public.businesses(id) on delete cascade,
  event_date date not null,
  profile_views integer not null default 0,
  product_views integer not null default 0,
  whatsapp_clicks integer not null default 0,
  phone_clicks integer not null default 0,
  website_clicks integer not null default 0,
  social_clicks integer not null default 0,
  share_events integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (business_id, event_date)
);

create table if not exists public.analytics_daily_product (
  product_id uuid not null references public.products(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  event_date date not null,
  product_views integer not null default 0,
  whatsapp_clicks integer not null default 0,
  share_events integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (product_id, event_date)
);

create index if not exists analytics_events_business_created_idx
  on public.analytics_events(business_id, created_at desc);

create index if not exists analytics_events_product_created_idx
  on public.analytics_events(product_id, created_at desc);

create index if not exists analytics_events_session_type_idx
  on public.analytics_events(anonymous_session_id, event_type, created_at desc);

create trigger analytics_daily_business_set_updated_at
  before update on public.analytics_daily_business
  for each row execute function public.set_updated_at();

create trigger analytics_daily_product_set_updated_at
  before update on public.analytics_daily_product
  for each row execute function public.set_updated_at();

alter table public.analytics_events enable row level security;
alter table public.analytics_daily_business enable row level security;
alter table public.analytics_daily_product enable row level security;

create policy "Public can insert analytics events"
  on public.analytics_events for insert
  with check (
    (
      business_id is not null
      and exists (
        select 1
        from public.businesses b
        where b.id = analytics_events.business_id
          and b.published = true
      )
    )
    or (
      product_id is not null
      and exists (
        select 1
        from public.products p
        join public.businesses b on b.id = p.business_id
        where p.id = analytics_events.product_id
          and p.status = 'published'
          and p.moderation_status = 'approved'
          and b.published = true
      )
    )
  );

create policy "Admins and business owners can read analytics events"
  on public.analytics_events for select
  to authenticated
  using (
    private.is_admin()
    or (
      business_id is not null
      and private.has_business_role(business_id, array['owner', 'manager'])
    )
  );

create policy "Business owners can read their daily business analytics"
  on public.analytics_daily_business for select
  to authenticated
  using (
    private.is_admin()
    or private.has_business_role(business_id, array['owner', 'manager'])
  );

create policy "Business owners can read their daily product analytics"
  on public.analytics_daily_product for select
  to authenticated
  using (
    private.is_admin()
    or private.has_business_role(business_id, array['owner', 'manager'])
  );

create policy "Service role can manage analytics events"
  on public.analytics_events for all
  to service_role
  using (true)
  with check (true);

create policy "Service role can manage daily business analytics"
  on public.analytics_daily_business for all
  to service_role
  using (true)
  with check (true);

create policy "Service role can manage daily product analytics"
  on public.analytics_daily_product for all
  to service_role
  using (true)
  with check (true);

create or replace function private.rollup_analytics_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  resolved_business_id uuid;
begin
  resolved_business_id := new.business_id;

  if resolved_business_id is null and new.product_id is not null then
    select p.business_id
    into resolved_business_id
    from public.products p
    where p.id = new.product_id;
  end if;

  if resolved_business_id is null then
    return new;
  end if;

  insert into public.analytics_daily_business (
    business_id,
    event_date,
    profile_views,
    product_views,
    whatsapp_clicks,
    phone_clicks,
    website_clicks,
    social_clicks,
    share_events
  )
  values (
    resolved_business_id,
    new.created_at::date,
    case when new.event_type = 'business_profile_view' then 1 else 0 end,
    case when new.event_type = 'product_view' then 1 else 0 end,
    case when new.event_type = 'click_whatsapp' then 1 else 0 end,
    case when new.event_type = 'click_phone' then 1 else 0 end,
    case when new.event_type in ('click_website', 'click_maps') then 1 else 0 end,
    case when new.event_type = 'click_social' then 1 else 0 end,
    case when new.event_type in ('share_business', 'share_product') then 1 else 0 end
  )
  on conflict (business_id, event_date) do update
  set
    profile_views = analytics_daily_business.profile_views + excluded.profile_views,
    product_views = analytics_daily_business.product_views + excluded.product_views,
    whatsapp_clicks = analytics_daily_business.whatsapp_clicks + excluded.whatsapp_clicks,
    phone_clicks = analytics_daily_business.phone_clicks + excluded.phone_clicks,
    website_clicks = analytics_daily_business.website_clicks + excluded.website_clicks,
    social_clicks = analytics_daily_business.social_clicks + excluded.social_clicks,
    share_events = analytics_daily_business.share_events + excluded.share_events,
    updated_at = now();

  if new.product_id is not null then
    insert into public.analytics_daily_product (
      product_id,
      business_id,
      event_date,
      product_views,
      whatsapp_clicks,
      share_events
    )
    values (
      new.product_id,
      resolved_business_id,
      new.created_at::date,
      case when new.event_type = 'product_view' then 1 else 0 end,
      case when new.event_type = 'click_whatsapp' then 1 else 0 end,
      case when new.event_type = 'share_product' then 1 else 0 end
    )
    on conflict (product_id, event_date) do update
    set
      product_views = analytics_daily_product.product_views + excluded.product_views,
      whatsapp_clicks = analytics_daily_product.whatsapp_clicks + excluded.whatsapp_clicks,
      share_events = analytics_daily_product.share_events + excluded.share_events,
      updated_at = now();
  end if;

  return new;
end;
$$;

revoke all on function private.rollup_analytics_event() from public, anon, authenticated;

create trigger analytics_events_rollup
  after insert on public.analytics_events
  for each row execute function private.rollup_analytics_event();

grant insert on public.analytics_events to anon, authenticated;
grant select on public.analytics_events to authenticated;
grant select on public.analytics_daily_business to authenticated;
grant select on public.analytics_daily_product to authenticated;
