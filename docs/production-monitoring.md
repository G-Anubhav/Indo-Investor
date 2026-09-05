# Production Monitoring

The application exposes `GET /api/health`, returning only overall application/database state. It does not reveal environment values or schema details. `production_health_snapshot()` is service-only and checks runtime configuration, private KYC bucket, cron presence, and incomplete KYC scans.

## Required Signals

Alert on sustained authentication/authorization failures, 5xx rate, health failures, database saturation/errors, KYC scan failures or queue age, cron failures, compensation/reconciliation failures, financial gate rejections, role changes, document-access anomalies, and unexpected audit gaps. Keep sensitive identity, bank, PAN/Aadhaar, document URLs, tokens, and secret values out of logs.

## Operations

- Deployment platform: HTTP errors, latency, availability and function failures.
- Supabase Logs/Log Drains: Auth, Postgres, Storage, Realtime and API errors.
- Scheduled probe: `/api/health`; alert on non-200/`degraded`.
- Database job monitor: `cron.job_run_details`, expected cadence and last success.
- Security review: `security_audit_log` and KYC review/access events.

No external monitoring or paging destination is configured by the repository. Operations must select the platform, retention, alert thresholds, on-call routing and test alerts before launch.
