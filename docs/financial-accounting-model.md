# Financial Accounting Model

## Currency And Precision

Phase 3 supports INR only. Money is PostgreSQL `numeric(18,2)`, rates are `numeric(9,6)`, and calculations round to two decimals. Installment division truncates regular installments to paise and assigns the residual to the final installment.

## Accounts And Wallets

Each user has separate Main Cash and Property Installment wallet liability accounts. Platform accounts represent cash clearing, property receivable, commission/incentive expense, top-up clearing, and adjustment clearing. These classifications are an operational model, not final legal or tax accounting advice.

Wallet balance is the posted credit total minus posted debit total for that wallet account. No mutable balance is exposed. Main Cash receives direct/binary compensation and may fund property obligations. Property Wallet receives incentives/approved top-ups and may fund property obligations; it cannot be withdrawn in Phase 3.

## Journals And Entries

Every journal has a transaction type, reference, actor/origin, currency, idempotency key, and posting time. Each entry contains exactly one positive debit or credit. Posting validates at least two entries and equal totals. Once posted, both journal and entries are immutable.

Manual property receipt: debit Cash Clearing, credit Property Receivable. Wallet credit: debit the configured expense/clearing account, credit the wallet liability. Wallet property payment: debit wallet liability, credit Property Receivable. Reversals reproduce the original entries with debit/credit exchanged and link through `reverses_journal_id`.

## Payments And Reconciliation

Recording does not post money. Verification locks and allocates the payment, posts its journal, and writes audit/notification records atomically. Rejection never posts. Reversal posts a separate balancing journal and reverses allocations and related direct compensation when qualification is lost.

Reconciliation detects unbalanced journals and differences between installment paid totals and manual plus wallet-funded allocation evidence. It records findings without changing history.
