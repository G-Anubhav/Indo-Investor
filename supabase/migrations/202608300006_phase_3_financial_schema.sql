begin;

create type public.purchase_status as enum ('active', 'completed', 'cancelled');
create type public.installment_status as enum ('scheduled', 'due', 'partially_paid', 'paid', 'overdue');
create type public.manual_payment_status as enum ('pending_verification', 'verified', 'rejected', 'reversed');
create type public.wallet_kind as enum ('main_cash', 'property_installment');
create type public.financial_account_kind as enum ('asset', 'liability', 'revenue', 'expense', 'equity');
create type public.journal_status as enum ('draft', 'posted');
create type public.financial_origin as enum ('manual', 'system', 'worker');
create type public.compensation_rule_kind as enum ('direct_referral', 'binary_matching', 'monthly_incentive');
create type public.compensation_status as enum ('pending', 'credited', 'reversed', 'skipped');
create type public.notification_delivery_status as enum ('in_app', 'provider_pending', 'sent', 'failed');
create type public.worker_run_status as enum ('running', 'completed', 'failed');
create type public.reconciliation_status as enum ('clean', 'discrepancy');

create table public.payment_methods (
  code text primary key,
  display_name text not null,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint payment_method_code_format check (code ~ '^[a-z][a-z0-9_]{1,31}$'),
  constraint payment_method_name_length check (char_length(trim(display_name)) between 2 and 60)
);

insert into public.payment_methods (code, display_name, sort_order) values
  ('bank_transfer', 'Bank Transfer', 10), ('cash', 'Cash', 20),
  ('cheque', 'Cheque', 30), ('upi', 'UPI', 40), ('other', 'Other', 50);

create table public.payment_plan_definitions (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  version integer not null,
  name text not null,
  installment_count integer not null,
  annual_rate numeric(9,6),
  minimum_down_payment_rate numeric(9,6),
  configured boolean not null default false,
  active boolean not null default false,
  effective_from timestamptz,
  effective_to timestamptz,
  created_by uuid references public.profiles(user_id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint payment_plan_code_format check (code ~ '^[a-z][a-z0-9_]{2,31}$'),
  constraint payment_plan_term_supported check (installment_count in (12,24,36)),
  constraint payment_plan_rate_valid check (annual_rate is null or annual_rate between 0 and 1),
  constraint payment_plan_down_payment_valid check (minimum_down_payment_rate is null or minimum_down_payment_rate between 0 and 1),
  constraint payment_plan_effective_range check (effective_to is null or effective_from is null or effective_to > effective_from),
  unique (code, version)
);

insert into public.payment_plan_definitions (code, version, name, installment_count)
values ('term_12',1,'12-month plan',12), ('term_24',1,'24-month plan',24), ('term_36',1,'36-month plan',36);

create table public.property_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete restrict,
  project_id uuid not null references public.real_estate_projects(id) on delete restrict,
  plot_id uuid not null references public.plots(id) on delete restrict,
  payment_plan_id uuid not null references public.payment_plan_definitions(id) on delete restrict,
  status public.purchase_status not null default 'active',
  currency char(3) not null default 'INR',
  purchase_amount numeric(18,2) not null,
  down_payment_amount numeric(18,2) not null,
  financed_amount numeric(18,2) not null,
  finance_charge numeric(18,2) not null default 0,
  total_payable numeric(18,2) not null,
  start_date date not null,
  idempotency_key text not null unique,
  created_by uuid not null references public.profiles(user_id) on delete restrict,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint purchase_currency_inr check (currency = 'INR'),
  constraint purchase_amounts_valid check (purchase_amount > 0 and down_payment_amount >= 0 and financed_amount >= 0 and finance_charge >= 0 and total_payable > 0 and purchase_amount = down_payment_amount + financed_amount and total_payable = purchase_amount + finance_charge),
  constraint purchase_idempotency_length check (char_length(idempotency_key) between 8 and 120),
  unique (plot_id)
);

create table public.installments (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid not null references public.property_purchases(id) on delete restrict,
  installment_number integer not null,
  due_date date not null,
  principal_amount numeric(18,2) not null,
  finance_amount numeric(18,2) not null default 0,
  total_due numeric(18,2) not null,
  amount_paid numeric(18,2) not null default 0,
  status public.installment_status not null default 'scheduled',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint installment_number_positive check (installment_number > 0),
  constraint installment_amounts_valid check (principal_amount >= 0 and finance_amount >= 0 and total_due = principal_amount + finance_amount and amount_paid between 0 and total_due),
  unique (purchase_id, installment_number)
);

