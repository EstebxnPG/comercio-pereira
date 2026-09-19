alter table public.products
  add column if not exists discount_percentage integer check (
    discount_percentage is null
    or discount_percentage between 1 and 90
  ),
  add column if not exists discount_starts_at timestamptz,
  add column if not exists discount_ends_at timestamptz,
  add column if not exists discount_label text,
  add constraint products_discount_window_check check (
    discount_starts_at is null
    or discount_ends_at is null
    or discount_ends_at > discount_starts_at
  );

alter table public.business_audit_logs
  drop constraint if exists business_audit_logs_action_check;

alter table public.business_audit_logs
  add constraint business_audit_logs_action_check check (
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
      'product_featured',
      'promotion_created',
      'promotion_updated',
      'promotion_deleted'
    )
  );

create table if not exists public.business_promotions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  type text not null check (
    type in ('free_shipping', 'coupon_amount', 'store_percentage', 'custom_message')
  ),
  title text not null,
  description text,
  value integer check (value is null or value > 0),
  minimum_order_amount integer check (
    minimum_order_amount is null
    or minimum_order_amount >= 0
  ),
  status text not null default 'draft' check (
    status in ('draft', 'active', 'paused', 'expired', 'rejected')
  ),
  starts_at timestamptz,
  ends_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint business_promotions_title_not_blank check (length(btrim(title)) > 0),
  constraint business_promotions_window_check check (
    starts_at is null
    or ends_at is null
    or ends_at > starts_at
  ),
  constraint business_promotions_value_required_check check (
    type in ('free_shipping', 'custom_message')
    or value is not null
  )
);

create index if not exists business_promotions_business_status_idx
  on public.business_promotions(business_id, status, updated_at desc);

create index if not exists business_promotions_public_idx
  on public.business_promotions(status, starts_at, ends_at)
  where status = 'active';

create trigger business_promotions_set_updated_at
  before update on public.business_promotions
  for each row execute function public.set_updated_at();

alter table public.business_promotions enable row level security;

create policy "Public can read active business promotions"
  on public.business_promotions for select
  to anon
  using (
    status = 'active'
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at >= now())
    and exists (
      select 1
      from public.businesses b
      where b.id = business_promotions.business_id
        and b.published = true
    )
  );

create policy "Business managers can read their promotions"
  on public.business_promotions for select
  to authenticated
  using (
    private.is_admin()
    or private.has_business_role(business_id, array['owner', 'manager'])
    or (
      status = 'active'
      and (starts_at is null or starts_at <= now())
      and (ends_at is null or ends_at >= now())
      and exists (
        select 1
        from public.businesses b
        where b.id = business_promotions.business_id
          and b.published = true
      )
    )
  );

create policy "Business managers can create promotions"
  on public.business_promotions for insert
  to authenticated
  with check (
    created_by = (select auth.uid())
    and updated_by = (select auth.uid())
    and private.has_business_role(business_id, array['owner', 'manager'])
  );

create policy "Business managers can update their promotions"
  on public.business_promotions for update
  to authenticated
  using (
    private.has_business_role(business_id, array['owner', 'manager'])
  )
  with check (
    updated_by = (select auth.uid())
    and private.has_business_role(business_id, array['owner', 'manager'])
  );

create policy "Business managers can delete draft promotions"
  on public.business_promotions for delete
  to authenticated
  using (
    status in ('draft', 'paused', 'expired', 'rejected')
    and private.has_business_role(business_id, array['owner', 'manager'])
  );

create policy "Service role can manage business promotions"
  on public.business_promotions for all
  to service_role
  using (true)
  with check (true);

grant select on public.business_promotions to anon, authenticated;
grant insert, update, delete on public.business_promotions to authenticated;

alter table public.analytics_events
  add column if not exists promotion_id uuid references public.business_promotions(id) on delete cascade;

alter table public.analytics_events
  drop constraint if exists analytics_events_target_check;

alter table public.analytics_events
  add constraint analytics_events_target_check check (
    business_id is not null
    or product_id is not null
    or promotion_id is not null
  );

alter table public.analytics_events
  drop constraint if exists analytics_events_event_type_check;

alter table public.analytics_events
  add constraint analytics_events_event_type_check check (
    event_type in (
      'business_profile_view',
      'product_view',
      'discounted_product_view',
      'click_whatsapp',
      'click_phone',
      'click_maps',
      'click_website',
      'click_social',
      'share_business',
      'share_product',
      'search_result_view',
      'promotion_view',
      'promotion_click'
    )
  );

