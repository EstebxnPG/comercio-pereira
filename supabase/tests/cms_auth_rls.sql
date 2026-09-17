begin;

select plan(26);

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data
)
values
  (
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'owner@example.test',
    'test',
    now(),
    now(),
    now(),
    '{}',
    '{}'
  ),
  (
    '00000000-0000-0000-0000-000000000202',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'other@example.test',
    'test',
    now(),
    now(),
    now(),
    '{}',
    '{}'
  ),
  (
    '00000000-0000-0000-0000-000000000707',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'invited@example.test',
    'test',
    now(),
    now(),
    now(),
    '{}',
    '{}'
  ),
  (
    '00000000-0000-0000-0000-000000000606',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'outsider@example.test',
    'test',
    now(),
    now(),
    now(),
    '{}',
    '{}'
  );

insert into public.categories (id, slug, name, icon, description)
values (
  '00000000-0000-0000-0000-000000000303',
  'rls-test-category',
  'RLS Test Category',
  'store',
  'Only used by RLS tests.'
);

insert into public.businesses (
  id,
  category_id,
  slug,
  name,
  short_description,
  logo_url,
  status,
  published
)
values
  (
    '00000000-0000-0000-0000-000000000404',
    '00000000-0000-0000-0000-000000000303',
    'rls-owned-business',
    'RLS Owned Business',
    'Owned business',
    'https://example.test/logo.png',
    'open',
    false
  ),
  (
    '00000000-0000-0000-0000-000000000505',
    '00000000-0000-0000-0000-000000000303',
    'rls-other-business',
    'RLS Other Business',
    'Other business',
    'https://example.test/logo.png',
    'open',
    false
  ),
  (
    '00000000-0000-0000-0000-000000000808',
    '00000000-0000-0000-0000-000000000303',
    'rls-invited-business',
    'RLS Invited Business',
    'Invited business',
    'https://example.test/logo.png',
    'open',
    false
  );

insert into public.profiles (id, full_name)
values
  ('00000000-0000-0000-0000-000000000101', 'Owner User'),
  ('00000000-0000-0000-0000-000000000202', 'Other User');

insert into public.business_members (business_id, user_id, role, status)
values (
  '00000000-0000-0000-0000-000000000404',
  '00000000-0000-0000-0000-000000000101',
  'owner',
  'active'
);

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '00000000-0000-0000-0000-000000000101',
  true
);
select set_config('request.jwt.claim.role', 'authenticated', true);

select is(
  (select count(*) from public.profiles),
  1::bigint,
  'authenticated users can only read their own profile'
);

select is(
  (select count(*) from public.business_members),
  1::bigint,
  'business members can read memberships only for their business'
);

select is(
  (select count(*) from public.businesses where id = '00000000-0000-0000-0000-000000000404'),
  1::bigint,
  'business members can read their unpublished business'
);

select lives_ok(
  $$
    update public.businesses
    set short_description = 'Updated by owner'
    where id = '00000000-0000-0000-0000-000000000404'
  $$,
  'business owners can update editable business fields'
);

select throws_ok(
  $$
    update public.businesses
    set published = true
    where id = '00000000-0000-0000-0000-000000000404'
  $$,
  '42501',
  'permission denied for table businesses',
  'business owners cannot update moderation fields'
);

select throws_ok(
  $$
    update public.businesses
    set publication_status = 'hidden'
    where id = '00000000-0000-0000-0000-000000000404'
  $$,
  '42501',
  'permission denied for table businesses',
  'business owners cannot update CMS publication fields'
);

select lives_ok(
  $$
    insert into storage.objects (
      bucket_id,
      name,
      owner,
      metadata
    )
    values (
      'business-logos',
      '00000000-0000-0000-0000-000000000404/logo-test.png',
      '00000000-0000-0000-0000-000000000101',
      '{"mimetype":"image/png","size":10}'::jsonb
    )
  $$,
  'business owners can upload image objects to their business folder'
);

select lives_ok(
  $$
    insert into public.business_audit_logs (
      business_id,
      actor_user_id,
      action,
      metadata
    )
    values (
      '00000000-0000-0000-0000-000000000404',
      '00000000-0000-0000-0000-000000000101',
      'business_profile_updated',
      '{"fields":["name"]}'::jsonb
    )
  $$,
  'business owners can insert audit logs for their business'
);

select is(
  (select count(*) from public.business_audit_logs),
  1::bigint,
  'business owners can read their business audit logs'
);

select lives_ok(
  $$
    insert into public.business_members (
      business_id,
      user_id,
      role,
      status
    )
    values (
      '00000000-0000-0000-0000-000000000404',
      '00000000-0000-0000-0000-000000000202',
      'editor',
      'active'
    )
  $$,
  'business owners can add members to their business'
);

select throws_ok(
  $$
    insert into public.business_members (
      business_id,
      user_id,
      role,
      status
    )
    values (
      '00000000-0000-0000-0000-000000000505',
      '00000000-0000-0000-0000-000000000202',
      'editor',
      'active'
    )
  $$,
  '42501',
  'new row violates row-level security policy for table "business_members"',
  'business owners cannot add members to another business'
);

select is(
  (select count(*) from public.business_members),
  2::bigint,
  'failed cross-business insert does not leak into visible memberships'
);

