begin;

create type public.account_status as enum (
  'active',
  'hold',
  'disabled'
);

create table public.roles (
  role_key text primary key,
  display_name text not null,
  description text not null,
  created_at timestamptz not null default now(),
  constraint roles_key_format check (role_key ~ '^[a-z][a-z0-9_]{2,31}$')
);

insert into public.roles (role_key, display_name, description)
values
  ('affiliate', 'Affiliate', 'Standard authenticated portal user.'),
  ('executive', 'Executive', 'Operational user with authorized administrative visibility.'),
  ('admin', 'Administrator', 'Privileged platform administrator.')
on conflict (role_key) do nothing;

create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  username text unique,
  full_name text not null,
  display_name text not null,
  email text not null unique,
  mobile_phone text unique,
  status public.account_status not null default 'active',
  role_key text not null default 'affiliate' references public.roles (role_key) on update restrict on delete restrict,
  language_code text not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_format check (
    username is null or (
      username = lower(username)
      and username ~ '^[a-z][a-z0-9._-]{2,31}$'
    )
  ),
  constraint profiles_full_name_length check (char_length(trim(full_name)) between 2 and 120),
  constraint profiles_display_name_length check (char_length(trim(display_name)) between 2 and 80),
  constraint profiles_email_normalized check (email = lower(email) and char_length(email) <= 254),
  constraint profiles_mobile_phone_format check (mobile_phone is null or mobile_phone ~ '^\+[1-9][0-9]{7,14}$'),
  constraint profiles_language_supported check (language_code in ('en', 'ru', 'hi'))
);

create index profiles_role_key_idx on public.profiles (role_key);
create index profiles_status_idx on public.profiles (status);

create table public.security_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users (id) on delete set null,
  target_user_id uuid references auth.users (id) on delete set null,
  action text not null,
  source text not null default 'application',
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint security_audit_action_format check (action ~ '^[a-z][a-z0-9_.-]{2,79}$'),
  constraint security_audit_source_format check (source ~ '^[a-z][a-z0-9_.-]{2,39}$'),
  constraint security_audit_details_object check (jsonb_typeof(details) = 'object')
);

create index security_audit_actor_idx on public.security_audit_log (actor_user_id, created_at desc);
create index security_audit_target_idx on public.security_audit_log (target_user_id, created_at desc);
create index security_audit_action_idx on public.security_audit_log (action, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  profile_name text;
  profile_mobile text;
  profile_language text;
begin
  if new.email is null then
    raise exception 'An email address is required for portal accounts';
  end if;

  profile_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    split_part(new.email, '@', 1)
  );
  profile_mobile := nullif(trim(new.raw_user_meta_data ->> 'mobile_phone'), '');
  profile_language := coalesce(nullif(new.raw_user_meta_data ->> 'language_code', ''), 'en');

  if profile_language not in ('en', 'ru', 'hi') then
    profile_language := 'en';
  end if;

  insert into public.profiles (
    user_id,
    full_name,
    display_name,
    email,
    mobile_phone,
    language_code,
    role_key
  )
  values (
    new.id,
    profile_name,
    profile_name,
    lower(new.email),
    profile_mobile,
    profile_language,
    'affiliate'
  )
  on conflict (user_id) do update
  set email = excluded.email;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

create or replace function public.sync_auth_user_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is distinct from old.email and new.email is not null then
    update public.profiles
    set email = lower(new.email)
    where user_id = new.id;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_email_changed
after update of email on auth.users
for each row execute function public.sync_auth_user_email();

create or replace function public.is_executive(check_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where user_id = check_user_id
      and role_key in ('executive', 'admin')
      and status = 'active'
  );
$$;

create or replace function public.record_security_event(
  event_action text,
  event_target_user_id uuid default null,
  event_details jsonb default '{}'::jsonb,
  event_source text default 'application'
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  event_id uuid;
begin
  insert into public.security_audit_log (
    actor_user_id,
    target_user_id,
    action,
    source,
    details
  )
  values (
    auth.uid(),
    event_target_user_id,
    event_action,
    event_source,
    event_details
  )
  returning id into event_id;

  return event_id;
end;
$$;

alter table public.roles enable row level security;
alter table public.roles force row level security;
alter table public.profiles enable row level security;
alter table public.profiles force row level security;
alter table public.security_audit_log enable row level security;
alter table public.security_audit_log force row level security;

create policy roles_authenticated_read
on public.roles
for select
to authenticated
using (true);

create policy profiles_read_own_or_executive
on public.profiles
for select
to authenticated
using (user_id = auth.uid() or public.is_executive());

create policy profiles_update_own_non_sensitive_fields
on public.profiles
for update
to authenticated
using (user_id = auth.uid() and status = 'active')
with check (user_id = auth.uid() and status = 'active');

create policy security_audit_executive_read
on public.security_audit_log
for select
to authenticated
using (public.is_executive());

revoke all on table public.roles from anon, authenticated;
revoke all on table public.profiles from anon, authenticated;
revoke all on table public.security_audit_log from anon, authenticated;

grant select on table public.roles to authenticated;
grant select on table public.profiles to authenticated;
grant update (full_name, display_name, mobile_phone, language_code) on table public.profiles to authenticated;
grant select on table public.security_audit_log to authenticated;

revoke all on function public.is_executive(uuid) from public, anon;
grant execute on function public.is_executive(uuid) to authenticated, service_role;
revoke all on function public.record_security_event(text, uuid, jsonb, text) from public, anon, authenticated;
grant execute on function public.record_security_event(text, uuid, jsonb, text) to service_role;

commit;
