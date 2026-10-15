-- Command v0.2 – read-only authenticated tenant visibility.
-- REVIEW ONLY: apply only in disposable CI PostgreSQL until Supabase Auth reviewed.
-- Authenticated identity MUST come from a verified JWT and the API trust boundary.
BEGIN;

CREATE TABLE command.tenant_memberships (
  tenant_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('owner','admin','operator','viewer')),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id,user_id)
);
CREATE INDEX command_membership_user_active_idx
  ON command.tenant_memberships (user_id,tenant_id) WHERE active;

ALTER TABLE command.tenant_memberships ENABLE ROW LEVEL SECURITY;

-- Schema is private and NOT exposed by default through Supabase Data API.
-- Allow only authenticated mission/membership reads. No client writes, no
-- tasks/events/approval access. Other grants remain revoked.
GRANT USAGE ON SCHEMA command TO authenticated;
GRANT SELECT (tenant_id,user_id,role,active) ON command.tenant_memberships TO authenticated;
GRANT SELECT (id,tenant_id,goal,state,version,created_at,updated_at)
  ON command.missions TO authenticated;

-- Membership rows may only be read by their subject. This policy is also
-- evaluated when missions asks whether the JWT subject is a tenant member.
CREATE POLICY command_membership_self_read
  ON command.tenant_memberships
  FOR SELECT TO authenticated
  USING (active AND user_id = (SELECT auth.uid()));

CREATE POLICY command_mission_active_member_read
  ON command.missions
  FOR SELECT TO authenticated
  USING (
    (SELECT auth.uid()) IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM command.tenant_memberships AS membership
      WHERE membership.tenant_id = missions.tenant_id
        AND membership.user_id = (SELECT auth.uid())
        AND membership.active
    )
  );

COMMIT;