select set_config(
  'request.jwt.claim.sub',
  '00000000-0000-0000-0000-000000000606',
  true
);

select is(
  (select count(*) from public.businesses where id = '00000000-0000-0000-0000-000000000404'),
  0::bigint,
  'authenticated users cannot read businesses where they are not members'
);

select throws_ok(
  $$
    insert into storage.objects (
      bucket_id,
      name,
      owner,
      metadata
    )
    values (
      'business-logos',
      '00000000-0000-0000-0000-000000000404/outsider-logo-test.png',
      '00000000-0000-0000-0000-000000000606',
      '{"mimetype":"image/png","size":10}'::jsonb
    )
  $$,
  '42501',
  'new row violates row-level security policy for table "objects"',
  'outsiders cannot upload image objects to another business folder'
);

select throws_ok(
  $$
    insert into public.business_audit_logs (
      business_id,
      actor_user_id,
      action,
      metadata
    )
    values (
      '00000000-0000-0000-0000-000000000404',
      '00000000-0000-0000-0000-000000000606',
      'business_profile_updated',
      '{}'::jsonb
    )
  $$,
  '42501',
  'new row violates row-level security policy for table "business_audit_logs"',
  'outsiders cannot insert audit logs for another business'
);

reset role;

insert into public.business_members (
  business_id,
  invited_email,
  role,
  status
)
values (
  '00000000-0000-0000-0000-000000000808',
  'invited@example.test',
  'owner',
  'invited'
);

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '00000000-0000-0000-0000-000000000707',
  true
);
select set_config('request.jwt.claim.email', 'invited@example.test', true);

select is(
  (select count(*) from public.business_members where status = 'invited'),
  1::bigint,
  'authenticated users can read invites for their own email'
);

select is(
  (select public.claim_business_invites()),
  1,
  'authenticated users can claim pending business invites for their confirmed email'
);

select is(
  (
    select count(*)
    from public.business_members
    where business_id = '00000000-0000-0000-0000-000000000808'
      and user_id = '00000000-0000-0000-0000-000000000707'
      and status = 'active'
  ),
  1::bigint,
  'claimed invites become active memberships'
);

reset role;

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '00000000-0000-0000-0000-000000000101',
  true
);
select set_config('request.jwt.claim.role', 'authenticated', true);

select lives_ok(
  $$
    insert into public.products (
      id,
      business_id,
      slug,
      name,
      short_description,
      status,
      moderation_status,
      created_by,
      updated_by
    )
    values (
      '00000000-0000-0000-0000-000000000909',
      '00000000-0000-0000-0000-000000000404',
      'rls-owned-business-test-product',
      'Test Product',
      'Owned test product',
      'draft',
      'draft',
      '00000000-0000-0000-0000-000000000101',
      '00000000-0000-0000-0000-000000000101'
    )
  $$,
  'business editors can create products for their business'
);

select is(
  (select count(*) from public.products where id = '00000000-0000-0000-0000-000000000909'),
  1::bigint,
  'business editors can read products for their business'
);

select throws_ok(
  $$
    update public.products
    set status = 'published'
    where id = '00000000-0000-0000-0000-000000000909'
  $$,
  '42501',
  'new row violates row-level security policy for table "products"',
  'business editors cannot publish products without admin moderation'
);

select set_config(
  'request.jwt.claim.sub',
  '00000000-0000-0000-0000-000000000606',
  true
);

select is(
  (select count(*) from public.products where id = '00000000-0000-0000-0000-000000000909'),
  0::bigint,
  'outsiders cannot read unpublished products from another business'
);

select throws_ok(
  $$
    insert into public.products (
      business_id,
      slug,
      name,
      short_description,
      status,
      moderation_status,
      created_by,
      updated_by
    )
    values (
      '00000000-0000-0000-0000-000000000404',
      'outsider-test-product',
      'Outsider Product',
      'Should fail',
      'draft',
      'draft',
      '00000000-0000-0000-0000-000000000606',
      '00000000-0000-0000-0000-000000000606'
    )
  $$,
  '42501',
  'new row violates row-level security policy for table "products"',
  'outsiders cannot create products for another business'
);

reset role;

update public.businesses
set published = true
where id = '00000000-0000-0000-0000-000000000404';

update public.products
set
  status = 'published',
  moderation_status = 'approved',
  published_at = now()
where id = '00000000-0000-0000-0000-000000000909';

set local role anon;

select is(
  (select count(*) from public.products where id = '00000000-0000-0000-0000-000000000909'),
  1::bigint,
  'anon users can read published approved products from published businesses'
);

select lives_ok(
  $$
    insert into public.analytics_events (
      business_id,
      product_id,
      event_type,
      anonymous_session_id
    )
    values (
      '00000000-0000-0000-0000-000000000404',
      '00000000-0000-0000-0000-000000000909',
      'product_view',
      'test-session'
    )
  $$,
  'anon users can insert product analytics events'
);

reset role;

select is(
  (
    select product_views
    from public.analytics_daily_product
    where product_id = '00000000-0000-0000-0000-000000000909'
      and event_date = current_date
  ),
  1,
  'analytics events roll up into daily product metrics'
);

select *
from finish();

rollback;
