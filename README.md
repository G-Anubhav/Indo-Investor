# Indo Investor

Next.js real-estate website and Supabase-backed affiliate portal. Phase 1 provides secure authentication and authorization. Phase 2 adds the binary network, downline reports, project/plot inventory, atomic 48-hour holds, and focused Supabase Realtime updates. Wallets, payments, commissions, and other later-phase modules remain intentionally absent.

## Start Here

1. Read [docs/requirements.md](docs/requirements.md) and [docs/architecture.md](docs/architecture.md).
2. Complete [Phase 1 setup](docs/phase-1-manual-setup.md), then [Phase 2 setup](docs/phase-2-manual-setup.md).
3. Copy `.env.example` to `.env.local` and supply local values.
4. Install and run:

```powershell
npm install
npm run dev
```

The site runs at `http://localhost:3000` by default.

## Checks

```powershell
npm run check
npm test
npm run build
npm run test:hosted
```

`npm run test:hosted` requires a linked, migrated development project and the guarded test accounts. Local Docker is optional. See [docs/testing.md](docs/testing.md).

## Documentation

- [Implementation status](docs/implementation-status.md)
- [Database and RLS](docs/database.md)
- [Security model](docs/security.md)
- [Testing](docs/testing.md)
- [Phase 1 requirements matrix](docs/phase-1-requirements-matrix.md)
- [Phase 1 file change report](docs/phase-1-file-change-report.md)
- [Phase 2 plan](docs/phase-2-plan.md)
- [Phase 2 requirements matrix](docs/phase-2-requirements-matrix.md)
- [Phase 2 file change report](docs/phase-2-file-change-report.md)
