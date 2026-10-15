import http from "node:http";
import { buildDemoDashboard } from "./command-dashboard.mjs";

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Altovena Command — Simulation</title><style>
:root{font-family:system-ui,Arial,sans-serif;color:#14252a;background:#eff3f3}*{box-sizing:border-box}body{margin:0}header{background:#102d35;color:white;padding:20px 6vw}header small{color:#a6d8d7}main{max-width:1200px;margin:25px auto;padding:0 18px}.banner{padding:13px;background:#fff2c5;border:1px solid #b88c30;border-radius:10px;margin-bottom:18px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.card{background:white;border:1px solid #dbe5e5;border-radius:12px;padding:20px;box-shadow:0 3px 12px #132b3010}.num{font-size:34px;font-weight:750;color:#0b756e}.columns{display:grid;grid-template-columns:2fr 1fr;gap:16px;margin-top:16px}ul{list-style:none;padding:0}li{padding:10px 0;border-bottom:1px solid #e8eeee}.pill{background:#e4f4ef;color:#086452;border-radius:30px;padding:3px 9px;font-size:12px;font-weight:650}.muted{color:#51666c}.small{font-size:13px}code{font-size:12px}h1{margin:4px 0 0}h2{margin-top:0;font-size:19px}@media(max-width:700px){.columns,.grid{grid-template-columns:1fr}}
</style></head><body><header><small>ALTOVENA · COMMAND · SIMULATION ONLY</small><h1>Mission Control</h1></header><main><div class="banner"><strong>Simulated demonstration.</strong> No customer data, messages or external actions. This dashboard is not connected to production.</div><section id="app">Loading simulation…</section></main><script>
const el=document.getElementById('app');
const escapeHTML=(s)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
fetch('/api/dashboard').then(r=>{if(!r.ok)throw Error('Simulation unavailable');return r.json()}).then(d=>{
const e=escapeHTML;
el.innerHTML=`<div class="grid"><div class="card"><div class="muted">Completed agent steps</div><div class="num">${e(d.summary.agentsCompleted)}</div></div><div class="card"><div class="muted">Awaiting approval</div><div class="num">${e(d.summary.pendingApprovals)}</div></div><div class="card"><div class="muted">External actions</div><div class="num">${e(d.summary.externalActions)}</div></div></div><div class="columns"><div class="card"><h2>Mission: ${e(d.mission.goal)}</h2><span class="pill">${e(d.mission.status)}</span><ul>${d.mission.tasks.map(t=>`<li><strong>${e(t.agent)}</strong> — ${e(t.id)} <span class="pill">${e(t.status)}</span></li>`).join('')}</ul><h2>Evidence log</h2><div class="muted small">Integrity checked: ${e(d.ledgerVerified)}</div><ul>${d.evidence.map(x=>`<li class="small">${e(x.type)} ${x.taskId?'· '+e(x.taskId):''}</li>`).join('')}</ul></div><div class="card"><h2>Human review queue</h2><ul>${d.approvals.map(a=>`<li><strong>${e(a.summary)}</strong><div class="muted small">${e(a.action)} · ${e(a.status)}</div><p class="small">${e(a.draft)}</p></li>`).join('')}</ul><p class="muted small">Read-only: actions cannot be approved or sent from this demo.</p></div></div>`;
}).catch(err=>{el.textContent=err.message});
</script></body></html>`;

export function startDemoServer({ port = 0, host = "127.0.0.1" } = {}) {
  const server = http.createServer(async (req, res) => {
    if (req.method !== "GET") { res.writeHead(405); res.end("Method not allowed"); return; }
    if (req.url === "/api/dashboard") {
      try {
        const data = await buildDemoDashboard();
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
        res.end(JSON.stringify(data));
      } catch {
        res.writeHead(500); res.end("Simulation failed");
      }
    } else if (req.url === "/") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'self'" });
      res.end(html);
    } else { res.writeHead(404); res.end("Not found"); }
  });
  server.listen(port, host);
  return server;
}
if (process.argv[1] && import.meta.url === new URL("file://" + process.argv[1]).href) {
  const server = startDemoServer({ port: Number(process.env.PORT || 4173) });
  server.on("listening", () => process.stdout.write("Demo dashboard: http://127.0.0.1:" + server.address().port + "\n"));
}
