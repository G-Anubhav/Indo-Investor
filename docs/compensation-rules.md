# Compensation Rules

## FRD-Defined Behavior

- Direct referral bonus is based on a direct recruit's qualifying down payment and credits Main Cash Wallet.
- Binary matching compares left/right authoritative property volume, records matched volume and historical carry-forward, and credits Main Cash Wallet.
- Monthly promotion incentives evaluate team volume over consecutive months and credit Property Installment Wallet.

## Configurable Values

`compensation_rules` versions JSON parameters with activation windows. Direct rules require `rate`. Binary rules require `left_ratio`, `right_ratio`, `rate`, and `cycle`; optional values include `payout_cap` and `minimum_volume`. Monthly rules require `volume_threshold`, `consecutive_months`, and `amount`.

Rules must be both `configured` and `active`. Results retain rule ID/version, rates, inputs, outputs, and journal linkage. Workers reject incomplete rules instead of guessing values.

## Unresolved Decisions

Production percentages, ratio, cycle cadence, caps, minimum qualification, incentive thresholds/amounts, eligibility exclusions, tax treatment, and post-cycle clawback policy require written business approval. The development seed uses conspicuously labeled demo rules only.
