do $$
declare
  constraint_name text;
begin
  select con.conname
    into constraint_name
  from pg_constraint con
  join pg_class rel on rel.oid = con.conrelid
  join pg_namespace nsp on nsp.oid = rel.relnamespace
  where nsp.nspname = 'public'
    and rel.relname = 'businesses'
    and con.contype = 'c'
    and pg_get_constraintdef(con.oid) like '%status%'
    and pg_get_constraintdef(con.oid) like '%temporarily_closed%'
  limit 1;

  if constraint_name is not null then
    execute format('alter table public.businesses drop constraint %I', constraint_name);
  end if;

  alter table public.businesses
    add constraint businesses_status_check
    check (
      status in (
        'open',
        'partial_service',
        'remote_attention',
        'relocated',
        'delivery_only',
        'temporarily_closed'
      )
    );
end $$;
