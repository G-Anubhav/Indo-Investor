# Architecture

## Runtime Layers

1. **Frontend UI:** Existing Next.js App Router marketing site plus localized auth pages and the protected portal shell. CSS modules and existing UI libraries are retained.
2. **Application routing:** Next.js Server Actions handle auth mutations. The callback Route Handler exchanges Supabase PKCE/OTP tokens. Middleware refreshes sessions and rejects unauthenticated protected requests.
3. **Persistent storage:** Supabase PostgreSQL stores roles, application profiles, and security audit records. Supabase Auth stores credentials and identity tokens.
4. **Volatile/distributed state:** Supabase rotating JWT/refresh sessions use secure cookies. Phase 2 inventory pages subscribe only to `plots` updates for the viewed project. Realtime prompts an authoritative server refresh and is not trusted for correctness.

## Trust Boundaries

Browser input -> Server Action validation -> Supabase Auth/PostgreSQL -> RLS policy -> response.

The browser's role claims and hidden UI state are never authorization inputs. Server Components call `auth.getUser()` and then read the RLS-protected profile. Administrative pages require both an authenticated user and a trusted database role of `executive` or `admin`.

## Key Modules

- `src/lib/supabase`: validated public config and browser/server/middleware clients.
- `src/lib/auth`: input validation, provider operations, safe redirects, and access decisions.
- `src/app/actions`: auth and language Server Actions.
- `src/middleware.js`: session refresh and coarse protected-route boundary.
- `src/app/(portal)`: server-protected dashboard and admin routes.
- `src/lib/i18n`: translation dictionaries and locale cookie resolution.
- `src/lib/phase2`: network/inventory queries, display shaping, and Phase 2 dictionaries.
- `src/components/NetworkTree`: controlled-depth binary visualizer and temporary-root navigation.
- `src/components/NetworkTable`: referral/network reports and filters.
- `src/components/PlotGrid`: accessible matrix, hold controls, and project-scoped Realtime subscription.
- `supabase/migrations`: reproducible database schema and policies.

## Session Flow

1. Login is submitted to a Server Action.
2. Supabase validates email/password and returns rotating session tokens.
3. `@supabase/ssr` writes HTTP-only, `SameSite=Lax`, production-secure cookies.
4. Middleware calls `auth.getUser()` on requests and writes refreshed cookies.
5. Protected layouts call `auth.getUser()` again and load the current profile under RLS.
6. Logout requests local-scope Supabase sign-out, removes the persistence preference, and redirects to login.

## Recovery Flow

Supabase sends an expiring recovery link to the configured callback URL. `/auth/callback` accepts only Supabase code/token inputs and two internal destinations. It exchanges the token server-side and redirects to `/reset-password`; the reset action requires the resulting authenticated recovery session.

## Future Compatibility

The Auth user UUID is the stable identity key future booking, network, wallet, and KYC migrations should reference. Role definitions are data rows, not client constants alone. Future modules must add their own tables, constraints, RLS, audit events, and tests without changing the credential/session architecture.

## Phase 2 Query Architecture

`get_network_tree` and `get_network_index` use recursive PostgreSQL CTEs, avoiding one browser request per descendant. The visualizer fetches at most five levels and renders three by default. Double-clicking a visible descendant requests that authorized subtree as a temporary root without altering genealogy.

Plot acquisition calls `acquire_plot_hold`, which locks the plot row, lazily expires a stale hold, then creates exactly one 48-hour hold and updates the plot in the same transaction. A partial unique index prevents multiple active holds. `release_plot_hold` uses the same row-lock boundary. Scheduled `pg_cron` cleanup calls `expire_plot_holds` every five minutes, while project reads also invoke it for resilience.

The full booking/payment boundary remains deferred. A hold is only a temporary inventory lock; the UI states this explicitly and never simulates payment or ownership.

## Phase 3 Financial Architecture

Phase 3 uses PostgreSQL transactions as the only financial mutation boundary. RLS-filtered Server Components read financial state; validated Server Actions call role-checking RPCs. Purchases generate deterministic schedules from configured plan versions. Manual verification locks and allocates the payment, posts a balanced journal, creates notifications and volume, and evaluates direct commission in one transaction.

Wallets are separate liability accounts and their balances are derived from posted entries. Compensation workers use versioned rules, advisory transaction locks, unique cycle/result keys, and immutable source events. `pg_cron` runs daily reminders/reconciliation; binary and incentive functions are service-only and may be scheduled after business cycle approval. See `docs/financial-accounting-model.md` and `docs/compensation-rules.md`.

## Phase 4 KYC Architecture

KYC is a versioned PostgreSQL state machine. Affiliates use Server Actions and ownership-checking RPCs; executives use server-protected queue/detail routes and database role checks. Sensitive fields are encrypted by `pgcrypto` with a Supabase Vault key. Document bytes live in a private bucket with no browser policies. A server-only Supabase client uploads only after binary inspection and an authenticated intent; review links are two-minute signed URLs issued after an audited RPC.

Terminal decisions and prior document metadata are immutable. Resubmission creates a new version. Database-backed rate limits apply across application instances. `can_withdraw` and `can_finalize_deed` expose eligibility only; no withdrawal/deed operation exists.
# Production Readiness Addendum

Production safety is enforced at three layers: deployment environment validation in middleware/server code, a database singleton runtime gate, and database-authoritative role/state transitions. The public health route exposes only aggregate status. Privileged production pages require an active executive/admin profile and Supabase AAL2. KYC scanning is a service-only provider boundary; financial processing is disabled until production-labelled, approved configuration is explicitly activated. External monitoring, scanner, backups and organizational approvals remain deployment dependencies rather than application modules.
