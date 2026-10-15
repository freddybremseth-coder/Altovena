import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { journeys, links } from "./journey-data.mjs";

const dist=path.resolve(import.meta.dirname,"../dist"),root=path.resolve(dist,"journey.css");
assert.ok(fs.existsSync(root),"Journey stylesheet must be generated");
let checked=0;
const titles=new Set(),descriptions=new Map();
const urls=new Set(Object.values(links).flat());
assert.equal(urls.size,32,"Exactly 32 distinct published-path candidates in two languages");
for(const [key,paths] of Object.entries(links))for(const [index,lang] of ["no","en"].entries()){
 const url=paths[index],file=path.resolve(dist,url.slice(1),"index.html");
 assert.ok(fs.existsSync(file),"Missing page "+url);
 const html=fs.readFileSync(file,"utf8"),copy=journeys[lang][key];
 assert.ok(copy&&copy.length===4,"Missing distinct copy for "+url);
 assert.equal((html.match(/<h1(?:\s|>)/gi)||[]).length,1,"One H1 per "+url);
 assert.equal((html.match(/data-altovena-journey-v12="true"/g)||[]).length,1,"One custom answer section per "+url);
 assert.ok(html.includes("<h2>"+copy[0]+"</h2>"),"The exact search intent must be visible in H2 "+url);
 const question=html.indexOf("<h2>"+copy[0]+"</h2>"),answer=html.indexOf('class="journey-answer"',question);
 assert.ok(question>=0&&answer>question&&answer-question<380,"Answer first after H2 "+url);
 assert.ok(html.includes("journey-limits"),"Visible honest limitations "+url);
 if(["offer","visibility","realtyflow","olivia"].includes(key)){
   assert.ok(html.includes("journey-faq"),"Relevant product FAQ "+url);
   assert.ok((html.match(/class="journey-explain"/g)||[]).length>=3,"Three decision-ready product sections "+url);
   assert.ok((html.match(/class="journey-faq"/g)||[]).length===1,"One product FAQ "+url);
 }
 if(key==="products"){
   assert.ok(html.includes("journey-comparison"),"Product choice table "+url);
   const table=html.match(/<div class="journey-table-scroll"[^>]*>([\s\S]*?)<\/div>/)?.[1]||"";
   assert.equal((table.match(/<th scope="col">/g)||[]).length,3,"Exactly three product comparison columns "+url);
   assert.equal((table.match(/<tr>/g)||[]).length,5,"Four options and one header "+url);
   assert.equal((table.match(/<td data-label="/g)||[]).length,12,"Mobile product table labels "+url);
 }

 assert.ok(html.includes('<link rel="stylesheet" href="/journey.css">'),"Mobile stylesheet "+url);
 assert.ok(html.includes('name="viewport"'),"Mobile viewport "+url);
 const title=html.match(/<title>([^<]+)<\/title>/i)?.[1],description=html.match(/<meta name="description" content="([^"]*)"/)?.[1];
 assert.ok(title&&title.length>=14,"Relevant title "+url);
 assert.ok(description&&description.length>=45,"Useful meta description "+url);
 assert.ok(!titles.has(title),"Every localized page must have a unique title: "+url);
 titles.add(title);
 assert.ok(!descriptions.has(description),"Every localized page must have a unique meta description: "+url);
 descriptions.set(description,url);
 const allLinks=[...html.matchAll(/\shref="([^"]+)"/g)].map(m=>m[1]);
 for(const link of allLinks){
  if(!link.startsWith("/")||link.startsWith("//")||link.startsWith("/#"))continue;
  const href=link.split(/[?#]/,1)[0];
  if(!href||href==="/")continue;
  const destination=path.join(dist,href.slice(1)),page=path.join(destination,"index.html");
  assert.ok(fs.existsSync(destination)||fs.existsSync(page),"Dead internal link "+href+" from "+url);
 }
 for(const related of copy[3])assert.ok(html.includes('href="'+links[related][index]+'"'),"Natural onward link from "+url+" to "+related);
 assert.ok(!html.includes("data-altovena-journey-v12")||html.includes("journey-next"));
 // The website remains in protected draft / prelaunch unless specifically approved.
 if(process.env.SITE_URL===undefined||!process.env.SITE_URL.trim())assert.match(html,/name="robots" content="noindex(?:,nofollow)?"/,"Preview must remain noindex");
 checked++;
}
assert.equal(checked,32);
for(const lang of ["no","en"]){
 const product=lang==="no"?"/no/produkter/":"/en/products/";
 const file=path.join(dist,product.slice(1),"index.html");
 const h=fs.readFileSync(file,"utf8");
 for(const k of ["offer","visibility","realtyflow","olivia"])
  assert.ok(h.includes("href=\""+links[k][lang==="no"?0:1]+"\""),"Portfolio must connect to "+k);
}
const legal=fs.readFileSync(path.join(dist,"no/personvern/index.html"),"utf8");
assert.ok(/juridisk|behandlingsansvarlig/i.test(legal));
assert.ok(legal.includes("Altovena"));
console.log("PASS: 32 bilingual pages, one H1, unique titles/descriptions, intent-specific direct answers, delivery limits, working internal links, next-step CTAs, mobile styling and prelaunch indexing.");
