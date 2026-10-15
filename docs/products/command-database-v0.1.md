# Mission Database v0.1 – migration review

The SQL in `db/command/001_schema_review.sql` is an **unapplied migration proposal**, not a production-ready release.

## Decisions
- UUID tenant IDs and composite foreign keys prevent accidental cross-tenant relationships.
- RLS is enabled with no client policies, and schema access is revoked from anonymous/authenticated roles.
- Mission versions and task idempotency keys prepare for safe optimistic updates and retries.
- Events are recorded separately from mutable mission status.
- Approvals bind action intent to payload hash and an expiry timestamp.

## Mandatory next work before applying
1. Verify actual Supabase tenancy/membership design; create tested read/write RLS rules using authenticated tenant membership.
2. Add append-only event enforcement and audit retention; hash-chain storage alone is not tamper proof.
3. Implement transactional job claims, lease expiry, retries, and deduplication.
4. Implement atomic authorization/approval consumption that prevents races and duplicate side effects.
5. Add indexes, migrations, backup/restore, rollback strategy, and performance tests in disposable Supabase.
6. Review grants for actual deployed database roles and dedicated server-side client.
7. Confirm consent/legal basis, retention and deletion flows before real prospects.
8. Keep demo in simulation mode until security and integration tests pass.

## Acceptance criteria
No cross-tenant joins or reads even with guessed identifiers; anonymous client access denied; expired/modified approvals denied; duplicate requests do not duplicate side effects; worker restart resumes; history remains verifiable.

## Isolated PostgreSQL 16 integration gate
`.github/workflows/command-postgres.yml` launches an ephemeral PostgreSQL 16 service with test-only database credentials, then applies the review schema and verifies:
- table creation and enabled deny-by-default RLS;
- no anonymous/authenticated client grants and no broad policies;
- tenant-aware foreign keys for task, event and approval data;
- duplicate idempotency key rejection;
- self-approval check;
- state persistence across fresh database connections;
- version-based update protection against stale writers;
- append-only event mutation guard.

Run SQL in this order **only against disposable databases**:
1. `db/command/tests/001_roles.sql`
2. `db/command/001_schema_review.sql`
3. `db/command/002_event_immutability_review.sql`
4. `db/command/tests/002_integration.sql`
5. `db/command/tests/003_lifecycle.sql`
6. `db/command/tests/004_event_immutability.sql`

This CI check proves the relational schema behaves as designed in vanilla Postgres, not that the Supabase runtime has correct auth or is operationally ready. Real client policies remain intentionally absent and the UI remains read-only/simulated. Privileged owners can disable triggers, so these are DML safety controls, not cryptographically tamper-proof audit storage.
