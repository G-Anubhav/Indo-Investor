begin;

create type public.network_member_status as enum ('active', 'hold', 'pending_kyc');
create type public.network_leg as enum ('left', 'right');
create type public.project_status as enum ('draft', 'active', 'archived');
create type public.plot_inventory_status as enum ('available', 'token_hold', 'sold');
create type public.plot_hold_status as enum ('active', 'expired', 'released', 'converted');

create table public.network_nodes (
  user_id uuid primary key references public.profiles (user_id) on delete restrict,
  member_code text not null unique,
  sponsor_user_id uuid references public.network_nodes (user_id) on delete restrict,
  parent_user_id uuid references public.network_nodes (user_id) on delete restrict,
  placement_leg public.network_leg,
  member_status public.network_member_status not null default 'active',
  rank_name text,
  sales_volume numeric(16, 2),
  joined_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint network_member_code_format check (member_code ~ '^IIW-[A-Z0-9]{10,32}$'),
  constraint network_parent_leg_pair check (
    (parent_user_id is null and placement_leg is null)
    or (parent_user_id is not null and placement_leg is not null)
  ),
  constraint network_no_self_sponsor check (sponsor_user_id is null or sponsor_user_id <> user_id),
  constraint network_no_self_parent check (parent_user_id is null or parent_user_id <> user_id),
  constraint network_rank_length check (rank_name is null or char_length(trim(rank_name)) between 1 and 80),
  constraint network_sales_nonnegative check (sales_volume is null or sales_volume >= 0)
);

create unique index network_one_child_per_leg_idx
  on public.network_nodes (parent_user_id, placement_leg)
  where parent_user_id is not null;
create index network_sponsor_idx on public.network_nodes (sponsor_user_id, joined_at desc);
create index network_parent_idx on public.network_nodes (parent_user_id, placement_leg);
create index network_status_idx on public.network_nodes (member_status, joined_at desc);

create table public.network_root_creation_requests (
  email text primary key,
  requested_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '10 minutes'),
  constraint network_root_request_email_normalized check (email = lower(trim(email)) and char_length(email) <= 254),
  constraint network_root_request_expiry check (expires_at > requested_at)
);

create index network_root_requests_expiry_idx on public.network_root_creation_requests (expires_at);

create table public.real_estate_projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  status public.project_status not null default 'draft',
  location_name text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint project_name_length check (char_length(trim(name)) between 2 and 160),
  constraint project_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint project_description_length check (description is null or char_length(description) <= 4000),
  constraint project_location_length check (location_name is null or char_length(location_name) <= 240),
  constraint project_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create index projects_status_idx on public.real_estate_projects (status, created_at desc);

create table public.plots (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.real_estate_projects (id) on delete restrict,
  plot_number text not null,
  grid_row integer not null,
  grid_column integer not null,
  area_sq_yd numeric(12, 2),
  dimensions text,
  price numeric(14, 2),
  status public.plot_inventory_status not null default 'available',
  held_by_user_id uuid references public.profiles (user_id) on delete restrict,
  hold_expires_at timestamptz,
  booked_by_user_id uuid references public.profiles (user_id) on delete restrict,
  booked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint plots_number_length check (char_length(trim(plot_number)) between 1 and 40),
  constraint plots_grid_positive check (grid_row > 0 and grid_column > 0),
  constraint plots_area_positive check (area_sq_yd is null or area_sq_yd > 0),
  constraint plots_dimensions_length check (dimensions is null or char_length(dimensions) <= 120),
  constraint plots_price_nonnegative check (price is null or price >= 0),
  constraint plots_state_integrity check (
    (status = 'available' and held_by_user_id is null and hold_expires_at is null and booked_by_user_id is null and booked_at is null)
    or (status = 'token_hold' and held_by_user_id is not null and hold_expires_at is not null and booked_by_user_id is null and booked_at is null)
    or (status = 'sold' and held_by_user_id is null and hold_expires_at is null and booked_by_user_id is not null and booked_at is not null)
  ),
  unique (project_id, plot_number),
  unique (project_id, grid_row, grid_column)
);

create index plots_project_status_idx on public.plots (project_id, status, grid_row, grid_column);
create index plots_hold_expiry_idx on public.plots (hold_expires_at) where status = 'token_hold';
create index plots_holder_idx on public.plots (held_by_user_id) where held_by_user_id is not null;
create index plots_booked_by_idx on public.plots (booked_by_user_id) where booked_by_user_id is not null;

