# KYC Production Policy Dependencies

Technical security does not constitute legal/compliance approval.

| Topic | Technical capability | Business policy required | Legal/compliance approval required | Status |
| --- | --- | --- | --- | --- |
| Retention | versioned metadata, private objects, immutable events | retention owner and operational schedule | duration, legal holds and disposal approval | Open |
| Deletion | service-mediated records/objects; no automatic deletion | authorized request and maker/checker procedure | what may be deleted versus retained | Open |
| Privacy requests | data inventory and masked views | identity verification, correction/export workflow | applicable rights, deadlines and exemptions | Open |
| KYC expiry | status/version model can support new submission | re-verification triggers and user handling | validity rules | Open |
| Evidence standards | PDF/JPEG/PNG validation and three document classes | acceptable evidence and rejection reasons | sufficiency requirements | Open |
| Reviewer hierarchy | executive authorization and non-self review | reviewer tiers, assignment and escalation | segregation requirements | Open |
| Maker-checker | immutable decision history and concurrency protection | whether second approval is mandatory | regulated control determination | Open |
| Audit retention | append-only access/decision evidence | storage/monitoring owner and retrieval SLA | duration and legal-hold rules | Open |
| Incident handling | incident runbook and access logs | severity/escalation/communications | notification and authority decisions | Open |

Until approved, do not automate deletion, claim compliance, or accept production KYC documents. The scanner provider/worker is also an external production dependency.
