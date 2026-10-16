\set ON_ERROR_STOP on
-- Disposable CI PostgreSQL, uses CI-only auth.uid() fixture.
DO $$
DECLARE options text[]; n integer;
BEGIN
 SELECT reloptions INTO options FROM pg_class c
 JOIN pg_namespace n ON n.oid=c.relnamespace
 WHERE n.nspname='public' AND c.relname='command_missions_read';
 IF NOT ('security_invoker=true'=ANY(options)) THEN
  RAISE EXCEPTION 'Mission view does not enforce caller RLS';
 END IF;
 SELECT reloptions INTO options FROM pg_class c
 JOIN pg_namespace n ON n.oid=c.relnamespace
 WHERE n.nspname='public' AND c.relname='command_memberships_read';
 IF NOT ('security_invoker=true'=ANY(options)) THEN
  RAISE EXCEPTION 'Membership view does not enforce caller RLS';
 END IF;
 IF has_table_privilege('anon','public.command_missions_read','SELECT')
 OR has_table_privilege('anon','public.command_memberships_read','SELECT')
 OR has_table_privilege('authenticated','public.command_missions_read','INSERT')
 OR has_table_privilege('authenticated','public.command_missions_read','UPDATE')
 OR has_table_privilege('authenticated','public.command_missions_read','DELETE')
 THEN RAISE EXCEPTION 'Incorrect public view privileges'; END IF;
END $$;

-- Earlier test deactivated tenant A user. Reactivate for per-user isolation checks.
UPDATE command.tenant_memberships SET active=true
WHERE tenant_id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
AND user_id='cccccccc-cccc-cccc-cccc-cccccccccccc';

SET ROLE authenticated;
SET request.jwt.claim.sub='cccccccc-cccc-cccc-cccc-cccccccccccc';
DO $$
DECLARE a integer; b integer; member_a integer;
BEGIN
 SELECT count(*) INTO a FROM public.command_missions_read
 WHERE tenant_id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
 SELECT count(*) INTO b FROM public.command_missions_read
 WHERE tenant_id='bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
 SELECT count(*) INTO member_a FROM public.command_memberships_read;
 IF a<>2 OR b<>0 OR member_a<>1
 THEN RAISE EXCEPTION 'Invoker view violated tenant A RLS, a=% b=% members=%',a,b,member_a; END IF;
END $$;
RESET ROLE;

SET ROLE authenticated;
SET request.jwt.claim.sub='dddddddd-dddd-dddd-dddd-dddddddddddd';
DO $$
DECLARE a integer; b integer;
BEGIN
 SELECT count(*) INTO a FROM public.command_missions_read
 WHERE tenant_id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
 SELECT count(*) INTO b FROM public.command_missions_read
 WHERE tenant_id='bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
 IF a<>0 OR b<>1 THEN RAISE EXCEPTION 'Invoker view violated tenant B RLS'; END IF;
END $$;
RESET ROLE;

SET ROLE authenticated;
SET request.jwt.claim.sub='eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
DO $$
BEGIN
 IF (SELECT count(*) FROM public.command_missions_read)<>0
 OR (SELECT count(*) FROM public.command_memberships_read)<>0
 THEN RAISE EXCEPTION 'Nonmember read invoker view'; END IF;
END $$;
RESET ROLE;
SELECT 'Public invoker REST views enforce underlying tenant RLS' AS result;
