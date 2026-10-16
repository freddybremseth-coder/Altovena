# Altovena data location: RealtyflowPRO-first

## Decision (2026-10-16)

For the initial development phase, use **Supabase RealtyflowPRO** as the PostgreSQL host and create a separate private PostgreSQL schema named `altovena`. This is a logical separation inside the same Supabase project; it is **not** a physical isolation of CPU, disk, Auth or the operating environment.

For future commercial SaaS contracts and installations, deploy the same portable Altovena schema into a customer's own Supabase project / PostgreSQL database, subject to the contracted hosting model. Do not reference RealtyFlow's `public` tables from Altovena migrations so that the Altovena schema can be moved independently.

## Current schema (v0.1)

`db/altovena/001_embedded_platform_schema.sql`:
- `tenants`: named logical customers
- `products`: product catalog; seeds only the known `command` product
- `tenant_products`: entitlement to a specific product, per tenant
- `tenant_memberships`: user UUID / tenant association, ready for identity binding
- `missions`: missions by product and tenant with versions and spending limits
- `tasks`: typed agent work, unique per mission idempotency keys
- `events`: append-only DML audit rows, mission/task composite FKs
- `approvals`: intent-bound human approvals, status and expiry

### Hard isolation boundaries

- The migration does not alter, drop or grant privileges on any existing RealtyFlow tables, policies or extensions.
- It does not create membership records, user accounts, automatic mission execution or external actions.
- The `altovena` schema is **default-deny**, not exposed to anonymous/authenticated/service-role API traffic.
- RLS is enabled for all eight tables, with no client policies yet.
- No client database keys are introduced. Access must be added in a separate reviewed integration with real provider-verified identity, memberships, narrow privileges and RLS tests.
- Isolation is currently **logical within a shared infrastructure**: database resource exhaustion and project outages can still affect both systems. Monitor resource usage.

### Compatibility and migration warning

Earlier prototype-only schemas under `db/command/*` remain useful as experimental reference and are **not** installed on RealtyflowPRO. App prototype modules referring to `command.` must be adapted for the new `altovena.` runtime contract **before activation**.

`prototype/command-supabase-rest-adapter.mjs` and `command-demo/api/persistent-missions.js` currently assume REST views for the original Command draft schema. These routes are not production-connected; DO NOT point them at RealtyflowPRO until the access contract has been implemented and tested.

The Altovena schema has a schema-local `products` catalog rather than assumptions about RealtyFlow billing or brands. This supports standalone deployment later.

### Rollout gates

1. Validate SQL and cross-tenant constraints against disposable PostgreSQL 17 CI; record test link.
2. Install reviewed, non-destructive schema migration in RealtyflowPRO; inspect exactly eight new tables, RLS and grants, and record migration.
3. Independently verify existing RealtyFlow migrations/tables are unaffected.
4. Build a separate, limited database access path for Altovena with authenticated user-to-tenant membership verification, and migrate the read-only Command code to the `altovena` schema.
5. Test using an internal tenant; do not copy leads/CRM data across systems by default.
6. Before SaaS launches, validate the same migration against a completely clean database and define upgrade/export/import/backup/restore for each customer.

## Portability

The migration uses PostgreSQL UUID, timestamptz, jsonb, FKs, checks, RLS and standard plpgsql. On a standalone install, target platform roles (`anon`, `authenticated`, `service_role`) must already exist or be adapted, and any Supabase auth/gateway functionality must be supplied separately. This is not yet a one-click installation package.

## Installation status — verified 16 October 2026

**Installed** through the connected Supabase migration action in RealtyflowPRO, project ref `ereapsfcsqtdmzosgnnn`, migration `altovena_embedded_platform_core_v01` (recorded version `20261016174242`).

Verified after deployment:
- 8 new `altovena` tables, all with RLS enabled
- 0 memberships, 0 tenants, 0 missions, and 1 seeded Command product
- no access to the new schema for `anon`, `authenticated` or `service_role`
- no API table grants to those roles
- 0 foreign-key references from Altovena to other schemas
- append-only events DML trigger exists
- migration present in Supabase history
- portable migration + cross-tenant security tests passed in separate PostgreSQL 17 GitHub Actions, run #38941554507

Supabase's security advisor lists `rls_enabled_no_policy` for the eight Altovena tables. This is **expected at the schema-only stage**: access is deliberately denied through both schema/table privileges and RLS. Introduce audited policies only with verified identity and product authorization.

The `command` prototype API is **not yet connected** to this schema and does not have read/write access. No real jobs or customer communications were started.

For standalone customers, apply the portable schema (and future versioned migrations) to a separate database/project; then provision its own Auth, roles, storage, secrets, entitlements and monitoring. Avoid re-applying this exact migration to RealtyflowPRO; Supabase migration history already records it.
