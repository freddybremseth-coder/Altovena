// Altovena is a public presentation site. All brand leads, CRM, follow-up and newsletters
// belong in RealtyFlow. This is a server-side bridge, NEVER an independent lead database.
// The route fails closed until RealtyFlow's dedicated Altovena intake is deployed and verified.
const allowedProducts=new Set(['offer','visibility','realtyflow','olivia','other']);
const clean=x=>String(x||'').trim();
const valid=(x,max)=>typeof x==='string'&&x.trim().length>0&&x.trim().length<=max;
function reply(res,status,body){res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json; charset=utf-8');return res.status(status).json(body);}
export default async function handler(req,res){
 if(req.method!=='POST'){res.setHeader('Allow','POST');return reply(res,405,{ok:false,error:'METHOD_NOT_ALLOWED'});}
 const cfg=process.env;
 const mandatory=[
  'PUBLIC_LAUNCH','SITEWIDE_EDITORIAL_APPROVED','CONTACT_FORM_ENABLED','PRIVACY_APPROVED','SITE_URL',
  'PRIVACY_CONTROLLER_NAME','PRIVACY_CONTACT_EMAIL','PRIVACY_RETENTION_NO',
  'PRIVACY_RETENTION_EN','TURNSTILE_SECRET_KEY','REALTYFLOW_ALTOVENA_INTAKE_URL',
  'REALTYFLOW_ALTOVENA_INTAKE_KEY'
 ];
 const ready=mandatory.every(k=>Boolean(cfg[k]))&&cfg.PUBLIC_LAUNCH==='true'&&
 cfg.CONTACT_FORM_ENABLED==='true'&&cfg.PRIVACY_APPROVED==='true'&&
 cfg.SITEWIDE_EDITORIAL_APPROVED==='true';
 if(!ready)return reply(res,503,{ok:false,error:'REALTYFLOW_INTAKE_NOT_READY'});
 let destination;
 try{destination=new URL(cfg.REALTYFLOW_ALTOVENA_INTAKE_URL);}catch{return reply(res,503,{ok:false,error:'INVALID_INTAKE_URL'});}
 if(destination.protocol!=='https:'||destination.username||destination.password||destination.search||destination.hash||
 destination.pathname!=='/api/public/altovena-leads')return reply(res,503,{ok:false,error:'INVALID_INTAKE_URL'});
 // Protect against arbitrary hosts or metadata-service SSRF: explicitly bind to production RealtyFlow host.
 if(destination.hostname!=='realtyflow.chatgenius.pro')return reply(res,503,{ok:false,error:'INVALID_INTAKE_HOST'});
 const sourceOrigin=clean(cfg.SITE_URL).replace(/\/$/,'');
 const requestOrigin=clean(req.headers.origin);
 if(!sourceOrigin.startsWith('https://')||requestOrigin!==sourceOrigin ||
 clean(req.headers.host)!==new URL(sourceOrigin).host)return reply(res,403,{ok:false,error:'ORIGIN_REJECTED'});
 const contentType=clean(req.headers['content-type']).toLowerCase().split(';')[0];
 if(contentType!=='application/json')return reply(res,415,{ok:false,error:'UNSUPPORTED_MEDIA_TYPE'});
 const length=Number(req.headers['content-length']||0);
 if(!Number.isFinite(length)||length<0||length>12000)return reply(res,413,{ok:false,error:'TOO_LARGE'});
 // Content-Length is optional and client-controlled. Validate actual payload size too.
 const rawSize=typeof req.body==='string'?Buffer.byteLength(req.body,'utf8'):Buffer.byteLength(JSON.stringify(req.body??null),'utf8');
 if(rawSize>12000)return reply(res,413,{ok:false,error:'TOO_LARGE'});
 let v=req.body;if(typeof v==='string'){try{v=JSON.parse(v);}catch{return reply(res,400,{ok:false,error:'INVALID_JSON'});}}
 if(!v||typeof v!=='object'||Array.isArray(v))return reply(res,400,{ok:false,error:'INVALID_REQUEST'});
 if(clean(v.website))return reply(res,422,{ok:false,error:'INVALID_REQUEST'});
 const {name,company,email,needs,product,challengeToken,submissionId,pageUrl}=v;
 if(!valid(name,120)||!valid(email,254)||!valid(needs,2500)||
 typeof company!=='string'||company.length>160||!allowedProducts.has(product)||
 !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)||
 !valid(challengeToken,4096)||typeof submissionId!=='string'||
 !/^[a-f\d]{8}-[a-f\d]{4}-[1-8][a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}$/i.test(submissionId))
 return reply(res,422,{ok:false,error:'INVALID_FIELDS'});
 try{
  const verify=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{
   method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},
   body:new URLSearchParams({secret:cfg.TURNSTILE_SECRET_KEY,response:clean(challengeToken)}).toString(),
   signal:AbortSignal.timeout(8000)
  });
  if(!verify.ok)return reply(res,503,{ok:false,error:'VERIFICATION_UNAVAILABLE'});
  const verified=await verify.json();
  if(!verified.success||clean(verified.hostname).toLowerCase()!==new URL(sourceOrigin).hostname)
   return reply(res,403,{ok:false,error:'VERIFICATION_REJECTED'});
  const payload={
   brandKey:'altovena',source:'altovena.com/contact',requestType:'product-enquiry',
   name:clean(name),company:clean(company),email:clean(email).toLowerCase(),
   message:clean(needs),product,consent:{purpose:'respond_to_request',marketing:false},
   submissionId:clean(submissionId).toLowerCase(),
   pageUrl:typeof pageUrl==='string'&&
    [sourceOrigin+'/en/book-demo/',sourceOrigin+'/no/bestill-demo/'].includes(pageUrl)
    ?pageUrl:sourceOrigin+'/no/bestill-demo/'
  };
  const response=await fetch(destination.href,{
   method:'POST',headers:{
    'Content-Type':'application/json','x-altovena-ingest-key':cfg.REALTYFLOW_ALTOVENA_INTAKE_KEY
   },body:JSON.stringify(payload),signal:AbortSignal.timeout(12000)
  });
  if(!response.ok)return reply(res,502,{ok:false,error:'REALTYFLOW_DELIVERY_FAILED'});
  const outcome=await response.json().catch(()=>null);
  // No success for simulated/ignored ingestion, spam-discard or empty response.
  if(outcome?.ok!==true||outcome?.accepted!==true||!outcome?.leadId||!outcome?.workItemId)
   return reply(res,502,{ok:false,error:'REALTYFLOW_NOT_CONFIRMED'});
  return reply(res,200,{ok:true,received:true});
 }catch{
  return reply(res,503,{ok:false,error:'REALTYFLOW_TEMPORARY_FAILURE'});
 }
}