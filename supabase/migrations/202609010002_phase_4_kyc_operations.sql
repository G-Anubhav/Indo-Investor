begin;

alter table public.kyc_documents drop constraint kyc_documents_replaced_by_document_id_fkey;
alter table public.kyc_documents add constraint kyc_documents_replaced_by_document_id_fkey
  foreign key (replaced_by_document_id) references public.kyc_documents(id)
  on delete restrict deferrable initially deferred;

create or replace function public.get_kyc_encryption_key()
returns text language plpgsql stable security definer set search_path='' as $$
declare secret_value text;
begin
  select decrypted_secret into secret_value
  from vault.decrypted_secrets where name='kyc_data_encryption_key' order by created_at desc limit 1;
  if secret_value is null or char_length(secret_value)<32 then
    raise exception using errcode='55000',message='kyc_encryption_not_configured';
  end if;
  return secret_value;
end; $$;

create or replace function public.consume_security_rate_limit(
  requested_scope text, maximum_requests integer, window_seconds integer
) returns void language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); limit_row public.security_rate_limits%rowtype;
begin
  if actor is null then raise exception using errcode='28000',message='authentication_required'; end if;
  if requested_scope !~ '^[a-z][a-z0-9_.-]{2,59}$' or maximum_requests<1 or window_seconds<1 then
    raise exception using errcode='22023',message='invalid_rate_limit';
  end if;
  insert into public.security_rate_limits(actor_user_id,scope,window_started_at,request_count)
  values(actor,requested_scope,now(),1)
  on conflict(actor_user_id,scope) do update set
    window_started_at=case when public.security_rate_limits.window_started_at<=now()-make_interval(secs=>window_seconds) then now() else public.security_rate_limits.window_started_at end,
    request_count=case when public.security_rate_limits.window_started_at<=now()-make_interval(secs=>window_seconds) then 1 else public.security_rate_limits.request_count+1 end,
    updated_at=now()
  returning * into limit_row;
  if limit_row.request_count>maximum_requests then
    raise exception using errcode='P0001',message='rate_limit_exceeded';
  end if;
end; $$;

create or replace function public.write_kyc_event(
  target_submission_id uuid, actor uuid, requested_type public.kyc_review_event_type,
  requested_outcome text, requested_reference_type text default null,
  requested_reference_id uuid default null, requested_metadata jsonb default '{}'::jsonb
) returns uuid language plpgsql security definer set search_path='' as $$
declare event_id uuid; target_row public.kyc_submissions%rowtype;
begin
  select * into target_row from public.kyc_submissions where id=target_submission_id;
  if not found then raise exception using errcode='22023',message='kyc_submission_not_found'; end if;
  insert into public.kyc_review_events(submission_id,submission_version,target_user_id,actor_user_id,event_type,outcome,reference_type,reference_id,metadata)
  values(target_row.id,target_row.version,target_row.user_id,actor,requested_type,requested_outcome,requested_reference_type,requested_reference_id,coalesce(requested_metadata,'{}'::jsonb))
  returning id into event_id;
  return event_id;
end; $$;

create or replace function public.start_or_get_kyc_draft()
returns uuid language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); current_row public.kyc_submissions%rowtype; created_id uuid;
begin
  if actor is null then raise exception using errcode='28000',message='authentication_required'; end if;
  perform public.consume_security_rate_limit('kyc.draft',20,3600);
  perform pg_advisory_xact_lock(hashtext('kyc-draft:'||actor::text));
  select * into current_row from public.kyc_submissions where user_id=actor order by version desc limit 1 for update;
  if found and current_row.status in ('draft','pending_review','approved') then
    if current_row.status='pending_review' then raise exception using errcode='55000',message='kyc_review_pending'; end if;
    if current_row.status='approved' then raise exception using errcode='55000',message='kyc_already_approved'; end if;
    return current_row.id;
  end if;
  insert into public.kyc_submissions(user_id,version)
  values(actor,coalesce(current_row.version,0)+1) returning id into created_id;
  if current_row.id is not null then
    insert into public.kyc_sensitive_data(submission_id,pan_ciphertext,pan_fingerprint,aadhaar_last4_ciphertext,bank_account_ciphertext,ifsc_ciphertext,account_holder_ciphertext)
    select created_id,pan_ciphertext,pan_fingerprint,aadhaar_last4_ciphertext,bank_account_ciphertext,ifsc_ciphertext,account_holder_ciphertext
    from public.kyc_sensitive_data where submission_id=current_row.id;
  end if;
  perform public.write_kyc_event(created_id,actor,'draft_created','created');
  return created_id;
