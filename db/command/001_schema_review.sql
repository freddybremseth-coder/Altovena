-- Altovena Command v0.1: REVIEW-ONLY migration. Do not run on production.
-- Requires authenticated service boundary. No policies granting anonymous access.
create schema if not exists command;
create table if not exists command.missions (
 id uuid primary key default gen_random_uuid(),
 tenant_id uuid not null,
 created_by uuid not null,
 goal text not null check (length(trim(goal)) between 1 and 4000),
 state text not null default 'draft' check (state in ('draft','planned','running','awaiting_review','approved','executing','verifying','completed','paused','rejected','cancelled','failed','partial')),
 version integer not null default 1 check (version > 0),
 budget_cents integer not null default 0 check (budget_cents >= 0),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique (tenant_id,id)
);
create table if not exists command.tasks (
 id uuid primary key default gen_random_uuid(),
 tenant_id uuid not null,
 mission_id uuid not null,
 agent_id text not null,
 status text not null default 'pending' check(status in ('pending','running','completed','failed','awaiting_review','cancelled')),
 idempotency_key text not null,
 result_ref text,
 created_at timestamptz not null default now(),
 unique (tenant_id,mission_id,idempotency_key),
 foreign key (tenant_id,mission_id) references command.missions(tenant_id,id)
);
create unique index if not exists command_tasks_tenant_id_id_idx on command.tasks (tenant_id,id);
create table if not exists command.events (
 id uuid primary key default gen_random_uuid(),
 tenant_id uuid not null,
 mission_id uuid not null,
 task_id uuid,
 event_type text not null,
 payload jsonb not null default '{}'::jsonb,
 occurred_at timestamptz not null default now(),
 foreign key (tenant_id,mission_id) references command.missions(tenant_id,id),
 foreign key (tenant_id,task_id) references command.tasks(tenant_id,id)
);
create index if not exists command_events_mission_order_idx on command.events(tenant_id,mission_id,occurred_at,id);
create table if not exists command.approvals (
 id uuid primary key default gen_random_uuid(),
 tenant_id uuid not null,
 mission_id uuid not null,
 task_id uuid,
 action_type text not null,
 payload_hash text not null,
 status text not null default 'pending' check(status in ('pending','approved','rejected','expired')),
 requested_by uuid not null,
 reviewer_id uuid,
 expires_at timestamptz not null,
 created_at timestamptz not null default now(),
 check(reviewer_id is null or reviewer_id <> requested_by),
 foreign key (tenant_id,mission_id) references command.missions(tenant_id,id),
 foreign key (tenant_id,task_id) references command.tasks(tenant_id,id)
);
-- No RLS authorization is considered complete without a verified identity-to-tenant
-- membership source and integration tests. Until then, revoke client access.
revoke all on schema command from public, anon, authenticated;
revoke all on all tables in schema command from public, anon, authenticated;
alter table command.missions enable row level security;
alter table command.tasks enable row level security;
alter table command.events enable row level security;
alter table command.approvals enable row level security;
-- DB privileges, tenant membership, RLS policies, append-only event enforcement,
-- atomic outbox, optimistic updates, leases and approval transactions are NOT yet implemented.
