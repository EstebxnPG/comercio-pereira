drop policy if exists "Business members can read peers in their businesses"
  on public.business_members;

create policy "Authenticated users can read relevant business memberships"
  on public.business_members for select
  to authenticated
  using (
    private.is_admin()
    or private.is_business_member(business_id)
    or (
      user_id is null
      and status = 'invited'
      and lower(invited_email) = lower((select auth.email()))
    )
  );
