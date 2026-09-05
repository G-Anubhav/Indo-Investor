begin;

create index kyc_pan_registry_user_idx on public.kyc_pan_registry(user_id);

create or replace function public.protect_kyc_sensitive_data()
returns trigger language plpgsql security invoker set search_path='' as $$
declare submission_status public.kyc_submission_status;
begin
  if tg_op='DELETE' then raise exception using errcode='42501',message='kyc_sensitive_history_is_immutable'; end if;
  if tg_op='UPDATE' and new.submission_id is distinct from old.submission_id then raise exception using errcode='42501',message='kyc_sensitive_identity_is_immutable'; end if;
  select status into submission_status from public.kyc_submissions where id=new.submission_id;
  if submission_status<>'draft' then raise exception using errcode='42501',message='kyc_sensitive_data_locked'; end if;
  return new;
end; $$;

create trigger kyc_sensitive_data_protected
before insert or update or delete on public.kyc_sensitive_data
for each row execute function public.protect_kyc_sensitive_data();

create or replace function public.prevent_kyc_pan_registry_mutation()
returns trigger language plpgsql security invoker set search_path='' as $$
begin raise exception using errcode='42501',message='kyc_pan_registry_is_immutable'; end; $$;

create trigger kyc_pan_registry_immutable
before update or delete on public.kyc_pan_registry
for each row execute function public.prevent_kyc_pan_registry_mutation();

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('kyc-private','kyc-private',false,5242880,array['application/pdf','image/jpeg','image/png'])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

do $$ declare table_name text; begin
  foreach table_name in array array['kyc_submissions','kyc_sensitive_data','kyc_pan_registry','kyc_upload_intents','kyc_documents','kyc_review_events','security_rate_limits'] loop
    execute format('alter table public.%I enable row level security',table_name);
    execute format('alter table public.%I force row level security',table_name);
    execute format('revoke all on table public.%I from public,anon,authenticated',table_name);
  end loop;
end $$;

grant select on table public.kyc_submissions to authenticated;
grant select on table public.kyc_documents to authenticated;
grant select on table public.kyc_review_events to authenticated;

create policy kyc_submissions_owner_or_executive_read on public.kyc_submissions
for select to authenticated using(user_id=auth.uid() or public.is_executive());

create policy kyc_documents_owner_or_executive_read on public.kyc_documents
for select to authenticated using(user_id=auth.uid() or public.is_executive());

create policy kyc_review_events_owner_or_executive_read on public.kyc_review_events
for select to authenticated using(target_user_id=auth.uid() or public.is_executive());

-- Intentionally no authenticated Storage policies. The private bucket is accessed only
-- through short-lived, server-generated signed URLs after an audited authorization RPC.
drop policy if exists kyc_private_select on storage.objects;
drop policy if exists kyc_private_insert on storage.objects;
drop policy if exists kyc_private_update on storage.objects;
drop policy if exists kyc_private_delete on storage.objects;

create or replace function public.cleanup_phase4_security_state()
returns jsonb language plpgsql security definer set search_path='' as $$
declare deleted_intents integer; deleted_limits integer;
begin
  delete from public.kyc_upload_intents where consumed_at is not null and consumed_at<now()-interval '7 days' or (consumed_at is null and expires_at<now()-interval '1 day');
  get diagnostics deleted_intents=row_count;
  delete from public.security_rate_limits where updated_at<now()-interval '2 days';
  get diagnostics deleted_limits=row_count;
  return jsonb_build_object('upload_intents',deleted_intents,'rate_limits',deleted_limits);
end; $$;

revoke all on function public.cleanup_phase4_security_state() from public,anon,authenticated;
grant execute on function public.cleanup_phase4_security_state() to service_role;

do $$ begin
  if not exists(select 1 from cron.job where jobname='phase4-security-state-cleanup') then
    perform cron.schedule('phase4-security-state-cleanup','30 1 * * *','select public.cleanup_phase4_security_state();');
  end if;
end $$;

commit;
