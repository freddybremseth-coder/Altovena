\set ON_ERROR_STOP on
DO $$
DECLARE blocked boolean; n integer;
BEGIN
  SELECT count(*) INTO n FROM command.events WHERE event_type='task.started';
  IF n <> 1 THEN RAISE EXCEPTION 'Expected a persisted event'; END IF;

  blocked := FALSE;
  BEGIN
    UPDATE command.events SET event_type='modified' WHERE event_type='task.started';
  EXCEPTION WHEN raise_exception THEN blocked := TRUE;
  END;
  IF NOT blocked THEN RAISE EXCEPTION 'Event update unexpectedly allowed'; END IF;

  blocked := FALSE;
  BEGIN
    DELETE FROM command.events WHERE event_type='task.started';
  EXCEPTION WHEN raise_exception THEN blocked := TRUE;
  END;
  IF NOT blocked THEN RAISE EXCEPTION 'Event delete unexpectedly allowed'; END IF;

  SELECT count(*) INTO n FROM command.events WHERE event_type='task.started';
  IF n <> 1 THEN RAISE EXCEPTION 'Event unexpectedly mutated'; END IF;
END $$;
SELECT 'Append-only event DML invariants passed' AS result;
