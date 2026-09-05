# Phase 1 Hosted Supabase Setup

This is the primary setup path. Docker and local Supabase are not required.

## 1. Create the Hosted Project

1. Sign in at `https://supabase.com/dashboard` and create a dedicated development project.
2. Record the project reference from the dashboard URL or Project Settings.
3. Under Project Settings > API, obtain the Project URL, anonymous key, and service-role key.
4. Keep the service-role key in local/deployment secret storage only. Never place it in a `NEXT_PUBLIC_*` variable or browser code.

Use a separate production project later. Do not seed development identities into production.

## 2. Configure `.env.local`

Create `.env.local` from `.env.example` and populate:

| Variable | Dashboard/source | Exposure and purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Settings > API > Project URL | Browser-safe project endpoint |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Settings > API > anon/public key | Browser-safe only because RLS is enforced |
| `NEXT_PUBLIC_SITE_URL` | Current application origin | Browser-safe callback origin; use `http://localhost:3000` during local Next.js development |
| `SMTP_USER` | Existing contact-form provider | Server-only; unrelated to Supabase Auth email |
| `SMTP_PASS` | Existing contact-form provider | Server-only secret |
| `SUPABASE_SERVICE_ROLE_KEY` | Settings > API > service-role key | Server-only; used only by guarded development seeding |
| `SUPABASE_PROJECT_REF` | Dashboard project reference | Must match the hostname in the Project URL |
| `SUPABASE_ENVIRONMENT` | Set to `development` | Prevents seed execution against a marked production environment |
| `SUPABASE_SEED_CONFIRMATION` | Set to `seed:YOUR_PROJECT_REF` | Explicit confirmation of the exact seed target |
| `ALLOW_DEV_SEED` | Set to `true` only while seeding | Additional seed interlock |
| `DEV_SEED_ADMIN_EMAIL` | Reserved `.example.test` value | Hosted development admin identity |
| `DEV_SEED_ADMIN_PASSWORD` | Strong generated password | Server-only test credential |
| `DEV_SEED_AFFILIATE_EMAIL` | Reserved `.example.test` value | Hosted development affiliate identity |
| `DEV_SEED_AFFILIATE_PASSWORD` | Strong generated password | Server-only test credential |

Do not commit `.env.local`.

## 3. Link and Migrate

Install project dependencies, authenticate the CLI, link the project, and apply the repository migration:

```powershell
npm install
npx --yes supabase@2.116.0 login
npx --yes supabase@2.116.0 link --project-ref YOUR_PROJECT_REF
npx --yes supabase@2.116.0 db push
```

`db push` applies `supabase/migrations/202608300001_phase_1_identity_and_authorization.sql`. Do not manually recreate its tables in the dashboard. Review the migration list/table in the dashboard after it completes.

If CLI linking is unavailable, the migration can be reviewed and run once in the Supabase SQL Editor, but the linked CLI workflow is preferred because it preserves migration history.

## 4. Configure Supabase Auth

In Authentication > URL Configuration:

- Set Site URL to `http://localhost:3000` for development.
- Add `http://localhost:3000/auth/callback` and `http://127.0.0.1:3000/auth/callback` to Redirect URLs.
- Add the exact staging/production callback URL before deployment.

In Authentication settings:

- Enable email/password signup and email confirmation.
- Keep refresh-token rotation enabled.
- Set minimum password length to at least 8.
- Review Auth rate limits and enable CAPTCHA/abuse controls.
- Enable leaked-password protection if the project plan supports it.
- Configure custom SMTP before production and test confirmation/recovery delivery.
- Preserve Supabase confirmation/recovery URL variables in email templates.

## 5. Create Development Accounts

Confirm all four seed safeguards are correct: hosted URL/project reference match, `SUPABASE_ENVIRONMENT=development`, `SUPABASE_SEED_CONFIRMATION=seed:YOUR_PROJECT_REF`, and `ALLOW_DEV_SEED=true`.

Run:

```powershell
npm run seed:dev
```

The script creates or reuses one confirmed admin and one confirmed affiliate, while the Auth trigger initializes their profiles. It then grants only the development admin role through the service-role client.

Immediately set `ALLOW_DEV_SEED=false` afterward. Remove `SUPABASE_SERVICE_ROLE_KEY` from `.env.local` when seeding is finished if no other trusted local task requires it.

## 6. Verify Hosted Auth and RLS

```powershell
npm run check
npm test
npm run test:hosted
npm run build
npm audit
```

`npm run test:hosted` uses the anonymous key, not the service-role key. It must pass before Phase 1 is considered operational.

Then start the site:

```powershell
npm run dev
```

Manually verify affiliate/admin access, unauthenticated redirects, logout, recovery email/reset, persistence behavior, and all three languages as described in `docs/testing.md`.

## 7. Production Setup

1. Create a separate production Supabase project.
2. Apply migrations in staging first, then link/push to production in an approved release window.
3. Configure exact HTTPS site/callback URLs and remove unnecessary localhost/preview URLs.
4. Configure production Auth SMTP, domain authentication, rate limits, CAPTCHA, token settings, monitoring, and backups.
5. Store public values and server secrets in deployment environment settings; do not expose or routinely provide the service-role key to the web runtime.
6. Do not run the development seed script against production.
7. Grant/revoke executive and admin roles only through a controlled privileged process with approval and audit evidence.
8. Run hosted RLS tests with disposable staging identities and complete the manual Auth smoke test before release.

## Open Setup Decisions

- Username issuance/change/privacy and whether username login is required.
- Production session duration and MFA requirements for executive/admin users.
- Production privileged-role approval and break-glass procedure.
- Auth audit export, retention, alerting destination, and incident response owner.
- CAPTCHA provider and concrete authentication rate-limit thresholds.
