import { createDemoEngine, demoTasks } from "./command-engine.mjs";
import { ApprovalGate } from "./approval-gate.mjs";

/** Build a safe read-only view model from a deterministic simulated mission. */
export async function buildDemoDashboard() {
  const tenantId = "demo-company";
  const engine = createDemoEngine(tenantId);
  const created = engine.createMission({
    tenantId, goal: "Find and review B2B opportunities", tasks: demoTasks()
  });
  const mission = await engine.run({ tenantId, missionId: created.id });
  const sales = mission.tasks.find((t) => t.id === "sales");
  const gate = new ApprovalGate({ tenantId });
  const approvals = sales.result.proposals.map((proposal) =>
    gate.request({
      tenantId, missionId: mission.id,
      action: "send_email", payload: proposal,
      requestedBy: "sales-agent"
    })
  );
  return {
    mode: "SIMULATION_ONLY",
    mission: {
      id: mission.id, goal: mission.goal, status: mission.state,
      tasks: mission.tasks.map((t) => ({
        id: t.id, agent: t.agent, status: t.status, output: t.result
      }))
    },
    approvals: approvals.map(({ id, action, status, payload }) => ({
      id, action, status, summary: payload.company, draft: payload.draft
    })),
    evidence: mission.events.map((e) => ({
      id: e.id, at: e.at, type: e.type, taskId: e.details.taskId ?? null
    })),
    ledgerVerified: engine.verifyLedger(),
    summary: {
      agentsCompleted: mission.tasks.filter((t) => t.status === "completed").length,
      pendingApprovals: approvals.length,
      externalActions: 0
    }
  };
}
