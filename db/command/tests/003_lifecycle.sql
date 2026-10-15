\set ON_ERROR_STOP on
-- Connect with a new psql session after integration assertions. The rows must persist.
DO $$
DECLARE
  n integer;
  v integer;
BEGIN
  SELECT count(*) INTO n FROM command.missions
    WHERE tenant_id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
      AND id='10000000-0000-0000-0000-000000000001';
  IF n <> 1 THEN RAISE EXCEPTION 'Mission did not persist between connections'; END IF;

  -- Optimistic concurrency: a stale version may not transition the mission.
  UPDATE command.missions
    SET state='running', version=version+1, updated_at=now()
    WHERE tenant_id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
      AND id='10000000-0000-0000-0000-000000000001'
      AND state='draft' AND version=1;
  GET DIAGNOSTICS n=ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Initial mission transition failed'; END IF;

  UPDATE command.missions
    SET state='completed', version=version+1
    WHERE tenant_id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
      AND id='10000000-0000-0000-0000-000000000001'
      AND version=1;
  GET DIAGNOSTICS n=ROW_COUNT;
  IF n <> 0 THEN RAISE EXCEPTION 'Stale mission transition was accepted'; END IF;

  SELECT version INTO v FROM command.missions
    WHERE id='10000000-0000-0000-0000-000000000001';
  IF v <> 2 THEN RAISE EXCEPTION 'Unexpected mission version %', v; END IF;
END $$;
SELECT 'Command mission persistence and optimistic versioning passed' AS result;
