const english = {
  navigationKyc: "KYC & compliance", navigationReview: "KYC review",
  eyebrow: "Identity verification", title: "KYC & bank verification",
  description: "Submit your identity and bank proof for secure manual review.",
  details: "Protected details", documents: "Required documents", history: "Review history",
  pan: "PAN number", aadhaar: "Aadhaar last 4 digits", bankAccount: "Bank account number",
  ifsc: "IFSC code", accountHolder: "Account holder name", save: "Save protected details",
  upload: "Upload", submit: "Submit for review", status: "Status", version: "Version",
  queueTitle: "KYC review queue", queueDescription: "Review submitted identity and bank evidence with a complete decision trail.",
  applicant: "Applicant", submitted: "Submitted", actions: "Actions", review: "Review",
  approve: "Approve", reject: "Reject", resubmit: "Request resubmission", reason: "Decision reason",
  notes: "Internal review notes", reveal: "Reveal protected details", download: "Open document",
  noSubmission: "No KYC submission has been started.", noData: "No records found.",
  saved: "Your protected details were saved.", uploaded: "Document uploaded securely.",
  submittedMessage: "Your KYC is awaiting review.", reviewed: "The review decision was recorded.",
  failed: "The operation could not be completed. Check the fields and try again.",
};
const dictionaries = { en: english, ru: english, hi: english };
export function getPhase4Dictionary(locale) { return dictionaries[locale] || english; }

const statusLabels = {
  draft: "In progress",
  pending_review: "Under review",
  approved: "Approved",
  rejected: "Rejected",
  resubmission_required: "Resubmission required",
};

export function formatKycStatus(status) {
  return statusLabels[status] || status?.replaceAll("_", " ") || "Not started";
}
