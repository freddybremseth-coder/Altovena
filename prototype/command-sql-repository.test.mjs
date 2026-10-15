import test from "node:test";
import assert from "node:assert/strict";
import { CommandSqlRepository } from "./command-sql-repository.mjs";
const tenant="aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const user="bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
const mission="cccccccc-cccc-cccc-cccc-cccccccccccc";
function fixture() {
  const calls=[];
  const repo=new CommandSqlRepository({
    trustedTenantId:tenant,
    query:async(sql,args)=>{calls.push({sql,args});return {rows:[]};}
  });
  return {repo,calls};
}
test("all repository statements scope to trusted tenant with bound parameters",async()=>{
  const {repo,calls}=fixture();
  await repo.createMission({createdBy:user,goal:"  Demo mission  "});
  await repo.getMission(mission);
  await repo.listMissions();
  await repo.transitionMission({missionId:mission,from:"draft",to:"planned",version:1});
  await repo.appendEvidence({missionId:mission,eventType:"mission.started",payload:{ok:true}});
  assert.equal(calls.length,5);
  assert.ok(calls.every(c=>c.args[0]===tenant));
  assert.ok(calls.every(c=>c.sql.includes("$1")));
  assert.deepEqual(calls[0].args,[tenant,user,"Demo mission",0]);
  assert.deepEqual(calls[3].args,[tenant,mission,"planned","draft",1]);
  assert.equal(calls[4].args[4],JSON.stringify({ok:true}));
});
test("state transitions reject unsafe or stale input before SQL dispatch",async()=>{
  const {repo,calls}=fixture();
  await assert.rejects(repo.transitionMission({missionId:mission,from:"draft",to:"completed",version:1}),/invalid state/);
  await assert.rejects(repo.transitionMission({missionId:mission,from:"draft",to:"planned",version:0}),/invalid version/);
  assert.equal(calls.length,0);
});
test("invalid identity, payload and limit rejected",async()=>{
  const {repo,calls}=fixture();
  assert.throws(()=>new CommandSqlRepository({trustedTenantId:"untrusted",query:async()=>({rows:[]})}),/UUID/);
  await assert.rejects(repo.getMission("not-a-uuid"),/UUID/);
  await assert.rejects(repo.createMission({createdBy:user,goal:""}),/goal/);
  await assert.rejects(repo.listMissions({limit:1000}),/limit/);
  await assert.rejects(repo.appendEvidence({missionId:mission,eventType:"bad name",payload:{}}),/event type/);
  assert.equal(calls.length,0);
});
test("read and CAS transition return null when row missing or stale",async()=>{
  const {repo}=fixture();
  assert.equal(await repo.getMission(mission),null);
  assert.equal(await repo.transitionMission({missionId:mission,from:"draft",to:"planned",version:1}),null);
});
