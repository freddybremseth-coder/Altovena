import test from "node:test";
import assert from "node:assert/strict";
import { buildDemoDashboard } from "./command-dashboard.mjs";

test("dashboard reflects a completed simulated agent mission", async () => {
  const view = await buildDemoDashboard();
  assert.equal(view.mode, "SIMULATION_ONLY");
  assert.equal(view.mission.status, "completed");
  assert.equal(view.summary.agentsCompleted, 3);
  assert.equal(view.summary.pendingApprovals, 1);
  assert.equal(view.summary.externalActions, 0);
  assert.equal(view.ledgerVerified, true);
  assert.ok(view.evidence.some((e) => e.type === "verification.completed"));
  assert.ok(view.approvals.every((a) => a.status === "pending"));
});
