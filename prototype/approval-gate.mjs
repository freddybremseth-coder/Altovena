import { createHash, randomUUID } from "node:crypto";
const canonical = (value) => JSON.stringify(value, Object.keys(value).sort());
const digest = (value) => createHash("sha256").update(canonical(value)).digest("hex");
const clone = (value) => JSON.parse(JSON.stringify(value));
const ensure = (ok, msg) => { if (!ok) throw new Error(msg); };

/** Demo-only approval gate. No authenticated identities, external writes or persistence. */
export class ApprovalGate {
  constructor({ tenantId, clock = () => Date.now() }) {
    this.tenantId = tenantId;
    this.clock = clock;
    this.requests = new Map();
    this.executed = new Map();
    this.events = [];
  }
  request({ tenantId, missionId, action, payload, requestedBy, expiresInMs = 300_000 }) {
    ensure(tenantId === this.tenantId, "tenant boundary violation");
    ensure(typeof action === "string" && action.length > 0, "action required");
    ensure(Number.isSafeInteger(expiresInMs) && expiresInMs > 0, "invalid expiry");
    const record = {
      id: randomUUID(), tenantId, missionId, action,
      payload: clone(payload), payloadHash: digest(payload),
      requestedBy, status: "pending", reviewerId: null,
      expiresAt: this.clock() + expiresInMs
    };
    this.requests.set(record.id, record);
    this.events.push({ type: "approval.requested", id: record.id, action });
    return clone(record);
  }
  decide({ tenantId, approvalId, reviewerId, decision }) {
    ensure(tenantId === this.tenantId, "tenant boundary violation");
    const record = this.requests.get(approvalId);
    ensure(record, "approval not found");
    ensure(record.status === "pending", "approval already decided");
    ensure(this.clock() < record.expiresAt, "approval expired");
    ensure(reviewerId && reviewerId !== record.requestedBy, "separate reviewer required");
    ensure(["approved", "rejected"].includes(decision), "invalid decision");
    record.status = decision;
    record.reviewerId = reviewerId;
    this.events.push({ type: "approval." + decision, id: record.id, reviewerId });
    return clone(record);
  }
  executeDryRun({ tenantId, approvalId, action, payload }) {
    ensure(tenantId === this.tenantId, "tenant boundary violation");
    const record = this.requests.get(approvalId);
    ensure(record, "approval not found");
    ensure(record.status === "approved", "action not approved");
    ensure(this.clock() < record.expiresAt, "approval expired");
    ensure(action === record.action, "action mismatch");
    ensure(digest(payload) === record.payloadHash, "approval payload changed");
    if (this.executed.has(record.id)) return clone(this.executed.get(record.id));
    const result = { approvalId, action, status: "simulated", sideEffect: false };
    this.executed.set(record.id, result);
    this.events.push({ type: "action.simulated", id: record.id, payloadHash: record.payloadHash });
    return clone(result);
  }
}
