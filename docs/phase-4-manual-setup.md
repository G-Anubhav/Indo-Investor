# Phase 4 Manual Setup

## Supabase

1. Back up the target database and confirm the CLI is linked to the intended project.
2. Run `npx.cmd supabase db push`. Confirm migrations `202609010001` through `202609010004` are recorded.
3. Create a strong random Vault secret named `kyc_data_encryption_key` if absent. Do this in SQL Editor or CLI without printing/committing its value: `select vault.create_secret('<random-32+-character-secret>','kyc_data_encryption_key','KYC field encryption');`.
4. Confirm Storage bucket `kyc-private` is private, limited to 5 MiB, and allows only PDF/JPEG/PNG. Do not add public/authenticated Storage policies.
5. Confirm `phase4-security-state-cleanup` exists in `cron.job` and monitor failures.
6. In Auth security settings, enable leaked-password protection before production. Review password policy, CAPTCHA, rate limits, token lifetimes, and MFA for executives.
7. Configure exact Site URL and redirect allowlist. Remove stale preview/local URLs from production.

## Environment

| Variable | Classification | Source |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser-safe | Supabase Project Settings/API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser-safe with RLS | Supabase Project Settings/API |
| `NEXT_PUBLIC_SITE_URL` | Browser-safe | Deployment URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only critical secret | Supabase Project Settings/API |

Keep the service-role key only in `.env.local` and encrypted deployment secrets. Never prefix it with `NEXT_PUBLIC_`. Vault encryption material is database-managed and is not an application environment variable.

## Development Verification

```powershell
npm.cmd install
npx.cmd supabase db push --dry-run
npx.cmd supabase db push
npm.cmd run lint
npm.cmd test
npm.cmd run test:hosted
npm.cmd run test:financial-hosted
npm.cmd run test:kyc-hosted
npx.cmd supabase db query --linked --file supabase/tests/phase_4_kyc_security.test.sql
npm.cmd run test:kyc-load
npm.cmd run build
npm.cmd run dev
```

The hosted KYC test creates clearly named `.example.test` development users and must never target production. Local `npm run test:db` additionally requires Docker and `supabase start`.

## Production Operations

- Obtain legal approval for collection/consent, evidence standards, retention/deletion, privacy requests, KYC expiry, and Aadhaar/PAN handling.
- Assign reviewers through a controlled role-approval process; require executive MFA and define maker-checker/escalation rules.
- Add malware scanning/quarantine before production document intake.
- Store/rotate/monitor the service-role key and Vault key under an approved secret-management and recovery process.
- Configure alerts for failed review access, excessive rate limits, Storage growth, audit growth, cron failures, and unusual executive activity.
- Verify CSP and all response headers at the deployed edge. Run disposable-environment RLS and object-guessing tests after deployment.
- Keep `ALLOW_DEV_SEED=false`; do not configure development test credentials in production.
