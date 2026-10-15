import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const dist=path.resolve(import.meta.dirname,'../dist');
for(const [lang,slug] of [['no','demo-arbeidsflate'],['en','demo-workspace']]){
 const html=fs.readFileSync(path.join(dist,lang,slug,'index.html'),'utf8');
 assert.match(html,/data-agent-workspace/);
 assert.match(html,/data-agent-state/);
 assert.match(html,/data-agent-approve/);
 assert.match(html,/data-agent-reject/);
 assert.match(html,/data-agent-reset/);
 assert.equal((html.match(/class="agent-stages"/g)||[]).length,1);
 const agentList=html.split('<ol class="agent-stages">')[1]?.split('</ol>')[0]||'';
 assert.equal((agentList.match(/<li><strong>/g)||[]).length,4);
 assert.match(html,/noindex,nofollow/);
}
const script=fs.readFileSync(path.join(dist,'agent-workspace.js'),'utf8');
assert.ok(!/fetch\(|sendBeacon|WebSocket|XMLHttpRequest|localStorage/.test(script),'Simulation must not transmit data');
console.log('PASS: bilingual four-agent illustrative approval workspace and no-network safeguards');