create table public.manual_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete restrict,
  purchase_id uuid not null references public.property_purchases(id) on delete restrict,
  installment_id uuid references public.installments(id) on delete restrict,
  amount numeric(18,2) not null check (amount > 0),
  currency char(3) not null default 'INR' check (currency = 'INR'),
  payment_method_code text not null references public.payment_methods(code) on delete restrict,
  manual_reference text,
  payment_date date not null,
  notes text,
  status public.manual_payment_status not null default 'pending_verification',
  idempotency_key text not null unique,
  entered_by uuid not null references public.profiles(user_id) on delete restrict,
  verified_by uuid references public.profiles(user_id) on delete restrict,
  verified_at timestamptz,
  rejected_by uuid references public.profiles(user_id) on delete restrict,
  rejected_at timestamptz,
  rejection_reason text,
  reversed_by uuid references public.profiles(user_id) on delete restrict,
  reversed_at timestamptz,
  reversal_reason text,
  created_at timestamptz not null default now(),
  constraint manual_reference_length check (manual_reference is null or char_length(trim(manual_reference)) between 2 and 120),
  constraint manual_notes_length check (notes is null or char_length(notes) <= 1000),
  constraint manual_payment_idempotency_length check (char_length(idempotency_key) between 8 and 120),
  constraint manual_payment_state_integrity check (
    (status = 'pending_verification' and verified_by is null and rejected_by is null and reversed_by is null)
    or (status = 'verified' and verified_by is not null and verified_at is not null and rejected_by is null and reversed_by is null)
    or (status = 'rejected' and rejected_by is not null and rejected_at is not null and rejection_reason is not null and verified_by is null and reversed_by is null)
    or (status = 'reversed' and verified_by is not null and verified_at is not null and reversed_by is not null and reversed_at is not null and reversal_reason is not null)
  )
);

create table public.payment_allocations (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.manual_payments(id) on delete restrict,
  installment_id uuid not null references public.installments(id) on delete restrict,
  amount numeric(18,2) not null check (amount > 0),
  reversed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (payment_id, installment_id)
);

create table public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete restrict,
  kind public.wallet_kind not null,
  currency char(3) not null default 'INR' check (currency = 'INR'),
  created_at timestamptz not null default now(),
  unique (user_id, kind)
);

create table public.financial_accounts (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  kind public.financial_account_kind not null,
  currency char(3) not null default 'INR' check (currency = 'INR'),
  wallet_id uuid unique references public.wallets(id) on delete restrict,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint account_code_format check (code ~ '^[A-Z][A-Z0-9:_-]{2,79}$')
);

create table public.financial_journals (
  id uuid primary key default gen_random_uuid(),
  transaction_type text not null,
  status public.journal_status not null default 'draft',
  currency char(3) not null default 'INR' check (currency = 'INR'),
  description text not null,
  reference_type text not null,
  reference_id uuid,
  origin public.financial_origin not null,
  actor_user_id uuid references public.profiles(user_id) on delete restrict,
  idempotency_key text not null unique,
  reverses_journal_id uuid unique references public.financial_journals(id) on delete restrict,
  created_at timestamptz not null default now(),
  posted_at timestamptz,
  constraint journal_type_format check (transaction_type ~ '^[a-z][a-z0-9_]{2,49}$'),
  constraint journal_reference_format check (reference_type ~ '^[a-z][a-z0-9_]{2,49}$'),
  constraint journal_idempotency_length check (char_length(idempotency_key) between 8 and 160),
  constraint journal_posted_state check ((status='draft' and posted_at is null) or (status='posted' and posted_at is not null))
);

create table public.financial_entries (
  id uuid primary key default gen_random_uuid(),
  journal_id uuid not null references public.financial_journals(id) on delete restrict,
  account_id uuid not null references public.financial_accounts(id) on delete restrict,
  debit numeric(18,2),
  credit numeric(18,2),
  memo text,
  created_at timestamptz not null default now(),
  constraint entry_one_side check ((debit is not null and debit > 0 and credit is null) or (credit is not null and credit > 0 and debit is null))
);

