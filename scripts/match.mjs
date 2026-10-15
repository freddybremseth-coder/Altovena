import fs from 'node:fs';
import path from 'node:path';

// Build-time addon, run after extend.mjs. Pure client-side product discovery.
const DIST = path.resolve(import.meta.dirname, '../dist');
const LABELS = {
  en: {
    tag: 'FIND THE RIGHT STARTING POINT',
    heading: 'What should your business improve first?',
    desc: 'Choose the challenge that matters most. We will point you to a relevant product direction, without collecting your answers or claiming to run an AI assessment.',
    question: 'Choose your biggest challenge',
    topics: [
      ['prospecting','Find and qualify business opportunities','We spend time researching companies but lack dependable prioritization.'],
      ['visibility','Improve our visibility in search and AI answers','People should understand our expertise and find reliable answers.'],
      ['realestate','Connect enquiries, properties and follow-up','Our property customer journey is fragmented across tools.'],
      ['agriculture','Organize seasonal work and field records','Field observations, tasks and records are difficult to keep together.']
    ],
    outputs: {
      prospecting:['Offer Intelligence','Start with evidence-led company research and separate data quality from commercial interest.'],
      visibility:['Visibility','Start with a technical, editorial and answer-quality audit, followed by a reviewed improvement plan.'],
      realestate:['RealtyFlow','Start with a connected customer process for enquiries, property information and adviser follow-up.'],
      agriculture:['Olivia OS','Start with parcel information, seasonal planning and traceable operational records.']
    },
    resultTag:'SUGGESTED PRODUCT DIRECTION',
    disclaimer:'This is a static product guide, not a recommendation based on live company data. Product availability and scope must be confirmed.',
    primary:'View product', secondary:'Discuss your needs', reset:'Change your answer', noSelection:'Choose one option to see where to start.'
  },
  no: {
    tag:'FINN RIKTIG UTGANGSPUNKT',
    heading:'Hva trenger virksomheten din å forbedre først?',
    desc:'Velg utfordringen som er viktigst. Vi peker deg til en relevant produktretning uten å samle inn svarene eller påstå at vi gjennomfører en AI-analyse.',
    question:'Velg den viktigste utfordringen',
    topics:[
      ['prospecting','Finne og kvalifisere bedriftsmuligheter','Vi bruker mye tid på bedriftsresearch, men mangler god prioritering.'],
      ['visibility','Bli mer synlige i søk og AI-svar','Folk bør finne svarene våre og forstå kompetansen vår.'],
      ['realestate','Koble boligforespørsler og oppfølging','Eiendomskundens reise er fordelt på flere systemer.'],
      ['agriculture','Organisere sesongarbeid og feltdokumentasjon','Observasjoner, oppgaver og dokumentasjon ligger spredt.']
    ],
    outputs:{
      prospecting:['Offer Intelligence','Start med kildebasert bedriftsresearch. Hold datakvalitet og mulig kjøpsinteresse atskilt.'],
      visibility:['Visibility','Start med kontroll av teknisk SEO, innhold og svarkvalitet, etterfulgt av godkjente forbedringer.'],
      realestate:['RealtyFlow','Start med en helhetlig prosess for henvendelser, boliginformasjon og rådgiveroppfølging.'],
      agriculture:['Olivia OS','Start med parsellinformasjon, sesongplanlegging og sporbar driftsdokumentasjon.']
    },
    resultTag:'FORESLÅTT PRODUKTRETNING',
    disclaimer:'Dette er en statisk produktveiviser, ikke en analyse av bedriften din. Tilgjengelighet og omfang må avklares.',
    primary:'Se produktet',secondary:'Snakk med oss',reset:'Endre valg',noSelection:'Velg ett alternativ for å se hvor du kan starte.'
  }
};
const ROUTES = {
  en:{prospecting:'/en/products/offer-intelligence/',visibility:'/en/products/visibility/',realestate:'/en/products/realtyflow/',agriculture:'/en/products/olivia/'},
  no:{prospecting:'/no/produkter/offer-intelligence/',visibility:'/no/produkter/visibility/',realestate:'/no/produkter/realtyflow/',agriculture:'/no/produkter/olivia/'}
};
const KEYS={prospecting:'offer',visibility:'visibility',realestate:'realtyflow',agriculture:'olivia'};
function esc(v){return String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');}
function adviser(locale){const t=LABELS[locale];const options=t.topics.map(([key,label,desc])=>`<button type="button" class="adviser-choice" data-adviser-choice="${key}" aria-pressed="false"><span class="adviser-choice-icon" aria-hidden="true">${{prospecting:'↗',visibility:'◎',realestate:'⌂',agriculture:'❋'}[key]}</span><span><strong>${esc(label)}</strong><small>${esc(desc)}</small></span></button>`).join('');
  return `<section class="section adviser-section" id="find-your-solution"><div class="container"><div class="section-heading"><span class="eyebrow">${esc(t.tag)}</span><h2>${esc(t.heading)}</h2><p class="section-intro">${esc(t.desc)}</p></div><div class="adviser-layout" data-solution-adviser data-lang="${locale}"><div class="adviser-choices"><h3>${esc(t.question)}</h3><div class="adviser-option-grid">${options}</div></div><div class="adviser-result" aria-live="polite" aria-atomic="true"><span class="eyebrow">${esc(t.resultTag)}</span><p data-adviser-placeholder>${esc(t.noSelection)}</p><div data-adviser-output hidden><h3 data-adviser-title></h3><p data-adviser-summary></p><div class="adviser-actions"><a class="btn btn-primary" data-adviser-product href="${ROUTES[locale].prospecting}">${esc(t.primary)}</a><a class="btn btn-light" data-adviser-contact href="${locale==='en'?'/en/book-demo/':'/no/bestill-demo/'}?product=offer">${esc(t.secondary)}</a></div><p class="adviser-fineprint">${esc(t.disclaimer)}</p></div></div></div></div></section>`;
}
for(const lang of ['en','no']){
 const home=path.join(DIST,lang,'index.html');let html=fs.readFileSync(home,'utf8');
 if(!html.includes('<section class="cta-band">'))throw Error('Missing home CTA '+lang);
 html=html.replace('<section class="cta-band">',adviser(lang)+'<section class="cta-band">');
 fs.writeFileSync(home,html);
}
const config={};for(const lang of ['en','no']){config[lang]={};for(const [key,[name,desc]] of Object.entries(LABELS[lang].outputs))config[lang][key]={name,desc,product:ROUTES[lang][key],contact:`/${lang}/${lang==='en'?'book-demo':'bestill-demo'}/?product=${KEYS[key]}`};}
fs.writeFileSync(path.join(DIST,'adviser-data.json'),JSON.stringify(config));
// Data is embedded in client JS at build time: no endpoint, no tracking, no storage.
const js=fs.readFileSync(path.resolve(import.meta.dirname,'../public/adviser.js'),'utf8');
fs.writeFileSync(path.join(DIST,'adviser.js'),`const ADVISER_DATA=${JSON.stringify(config)};\n`+js);
fs.copyFileSync(path.resolve(import.meta.dirname,'../public/adviser.css'),path.join(DIST,'adviser.css'));
for(const lang of ['en','no']){
 const home=path.join(DIST,lang,'index.html');let html=fs.readFileSync(home,'utf8');html=html.replace('</head>','<link rel="stylesheet" href="/adviser.css"><script src="/adviser.js" defer></script></head>');fs.writeFileSync(home,html);
}
console.log('Altovena v0.4: localized, privacy-preserving product adviser added to both home pages.');