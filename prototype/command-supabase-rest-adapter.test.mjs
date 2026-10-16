import test from "node:test";
import assert from "node:assert/strict";
import { makeSupabaseCommandReadDependencies } from "./command-supabase-rest-adapter.mjs";
import { CommandReadService } from "./command-read-service.mjs";

const tenant = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const otherTenant = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
const userId = "cccccccc-cccc-cccc-cccc-cccccccccccc";
const missionId = "11111111-1111-1111-1111-111111111111";
const publishableKey = "sb_publishable_dummy_testing_only";
const projectUrl = "https://demo-ref.supabase.co";

function harness({ authStatus=200, isMember=true }={}) {
  const requests=[];
  const fetchImpl=async (url, opts)=>{
    const parsed=new URL(url);
    requests.push({url:parsed,opts});
    if(parsed.pathname==="/auth/v1/user"){
      return {ok:authStatus===200,status:authStatus,
        json:async()=>({id:userId})};
    }
    if(parsed.pathname==="/rest/v1/command_memberships_read"){
      return {ok:true,status:200,json:async()=>isMember ?
        [{tenant_id:tenant,user_id:userId,active:true}]:[]};
    }
    if(parsed.pathname==="/rest/v1/command_missions_read"){
      const id=parsed.searchParams.get("id");
      return {ok:true,status:200,json:async()=>id
        ? [{id:missionId,tenant_id:tenant,goal:"Test",state:"draft",version:1}]
        : [{id:missionId,tenant_id:tenant,goal:"Test",state:"draft",version:1},
          {id:"22222222-2222-2222-2222-222222222222",
           tenant_id:otherTenant,goal:"Must be hidden"}]};
    }
    throw Error("Unexpected provider route");
  };
  const service=new CommandReadService(makeSupabaseCommandReadDependencies({
    projectUrl,publishableKey,fetchImpl
  }));
  return {service,requests};
}
test("Supabase auth endpoint is used before membership and mission reads",async()=>{
  const {service,requests}=harness();
  const data=await service.listMissions({accessToken:"verified-test-jwt",tenantId:tenant});
  assert.equal(data.length,1);
  assert.equal(data[0].tenant_id,tenant);
  assert.deepEqual(requests.map(r=>r.url.pathname),[
    "/auth/v1/user",
    "/rest/v1/command_memberships_read",
    "/rest/v1/command_missions_read"
  ]);
  assert.ok(requests.every(r=>r.opts.method==="GET"));
  assert.ok(requests.every(r=>r.opts.redirect==="error"));
  assert.ok(requests.every(r=>r.opts.headers.apikey===publishableKey));
  assert.ok(requests.every(r=>r.opts.headers.Authorization==="Bearer verified-test-jwt"));
  const missionQuery=requests[2].url.searchParams;
  assert.equal(missionQuery.get("tenant_id"),"eq."+tenant);
  assert.equal(missionQuery.get("limit"),"20");
});
test("invalid Auth token cannot touch data views",async()=>{
  const {service,requests}=harness({authStatus:401});
  await assert.rejects(
    service.listMissions({accessToken:"bad-token",tenantId:tenant}),
    e=>e.status===401
  );
  assert.deepEqual(requests.map(r=>r.url.pathname),["/auth/v1/user"]);
});
test("verified nonmember cannot access mission views",async()=>{
  const {service,requests}=harness({isMember:false});
  await assert.rejects(service.listMissions({
    accessToken:"verified-test-jwt",tenantId:tenant
  }),e=>e.status===403);
  assert.deepEqual(requests.map(r=>r.url.pathname),[
    "/auth/v1/user","/rest/v1/command_memberships_read"
  ]);
});
test("single mission is read with tenant AND mission ID filters",async()=>{
  const {service,requests}=harness();
  const item=await service.getMission({
    accessToken:"verified-test-jwt",tenantId:tenant,missionId
  });
  assert.equal(item.id,missionId);
  assert.equal(requests[2].url.searchParams.get("id"),"eq."+missionId);
  assert.equal(requests[2].url.searchParams.get("tenant_id"),"eq."+tenant);
});
test("untrusted URLs and secret keys are rejected",()=>{
  const base={publishableKey,fetchImpl:async()=>({ok:true,json:async()=>[]})};
  for (const projectUrl of [
    "http://demo-ref.supabase.co", "https://evil.example",
    "https://demo-ref.supabase.co/other", "https://demo-ref.supabase.co@evil.example"
  ]) {
    assert.throws(()=>makeSupabaseCommandReadDependencies({...base,projectUrl}));
  }
  assert.throws(()=>makeSupabaseCommandReadDependencies({
    ...base,projectUrl,publishableKey:"sb_secret_RESTRICTED"
  }),/publishable key/);
});
