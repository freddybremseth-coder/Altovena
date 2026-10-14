import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'../dist');
let total=0;
for(const lang of ['en','no']){
 for(const rel of ['',lang==='en'?'products':'produkter']){
  const f=path.join(root,lang,rel,'index.html'),html=fs.readFileSync(f,'utf8');
  const cards=[...html.matchAll(/<figure class="altovena-card-media">/g)].length;
  if(cards!==4)throw Error(f+': expected four card images');
  for(const asset of ['offer-intelligence','visibility','realtyflow','olivia'])if(!html.includes('/brand/'+asset+'.webp'))throw Error('Missing artwork '+asset+' '+f);
  if(!html.includes(lang==='no'?'Konseptillustrasjon':'Concept illustration'))throw Error('Artwork disclosure missing '+f);
  total+=cards;
 }
 const home=fs.readFileSync(path.join(root,lang,'index.html'),'utf8');
 if(!home.includes('altovena-video-transcript')||!home.includes('/brand/altovena-intro.mp4'))throw Error('Video accessibility failure '+lang);
 if(!fs.existsSync(path.join(root,'media-polish.css')))throw Error('Missing v0.7 CSS');
}
if(total!==16)throw Error('Only '+total+' cards found');
console.log('PASS: 16 branded portfolio cards, explicit illustrations, accessible transcripts and video assets.');