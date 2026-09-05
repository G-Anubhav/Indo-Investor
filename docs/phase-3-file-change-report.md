# Phase 3 File Change Report

## Files Created

- `docs/phase-3-plan.md`: architecture and implementation plan.
- `docs/phase-3-requirements-matrix.md`: FRD traceability.
- `docs/phase-3-manual-setup.md`: hosted setup and operations.
- `docs/financial-accounting-model.md`: accounts, journals, wallets, reversals, reconciliation.
- `docs/compensation-rules.md`: rule inputs, versions, and unresolved values.
- `supabase/migrations/202608300006_phase_3_financial_schema.sql`: Phase 3 types/tables/indexes.
- `supabase/migrations/202608300007_phase_3_financial_operations.sql`: accounting/payment/purchase functions.
- `supabase/migrations/202608300008_phase_3_compensation_security_and_jobs.sql`: rules, workers, RLS, grants, cron.
- `supabase/migrations/202608300009_phase_3_function_lint_fixes.sql`: deployed function ambiguity corrections.
- `supabase/migrations/202608300010_phase_3_purchase_function_lint_fix.sql`: purchase function lint correction.
- `supabase/migrations/202608300011_phase_3_wallet_payment_idempotency.sql`: retry-safe wallet allocation.
- `supabase/migrations/202608300012_phase_3_reversal_and_reconciliation.sql`: reversal propagation and reconciliation coverage.
- `supabase/tests/phase_3_financials.test.sql`: 36 hosted pgTAP financial/RLS assertions.
- `tests/phase3-presentation.test.mjs`: financial validation/presentation tests.
- `tests/integration/phase3-hosted.mjs`: hosted concurrency, idempotency, compensation, and worker checks.
- `src/lib/phase3/translations.js`: Phase 3 UI dictionaries.
- `src/lib/phase3/presentation.mjs`: validated financial presentation helpers.
- `src/lib/phase3/queries.js`: RLS-backed server reads.
- `src/app/actions/phase3.js`: validated executive financial Server Actions.
- `src/components/Financial/Financial.module.css`: responsive portal financial UI.
- `src/app/(portal)/wallets/page.js`: dual-wallet view.
- `src/app/(portal)/earnings/page.js`: compensation view.
- `src/app/(portal)/property-payments/page.js`: purchase/installment/payment view.
- `src/app/(portal)/admin/financials/page.js`: executive payment operations.

## Files Modified

- `AGENTS.md`: Phase 3 engineering boundary and financial authority rules.
- `package.json`: hosted financial test command.
- `src/app/(portal)/layout.js`: Phase 3 dictionary injection.
- `src/components/PortalShell/PortalShell.jsx`: financial navigation.
- `src/app/(portal)/admin/page.js`: financial operations entry.
- `scripts/seed-dev-users.mjs`: guarded Phase 3 financial demo generation.
- `tests/access-control.test.mjs`: Phase 3 protected routes.
- `tests/integration/hosted-supabase.mjs`: Phase 3 RLS/access regression checks.
- `docs/requirements.md`, `docs/architecture.md`, `docs/database.md`, `docs/security.md`, `docs/testing.md`, `docs/implementation-status.md`: Phase 3 decisions and status.

## Files Deleted

None.

## Database Changes

Tables: `payment_methods`, `payment_plan_definitions`, `property_purchases`, `installments`, `manual_payments`, `payment_allocations`, `wallets`, `financial_accounts`, `financial_journals`, `financial_entries`, `compensation_rules`, `direct_commissions`, `business_volume_events`, `binary_compensation_cycles`, `binary_compensation_results`, `monthly_incentive_results`, `notifications`, `financial_worker_runs`, `financial_reconciliation_runs`.

Indexes enforce purchase/payment idempotency, one plot purchase, plan/rule versions, wallet identity, journal keys/reversals, compensation uniqueness, active volume queries, and paginated financial reads. Constraints enforce INR numeric money, valid states, installment totals, one-sided entries, and controlled rule/configuration values.

Functions/triggers cover wallet provisioning/balance, balanced posting/immutability, purchases/schedules, manual record/verify/reject/reverse, wallet top-up/payment, direct compensation, binary/monthly workers, reminders, reconciliation, audit propagation, and advisory locking. Every table forces RLS with own-user or executive read policies; browser mutation grants are revoked. Cron job: `phase3-daily-financial-maintenance`.

Development seed adds two demo purchases, schedules, verified/pending/rejected payments, wallets, journals, direct/binary/incentive results, carry-forward, and reconciliation using `DEVELOPMENT ONLY` rules.

## Dependencies Added

None. No payment gateway SDK or external financial dependency was added.