end; $$;

create or replace function public.save_kyc_draft(
  target_submission_id uuid, requested_pan text, requested_aadhaar_last4 text,
  requested_bank_account text, requested_ifsc text, requested_account_holder text
) returns uuid language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); target_row public.kyc_submissions%rowtype; encryption_key text;
 pan_value text:=upper(regexp_replace(coalesce(requested_pan,''),'\s','','g'));
 aadhaar_value text:=regexp_replace(coalesce(requested_aadhaar_last4,''),'\D','','g');
 bank_value text:=regexp_replace(coalesce(requested_bank_account,''),'\D','','g');
 ifsc_value text:=upper(regexp_replace(coalesce(requested_ifsc,''),'\s','','g'));
 holder_value text:=trim(coalesce(requested_account_holder,'')); fingerprint text; registered_user uuid;
begin
  if actor is null then raise exception using errcode='28000',message='authentication_required'; end if;
  perform public.consume_security_rate_limit('kyc.save',30,3600);
  select * into target_row from public.kyc_submissions where id=target_submission_id for update;
  if not found or target_row.user_id<>actor then raise exception using errcode='42501',message='kyc_submission_forbidden'; end if;
  if target_row.status<>'draft' then raise exception using errcode='55000',message='kyc_draft_not_editable'; end if;
  if pan_value !~ '^[A-Z]{5}[0-9]{4}[A-Z]$' then raise exception using errcode='22023',message='invalid_pan'; end if;
  if aadhaar_value !~ '^[0-9]{4}$' then raise exception using errcode='22023',message='invalid_aadhaar_last4'; end if;
  if bank_value !~ '^[0-9]{9,18}$' then raise exception using errcode='22023',message='invalid_bank_account'; end if;
  if ifsc_value !~ '^[A-Z]{4}0[A-Z0-9]{6}$' then raise exception using errcode='22023',message='invalid_ifsc'; end if;
  if char_length(holder_value)<2 or char_length(holder_value)>120 then raise exception using errcode='22023',message='invalid_account_holder'; end if;
  encryption_key:=public.get_kyc_encryption_key();
  fingerprint:=encode(extensions.hmac(convert_to(pan_value,'UTF8'),convert_to(encryption_key,'UTF8'),'sha256'),'hex');
  select user_id into registered_user from public.kyc_pan_registry where pan_fingerprint=fingerprint;
  if registered_user is not null and registered_user<>actor then raise exception using errcode='23505',message='pan_already_registered'; end if;
  insert into public.kyc_pan_registry(pan_fingerprint,user_id) values(fingerprint,actor) on conflict(pan_fingerprint) do nothing;
  insert into public.kyc_sensitive_data(submission_id,pan_ciphertext,pan_fingerprint,aadhaar_last4_ciphertext,bank_account_ciphertext,ifsc_ciphertext,account_holder_ciphertext)
  values(target_row.id,
    extensions.pgp_sym_encrypt(pan_value,encryption_key,'cipher-algo=aes256'),fingerprint,
    extensions.pgp_sym_encrypt(aadhaar_value,encryption_key,'cipher-algo=aes256'),
    extensions.pgp_sym_encrypt(bank_value,encryption_key,'cipher-algo=aes256'),
    extensions.pgp_sym_encrypt(ifsc_value,encryption_key,'cipher-algo=aes256'),
    extensions.pgp_sym_encrypt(holder_value,encryption_key,'cipher-algo=aes256'))
  on conflict(submission_id) do update set
    pan_ciphertext=excluded.pan_ciphertext,pan_fingerprint=excluded.pan_fingerprint,
    aadhaar_last4_ciphertext=excluded.aadhaar_last4_ciphertext,bank_account_ciphertext=excluded.bank_account_ciphertext,
    ifsc_ciphertext=excluded.ifsc_ciphertext,account_holder_ciphertext=excluded.account_holder_ciphertext;
  perform public.write_kyc_event(target_row.id,actor,'draft_updated','saved');
  return target_row.id;
