# Production Readiness Plan

## Objective

Move the completed Phase 1-4 implementation through an evidence-based launch gate without adding business functionality. Close engineering defects in code/migrations and classify remaining Supabase, operations, business, and legal dependencies explicitly.

## Audit Scope

- Reconcile the complete FRD with Phase 1-4 architecture and documentation.
- Enumerate routes, Server Actions, Route Handlers, database functions, tables, grants, RLS policies, Storage access, cron jobs, Realtime publication, environment variables, secrets, dependencies, logs, and error boundaries.
- Re-run Supabase advisors, database lint, pgTAP, hosted RLS/Auth/Storage/financial/concurrency suites, JavaScript tests, build, dependency audit, and non-production performance probes.

## Engineering Closure

1. Add a production-environment validator that fails protected/application operations closed when production URLs, service credentials, or seed settings are unsafe.
2. Add a safe public health endpoint backed by a service-only database health snapshot. It must disclose only `ok`/`degraded`, never configuration values or internal errors.
3. Add a database runtime configuration gate whose reproducible default is unconfigured and financially disabled. Production financial processing must require an explicitly activated production environment and approved production rule versions.
4. Add a malware-scanning lifecycle boundary to KYC documents. Newly uploaded evidence remains unavailable and unsubmittable until a trusted scanner worker records `clean`; quarantined/failed evidence is never reviewable. No scanner vendor will be invented.
5. Add audit coverage for profile role/status changes and operational configuration changes. Ordinary users retain no mutation rights.
6. Re-audit default function grants and RLS. Correct unintended grants through a new ordered migration only.
7. Add unit, hosted, adversarial, health/configuration, and database tests for all safeguards.

## External Configuration Review

- Supabase Auth: production Site URL/redirect allowlist, confirmation/recovery, leaked-password protection, CAPTCHA/rate limits, SMTP, executive MFA.
- Secrets: unique production anon/service credentials, Vault key provenance, rotation/revocation, deployment secret storage.
- Storage: private KYC bucket, no public objects/policies, signed-link expiry, scanner worker identity, quarantine operations.
- Jobs/Realtime: cron health, worker ownership, publication verification, alerting.
- Backup/recovery: database PITR/backups, Storage backup/export, Vault recovery, restore drill, RPO/RTO decisions.

## Financial Gate Strategy

- Preserve existing Phase 3 accounting behavior and immutable history.
- Introduce environment-labelled, version-preserving financial configuration and a database launch gate.
- Existing development examples remain development-labelled and cannot authorize production processing.
- Production enablement requires approved payment plans and compensation rules explicitly labelled `production`; values remain a business decision.

## MFA Strategy

Supabase supports MFA/AAL2, but the organization has not selected enrollment/recovery/maker-checker policy. Engineering will document and test the enforcement point; privileged production access remains blocked until executive/admin accounts are enrolled and AAL2 enforcement is enabled and verified. Affiliates are not forced into MFA without approved policy.

## Verification Strategy

- Use hosted development/staging only for destructive/concurrent/fixture tests.
- Use rollback-only scale fixtures for 1,000-node, plot, ledger, and KYC datasets.
- Verify production-safe defaults separately from development activation.
- Record exact commands, outcomes, limitations, and manual blockers in repository documentation.

## Launch Classification

- **Engineering ready:** code/build/tests/RLS/Storage/privileged functions/configuration gates pass with no critical unresolved engineering defect.
- **Security ready:** required external Auth/MFA/scanner/secrets/monitoring controls are configured and verified.
- **Operational ready:** monitoring, backup/restore, incident response, role governance, and deployment ownership are exercised.
- **Legal/compliance ready:** approved KYC/privacy/retention/evidence policies exist.

Overall production readiness is `NO` until every blocking row in `docs/production-readiness-matrix.md` is closed by its accountable owner.
