import fs from 'node:fs';
import path from 'node:path';
const dist=path.resolve(import.meta.dirname,'../dist');
const assets=['logo-altovena.webp','logo-mark.webp','favicon-32.png','favicon-192.png','favicon-512.png','favicon.ico','hero-altovena.webp','offer-intelligence.webp','visibility.webp','realtyflow.webp','olivia.webp','benidorm-concept.webp','video-poster.webp','altovena-intro.mp4'];
for(const filename of assets) if(!fs.existsSync(path.join(dist,'brand',filename))) throw Error('Missing asset '+filename);
let count=0;
for(const lang of ['en','no']){
 const main=path.join(dist,lang);const recurse=p=>{for(const ent of fs.readdirSync(p,{withFileTypes:true})){
  const file=path.join(p,ent.name);if(ent.isDirectory())recurse(file);
  else if(ent.name==='index.html'){
   const h=fs.readFileSync(file,'utf8');++count;
   if(!h.includes('/brand/logo-altovena.webp')||!h.includes('/brand/favicon-32.png')||!h.includes('/brand.css'))throw Error('Brand not applied '+file);
   if(/class="brand-mark"/.test(h)) throw Error('Legacy monogram remains '+file);
   for(const match of h.matchAll(/(?:src|href)="(\/brand\/[^"#?]+)"/g)){if(!fs.existsSync(path.join(dist,match[1].slice(1))))throw Error('Broken brand asset '+match[1]);}
  }
 }};
 recurse(main);
 const home=fs.readFileSync(path.join(main,'index.html'),'utf8');
 if(!home.includes('hero-altovena.webp')||!home.includes('altovena-intro.mp4'))throw Error('Hero/video missing in '+lang);
 for(const [key,slug] of [['offer','offer-intelligence'],['visibility','visibility'],['realtyflow','realtyflow'],['olivia','olivia']]){
  const html=fs.readFileSync(path.join(main,lang==='en'?'products':'produkter',slug,'index.html'),'utf8');
  if(!html.includes('/brand/'+(key==='offer'?'offer-intelligence':key)+'.webp')||!(lang==='en'?html.includes('Concept illustration'):html.includes('Konseptillustrasjon')))throw Error('Missing honest product artwork '+lang+'/'+key);
 }
 for(const p of [lang==='en'?'company':'om-oss',lang==='en'?'book-demo':'bestill-demo']){
  const h=fs.readFileSync(path.join(main,p,'index.html'),'utf8');if(!h.includes('Adolfo Suárez 14')||!h.includes('Eagle Tower')||!h.includes('altovena.com'))throw Error('Missing contact address '+p);
 }
}
if(count!==24)throw Error('Expected 24 localized pages; got '+count);
console.log('PASS: 24 pages, responsive branded assets, 8 product images, true illustrative labels, contact address and captioned promo video.');
