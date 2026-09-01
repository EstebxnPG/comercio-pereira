alter table public.business_submissions
  add constraint business_submissions_owner_phone_check
    check (owner_phone is null or owner_phone ~ '^\d{10,15}$'),
  add constraint business_submissions_whatsapp_check
    check (whatsapp is null or whatsapp ~ '^\d{10,15}$'),
  add constraint business_submissions_email_length_check
    check (email is null or char_length(email) <= 120),
  add constraint business_submissions_business_name_length_check
    check (char_length(business_name) <= 90),
  add constraint business_submissions_description_length_check
    check (description is null or char_length(description) <= 420),
  add constraint business_submissions_full_description_length_check
    check (full_description is null or char_length(full_description) <= 1200);

drop policy if exists "Public can submit businesses"
  on public.business_submissions;

create policy "Public can submit pending businesses"
  on public.business_submissions for insert
  with check (
    status = 'pending'
    and accepts_publication = true
    and char_length(business_name) between 1 and 90
    and owner_name is not null
    and char_length(owner_name) between 1 and 90
    and owner_phone ~ '^\d{10,15}$'
    and whatsapp ~ '^\d{10,15}$'
    and description is not null
    and char_length(description) between 1 and 420
    and full_description is not null
    and char_length(full_description) between 1 and 1200
  );
