create policy "Business members can read their businesses"
  on public.businesses for select
  to authenticated
  using (private.is_admin() or private.is_business_member(id));

create policy "Business members can read social links for their businesses"
  on public.business_social_links for select
  to authenticated
  using (
    private.is_admin()
    or private.is_business_member(business_id)
  );