create table public.plot_holds (
  id uuid primary key default gen_random_uuid(),
  plot_id uuid not null references public.plots (id) on delete restrict,
  user_id uuid not null references public.profiles (user_id) on delete restrict,
  status public.plot_hold_status not null default 'active',
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  ended_at timestamptz,
  constraint plot_hold_exact_duration check (expires_at = created_at + interval '48 hours'),
  constraint plot_hold_end_state check (
    (status = 'active' and ended_at is null)
    or (status <> 'active' and ended_at is not null)
  )
);

create unique index plot_one_active_hold_idx on public.plot_holds (plot_id) where status = 'active';
create index plot_holds_user_idx on public.plot_holds (user_id, created_at desc);
create index plot_holds_expiry_idx on public.plot_holds (expires_at) where status = 'active';

create trigger network_nodes_set_updated_at
before update on public.network_nodes
for each row execute function public.set_updated_at();

create trigger projects_set_updated_at
before update on public.real_estate_projects
for each row execute function public.set_updated_at();

create trigger plots_set_updated_at
before update on public.plots
for each row execute function public.set_updated_at();

create or replace function public.generate_network_member_code()
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  candidate text;
begin
  loop
    candidate := 'IIW-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));
    exit when not exists (
      select 1 from public.network_nodes where member_code = candidate
    );
  end loop;
  return candidate;
end;
$$;

insert into public.network_nodes (user_id, member_code, joined_at)
select
  p.user_id,
  public.generate_network_member_code(),
  p.created_at
from public.profiles p
where not exists (
  select 1 from public.network_nodes n where n.user_id = p.user_id
);

create or replace function public.initialize_network_node()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  auth_metadata jsonb;
  auth_app_metadata jsonb;
  requested_sponsor_code text;
  requested_leg public.network_leg;
  sponsor_id uuid;
  root_request_authorized boolean := false;
begin
  auth_metadata := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  auth_app_metadata := coalesce(new.raw_app_meta_data, '{}'::jsonb);

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

  select user_id into sponsor_id
  from public.network_nodes
  where member_code = requested_sponsor_code
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

create trigger zz_on_auth_user_created_initialize_network
after insert on auth.users
for each row execute function public.initialize_network_node();

create or replace function public.protect_network_genealogy()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    if auth.role() <> 'service_role' then
      raise exception using errcode = '42501', message = 'network_genealogy_is_immutable';
    end if;
    return old;
  end if;

  if (
    new.user_id is distinct from old.user_id
    or new.member_code is distinct from old.member_code
    or new.sponsor_user_id is distinct from old.sponsor_user_id
    or new.parent_user_id is distinct from old.parent_user_id
    or new.placement_leg is distinct from old.placement_leg
    or new.joined_at is distinct from old.joined_at
  ) and auth.role() <> 'service_role' then
    raise exception using errcode = '42501', message = 'network_genealogy_is_immutable';
  end if;

  return new;
end;
$$;

create trigger network_genealogy_immutable
before update or delete on public.network_nodes
for each row execute function public.protect_network_genealogy();

