begin;

create type public.kyc_submission_status as enum (
  'draft',
  'pending_review',
  'approved',
  'rejected',
  'resubmission_required'
);

create type public.kyc_document_type as enum ('pan', 'aadhaar', 'bank_proof');
create type public.kyc_document_status as enum ('active', 'replaced');
create type public.kyc_review_event_type as enum (
  'draft_created',
  'draft_updated',
  'document_uploaded',
  'document_replaced',
  'submitted',
  'approved',
  'rejected',
  'resubmission_required',
  'document_accessed',
  'sensitive_data_accessed'
);

create table public.kyc_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete restrict,
  version integer not null,
  status public.kyc_submission_status not null default 'draft',
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(user_id) on delete restrict,
  rejection_reason text,
  review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint kyc_version_positive check (version > 0),
  constraint kyc_rejection_reason_length check (rejection_reason is null or char_length(trim(rejection_reason)) between 3 and 500),
  constraint kyc_review_notes_length check (review_notes is null or char_length(review_notes) <= 1000),
  constraint kyc_submission_state_integrity check (
    (status = 'draft' and submitted_at is null and reviewed_at is null and reviewed_by is null and rejection_reason is null)
    or (status = 'pending_review' and submitted_at is not null and reviewed_at is null and reviewed_by is null and rejection_reason is null)
    or (status = 'approved' and submitted_at is not null and reviewed_at is not null and reviewed_by is not null and rejection_reason is null)
    or (status in ('rejected','resubmission_required') and submitted_at is not null and reviewed_at is not null and reviewed_by is not null and rejection_reason is not null)
  ),
  unique (user_id, version)
);

create unique index kyc_one_open_submission_idx
on public.kyc_submissions(user_id)
where status in ('draft','pending_review');

create index kyc_review_queue_idx
on public.kyc_submissions(status, submitted_at desc, id);

create index kyc_user_history_idx
on public.kyc_submissions(user_id, version desc);

create table public.kyc_sensitive_data (
  submission_id uuid primary key references public.kyc_submissions(id) on delete restrict,
  pan_ciphertext bytea not null,
  pan_fingerprint text not null,
  aadhaar_last4_ciphertext bytea not null,
  bank_account_ciphertext bytea not null,
  ifsc_ciphertext bytea not null,
  account_holder_ciphertext bytea not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pan_fingerprint_format check (pan_fingerprint ~ '^[0-9a-f]{64}$')
);

create table public.kyc_pan_registry (
  pan_fingerprint text primary key,
  user_id uuid not null references public.profiles(user_id) on delete restrict,
  first_recorded_at timestamptz not null default now(),
  constraint kyc_registry_fingerprint_format check (pan_fingerprint ~ '^[0-9a-f]{64}$')
);

create table public.kyc_upload_intents (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.kyc_submissions(id) on delete restrict,
  user_id uuid not null references public.profiles(user_id) on delete restrict,
  document_type public.kyc_document_type not null,
  object_path text not null unique,
  expected_mime_type text not null,
  expected_size_bytes integer not null,
  expected_sha256 text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '10 minutes'),
  consumed_at timestamptz,
  constraint kyc_intent_mime_allowed check (expected_mime_type in ('application/pdf','image/jpeg','image/png')),
  constraint kyc_intent_size_allowed check (expected_size_bytes between 1 and 5242880),
  constraint kyc_intent_hash_format check (expected_sha256 ~ '^[0-9a-f]{64}$'),
  constraint kyc_intent_expiry check (expires_at > created_at),
  constraint kyc_intent_path_length check (char_length(object_path) between 80 and 240)
);

create index kyc_upload_intents_active_idx
on public.kyc_upload_intents(user_id, expires_at)
where consumed_at is null;

create table public.kyc_documents (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.kyc_submissions(id) on delete restrict,
  user_id uuid not null references public.profiles(user_id) on delete restrict,
  document_type public.kyc_document_type not null,
  status public.kyc_document_status not null default 'active',
  bucket_id text not null default 'kyc-private',
  object_path text not null unique,
  original_filename text not null,
  mime_type text not null,
  size_bytes integer not null,
  sha256 text not null,
  replaced_by_document_id uuid references public.kyc_documents(id) on delete restrict,
  uploaded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint kyc_document_bucket_private check (bucket_id = 'kyc-private'),
  constraint kyc_document_mime_allowed check (mime_type in ('application/pdf','image/jpeg','image/png')),
  constraint kyc_document_size_allowed check (size_bytes between 1 and 5242880),
  constraint kyc_document_hash_format check (sha256 ~ '^[0-9a-f]{64}$'),
  constraint kyc_document_filename_length check (char_length(original_filename) between 1 and 120),
  constraint kyc_document_replacement_state check (
    (status = 'active' and replaced_by_document_id is null)
    or (status = 'replaced' and replaced_by_document_id is not null)
  )
);

