# KYC And Compliance Model

This is the FRD-requested document path. The model is implemented as manual, versioned KYC with encrypted PAN/bank fields, Aadhaar minimization to encrypted last four digits, private evidence documents, immutable review events, and database-authoritative eligibility gates.

Workflow: `draft -> pending_review -> approved | rejected | resubmission_required`. A terminal decision is immutable; correction creates a new version. Executives cannot self-review. Protected-value reveals and document access are explicit, rate-limited, and audited.

Browser roles have no access to ciphertext, fingerprints, upload intents, rate-limit state, or Storage objects. The server validates MIME, extension, size, magic bytes, and SHA-256, then uses the server-only service role to write a random object path. Review access uses an audited RPC and a two-minute signed URL.

`can_withdraw` and `can_finalize_deed` require an active profile and latest approved KYC. They do not move money or finalize a deed.

Full data classification, lifecycle, and unresolved legal/operational decisions are maintained in [kyc-and-compliance-model.md](./kyc-and-compliance-model.md). Legal counsel must approve consent, Aadhaar/PAN handling, retention/deletion, privacy requests, expiry, and evidence standards before production.
