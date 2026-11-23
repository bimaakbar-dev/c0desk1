begin;

alter table public.ares_automation_control
  drop constraint if exists ares_automation_control_max_images_per_day_check;
update public.ares_automation_control
  set max_images_per_day = 250
  where max_images_per_day > 250;
alter table public.ares_automation_control
  add constraint ares_automation_control_max_images_per_day_check
  check (max_images_per_day between 1 and 250);
alter table public.ares_daily_usage
  add column if not exists image_request_count integer not null default 0
    check (image_request_count between 0 and 250),
  add column if not exists estimated_neurons numeric(12, 2) not null default 0
    check (estimated_neurons between 0 and 9500);

create table if not exists public.ares_image_rate_limits (
  ip_hash text primary key check (ip_hash ~ '^[a-f0-9]{64}$'),
  window_started_at timestamptz not null default now(),
  request_count integer not null default 0 check (request_count between 0 and 12)
);

alter table public.ares_image_rate_limits enable row level security;
revoke all on table public.ares_image_rate_limits from public, anon, authenticated;
grant select, insert, update, delete on table public.ares_image_rate_limits to service_role;

drop function if exists public.reserve_ares_image_generation(date, text, numeric);
create function public.reserve_ares_image_generation(
  p_usage_date date,
  p_ip_hash text,
  p_estimated_neurons numeric
)
returns table (
  allowed boolean,
  reason text,
  reserved_requests integer,
  estimated_neurons numeric,
  retry_after_seconds integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_window_started_at timestamptz;
  v_ip_request_count integer;
  v_reserved_requests integer;
  v_estimated_neurons numeric;
begin
  if p_usage_date <> (now() at time zone 'UTC')::date then
    return query select false, 'invalid_date'::text, null::integer, null::numeric, null::integer;
    return;
  end if;

  if p_ip_hash !~ '^[a-f0-9]{64}$' or p_estimated_neurons <> 60 then
    return query select false, 'invalid_reservation'::text, null::integer, null::numeric, null::integer;
    return;
  end if;

  insert into public.ares_image_rate_limits as rate_limit (ip_hash, window_started_at, request_count)
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
       or rate_limit.request_count < 12
  returning rate_limit.window_started_at, rate_limit.request_count
    into v_window_started_at, v_ip_request_count;

  if not found then
    select limits.window_started_at, limits.request_count
      into v_window_started_at, v_ip_request_count
      from public.ares_image_rate_limits as limits
      where limits.ip_hash = p_ip_hash;
    return query select
      false,
      'ip_rate_limit'::text,
      null::integer,
      null::numeric,
      greatest(1, ceil(extract(epoch from (v_window_started_at + interval '1 hour' - now())))::integer);
    return;
  end if;

  delete from public.ares_image_rate_limits
    where window_started_at < now() - interval '2 days'
      and ip_hash <> p_ip_hash;

  insert into public.ares_daily_usage as daily_usage (
    usage_date,
    image_request_count,
    estimated_neurons
  )
  values (p_usage_date, 1, p_estimated_neurons)
  on conflict (usage_date) do update
    set image_request_count = daily_usage.image_request_count + 1,
        estimated_neurons = daily_usage.estimated_neurons + excluded.estimated_neurons,
        updated_at = now()
    where daily_usage.image_request_count < 250
      and daily_usage.estimated_neurons + excluded.estimated_neurons <= 9500
  returning daily_usage.image_request_count, daily_usage.estimated_neurons
    into v_reserved_requests, v_estimated_neurons;

  if not found then
    select daily_usage.image_request_count, daily_usage.estimated_neurons
      into v_reserved_requests, v_estimated_neurons
      from public.ares_daily_usage as daily_usage
      where daily_usage.usage_date = p_usage_date;
    return query select
      false,
      case
        when coalesce(v_reserved_requests, 0) >= 250 then 'image_limit'
        else 'neuron_budget'
      end,
      coalesce(v_reserved_requests, 0),
      coalesce(v_estimated_neurons, 0),
      null::integer;
    return;
  end if;

  return query select true, null::text, v_reserved_requests, v_estimated_neurons, null::integer;
end;
$$;

revoke all on function public.reserve_ares_image_generation(date, text, numeric) from public, anon, authenticated;
grant execute on function public.reserve_ares_image_generation(date, text, numeric) to service_role;

create or replace function public.record_ares_image_generation(
  p_usage_date date,
  p_image_bytes bigint
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_usage_date <> (now() at time zone 'UTC')::date
     or p_image_bytes < 0
     or p_image_bytes > 20971520 then
    raise exception 'invalid image usage data';
  end if;

  update public.ares_daily_usage as daily_usage
    set generated_count = least(250, daily_usage.generated_count + 1),
        storage_bytes = daily_usage.storage_bytes + p_image_bytes,
        egress_bytes = daily_usage.egress_bytes + p_image_bytes,
        updated_at = now()
    where daily_usage.usage_date = p_usage_date;

  if not found then
    raise exception 'image reservation not found';
  end if;
end;
$$;

revoke all on function public.record_ares_image_generation(date, bigint) from public, anon, authenticated;
grant execute on function public.record_ares_image_generation(date, bigint) to service_role;

update public.ares_automation_control
  set max_images_per_day = 250,
      pause_reason = 'Workers AI memakai batas global bersama: maksimal 250 gambar dan 9.500 Neurons estimasi per hari.',
      updated_at = now()
  where id = 1;

commit;
