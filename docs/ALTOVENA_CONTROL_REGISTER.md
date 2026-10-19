# Altovena Control Register — canonical delivery tracker
**Snapshot:** 2026-10-19 · **Owner:** Freddy · **Status:** initial evidence-based inventory, not exhaustive.
**Scope:** Altovena website, RealtyFlow/Nexus, Command, Visibility, Intelligence, CRM, Olivia OS.
**Do not confuse this register with a deployed Control Center.** This is a versioned GitHub planning artifact. No runtime, migration, flags, email or release action is authorized by its creation.

## Why this exists
Development across different chats and dependent pull requests must converge on one persistent backlog. The fuller architecture and dependency history is recorded in Altovena PR #6 `docs/ALTOVENA_MASTER_ROADMAP.md` on branch `docs/altovena-platform-roadmap-20261016` (not yet assumed merged). This initial tracker is deliberately independent of unmerged product code.

## Status vocabulary
DECIDED, PLANNED, IMPLEMENTING, CI_VERIFIED_AT_SHA, MERGED_TO_MAIN, PRODUCTION_DEPLOYED_AT_SHA, ACCEPTANCE_VERIFIED, DELIVERED; also BLOCKED, SUPERSEDED, CANCELLED.
**Never infer later states from earlier ones**: preview READY ≠ production; merged ≠ enabled; CI ≠ human acceptance; read-only demo ≠ executing agent.
Every task requires owner, repo, canonical PR/issue, dependency, next action, evidence timestamp and release flag.

## Immediate P0 backlog
| ID | Product | Evidence (GitHub unless noted) | Current evidence | Next action / acceptance criterion | Owner |
| --- | --- | --- | --- | --- | --- |
| AV-001 | Program governance | Altovena #6; RealtyFlow #1439 (closed without merge) | Master roadmap exists on development branch; consolidated portfolio UI not delivered | Reconcile master roadmap, deduplicate PR chains, implement read-only Control Center from current main with real status labels; review navigation and access | Freddy / engineering |
| AV-002 | Public website | Altovena #2; Vercel altovena | 32 localized routes tested on preview per PR; production target from Vercel is original `main` SHA `553121e5`, not website preview | Editorial, legal, privacy, mobile/keyboard and factual-claim approvals; deploy correct approved SHA; verify domain and routes | Andrea / Erlend / Freddy / Anna |
| AV-003 | Website → CRM intake | Altovena #5; RealtyFlow #1400, #1446 | Draft gated form and offline cross-repo E2E; public submission disabled | Dedicated staging + real operator grants; consent, Turnstile, submission → exactly one CRM lead + task + alert; privacy/revocation and controlled activation | Freddy / engineering |
| AV-004 | Staging isolation | RealtyFlow #1464, #1465, #1466, #1469, #1470 | Drafts for integration, isolated server-only staging DB and staging auth/session; no proven real staging tenant | Obtain explicit cost approval for dedicated Supabase staging; configure scoped credentials; verify two operator accounts and revoked access; current-head CI & preview. Never reuse RealtyFlow production DB | Freddy / engineering |
| AV-005 | Operator notifications | RealtyFlow #1454, #1456, #1457, #1458, #1461 | Draft chain for backlog, cron, operator inbox, delivery preflight and SMTP acceptance | Test real staging acceptance and idempotent alert delivery; no production SMTP until authorized | Freddy / engineering |
| AV-006 | Offer Intelligence pilot | RealtyFlow #1323, #1326; corporate modules | Reusable research, signal review and human gate exist; not verified as standalone paying-customer SaaS | Audit actual main/prod capabilities; keep data-quality and intent scores distinct; one company → evidence dossier → approval → follow-up; pilot scope/pricing | Freddy / Anna |
| AV-007 | Visibility complete loop | RealtyFlow #1440–#1459, #1462, #1463 | SEO evidence, GitHub exact-SHA verification and approval work; some newer features are draft | One allowed finding → owner-approved change → review/CI → controlled merge/deploy → independent public-site recheck, with audit record. No implied automatic publishing | Freddy / engineering / Erlend |
| AV-008 | Command first real mission | RealtyFlow #1423, #1427–#1437; Altovena #4 | Draft planning, snapshots, review and cost controls, some owner-only draft UI; no verified real executing agent | One narrow evidence-backed analysis → second-agent review → owner approval → internal follow-up task; secure source grants, budget and worker boundary | Freddy / engineering |
| AV-009 | SaaS separation | RealtyFlow/Nexus, Altovena #4/#6 | Intent: first Altovena schema in RealtyFlow, customer-specific isolation later | Versioned API and entitlement model; tenant RLS/Auth isolation, installer, backups, rollback, metering & billing before first external tenant | Freddy / engineering / Anna |
| AV-010 | Olivia OS SaaS | Olivia repository; Altovena #6 | Independent candidate; existing farm operations pilot; previous mobile B2B menu and repeat-analysis issues reported | Audit current code and fix farm-only mobile navigation, repeat-analysis reliability and farm tenant separation; staged second fake farm; independent acceptance | Freddy / engineering |

