# Production Financial Configuration

Production processing is fail-closed. `platform_runtime_configuration.financial_processing_enabled` must be false until approved production rules exist. Database triggers reject financial writes when runtime configuration is incomplete, disabled, or environment-mismatched.

## Required Rules

| Area | Required values | Storage and validation |
| --- | --- | --- |
| Payment plans | annual rate, installment count, minimum down-payment rate, activation dates | `payment_plans`, constraints, `configuration_environment` |
| Direct commission | rate and qualifying event | versioned `compensation_rules.parameters` |
| Binary matching | left/right ratio, rate, cycle, cap and minimum volume if approved | versioned rule; worker is idempotent |
| Monthly incentive | threshold, consecutive months, amount | versioned rule and result evidence |
| Payout operations | payout cycle/caps and approved eligibility | business approval before activation |

The business must approve percentages, amounts, caps, cadence, qualification exclusions, tax treatment, and clawbacks. Development examples are not production defaults.

## Activation Order

1. Keep runtime environment `unconfigured` or production financial processing disabled.
2. Create new rules/plans with `configuration_environment='production'`, a new immutable version, and inactive state.
3. Validate parameters and test in staging with representative data.
4. Obtain documented business/finance approval and activate only approved versions.
5. As service role, call `configure_platform_runtime('production', true, '<approved-version-reference>', 'configure:production:enabled')`.
6. Run read-only reconciliation and smoke checks. Deactivate by using the same RPC with processing false; never edit historical rule results.

Historical transactions retain rule/version and input/output evidence. Activation and runtime changes are audited. Service credentials must never be placed in browser code.
