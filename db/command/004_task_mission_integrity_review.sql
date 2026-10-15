-- Command v0.2 – enforce same mission for task references.
-- Review-only: applied only to disposable CI PostgreSQL; do not apply to production.
BEGIN;

-- Tenant alone is insufficient: a task from mission A must not be used as
-- evidence/approval in mission B of the SAME tenant.
CREATE UNIQUE INDEX IF NOT EXISTS command_tasks_tenant_mission_id_idx
  ON command.tasks (tenant_id, mission_id, id);

ALTER TABLE command.events
  DROP CONSTRAINT IF EXISTS events_tenant_id_task_id_fkey;
ALTER TABLE command.events
  ADD CONSTRAINT command_events_task_same_mission_fkey
  FOREIGN KEY (tenant_id, mission_id, task_id)
  REFERENCES command.tasks (tenant_id, mission_id, id);

ALTER TABLE command.approvals
  DROP CONSTRAINT IF EXISTS approvals_tenant_id_task_id_fkey;
ALTER TABLE command.approvals
  ADD CONSTRAINT command_approvals_task_same_mission_fkey
  FOREIGN KEY (tenant_id, mission_id, task_id)
  REFERENCES command.tasks (tenant_id, mission_id, id);

COMMIT;
