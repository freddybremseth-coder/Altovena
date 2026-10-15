import test from "node:test";
import assert from "node:assert/strict";
import { ApprovalGate } from "./approval-gate.mjs";
const base = (gate) => gate.request({
  tenantId: "demo", missionId: "m-1", action: "send_email",
  payload: { to: "prospect@example.test", body: "Demo draft" }, requestedBy: "agent"
});
test("approved exact payload is simulated once, with no side effect", () => {
  const gate = new ApprovalGate({ tenantId: "demo" });
  const item = base(gate);
  gate.decide({ tenantId: "demo", approvalId: item.id, reviewerId: "manager", decision: "approved" });
  const args = { tenantId: "demo", approvalId: item.id, action: "send_email", payload: item.payload };
  assert.equal(gate.executeDryRun(args).sideEffect, false);
  gate.executeDryRun(args);
  assert.equal(gate.events.filter((e) => e.type === "action.simulated").length, 1);
});
test("rejects changed payload and action", () => {
  const gate = new ApprovalGate({ tenantId: "demo" }); const item = base(gate);
  gate.decide({ tenantId: "demo", approvalId: item.id, reviewerId: "manager", decision: "approved" });
  assert.throws(() => gate.executeDryRun({ tenantId: "demo", approvalId: item.id, action: "send_email", payload: { to: "someone-else@example.test" } }), /payload changed/);
  assert.throws(() => gate.executeDryRun({ tenantId: "demo", approvalId: item.id, action: "delete", payload: item.payload }), /action mismatch/);
});
test("rejects denied or unreviewed actions", () => {
  const gate = new ApprovalGate({ tenantId: "demo" }); const item = base(gate);
  assert.throws(() => gate.executeDryRun({ tenantId: "demo", approvalId: item.id, action: item.action, payload: item.payload }), /not approved/);
  gate.decide({ tenantId: "demo", approvalId: item.id, reviewerId: "manager", decision: "rejected" });
  assert.throws(() => gate.executeDryRun({ tenantId: "demo", approvalId: item.id, action: item.action, payload: item.payload }), /not approved/);
});
test("separate reviewer and tenant scope enforced", () => {
  const gate = new ApprovalGate({ tenantId: "demo" }); const item = base(gate);
  assert.throws(() => gate.decide({ tenantId: "demo", approvalId: item.id, reviewerId: "agent", decision: "approved" }), /separate reviewer/);
  assert.throws(() => gate.decide({ tenantId: "another", approvalId: item.id, reviewerId: "manager", decision: "approved" }), /tenant boundary/);
});
test("expired approval cannot be granted or executed", () => {
  let now = 100;
  const gate = new ApprovalGate({ tenantId: "demo", clock: () => now });
  const item = gate.request({ tenantId: "demo", missionId: "m-1", action: "publish", payload: { id: "draft" }, requestedBy: "agent", expiresInMs: 50 });
  now = 151;
  assert.throws(() => gate.decide({ tenantId: "demo", approvalId: item.id, reviewerId: "manager", decision: "approved" }), /expired/);
});
