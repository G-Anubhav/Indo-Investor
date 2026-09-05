# Phase 1 File Change Report

This report covers Phase 1 work only. Unrelated pre-existing website edits in the dirty worktree are not represented as Phase 1 changes.

## Files Created

| Path | Purpose and important details |
|---|---|
| `.env.example` | Hosted Supabase variables plus server-only guarded development seed/SMTP placeholders; contains no credentials. |
| `AGENTS.md` | Concise repository engineering and security rules with documentation pointers. |
| `docs/requirements.md` | FRD Phase 1 interpretation, decisions, and explicit boundary. |
| `docs/architecture.md` | Runtime layers, trust boundaries, session/recovery flows, and future compatibility. |
| `docs/database.md` | Schema, functions, triggers, grants, RLS, cascades, and migration process. |
| `docs/security.md` | Implemented controls, rate-limit/audit limits, secrets, CSRF, and deployment checks. |
| `docs/testing.md` | Unit/database/manual test instructions and actual environment limitation. |
| `docs/implementation-status.md` | Honest implementation and operational status. |
| `docs/phase-1-requirements-matrix.md` | Requirement-to-code/database/test/status traceability. |
| `docs/phase-1-manual-setup.md` | Complete local, Supabase, environment, staging, and production actions. |
| `docs/phase-1-file-change-report.md` | This required change inventory. |
| `scripts/seed-dev-users.mjs` | Guarded, idempotent development-project admin/affiliate seeding with project-reference confirmation and service-role isolation. |
| `src/app/actions/auth.js` | Validated login/signup/logout/recovery/reset Server Actions and safe error mapping. |
| `src/app/actions/language.js` | Cookie and authenticated profile language persistence. |
| `src/app/auth/callback/route.js` | Supabase code/OTP exchange with destination allowlist. |
| `src/app/forgot-password/page.js` | Localized recovery request page. |
| `src/app/reset-password/page.js` | Recovery-session validation and secure password update page. |
| `src/app/unauthorized/page.js` | Localized access-denied state. |
| `src/app/(portal)/layout.js` | Server-protected authenticated layout. |
| `src/app/(portal)/dashboard/page.js` | Phase 1 identity/session dashboard without fake metrics. |
| `src/app/(portal)/admin/page.js` | Executive/admin-only protected route. |
| `src/components/Auth/AuthForm.jsx` | Shared accessible auth forms with pending/error/success states. |
| `src/components/Auth/AuthPage.jsx` | Responsive auth experience using an existing real visual asset. |
| `src/components/Auth/LanguageSelector.jsx` | English/Russian/Hindi selector. |
| `src/components/Auth/Auth.module.css` | Auth and locale-control styling. |
| `src/components/PortalShell/PortalShell.jsx` | Sidebar, top bar, profile, and logout shell. |
| `src/components/PortalShell/PortalShell.module.css` | Responsive portal layout and identity panel styling. |
| `src/components/SiteChrome/SiteChrome.jsx` | Keeps marketing chrome off standalone auth/portal routes. |
| `src/lib/auth/access.mjs` | Pure affiliate/admin access decisions. |
| `src/lib/auth/operations.mjs` | Testable Supabase Auth provider operations and safe result codes. |
| `src/lib/auth/redirects.mjs` | Internal callback destination allowlist. |
| `src/lib/auth/session.js` | Trusted `getUser()` plus RLS profile loading and route enforcement. |
| `src/lib/auth/validation.mjs` | Email, phone, signup, recovery, and password validation. |
| `src/lib/i18n/server.js` | Locale cookie/profile resolution. |
| `src/lib/i18n/translations.js` | English, Russian, and Hindi dictionaries for new portal UI. |
| `src/lib/supabase/browser.js` | Lazy browser Supabase client. |
| `src/lib/supabase/config.js` | Public environment validation and trusted site URL. |
| `src/lib/supabase/server.js` | SSR server client and persistent/session cookie behavior. |
| `src/lib/supabase/middleware.js` | Auth token revalidation/refresh and cookie propagation. |
| `src/middleware.js` | Protected route redirect boundary and session refresh integration. |
| `supabase/config.toml` | Reproducible local ports/Auth settings; SQL account seed disabled. |
| `supabase/migrations/202608300001_phase_1_identity_and_authorization.sql` | Full Phase 1 identity/authorization schema and RLS. |
| `supabase/tests/phase_1_rls.test.sql` | Transactional pgTAP cross-user, escalation, admin, and anonymous policy tests. |
| `tests/access-control.test.mjs` | Portal/admin/redirect authorization unit tests. |
| `tests/auth-operations.test.mjs` | Login/logout/signup/recovery/reset operation tests. |
| `tests/auth-validation.test.mjs` | Input and password-policy tests. |
| `tests/integration/hosted-supabase.mjs` | Opt-in hosted Auth/RLS verification using the anonymous key and guarded test accounts. |

`src/app/login/page.js` and `src/app/signup/page.js` were uncommitted placeholder files before Phase 1; Phase 1 replaces their contents with functional pages.

## Files Modified

| Path | What changed and why |
|---|---|
| `.gitignore` | Allows `.env.example` and ignores Supabase CLI temporary state. |
| `README.md` | Replaced starter text with project setup, checks, and documentation index. |
| `package.json` | Added Supabase packages, local/hosted verification scripts, secure dependency upgrades, and PostCSS override. |
| `package-lock.json` | Locked all dependency additions/upgrades and audit fixes. |
| `src/app/layout.js` | Uses route-aware `SiteChrome` so auth/portal routes have the correct standalone shell. |
| `src/app/login/page.js` | Replaced placeholder with localized functional login and session notices. |
| `src/app/signup/page.js` | Replaced placeholder with localized functional signup. |

## Files Deleted

| Path | Reason |
|---|---|
| `src/app/login/page.module.css` | Superseded by shared auth styling. |
| `src/app/signup/page.module.css` | Superseded by shared auth styling. |

Popup component deletions visible in Git status predate this Phase 1 request and are not claimed here.

## Database Changes

- Migration: `202608300001_phase_1_identity_and_authorization.sql`.
- Tables: `roles`, `profiles`, `security_audit_log`.
- Type: `account_status` (`active`, `hold`, `disabled`).
- Indexes: profile role/status; audit actor/target/action with descending timestamps; primary/unique constraints also create indexes.
- RLS policies: authenticated role-catalog read; own-or-executive profile read; own non-sensitive profile update; executive audit read.
- Functions: `set_updated_at`, `handle_new_auth_user`, `sync_auth_user_email`, `is_executive`, `record_security_event`.
- Triggers: profile timestamp, Auth-user profile creation, Auth-email synchronization.
- Seed changes: migration seeds role definitions; guarded script creates one local admin and one local affiliate from environment values.

## Dependencies

Added:

- `@supabase/supabase-js` - official Auth/database client.
- `@supabase/ssr` - server/browser clients with SSR cookie session support.

Security-updated existing direct dependencies:

- `next` to `^15.5.24`.
- `eslint-config-next` to `^15.5.24`.
- `nodemailer` to `^9.0.6`.
- `swiper` to `^14.2.0`.
- `postcss` override to `8.5.26` to resolve transitive advisories while remaining on Next 15.

No TypeScript package or TypeScript source was added.
