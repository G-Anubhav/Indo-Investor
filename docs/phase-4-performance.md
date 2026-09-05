# Phase 4 Performance

## Hosted Probe

Executed `npm.cmd run test:kyc-load` against the linked hosted development project on 2026-09-01. Forty requests were issued concurrently for each read path.

| Path | Requests | Errors | p50 | p95 | Max |
| --- | ---: | ---: | ---: | ---: | ---: |
| Member `can_withdraw` RPC | 40 | 0 | 1,237 ms | 1,261 ms | 1,262 ms |
| Executive pending KYC queue, first 25 | 40 | 0 | 965 ms | 1,245 ms | 1,257 ms |

These are engineering observations from a development tier and network, not production SLAs. The provisional target of p95 below 1.5 seconds and error rate below 1% was met for these paths.

## Rollback-Only Scale Fixture

`tests/performance/phase4-scale.sql` inserted and exercised 1,000 network members/KYC submissions/document records, 1,000 plots, and 1,000 balanced posted journals inside one hosted transaction, then rolled everything back.

| Database path | Rows returned | Execution time |
| --- | ---: | ---: |
| Network tree, depth 5 | 6 | 47.23 ms |
| Network index, page 50 | 50 | 36.58 ms |
| Project inventory | 1,000 | 1.30 ms |
| KYC queue, page 25 | 25 | 1.36 ms |
| Wallet history, page 50 | 50 | 0.56 ms |

Fixture insertion was 1,136.71 ms for network/KYC, 27.59 ms for plots, and 303.17 ms for journals. Rendering remains bounded: tree depth is controlled, tabular pages are paginated/limited, and document bytes are not loaded by list pages.

## Design Controls

- Review queue uses `(status, submitted_at desc, id)` and bounded 25-row pagination.
- User history uses `(user_id, version desc)`.
- Document and event views use submission/user indexes and bounded lists.
- PAN uniqueness uses a keyed fingerprint primary key; plaintext is never indexed.
- Rate-limit and upload-intent cleanup runs daily through `pg_cron`.
- KYC reads do not download document content. Signed links are created only on explicit review action.

## Page Query Baseline

Static query-path review (excluding the shared Auth/profile check) found: dashboard 0 page-data calls; network 2 parallel calls; network index 1 RPC; referrals 1 RPC; inventory list 2 calls including lazy hold expiry; project inventory 3 calls; earnings 3 parallel reads; property payments 2-3 bounded reads; admin financials 8 parallel bounded reads; KYC user 1 history read plus 3 parallel current-state calls; KYC queue 1 paginated read plus an optional bounded profile search. Wallets currently perform one balance RPC per two fixed wallet types and one 50-row history read, so it is bounded but should be consolidated if wallet types become dynamic.

The production build emitted 36 statically generated pages and dynamic portal routes with shared App Router JavaScript of approximately 103 kB. The interactive tree remains depth-limited and tables use page sizes of 20-50; no portal route intentionally renders an unbounded network or financial history.

## Limitations

The probe did not establish production capacity, geographic latency, malware-scanning overhead, very large document throughput, or sustained soak behavior. Before launch, run staging tests with representative queue/history volume, hosting region, edge path, reviewer concurrency, and the selected scanning pipeline. Monitor Postgres CPU/IO, connection pool, Storage latency, RPC p95/p99, error rate, cron health, and audit growth.

## Final Closure Rerun

On 2026-09-01 the 40-concurrent hosted-development probe again produced zero errors. Member eligibility measured p50 1,588 ms / p95 1,713 ms; the executive KYC queue measured p50 1,406 ms / p95 1,611 ms. The rollback-only 1,000-row fixture completed; representative query times were inventory 0.70 ms, KYC queue 1.29 ms, wallet history 0.56 ms, network index 220.75 ms, and depth-5 tree 232.62 ms. Fixture setup was slower than the previous run.

Results vary on the hosted development tier and are not production SLAs. Production-equivalent staging, browser rendering, scanner latency, sustained concurrency, capacity limits, and soak behavior remain unverified.
