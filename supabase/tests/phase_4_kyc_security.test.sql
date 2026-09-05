begin;
create extension if not exists pgtap with schema extensions;
set local search_path=public,extensions;
select plan(18);

select has_table('public','kyc_submissions','KYC submissions table exists');
select has_table('public','kyc_sensitive_data','encrypted KYC values table exists');
select has_table('public','kyc_documents','KYC document metadata exists');
select has_table('public','kyc_review_events','immutable review history exists');
select has_table('public','security_rate_limits','rate-limit state exists');
select has_function('public','start_or_get_kyc_draft',array[]::text[],'draft RPC exists');
select has_function('public','submit_kyc',array['uuid'],'submission RPC exists');
select has_function('public','can_withdraw',array['uuid'],'withdrawal eligibility gate exists');
select has_function('public','can_finalize_deed',array['uuid'],'deed eligibility gate exists');
select is((select public from storage.buckets where id='kyc-private'),false,'KYC storage bucket is private');
select is((select file_size_limit from storage.buckets where id='kyc-private'),5242880::bigint,'bucket enforces five MiB limit');
select is((select relrowsecurity from pg_class where oid='public.kyc_submissions'::regclass),true,'submission RLS enabled');
select is((select relforcerowsecurity from pg_class where oid='public.kyc_submissions'::regclass),true,'submission RLS forced');
select is((select relrowsecurity from pg_class where oid='public.kyc_sensitive_data'::regclass),true,'sensitive RLS enabled');
select ok(not has_table_privilege('authenticated','public.kyc_sensitive_data','SELECT'),'browser cannot select encrypted values');
select ok(not has_table_privilege('authenticated','public.kyc_documents','INSERT'),'browser cannot insert document metadata');
select ok(not has_table_privilege('authenticated','public.kyc_submissions','UPDATE'),'browser cannot mutate KYC state directly');
select is((select count(*)::integer from pg_policies where schemaname='storage' and tablename='objects' and policyname like 'kyc_private_%'),0,'no direct browser storage policy exists');

select * from finish();
rollback;
