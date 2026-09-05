# Member Codes

## Format And Authority

New business identifiers use `IIIW` followed by a decimal sequence: `IIIW1002`, `IIIW1003`, `IIIW1004`, and onward. UUIDs remain the relational identity for profiles, genealogy, financial records, KYC and inventory.

Migration `202609010007_portal_profile_and_member_codes.sql` creates the forced-RLS, browser-inaccessible singleton `member_code_counters`. `generate_network_member_code()` atomically updates its row and returns the allocated value. PostgreSQL row locking serializes concurrent allocation; transaction rollback also rolls back the counter update. A unique constraint on `network_nodes.member_code` remains the final duplicate barrier. Browser roles cannot read/update the counter or execute the generator.

## Existing Data Conversion

Migration `202609010008_convert_existing_member_codes.sql` converts every existing account to the same sequence. It locks `network_nodes`, assigns collision-free temporary identifiers, then deterministically numbers members by `joined_at` and UUID as `IIIW1002`, `IIIW1003`, and onward. The counter is advanced to the next unused value and the format constraint is tightened to accept only `IIIW[0-9]{4,}`.

Sponsor, parent, profile, financial, KYC and inventory relationships are unaffected because they use UUID foreign keys, not the display code. Previously shared/bookmarked legacy sponsor codes stop resolving after this intentional conversion and users must use their new code.

## Integration

Auth provisioning remains the only normal allocation path. Signup accepts the sequential IIIW sponsor format. Tree, referrals, network index, dashboard, profile, shell identity and sponsor lookup display the business code while keeping UUIDs internal.

## Verification

`supabase/tests/ui_profile_member_code.test.sql` verifies the IIIW-only constraint, adjacent allocations, counter protection, uniqueness, sponsor lookup, profile RLS and network display. `tests/integration/ui-profile-member-code-hosted.mjs` creates two real Auth registrations simultaneously on separate valid sponsor positions and verifies unique adjacent codes. It is development-only and its fixtures are removed; do not run it against production.
