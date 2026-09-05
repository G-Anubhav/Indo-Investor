# Production Deployment Runbook

## Ordered Deployment

The public authentication pages can render before optional operational integrations are configured. A working login and protected portal require these deployment variables at build and runtime: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Signup and password-recovery links additionally require `NEXT_PUBLIC_SITE_URL` to be the exact public HTTPS origin. Add or change every `NEXT_PUBLIC_*` value before building, then redeploy; values added only after a static build may not be present in the browser bundle.

1. Create isolated production hosting and Supabase projects in the approved region; do not clone development data blindly.
2. Store unique production secrets in the deployment secret manager. Set `APP_ENVIRONMENT=production`, `SUPABASE_ENVIRONMENT=production`, and `ALLOW_DEV_SEED=false`; omit every `DEV_SEED_*` value.
3. Configure Supabase plan/region/backups, API restrictions, private network options if selected, Log Drains and operational owners.
4. Apply repository migrations in order with `supabase link --project-ref <production-ref>` and `supabase db push --linked`; inspect the target before confirming.
5. Run linked migration status, database lint/advisors, schema/grant review and every pgTAP suite.
6. Configure Auth Site URL as the exact HTTPS production origin; allow only required callback/recovery URLs; configure custom SMTP/email confirmation and leaked-password protection.
7. Verify `kyc-private` is private, limits/policies are correct, direct cross-user access fails, and object backup exists.
8. Create a distinct production Vault key using the approved key-management process; verify encrypt/decrypt without printing key material and document rotation/restore ownership.
9. Verify all three cron jobs, timezone/cadence, last-run monitoring and failure alerts.
10. Verify only `plots` is in Realtime publication and inventory reconnect/revalidation works.
11. Configure external health/error/database/Auth/Storage/cron/KYC/financial monitoring and test alerts.
12. Provision named privileged accounts through the service-only procedure, enroll MFA, test AAL2 enforcement, and record access approval.
13. Create approved production payment plans and compensation rule versions. Keep financial processing disabled until finance sign-off, then enable with `configure_platform_runtime` using the exact confirmation.
14. Connect and validate malware scanning; verify uploaded-to-scanning-to-clean/quarantined behavior. Record approved KYC/retention/reviewer rules.
15. Run `npm run seed:dev` once as a negative check: it must refuse production. Never seed production.
16. Deploy, verify `/api/health`, execute the smoke tests below, review logs/audit, then obtain engineering/security/operations/legal launch sign-offs.
17. Open traffic gradually, monitor error/latency/auth/KYC/financial signals, and retain rollback authority.

## Non-Destructive Smoke Test

- Authentication: approved test user login/logout/recovery and email delivery.
- Authorization: direct URLs for affiliate, executive/admin and denied cross-role access; privileged user must use MFA.
- Network: tree, referrals and filtered network index read.
- Inventory: project and available/hold/sold states read; do not race holds in production.
- Financial: wallet and payment history read; no fake posting/reversal.
- KYC: use an approved test tenant only if compliance permits; otherwise verify staging evidence and production authorization/read path without fake documents.
- Operations: health endpoint, cron last success, audit arrival, logs and alert delivery.

Rollback must disable traffic and mutable processing before application/schema rollback. Never reverse an irreversible migration or financial journal ad hoc; use reviewed forward remediation.
