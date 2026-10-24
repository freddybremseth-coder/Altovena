import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const dist=path.resolve(import.meta.dirname,'../dist');
for(const lang of ['no','en'])for(const product of ['offer-intelligence','visibility','realtyflow','olivia']){
 const file=path.join(dist,lang,lang==='no'?'produkter':'products',product,'index.html');
 const html=fs.readFileSync(file,'utf8');
 assert.equal((html.match(/data-guided-workflow/g)||[]).length,1,file);
 assert.equal((html.match(/data-workflow-step="/g)||[]).length,4,file);
 assert.match(html,/data-workflow-data/);
 assert.match(html,/data-workflow-panel|guided-workflow-panel/);
 assert.match(html,/guided-workflow\.js/);
 assert.match(html,/guided-workflow\.css/);
 assert.match(html,/illustrativt eksempel|illustrative example/i);
 assert.equal((html.match(/<h1(?:\s|>)/g)||[]).length,1);
 assert.match(html,/name="robots" content="noindex/);
}
assert.ok(fs.readFileSync(path.join(dist,'guided-workflow.js'),'utf8').includes('textContent'));
console.log('PASS: eight localized static interactive examples, no live-data claims, single H1, noindex.');
