# Phase 4 Plan

## Scope

Phase 4 adds manual KYC document submission/review, compliance eligibility gates, private document storage, application-wide security review and hardening, and repeatable performance testing. Phases 1-3 remain authoritative. No automated KYC vendor, payment gateway, withdrawal processor, bank API, or deed workflow is introduced.

## KYC Architecture

- PostgreSQL stores versioned KYC submissions, encrypted sensitive fields, document metadata, review events, upload intents, and audit references.
- Supabase Vault stores the database encryption secret. `pgcrypto` encrypts PAN, bank-account number, IFSC, and account-holder values before persistence. The browser never receives ciphertext or controls KYC status.
- Affiliates use validated Next.js Server Actions. Database security-definer RPCs revalidate identity, ownership, state, rate limits, and allowed transitions.
- Executives/admins use a server-protected review queue and detail view. Review actions are authorized again in PostgreSQL.

## Document Storage Architecture

- Create one private `kyc-private` Supabase Storage bucket with a 5 MiB object limit and PDF/JPEG/PNG MIME allowlist.
- Object keys are generated server-side as `<user UUID>/<submission UUID>/<document type>/<random UUID>.<detected extension>`.
- Uploads pass through a Server Action that checks size, extension, declared MIME, binary magic bytes, SHA-256, authenticated ownership, and a short-lived database upload intent.
- Authenticated browser roles have no Storage policies. A server-only client uploads only after file inspection and an authenticated, short-lived database intent; review downloads use two-minute signed URLs after an audited executive RPC.
- Documents are never public. Review links are short-lived signed URLs and document access is audited.

## KYC State Machine

- `draft` -> `pending_review` after all required fields and PAN/Aadhaar/bank documents exist.
- `pending_review` -> `approved`, `rejected`, or `resubmission_required` by an active executive/admin.
- A rejected/resubmission-required version is immutable. The affiliate starts a new incremented draft and uploads a new evidence set.
- Approved submissions remain historical and immutable. No ordinary user can alter status, reviewer, version, or review history.

## Administrative Review Model

- `/admin/kyc` provides server-side pagination, bounded search, and status filtering.
- `/admin/kyc/[id]` displays masked identifiers by default, document metadata, signed review links, prior versions, and review history.
- Explicit sensitive-value reveal is a separate executive-only Server Action/RPC and writes an audit event.
- Approve/reject/resubmission decisions require a bounded note/reason and create immutable review and security-audit records.

## Sensitive Data Security

- Full PAN, bank account, IFSC, and account-holder values are encrypted with a Vault-managed key. Aadhaar storage is minimized to encrypted last four digits plus the private document.
- Normal user/admin listings show only masks. Sensitive values never enter URLs, analytics, logs, error messages, or public metadata.
- The encryption key is not a browser or Next.js environment variable. Missing Vault configuration fails KYC writes/reveals closed.

## Authorization And RLS

- Affiliates can read only their own submission/document metadata and review events; direct table writes are revoked.
- Executives/admins can read review records and private documents, but all decisions use role-checking RPCs.
- Storage has no direct browser access. Document metadata follows owner/executive RLS, while object access is mediated by the server and an executive-only audited RPC.
- A full catalog audit verifies forced RLS and grants across Phases 1-4. Any overly broad access is corrected through new migrations.
- Middleware is expanded to cover all authenticated financial and KYC routes while protected layouts remain the final route authority.

## Withdrawal And Deed Eligibility

- `can_withdraw(user_id)` and `can_finalize_deed(user_id)` are stable server/database predicates based on the latest approved KYC version and active account status.
- Browser roles may check only their own eligibility; trusted server/financial code can check a target user. No withdrawal or deed mutation is implemented.
- Wallet copy states that balances are not automatically withdrawable and that future withdrawals require approved KYC.

## Audit Model

- `kyc_review_events` preserves submitted, reviewed, rejected, resubmission, access, and replacement events with actor, target, version, outcome, reference, and non-sensitive metadata.
- Selected events are mirrored to the Phase 1 `security_audit_log`. No PAN, Aadhaar, account number, document content, signed URL, or encryption material is recorded.
- Role governance remains a controlled service/admin operation and requires business approval; Phase 4 documents rather than invents that process.

## Rate Limits And Request Security

- A database-backed fixed-window limiter protects draft saves, upload intents, submissions, sensitive reveals, and review decisions. It is shared across application instances.
- Next.js Server Actions retain same-origin protection; upload and decision actions additionally validate authenticated context and database authorization.
- Search, filters, notes, identifiers, pagination, MIME, size, and binary signatures are bounded server-side.

## Security Hardening

- Add CSP, HSTS, MIME sniffing protection, strict referrer policy, frame denial, and a restricted Permissions Policy through Next.js headers.
- Re-audit session refresh, logout, recovery, redirects, role changes, service-role usage, error mapping, dependencies, Security Definer search paths, grants, storage, and financial RPC authority.
- Test direct route, RPC, table, and Storage access to cover IDOR, privilege escalation, forged decisions, object guessing, and malformed uploads.

## Performance And Load Testing

- Database-side transactional fixtures exercise a 1,000-node network, 1,000-plot project, large ledger sample, and 1,000-row KYC queue without persisting data.
- A hosted JavaScript harness measures p50/p95/error rate under bounded concurrent reads for network, inventory, financial, and KYC queries.
- Engineering targets, not FRD/business SLAs: p95 under 1.5 seconds for focused/paginated reads at concurrency 10 and error rate below 1% in the hosted development environment.
- Record dataset, infrastructure limitation, query plans, browser/build observations, and all measured results in `docs/phase-4-performance.md`.

## Production Checklist

- Apply migrations after backup, configure the Vault encryption secret, verify the private bucket/policies, and configure exact Auth/redirect origins.
- Confirm production headers at the edge, MFA/CAPTCHA/rate-limit settings, audit retention/monitoring, backups, cron health, secrets, and `ALLOW_DEV_SEED=false`.
- Assign approved reviewers and document retention, incident response, privacy/legal, KYC expiry, role governance, and emergency-access policies.

## Migration Strategy

- Add Phase 4 migrations after `202608300012`; never edit deployed Phase 1-3 migrations.
- Separate the core KYC schema/functions from Storage policies and any audit remediation where deployment ordering benefits review.
- Keep migrations reproducible and hosted-project compatible. Development KYC fixtures remain guarded and clearly labeled.

## Unresolved Decisions

- KYC expiry/renewal, reviewer hierarchy, maker-checker separation, document retention/deletion, legal consent text, privacy rights, incident response SLA, emergency access, production role governance, and automated verification vendor require business/legal approval.
- PAN/Aadhaar handling must be reviewed by qualified Indian legal/compliance counsel before production. The implementation minimizes and protects data but makes no legal-compliance claim.
- Actual withdrawals, payout settlement, deed finalization, and KYC-dependent clawback behavior remain outside this phase.
