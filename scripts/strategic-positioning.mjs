import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve(import.meta.dirname, '..', 'dist');
const content = {
  no: {
    title: 'Intelligent teknologi. Virkelig forretningsverdi.',
    intro: 'Altovena utvikler AI-produkter, SaaS-plattformer og intelligente løsninger for virksomheter. Vi kombinerer spesialisert programvare med rådgivning, integrasjon og praktisk gjennomføring – med sikkerhet, dokumentasjon og menneskelig kontroll.',
    eyebrow: 'Én teknologivirksomhet – flere måter å skape verdi på',
    section: 'Fra idé til teknologi som brukes',
    sectionIntro: 'Vi bygger langsiktig teknologi og hjelper virksomheter med konkrete problemer allerede i dag. Produkter under utvikling merkes tydelig, og leveranser avklares individuelt.',
    cards: [
      ['AI-produkter og SaaS', 'Intelligence og Visibility utvikles for repeterbare, målbare arbeidsoppgaver.', '/no/produkter/', 'Utforsk produktene'],
      ['Plattformer og intelligente systemer', 'Command, Nexus og Shared Core er retningen for kontrollert samspill mellom mennesker, data og AI.', '/no/teknologi/nexus/', 'Se teknologien'],
      ['Bransjeløsninger', 'RealtyFlow og Olivia OS bygger på faktiske erfaringer fra eiendom og landbruk. Ekstern tilgjengelighet må bekreftes.', '/no/praktisk-bruk/', 'Se praktisk bruk'],
      ['Rådgivning og spesialutvikling', 'Vi vurderer AI-arbeidsflyt, nettsider, automatisering, SEO/AEO/GEO og skreddersydde apper – også i samarbeid med ChatGenius.', '/no/tjenester/', 'Se tjenestene']
    ],
    servicesTitle: 'Teknologi, rådgivning og gjennomføring',
    servicesText: 'Noen kunder trenger et ferdig produkt. Andre trenger hjelp til å avklare et problem, bygge en app, modernisere en nettside eller innføre AI i en arbeidsprosess. Vi starter med behovet og avtaler leveransen før arbeidet begynner.',
    chat: 'ChatGenius.pro er en mulig kommersiell inngang for mindre apper, nettsider, opplæring og løpende digitale tjenester. Merkevaremodellen vurderes videre sammen med teamet.'
  },
  en: {
    title: 'Intelligent technology. Real business value.',
    intro: 'Altovena develops AI products, SaaS platforms and intelligent business solutions. We combine specialist software with consulting, integration and practical implementation – grounded in security, evidence and human oversight.',
    eyebrow: 'One technology business – multiple paths to value',
    section: 'From ambition to technology people use',
    sectionIntro: 'We build reusable technology for the long term while helping businesses solve concrete problems today. Products in development are clearly labelled and service scopes are agreed individually.',
    cards: [
      ['AI products and SaaS', 'Intelligence and Visibility are being developed for repeatable, measurable business workflows.', '/en/products/', 'Explore products'],
      ['Platforms and intelligent systems', 'Command, Nexus and Shared Core describe our direction for controlled collaboration between people, data and AI.', '/en/technology/nexus/', 'Explore technology'],
      ['Industry solutions', 'RealtyFlow and Olivia OS are informed by real work in property and agriculture. External availability remains subject to confirmation.', '/en/applied-work/', 'See applied work'],
      ['Consulting and custom development', 'We explore AI workflows, websites, automation, SEO/AEO/GEO and tailored apps – including possible delivery through ChatGenius.', '/en/services/', 'Explore services']
    ],
    servicesTitle: 'Technology, advice and implementation',
    servicesText: 'Some clients need a focused product. Others need help defining a problem, building an app, improving a website or introducing AI into a workflow. We start with the need and agree the scope before delivery.',
    chat: 'ChatGenius.pro may serve as a commercial entry point for smaller apps, websites, training and ongoing digital services. The final brand structure remains under review with the team.'
  }
};
const escapeHtml = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
for (const locale of ['no','en']) {
  const x = content[locale];
  const homePath = path.join(dist, locale, 'index.html');
  let html = fs.readFileSync(homePath, 'utf8');
  if (!/<section class="hero">/.test(html)) throw new Error('Missing home hero: ' + locale);
  html = html.replace(/(<section class="hero">[\s\S]*?<h1>)[\s\S]*?(<\/h1>)/, '$1' + escapeHtml(x.title) + '$2');
  html = html.replace(/(<section class="hero">[\s\S]*?<p class="lede">)[\s\S]*?(<\/p>)/, '$1' + escapeHtml(x.intro) + '$2');
  const cards = x.cards.map(([name,description,href,cta]) => '<article class="card"><h3>' + escapeHtml(name) + '</h3><p>' + escapeHtml(description) + '</p><a class="card-link" href="' + href + '">' + escapeHtml(cta) + ' ↗</a></article>').join('');
  const section = '<section class="section section-white" data-altovena-strategy="2026"><div class="container"><div class="section-heading"><span class="eyebrow">' + escapeHtml(x.eyebrow) + '</span><h2>' + escapeHtml(x.section) + '</h2><p class="section-intro">' + escapeHtml(x.sectionIntro) + '</p></div><div class="product-grid">' + cards + '</div></div></section>';
  html = html.replace(/(<section class="hero">[\s\S]*?<\/section>)/, '$1' + section);
  html = html.replace(/<title>[^<]*<\/title>/, '<title>' + escapeHtml(x.title) + ' | Altovena</title>');
  fs.writeFileSync(homePath, html);

  const servicePath = path.join(dist, locale, 'services', 'index.html');
  const translatedServicePath = locale === 'no' ? path.join(dist, 'no', 'tjenester', 'index.html') : servicePath;
  const servicesFile = fs.existsSync(translatedServicePath) ? translatedServicePath : servicePath;
  let serviceHtml = fs.readFileSync(servicesFile, 'utf8');
  const serviceSection = '<section class="section section-tint" data-altovena-services="2026"><div class="container"><div class="section-heading"><h2>' + escapeHtml(x.servicesTitle) + '</h2><p class="section-intro">' + escapeHtml(x.servicesText) + '</p></div><p>' + escapeHtml(x.chat) + ' <a href="https://www.chatgenius.pro/" rel="noopener noreferrer">ChatGenius.pro ↗</a></p></div></section>';
  serviceHtml = serviceHtml.replace('</main>', serviceSection + '</main>');
  fs.writeFileSync(servicesFile, serviceHtml);
}

