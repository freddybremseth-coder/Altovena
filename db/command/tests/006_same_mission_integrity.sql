\set ON_ERROR_STOP on
DO $$
DECLARE
  other_mission uuid := '40000000-0000-0000-0000-000000000004';
  tenant_a uuid := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  task_a uuid := '30000000-0000-0000-0000-000000000003';
  blocked boolean;
BEGIN
  INSERT INTO command.missions(id,tenant_id,created_by,goal)
  VALUES (other_mission,tenant_a,
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'A second, separate mission under the same tenant');

  blocked := false;
  BEGIN
    INSERT INTO command.events(tenant_id,mission_id,task_id,event_type)
    VALUES(tenant_a,other_mission,task_a,'task.wrong_mission');
  EXCEPTION WHEN foreign_key_violation THEN blocked := true;
  END;
  IF NOT blocked THEN RAISE EXCEPTION 'Cross-mission evidence was allowed'; END IF;

  blocked := false;
  BEGIN
    INSERT INTO command.approvals(tenant_id,mission_id,task_id,
      action_type,payload_hash,requested_by,expires_at)
    VALUES(tenant_a,other_mission,task_a,
      'send_email','test',
      'cccccccc-cccc-cccc-cccc-cccccccccccc',
      now() + interval '5 minutes');
  EXCEPTION WHEN foreign_key_violation THEN blocked := true;
  END;
  IF NOT blocked THEN RAISE EXCEPTION 'Cross-mission approval was allowed'; END IF;

  INSERT INTO command.events(tenant_id,mission_id,task_id,event_type)
  VALUES (
    tenant_a,'10000000-0000-0000-0000-000000000001',task_a,
    'task.correct_mission');
  IF NOT EXISTS (SELECT 1 FROM command.events WHERE event_type='task.correct_mission')
  THEN RAISE EXCEPTION 'Valid same-mission evidence was blocked'; END IF;
END $$;
SELECT 'Same-tenant cross-mission linkage protections passed' AS result;
