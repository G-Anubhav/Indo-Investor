# Phase 2 Requirements Matrix

`Implemented` means repository code exists and the applicable hosted verification passed on the linked development project.

| Requirement | Implementation | Database Object | Test | Status / Assumption |
|---|---|---|---|---|
| Binary genealogy persisted | Phase 2 migration | `network_nodes` | Phase 2 pgTAP | Implemented |
| Sponsor, parent, left/right placement | Signup metadata + initialization trigger | `initialize_network_node` | pgTAP placement tests | Implemented; explicit leg, no spillover rule invented |
| One child per parent leg | Unique partial index and locked sponsor row | `network_one_child_per_leg_idx` | duplicate-left pgTAP | Implemented |
| Immutable genealogy/history | Mutation trigger and no client grants | `network_genealogy_immutable` | hosted + pgTAP mutation denial | Implemented |
| Scalable recursive retrieval | Database recursive CTE with bounded depth | `get_network_tree`, `get_network_index` | hosted recursive query | Implemented |
| Authenticated user's root | `/network` uses Auth UUID | `get_network_tree` | presentation + hosted tests | Implemented |
| Temporary-root double-click | `NetworkTree.jsx` query-state navigation | authorized subtree RPC | presentation test | Implemented; visualization only |
| Empty left/right positions | Explicit empty node component | unique parent/leg model | presentation + pgTAP | Implemented |
| Registration from empty position | Signup query context and server revalidation | `lookup_network_sponsor`, trigger | signup validation | Implemented |
| Node name/rank/volume/downline hover | Node tooltip | nullable rank/sales, computed downline | tree shaping | Implemented; unavailable shown instead of fake metrics |
| Direct referrals | Paginated report route/table | `get_direct_referrals` | hosted test | Implemented |
| Total Network Index | Paginated recursive table | `get_network_index` | hosted test | Implemented |
| Onboarding/status/purchase history | Real joined/status/sold-count fields | network/plot queries | pgTAP + hosted | Implemented; no payment history fabricated |
| Active/Hold/Pending KYC filters | Server RPC status filter | `network_member_status` | filter unit/hosted | Implemented; KYC workflow deferred |
| Left/Right filters and search | Server-side normalized filters | `get_network_index` | filter unit/hosted | Implemented |
| Project/development model | Active project list | `real_estate_projects` | pgTAP/hosted reads | Implemented |
| Variable plot matrix | Row/column-driven grid | `plots` unique coordinates | hosted seed/UI | Implemented |
| Available/hold/sold states | Accessible labeled green/yellow/red cells | plot enum/state constraint | unit + pgTAP | Implemented |
| Reservation entry point | Plot dialog hold action | `acquire_plot_hold` | hosted/pgTAP | Implemented; no payment/booking engine |
| Exact 48-hour hold | DB timestamp and duration constraint | `plot_hold_exact_duration` | pgTAP duration test | Implemented |
| Atomic concurrent acquisition | Plot row lock + unique active hold | `acquire_plot_hold`, unique index | hosted simultaneous requests | Implemented and verified |
| Sold plot protection | Controlled status machine | plot integrity constraint/RPC | pgTAP sold test | Implemented |
| Expired hold release | Five-minute cron + lazy read/acquire expiry | `expire_plot_holds`, `cron.job` | hosted pgTAP expiry test | Implemented and verified |
| Realtime inventory | Project-filtered `plots` subscription + revalidation | `supabase_realtime` publication | hosted event test | Implemented and verified |
| Affiliate authorization | Subtree/project reads and RPC-only writes | Phase 2 RLS/grants | hosted + pgTAP | Implemented |
| Executive/admin foundation | Trusted database role predicates | RLS and release RPC | pgTAP admin read | Implemented; no admin CMS |
| Anonymous denial | No table grants/policies | all Phase 2 tables | pgTAP/hosted | Implemented |
| Development examples | Guarded hosted seed | demo identities/project/plots | hosted suite | Implemented; development only |
| No Phase 3 functionality | Hold-only UI and schema foundation | booking references only | code review | Satisfied |
