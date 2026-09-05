# Engineering Guide

- Treat `real_estate_backoffice_functional_documentation_FRD.pdf` and `docs/requirements.md` as product requirements.
- Phase 4 is the active completed boundary. Keep withdrawal transactions, deed workflows, payment gateways, automated KYC providers, helpdesk, and later-phase behavior out; see `docs/implementation-status.md`.
- Use JavaScript, Next.js App Router, CSS modules, and existing project patterns.
- Supabase Auth owns passwords. Never store passwords in application tables.
- Authorization must be enforced server-side and by PostgreSQL RLS. UI visibility is not authorization.
- Never expose the service-role key or other privileged secrets through `NEXT_PUBLIC_*` variables.
- Add schema changes as ordered migrations under `supabase/migrations` and add RLS tests.
- Treat genealogy and plot status as database-authoritative. Browser code may never mutate them directly.
- Treat payments, wallet balances, journals, compensation, and worker results as database-authoritative. Posted accounting history is immutable and corrections use reversals.
- Treat KYC status, review history, eligibility, protected values, and private document access as database/server-authoritative. Never log or expose PAN, Aadhaar, bank numbers, signed URLs, Vault material, or service-role credentials.
- Use translation keys for portal UI. Supported locales are English, Russian, and Hindi.
- Run lint, unit tests, database tests, and the production build before release.

Detailed decisions: `docs/architecture.md`, `docs/database.md`, `docs/security.md`, and `docs/testing.md`.
