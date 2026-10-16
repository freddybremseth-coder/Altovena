# Command v0.3 — provider-authenticated, read-only Persistent Missions

**Status: development branch only. Not activated on Vercel and not linked to any Supabase database.**

## What is implemented

1. `db/command/006_public_rest_views_review.sql` defines two public **security-invoker** views for RLS-protected reads. Only selected columns are exposed; only the `authenticated` database role gets SELECT. No write permissions.
2. `db/command/tests/009_public_view_rls.sql` tests PostgreSQL tenant isolation through those views in the disposable CI database.
3. `prototype/command-supabase-rest-adapter.mjs` calls Supabase Auth `GET /auth/v1/user` with the user's Bearer token, then checks active membership via a PostgREST view, and lists missions through a second view under the same user's JWT and RLS. **No service-role key or admin credentials.**
4. `command-demo/api/persistent-missions.js` is a read-only GET handler. It refuses requests when environment settings are absent, requires Bearer auth, limits pages to 100 rows, and returns no sensitive upstream error text. No write endpoint exists.
5. Unit tests cover auth failures, revoked/absent membership, cross-tenant access, provider outages, GET-only behavior, origin/key validation and tenant-bound query parameters.

## Required environment for a later isolated deployment

Server-side, on a **separate Altovena Command Supabase development project**:
- `COMMAND_SUPABASE_URL=https://<dedicated-project-ref>.supabase.co`
- `COMMAND_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...`

The server sends requests using the user's Supabase Auth access token. **Never use `service_role` or `sb_secret_` here**, and never expose a service key to a browser. The implementation currently accepts Supabase-hosted HTTPS URLs and new-format publishable keys only.

The Vercel route is not in the current deployed demo and is not usable until these are configured and the reviewed schema, membership data and views are installed on a separate development database.

## REST endpoint specification

`GET /api/persistent-missions?tenantId=<uuid>&limit=20`

`Authorization: Bearer <valid Supabase user access token>`

Responses:
- 200: `{mode:"PERSISTENT_READ_ONLY", missions:[...], count:N}`
- 400: malformed tenant identifier / pagination
- 401: no/invalid session
- 403: not an active tenant member
- 405: unsupported method
- 503: database not configured or Auth provider unavailable
- 502: other data provider failures, without internal details

A client-supplied tenant ID selects the requested organization, **not permission**. Permission is resolved from Supabase Auth and current RLS membership. An attacker cannot authorize themselves merely by knowing another tenant ID.

## Before activating in a real environment

1. Verify separate Supabase project, organization and any costs with the user.
2. Security-review grants and policies, including all default privileges and actual PostgREST schema exposure.
3. Apply the reviewed DDL only to that separate disposable/development project through a controlled migration.
4. Verify a real Auth user session and create test memberships through trusted admin-controlled onboarding (not client writable).
5. Exercise actual HTTP requests for two distinct tenants, anon, revoked member and expired tokens; confirm 200/401/403/405 and lack of writes.
6. Add rate limiting, access logs without tokens, operational monitoring, deployment check and rollback.
7. Only then enable a customer-facing saved-missions page. Creating/scheduling/approving missions remains blocked pending separate transactional permission work.

**The existing Vercel Command demo remains fully simulated and unchanged. The current PR stays draft.**
