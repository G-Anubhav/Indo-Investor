begin;

create type public.platform_environment as enum ('unconfigured','development','staging','production');
create type public.kyc_document_scan_status as enum ('uploaded','scanning','clean','quarantined','scan_failed');

alter type public.kyc_review_event_type add value if not exists 'document_scan_started';
alter type public.kyc_review_event_type add value if not exists 'document_scan_clean';
alter type public.kyc_review_event_type add value if not exists 'document_quarantined';
alter type public.kyc_review_event_type add value if not exists 'document_scan_failed';

create table public.platform_runtime_configuration (
  singleton boolean primary key default true,
  environment public.platform_environment not null default 'unconfigured',
  financial_processing_enabled boolean not null default false,
  malware_scanning_required boolean not null default true,
  privileged_mfa_required boolean not null default true,
  configured_at timestamptz,
  configured_by_reference text,
  updated_at timestamptz not null default now(),
  constraint platform_runtime_singleton check (singleton),
  constraint platform_runtime_reference_length check (configured_by_reference is null or char_length(trim(configured_by_reference)) between 3 and 120),
  constraint platform_runtime_financial_environment check (not financial_processing_enabled or environment<>'unconfigured')
);

insert into public.platform_runtime_configuration(singleton) values(true);

alter table public.payment_plan_definitions
  add column configuration_environment public.platform_environment not null default 'development',
  add constraint payment_plan_environment_configured check(configuration_environment<>'unconfigured');

alter table public.compensation_rules
  add column configuration_environment public.platform_environment not null default 'development',
  add constraint compensation_rule_environment_configured check(configuration_environment<>'unconfigured');

create index payment_plans_environment_idx
on public.payment_plan_definitions(configuration_environment,active,configured);

create index compensation_rules_environment_idx
on public.compensation_rules(configuration_environment,kind,active,configured,version desc);

alter table public.kyc_documents
  add column scan_status public.kyc_document_scan_status not null default 'uploaded',
  add column scan_started_at timestamptz,
  add column scanned_at timestamptz,
  add column scanned_by text,
  add column scan_metadata jsonb not null default '{}'::jsonb,
  add constraint kyc_document_scan_actor_length check(scanned_by is null or char_length(trim(scanned_by)) between 3 and 120),
  add constraint kyc_document_scan_metadata_object check(jsonb_typeof(scan_metadata)='object'),
  add constraint kyc_document_scan_metadata_size check(octet_length(scan_metadata::text)<=8192),
  add constraint kyc_document_scan_state_integrity check(
    (scan_status='uploaded' and scan_started_at is null and scanned_at is null and scanned_by is null)
    or (scan_status='scanning' and scan_started_at is not null and scanned_at is null and scanned_by is not null)
    or (scan_status in ('clean','quarantined','scan_failed') and scan_started_at is not null and scanned_at is not null and scanned_by is not null)
  );

create index kyc_documents_scan_queue_idx
on public.kyc_documents(scan_status,uploaded_at,id)
where status='active' and scan_status in ('uploaded','scanning','scan_failed');

alter table public.platform_runtime_configuration enable row level security;
alter table public.platform_runtime_configuration force row level security;
revoke all on table public.platform_runtime_configuration from public,anon,authenticated;

commit;
