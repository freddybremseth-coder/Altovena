import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'../dist');
const all=[];
function walk(dir){for(const x of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,x.name);if(x.isDirectory())walk(p);else if(x.name==='index.html'&&p!==path.join(root,'index.html'))all.push(p);}}
walk(root);
if(all.length!==22)throw Error(`Expected 22 localized pages, got ${all.length}`);
for(const f of all){const txt=fs.readFileSync(f,'utf8');if(!txt.includes('/scenario.css')||!txt.includes('/scenario.js'))throw Error('Missing v0.3 assets: '+f);if(!/href="\/(en\/applied-work|no\/praktisk-bruk)\/"/.test(txt))throw Error('Missing applied work link: '+f);const h1=[...txt.matchAll(/<h1\b/g)].length;if(h1!==1)throw Error(`H1 count ${h1} in ${f}`);for(const m of txt.matchAll(/href="(\/[^"#?]+)(?:\?[^"#]*)?(?:#[^"]*)?"/g)){const dest=path.join(root,m[1].slice(1));if(!fs.existsSync(dest))throw Error(`${f}: broken path ${m[1]}`);}}
for(const lang of ['en','no']){
  const applied=fs.readFileSync(path.join(root,lang,lang==='en'?'applied-work':'praktisk-bruk','index.html'),'utf8');
  for(const label of ['ZenEcoHomes','Doña Anna'])if(!applied.includes(label))throw Error('Operating context missing: '+label);
  if(!applied.includes('name="description"'))throw Error('Case page description missing');
  for(const [slug,id] of [['offer-intelligence','offer'],['visibility','visibility']]){
    const sub=lang==='en'?'products':'produkter';const s=fs.readFileSync(path.join(root,lang,sub,slug,'index.html'),'utf8');if(!s.includes('data-scenario-widget')||[...s.matchAll(/data-scenario-panel/g)].length!==2||!s.includes(`?product=${id}`))throw Error('Scenario/lead link missing: '+lang+'/'+slug);
  }
  const form=fs.readFileSync(path.join(root,lang,lang==='en'?'book-demo':'bestill-demo','index.html'),'utf8');if(!form.includes('data-enquiry-form'))throw Error('No enquiry form');
}
if(!process.env.PUBLIC_LAUNCH||process.env.PUBLIC_LAUNCH!=='true'){
 if(fs.existsSync(path.join(root,'sitemap.xml')))throw Error('Prelaunch site must not have sitemap');
 const no=fs.readFileSync(path.join(root,'no/praktisk-bruk/index.html'),'utf8');if(!no.includes('noindex'))throw Error('Prelaunch case must be noindex');
}
console.log('PASS: 22 pages, localized applied-work examples, 4 scenario widgets, contextual enquiry URLs, no broken links and release safety.');