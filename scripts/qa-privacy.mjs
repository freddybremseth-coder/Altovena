import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'../dist');
const routes={no:'no/personvern',en:'en/privacy'};
const pages=[];
function walk(dir){for(const n of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,n.name);if(n.isDirectory())walk(f);else if(n.name==='index.html'&&f!==path.join(root,'index.html'))pages.push(f);}}
walk(root);
if(pages.length!==34)throw Error('Privacy launch: expected 32 localized pages, got '+pages.length);
for(const file of pages.filter(f=>!f.includes('/demo-workspace/')&&!f.includes('/demo-arbeidsflate/'))){
 const html=fs.readFileSync(file,'utf8');
 if(!html.includes('data-privacy-footer'))throw Error('Missing privacy link: '+file);
 if((html.match(/<h1\b/g)||[]).length!==1)throw Error('Wrong H1: '+file);
 if(!/lang="(en|nb)"/.test(html))throw Error('Wrong language '+file);
 for(const m of html.matchAll(/href="(\/[^"#?]+)(?:[?#][^"]*)?"/g))
  if(!fs.existsSync(path.join(root,m[1].slice(1))))throw Error('Broken internal link '+m[1]+' in '+file);
}
for(const lang of ['en','no']){
 const policy=fs.readFileSync(path.join(root,routes[lang],'index.html'),'utf8');
 const page=fs.readFileSync(path.join(root,lang,lang==='en'?'book-demo':'bestill-demo','index.html'),'utf8');
 const equivalent=lang==='no'?'/en/privacy/':'/no/personvern/';
 if(!policy.includes('href="'+equivalent+'"'))throw Error('Missing hreflang language switch '+lang);
 if(!policy.includes('/privacy.css')||!policy.includes('Agencia')&&!policy.includes('AEPD'))throw Error('Missing privacy presentation '+lang);
 const h2=[...policy.matchAll(/<h2\b/g)].length;if(h2<8)throw Error('Policy needs full GDPR disclosures '+lang);
 if(!page.includes('/'+routes[lang]+'/')||!page.includes('privacy-form-notice'))throw Error('Two-layer contact disclosure missing '+lang);
 if(!page.includes('data-enquiry-form')&&process.env.CONTACT_FORM_ENABLED!=='true')throw Error('Email-draft fallback missing '+lang);
 if(process.env.CONTACT_FORM_ENABLED!=='true'&&page.includes('/contact-form.js'))throw Error('Live data collection not authorized '+lang);
 if(process.env.PUBLIC_LAUNCH!=='true'&&!policy.includes('name="robots" content="noindex,nofollow"'))throw Error('Privacy draft must remain noindex '+lang);
 if(!policy.includes('European Commission')&&!policy.includes('Europakommisjonen'))throw Error('Primary source missing '+lang);
}
const api=fs.readFileSync(path.resolve(import.meta.dirname,'../api/contact.js'),'utf8');
for(const flag of ['CONTACT_FORM_ENABLED','PRIVACY_APPROVED','PRIVACY_CONTROLLER_NAME','REALTYFLOW_ALTOVENA_INTAKE_URL','REALTYFLOW_ALTOVENA_INTAKE_KEY','TURNSTILE_SECRET_KEY'])
 if(!api.includes(flag))throw Error('Contact server gate missing '+flag);
if(!api.includes("brandKey:'altovena'")||api.includes("https://api.resend.com/")) throw Error('Contact must be routed only to Altovena brand in RealtyFlow, not standalone Resend');
for(const lang of ['en','no']){
 const privacy=fs.readFileSync(path.join(root,routes[lang],'index.html'),'utf8');
 if(!privacy.includes('RealtyFlow')||privacy.includes('Resend'))throw Error('RealtyFlow must be disclosed, not Resend: '+lang);
}
console.log('PASS: 32 pages, privacy disclosures, safe draft fallback, scoped RealtyFlow-only delivery gate, noindex, links.');
