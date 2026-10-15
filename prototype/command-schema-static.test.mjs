import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const sql = readFileSync(new URL("../db/command/001_schema_review.sql", import.meta.url),"utf8");
test("migration stays deny by default",()=>{
 for(const table of ["missions","tasks","events","approvals"]){
  assert.match(sql,new RegExp("alter table command\\."+table+" enable row level security;"));
 }
 assert.match(sql,/revoke all on all tables in schema command from public, anon, authenticated;/);
 assert.doesNotMatch(sql,/create policy|grant select|grant insert|grant update/i);
});
test("task composite uniqueness defined before event FK",()=>{
 const unique=sql.indexOf("create unique index if not exists command_tasks_tenant_id_id_idx");
 const events=sql.indexOf("create table if not exists command.events");
 assert.ok(unique>=0 && unique<events);
});
