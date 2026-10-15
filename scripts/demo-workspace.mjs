import fs from 'node:fs';
import path from 'node:path';
const dist=path.resolve(import.meta.dirname,'../dist');
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const data={
 no:{path:'/no/demo-arbeidsflate/',title:'Demoarbeidsflate – se hvordan Altovena jobber',desc:'Utforsk illustrerte arbeidsflyter for Altovena Visibility, Offer Intelligence, RealtyFlow og Olivia OS. Ingen kundedata behandles.',intro:'Velg et forretningsproblem og følg veien fra dokumentasjon til vurdering, anbefaling og godkjenning. Alle eksemplene er illustrative og kjører bare i nettleseren.',label:'Velg problem',steps:['Forstå problemet','Kontroller dokumentasjonen','Foreslå neste steg','Godkjenn handlingen'],state:'Illustrasjon, ikke en aktiv integrasjon eller en reell analyse.',cta:'Diskuter ditt behov',ctaPath:'/no/bestill-demo/',choices:[
 ['visibility','Vi blir ikke funnet i søk og AI-svar','Altovena Visibility','Undersøk struktur, innhold og tekniske signaler.','Kontroller primærkilder og faktiske søkedata.','Foreslå redaksjonelle og tekniske tiltak.','En ansvarlig godkjenner før endringer publiseres.'],
 ['offer','Vi trenger bedre B2B-prospekter','Offer Intelligence','Definer målgruppen og hvilke behov som skal undersøkes.','Skill datakvalitet fra kjøpsinteresse.','Lag et kontrollérbart beslutningsgrunnlag.','En medarbeider bestemmer eventuell kontakt.'],
 ['realtyflow','Vi mister oversikt over kunder og oppgaver','RealtyFlow','Registrer henvendelsen med riktig merkevare.','Kontroller kundegrunnlag og ansvar.','Foreslå neste aktivitet og eier.','En medarbeider godkjenner oppfølging.'],
 ['olivia','Vi trenger bedre oversikt over gårdsdriften','Olivia OS','Velg parsell, sesong og arbeidsoppgave.','Se på registrerte observasjoner og mangler.','Foreslå et konkret kontrollpunkt.','Operatøren beslutter og registrerer arbeidet.']
 ]},
 en:{path:'/en/demo-workspace/',title:'Demo workspace – see how Altovena works',desc:'Explore illustrative workflows for Altovena Visibility, Offer Intelligence, RealtyFlow and Olivia OS. No customer data is processed.',intro:'Choose a business challenge and follow the steps from evidence to assessment, recommendation and approval. All examples are illustrative and run entirely in your browser.',label:'Choose a challenge',steps:['Define the problem','Review the evidence','Suggest the next step','Approve the action'],state:'Illustration, not a live integration or actual analysis.',cta:'Discuss your needs',ctaPath:'/en/book-demo/',choices:[
 ['visibility','Customers cannot find us through search or AI answers','Altovena Visibility','Review structure, content and technical signals.','Check primary sources and real search data.','Propose editorial and technical changes.','An owner approves before publication.'],
 ['offer','We need better B2B prospect research','Offer Intelligence','Define the target segment and research question.','Separate data quality from buying interest.','Prepare a reviewable decision brief.','A person decides whether to make contact.'],
 ['realtyflow','We lose track of customers and tasks','RealtyFlow','Capture the enquiry under the correct brand.','Review customer details and responsibility.','Suggest the next action and owner.','A person approves follow-up.'],
 ['olivia','We need a clearer view of farm operations','Olivia OS','Choose a parcel, season and task.','Review recorded observations and gaps.','Recommend a practical check.','An operator decides and records the work.']
 ]}
};
for(const lang of ['no','en']){
 const t=data[lang],dest=path.join(dist,t.path.slice(1),'index.html');
 fs.mkdirSync(path.dirname(dest),{recursive:true});
 const original=fs.readFileSync(path.join(dist,lang,'index.html'),'utf8');
 const start=original.match(/^([\s\S]*?<head>)/i)?.[1]||'';
 const nav=original.match(/<header\b[\s\S]*?<\/header>/i)?.[0]||'';
 const footer=original.match(/<footer\b[\s\S]*?<\/footer>/i)?.[0]||'';
 if(!start||!nav||!footer)throw Error('Cannot derive common site shell for '+lang);
 const choices=t.choices.map((c,i)=>'<button type="button" data-demo-choice="'+i+'" aria-pressed="'+(i===0)+'">'+escape(c[1])+'</button>').join('');
 const steps=t.steps.map((s,i)=>'<li><strong>'+escape(s)+'</strong><p data-demo-step="'+i+'">'+escape(t.choices[0][i+3])+'</p></li>').join('');
 const body='<main id="main"><section class="section section-white"><div class="container"><h1>'+escape(t.title)+'</h1><p>'+escape(t.intro)+'</p><p><strong>'+escape(t.state)+'</strong></p><div data-altovena-demo><h2>'+escape(t.label)+'</h2><div class="demo-choices" role="group" aria-label="'+escape(t.label)+'">'+choices+'</div><section class="demo-outcome" aria-live="polite"><h2 data-demo-product>'+escape(t.choices[0][2])+'</h2><ol class="demo-stages">'+steps+'</ol><p><a data-demo-link href="'+t.ctaPath+'?product=visibility">'+escape(t.cta)+' →</a></p></section><script type="application/json" data-demo-data>'+JSON.stringify(t.choices).replaceAll('<','\\u003c')+'</script></div></div></section></main>';
 const inject='<title>'+escape(t.title)+' | Altovena</title><meta name="description" content="'+escape(t.desc)+'"><meta name="robots" content="noindex,nofollow"><link rel="stylesheet" href="/demo-workspace.css">';
 // Intentionally no canonical or indexing for prelaunch demo.
 let html='<!doctype html><html lang="'+lang+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+inject+'</head><body>'+nav+body+footer+'<script src="/demo-workspace.js" defer></script></body></html>';
 fs.writeFileSync(dest,html);
 // Discoverable entry from existing product and portfolio pages without moving answer-first sections.
 const entryLabel=lang==='no'?'Utforsk demoarbeidsflaten':'Explore demo workspace';
 for(const page of ['/',lang==='no'?'/produkter/':'/products/',...(lang==='no'?['/produkter/offer-intelligence/','/produkter/visibility/','/produkter/realtyflow/','/produkter/olivia/']:['/products/offer-intelligence/','/products/visibility/','/products/realtyflow/','/products/olivia/'])]){
  const target=path.join(dist,lang,page.slice(1),'index.html');
  let source=fs.readFileSync(target,'utf8');
  const link='<p class="container"><a href="'+t.path+'">'+escape(entryLabel)+' →</a></p>';
  if(!source.includes('</main>'))throw Error('Cannot link demo from '+target);
  source=source.replace('</main>',link+'</main>');
  fs.writeFileSync(target,source);
 }
}
fs.writeFileSync(path.join(dist,'demo-workspace.css'),'.demo-choices{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem;margin:1.5rem 0}.demo-choices button{padding:1rem;text-align:left;border:1px solid #81969a;border-radius:.75rem;background:transparent;color:inherit;cursor:pointer}.demo-choices button[aria-pressed="true"]{background:#173c42;color:#fff}.demo-choices button:focus-visible{outline:3px solid #d68d45;outline-offset:3px}.demo-outcome{border:1px solid #9eaeae;border-radius:1rem;padding:1.5rem}.demo-stages{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem;list-style-position:inside}.demo-stages li{padding:.5rem}@media(max-width:650px){.demo-choices,.demo-stages{grid-template-columns:1fr}}');
fs.writeFileSync(path.join(dist,'demo-workspace.js'),`for(const root of document.querySelectorAll('[data-altovena-demo]')){let choices;try{choices=JSON.parse(root.querySelector('[data-demo-data]').textContent)}catch{continue}const buttons=[...root.querySelectorAll('[data-demo-choice]')];for(const button of buttons){button.addEventListener('click',()=>{const i=Number(button.dataset.demoChoice);if(!Number.isInteger(i)||!choices[i])return;const choice=choices[i];buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));root.querySelector('[data-demo-product]').textContent=choice[2];for(let n=0;n<4;n++)root.querySelector('[data-demo-step="'+n+'"]').textContent=choice[n+3];root.querySelector('[data-demo-link]').href=(document.documentElement.lang==='no'?'/no/bestill-demo/':'/en/book-demo/')+'?product='+encodeURIComponent(choice[0])})}}`);
console.log('PASS: Two bilingual static demo workspaces generated');
