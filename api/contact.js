// Server-side contact delivery. It is intentionally disabled until a responsible entity,
// privacy notice, verified receiving mailbox, sender, and anti-bot protection are configured.
// No CRM write, newsletter subscription, auto reply, or user tracking.
const allowedProducts=new Set(['offer','visibility','realtyflow','olivia','other']);
const safe=(s,limit)=>typeof s==='string'&&s.trim().length>0&&s.trim().length<=limit;
const clean=(s)=>String(s||'').trim();
const html=(s)=>clean(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function respond(res,code,body){res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json; charset=utf-8');return res.status(code).json(body);}
export default async function handler(req,res){
 if(req.method!=='POST'){res.setHeader('Allow','POST');return respond(res,405,{ok:false,error:'METHOD_NOT_ALLOWED'});}
 const cfg=process.env;
 const ready=cfg.CONTACT_FORM_ENABLED==='true'&&cfg.PRIVACY_APPROVED==='true'&&cfg.PUBLIC_LAUNCH==='true'&&
 ['PRIVACY_CONTROLLER_NAME','PRIVACY_CONTACT_EMAIL','PRIVACY_RETENTION_NO','PRIVACY_RETENTION_EN','CONTACT_INBOX','CONTACT_FROM','RESEND_API_KEY','TURNSTILE_SITE_KEY','TURNSTILE_SECRET_KEY','SITE_URL'].every(k=>Boolean(cfg[k]));
 if(!ready)return respond(res,503,{ok:false,error:'CONTACT_NOT_CONFIGURED'});
 const host=String(req.headers.host||'').toLowerCase();
 const origin=String(req.headers.origin||'');
 if(!host||origin!==('https://'+host)||('https://'+host)!==cfg.SITE_URL.replace(/\/$/,''))return respond(res,403,{ok:false,error:'ORIGIN_REJECTED'});
 const len=Number(req.headers['content-length']||0);if(len>12000)return respond(res,413,{ok:false,error:'PAYLOAD_TOO_LARGE'});
 let data=req.body;
 if(typeof data==='string'){try{data=JSON.parse(data);}catch{return respond(res,400,{ok:false,error:'INVALID_JSON'});}}
 if(!data||typeof data!=='object'||Array.isArray(data))return respond(res,400,{ok:false,error:'INVALID_BODY'});
 if(clean(data.website))return respond(res,400,{ok:false,error:'INVALID_REQUEST'}); // honeypot
 const {name,email,company,needs,product,challengeToken}=data;
 if(!safe(name,120)||!safe(email,254)||!safe(needs,2500)||typeof company!=='string'||company.length>160||
 !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)||!allowedProducts.has(product)||
 !safe(challengeToken,4096))return respond(res,422,{ok:false,error:'INVALID_FIELDS'});
 const verification=new URLSearchParams({secret:cfg.TURNSTILE_SECRET_KEY,response:clean(challengeToken)});
 try{
  const check=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{
   method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:verification.toString(),
   signal:AbortSignal.timeout(8000)
  });
  if(!check.ok)return respond(res,503,{ok:false,error:'VERIFICATION_UNAVAILABLE'});
  const result=await check.json();
  if(!result.success)return respond(res,403,{ok:false,error:'VERIFICATION_FAILED'});
  // Make sure a token generated for another hostname cannot be reused here.
  if(String(result.hostname||'').toLowerCase()!==host)return respond(res,403,{ok:false,error:'HOST_MISMATCH'});
  const msg={
   from:cfg.CONTACT_FROM,to:[cfg.CONTACT_INBOX],reply_to:clean(email),
   subject:'Altovena inquiry: '+product,
   text:[
    'Altovena contact form', 'Name: '+clean(name),'Company: '+clean(company),
    'Email: '+clean(email),'Product: '+product,'Message:',clean(needs),
    'Privacy notice acknowledged on website; not a newsletter subscription.'
   ].join('\n'),
   html:'<h2>Altovena inquiry</h2><p><strong>Name:</strong> '+html(name)+'</p><p><strong>Company:</strong> '+html(company)+'</p><p><strong>Email:</strong> '+html(email)+'</p><p><strong>Product:</strong> '+html(product)+'</p><pre style="white-space:pre-wrap">'+html(needs)+'</pre>'
  };
  const sent=await fetch('https://api.resend.com/emails',{
   method:'POST',headers:{Authorization:'Bearer '+cfg.RESEND_API_KEY,'Content-Type':'application/json'},
   body:JSON.stringify(msg),signal:AbortSignal.timeout(10000)
  });
  if(!sent.ok){return respond(res,502,{ok:false,error:'DELIVERY_FAILED'});}
  // Success is reported only after provider acceptance. Never claim CRM storage.
  return respond(res,200,{ok:true});
 }catch{
  return respond(res,503,{ok:false,error:'TEMPORARY_FAILURE'});
 }
}
