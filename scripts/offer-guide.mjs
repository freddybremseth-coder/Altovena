import fs from 'node:fs';
import path from 'node:path';

// Offer Intelligence guide: distinct search intent from SEO/AEO/GEO guide.
// Prepared following Andrea/Erlend SEO, AEO, GEO and customer journey manual v1.2.
// Preview draft only; not approved for public indexing or commercial claims.
const root=path.resolve(import.meta.dirname,'../dist');
const origin=(process.env.SITE_URL||'').replace(/\/$/,'');
const publicRelease=process.env.PUBLIC_LAUNCH==='true';
const articleApproved=process.env.OFFER_GUIDE_APPROVED==='true';
const paths={
  no:{guide:'/no/innsikt/kvalifisere-b2b-leads/',hub:'/no/innsikt/',seo:'/no/innsikt/seo-aeo-geo-forskjeller/',product:'/no/produkter/offer-intelligence/',demo:'/no/bestill-demo/?product=offer'},
  en:{guide:'/en/insights/b2b-lead-qualification/',hub:'/en/insights/',seo:'/en/insights/seo-aeo-geo-explained/',product:'/en/products/offer-intelligence/',demo:'/en/book-demo/?product=offer'}
};
const txt={
 no:{
  title:'Kvalifisere B2B-leads: datakvalitet og kjøpsinteresse',
  h1:'Hvordan kvalifisere B2B-leads uten å forveksle datakvalitet med kjøpsinteresse?',
  desc:'Slik kvalifiserer du B2B-leads: skill kvaliteten på bedriftsdata fra faktisk kjøpsinteresse, dokumenter signaler og godkjenn kontakt manuelt.',
  intro:'God B2B-kvalifisering krever to ulike vurderinger: om informasjonen om bedriften er pålitelig, og om det finnes dokumentasjon på et reelt behov. En riktig firmadresse er ikke et kjøpssignal. Et relevant bransjetreff betyr heller ikke at selskapet har et aktivt budsjett.',
  tag:'B2B · KILDER · BESLUTNINGER',byline:'Altovena-redaksjonen · faglig utkast',review:'Faglig kvalitetssikring og godkjenning gjenstår før offentlig publisering.',
  hubLabel:'B2B-leads og bedriftsresearch',hubText:'En konkret metode for å prioritere bedrifter uten å forveksle riktige data med dokumentert kjøpsinteresse.',
  sections:[
    ['Hva betyr det å kvalifisere et B2B-lead?',[
      'Å kvalifisere et B2B-lead betyr å vurdere om en virksomhet er relevant for tilbudet, om informasjonen kan stoles på, og om et neste steg er saklig begrunnet. Det er ikke det samme som å fastslå at bedriften ønsker å kjøpe.',
      'Begynn med et tydelig kundeproblem. Dersom du tilbyr programvare for bedriftsresearch, er det mer relevant å identifisere arbeidsprosesser, segment og mulige behov enn å samle flest mulig navn.',
      'En kvalifiseringsprosess bør alltid skille det som er bekreftet, det som er antatt, og det som ennå ikke er undersøkt.'
    ]],
    ['Hva er forskjellen mellom datakvalitet og kjøpsinteresse?',[
      'Datakvalitet sier hvor godt opplysningene kan dokumenteres. Kjøpsinteresse sier om det finnes tegn på at en bedrift faktisk vurderer et relevant behov eller en anskaffelse. De to vurderingene skal ikke blandes.',
      '<TABLE>',
      'Eksempel: En bedrift kan ha bekreftet organisasjonsnummer, bransje og offisiell nettside, samtidig som kjøpsinteressen er ukjent. Det skal fremgå av vurderingen – ikke skjules bak én samlet score.'
    ]],
    ['Hvilke kilder bør brukes i bedriftsresearch?',[
      'Start med kilder som dokumenterer de konkrete opplysningene du trenger: offisielle foretaksregistre, virksomhetens eget nettsted og offentlig tilgjengelig informasjon om tjenester eller virksomhetsområde.',
      'Registrer kilde, dato, påstand og usikkerhet for hvert vesentlig funn. Et utdatert kontaktnavn eller en automatisk generert konklusjon må ikke behandles som bekreftet fakta.',
      'Ikke hent inn personopplysninger bare fordi de er teknisk tilgjengelige. Formål, nødvendighet og behandlingsgrunnlag må vurderes før persondata samles inn.'
    ]],
    ['Hvordan prioriterer vi bedrifter uten falsk presisjon?',[
      'Prioriter etter dokumentert relevans og kvalitet på kunnskapsgrunnlaget, ikke etter en udokumentert prosent for «kjøpssannsynlighet». Der kjøpssignalene mangler, bør status være «ukjent».',
      'En praktisk arbeidsmåte er å gi datakvalitet og mulig interesse hvert sitt felt. Forklar hvilke forhold som trekker opp eller ned, og la et menneske vurdere om mer research er verdt tiden.',
      'Tall kan være nyttige når datagrunnlag og metode faktisk er definert og testet. I en tidlig fase kan kvalitative kategorier være mer redelige enn detaljerte poengsummer.'
    ]],
    ['Hvordan ser en kontrollert B2B-arbeidsflyt ut?',[
      'En kontrollert prosess går fra valg av kundesegment via dokumentert research og vurdering til menneskelig godkjenning av neste handling. Den bør ikke sende e-post automatisk på grunnlag av et uverifisert signal.',
      '<STEPS>',
      'Hvert trinn skal kunne etterprøves. Hvis bedriften ikke kan se hvorfor et lead ble prioritert, bør det ikke behandles som en ferdig beslutning.'
    ]],
    ['Hvordan ivaretar vi personvern ved lead research og kontakt?',[
      'Bedriftsdata og personopplysninger må behandles forskjellig. Opplysninger som identifiserer en person, kan være omfattet av GDPR selv når de brukes i en B2B-prosess.',
      'Rett behandlingsgrunnlag må vurderes konkret; berettiget interesse er ikke en generell tillatelse til å bygge eller bruke kontaktlister. Rett til å protestere, informasjon til registrerte og særregler for elektronisk markedsføring må ivaretas. <a href="https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/legal-grounds-processing-data_en" target="_blank" rel="noopener noreferrer">Europakommisjonens veiledning om behandlingsgrunnlag</a> forklarer vilkårene.',
      'Før utsendelser må også nasjonale markedsføringsregler, reservasjonsopplysninger og den konkrete kontaktkanalen vurderes. Beslutningen skal godkjennes av ansvarlig person.'
    ]],
    ['Hvordan måler vi om lead-kvalifiseringen virker?',[
      'Mål hvor mange relevante virksomheter som faktisk kan verifiseres, hvor mange vurderinger som krever korrigering, og hvor ofte kontakt fører til en reell samtale – ikke bare antallet innsamlede leadposter.',
      'Skill feil i datagrunnlaget fra en korrekt «ingen interesse»-konklusjon. Registrer også avvisninger, reservasjoner og manuelle overstyringer slik at prosessen kan forbedres uten å presse frem flere utsendelser.',
      'Knytt måling til en definert kundereise fra research til kvalifisert samtale og eventuell avtale.'
    ]],
    ['Når er Offer Intelligence et relevant neste steg?',[
      'Offer Intelligence er relevant å undersøke når bedriften har et tydelig B2B-segment og bruker mye tid på manuell research, usikker prioritering eller manglende sporbarhet før kundekontakt.',
      'Produktet utvikles med mål om kildebaserte bedriftsdossierer, separate vurderinger av datakvalitet og interesse, og menneskelig godkjenning før handling. Dette er produktretningen – ikke en påstand om at alle funksjoner er kommersielt tilgjengelige.',
      'Se <a href="/no/produkter/offer-intelligence/">Offer Intelligence</a> for planlagt arbeidsflyt. Ønsker dere først bedre innhold som kan nå flere relevante kunder, kan dere også lese <a href="/no/innsikt/seo-aeo-geo-forskjeller/">guiden om SEO, AEO og GEO</a>.'
    ]]
  ],
  table:[['Vurdering','Dette kan dokumenteres','Dette kan ikke konkluderes'],['Datakvalitet','Foretaksidentitet, kilde, dato og fullstendighet','At bedriften ønsker å kjøpe'],['Mulig behov','Offentlige opplysninger om virksomhet og relevant arbeidsprosess','At et prosjekt er finansiert eller aktivt'],['Kjøpsinteresse','Et konkret uttrykt behov eller annen bekreftet relevant informasjon','At et lead bør kontaktes uten juridisk og menneskelig kontroll']],
  steps:['Definer segmentet og kundeproblemet.','Hent nødvendige opplysninger fra tillatte kilder.','Dokumenter kildekvalitet og mangler i dossieret.','Vurder mulig behov separat fra dokumentert interesse.','Kontroller kontaktgrunnlag, rettigheter og reservasjoner.','La ansvarlig person godkjenne eller avvise neste steg.'],
  faq:[['Kan et firma være et godt lead uten dokumentert kjøpsinteresse?','Ja, det kan være relevant for videre research, men ikke klassifiseres som dokumentert interessert.'],['Bør alle leads få en poengsum?','Nei. En score er bare nyttig når grunnlag og metode er tydelig definert. Ukjente signaler skal ikke gis falsk presisjon.'],['Kan systemet automatisk kontakte leads?','Ikke som standard i den beskrevne prosessen. Ekstern kontakt krever riktig grunnlag og menneskelig godkjenning.']],
  sources:'Kilder og forutsetninger',faqTitle:'Vanlige spørsmål',next:'Hva bør dere gjøre videre?',nextText:'Begynn med ett segment og se om dere kan dokumentere hvilke selskaper som er relevante før noen kontaktes.', product:'Utforsk Offer Intelligence',back:'Tilbake til Innsikt',cta:'Drøft en B2B-prosess',disclaimer:'Denne artikkelen er et faglig utkast og gir ikke individuell juridisk rådgivning. Produktstatus og tilgjengelighet må bekreftes.'
 },
 en:{
  title:'B2B lead qualification: data quality versus intent',
  h1:'How can you qualify B2B leads without confusing data quality with buying intent?',
  desc:'A practical B2B lead qualification guide: verify company data, separate buying intent, document uncertainty and require human approval before outreach.',
  intro:'Responsible B2B qualification asks two separate questions: are the company facts dependable, and is there evidence of an actual business need? A valid company address is not a purchase signal. An industry match does not prove budget or active procurement.',
  tag:'B2B · EVIDENCE · HUMAN REVIEW',byline:'Altovena editorial team · draft',review:'Specialist review and approval are pending before public release.',
  hubLabel:'B2B lead qualification and research',hubText:'How to prioritise business prospects without confusing accurate records with genuine buying intent.',
  sections:[
    ['What does qualifying a B2B lead actually mean?',[
      'B2B qualification means evaluating whether a company is relevant to an offer, whether supporting facts can be trusted and whether a next step is justified. It does not mean claiming the company is ready to purchase.',
      'Start with the customer problem. If you sell business research software, learning about workflows, industries and relevant operational needs may matter more than gathering names.',
      'A useful workflow separates what is verified, what is inferred and what has not yet been investigated.'
    ]],
    ['What is the difference between data quality and buying interest?',[
      'Data quality concerns the reliability and traceability of company information. Buying interest concerns signals that a company may actually be considering a relevant need or purchase. They are separate assessments.',
      '<TABLE>',
      'Example: an organisation might have a validated registration, sector and official website while its buying interest remains unknown. Show that distinction instead of hiding it behind one combined number.'
    ]],
    ['Which sources should company research use?',[
      'Use sources that can support the actual facts needed: official business registers, the company’s website and publicly available information about services or business activities.',
      'Record the source, review date, claim and uncertainty for each material finding. An outdated contact name or AI-generated conclusion must not be presented as a verified fact.',
      'Do not collect personal information simply because it is technically available. Check purpose, necessity and lawful grounds before processing personal data.'
    ]],
    ['How can teams prioritise leads without false precision?',[
      'Prioritise demonstrated fit and reliable evidence, not an invented percentage of «purchase likelihood». Where no buying signal exists, record the status as unknown.',
      'Give data confidence and potential interest separate fields. Explain the reasons behind a rating, and ask a person to decide whether additional research is worthwhile.',
      'Quantitative scoring can help when the methodology is defined and validated. Before that, qualitative categories are often more defensible than detailed numerical scores.'
    ]],
    ['What does a controlled B2B workflow look like?',[
      'An accountable process moves from selecting a market segment to evidence-based research, qualification and human approval of any consequential next action. It should not send email automatically based on an unverified signal.',
      '<STEPS>',
      'Each step should be auditable. If a team cannot explain why a prospect was prioritised, the output should not be treated as a final decision.'
    ]],
    ['How should privacy be handled during research and outreach?',[
      'Company facts and personal data require different treatment. Identifiable information about individuals may be covered by the GDPR even when used in B2B activity.',
      'Any lawful basis must be considered in context; legitimate interest is not blanket permission to compile and use contact lists. Objection rights, notice obligations and electronic marketing requirements also matter. See the <a href="https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/legal-grounds-processing-data_en" target="_blank" rel="noopener noreferrer">European Commission guidance on lawful grounds</a>.',
      'Check the applicable country’s marketing rules, suppressions and the communication channel before outreach. A responsible person should approve external contact.'
    ]],
    ['How do we measure B2B qualification quality?',[
      'Measure how many relevant organisations were verified, how many assessments needed correction and how often outreach led to a meaningful conversation – not only how many leads entered the database.',
      'Separate data errors from correctly established non-interest. Track objections, suppressions and human overrides so the workflow improves without increasing irrelevant outreach.',
      'Connect reporting to a clear journey from research to qualified conversations and any later agreement.'
    ]],
    ['When might Offer Intelligence be the right next step?',[
      'Offer Intelligence is worth evaluating when a business has a clear B2B segment but spends significant time on manual research, uncertain prioritisation or poor traceability before customer contact.',
      'The product direction includes evidence-based company dossiers, separate data-quality and interest assessments, and human approval before outreach. These are development goals, not proof that every feature is commercially available.',
      'Explore <a href="/en/products/offer-intelligence/">Offer Intelligence</a> for the intended workflow. If your earlier problem is attracting relevant enquiries, start with our <a href="/en/insights/seo-aeo-geo-explained/">SEO, AEO and GEO guide</a>.'
    ]]
  ],
  table:[['Assessment','What it can establish','What it does not establish'],['Data quality','Company identity, source, date and completeness','That a company intends to buy'],['Potential need','Relevant sector and publicly described workflows','That a project has an active budget'],['Buying interest','A clearly evidenced relevant requirement','That outreach is automatically permitted']],
  steps:['Define the target market and customer problem.','Gather necessary facts from permitted sources.','Document source quality and missing evidence.','Assess potential need separately from demonstrated interest.','Check outreach grounds, objections and suppressions.','Ask a responsible person to approve or decline the next action.'],
  faq:[['Can a company be a relevant lead without buying intent?','Yes, it can be worth researching, but it should not be marked as a confirmed interested buyer.'],['Does every lead need a numerical score?','No. A score helps only when the evidence and method are defined. Unknown factors should not be made falsely precise.'],['Can the system automatically contact researched companies?','Not in the described default workflow. External outreach requires an appropriate basis and human approval.']],
  sources:'Sources and limitations',faqTitle:'Frequently asked questions',next:'What should your team do next?',nextText:'Pick one business segment and test whether you can explain company relevance before anyone is contacted.',product:'Explore Offer Intelligence',back:'More insights',cta:'Discuss a B2B workflow',disclaimer:'This is a draft educational article, not individual legal advice. Product status and availability must be confirmed.'
 }
};
const e=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const loc=r=>path.join(root,r.slice(1),'index.html');
const read=file=>fs.readFileSync(file,'utf8');
const edit=(file,fn)=>{const after=fn(read(file));if(!after.includes('</html>'))throw Error('Broken page '+file);fs.writeFileSync(file,after);};
const link=(url,label)=>'<a href="'+url+'">'+e(label)+'</a>';
function body(lang){
 const t=txt[lang],r=paths[lang];
 const table='<div class="editorial-table-scroll"><table><thead><tr>'+t.table[0].map(x=>'<th>'+e(x)+'</th>').join('')+'</tr></thead><tbody>'+t.table.slice(1).map(row=>'<tr>'+row.map((x,i)=>'<td data-label="'+e(t.table[0][i])+'">'+e(x)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
 const steps='<ol>'+t.steps.map(x=>'<li>'+e(x)+'</li>').join('')+'</ol>';
 const sections=t.sections.map(([question,paragraphs],i)=>'<section class="editorial-section" id="part-'+(i+1)+'"><h2>'+e(question)+'</h2>'+paragraphs.map((p,j)=>p==='<TABLE>'?table:p==='<STEPS>'?steps:'<p>'+(j===0?'<strong>'+e(p)+'</strong>':p)+'</p>').join('')+'</section>').join('');
 const faq='<section class="editorial-section"><h2>'+e(t.faqTitle)+'</h2>'+t.faq.map(([q,a])=>'<div class="editorial-faq"><h3>'+e(q)+'</h3><p>'+e(a)+'</p></div>').join('')+'</section>';
 const source='<section class="editorial-section editorial-sources"><h2>'+e(t.sources)+'</h2><p>'+(lang==='no'?'Juridiske vurderinger må bekreftes for den konkrete behandlingen og jurisdiksjonen.':'Legal decisions must be confirmed for the specific processing and jurisdiction.')+'</p><ul><li><a href="https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/legal-grounds-processing-data_en" target="_blank" rel="noopener noreferrer">European Commission — Legal grounds for processing data</a></li><li><a href="https://www.edpb.europa.eu/sme/be-compliant/process-personal-data-lawfully_en" target="_blank" rel="noopener noreferrer">European Data Protection Board — Processing personal data lawfully</a></li></ul></section>';
 return '<section class="page-hero editorial-hero"><div class="container"><nav class="editorial-breadcrumb" aria-label="Breadcrumb">'+link('/'+lang+'/',lang==='no'?'Hjem':'Home')+' / '+link(r.hub,lang==='no'?'Innsikt':'Insights')+'</nav><span class="eyebrow">'+e(t.tag)+'</span><h1>'+e(t.h1)+'</h1><p class="lede">'+e(t.intro)+'</p><p class="editorial-byline">'+e(t.byline)+'</p><p class="editorial-review">'+e(t.review)+'</p></div></section><div class="container editorial-article-wrap"><article class="editorial-article">'+sections+faq+source+'<p class="editorial-note">'+e(t.disclaimer)+'</p></article><aside class="editorial-aside"><div class="editorial-aside-card"><span class="eyebrow">OFFER INTELLIGENCE</span><h2>'+e(t.next)+'</h2><p>'+e(t.nextText)+'</p>'+link(r.product,t.product+' →')+'</div></aside></div><section class="cta-band"><div class="container cta-flex"><div><h2>'+e(t.next)+'</h2><p>'+e(t.nextText)+'</p>'+link(r.hub,t.back+' →')+'</div><a href="'+r.demo+'" class="btn btn-primary">'+e(t.cta)+'</a></div></section>';
}
for(const lang of ['en','no']){
 const t=txt[lang],r=paths[lang],template=read(loc(r.seo));
 let page=template.replace(/<main id="main">[\s\S]*?<\/main>/,'<main id="main">'+body(lang)+'</main>');
 if(!page.includes(t.h1))throw Error('Offer content not injected');
 page=page.replace(/<title>[\s\S]*?<\/title>/,'<title>'+e(t.title)+' | Altovena</title>');
 page=page.replace(/<meta name="description" content="[^"]*">/,'<meta name="description" content="'+e(t.desc)+'">')
   .replace(/<meta property="og:title" content="[^"]*">/,'<meta property="og:title" content="'+e(t.title)+' | Altovena">')
   .replace(/<meta property="og:description" content="[^"]*">/,'<meta property="og:description" content="'+e(t.desc)+'">')
   .replace(/<meta property="og:url" content="[^"]*">/g,'')
   .replace(/<link rel="canonical"[^>]*>/g,'')
   .replace(/<link rel="alternate"[^>]*>/g,'')
   .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g,'');
 const other=lang==='en'?'no':'en';
 page=page.replace(/(<div class="locale-switch"[^>]*>)([\s\S]*?)(<\/div>)/,(_all,a,b,c)=>a+b.replace(/(<a lang="en" href=")[^"]*"/,'$1'+paths.en.guide+'"').replace(/(<a lang="no" href=")[^"]*"/,'$1'+paths.no.guide+'"')+c);
 if(publicRelease && articleApproved){
  if(!origin)throw Error('SITE_URL is needed for approved public article');
  page=page.replace(/<meta name="robots" content="[^"]*">/g,'')
   .replace('</head>','<link rel="canonical" href="'+e(origin+r.guide)+'"><link rel="alternate" hreflang="en" href="'+e(origin+paths.en.guide)+'"><link rel="alternate" hreflang="nb" href="'+e(origin+paths.no.guide)+'"></head>');
 }else if(!page.includes('name="robots"')){
  page=page.replace('</head>','<meta name="robots" content="noindex,nofollow"></head>');
 }
 fs.mkdirSync(path.dirname(loc(r.guide)),{recursive:true});
 fs.writeFileSync(loc(r.guide),page);
 // Only preview this unapproved article; in production leave only editorial hub without its teaser until sign-off.
 if(!publicRelease || articleApproved){
  const teaser='<article class="editorial-teaser"><span class="eyebrow">B2B · OFFER INTELLIGENCE</span><h2>'+e(t.hubLabel)+'</h2><p>'+e(t.hubText)+'</p>'+link(r.guide,lang==='no'?'Les guiden →':'Read the guide →')+'</article>';
  edit(loc(r.hub),h=>h.replace('</div></div></section>',teaser+'</div></div></section>'));
  // Product page receives a genuinely supporting guide link, not duplicate product text.
  edit(loc(r.product),h=>h.replace('<section class="trust-status-section">','<section class="editorial-related"><div class="container"><p>'+link(r.guide,t.hubLabel+' →')+'</p></div></section><section class="trust-status-section">'));
 }
}
if(publicRelease && articleApproved){
 const p=path.join(root,'sitemap.xml');
 if(fs.existsSync(p)){let xml=read(p);xml=xml.replace('</urlset>',Object.values(paths).map(r=>'<url><loc>'+e(origin+r.guide)+'</loc></url>').join('')+'</urlset>');fs.writeFileSync(p,xml);}
}
console.log('Altovena v0.9: bilingual Offer Intelligence research guide with separate data confidence and buying interest, preview draft status.');
