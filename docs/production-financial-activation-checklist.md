# Production Financial Activation Checklist

Leave `Approved value`, authority, timestamp, and version blank until written approval exists. Development samples must never be copied as production decisions.

| Required value | Proposed value | Approved value | Approval authority | Activation timestamp (UTC) | Rule/version |
| --- | --- | --- | --- | --- | --- |
| Payment-plan annual rate | Pending |  |  |  |  |
| Installment count/cadence | Pending |  |  |  |  |
| Minimum down-payment rate | Pending |  |  |  |  |
| Direct commission rate and qualification | Pending |  |  |  |  |
| Binary left/right matching ratio | Pending |  |  |  |  |
| Binary commission rate | Pending |  |  |  |  |
| Binary payout cap/minimum volume | Pending |  |  |  |  |
| Binary processing cycle | Pending |  |  |  |  |
| Incentive threshold/consecutive months | Pending |  |  |  |  |
| Incentive amount | Pending |  |  |  |  |
| Eligibility exclusions/clawbacks/tax treatment | Pending |  |  |  |  |

## Activation Gate

- [ ] Finance and authorized executive approve every applicable row.
- [ ] Legal/tax review is recorded where required.
- [ ] New `production` environment plan/rule versions are created inactive.
- [ ] Validation and idempotency/concurrency suites pass in staging.
- [ ] Active development rule versions remain classified `development` and cannot activate in production.
- [ ] Approved production versions are activated with effective timestamps.
- [ ] Service operator calls `configure_platform_runtime('production', true, '<approval-reference>', 'configure:production:enabled')`.
- [ ] Audit event, reconciliation, ledger balance and read-only smoke checks pass.
- [ ] Rollback owner can disable processing without mutating posted history.
