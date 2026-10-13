import fs from 'node:fs';
import path from 'node:path';
import './build.mjs';

const root=path.resolve(import.meta.dirname,'../dist');
const publicRelease=process.env.PUBLIC_LAUNCH==='true';
const domain=process.env.SITE_URL||'';
const contact=process.env.CONTACT_EMAIL||'post@chatgenius.pro';
if(publicRelease && (!/^https:\/\/[^/\s]+\.[^/\s]+\/?$/.test(domain) || contact==='post@chatgenius.pro')) {
  throw new Error('Public launch needs verified HTTPS SITE_URL and a dedicated CONTACT_EMAIL.');
}
const data={
  offer:{
    en:[['Understand the company','Review permitted sources and record missing facts.','Structured evidence, not assumptions.'],['Separate the signals','Assess data quality separately from potential buying interest.','Two distinct findings with uncertainty clearly marked.'],['Review before action','Let a person assess the dossier before contact.','No outreach is sent from this illustration.']],
    no:[['Forstå bedriften','Gjennomgå tillatte kilder og identifiser manglende fakta.','Dokumentasjon fremfor antakelser.'],['Skill signalene','Vurder datakvalitet separat fra mulig kjøpsinteresse.','To separate funn med tydelig usikkerhet.'],['Godkjenn før handling','La en person vurdere dossieret før eventuell kontakt.','Ingen henvendelse sendes fra illustrasjonen.']]
  },
  visibility:{
    en:[['Audit','Review search intent, site structure and source quality.','Illustrative list of prioritized issues.'],['Improve','Prepare clearer answers, supporting evidence and relevant links.','Editorial proposal requiring human review.'],['Measure','Track search and qualified enquiries alongside documentable AI citations.','No promise of AI search ranking.']],
    no:[['Undersøk','Vurder søkeintensjon, sidestruktur og kildekvalitet.','Illustrert prioritering av forbedringspunkter.'],['Forbedre','Foreslå tydelige svar, dokumentasjon og relevante lenker.','Redaksjonelt forslag til menneskelig gjennomgang.'],['Mål','Følg søk og kvalifiserte henvendelser samt etterprøvbare AI-henvisninger.','Ingen garanti for rangering i AI-søk.']]
  },
  realtyflow:{
    en:[['Understand','Structure a buyer enquiry and its stated requirements.','Illustrative customer brief.'],['Connect','Link verified properties and area context.','Example shortlist with data gaps.'],['Follow up','Assign the next action to a responsible adviser.','No automatic customer communication.']],
    no:[['Forstå','Strukturer en boligforespørsel og kundens ønsker.','Illustrert behovsoversikt.'],['Koble sammen','Bruk verifiserte boliger og områdeinformasjon.','Eksempelliste med synlige datahull.'],['Følg opp','Legg neste handling til ansvarlig rådgiver.','Ingen automatisk kundemelding.']]
  },
  olivia:{
    en:[['Observe','Record a dated field observation with a parcel reference.','Illustrative searchable note.'],['Plan','Prepare a seasonal work item for operator review.','Draft work plan.'],['Record','Document what was actually completed.','Auditable history, not autonomous farm control.']],
    no:[['Observer','Registrer et datert feltnotat med parsellreferanse.','Illustrert søkbart notat.'],['Planlegg','Forbered sesongarbeid til operatørgjennomgang.','Utkast til arbeidsplan.'],['Dokumenter','Registrer det som faktisk ble gjennomført.','Sporbar historikk, ikke autonom gårdsstyring.']]
  }
};
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const routes={
  offer:['products/offer-intelligence','produkter/offer-intelligence'],
  visibility:['products/visibility','produkter/visibility'],
  realtyflow:['products/realtyflow','produkter/realtyflow'],
  olivia:['products/olivia','produkter/olivia']
};
function tour(product,lang){
  const no=lang==='no';
  let cards='';
  data[product][lang].forEach((item,index)=>{
    cards+='<details class="tour-detail" name="tour-'+product+'"'+(index===0?' open':'')+'><summary><span>0'+(index+1)+'. '+escape(item[0])+'</span><span aria-hidden="true">＋</span></summary><div class="tour-detail-body"><p>'+escape(item[1])+'</p><p class="tour-result">'+escape(item[2])+'</p></div></details>';
  });
  return '<section class="section tour-section"><div class="container"><span class="eyebrow">'+(no?'KLIKKBAR PRODUKTGJENNOMGANG':'INTERACTIVE WORKFLOW')+'</span><h2>'+(no?'Slik kan prosessen fungere':'How the process could work')+'</h2><p class="tour-disclaimer">'+(no?'Illustrasjon – ikke en live produktdemo. Ingen reelle kundedata behandles her.':'Illustrative example, not a live product demo. No actual customer data is processed here.')+'</p><div class="tour-layout"><div>'+cards+'</div><aside class="tour-aside"><h3>'+(no?'Mennesker tar beslutningene.':'People remain in control.')+'</h3><p>'+(no?'Systemet skal forklare kildene og få godkjenning før viktige handlinger.':'Systems should explain their evidence and request approval for consequential actions.')+'</p><a class="btn btn-primary" href="'+(no?'/no/bestill-demo/':'/en/book-demo/')+'">'+(no?'Ta kontakt':'Discuss your needs')+'</a></aside></div></div></section>';
}
function contactForm(lang){
  const no=lang==='no';
  const options=[['',no?'Velg tema':'Choose a topic'],['offer','Offer Intelligence'],['visibility','Visibility'],['realtyflow','RealtyFlow'],['olivia','Olivia OS'],['other',no?'Annet behov':'Other need']];
  let list='';
  for(const item of options)list+='<option value="'+item[0]+'">'+escape(item[1])+'</option>';
  return '<div class="contact-box"><span class="eyebrow">'+(no?'MIDLERTIDIG KONTAKTKANAL':'TEMPORARY CONTACT CHANNEL')+'</span><h2>'+(no?'Fortell om behovet':'Tell us what you need')+'</h2><p>'+(no?'Skjemaet åpner et e-postutkast på din egen enhet. Det lagrer eller sender ingenting automatisk.':'This form opens a draft on your device. It does not store data or send anything automatically.')+'</p><form class="enquiry-form" data-enquiry-form data-lang="'+lang+'" data-contact="'+escape(contact)+'"><div class="enquiry-grid"><label>'+(no?'Navn':'Name')+'<input name="name" autocomplete="name" maxlength="120" required></label><label>'+(no?'Virksomhet':'Company')+'<input name="company" autocomplete="organization" maxlength="160"></label><label>'+(no?'E-post':'Email')+'<input name="email" type="email" autocomplete="email" maxlength="254" required></label><label>'+(no?'Produkt/tema':'Product/topic')+'<select name="product" required>'+list+'</select></label></div><label>'+(no?'Hva vil du forbedre?':'What would you like to improve?')+'<textarea name="needs" rows="5" maxlength="2500" required placeholder="'+(no?'Unngå sensitive kundeopplysninger.':'Avoid sensitive customer information.')+'"></textarea></label><button class="btn btn-primary" type="submit">'+(no?'Åpne e-postutkast':'Open email draft')+' ↗</button><p class="enquiry-note" role="status" aria-live="polite" data-enquiry-note>'+(no?'Gjennomgå utkastet før du sender fra e-postprogrammet.':'Review your draft before sending it from your email program.')+'</p></form><p>'+(no?'Eller skriv direkte til ':'Or write directly to ')+'<a href="mailto:'+escape(contact)+'">'+escape(contact)+'</a>.</p><p class="notice">'+(no?'Vi bruker ChatGenius-kontaktadressen midlertidig. En egen Altovena-løsning kommer før offentlig lansering.':'We use a ChatGenius contact channel temporarily. Dedicated Altovena contact comes before public launch.')+'</p></div>';
}
const list=[];
for(const lang of ['en','no']){
  for(const key of Object.keys(routes)){
    const slug=routes[key][lang==='en'?0:1];
    const file=path.join(root,lang,slug,'index.html');
    let html=fs.readFileSync(file,'utf8');
    if(!html.includes('<section class="cta-band">'))throw new Error('Missing product CTA: '+file);
    html=html.replace('<section class="cta-band">',tour(key,lang)+'<section class="cta-band">');
    fs.writeFileSync(file,html);
  }
  const file=path.join(root,lang,lang==='en'?'book-demo':'bestill-demo','index.html');
  let html=fs.readFileSync(file,'utf8');
  const re=/<div class="contact-box">[\s\S]*?<\/div>/;
  if(!re.test(html))throw new Error('Missing contact card: '+file);
  html=html.replace(re,contactForm(lang)).replace('</head>','<script src="/enquiry.js" defer></script></head>');
  fs.writeFileSync(file,html);
}
const visit=dir=>{
  for(const item of fs.readdirSync(dir,{withFileTypes:true})){
    const file=path.join(dir,item.name);
    if(item.isDirectory())visit(file);
    else if(item.name==='index.html'){
      let html=fs.readFileSync(file,'utf8');
      html=html.replace('</head>','<link rel="stylesheet" href="/enhance.css"></head>');
      if(!publicRelease){
        if(!html.includes('noindex'))html=html.replace('</head>','<meta name="robots" content="noindex,nofollow"></head>');
        html=html.replace(/<link rel="canonical"[^>]*>/g,'').replace(/<link rel="alternate"[^>]*>/g,'');
      }
      fs.writeFileSync(file,html);
    }
  }
};
visit(path.join(root,'en'));
visit(path.join(root,'no'));
if(!publicRelease){
  fs.writeFileSync(path.join(root,'robots.txt'),'User-agent: *\nDisallow: /\n');
  fs.rmSync(path.join(root,'sitemap.xml'),{force:true});
}
console.log('Altovena preview enhanced: eight product walkthroughs and two email-draft contact pages.');