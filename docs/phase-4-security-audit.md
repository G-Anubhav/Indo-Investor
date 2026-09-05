# Phase 4 Security Audit

## Review Scope

Reviewed authentication/session boundaries, protected routes, roles, RLS/grants, Security Definer functions, Storage, uploads, KYC IDOR/privilege escalation, financial mutation access, headers, redirects, errors, secrets, rate limiting, audit records, dependencies, and hosted Supabase advisors.

## Implemented Findings

- Added middleware coverage for `/wallets`, `/earnings`, `/property-payments`, and `/kyc`; portal layouts continue to enforce server-side access.
- Added CSP, HSTS, frame denial, MIME sniffing prevention, referrer policy, and restricted browser permissions.
- Added forced RLS and read-only owner/executive policies for KYC records. Sensitive values, fingerprints, upload intents, and rate-limit state have no browser table grants.
- Added zero direct browser policies on `kyc-private`; server-only validated upload and audited short-lived review links are the sole object path.
- Added database rate limits for saves, upload intents, submissions, decisions, document access, and sensitive reveals.
- Revoked inherited anonymous/authenticated execution from eight Phase 1-3 internal or trigger functions in migration `202609010004`.
- Verified direct user status mutation, direct Storage upload, anonymous read, cross-user read, and affiliate review all fail on hosted Supabase.
- Verified concurrent final decisions permit exactly one success.

## Advisor Results

`supabase db lint --linked --level error` reports no schema errors. Supabase Security Advisor retains:

- `lookup_network_sponsor` anonymous Security Definer warning: intentional Phase 2 signup API. It returns only sponsor display/leg availability and does not expose private profile fields. Supabase Auth edge controls remain the abuse boundary.
- Authenticated Security Definer warnings: intentionally granted RPCs. Each is an application API with owner/role/state checks; internal composition and trigger functions were revoked.
- Leaked-password protection warning: requires enabling in Supabase Dashboard before production.

Performance Advisor has inherited `auth.uid()` init-plan and other advisory findings across older phase policies. Phase 4 policies use `(select auth.uid())`; broader optimization should be regression-tested as a dedicated maintenance migration.

`npm audit --omit=dev` reports zero vulnerabilities. `npm outdated` shows optional minor updates and major releases for Font Awesome, ESLint, Next.js, Framer Motion, and React-related packages. No dependency was added or upgraded in Phase 4; major upgrades were deferred because they are not required to remediate a known vulnerability and need a separate compatibility/regression cycle.

## Residual Risk

- The server runtime service-role key is required for validated Storage upload and signed URLs. It must remain in encrypted hosting secrets, never client bundles or logs.
- Manual review can be wrong or malicious; reviewer governance, maker-checker policy, MFA, and alerting require operational decisions.
- File signature checks do not replace malware scanning. Production must select a scanning/quarantine service before accepting untrusted documents at scale.
- CSP currently permits inline styles/scripts required by the existing Next.js/site stack. A nonce-based CSP is a future hardening option.
- Legal adequacy and retention are unresolved and must not be inferred from technical controls.
