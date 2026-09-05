# Business Policy Dependencies

Engineering does not set these policies. Their approved decisions must identify an owner, effective date, review date, and evidence location.

| Decision | Required owner | Technical boundary |
| --- | --- | --- |
| Admin/executive grant and revocation, maker-checker separation, emergency access, dormant accounts, access-review frequency | Security and business leadership | service-only role RPC, MFA gate, immutable audit |
| KYC evidence standards, reviewer hierarchy, expiry/reverification, automated provider/scanner | Compliance | versioned submissions, review events, scan-state boundary |
| KYC/document retention, deletion, privacy correction/export requests | Legal/privacy | private Storage and immutable audit; no automatic deletion configured |
| Incident severity, escalation, customer communication | Security/legal/operations | incident runbook and audit evidence |
| Commission rates, caps, cycles, incentives, qualifications, clawbacks and tax | Finance/business/legal | production financial configuration gate |
| Withdrawal eligibility, approval and bank verification | Finance/compliance | not implemented; KYC eligibility foundation only |
| Audit retention and legal holds | Legal/security | append-only database records; retention not automated |

No legal rights, regulatory notification deadline, tax rule, or retention period is inferred by this document.