end; $$;

create or replace function public.create_kyc_upload_intent(
  target_submission_id uuid, requested_document_type public.kyc_document_type,
  requested_object_path text, requested_mime_type text, requested_size_bytes integer, requested_sha256 text
) returns uuid language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); target_row public.kyc_submissions%rowtype; intent_id uuid; expected_prefix text;
begin
  if actor is null then raise exception using errcode='28000',message='authentication_required'; end if;
  perform public.consume_security_rate_limit('kyc.upload',20,3600);
  select * into target_row from public.kyc_submissions where id=target_submission_id for update;
  if not found or target_row.user_id<>actor or target_row.status<>'draft' then raise exception using errcode='42501',message='kyc_upload_forbidden'; end if;
  expected_prefix:=actor::text||'/'||target_row.id::text||'/'||requested_document_type::text||'/';
  if requested_object_path not like expected_prefix||'%' or requested_object_path ~ '(\.\.|//)' then raise exception using errcode='22023',message='invalid_object_path'; end if;
  insert into public.kyc_upload_intents(submission_id,user_id,document_type,object_path,expected_mime_type,expected_size_bytes,expected_sha256)
  values(target_row.id,actor,requested_document_type,requested_object_path,requested_mime_type,requested_size_bytes,lower(requested_sha256)) returning id into intent_id;
  return intent_id;
end; $$;

create or replace function public.finalize_kyc_upload(target_intent_id uuid, requested_original_filename text)
returns uuid language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); intent_row public.kyc_upload_intents%rowtype; object_row storage.objects%rowtype;
 old_document public.kyc_documents%rowtype; document_id uuid:=gen_random_uuid(); safe_filename text:=trim(requested_original_filename);
begin
  if actor is null then raise exception using errcode='28000',message='authentication_required'; end if;
  select * into intent_row from public.kyc_upload_intents where id=target_intent_id for update;
  if not found or intent_row.user_id<>actor or intent_row.consumed_at is not null or intent_row.expires_at<=now() then raise exception using errcode='42501',message='invalid_upload_intent'; end if;
  if char_length(safe_filename)<1 or char_length(safe_filename)>120 or safe_filename ~ '[\\/\x00-\x1f]' then raise exception using errcode='22023',message='invalid_filename'; end if;
  select * into object_row from storage.objects where bucket_id='kyc-private' and name=intent_row.object_path for update;
  if not found then raise exception using errcode='22023',message='uploaded_object_not_found'; end if;
  if coalesce((object_row.metadata->>'size')::integer,-1)<>intent_row.expected_size_bytes
    or coalesce(object_row.metadata->>'mimetype','')<>intent_row.expected_mime_type then
    raise exception using errcode='22023',message='uploaded_object_mismatch';
  end if;
  select * into old_document from public.kyc_documents where submission_id=intent_row.submission_id and document_type=intent_row.document_type and status='active' for update;
  if found then
    update public.kyc_documents set status='replaced',replaced_by_document_id=document_id where id=old_document.id;
  end if;
  insert into public.kyc_documents(id,submission_id,user_id,document_type,object_path,original_filename,mime_type,size_bytes,sha256)
  values(document_id,intent_row.submission_id,actor,intent_row.document_type,intent_row.object_path,safe_filename,intent_row.expected_mime_type,intent_row.expected_size_bytes,intent_row.expected_sha256);
  update public.kyc_upload_intents set consumed_at=now() where id=intent_row.id;
  perform public.write_kyc_event(intent_row.submission_id,actor,case when old_document.id is null then 'document_uploaded'::public.kyc_review_event_type else 'document_replaced'::public.kyc_review_event_type end,'stored','kyc_document',document_id,jsonb_build_object('document_type',intent_row.document_type));
  return document_id;
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
  select count(distinct document_type) into document_count from public.kyc_documents where submission_id=target_row.id and status='active';
  if document_count<>3 then raise exception using errcode='22023',message='kyc_documents_required'; end if;
  update public.kyc_submissions set status='pending_review',submitted_at=now() where id=target_row.id;
  perform public.write_kyc_event(target_row.id,actor,'submitted','pending_review');
  return target_row.id;
