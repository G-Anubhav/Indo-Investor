begin;

lock table public.network_nodes in access exclusive mode;

alter table public.network_nodes
  drop constraint if exists network_member_code_format;

-- Move every code through a collision-free value before assigning the final sequence.
update public.network_nodes
set member_code = 'IIW-' || upper(replace(user_id::text, '-', ''));

with ordered_members as (
  select
    user_id,
    1001 + row_number() over (order by joined_at, user_id) as sequence_value
  from public.network_nodes
)
update public.network_nodes as node
set member_code = 'IIIW' || ordered_members.sequence_value::text
from ordered_members
where ordered_members.user_id = node.user_id;

update public.member_code_counters
set next_value = 1002 + (select count(*) from public.network_nodes),
    updated_at = now()
where counter_key = 'network_member';

alter table public.network_nodes
  add constraint network_member_code_format
  check (member_code ~ '^IIIW[0-9]{4,}$');

comment on function public.generate_network_member_code() is
  'Allocates the next IIIW member code under a PostgreSQL row lock. All current and future member codes use the IIIW sequence.';

commit;
