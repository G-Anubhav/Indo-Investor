# Production Launch Checklist

Statuses are evidence-based: Complete, Incomplete, External Dependency, Business Approval Required, or Legal Approval Required.

## Supabase
- Complete: migrations, forced RLS, constrained privileged RPC grants, cron and targeted Realtime are represented in repository migrations.
- Incomplete: apply to production, run lint/advisors/pgTAP, and verify Vault with a non-development key.

## Authentication
- Complete: server sessions, protected routes, recovery, safe redirects, and production privileged AAL2 gate.
- Incomplete: configure exact Site URL/redirects/SMTP, enable leaked-password protection, enroll privileged accounts, and verify recovery/email confirmation.

## Security
- Complete: fail-closed runtime checks, seed guard, security headers, audit foundations, grants/RLS tests.
- Incomplete: external penetration review, incident ownership, alerting and credential rotation drill.

## Storage
- Complete: private KYC bucket, bounded types/size, service-mediated signed access and direct-access tests.
- External Dependency: independent encrypted object backup and malware scanner.

## KYC
- Complete: scan state machine prevents unscanned submission/review and records scan events.
- External Dependency: scanner worker/provider. Legal Approval Required: evidence, retention, deletion and reviewer policy.

## Financial Rules
- Complete: immutable ledger, reconciliation, idempotency, environment-versioned rules and disabled-by-default production gate.
- Business Approval Required: all production rule values and activation evidence.

## Monitoring
- Complete: safe health endpoint/database snapshot and documented signals.
- External Dependency: monitoring/log drain/paging platform and tested alerts.

## Backups
- Incomplete: production DB/PITR verification, separate Storage backup and successful staging restore drill.

## Secrets
- Complete: public/server separation and production validation in code.
- Incomplete: deployment secret-store setup, unique production values, rotation/revocation procedures tested.

## Roles
- Complete: service-only role management, audit, privileged AAL2 enforcement.
- Business Approval Required: grants/revocation, maker-checker, emergency and periodic access-review policy.

## Performance
- Complete: bounded query design and development measurements.
- Incomplete: representative staging soak/capacity test; production-scale performance remains unverified.

## Testing
- Complete: repository, hosted, pgTAP, RLS/concurrency/security and build suites are available.
- Incomplete: repeat complete suite against production-like staging and execute non-destructive production smoke test.

## Legal/Compliance
- Legal Approval Required: privacy, retention, KYC evidence, audit retention, incident and tax/compensation treatment.

## Operations
- Incomplete: named owners, on-call/escalation, deployment approval, rollback and recovery drill.
