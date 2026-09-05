# Phase 3 Requirements Matrix

| Requirement | Implementation | Database Object | Test | Status / Assumption |
|---|---|---|---|---|
| Manual payment record/review | Executive UI and Server Actions | `manual_payments`, `admin_record_manual_payment` | pgTAP + hosted | Implemented |
| Verify/reject/reverse | Controlled RPC transitions | verify/reject/reverse functions | pgTAP | Implemented |
| Purchase/payment foundation | Plot-linked purchase and plan | `property_purchases` | pgTAP | Implemented |
| 12/24/36 schedules | Configured deterministic generation | `payment_plan_definitions`, `installments` | pgTAP totals | Implemented; production terms unresolved |
| Payment allocation | Oldest-due or selected installment | `payment_allocations` | pgTAP partial/idempotent | Implemented |
| Main Cash and Property wallets | Separate ledger-linked accounts | `wallets`, `financial_accounts` | pgTAP/hosted RLS | Implemented |
| Double entry | Balanced posted journals | `financial_journals`, `financial_entries` | pgTAP balance | Implemented |
| Financial immutability | Triggers plus no browser writes | immutable triggers | pgTAP | Implemented |
| Direct referral bonus | Verified down-payment qualification | `direct_commissions` | pgTAP configured rate/duplicate | Implemented |
| Binary matching | Rule-driven cycle and advisory lock | cycles/results, worker RPC | hosted seed/integration | Implemented |
| Carry-forward | Opening/new/matched/closing fields per cycle | `binary_compensation_results` | hosted integration | Implemented |
| Monthly incentives | Threshold/consecutive-month framework | `monthly_incentive_results` | hosted integration | Implemented |
| Rule versioning | Versioned JSON parameters and result snapshots | `compensation_rules` | pgTAP/hosted | Implemented |
| Worker idempotency/locking | Unique run keys and advisory locks | worker/cycle functions | hosted retry test | Implemented |
| Wallet/payment concurrency | Row locks and unique keys | wallet/payment functions | hosted simultaneous requests | Implemented |
| Reconciliation | Journal and installment comparisons | reconciliation runs/function | pgTAP/hosted | Implemented |
| Notifications/reminders | In-app records and daily generator | `notifications`, cron | pgTAP schema + hosted seed | Implemented; outbound provider deferred |
| Affiliate financial UI | Wallets, earnings, property payments | `/wallets`, `/earnings`, `/property-payments` | build | Implemented |
| Executive financial UI | Record/review/verify/reject/reverse | `/admin/financials` | build + RPC tests | Implemented |
| Financial RLS | Own rows or active executive | all Phase 3 policies/grants | pgTAP/hosted | Implemented |
| Guarded development data | Real journals/results via functions | seed extension | hosted seed/test | Implemented; development only |
| No payment gateway | No SDK, webhook, or gateway variables | N/A | dependency/code review | Satisfied |
| No Phase 4 functionality | KYC/withdrawal/helpdesk absent | N/A | scope review | Satisfied |