## P1 and P2 backlog
- AV-011 (P1) Product catalog: define truthful status and single product promise across Altovena website and RealtyFlow.
- AV-012 (P1) Branded operational workspaces: include permissions for Freddy/Andrea without global finance/system grants; test brand-scoped access.
- AV-013 (P1) Sales onboarding: product demo, proposal, SLA, pricing, manual fulfillment and customer support.
- AV-014 (P2) Subscription/billing: plans, quotas, cancellation, invoices, tax/legal review.
- AV-015 (P2) Separate client installations: versioned repeatable provisioning with backup/restore and update path.
- AV-016 (P2) Olivia OS integration with Nexus through scoped API (never shared production credential).
- AV-017 (P2) Reporting: customer outcomes/quality, costs and conversion, not invented efficacy.

## Current known dependency groups — avoid duplicate merges
- Website/CRM: Altovena #5 ↔ RealtyFlow #1400 → #1446 → #1454 → #1456 → #1457 → #1458 → #1461 → integration #1464 → staging #1465/#1466/#1469/#1470. Inspect actual current bases before any merge.
- Command: RealtyFlow #1423 + #1427 → #1428 → #1429 → #1430 → #1431 → #1432 → #1435 (+ #1436 ACL recheck) → #1437. Superseded #1434 must not be merged.
- Visibility has independent canonical line. PR #1439 was closed without merge; do not describe its dashboard as live.
- Altovena website #2, #4, #5, #6 remain distinct from base production. Vercel READY previews do not mean production.
- RealtyFlow #1467/#1468/#1471 are about the read-only launch surface/evidence, not proof that CRM/intake is active.

## Cadence and release rules
1. Start each session with current `main`, open PRs, fresh CI at head SHA, migration history and Vercel production target.
2. Choose *one* P0 deliverable and record candidate SHA, current baseline, tests, data safety and user-visible goal.
3. Before starting new code, search for existing PR, duplicate branch and owner. Link or supersede rather than reimplement.
4. End each session by updating this tracker (or its successor canonical data source), PR links, verified status and next specific action.
5. New UI and public marketing claims require honest feature status; do not ship simulated runtime as live.
6. Human approval required for migrations affecting data, paid staging resources, external emails and public launch.
7. Acceptance is per real workflow, not per PR count.

## Immediate next engineering increment
Develop a **read-only owner-only Altovena Control Center inside RealtyFlow** using the existing launch checklist where suitable; it must show product, canonical source, latest verified evidence timestamp, stage, blockers and next task. Avoid importing all Altovena branch code. Reconcile this file and the full Altovena PR #6 master roadmap first. Source states must be surfaced as dated snapshots, not invented live checks.

## Evidence caveats
This is an initial 2026-10-19 inspection, not a line-by-line audit of every PR, deployment, Supabase migration or Olivia repository. All state transitions need subsequent verification. No changes to production or live customer data have been performed by this register.
