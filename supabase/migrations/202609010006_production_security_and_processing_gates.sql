begin;

create or replace function public.current_platform_environment()
returns public.platform_environment language sql stable security definer set search_path='' as $$
  select environment from public.platform_runtime_configuration where singleton;
$$;

create or replace function public.is_executive(check_user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path='' as $$
  select exists(
    select 1 from public.profiles p
    where p.user_id=check_user_id and p.role_key in('executive','admin') and p.status='active'
  ) and (
    not exists(
      select 1 from public.platform_runtime_configuration c
      where c.singleton and c.environment='production' and c.privileged_mfa_required
    )
    or coalesce(auth.jwt()->>'aal','aal1')='aal2'
  );
$$;

create or replace function public.privileged_access_ready()
returns boolean language sql stable security definer set search_path='' as $$
  select public.is_executive(auth.uid());
$$;

create or replace function public.assert_financial_processing_ready()
returns void language plpgsql stable security definer set search_path='' as $$
declare runtime public.platform_runtime_configuration%rowtype; missing_rules integer; available_plans integer;
begin
  select * into runtime from public.platform_runtime_configuration where singleton;
  if not found or runtime.environment='unconfigured' or not runtime.financial_processing_enabled then
    raise exception using errcode='55000',message='financial_processing_not_enabled';
  end if;
  if exists(select 1 from public.payment_plan_definitions where active and configured and configuration_environment<>runtime.environment)
    or exists(select 1 from public.compensation_rules where active and configured and configuration_environment<>runtime.environment) then
    raise exception using errcode='55000',message='financial_configuration_environment_mismatch';
  end if;
  select count(*) into available_plans from public.payment_plan_definitions where active and configured and configuration_environment=runtime.environment;
  select count(*) into missing_rules from (
    select required.kind from (values('direct_referral'::public.compensation_rule_kind),('binary_matching'::public.compensation_rule_kind),('monthly_incentive'::public.compensation_rule_kind)) required(kind)
    where not exists(select 1 from public.compensation_rules r where r.kind=required.kind and r.active and r.configured and r.configuration_environment=runtime.environment)
  ) missing;
  if available_plans=0 or missing_rules>0 then
    raise exception using errcode='55000',message='financial_configuration_incomplete';
  end if;
end; $$;

create or replace function public.guard_financial_processing()
returns trigger language plpgsql security definer set search_path='' as $$
begin perform public.assert_financial_processing_ready(); return new; end; $$;

create trigger property_purchases_production_gate before insert on public.property_purchases
for each statement execute function public.guard_financial_processing();
create trigger manual_payments_production_gate before insert on public.manual_payments
for each statement execute function public.guard_financial_processing();
create trigger financial_journals_production_gate before insert on public.financial_journals
for each statement execute function public.guard_financial_processing();
create trigger binary_cycles_production_gate before insert on public.binary_compensation_cycles
for each statement execute function public.guard_financial_processing();
create trigger incentive_results_production_gate before insert on public.monthly_incentive_results
for each statement execute function public.guard_financial_processing();

create or replace function public.enforce_active_financial_environment()
returns trigger language plpgsql security definer set search_path='' as $$
declare runtime_environment public.platform_environment;
begin
  if new.active and new.configured then
    select environment into runtime_environment from public.platform_runtime_configuration where singleton;
    if runtime_environment='unconfigured' or new.configuration_environment<>runtime_environment then
      raise exception using errcode='55000',message='financial_configuration_environment_mismatch';
    end if;
  end if;
  return new;
end; $$;

create trigger payment_plans_environment_gate before insert or update on public.payment_plan_definitions
for each row execute function public.enforce_active_financial_environment();
create trigger compensation_rules_environment_gate before insert or update on public.compensation_rules
for each row execute function public.enforce_active_financial_environment();

create or replace function public.configure_platform_runtime(
  requested_environment public.platform_environment,
  enable_financial_processing boolean,
  operator_reference text,
  confirmation text
) returns public.platform_environment language plpgsql security definer set search_path='' as $$
declare old_environment public.platform_environment; old_financial boolean;
begin
  if requested_environment='unconfigured' and enable_financial_processing then raise exception using errcode='22023',message='invalid_runtime_configuration'; end if;
  if char_length(trim(coalesce(operator_reference,'')))<3 or char_length(operator_reference)>120 then raise exception using errcode='22023',message='operator_reference_required'; end if;
  if confirmation<>('configure:'||requested_environment::text||':'||(case when enable_financial_processing then 'enabled' else 'disabled' end)) then
    raise exception using errcode='22023',message='runtime_confirmation_mismatch';
  end if;
  select environment,financial_processing_enabled into old_environment,old_financial from public.platform_runtime_configuration where singleton for update;
  if enable_financial_processing then
    if exists(select 1 from public.payment_plan_definitions where active and configured and configuration_environment<>requested_environment)
      or exists(select 1 from public.compensation_rules where active and configured and configuration_environment<>requested_environment) then
      raise exception using errcode='55000',message='financial_configuration_environment_mismatch';
    end if;
    if not exists(select 1 from public.payment_plan_definitions where active and configured and configuration_environment=requested_environment)
      or (select count(distinct kind) from public.compensation_rules where active and configured and configuration_environment=requested_environment)<3 then
      raise exception using errcode='55000',message='financial_configuration_incomplete';
    end if;
  end if;
  update public.platform_runtime_configuration set environment=requested_environment,
    financial_processing_enabled=enable_financial_processing,configured_at=now(),configured_by_reference=trim(operator_reference),updated_at=now()
  where singleton;
  insert into public.security_audit_log(actor_user_id,target_user_id,action,source,details)
  values(null,null,'platform.runtime_configured','database',jsonb_build_object('old_environment',old_environment,'new_environment',requested_environment,'old_financial_enabled',old_financial,'new_financial_enabled',enable_financial_processing,'operator_reference',trim(operator_reference)));
  return requested_environment;
end; $$;

create or replace function public.audit_profile_access_change()
returns trigger language plpgsql security definer set search_path='' as $$
begin
  if new.role_key is distinct from old.role_key or new.status is distinct from old.status then
    insert into public.security_audit_log(actor_user_id,target_user_id,action,source,details)
    values(auth.uid(),new.user_id,'identity.access_changed','database',jsonb_build_object('old_role',old.role_key,'new_role',new.role_key,'old_status',old.status,'new_status',new.status));
  end if;
  return new;
end; $$;

create trigger profiles_access_change_audit after update of role_key,status on public.profiles
for each row execute function public.audit_profile_access_change();

create or replace function public.service_set_profile_access(
  target_user_id uuid, requested_role text, requested_status public.account_status,
  change_reason text, operator_reference text
) returns uuid language plpgsql security definer set search_path='' as $$
begin
  if requested_role not in ('affiliate','executive','admin') then raise exception using errcode='22023',message='invalid_role'; end if;
  if char_length(trim(coalesce(change_reason,'')))<5 or char_length(change_reason)>500
    or char_length(trim(coalesce(operator_reference,'')))<3 or char_length(operator_reference)>120 then
    raise exception using errcode='22023',message='access_change_context_required';
  end if;
  update public.profiles set role_key=requested_role,status=requested_status where user_id=target_user_id;
  if not found then raise exception using errcode='22023',message='profile_not_found'; end if;
  insert into public.security_audit_log(actor_user_id,target_user_id,action,source,details)
  values(null,target_user_id,'identity.access_governed','database',jsonb_build_object('role',requested_role,'status',requested_status,'reason',left(trim(change_reason),500),'operator_reference',trim(operator_reference)));
  return target_user_id;
end; $$;

create or replace function public.protect_kyc_document_history()
returns trigger language plpgsql security invoker set search_path='' as $$
declare valid_scan_transition boolean;
begin
  if tg_op='DELETE' then raise exception using errcode='42501',message='kyc_document_history_is_immutable'; end if;
  valid_scan_transition:=(old.status='active' and new.status='active'
    and ((old.scan_status='uploaded' and new.scan_status='scanning')
      or (old.scan_status in ('scanning','scan_failed') and new.scan_status='scanning')
      or (old.scan_status='scanning' and new.scan_status in ('clean','quarantined','scan_failed'))));
  if valid_scan_transition then
    if new.id is distinct from old.id or new.submission_id is distinct from old.submission_id or new.user_id is distinct from old.user_id
      or new.document_type is distinct from old.document_type or new.bucket_id is distinct from old.bucket_id or new.object_path is distinct from old.object_path
      or new.original_filename is distinct from old.original_filename or new.mime_type is distinct from old.mime_type or new.size_bytes is distinct from old.size_bytes
      or new.sha256 is distinct from old.sha256 or new.replaced_by_document_id is distinct from old.replaced_by_document_id then
      raise exception using errcode='42501',message='invalid_kyc_document_change';
    end if;
    return new;
  end if;
  if old.status<>'active' or new.status<>'replaced' or new.replaced_by_document_id is null
    or new.id is distinct from old.id or new.submission_id is distinct from old.submission_id or new.user_id is distinct from old.user_id
    or new.document_type is distinct from old.document_type or new.bucket_id is distinct from old.bucket_id or new.object_path is distinct from old.object_path
    or new.mime_type is distinct from old.mime_type or new.size_bytes is distinct from old.size_bytes or new.sha256 is distinct from old.sha256
    or new.scan_status is distinct from old.scan_status or new.scan_started_at is distinct from old.scan_started_at
    or new.scanned_at is distinct from old.scanned_at or new.scanned_by is distinct from old.scanned_by or new.scan_metadata is distinct from old.scan_metadata then
    raise exception using errcode='42501',message='invalid_kyc_document_change';
  end if;
  return new;
end; $$;

create or replace function public.record_kyc_document_scan(
  target_document_id uuid, requested_status public.kyc_document_scan_status,
  scanner_reference text, result_metadata jsonb default '{}'::jsonb
) returns uuid language plpgsql security definer set search_path='' as $$
declare document_row public.kyc_documents%rowtype; event_type public.kyc_review_event_type;
begin
  if requested_status not in ('scanning','clean','quarantined','scan_failed') then raise exception using errcode='22023',message='invalid_scan_status'; end if;
  if char_length(trim(coalesce(scanner_reference,'')))<3 or char_length(scanner_reference)>120
    or jsonb_typeof(coalesce(result_metadata,'{}'::jsonb))<>'object' or octet_length(coalesce(result_metadata,'{}'::jsonb)::text)>8192 then
    raise exception using errcode='22023',message='invalid_scan_result';
  end if;
  select * into document_row from public.kyc_documents where id=target_document_id and status='active' for update;
  if not found then raise exception using errcode='22023',message='kyc_document_not_found'; end if;
  update public.kyc_documents set scan_status=requested_status,
    scan_started_at=case when requested_status='scanning' then coalesce(scan_started_at,now()) else scan_started_at end,
    scanned_at=case when requested_status in ('clean','quarantined','scan_failed') then now() else null end,
    scanned_by=trim(scanner_reference),scan_metadata=coalesce(result_metadata,'{}'::jsonb)
  where id=target_document_id;
  event_type:=case requested_status when 'scanning' then 'document_scan_started'::public.kyc_review_event_type when 'clean' then 'document_scan_clean'::public.kyc_review_event_type when 'quarantined' then 'document_quarantined'::public.kyc_review_event_type else 'document_scan_failed'::public.kyc_review_event_type end;
  perform public.write_kyc_event(document_row.submission_id,null,event_type,requested_status::text,'kyc_document',document_row.id,jsonb_build_object('scanner_reference',trim(scanner_reference)));
  insert into public.security_audit_log(actor_user_id,target_user_id,action,source,details)
  values(null,document_row.user_id,'kyc.document_scan_'||requested_status::text,'scanner',jsonb_build_object('document_id',document_row.id,'submission_id',document_row.submission_id,'scanner_reference',trim(scanner_reference)));
  return document_row.id;
end; $$;

create or replace function public.submit_kyc(target_submission_id uuid)
returns uuid language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); target_row public.kyc_submissions%rowtype; document_count integer;
begin
  if actor is null then raise exception using errcode='28000',message='authentication_required'; end if;
  perform public.consume_security_rate_limit('kyc.submit',5,3600);
  select * into target_row from public.kyc_submissions where id=target_submission_id for update;
  if not found or target_row.user_id<>actor or target_row.status<>'draft' then raise exception using errcode='42501',message='kyc_submit_forbidden'; end if;
  if not exists(select 1 from public.kyc_sensitive_data where submission_id=target_row.id) then raise exception using errcode='22023',message='kyc_details_required'; end if;
  select count(distinct document_type) into document_count from public.kyc_documents where submission_id=target_row.id and status='active' and scan_status='clean';
  if document_count<>3 then raise exception using errcode='22023',message='kyc_documents_not_clean'; end if;
  update public.kyc_submissions set status='pending_review',submitted_at=now() where id=target_row.id;
  perform public.write_kyc_event(target_row.id,actor,'submitted','pending_review');
  return target_row.id;
