\set ON_ERROR_STOP on

-- These assertions run against a disposable PostgreSQL service only.
DO $$
DECLARE
  expected_tables text[] := ARRAY['missions', 'tasks', 'events', 'approvals'];
  table_name text;
  rls_active boolean;
  row_count integer;
BEGIN
  FOREACH table_name IN ARRAY expected_tables LOOP
    SELECT c.relrowsecurity INTO rls_active
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'command' AND c.relname = table_name;
    IF rls_active IS DISTINCT FROM TRUE THEN
      RAISE EXCEPTION 'RLS not enabled on command.%', table_name;
    END IF;
    IF has_table_privilege('anon', format('command.%I',table_name), 'SELECT')
       OR has_table_privilege('authenticated', format('command.%I',table_name), 'SELECT')
       OR has_table_privilege('authenticated', format('command.%I',table_name), 'INSERT')
       OR has_table_privilege('authenticated', format('command.%I',table_name), 'UPDATE')
       OR has_table_privilege('authenticated', format('command.%I',table_name), 'DELETE') THEN
      RAISE EXCEPTION 'Unexpected client privileges on command.%', table_name;
    END IF;
  END LOOP;
  IF has_schema_privilege('anon','command','USAGE')
     OR has_schema_privilege('authenticated','command','USAGE') THEN
    RAISE EXCEPTION 'Client role unexpectedly has schema USAGE';
  END IF;
  SELECT count(*) INTO row_count FROM pg_policies WHERE schemaname='command';
  IF row_count <> 0 THEN
    RAISE EXCEPTION 'P0 should have no browser-facing RLS policies';
  END IF;
END
$$;

-- Real UUIDs from two independent tenants.
INSERT INTO command.missions (id,tenant_id,created_by,goal)
VALUES
 ('10000000-0000-0000-0000-000000000001',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'cccccccc-cccc-cccc-cccc-cccccccccccc','Tenant A demo mission'),
 ('20000000-0000-0000-0000-000000000002',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'dddddddd-dddd-dddd-dddd-dddddddddddd','Tenant B demo mission');

INSERT INTO command.tasks (id,tenant_id,mission_id,agent_id,idempotency_key)
VALUES ('30000000-0000-0000-0000-000000000003',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        '10000000-0000-0000-0000-000000000001',
        'research','research-demo');

DO $$
DECLARE
  blocked boolean;
BEGIN
  -- Attempt to attach tenant B task to tenant A mission.
  blocked := FALSE;
  BEGIN
    INSERT INTO command.tasks (tenant_id,mission_id,agent_id,idempotency_key)
    VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
            '10000000-0000-0000-0000-000000000001',
            'research','cross-tenant-task');
  EXCEPTION WHEN foreign_key_violation THEN
    blocked := TRUE;
  END;
  IF NOT blocked THEN RAISE EXCEPTION 'Cross-tenant task was accepted'; END IF;

  -- Attempt to attach a tenant B event to a tenant A task.
  blocked := FALSE;
  BEGIN
    INSERT INTO command.events (tenant_id,mission_id,task_id,event_type)
    VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
            '20000000-0000-0000-0000-000000000002',
            '30000000-0000-0000-0000-000000000003','cross-tenant');
  EXCEPTION WHEN foreign_key_violation THEN
    blocked := TRUE;
  END;
  IF NOT blocked THEN RAISE EXCEPTION 'Cross-tenant event was accepted'; END IF;

  -- Cross-tenant approvals cannot reference another company's task.
  blocked := FALSE;
  BEGIN
    INSERT INTO command.approvals
      (tenant_id,mission_id,task_id,action_type,payload_hash,requested_by,expires_at)
    VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
            '20000000-0000-0000-0000-000000000002',
            '30000000-0000-0000-0000-000000000003',
            'send_email','test-hash',
            'dddddddd-dddd-dddd-dddd-dddddddddddd',
            now() + interval '5 minutes');
  EXCEPTION WHEN foreign_key_violation THEN
    blocked := TRUE;
  END;
  IF NOT blocked THEN RAISE EXCEPTION 'Cross-tenant approval was accepted'; END IF;

  -- Duplicate idempotency token is rejected for the same mission.
  blocked := FALSE;
  BEGIN
    INSERT INTO command.tasks(tenant_id,mission_id,agent_id,idempotency_key)
    VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            '10000000-0000-0000-0000-000000000001',
            'research','research-demo');
  EXCEPTION WHEN unique_violation THEN
    blocked := TRUE;
  END;
  IF NOT blocked THEN RAISE EXCEPTION 'Duplicate task idempotency key was accepted'; END IF;

  -- Contradictory approval requester/reviewer is rejected.
  blocked := FALSE;
  BEGIN
    INSERT INTO command.approvals
      (tenant_id,mission_id,action_type,payload_hash,requested_by,reviewer_id,expires_at)
    VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            '10000000-0000-0000-0000-000000000001',
            'send_email','test-hash',
            'cccccccc-cccc-cccc-cccc-cccccccccccc',
            'cccccccc-cccc-cccc-cccc-cccccccccccc',
            now() + interval '5 minutes');
  EXCEPTION WHEN check_violation THEN
    blocked := TRUE;
  END;
  IF NOT blocked THEN RAISE EXCEPTION 'Self-approval was accepted'; END IF;
END $$;

-- Positive data path remains available to the database owner in CI only.
INSERT INTO command.events(tenant_id,mission_id,task_id,event_type,payload)
VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        '10000000-0000-0000-0000-000000000001',
        '30000000-0000-0000-0000-000000000003',
        'task.started','{"mode":"test"}'::jsonb);
DO $$
BEGIN
  IF (SELECT count(*) FROM command.events WHERE event_type='task.started') <> 1 THEN
    RAISE EXCEPTION 'Valid event failed';
  END IF;
END $$;
SELECT 'Command isolated PostgreSQL integration assertions passed' AS result;
