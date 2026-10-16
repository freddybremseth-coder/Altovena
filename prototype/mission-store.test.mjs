import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { LocalMissionStore } from "./mission-store.mjs";
test("mission persists between store instances and is isolated by tenant ID",async()=>{
 const dir=await mkdtemp(join(tmpdir(),"command-store-"));
 try {
  const path=join(dir,"state.json");
  await new LocalMissionStore(path).save({id:"m1",tenantId:"company-a",state:"planned"});
  const reopened=new LocalMissionStore(path);
  assert.equal((await reopened.find("company-a","m1")).state,"planned");
  assert.equal(await reopened.find("company-b","m1"),null);
  assert.equal((await reopened.list("company-b")).length,0);
  await reopened.save({id:"m1",tenantId:"company-a",state:"completed"});
  assert.equal((await reopened.list("company-a")).length,1);
  assert.equal((await reopened.find("company-a","m1")).state,"completed");
  await assert.rejects(reopened.save({id:"m1",tenantId:"company-b",state:"planned"}),/Tenant collision/);
 } finally {await rm(dir,{recursive:true,force:true});}
});
test("missing file returns empty store",async()=>{
 const dir=await mkdtemp(join(tmpdir(),"command-empty-"));
 try{assert.deepEqual(await new LocalMissionStore(join(dir,"none.json")).list("company-a"),[])}
 finally{await rm(dir,{recursive:true,force:true});}
});
