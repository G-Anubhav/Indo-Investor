begin;

create table public.member_code_counters (
  counter_key text primary key,
  next_value bigint not null,
  updated_at timestamptz not null default now(),
  constraint member_code_counter_key check (counter_key = 'network_member'),
  constraint member_code_counter_minimum check (next_value >= 1002)
);

alter table public.member_code_counters enable row level security;
alter table public.member_code_counters force row level security;
revoke all on table public.member_code_counters from public, anon, authenticated;

insert into public.member_code_counters (counter_key, next_value)
values (
  'network_member',
  greatest(
    1002,
    coalesce((
      select max(substring(n.member_code from 5)::bigint) + 1
      from public.network_nodes n
      where n.member_code ~ '^IIIW[0-9]{4,}$'
    ), 1002)
  )
)
on conflict (counter_key) do update
set next_value = greatest(public.member_code_counters.next_value, excluded.next_value),
    updated_at = now();

alter table public.network_nodes
  drop constraint if exists network_member_code_format;
alter table public.network_nodes
  add constraint network_member_code_format
  check (member_code ~ '^(IIW-[A-Z0-9]{10,32}|IIIW[0-9]{4,})$');

create or replace function public.generate_network_member_code()
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  allocated_value bigint;
begin
  update public.member_code_counters
  set next_value = next_value + 1,
      updated_at = now()
  where counter_key = 'network_member'
  returning next_value - 1 into allocated_value;

  if allocated_value is null then
    raise exception using errcode = 'P0001', message = 'member_code_counter_unavailable';
  end if;

  return 'IIIW' || allocated_value::text;
end;
$$;

revoke all on function public.generate_network_member_code() from public, anon, authenticated;

comment on table public.member_code_counters is
  'Service-owned transactional counter for human-facing network member identifiers.';
comment on function public.generate_network_member_code() is
  'Allocates the next IIIW member code under a PostgreSQL row lock. Existing IIW codes remain valid historical identifiers.';

commit;
