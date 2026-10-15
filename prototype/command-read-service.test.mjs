import test from "node:test";
import assert from "node:assert/strict";
import { CommandReadService, AccessError } from "./command-read-service.mjs";
const tenantA="aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const tenantB="bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
const userA="cccccccc-cccc-cccc-cccc-cccccccccccc";
function setup({active=true,verified=true}={}) {
 const calls=[];
 const service=new CommandReadService({
  verifySession: async token => {
   calls.push("verify");
   if(!verified || token!=="trusted-token") throw Error("invalid");
   return {userId:userA};
  },
  isActiveMember:async ({tenantId})=>{
   calls.push("membership");
   return active && tenantId===tenantA;
  },
  repositoryFactory:async ({tenantId})=>{
   calls.push("repository:"+tenantId);
   return {
    listMissions:async()=>[{id:"m1",tenantId}],
    getMission:async(id)=>({id,tenantId})
   };
  }
 });
 return {service,calls};
}
const auth={accessToken:"trusted-token",tenantId:tenantA};
test("requires verified session before membership and database",async()=>{
 const {service,calls}=setup({verified:false});
 await assert.rejects(service.listMissions(auth),e=>e instanceof AccessError && e.status===401);
 assert.deepEqual(calls,["verify"]);
});
test("inactive membership rejects access even for verified user",async()=>{
 const {service,calls}=setup({active:false});
 await assert.rejects(service.listMissions(auth),e=>e instanceof AccessError && e.status===403);
 assert.deepEqual(calls,["verify","membership"]);
});
test("tenant B is rejected without repository access",async()=>{
 const {service,calls}=setup();
 await assert.rejects(service.listMissions({...auth,tenantId:tenantB}),e=>e.status===403);
 assert.deepEqual(calls,["verify","membership"]);
});
test("authorized read uses tenant-scoped repository",async()=>{
 const {service,calls}=setup();
 const rows=await service.listMissions(auth);
 assert.equal(rows[0].tenantId,tenantA);
 assert.deepEqual(calls,["verify","membership","repository:"+tenantA]);
});
test("missing session and malformed resource IDs reject early",async()=>{
 const {service,calls}=setup();
 await assert.rejects(service.listMissions({accessToken:"",tenantId:tenantA}),e=>e.status===401);
 await assert.rejects(service.listMissions({...auth,tenantId:"not-uuid"}),e=>e.status===400);
 await assert.rejects(service.getMission({...auth,missionId:"not-uuid"}),e=>e.status===400);
 assert.deepEqual(calls,[]);
});
