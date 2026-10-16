\set ON_ERROR_STOP on

DO $$
DECLARE
  table_name text;
  n integer;
  active_rls boolean;
BEGIN
  SELECT count(*) INTO n FROM pg_tables WHERE schemaname='altovena';
  IF n <> 8 THEN RAISE EXCEPTION 'Expected 8 Altovena tables; got %',n; END IF;

  FOREACH table_name IN ARRAY ARRAY[
    'tenants','products','tenant_products','tenant_memberships',
    'missions','tasks','events','approvals'
  ] LOOP
    SELECT c.relrowsecurity INTO active_rls
    FROM pg_class c JOIN pg_namespace ns ON ns.oid=c.relnamespace
    WHERE ns.nspname='altovena' AND c.relname=table_name;
    IF active_rls IS DISTINCT FROM TRUE THEN
      RAISE EXCEPTION 'RLS disabled for altovena.%', table_name;
    END IF;
    IF has_table_privilege('anon', format('altovena.%I',table_name),'SELECT')
      OR has_table_privilege('authenticated',format('altovena.%I',table_name),'SELECT')
      OR has_table_privilege('service_role',format('altovena.%I',table_name),'SELECT')
    THEN RAISE EXCEPTION 'Altovena private schema exposed via grants: %',table_name; END IF;
  END LOOP;
  IF has_schema_privilege('anon','altovena','USAGE')
    OR has_schema_privilege('authenticated','altovena','USAGE')
    OR has_schema_privilege('service_role','altovena','USAGE')
  THEN RAISE EXCEPTION 'Altovena schema access exposed'; END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='altovena') THEN
    RAISE EXCEPTION 'Unexpected RLS policy in private schema';
  END IF;
END $$;

INSERT INTO altovena.tenants(id,name,external_ref)
VALUES
 ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','Internal test tenant','realtyflow-test'),
 ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','Future SaaS tenant',NULL);
INSERT INTO altovena.tenant_products(tenant_id,product_slug,status)
VALUES
 ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','command','active'),
 ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','command','trial');
INSERT INTO altovena.missions(id,tenant_id,created_by,goal)
VALUES
 ('11111111-1111-1111-1111-111111111111',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'cccccccc-cccc-cccc-cccc-cccccccccccc','Internal demonstration'),
 ('22222222-2222-2222-2222-222222222222',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'cccccccc-cccc-cccc-cccc-cccccccccccc','Second mission of same tenant'),
 ('33333333-3333-3333-3333-333333333333',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'dddddddd-dddd-dddd-dddd-dddddddddddd','Future SaaS example');
INSERT INTO altovena.tasks(id,tenant_id,mission_id,agent_id,idempotency_key)
VALUES('44444444-4444-4444-4444-444444444444',
 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
 '11111111-1111-1111-1111-111111111111','research','research-1');

DO $$
DECLARE blocked boolean;
BEGIN
  blocked := false;
  BEGIN
    INSERT INTO altovena.tasks(tenant_id,mission_id,agent_id,idempotency_key)
    VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      '11111111-1111-1111-1111-111111111111','research','wrong-tenant');
  EXCEPTION WHEN foreign_key_violation THEN blocked:=true;
  END;
  IF NOT blocked THEN RAISE EXCEPTION 'Cross-tenant task was accepted'; END IF;

  blocked := false;
  BEGIN
    INSERT INTO altovena.events(tenant_id,mission_id,task_id,event_type)
    VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      '22222222-2222-2222-2222-222222222222',
      '44444444-4444-4444-4444-444444444444','wrong.mission');
  EXCEPTION WHEN foreign_key_violation THEN blocked:=true;
  END;
  IF NOT blocked THEN RAISE EXCEPTION 'Wrong-mission task evidence was accepted'; END IF;

  blocked := false;
  BEGIN
    INSERT INTO altovena.approvals(tenant_id,mission_id,action_type,
      payload_hash,requested_by,reviewer_id,expires_at)
    VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      '11111111-1111-1111-1111-111111111111','send_email',
      repeat('a',64),
      'cccccccc-cccc-cccc-cccc-cccccccccccc',
      'cccccccc-cccc-cccc-cccc-cccccccccccc', now()+interval '1 hour');
  EXCEPTION WHEN check_violation THEN blocked:=true;
  END;
  IF NOT blocked THEN RAISE EXCEPTION 'Self-approval was accepted'; END IF;

  blocked:=false;
  BEGIN
    INSERT INTO altovena.tasks(tenant_id,mission_id,agent_id,idempotency_key)
    VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      '11111111-1111-1111-1111-111111111111','research','research-1');
  EXCEPTION WHEN unique_violation THEN blocked:=true;
  END;
  IF NOT blocked THEN RAISE EXCEPTION 'Repeated idempotency key accepted'; END IF;
END $$;

INSERT INTO altovena.events(tenant_id,mission_id,task_id,event_type,payload)
VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '11111111-1111-1111-1111-111111111111',
  '44444444-4444-4444-4444-444444444444',
  'task.started','{"source":"ci"}');

DO $$
DECLARE blocked boolean;
BEGIN
  blocked:=false;
  BEGIN
    UPDATE altovena.events SET event_type='task.modified';
  EXCEPTION WHEN raise_exception THEN blocked:=true;
  END;
  IF NOT blocked THEN RAISE EXCEPTION 'Audit event modification allowed'; END IF;

  blocked:=false;
  BEGIN
    DELETE FROM altovena.events;
  EXCEPTION WHEN raise_exception THEN blocked:=true;
  END;
  IF NOT blocked THEN RAISE EXCEPTION 'Audit event deletion allowed'; END IF;
END $$;
SELECT 'Altovena embedded private schema: integration assertions PASSED' AS result;
