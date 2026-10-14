import fs from 'node:fs';
import path from 'node:path';

// v0.8: adapted from Andrea & Erlend's SEO/AEO/GEO and customer journey manual (2026-10-14).
// Deliberately one cornerstone guide for one intent; human editorial approval is required for a public release.
const dist = path.resolve(import.meta.dirname, '../dist');
const origin = (process.env.SITE_URL || '').replace(/\/$/, '');
const publicRelease = process.env.PUBLIC_LAUNCH === 'true';
if (publicRelease && process.env.EDITORIAL_APPROVED !== 'true') {
  throw new Error('Public editorial release requires EDITORIAL_APPROVED=true after human sign-off.');
}
if (publicRelease && !/^https:\/\/[^\s/]+\.[^\s/]+$/.test(origin)) {
  throw new Error('Public editorial release requires verified HTTPS SITE_URL.');
}
const routes = {
  no: {hub:'/no/innsikt/', guide:'/no/innsikt/seo-aeo-geo-forskjeller/', product:'/no/produkter/visibility/', service:'/no/tjenester/', demo:'/no/bestill-demo/?product=visibility'},
  en: {hub:'/en/insights/', guide:'/en/insights/seo-aeo-geo-explained/', product:'/en/products/visibility/', service:'/en/services/', demo:'/en/book-demo/?product=visibility'}
};
const docs = [
  ['People-first content', 'https://developers.google.com/search/docs/fundamentals/creating-helpful-content'],
  ['AI features and your website', 'https://developers.google.com/search/docs/appearance/ai-features'],
  ['Structured data', 'https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data']
];
const copy = {
  no: {
    nav:'Innsikt',hubTitle:'Innsikt om AI og synlighet for bedrifter',hubDescription:'Faglige guider om AI, SEO, AEO, GEO og kundereise. Fra tydelige svar til bedre beslutninger og relevante henvendelser.',
    hubLead:'Konkrete fagguider for virksomheter som vil forstå digitale muligheter før de investerer i programvare og rådgivning.',
    hubIntro:'Vi prioriterer sterke hovedsvar fremfor mange små artikler. Hver guide skal dekke ett tydelig behov, skille fakta fra antakelser og hjelpe leseren videre.',
    hubCardTitle:'SEO, AEO og GEO – hva er forskjellen?',hubCardText:'Lær hva begrepene betyr, hvilke tiltak som henger sammen og hva bedriften bør prioritere først.',
    hubProductTitle:'Når dere vil arbeide systematisk med synlighet',hubProductText:'Altovena Visibility er et produkt under utvikling. Les om den planlagte arbeidsmåten for analyse, kontroll og godkjente forbedringer.',read:'Les guiden',product:'Se Visibility',
    title:'SEO, AEO og GEO: Hva er forskjellen?',description:'SEO, AEO og GEO forklart: forstå forskjellene, få konkrete prioriteringer og se hvordan bedre svar kan føre til kvalifiserte kunder.',
    h1:'SEO, AEO og GEO: Hva er forskjellen – og hva bør bedriften gjøre?',
    intro:'SEO gjør det lettere å finne og bruke innhold i søk. AEO gjør svarene tydelige, mens GEO handler om troverdig og anvendelig informasjon i generative AI-tjenester. Arbeidet overlapper: bedriften trenger gode sider for mennesker, ikke tre parallelle innholdsmaskiner.',
    label:'FAGARTIKKEL · SØK OG AI',byline:'Altovena-redaksjonen · redaksjonelt utkast',review:'Faglig gjennomgang ved Erlend Thorsnes Karlsen gjenstår før offentlig publisering.',
    headings:[
      ['Hva er SEO?',[
        '<strong>SEO (søkemotoroptimalisering) gjør nettstedet lettere å finne, forstå og bruke i relevante søk.</strong> Arbeidet omfatter teknisk tilgjengelighet, god sidestruktur, nyttig innhold og tillit.',
        'Start med kundens faktiske spørsmål. Hvis en bedrift selger en kompleks tjeneste, trenger kunden ofte forklaring, sammenligning og trygghet før vedkommende tar kontakt. En god hovedside svarer på behovet før den forsøker å selge.',
        'Sjekk særlig at viktige sider har riktig hovedoverskrift, vanlig internlenking, mobilvennlig layout og informasjon som stemmer med det virksomheten leverer.'
      ]],
      ['Hva er AEO?',[
        '<strong>AEO (Answer Engine Optimization) handler om å formulere innhold slik at leseren raskt får et presist svar på spørsmålet sitt.</strong> Det bygger på SEO, men handler mer om selve svarstrukturen.',
        'Hvis H2-en spør «Hvordan vurderes datakvalitet?», må første avsnitt forklare metoden. «Se tabellen nedenfor» er ikke et svar. Bruk så eksempler, steg eller korte tabeller når de gjør svaret tydeligere.',
        'Bruk FAQ for spørsmål leserne faktisk stiller – ikke for å gjenta alle overskriftene.'
      ]],
      ['Hva er GEO, og kan vi garantere synlighet i AI-svar?',[
        '<strong>GEO (Generative Engine Optimization) brukes om tiltak som gjør innhold tydelig, troverdig og nyttig i generative AI-opplevelser.</strong> Kilder, konsistente opplysninger, ekte erfaring og tydelige virksomhetsopplysninger kan bidra til dette.',
        'Det finnes ingen metode som garanterer at en AI-tjeneste velger en bestemt virksomhet som kilde. Google forklarer at grunnleggende SEO-praksis fortsatt er relevant for AI-funksjoner i Google Søk, og at det ikke kreves en spesiell AI-merkekode.',
        'Se <a href="https://developers.google.com/search/docs/appearance/ai-features" rel="noopener noreferrer" target="_blank">Googles offisielle veiledning for AI-funksjoner</a> før du bruker penger på uverifiserte GEO-løfter.'
      ]],
      ['Hvordan er SEO, AEO og GEO forskjellige?',[
        '<strong>SEO prioriterer å bli funnet, AEO prioriterer selve svaret, og GEO prioriterer at informasjonen kan forstås og etterprøves i AI-sammenheng.</strong> Det er arbeidsområder som støtter hverandre.',
        '<TABLE>',
        'Én sterk fagartikkel med gode svar, kilder og en logisk kundereise kan derfor hjelpe med alle tre oppgavene. Tre nesten like artikler kan derimot forvirre både leseren og nettstedets struktur.'
      ]],
      ['Hva bør virksomheten forbedre først?',[
        '<strong>Begynn med hovedsiden som svarer på kundens viktigste spørsmål.</strong> Oppdater eksisterende innhold og rett tekniske feil før du lager flere artikler.',
        '<LIST>',
        'Et nytt innhold trenger en egen søkeintensjon og et eget naturlig neste steg. Hvis det bare er en variant av samme spørsmål, bør du som regel forbedre hovedsiden.'
      ]],
      ['Hvordan måler vi resultater fra SEO, AEO og GEO?',[
        '<strong>Mål hele veien fra synlighet til kvalifiserte henvendelser og salg, ikke bare plassering og trafikk.</strong> En side kan få mange klikk uten å tiltrekke riktig kunde.',
        'Se på impressions, klikk og landingssider i Search Console. Følg deretter relevante videreklikk, demoforespørsler og kvalifiserte leads. Dokumenter AI-henvisninger separat når de faktisk kan etterprøves; de er ikke det samme som organisk søketrafikk.',
        'Når kilder og målemetoder er usikre, må rapporten vise det fremfor å gi en falsk eksakt score.'
      ]],
      ['Kan schema eller ekstra AI-filer garantere bedre resultat?',[
        '<strong>Nei. Strukturert data kan beskrive sidens faktiske innhold, men garanterer ikke høyere rangering eller plass i AI-genererte svar.</strong> Merkingen må være sann og samsvare med det besøkende ser.',
        'Bruk bare relevante schema-typer, og ikke oppgi oppdiktede vurderinger, produkter eller sertifiseringer. Se <a href="https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data" rel="noopener noreferrer" target="_blank">Googles dokumentasjon om strukturerte data</a>.'
      ]],
      ['Hvordan går bedriften videre etter denne guiden?',[
        '<strong>Neste steg er en gjennomgang av nettstedet og en prioritert plan for de sidene som betyr mest for kundene.</strong> En bedrift som ennå undersøker begrepene trenger kunnskap; en bedrift som kjenner utfordringen kan ha nytte av en konkret analyse.',
        'Altovena Visibility utvikles for å støtte søkefaglig analyse, kildekontroll, innholdsforbedring og måling under menneskelig faglig styring. <a href="/no/produkter/visibility/">Les om Visibility-produktet</a> eller <a href="/no/tjenester/">faglig implementering</a>. Vi bekrefter tilgjengelighet og omfang før en eventuell leveranse.'
      ]]
    ],
    table:[['Område','Spørsmål','Typisk tiltak'],['SEO','Kan kunden finne siden?','Teknikk, struktur, lenker og innhold'],['AEO','Får kunden et klart svar?','Svar først, steg, tabeller og FAQ'],['GEO','Kan opplysningene etterprøves?','Kilder, erfaring, tydelige entiteter']],
    steps:['Velg kundens viktigste spørsmål og ønsket handling.','Finn eksisterende side som allerede burde eie svaret.','Skriv direkte svar under tydelige H2-er og dokumenter påstander.','Legg inn naturlige lenker til fordypning og passende neste steg.','Kontroller mobil, metadata, lenker, faktagrunnlag og produktoplysninger før publisering.'],
    faqTitle:'Vanlige spørsmål',faq:[['Trenger vi en egen GEO-guide for hvert søkeord?','Nei. Flere like artikler kan gi overlappende intensjon. Prioriter én tydelig hovedside med nødvendig understruktur.'],['Må alle overskrifter være spørsmål for AEO?','Nei. Bruk naturlige spørsmål der det passer. Overskrifter kan også beskrive et klart steg eller undertema.'],['Kan Altovena love omtale i AI-svar?','Nei. Vi kan forbedre kvalitet, kildegrunnlag og måling, men ikke bestemme hvilke kilder AI-tjenester viser.']],
    sources:'Offisielle kilder',next:'Fra kunnskap til neste steg',nextText:'Vil dere vite hvilke sider som bør forbedres først? Se den planlagte Visibility-arbeidsflyten eller ta kontakt om en konkret gjennomgang.',contact:'Diskuter nettstedet med oss',back:'Til innsikt',note:'Faglig utkast. Dette er ikke en garanti for rangering, AI-henvisninger eller tilgjengelighet til et produkt.'
  },
  en: {
    nav:'Insights',hubTitle:'Insights on AI and business visibility',hubDescription:'Practical guidance on AI, SEO, AEO, GEO and customer journeys. Move from clearer answers to more qualified business enquiries.',
    hubLead:'Practical guidance for organisations evaluating search visibility and intelligent systems before making a technology decision.',
    hubIntro:'We prioritise a few comprehensive answers over many overlapping posts. Every guide has one main question, a verifiable foundation and a relevant next step.',
    hubCardTitle:'SEO, AEO and GEO: what is the difference?',hubCardText:'Learn what the terms mean, how the methods work together and what to prioritise first.',
    hubProductTitle:'When you need a repeatable visibility workflow',hubProductText:'Altovena Visibility is under development. Explore the proposed process for audits, quality review and approved improvements.',read:'Read the guide',product:'Explore Visibility',
    title:'SEO, AEO and GEO: The difference',description:'SEO vs AEO vs GEO explained for businesses. Compare the methods, decide what to improve first and connect visibility to the customer journey.',
    h1:'SEO, AEO and GEO: What is the difference for businesses?',
    intro:'SEO helps people discover and use content in search. AEO makes answers clearer. GEO focuses on information that is credible and understandable in generative AI experiences. The methods overlap: one strong customer-focused page is usually more useful than three separate content programmes.',
    label:'EXPLAINER · SEARCH AND AI',byline:'Altovena editorial team · draft',review:'Expert editorial review by Erlend Thorsnes Karlsen is pending before publication.',
    headings:[
      ['What is SEO?',[
        '<strong>Search engine optimisation (SEO) helps people find, understand and use relevant website content.</strong> It covers technical accessibility, meaningful structure, useful answers and trust.',
        'Start with what the customer needs to know. For complex services, people often compare options and need reassurance before contacting a provider. A helpful page answers those questions instead of leading with slogans.',
        'Review page titles, internal links, mobile layout and the accuracy of product information before expanding the article library.'
      ]],
      ['What is AEO?',[
        '<strong>Answer engine optimisation (AEO) means presenting content so a specific question receives a clear, stand-alone answer.</strong> It builds on SEO and focuses on the structure of the answer itself.',
        'If an H2 asks “How do you assess data quality?”, the next sentence should explain the method. “See the table below” is not an answer. Add examples, steps or concise tables only where they make the answer easier to use.',
        'Use FAQ sections for genuine additional customer questions, not to repeat every heading.'
      ]],
      ['What is GEO, and can it guarantee inclusion in AI answers?',[
        '<strong>Generative engine optimisation (GEO) is commonly used for making information clear, credible and useful in generative AI experiences.</strong> Evidence, consistent business details, first-hand knowledge and strong sourcing all matter.',
        'No responsible provider can guarantee that a particular AI service will cite a business. Google says standard SEO practices continue to apply to AI features in Google Search, without requiring special AI markup.',
        'Read <a href="https://developers.google.com/search/docs/appearance/ai-features" rel="noopener noreferrer" target="_blank">Google’s official AI features guidance</a> before investing in unsupported GEO promises.'
      ]],
      ['How do SEO, AEO and GEO differ in practice?',[
        '<strong>SEO focuses on discoverability, AEO on answer clarity, and GEO on credible information that can be understood in an AI context.</strong> These goals reinforce each other.',
        '<TABLE>',
        'One authoritative guide with direct answers, supporting sources and a clear next step can serve all three purposes. Several near-duplicate articles can fragment the visitor journey.'
      ]],
      ['What should a business improve first?',[
        '<strong>Start with the most important customer question and the existing page that should answer it.</strong> Fix blocking technical issues and vague content before producing more posts.',
        '<LIST>',
        'Only create a new article when the topic has its own intent and a meaningful next step. Otherwise, strengthen the existing page.'
      ]],
      ['How should SEO, AEO and GEO be measured?',[
        '<strong>Measure the path from discoverability to relevant enquiries and sales, not only positions or traffic.</strong> High traffic is not always high-quality demand.',
        'Use Search Console to assess impressions, clicks and landing pages, then track relevant next-page visits, demo enquiries and qualified leads where lawful and technically configured. Report verifiable AI referrals separately; they are not a complete or directly comparable measure of search visibility.',
        'Show the definitions, evidence and limits behind every score.'
      ]],
      ['Can structured data guarantee rankings or AI appearances?',[
        '<strong>No. Structured data describes real information on a page but cannot guarantee a ranking or an AI citation.</strong> The markup must match visible, accurate content.',
        'Choose schema types that genuinely apply; do not invent ratings, credentials or product availability. See <a href="https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data" rel="noopener noreferrer" target="_blank">Google’s structured data documentation</a>.'
      ]],
      ['What should a business do after reading this guide?',[
        '<strong>Review the pages that matter most to customers and develop a prioritised improvement plan.</strong> An early-stage reader may want more information; a team that already knows its constraints may be ready to discuss a structured audit.',
        'Altovena Visibility is being developed to support technical and editorial audits, source checks, controlled content improvements and expert review. <a href="/en/products/visibility/">Explore the planned Visibility product</a> or <a href="/en/services/">our implementation services</a>. We confirm availability and scope before any engagement.'
      ]]
    ],
    table:[['Focus','Main question','Typical work'],['SEO','Can customers find the page?','Technical access, structure, links and content'],['AEO','Does the customer get a clear answer?','Answer-first text, steps, tables and FAQ'],['GEO','Can the facts be verified?','Evidence, experience and consistent entities']],
    steps:['Identify one important customer question and desired next step.','Find the existing page that should own the answer.','Write direct answers under specific H2 headings, with evidence.','Link naturally to relevant resources and the next action.','Check mobile, metadata, internal links, claims and product status before release.'],
    faqTitle:'Common questions',faq:[['Do we need a separate GEO guide for every keyword?','No. Near-duplicate articles often divide the intent. Prefer one strong main page with focused sections.'],['Does AEO require every heading to be a question?','No. Use real questions when appropriate. Other headings can describe a decision or a subtopic.'],['Can Altovena guarantee mentions in AI answers?','No. We can improve content quality, sourcing and measurements, but cannot choose the sources used in AI answers.']],
    sources:'Official sources',next:'From knowledge to action',nextText:'Want to understand which pages deserve attention first? Explore the planned Visibility workflow or discuss a specific review.',contact:'Discuss your website',back:'Back to insights',note:'Editorial draft. No particular ranking, AI citation or product availability is guaranteed.'
  }
};
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const pagePath=route=>path.join(dist,route.slice(1),'index.html');
const link=(url,text,cls='')=>'<a href="'+url+'"'+(cls?' class="'+cls+'"':'')+'>'+esc(text)+'</a>';
const edit=(file,fn)=>{const a=fs.readFileSync(file,'utf8'),b=fn(a);if(!b.includes('</html>'))throw Error('Invalid page '+file);fs.writeFileSync(file,b);};
const write=(file,body)=>{fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,body);};
function tableHtml(lang){const rows=copy[lang].table;return '<div class="editorial-table-scroll"><table><thead><tr>'+rows[0].map(v=>'<th>'+esc(v)+'</th>').join('')+'</tr></thead><tbody>'+rows.slice(1).map(row=>'<tr>'+row.map((v,i)=>'<td data-label="'+esc(rows[0][i])+'">'+esc(v)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';}
function articleHtml(lang){const t=copy[lang],r=routes[lang];
 const sections=t.headings.map(([heading,paragraphs],i)=>{
  const body=paragraphs.map(p=>p==='<TABLE>'?tableHtml(lang):p==='<LIST>'?'<ol>'+t.steps.map(s=>'<li>'+esc(s)+'</li>').join('')+'</ol>':'<p>'+p+'</p>').join('');
  return '<section class="editorial-section" id="part-'+(i+1)+'"><h2>'+esc(heading)+'</h2>'+body+'</section>';}).join('');
 const faqs=t.faq.map(([q,a])=>'<div class="editorial-faq"><h3>'+esc(q)+'</h3><p>'+esc(a)+'</p></div>').join('');
 const sourcesHtml=docs.map(([name,url])=>'<li><a href="'+url+'" target="_blank" rel="noopener noreferrer">'+esc(name)+'</a> — Google Search Central</li>').join('');
 return '<section class="page-hero editorial-hero"><div class="container"><nav class="editorial-breadcrumb" aria-label="Breadcrumb">'+link('/'+lang+'/',lang==='no'?'Hjem':'Home')+' / '+link(r.hub,t.nav)+'</nav><span class="eyebrow">'+esc(t.label)+'</span><h1>'+esc(t.h1)+'</h1><p class="lede">'+esc(t.intro)+'</p><p class="editorial-byline">'+esc(t.byline)+'</p><p class="editorial-review">'+esc(t.review)+'</p></div></section>'+
 '<div class="container editorial-article-wrap"><article class="editorial-article">'+sections+'<section class="editorial-section"><h2>'+esc(t.faqTitle)+'</h2>'+faqs+'</section><section class="editorial-section editorial-sources"><h2>'+esc(t.sources)+'</h2><ul>'+sourcesHtml+'</ul></section><p class="editorial-note">'+esc(t.note)+'</p></article><aside class="editorial-aside"><div class="editorial-aside-card"><span class="eyebrow">ALTOVENA VISIBILITY</span><h2>'+esc(t.next)+'</h2><p>'+esc(t.nextText)+'</p>'+link(r.product,t.product+' →')+'</div></aside></div>'+
 '<section class="cta-band"><div class="container cta-flex"><div><h2>'+esc(t.next)+'</h2><p>'+esc(t.nextText)+'</p>'+link(r.hub,t.back+' →')+'</div>'+link(r.demo,t.contact,'btn btn-primary')+'</div></section>';
}
function hubHtml(lang){const t=copy[lang],r=routes[lang];return '<section class="page-hero"><div class="container"><span class="eyebrow">ALTOVENA</span><h1>'+esc(t.hubTitle)+'</h1><p class="lede">'+esc(t.hubLead)+'</p></div></section><section class="section section-white"><div class="container editorial-hub"><p class="editorial-intro">'+esc(t.hubIntro)+'</p><div class="editorial-hub-grid"><article class="editorial-teaser"><span class="eyebrow">SEO · AEO · GEO</span><h2>'+esc(t.hubCardTitle)+'</h2><p>'+esc(t.hubCardText)+'</p>'+link(r.guide,t.read+' →')+'</article><aside class="editorial-teaser editorial-teaser-tint"><span class="eyebrow">VISIBILITY</span><h2>'+esc(t.hubProductTitle)+'</h2><p>'+esc(t.hubProductText)+'</p>'+link(r.product,t.product+' →')+'</aside></div></div></section>';}
function schema(lang,route,isArticle){if(!publicRelease)return '';
 const t=copy[lang],items=[{'@type':'ListItem',position:1,name:lang==='no'?'Hjem':'Home',item:origin+'/'+lang+'/'},{'@type':'ListItem',position:2,name:t.nav,item:origin+routes[lang].hub}];
 if(isArticle)items.push({'@type':'ListItem',position:3,name:t.h1,item:origin+route});
 const graph=[{'@type':'BreadcrumbList',itemListElement:items}];
 if(isArticle)graph.push({'@type':'Article',headline:t.h1,description:t.description,inLanguage:lang==='no'?'nb':'en',mainEntityOfPage:origin+route,author:{'@type':'Organization',name:'Altovena'},publisher:{'@type':'Organization',name:'Altovena'}});
 return '<script type="application/ld+json">'+JSON.stringify({'@context':'https://schema.org','@graph':graph}).replaceAll('<','\\u003c')+'</script>';
}
function buildNewPage(lang,type){const t=copy[lang],r=routes[lang],route=r[type],other=lang==='en'?'no':'en';
 let h=fs.readFileSync(pagePath(r.service),'utf8');
 h=h.replace(/<main id="main">[\s\S]*?<\/main>/,'<main id="main">'+(type==='hub'?hubHtml(lang):articleHtml(lang))+'</main>');
 h=h.replace(/<title>[^<]*<\/title>/,'').replace(/<meta name="description" content="[^"]*">/,'').replace(/<meta property="og:(?:title|description|url)" content="[^"]*">/g,'').replace(/<link rel="canonical"[^>]*>/g,'').replace(/<link rel="alternate"[^>]*>/g,'');
 h=h.replace(/<meta name="robots" content="[^"]*">/,'');
 const title=type==='hub'?t.hubTitle:t.title,desc=type==='hub'?t.hubDescription:t.description;
 let head='<title>'+esc(title)+' | Altovena</title><meta name="description" content="'+esc(desc)+'"><meta property="og:title" content="'+esc(title)+' | Altovena"><meta property="og:description" content="'+esc(desc)+'">';
 if(!publicRelease)head+='<meta name="robots" content="noindex,nofollow">';
 else head+='<link rel="canonical" href="'+origin+route+'"><link rel="alternate" hreflang="en" href="'+origin+routes.en[type]+'"><link rel="alternate" hreflang="nb" href="'+origin+routes.no[type]+'"><link rel="alternate" hreflang="x-default" href="'+origin+routes.en[type]+'"><meta property="og:url" content="'+origin+route+'">';
 h=h.replace('</head>',head+schema(lang,route,type==='guide')+'</head>');
 h=h.replace(/(<div class="locale-switch"[^>]*>)([\s\S]*?)(<\/div>)/,(_m,a,b,c)=>a+b.replace(/(<a lang="en" href=")[^"]*"/,'$1'+routes.en[type]+'"').replace(/(<a lang="no" href=")[^"]*"/,'$1'+routes.no[type]+'"').replace(/ aria-current="page"/g,'').replace(new RegExp('(<a lang="'+lang+'"[^>]+)'), '$1 aria-current="page"')+c);
 h=h.replace(/(<nav class="primary-nav"[\s\S]*?<\/nav>)/,nav=>nav.replaceAll(' aria-current="page"',''));
 write(pagePath(route),h);
}
// Make the existing hub/product/customer journey visible everywhere with one new nav item.
for(const lang of ['en','no']){
 function walk(dir){for(const d of fs.readdirSync(dir,{withFileTypes:true})){
  const p=path.join(dir,d.name);if(d.isDirectory())walk(p);else if(d.name==='index.html')edit(p,h=>{
   const nav=h.match(/<nav class="primary-nav"[^>]*>[\s\S]*?<\/nav>/)?.[0];
   if(!nav)throw Error('Navigation missing '+p);
   h=h.replace(nav,nav.replace('</nav>','<a data-insights-nav href="'+routes[lang].hub+'">'+copy[lang].nav+'</a></nav>'));
   h=h.replace('<a data-trust-footer-link','<a data-insights-footer href="'+routes[lang].hub+'">'+copy[lang].nav+'</a><a data-trust-footer-link');
   const rel=path.relative(path.join(dist,lang),path.dirname(p)).split(path.sep).join('/');
   if(rel===(lang==='no'?'produkter/visibility':'products/visibility')){
    h=h.replace('<section class="trust-status-section">','<section class="editorial-related"><div class="container"><p>'+(lang==='no'?'Vil du forstå begrepene først?':'Need to understand the terms first?')+' '+link(routes[lang].guide,copy[lang].hubCardTitle+' →')+'</p></div></section><section class="trust-status-section">');
   }
   return h;
  });}}
 walk(path.join(dist,lang));
}
for(const lang of ['en','no'])for(const type of ['hub','guide'])buildNewPage(lang,type);
for(const lang of ['en','no'])for(const type of ['hub','guide'])edit(pagePath(routes[lang][type]),h=>h.replace('data-insights-nav href=', 'data-insights-nav aria-current="page" href='));
fs.copyFileSync(path.resolve(import.meta.dirname,'../public/editorial.css'),path.join(dist,'editorial.css'));
for(const lang of ['en','no']){
 function walk(dir){for(const d of fs.readdirSync(dir,{withFileTypes:true})){
  const p=path.join(dir,d.name);if(d.isDirectory())walk(p);else if(d.name==='index.html')edit(p,h=>h.replace('</head>','<link rel="stylesheet" href="/editorial.css"></head>'));}}
 walk(path.join(dist,lang));
}
if(publicRelease){const p=path.join(dist,'sitemap.xml');if(!fs.existsSync(p))throw Error('Public sitemap missing');let xml=fs.readFileSync(p,'utf8');xml=xml.replace('</urlset>',Object.values(routes).map(r=>[r.hub,r.guide].map(u=>'<url><loc>'+origin+u+'</loc></url>').join('')).join('')+'</urlset>');fs.writeFileSync(p,xml);}
console.log('Altovena v0.8: 28 bilingual pages; insights hub and SEO/AEO/GEO cornerstone guide included.');