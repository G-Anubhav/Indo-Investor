# Phase 3 Manual Setup

## Supabase

1. Back up the hosted database or create a Supabase branch.
2. Link the intended project and run `npx.cmd --yes supabase@2.116.0 db push --linked`.
3. Confirm migrations `202608300006` through `202608300012` are applied.
4. Confirm all Phase 3 tables have RLS enabled and the `phase3-daily-financial-maintenance` cron job exists.
5. Run `npx.cmd --yes supabase@2.116.0 db lint --linked --level warning` and the Phase 3 pgTAP file.

## Financial Rules

Before production calculations, an executive must create and activate approved rule versions through the privileged configuration functions or a reviewed migration:

- payment plan annual rate and minimum down-payment rate;
- direct commission percentage;
- binary left/right ratio, rate, cycle, cap, and minimum volume;
- monthly volume threshold, consecutive-month count, and award amount.

Do not promote the `DEVELOPMENT ONLY` seeded rules. Record approval, effective dates, tax/accounting treatment, and maker-checker policy outside the application before activation.

## Manual Payment Operations

1. An executive opens `/admin/financials`, selects the payer/purchase, and records method, amount, date, reference, and notes.
2. The payment remains Pending Verification and does not affect balances.
3. An executive verifies it; PostgreSQL locks the payment/installments and applies the oldest outstanding obligations or selected installment.
4. The same transaction posts a balanced receipt journal, audit event, notification, volume, and eligible direct commission.
5. Invalid entries are rejected before posting. Corrections use Reject before verification or Reverse after verification.
6. The operator verifies payment status, allocation, journal linkage, remaining installment balance, wallet/commission impact, and reconciliation findings.

## External Payment Gateway

No payment gateway is used in Phase 3.

## Notifications

Only in-app notification records are implemented. Select an email/SMS/WhatsApp provider, credentials, retry policy, consent rules, and delivery retention before claiming outbound delivery.

## Environment Variables

Runtime: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`.

Server/development only: `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_PROJECT_REF`, `SUPABASE_ENVIRONMENT`, `SUPABASE_SEED_CONFIRMATION`, `ALLOW_DEV_SEED`, `DEV_SEED_ADMIN_EMAIL`, `DEV_SEED_ADMIN_PASSWORD`, `DEV_SEED_AFFILIATE_EMAIL`, `DEV_SEED_AFFILIATE_PASSWORD`.

No payment gateway variables are required.

## Local Development

```powershell
npm.cmd install
npx.cmd --yes supabase@2.116.0 link --project-ref YOUR_PROJECT_REF
npx.cmd --yes supabase@2.116.0 db push --linked
$env:ALLOW_DEV_SEED='true'; npm.cmd run seed:dev
$env:ALLOW_DEV_SEED='false'
npm.cmd run dev
npm.cmd run check
npm.cmd test
npm.cmd run test:hosted
npm.cmd run test:financial-hosted
npx.cmd --yes supabase@2.116.0 db query --linked --file supabase/tests/phase_3_financials.test.sql
npm.cmd run build
```

The seed refuses production, mismatched project references, non-development environments, unconfirmed project IDs, weak passwords, and non-`example.test` identities.

## Production

- Apply migrations during a reviewed window and verify RLS/cron afterward.
- Configure only approved versioned financial rules; leave unknown rules inactive.
- Restrict service-role secrets to deployment/worker secret storage.
- Decide and enforce maker-checker separation, post-cycle clawbacks, tax/withholding, payout cadence, and operations alerting.
- Schedule binary/monthly service-only workers according to approved cycles. The migration schedules only daily reminders/reconciliation.
- Monitor cron history, worker failures, reconciliation discrepancies, negative balances after exceptional reversals, and audit retention.
- Run hosted RLS/concurrency tests against staging, never production identities.
