# Altovena Command — isolated executable prototype

Run with Node.js 20+:

```bash
node --test prototype/command-engine.test.mjs
```

Implements deterministic DAG ordering, sequential specialist-agent delegation, independent verification, tenant-ID checks, status transitions and a hash-linked in-memory event ledger. Three mocked specialists (research, intelligence, sales) produce a draft-only B2B opportunity report. No external I/O.

**Not production-ready.** This is an isolated design validation only, not durable execution, genuine tenant isolation, cryptographic audit assurance or permissioned external actions. Missing before production: authentication, database RLS, durable queues/leases, idempotent side effects, independent tamper-resistant event storage, tool capabilities, approvals, privacy reviews, telemetry, budget limits, agent timeout/cancellation, and end-to-end live integration tests.

## Local read-only dashboard

Run `node prototype/dashboard-server.mjs` and visit `http://127.0.0.1:4173` locally. It runs the simulated workflow for each refresh and shows real simulated mission status, agent steps, pending review and evidence events; there are no mutation endpoints and no external actions.

The dashboard is not deployed, authenticated, connected to Nexus, or production-ready. Do not expose this local server publicly.
