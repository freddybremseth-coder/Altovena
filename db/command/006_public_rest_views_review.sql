-- Altovena Command v0.3 — optional public invoker views for REST reads.
-- REVIEW ONLY. The underlying command schema remains private and RLS-protected.
-- Never deploy until real Supabase Auth and security reviews are complete.
BEGIN;

-- Explicit security_invoker prevents the owning privileged DB role from
-- bypassing the underlying command table RLS policies.
CREATE VIEW public.command_missions_read WITH (security_invoker = true) AS
SELECT id, tenant_id, goal, state, version, created_at, updated_at
FROM command.missions;

CREATE VIEW public.command_memberships_read WITH (security_invoker = true) AS
SELECT tenant_id, user_id, role, active
FROM command.tenant_memberships;

REVOKE ALL ON public.command_missions_read FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.command_memberships_read FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.command_missions_read TO authenticated;
GRANT SELECT ON public.command_memberships_read TO authenticated;

COMMIT;