end; $$;

create or replace function public.admin_review_kyc(
  target_submission_id uuid, requested_decision text, requested_reason text default null, requested_notes text default null
) returns uuid language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); target_row public.kyc_submissions%rowtype; decision public.kyc_submission_status;
begin
  if not public.is_executive(actor) then raise exception using errcode='42501',message='executive_required'; end if;
  perform public.consume_security_rate_limit('kyc.review',100,3600);
  select * into target_row from public.kyc_submissions where id=target_submission_id for update;
  if not found or target_row.status<>'pending_review' then raise exception using errcode='55000',message='kyc_not_pending'; end if;
  if target_row.user_id=actor then raise exception using errcode='42501',message='self_review_forbidden'; end if;
  if requested_decision not in ('approved','rejected','resubmission_required') then raise exception using errcode='22023',message='invalid_kyc_decision'; end if;
  decision:=requested_decision::public.kyc_submission_status;
  if decision in ('rejected','resubmission_required') and char_length(trim(coalesce(requested_reason,'')))<3 then raise exception using errcode='22023',message='review_reason_required'; end if;
  update public.kyc_submissions set status=decision,reviewed_at=now(),reviewed_by=actor,
    rejection_reason=case when decision='approved' then null else left(trim(requested_reason),500) end,
    review_notes=nullif(left(trim(coalesce(requested_notes,'')),1000),'') where id=target_row.id;
  perform public.write_kyc_event(target_row.id,actor,requested_decision::public.kyc_review_event_type,requested_decision,null,null,jsonb_build_object('reason_provided',decision<>'approved'));
  insert into public.security_audit_log(actor_user_id,target_user_id,action,source,details)
  values(actor,target_row.user_id,'kyc.review_'||requested_decision,'database',jsonb_build_object('submission_id',target_row.id,'version',target_row.version));
  return target_row.id;
end; $$;

create or replace function public.get_kyc_sensitive_for_review(target_submission_id uuid)
returns table(pan text,aadhaar_last4 text,bank_account text,ifsc text,account_holder text)
language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); target_row public.kyc_submissions%rowtype; sensitive_row public.kyc_sensitive_data%rowtype; encryption_key text;
begin
  if not public.is_executive(actor) then raise exception using errcode='42501',message='executive_required'; end if;
  perform public.consume_security_rate_limit('kyc.reveal',30,3600);
  select * into target_row from public.kyc_submissions where id=target_submission_id;
  if not found or target_row.user_id=actor then raise exception using errcode='42501',message='sensitive_access_forbidden'; end if;
  select * into sensitive_row from public.kyc_sensitive_data where submission_id=target_submission_id;
  if not found then raise exception using errcode='22023',message='kyc_details_not_found'; end if;
  encryption_key:=public.get_kyc_encryption_key();
  perform public.write_kyc_event(target_row.id,actor,'sensitive_data_accessed','revealed');
  insert into public.security_audit_log(actor_user_id,target_user_id,action,source,details)
  values(actor,target_row.user_id,'kyc.sensitive_data_accessed','database',jsonb_build_object('submission_id',target_row.id));
  return query select
    extensions.pgp_sym_decrypt(sensitive_row.pan_ciphertext,encryption_key),
    extensions.pgp_sym_decrypt(sensitive_row.aadhaar_last4_ciphertext,encryption_key),
    extensions.pgp_sym_decrypt(sensitive_row.bank_account_ciphertext,encryption_key),
    extensions.pgp_sym_decrypt(sensitive_row.ifsc_ciphertext,encryption_key),
    extensions.pgp_sym_decrypt(sensitive_row.account_holder_ciphertext,encryption_key);
