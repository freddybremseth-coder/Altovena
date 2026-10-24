import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'../dist');
const keys=['prospecting','visibility','realestate','agriculture'];
const data=JSON.parse(fs.readFileSync(path.join(root,'adviser-data.json'),'utf8'));
const files=fs.readdirSync(root).filter(x=>x==='adviser.js'||x==='adviser.css');
if(files.length!==2)throw Error('Missing static adviser assets');
for(const lang of ['en','no']){
 const home=fs.readFileSync(path.join(root,lang,'index.html'),'utf8');
 if(!home.includes('data-solution-adviser')||!home.includes('href="/adviser.css"')||!home.includes('src="/adviser.js"'))throw Error('Home lacks adviser '+lang);
 if([...home.matchAll(/data-adviser-choice=/g)].length!==4)throw Error('Incorrect choice count '+lang);
 if([...home.matchAll(/<h1\b/g)].length!==1)throw Error('Broken H1 structure '+lang);
 for(const key of keys){const d=data[lang][key]; if(!d?.product||!d?.contact||!d.name)throw Error('Missing mapped product '+lang+key);const target=path.join(root,d.product.slice(1));if(!fs.existsSync(target))throw Error('Missing product route '+d.product);const contact=path.join(root,d.contact.split('?')[0].slice(1));if(!fs.existsSync(contact))throw Error('Missing contact route '+d.contact);}
}
if(!fs.readFileSync(path.join(root,'robots.txt'),'utf8').includes('Disallow: /')&&process.env.PUBLIC_LAUNCH!=='true')throw Error('Preview indexing protection removed');
const client=fs.readFileSync(path.join(root,'adviser.js'),'utf8');
for(const forbidden of ['fetch(', 'localStorage', 'sendBeacon', 'XMLHttpRequest'])if(client.includes(forbidden))throw Error('Unexpected client request or storage: '+forbidden);
console.log('PASS: bilingual solution adviser, four routes, no outbound calls, H1 structure and preview safety.');