# Testing

## Standard Checks

```powershell
npm install
npm run check
npm test
npm run build
npm audit
```

`npm run check` is the JavaScript static/lint check. The project intentionally has no TypeScript dependency or TypeScript source; `next build` performs framework compilation and route validation.

## Unit Coverage

- `tests/auth-operations.test.mjs`: successful/failed login, logout, recovery, rate-limit mapping, duplicate signup, and expired reset handling.
- `tests/auth-validation.test.mjs`: email normalization, password policy, signup validation, and locale fallback.
- `tests/access-control.test.mjs`: unauthenticated rejection, affiliate/admin access, inactive profiles, and safe redirects.
- `tests/phase2-presentation.test.mjs`: left/right tree shaping, empty positions, temporary-root boundaries, plot-state mapping, and filter normalization.

## Hosted Supabase Verification

This is the primary database/Auth verification path. It does not require Docker.

Prerequisites:

1. Link the hosted development project and apply migrations.
2. Configure `.env.local` from the Supabase dashboard.
3. Run `npm run seed:dev` with all seed safeguards enabled.

Then run:

```powershell
npm run test:hosted
```

The script authenticates through the project's anonymous key and verifies:

- affiliate and admin login;
- affiliate reads only their own profile;
- affiliate cannot update another profile;
- affiliate cannot update their own role;
- admin can read authorized profiles;
- anonymous profile access is rejected;
- sessions can be signed out.
- recursive tree/referral/index retrieval and network RLS;
- direct genealogy and inventory mutation denial;
- real project/plot states from the development seed;
- two simultaneous hold attempts produce exactly one winner;
- release behavior and project-scoped Realtime delivery;
- anonymous project access denial.

It does not use the service-role key and does not modify legitimate profile data.

Phase 3 adds `tests/phase3-presentation.test.mjs`, `supabase/tests/phase_3_financials.test.sql`, and `tests/integration/phase3-hosted.mjs`. Run the hosted financial concurrency suite only against the guarded development project:

```powershell
npm.cmd run test:financial-hosted
npx.cmd --yes supabase@2.116.0 db query --linked --file supabase/tests/phase_3_financials.test.sql
```

The tests cover payment record/verify/reject/reverse, schedule totals, balanced and immutable journals, RLS, direct commission rules, wallet top-up/use, retry safety, simultaneous verification/debit, binary results/carry-forward, incentives, worker retries, and reconciliation.

## Optional pgTAP Verification

The deeper transactional test remains available for local Docker or a future CI PostgreSQL runner:

```powershell
npx --yes supabase@2.116.0 start
npx --yes supabase@2.116.0 db reset
npm run test:db
```

`supabase/tests/phase_1_rls.test.sql` verifies Phase 1. `supabase/tests/phase_2_network_inventory.test.sql` verifies placement uniqueness, recursive access, empty positions, plot mutation denial, 48-hour duration, release, sold protection, database expiration, executive access, and anonymous denial.

## Manual Auth Smoke Test

1. Sign in as the hosted development affiliate and confirm `/dashboard` loads and `/admin` is denied.
2. Sign out and request `/dashboard`; confirm redirect to `/login`.
3. Sign in as the hosted development admin and confirm `/admin` loads.
4. Request password recovery, open the received email, follow the link, and update the password.
5. Test login with persistence cleared and selected; inspect cookie lifetime.
6. Open `/network`, focus a downline by double-clicking, return to the original root, and open an empty position into signup.
7. Filter `/network/index` by status and root leg.
8. Open a seeded plot grid in two sessions, hold a green plot, and verify the second session updates and cannot acquire it.

## Verification Record

On 2026-08-30, unit tests, lint, production build, dependency audit, and HTTP rendering were verified in this workspace. The developer subsequently confirmed that the hosted migration is applied, the required tables have RLS enabled, and the hosted test passes. The earlier local pgTAP attempt was refused because no local database was running; that optional test is not required for the hosted workflow.

