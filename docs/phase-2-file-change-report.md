# Phase 2 File Change Report

This report covers Phase 2 changes only. It does not reclassify pre-existing Phase 1 or marketing-site work.

## Files Created

| Path | Purpose / Important Details |
|---|---|
| `docs/phase-2-plan.md` | Architecture, schema, authorization, concurrency, UI, test, migration, and decision plan. |
| `docs/phase-2-requirements-matrix.md` | FRD-to-code/database/test traceability. |
| `docs/phase-2-manual-setup.md` | Hosted Supabase migration, cron, Realtime, seed, test, and production operations. |
| `docs/phase-2-file-change-report.md` | This exact change inventory. |
| `supabase/migrations/202608300002_phase_2_network_and_real_estate.sql` | Ordered network/inventory schema, RPCs, constraints, RLS, Realtime, and expiry job. |
| `supabase/migrations/202608300003_phase_2_hold_function_lint_fix.sql` | Qualifies plot-hold references in the atomic acquisition function for clean PostgreSQL linting on an already-migrated hosted project. |
| `supabase/migrations/202608300004_phase_2_auth_network_trigger_fix.sql` | Moves network initialization to an ordered Auth trigger that reads Auth metadata directly. |
| `supabase/migrations/202608300005_phase_2_secure_root_provisioning.sql` | Adds expiring, service-role-only, single-use authorization for explicit network roots. |
| `supabase/tests/phase_2_network_inventory.test.sql` | Transactional pgTAP security, tree, hold, sold, and expiration tests. |
| `src/lib/phase2/presentation.mjs` | Pure tree shaping, empty-slot, visual-state, and query-normalization helpers. |
| `src/lib/phase2/queries.js` | Server-side recursive reports and project/plot reads. |
| `src/lib/phase2/translations.js` | Phase 2 translation-key structure with English source and Russian/Hindi structure. |
| `src/app/actions/phase2.js` | Sponsor lookup and authenticated plot hold/release Server Actions. |
| `src/components/NetworkTree/NetworkTree.jsx` | Focused recursive visualizer, hover data, temporary roots, and empty signup slots. |
| `src/components/NetworkTree/NetworkTree.module.css` | Responsive hierarchy, node, connector, and tooltip styling. |
| `src/components/NetworkTable/NetworkFilters.jsx` | Search/status/leg report controls. |
| `src/components/NetworkTable/NetworkTable.jsx` | Paginated referral/network table with real purchase count state. |
| `src/components/Phase2/Phase2.module.css` | Shared Phase 2 page, table, filter, and project-list styling. |
| `src/components/PlotGrid/PlotGrid.jsx` | Database plot matrix, hold dialog/actions, and project-scoped Realtime refresh. |
| `src/components/PlotGrid/PlotGrid.module.css` | Accessible inventory colors, stable cells, scrolling grid, and dialog styling. |
| `src/app/(portal)/network/page.js` | Protected binary tree route. |
| `src/app/(portal)/network/referrals/page.js` | Protected Direct Referrals route. |
| `src/app/(portal)/network/index/page.js` | Protected Total Network Index route. |
| `src/app/(portal)/network/loading.js` | Stable skeleton state for network route transitions. |
| `src/app/(portal)/inventory/page.js` | Protected active-project inventory route. |
| `src/app/(portal)/inventory/[slug]/page.js` | Protected live project plot grid route. |
| `src/app/(portal)/inventory/loading.js` | Stable skeleton state for inventory route transitions. |
| `tests/phase2-presentation.test.mjs` | Fast unit tests for Phase 2 display/query logic. |

## Files Modified

