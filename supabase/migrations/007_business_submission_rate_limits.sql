create table if not exists public.business_submission_rate_limits (
  identifier text primary key,
  window_start timestamptz not null default now(),
  request_count integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.business_submission_rate_limits enable row level security;

create or replace function public.increment_business_submission_rate_limit(
  p_identifier text,
  p_max_requests integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
as $$
declare
  current_count integer;
  current_window_start timestamptz;
begin
  if p_identifier is null
    or char_length(p_identifier) <> 64
    or p_max_requests < 1
    or p_window_seconds < 1
  then
    return false;
  end if;

  insert into public.business_submission_rate_limits as limits (
    identifier,
    window_start,
    request_count,
    updated_at
  )
  values (
    p_identifier,
    now(),
    1,
    now()
  )
  on conflict (identifier) do update
    set
      window_start = case
        when limits.window_start <= now() - make_interval(secs => p_window_seconds)
          then now()
        else limits.window_start
      end,
      request_count = case
        when limits.window_start <= now() - make_interval(secs => p_window_seconds)
          then 1
        else limits.request_count + 1
      end,
      updated_at = now()
  returning request_count, window_start
    into current_count, current_window_start;

  return current_window_start > now() - make_interval(secs => p_window_seconds)
    and current_count <= p_max_requests;
end;
$$;

revoke execute on function public.increment_business_submission_rate_limit(
  text,
  integer,
  integer
) from public, anon, authenticated;

grant execute on function public.increment_business_submission_rate_limit(
  text,
  integer,
  integer
) to service_role;