create unique index kyc_one_active_document_type_idx
on public.kyc_documents(submission_id, document_type)
where status = 'active';

create index kyc_documents_user_idx
on public.kyc_documents(user_id, submission_id, document_type, uploaded_at desc);

create table public.kyc_review_events (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.kyc_submissions(id) on delete restrict,
  submission_version integer not null,
  target_user_id uuid not null references public.profiles(user_id) on delete restrict,
  actor_user_id uuid references public.profiles(user_id) on delete restrict,
  event_type public.kyc_review_event_type not null,
  outcome text not null,
  reference_type text,
  reference_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint kyc_event_outcome_length check (char_length(trim(outcome)) between 2 and 80),
  constraint kyc_event_reference_format check (reference_type is null or reference_type ~ '^[a-z][a-z0-9_]{2,39}$'),
  constraint kyc_event_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create index kyc_events_submission_idx
on public.kyc_review_events(submission_id, created_at desc);

create index kyc_events_target_idx
on public.kyc_review_events(target_user_id, created_at desc);

create table public.security_rate_limits (
  actor_user_id uuid not null references public.profiles(user_id) on delete cascade,
  scope text not null,
  window_started_at timestamptz not null,
  request_count integer not null default 1,
  updated_at timestamptz not null default now(),
  primary key (actor_user_id, scope),
  constraint security_rate_scope_format check (scope ~ '^[a-z][a-z0-9_.-]{2,59}$'),
  constraint security_rate_count_positive check (request_count > 0)
);

create trigger kyc_submissions_set_updated_at
before update on public.kyc_submissions
for each row execute function public.set_updated_at();

create trigger kyc_sensitive_data_set_updated_at
before update on public.kyc_sensitive_data
for each row execute function public.set_updated_at();

create or replace function public.protect_kyc_submission_history()
returns trigger language plpgsql security invoker set search_path='' as $$
begin
  if tg_op = 'DELETE' then
    raise exception using errcode='42501', message='kyc_history_is_immutable';
  end if;
  if new.id is distinct from old.id or new.user_id is distinct from old.user_id
    or new.version is distinct from old.version or new.created_at is distinct from old.created_at then
    raise exception using errcode='42501', message='kyc_identity_is_immutable';
  end if;
  if old.status in ('approved','rejected','resubmission_required') then
    raise exception using errcode='42501', message='kyc_decision_is_immutable';
  end if;
  if old.status='draft' and new.status not in ('draft','pending_review') then
    raise exception using errcode='22023', message='invalid_kyc_transition';
  end if;
  if old.status='pending_review' and new.status not in ('approved','rejected','resubmission_required') then
    raise exception using errcode='22023', message='invalid_kyc_transition';
  end if;
  return new;
end; $$;

create trigger kyc_submission_history_protected
before update or delete on public.kyc_submissions
for each row execute function public.protect_kyc_submission_history();

create or replace function public.protect_kyc_document_history()
returns trigger language plpgsql security invoker set search_path='' as $$
begin
  if tg_op='DELETE' then raise exception using errcode='42501',message='kyc_document_history_is_immutable'; end if;
  if old.status<>'active' or new.status<>'replaced'
    or new.replaced_by_document_id is null
    or new.id is distinct from old.id
    or new.submission_id is distinct from old.submission_id
    or new.user_id is distinct from old.user_id
    or new.document_type is distinct from old.document_type
    or new.bucket_id is distinct from old.bucket_id
    or new.object_path is distinct from old.object_path
    or new.mime_type is distinct from old.mime_type
    or new.size_bytes is distinct from old.size_bytes
    or new.sha256 is distinct from old.sha256 then
    raise exception using errcode='42501',message='invalid_kyc_document_change';
  end if;
  return new;
end; $$;

create trigger kyc_document_history_protected
before update or delete on public.kyc_documents
for each row execute function public.protect_kyc_document_history();

create or replace function public.prevent_kyc_event_mutation()
returns trigger language plpgsql security invoker set search_path='' as $$
begin raise exception using errcode='42501',message='kyc_audit_is_immutable'; end; $$;

create trigger kyc_review_events_immutable
before update or delete on public.kyc_review_events
for each row execute function public.prevent_kyc_event_mutation();

commit;
