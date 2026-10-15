# Command ↔ Nexus Adapter Contract v0.1

**Status:** draft, not connected to a live RealtyFlow or Nexus runtime.

## Architecture boundary

Altovena Command must call a versioned Nexus service boundary, never directly reach into RealtyFlow's privileged database or reuse an internal administrator credential. RealtyFlow is one supported tenant/domain client, not the application backend for every Command customer.

## Agent manifest proposal

```ts
type AgentDefinition = {
  agentId: string;
  version: string;
  displayName: string;
  capabilities: string[];
  acceptedInputSchema: string;
  outputSchema: string;
  maxDurationMs: number;
  sideEffectClass: "read" | "draft" | "write" | "external";
};
type AgentInvocation = {
  tenantId: string;
  missionId: string;
  taskId: string;
  agentId: string;
  agentVersion: string;
  inputRefs: string[];
  approvedCapabilityIds: string[];
  idempotencyKey: string;
  traceId: string;
};
type AgentResult = {
  taskId: string;
  state: "completed" | "failed" | "needs_review";
  outputRefs: string[];
  evidenceRefs: string[];
  costMicrounits: number;
  traceId: string;
};
```

## Execution rules
1. Identity and tenant are derived from verified server session, never trusted directly from client payloads.
2. Capability allowlists evaluated server-side before and after agent invocation.
3. Separate data quality and buying intent scores (no conflation).
4. Research documents are untrusted input; retrieved text may not direct tool use or permission changes.
5. All write or external side effects go through a dedicated gateway requiring a valid, current, payload-bound approval.
6. Every action emits an evidence record. Partial results never marked confirmed success.
7. Each invocation must honor bounded cost, timeout and cancellation; retries only with idempotency tokens.
8. Expose typed error reasons and reconciliation for unknown outcomes.

## Candidate mappings from RealtyFlow code
- `src/services/agents/base-agent.ts` → adapter for task dispatch, capability discovery, result normalization.
- `src/lib/nexus-agent-fleet-bindings.ts` → read-only agent registry seed (not proof of active autonomous agents).
- `docs/NEXUS_BUSINESS_PIPELINES.md` → business-specific stage and scoring policy.
- Nexus Today/Inbox → view composition only, not source of truth.

## Persistence migration plan
The local JSON mission store in `prototype/mission-store.mjs` is strictly a developer test fixture and has no concurrency or cross-process durability guarantee. Next production implementation should use authenticated tenant-scoped PostgreSQL with RLS, append-only event records, an idempotency unique key, optimistic concurrency/version field, transactionally claimed queue leases, and explicit backups/retention. Do not deploy a local JSON store to Vercel serverless environments.

## Next gate
Complete RealtyFlow runtime audit and a threat model, then write a transactional persistence migration tested against a disposable database. Never apply migrations to production without review.
