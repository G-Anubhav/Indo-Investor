# Data Protection And Privacy Inventory

| Data | Current technical controls | Current actions |
| --- | --- | --- |
| Profile identity/email/mobile | Authenticated RLS, server role checks | user can view/update allowed profile fields; role is protected |
| PAN/Aadhaar-related and bank data | encrypted protected values, masking, keyed PAN fingerprint, no plaintext indexes/logging | submit/review through authorized KYC workflow |
| KYC documents | private bucket, service-mediated upload/access, short signed review URL, clean-scan requirement, access audit | owner uploads; authorized non-self executive reviews clean files |
| Financial records | RLS, immutable posted journals, audit/reconciliation | authorized views; operational mutations through RPCs |
| Audit evidence | no ordinary write/delete access | privileged/security review only |

The portal has no general user-data export, erasure, or automated correction workflow. Implementing an approved privacy request may require coordinated Auth, profile, KYC, Storage, financial-retention, and immutable-audit handling. No deletion should occur until legal retention, legal-hold, and audit-preservation rules are approved.
