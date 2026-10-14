import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'../dist');
const routes={no:['innsikt','innsikt/seo-aeo-geo-forskjeller'],en:['insights','insights/seo-aeo-geo-explained']};
const pages=[];
function walk(d){for(const p of fs.readdirSync(d,{withFileTypes:true})){const f=path.join(d,p.name);if(p.isDirectory())walk(f);else if(p.name==='index.html'&&f!==path.join(root,'index.html'))pages.push(f);}}
walk(root);
if(pages.length!==28)throw Error('Expected 28 localized pages, received '+pages.length);
for(const file of pages){const h=fs.readFileSync(file,'utf8');const inside=file.slice(root.length);
 if((h.match(/<h1\b/g)||[]).length!==1)throw Error('One H1 expected '+inside);
 if(!h.includes('data-insights-nav')||!h.includes('data-insights-footer'))throw Error('Insights navigation missing '+inside);
 if(!h.includes('/editorial.css'))throw Error('Editorial style missing '+inside);
 for(const m of h.matchAll(/href="(\/[^"?#]+)(?:[?#][^"]*)?"/g)) if(!fs.existsSync(path.join(root,m[1].slice(1))))throw Error('Broken link '+m[1]+' in '+inside);
}
for(const lang of ['no','en']){
 const [hub,guide]=routes[lang];
 const hs=fs.readFileSync(path.join(root,lang,hub,'index.html'),'utf8');
 const g=fs.readFileSync(path.join(root,lang,guide,'index.html'),'utf8');
 if(!hs.includes('SEO, AEO')||!hs.includes(lang==='no'?'innsikt/seo-aeo-geo-forskjeller':'insights/seo-aeo-geo-explained'))throw Error('Hub link missing '+lang);
 if((g.match(/<h2\b/g)||[]).length<10)throw Error('Insufficient guide sections '+lang);
 if((g.match(/<table\b/g)||[]).length!==1)throw Error('Expected comparison table '+lang);
 if((g.match(/<th\b/g)||[]).length!==3)throw Error('Mobile-first tables use three columns '+lang);
 if((g.match(/<h3\b/g)||[]).length!==3)throw Error('FAQ should have three questions '+lang);
 const sections=[...g.matchAll(/<section class="editorial-section" id="part-\d+"><h2>[^<]+<\/h2>([\s\S]*?)<\/section>/g)];
 if(sections.length!==8)throw Error('Expected eight focused H2 sections '+lang);
 for(const [i,sec] of sections.entries()){
  const first=sec[1].match(/^<p>([\s\S]*?)<\/p>/)?.[1]||'';
  if(!first.startsWith('<strong>')||first.replace(/<[^>]+>/g,'').length<80)throw Error('H2 needs an immediate substantive answer '+lang+' section '+(i+1));
 }
 for(const m of g.matchAll(/<td data-label="([^"]+)">/g))if(!m[1].trim())throw Error('Unlabelled mobile comparison cell '+lang);
 if(!g.includes('Google Search Central')||!g.includes('Erlend Thorsnes Karlsen'))throw Error('Review/source missing '+lang);
 if(!g.includes('/brand/logo-altovena.webp')||!g.includes('data-insights-nav aria-current="page"'))throw Error('Branded locale navigation missing '+lang);
 if(!g.includes('href="'+(lang==='no'?'/en/insights/seo-aeo-geo-explained/':'/no/innsikt/seo-aeo-geo-forskjeller/')+'"'))throw Error('Missing correct language equivalent '+lang);
 if(process.env.PUBLIC_LAUNCH!=='true' && (!g.includes('name="robots" content="noindex,nofollow"')||fs.existsSync(path.join(root,'sitemap.xml'))))throw Error('Preview indexing policy failed');
}
const vis=fs.readFileSync(path.join(root,'no/produkter/visibility/index.html'),'utf8');if(!vis.includes('/no/innsikt/seo-aeo-geo-forskjeller/'))throw Error('Missing contextual link from commercial page');
console.log('PASS: 28 pages, 2-language insights pillar, answer-first copy, 3-column comparison, source links, FAQs, CTA and noindex.');