end; $$;

create or replace function public.record_kyc_document_access(target_document_id uuid)
returns text language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); document_row public.kyc_documents%rowtype;
begin
  if actor is null then raise exception using errcode='28000',message='authentication_required'; end if;
  perform public.consume_security_rate_limit('kyc.document_access',60,3600);
  select * into document_row from public.kyc_documents where id=target_document_id and status='active';
  if not found or (document_row.user_id<>actor and not public.is_executive(actor)) then raise exception using errcode='42501',message='document_access_forbidden'; end if;
  if document_row.user_id=actor and not public.is_executive(actor) then raise exception using errcode='42501',message='document_owner_download_disabled'; end if;
  perform public.write_kyc_event(document_row.submission_id,actor,'document_accessed','signed_url_requested','kyc_document',document_row.id);
  return document_row.object_path;
end; $$;

create or replace function public.can_withdraw(check_user_id uuid default auth.uid())
returns boolean language plpgsql stable security definer set search_path='' as $$
declare actor uuid:=auth.uid(); allowed boolean;
begin
  if actor is null or (check_user_id<>actor and not public.is_executive(actor)) then return false; end if;
  select exists(select 1 from public.profiles p where p.user_id=check_user_id and p.status='active')
    and exists(select 1 from public.kyc_submissions k where k.user_id=check_user_id and k.status='approved' and not exists(select 1 from public.kyc_submissions newer where newer.user_id=k.user_id and newer.version>k.version)) into allowed;
  return coalesce(allowed,false);
end; $$;

create or replace function public.can_finalize_deed(check_user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path='' as $$
  select public.can_withdraw(check_user_id);
$$;

revoke all on function public.get_kyc_encryption_key() from public,anon,authenticated;
revoke all on function public.consume_security_rate_limit(text,integer,integer) from public,anon,authenticated;
revoke all on function public.write_kyc_event(uuid,uuid,public.kyc_review_event_type,text,text,uuid,jsonb) from public,anon,authenticated;
revoke all on function public.start_or_get_kyc_draft() from public,anon;
grant execute on function public.start_or_get_kyc_draft() to authenticated,service_role;
revoke all on function public.save_kyc_draft(uuid,text,text,text,text,text) from public,anon;
grant execute on function public.save_kyc_draft(uuid,text,text,text,text,text) to authenticated,service_role;
revoke all on function public.create_kyc_upload_intent(uuid,public.kyc_document_type,text,text,integer,text) from public,anon;
grant execute on function public.create_kyc_upload_intent(uuid,public.kyc_document_type,text,text,integer,text) to authenticated,service_role;
revoke all on function public.finalize_kyc_upload(uuid,text) from public,anon;
grant execute on function public.finalize_kyc_upload(uuid,text) to authenticated,service_role;
revoke all on function public.submit_kyc(uuid) from public,anon;
grant execute on function public.submit_kyc(uuid) to authenticated,service_role;
revoke all on function public.admin_review_kyc(uuid,text,text,text) from public,anon;
grant execute on function public.admin_review_kyc(uuid,text,text,text) to authenticated,service_role;
revoke all on function public.get_kyc_sensitive_for_review(uuid) from public,anon;
grant execute on function public.get_kyc_sensitive_for_review(uuid) to authenticated,service_role;
revoke all on function public.record_kyc_document_access(uuid) from public,anon;
grant execute on function public.record_kyc_document_access(uuid) to authenticated,service_role;
revoke all on function public.can_withdraw(uuid) from public,anon;
grant execute on function public.can_withdraw(uuid) to authenticated,service_role;
revoke all on function public.can_finalize_deed(uuid) from public,anon;
grant execute on function public.can_finalize_deed(uuid) to authenticated,service_role;

commit;