create table public.compensation_rules (
  id uuid primary key default gen_random_uuid(),
  kind public.compensation_rule_kind not null,
  version integer not null check (version > 0),
  name text not null,
  parameters jsonb not null default '{}'::jsonb check (jsonb_typeof(parameters)='object'),
  configured boolean not null default false,
  active boolean not null default false,
  effective_from timestamptz,
  effective_to timestamptz,
  created_by uuid references public.profiles(user_id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (kind, version),
  constraint compensation_effective_range check (effective_to is null or effective_from is null or effective_to > effective_from)
);

create table public.direct_commissions (
  id uuid primary key default gen_random_uuid(),
  beneficiary_user_id uuid not null references public.profiles(user_id) on delete restrict,
  referred_user_id uuid not null references public.profiles(user_id) on delete restrict,
  purchase_id uuid not null unique references public.property_purchases(id) on delete restrict,
  qualifying_amount numeric(18,2) not null check (qualifying_amount > 0),
  rate numeric(9,6) not null check (rate between 0 and 1),
  amount numeric(18,2) not null check (amount >= 0),
  rule_id uuid not null references public.compensation_rules(id) on delete restrict,
  rule_version integer not null,
  calculation_inputs jsonb not null check (jsonb_typeof(calculation_inputs)='object'),
  journal_id uuid unique references public.financial_journals(id) on delete restrict,
  status public.compensation_status not null,
  created_at timestamptz not null default now()
);

create table public.business_volume_events (
  id uuid primary key default gen_random_uuid(),
  beneficiary_user_id uuid not null references public.profiles(user_id) on delete restrict,
  source_user_id uuid not null references public.profiles(user_id) on delete restrict,
  source_payment_id uuid not null references public.manual_payments(id) on delete restrict,
  source_purchase_id uuid not null references public.property_purchases(id) on delete restrict,
  network_side public.network_leg not null,
  volume numeric(18,2) not null check (volume > 0),
  effective_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (beneficiary_user_id, source_payment_id)
);

create table public.binary_compensation_cycles (
  id uuid primary key default gen_random_uuid(),
  cycle_key text not null unique,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  rule_id uuid not null references public.compensation_rules(id) on delete restrict,
  rule_version integer not null,
  status public.worker_run_status not null default 'running',
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint binary_cycle_range check (ends_at > starts_at)
);

create table public.binary_compensation_results (
  id uuid primary key default gen_random_uuid(),
  cycle_id uuid not null references public.binary_compensation_cycles(id) on delete restrict,
  user_id uuid not null references public.profiles(user_id) on delete restrict,
  opening_left numeric(18,2) not null default 0,
  opening_right numeric(18,2) not null default 0,
  new_left numeric(18,2) not null default 0,
  new_right numeric(18,2) not null default 0,
  matched_left numeric(18,2) not null default 0,
  matched_right numeric(18,2) not null default 0,
  commission_rate numeric(9,6) not null,
  commission_amount numeric(18,2) not null,
  closing_left numeric(18,2) not null,
  closing_right numeric(18,2) not null,
  calculation_inputs jsonb not null check (jsonb_typeof(calculation_inputs)='object'),
  journal_id uuid unique references public.financial_journals(id) on delete restrict,
  status public.compensation_status not null,
  created_at timestamptz not null default now(),
  unique (cycle_id, user_id),
  constraint binary_values_nonnegative check (opening_left>=0 and opening_right>=0 and new_left>=0 and new_right>=0 and matched_left>=0 and matched_right>=0 and commission_amount>=0 and closing_left>=0 and closing_right>=0)
);

create table public.monthly_incentive_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete restrict,
  period_start date not null,
  rule_id uuid not null references public.compensation_rules(id) on delete restrict,
  rule_version integer not null,
  qualifying_volume numeric(18,2) not null default 0,
  consecutive_months integer not null default 0,
  amount numeric(18,2) not null default 0,
  calculation_inputs jsonb not null check (jsonb_typeof(calculation_inputs)='object'),
  journal_id uuid unique references public.financial_journals(id) on delete restrict,
  status public.compensation_status not null,
  created_at timestamptz not null default now(),
  unique (user_id, period_start, rule_id)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_user_id uuid not null references public.profiles(user_id) on delete restrict,
  type text not null check (type ~ '^[a-z][a-z0-9_.]{2,59}$'),
  title text not null,
  message text not null,
  reference_type text,
  reference_id uuid,
  idempotency_key text not null unique,
  read_at timestamptz,
  delivery_status public.notification_delivery_status not null default 'in_app',
  created_at timestamptz not null default now()
);

create table public.financial_worker_runs (
  id uuid primary key default gen_random_uuid(),
  job_name text not null,
  run_key text not null,
  status public.worker_run_status not null,
  attempts integer not null default 1,
  details jsonb not null default '{}'::jsonb check (jsonb_typeof(details)='object'),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (job_name, run_key)
);

create table public.financial_reconciliation_runs (
  id uuid primary key default gen_random_uuid(),
  run_key text not null unique,
  status public.reconciliation_status not null,
  totals jsonb not null check (jsonb_typeof(totals)='object'),
  findings jsonb not null check (jsonb_typeof(findings)='array'),
  created_at timestamptz not null default now()
);

create index purchases_user_idx on public.property_purchases(user_id, created_at desc);
create index installments_purchase_due_idx on public.installments(purchase_id, due_date, installment_number);
create index manual_payments_user_idx on public.manual_payments(user_id, created_at desc);
create index manual_payments_review_idx on public.manual_payments(status, created_at);
create index payment_allocations_installment_idx on public.payment_allocations(installment_id) where reversed_at is null;
create index entries_account_idx on public.financial_entries(account_id, created_at desc);
create index journals_reference_idx on public.financial_journals(reference_type, reference_id);
create index volume_beneficiary_period_idx on public.business_volume_events(beneficiary_user_id, effective_at, network_side);
create index notifications_recipient_idx on public.notifications(recipient_user_id, read_at, created_at desc);

create trigger installments_set_updated_at before update on public.installments
for each row execute function public.set_updated_at();

commit;
