const english = {
  navigationWallets: "Wallets", navigationEarnings: "Earnings", navigationPayments: "Property payments", navigationFinancials: "Financial operations",
  financeEyebrow: "Financial center", walletsTitle: "Your wallets", walletsDescription: "Ledger-backed balances and posted transaction history.",
  mainCash: "Main Cash Wallet", propertyWallet: "Property Installment Wallet", availableBalance: "Available balance", transactionHistory: "Transaction history",
  earningsTitle: "Earnings", earningsDescription: "Verified compensation results calculated from configured rule versions.", directCommissions: "Direct referral", binaryCommissions: "Binary matching", monthlyIncentives: "Monthly incentives",
  paymentsTitle: "Property payments", paymentsDescription: "Purchase obligations, installment schedules, and manually verified payments.", totalPayable: "Total payable", paid: "Paid", outstanding: "Outstanding", dueDate: "Due date", installment: "Installment", amount: "Amount", status: "Status", noData: "No financial records are available yet.",
  adminTitle: "Financial operations", adminDescription: "Record and review manual property payments, inspect accounting state, and monitor reconciliation.", recordPayment: "Record manual payment", payer: "Payer", purchase: "Purchase", paymentMethod: "Payment method", paymentDate: "Payment date", reference: "Reference", notes: "Notes", submit: "Record payment", verify: "Verify", reject: "Reject", reverse: "Reverse", reason: "Reason", pendingReview: "Pending verification", paymentQueue: "Payment review queue", reconciliation: "Reconciliation", clean: "Clean", discrepancy: "Discrepancy", configuredRules: "Configured rules", workerRuns: "Worker runs", actionComplete: "Financial operation completed.", actionFailed: "The financial operation could not be completed.",
};

const russian = { ...english };
const hindi = { ...english };
const dictionaries = { en: english, ru: russian, hi: hindi };

export function getPhase3Dictionary(locale) { return dictionaries[locale] || dictionaries.en; }
