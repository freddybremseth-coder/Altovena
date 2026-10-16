import test from "node:test";
import assert from "node:assert/strict";
import { createDemoEngine, demoTasks, MissionEngine } from "./command-engine.mjs";

test("three specialist agents and an independent verifier complete a dry-run", async () => {
  const engine = createDemoEngine();
  const mission = engine.createMission({ tenantId: "demo-company", goal: "Find qualified B2B prospects", tasks: demoTasks() });
  const result = await engine.run({ tenantId: "demo-company", missionId: mission.id });
  assert.equal(result.state, "completed");
  assert.deepEqual(result.tasks.map((t) => t.status), ["completed", "completed", "completed"]);
  assert.equal(result.tasks[1].result.candidates[0].buyingInterest, "unknown");
  assert.equal(result.tasks[2].result.proposals[0].status, "draft_only");
  assert.equal(result.reviews[0].pass, true);
  assert.equal(engine.verifyLedger(), true);
  assert.ok(result.events.some((e) => e.type === "verification.completed"));
});
test("cannot access another tenant", () => {
  const engine = createDemoEngine();
  const mission = engine.createMission({ tenantId: "demo-company", goal: "Demo", tasks: demoTasks() });
  assert.throws(() => engine.snapshot({ tenantId: "other", missionId: mission.id }), /tenant boundary/);
  assert.throws(() => engine.createMission({ tenantId: "other", goal: "Demo", tasks: demoTasks() }), /tenant boundary/);
});
test("rejects dependency cycles", () => {
  const engine = createDemoEngine();
  assert.throws(() => engine.createMission({ tenantId: "demo-company", goal: "Cycle", tasks: [
    { id: "a", agent: "research", dependsOn: ["b"] },
    { id: "b", agent: "sales", dependsOn: ["a"] }
  ] }), /cyclic/);
});
test("failed verification does not count as success", async () => {
  const engine = new MissionEngine({
    tenantId: "demo", agents: { a: async () => ({ ok: true }) },
    verifier: async () => ({ pass: false, findings: ["Needs human review"] })
  });
  const mission = engine.createMission({ tenantId: "demo", goal: "Review", tasks: [{ id: "a", agent: "a", dependsOn: [] }] });
  const output = await engine.run({ tenantId: "demo", missionId: mission.id });
  assert.equal(output.state, "awaiting_review");
  assert.equal(engine.verifyLedger(), true);
});
test("agent failures block completion", async () => {
  const engine = new MissionEngine({
    tenantId: "demo", agents: { a: async () => { throw new Error("deliberate error"); } },
    verifier: async () => ({ pass: true })
  });
  const mission = engine.createMission({ tenantId: "demo", goal: "Fail", tasks: [{ id: "a", agent: "a", dependsOn: [] }] });
  const result = await engine.run({ tenantId: "demo", missionId: mission.id });
  assert.equal(result.state, "failed");
  assert.equal(result.tasks[0].status, "failed");
});
