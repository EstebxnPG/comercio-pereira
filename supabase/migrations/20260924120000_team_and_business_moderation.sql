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
      'business_moderated',
      'product_created',
      'product_updated',
      'product_image_updated',
      'product_approved',
      'product_rejected',
      'product_hidden',
      'product_featured',
      'promotion_created',
      'promotion_updated',
      'promotion_deleted',
      'team_member_invited',
      'team_member_role_updated',
      'team_member_removed'
    )
  );

alter table public.businesses
  add column if not exists suspended boolean not null default false;
