# Production Route And API Audit

## Route Classes

- Public: marketing/property/resource pages, `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/unauthorized`, `/auth/callback`, `POST /api/sendEmail`, and safe `GET /api/health`.
- Authenticated affiliate: `/dashboard`, `/network`, `/network/referrals`, `/network/index`, `/inventory`, `/inventory/[slug]`, `/wallets`, `/earnings`, `/property-payments`, `/kyc`.
- Privileged: `/admin`, `/admin/financials`, `/admin/kyc`, `/admin/kyc/[id]`; server profile role and production AAL2 are required.
- Privileged MFA enrollment: `/mfa`, available only to server-confirmed executive/admin identities.

Middleware rejects unauthenticated portal access and unsafe production configuration. Server layouts/actions repeat trusted profile/role checks; navigation visibility is not an authorization boundary.

## Operation Boundaries

- Auth actions validate input, use Supabase Auth, safe redirects/errors and trusted server sessions.
- Phase 2/3/4 actions call constrained database RPCs; ownership, state transitions, concurrency and role checks remain database-authoritative.
- KYC signed URLs are service-created only after audited, clean-document authorization.
- The contact API accepts POST only, validates/bounds fields, escapes HTML, hides SMTP errors and applies a per-instance burst guard. Production edge/distributed rate limiting and abuse monitoring remain required.
- The health route uses a service-only aggregate snapshot and emits no configuration/secrets.

Database `SECURITY DEFINER` functions use fixed empty `search_path`, validate caller/inputs, have explicit grants, and were catalog-audited. Only the intentionally public sponsor lookup is executable anonymously.
