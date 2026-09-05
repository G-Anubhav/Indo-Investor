begin;
create extension if not exists pgtap with schema extensions;
create temporary table production_test_results(result text) on commit drop;
grant insert,select on production_test_results to authenticated,anon;
insert into production_test_results select plan(23);

insert into production_test_results select has_table('public','platform_runtime_configuration','runtime configuration table exists');
insert into production_test_results select is((select relrowsecurity from pg_class where oid='public.platform_runtime_configuration'::regclass),true,'runtime configuration has RLS');
insert into production_test_results select is((select relforcerowsecurity from pg_class where oid='public.platform_runtime_configuration'::regclass),true,'runtime configuration forces RLS');
insert into production_test_results select ok(not has_table_privilege('authenticated','public.platform_runtime_configuration','SELECT'),'browser roles cannot read runtime configuration');
insert into production_test_results select ok(not has_table_privilege('authenticated','public.platform_runtime_configuration','UPDATE'),'browser roles cannot change runtime configuration');
insert into production_test_results select ok(not has_function_privilege('authenticated','public.configure_platform_runtime(public.platform_environment,boolean,text,text)','EXECUTE'),'runtime configuration RPC is service-only');
insert into production_test_results select ok(not has_function_privilege('authenticated','public.record_kyc_document_scan(uuid,public.kyc_document_scan_status,text,jsonb)','EXECUTE'),'scan result RPC is service-only');
insert into production_test_results select ok(not has_function_privilege('anon','public.production_health_snapshot()','EXECUTE'),'database health snapshot is not public');
insert into production_test_results select is((select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and has_function_privilege('anon',p.oid,'execute')),1::bigint,'only the intentional sponsor lookup is anonymous executable');
insert into production_test_results select ok(has_function_privilege('anon','public.lookup_network_sponsor(text)','EXECUTE'),'anonymous sponsor lookup remains available for signup');

insert into public.network_root_creation_requests(email,expires_at) values('production-readiness-admin@example.test',now()+interval '10 minutes');
insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,confirmation_token,email_change,email_change_token_new,recovery_token)
values('00000000-0000-0000-0000-000000000000','71000000-0000-4000-8000-000000000001','authenticated','authenticated','production-readiness-admin@example.test','',now(),'{"provider":"email","providers":["email"],"allow_network_root":true}','{"full_name":"Production Readiness Admin"}',now(),now(),'','','','');
update public.profiles set role_key='admin' where user_id='71000000-0000-4000-8000-000000000001';
update public.platform_runtime_configuration set environment='production',financial_processing_enabled=false where singleton;

set local role authenticated;
set local request.jwt.claims='{"sub":"71000000-0000-4000-8000-000000000001","role":"authenticated","aal":"aal1"}';
insert into production_test_results select is(public.privileged_access_ready(),false,'production AAL1 admin is denied privileged access');
set local request.jwt.claims='{"sub":"71000000-0000-4000-8000-000000000001","role":"authenticated","aal":"aal2"}';
insert into production_test_results select is(public.privileged_access_ready(),true,'production AAL2 admin receives privileged access');
reset role;

insert into production_test_results select throws_ok(
  $$insert into public.financial_journals(transaction_type,description,reference_type,origin,idempotency_key) values('readiness-test','blocked','readiness','worker','production-readiness-blocked')$$,
  '55000','financial_processing_not_enabled','disabled production runtime blocks new financial journals'
);
insert into production_test_results select throws_ok(
  $$update public.payment_plan_definitions set active=true where configuration_environment='development' and code=(select code from public.payment_plan_definitions where configuration_environment='development' limit 1)$$,
  '55000','financial_configuration_environment_mismatch','development payment plans cannot activate in production'
);
insert into production_test_results select throws_ok(
  $$select public.configure_platform_runtime('production',true,'test-operator','wrong-confirmation')$$,
  '22023','runtime_confirmation_mismatch','runtime activation requires an exact confirmation string'
);

insert into public.kyc_submissions(id,user_id,version) values('72000000-0000-4000-8000-000000000001','71000000-0000-4000-8000-000000000001',1);
insert into public.kyc_documents(id,submission_id,user_id,document_type,object_path,original_filename,mime_type,size_bytes,sha256)
values('73000000-0000-4000-8000-000000000001','72000000-0000-4000-8000-000000000001','71000000-0000-4000-8000-000000000001','pan','71000000-0000-4000-8000-000000000001/72000000-0000-4000-8000-000000000001/pan/73000000-0000-4000-8000-000000000001.pdf','pan.pdf','application/pdf',100,repeat('a',64));
insert into production_test_results select is((select scan_status from public.kyc_documents where id='73000000-0000-4000-8000-000000000001'),'uploaded'::public.kyc_document_scan_status,'new KYC evidence starts unscanned');
insert into production_test_results select throws_ok(
  $$select public.record_kyc_document_scan('73000000-0000-4000-8000-000000000001','clean','test-scanner','{}')$$,
  '42501','invalid_kyc_document_change','evidence cannot skip directly from uploaded to clean'
);
insert into production_test_results select lives_ok(
  $$select public.record_kyc_document_scan('73000000-0000-4000-8000-000000000001','scanning','test-scanner','{}')$$,
  'trusted scanner can start scanning'
);
insert into production_test_results select lives_ok(
  $$select public.record_kyc_document_scan('73000000-0000-4000-8000-000000000001','clean','test-scanner','{"verdict":"clean"}')$$,
  'trusted scanner can mark scanned evidence clean'
);
insert into production_test_results select is((select scan_status from public.kyc_documents where id='73000000-0000-4000-8000-000000000001'),'clean'::public.kyc_document_scan_status,'clean scan state is persisted');
insert into production_test_results select ok(exists(select 1 from public.security_audit_log where target_user_id='71000000-0000-4000-8000-000000000001' and action='identity.access_changed'),'role change is audited');
insert into production_test_results select ok(exists(select 1 from public.security_audit_log where target_user_id='71000000-0000-4000-8000-000000000001' and action='kyc.document_scan_clean'),'clean scan result is audited');
insert into production_test_results select ok((select malware_scanning_required and privileged_mfa_required from public.platform_runtime_configuration where singleton),'scanner and privileged MFA safeguards default required');

select result from production_test_results;
select * from finish();
rollback;
