# Phase 2 Manual Setup

Phase 2 targets the hosted Supabase website. Local Supabase and Docker are not required. Apply and test against a disposable hosted development project before production.

## 1. Back Up and Confirm Phase 1

1. Confirm `profiles`, `roles`, and `security_audit_log` exist and Phase 1 RLS is enabled.
2. Take a database backup or create a Supabase branch before applying Phase 2.
3. Confirm the target is the intended development project. Never run the development seed against production.

## 2. Apply the Hosted Migration

Preferred dashboard workflow:

1. Open Supabase Dashboard > SQL Editor > New query.
2. Open `supabase/migrations/202608300002_phase_2_network_and_real_estate.sql` locally.
3. Paste the complete file into SQL Editor and run it once. It is one transaction; do not run selected fragments.
4. Confirm the query commits without errors.

Linked CLI alternative:

```powershell
npx --yes supabase@2.116.0 login
npx --yes supabase@2.116.0 link --project-ref YOUR_PROJECT_REF
npx --yes supabase@2.116.0 db push
```

## 3. Verify Supabase Objects

In Table Editor, confirm these tables exist and show RLS enabled:

- `network_nodes`
- `real_estate_projects`
- `plots`
- `plot_holds`

In Database > Functions, confirm the network query and plot hold functions exist. In Database > Replication/Realtime, confirm only `plots` was added by Phase 2. In Integrations > Cron or by querying `cron.job`, confirm `phase2-expire-plot-holds` runs every five minutes.

If the project does not permit the migration to create `pg_cron`, enable the Supabase Cron integration/`pg_cron` extension and rerun the migration in the development branch. Do not remove the lazy-expiration path; it is intentional resilience, not a replacement for scheduled cleanup.

## 4. Environment Variables

Existing runtime variables remain unchanged:

| Variable | Source | Exposure |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Dashboard > Project Settings > API | Browser-safe |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Dashboard > Project Settings > API | Browser-safe with RLS |
| `NEXT_PUBLIC_SITE_URL` | Deployed application origin | Browser-safe |

Development seed/test variables are server-only:

| Variable | Purpose |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Admin API for development seed only |
| `SUPABASE_PROJECT_REF` | Exact hosted development project reference |
| `SUPABASE_ENVIRONMENT` | Must be `development` |
| `SUPABASE_SEED_CONFIRMATION` | Must be `seed:YOUR_PROJECT_REF` |
| `ALLOW_DEV_SEED` | Temporarily set to `true` to seed |
| `DEV_SEED_ADMIN_EMAIL` / `DEV_SEED_ADMIN_PASSWORD` | Clearly non-production admin identity |
| `DEV_SEED_AFFILIATE_EMAIL` / `DEV_SEED_AFFILIATE_PASSWORD` | Clearly non-production network root |

No Phase 2 runtime variable was added. Never prefix the service-role key or seed passwords with `NEXT_PUBLIC_`.

## 5. Seed Hosted Development Data

After configuring `.env.local` with `.example.test` identities and all seed guards:

```powershell
npm.cmd run seed:dev
```

The script creates/updates only clearly labeled development identities, a two-leg/deeper binary example, and `phase-2-development-estate` with 24 plots. It resets only that named demo project's hold rows and inventory examples on repeat. Immediately set `ALLOW_DEV_SEED=false` afterward.

Do not run this command in production. Production projects/plots must be loaded through a separately reviewed trusted administrative process; Phase 2 intentionally does not include a property-management CMS.

## 6. Verify

```powershell
npm.cmd install
npm.cmd run check
npm.cmd test
npm.cmd run build
npm.cmd run test:hosted
npm.cmd audit
```

Then test in two authenticated browser sessions:

1. Open `/network`; verify left/right nodes, empty positions, hover details, and temporary-root navigation.
2. Open an empty position; verify signup preserves and validates sponsor/leg.
3. Check referrals and network-index search/status/leg filters.
4. Open the seeded plot project in both sessions.
5. Hold one available plot; verify the other session updates and cannot acquire it.
6. Release the hold; verify both sessions return it to available.

## 7. Production Operations

- Apply the migration during a reviewed maintenance window after backup.
- Confirm Realtime connection quotas and publication health.
- Monitor `cron.job_run_details` and alert on repeated expiry-job failures.
- Keep all timestamps in UTC; localize only for display.
- Restrict trusted project/plot loading and sold-state transitions to server/admin operations.
- Do not expose the service-role key to Next.js client bundles.
- Run the hosted suite against staging after every migration. Do not run development seeding against production.
