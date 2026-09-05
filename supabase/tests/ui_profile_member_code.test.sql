begin;
create extension if not exists pgtap with schema extensions;
select plan(19);
select has_table('public','member_code_counters','member code counter exists');
select is((select relrowsecurity from pg_class where oid='public.member_code_counters'::regclass),true,'counter has RLS');
select is((select relforcerowsecurity from pg_class where oid='public.member_code_counters'::regclass),true,'counter forces RLS');
select ok(not has_table_privilege('authenticated','public.member_code_counters','SELECT'),'counter is hidden from browser roles');
select ok(not has_function_privilege('authenticated','public.generate_network_member_code()','EXECUTE'),'generator is not browser callable');

insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,confirmation_token,email_change,email_change_token_new,recovery_token)
values
('00000000-0000-0000-0000-000000000000','91000000-0000-0000-0000-000000000001','authenticated','authenticated','member-code-one@example.test','',now(),'{"provider":"email","providers":["email"],"allow_network_root":true}','{"full_name":"First Member"}',now(),now(),'','','',''),
('00000000-0000-0000-0000-000000000000','91000000-0000-0000-0000-000000000002','authenticated','authenticated','member-code-two@example.test','',now(),'{"provider":"email","providers":["email"],"allow_network_root":true}','{"full_name":"Second Member"}',now(),now(),'','','','');
select ok((select member_code ~ '^IIIW[0-9]{4,}$' from public.network_nodes where user_id='91000000-0000-0000-0000-000000000001'),'first provisioned code uses IIIW sequence');
select is(
  (select substring(member_code from 5)::bigint from public.network_nodes where user_id='91000000-0000-0000-0000-000000000002'),
  (select substring(member_code from 5)::bigint + 1 from public.network_nodes where user_id='91000000-0000-0000-0000-000000000001'),
  'consecutive provisions receive adjacent member codes'
);
select is(
  substring(public.generate_network_member_code() from 5)::bigint,
  (select substring(member_code from 5)::bigint + 1 from public.network_nodes where user_id='91000000-0000-0000-0000-000000000002'),
  'member code sequence progresses monotonically'
);
select is(
  (select next_value from public.member_code_counters where counter_key='network_member'),
  (select substring(member_code from 5)::bigint + 2 from public.network_nodes where user_id='91000000-0000-0000-0000-000000000002'),
  'counter advances exactly once per allocation'
);
select ok(exists(select 1 from pg_constraint where conname='network_nodes_member_code_key'),'database uniqueness constraint remains present');
select ok(not exists(select 1 from public.network_nodes where member_code !~ '^IIIW[0-9]{4,}$'),'all existing member codes use the IIIW sequence');
select is((select count(*) from information_schema.columns where table_schema='public' and column_name='member_code'),1::bigint,'member code is not a relational foreign key');
select is(
  (select member_code from public.lookup_network_sponsor((select member_code from public.network_nodes where user_id='91000000-0000-0000-0000-000000000001'))),
  (select member_code from public.network_nodes where user_id='91000000-0000-0000-0000-000000000001'),
  'sponsor lookup accepts the allocated member code'
);

set local role authenticated;
set local request.jwt.claims='{"sub":"91000000-0000-0000-0000-000000000001","role":"authenticated"}';
update public.profiles set display_name='Updated Member',mobile_phone='+919999999991',language_code='hi' where user_id='91000000-0000-0000-0000-000000000001';
select is((select display_name from public.profiles where user_id='91000000-0000-0000-0000-000000000001'),'Updated Member','member can update allowlisted own profile fields');
select throws_ok($$ update public.profiles set role_key='admin' where user_id='91000000-0000-0000-0000-000000000001' $$,'42501',null,'member cannot self-elevate role');
select throws_ok($$ update public.profiles set status='hold' where user_id='91000000-0000-0000-0000-000000000001' $$,'42501',null,'member cannot change own account status');
select is((select count(*) from public.profiles where user_id='91000000-0000-0000-0000-000000000002'),0::bigint,'member cannot read another profile');
select throws_ok($$ update public.network_nodes set member_code='IIIW9999' where user_id='91000000-0000-0000-0000-000000000001' $$,'42501',null,'member cannot modify member code');
select is(
  (select member_code from public.get_network_tree('91000000-0000-0000-0000-000000000001',1) limit 1),
  (select member_code from public.network_nodes where user_id='91000000-0000-0000-0000-000000000001'),
  'network API displays the business member code'
);
reset role;
select * from finish();
rollback;
