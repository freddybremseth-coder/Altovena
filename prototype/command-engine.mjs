/**
 * Altovena Command isolated P0 prototype.
 * Pure JS: no network, no databases, no external side effects.
 * NOT a security boundary and NOT production-ready.
 */
import { createHash, randomUUID } from "node:crypto";

const hash = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const clone = (value) => JSON.parse(JSON.stringify(value));
function assert(condition, message) { if (!condition) throw new Error(message); }

export class MissionEngine {
  constructor({ tenantId, agents, verifier }) {
    assert(tenantId && typeof tenantId === "string", "tenantId required");
    assert(agents && typeof agents === "object", "agents required");
    assert(typeof verifier === "function", "independent verifier required");
    this.tenantId = tenantId;
    this.agents = agents;
    this.verifier = verifier;
    this.missions = new Map();
    this.events = [];
  }

  log(mission, type, details = {}) {
    const previous = this.events.at(-1)?.digest ?? null;
    const record = {
      id: randomUUID(), tenantId: this.tenantId, missionId: mission.id,
      at: new Date().toISOString(), type, details: clone(details), previous
    };
    record.digest = hash(record);
    this.events.push(record);
    return record;
  }

  createMission({ tenantId, goal, tasks }) {
    assert(tenantId === this.tenantId, "tenant boundary violation");
    assert(typeof goal === "string" && goal.trim(), "goal required");
    assert(Array.isArray(tasks) && tasks.length > 0 && tasks.length <= 20, "invalid tasks");
    const ids = new Set(tasks.map((t) => t.id));
    assert(ids.size === tasks.length && tasks.every((t) => typeof t.id === "string" && t.id), "duplicate/invalid task id");
    for (const t of tasks) {
      assert(Object.hasOwn(this.agents, t.agent), "unknown agent: " + t.agent);
      assert(Array.isArray(t.dependsOn), "missing dependencies");
      assert(t.dependsOn.every((d) => ids.has(d) && d !== t.id), "invalid dependency");
    }
    const ordered = [];
    const pending = new Map(tasks.map((t) => [t.id, t]));
    while (pending.size) {
      const ready = [...pending.values()].filter((t) => t.dependsOn.every((d) => ordered.some((o) => o.id === d)));
      assert(ready.length > 0, "cyclic dependencies");
      for (const t of ready) { ordered.push(t); pending.delete(t.id); }
    }
    const mission = {
      id: randomUUID(), tenantId, goal, state: "planned",
      tasks: ordered.map((t) => ({ ...clone(t), status: "pending", result: null })),
      reviews: [], createdAt: new Date().toISOString()
    };
    this.missions.set(mission.id, mission);
    this.log(mission, "mission.created", { goal, taskCount: tasks.length });
    return clone(mission);
  }

  async run({ tenantId, missionId }) {
    assert(tenantId === this.tenantId, "tenant boundary violation");
    const mission = this.missions.get(missionId);
    assert(mission && mission.tenantId === tenantId, "mission unavailable");
    assert(["planned", "paused"].includes(mission.state), "mission not runnable");
    mission.state = "running";
    this.log(mission, "mission.started");
    for (const task of mission.tasks) {
      if (task.status === "completed") continue;
      const deps = Object.fromEntries(task.dependsOn.map((id) => {
        const dep = mission.tasks.find((t) => t.id === id);
        return [id, clone(dep.result)];
      }));
      task.status = "running";
      this.log(mission, "task.started", { taskId: task.id, agent: task.agent });
      try {
        const result = await this.agents[task.agent]({ goal: mission.goal, dependencies: deps });
        assert(result && typeof result === "object", "agent output must be object");
        task.result = clone(result);
        task.status = "completed";
        this.log(mission, "task.completed", { taskId: task.id, outputHash: hash(task.result) });
      } catch (error) {
        task.status = "failed";
        mission.state = "failed";
        this.log(mission, "task.failed", { taskId: task.id, error: String(error.message) });
        return this.snapshot({ tenantId, missionId });
      }
    }
    const review = await this.verifier(clone(mission));
    assert(review && typeof review.pass === "boolean", "invalid independent review");
    mission.reviews.push(clone(review));
    this.log(mission, "verification.completed", { pass: review.pass, findings: review.findings ?? [] });
    mission.state = review.pass ? "completed" : "awaiting_review";
    this.log(mission, "mission." + mission.state);
    return this.snapshot({ tenantId, missionId });
  }

  snapshot({ tenantId, missionId }) {
    assert(tenantId === this.tenantId, "tenant boundary violation");
    const mission = this.missions.get(missionId);
    assert(mission && mission.tenantId === tenantId, "mission unavailable");
    return clone({ ...mission, events: this.events.filter((e) => e.missionId === mission.id) });
  }

  verifyLedger() {
    let previous = null;
    for (const event of this.events) {
      const { digest, ...payload } = event;
      if (payload.previous !== previous || hash(payload) !== digest) return false;
      previous = digest;
    }
    return true;
  }
}

// A simulated mission. No emailing, publishing or database modifications.
export function createDemoEngine(tenantId = "demo-company") {
  return new MissionEngine({
    tenantId,
    agents: {
      research: async () => ({
        prospects: [{ name: "Demo Company A", source: "fixture", evidence: ["demo:source-1"] }]
      }),
      intelligence: async ({ dependencies }) => ({
        candidates: dependencies.research.prospects.map((p) => ({
          ...p, dataQuality: 0.85, buyingInterest: "unknown",
          rationale: "Source exists; no verified intent signal"
        }))
      }),
      sales: async ({ dependencies }) => ({
        proposals: dependencies.intelligence.candidates.map((p) => ({
          company: p.name, draft: "Introduce services after a human review",
          requiresHumanApproval: true, status: "draft_only"
        }))
      })
    },
    verifier: async (mission) => {
      const sales = mission.tasks.find((task) => task.id === "sales");
      const pass = mission.tasks.every((task) => task.status === "completed") &&
        sales.result.proposals.every((p) => p.status === "draft_only" && p.requiresHumanApproval);
      return { pass, findings: pass ? [] : ["Draft-only invariant failed"] };
    }
  });
}

export function demoTasks() {
  return [
    { id: "research", agent: "research", dependsOn: [] },
    { id: "intelligence", agent: "intelligence", dependsOn: ["research"] },
    { id: "sales", agent: "sales", dependsOn: ["intelligence"] }
  ];
}
