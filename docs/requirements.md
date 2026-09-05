# Requirements

## Source of Truth

The primary product source is `real_estate_backoffice_functional_documentation_FRD.pdf`, version 1.0.0, August 2026. It was read in full before both implementation phases. This document records implemented phase boundaries and does not replace the FRD.

## Phase 1 Scope

Phase 1 establishes:

- Next.js application and API routing foundation.
- Supabase project connectivity for browser and server execution.
- Supabase Auth email/password signup, login, logout, recovery, and reset.
- SSR cookie sessions, refresh handling, and protected routes.
- Application profiles separate from `auth.users`.
- Extensible affiliate, executive, and admin role foundation.
- PostgreSQL constraints, migrations, RLS, and security-audit storage.
- Authenticated sidebar/header shell with real identity/session information only.
- English, Russian, and Hindi translation dictionaries and persisted preference.
- Automated auth/access tests and PostgreSQL RLS tests.
- Local-only development account seeding.

## Explicitly Deferred

The FRD places the following outside Phase 1: sponsor validation and binary placement, binary tree visualization, referrals/downline reports, property plot grid, holds/bookings, EMI and documents, wallets, commissions, incentives, KYC, withdrawals, helpdesk, and executive business reporting. No placeholders with fake data are presented as those features.

## Authentication Decisions

- Email/password is the Phase 1 identity mechanism because Supabase Auth natively and securely supports it.
- The database includes a future-safe nullable `username`, but unauthenticated username-to-email resolution is not implemented. Such lookup could enable account enumeration and requires a product decision on username lifecycle and privacy.
- Signup in Phase 1 does not accept Sponsor ID or Target Leg. Those values control permanent binary placement and belong to Phase 2 according to the requested boundary.
- Password policy is at least 8 characters with uppercase, lowercase, and a number, maximum 128 characters. Passwords remain exclusively in Supabase Auth.
- The "keep me signed in" option uses a 30-day persistent auth-cookie window. Without it, auth cookies are browser-session cookies.

## Roles

- `affiliate`: normal authenticated user area.
- `executive`: authorized operational/admin visibility.
- `admin`: privileged administrator visibility.

Registration always creates an `affiliate`. No user can select or update their own role. Development administrators are created only by the guarded local seed script.

## Acceptance Boundary

Phase 1 is operational only after a human creates a hosted Supabase project, applies the migration, configures Auth URLs/email, supplies environment values, and executes the hosted RLS/auth verification. See `docs/phase-1-manual-setup.md`.

## Phase 2 Scope

- Database-authoritative binary genealogy with sponsor, parent, left/right placement, immutable history, and recursive subtree queries.
- Focused three-level visualization, temporary-root navigation, empty positions, and sponsor/leg registration context.
- Paginated direct-referral and total-network reports with search, status, and root-leg filters.
- Active property developments and variable row/column plot matrices.
- Available, token-hold, and sold inventory states with atomic 48-hour holds and database expiration.
- Realtime plot updates backed by authoritative server revalidation.
- Deliberate RLS/grants, development-only network/property seeds, and automated tests.

Phase 2 does not define spillover placement, rank calculation, sales-volume calculation, booking/payment processing, or KYC processing. Those values are not fabricated. See `docs/phase-2-requirements-matrix.md`.

## Phase 3 Scope

Phase 3 implements manually recorded and executive-verified property payments, deterministic 12/24/36 installment schedules, isolated Main Cash and Property Installment wallets, immutable double-entry journals, direct referral commissions, binary matching with historical carry-forward, monthly incentives, reminders, reconciliation, idempotent workers, financial RLS, and portal/admin financial views. No payment gateway is used. Undefined rates, ratios, caps, thresholds, and plan terms remain inactive until configured in versioned database records.

KYC, identity/bank verification, withdrawal settlement, external notification delivery, helpdesk, and final deed compliance remain Phase 4 or future integrations.
