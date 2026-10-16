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
