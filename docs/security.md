# Security

## Implemented Controls

- Supabase Auth owns passwords, hashing, recovery tokens, token expiration, and refresh rotation.
- Auth mutations execute through Next.js Server Actions with normalized and bounded input validation.
- Recovery responses avoid confirming whether an email exists.
- Login errors do not expose provider/database detail.
- Callback destinations use an allowlist, preventing open redirects.
- Session cookies are HTTP-only, `SameSite=Lax`, and `Secure` in production.
- Middleware rejects direct unauthenticated requests to dashboard/admin routes.
- Protected Server Components revalidate the Auth user and database profile.
- RLS and column grants prevent IDOR, cross-user profile access, and role/status mutation.
- Admin access is based on active server/database state, never browser-provided role data.
- Service-role credentials are absent from client code and must never use a `NEXT_PUBLIC_*` name.
- The development seed script refuses production mode and requires a matching hosted project reference, a `development` environment marker, an explicit project-specific confirmation, and `.example.test` identities.
- The dependency audit has no known advisories after the recorded updates/override.
- Phase 2 genealogy is immutable to browser roles; unique parent/leg placement is enforced by PostgreSQL.
- Network RLS exposes only the authenticated user's subtree unless active executive/admin authority is present.
- Plot status and ownership columns have no authenticated table mutation grants. Security-definer RPCs validate `auth.uid()`, lock rows, and enforce transitions.
- Atomic row locking plus the active-hold unique index prevents duplicate plot acquisition under concurrency.
- Expiration is based on UTC database time, not browser clocks. Scheduled and lazy cleanup paths both restore eligible plots.
- Realtime carries only plot changes and never grants authority or replaces server revalidation.
- Network roots require either trusted Auth app metadata or a normalized, expiring, service-role-created request that is consumed atomically during Auth signup.
- Financial tables force RLS; affiliates can read only their purchases, payments, wallets, earnings, and notifications.
- Authenticated roles have no direct financial mutation grants. Executive RPCs re-check active database roles and wallet payment RPCs re-check ownership.
- Posted journals/entries are immutable, journals must balance, retry keys are unique, and row/advisory locks serialize payment, wallet, and worker operations.
- Verified-payment reversals use linked journals, reverse allocations and direct commissions when qualification is lost, and invalidate unprocessed business volume.
- No payment gateway SDK, webhook, provider secret, or client-controlled financial calculation exists.
- Phase 4 encrypts protected KYC fields with a Vault-held key and minimizes Aadhaar to the last four digits plus private evidence.
- The private KYC bucket has no browser policies. File bytes are validated server-side before privileged upload; executive access uses audited two-minute signed URLs.
- KYC tables force RLS, terminal review history is immutable, decisions are row-locked, self-review is denied, and direct status/document metadata mutation is revoked.
- Database-backed fixed-window limits protect KYC saves, upload intents, submits, reviews, reveals, and document access.
- Application responses include CSP, HSTS, frame denial, `nosniff`, strict referrer policy, and restricted browser permissions.

## CSRF and Redirects

Auth writes are Server Actions protected by Next.js origin checking and same-site session cookies. No state-changing GET route exists; the GET callback only consumes a Supabase-issued one-time code/token. Deployment proxies must preserve correct `Origin`, `Host`, and HTTPS headers.

## Session Rules

The default session ends when the browser session ends. Selecting persistence permits a 30-day auth-cookie window; Supabase still controls token validity and rotation. Middleware refreshes cookies. Server access uses `auth.getUser()`, not unverified client session contents.

## Rate Limiting

Supabase Auth rate limits apply to signup, login, recovery, and token verification. Production setup must review project Auth rate limits, enable CAPTCHA/abuse protection where appropriate, and configure email delivery quotas. Application-wide distributed rate limiting is not claimed in Phase 1 because no distributed cache/provider is configured.

## Audit Scope

The protected audit table and trusted insertion function are implemented as a foundation. Comprehensive auth event ingestion is not claimed: Supabase Auth log export/webhooks and retention requirements must be selected before production audit integration.

## Secret Handling

Public variables are limited to Supabase URL, anonymous key, and site URL. The anonymous key is browser-safe only because RLS is mandatory. Service-role, SMTP, and seed credentials are server-only. `.env.local` is ignored by Git; `.env.example` contains placeholders only.

## Deployment Checklist

- Enforce HTTPS and secure headers at the hosting edge.
- Set exact Supabase site/redirect URLs; remove obsolete preview URLs.
- Configure production SMTP for Auth and monitor delivery failures.
- Review Supabase Auth token lifetime, refresh reuse interval, rate limits, CAPTCHA, leaked-password protection, and MFA roadmap.
- Run live RLS tests against a disposable environment before production migration.
- Enable `pg_cron`, confirm the Phase 2 expiry job, and verify the `plots` Realtime publication after migration.
- Restrict service-role values to deployment secret storage and scheduled/server jobs only.
- Configure `kyc_data_encryption_key` in Supabase Vault, enable leaked-password protection, require executive MFA, and add document malware scanning before production.

## Production Closure Controls

- Production startup/authenticated routes fail closed when environment identity, HTTPS URLs, server secrets, SMTP/contact delivery, or seed settings are unsafe.
- Privileged production access requires a server-confirmed executive/admin profile and Supabase AAL2. TOTP enrollment is available at `/mfa`; enrollment/recovery governance remains operational.
- KYC evidence starts `uploaded`, must pass service-only `scanning -> clean`, and cannot be submitted or reviewed before clean. A scanner provider is not bundled or claimed.
- Financial writes are rejected unless the service-only runtime is explicitly production-enabled and active plans/rules are production-labelled and complete.
- The contact API bounds and validates input, escapes HTML, suppresses SMTP details, and has a per-instance burst limit. Edge/distributed abuse controls remain required.

## Profile And Member-Code Controls

The profile Server Action reconstructs an allowlisted payload containing only name, mobile and language fields. Email, role, account status, member code and genealogy are never accepted from the browser mutation. Existing column grants and forced RLS provide the database boundary. Sequential member codes are allocated only inside the Auth provisioning transaction through a browser-inaccessible counter and generator; uniqueness remains database-enforced.