Phase 2 verification on 2026-08-30 passed lint, 22 JavaScript tests, production build, dependency audit, homepage/login HTTP rendering, and protected-route redirects. Hosted migrations `202608300001` through `202608300005` are aligned and database lint reports no errors. Guarded development seeding succeeded. The hosted Auth/RLS/concurrency/Realtime suite passed, and the transactional hosted pgTAP suite passed all 20 assertions, including exact hold duration and expiration release.

## Phase 4 Verification

- `tests/phase4-validation.test.mjs`: PAN/Aadhaar/bank/IFSC rules, masks, and MIME/extension/magic-byte checks.
- `tests/integration/phase4-hosted.mjs`: real Auth user, direct Storage denial, three secure uploads, submission, cross-user/affiliate denial, reveal audit, concurrent decision, mutation denial, and eligibility before/after approval.
- `supabase/tests/phase_4_kyc_security.test.sql`: 18 transactional schema, RLS, grant, bucket, and function assertions.
- `tests/performance/phase4-load.mjs`: 40-way concurrent hosted eligibility and queue probes.
- `tests/performance/phase4-scale.sql`: rollback-only 1,000-row network, plot, KYC, document, and ledger fixtures with bounded query timing.

Run `npm.cmd run test:kyc-hosted`, `npm.cmd run test:kyc-load`, and `npx.cmd supabase db query --linked --file supabase/tests/phase_4_kyc_security.test.sql`. Local `npm run test:db` requires Docker; hosted pgTAP is the operational path for this project.

On 2026-09-01 the final hosted regression passed Phase 1 pgTAP 12/12, Phase 2 pgTAP 20/20, Phase 3 pgTAP 36/36, Phase 4 pgTAP 18/18, production-readiness pgTAP 23/23, the combined Phase 1-3 hosted access suite, Phase 3 concurrency, and Phase 4 KYC/Storage/concurrency. A transient Realtime delivery timeout occurred on the first combined-suite run; immediate rerun passed, so production monitoring/reconnect testing remains important. Clean `npm ci`, lint, 32 JavaScript tests, production build, migration alignment/dry-run, database lint, zero-vulnerability production dependency audit, secret/bundle scan, 40-way load probes, and the rollback-only scale fixture passed. Hosted development is not production-equivalent staging.

## Portal UX, Profile And Member-Code Verification

On 2026-09-01, `npm test` passed 37/37 tests, including IIIW sponsor validation, profile allowlisting and complete portal-route chrome classification. The new pgTAP suite passed 19/19 assertions. The guarded hosted concurrency test allocated adjacent unique `IIIW1002` and `IIIW1003` codes, verified profile mutation boundaries and removed its fixtures. The authenticated Chrome audit passed affiliate/admin routes at 1440x1000 and mobile dashboard/profile/drawer at 390x844 with no horizontal overflow or public footer. Lint, production build, database lint, migration alignment/dry-run and production dependency audit passed.

The September 2026 responsive interaction pass expands `scripts/visual-portal-qa.mjs` to all affiliate routes and representative admin routes at 390x844. It records page overflow, public-chrome absence, portal logo destination, account-menu outside dismissal, tooltip visibility, and screenshots. `tests/integration/phase4-hosted.mjs` now removes its temporary genealogy node and disables its test profile after preserving immutable KYC/audit evidence.

Use Node 20 or Node 22 LTS for installs and production builds, as enforced by `package.json`. Next.js 15.5.24 completed the 36-page production build on Node 22.22.3; Node 24.18.0 compiled the source but failed in Next's internal Pages Router manifest collection for `/_document`.

On 2026-09-05, lint and 40/40 JavaScript tests passed. The Chrome audit covered a real seeded plot grid on desktop/mobile and failed on page overflow, public portal chrome, or visible Supabase configuration errors. Plot Realtime connected successfully, signup controls measured 40px, and the Node 22 production build generated all 36 pages. `tests/supabase-config.test.mjs` guards literal browser-inlineable public environment access and friendly KYC status presentation.
