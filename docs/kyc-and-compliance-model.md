# KYC And Compliance Model

## Purpose

Phase 4 provides manual identity and bank-evidence collection, controlled executive review, immutable version history, and eligibility predicates. It does not claim regulatory certification, verify documents automatically, move money, or finalize deeds.

## Data Minimization

- PAN, bank account, IFSC, and account-holder name are encrypted with `pgcrypto` using a key held in Supabase Vault.
- Aadhaar is limited to encrypted last four digits plus a private evidence document. No full Aadhaar number field exists.
- A keyed PAN fingerprint prevents one PAN from being registered to multiple accounts while allowing historical versions for the same account.
- Lists expose status and document metadata, not protected values. Explicit executive reveal is rate-limited and audited.

## Lifecycle

`draft -> pending_review -> approved | rejected | resubmission_required`.

Terminal versions are immutable. Rejected/resubmission-required users create a new incremented version; prior decisions and evidence metadata remain historical. Pending and approved submissions cannot be edited by the member. Executives cannot review their own submission.

## Documents

Required evidence types are PAN, Aadhaar, and bank proof. PDF, JPEG, and PNG are accepted up to 5 MiB. The server checks declared MIME, extension, magic bytes, size, and SHA-256 before uploading to the private `kyc-private` bucket. Random object keys contain only UUIDs and document type. Browser roles have no Storage policy.

Executives request a document through an authorized RPC, which records access before the server creates a two-minute signed URL. Signed URLs and document contents are never logged.

## Eligibility

`can_withdraw` and `can_finalize_deed` return true only for an active account whose latest KYC version is approved. They are eligibility checks, not transaction APIs. Phase 4 creates no withdrawal, payout, bank transfer, or deed mutation.

## Decisions Required Before Production

Qualified Indian legal/compliance counsel must approve consent language, PAN/Aadhaar handling, retention/deletion, privacy requests, review evidence standards, KYC expiry, incident response, and regulatory notices. The business must define reviewer assignment, maker-checker separation, appeals, emergency access, role approval, and monitoring ownership.
