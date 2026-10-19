import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'../dist');
for(const lang of ['en','no']){
  for(const [key,slug] of [['offer','offer-intelligence'],['visibility','visibility'],['realtyflow','realtyflow'],['olivia','olivia']]){
    const sub=lang==='en'?'products':'produkter';
    const html=fs.readFileSync(path.join(root,lang,sub,slug,'index.html'),'utf8');
    if(!html.includes('name="tour-'+key+'"')||[...html.matchAll(/<details /g)].length!==3)throw Error('Missing walkthrough: '+lang+'/'+slug);
    if(!html.includes('/enhance.css'))throw Error('Missing styles: '+lang+'/'+slug);
  }
  const form=fs.readFileSync(path.join(root,lang,lang==='en'?'book-demo':'bestill-demo','index.html'),'utf8');
  if(!form.includes('data-enquiry-form')||!form.includes('type="email"')||!form.includes('/enquiry.js'))throw Error('Missing contact draft: '+lang);
}
const robots=fs.readFileSync(path.join(root,'robots.txt'),'utf8');
if(process.env.PUBLIC_LAUNCH!=='true' && !robots.includes('Disallow: /'))throw Error('Prelaunch robots must block indexing');
if(process.env.PUBLIC_LAUNCH!=='true' && fs.existsSync(path.join(root,'sitemap.xml')))throw Error('Prelaunch sitemap must not be generated');
console.log('PASS: all eight product walkthroughs, both email drafts and launch gate.');