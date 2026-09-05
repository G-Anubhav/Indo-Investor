begin;

drop trigger if exists on_profile_created_initialize_network on public.profiles;
drop trigger if exists zz_on_auth_user_created_initialize_network on auth.users;

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
begin
  requested_sponsor_code := upper(nullif(trim(auth_metadata ->> 'sponsor_code'), ''));

  if requested_sponsor_code is null then
    if coalesce((auth_app_metadata ->> 'allow_network_root')::boolean, false) is not true then
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
    user_id,
    member_code,
    sponsor_user_id,
    parent_user_id,
    placement_leg,
    joined_at
  )
  values (
    new.id,
    public.generate_network_member_code(),
    sponsor_id,
    sponsor_id,
    requested_leg,
    new.created_at
  );

  return new;
exception
  when unique_violation then
    raise exception using errcode = 'P0001', message = 'network_position_occupied';
end;
$$;

-- PostgreSQL executes same-event triggers alphabetically. The `zz_` prefix ensures
-- Phase 1 profile initialization completes before the profile foreign key is used.
create trigger zz_on_auth_user_created_initialize_network
after insert on auth.users
for each row execute function public.initialize_network_node();

commit;