for (const locale of ['no', 'en']) {
  const norwegian = locale === 'no';
  const file = norwegian ? path.join(dist, 'no', 'produkter', 'index.html') : path.join(dist, 'en', 'products', 'index.html');
  let html = fs.readFileSync(file, 'utf8');
  const productGroups = norwegian ? [
    ['Altovena Intelligence', 'B2B-analyse og mulighetsvurdering med kildebelegg, datakvalitet og menneskelig vurdering.', 'Under utvikling – betalte piloter er ikke bekreftet', '/no/produkter/offer-intelligence/'],
    ['Altovena Visibility', 'Fra dokumenterte synlighetsfunn til foreslåtte tiltak, verifiserte endringer og senere effektmåling.', 'Intern prototype – full arbeidsflyt ikke sluttverifisert', '/no/produkter/visibility/'],
    ['Altovena Command', 'Koordinering av mennesker, oppgaver og AI-agenter med ansvar og godkjenning før utførelse.', 'Under utvikling – ikke et selvstendig salgsprodukt', '/no/teknologi/nexus/'],
    ['RealtyFlow', 'Sammenhengende eiendomsdrift med salg, markedsføring, innhold og kundearbeid.', 'Internt drifts- og referansemiljø – ikke generell SaaS', '/no/produkter/realtyflow/'],
    ['Olivia OS', 'Dokumentasjon, sesongplanlegging og operativ støtte for landbruk.', 'Prototype og utviklingsmiljø', '/no/produkter/olivia/']
  ] : [
    ['Altovena Intelligence', 'B2B opportunity research with source evidence, data quality and human review.', 'In development – paid pilots not yet confirmed', '/en/products/offer-intelligence/'],
    ['Altovena Visibility', 'From evidenced visibility findings to proposed tasks, verified changes and subsequent impact measurement.', 'Internal prototype – full workflow not yet verified', '/en/products/visibility/'],
    ['Altovena Command', 'Coordination of people, tasks and AI agents, with accountability and approval before execution.', 'In development – not a standalone commercial product', '/en/technology/nexus/'],
    ['RealtyFlow', 'Connected real estate operations spanning sales, marketing, content and customer work.', 'Internal operating reference – not general-purpose SaaS', '/en/products/realtyflow/'],
    ['Olivia OS', 'Records, seasonal planning and operational support for agriculture.', 'Prototype and development environment', '/en/products/olivia/']
  ];
  const heading = norwegian ? 'Produktporteføljen og hva som er klart' : 'Our portfolio and current readiness';
  const intro = norwegian ? 'Vi skiller mellom programvare i faktisk drift, interne prototyper og produkter som kan bli kommersielle SaaS-løsninger. Dette er et veikart – ikke en katalog med ferdige abonnementer.' : 'We distinguish software in actual operation, internal prototypes and products that may become commercial SaaS offerings. This is a roadmap, not a catalogue of available subscriptions.';
  const cards = productGroups.map(([name,description,status,href]) => '<article class="card"><span class="pill">' + escapeHtml(status) + '</span><h3>' + escapeHtml(name) + '</h3><p>' + escapeHtml(description) + '</p><a class="card-link" href="' + href + '">' + (norwegian ? 'Les mer' : 'Learn more') + ' ↗</a></article>').join('');
  const section = '<section class="section section-white" data-altovena-portfolio="2026"><div class="container"><div class="section-heading"><span class="eyebrow">ALTOVENA</span><h2>' + escapeHtml(heading) + '</h2><p class="section-intro">' + escapeHtml(intro) + '</p></div><div class="product-grid">' + cards + '</div></div></section>';
  html = html.replace('</main>', section + '</main>');
  fs.writeFileSync(file, html);
}

console.log('PASS: Altovena umbrella positioning added in Norwegian and English, with prelaunch controls unchanged.');
