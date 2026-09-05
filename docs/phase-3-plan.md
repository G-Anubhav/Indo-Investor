# Phase 3 Plan

## Scope

Phase 3 adds manual property payments, installment schedules, isolated wallets, immutable double-entry accounting, configurable compensation, scheduled workers, reconciliation, notifications, and user/executive financial interfaces. The existing Phase 1 identity/session/RLS architecture and Phase 2 genealogy/inventory architecture remain authoritative. No payment gateway, KYC, withdrawal settlement, bank verification, document vault, or helpdesk is included.

## Financial Architecture

- PostgreSQL is the source of truth for purchases, installments, payments, wallets, journals, volume, compensation, and reconciliation.
- Browser code reads RLS-filtered views/tables and invokes narrowly granted security-definer functions. It never supplies calculated balances, commissions, rule outputs, or ledger entries.
- All money uses INR `numeric(18,2)`. Rates use `numeric(9,6)`. Calculations round to two decimal places with PostgreSQL `round(..., 2)`; schedule residuals are assigned to the final installment.
- Posted journals contain immutable debit/credit entries and must balance before posting. Corrections create linked reversals; historical rows are never edited.

## Manual Payment Architecture

- Executives/admins record a payment in `pending_verification`; the entry records payer, purchase, optional installment, date, method, reference, notes, actor, and idempotency key.
- A different or same authorized executive may verify or reject according to the current operational policy; all actors and timestamps remain explicit. Affiliates cannot record or verify payments.
- Verification locks the payment, purchase, and applicable installments, allocates no more than the purchase balance, creates a balanced receipt journal, updates allocations, and records audit/notification rows in one transaction.
- Verified payments cannot be edited. Reversal creates a reversing journal and reverses allocations atomically.

## Property Payment Architecture

- `property_purchases` links a user, Phase 2 project, and plot to a contractual amount and configured payment-plan version.
- `payment_plan_definitions` versions the supported 12/24/36-month structures without inventing interest rates or down-payment policy. A plan must be active and marked configured before use.
- A privileged purchase function validates the held/available plot, contractual values, and plan, then creates a deterministic installment schedule. Full booking/payment provider behavior remains outside this phase.
- Payments allocate oldest due installment first unless a valid owned installment is selected. Allocation order is documented and database-controlled.

## Wallet Architecture

- Each profile receives exactly one Main Cash Wallet and one Property Installment Wallet in `wallets`.
- Wallet balances are derived from posted journal entries through an RLS-protected query function. No mutable client-controlled balance column exists.
- Wallet debits lock the wallet, calculate authoritative available balance, reject negative results, and post one balanced journal.
- Property Wallet may pay installments. Main Cash Wallet may pay property obligations. Cross-wallet transfers and withdrawals are not implemented.

## Double-Entry Ledger

- `financial_accounts` is the chart of accounts; user wallet accounts are linked one-to-one with wallets and platform clearing/expense accounts use stable codes.
- `financial_journals` stores transaction identity, reference, actor/system origin, currency, idempotency key, posting and reversal links.
- `financial_entries` stores positive debit or credit amounts with exactly one side populated.
- Only internal database functions may create/post journals. Deferred constraint triggers reject unbalanced posted journals. Triggers block update/delete of posted journals and entries.

## Compensation Architecture

- Versioned `compensation_rules` stores direct, binary, and monthly incentive parameters as JSON plus activation windows and a mandatory configured flag.
- Direct referral commission originates only from an authoritative verified down-payment allocation, uses the sponsor in `network_nodes`, records source/rule/inputs, and credits Main Cash Wallet once.
- `business_volume_events` records immutable, traceable volume from verified property payments and the ancestor leg at event time.
- Binary workers aggregate unprocessed volume by cycle, lock a cycle/advisory key, apply the configured ratio/rate/cap, write opening/new/matched/closing carry-forward, and credit Main Cash Wallet once.
- Monthly incentive workers evaluate configured thresholds and consecutive-month requirements, record qualification inputs, and credit Property Installment Wallet once.

## Idempotency And Transactions

- Every externally retryable mutation requires a bounded idempotency key with a unique database constraint.
- Payment verification, wallet use, commissions, incentives, cycle processing, reminders, and reconciliation run inside PostgreSQL transactions.
- Row locks protect payments, purchases, installments, and wallets. PostgreSQL advisory transaction locks serialize each compensation period.
- Duplicate calls return the existing result or a stable conflict; they never duplicate money.

## Scheduled Workers

- `pg_cron` invokes database functions for daily installment reminders, daily reconciliation snapshots, recurring binary cycles, and monthly incentive evaluation.
- Workers are idempotent and write `financial_worker_runs` with status, attempts, timestamps, and error-safe diagnostics.
- No payment-provider webhook or callback worker exists.

## Reconciliation

- Database functions compare journal debit/credit totals, wallet-account balances, verified-payment allocations, installment balances, commissions, incentives, and their journal links.
- `financial_reconciliation_runs` and findings make discrepancies visible. Findings are not silently repaired; operators use reversal/adjustment workflows.

## Security

- All Phase 3 tables use forced RLS. Affiliates can read only their own financial records; executives/admins can read operational records.
- Direct table writes are revoked from browser roles. Financial mutations are available only through authenticated, role-checking security-definer RPCs.
- Posted journal immutability, controlled payment transitions, database-derived values, ownership checks, and unique keys defend against IDOR, privilege escalation, duplicate posting, and forged balances.
- Service-role credentials remain server-only and are used only by guarded development seed/testing or trusted operations.

## UI Architecture

- Add `/wallets`, `/earnings`, and `/property-payments` for affiliate financial visibility.
- Add `/admin/financials`, `/admin/financials/payments`, `/admin/financials/compensation`, and `/admin/financials/reconciliation` for authorized operations.
- Server Components load paginated, RLS-filtered data. Server Actions validate bounded form input and call database RPCs.
- Reuse the Inter/neumorphic portal shell with responsive tables, status indicators, confirmation dialogs, loading/empty/error states, and no fabricated values.

## Testing Strategy

- JavaScript unit tests cover financial input validation, deterministic installment math, presentation, state transitions, and error mapping.
- Hosted integration tests cover authenticated reads, role boundaries, manual payment lifecycle, wallet debit concurrency, idempotency, compensation worker retries, and regressions.
- pgTAP verifies schema constraints, RLS, journal balancing/immutability, payments, installments, wallets, compensation, reversals, and duplicate protection.
- Verification includes lint, all JavaScript tests, hosted integration, hosted pgTAP, database lint, migration history, production build, and dependency audit.

## Migration Strategy

- Add ordered Phase 3 migrations after `202608300005`; never edit Phase 1/2 migrations.
- The primary migration creates types, tables, indexes, triggers, RLS, RPCs, realtime-independent workers, and cron jobs.
- Any lint or deployment correction is a subsequent migration, preserving hosted history.
- Extend guarded seed tooling only for the explicitly named hosted development dataset.

## Unresolved Business Decisions

- Direct-referral rate, qualifying down-payment definition, binary ratio/rate/cap/cycle/minimums, monthly thresholds/amounts/consecutive months, payment-plan interest rates, minimum down payment, late-payment rules, and exceptional allocation rules require business approval.
- Rules remain inactive/unconfigured until approved. Production workers refuse to calculate from incomplete rule versions.
- Whether payment entry and verification require two different operators is not specified. The schema records both and can enforce maker-checker separation once approved.
- Withdrawal semantics, tax withholding, legal accounting classification, external notification provider, and gateway integration remain future decisions.
