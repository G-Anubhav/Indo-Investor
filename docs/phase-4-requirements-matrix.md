# Phase 4 Requirements Matrix

| Requirement | Implementation | Database object | Test | Status / Notes |
| --- | --- | --- | --- | --- |
| Manual PAN/Aadhaar/bank KYC | `/kyc`, Phase 4 actions | `kyc_submissions`, `kyc_sensitive_data` | unit + hosted | Complete; Aadhaar minimized to last four digits |
| Private document upload | server magic-byte/hash validation | `kyc-private`, intents/documents | hosted direct-upload denial | Complete; PDF/JPEG/PNG, 5 MiB |
| Version/history integrity | terminal/version triggers | submissions/documents/events | pgTAP + hosted | Complete |
| Admin review queue/detail | `/admin/kyc`, `/admin/kyc/[id]` | owner/executive RLS | hosted affiliate denial | Complete |
| Approve/reject/resubmit | `admin_review_kyc` | state constraints + row lock | concurrent hosted review | Complete |
| Protected-value reveal | explicit review query | Vault/pgcrypto + audit | hosted reveal audit | Complete |
| Withdrawal/deed gate | eligibility RPCs | latest approved submission | hosted before/after approval | Complete; no transaction workflow |
| RLS/IDOR/privilege control | forced RLS, grants, role RPCs | all Phase 4 tables | 18 pgTAP + hosted | Complete |
| Audit trail | review events + security audit | immutable event tables | hosted audit assertion | Complete |
| Rate limiting | database fixed windows | `security_rate_limits` | hosted paths exercised | Complete; thresholds documented in SQL |
| Security headers | `next.config.mjs` | N/A | build + HTTP verification | Complete |
| Performance testing | concurrent hosted probe | indexes/queries | `phase4-load.mjs` | Complete; not an SLA |
| Security audit | cross-phase grant migration + report | migration `004` | advisor/lint/regressions | Complete with documented intentional warnings |
| Automated KYC provider | Not implemented | N/A | N/A | Intentionally excluded |
| Withdrawals/payment gateway/deeds | Eligibility only | N/A | gate test | Intentionally excluded |