create or replace function public.can_view_network_member(
  viewer_user_id uuid,
  target_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    viewer_user_id is not null
    and (
      public.is_executive(viewer_user_id)
      or exists (
        with recursive visible_nodes as (
          select n.user_id
          from public.network_nodes n
          where n.user_id = viewer_user_id
          union all
          select child.user_id
          from public.network_nodes child
          join visible_nodes parent on child.parent_user_id = parent.user_id
        )
        select 1 from visible_nodes where user_id = target_user_id
      )
    );
$$;

create or replace function public.lookup_network_sponsor(requested_code text)
returns table (
  member_code text,
  display_name text,
  left_available boolean,
  right_available boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    n.member_code,
    p.display_name,
    not exists (
      select 1 from public.network_nodes c
      where c.parent_user_id = n.user_id and c.placement_leg = 'left'
    ),
    not exists (
      select 1 from public.network_nodes c
      where c.parent_user_id = n.user_id and c.placement_leg = 'right'
    )
  from public.network_nodes n
  join public.profiles p on p.user_id = n.user_id
  where n.member_code = upper(trim(requested_code))
    and n.member_status = 'active';
$$;

create or replace function public.get_network_tree(
  requested_root_user_id uuid default auth.uid(),
  requested_depth integer default 3
)
returns table (
  user_id uuid,
  parent_user_id uuid,
  placement_leg public.network_leg,
  member_code text,
  display_name text,
  member_status public.network_member_status,
  rank_name text,
  sales_volume numeric,
  depth integer,
  total_downline bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if requested_depth < 1 or requested_depth > 5 then
    raise exception using errcode = '22023', message = 'tree_depth_must_be_between_1_and_5';
  end if;
  if not public.can_view_network_member(auth.uid(), requested_root_user_id) then
    raise exception using errcode = '42501', message = 'network_access_denied';
  end if;

  return query
  with recursive all_nodes as (
    select n.user_id, n.parent_user_id, n.placement_leg, n.member_code,
      n.member_status, n.rank_name, n.sales_volume, 0 as node_depth,
      array[n.user_id]::uuid[] as node_path
    from public.network_nodes n
    where n.user_id = requested_root_user_id
    union all
    select c.user_id, c.parent_user_id, c.placement_leg, c.member_code,
      c.member_status, c.rank_name, c.sales_volume, p.node_depth + 1,
      p.node_path || c.user_id
    from public.network_nodes c
    join all_nodes p on c.parent_user_id = p.user_id
    where not c.user_id = any(p.node_path)
  )
  select a.user_id, a.parent_user_id, a.placement_leg, a.member_code,
    p.display_name, a.member_status, a.rank_name, a.sales_volume,
    a.node_depth,
    (select count(*) from all_nodes d where a.user_id = any(d.node_path) and d.user_id <> a.user_id)
  from all_nodes a
  join public.profiles p on p.user_id = a.user_id
  where a.node_depth <= requested_depth
  order by a.node_path;
end;
$$;

create or replace function public.get_direct_referrals(
  page_number integer default 1,
  page_size integer default 20,
  search_term text default null,
  status_filter public.network_member_status default null
)
returns table (
  user_id uuid,
  member_code text,
  display_name text,
  placement_leg public.network_leg,
  member_status public.network_member_status,
  joined_at timestamptz,
  booked_plot_count bigint,
  total_count bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception using errcode = '42501', message = 'authentication_required';
  end if;
  if page_number < 1 or page_size < 1 or page_size > 100 then
    raise exception using errcode = '22023', message = 'invalid_pagination';
  end if;

  return query
  select n.user_id, n.member_code, p.display_name, n.placement_leg,
    n.member_status, n.joined_at,
    (select count(*) from public.plots pl where pl.booked_by_user_id = n.user_id and pl.status = 'sold'),
    count(*) over()
  from public.network_nodes n
  join public.profiles p on p.user_id = n.user_id
  where n.sponsor_user_id = auth.uid()
    and (status_filter is null or n.member_status = status_filter)
    and (
      search_term is null or trim(search_term) = ''
      or p.display_name ilike '%' || trim(search_term) || '%'
      or n.member_code ilike '%' || trim(search_term) || '%'
    )
  order by n.joined_at desc, n.user_id
  limit page_size offset ((page_number - 1) * page_size);
end;
$$;

create or replace function public.get_network_index(
  page_number integer default 1,
  page_size integer default 25,
  search_term text default null,
  status_filter public.network_member_status default null,
  leg_filter public.network_leg default null
)
returns table (
  user_id uuid,
  member_code text,
  display_name text,
  network_side public.network_leg,
  member_status public.network_member_status,
  depth integer,
  joined_at timestamptz,
  booked_plot_count bigint,
  total_count bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception using errcode = '42501', message = 'authentication_required';
  end if;
  if page_number < 1 or page_size < 1 or page_size > 100 then
    raise exception using errcode = '22023', message = 'invalid_pagination';
  end if;

  return query
  with recursive descendants as (
    select n.user_id, n.member_code, n.member_status, n.joined_at,
      n.placement_leg as root_side, 1 as node_depth, array[n.user_id]::uuid[] as node_path
    from public.network_nodes n
    where n.parent_user_id = auth.uid()
    union all
    select c.user_id, c.member_code, c.member_status, c.joined_at,
      d.root_side, d.node_depth + 1, d.node_path || c.user_id
    from public.network_nodes c
    join descendants d on c.parent_user_id = d.user_id
    where not c.user_id = any(d.node_path)
  ), filtered as (
    select d.*, p.display_name
    from descendants d
    join public.profiles p on p.user_id = d.user_id
    where (status_filter is null or d.member_status = status_filter)
      and (leg_filter is null or d.root_side = leg_filter)
      and (
        search_term is null or trim(search_term) = ''
        or p.display_name ilike '%' || trim(search_term) || '%'
        or d.member_code ilike '%' || trim(search_term) || '%'
      )
  )
  select f.user_id, f.member_code, f.display_name, f.root_side,
    f.member_status, f.node_depth, f.joined_at,
    (select count(*) from public.plots pl where pl.booked_by_user_id = f.user_id and pl.status = 'sold'),
    count(*) over()
  from filtered f
  order by f.node_depth, f.joined_at, f.user_id
  limit page_size offset ((page_number - 1) * page_size);
end;
$$;

create or replace function public.expire_plot_holds()
returns integer
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  expired_count integer;
begin
  with expired as (
    update public.plot_holds
    set status = 'expired', ended_at = now()
    where status = 'active' and expires_at <= now()
    returning plot_id, user_id
  ), released as (
    update public.plots p
    set status = 'available', held_by_user_id = null, hold_expires_at = null
    from expired e
    where p.id = e.plot_id
      and p.status = 'token_hold'
      and p.held_by_user_id = e.user_id
      and p.hold_expires_at <= now()
    returning p.id
  )
  select count(*) into expired_count from released;

  return expired_count;
end;
$$;

create or replace function public.acquire_plot_hold(requested_plot_id uuid)
returns table (
  hold_id uuid,
  plot_id uuid,
  hold_status public.plot_hold_status,
  expires_at timestamptz
)
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  current_plot public.plots%rowtype;
  existing_hold public.plot_holds%rowtype;
  created_hold public.plot_holds%rowtype;
  current_user_id uuid := auth.uid();
  hold_created_at timestamptz := now();
begin
  if current_user_id is null then
    raise exception using errcode = '42501', message = 'authentication_required';
  end if;

  select p.* into current_plot
  from public.plots p
  join public.real_estate_projects project on project.id = p.project_id
  where p.id = requested_plot_id and project.status = 'active'
  for update of p;

  if not found then
    raise exception using errcode = 'P0002', message = 'plot_not_found';
  end if;

  if current_plot.status = 'token_hold' and current_plot.hold_expires_at <= hold_created_at then
    update public.plot_holds h
    set status = 'expired', ended_at = hold_created_at
    where h.plot_id = current_plot.id and h.status = 'active';

    update public.plots
    set status = 'available', held_by_user_id = null, hold_expires_at = null
    where id = current_plot.id;
    current_plot.status := 'available';
    current_plot.held_by_user_id := null;
    current_plot.hold_expires_at := null;
  end if;

  if current_plot.status = 'token_hold' and current_plot.held_by_user_id = current_user_id then
    select * into existing_hold
    from public.plot_holds
    where plot_id = current_plot.id and user_id = current_user_id and status = 'active';

    return query select existing_hold.id, existing_hold.plot_id, existing_hold.status, existing_hold.expires_at;
    return;
  end if;

  if current_plot.status <> 'available' then
    raise exception using errcode = 'P0001', message = 'plot_unavailable';
  end if;

  insert into public.plot_holds (plot_id, user_id, created_at, expires_at)
  values (current_plot.id, current_user_id, hold_created_at, hold_created_at + interval '48 hours')
  returning * into created_hold;

  update public.plots
  set status = 'token_hold', held_by_user_id = current_user_id,
    hold_expires_at = created_hold.expires_at
  where id = current_plot.id;

  insert into public.security_audit_log (actor_user_id, target_user_id, action, source, details)
  values (
    current_user_id,
    current_user_id,
    'plot.hold_created',
    'database',
    jsonb_build_object('plot_id', current_plot.id, 'hold_id', created_hold.id)
  );

  return query select created_hold.id, created_hold.plot_id, created_hold.status, created_hold.expires_at;
end;
$$;

create or replace function public.release_plot_hold(requested_plot_id uuid)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  current_plot public.plots%rowtype;
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception using errcode = '42501', message = 'authentication_required';
  end if;

  select * into current_plot from public.plots where id = requested_plot_id for update;
  if not found or current_plot.status <> 'token_hold' then return false; end if;
  if current_plot.held_by_user_id <> current_user_id and not public.is_executive(current_user_id) then
    raise exception using errcode = '42501', message = 'hold_release_denied';
  end if;

  update public.plot_holds
  set status = 'released', ended_at = now()
  where plot_id = current_plot.id and status = 'active';

  update public.plots
  set status = 'available', held_by_user_id = null, hold_expires_at = null
  where id = current_plot.id;

  insert into public.security_audit_log (actor_user_id, target_user_id, action, source, details)
  values (
    current_user_id,
    current_plot.held_by_user_id,
    'plot.hold_released',
    'database',
    jsonb_build_object('plot_id', current_plot.id)
  );

  return true;
end;
$$;

alter table public.network_nodes enable row level security;
alter table public.network_nodes force row level security;
alter table public.network_root_creation_requests enable row level security;
alter table public.network_root_creation_requests force row level security;
alter table public.real_estate_projects enable row level security;
alter table public.real_estate_projects force row level security;
alter table public.plots enable row level security;
alter table public.plots force row level security;
alter table public.plot_holds enable row level security;
alter table public.plot_holds force row level security;

create policy network_nodes_accessible_read
on public.network_nodes for select to authenticated
using (public.can_view_network_member(auth.uid(), user_id));

create policy projects_authenticated_read
on public.real_estate_projects for select to authenticated
using (status = 'active' or public.is_executive());

create policy plots_authenticated_read
on public.plots for select to authenticated
using (
  public.is_executive()
  or exists (
    select 1 from public.real_estate_projects project
    where project.id = public.plots.project_id and project.status = 'active'
  )
);

create policy plot_holds_own_or_executive_read
on public.plot_holds for select to authenticated
using (user_id = auth.uid() or public.is_executive());

revoke all on table public.network_nodes from anon, authenticated;
revoke all on table public.network_root_creation_requests from anon, authenticated;
revoke all on table public.real_estate_projects from anon, authenticated;
revoke all on table public.plots from anon, authenticated;
revoke all on table public.plot_holds from anon, authenticated;

grant select on table public.network_nodes to authenticated;
grant select, insert, update, delete on table public.network_root_creation_requests to service_role;
grant select on table public.real_estate_projects to authenticated;
grant select on table public.plots to authenticated;
grant select on table public.plot_holds to authenticated;

revoke all on function public.generate_network_member_code() from public, anon, authenticated;
revoke all on function public.can_view_network_member(uuid, uuid) from public, anon;
grant execute on function public.can_view_network_member(uuid, uuid) to authenticated, service_role;
revoke all on function public.lookup_network_sponsor(text) from public;
grant execute on function public.lookup_network_sponsor(text) to anon, authenticated, service_role;
revoke all on function public.get_network_tree(uuid, integer) from public, anon;
grant execute on function public.get_network_tree(uuid, integer) to authenticated, service_role;
revoke all on function public.get_direct_referrals(integer, integer, text, public.network_member_status) from public, anon;
grant execute on function public.get_direct_referrals(integer, integer, text, public.network_member_status) to authenticated, service_role;
revoke all on function public.get_network_index(integer, integer, text, public.network_member_status, public.network_leg) from public, anon;
grant execute on function public.get_network_index(integer, integer, text, public.network_member_status, public.network_leg) to authenticated, service_role;
revoke all on function public.expire_plot_holds() from public, anon;
grant execute on function public.expire_plot_holds() to authenticated, service_role;
revoke all on function public.acquire_plot_hold(uuid) from public, anon;
grant execute on function public.acquire_plot_hold(uuid) to authenticated, service_role;
revoke all on function public.release_plot_hold(uuid) from public, anon;
grant execute on function public.release_plot_hold(uuid) to authenticated, service_role;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'plots'
  ) then
    alter publication supabase_realtime add table public.plots;
  end if;
end;
$$;

create extension if not exists pg_cron with schema pg_catalog;

do $$
begin
  if not exists (select 1 from cron.job where jobname = 'phase2-expire-plot-holds') then
    perform cron.schedule(
      'phase2-expire-plot-holds',
      '*/5 * * * *',
      'select public.expire_plot_holds();'
    );
  end if;
end;
$$;

commit;
