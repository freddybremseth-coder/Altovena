-- Altovena v0.2: authenticated, read-only customer mission access.
-- PostgreSQL 15+ / Supabase. Apply only after CI + security review.
-- Real membership administration remains privileged server-only.
-- Creates two narrowly scoped PUBLIC views for the default Supabase REST API.
BEGIN;

-- No access for unauthenticated clients. Authenticated users are still
-- filtered by an authenticated subject and live membership in each RLS policy.
GRANT USAGE ON SCHEMA altovena TO authenticated;
GRANT SELECT (tenant_id,user_id,role,active)
  ON altovena.tenant_memberships TO authenticated;
GRANT SELECT (id,status)
  ON altovena.tenants TO authenticated;
GRANT SELECT (tenant_id,product_slug,status)
  ON altovena.tenant_products TO authenticated;
GRANT SELECT (id,tenant_id,product_slug,goal,state,version,created_at,updated_at)
  ON altovena.missions TO authenticated;

CREATE POLICY altovena_membership_own_active_read
  ON altovena.tenant_memberships
  FOR SELECT TO authenticated
  USING (active AND user_id = (SELECT auth.uid()));

CREATE POLICY altovena_tenants_member_read
  ON altovena.tenants
  FOR SELECT TO authenticated
  USING (
    status = 'active' AND (SELECT auth.uid()) IS NOT NULL AND EXISTS (
      SELECT 1 FROM altovena.tenant_memberships AS tm
      WHERE tm.tenant_id = tenants.id
        AND tm.user_id = (SELECT auth.uid())
        AND tm.active
    )
  );

CREATE POLICY altovena_entitled_products_member_read
  ON altovena.tenant_products
  FOR SELECT TO authenticated
  USING (
    (SELECT auth.uid()) IS NOT NULL AND EXISTS (
      SELECT 1 FROM altovena.tenant_memberships AS tm
      WHERE tm.tenant_id = tenant_products.tenant_id
        AND tm.user_id = (SELECT auth.uid())
        AND tm.active
    )
  );

CREATE POLICY altovena_missions_active_entitled_member_read
  ON altovena.missions
  FOR SELECT TO authenticated
  USING (
    (SELECT auth.uid()) IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM altovena.tenant_memberships AS tm
      WHERE tm.tenant_id = missions.tenant_id
        AND tm.user_id = (SELECT auth.uid())
        AND tm.active
    )
    AND EXISTS (
      SELECT 1 FROM altovena.tenants AS t
      WHERE t.id = missions.tenant_id AND t.status = 'active'
    )
    AND EXISTS (
      SELECT 1 FROM altovena.tenant_products AS tp
      WHERE tp.tenant_id = missions.tenant_id
        AND tp.product_slug = missions.product_slug
        AND tp.status IN ('trial','active')
    )
  );

-- Important: SECURITY INVOKER is mandatory. Without it a view owned by
-- postgres could bypass RLS on the underlying Altovena tables.
CREATE VIEW public.altovena_command_missions_read
  WITH (security_invoker = true) AS
SELECT id,tenant_id,product_slug,goal,state,version,created_at,updated_at
FROM altovena.missions
WHERE product_slug = 'command';

CREATE VIEW public.altovena_my_memberships_read
  WITH (security_invoker = true) AS
SELECT tenant_id,user_id,role,active
FROM altovena.tenant_memberships;

REVOKE ALL ON public.altovena_command_missions_read
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON public.altovena_my_memberships_read
  FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT ON public.altovena_command_missions_read TO authenticated;
GRANT SELECT ON public.altovena_my_memberships_read TO authenticated;

-- No INSERT/UPDATE/DELETE privileges or policies are granted to clients.
COMMIT;
