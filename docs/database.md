# Database

## Reproducibility

Migration `supabase/migrations/202608300001_phase_1_identity_and_authorization.sql` creates Phase 1. Ordered migration `supabase/migrations/202608300002_phase_2_network_and_real_estate.sql` adds Phase 2. Migrations `202608300003` through `202608300005` apply the atomic-hold lint fix, Auth/network trigger correction, and secure one-time root provisioning. Apply migrations through the hosted SQL editor or a linked CLI project; do not reproduce objects manually in Table Editor.

## Tables

### `public.roles`

Role catalog keyed by stable text values. Seeded with `affiliate`, `executive`, and `admin`. Authenticated users may read definitions; no browser role may insert/update/delete them.

### `public.profiles`

- `user_id` UUID primary key and cascading foreign key to `auth.users.id`.
- Optional unique normalized `username` for a future approved username strategy.
- Full/display name, normalized unique email, optional unique E.164 mobile.
- constrained `status`, foreign-keyed `role_key`, and supported `language_code`.
- created/updated timestamps and indexes on role and status.

No password or password hash is present. An `auth.users` insert trigger creates the profile as `affiliate`; conflict handling is idempotent and never updates role. A separate privileged trigger synchronizes confirmed Auth email changes.

### `public.security_audit_log`

Append-oriented foundation for security-sensitive events with UUID ID, actor/target Auth UUIDs, normalized action/source, JSON object details, and timestamp. Clients cannot insert. Executives/admins can read through RLS. The service-role-only `record_security_event` function is available to trusted future server jobs.

## Functions and Triggers

- `set_updated_at`: maintains profile timestamps.
- `handle_new_auth_user`: creates exactly one application profile with affiliate role.
- `sync_auth_user_email`: keeps the profile email mirror aligned with Auth.
- `is_executive`: database-side active executive/admin authorization predicate.
- `record_security_event`: service-role-only audit insertion foundation.
- Triggers: `profiles_set_updated_at`, `on_auth_user_created`, and `on_auth_user_email_changed`.

Security-definer functions use an empty `search_path` and fully qualified object names.

## RLS and Grants

RLS is enabled and forced on all Phase 1 application tables.

- Anonymous users receive no application-table grants or policies.
- Affiliates can select only their own profile.
- Executives/admins can select profiles and audit rows when their active role is present in the database.
- A user can update only their own active profile and only `full_name`, `display_name`, `mobile_phone`, and `language_code` at the PostgreSQL grant level.
- Role, status, email, username, user ID, and timestamps cannot be changed by authenticated clients.
- Clients cannot insert/delete profiles or forge audit events.

These column grants are intentional defense in depth: even a permissive row policy would not grant access to security-sensitive columns.

## Deletion Behavior

Deleting an Auth user cascades to their profile. Audit actor/target references become null so audit history can be retained. Roles cannot be deleted while profiles reference them.

## Testing

`tests/integration/hosted-supabase.mjs` verifies deployed Auth and RLS through the public anonymous key using guarded development identities. `supabase/tests/phase_1_rls.test.sql` remains available as the deeper transactional pgTAP suite when a local or CI PostgreSQL runner is available.

## Phase 2 Tables

- `network_nodes`: one row per profile with a generated member code, sponsor, parent, placement leg, status, optional real rank/sales values, and immutable genealogy timestamps. A partial unique index on `(parent_user_id, placement_leg)` enforces one child per leg.
- `network_root_creation_requests`: service-role-only, expiring, single-use authorization for creating explicit network roots. The Auth trigger consumes the request atomically; ordinary signup still requires sponsor/leg placement.
- `real_estate_projects`: development identity, slug, description, lifecycle status, location, bounded JSON metadata, and timestamps.
- `plots`: project-scoped plot number and grid coordinates, optional area/dimensions/price, controlled inventory status, current holder/expiry, booking foundation, and timestamps. Project/number and project/coordinate pairs are unique.
- `plot_holds`: append-oriented hold history with user, plot, state, exact 48-hour duration, and end timestamp. A partial unique index allows one active hold per plot.

## Phase 2 Functions

- `initialize_network_node` and `generate_network_member_code`: transactionally initialize signup placement from trusted Auth metadata. Root creation requires admin API app metadata.
- `can_view_network_member`, `get_network_tree`, `get_direct_referrals`, `get_network_index`: authorized recursive/network reporting APIs.
- `lookup_network_sponsor`: limited public registration lookup returning display name and leg availability only.
- `acquire_plot_hold`, `release_plot_hold`, `expire_plot_holds`: locked status transitions, ownership enforcement, audit entries, and expiry.

All functions use an empty search path and qualified object names. `network_nodes`, projects, plots, and holds have forced RLS. Authenticated clients receive read grants only; mutations are limited to approved functions. Only `public.plots` is added to `supabase_realtime`.

## Phase 3 Database

Migrations `202608300006` through `202608300012` add payment methods/plans, purchases, installments, manual payments and allocations, dual wallets, chart accounts, journals/entries, compensation rules/results, volume events, notifications, workers, reconciliation, RLS, cron, idempotency fixes, and reversal propagation. All financial tables force RLS and browser roles receive read-only grants. Privileged mutations are security-definer functions with explicit executive or owner checks.

Money is INR `numeric(18,2)`. Posted journals contain at least one debit and credit with equal totals and cannot be updated/deleted. Wallet balances are computed as posted credits minus debits on the linked liability account. Exact objects and indexes are listed in `docs/phase-3-file-change-report.md`.

## Phase 4 Database

Migrations `202609010001` through `202609010004` add KYC schema, operations, private Storage configuration/RLS/jobs, and cross-phase function-grant hardening. Tables are `kyc_submissions`, `kyc_sensitive_data`, `kyc_pan_registry`, `kyc_upload_intents`, `kyc_documents`, `kyc_review_events`, and `security_rate_limits`.

All Phase 4 tables force RLS. Authenticated users receive SELECT only on submissions, document metadata, and review events under owner/executive policies; sensitive, fingerprint, intent, and rate-limit tables have no browser grants. State changes use locked Security Definer RPCs. `kyc-private` has no browser object policies. `phase4-security-state-cleanup` removes old intents/rate counters daily.

Plaintext PAN/bank fields never persist. Vault-backed AES-256 `pgcrypto` ciphertext and a keyed PAN fingerprint are stored. The fingerprint registry prevents cross-account reuse without preventing same-account historical versions. See `docs/phase-4-file-change-report.md` for exact objects.

## Production Readiness Database

Migrations `202609010005` and `202609010006` add the singleton `platform_runtime_configuration`, `platform_environment` and KYC scan enums, environment labels for payment plans/compensation rules, scan metadata/status constraints and indexes, and security/processing gates. Production financial writes are blocked until an explicit service-only activation with complete production-labelled rules. Privileged production authorization requires AAL2. KYC submission/review requires clean evidence.

Service-only functions include `configure_platform_runtime`, `service_set_profile_access`, `record_kyc_document_scan`, and `production_health_snapshot`. Role/runtime/scan changes are audited. Trigger-only/internal function execution is revoked from browser roles. All public application tables continue to force RLS; the only intentional anonymous Security Definer RPC is the bounded sponsor lookup.

## Member-Code Allocation

Migration `202609010007` adds the forced-RLS singleton `member_code_counters` and replaces `generate_network_member_code()` with a transactional row-lock allocator. Migration `202609010008` deterministically converts all existing accounts to `IIIW1002` onward, advances the counter and enforces an IIIW-only constraint. UUIDs remain authoritative for every relationship. Browser roles have no counter access and cannot execute the generator.
