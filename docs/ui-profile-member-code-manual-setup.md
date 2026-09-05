# UI, Profile And Member-Code Manual Setup

1. Link the intended Supabase environment and run `supabase db push --linked`. Migrations `202609010007` and `202609010008` initialize the allocator and convert every existing code automatically; do not create/reset the counter manually.
2. Run `npx supabase db query --linked --file supabase/tests/ui_profile_member_code.test.sql` against staging/development.
3. Notify existing users that their member/sponsor code changes to the new IIIW value. Genealogy and other UUID relationships do not require migration.
4. Run `npm ci`, `npm test`, `npm run lint`, and `npm run build`, then deploy/rebuild the Next.js application so middleware and route bundles include `/profile`.
5. In guarded development only, `npm run test:ui-profile-hosted` verifies real concurrent Auth provisioning. Do not run fixture creation against production.
6. Use `VISUAL_QA_BASE_URL` and optionally `CHROME_PATH` to rerun `npm run test:visual-portal` against a local/staging instance with guarded development credentials.

No new environment variable, Supabase dashboard setting, dependency or profile-table change is required. Production deployment still follows the existing launch-blocker documentation.
