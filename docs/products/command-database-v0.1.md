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
