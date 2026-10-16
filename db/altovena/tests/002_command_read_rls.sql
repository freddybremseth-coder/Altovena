\set ON_ERROR_STOP on
-- CI only: auth.uid() is a mock of a verified Supabase JWT.
-- The mock role/session variable is NOT a production authentication method.
DO $$
DECLARE
  opts text[];
BEGIN
  SELECT c.reloptions INTO opts FROM pg_class c
  JOIN pg_namespace n ON n.oid=c.relnamespace
  WHERE n.nspname='public' AND c.relname='altovena_command_missions_read';
  IF NOT ('security_invoker=true'=ANY(opts)) THEN
    RAISE EXCEPTION 'Command view must be security invoker';
  END IF;
  SELECT c.reloptions INTO opts FROM pg_class c
  JOIN pg_namespace n ON n.oid=c.relnamespace
  WHERE n.nspname='public' AND c.relname='altovena_my_memberships_read';
  IF NOT ('security_invoker=true'=ANY(opts)) THEN
    RAISE EXCEPTION 'Membership view must be security invoker';
  END IF;

  IF has_table_privilege('authenticated','altovena.tasks','SELECT') OR
    has_table_privilege('authenticated','altovena.events','SELECT') OR
    has_table_privilege('authenticated','altovena.approvals','SELECT') OR
    has_table_privilege('authenticated','altovena.missions','INSERT') OR
    has_table_privilege('authenticated','altovena.missions','UPDATE') OR
    has_table_privilege('anon','public.altovena_command_missions_read','SELECT')
  THEN RAISE EXCEPTION 'Unexpected database permissions for Command read path'; END IF;
END $$;

INSERT INTO altovena.tenant_memberships (tenant_id,user_id,role,active)
VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
 'cccccccc-cccc-cccc-cccc-cccccccccccc','owner',true),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
 'dddddddd-dddd-dddd-dddd-dddddddddddd','viewer',true);

SET ROLE authenticated;
SET request.jwt.claim.sub='cccccccc-cccc-cccc-cccc-cccccccccccc';
DO $$
DECLARE a integer; b integer; memberships integer;
BEGIN
  SELECT count(*) INTO a FROM public.altovena_command_missions_read
   WHERE tenant_id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  SELECT count(*) INTO b FROM public.altovena_command_missions_read
   WHERE tenant_id='bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  SELECT count(*) INTO memberships FROM public.altovena_my_memberships_read;
  IF a<>2 OR b<>0 OR memberships<>1 THEN
    RAISE EXCEPTION 'Tenant A read guard failed: own %, other %, memberships %',
      a,b,memberships;
  END IF;
END $$;
RESET ROLE;

SET ROLE authenticated;
SET request.jwt.claim.sub='dddddddd-dddd-dddd-dddd-dddddddddddd';
DO $$
DECLARE a integer; b integer;
BEGIN
  SELECT count(*) INTO a FROM public.altovena_command_missions_read
   WHERE tenant_id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  SELECT count(*) INTO b FROM public.altovena_command_missions_read
   WHERE tenant_id='bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  IF a<>0 OR b<>1 THEN RAISE EXCEPTION 'Tenant B read guard failed'; END IF;
END $$;
RESET ROLE;

-- Entity is visible only if the entitlement is trial or active.
UPDATE altovena.tenant_products SET status='suspended'
WHERE tenant_id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' AND product_slug='command';
SET ROLE authenticated;
SET request.jwt.claim.sub='cccccccc-cccc-cccc-cccc-cccccccccccc';
DO $$
BEGIN
 IF (SELECT count(*) FROM public.altovena_command_missions_read) <> 0 THEN
   RAISE EXCEPTION 'Suspended product still exposes missions';
 END IF;
END $$;
RESET ROLE;
UPDATE altovena.tenant_products SET status='active'
WHERE tenant_id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' AND product_slug='command';

UPDATE altovena.tenants SET status='suspended'
WHERE id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
SET ROLE authenticated;
SET request.jwt.claim.sub='cccccccc-cccc-cccc-cccc-cccccccccccc';
DO $$
BEGIN
 IF (SELECT count(*) FROM public.altovena_command_missions_read) <> 0 THEN
   RAISE EXCEPTION 'Suspended tenant still exposes missions';
 END IF;
END $$;
RESET ROLE;
UPDATE altovena.tenants SET status='active'
WHERE id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

UPDATE altovena.tenant_memberships SET active=false
WHERE tenant_id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
SET ROLE authenticated;
SET request.jwt.claim.sub='cccccccc-cccc-cccc-cccc-cccccccccccc';
DO $$
BEGIN
 IF (SELECT count(*) FROM public.altovena_command_missions_read) <> 0 OR
    (SELECT count(*) FROM public.altovena_my_memberships_read) <> 0 THEN
    RAISE EXCEPTION 'Revoked membership still permits reads';
 END IF;
END $$;
RESET ROLE;

SET ROLE authenticated;
SET request.jwt.claim.sub='eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
DO $$
BEGIN
 IF (SELECT count(*) FROM public.altovena_command_missions_read) <> 0 THEN
   RAISE EXCEPTION 'Non-member unexpectedly read missions';
 END IF;
END $$;
SET request.jwt.claim.sub='';
DO $$
BEGIN
 IF (SELECT count(*) FROM public.altovena_command_missions_read) <> 0 THEN
   RAISE EXCEPTION 'Missing JWT unexpectedly read missions';
 END IF;
END $$;
RESET ROLE;

SET ROLE anon;
DO $$
DECLARE blocked boolean := false;
BEGIN
 BEGIN
  PERFORM id FROM public.altovena_command_missions_read LIMIT 1;
 EXCEPTION WHEN insufficient_privilege THEN blocked := true;
 END;
 IF NOT blocked THEN RAISE EXCEPTION 'Anon accessed Command view'; END IF;
END $$;
RESET ROLE;

SELECT 'Altovena read-only per-tenant Command RLS passed' AS result;
