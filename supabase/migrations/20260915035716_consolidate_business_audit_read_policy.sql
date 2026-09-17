drop policy if exists "Admins can read business audit logs"
  on public.business_audit_logs;

drop policy if exists "Business owners can read their business audit logs"
  on public.business_audit_logs;

create policy "Authorized users can read business audit logs"
  on public.business_audit_logs for select
  to authenticated
  using (
    private.is_admin()
    or private.has_business_role(business_id, array['owner', 'manager'])
  );
