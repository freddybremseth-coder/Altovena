\set ON_ERROR_STOP on

-- Executed only against the disposable PostgreSQL CI service.
DO $$
DECLARE
  n integer;
  v integer;
  s text;
  tenant uuid := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  mission uuid := '10000000-0000-0000-0000-000000000001';
  actor uuid := 'cccccccc-cccc-cccc-cccc-cccccccccccc';
BEGIN
  IF has_function_privilege('anon',
     'command.advance_mission(uuid,uuid,text,text,integer,uuid,jsonb)', 'EXECUTE')
     OR has_function_privilege('authenticated',
     'command.advance_mission(uuid,uuid,text,text,integer,uuid,jsonb)', 'EXECUTE') THEN
    RAISE EXCEPTION 'An API role can execute privileged mission transitions';
  END IF;

  -- Prior lifecycle test leaves this mission running at version 2.
  SELECT count(*) INTO n
  FROM command.advance_mission(tenant, mission, 'running', 'awaiting_review',
       2, actor, '{"from":"untrusted_override","source":"integration-test"}');
  IF n <> 1 THEN RAISE EXCEPTION 'Expected exactly one atomic mission transition'; END IF;
  SELECT state,version INTO s,v FROM command.missions
  WHERE tenant_id=tenant AND id=mission;
  IF s <> 'awaiting_review' OR v <> 3 THEN
    RAISE EXCEPTION 'Unexpected state/version after transition';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM command.events
    WHERE tenant_id=tenant AND mission_id=mission AND event_type='mission.transition'
      AND payload->>'from'='running'
      AND payload->>'to'='awaiting_review'
      AND payload->>'version'='3'
      AND payload->>'actor'=actor::text
      AND payload->>'source'='integration-test'
  ) THEN
    RAISE EXCEPTION 'Missing or incorrect audit event for transition';
  END IF;

  -- A repeated/stale request and another tenant cannot mutate the mission.
  SELECT count(*) INTO n
  FROM command.advance_mission(tenant,mission,'running','awaiting_review',
       2,actor,'{}');
  IF n <> 0 THEN RAISE EXCEPTION 'Stale request repeated transition'; END IF;
  SELECT count(*) INTO n
  FROM command.advance_mission('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',mission,
       'awaiting_review','approved',3,actor,'{}');
  IF n <> 0 THEN RAISE EXCEPTION 'Other tenant transitioned this mission'; END IF;

  -- Invalid transitions are rejected by the database even if a caller bypasses JS.
  BEGIN
    PERFORM 1 FROM command.advance_mission(tenant,mission,'awaiting_review',
      'completed',3,actor,'{}');
    RAISE EXCEPTION 'Invalid transition was not rejected';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM NOT LIKE 'Invalid mission transition%' THEN RAISE; END IF;
  END;
END $$;

-- Deliberately break audit insertion. A state update must be rolled back.
CREATE FUNCTION command.test_reject_audit_insert()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = pg_catalog AS $$
BEGIN
  RAISE EXCEPTION 'Simulated evidence storage failure';
END;
$$;
CREATE TRIGGER command_test_fail_event
BEFORE INSERT ON command.events
FOR EACH ROW WHEN (NEW.event_type = 'mission.transition')
EXECUTE FUNCTION command.test_reject_audit_insert();

DO $$
DECLARE
  blocked boolean := false;
  s text;
  v integer;
BEGIN
  BEGIN
    PERFORM 1 FROM command.advance_mission(
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      '10000000-0000-0000-0000-000000000001',
      'awaiting_review','approved',3,
      'cccccccc-cccc-cccc-cccc-cccccccccccc','{}');
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM LIKE 'Simulated evidence storage failure%' THEN
      blocked := true;
    ELSE
      RAISE;
    END IF;
  END;
  IF NOT blocked THEN RAISE EXCEPTION 'Evidence failure did not block transition'; END IF;
  SELECT state,version INTO s,v FROM command.missions
  WHERE id='10000000-0000-0000-0000-000000000001';
  IF s<>'awaiting_review' OR v<>3 THEN
    RAISE EXCEPTION 'Mission changed despite failed audit write';
  END IF;
END $$;

DROP TRIGGER command_test_fail_event ON command.events;
DROP FUNCTION command.test_reject_audit_insert();

DO $$
DECLARE
  n integer;
BEGIN
  SELECT count(*) INTO n FROM command.advance_mission(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '10000000-0000-0000-0000-000000000001',
    'awaiting_review','approved',3,
    'cccccccc-cccc-cccc-cccc-cccccccccccc','{}');
  IF n<>1 THEN RAISE EXCEPTION 'Retry after simulated error did not succeed'; END IF;
  SELECT count(*) INTO n FROM command.events
  WHERE mission_id='10000000-0000-0000-0000-000000000001'
  AND event_type='mission.transition';
  IF n<>2 THEN RAISE EXCEPTION 'Expected exactly two successful transition events'; END IF;
END $$;
SELECT 'Atomic mission transitions and evidence rollback passed' AS result;