| Path | What Changed / Why |
|---|---|
| `AGENTS.md` | Set Phase 2 boundary and database-authority engineering rules. |
| `README.md` | Describe Phase 2 capabilities and link setup/status documents. |
| `docs/requirements.md` | Record Phase 2 scope and explicit deferrals. |
| `docs/architecture.md` | Document recursive queries, hold transactions, Realtime, and UI modules. |
| `docs/database.md` | Document Phase 2 tables, functions, RLS, and publication. |
| `docs/security.md` | Add genealogy, inventory, expiration, concurrency, and Realtime controls. |
| `docs/testing.md` | Add unit, pgTAP, hosted concurrency/Realtime, and smoke coverage. |
| `docs/implementation-status.md` | Record repository and hosted Phase 2 completion. |
| `src/middleware.js` | Add `/network` and `/inventory` to early protected-route handling. |
| `src/app/(portal)/layout.js` | Resolve and pass the Phase 2 dictionary into the existing shell. |
| `src/components/PortalShell/PortalShell.jsx` | Add network, referrals, index, and inventory navigation. |
| `src/components/PortalShell/PortalShell.module.css` | Keep expanded navigation usable on desktop and mobile. |
| `src/app/signup/page.js` | Read prefilled sponsor and leg query context. |
| `src/components/Auth/AuthForm.jsx` | Add controlled sponsor validation and locked-to-available target-leg selection. |
| `src/components/Auth/Auth.module.css` | Style sponsor lookup, select, and validation feedback. |
| `src/app/actions/auth.js` | Validate sponsor/leg server-side before Supabase signup. |
| `src/lib/auth/operations.mjs` | Send sponsor/leg through Supabase Auth user metadata for the DB trigger. |
| `src/lib/auth/validation.mjs` | Normalize and validate member code and target leg. |
| `src/lib/i18n/translations.js` | Add localized signup/network placement messages. |
| `scripts/seed-dev-users.mjs` | Add guarded network hierarchy and 24-plot development project. |
| `tests/auth-validation.test.mjs` | Cover valid sponsor/leg signup input. |
| `tests/access-control.test.mjs` | Cover unauthenticated Phase 2 routes. |
| `tests/integration/hosted-supabase.mjs` | Add live network, RLS, inventory, concurrency, release, and Realtime verification. |
| `supabase/tests/phase_1_rls.test.sql` | Mark test-created accounts as explicit network roots so Phase 1 remains valid after Phase 2 trigger installation. |

## Files Deleted

None.

## Database Changes

Migrations: `supabase/migrations/202608300002_phase_2_network_and_real_estate.sql` through `supabase/migrations/202608300005_phase_2_secure_root_provisioning.sql`.

Tables: `network_nodes`, `network_root_creation_requests`, `real_estate_projects`, `plots`, `plot_holds`.

Enums: `network_member_status`, `network_leg`, `project_status`, `plot_inventory_status`, `plot_hold_status`.

Constraints/indexes include immutable parent/leg pairing, no self-parent/sponsor, unique member codes, `network_one_child_per_leg_idx`, project slug uniqueness, project/plot-number and coordinate uniqueness, plot state integrity, exact 48-hour hold duration, `plot_one_active_hold_idx`, and query/expiry/holder/booking indexes.

Functions/triggers: network code generation and signup initialization, genealogy protection, authorized subtree predicate, sponsor lookup, recursive tree/referral/index reports, atomic hold/release, expiration, update timestamps, and profile/network initialization trigger.

RLS/grants: forced RLS on all four tables; authenticated subtree reads, active inventory reads, own-hold reads, executive access, no anonymous table access, and no authenticated direct mutation grants.

Realtime/scheduling: adds only `public.plots` to `supabase_realtime`; installs/schedules `phase2-expire-plot-holds` through `pg_cron` every five minutes. Reads/acquisition also perform lazy expiration.

Seed changes: guarded hosted development seed creates both legs, deeper members, empty positions, and one clearly labeled 24-plot project with available, held, and sold states.

## Dependencies Added

None. Existing Next.js, React, `@supabase/ssr`, `@supabase/supabase-js`, and `react-icons` packages cover Phase 2.
