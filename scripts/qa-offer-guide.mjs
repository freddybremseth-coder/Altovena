import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'../dist');
const all=[];
const walk=d=>{for(const a of fs.readdirSync(d,{withFileTypes:true})){const f=path.join(d,a.name);if(a.isDirectory())walk(f);else if(a.name==='index.html'&&f!==path.join(root,'index.html'))all.push(f);}};
walk(root);
if(all.length!==34)throw Error('Expected 32 localized pages; got '+all.length);
for(const lang of ['en','no']){
 const route=lang==='no'?'no/innsikt/kvalifisere-b2b-leads':'en/insights/b2b-lead-qualification';
 const file=path.join(root,route,'index.html'),html=fs.readFileSync(file,'utf8');
 const h2=[...html.matchAll(/<section class="editorial-section" id="part-\d+"><h2>([^<]*)<\/h2><p><strong>/g)];
 if(h2.length!==8)throw Error('Eight answer-first H2 sections required '+route+', found '+h2.length);
 const tables=[...html.matchAll(/<table>/g)].length;
 if(tables!==1 || [...html.matchAll(/<th>/g)].length!==3)throw Error('Comparison table must use 3 columns '+route);
 const qs=[...html.matchAll(/<div class="editorial-faq"><h3>/g)].length;
 if(qs!==3)throw Error('FAQ needs three unique questions '+route);
 if(!html.includes('European Commission')||!html.includes('European Data Protection Board'))throw Error('Primary privacy sources missing '+route);
 if(!html.includes('/brand/logo-altovena.webp')||!html.includes('/editorial.css'))throw Error('Brand/editorial style missing '+route);
 if(!html.includes('data-insights-footer')||!html.includes('data-insights-nav'))throw Error('Hub internal navigation missing '+route);
 const other=lang==='en'?'/no/innsikt/kvalifisere-b2b-leads/':'/en/insights/b2b-lead-qualification/';
 if(!html.includes('href="'+other+'"'))throw Error('Localized language switch broken '+route);
 if(process.env.PUBLIC_LAUNCH!=='true' && !html.includes('name="robots" content="noindex,nofollow"'))throw Error('Draft must remain noindex '+route);
 if((html.match(/<h1\b/g)||[]).length!==1)throw Error('Single H1 required '+route);
 const hub=fs.readFileSync(path.join(root,lang,lang==='en'?'insights':'innsikt','index.html'),'utf8');
 if((process.env.PUBLIC_LAUNCH!=='true'||process.env.OFFER_GUIDE_APPROVED==='true')&&!hub.includes('/'+route+'/'))throw Error('Guide missing from Insights hub '+route);
}
console.log('PASS: Offer Intelligence bilingual guide, 8 answer-first sections, 3-column comparison, FAQ, primary GDPR references, hub links and release gating.');
