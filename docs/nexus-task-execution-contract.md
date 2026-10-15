# Nexus Task Execution Contract — proposal v0.1
Status: **prototype only; not connected to RealtyFlow, Nexus, customer data or any deployment action**.

## Separation of responsibilities
Altovena public site is a sales and explanatory interface. RealtyFlow/Nexus remains the source of truth for task records, brand membership, source citations, review events and execution receipts. Do not store customer work or approvals in the Altovena browser.

## Task record (proposed)
- id: server-issued opaque UUID; brandId: authorized workspace/tenant identifier
- status: draft, researching, review_required, approved, rejected, executing, completed, failed or cancelled
- proposedBy: authenticated actor; version: concurrency token
- actionType, permission scope, redacted input/output references, source metadata and qualityReviewed
- immutable event sequence recorded server-side with actor, timestamp, task version, policy version and source references

## Approval workflow
Research -> review_required -> approve/reject. Approval requires a different authenticated principal from the proposer, evidence references, independent quality review and a server-verified brand permission. Approval must bind task ID, version, content hash, brand ID, action scope and expiry; never infer authorization from a browser token or demo click.

Execution worker must atomically consume a valid approval with compare-and-swap on the task version and a unique idempotency key. Maintain allowlisted action handlers; block sending, publishing, CRM changes, access changes, financial actions or deletes by default. Worker produces durable success/failure receipts and audit events.

## Security and operations prerequisites
- Authoritative membership and role checks from RealtyFlow; enforce row-level tenant isolation.
- Idempotency/locking, replay protection, approval expiration and withdrawal, independent reviewer for meaningful effects.
- PII minimization, retention and deletion policy, confidential input storage, credential vault, least-privilege service identities.
- Cite source snapshots and freshness; provenance must distinguish claims, inferred signals and unknown facts.
- Instrument retries, outages, human escalation and quarantining unsafe or malformed outputs.
- E2E tests: cross-brand access, adversarial instructions, tampered approvals, same-person review, stale version, two-worker race, duplicate execution, cancellation before execution, failure without false success.
- The pure policy module at `lib/nexus-task-policy.mjs` is a **reference validator**, not production authorization; it accepts caller-supplied objects and makes **no authoritative security decision**.
- Do not activate the real flow until the backend, migrations, policy enforcement, observability and legal/privacy approvals have been reviewed and tested.

## UI honesty
The Demo Workspace never makes server requests to execute tasks. It illustrates a possible workflow using fixed data and per-page state only; its approval/rejection history is not evidence of a real audited approval.
