begin;

create extension if not exists pgtap with schema extensions;
create temporary table phase2_test_results (result text) on commit drop;
grant insert on phase2_test_results to authenticated, anon;
insert into phase2_test_results select plan(20);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
)
values
  ('00000000-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'root@example.test', '', now(), '{"provider":"email","providers":["email"],"allow_network_root":true}', '{"full_name":"Root Member"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'left@example.test', '', now(), '{"provider":"email","providers":["email"],"allow_network_root":true}', '{"full_name":"Left Member"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'other@example.test', '', now(), '{"provider":"email","providers":["email"],"allow_network_root":true}', '{"full_name":"Other Root"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000004', 'authenticated', 'authenticated', 'admin2@example.test', '', now(), '{"provider":"email","providers":["email"],"allow_network_root":true}', '{"full_name":"Phase 2 Admin"}', now(), now(), '', '', '', '');

update public.profiles set role_key = 'admin' where user_id = '20000000-0000-0000-0000-000000000004';
update public.network_nodes
set sponsor_user_id = '20000000-0000-0000-0000-000000000001',
    parent_user_id = '20000000-0000-0000-0000-000000000001',
    placement_leg = 'left'
where user_id = '20000000-0000-0000-0000-000000000002';

insert into public.real_estate_projects (id, name, slug, status, location_name)
values ('30000000-0000-0000-0000-000000000001', 'Phase 2 Test Project', 'phase-2-test-project', 'active', 'Test only');

insert into public.plots (
  id, project_id, plot_number, grid_row, grid_column, status,
  held_by_user_id, hold_expires_at, booked_by_user_id, booked_at
)
values
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'A-01', 1, 1, 'available', null, null, null, null),
  ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'A-02', 1, 2, 'sold', null, null, '20000000-0000-0000-0000-000000000002', now()),
  ('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', 'A-03', 1, 3, 'token_hold', '20000000-0000-0000-0000-000000000001', now() - interval '1 hour', null, null);

insert into public.plot_holds (plot_id, user_id, status, created_at, expires_at)
values ('40000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 'active', now() - interval '49 hours', now() - interval '1 hour');

insert into phase2_test_results select is((select count(*) from public.network_nodes where user_id::text like '20000000-%'), 4::bigint, 'profile initialization creates one network node per account');

insert into phase2_test_results select throws_ok(
  $$ update public.network_nodes set parent_user_id = '20000000-0000-0000-0000-000000000001', placement_leg = 'left' where user_id = '20000000-0000-0000-0000-000000000003' $$,
  '23505', null, 'a parent cannot have two left children'
);

set local role authenticated;
set local request.jwt.claims = '{"sub":"20000000-0000-0000-0000-000000000001","role":"authenticated"}';

insert into phase2_test_results select results_eq(
  $$ select user_id from public.get_network_tree('20000000-0000-0000-0000-000000000001', 3) order by depth, user_id $$,
  $$ values ('20000000-0000-0000-0000-000000000001'::uuid), ('20000000-0000-0000-0000-000000000002'::uuid) $$,
  'recursive tree retrieval returns the authorized subtree'
);
insert into phase2_test_results select is((select count(*) from public.network_nodes), 2::bigint, 'affiliate RLS hides unrelated network roots');
insert into phase2_test_results select is((select count(*) from public.network_nodes where parent_user_id = '20000000-0000-0000-0000-000000000001' and placement_leg = 'right'), 0::bigint, 'an unoccupied right position remains identifiable');
insert into phase2_test_results select throws_ok(
  $$ update public.network_nodes set placement_leg = 'right' where user_id = '20000000-0000-0000-0000-000000000002' $$,
  '42501', null, 'affiliates cannot rewrite genealogy'
);
insert into phase2_test_results select is((select count(*) from public.real_estate_projects where id = '30000000-0000-0000-0000-000000000001'), 1::bigint, 'authenticated users can read active projects');
insert into phase2_test_results select is((select count(*) from public.plots where project_id = '30000000-0000-0000-0000-000000000001'), 3::bigint, 'authenticated users can read active project plots');
insert into phase2_test_results select throws_ok(
  $$ update public.plots set status = 'sold' where id = '40000000-0000-0000-0000-000000000001' $$,
  '42501', null, 'affiliates cannot directly mutate inventory state'
);
insert into phase2_test_results select lives_ok(
  $$ select * from public.acquire_plot_hold('40000000-0000-0000-0000-000000000001') $$,
  'an authenticated affiliate can atomically acquire an available plot'
);
insert into phase2_test_results select is((select status from public.plots where id = '40000000-0000-0000-0000-000000000001'), 'token_hold'::public.plot_inventory_status, 'acquisition changes the plot to token hold');
insert into phase2_test_results select is((select expires_at - created_at from public.plot_holds where plot_id = '40000000-0000-0000-0000-000000000001' and status = 'active'), interval '48 hours', 'token holds last exactly 48 hours');
insert into phase2_test_results select ok(public.release_plot_hold('40000000-0000-0000-0000-000000000001'), 'the holder can release their plot hold');
insert into phase2_test_results select is((select status from public.plots where id = '40000000-0000-0000-0000-000000000001'), 'available'::public.plot_inventory_status, 'released plots return to available');
insert into phase2_test_results select throws_ok(
  $$ select * from public.acquire_plot_hold('40000000-0000-0000-0000-000000000002') $$,
  'P0001', 'plot_unavailable', 'sold plots cannot be held'
);
insert into phase2_test_results select is(public.expire_plot_holds(), 1, 'database expiration releases one expired hold');
insert into phase2_test_results select is((select status from public.plots where id = '40000000-0000-0000-0000-000000000003'), 'available'::public.plot_inventory_status, 'expired token holds return to available');

set local request.jwt.claims = '{"sub":"20000000-0000-0000-0000-000000000004","role":"authenticated"}';
insert into phase2_test_results select is((select count(*) from public.network_nodes where user_id::text like '20000000-%'), 4::bigint, 'admin can read all network nodes');

set local role anon;
set local request.jwt.claims = '{}';
insert into phase2_test_results select throws_ok(
  $$ select count(*) from public.real_estate_projects $$,
  '42501', null, 'anonymous users cannot read projects'
);
insert into phase2_test_results select throws_ok(
  $$ select count(*) from public.plots $$,
  '42501', null, 'anonymous users cannot read plots'
);

reset role;
insert into phase2_test_results select * from finish();
select result from phase2_test_results;
rollback;
