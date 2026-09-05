# Production Manual Requirements

## Engineering Actions
- Deploy the reviewed release SHA to production-like staging, run every command in `testing.md`, scan built client assets for secrets, and resolve regressions.
- After production configuration, execute the non-destructive smoke checklist and archive evidence.

## Supabase Actions
- Create/link the isolated production project and apply all migrations through `202609010006`; verify no pending migrations, lint, pgTAP, RLS/grants, three cron jobs and `plots` Realtime.
- Set exact HTTPS Site URL/callback/recovery allowlist, remove localhost, configure custom SMTP/email confirmation, and enable leaked-password protection in Auth password security.
- Verify private `kyc-private`, create a unique production Vault encryption key, and test encryption/decryption without exposing key material.

## Security Actions
- Store unique service-role, SMTP, Vault and scanner secrets in deployment secret storage; test rotation/revocation and privileged incident response.
- Approve privileged TOTP enrollment/recovery, enroll every executive/admin, verify AAL1 denial and AAL2 access, review roles, and remove dormant/test accounts.

## KYC/Compliance Actions
- Connect a real scanner worker/provider and test clean/quarantine/failure/retry alerts.
- Approve evidence, reviewer/maker-checker, expiry, retention/deletion, privacy request, audit retention and incident policies.

## Financial/Business Actions
- Complete `production-financial-activation-checklist.md`; create versioned production rules/plans and activate only after four-eyes approval.
- Approve manual-payment operations, reconciliation ownership, clawbacks, caps/cycles, incentive and tax treatment.

## Operations Actions
- Configure monitoring/log drains/uptime/paging and test alert delivery.
- Configure DB backup/PITR and separate encrypted KYC Storage backup; select RPO/RTO and complete an isolated restore drill.
- Run representative staging load/soak and the production smoke test; record deployment, rollback, on-call and launch approval.

## Legal Approvals
- Obtain written KYC/privacy/retention/audit/incident and applicable financial/real-estate/tax approval. Engineering cannot provide legal approval.
