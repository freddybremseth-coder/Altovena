# Altovena v0.4: RealtyflowPRO-backed persistent Command reads

**Date:** 2026-10-16. **Git branch:** `feature/command-multi-agent-spec-v01`. **PR:** #4 (draft).

## Implemented in RealtyflowPRO Supabase

Target: existing Supabase project **RealtyflowPRO** (project ref `ereapsfcsqtdmzosgnnn`). No new Supabase project or billable branch was created.

- Schema `altovena` installed previously via migration `altovena_embedded_platform_core_v01`.
- An **internal** Altovena tenant was added through `altovena_internal_tenant_realtyflowpro_v01` from `db/altovena/002_realtyflowpro_internal_tenant.sql`.
  - `external_ref = 'host:realtyflowpro:altovena-internal'`
  - tenant id: `7ab8db46-c7fb-47e8-a9b0-1490932c9334`
  - Command entitlement is active. This has **no** user memberships and **no** missions.
  - This host-specific tenant is NOT created by the portable base migration for customer installations.
- Authenticated, **read-only** database access was added via migration `altovena_command_readonly_rls_v01` from `db/altovena/003_authenticated_command_reads.sql`.
  - Four SELECT-only RLS policies gate own active memberships, active tenants, active/trial product entitlements and the selected mission's tenant.
  - `public.altovena_command_missions_read` and `public.altovena_my_memberships_read` are `security_invoker = true`; they expose only selected columns through the existing Supabase Data API.
  - Only authenticated JWT sessions are granted SELECT; anonymous requests and writes are not allowed.
  - Existing RealtyFlow tables, Auth configuration and data are unchanged. The two prefixed public read views are new.
  - The `altovena` schema stays separate with no foreign keys into RealtyFlow's existing tables.

## Verification

- Standalone PostgreSQL 17 test of internal tenant seed and read-only RLS passed in the Altovena embedded schema GitHub Actions workflow #38945798250.
- Node backend/adapter and original Command integration tests passed for the latest adapter revision in runs #38945930445 and #38945930298; new schema workflow #38945930363 passed.
- Live RealtyflowPRO inspected: eight RLS-enabled Altovena tables; two SECURITY INVOKER views, four read policies, one internal tenant, one active Command entitlement, zero memberships, zero missions, no client INSERT/UPDATE/DELETE on mission records.
- Live SQL negative probe using the `authenticated` role and a nonmember UUID returned **zero missions** and **zero memberships**. This does **not** prove a real user's interactive Auth flow.
- Supabase advisor messages about missing policies on remaining tables are expected default-deny until access is deliberately reviewed.

## Vercel preview

Project `altovena-command-demo` has PREVIEW-ONLY environment variables:
- `ALTOVENA_SUPABASE_URL`
- `ALTOVENA_SUPABASE_PUBLISHABLE_KEY`

The key is a public `sb_publishable_` credential, **not** `service_role` or `sb_secret_`, configured encrypted in Vercel. No key material is stored in source code.

Preview deployment:
`https://altovena-command-demo-kf91jnzd6-freddy-bremseths-projects.vercel.app`
Status from Vercel API: **READY**. Contains:
- `GET /api/dashboard`: original fully simulated three-agent demonstration.
- `GET /api/persistent-missions?tenantId=7ab8db46-c7fb-47e8-a9b0-1490932c9334`: server-only, JWT-authenticated, RLS-scoped **read-only** mission listing.

The GET endpoint expects an authenticated RealtyflowPRO/Supabase user session passed via Bearer header. It returns 401 when no JWT is provided, 403 if active membership is absent, 200 with missions only when verified membership is granted, and 405 for non-GET. Neither this route nor the demo can create, send, publish or approve actual actions.

**Important:** Vercel Authentication also protects the preview deployment. Our external HTTP test was blocked by deployment authentication before reaching the application. Thus we have NOT verified end-to-end remote HTTP behavior. GitHub unit/DB tests and Vercel READY are independently verified.

## Next technical steps

1. **Verified RealtyFlow identity mapping:** Determine the user's Supabase Auth UUID through an authenticated session in RealtyFlow, not a name match, guess or email-based auto-grant.
2. Provision the initial operator membership in `altovena.tenant_memberships` through a trusted one-time admin path. Never let clients self-assign `owner` or `admin`.
3. Create a supported SSO/login flow between RealtyFlow and the standalone Command UI, with strict origin checks, CSRF protection and safe session/token handling. Do not ask the user to paste access tokens.
4. Test the end-to-end authenticated 200/401/403 flow with a real authorized user and a second disallowed user, respecting Vercel Authentication.
5. Build a separate **write-enabled** API with mission creation, approvals, rate limits and transactional evidence, gated by authenticated roles and product entitlements. Existing write APIs remain disabled.
6. Add audit logging without secrets, monitoring, budget control, database resource guards and clean rollback migrations.
7. Only after this make the real persisted missions screen available to the internal user.

## Future SaaS and installations

Run `db/altovena/001_embedded_platform_schema.sql` and versioned generic access migrations on each customer's own Supabase/PostgreSQL instance. Do not run the host-specific internal-tenant seed. Customer Auth, entitlements, rate limits, secrets, storage, backups and service deployment must be provisioned independently. The future distribution remains portable; RealtyflowPRO is simply the current shared hosting environment.
