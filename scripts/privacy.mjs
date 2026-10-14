import fs from 'node:fs';
import path from 'node:path';

// Altovena privacy and form disclosure: intentionally fail-closed until verified.
// AEPD two-layer transparency: brief notice beside the form, full notice at /privacy.
const root=path.resolve(import.meta.dirname,'../dist');
const publicRelease=process.env.PUBLIC_LAUNCH==='true';
const reviewed=process.env.PRIVACY_APPROVED==='true';
const origin=(process.env.SITE_URL||'').replace(/\/$/,'');
const contact=process.env.PRIVACY_CONTACT_EMAIL||process.env.CONTACT_EMAIL||'post@chatgenius.pro';
const controller=process.env.PRIVACY_CONTROLLER_NAME||'';
const retentionNo=process.env.PRIVACY_RETENTION_NO||'';
const retentionEn=process.env.PRIVACY_RETENTION_EN||'';
const required=['PRIVACY_CONTROLLER_NAME','PRIVACY_CONTACT_EMAIL','PRIVACY_RETENTION_NO','PRIVACY_RETENTION_EN','REALTYFLOW_ALTOVENA_INTAKE_URL','REALTYFLOW_ALTOVENA_INTAKE_KEY','TURNSTILE_SITE_KEY','TURNSTILE_SECRET_KEY','SITE_URL'];
const submission=process.env.CONTACT_FORM_ENABLED==='true';
if(submission&&(!reviewed||!publicRelease||required.some(k=>!process.env[k])))throw Error('Live contact form requires public release, approved privacy notice, verified operator, RealtyFlow intake, retention and bot protection');
if(publicRelease&&(!reviewed||!controller||!retentionNo||!retentionEn))throw Error('Public privacy launch requires an approved controller and retention procedure');
const routes={no:'/no/personvern/',en:'/en/privacy/'};
const e=x=>String(x).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const labels={
 no:{
  nav:'Personvern',h1:'Personvernerklæring for Altovena',
  desc:'Slik håndterer Altovena opplysninger ved besøk og kontakt: formål, lagring, mottakere, rettigheter og personvern.',
  introduction:'Vi bruker opplysningene du selv velger å gi, til å kunne besvare henvendelsen din. En kontaktforespørsel innebærer ikke påmelding til nyhetsbrev eller automatisk salgskontakt.',
  draft:'Denne erklæringen er et utkast. Juridisk behandlingsansvarlig og leverandøravtaler må bekreftes før direkte skjemainnsending aktiveres.',
  sections:[
   ['Hvem er behandlingsansvarlig?',`<p><strong>Vi må identifisere den juridiske behandlingsansvarlige før vi samler inn opplysninger direkte på nettstedet.</strong> Altovena er en merkevare under etablering. Vi oppgir ikke et ubekreftet foretaksnavn eller organisasjonsnummer.</p><p>${controller?'Behandlingsansvarlig: <strong>'+e(controller)+'</strong>.':'Endelig juridisk behandlingsansvarlig er ennå ikke bekreftet.'} Kontaktadresse: Avenida del Presidente Adolfo Suárez 14, Eagle Tower, Benidorm, Alicante, Spania. Dette er en oppgitt kontaktadresse, ikke en bekreftelse på registrert forretningsadresse.</p><p>Personvernhenvendelser: <a href="mailto:${e(contact)}">${e(contact)}</a>.</p>`],
   ['Hvilke personopplysninger ber vi om?',`<p><strong>Ved henvendelser ber vi om navn, e-postadresse, valgfritt virksomhetsnavn, valgt tema og meldingen du skriver.</strong> Ikke send helseopplysninger, passord, betalingsopplysninger, fødselsnummer eller andre sensitive opplysninger gjennom kontaktskjemaet.</p><p>Besøk på nettstedet kan også generere nødvendige sikkerhets- og serverlogger hos driftsleverandøren. Faktisk logglagring skal gjennomgås før offentlig lansering.</p>`],
   ['Hvorfor bruker vi opplysningene, og hva er behandlingsgrunnlaget?',`<p><strong>Formålet er å behandle og besvare henvendelser og, der det er relevant, følge opp en samtale om et produkt eller en tjeneste.</strong> Kontaktskjemaet brukes ikke til nyhetsbrev, remarketing eller automatisk lead-scoring.</p><p>Rett behandlingsgrunnlag vurderes etter henvendelsens art. Aktuelle grunnlag kan være tiltak på din forespørsel før en eventuell avtale (GDPR artikkel 6 nr. 1 bokstav b) eller en konkret vurdert berettiget interesse ved generell kundekommunikasjon (bokstav f). Endelig grunnlag må dokumenteres før direkte skjemainnsending aktiveres.</p>`],
   ['Hvordan fungerer kontaktskjemaet nå?',`<p><strong>Inntil mottaksløsningen er verifisert, åpner skjemaet bare et e-postutkast på din egen enhet.</strong> Når du trykker knappen, blir ingen melding sendt automatisk. Opplysningene sendes først til mottakeren når du selv sender e-posten fra e-postprogrammet.</p><p>En senere direkte innsending krever bekreftet mottaker, sikker levering og botbeskyttelse. Da oppdateres erklæringen med informasjon om den faktiske behandlingen og involverte leverandører.</p>`],
   ['Hvem kan få tilgang til opplysningene?',`<p><strong>Tilgang skal begrenses til personer og leverandører som trenger opplysningene for å drifte nettstedet og besvare henvendelser.</strong> Nettstedet driftes teknisk via Vercel. Ved e-postutkast som sendes, benyttes avsenderens og mottakerens e-postleverandører.</p><p>Direkte innsending er planlagt mot RealtyFlow, som samler kontaktoppfølging, CRM og merkevarens markedsføring i ett system. Cloudflare Turnstile kan brukes til botbeskyttelse. Ingen av delene blir aktive bare fordi koden er klargjort. Databehandleravtaler og eventuelle overføringer utenfor EØS må kontrolleres før aktivering.</p>`],
   ['Hvor lenge oppbevares opplysningene?',`<p><strong>Henvendelser skal oppbevares så kort som nødvendig for å behandle og følge opp saken, med mindre en lovplikt eller et konkret rettskrav krever lengre oppbevaring.</strong> En dokumentert sletterutine for e-post, eventuelle systemkopier og sikkerhetskopier skal være vedtatt før direkte skjema aktiveres.</p>${retentionNo?'<p>Godkjent sletterutine: '+e(retentionNo)+'</p>':''}`],
   ['Hvilken sikkerhet og hvilke informasjonskapsler brukes?',`<p><strong>Personopplysninger skal behandles med nødvendig tilgangskontroll og sikkerhet.</strong> I den nåværende statiske forhåndsvisningen legger Altovenas egen kode ikke inn analyse- eller markedsføringscookies.</p><p>Vercel kan benytte tekniske tilgangs- og sikkerhetsmekanismer i beskyttede forhåndsvisninger. Cloudflare Turnstile og tilknyttede tekniske signaler vil bare være aktuelle når direkte skjemainnsending aktiveres. Faktisk bruk av tjenester og informasjonskapsler må verifiseres før publisering.</p>`],
   ['Hvilke rettigheter har du?',`<p><strong>Du kan be om innsyn, retting, sletting og begrensning av behandlingen, og protestere når vilkårene er oppfylt.</strong> Andre rettigheter kan være dataportabilitet og klage til relevant tilsynsmyndighet.</p><p>Kontakt oss på <a href="mailto:${e(contact)}">${e(contact)}</a>. I Spania kan du henvende deg til <a href="https://www.aepd.es/" target="_blank" rel="noopener noreferrer">Agencia Española de Protección de Datos (AEPD)</a>. Se også <a href="https://commission.europa.eu/law/law-topic/data-protection/information-individuals_en" target="_blank" rel="noopener noreferrer">Europakommisjonens veiledning</a>.</p>`],
   ['Blir du profilert eller kontaktet med markedsføring?',`<p><strong>Kontaktskjemaet er utformet for manuell behandling av din forespørsel, ikke automatiserte avgjørelser med rettsvirkning eller påmelding til markedsføring.</strong> Eventuelle fremtidige markedsføringstiltak må vurderes og informeres separat. Meldingen sendes ikke automatisk til andre merkevarers salgslister.</p>`]
  ],updated:'Opprettet 14. oktober 2026 · Utkast – krever juridisk gjennomgang',contact:'Gå til kontakt'
 },
 en:{
  nav:'Privacy',h1:'Privacy notice for Altovena',
  desc:'How Altovena handles personal data when you browse or contact us: purposes, retention, processors and privacy rights.',
  introduction:'We use information you choose to share to respond to your enquiry. A contact request does not subscribe you to a newsletter or authorize automated sales outreach.',
  draft:'This notice is a review draft. The legal controller and relevant processor arrangements must be confirmed before direct website submissions are enabled.',
  sections:[
   ['Who is the data controller?',`<p><strong>We need to establish the legal controller before collecting personal information directly on the site.</strong> Altovena is a brand being established. We do not invent a registered company or registration number.</p><p>${controller?'Data controller: <strong>'+e(controller)+'</strong>.':'The final legal controller is not yet confirmed.'} Contact address: Avenida del Presidente Adolfo Suárez 14, Eagle Tower, Benidorm, Alicante, Spain. This is the supplied contact address, not a claim of registered business premises.</p><p>Privacy enquiries: <a href="mailto:${e(contact)}">${e(contact)}</a>.</p>`],
   ['What personal information do we request?',`<p><strong>For enquiries we ask for your name, email address, optional company name, selected topic and message.</strong> Please do not send health data, passwords, payment details, government identifiers or other sensitive information through this form.</p><p>Visits may also generate necessary security and server logs at the hosting provider. Actual logging and retention details need review before public launch.</p>`],
   ['Why do we use the information, and what is the lawful basis?',`<p><strong>We use the information to respond to your enquiry and, where relevant, discuss a product or service you asked about.</strong> This contact form does not sign you up for marketing or automated lead scoring.</p><p>The lawful basis depends on the enquiry. Possible grounds include taking steps at your request before a contract (GDPR Article 6(1)(b)), or an appropriately assessed legitimate interest in handling general requests (Article 6(1)(f)). The actual basis must be established before direct collection is enabled.</p>`],
   ['How does the contact form work today?',`<p><strong>Until a verified receiving system is configured, the form only opens an email draft on your device.</strong> Clicking its button does not send any message automatically. Your information reaches the recipient only if you send the email using your own mail application.</p><p>Future direct submission requires a verified recipient, secure delivery and bot protection. This notice will be updated to explain the processing and active providers before it is enabled.</p>`],
   ['Who can access or receive your information?',`<p><strong>Access should be limited to people and providers who need the data to operate the website and respond.</strong> The website is hosted with Vercel. When you choose to send an email draft, your and our mail providers transmit the message.</p><p>Direct submissions are planned to use Resend for email delivery and Cloudflare Turnstile for bot protection. They are not active just because the code exists. Processor contracts and any transfers outside the EEA must be reviewed before activation.</p>`],
   ['How long do we keep enquiries?',`<p><strong>Enquiries should be kept only as long as necessary to answer and follow up, except where a legal obligation or specific legal claim justifies further retention.</strong> A documented retention procedure for mail, system copies and backups must be adopted before direct submissions are activated.</p>${retentionEn?'<p>Approved retention procedure: '+e(retentionEn)+'</p>':''}`],
   ['How are security and cookies handled?',`<p><strong>Personal data should be handled with appropriate access controls and security.</strong> In the current static preview, Altovena's own site code does not install analytics or marketing cookies.</p><p>Vercel may use technical security and authentication controls for protected preview deployments. Cloudflare Turnstile and related technical signals apply only if direct submissions are enabled. Active providers and cookies must be verified before launch.</p>`],
   ['What are your data protection rights?',`<p><strong>You may ask for access, correction, erasure, restriction of processing or object where applicable under the GDPR.</strong> Other rights may include data portability and complaining to a supervisory authority.</p><p>Contact <a href="mailto:${e(contact)}">${e(contact)}</a>. In Spain you may contact the <a href="https://www.aepd.es/" target="_blank" rel="noopener noreferrer">Spanish Data Protection Authority (AEPD)</a>. Read the <a href="https://commission.europa.eu/law/law-topic/data-protection/information-individuals_en" target="_blank" rel="noopener noreferrer">European Commission guidance</a>.</p>`],
   ['Will the form profile you or send marketing?',`<p><strong>This form is designed for manual handling of your request, not automated decisions with legal effect or newsletter enrolment.</strong> Any later marketing must have its own lawful basis and privacy information. The message will not be automatically copied into another brand's sales list.</p>`]
  ],updated:'Created 14 October 2026 · Draft — legal review required',contact:'Contact Altovena'
 }
};
const fileFor=r=>path.join(root,r.slice(1),'index.html');
const write=(f,s)=>{if(!s.includes('</html>'))throw Error('Invalid HTML '+f);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,s);};
const addFooter=(h,l)=>{if(h.includes('data-privacy-footer'))return h;const m='<a data-trust-footer-link';if(!h.includes(m))throw Error('Missing footer trust link');return h.replace(m,'<a data-privacy-footer href="'+routes[l]+'">'+e(labels[l].nav)+'</a>'+m);};
function body(lang){const t=labels[lang];return '<section class="page-hero"><div class="container"><span class="eyebrow">ALTOVENA · '+e(t.nav.toUpperCase())+'</span><h1>'+e(t.h1)+'</h1><p class="lede">'+e(t.introduction)+'</p></div></section><section class="section section-white"><div class="container privacy-wrap">'+(!reviewed?'<p class="privacy-draft" role="note">'+e(t.draft)+'</p>':'')+'<p class="privacy-updated">'+e(t.updated)+'</p>'+t.sections.map(([head,text],i)=>'<section class="privacy-section" id="privacy-'+(i+1)+'"><h2>'+e(head)+'</h2>'+text+'</section>').join('')+'<p class="privacy-next"><a class="btn btn-primary" href="'+(lang==='no'?'/no/bestill-demo/':'/en/book-demo/')+'">'+e(t.contact)+'</a></p></div></section>';}
for(const lang of ['en','no']){
 const service=fileFor(lang==='en'?'/en/services/':'/no/tjenester/');let h=fs.readFileSync(service,'utf8');
 h=h.replace(/<main id="main">[\s\S]*?<\/main>/,'<main id="main">'+body(lang)+'</main>');
 h=h.replace(/<title>[\s\S]*?<\/title>/,'<title>'+e(labels[lang].h1)+' | Altovena</title>')
  .replace(/<meta name="description" content="[^"]*">/,'<meta name="description" content="'+e(labels[lang].desc)+'">')
  .replace(/<meta property="og:title" content="[^"]*">/,'<meta property="og:title" content="'+e(labels[lang].h1)+' | Altovena">')
  .replace(/<meta property="og:description" content="[^"]*">/,'<meta property="og:description" content="'+e(labels[lang].desc)+'">')
  .replace(/<meta property="og:url"[^>]*>/g,'').replace(/<link rel="canonical"[^>]*>/g,'').replace(/<link rel="alternate"[^>]*>/g,'');
 h=h.replace(/(<div class="locale-switch"[^>]*>)([\s\S]*?)(<\/div>)/,(_full,a,b,c)=>a+b.replace(/(<a lang="en" href=")[^"]*"/,'$1'+routes.en+'"').replace(/(<a lang="no" href=")[^"]*"/,'$1'+routes.no+'"')+c);
 h=h.replace('</head>',(publicRelease&&reviewed?'<link rel="canonical" href="'+e(origin+routes[lang])+'"><link rel="alternate" hreflang="en" href="'+e(origin+routes.en)+'"><link rel="alternate" hreflang="nb" href="'+e(origin+routes.no)+'">':'<meta name="robots" content="noindex,nofollow">')+'<link rel="stylesheet" href="/privacy.css"></head>');
 write(fileFor(routes[lang]),addFooter(h,lang));
}
for(const lang of ['en','no']){
 const folder=path.join(root,lang);
 function walk(dir){for(const node of fs.readdirSync(dir,{withFileTypes:true})){
  const f=path.join(dir,node.name);if(node.isDirectory())walk(f);else if(node.name==='index.html'){
   let h=fs.readFileSync(f,'utf8');h=addFooter(h,lang);
   const contactRoute=lang==='no'?'/no/bestill-demo/':'/en/book-demo/';
   if(f===fileFor(contactRoute)){
    const notice=lang==='no'
     ? 'Vi bruker informasjonen til å svare på forespørselen – ikke til nyhetsbrev eller automatiske salgsmeldinger. <a href="'+routes[lang]+'">Les personvernerklæringen</a>. Unngå sensitive opplysninger.'
     : 'We use your information to respond to your enquiry – not to subscribe you to marketing. <a href="'+routes[lang]+'">Read the privacy notice</a>. Do not send sensitive information.';
    const disclosure='<p class="privacy-form-notice">'+notice+'</p><label class="privacy-honeypot" aria-hidden="true">Website <input type="text" name="website" autocomplete="off" tabindex="-1"></label>';
    const marker='<button class="btn btn-primary" type="submit">';if(!h.includes(marker))throw Error('Missing contact button '+f);
    h=h.replace(marker,disclosure+marker);
    if(submission){
     h=h.replace('<script src="/enquiry.js" defer></script>','<script src="/contact-form.js" defer></script><script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>');
     h=h.replace(marker,'<div class="cf-turnstile" data-sitekey="'+e(process.env.TURNSTILE_SITE_KEY)+'"></div>'+marker);
     h=h.replace(lang==='no'?'Åpne e-postutkast':'Open email draft',lang==='no'?'Send forespørsel':'Send enquiry').replace('data-enquiry-form','data-live-contact-form');
     h=h.replace(lang==='no'?'Skjemaet åpner et e-postutkast på din egen enhet. Det lagrer eller sender ingenting automatisk.':'This form opens a draft on your device. It does not store data or send anything automatically.',lang==='no'?'Vi sender forespørselen til en bekreftet mottaker og viser kvittering først etter godkjent levering.':'We send your enquiry to a verified recipient and show confirmation only after accepted delivery.');
    }
    h=h.replace('</head>','<link rel="stylesheet" href="/privacy.css"></head>');
   }
   write(f,h);
  }
 }}walk(folder);
}
fs.copyFileSync(path.resolve(import.meta.dirname,'../public/privacy.css'),path.join(root,'privacy.css'));
if(submission)fs.copyFileSync(path.resolve(import.meta.dirname,'../public/contact-form.js'),path.join(root,'contact-form.js'));
if(publicRelease&&reviewed){const f=path.join(root,'sitemap.xml');if(!fs.existsSync(f))throw Error('Public sitemap missing');const xml=fs.readFileSync(f,'utf8').replace('</urlset>',Object.values(routes).map(r=>'<url><loc>'+e(origin+r)+'</loc></url>').join('')+'</urlset>');fs.writeFileSync(f,xml);}
console.log('Altovena privacy: two language notices, sitewide footer and form disclosures. Live submission '+(submission?'enabled':'disabled (email draft)'));