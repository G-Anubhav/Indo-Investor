# Phase 2 Plan

## Scope

Phase 2 adds the FRD binary network, downline reporting, real-estate project/plot inventory, 48-hour holds, and realtime plot refreshes. Phase 1 Auth, SSR sessions, profile roles, localization infrastructure, and portal shell remain authoritative. Wallets, commissions, payments, KYC workflows, withdrawals, and helpdesk remain out of scope.

## Architecture Approach

- Extend the existing Next.js App Router portal with `/network`, `/network/referrals`, `/network/index`, `/inventory`, and `/inventory/[slug]`.
- Reuse `createServerSupabaseClient`, `createBrowserSupabaseClient`, and `requirePortalAccess`; no competing client layer.
- Keep PostgreSQL authoritative. Server Components perform initial reads; Server Actions call narrowly granted database functions for mutations.
- Keep client state limited to visualization focus, filters, dialogs, and realtime refresh signals.

## Database Schema Plan

- `network_nodes`: one immutable genealogy record per profile with member code, sponsor, placement parent, left/right leg, member state, nullable rank/sales metrics, and timestamps.
- `real_estate_projects`: development identity, slug, description, status, location, metadata, and timestamps.
- `plots`: project grid coordinates, number, area/dimensions, price, controlled inventory status, hold/booking references, and timestamps.
- `plot_holds`: append-oriented hold history with holder, UTC creation/expiry/end times, and controlled status.
- Add only the foreign keys, unique/check constraints, and indexes required by current query/mutation paths.

## Binary Tree Model

- `sponsor_user_id` records direct referral attribution; `parent_user_id` and `placement_leg` record binary genealogy.
- A partial unique constraint on `(parent_user_id, placement_leg)` prevents duplicate left/right children under concurrency.
- Genealogy fields cannot be changed by ordinary users. New Auth registrations carry validated sponsor-code/leg metadata; a database trigger performs the authoritative placement.
- Existing Phase 1 profiles are backfilled as roots. Development seed users form a demonstrable multi-level tree.
- Database recursive CTE functions return focused trees and paginated descendants without one browser query per node.

## Plot and Project Model

- Projects support different layouts; plots use per-project row/column coordinates and unique plot numbers.
- Plot states are `available`, `token_hold`, and `sold` with database constraints requiring the correct holder/expiry/booking fields.
- `plot_holds` preserves hold history and has at most one active hold per plot.
- Sold is a management/booking foundation state; no Phase 3 payment or booking engine is introduced.

## Realtime Strategy

- Add only `public.plots` to `supabase_realtime` publication.
- The inventory client subscribes to project-filtered INSERT/UPDATE/DELETE events and calls `router.refresh()` after a short coalescing delay.
- Initial load, reconnect, visibility return, and every mutation re-read database state. Realtime is a freshness signal, never authority.

## Authorization Strategy

- Authenticated users may read active projects/plots and their own accessible network subtree.
- Executives/admins may read all Phase 2 operational rows through existing `is_executive()`.
- Anonymous application-table access is denied.
- Clients receive no direct INSERT/UPDATE/DELETE grants on genealogy, plots, projects, or holds.
- Sponsor lookup exposes only shareable member code, display name, and slot availability through a security-definer function.
- Hold acquisition/release is available only through authenticated transactional functions using `auth.uid()`.

## Concurrency and Expiration

- Hold acquisition locks the plot row with `FOR UPDATE`, lazily expires a stale hold, then atomically inserts a hold and updates the plot.
- Unique active-hold and plot-state constraints provide defense in depth. Simultaneous contenders cannot both succeed.
- Holds expire exactly 48 hours after database `now()` in UTC.
- `expire_plot_holds()` handles batch cleanup. Hosted `pg_cron` runs it every five minutes; project reads also invoke lazy cleanup so closed browsers cannot preserve stale holds.

## UI Architecture

- Add portal navigation for Network, Referrals, Network Index, and Inventory.
- Render a controlled-depth focused binary tree (default three levels), explicit left/right empty slots, hover/focus details, and double-click temporary-root navigation.
- Empty slots link to the existing signup flow with sponsor code and leg prefilled; signup validates and passes that context to the database trigger.
- Reports use server-side pagination/search/status/leg filters and honest purchase-history availability.
- Inventory uses a responsive project selector and accessible green/yellow/red plot grid with text labels, details dialog, hold confirmation, conflict/error states, and realtime refresh.

## Testing Strategy

- Pure unit tests: tree shaping, empty slots, temporary-root rules, inventory status presentation, validation, and safe signup context.
- Hosted integration: network visibility, direct referrals, filtered descendants, unauthorized genealogy/plot mutations, atomic hold acquisition, simultaneous acquisition conflict, release, and expired-hold reconciliation.
- pgTAP: schema constraints, RLS, recursive access, duplicate legs, state protections, and database functions where a PostgreSQL runner is available.
- Regression: retain all Phase 1 tests and rerun lint, build, audit, and hosted Phase 1 verification.

## Migration Strategy

- Add `202608300002_phase_2_network_and_real_estate.sql` after the immutable Phase 1 migration.
- Backfill existing profiles to network roots without altering Auth/profile records.
- Add publication and cron configuration idempotently where practical.
- Extend the guarded development seed script; never seed demo records in the migration or production.

## Unresolved Decisions

- Automated spillover placement rule is not specified. Phase 2 implements explicit sponsor/empty-slot placement; a future approved rule can call the same locked placement function.
- Rank definitions and sales-volume source are not specified and belong to later business logic, so both remain null/unavailable.
- Purchase history has no Phase 3 booking/payment ledger yet; reports show real booked-plot counts only when authoritative sold ownership exists, otherwise unavailable.
- Production project/plot administration workflow is not specified. Phase 2 supplies secure schema/functions and seed tooling, not a broad admin CMS.
- Final cron frequency and operations alerting may be adjusted after production load testing; correctness also uses lazy expiration.
