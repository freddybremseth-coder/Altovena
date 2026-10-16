\set ON_ERROR_STOP on

-- Seed identities while still using the disposable database owner.
INSERT INTO command.tenant_memberships(tenant_id,user_id,role,active)
VALUES
 ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'cccccccc-cccc-cccc-cccc-cccccccccccc','owner',true),
 ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'dddddddd-dddd-dddd-dddd-dddddddddddd','viewer',true);

-- Neither broad data grants nor public write policies are permitted.
DO $$
DECLARE count_policies integer;
BEGIN
 IF has_table_privilege('authenticated','command.missions','INSERT')
    OR has_table_privilege('authenticated','command.missions','UPDATE')
    OR has_table_privilege('authenticated','command.missions','DELETE')
    OR has_table_privilege('authenticated','command.tasks','SELECT')
    OR has_table_privilege('authenticated','command.events','SELECT')
    OR has_table_privilege('authenticated','command.approvals','SELECT')
    OR has_table_privilege('authenticated','command.tenant_memberships','INSERT')
    OR has_table_privilege('authenticated','command.tenant_memberships','UPDATE') THEN
    RAISE EXCEPTION 'Client acquired unexpected table privileges';
 END IF;
 SELECT count(*) INTO count_policies FROM pg_policies
 WHERE schemaname='command'
 AND cmd NOT IN ('SELECT','ALL');
 IF count_policies <> 0 THEN RAISE EXCEPTION 'Unexpected write policies'; END IF;
END $$;

-- CI-only simulated validated identity: tenant A member.
SET ROLE authenticated;
SET request.jwt.claim.sub = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
DO $$
DECLARE a integer; b integer; memberships integer; blocked boolean := false;
BEGIN
 SELECT count(id) INTO a FROM command.missions
 WHERE tenant_id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
 SELECT count(id) INTO b FROM command.missions
 WHERE tenant_id='bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
 SELECT count(tenant_id) INTO memberships FROM command.tenant_memberships;
 IF a <> 2 OR b <> 0 OR memberships <> 1 THEN
   RAISE EXCEPTION 'Tenant A visibility violation: a=% b=% memberships=%',
     a,b,memberships;
 END IF;
 BEGIN
   INSERT INTO command.missions(tenant_id,created_by,goal)
   VALUES('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
     'cccccccc-cccc-cccc-cccc-cccccccccccc','Must reject browser write');
 EXCEPTION WHEN insufficient_privilege THEN blocked := true;
 END;
 IF NOT blocked THEN RAISE EXCEPTION 'Authenticated browser write was permitted'; END IF;
END $$;
RESET ROLE;

-- Tenant B sees only B. No fabricated score or record is returned from A.
SET ROLE authenticated;
SET request.jwt.claim.sub = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
DO $$
DECLARE a integer; b integer;
BEGIN
 SELECT count(id) INTO a FROM command.missions
 WHERE tenant_id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
 SELECT count(id) INTO b FROM command.missions
 WHERE tenant_id='bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
 IF a <> 0 OR b <> 1 THEN
   RAISE EXCEPTION 'Tenant B visibility violation: a=% b=%',a,b;
 END IF;
END $$;
RESET ROLE;

-- Unrelated authenticated identity and missing session see zero.
SET ROLE authenticated;
SET request.jwt.claim.sub = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
DO $$
BEGIN
 IF (SELECT count(id) FROM command.missions) <> 0 THEN
   RAISE EXCEPTION 'Nonmember can see a mission';
 END IF;
END $$;
SET request.jwt.claim.sub = '';
DO $$
BEGIN
 IF (SELECT count(id) FROM command.missions) <> 0 THEN
   RAISE EXCEPTION 'Missing JWT subject can see a mission';
 END IF;
END $$;
RESET ROLE;

-- Revoked membership must disappear from results even with a previously
-- "authenticated" simulated session.
UPDATE command.tenant_memberships SET active=false
WHERE tenant_id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
 AND user_id='cccccccc-cccc-cccc-cccc-cccccccccccc';
SET ROLE authenticated;
SET request.jwt.claim.sub = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
DO $$
BEGIN
 IF (SELECT count(id) FROM command.missions) <> 0 THEN
   RAISE EXCEPTION 'Inactive tenant membership still grants access';
 END IF;
END $$;
RESET ROLE;

-- Anon should not even be able to read the private schema.
SET ROLE anon;
DO $$
DECLARE blocked boolean := false;
BEGIN
 BEGIN
   PERFORM 1 FROM command.missions LIMIT 1;
 EXCEPTION WHEN insufficient_privilege THEN blocked := true;
 END;
 IF NOT blocked THEN RAISE EXCEPTION 'Anon read was permitted'; END IF;
END $$;
RESET ROLE;
SELECT 'Authenticated RLS read-only tenant visibility passed' AS result;
