/**
 * Review-only parameterized Command SQL repository.
 * A trusted server MUST resolve and authorize tenant identity before instantiation.
 * Database driver injected to avoid credentials, direct network I/O or browser imports.
 * Not production-ready without transactional policy, RLS and authenticated API.
 */
const isUUID = (value) => typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
function requireUUID(value, label) {
  if (!isUUID(value)) throw new TypeError(label + " must be UUID");
}
const TRANSITIONS = {
  draft: ["planned", "cancelled"],
  planned: ["running", "cancelled"],
  running: ["awaiting_review", "failed", "paused"],
  awaiting_review: ["approved", "rejected", "cancelled"],
  approved: ["executing", "cancelled"],
  executing: ["verifying", "failed", "partial"],
  verifying: ["completed", "failed", "partial"],
  paused: ["running", "cancelled"]
};
export class CommandSqlRepository {
  constructor({ query, trustedTenantId }) {
    if (typeof query !== "function") throw new TypeError("query function required");
    requireUUID(trustedTenantId, "trustedTenantId");
    this.query = query;
    this.tenantId = trustedTenantId;
  }

  async createMission({ createdBy, goal, budgetCents = 0 }) {
    requireUUID(createdBy, "createdBy");
    if (typeof goal !== "string" || !goal.trim() || goal.length > 4000) {
      throw new TypeError("valid mission goal required");
    }
    if (!Number.isSafeInteger(budgetCents) || budgetCents < 0) {
      throw new TypeError("invalid budget");
    }
    const { rows } = await this.query(
      `INSERT INTO command.missions (tenant_id,created_by,goal,budget_cents)
       VALUES ($1,$2,$3,$4) RETURNING id,tenant_id,goal,state,version,budget_cents,created_at`,
      [this.tenantId, createdBy, goal.trim(), budgetCents]
    );
    return rows[0];
  }

  async getMission(missionId) {
    requireUUID(missionId, "missionId");
    const { rows } = await this.query(
      `SELECT id,tenant_id,goal,state,version,created_at,updated_at
       FROM command.missions WHERE tenant_id=$1 AND id=$2`,
      [this.tenantId, missionId]
    );
    return rows[0] ?? null;
  }

  async listMissions({ limit = 20 } = {}) {
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new TypeError("invalid limit");
    const { rows } = await this.query(
      `SELECT id,tenant_id,goal,state,version,updated_at
       FROM command.missions WHERE tenant_id=$1
       ORDER BY updated_at DESC, id DESC LIMIT $2`,
      [this.tenantId, limit]
    );
    return rows;
  }

  async transitionMission({ missionId, from, to, version }) {
    requireUUID(missionId, "missionId");
    if (!TRANSITIONS[from]?.includes(to)) throw new TypeError("invalid state transition");
    if (!Number.isSafeInteger(version) || version < 1) throw new TypeError("invalid version");
    const { rows } = await this.query(
      `UPDATE command.missions
       SET state=$3, version=version+1, updated_at=now()
       WHERE tenant_id=$1 AND id=$2 AND state=$4 AND version=$5
       RETURNING id,tenant_id,state,version,updated_at`,
      [this.tenantId, missionId, to, from, version]
    );
    return rows[0] ?? null; // null signals stale version or invalid current state.
  }

  async appendEvidence({ missionId, taskId = null, eventType, payload = {} }) {
    requireUUID(missionId, "missionId");
    if (taskId !== null) requireUUID(taskId, "taskId");
    if (!/^[a-z][a-z0-9_.-]{1,100}$/.test(eventType ?? "")) throw new TypeError("invalid event type");
    if (!payload || Array.isArray(payload) || typeof payload !== "object") {
      throw new TypeError("event payload must be object");
    }
    const { rows } = await this.query(
      `INSERT INTO command.events (tenant_id,mission_id,task_id,event_type,payload)
       VALUES ($1,$2,$3,$4,$5::jsonb)
       RETURNING id,tenant_id,mission_id,task_id,event_type,occurred_at`,
      [this.tenantId, missionId, taskId, eventType, JSON.stringify(payload)]
    );
    return rows[0];
  }
}
