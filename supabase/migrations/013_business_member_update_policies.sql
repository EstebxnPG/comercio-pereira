create policy "Business managers can update editable business fields"
  on public.businesses for update
  to authenticated
  using (
    private.is_admin()
    or private.has_business_role(id, array['owner', 'manager'])
  )
  with check (
    private.is_admin()
    or private.has_business_role(id, array['owner', 'manager'])
  );

create policy "Business managers can insert social links"
  on public.business_social_links for insert
  to authenticated
  with check (
    private.is_admin()
    or private.has_business_role(business_id, array['owner', 'manager'])
  );

create policy "Business managers can update social links"
  on public.business_social_links for update
  to authenticated
  using (
    private.is_admin()
    or private.has_business_role(business_id, array['owner', 'manager'])
  )
  with check (
    private.is_admin()
    or private.has_business_role(business_id, array['owner', 'manager'])
  );

create policy "Business managers can delete social links"
  on public.business_social_links for delete
  to authenticated
  using (
    private.is_admin()
    or private.has_business_role(business_id, array['owner', 'manager'])
  );
