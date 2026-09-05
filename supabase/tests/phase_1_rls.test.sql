begin;

create extension if not exists pgtap with schema extensions;
create temporary table phase1_test_results(result text) on commit drop;
grant insert on phase1_test_results to authenticated,anon;
insert into phase1_test_results select plan(12);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
)
values
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'user-a@example.test', '', now(), '{"provider":"email","providers":["email"],"allow_network_root":true}', '{"full_name":"User A"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'user-b@example.test', '', now(), '{"provider":"email","providers":["email"],"allow_network_root":true}', '{"full_name":"User B"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'admin@example.test', '', now(), '{"provider":"email","providers":["email"],"allow_network_root":true}', '{"full_name":"Local Admin"}', now(), now(), '', '', '', '');

insert into phase1_test_results select is((select count(*) from public.profiles where user_id::text like '10000000-%'), 3::bigint, 'auth inserts initialize exactly one profile each');

update public.profiles
set role_key = 'admin'
where user_id = '10000000-0000-0000-0000-000000000003';

set local role authenticated;
set local request.jwt.claims = '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}';

insert into phase1_test_results select results_eq(
  $$ select user_id from public.profiles order by user_id $$,
  $$ values ('10000000-0000-0000-0000-000000000001'::uuid) $$,
  'user A cannot read user B private profile'
);

insert into phase1_test_results select results_eq(
  $$ with changed as (update public.profiles set display_name = 'Blocked' where user_id = '10000000-0000-0000-0000-000000000002' returning 1) select count(*)::bigint from changed $$,
  $$ values (0::bigint) $$,
  'user A cannot modify user B profile'
);

insert into phase1_test_results select lives_ok(
  $$ update public.profiles set display_name = 'User A Updated' where user_id = '10000000-0000-0000-0000-000000000001' $$,
  'user A can update an allowed field on their own profile'
);

insert into phase1_test_results select throws_ok(
  $$ update public.profiles set role_key = 'admin' where user_id = '10000000-0000-0000-0000-000000000001' $$,
  '42501',
  null,
  'users cannot modify their own role'
);

insert into phase1_test_results select throws_ok(
  $$ update public.profiles set status = 'active' where user_id = '10000000-0000-0000-0000-000000000001' $$,
  '42501',
  null,
  'users cannot modify their own account status'
);

insert into phase1_test_results select throws_ok(
  $$ select public.record_security_event('auth.fake') $$,
  '42501',
  null,
  'affiliates cannot forge security audit events'
);

insert into phase1_test_results select is((select count(*) from public.roles), 3::bigint, 'authenticated users can read the role catalog');

set local request.jwt.claims = '{"sub":"10000000-0000-0000-0000-000000000003","role":"authenticated"}';
insert into phase1_test_results select is((select count(*) from public.profiles where user_id::text like '10000000-%'), 3::bigint, 'admin can read fixture profiles through server-trusted database role');
insert into phase1_test_results select ok(public.is_executive(), 'admin role is recognized by the database authorization function');

set local role anon;
set local request.jwt.claims = '{}';
insert into phase1_test_results select throws_ok(
  $$ select count(*) from public.profiles $$,
  '42501', null, 'unauthenticated users cannot read profiles'
);
insert into phase1_test_results select throws_ok(
  $$ select count(*) from public.security_audit_log $$,
  '42501', null, 'unauthenticated users cannot read audit data'
);

reset role;
insert into phase1_test_results select * from finish();
select result from phase1_test_results;
rollback;
