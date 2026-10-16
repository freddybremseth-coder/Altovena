# Altovena Command v0.2 — authenticated read boundary (review-only)

This milestone prepares a **read-only** customer-facing mission list without opening any write capabilities.

## Database model

`db/command/005_authenticated_read_rls_review.sql` adds:
- `command.tenant_memberships` with `tenant_id`, `user_id`, role, and active status
- tenant-filtered `SELECT` policies for missions
- self-only membership `SELECT` policy
- narrow authenticated grants for mission and membership reads
- **no** browser writes or direct access to tasks, events or approvals

The schema is private and is not automatically a Supabase Data API schema. No changes have been applied to any real Supabase project.

## Test strategy

`db/command/tests/007_auth_shim.sql` is an isolated PostgreSQL-only fixture that emulates `auth.uid()` using a session variable. **This shim must never be deployed to Supabase.** In production JWT claims must be supplied and verified by Supabase Auth/PostgREST, never read from a client-supplied JSON body or a JWT decoded without verification.

`db/command/tests/008_membership_rls.sql` tests:
- tenant A user can read tenant A missions but not tenant B
- tenant B user can read tenant B but not tenant A
- nonmembers and missing authenticated subjects receive no rows
- an inactive membership revokes access
- direct writes are rejected and anonymous access is denied

`prototype/command-read-service.mjs` is a real, tested application-level dependency-injection boundary: it must verify the access token with the identity provider, then verify current active tenant membership before instantiating any tenant-scoped repository. The implementation does **not** ship a provider connection or authenticated HTTP route yet. A test fixture's `verifySession` must not be mistaken for a verified production login.

## Production integration gates

1. Choose a development-only Supabase project/branch, with cost approval if creation incurs charges. Do not reuse RealtyFlow production.
2. Confirm authenticated user and tenant membership sources and active session validation in Supabase Auth.
3. Implement server-only request handler deriving verified user identity via provider, never browser-provided actor IDs.
4. Execute read SQL through role/RLS-enforced database credentials. No `service_role` bypass.
5. Add request-scoped rate limiting, structured errors, audit and negative security tests against that actual Supabase environment.
6. Add mission creation and mutation behind separate transactional policy and approval gates after the read path is confirmed.
7. Gate any public UI rollout on successful integration, privacy review, and operational monitoring.

The public Vercel Command demo **remains simulated**. These changes are for the development branch and must not be promoted as live customer authentication.