create index if not exists analytics_events_promotion_created_idx
  on public.analytics_events(promotion_id, created_at desc);

drop policy if exists "Public can insert analytics events"
  on public.analytics_events;

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
    or (
      promotion_id is not null
      and exists (
        select 1
        from public.business_promotions bp
        join public.businesses b on b.id = bp.business_id
        where bp.id = analytics_events.promotion_id
          and bp.status = 'active'
          and (bp.starts_at is null or bp.starts_at <= now())
          and (bp.ends_at is null or bp.ends_at >= now())
          and b.published = true
      )
    )
  );

alter table public.analytics_daily_business
  add column if not exists discounted_product_views integer not null default 0,
  add column if not exists promotion_views integer not null default 0,
  add column if not exists promotion_clicks integer not null default 0;

alter table public.analytics_daily_product
  add column if not exists discounted_product_views integer not null default 0;

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

  if resolved_business_id is null and new.promotion_id is not null then
    select bp.business_id
    into resolved_business_id
    from public.business_promotions bp
    where bp.id = new.promotion_id;
  end if;

  if resolved_business_id is null then
    return new;
  end if;

  insert into public.analytics_daily_business (
    business_id,
    event_date,
    profile_views,
    product_views,
    discounted_product_views,
    whatsapp_clicks,
    phone_clicks,
    website_clicks,
    social_clicks,
    share_events,
    promotion_views,
    promotion_clicks
  )
  values (
    resolved_business_id,
    new.created_at::date,
    case when new.event_type = 'business_profile_view' then 1 else 0 end,
    case when new.event_type = 'product_view' then 1 else 0 end,
    case when new.event_type = 'discounted_product_view' then 1 else 0 end,
    case when new.event_type = 'click_whatsapp' then 1 else 0 end,
    case when new.event_type = 'click_phone' then 1 else 0 end,
    case when new.event_type in ('click_website', 'click_maps') then 1 else 0 end,
    case when new.event_type = 'click_social' then 1 else 0 end,
    case when new.event_type in ('share_business', 'share_product') then 1 else 0 end,
    case when new.event_type = 'promotion_view' then 1 else 0 end,
    case when new.event_type = 'promotion_click' then 1 else 0 end
  )
  on conflict (business_id, event_date) do update
  set
    profile_views = analytics_daily_business.profile_views + excluded.profile_views,
    product_views = analytics_daily_business.product_views + excluded.product_views,
    discounted_product_views = analytics_daily_business.discounted_product_views + excluded.discounted_product_views,
    whatsapp_clicks = analytics_daily_business.whatsapp_clicks + excluded.whatsapp_clicks,
    phone_clicks = analytics_daily_business.phone_clicks + excluded.phone_clicks,
    website_clicks = analytics_daily_business.website_clicks + excluded.website_clicks,
    social_clicks = analytics_daily_business.social_clicks + excluded.social_clicks,
    share_events = analytics_daily_business.share_events + excluded.share_events,
    promotion_views = analytics_daily_business.promotion_views + excluded.promotion_views,
    promotion_clicks = analytics_daily_business.promotion_clicks + excluded.promotion_clicks,
    updated_at = now();

  if new.product_id is not null then
    insert into public.analytics_daily_product (
      product_id,
      business_id,
      event_date,
      product_views,
      discounted_product_views,
      whatsapp_clicks,
      share_events
    )
    values (
      new.product_id,
      resolved_business_id,
      new.created_at::date,
      case when new.event_type = 'product_view' then 1 else 0 end,
      case when new.event_type = 'discounted_product_view' then 1 else 0 end,
      case when new.event_type = 'click_whatsapp' then 1 else 0 end,
      case when new.event_type = 'share_product' then 1 else 0 end
    )
    on conflict (product_id, event_date) do update
    set
      product_views = analytics_daily_product.product_views + excluded.product_views,
      discounted_product_views = analytics_daily_product.discounted_product_views + excluded.discounted_product_views,
      whatsapp_clicks = analytics_daily_product.whatsapp_clicks + excluded.whatsapp_clicks,
      share_events = analytics_daily_product.share_events + excluded.share_events,
      updated_at = now();
  end if;

  return new;
end;
$$;
