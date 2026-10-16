-- Review-only database guard. Adds an append-only invariant for ordinary DML.
-- Privileged database owners can change triggers; this is NOT tamper-proof storage.
CREATE OR REPLACE FUNCTION command.reject_event_mutation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog
AS $$
BEGIN
  RAISE EXCEPTION 'Command evidence events are append-only';
END;
$$;
REVOKE ALL ON FUNCTION command.reject_event_mutation() FROM PUBLIC;
REVOKE ALL ON FUNCTION command.reject_event_mutation() FROM anon, authenticated;
CREATE TRIGGER command_events_append_only
  BEFORE UPDATE OR DELETE ON command.events
  FOR EACH ROW EXECUTE FUNCTION command.reject_event_mutation();
