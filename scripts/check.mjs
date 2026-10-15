import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const dist=path.join(root,'dist');
const files=[];
function visit(dir){for(const d of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,d.name);if(d.isDirectory())visit(f);else if(d.name==='index.html')files.push(f);}}
visit(dist);
const pages=files.filter(f=>f!==path.join(dist,'index.html'));
if(pages.length!==34)throw new Error(`Expected 34 localized pages, received ${pages.length}`);
for(const f of pages){const content=fs.readFileSync(f,'utf8');const where=f.slice(dist.length);const h1=[...content.matchAll(/<h1(?:\s[^>]*)?>/g)].length;if(h1!==1)throw Error(`${where}: expected one H1, got ${h1}`);if(!/lang="(en|nb)"/.test(content))throw Error(`${where}: invalid language`);if(!content.includes('data-primary-nav'))throw Error(`${where}: navigation missing`);if(!content.includes('meta name="description"'))throw Error(`${where}: metadata missing`);if(/href="#"/.test(content))throw Error(`${where}: placeholder link`);for(const match of content.matchAll(/href="(\/[^"?#]+)(?:[#?][^"]*)?"/g)){const url=match[1];const tgt=path.join(dist,url.slice(1));if(!fs.existsSync(tgt))throw Error(`${where}: broken link ${url}`);}}
const home=fs.readFileSync(path.join(dist,'en/index.html'),'utf8');if(!home.includes('RealtyFlow')||!home.includes('Visibility'))throw Error('Products not linked');
const team=fs.readFileSync(path.join(dist,'no/om-oss/index.html'),'utf8');for(const n of ['Anna Bremseth','Andrea Thorsnes Karlsen','Erlend Thorsnes Karlsen','Freddy Bremseth'])if(!team.includes(n))throw Error('Missing team member '+n);
console.log('PASS: 34 pages, one H1 each, local links, both languages, team members, product navigation.');
