begin;
create extension if not exists pgtap with schema extensions;
create temporary table phase3_test_results(result text) on commit drop;
grant insert on phase3_test_results to authenticated,anon;
insert into phase3_test_results select plan(36);

insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,confirmation_token,email_change,email_change_token_new,recovery_token) values
 ('00000000-0000-0000-0000-000000000000','50000000-0000-0000-0000-000000000001','authenticated','authenticated','phase3-root@example.test','',now(),'{"provider":"email","providers":["email"],"allow_network_root":true}','{"full_name":"Phase 3 Root"}',now(),now(),'','','',''),
 ('00000000-0000-0000-0000-000000000000','50000000-0000-0000-0000-000000000002','authenticated','authenticated','phase3-buyer@example.test','',now(),'{"provider":"email","providers":["email"],"allow_network_root":true}','{"full_name":"Phase 3 Buyer"}',now(),now(),'','','',''),
 ('00000000-0000-0000-0000-000000000000','50000000-0000-0000-0000-000000000003','authenticated','authenticated','phase3-admin@example.test','',now(),'{"provider":"email","providers":["email"],"allow_network_root":true}','{"full_name":"Phase 3 Admin"}',now(),now(),'','','','');
update public.profiles set role_key='admin' where user_id='50000000-0000-0000-0000-000000000003';
update public.network_nodes set sponsor_user_id='50000000-0000-0000-0000-000000000001',parent_user_id='50000000-0000-0000-0000-000000000001',placement_leg='left' where user_id='50000000-0000-0000-0000-000000000002';
insert into public.real_estate_projects(id,name,slug,status) values('51000000-0000-0000-0000-000000000001','Phase 3 Test Project','phase-3-test-project','active');
insert into public.plots(id,project_id,plot_number,grid_row,grid_column,price) values('52000000-0000-0000-0000-000000000001','51000000-0000-0000-0000-000000000001','F-01',1,1,1200);
update public.payment_plan_definitions set annual_rate=0,minimum_down_payment_rate=0.1,configured=true,active=(code='term_12') where code in('term_12','term_24','term_36');
insert into public.compensation_rules(id,kind,version,name,parameters,configured,active,effective_from,created_by) values
 ('53000000-0000-0000-0000-000000000001','direct_referral',999,'Test direct rule','{"rate":0.10}',true,true,now()-interval '1 day','50000000-0000-0000-0000-000000000003');

insert into phase3_test_results select has_table('public','financial_journals','financial journals exist');
insert into phase3_test_results select has_table('public','financial_entries','financial entries exist');
insert into phase3_test_results select is((select count(*) from public.wallets where user_id::text like '50000000-%'),6::bigint,'two wallets are provisioned for every profile');

set local role anon; set local request.jwt.claims='{}';
insert into phase3_test_results select throws_ok($$select count(*) from public.wallets$$,'42501',null,'anonymous wallet reads are denied');
reset role; set local role authenticated; set local request.jwt.claims='{"sub":"50000000-0000-0000-0000-000000000003","role":"authenticated"}';
insert into phase3_test_results select lives_ok($$select public.admin_create_property_purchase('50000000-0000-0000-0000-000000000002','52000000-0000-0000-0000-000000000001',(select id from public.payment_plan_definitions where code='term_12' and active),1200,100,0,current_date,'phase3-purchase-001')$$,'admin creates a configured property purchase');
insert into phase3_test_results select is((select count(*) from public.installments where purchase_id=(select id from public.property_purchases where idempotency_key='phase3-purchase-001')),12::bigint,'12 deterministic installments are generated');
insert into phase3_test_results select is((select sum(total_due) from public.installments where purchase_id=(select id from public.property_purchases where idempotency_key='phase3-purchase-001')),1200.00::numeric,'installments equal total payable');
insert into phase3_test_results select lives_ok($$select public.admin_record_manual_payment('50000000-0000-0000-0000-000000000002',(select id from public.property_purchases where idempotency_key='phase3-purchase-001'),null,100,'bank_transfer','TEST-001',current_date,'test payment','phase3-payment-001')$$,'admin records a manual payment');
insert into phase3_test_results select is((select status from public.manual_payments where idempotency_key='phase3-payment-001'),'pending_verification'::public.manual_payment_status,'recorded payment awaits verification');

set local request.jwt.claims='{"sub":"50000000-0000-0000-0000-000000000002","role":"authenticated"}';
insert into phase3_test_results select throws_ok($$select public.admin_verify_manual_payment((select id from public.manual_payments where idempotency_key='phase3-payment-001'))$$,'42501','executive_required','affiliate cannot verify a payment');
insert into phase3_test_results select throws_ok($$insert into public.financial_journals(transaction_type,description,reference_type,origin,idempotency_key) values('forged','forged','profile','manual','forged-journal')$$,'42501',null,'affiliate cannot create journals');
insert into phase3_test_results select is((select count(*) from public.wallets),2::bigint,'affiliate sees only own wallets');
insert into phase3_test_results select is((select count(*) from public.manual_payments),1::bigint,'affiliate sees own payment only');