end; $$;

create or replace function public.record_kyc_document_access(target_document_id uuid)
returns text language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); document_row public.kyc_documents%rowtype;
begin
  if actor is null then raise exception using errcode='28000',message='authentication_required'; end if;
  perform public.consume_security_rate_limit('kyc.document_access',60,3600);
  select * into document_row from public.kyc_documents where id=target_document_id and status='active' and scan_status='clean';
  if not found or not public.is_executive(actor) or document_row.user_id=actor then raise exception using errcode='42501',message='document_access_forbidden'; end if;
  perform public.write_kyc_event(document_row.submission_id,actor,'document_accessed','signed_url_requested','kyc_document',document_row.id);
  return document_row.object_path;
end; $$;

create or replace function public.production_health_snapshot()
returns jsonb language sql stable security definer set search_path='' as $$
  select jsonb_build_object(
    'database_ready',true,
    'runtime_configured',c.environment<>'unconfigured',
    'environment',c.environment,
    'financial_processing_enabled',c.financial_processing_enabled,
    'vault_key_ready',exists(select 1 from vault.decrypted_secrets where name='kyc_data_encryption_key' and char_length(decrypted_secret)>=32),
    'kyc_bucket_private',exists(select 1 from storage.buckets where id='kyc-private' and not public and file_size_limit=5242880),
    'required_jobs_active',(select count(*)=3 from cron.job where active and jobname in('phase2-expire-plot-holds','phase3-daily-financial-maintenance','phase4-security-state-cleanup')),
    'malware_scanning_required',c.malware_scanning_required,
    'privileged_mfa_required',c.privileged_mfa_required
  ) from public.platform_runtime_configuration c where c.singleton;
