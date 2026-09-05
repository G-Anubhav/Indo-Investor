begin;

create table if not exists public.network_root_creation_requests (
  email text primary key,
  requested_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '10 minutes'),
  constraint network_root_request_email_normalized check (email = lower(trim(email)) and char_length(email) <= 254),
  constraint network_root_request_expiry check (expires_at > requested_at)
);

create index if not exists network_root_requests_expiry_idx
on public.network_root_creation_requests (expires_at);

alter table public.network_root_creation_requests enable row level security;
alter table public.network_root_creation_requests force row level security;
revoke all on table public.network_root_creation_requests from public, anon, authenticated;
grant select, insert, update, delete on table public.network_root_creation_requests to service_role;

create or replace function public.initialize_network_node()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  auth_metadata jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  auth_app_metadata jsonb := coalesce(new.raw_app_meta_data, '{}'::jsonb);
  requested_sponsor_code text;
  requested_leg public.network_leg;
  sponsor_id uuid;
  root_request_authorized boolean := false;
begin
  requested_sponsor_code := upper(nullif(trim(auth_metadata ->> 'sponsor_code'), ''));

  if requested_sponsor_code is null then
    delete from public.network_root_creation_requests r
    where r.email = lower(new.email) and r.expires_at > now()
    returning true into root_request_authorized;

    if coalesce((auth_app_metadata ->> 'allow_network_root')::boolean, false) is not true
      and not coalesce(root_request_authorized, false) then
      raise exception using errcode = 'P0001', message = 'sponsor_required';
    end if;

    insert into public.network_nodes (user_id, member_code, joined_at)
    values (new.id, public.generate_network_member_code(), new.created_at)
    on conflict (user_id) do nothing;
    return new;
  end if;

  begin
    requested_leg := lower(auth_metadata ->> 'target_leg')::public.network_leg;
  exception when invalid_text_representation then
    raise exception using errcode = 'P0001', message = 'invalid_target_leg';
  end;

  select n.user_id into sponsor_id
  from public.network_nodes n
  where n.member_code = requested_sponsor_code
  for update;

  if sponsor_id is null then
    raise exception using errcode = 'P0001', message = 'invalid_sponsor';
  end if;

  insert into public.network_nodes (
    user_id, member_code, sponsor_user_id, parent_user_id, placement_leg, joined_at
  ) values (
    new.id, public.generate_network_member_code(), sponsor_id, sponsor_id,
    requested_leg, new.created_at
  );

  return new;
exception
  when unique_violation then
    raise exception using errcode = 'P0001', message = 'network_position_occupied';
end;
$$;

commit;
