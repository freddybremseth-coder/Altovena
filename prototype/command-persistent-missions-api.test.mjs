import test from "node:test";
import assert from "node:assert/strict";
import { createPersistentMissionsHandler } from "../command-demo/api/persistent-missions.js";
const env={
  COMMAND_SUPABASE_URL:"https://demo-ref.supabase.co",
  COMMAND_SUPABASE_PUBLISHABLE_KEY:"sb_publishable_demo_ci_only"
};
const tenantId="aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const userId="cccccccc-cccc-cccc-cccc-cccccccccccc";
function reply() {
  const headers={};
  return {
    headers, statusCode:200, body:undefined,
    setHeader(name,value){headers[name]=value;},
    status(code){this.statusCode=code;return this;},
    json(value){this.body=value;return this;}
  };
}
const req=(overrides={})=>({
  method:"GET",headers:{authorization:"Bearer dummy.jwt.token"},
  query:{tenantId},...overrides
});
test("unauthenticated and unconfigured endpoints fail closed",async()=>{
  let calls=0;
  const handler=createPersistentMissionsHandler({
    env:{},fetchImpl:async()=>{calls++;throw Error("should not run");}
  });
  const res=reply();
  await handler(req(),res);
  assert.equal(res.statusCode,503);
  assert.equal(calls,0);
  assert.equal(res.body.error,"persistent_storage_not_configured");
  const handlerConfigured=createPersistentMissionsHandler({env,fetchImpl:async()=>{calls++;}});
  const unauthorized=reply();
  await handlerConfigured(req({headers:{}}),unauthorized);
  assert.equal(unauthorized.statusCode,401);
  assert.equal(calls,0);
});
test("POST is blocked before auth or database lookup",async()=>{
  const handler=createPersistentMissionsHandler({env});
  const res=reply();
  await handler(req({method:"POST"}),res);
  assert.equal(res.statusCode,405);
  assert.equal(res.headers.Allow,"GET");
});
test("verified member receives persisted read-only missions",async()=>{
  const urls=[];
  const fetchImpl=async (url,opts)=>{
    const u=new URL(url);
    urls.push(u.pathname);
    assert.equal(opts.method,"GET");
    if(u.pathname==="/auth/v1/user")return {ok:true,status:200,json:async()=>({id:userId})};
    if(u.pathname.endsWith("altovena_my_memberships_read"))return {
      ok:true,status:200,json:async()=>[{tenant_id:tenantId,user_id:userId,active:true}]
    };
    if(u.pathname.endsWith("altovena_command_missions_read"))return {
      ok:true,status:200,json:async()=>[{id:"11111111-1111-1111-1111-111111111111",
        tenant_id:tenantId,goal:"Mission saved",state:"draft",version:1}]
    };
    throw Error("unexpected route");
  };
  const handler=createPersistentMissionsHandler({env,fetchImpl});
  const res=reply();
  await handler(req(),res);
  assert.equal(res.statusCode,200);
  assert.equal(res.body.mode,"PERSISTENT_READ_ONLY");
  assert.equal(res.body.count,1);
  assert.deepEqual(urls,[
    "/auth/v1/user", "/rest/v1/altovena_my_memberships_read",
    "/rest/v1/altovena_command_missions_read"
  ]);
  assert.match(res.headers["Cache-Control"],/no-store/);
});
test("provider failures do not expose upstream error text",async()=>{
  const handler=createPersistentMissionsHandler({env,fetchImpl:async()=>{throw Error("private provider detail");}});
  const res=reply();
  await handler(req(),res);
  assert.equal(res.statusCode,503);
  assert.deepEqual(res.body,{error:"authentication_provider_unavailable"});
});
test("invalid query and duplicate tenant reject before provider calls",async()=>{
  let calls=0;
  const handler=createPersistentMissionsHandler({
    env,fetchImpl:async()=>{calls++;throw Error("unexpected provider call");}
  });
  for(const query of [{tenantId,limit:"5000"},{tenantId:[tenantId,tenantId]}]){
    const res=reply();
    await handler(req({query}),res);
    assert.equal(res.statusCode,400);
  }
  assert.equal(calls,0);
});
