# Final Production Smoke Test

Use approved production-safe test identities after deployment. Record operator, UTC time, release SHA, Supabase project ref, result, evidence link and incident reference. Never seed, load test, race inventory, post fake money, reverse transactions, or upload fake KYC evidence in production.

## Authentication
- [ ] Login and logout invalidate/refresh the expected session.
- [ ] Password recovery reaches the exact HTTPS callback through production SMTP.
- [ ] A privileged AAL1 account is denied and directed to MFA; enrolled TOTP reaches AAL2.
- [ ] Affiliate authentication does not require privileged MFA policy.

## Affiliate
- [ ] Dashboard loads the authenticated profile.
- [ ] Network tree, temporary root, referrals and filtered index return only permitted downline.
- [ ] Projects and plot status load; Realtime refresh/revalidation works without mutating inventory.
- [ ] Wallets, earnings and property-payment history are ledger-backed and user-scoped.
- [ ] KYC history/status loads; no unscanned document becomes submittable/viewable.

## Executive/Admin
- [ ] Direct `/admin`, financial and KYC URLs require active server role plus AAL2.
- [ ] Approved existing manual payment can be reviewed without creating test postings.
- [ ] Financial review/reconciliation is readable and journals balance.
- [ ] Approved existing clean KYC document gets a short-lived audited link; self/cross-role access fails.
- [ ] Service-only RPCs remain unavailable to browser roles.

## Security And Operations
- [ ] Unauthenticated portal, affiliate-to-admin, cross-user profile/network/financial and direct Storage access fail.
- [ ] Withdrawal eligibility remains KYC-gated; no withdrawal transaction exists.
- [ ] `/api/health` is healthy and discloses no secrets/config details.
- [ ] Cron, monitoring, audit and alert delivery show expected current evidence.

Overall result: **NOT PERFORMED**. Production environment and release evidence were not available during the 2026-09-01 engineering pass.
