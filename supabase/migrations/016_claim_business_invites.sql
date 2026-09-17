create or replace function private.claim_business_invites()
returns integer
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  current_user_id uuid := (select auth.uid());
  current_email text;
  claimed_count integer := 0;
begin
  if current_user_id is null then
    raise exception 'Authentication required'
      using errcode = '28000';
  end if;

  select lower(email)
    into current_email
  from auth.users
  where id = current_user_id
    and email_confirmed_at is not null;

  if current_email is null then
    return 0;
  end if;

  update public.business_members bm
  set
    user_id = current_user_id,
    invited_email = null,
    status = 'active'
  where bm.user_id is null
    and bm.status = 'invited'
    and lower(bm.invited_email) = current_email;

  get diagnostics claimed_count = row_count;

  update public.businesses b
  set
    owner_user_id = current_user_id,
    onboarding_status = 'complete',
    updated_by = current_user_id
  where b.owner_user_id is null
    and exists (
      select 1
      from public.business_members bm
      where bm.business_id = b.id
        and bm.user_id = current_user_id
        and bm.role = 'owner'
        and bm.status = 'active'
    );

  return claimed_count;
end;
$$;

revoke all on function private.claim_business_invites() from public, anon, authenticated;
grant execute on function private.claim_business_invites() to authenticated;