$$;

revoke all on function public.current_platform_environment() from public,anon,authenticated;
revoke all on function public.assert_financial_processing_ready() from public,anon,authenticated;
revoke all on function public.guard_financial_processing() from public,anon,authenticated;
revoke all on function public.enforce_active_financial_environment() from public,anon,authenticated;
revoke all on function public.configure_platform_runtime(public.platform_environment,boolean,text,text) from public,anon,authenticated;
grant execute on function public.configure_platform_runtime(public.platform_environment,boolean,text,text) to service_role;
revoke all on function public.audit_profile_access_change() from public,anon,authenticated;
revoke all on function public.service_set_profile_access(uuid,text,public.account_status,text,text) from public,anon,authenticated;
grant execute on function public.service_set_profile_access(uuid,text,public.account_status,text,text) to service_role;
revoke all on function public.record_kyc_document_scan(uuid,public.kyc_document_scan_status,text,jsonb) from public,anon,authenticated;
grant execute on function public.record_kyc_document_scan(uuid,public.kyc_document_scan_status,text,jsonb) to service_role;
revoke all on function public.production_health_snapshot() from public,anon,authenticated;
grant execute on function public.production_health_snapshot() to service_role;
revoke all on function public.privileged_access_ready() from public,anon;
grant execute on function public.privileged_access_ready() to authenticated,service_role;

-- Trigger-only functions are not API endpoints.
revoke all on function public.set_updated_at() from public,anon,authenticated;
revoke all on function public.protect_network_genealogy() from public,anon,authenticated;
revoke all on function public.protect_posted_financial_records() from public,anon,authenticated;
revoke all on function public.protect_kyc_submission_history() from public,anon,authenticated;
revoke all on function public.protect_kyc_document_history() from public,anon,authenticated;
revoke all on function public.protect_kyc_sensitive_data() from public,anon,authenticated;
revoke all on function public.prevent_kyc_event_mutation() from public,anon,authenticated;
revoke all on function public.prevent_kyc_pan_registry_mutation() from public,anon,authenticated;

commit;
