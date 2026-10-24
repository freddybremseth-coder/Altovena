import fs from 'node:fs';
import path from 'node:path';

const dist=path.resolve(import.meta.dirname,'../dist');
const routes={offer:['offer-intelligence','offer-intelligence'],visibility:['visibility','visibility'],realtyflow:['realtyflow','realtyflow'],olivia:['olivia','olivia']};
const copy={
 no:{
  heading:'Se et eksempel på arbeidsflyten',disclaimer:'Interaktivt, illustrativt eksempel. Dette er ikke et levende system, en analyse av dine data eller bevis på at alle funksjoner er lansert.',next:'Vis steg',status:'Steg',
  offer:[['Hent dokumentasjon','Samle kun godkjente offentlige selskapsopplysninger.'],['Vurder kvalitet','Skill verifiserte data fra manglende opplysninger.'],['Vurder relevans','Se etter underbygde tegn på behov, ikke oppdiktet kjøpsinteresse.'],['Godkjenn neste handling','En medarbeider må godkjenne eventuell kontakt.']],
  visibility:[['Undersøk nettstedet','Kartlegg teknikk, innhold og struktur med dokumenterte kilder.'],['Prioriter funn','Skill målbare feil fra hypoteser om AI-synlighet.'],['Foreslå forbedring','Lag en konkret endring til redaksjonell kontroll.'],['Verifiser resultat','Publiser kun etter godkjenning og kontroller faktisk effekt.']],
  realtyflow:[['Registrer forespørsel','Knytt kundehenvendelsen til riktig merkevare.'],['Fordel ansvar','Gi en ansvarlig person en synlig oppgave.'],['Forbered svar','Samle relevant informasjon uten å sende automatisk.'],['Følg opp','Registrer faktisk kontakt og neste avtale.']],
  olivia:[['Samle gårdsdata','Knytt observasjoner til riktig parsell og sesong.'],['Oppdag behov','Se hvilke oppgaver som trenger kontroll.'],['Foreslå tiltak','Vis anbefaling med usikkerhet og datagrunnlag.'],['Godkjenn og dokumenter','Operatøren avgjør og registrerer utført arbeid.']]
 },
 en:{
  heading:'Explore an example workflow',disclaimer:'Interactive illustrative example. This is not a live system, an analysis of your data or evidence that every feature has launched.',next:'Show step',status:'Step',
  offer:[['Collect evidence','Gather only permitted public company facts.'],['Assess quality','Separate verified facts from missing information.'],['Check relevance','Look for evidenced needs, not invented buying intent.'],['Approve the next action','A person must approve any external outreach.']],
  visibility:[['Review the site','Map technical, content and structural findings to evidence.'],['Prioritize findings','Separate measurable issues from AI visibility hypotheses.'],['Propose a change','Prepare an improvement for editorial review.'],['Verify the result','Publish only with approval, then measure real outcomes.']],
  realtyflow:[['Capture the enquiry','Route customer information to the correct brand.'],['Assign ownership','Create a visible task for the responsible person.'],['Prepare a response','Gather relevant context without automatically sending.'],['Follow through','Record actual contact and the agreed next step.']],
  olivia:[['Collect field information','Connect observations to the right parcel and season.'],['Identify needs','Highlight tasks requiring attention.'],['Recommend an action','Show evidence, uncertainty and a proposed action.'],['Approve and record','The operator decides and documents completed work.']]
 }};
const escape=x=>String(x).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
for(const lang of ['no','en'])for(const key of Object.keys(routes)){
 const slug=routes[key][lang==='no'?0:1],file=path.join(dist,lang,lang==='no'?'produkter':'products',slug,'index.html');
 let html=fs.readFileSync(file,'utf8'),t=copy[lang],steps=t[key];
 const id='workflow-'+lang+'-'+key;
 const buttons=steps.map(([title],i)=>'<button type="button" data-workflow-step="'+i+'" aria-pressed="'+(i===0)+'" aria-controls="'+id+'-panel">'+escape((i+1)+'. '+title)+'</button>').join('');
 const section='<section class="section section-white" data-guided-workflow><div class="container"><h2>'+escape(t.heading)+'</h2><p>'+escape(t.disclaimer)+'</p><div class="guided-workflow-steps" role="group" aria-label="'+escape(t.heading)+'">'+buttons+'</div><div class="guided-workflow-panel" id="'+id+'-panel" role="status" aria-live="polite"><p data-workflow-position>'+escape(t.status)+' 1/4</p><h3 data-workflow-title>'+escape(steps[0][0])+'</h3><p data-workflow-description>'+escape(steps[0][1])+'</p></div><script type="application/json" data-workflow-data>'+JSON.stringify(steps).replaceAll('<','\\u003c')+'</script></div></section>';
 if(html.includes('data-guided-workflow'))throw Error('Already contains workflow '+file);
 if(!html.includes('</main>'))throw Error('Missing main '+file);
 html=html.replace('</main>',section+'</main>');
 html=html.replace('</head>','<link rel="stylesheet" href="/guided-workflow.css"></head>').replace('</body>','<script src="/guided-workflow.js" defer></script></body>');
 fs.writeFileSync(file,html);
}
fs.writeFileSync(path.join(dist,'guided-workflow.css'),'.guided-workflow-steps{display:flex;flex-wrap:wrap;gap:.6rem;margin:1.4rem 0}.guided-workflow-steps button{border:1px solid currentColor;border-radius:.6rem;padding:.7rem 1rem;background:transparent;color:inherit;cursor:pointer}.guided-workflow-steps button[aria-pressed="true"]{background:#173c42;color:#fff}.guided-workflow-steps button:focus-visible{outline:3px solid #d68d45;outline-offset:3px}.guided-workflow-panel{border:1px solid #a7b3b5;border-radius:1rem;padding:1.4rem;max-width:65ch}@media(max-width:600px){.guided-workflow-steps{flex-direction:column}.guided-workflow-steps button{text-align:left}}');
fs.writeFileSync(path.join(dist,'guided-workflow.js'),`for(const root of document.querySelectorAll('[data-guided-workflow]')){let steps;try{steps=JSON.parse(root.querySelector('[data-workflow-data]').textContent)}catch{continue}const buttons=[...root.querySelectorAll('[data-workflow-step]')];for(const button of buttons){button.addEventListener('click',()=>{const i=Number(button.dataset.workflowStep);if(!Number.isInteger(i)||!steps[i])return;buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));root.querySelector('[data-workflow-position]').textContent=(document.documentElement.lang==='no'?'Steg ':'Step ')+(i+1)+'/'+steps.length;root.querySelector('[data-workflow-title]').textContent=steps[i][0];root.querySelector('[data-workflow-description]').textContent=steps[i][1]})}}`);
console.log('PASS: 8 illustrative workflow demos (4 products, 2 languages)');
