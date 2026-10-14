import fs from 'node:fs';
import path from 'node:path';
const dist=path.resolve(import.meta.dirname,'../dist');
const all=[];
function walk(dir){for(const x of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,x.name);if(x.isDirectory())walk(p);else if(x.name==='index.html'&&p!==path.join(dist,'index.html'))all.push(p);}}
walk(dist);
if(all.length!==32)throw Error(`Expected 32 translated pages, got ${all.length}`);
for(const f of all){const html=fs.readFileSync(f,'utf8');if(!html.includes('data-trust-footer-link'))throw Error('Missing trust link on '+f);if(!html.includes('/trust.css'))throw Error('Missing trust styles on '+f);if([...html.matchAll(/<h1\b/g)].length!==1)throw Error('Incorrect H1 on '+f);for(const m of html.matchAll(/href="(\/[^"?#]+)(?:\?[^"#]*)?(?:#[^"]*)?"/g)){const out=path.join(dist,m[1].slice(1));if(!fs.existsSync(out))throw Error(`${f} dead link: ${m[1]}`);}}
for(const [lang,route,other] of [['en','trust-and-control','/no/tillit-og-kontroll/'],['no','tillit-og-kontroll','/en/trust-and-control/']]){
 const f=path.join(dist,lang,route,'index.html');const html=fs.readFileSync(f,'utf8');
 const expected=lang==='no'?['Anna Bremseth','Freddy Bremseth','Andrea Thorsnes Karlsen','Erlend Thorsnes Karlsen','Tillit bygges gjennom kontroll.']:['Anna Bremseth','Freddy Bremseth','Andrea Thorsnes Karlsen','Erlend Thorsnes Karlsen','Confidence is built into the process.'];
 for(const t of expected)if(!html.includes(t))throw Error('Missing trust content: '+t);
 if(!html.includes(other))throw Error('Language switch missing '+f);
 if([...html.matchAll(/<details\b/g)].length!==5)throw Error('FAQ requires five genuine questions: '+f);
 for(const slug of ['offer-intelligence','visibility','realtyflow','olivia']){const prod=fs.readFileSync(path.join(dist,lang,lang==='no'?'produkter':'products',slug,'index.html'),'utf8');if(!prod.includes('trust-status-section'))throw Error('Product lacks confirmation note: '+lang+'/'+slug);}
 if(process.env.PUBLIC_LAUNCH!=='true'){
   if(!html.includes('noindex'))throw Error('Trust page must not be indexed before public launch');
   if(fs.existsSync(path.join(dist,'sitemap.xml')))throw Error('Unexpected sitemap in preview');
 }
}
console.log('PASS: 32 localized pages, trust and control detail, product scope notes, accessibility-ready FAQ, internal paths and indexing gate.');