drop policy if exists "Public can read published businesses"
  on public.businesses;

drop policy if exists "Business members can read their businesses"
  on public.businesses;

drop policy if exists "Public can read social links for published businesses"
  on public.business_social_links;

drop policy if exists "Business members can read social links for their businesses"
  on public.business_social_links;

create policy "Anon can read published businesses"
  on public.businesses for select
  to anon
  using (published = true);

create policy "Authenticated can read published or owned businesses"
  on public.businesses for select
  to authenticated
  using (
    published = true
    or private.is_admin()
    or private.is_business_member(id)
  );

create policy "Anon can read social links for published businesses"
  on public.business_social_links for select
  to anon
  using (
    exists (
      select 1
      from public.businesses
      where businesses.id = business_social_links.business_id
        and businesses.published = true
    )
  );

create policy "Authenticated can read public or owned social links"
  on public.business_social_links for select
  to authenticated
  using (
    exists (
      select 1
      from public.businesses
      where businesses.id = business_social_links.business_id
        and businesses.published = true
    )
    or private.is_admin()
    or private.is_business_member(business_id)
  );
