# Backup And Recovery

## Coverage

- PostgreSQL schema is reproducible from ordered migrations; data backup/PITR depends on the selected Supabase plan and verified production settings.
- Storage objects are not contained in PostgreSQL backups. The private KYC bucket requires a separate encrypted object-backup/export process.
- Auth settings, API keys, Realtime publication, Storage configuration, Vault secrets, cron jobs, SMTP, deployment secrets, and external monitoring must be inventoried and re-created/verified during recovery.
- Financial recovery must restore journals and entries consistently; never reconstruct wallet balances independently of the ledger.

## Recovery Procedure

1. Declare the incident, stop mutable financial/KYC processing, preserve evidence, and define the recovery point.
2. Restore PostgreSQL using the verified Supabase backup/PITR method into an isolated recovery project.
3. Apply any later repository migrations, then verify migration order, constraints, grants, RLS, cron, and Realtime.
4. Restore private Storage objects from the independently protected object backup and verify path/object metadata against `kyc_documents`.
5. Reconfigure Auth URLs/SMTP/MFA, Vault, deployment secrets, privileged users, and monitoring without copying development credentials.
6. Run pgTAP/RLS, ledger balance/reconciliation, KYC access, and non-destructive smoke tests before traffic is restored.

## Launch Gate

Operations must select backup retention, RPO/RTO, object-backup mechanism, encryption/key escrow, and restoration owners. A staging restore drill must succeed and be recorded. Until then, disaster recovery is unverified and blocks production readiness.

## Restoration Test Record

| Field | Result |
| --- | --- |
| Test date | 2026-09-01 |
| Backup source | Not supplied |
| Isolated restoration environment | Not supplied |
| Database/Storage restoration | NOT PERFORMED |
| Migrations/application connectivity | Not applicable |
| Ledger/network/inventory/KYC validation | Not applicable |
| Outcome | OPEN production blocker |

The hosted-development project was not copied or overwritten. A future drill must record source backup identifier, destination, operator, timings, row/object validation, financial reconciliation, failures and approval evidence.
