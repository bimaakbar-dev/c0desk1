begin;

create table public.ares_automation_control (
  id smallint primary key default 1 check (id = 1),
  automation_enabled boolean not null default false,
  max_images_per_day integer not null default 300 check (max_images_per_day between 1 and 300),
  pause_reason text not null default 'Penyedia gambar gratis terverifikasi belum dipilih.',
  last_run_at timestamptz,
  updated_at timestamptz not null default now()
);

insert into public.ares_automation_control (id)
values (1)
on conflict (id) do nothing;

create table public.ares_daily_usage (
  usage_date date primary key,
  generated_count integer not null default 0 check (generated_count between 0 and 300),
  storage_bytes bigint not null default 0 check (storage_bytes >= 0),
  egress_bytes bigint not null default 0 check (egress_bytes >= 0),
  updated_at timestamptz not null default now()
);

alter table public.ares_automation_control enable row level security;
alter table public.ares_daily_usage enable row level security;

revoke all on table public.ares_automation_control from public, anon, authenticated;
revoke all on table public.ares_daily_usage from public, anon, authenticated;
grant select, insert, update, delete on table public.ares_automation_control to service_role;
grant select, insert, update, delete on table public.ares_daily_usage to service_role;

commit;