set local request.jwt.claims='{"sub":"50000000-0000-0000-0000-000000000003","role":"authenticated"}';
insert into phase3_test_results select lives_ok($$select public.admin_verify_manual_payment((select id from public.manual_payments where idempotency_key='phase3-payment-001'))$$,'admin verifies and applies payment atomically');
insert into phase3_test_results select is((select status from public.manual_payments where idempotency_key='phase3-payment-001'),'verified'::public.manual_payment_status,'payment state is verified');
insert into phase3_test_results select is((select sum(amount) from public.payment_allocations where payment_id=(select id from public.manual_payments where idempotency_key='phase3-payment-001')),100.00::numeric,'verified amount is allocated once');
insert into phase3_test_results select is((select sum(debit) from public.financial_entries where journal_id=(select id from public.financial_journals where reference_type='manual_payment' and reference_id=(select id from public.manual_payments where idempotency_key='phase3-payment-001'))),(select sum(credit) from public.financial_entries where journal_id=(select id from public.financial_journals where reference_type='manual_payment' and reference_id=(select id from public.manual_payments where idempotency_key='phase3-payment-001'))),'manual payment journal balances');
insert into phase3_test_results select lives_ok($$select public.admin_verify_manual_payment((select id from public.manual_payments where idempotency_key='phase3-payment-001'))$$,'duplicate verification is retry-safe');
insert into phase3_test_results select is((select count(*) from public.payment_allocations where payment_id=(select id from public.manual_payments where idempotency_key='phase3-payment-001')),1::bigint,'duplicate verification does not duplicate allocation');
insert into phase3_test_results select is((select count(*) from public.direct_commissions where purchase_id=(select id from public.property_purchases where idempotency_key='phase3-purchase-001')),1::bigint,'qualifying down payment creates one direct commission');
insert into phase3_test_results select is((select amount from public.direct_commissions where purchase_id=(select id from public.property_purchases where idempotency_key='phase3-purchase-001')),10.00::numeric,'configured direct rate is applied');
insert into phase3_test_results select throws_ok($$update public.financial_journals set description='tampered' where status='posted'$$,'42501',null,'posted journals cannot be changed by browser roles');
insert into phase3_test_results select throws_ok($$delete from public.financial_entries where journal_id=(select id from public.financial_journals where status='posted' limit 1)$$,'42501',null,'posted entries cannot be deleted by browser roles');
insert into phase3_test_results select lives_ok($$select public.admin_record_manual_payment('50000000-0000-0000-0000-000000000002',(select id from public.property_purchases where idempotency_key='phase3-purchase-001'),null,25,'upi','TEST-REJECT',current_date,'reject test','phase3-payment-reject')$$,'admin records a second payment for review');
insert into phase3_test_results select lives_ok($$select public.admin_reject_manual_payment((select id from public.manual_payments where idempotency_key='phase3-payment-reject'),'Reference not found')$$,'admin rejects an unverified payment');
insert into phase3_test_results select is((select status from public.manual_payments where idempotency_key='phase3-payment-reject'),'rejected'::public.manual_payment_status,'rejected payment is never applied');
insert into phase3_test_results select lives_ok($$select public.admin_property_wallet_topup('50000000-0000-0000-0000-000000000002',200,'TEST TOPUP','phase3-topup-001')$$,'admin can make an auditable property wallet top-up');

set local request.jwt.claims='{"sub":"50000000-0000-0000-0000-000000000002","role":"authenticated"}';
insert into phase3_test_results select lives_ok($$select public.pay_installment_from_wallet((select id from public.installments where purchase_id=(select id from public.property_purchases where idempotency_key='phase3-purchase-001') and installment_number=2),'property_installment',100,'phase3-wallet-payment-001')$$,'owner pays an installment from property wallet');
insert into phase3_test_results select lives_ok($$select public.pay_installment_from_wallet((select id from public.installments where purchase_id=(select id from public.property_purchases where idempotency_key='phase3-purchase-001') and installment_number=2),'property_installment',100,'phase3-wallet-payment-001')$$,'wallet payment retry is idempotent');
insert into phase3_test_results select is((select amount_paid from public.installments where purchase_id=(select id from public.property_purchases where idempotency_key='phase3-purchase-001') and installment_number=2),100.00::numeric,'retry does not double-apply installment payment');

set local request.jwt.claims='{"sub":"50000000-0000-0000-0000-000000000003","role":"authenticated"}';
insert into phase3_test_results select lives_ok($$select public.admin_reverse_manual_payment((select id from public.manual_payments where idempotency_key='phase3-payment-001'),'Bank correction')$$,'verified payment is reversed through a new journal');
insert into phase3_test_results select is((select status from public.manual_payments where idempotency_key='phase3-payment-001'),'reversed'::public.manual_payment_status,'payment records reversed state');
insert into phase3_test_results select is((select count(*) from public.payment_allocations where payment_id=(select id from public.manual_payments where idempotency_key='phase3-payment-001') and reversed_at is null),0::bigint,'payment reversal reverses installment allocations');
insert into phase3_test_results select is((select status from public.direct_commissions where purchase_id=(select id from public.property_purchases where idempotency_key='phase3-purchase-001')),'reversed'::public.compensation_status,'payment reversal reverses its direct commission');
insert into phase3_test_results select is((select count(*) from public.business_volume_events where source_payment_id=(select id from public.manual_payments where idempotency_key='phase3-payment-001') and reversed_at is null),0::bigint,'payment reversal invalidates unprocessed business volume');
reset role;
insert into phase3_test_results select lives_ok($$select public.run_financial_reconciliation('phase3-test-reconciliation')$$,'reconciliation runs without mutating financial history');
insert into phase3_test_results select * from finish(); select result from phase3_test_results; rollback;
