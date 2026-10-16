# Altovena Command — Multi-Agent Platform v0.1

Status: **Architecture proposal / not implemented**  
Date: 2026-10-15  
Source system: `freddybremseth-coder/realtyflow-pro` (Nexus and RealtyFlow).  
Target: independent commercially deployable Altovena product backed by reusable Nexus services; no direct production mutations.

## Product statement
One mission, multiple specialist agents, independent verification, bounded execution, and evidence-backed outcomes.

## Evidence from existing code
- `src/services/agents/base-agent.ts`: abstract agent with task and result types, callAI, capability enumeration, task execution and analysis contracts. This is a possible adapter source, not proof of production orchestration.
- `src/lib/nexus-agent-fleet-bindings.ts`: agent-to-automation bindings and output metrics; some entries have empty `agentRunIds`, so registration is **not** proof of autonomous execution.
- `docs/NEXUS_BUSINESS_PIPELINES.md`: distinct business pipelines, shared lifecycle, brand bindings, contextual next action and cross-business prioritization caveats.
- `docs/NEXUS_UX_2_BRAND_ARCHITECTURE.md`: action-first Today/Inbox and reuse of canonical operational APIs.
- Existing mission, inbox, approvals and outcomes need deeper code and runtime checks before they are described as production-ready.

## Scope P0
Implement **B2B Opportunity Mission** in isolated preview, initially in dry-run mode: research → data-quality evaluation → purchase-intent evaluation → draft outreach → independent validation → human approval → optional permitted execution → measured outcome. No unattended external email or commercial outreach in P0.

## Non-goals P0
No generalized autonomous company management, no self-modifying production code, no unrestricted browser/network access, no cross-tenant data access, no new parallel CRM, no direct use of real customer data in demo fixtures.

## Architecture
1. **Command API / Mission service:** tenant-scoped mission creation, objectives, constraints, budget, cancellation, status, replay.
2. **Planner:** proposes a typed DAG of allowed subtasks and dependencies; never directly invokes arbitrary tools.
3. **Agent registry/adapters:** strongly typed manifest (role, version, allowed tools, data scopes, input/output schemas, max cost and time).
4. **Durable runner:** leased/idempotent jobs, retries with limits, checkpoints and deduplication, dead-letter and pause/resume.
5. **Policy and approvals:** deny-by-default capabilities; deterministic action gate checks tenant, resource, side-effect class, approver, expiration and payload hash. AI cannot grant itself capabilities.
6. **Verification:** schema and deterministic controls first, separate evaluator agent where useful; evaluator cannot approve its own work; escalate unresolved disagreement.
7. **Evidence ledger:** append-only event stream linking mission, agent run, source references, plan revision, tool invocation, approval, policy decision, output artifact, actual side effect and measurement.
8. **Outcome evaluation:** distinguishes attempted / queued / executed / confirmed / measurable impact; no unsupported ROI claims.
9. **Command UI:** Today, Missions, Activity, Approvals, Agent Fleet, Evidence and Settings, with clear demo/live status.

### Mission lifecycle
`draft → planned → running → awaiting_review → approved → executing → verifying → completed` with `paused | rejected | cancelled | failed | partial` branches. Transitions enforced server-side. `completed` requires verification; `partial` never counts as confirmed success.

### Contracts (conceptual)
```ts
type Mission = {
  id: string; tenantId: string; goal: string;
  contextRefs: string[]; budgetCents: number;
  state: MissionState; createdBy: string;
  planVersion: number; createdAt: string;
};
type AgentManifest = {
  id: string; version: string; role: string;
  allowedTools: string[]; inputSchemaId: string;
  outputSchemaId: string; maxCostCents: number;
};
type Task = {
  id: string; missionId: string; agentId: string;
  dependsOn: string[]; idempotencyKey: string;
  inputRefs: string[]; status: string;
};
type Approval = {
  id: string; tenantId: string; taskId: string;
  actionType: string; payloadHash: string;
  status: "pending" | "approved" | "rejected" | "expired";
  reviewerId?: string; expiresAt: string;
};
type EvidenceEvent = {
  id: string; tenantId: string; missionId: string;
  kind: string; occurredAt: string; actorId: string;
  inputRefs: string[]; outputRefs: string[];
  toolCallId?: string; approvalId?: string;
};
```

## Guardrails / security acceptance
- Tenant ID enforced at API and database row access; RLS reviewed for each table.
- Prompt injection from external pages, emails and documents treated as untrusted data and unable to override policy.
- All side-effect tools use scoped capability tokens, allowlists and immutable approval payload hashes.
- No sending, publishing, spending, deleting, changing permissions or modifying production code without explicit policy authorization and appropriate human sign-off.
- Secrets and personal data redacted from logs; data retention/deletion and access audit defined before pilots.
- Budgets per mission, agent, task and tenant; rate and concurrency limits.
- Workflows remain correct across restart, duplicate delivery and timeout.
- Independent test of permissions and approval bypass attempts.

## Initial end-to-end demonstration
1. User creates a B2B lead identification mission with a target sector and permitted data sources.
2. Planner emits a bounded DAG; dry-run shows every assignment.
3. Research retrieves lawful source data with provenance.
4. Intelligence evaluates data quality **separately** from prospect interest.
5. Sales drafts a suggestion; no automatic outreach.
6. Verifier tests schema, duplicate checks, sources and compliance constraints.
7. Human reviews exact contact/action payload.
8. Optional sending occurs only under separately approved policy and live integration.
9. Ledger records attempts and confirmed outcomes. UI never labels a draft as sent.

## Acceptance tests
- A normal mission reaches verified dry-run completion with every stage traceable.
- Replay of a task cannot duplicate an external side effect.
- Rejected, expired and edited approval payloads block execution.
- Agent cannot call tools outside declared capabilities or access another tenant.
- Missing evidence, contradictory sources or verifier failure produces review, not false success.
- Runner resumes a checkpointed mission after worker interruption.
- UI clearly separates simulations, production executions and unverified results.

## Staged implementation
**Stage 0:** source audit / runtime inventory and security review in RealtyFlow (no production mutations).
**Stage 1:** shared typed contracts and minimal durable mission service.
**Stage 2:** agent adapters and bounded planner, dry-run workflow.
**Stage 3:** deterministic validation + independent verifier + signed action approvals.
**Stage 4:** evidence / audit UI, telemetry and incident controls.
**Stage 5:** isolated pilot with real approved integrations; commercial packaging and billing later.

## Cross-product boundary
Altovena Command owns mission experience, tenancy, policy and billing. Nexus Shared Core provides re-usable execution infrastructure through versioned interfaces. RealtyFlow remains an existing domain client and must not become an implicit requirement for all customers. Other Altovena products can register capabilities without automatic cross-product data visibility.

## Release gate
Product pages must label this as planned until demonstrated and independently tested. No claims of autonomous operation, verified ROI, regulatory certification or live deployment without evidence.
