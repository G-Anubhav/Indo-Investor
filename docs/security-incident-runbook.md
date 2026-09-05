# Security Incident Runbook

For every incident: preserve evidence, record UTC times, appoint incident command, limit access, avoid sensitive values in tickets/chat, and involve legal/compliance for notification decisions. This is a technical playbook, not legal advice.

## Service Credential Leak
Contain affected deployment, revoke/rotate the exposed key through Supabase/deployment controls, redeploy, invalidate affected sessions where appropriate, search logs/audit for misuse, and verify no client bundle contains the replacement.

## KYC Exposure
Disable affected document access/upload, preserve Storage/database/access logs, identify exact objects/users/times, rotate implicated credentials/signing paths, verify private bucket/policies, and defer notification/deletion decisions to legal/compliance.

## Privileged Account Compromise
Revoke account role/session through trusted service operations, rotate credentials and MFA factors, audit role/document/financial actions, freeze affected privileged processing, and provision emergency access only through approved governance.

## Financial Inconsistency
Disable financial processing through runtime configuration, preserve journals/rules/job evidence, run reconciliation, identify scope and cause, and use reviewed compensating journals only. Never edit posted records or balances.

## Role Escalation
Revoke access, invalidate sessions, inspect `security_audit_log` and function/grant changes, verify migrations/RLS against source, and check all privileged actions by the identity.

## Database Compromise
Isolate application/database access, rotate database/API/Vault/service credentials in a controlled order, preserve provider logs, assess backup integrity, restore to isolation if needed, run full security/financial/KYC validation, and obtain incident approval before reopening.

After containment, document cause, affected data/actions, recovery validation, ownership, corrective work and a tested prevention measure.
