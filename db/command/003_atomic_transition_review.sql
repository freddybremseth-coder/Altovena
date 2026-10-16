-- Altovena Command v0.2: atomic mission transition with evidence.
-- REVIEW ONLY. Apply to disposable CI PostgreSQL. Not approved for production.
-- Trusted server must authorize identity-to-tenant membership before invoking.
BEGIN;

CREATE OR REPLACE FUNCTION command.advance_mission(
  p_tenant_id uuid,
  p_mission_id uuid,
  p_from_state text,
  p_to_state text,
  p_expected_version integer,
  p_actor_id uuid,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE (mission_id uuid, state text, version integer)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog
AS $function$
DECLARE
  v_id uuid;
  v_state text;
  v_version integer;
  v_allowed boolean;
BEGIN
  IF p_tenant_id IS NULL OR p_mission_id IS NULL OR p_actor_id IS NULL
     OR p_expected_version IS NULL OR p_expected_version < 1 THEN
    RAISE EXCEPTION 'Invalid mission transition identity or version';
  END IF;
  IF p_metadata IS NULL OR jsonb_typeof(p_metadata) <> 'object' THEN
    RAISE EXCEPTION 'Transition metadata must be an object';
  END IF;

  v_allowed := CASE p_from_state
    WHEN 'draft' THEN p_to_state IN ('planned','cancelled')
    WHEN 'planned' THEN p_to_state IN ('running','cancelled')
    WHEN 'running' THEN p_to_state IN ('awaiting_review','paused','failed')
    WHEN 'paused' THEN p_to_state IN ('running','cancelled')
    WHEN 'awaiting_review' THEN p_to_state IN ('approved','rejected','cancelled')
    WHEN 'approved' THEN p_to_state IN ('executing','cancelled')
    WHEN 'executing' THEN p_to_state IN ('verifying','failed','partial')
    WHEN 'verifying' THEN p_to_state IN ('completed','failed','partial')
    ELSE false
  END;
  IF v_allowed IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'Invalid mission transition from % to %', p_from_state, p_to_state;
  END IF;

  UPDATE command.missions AS m
  SET state = p_to_state,
      version = m.version + 1,
      updated_at = now()
  WHERE m.tenant_id = p_tenant_id
    AND m.id = p_mission_id
    AND m.state = p_from_state
    AND m.version = p_expected_version
  RETURNING m.id, m.state, m.version
  INTO v_id, v_state, v_version;

  IF NOT FOUND THEN RETURN; END IF;

  -- Same transaction as state update. If event insertion fails, update rolls back.
  -- Trusted fields overwrite any colliding caller metadata.
  INSERT INTO command.events (tenant_id,mission_id,event_type,payload)
  VALUES (
    p_tenant_id, v_id, 'mission.transition',
    p_metadata || jsonb_build_object(
      'from', p_from_state,
      'to', v_state,
      'version', v_version,
      'actor', p_actor_id::text
    )
  );

  mission_id := v_id;
  state := v_state;
  version := v_version;
  RETURN NEXT;
END;
$function$;

REVOKE ALL ON FUNCTION command.advance_mission(uuid,uuid,text,text,integer,uuid,jsonb) FROM PUBLIC, anon, authenticated;

COMMIT;
