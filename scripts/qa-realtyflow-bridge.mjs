import assert from 'node:assert/strict';
import handler from '../api/contact.js';

const keys=['PUBLIC_LAUNCH','CONTACT_FORM_ENABLED','PRIVACY_APPROVED','SITE_URL',
'PRIVACY_CONTROLLER_NAME','PRIVACY_CONTACT_EMAIL','PRIVACY_RETENTION_NO',
'PRIVACY_RETENTION_EN','TURNSTILE_SECRET_KEY','REALTYFLOW_ALTOVENA_INTAKE_URL',
'REALTYFLOW_ALTOVENA_INTAKE_KEY'];

function request(body,overrides={}){
  return {method:'POST',headers:{host:'altovena.com',origin:'https://altovena.com','content-length':'600',...overrides},body};
}
function response(){return {statusCode:200,headers:{},setHeader(k,v){this.headers[k]=v;return this;},status(n){this.statusCode=n;return this;},json(body){this.body=body;return this;}};}
const valid={name:'Preview Test',email:'preview@example.invalid',company:'Example Ltd',needs:'Please discuss workflow integration',product:'offer',
 challengeToken:'test-challenge',submissionId:'4fb77008-e821-4f9b-b620-8cbab6d411d7',pageUrl:'https://altovena.com/en/book-demo/'};
const originals=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
const initialFetch=globalThis.fetch;
for(const [k,v] of Object.entries({
PUBLIC_LAUNCH:'true',CONTACT_FORM_ENABLED:'true',PRIVACY_APPROVED:'true',
SITE_URL:'https://altovena.com',PRIVACY_CONTROLLER_NAME:'Verified Test Operator',
PRIVACY_CONTACT_EMAIL:'privacy@example.invalid',PRIVACY_RETENTION_NO:'test',
PRIVACY_RETENTION_EN:'test',TURNSTILE_SECRET_KEY:'test-only',
REALTYFLOW_ALTOVENA_INTAKE_URL:'https://realtyflow.chatgenius.pro/api/public/altovena-leads',
REALTYFLOW_ALTOVENA_INTAKE_KEY:'test-secret'}))process.env[k]=v;
const seen=[];
globalThis.fetch=async(url,options)=>{
  seen.push({url:String(url),options});
  if(String(url).includes('turnstile'))return {ok:true,json:async()=>({success:true,hostname:'altovena.com'})};
  return {ok:true,json:async()=>({ok:true,accepted:true,leadId:'11111111-1111-4111-8111-111111111111',workItemId:'22222222-2222-4222-8222-222222222222'})};
};
try{
 const res=response();await handler(request(valid),res);
 assert.equal(res.statusCode,200);
 assert.equal(res.body?.received,true);
 assert.equal(seen.length,2);
 assert.equal(seen[1].url,'https://realtyflow.chatgenius.pro/api/public/altovena-leads');
 const forwarded=JSON.parse(seen[1].options.body);
 assert.equal(forwarded.brandKey,'altovena');
 assert.equal(forwarded.submissionId,valid.submissionId);
 assert.equal(forwarded.pageUrl,'https://altovena.com/en/book-demo/');
 assert.equal(forwarded.consent.marketing,false);

 seen.length=0;
 const resBad=response();await handler(request({...valid,submissionId:'not-a-uuid'}),resBad);
 assert.equal(resBad.statusCode,422);
 assert.equal(seen.length,0);

 seen.length=0;
 process.env.CONTACT_FORM_ENABLED='false';
 const resOff=response();await handler(request(valid),resOff);
 assert.equal(resOff.statusCode,503);
 assert.equal(seen.length,0);
 process.env.CONTACT_FORM_ENABLED='true';

 seen.length=0;
 globalThis.fetch=async(url)=>{
  if(String(url).includes('turnstile'))return {ok:true,json:async()=>({success:true,hostname:'altovena.com'})};
  return {ok:true,json:async()=>({ok:true,accepted:true,leadId:'11111111-1111-4111-8111-111111111111'})};
 };
 const noTask=response();await handler(request(valid),noTask);
 assert.equal(noTask.statusCode,502);
 const browserClient=(await import('node:fs')).readFileSync(new URL('../public/contact-form.js',import.meta.url),'utf8');
 assert.match(browserClient,/form\.addEventListener\('input',resetPendingForEdits\)/);
 assert.match(browserClient,/form\.addEventListener\('change',resetPendingForEdits\)/);
 assert.match(browserClient,/delete form\.dataset\.pendingSubmissionId/);
 console.log('PASS: RealtyFlow bridge has a stable submission ID, scoped destination, privacy flags, disabled path and confirmed-work-item gate.');
}finally{
  globalThis.fetch=initialFetch;
  for(const k of keys)if(originals[k]===undefined)delete process.env[k];else process.env[k]=originals[k];
}
