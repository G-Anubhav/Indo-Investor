# Phase 1 Requirements Matrix

Status meanings: **Verified** means implementation and its applicable check are confirmed; **Implemented** means repository code/test exists; **Deferred** means explicitly outside Phase 1.

| Requirement | Implementation location | Database object | Test | Status | Notes / assumptions |
|---|---|---|---|---|---|
| Core Next.js framework | `src/app`, `src/components`, `package.json` | N/A | `npm run build` | Implemented | Existing App Router and CSS modules retained. |
| Browser Supabase connection | `src/lib/supabase/browser.js`, `.env.example` | N/A | Production build | Implemented | Lazy client avoids build-time secret requirements. |
| Server Supabase connection | `src/lib/supabase/server.js` | N/A | Production build | Implemented | Uses SSR cookie adapter and anonymous key under RLS. |
| Environment validation | `src/lib/supabase/config.js` | N/A | Auth error mapping; build | Implemented | Missing/invalid values produce safe UI code at runtime. |
| Reproducible identity schema | `supabase/migrations/202608300001_phase_1_identity_and_authorization.sql` | `profiles`, `roles` | Hosted integration plus optional pgTAP | Verified | Hosted migration applied; Docker is optional. |
| Auth/application profile separation | Migration and `src/lib/auth/session.js` | `auth.users`, `profiles` | Hosted integration; pgTAP initialization | Verified | No passwords in `profiles`. |
| Profile identity/name/email/mobile/status/role/language/timestamps | Migration | `profiles` | Hosted integration and pgTAP | Verified | Mobile is optional E.164; email is required. |
| Affiliate and executive/admin role model | Migration, `src/lib/auth/access.mjs` | `roles`, `profiles.role_key` | `tests/access-control.test.mjs`; hosted integration | Verified | Executive and admin both satisfy administrative route predicate. |
| Audit foundation | Migration, `docs/security.md` | `security_audit_log`, `record_security_event` | Migration confirmation; optional pgTAP | Verified | Storage/function foundation only; full event ingestion deferred. |
| UUIDs, constraints, indexes, timestamps, cascades | Migration | All Phase 1 tables | Migration and policy suites | Verified | Defined in the applied linked-project migration. |
| RLS on every application table | Migration | All Phase 1 tables | Hosted integration; optional pgTAP | Verified | Developer confirmed RLS is enabled. |
| Cross-user profile read denial | RLS policy | `profiles` | Hosted affiliate read; pgTAP | Verified | Own row or active executive only. |
| Cross-user profile write denial | RLS policy and grants | `profiles` | Hosted cross-user update; pgTAP | Verified | Update returns no target rows. |
| Self-role/status escalation prevention | Column grants, trigger default | `profiles`, `roles` | Hosted role update; pgTAP role/status | Verified | Client lacks UPDATE grant for sensitive columns. |
| Secure email/password login | `login`, auth action/operation | Supabase Auth | Unit and hosted login tests | Verified | Username login deliberately not claimed. |
| Password strength validation | `src/lib/auth/validation.mjs` | Supabase Auth config | `tests/auth-validation.test.mjs` | Implemented | 8-128 chars, mixed case, number. |
| Persistent session option | Login action, SSR server/middleware clients | Supabase Auth sessions | Build; manual cookie test | Implemented | 30-day cookie when selected, session cookie otherwise; repeat cookie inspection per deployed browser policy. |
| Forgot password and secure reset | Forgot/reset pages, actions, callback | Supabase Auth recovery tokens | Auth operation tests | Implemented | Uses Supabase expiring link/code, no custom token; delivery depends on environment SMTP configuration. |
| Logout | `logoutAction`, portal shell | Supabase Auth session | Unit and hosted logout tests | Verified | Local-scope sign-out and persistence-cookie removal. |
| Session refresh/revalidation | `src/middleware.js`, Supabase middleware utility | Supabase Auth | Access and hosted tests | Verified | `getUser()` used at middleware/server boundaries. |
| Protected application routes | Middleware and `(portal)/layout.js` | `profiles` | Access and hosted tests | Verified | Direct URL requests cannot rely on UI hiding. |
| Affiliate dashboard access | Dashboard route and guard | `profiles.role_key/status` | Access and hosted tests | Verified | Shows identity/session only. |
| Admin-only route access | Admin route and guard | `profiles.role_key/status` | Access and hosted tests | Verified | Role comes from database profile. |
| Safe profile initialization | Auth-user trigger | `handle_new_auth_user`, `profiles` | Hosted guarded seed; pgTAP initialization | Verified | Idempotent conflict behavior; always affiliate. |
| Authenticated shell | `PortalShell`, portal layout/dashboard | `profiles` | Production build; manual UI test | Implemented | Sidebar, top bar, profile, and logout. Language selection remains on auth pages only. |
| English/Russian/Hindi foundation | `src/lib/i18n`, LanguageSelector | `profiles.language_code` | Validation locale fallback; build | Implemented | Cookie persists public preference; profile persists authenticated preference. |
| Safe invalid-login/duplicate/recovery/session errors | Auth operations/actions/dictionaries | Supabase Auth | Auth unit tests | Implemented | Raw provider/database errors are not rendered. |
| Secure redirect handling | Callback and `safeAuthRedirect` | N/A | Open-redirect unit test | Implemented | Only dashboard/reset destinations accepted. |
| Authentication rate-limit consideration | Supabase Auth plus `docs/security.md` | Supabase Auth configuration | Rate-limit error unit test | Implemented as platform configuration | Distributed app limiter is not claimed. |
| Development admin/affiliate accounts | `scripts/seed-dev-users.mjs` | `auth.users`, `profiles` | Project-reference seed guards; hosted integration | Verified | Requires hosted project match, development marker, explicit confirmation, and `.example.test`. |
| Automated auth/authorization tests | `tests/*.test.mjs` | N/A | `npm test` | Implemented and passing | 16 tests passed. |
| Automated database/RLS tests | Hosted integration and pgTAP suites | Phase 1 schema | `npm run test:hosted`; optional `npm run test:db` | Verified | Hosted test reported passing; Docker remains optional. |
| Sponsor ID and target-leg onboarding | None | None | None | Deferred | Binary placement integrity is Phase 2 per requested boundary. |
| Binary tree, plots, booking, wallets, KYC, helpdesk | None | None | None | Deferred | Explicitly prohibited in Phase 1. |
