import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const dist=path.resolve(import.meta.dirname,'../dist');
for(const [lang,slug] of [['no','demo-arbeidsflate'],['en','demo-workspace']]){
 const html=fs.readFileSync(path.join(dist,lang,slug,'index.html'),'utf8');
 assert.match(html,/name="robots" content="noindex,nofollow"/);
 assert.match(html,/data-altovena-demo/);
 assert.equal((html.match(/data-demo-choice="/g)||[]).length,4);
 assert.equal((html.match(/data-demo-step="/g)||[]).length,4);
 assert.match(html,/data-demo-data/);
 assert.match(html,/demo-workspace\.js/);
 assert.match(html,/demo-workspace\.css/);
 assert.match(html,/illustrativ|illustrative/i);
 assert.equal((html.match(/<h1(?:\s|>)/g)||[]).length,1);
 assert.ok(html.includes('product=visibility'));
}
const script=fs.readFileSync(path.join(dist,'demo-workspace.js'),'utf8');
assert.ok(!/fetch\(|localStorage|sessionStorage|sendBeacon|XMLHttpRequest/.test(script),'Demo must not transmit or store any visitor information');
console.log('PASS: two bilingual noindex workspaces, four scenarios each, static no-network interactivity.');
