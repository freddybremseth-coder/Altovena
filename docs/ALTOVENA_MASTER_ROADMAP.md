# Altovena – Master Roadmap & Product Architecture
**Version:** 0.1 · **Updated:** 2026-10-16 · **Status:** Proposed, not production activated

## Purpose
This document is the coordinating index for Altovena products derived from RealtyFlow and the Nexus shared engine. It is a roadmap, **not** evidence that features are deployed, or that all integration boundaries are implemented. Product owners should confirm live GitHub PR, CI, database, and deployment states before changing code.

## Product and repository register
| Product / component | Canonical repository | Role | Integration principle |
| --- | --- | --- | --- |
| Altovena brand / website | [Altovena](https://github.com/freddybremseth-coder/Altovena) | Marketing, product discovery, lead intake | Stable public site; product status must be truthful |
| RealtyFlow Pro | [realtyflow-pro](https://github.com/freddybremseth-coder/realtyflow-pro) | Internal operating platform and initial Nexus runtime | Preserve production; no customer-facing activation by default |
| Nexus Core / Execution | [realtyflow-pro](https://github.com/freddybremseth-coder/realtyflow-pro) | Agent capabilities, tasks, authorization, audit | Define versioned server-side contracts before extraction |
| Altovena Command | [realtyflow-pro](https://github.com/freddybremseth-coder/realtyflow-pro) | Governed mission planning and agent coordination | Proposals are not execution; explicit approvals required |
| Altovena Intelligence | [realtyflow-pro](https://github.com/freddybremseth-coder/realtyflow-pro) (current development context; confirm module paths) | Commercial analysis and offer intelligence | Human approval; separate data-quality and buying-interest scores |
| Altovena Visibility | [realtyflow-pro](https://github.com/freddybremseth-coder/realtyflow-pro) (current development context; confirm module paths) | SEO/AEO/GEO visibility assessment and controlled changes | Show problem → proposed action → approval → verified result |
| Olivia OS | [olivia](https://github.com/freddybremseth-coder/olivia) | Independent farm operations SaaS product candidate | Maintain standalone codebase; use Nexus through authenticated APIs |
| Doña Anna | Olivia pilot and RealtyFlow integrations | First reference farm; not a generic customer default | Separate farm operations from Doña Anna B2B sales |

## Known development work (snapshot, 16 October 2026)
- [RealtyFlow PR #1423](https://github.com/freddybremseth-coder/realtyflow-pro/pull/1423): Nexus Execution Engine, draft; staged claim/revalidation, no live executor. Requires staging, authentication/tenant boundary security review and full integration validation before merge/activation.
- [RealtyFlow PR #1427](https://github.com/freddybremseth-coder/realtyflow-pro/pull/1427): Altovena Command Nexus planning, open; agent suggestions stored without starting execution.
- Both PRs target RealtyFlow `main`; they must be retested together on a fresh integration branch. Do not assume separately green CI proves end-to-end readiness.
- Multiple Altovena site and RealtyFlow product branches exist. Audit open PRs and deployment references before updating the release register.

## Integration track update — 16 October 2026
- [RealtyFlow PR #1428](https://github.com/freddybremseth-coder/realtyflow-pro/pull/1428) is the **draft integration branch** combining Nexus PR #1423 and Command PR #1427 for validation, with no production activation. It includes read-only Command → Nexus handoff readiness, fail-closed contract checks, and a combined CI run.
- The integration **does not yet create or execute Nexus tasks** from Command missions. Verified `altovena` tenant → `core` brand mapping, reviewed evidence and independent action approval are still required.
- Treat the original PRs and integration PR as dependent work; avoid merging all three independently. Verify latest-head combined CI and staging security gates first.
- Master roadmap remains a review-only draft until PR #6 is approved and merged.

## Command analysis preparation (17 October 2026)
- Draft [RealtyFlow PR #1428](https://github.com/freddybremseth-coder/realtyflow-pro/pull/1428) now includes a **preparation-only** step after saving a routing proposal.
- Owner-only Command API stores and retrieves an immutable analysis preparation record under `altovena`, tied to verified actor, mission ID, original routing digest and validated mission goal digest.
- Explicit hard limits at this stage: **zero model calls, zero cost, zero external actions**, no agent execution, no Nexus task creation. UI must never call this a completed analysis.
- Added cross-schema PostgreSQL fixture and contract tests for unauthorized access, proposal spoofing, idempotency and audit; final-head CI and staging review determine readiness. No runtime activation or live migration.
- Next gated work: verified tenant→brand mapping; safe analysis-only worker and evidence records; independent human review before any write or external action.

## Evidence gate for future analysis agents (17 October 2026)
- [RealtyFlow PR #1429](https://github.com/freddybremseth-coder/realtyflow-pro/pull/1429) is a **stacked draft** targeting integration PR #1428, not production `main`.
- Adds source/tenant-bound validation of analysis candidates: trusted captured evidence snapshots, SHA-256 excerpt digests, actual cited quotes, no unreviewed action permissions.
- Adds a separate GitHub CI-only mock-model harness to exercise one analysis callback and reported usage ceilings. **No real AI provider, no released worker, no source-retrieval authorization or production spending enforcement yet.**
- Only reports `awaiting_human_review`; content accuracy needs independent human and semantic review.
- Do not merge #1429 independently of #1428. Latest-head CI and dedicated staging remain blocking.

## Guarded real-model adapter (17 October 2026)
- [RealtyFlow PR #1430](https://github.com/freddybremseth-coder/realtyflow-pro/pull/1430) is a **stacked draft** based on analysis evidence PR #1429, itself based on integration PR #1428.
- Adds a new, disabled-by-default OpenAI Responses API adapter, constrained to a single no-tools/no-fallback read-only candidate analysis request.
- Requires a distinct analysis permit and a trusted **atomic quota/cost reservation repository** before sending; model responses are checked against server-authorized evidence. Tests inject mocks: no live model invocation has occurred.
- **Blocker:** the production reservation repository, issuance/revocation workflow, provider precharge & reconciliation, actual source-access authorization, reviewer workflow and staging are not implemented. Current persisted Command preparations still enforce **0 model calls / 0 spend**.
- PR order: merge only after resolving CI/build checks, security review and dependency branches. Keep production flags off until the full admission and billing lifecycle is proven.

## Tenant budget ledger (17 October 2026)
- [RealtyFlow PR #1431](https://github.com/freddybremseth-coder/realtyflow-pro/pull/1431) is a **draft**, stacked on #1430 → #1429 → #1428.
- Private `altovena` SQL tables: tenant-month spending envelopes, separately reviewed per-mission permits, one-use durable reservations and append-only audit events. No public APIs or Data API grants; RLS enabled.
- Atomic PostgreSQL tenant-month row lock prevents multiple simultaneous reservations from exceeding the configured ceiling. Zero configured budget means deny. Completed/uncertain calls conservatively retain the full reservation amount.
- Permits bind the exact original prepared mission/agent, current tenant membership, independent reviewer, approved model, goal/routing/source digest, token ceilings and reservation limit. SQL checks all submitted values against the persisted permit.
- CI uses an isolated PostgreSQL instance, including a race between two separately permitted analyses for a single remaining budget slot. No real model call or production schema migration.
- A typed private PostgreSQL `AnalysisAdmissionRepository` adapter now maps verified permit parameters and settlement to these SQL functions; it is not connected to a worker, HTTP endpoint or production DB connection.
- **Blocked before live use:** authenticated reviewer issuance and revocation UI, actual tenant source authorization, worker credential design, provider account spend enforcement/reconciliation, crash-safe review packet persistence, staging and full final-head CI.
- All four RealtyFlow PRs are dependent and must be integrated in order. Provider activation remains OFF.

## Independent analysis approval boundary (17 October 2026)
- [RealtyFlow PR #1432](https://github.com/freddybremseth-coder/realtyflow-pro/pull/1432) is a stacked **draft** targeting PR #1431; CI/staging and security review are mandatory.
- Added private request and independent reviewer decision functions for **read-only** analysis permits. The requester and reviewer must differ; approval rechecks tenant membership, active product entitlement, unchanged mission and routing digests, cost availability and a matching verified evidence attestation.
- Review decisions have append-only audit events; a second insertion fence prevents reservations when an evidence attestation has expired or been revoked.
- **Not live:** no production migration, authorized source-attestation ingestion, authenticated review UI, narrowly privileged worker role, real AI call or public route. The provider flag remains OFF.
- Dependency chain: #1428 → #1429 → #1430 → #1431 → #1432, with each PR needing fresh latest-head tests and explicit staging approval.

## Authorized source evidence snapshots (17 October 2026)
- [RealtyFlow PR #1435](https://github.com/freddybremseth-coder/realtyflow-pro/pull/1435) is a **stacked draft** after #1432, with separate, private tenant- and mission-scoped source capture and immutable PostgreSQL snapshots.
- New source-ID-only connector interface rejects arbitrary URLs, mismatched tenants/actors, expired captures and source-content tampering. **No real customer/Drive/CRM connector has been installed**; CI uses synthetic sources.
- SHA-256 hashes of individual captured excerpts combine into a canonical manifest digest, independently recalculated in PostgreSQL. The read-only model adapter's budget admission now uses this same digest rather than a transient JSON representation.
- Only a separate authorized reviewer can attest a stored, matching source bundle for a pending permit. No stored bundle means no legitimate evidence attestation; invalidated attestations block future reservation.
- **Blocked before release:** verified source connector credentials and access controls, narrowly scoped worker and reviewer identities, user-facing evidence review, privacy/retention controls, end-to-end staging and production spend reconciliation. Provider remains OFF, no Nexus tasks or external actions.

## Technical boundaries
1. **One source of truth per domain:** no copied Nexus agent authorization or execution policy inside each product.
2. **Versioned interfaces:** define mission, proposal, capability, approval, action request, dispatch receipt, and audit event contracts. Validate authorization at the API and database layers.
3. **Execution safety:** planning, analysis, approval, reservation, dispatch and verification are separate states. Recheck authorization after a reservation, immediately before dispatch; make external actions idempotent with immutable audit trails.
4. **Tenant security:** per-customer and per-brand isolation is mandatory, including data, storage, AI context, logs and offline queues. Never treat CORS or UI hiding as authorization.
5. **Deployment isolation:** shared SaaS and dedicated customer installations may share a versioned codebase; no per-customer fork by default. RealtyFlowPRO is not a staging environment.
6. **Release practice:** feature branch → PR → CI → integrated tests → preview/staging → reviewed merge → guarded production activation. No automatic merging or publishing merely because checks are green.
7. **Data ownership:** preserve existing RealtyFlow, Olivia, and Doña Anna production records; prepare migration and rollback plans prior to schema changes.

## Olivia OS – SaaS Foundation 1.0
The 2026-10-16 SaaS review identifies these *reported* concerns, which require validation against current code and data before production changes:
- P0: server-authenticated AI calls, rate limits, consumption accounting, tenant and farm isolation (including RLS), real mobile/workflow integration tests.
- P1: remove hard-coded Doña Anna/Biar defaults, self-service onboarding, configurable farm memberships/roles, safe offline sync.
- P2: subscriptions, farm-tier quotas and billing; external pilot on verified tenant isolation.
- Separate **Olivia OS** (farm operations) from **Doña Anna B2B** (sales), while integrating through scoped APIs.
- Maintain Doña Anna as a reference tenant; add a fictional test farm and enforce zero cross-farm access.

## Integration order
1. Review the two Command/Nexus PRs, test combined migrations, TypeScript contracts and authorization in isolated staging. Keep actual external agent execution OFF.
2. Establish shared Nexus contract package/API specifications without prematurely relocating all RealtyFlow code.
3. Document existing Intelligence and Visibility modules, their PRs, dependencies and customer-ready boundaries.
4. Create Olivia isolation and AI-cost security tests before multi-tenant activation.
5. Introduce Altovena-wide product catalog, entitlement configuration, monitoring, release dashboards and deployment checklist.
6. Only after stable contracts: consider extracting Nexus Core to a versioned reusable package/service.

## Coordination protocol for future development chats and agents
- This file is the cross-repository **coordination index**, not a replacement for code, issues, releases, or CI.
- Before every development task: inspect current `main`, relevant open PRs, migration history and production state.
- Record product, repo, issue/PR, dependency, affected schema, approval boundaries, tests and deployment status in each PR.
- If the same behavior appears in multiple products, modify its owning shared contract, not multiple forks.
- Work never continues autonomously between chat sessions unless an explicitly scheduled automation is configured. A new "fortsett" instruction starts a fresh, state-verified development pass.

## Definition of done for cross-product changes
- No regression of existing customer data or roles.
- Contract compatibility and tenant-isolation tests pass.
- Migration and rollback reviewed.
- Product preview validated on desktop and mobile when UI changes.
- Explicit authorization for writes/sends/publication.
- CI and deployment verified on the final combined commit; production release recorded separately.
