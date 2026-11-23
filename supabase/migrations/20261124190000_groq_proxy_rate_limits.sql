begin;

create table if not exists public.ares_llm_rate_limits (
  ip_hash text primary key check (ip_hash ~ '^[a-f0-9]{64}$'),
  window_started_at timestamptz not null default now(),
  request_count integer not null default 0 check (request_count between 0 and 20)
);

create table if not exists public.ares_llm_daily_usage (
  usage_date date primary key,
  request_count integer not null default 0 check (request_count between 0 and 300),
  updated_at timestamptz not null default now()
);

alter table public.ares_llm_rate_limits enable row level security;
alter table public.ares_llm_daily_usage enable row level security;
revoke all on table public.ares_llm_rate_limits from public, anon, authenticated;
revoke all on table public.ares_llm_daily_usage from public, anon, authenticated;
grant select, insert, update, delete on table public.ares_llm_rate_limits to service_role;
grant select, insert, update, delete on table public.ares_llm_daily_usage to service_role;

create or replace function public.reserve_ares_llm_request(
  p_usage_date date,
  p_ip_hash text
)
returns table (
  allowed boolean,
  reason text,
  retry_after_seconds integer,
  daily_request_count integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_window_started_at timestamptz;
  v_ip_request_count integer;
  v_daily_request_count integer;
begin
  if p_usage_date <> (now() at time zone 'UTC')::date
     or p_ip_hash !~ '^[a-f0-9]{64}$' then
    return query select false, 'invalid_request'::text, null::integer, null::integer;
    return;
  end if;

  insert into public.ares_llm_rate_limits as rate_limit (ip_hash, window_started_at, request_count)
  values (p_ip_hash, now(), 1)
  on conflict (ip_hash) do update
    set window_started_at = case
          when rate_limit.window_started_at <= now() - interval '1 hour' then now()
          else rate_limit.window_started_at
        end,
        request_count = case
          when rate_limit.window_started_at <= now() - interval '1 hour' then 1
          else rate_limit.request_count + 1
        end
    where rate_limit.window_started_at <= now() - interval '1 hour'
       or rate_limit.request_count < 20
  returning rate_limit.window_started_at, rate_limit.request_count
    into v_window_started_at, v_ip_request_count;

  if not found then
    select limits.window_started_at
      into v_window_started_at
      from public.ares_llm_rate_limits as limits
      where limits.ip_hash = p_ip_hash;
    return query select
      false,
      'ip_rate_limit'::text,
      greatest(1, ceil(extract(epoch from (v_window_started_at + interval '1 hour' - now())))::integer),
      null::integer;
    return;
  end if;

  delete from public.ares_llm_rate_limits
    where window_started_at < now() - interval '2 days'
      and ip_hash <> p_ip_hash;

  insert into public.ares_llm_daily_usage as daily_usage (usage_date, request_count)
  values (p_usage_date, 1)
  on conflict (usage_date) do update
    set request_count = daily_usage.request_count + 1,
        updated_at = now()
    where daily_usage.request_count < 300
  returning daily_usage.request_count into v_daily_request_count;

  if not found then
    select daily_usage.request_count
      into v_daily_request_count
      from public.ares_llm_daily_usage as daily_usage
      where daily_usage.usage_date = p_usage_date;
    return query select false, 'daily_request_limit'::text, null::integer, v_daily_request_count;
    return;
  end if;

  return query select true, null::text, null::integer, v_daily_request_count;
end;
$$;

revoke all on function public.reserve_ares_llm_request(date, text) from public, anon, authenticated;
grant execute on function public.reserve_ares_llm_request(date, text) to service_role;

commit;
