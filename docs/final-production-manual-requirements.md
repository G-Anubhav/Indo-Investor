# Final Production Manual Requirements

Codex cannot operate the production Supabase/dashboard, deployment secret manager, external scanner/monitor, organizational approvals, or legal process without access and authorized decisions.

### Developer Actions
- Deploy the exact verified revision to production-like staging; rerun all tests and secret-bundle scan.
- Apply migrations to production, verify route/RPC access, then execute and sign `final-production-smoke-test.md`.

### Supabase Actions
- Enable and verify leaked-password protection; configure exact production Auth URLs, SMTP and email confirmation.
- Apply/verify migrations, RLS/grants/indexes, private Storage, cron and Realtime.
- Create a unique production Vault key and perform a non-disclosing crypto/recovery check.

### Security Actions
- Configure unique production secrets in deployment storage and complete rotation/revocation testing.
- Enroll every privileged account in TOTP, prove AAL1 denial/AAL2 access, remove test users and approve role governance.

### Operations Actions
- Connect and test monitoring, paging, cron/database/KYC/financial alerts.
- Configure DB plus encrypted Storage backups, then pass an isolated restoration drill.
- Run production-equivalent staging load/soak and final production smoke tests.

### Business Approvals
- Approve every payment-plan and compensation value/version, maker-checker/reviewer hierarchy, access governance, RPO/RTO and operational owners.

### Legal/Compliance Approvals
- Approve KYC evidence/expiry, retention/deletion, privacy requests, audit retention, incidents and applicable tax/financial/real-estate obligations.

### External Provider Setup
- Select and connect a malware scanner worker/provider.
- Select monitoring/log/paging and separate encrypted KYC object-backup services where the deployment platform does not supply them.
