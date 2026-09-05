begin;

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
    select h.* into existing_hold
    from public.plot_holds h
    where h.plot_id = current_plot.id
      and h.user_id = current_user_id
      and h.status = 'active';

    return query
    select existing_hold.id, existing_hold.plot_id, existing_hold.status, existing_hold.expires_at;
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

  return query
  select created_hold.id, created_hold.plot_id, created_hold.status, created_hold.expires_at;
end;
$$;

revoke all on function public.acquire_plot_hold(uuid) from public, anon;
grant execute on function public.acquire_plot_hold(uuid) to authenticated, service_role;

commit;
